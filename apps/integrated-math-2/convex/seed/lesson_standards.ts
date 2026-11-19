import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
export interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}
export async function seedLessonStandards(ctx: MutationCtx, links: LessonStandardLink[]) {
  const results: { lessonSlug: string; standardCode: string; success: boolean }[] = [];
  for (const slug of new Set(links.map((link) => link.lessonSlug))) {
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!lesson) throw new ConvexError(`Missing lesson: ${slug}`);
    const draft = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_status_version", (q) =>
        q.eq("lessonId", lesson._id).eq("status", "draft"),
      )
      .order("desc")
      .first();
    if (!draft) throw new ConvexError(`Missing draft: ${slug}`);
    const wanted = await Promise.all(
      links
        .filter((link) => link.lessonSlug === slug)
        .map(async (link) => {
          const standard = await ctx.db
            .query("competency_standards")
            .withIndex("by_code", (q) => q.eq("code", link.standardCode))
            .unique();
          if (!standard) throw new ConvexError(`Missing standard: ${link.standardCode}`);
          return { link, standard };
        }),
    );
    const existing = await ctx.db
      .query("lesson_standards")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", draft._id))
      .take(101);
    if (existing.length > 100) throw new ConvexError("Too many draft standard links");
    for (const row of existing) {
      if (!wanted.some(({ standard }) => standard._id === row.standardId))
        await ctx.db.delete(row._id);
    }
    for (const { link, standard } of wanted) {
      const row = existing.find((item) => item.standardId === standard._id);
      if (row) await ctx.db.patch(row._id, { isPrimary: link.isPrimary });
      else
        await ctx.db.insert("lesson_standards", {
          lessonVersionId: draft._id,
          standardId: standard._id,
          isPrimary: link.isPrimary,
          createdAt: Date.now(),
        });
      results.push({ lessonSlug: slug, standardCode: link.standardCode, success: true });
    }
  }
  return results;
}
