import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { resolveDailyPracticeQueue, type ResolvedQueueItem } from "./queue";
import type { SrsSession, SrsSessionConfig } from "@math-platform/srs-engine";

/**
 * Maps a database SRS session to the public contract format.
 * @param session - The raw database session object
 * @returns The session in contract format with ISO date strings
 */
function mapDbSessionToContract(session: {
  _id: Id<"srs_sessions">;
  studentId: Id<"profiles">;
  startedAt: number;
  completedAt?: number;
  plannedCards: number;
  completedCards: number;
  config: SrsSessionConfig;
}): SrsSession {
  return {
    sessionId: session._id,
    studentId: session.studentId,
    startedAt: new Date(session.startedAt).toISOString(),
    completedAt: session.completedAt
      ? new Date(session.completedAt).toISOString()
      : null,
    plannedCards: session.plannedCards,
    completedCards: session.completedCards,
    config: session.config,
  };
}

/**
 * Checks if two timestamps represent the same calendar day in UTC.
 * @param a - First timestamp in milliseconds
 * @param b - Second timestamp in milliseconds
 * @returns True if both timestamps are on the same UTC day
 */
function isSameDay(a: number, b: number): boolean {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

export async function startDailySessionHandler(
  ctx: MutationCtx,
  args: { studentId: string; asOfDate?: string }
): Promise<{ session: SrsSession; queue: ResolvedQueueItem[] }> {
  const active = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student_and_status", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    // Explicit filter avoids relying on undefined sort order in the index.
    // Sessions per student are bounded (~1/day), so filter cost is negligible.
    .filter((q) => q.eq(q.field("completedAt"), undefined))
    .first();

  const now = args.asOfDate ? new Date(args.asOfDate).getTime() : Date.now();

  if (active && isSameDay(active.startedAt, now)) {
    const queue = await resolveDailyPracticeQueue(ctx, {
      studentId: args.studentId,
      asOfDate: args.asOfDate,
    });
    return { session: mapDbSessionToContract(active), queue };
  }

  // Close any stale active session from a prior day
  if (active) {
    await ctx.db.patch(active._id, { completedAt: now });
  }

  const queue = await resolveDailyPracticeQueue(ctx, {
    studentId: args.studentId,
    asOfDate: args.asOfDate,
  });

  const sessionId = await ctx.db.insert("srs_sessions", {
    studentId: args.studentId as Id<"profiles">,
    startedAt: now,
    completedAt: undefined,
    plannedCards: queue.length,
    completedCards: 0,
    config: {
      newCardsPerDay: 5,
      maxReviewsPerDay: 20,
      prioritizeOverdue: true,
    },
  });

  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error(`Failed to create session for student ${args.studentId}`);
  }

  return { session: mapDbSessionToContract(session), queue };
}

export const startDailySession = internalMutation({
  args: {
    studentId: v.string(),
    asOfDate: v.optional(v.string()),
  },
  handler: startDailySessionHandler,
});

export async function getActiveSessionHandler(
  ctx: QueryCtx,
  args: { studentId: string; asOfDate?: string }
): Promise<{ session: SrsSession; queue: ResolvedQueueItem[] } | null> {
  const active = await ctx.db
    .query("srs_sessions")
    .withIndex("by_student_and_status", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    // Explicit filter avoids relying on undefined sort order in the index.
    // Sessions per student are bounded (~1/day), so filter cost is negligible.
    .filter((q) => q.eq(q.field("completedAt"), undefined))
    .first();

  if (!active) {
    return null;
  }

  const now = args.asOfDate ? new Date(args.asOfDate).getTime() : Date.now();
  if (!isSameDay(active.startedAt, now)) {
    return null;
  }

  const queue = await resolveDailyPracticeQueue(ctx, {
    studentId: args.studentId,
    asOfDate: args.asOfDate,
  });
  return { session: mapDbSessionToContract(active), queue };
}

export const getActiveSession = internalQuery({
  args: {
    studentId: v.string(),
    asOfDate: v.optional(v.string()),
  },
  handler: getActiveSessionHandler,
});

export async function completeDailySessionHandler(
  ctx: MutationCtx,
  args: { studentId: string; sessionId: string }
): Promise<string> {
  const active = await ctx.db.get(args.sessionId as Id<"srs_sessions">);

  if (!active || active.completedAt !== undefined || active.studentId !== args.studentId) {
    throw new Error(`No active session found for student ${args.studentId}`);
  }

  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .collect();

  const completedCards = reviews.filter((r) => r.reviewedAt >= active.startedAt).length;

  await ctx.db.patch(active._id, {
    completedAt: Date.now(),
    completedCards,
  });

  return active._id;
}

export const completeDailySession = internalMutation({
  args: {
    studentId: v.string(),
    sessionId: v.string(),
  },
  handler: completeDailySessionHandler,
});
