import { v, ConvexError } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { activeAccount } from "./auth";
import type { Id } from "./_generated/dataModel";
import { questionSchema } from "../lib/practice/question";

/** Administrator-only publication. This function has no public endpoint. */
export const publishLesson = internalMutation({
  args: {
    versionId: v.id("lesson_versions"),
    adminId: v.optional(v.id("profiles")),
  },
  returns: v.null(),
  handler: async (ctx, { versionId, adminId }) => {
    if (adminId) await requireAdministrator(ctx, adminId);
    const version = await ctx.db.get(versionId);
    if (!version || version.status === "archived") throw new ConvexError("not_available");
    if (version.status === "published") return null;
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => q.eq("lessonVersionId", versionId))
      .take(101);
    if (!phases.length || phases.length > 100) throw new ConvexError("invalid_phases");
    let questionCount = 0;
    for (const [index, phase] of phases.entries()) {
      if (phase.phaseNumber !== index + 1) throw new ConvexError("invalid_phase_order");
      const sections = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version_and_sequence", (q) => q.eq("phaseVersionId", phase._id))
        .take(101);
      if (!sections.length || sections.length > 100) throw new ConvexError("invalid_sections");
      for (const section of sections) {
        if (section.sectionType === "text") {
          if (typeof section.content?.markdown !== "string" || !section.content.markdown.trim())
            throw new ConvexError("empty_content");
        } else if (section.sectionType === "activity") {
          const id = section.content?.activityId as Id<"activities"> | undefined;
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
      if (older.status === "published") await ctx.db.patch(older._id, { status: "archived" });
    await ctx.db.patch(versionId, { status: "published" });
    return null;
  },
});

async function requireAdministrator(ctx: Pick<QueryCtx, "db">, adminId: Id<"profiles">) {
  const account = await activeAccount(ctx, adminId);
  if (account?.role !== "admin") throw new ConvexError("not_allowed");
}
export const listDrafts = internalQuery({
  args: { adminId: v.id("profiles"), cursor: v.optional(v.string()) },
  returns: v.object({
    drafts: v.array(
      v.object({
        id: v.id("lesson_versions"),
        title: v.string(),
        version: v.number(),
        unitNumber: v.number(),
      }),
    ),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    await requireAdministrator(ctx, args.adminId);
    const page = await ctx.db
      .query("lesson_versions")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .paginate({ numItems: 50, cursor: args.cursor ?? null });
    const drafts = [];
    for (const version of page.page) {
      const lesson = await ctx.db.get(version.lessonId);
      if (lesson)
        drafts.push({
          id: version._id,
          title: version.title ?? lesson.title,
          version: version.version,
          unitNumber: lesson.unitNumber,
        });
    }
    return { drafts, nextCursor: page.isDone ? null : page.continueCursor };
  },
});
export const previewDraft = internalQuery({
  args: { adminId: v.id("profiles"), versionId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("lesson_versions"),
      title: v.string(),
      slug: v.string(),
      version: v.number(),
      status: v.string(),
      phases: v.array(
        v.object({
          id: v.id("phase_versions"),
          title: v.string(),
          phaseNumber: v.number(),
          sections: v.array(v.object({ kind: v.string(), body: v.string() })),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdministrator(ctx, args.adminId);
    const versionId = ctx.db.normalizeId("lesson_versions", args.versionId);
    if (!versionId) return null;
    const version = await ctx.db.get(versionId);
    if (!version) return null;
    const lesson = await ctx.db.get(version.lessonId);
    if (!lesson) return null;
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => q.eq("lessonVersionId", version._id))
      .take(101);
    if (phases.length > 100) throw new ConvexError("too_many_phases");
    const result = [];
    for (const phase of phases) {
      const sections = await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version_and_sequence", (q) => q.eq("phaseVersionId", phase._id))
        .take(101);
      if (sections.length > 100) throw new ConvexError("too_many_sections");
      const content = [];
      for (const section of sections) {
        if (section.sectionType === "text") {
          content.push({
            kind: "Text",
            body:
              typeof section.content?.markdown === "string"
                ? section.content.markdown
                : "Invalid text section.",
          });
        } else if (section.sectionType === "activity" && section.content?.activityId) {
          const activity = await ctx.db.get(section.content.activityId as Id<"activities">);
          const parsed = questionSchema.safeParse(activity?.props);
          if (activity?.componentKey === "im2-question" && parsed.success) {
            const question = parsed.data;
            const choices =
              question.kind === "choice"
                ? question.choices.map((choice) => `${choice.id}: ${choice.text}`).join("\n\n")
                : "";
            content.push({
              kind: "Question and answer",
              body: `${question.prompt}\n\n${choices}\n\nAnswer: ${question.answer}\n\n${question.explanation}`,
            });
          } else
            content.push({
              kind: "Invalid activity",
              body: "This activity does not pass the question schema. Publication will reject it.",
            });
        } else
          content.push({
            kind: "Unsupported section",
            body: "This section type is not supported. Publication will reject it.",
          });
      }
      result.push({
        id: phase._id,
        title: phase.title ?? `Phase ${phase.phaseNumber}`,
        phaseNumber: phase.phaseNumber,
        sections: content,
      });
    }
    return {
      id: version._id,
      title: version.title ?? lesson.title,
      slug: lesson.slug,
      version: version.version,
      status: version.status,
      phases: result,
    };
  },
});
