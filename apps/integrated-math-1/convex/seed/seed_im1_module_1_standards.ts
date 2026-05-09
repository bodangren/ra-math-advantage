import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module1LessonStandards: LessonStandardLink[] = [
  { lessonSlug: "module-1-lesson-1", standardCode: "6.EE.A.2", isPrimary: true },
  { lessonSlug: "module-1-lesson-1", standardCode: "6.EE.A.1", isPrimary: false },
  { lessonSlug: "module-1-lesson-2", standardCode: "6.EE.A.2", isPrimary: true },
  { lessonSlug: "module-1-lesson-2", standardCode: "A-SSE.A.1", isPrimary: false },
  { lessonSlug: "module-1-lesson-3", standardCode: "6.EE.A.3", isPrimary: true },
  { lessonSlug: "module-1-lesson-3", standardCode: "6.EE.A.2", isPrimary: false },
  { lessonSlug: "module-1-lesson-4", standardCode: "6.EE.A.3", isPrimary: true },
  { lessonSlug: "module-1-lesson-4", standardCode: "7.EE.A.1", isPrimary: false },
  { lessonSlug: "module-1-lesson-5", standardCode: "6.EE.A.2", isPrimary: true },
  { lessonSlug: "module-1-lesson-5", standardCode: "A-SSE.A.1", isPrimary: false },
  { lessonSlug: "module-1-lesson-6", standardCode: "A-CED.A.1", isPrimary: true },
  { lessonSlug: "module-1-lesson-6", standardCode: "6.EE.A.2", isPrimary: false },
];

export const seedModule1LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module1LessonStandards) {
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