import { v, ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { PhaseType } from "./types";
import lessons from "../../curriculum/lessons.json";
import questions from "../../curriculum/questions.json";
import { questionSchema } from "../../lib/practice/question";
import type { Id } from "../_generated/dataModel";
export const seedResult = v.object({
  lessons: v.array(
    v.object({
      lessonId: v.id("lessons"),
      lessonVersionId: v.id("lesson_versions"),
      phasesCreated: v.number(),
      activitiesCreated: v.number(),
    }),
  ),
});

/** Seed source content into a draft revision. Preserve published evidence. */
export async function seedModule(ctx: MutationCtx, unitNumber: number) {
  const results = [];
  const now = Date.now();
  for (const lesson of lessons.filter((l) => l.unitNumber === unitNumber)) {
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
      .unique();
    const lessonId = existing
      ? existing._id
      : await ctx.db.insert("lessons", {
          unitNumber,
          title: lesson.title,
          slug: lesson.slug,
          orderIndex: lesson.orderIndex,
          createdAt: now,
          updatedAt: now,
        });
    if (existing)
      await ctx.db.patch(lessonId, {
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        updatedAt: now,
      });
    const latest = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId))
      .order("desc")
      .first();
    const previous = latest?.status === "draft" && latest.version >= 2 ? latest : null;
    const lessonVersionId = previous
      ? previous._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: Math.max(2, (latest?.version ?? 0) + 1),
          title: lesson.title,
          status: "draft",
          createdAt: now,
        });
    if (previous) {
      const oldPhases = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", previous._id))
        .take(101);
      if (oldPhases.length > 100) throw new ConvexError("too_many_draft_phases");
      // A draft with legacy evidence requires a separate revision. Do not rewrite it.
      for (const phase of oldPhases) {
        const progress = await ctx.db
          .query("student_progress")
          .withIndex("by_phase", (q) => q.eq("phaseId", phase._id))
          .first();
        const resource = await ctx.db
          .query("resources")
          .withIndex("by_phase", (q) => q.eq("phaseId", phase._id))
          .first();
        if (progress || resource) throw new ConvexError("draft_has_evidence");
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .take(101);
        if (sections.length > 100) throw new ConvexError("too_many_draft_sections");
        for (const section of sections) {
          if (section.sectionType === "activity" && section.content?.activityId) {
            for (const table of [
              "activity_submissions",
              "activity_completions",
              "student_spreadsheet_responses",
            ] as const) {
              const evidence = await ctx.db
                .query(table)
                .withIndex("by_activity", (q) =>
                  q.eq("activityId", section.content.activityId as Id<"activities">),
                )
                .first();
              if (evidence) throw new ConvexError("draft_has_evidence");
            }
          }
        }
      }
      for (const phase of oldPhases) {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .take(100);
        const obsolete = phase.phaseNumber > lesson.phases.length + 1;
        for (const section of sections)
          if (obsolete || section.sequenceOrder !== 1) await ctx.db.delete(section._id);
        if (obsolete) await ctx.db.delete(phase._id);
      }
      await ctx.db.patch(previous._id, { title: lesson.title });
    }
    let phasesCreated = 0;
    let activitiesCreated = 0;
    if (!previous || previous.status === "draft") {
      for (const phase of lesson.phases) {
        const old = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber),
          )
          .unique();
        const data = {
          lessonVersionId,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          phaseType: phase.phaseType as PhaseType,
        };
        const phaseId = old
          ? old._id
          : await ctx.db.insert("phase_versions", { ...data, createdAt: now });
        if (old) await ctx.db.patch(phaseId, data);
        else phasesCreated++;
        const section = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version_and_sequence", (q) =>
            q.eq("phaseVersionId", phaseId).eq("sequenceOrder", 1),
          )
          .unique();
        const content = { markdown: phase.markdown };
        if (section) await ctx.db.patch(section._id, { content, sectionType: "text" });
        else
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: 1,
            sectionType: "text",
            content,
            createdAt: now,
          });
      }
      const phaseNumber = lesson.phases.length + 1;
      const oldCheckpoint = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phaseNumber),
        )
        .unique();
      const checkpointData = {
        lessonVersionId,
        phaseNumber,
        title: "Check your understanding",
        phaseType: "assessment" as const,
      };
      const checkpointId = oldCheckpoint
        ? oldCheckpoint._id
        : await ctx.db.insert("phase_versions", {
            ...checkpointData,
            createdAt: now,
          });
      if (oldCheckpoint) await ctx.db.patch(checkpointId, checkpointData);
      else phasesCreated++;
      const question = questionSchema.parse(questions[lesson.slug as keyof typeof questions]);
      const oldSection = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version_and_sequence", (q) =>
          q.eq("phaseVersionId", checkpointId).eq("sequenceOrder", 1),
        )
        .unique();
      const oldActivityId =
        oldSection?.sectionType === "activity"
          ? (oldSection.content?.activityId as Id<"activities"> | undefined)
          : undefined;
      const oldActivity = oldActivityId ? await ctx.db.get(oldActivityId) : null;
      const activityData = {
        componentKey: "im2-question",
        displayName: `${lesson.title}: checkpoint`,
        props: question,
        gradingConfig: { autoGrade: true, partialCredit: false },
        updatedAt: now,
      };
      const activityId = oldActivity
        ? oldActivity._id
        : await ctx.db.insert("activities", {
            ...activityData,
            createdAt: now,
          });
      if (oldActivity) await ctx.db.patch(activityId, activityData);
      else activitiesCreated++;
      const sectionData = {
        phaseVersionId: checkpointId,
        sequenceOrder: 1,
        sectionType: "activity" as const,
        content: { activityId },
      };
      if (oldSection) await ctx.db.patch(oldSection._id, sectionData);
      else
        await ctx.db.insert("phase_sections", {
          ...sectionData,
          createdAt: now,
        });
    }
    results.push({
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    });
  }
  return { lessons: results };
}
