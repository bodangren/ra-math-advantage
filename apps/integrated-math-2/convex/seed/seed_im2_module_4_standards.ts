import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module4LessonStandards: LessonStandardLink[] = [
  // 4-1 Geometric Mean
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "G-SRT.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "G-SRT.B.5",
    isPrimary: false,
  },
  // 4-2 Pythagorean Theorem and Its Converse
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "8.G.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "8.G.B.7",
    isPrimary: false,
  },
  // 4-3 Coordinates in Space
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "G-GPE.B.5",
    isPrimary: false,
  },
  // 4-4 Special Right Triangles
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "G-SRT.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "G-SRT.C.8",
    isPrimary: false,
  },
  // 4-5 Trigonometry
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "G-SRT.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "G-SRT.C.7",
    isPrimary: true,
  },
  // 4-6 Applying Trigonometry
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "G-SRT.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "G-MG.A.1",
    isPrimary: false,
  },
  // 4-7 The Law of Sines
  {
    lessonSlug: "module-4-lesson-7",
    standardCode: "G-SRT.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-7",
    standardCode: "F-TF.A.1",
    isPrimary: false,
  },
  // 4-8 The Law of Cosines
  {
    lessonSlug: "module-4-lesson-8",
    standardCode: "G-SRT.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-8",
    standardCode: "N-CN.A.2",
    isPrimary: false,
  },
];

export const seedModule4LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of module4LessonStandards) {
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