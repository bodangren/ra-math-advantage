import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type Phase = {
  phaseNumber: number;
  title: string;
  phaseType: Doc<"phase_versions">["phaseType"];
  estimatedMinutes: number;
  sections: readonly {
    sequenceOrder: number;
    sectionType: "text";
    content: { readonly markdown: string };
  }[];
};
type Attachment = {
  phaseType: Phase["phaseType"];
  sequenceOrder: number;
  componentKey: string;
  activityId: Id<"activities">;
};

/** Updates published source content while preserving phase IDs and student work. */
export async function upsertLessonPhases(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  phases: readonly Phase[],
  now: number,
  attachments: readonly Attachment[] = [],
): Promise<number> {
  let created = 0;
  for (const phase of phases) {
    const existing = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber),
      )
      .first();
    const fields = {
      lessonVersionId,
      phaseNumber: phase.phaseNumber,
      title: phase.title,
      phaseType: phase.phaseType,
      estimatedMinutes: phase.estimatedMinutes,
    };
    const phaseId =
      existing?._id ?? (await ctx.db.insert("phase_versions", { ...fields, createdAt: now }));
    if (existing) await ctx.db.patch(existing._id, fields);
    else created++;
    const sections = [
      ...phase.sections,
      ...attachments
        .filter((a) => a.phaseType === phase.phaseType)
        .map((a) => ({
          sequenceOrder: a.sequenceOrder,
          sectionType: "activity" as const,
          content: { componentKey: a.componentKey, activityId: a.activityId },
        })),
    ];
    for (const section of sections) {
      const previous = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version_and_sequence", (q) =>
          q.eq("phaseVersionId", phaseId).eq("sequenceOrder", section.sequenceOrder),
        )
        .unique();
      const fields = {
        phaseVersionId: phaseId,
        sequenceOrder: section.sequenceOrder,
        sectionType: section.sectionType,
        content: section.content,
      };
      if (previous) await ctx.db.patch(previous._id, fields);
      else await ctx.db.insert("phase_sections", { ...fields, createdAt: now });
    }
  }
  return created;
}
