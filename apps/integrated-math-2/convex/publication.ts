import { v, ConvexError } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { questionSchema } from "../lib/practice/question";

/** Administrator-only publication. This function has no public endpoint. */
export const publishLesson = internalMutation({
  args: { versionId: v.id("lesson_versions") },
  returns: v.null(),
  handler: async (ctx, { versionId }) => {
    const version = await ctx.db.get(versionId);
    if (!version || version.status === "archived")
      throw new ConvexError("not_available");
    if (version.status === "published") return null;
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", versionId),
      )
      .take(101);
    if (!phases.length || phases.length > 100)
      throw new ConvexError("invalid_phases");
    let questionCount = 0;
    for (const [index, phase] of phases.entries()) {
      if (phase.phaseNumber !== index + 1)
        throw new ConvexError("invalid_phase_order");
      const sections = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version_and_sequence", (q) =>
          q.eq("phaseVersionId", phase._id),
        )
        .take(101);
      if (!sections.length || sections.length > 100)
        throw new ConvexError("invalid_sections");
      for (const section of sections) {
        if (section.sectionType === "text") {
          if (
            typeof section.content?.markdown !== "string" ||
            !section.content.markdown.trim()
          )
            throw new ConvexError("empty_content");
        } else if (section.sectionType === "activity") {
          const id = section.content?.activityId as
            | Id<"activities">
            | undefined;
          const activity = id ? await ctx.db.get(id) : null;
          if (
            activity?.componentKey !== "im2-question" ||
            !questionSchema.safeParse(activity.props).success
          )
            throw new ConvexError("invalid_question");
          questionCount++;
        } else throw new ConvexError("unsupported_section");
      }
    }
    if (!questionCount) throw new ConvexError("missing_practice");
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_status_version", (q) =>
        q.eq("lessonId", version.lessonId).eq("status", "published"),
      )
      .take(101);
    if (versions.length > 100) throw new ConvexError("too_many_versions");
    for (const older of versions)
      if (older.status === "published")
        await ctx.db.patch(older._id, { status: "archived" });
    await ctx.db.patch(versionId, { status: "published" });
    return null;
  },
});
