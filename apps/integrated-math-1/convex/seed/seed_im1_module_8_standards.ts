import { internalMutation } from "../_generated/server";

interface SeedLessonStandard {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module8LessonStandards: SeedLessonStandard[] = [
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "F-IF.C.7e",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "F-LE.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "F-BF.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "F-BF.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "F-LE.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "A-CED.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "F-LE.A.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "F-LE.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "F-BF.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "F-IF.A.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-6",
    standardCode: "F-BF.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-6",
    standardCode: "F-IF.A.3",
    isPrimary: false,
  },
];

export const seedModule8LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module8LessonStandards) {
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
