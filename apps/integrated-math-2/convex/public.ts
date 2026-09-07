import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import units from "../curriculum/units.json";

const unitValidator = v.object({
  unitNumber: v.number(),
  title: v.string(),
  description: v.string(),
  lessons: v.array(
    v.object({
      id: v.id("lessons"),
      title: v.string(),
      slug: v.string(),
      orderIndex: v.number(),
    }),
  ),
});
async function publishedCurriculum(ctx: QueryCtx) {
  const versions = await ctx.db
    .query("lesson_versions")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .take(1000);
  const ids = [...new Set(versions.map((version) => version.lessonId))];
  const rows = (await Promise.all(ids.map((id) => ctx.db.get(id)))).filter(
    (row) => row !== null,
  );
  return units
    .map((unit) => ({
      unitNumber: unit.number,
      title: unit.title,
      description: unit.description,
      lessons: rows
        .filter((row) => row.unitNumber === unit.number)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((row) => ({
          id: row._id,
          title:
            versions
              .filter((v) => v.lessonId === row._id)
              .sort((a, b) => b.version - a.version)[0].title ?? row.title,
          slug: row.slug,
          orderIndex: row.orderIndex,
        })),
    }))
    .filter((unit) => unit.lessons.length > 0);
}
export const getCurriculum = query({
  args: {},
  returns: v.array(unitValidator),
  handler: publishedCurriculum,
});
export const getUnits = query({
  args: {},
  returns: v.array(unitValidator),
  handler: publishedCurriculum,
});
export const getCurriculumStats = query({
  args: {},
  returns: v.object({ unitCount: v.number(), lessonCount: v.number() }),
  handler: async (ctx) => {
    const curriculum = await publishedCurriculum(ctx);
    return {
      unitCount: curriculum.length,
      lessonCount: curriculum.reduce(
        (sum, unit) => sum + unit.lessons.length,
        0,
      ),
    };
  },
});
