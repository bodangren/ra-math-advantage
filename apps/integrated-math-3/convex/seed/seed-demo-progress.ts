import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { SeedStudentProgress } from "./types";

interface SeedDemoProgressResult {
  studentUsername: string;
  lessonSlug: string;
  completionsCreated: number;
}

export const seedDemoProgress = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedDemoProgressResult[]> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-1";
    
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    if (!lesson) {
      return [];
    }

    const lessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .first();

    if (!lessonVersion) {
      return [];
    }

    const studentProgress: SeedStudentProgress[] = [
      { studentUsername: "student1@demo", lessonSlug, phaseNumber: 1, status: "not_started" },
      { studentUsername: "student2@demo", lessonSlug, phaseNumber: 3, status: "in_progress" },
      { studentUsername: "student3@demo", lessonSlug, phaseNumber: 6, status: "in_progress" },
      { studentUsername: "student4@demo", lessonSlug, phaseNumber: 9, status: "completed" },
      { studentUsername: "student5@demo", lessonSlug, phaseNumber: 12, status: "completed" },
    ];

    const results: SeedDemoProgressResult[] = [];

    for (const progress of studentProgress) {
      const student = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", progress.studentUsername))
        .unique();

      if (!student) {
        results.push({
          studentUsername: progress.studentUsername,
          lessonSlug: progress.lessonSlug,
          completionsCreated: 0,
        });
        continue;
      }

      let completionsCreated = 0;
      const phasesToComplete = progress.status === "not_started" 
        ? 0 
        : progress.phaseNumber;

      for (let phase = 1; phase <= phasesToComplete; phase++) {
        const phaseVersion = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersion._id).eq("phaseNumber", phase)
          )
          .first();

        if (!phaseVersion) continue;

        const phaseSections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version_and_sequence", (q) =>
            q.eq("phaseVersionId", phaseVersion._id)
          )
          .collect();

        const activitySections = phaseSections.filter(
          (section) => section.sectionType === "activity"
        );

        for (const section of activitySections) {
          const content = section.content as { activityId?: string };
          if (!content?.activityId) continue;

          const idempotencyKey = `${progress.studentUsername}:${lessonSlug}:${phase}:${content.activityId}`;
          
          const existing = await ctx.db
            .query("activity_completions")
            .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", idempotencyKey))
            .unique();

          if (existing) continue;

          const activityId = content.activityId as Id<"activities">;
          
          await ctx.db.insert("activity_completions", {
            studentId: student._id,
            activityId,
            lessonId: lesson._id,
            phaseNumber: phase,
            completedAt: now,
            idempotencyKey,
            completionData: {},
            createdAt: now,
            updatedAt: now,
          });
          
          completionsCreated++;
        }

        if (activitySections.length === 0) {
          const idempotencyKey = `${progress.studentUsername}:${lessonSlug}:${phase}:phase_complete`;
          
          const existing = await ctx.db
            .query("activity_completions")
            .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", idempotencyKey))
            .unique();

          if (!existing) {
            await ctx.db.insert("activity_completions", {
              studentId: student._id,
              activityId: lessonVersion._id as unknown as Id<"activities">,
              lessonId: lesson._id,
              phaseNumber: phase,
              completedAt: now,
              idempotencyKey,
              completionData: { type: "phase_completion", phaseType: phaseVersion.phaseType },
              createdAt: now,
              updatedAt: now,
            });
            completionsCreated++;
          }
        }
      }

      results.push({
        studentUsername: progress.studentUsername,
        lessonSlug: progress.lessonSlug,
        completionsCreated,
      });
    }

    return results;
  },
});