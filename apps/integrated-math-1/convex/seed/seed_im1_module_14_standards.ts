import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module14LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-14-lesson-1",
    standardCode: "8.G.A.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-2",
    standardCode: "G-CO.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-3",
    standardCode: "G-CO.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-4",
    standardCode: "G-CO.B.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-5",
    standardCode: "G-CO.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-6",
    standardCode: "G-CO.C.10",
    isPrimary: true,
  },
  {
    lessonSlug: "module-14-lesson-7",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
];

export const seedModule14LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of module14LessonStandards) {
      try {
        const lesson = await ctx.db
          .query("lessons")
          .withIndex("by_slug", (q) => q.eq("slug", link.lessonSlug))
          .unique();

        if (!lesson) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Lesson not found: ${link.lessonSlug}`,
          });
          continue;
        }

        const lessonVersion = await ctx.db
          .query("lesson_versions")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .first();

        if (!lessonVersion) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Lesson version not found: ${link.lessonSlug}`,
          });
          continue;
        }

        const standard = await ctx.db
          .query("competency_standards")
          .withIndex("by_code", (q) => q.eq("code", link.standardCode))
          .unique();

        if (!standard) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Standard not found: ${link.standardCode}`,
          });
          continue;
        }

        const existing = await ctx.db
          .query("lesson_standards")
          .withIndex("by_lesson_version_and_standard", (q) =>
            q.eq("lessonVersionId", lessonVersion._id).eq("standardId", standard._id)
          )
          .unique();

        if (!existing) {
          await ctx.db.insert("lesson_standards", {
            lessonVersionId: lessonVersion._id,
            standardId: standard._id,
            isPrimary: link.isPrimary,
            createdAt: Date.now(),
          });
        }

        results.push({
          lessonSlug: link.lessonSlug,
          standardCode: link.standardCode,
          success: true,
        });
      } catch (error) {
        results.push({
          lessonSlug: link.lessonSlug,
          standardCode: link.standardCode,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
