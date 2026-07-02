/**
 * Phase 2 — Draft Lifecycle & Persistence
 *
 * Convex handlers for the teacher content-authoring draft lifecycle. This
 * module is app-local to IM3 (`apps/integrated-math-3/convex/teacher/...`)
 * and exercises the existing `component_reviews` / `component_approvals`
 * approval queue + `computeComponentContentHash` hashing primitive.
 *
 * Boundary contract:
 *
 * - Teacher authoring policy is app-local; do not lift this to a package.
 * - Persistence orchestration calls Phase 1 normalize/validate/sanitize
 *   (`apps/integrated-math-3/lib/teacher/content-authoring/...`) and never
 *   re-implements their contracts inside Convex handlers.
 * - Approval + content hashing is delegated to the existing primitives in
 *   `apps/integrated-math-3/lib/activities/...` (`computeComponentContentHash`,
 *   `resolveComponentKind`) and the existing `component_reviews` /
 *   `component_approvals` tables.
 * - Idempotency uses the lesson row's `metadata.authoringKey` and
 *   `metadata.authoringTeacherId` (the existing `metadata` record on
 *   `lessons`). The handler uses a metadata scan — Phase 2 GREEN scope does
 *   not require a new schema index.
 *
 * Status machine (teacher-facing → persisted mapping):
 *
 *   draft        → persisted status `draft`
 *   submitted    → persisted status `review`
 *   approved     → persisted status `approved`
 *   rejected     → persisted status `archived` (after `rejected` decision)
 *   published    → persisted status `published`
 *
 * Allowed transitions:
 *
 *   draft          → review     (via submitDraftForReviewHandler)
 *   review         → approved   (via reviewAuthoredLessonHandler)
 *   review         → archived   (via reviewAuthoredLessonHandler decision rejected/needs_changes)
 *   approved       → draft      (via editRejectedDraftHandler — edit-after-decision)
 *   archived       → draft      (via editRejectedDraftHandler — edit-after-reject)
 *   approved       → published  (via publishAuthoredLessonHandler)
 *
 * Direct `draft → published`, `submitted → published`, `rejected → published`,
 * and edits while status is `published` are rejected.
 *
 * AUTH BOUNDARY: like the existing `lessonAssignment.ts` module, this file is
 * teacher-scoped. The Next.js route layer is responsible for mapping the
 * trusted caller profile id to `userId`. The handler re-verifies role + lesson
 * ownership on every mutating call.
 */

import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { computeComponentContentHash } from "../../lib/activities/content-hash";
import { resolveComponentKind } from "../../lib/activities/review-queue";
import { normalizeLessonDraft } from "../../lib/teacher/content-authoring/authoring-model";
import { validateActivityConfig } from "../../lib/teacher/content-authoring/activity-config-validation";
import { sanitizeLessonDraft } from "../../lib/teacher/content-authoring/sanitize-authored-text";

/* ------------------------------------------------------------------------ */
/* Types                                                                     */
/* ------------------------------------------------------------------------ */

type Placement = "explore" | "vocabulary" | "learn" | "key_concept" | "worked_example" | "guided_practice" | "independent_practice" | "assessment" | "discourse" | "reflection";

interface SanitizedAuthoringLesson {
  title: string;
  phases: Array<{
    title: string;
    phaseType?: Placement;
    sections: Array<{
      title: string;
      markdown?: string;
      callout?: string;
      activities: Array<{
        componentKey: string;
        props: Record<string, unknown>;
        displayName: string;
      }>;
    }>;
  }>;
}

export interface SaveTeacherDraftResult {
  success: true;
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  activityIds: Id<"activities">[];
  idempotencyKey: string;
}

export interface LifecycleResult {
  success: true;
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  status: string;
}

export interface AssignAuthoredLessonResult {
  success: true;
  lessonId: Id<"lessons">;
  classId: Id<"classes">;
  classLessonId: Id<"class_lessons">;
}

export interface AuthoredLessonForStudent {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  title: string;
  status: string;
  phases: Array<{
    phaseId: Id<"phase_versions">;
    phaseNumber: number;
    phaseType: Placement;
    title: string;
    sections: Array<{
      sectionId: Id<"phase_sections">;
      sequenceOrder: number;
      sectionType: string;
      content: unknown;
    }>;
  }>;
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Resolve a teacher profile. Throws when the user is missing or is not a
 * teacher/admin. Returns null when the role is not authorized so the caller
 * can throw a clear error.
 * @param {MutationCtx | QueryCtx} ctx - Query or mutation context
 * @param {Id<"profiles">} userId - Profile id
 * @returns {Promise<Doc<"profiles"> | null>} The teacher profile, or null
 */
async function getAuthoringTeacher(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"profiles">,
): Promise<Doc<"profiles"> | null> {
  const profile = await ctx.db.get("profiles", userId);
  if (!profile) return null;
  if (profile.role !== "teacher" && profile.role !== "admin") return null;
  return profile;
}

/**
 * Locate the existing authored lesson for an idempotency key + teacher
 * combination. Returns null when no previous draft exists for that pair.
 * @param {MutationCtx} ctx - Mutation context
 * @param {Id<"profiles">} teacherId - Teacher profile id
 * @param {string} idempotencyKey - Client-provided idempotency key
 * @returns {Promise<Doc<"lessons"> | null>} The existing lesson, or null
 */
async function findLessonByIdempotencyKey(
  ctx: MutationCtx,
  teacherId: Id<"profiles">,
  idempotencyKey: string,
): Promise<Doc<"lessons"> | null> {
  const lessons = await ctx.db.query("lessons").collect();
  for (const lesson of lessons) {
    const meta = lesson.metadata;
    if (!meta) continue;
    if (
      meta.authoringTeacherId === teacherId &&
      meta.authoringKey === idempotencyKey
    ) {
      return lesson;
    }
  }
  return null;
}

/**
 * Resolve the lesson row + its authored lesson_versions. The current
 * "active" lesson version is the most recently created row for the lesson
 * id; lifecycle handlers operate on the latest version.
 * @param {MutationCtx | QueryCtx} ctx - Context
 * @param {Id<"lessons">} lessonId - Lesson id
 * @returns {Promise<{ lesson: Doc<"lessons">; latest: Doc<"lesson_versions"> } | null>}
 */
async function loadAuthoredLesson(
  ctx: MutationCtx | QueryCtx,
  lessonId: Id<"lessons">,
): Promise<{ lesson: Doc<"lessons">; latest: Doc<"lesson_versions"> } | null> {
  const lesson = await ctx.db.get("lessons", lessonId);
  if (!lesson) return null;
  const versions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .collect();
  if (versions.length === 0) return null;
  const latest = versions[versions.length - 1];
  return { lesson, latest };
}

/**
 * Delete the entire phase/section/activity tree under a lesson + all of its
 * lesson_versions. Idempotent save uses this to clear stale rows before
 * re-inserting. Activity rows are not directly keyed to lessons, so we walk
 * sections to find the primary activity of each section, plus the
 * `lessons.metadata.authoringActivityIds` orphan list, which captures every
 * activity the persistence flow has written for this lesson.
 * @param {MutationCtx} ctx - Mutation context
 * @param {Id<"lessons">} lessonId - Lesson id whose tree is being reset
 */
async function deleteLessonTree(ctx: MutationCtx, lessonId: Id<"lessons">): Promise<void> {
  const lesson = await ctx.db.get("lessons", lessonId);
  if (!lesson) return;
  const orphanActivityIds = (lesson.metadata?.authoringActivityIds ?? []) as Id<"activities">[];
  for (const activityId of orphanActivityIds) {
    const existing = await ctx.db.get("activities", activityId);
    if (existing) {
      await ctx.db.delete(activityId);
    }
  }
  const versions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .collect();
  for (const version of versions) {
    await ctx.db.delete(version._id);
  }
  // phase_versions not indexed by lessonVersionId is available; gather.
  for (const version of versions) {
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) =>
        q.eq("lessonVersionId", version._id),
      )
      .collect();
    for (const phase of phases) {
      const sections = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version", (q) =>
          q.eq("phaseVersionId", phase._id),
        )
        .collect();
      for (const section of sections) {
        if (section.sectionType === "activity") {
          const activityId = (section.content as { activityId?: string })?.activityId;
          if (activityId) {
            const existing = await ctx.db.get("activities", activityId as Id<"activities">);
            if (existing) {
              await ctx.db.delete(activityId);
            }
          }
        }
        await ctx.db.delete(section._id);
      }
      await ctx.db.delete(phase._id);
    }
  }
  // Orphan activity IDs are already deleted; clear so re-persist starts fresh.
  await ctx.db.patch(lessonId, {
    metadata: {
      ...(lesson.metadata ?? {}),
      authoringActivityIds: [],
    },
  });
}

/**
 * Slug for new authored lessons. The seed curriculum uses readable slugs
 * like `module-1-lesson-1`; authored lessons use a deterministic prefix so
 * they never collide with the curriculum index.
 * @param {string} idempotencyKey - Client idempotency key
 * @returns {string} Slugified unique-per-key value
 */
function slugForAuthoredLesson(idempotencyKey: string): string {
  const cleaned = idempotencyKey
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);
  const token = Math.random().toString(36).slice(2, 8);
  return `__authored_${cleaned || "draft"}_${token}`;
}

/**
 * Build a sanitized, normalized lesson payload. Phase 1 utilities throw a
 * structured error when the draft is invalid; this helper translates their
 * failure into a thrown Error for the handler boundary.
 * @param {unknown} draft - Raw draft input
 * @returns {SanitizedAuthoringLesson} Sanitized + normalized draft
 */
function buildSanitizedLesson(draft: unknown): SanitizedAuthoringLesson {
  const normalize = normalizeLessonDraft(draft);
  if (!normalize.success) {
    const first = normalize.errors[0];
    const path = first?.path?.join(".") ?? "";
    throw new Error(
      `Authoring draft failed normalization at ${path || "<root>"}: ${first?.message ?? "unknown error"}`,
    );
  }
  const sanitized = sanitizeLessonDraft(normalize.data);
  if (!isPlainObject(sanitized)) {
    throw new Error("Authoring draft did not sanitize to an object");
  }
  const lesson = sanitized as unknown as SanitizedAuthoringLesson;
  // Phase-level validation: every activity must satisfy its component schema.
  // Phase-level placement validation: every phase must declare a `phaseType`
  // so Phase 2 can resolve the placement-derived `ComponentKind` for the
  // existing review-queue / hashing primitives.
  for (const phase of lesson.phases) {
    if (!phase.phaseType) {
      throw new Error(
        "Authoring draft phase is missing required 'phaseType' (used to derive ComponentKind for review hashing)",
      );
    }
    for (const section of phase.sections) {
      for (const activity of section.activities) {
        const result = validateActivityConfig(activity.componentKey, activity.props);
        if (!result.success) {
          const first = result.errors[0];
          throw new Error(
            `Activity "${activity.componentKey}" failed schema validation: ${first?.message ?? "unknown error"}`,
          );
        }
      }
    }
  }
  return lesson;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/* ------------------------------------------------------------------------ */
/* 1. Save (idempotent) draft                                                */
/* ------------------------------------------------------------------------ */

const saveTeacherDraftArgs = {
  userId: v.id("profiles"),
  draft: v.any(),
  idempotencyKey: v.string(),
};

/**
 * Save (or replace) a teacher-authored lesson draft. The handler:
 *
 * - Requires a teacher/admin profile.
 * - Normalizes + schema-validates + sanitizes the draft (Phase 1).
 * - Reuses an existing lesson + lesson_version tree when the (teacher,
 *   idempotencyKey) pair already exists; otherwise creates a new lesson row.
 * - Persists sanitized phase_versions / phase_sections / activities rows.
 *
 * @param {MutationCtx} ctx - Mutation context
 * @param {object} args - Save args
 * @returns {Promise<SaveTeacherDraftResult>} Result with lesson id
 */
export async function saveTeacherDraftHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    draft: unknown;
    idempotencyKey: string;
  },
): Promise<SaveTeacherDraftResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers can save authoring drafts");
  }

  const lesson = buildSanitizedLesson(args.draft);
  const now = Date.now();
  const existingLesson = await findLessonByIdempotencyKey(ctx, args.userId, args.idempotencyKey);

  let lessonId: Id<"lessons">;
  if (existingLesson) {
    lessonId = existingLesson._id;
    await deleteLessonTree(ctx, lessonId);
    await ctx.db.patch(lessonId, {
      title: lesson.title,
      updatedAt: now,
      metadata: {
        ...(existingLesson.metadata ?? {}),
        authoringTeacherId: args.userId,
        authoringKey: args.idempotencyKey,
      },
    });
  } else {
    lessonId = await ctx.db.insert("lessons", {
      unitNumber: 0,
      title: lesson.title,
      slug: slugForAuthoredLesson(args.idempotencyKey),
      description: undefined,
      learningObjectives: undefined,
      orderIndex: 0,
      metadata: {
        authoringTeacherId: args.userId,
        authoringKey: args.idempotencyKey,
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  const lessonVersionId: Id<"lesson_versions"> = await ctx.db.insert("lesson_versions", {
    lessonId,
    teacherId: args.userId,
    version: 1,
    title: lesson.title,
    description: undefined,
    status: "draft",
    createdAt: now,
  });

  const activityIds: Id<"activities">[] = [];

  for (let phaseIndex = 0; phaseIndex < lesson.phases.length; phaseIndex += 1) {
    const phase = lesson.phases[phaseIndex];
    const phaseVersionId: Id<"phase_versions"> = await ctx.db.insert("phase_versions", {
      lessonVersionId,
      phaseNumber: phaseIndex + 1,
      title: phase.title,
      estimatedMinutes: undefined,
      phaseType: phase.phaseType as Placement,
      metadata: undefined,
      createdAt: now,
    });

    for (let sectionIndex = 0; sectionIndex < phase.sections.length; sectionIndex += 1) {
      const section = phase.sections[sectionIndex];
      // Create activities rows for every draft activity (used by the
      // component_reviews / component_approvals hash+approval flow). The
      // `phase_sections.content.activityId` reference slots into one
      // primary activity per section (the first), matching the existing
      // `activityContentValidator` schema. Other activities in the same
      // section remain addressable by id and are kept in the table for
      // review-history provenance.
      const sectionActivityIds: Id<"activities">[] = [];
      for (let activityIndex = 0; activityIndex < section.activities.length; activityIndex += 1) {
        const activity = section.activities[activityIndex];
        const activityId: Id<"activities"> = await ctx.db.insert("activities", {
          componentKey: activity.componentKey,
          displayName: activity.displayName,
          description: undefined,
          props: activity.props as never,
          gradingConfig: {
            autoGrade: true,
            partialCredit: true,
          },
          createdAt: now,
          updatedAt: now,
        });
        activityIds.push(activityId);
        sectionActivityIds.push(activityId);
      }
      if (section.activities.length > 0) {
        const primaryActivity = section.activities[0];
        await ctx.db.insert("phase_sections", {
          phaseVersionId,
          sequenceOrder: sectionIndex + 1,
          sectionType: "activity",
          content: {
            componentKey: primaryActivity.componentKey,
            activityId: sectionActivityIds[0],
          },
          createdAt: now,
        });
      }
    }
  }

  // Record all activity ids on the lesson so idempotent re-saves can fully
  // clean orphans (activities outside the per-section "primary" reference).
  await ctx.db.patch(lessonId, {
    metadata: {
      ...(existingLesson?.metadata ?? {}),
      authoringTeacherId: args.userId,
      authoringKey: args.idempotencyKey,
      authoringActivityIds: activityIds,
    },
  });

  return {
    success: true,
    lessonId,
    lessonVersionId,
    activityIds,
    idempotencyKey: args.idempotencyKey,
  };
}

export const saveTeacherDraft = internalMutation({
  args: saveTeacherDraftArgs,
  handler: saveTeacherDraftHandler,
});

/* ------------------------------------------------------------------------ */
/* 2. Submit draft for review                                                */
/* ------------------------------------------------------------------------ */

interface PlacedActivity {
  componentKind: "activity" | "example" | "practice";
  activityId: Id<"activities">;
  componentKey: string;
  props: Record<string, unknown>;
  placement: {
    phaseId: Id<"phase_versions">;
    phaseType: Placement;
    phaseNumber: number;
    sectionId: Id<"phase_sections">;
  };
}

/**
 * Collect every activity placement for the lesson version. Each placement is
 * the (phase, section) that contains an activity section. Returned in stable
 * order (phase → section → activity index).
 * @param {MutationCtx | QueryCtx} ctx - Context
 * @param {Id<"lesson_versions">} lessonVersionId - Lesson version id
 * @returns {Promise<PlacedActivity[]>} Ordered list of placements
 */
async function listPlacedActivities(
  ctx: MutationCtx | QueryCtx,
  lessonVersionId: Id<"lesson_versions">,
): Promise<PlacedActivity[]> {
  const phases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersionId))
    .collect();
  phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

  const placed: PlacedActivity[] = [];
  for (const phase of phases) {
    const sections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
      .collect();
    sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    for (const section of sections) {
      if (section.sectionType !== "activity") continue;
      const activityId = (section.content as { activityId?: string } | null)?.activityId;
      if (!activityId) continue;
      const activity = await ctx.db.get("activities", activityId as Id<"activities">);
      if (!activity) continue;
      placed.push({
        componentKind: resolveComponentKind(phase.phaseType),
        activityId: activity._id,
        componentKey: activity.componentKey,
        props: (activity.props as Record<string, unknown> | null) ?? {},
        placement: {
          phaseId: phase._id,
          phaseType: phase.phaseType as Placement,
          phaseNumber: phase.phaseNumber,
          sectionId: section._id,
        },
      });
    }
  }
  return placed;
}

/**
 * Submit a draft lesson_version for review. Creates a `component_reviews`
 * row per placed activity with the current `computeComponentContentHash` of
 * the sanitized, schema-valid activity props. Transitions
 * `lesson_versions.status` from `draft` to `review` (mapped to the teacher-
 * facing "submitted" status). Rejects edits to `submitted|approved|published`
 * versions per the strategy.
 * @param {MutationCtx} ctx - Mutation context
 * @param {{ userId: Id<"profiles">; lessonId: Id<"lessons"> }} args - Submit args
 * @returns {Promise<LifecycleResult>} Lifecycle status
 */
export async function submitDraftForReviewHandler(
  ctx: MutationCtx,
  args: { userId: Id<"profiles">; lessonId: Id<"lessons"> },
): Promise<LifecycleResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers can submit drafts");
  }

  const loaded = await loadAuthoredLesson(ctx, args.lessonId);
  if (!loaded) {
    throw new Error("Authored lesson not found");
  }
  const lessonMeta = loaded.lesson.metadata;
  if (lessonMeta?.authoringTeacherId !== args.userId) {
    throw new Error("Unauthorized: only the owning teacher can submit this draft");
  }
  if (loaded.latest.status !== "draft") {
    throw new Error(
      `Cannot submit lesson version in status '${loaded.latest.status}' (must be 'draft')`,
    );
  }

  const placements = await listPlacedActivities(ctx, loaded.latest._id);
  const now = Date.now();

  for (const placed of placements) {
    const contentHash = await computeComponentContentHash({
      componentKind: placed.componentKind,
      componentKey: placed.componentKey,
      props: placed.props,
    });
    await ctx.db.insert("component_reviews", {
      componentKind: placed.componentKind,
      componentId: placed.activityId,
      componentKey: placed.componentKey,
      componentContentHash: contentHash,
      status: "needs_changes",
      comment: undefined,
      issueTags: undefined,
      priority: undefined,
      placement: {
        lessonId: loaded.lesson._id,
        lessonVersionId: loaded.latest._id,
        phaseId: placed.placement.phaseId,
        phaseNumber: placed.placement.phaseNumber,
        sectionId: placed.placement.sectionId,
      },
      createdBy: args.userId,
      createdAt: now,
    });
  }

  await ctx.db.patch(loaded.latest._id, {
    status: "review",
  });

  return {
    success: true,
    lessonId: loaded.lesson._id,
    lessonVersionId: loaded.latest._id,
    status: "review",
  };
}

export const submitDraftForReview = internalMutation({
  args: { userId: v.id("profiles"), lessonId: v.id("lessons") },
  handler: submitDraftForReviewHandler,
});

/* ------------------------------------------------------------------------ */
/* 3. Review decision                                                        */
/* ------------------------------------------------------------------------ */

const reviewDecisions = v.union(
  v.literal("approved"),
  v.literal("needs_changes"),
  v.literal("rejected"),
);

/**
 * Apply a review decision to a `review`-status lesson version. For
 * `approved` decisions the handler pins the activity approval
 * (`activity.approval` for activity kind, `component_approvals` row for
 * example/practice) so subsequent publish gates can compare stored vs
 * current content hash. `rejected` / `needs_changes` require a comment.
 *
 * The persisted lesson_version status moves to:
 *   approved → "approved"
 *   needs_changes / rejected → "archived" (terminal-but-resumable via edit-after-decision)
 *
 * @param {MutationCtx} ctx - Mutation context
 * @param {object} args - Review args
 * @returns {Promise<LifecycleResult>} Lifecycle status
 */
export async function reviewAuthoredLessonHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    lessonId: Id<"lessons">;
    decision: "approved" | "needs_changes" | "rejected";
    comment?: string;
  },
): Promise<LifecycleResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers/admins can review authored lessons");
  }

  const loaded = await loadAuthoredLesson(ctx, args.lessonId);
  if (!loaded) {
    throw new Error("Authored lesson not found");
  }
  if (loaded.latest.status !== "review") {
    throw new Error(
      `Cannot review lesson version in status '${loaded.latest.status}' (must be 'review')`,
    );
  }

  const { decision, comment } = args;
  if ((decision === "needs_changes" || decision === "rejected") && !comment) {
    throw new Error("Comment is required for needs_changes or rejected reviews");
  }

  const placements = await listPlacedActivities(ctx, loaded.latest._id);
  const now = Date.now();

  for (const placed of placements) {
    const contentHash = await computeComponentContentHash({
      componentKind: placed.componentKind,
      componentKey: placed.componentKey,
      props: placed.props,
    });

    // Find the existing placement-bound review row created at submit time
    // (status `needs_changes`, no comment) and patch the same row with the
    // reviewer's decision. Single canonical review row per placement means
    // any later status check that points at `component_reviews[0]` sees the
    // final decision without scanning history rows.
    const existingReviews = await ctx.db
      .query("component_reviews")
      .withIndex("by_component", (q) =>
        q
          .eq("componentKind", placed.componentKind)
          .eq("componentId", placed.activityId),
      )
      .collect();
    const placementReview = existingReviews.find(
      (review) =>
        review.placement?.lessonVersionId === loaded.latest._id &&
        review.placement?.phaseId === placed.placement.phaseId &&
        review.placement?.sectionId === placed.placement.sectionId,
    );
    if (placementReview) {
      await ctx.db.patch(placementReview._id, {
        status: decision,
        comment,
        componentContentHash: contentHash,
      });
    } else {
      await ctx.db.insert("component_reviews", {
        componentKind: placed.componentKind,
        componentId: placed.activityId,
        componentKey: placed.componentKey,
        componentContentHash: contentHash,
        status: decision,
        comment,
        issueTags: undefined,
        priority: undefined,
        placement: {
          lessonId: loaded.lesson._id,
          lessonVersionId: loaded.latest._id,
          phaseId: placed.placement.phaseId,
          phaseNumber: placed.placement.phaseNumber,
          sectionId: placed.placement.sectionId,
        },
        createdBy: args.userId,
        createdAt: now,
      });
    }

    if (decision === "approved") {
      const approvalSummary = {
        status: "approved" as const,
        contentHash,
        reviewedAt: now,
        reviewedBy: args.userId,
      };
      if (placed.componentKind === "activity") {
        await ctx.db.patch(placed.activityId, {
          approval: approvalSummary,
          updatedAt: now,
        });
      } else {
        const existing = await ctx.db
          .query("component_approvals")
          .withIndex("by_component", (q) =>
            q
              .eq("componentKind", placed.componentKind)
              .eq("componentId", placed.activityId),
          )
          .unique();
        if (existing) {
          if (existing.contentHash && existing.contentHash !== contentHash) {
            throw new Error(
              "Content hash mismatch: the component has changed since the last review. Please refresh and review the current version.",
            );
          }
          await ctx.db.patch(existing._id, {
            ...approvalSummary,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("component_approvals", {
            componentKind: placed.componentKind,
            componentId: placed.activityId,
            componentKey: placed.componentKey,
            status: "approved",
            contentHash,
            reviewedAt: now,
            reviewedBy: args.userId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  }

  const nextStatus = decision === "approved" ? "approved" : "archived";
  await ctx.db.patch(loaded.latest._id, { status: nextStatus });

  return {
    success: true,
    lessonId: loaded.lesson._id,
    lessonVersionId: loaded.latest._id,
    status: nextStatus,
  };
}

export const reviewAuthoredLesson = internalMutation({
  args: {
    userId: v.id("profiles"),
    lessonId: v.id("lessons"),
    decision: reviewDecisions,
    comment: v.optional(v.string()),
  },
  handler: reviewAuthoredLessonHandler,
});

/* ------------------------------------------------------------------------ */
/* 4. Edit-after-decision (rejected/approved)                                */
/* ------------------------------------------------------------------------ */

/**
 * Edit a lesson after a review decision has been recorded. Either an
 * archived (rejected / needs_changes) or approved version can be opened back
 * up for further authoring. The handler re-uses the same persistence shape
 * as `saveTeacherDraftHandler` (normalizes → validates → sanitizes →
 * replaces the activity tree) and lands a fresh `draft` lesson_version on
 * top of the prior decision. The prior `component_reviews` rows remain for
 * provenance, but the new activity ids invalidate the old approval hashes —
 * publish is blocked until the new content is re-approved.
 *
 * @param {MutationCtx} ctx - Mutation context
 * @param {object} args - Edit args
 * @returns {Promise<SaveTeacherDraftResult>} Newly created draft
 */
export async function editRejectedDraftHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    lessonId: Id<"lessons">;
    draft: unknown;
    idempotencyKey: string;
  },
): Promise<SaveTeacherDraftResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers can edit authored drafts");
  }

  const loaded = await loadAuthoredLesson(ctx, args.lessonId);
  if (!loaded) {
    throw new Error("Authored lesson not found");
  }
  if (loaded.lesson.metadata?.authoringTeacherId !== args.userId) {
    throw new Error("Unauthorized: only the owning teacher can edit this lesson");
  }
  if (
    loaded.latest.status !== "archived" &&
    loaded.latest.status !== "approved" &&
    loaded.latest.status !== "draft"
  ) {
    throw new Error(
      `Edit-after-decision not allowed in status '${loaded.latest.status}'`,
    );
  }

  const lesson = buildSanitizedLesson(args.draft);
  const now = Date.now();

  // Reset the entire lesson tree to apply the edit (this also discards any
  // prior approval rows whose activity ids are about to disappear).
  await deleteLessonTree(ctx, loaded.lesson._id);
  await ctx.db.patch(loaded.lesson._id, {
    title: lesson.title,
    updatedAt: now,
    metadata: {
      ...(loaded.lesson.metadata ?? {}),
      authoringTeacherId: args.userId,
      authoringKey: args.idempotencyKey,
    },
  });

  const lessonVersionId: Id<"lesson_versions"> = await ctx.db.insert("lesson_versions", {
    lessonId: loaded.lesson._id,
    teacherId: args.userId,
    version: (loaded.latest.version ?? 0) + 1,
    title: lesson.title,
    description: undefined,
    status: "draft",
    createdAt: now,
  });

  const activityIds: Id<"activities">[] = [];

  for (let phaseIndex = 0; phaseIndex < lesson.phases.length; phaseIndex += 1) {
    const phase = lesson.phases[phaseIndex];
    const phaseVersionId: Id<"phase_versions"> = await ctx.db.insert("phase_versions", {
      lessonVersionId,
      phaseNumber: phaseIndex + 1,
      title: phase.title,
      estimatedMinutes: undefined,
      phaseType: phase.phaseType as Placement,
      metadata: undefined,
      createdAt: now,
    });

    for (let sectionIndex = 0; sectionIndex < phase.sections.length; sectionIndex += 1) {
      const section = phase.sections[sectionIndex];
      const sectionActivityIds: Id<"activities">[] = [];
      for (let activityIndex = 0; activityIndex < section.activities.length; activityIndex += 1) {
        const activity = section.activities[activityIndex];
        const activityId: Id<"activities"> = await ctx.db.insert("activities", {
          componentKey: activity.componentKey,
          displayName: activity.displayName,
          description: undefined,
          props: activity.props as never,
          gradingConfig: {
            autoGrade: true,
            partialCredit: true,
          },
          createdAt: now,
          updatedAt: now,
        });
        activityIds.push(activityId);
        sectionActivityIds.push(activityId);
      }
      if (section.activities.length > 0) {
        const primaryActivity = section.activities[0];
        await ctx.db.insert("phase_sections", {
          phaseVersionId,
          sequenceOrder: sectionIndex + 1,
          sectionType: "activity",
          content: {
            componentKey: primaryActivity.componentKey,
            activityId: sectionActivityIds[0],
          },
          createdAt: now,
        });
      }
    }
  }

  return {
    success: true,
    lessonId: loaded.lesson._id,
    lessonVersionId,
    activityIds,
    idempotencyKey: args.idempotencyKey,
  };
}

export const editRejectedDraft = internalMutation({
  args: saveTeacherDraftArgs,
  handler: editRejectedDraftHandler,
});

/* ------------------------------------------------------------------------ */
/* 5. Publish                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Publish a fully-approved authored lesson. Recomputes the
 * `computeComponentContentHash` for every placed activity and refuses to
 * publish when any stored approval hash mismatches the current hash (which
 * is also the stale-approval defense when content changes are made after the
 * last approval).
 *
 * @param {MutationCtx} ctx - Mutation context
 * @param {{ userId: Id<"profiles">; lessonId: Id<"lessons"> }} args - Publish args
 * @returns {Promise<LifecycleResult>} Lifecycle status
 */
export async function publishAuthoredLessonHandler(
  ctx: MutationCtx,
  args: { userId: Id<"profiles">; lessonId: Id<"lessons"> },
): Promise<LifecycleResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers can publish authored lessons");
  }

  const loaded = await loadAuthoredLesson(ctx, args.lessonId);
  if (!loaded) {
    throw new Error("Authored lesson not found");
  }
  if (loaded.lesson.metadata?.authoringTeacherId !== args.userId) {
    throw new Error("Unauthorized: only the owning teacher can publish this lesson");
  }
  if (loaded.latest.status !== "approved") {
    throw new Error(
      `Cannot publish lesson version in status '${loaded.latest.status}' (must be 'approved')`,
    );
  }

  const placements = await listPlacedActivities(ctx, loaded.latest._id);
  for (const placed of placements) {
    const currentHash = await computeComponentContentHash({
      componentKind: placed.componentKind,
      componentKey: placed.componentKey,
      props: placed.props,
    });
    if (placed.componentKind === "activity") {
      const activity = await ctx.db.get("activities", placed.activityId);
      const approval = activity?.approval;
      if (!approval || approval.status !== "approved") {
        throw new Error(
          `Activity ${placed.componentKey} (${placed.activityId}) is not approved`,
        );
      }
      if (!approval.contentHash || approval.contentHash !== currentHash) {
        throw new Error(
          `Activity ${placed.componentKey} (${placed.activityId}) has a stale approval hash`,
        );
      }
    } else {
      const approvalRecord = await ctx.db
        .query("component_approvals")
        .withIndex("by_component", (q) =>
          q
            .eq("componentKind", placed.componentKind)
            .eq("componentId", placed.activityId),
        )
        .unique();
      if (!approvalRecord || approvalRecord.status !== "approved") {
        throw new Error(
          `Approval missing for ${placed.componentKind} ${placed.componentKey} (${placed.activityId})`,
        );
      }
      if (
        !approvalRecord.contentHash ||
        approvalRecord.contentHash !== currentHash
      ) {
        throw new Error(
          `Approval for ${placed.componentKind} ${placed.componentKey} is stale`,
        );
      }
    }
  }

  await ctx.db.patch(loaded.latest._id, {
    status: "published",
  });

  return {
    success: true,
    lessonId: loaded.lesson._id,
    lessonVersionId: loaded.latest._id,
    status: "published",
  };
}

export const publishAuthoredLesson = internalMutation({
  args: { userId: v.id("profiles"), lessonId: v.id("lessons") },
  handler: publishAuthoredLessonHandler,
});

/* ------------------------------------------------------------------------ */
/* 6. Assign published authored lesson to class                             */
/* ------------------------------------------------------------------------ */

/**
 * Assign a published authored lesson to a class owned by the requesting
 * teacher. Cross-teacher / cross-organization class assignment is rejected.
 * Idempotent: re-assigning returns `alreadyExists: true` style behavior via
 * the underlying `by_class_and_lesson` index.
 *
 * @param {MutationCtx} ctx - Mutation context
 * @param {object} args - Assign args
 * @returns {Promise<AssignAuthoredLessonResult>} Result with class_lesson id
 */
export async function assignAuthoredLessonHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    lessonId: Id<"lessons">;
    classId: Id<"classes">;
  },
): Promise<AssignAuthoredLessonResult> {
  const teacher = await getAuthoringTeacher(ctx, args.userId);
  if (!teacher) {
    throw new Error("Unauthorized: only teachers can assign lessons");
  }

  const classDoc = await ctx.db.get("classes", args.classId);
  if (!classDoc) {
    throw new Error("Class not found");
  }
  if (classDoc.teacherId !== args.userId) {
    throw new Error(
      "Unauthorized: teacher does not own the target class (cross-teacher class assignment is forbidden)",
    );
  }
  if (classDoc.archived) {
    throw new Error("Class is archived; cannot assign new lessons");
  }

  const loaded = await loadAuthoredLesson(ctx, args.lessonId);
  if (!loaded) {
    throw new Error("Authored lesson not found");
  }
  if (loaded.lesson.metadata?.authoringTeacherId !== args.userId) {
    throw new Error("Unauthorized: only the owning teacher can assign this lesson");
  }
  if (loaded.latest.status !== "published") {
    throw new Error(
      `Cannot assign lesson that is not published (current status: '${loaded.latest.status}')`,
    );
  }

  const existing = await ctx.db
    .query("class_lessons")
    .withIndex("by_class_and_lesson", (q) =>
      q.eq("classId", args.classId).eq("lessonId", args.lessonId),
    )
    .first();
  if (existing) {
    return {
      success: true,
      lessonId: args.lessonId,
      classId: args.classId,
      classLessonId: existing._id,
    };
  }

  const now = Date.now();
  const classLessonId: Id<"class_lessons"> = await ctx.db.insert("class_lessons", {
    classId: args.classId,
    lessonId: args.lessonId,
    assignedAt: now,
    createdAt: now,
  });

  return {
    success: true,
    lessonId: args.lessonId,
    classId: args.classId,
    classLessonId,
  };
}

export const assignAuthoredLesson = internalMutation({
  args: {
    userId: v.id("profiles"),
    lessonId: v.id("lessons"),
    classId: v.id("classes"),
  },
  handler: assignAuthoredLessonHandler,
});

/* ------------------------------------------------------------------------ */
/* 7. Student visibility (read)                                              */
/* ------------------------------------------------------------------------ */

/**
 * Resolve an authored lesson for a student. Returns null when:
 *
 * - the student profile does not exist / has the wrong role,
 * - the latest authored lesson_version is not `published`,
 * - the lesson is not assigned to any of the student's currently active
 *   classes, or
 * - the student is enrolled in a different organization than the teacher
 *   authored the lesson for.
 *
 * All three authoring-time facts (latest published version, class_lessons
 * assignment, active enrollment in the assigned class) must hold for the
 * lesson data to be returned.
 *
 * @param {QueryCtx} ctx - Query context
 * @param {{ userId: Id<"profiles">; lessonId: Id<"lessons"> }} args - Read args
 * @returns {Promise<AuthoredLessonForStudent | null>}
 */
export async function getAuthoredLessonForStudentHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles">; lessonId: Id<"lessons"> },
): Promise<AuthoredLessonForStudent | null> {
  const profile = await ctx.db.get("profiles", args.userId);
  if (!profile || profile.role !== "student") return null;

  const lesson = await ctx.db.get("lessons", args.lessonId);
  if (!lesson) return null;

  const versions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
    .collect();
  if (versions.length === 0) return null;
  const latest = versions
    .filter((v) => v.status === "published")
    .sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0];
  if (!latest) return null;

  // Find assignment rows for this lesson.
  const classLessonRows = await ctx.db
    .query("class_lessons")
    .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
    .collect();
  if (classLessonRows.length === 0) return null;

  const assignedClassIds = classLessonRows.map((row) => row.classId);

  // Verify the student has an active enrollment in one of the assigned
  // classes AND the enrollment is in the same organization as the lesson's
  // authoring teacher.
  let chosenClassId: Id<"classes"> | null = null;
  for (const classId of assignedClassIds) {
    const cls = await ctx.db.get("classes", classId);
    if (!cls) continue;
    const enrollment = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class_and_student", (q) =>
        q.eq("classId", classId).eq("studentId", args.userId),
      )
      .unique();
    if (!enrollment || enrollment.status !== "active") continue;
    // Org check: student must be in the same org as the authoring teacher.
    const teacherId = lesson.metadata?.authoringTeacherId as
      | Id<"profiles">
      | undefined;
    if (teacherId) {
      const teacher = await ctx.db.get("profiles", teacherId);
      if (
        !teacher ||
        teacher.organizationId !== profile.organizationId
      ) {
        continue;
      }
    }
    chosenClassId = classId;
    break;
  }
  if (!chosenClassId) return null;

  // Phase sections for this version, grouped by phase.
  const phases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latest._id))
    .collect();
  phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

  const result: AuthoredLessonForStudent = {
    lessonId: lesson._id,
    lessonVersionId: latest._id,
    title: latest.title ?? lesson.title,
    status: latest.status,
    phases: [],
  };

  for (const phase of phases) {
    const sections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
      .collect();
    sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    result.phases.push({
      phaseId: phase._id,
      phaseNumber: phase.phaseNumber,
      phaseType: phase.phaseType as Placement,
      title: phase.title ?? "",
      sections: sections.map((section) => ({
        sectionId: section._id,
        sequenceOrder: section.sequenceOrder,
        sectionType: section.sectionType,
        content: section.content,
      })),
    });
  }
  return result;
}

export const getAuthoredLessonForStudent = internalQuery({
  args: { userId: v.id("profiles"), lessonId: v.id("lessons") },
  handler: getAuthoredLessonForStudentHandler,
});
