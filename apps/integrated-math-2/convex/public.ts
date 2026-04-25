import { query } from "./_generated/server";

export const getCurriculumStats = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    const activities = await ctx.db.query("activities").collect();

    const uniqueUnits = new Set(lessons.map((lesson) => lesson.unitNumber));

    return {
      unitCount: uniqueUnits.size,
      lessonCount: lessons.length,
      activityCount: activities.length,
    };
  },
});

export const getUnits = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("orderIndex"), 1))
      .collect();

    lessons.sort((a, b) => a.unitNumber - b.unitNumber);

    return lessons.map((l) => ({
      ...l,
      id: l._id,
    }));
  },
});

export const getCurriculum = query({
  args: {},
  handler: async (ctx) => {
    const lessonRows = await ctx.db.query("lessons").collect();

    lessonRows.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const units = new Map<number, {
      unitNumber: number;
      title: string;
      description: string;
      lessons: Array<{ id: string; title: string; slug: string; orderIndex: number }>;
    }>();

    for (const lesson of lessonRows) {
      if (!units.has(lesson.unitNumber)) {
        units.set(lesson.unitNumber, {
          unitNumber: lesson.unitNumber,
          title: lesson.title,
          description: lesson.description ?? '',
          lessons: [],
        });
      }

      units.get(lesson.unitNumber)!.lessons.push({
        id: lesson._id,
        title: lesson.title,
        slug: lesson.slug,
        orderIndex: lesson.orderIndex,
      });
    }

    return Array.from(units.values());
  },
});
