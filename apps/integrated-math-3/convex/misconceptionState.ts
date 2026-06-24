import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const misconceptionLifecycleStatusValidator = v.union(
  v.literal("active"),
  v.literal("resolved")
);

export const misconceptionSeverityValidator = v.union(
  v.literal("minor"),
  v.literal("severe")
);

export const studentMisconceptionStateValidator = v.object({
  studentId: v.string(),
  misconceptionId: v.string(),
  status: misconceptionLifecycleStatusValidator,
  severity: misconceptionSeverityValidator,
  cleanStreak: v.number(),
  firstDetectedAt: v.number(),
  lastUpdatedAt: v.number(),
  affectedSkills: v.array(v.string()),
});

// ---------------------------------------------------------------------------
// Per-student misconception state handlers (Phase 3, spec FR3).
//
// `student_misconception_state` is the persisted per-student lifecycle
// record for a (studentId, misconceptionId) pair. The Phase 1 deliverable
// added the table + validators; Phase 3 wires the read/write path used by
// the IM3 misconception-loop wiring layer.
//
//   recordMisconceptionDetectionHandler: upsert the (studentId,
//     misconceptionId) row. First detection inserts a new `active` row;
//     re-detection patches in place (preserves firstDetectedAt, resets
//     cleanStreak to 0, refreshes severity + lastUpdatedAt).
//
//   recordCleanAttemptHandler: increment cleanStreak on the row. When
//     the streak meets resolutionThreshold, the row transitions to
//     `resolved` and cleanStreak resets to 0. A clean attempt on a row
//     that is already `resolved` is a no-op (idempotent). A missing row
//     returns null — the caller is responsible for detection-first.
//
//   getStudentActiveMisconceptionsHandler: read every `active` row for
//     a given studentId via the by_student_status index. Returns [] for
//     a student with no rows (stale-state default per test-strategy §3).
// ---------------------------------------------------------------------------

interface RecordMisconceptionDetectionArgs {
  studentId: string;
  misconceptionId: string;
  severity: "minor" | "severe";
  affectedSkills: readonly string[];
  now: number;
}

export async function recordMisconceptionDetectionHandler(
  ctx: MutationCtx,
  args: RecordMisconceptionDetectionArgs,
) {
  const existing = await ctx.db
    .query("student_misconception_state")
    .withIndex("by_student_misconception", (q) =>
      q.eq("studentId", args.studentId).eq("misconceptionId", args.misconceptionId)
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      status: "active",
      severity: args.severity,
      cleanStreak: 0,
      lastUpdatedAt: args.now,
      affectedSkills: [...args.affectedSkills],
    });
    return { id: existing._id, created: false } as const;
  }

  const id = await ctx.db.insert("student_misconception_state", {
    studentId: args.studentId,
    misconceptionId: args.misconceptionId,
    status: "active",
    severity: args.severity,
    cleanStreak: 0,
    firstDetectedAt: args.now,
    lastUpdatedAt: args.now,
    affectedSkills: [...args.affectedSkills],
  });
  return { id, created: true } as const;
}

interface RecordCleanAttemptArgs {
  studentId: string;
  misconceptionId: string;
  resolutionThreshold: number;
  now: number;
}

export async function recordCleanAttemptHandler(
  ctx: MutationCtx,
  args: RecordCleanAttemptArgs,
) {
  if (!Number.isInteger(args.resolutionThreshold) || args.resolutionThreshold <= 0) {
    throw new Error(
      `recordCleanAttemptHandler: resolutionThreshold must be a positive integer, received ${args.resolutionThreshold}`,
    );
  }

  const existing = await ctx.db
    .query("student_misconception_state")
    .withIndex("by_student_misconception", (q) =>
      q.eq("studentId", args.studentId).eq("misconceptionId", args.misconceptionId)
    )
    .unique();

  if (!existing) {
    return null;
  }

  if (existing.status === "resolved") {
    return { id: existing._id, resolved: false, idempotent: true } as const;
  }

  const nextStreak = existing.cleanStreak + 1;

  if (nextStreak >= args.resolutionThreshold) {
    await ctx.db.patch(existing._id, {
      status: "resolved",
      cleanStreak: 0,
      lastUpdatedAt: args.now,
    });
    return { id: existing._id, resolved: true } as const;
  }

  await ctx.db.patch(existing._id, {
    cleanStreak: nextStreak,
    lastUpdatedAt: args.now,
  });
  return { id: existing._id, resolved: false } as const;
}

export async function getStudentActiveMisconceptionsHandler(
  ctx: QueryCtx,
  args: { studentId: string }
) {
  return ctx.db
    .query("student_misconception_state")
    .withIndex("by_student_status", (q) =>
      q.eq("studentId", args.studentId).eq("status", "active")
    )
    .collect();
}

// ---------------------------------------------------------------------------
// Convex function bindings (internal mutation/query).
// ---------------------------------------------------------------------------

/**
 * Internal mutation for recording a misconception detection for a student.
 * Upserts the (studentId, misconceptionId) row: first detection inserts a
 * new `active` row; re-detection patches in place (preserves firstDetectedAt,
 * resets cleanStreak to 0, refreshes severity + lastUpdatedAt).
 * @returns {Promise<{ id: Id<"student_misconception_state">; created: boolean }>} The row ID and whether it was newly created (true) or patched (false)
 */
export const recordMisconceptionDetection = internalMutation({
  args: {
    studentId: v.string(),
    misconceptionId: v.string(),
    severity: misconceptionSeverityValidator,
    affectedSkills: v.array(v.string()),
    now: v.number(),
  },
  handler: recordMisconceptionDetectionHandler,
});

/**
 * Internal mutation for recording a clean attempt against an existing
 * misconception state row. Increments cleanStreak; when the streak reaches
 * `resolutionThreshold` the row transitions to `resolved`. A clean attempt
 * on a row that is already `resolved` is a no-op (idempotent). Returns
 * `null` when no row exists for the pair — callers are responsible for
 * detection-first ordering.
 * @returns {Promise<{ id: Id<"student_misconception_state">; resolved: boolean; idempotent?: boolean } | null>} Resolution state for the row, or null if no row exists
 */
export const recordCleanAttempt = internalMutation({
  args: {
    studentId: v.string(),
    misconceptionId: v.string(),
    resolutionThreshold: v.number(),
    now: v.number(),
  },
  handler: recordCleanAttemptHandler,
});

/**
 * Internal query that lists every `active` misconception row for a given
 * student via the `by_student_status` index. Returns `[]` for a student
 * with no rows (stale-state default).
 * @returns {Promise<Array<Doc<"student_misconception_state">>>} Array of active misconception state documents
 */
export const getStudentActiveMisconceptions = internalQuery({
  args: {
    studentId: v.string(),
  },
  handler: getStudentActiveMisconceptionsHandler,
});
