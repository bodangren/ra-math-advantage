import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const UNIT_1_LESSON_SLUGS = [
  "1-1-classifying-triangles",
  "1-2-triangle-angle-relationships",
  "1-3-triangle-inequality-theorem",
  "1-4-congruence-criteria",
  "1-5-proving-triangle-congruence",
  "1-6-isosceles-equilateral-properties",
];

export const seedClassLessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ classId: Id<"classes">; lessonsAssigned: number }> => {
    const now = Date.now();

    const existingClass = await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("name"), "IM2 Period 1"))
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
