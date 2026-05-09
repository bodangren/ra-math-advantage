import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module4LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "8.F.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "8.F.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "8.F.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "F-IF.B.6",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "8.F.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "F-IF.C.8",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "F-BF.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "F-BF.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "F-BF.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "F-LE.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "F-IF.C.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "A-CED.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-4-lesson-7",
    standardCode: "F-IF.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-7",
    standardCode: "F-BF.A.1",
    isPrimary: false,
  },
];

export const seedModule4LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module4LessonStandards) {
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
