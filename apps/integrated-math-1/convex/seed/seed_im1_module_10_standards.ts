import { internalMutation } from "../_generated/server";
import { SeedLessonStandard } from "./types";

const module10LessonStandards: SeedLessonStandard[] = [
  { lessonSlug: "module-10-lesson-1", standardCode: "G-CO.A.1", isPrimary: true },
  { lessonSlug: "module-10-lesson-2", standardCode: "G-CO.A.2", isPrimary: true },
  { lessonSlug: "module-10-lesson-3", standardCode: "G-CO.A.2", isPrimary: true },
  { lessonSlug: "module-10-lesson-3", standardCode: "G-GPE.B.4", isPrimary: false },
  { lessonSlug: "module-10-lesson-4", standardCode: "G-GPE.B.4", isPrimary: true },
  { lessonSlug: "module-10-lesson-4", standardCode: "G-MG.A.1", isPrimary: false },
  { lessonSlug: "module-10-lesson-5", standardCode: "G-GPE.B.4", isPrimary: true },
  { lessonSlug: "module-10-lesson-5", standardCode: "G-GPE.B.6", isPrimary: false },
  { lessonSlug: "module-10-lesson-6", standardCode: "G-GPE.B.6", isPrimary: true },
  { lessonSlug: "module-10-lesson-6", standardCode: "G-GPE.B.5", isPrimary: false },
  { lessonSlug: "module-10-lesson-7", standardCode: "G-CO.C.9", isPrimary: true },
  { lessonSlug: "module-10-lesson-7", standardCode: "G-GPE.B.4", isPrimary: false },
];

export const seedModule10LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module10LessonStandards) {
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