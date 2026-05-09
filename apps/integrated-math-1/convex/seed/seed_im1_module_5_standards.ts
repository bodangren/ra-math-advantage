import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const module5LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-5-lesson-1",
    standardCode: "A-CED.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-1",
    standardCode: "A-REI.D.10",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-2",
    standardCode: "A-CED.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-2",
    standardCode: "A-CED.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-3",
    standardCode: "8.SP.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-3",
    standardCode: "S-ID.B.6",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-4",
    standardCode: "8.SP.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-4",
    standardCode: "S-ID.C.9",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-5",
    standardCode: "S-ID.C.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-5",
    standardCode: "S-ID.C.8",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-6",
    standardCode: "F-BF.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-6",
    standardCode: "F-BF.B.3",
    isPrimary: false,
  },
];

export const seedModule5LessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const link of module5LessonStandards) {
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