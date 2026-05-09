import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module6LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "6.EE.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "A-REI.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-2",
    standardCode: "A-REI.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "A-REI.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "7.EE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "A-REI.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "7.EE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-5",
    standardCode: "A-REI.D.12",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-5",
    standardCode: "A-CED.A.3",
    isPrimary: false,
  },
];

export const seedModule6LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module6LessonStandards) {
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