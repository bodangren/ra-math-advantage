import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module12LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-12-lesson-1",
    standardCode: "G-CO.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-2",
    standardCode: "G-CO.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-3",
    standardCode: "G-CO.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-4",
    standardCode: "G-CO.A.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-5",
    standardCode: "G-CO.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-6",
    standardCode: "G-CO.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-7",
    standardCode: "G-CO.A.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-8",
    standardCode: "G-GPE.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-9",
    standardCode: "G-CO.A.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-10",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
];

export const seedModule12LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module12LessonStandards) {
      const lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", link.lessonSlug))
        .unique();
      if (!lesson) continue;

      const lessonVersion = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .first();
      if (!lessonVersion) continue;

      const standard = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", link.standardCode))
        .unique();
      if (!standard) continue;

      const existing = await ctx.db
        .query("lesson_standards")
        .withIndex("by_lesson_version_and_standard", (q) =>
          q.eq("lessonVersionId", lessonVersion._id).eq("standardId", standard._id)
        )
        .first();
      if (existing) continue;

      await ctx.db.insert("lesson_standards", {
        lessonVersionId: lessonVersion._id,
        standardId: standard._id,
        isPrimary: link.isPrimary,
        createdAt: Date.now(),
      });
    }
  },
});
