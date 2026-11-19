import { describe, expect, it, vi } from "vitest";
import type { QueryCtx } from "@/convex/_generated/server";

const tables: Record<string, Record<string, unknown>[]> = {
  lessons: [
    { _id: "live", unitNumber: 1, orderIndex: 1, title: "Live", slug: "live" },
    { _id: "draft", unitNumber: 2, orderIndex: 1, title: "Private draft", slug: "draft" },
    {
      _id: "capstone",
      unitNumber: 9,
      orderIndex: 1,
      title: "Private capstone",
      slug: "capstone",
      metadata: { tags: ["capstone"] },
    },
  ],
  lesson_versions: [
    { _id: "v1", lessonId: "live", version: 1, status: "published" },
    { _id: "v2", lessonId: "live", version: 2, status: "draft" },
    { _id: "v3", lessonId: "draft", version: 1, status: "draft" },
  ],
  phase_versions: [
    { _id: "p1", lessonVersionId: "v1" },
    { _id: "p2", lessonVersionId: "v2" },
  ],
  phase_sections: [
    { phaseVersionId: "p1", sectionType: "activity", content: { activityId: "a1" } },
    { phaseVersionId: "p1", sectionType: "activity", content: { activityId: "a1" } },
    { phaseVersionId: "p2", sectionType: "activity", content: { activityId: "a2" } },
  ],
  activities: [{ _id: "a1" }, { _id: "a2" }, { _id: "orphan" }],
};
function context(): QueryCtx {
  return {
    db: {
      query(table: string) {
        let rows = tables[table] ?? [];
        const index = {
          eq(field: string, value: unknown) {
            rows = rows.filter((row) => row[field] === value);
            return index;
          },
        };
        const query = {
          collect: async () => rows,
          withIndex: (_name: string, configure: (q: typeof index) => unknown) => {
            configure(index);
            return query;
          },
          filter: () => query,
        };
        return query;
      },
    },
  } as unknown as QueryCtx;
}
async function run(name: string) {
  const source =
    await vi.importActual<
      Record<string, { _handler: (ctx: QueryCtx, args: object) => Promise<unknown> }>
    >("@/convex/public");
  return source[name]._handler(context(), {});
}
describe("public curriculum publication boundary", () => {
  it("counts only published lessons and linked unique activities", async () => {
    expect(await run("getCurriculumStats")).toEqual({
      unitCount: 1,
      lessonCount: 1,
      activityCount: 1,
    });
  });
  it.each(["getUnits", "getUnitSummaries", "getCurriculum"])(
    "%s hides draft-only units",
    async (name) => {
      const rows = (await run(name)) as { unitNumber: number }[];
      expect(rows.map((row) => row.unitNumber)).toEqual([1]);
    },
  );
  it("does not publish draft capstone metadata", async () => {
    expect(await run("getCapstonePageData")).toMatchObject({
      capstone: null,
      instructionalUnits: [{ unitNumber: 1 }],
    });
  });
});
