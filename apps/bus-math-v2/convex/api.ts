import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { resolveLatestPublishedLessonVersion } from "../lib/progress/published-curriculum";

export const getProfile = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    return profile;
  },
});

// NOTE: This query is intentionally public (no auth).
// Lesson content is published educational material — no access control needed.
// Route-level auth (Next.js middleware) guards access to lesson pages for authenticated users.
// Deferring Convex-level auth avoids unnecessary identity resolution overhead for read-only curriculum data.
export const getLessonBySlugOrId = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.identifier as Id<"lessons">);
    } catch {
      // Not a valid ID, try slug
    }

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.identifier))
        .unique();
    }

    return lesson;
  },
});

export const checkNextPhaseExists = internalQuery({
  args: {
    lessonVersionId: v.id("lesson_versions"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const nextPhase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", args.lessonVersionId).eq("phaseNumber", args.phaseNumber + 1)
      )
      .unique();
    return !!nextPhase;
  },
});

export const getPhaseContext = internalQuery({
  args: {
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (versions.length === 0) return null;

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return null;

    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();

    if (!phase) return null;

    return {
      phaseId: phase._id,
      lessonVersionId: latestVersion._id,
    };
  },
});

export const getStudentProgressByPhase = internalQuery({
  args: {
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", args.phaseId)
      )
      .unique();
    return progress;
  },
});

export const getStudentProgressByIdempotencyKey = internalQuery({
  args: {
    userId: v.id("profiles"),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("idempotencyKey"), args.idempotencyKey))
      .first();
    return progress;
  },
});

export const completePhaseMutation = internalMutation({
  args: {
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    timeSpent: v.number(),
    idempotencyKey: v.string(),
    linkedStandardId: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), completedAt: v.number(), existing: v.boolean() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const priorKey = await ctx.db.query("student_progress")
      .withIndex("by_user_and_idempotency_key", (q) => q.eq("userId", args.userId).eq("idempotencyKey", args.idempotencyKey)).unique();
    if (priorKey && priorKey.phaseId !== args.phaseId) throw new Error("idempotency_conflict");
    const existing = await ctx.db.query("student_progress")
      .withIndex("by_user_and_phase", (q) => q.eq("userId", args.userId).eq("phaseId", args.phaseId)).unique();
    if (existing?.status === "completed") {
      return { success: true, completedAt: existing.completedAt ?? existing.updatedAt, existing: true };
    }
    const phase = await ctx.db.get(args.phaseId);
    const version = phase ? await ctx.db.get(phase.lessonVersionId) : null;
    if (!phase || version?.status !== "published") throw new Error("phase_unavailable");
    const versions = await ctx.db.query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", version.lessonId)).collect();
    if (resolveLatestPublishedLessonVersion(versions)?._id !== version._id) throw new Error("phase_unavailable");
    if (phase.phaseNumber > 1) {
      const previous = await ctx.db.query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) => q.eq("lessonVersionId", phase.lessonVersionId).eq("phaseNumber", phase.phaseNumber - 1)).unique();
      const progress = previous ? await ctx.db.query("student_progress")
        .withIndex("by_user_and_phase", (q) => q.eq("userId", args.userId).eq("phaseId", previous._id)).unique() : null;
      if (progress?.status !== "completed") throw new Error("previous_phase_incomplete");
    }
    const sections = await ctx.db.query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", args.phaseId)).collect();
    for (const section of sections) {
      if (section.sectionType !== "activity" || section.content.required === false) continue;
      const activityId = section.content.activityId as Id<"activities">;
      const activity = await ctx.db.get(activityId);
      if (!activity) throw new Error("required_activity_incomplete");
      const submissions = await ctx.db.query("activity_submissions")
        .withIndex("by_user_and_activity", (q) => q.eq("userId", args.userId).eq("activityId", activityId)).collect();
      const passing = activity.gradingConfig?.passingScore ?? 70;
      const completed = submissions.some((submission) => submission.submissionData.status !== "draft"
        && (!activity.gradingConfig?.autoGrade || (typeof submission.score === "number" && (submission.maxScore ?? 0) > 0
          && submission.score / submission.maxScore! * 100 >= passing)));
      if (!completed) throw new Error("required_activity_incomplete");
    }
    const values = { status: "completed" as const, completedAt: now,
      timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + args.timeSpent,
      idempotencyKey: args.idempotencyKey, updatedAt: now };
    if (existing) await ctx.db.patch(existing._id, values);
    else await ctx.db.insert("student_progress", { userId: args.userId, phaseId: args.phaseId,
      startedAt: now - args.timeSpent * 1000, createdAt: now, ...values });
    // Phase completion records participation. Assessment evidence owns competency credit.
    return { success: true, completedAt: now, existing: Boolean(existing) };
  },
});

// NOTE: This query is intentionally public (no auth).
// Lesson content is published educational material — no access control needed.
// Route-level auth (Next.js middleware) guards access to lesson pages for authenticated users.
// See getLessonBySlugOrId for full auth rationale documentation.
export const getLessonWithContent = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!lesson) return null;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    if (versions.length === 0) return { lesson, phases: [] };

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return { lesson, phases: [] };

    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const phasesWithSections = await Promise.all(
      phases.map(async (phase) => {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .collect();
        sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        return { ...phase, sections };
      }),
    );

    return {
      lesson: {
        ...lesson,
        title: latestVersion.title ?? lesson.title,
        description: latestVersion.description ?? lesson.description,
      },
      phases: phasesWithSections,
    };
  },
});

export const getFirstLessonSlug = query({
  args: {},
  handler: async (ctx) => {
    const allLessons = await ctx.db.query("lessons").collect();
    if (allLessons.length === 0) return null;
    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });
    return allLessons[0].slug;
  },
});

export const canAccessPhase = internalQuery({
  args: {
    userId: v.id("profiles"),
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.phaseNumber === 1) return true;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (versions.length === 0) return false;

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return false;

    const prevPhase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber - 1)
      )
      .unique();

    if (!prevPhase) return false;

    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", prevPhase._id)
      )
      .unique();

    return progress?.status === "completed";
  },
});
