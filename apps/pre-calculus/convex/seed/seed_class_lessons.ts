import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const UNIT_1_LESSON_SLUGS = [
  "1-1-change-in-tandem",
  "1-2-rates-of-change",
  "1-3-rates-of-change-linear-quadratic",
  "1-4-polynomial-functions-rates",
  "1-5-polynomial-functions-complex-zeros",
  "1-6-polynomial-functions-end-behavior",
  "1-7-rational-functions-end-behavior",
  "1-8-rational-functions-zeros",
  "1-9-rational-functions-vertical-asymptotes",
  "1-10-rational-functions-holes",
  "1-11-equivalent-representations",
  "1-12-transformations-of-functions",
  "1-13-function-model-selection",
  "1-14-function-model-construction",
];

export const seedClassLessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ classId: Id<"classes">; lessonsAssigned: number }> => {
    const now = Date.now();

    const existingClass = await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("name"), "AP Precalc Period 1"))
      .unique();

    if (!existingClass) {
      return { classId: "" as Id<"classes">, lessonsAssigned: 0 };
    }

    const classId = existingClass._id;
    let lessonsAssigned = 0;

    for (const slug of UNIT_1_LESSON_SLUGS) {
      const lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (!lesson) continue;

      const existingClassLesson = await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) =>
          q.eq("classId", classId).eq("lessonId", lesson._id)
        )
        .unique();

      if (!existingClassLesson) {
        await ctx.db.insert("class_lessons", {
          classId,
          lessonId: lesson._id,
          assignedAt: now,
          createdAt: now,
        });
        lessonsAssigned++;
      }
    }

    return { classId, lessonsAssigned };
  },
});
