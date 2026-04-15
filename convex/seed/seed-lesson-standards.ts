import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module6LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "HSF-BF.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "HSF-IF.C.7e",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-2",
    standardCode: "HSF-BF.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "HSF-LE.A.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "HSF-BF.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "HSF-LE.A.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "HSF-IF.C.7e",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-5",
    standardCode: "HSF-LE.A.4",
    isPrimary: true,
  },
];

const module7LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-7-lesson-1",
    standardCode: "HSA-APR.D.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-2",
    standardCode: "HSA-APR.D.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-3",
    standardCode: "HSF-IF.C.7d",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-4",
    standardCode: "HSF-IF.C.7d",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-5",
    standardCode: "HSF-LE.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-5",
    standardCode: "HSF-IF.C.7e",
    isPrimary: false,
  },
  {
    lessonSlug: "module-7-lesson-6",
    standardCode: "HSA-REI.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-6",
    standardCode: "HSA-CED.A.1",
    isPrimary: false,
  },
];

export const seedModule6LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of module6LessonStandards) {
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

export const seedModule7LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of module7LessonStandards) {
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

const module8LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "HSS-IC.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "HSS-IC.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "HSS-IC.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "HSS-IC.B.6",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "HSS-ID.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "HSS-ID.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "HSS-ID.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "HSS-ID.A.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "HSS-IC.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "HSS-IC.B.6",
    isPrimary: false,
  },
];

export const seedModule8LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of module8LessonStandards) {
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
