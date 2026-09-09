import { describe, expect, it } from "vitest";
import { IM3_PROBLEM_FAMILIES } from "@math-platform/math-content/problem-families/im3";
import { seedPracticeItems } from "@/convex/seed/seed_practice_items";

type Row = Record<string, unknown> & { _id: string };
type Table = "practice_variants" | "competency_standards" | "activities" | "practice_items";

function fixture(input: {
  activities: Row[];
  standards?: Row[];
  items?: Row[];
}) {
  const rows: Record<Table, Row[]> = {
    practice_variants: IM3_PROBLEM_FAMILIES.map((family, index) => ({
      _id: `practice_variants:${index}`,
      ...family,
    })),
    competency_standards: input.standards ?? [],
    activities: input.activities,
    practice_items: input.items ?? [],
  };
  let nextId = 1;
  const db = {
    query(table: Table) {
      const select = (condition?: { field: string; value: unknown }) => {
        const selected = condition
          ? rows[table].filter((row) => row[condition.field] === condition.value)
          : rows[table];
        return {
          unique: async () => {
            if (selected.length > 1) throw new Error("Expected one row");
            return selected[0] ?? null;
          },
          first: async () => selected[0] ?? null,
          take: async (count: number) => selected.slice(0, count),
        };
      };
      return {
        withIndex(_name: string, callback: (q: { eq(field: string, value: unknown): { field: string; value: unknown } }) => { field: string; value: unknown }) {
          return select(callback({ eq: (field, value) => ({ field, value }) }));
        },
        take: async (count: number) => rows[table].slice(0, count),
      };
    },
    async insert(table: Table, value: Record<string, unknown>) {
      const id = `${table}:new-${nextId++}`;
      rows[table].push({ _id: id, ...value });
      return id;
    },
    async patch(id: string, value: Record<string, unknown>) {
      for (const tableRows of Object.values(rows)) {
        const row = tableRows.find((candidate) => candidate._id === id);
        if (row) Object.assign(row, value);
      }
    },
  };
  const handler = seedPracticeItems as unknown as {
    _handler(ctx: { db: typeof db }): Promise<Array<{ practiceItemId: string; activityId: string; variantKey: string; success: boolean }>>;
  };
  return { rows, run: () => handler._handler({ db }) };
}

function firstFamilyForComponent(componentKey: string) {
  const family = IM3_PROBLEM_FAMILIES.find((item) => item.componentKey === componentKey);
  if (!family) throw new Error(`Missing family for ${componentKey}`);
  return family;
}

describe("seedPracticeItems", () => {
  it("stores a resolvable parent variant key in the standard selection branch", async () => {
    const family = firstFamilyForComponent("comprehension-quiz");
    const standardId = "competency_standards:target";
    const activityId = "activities:standard";
    const f = fixture({
      standards: [{ _id: standardId, code: family.objectiveIds[0] }],
      activities: [{ _id: activityId, componentKey: family.componentKey, standardId }],
    });

    const result = await f.run();
    const item = f.rows.practice_items[0];
    expect(item).toMatchObject({
      activityId,
      variantKey: family.variantKey,
      practiceItemId: `${family.variantKey}:${activityId}`,
      legacyProblemFamilyId: family.variantKey,
      variantLabel: "Set A",
    });
    expect(f.rows.practice_variants.filter((row) => row.variantKey === item.variantKey)).toHaveLength(1);
    expect(result.find((row) => row.practiceItemId === item.practiceItemId)?.variantKey).toBe(family.variantKey);

    const snapshot = structuredClone(f.rows.practice_items);
    await f.run();
    expect(f.rows.practice_items).toEqual(snapshot);
  });

  it("stores a resolvable parent key in fallback selection and repairs only its own legacy item", async () => {
    const family = firstFamilyForComponent("comprehension-quiz");
    const activityId = "activities:fallback";
    const legacyItemId = "practice_items:legacy";
    const f = fixture({
      activities: [{ _id: activityId, componentKey: family.componentKey }],
      items: [{
        _id: legacyItemId,
        activityId,
        practiceItemId: `${family.variantKey}:${activityId}`,
        variantKey: `${family.variantKey}:${activityId}`,
        legacyProblemFamilyId: family.variantKey,
        variantLabel: "Set A",
      }],
    });

    const result = await f.run();
    expect(f.rows.practice_items).toHaveLength(1);
    expect(f.rows.practice_items[0]).toMatchObject({ _id: legacyItemId, variantKey: family.variantKey });
    expect(result.find((row) => row.practiceItemId === f.rows.practice_items[0].practiceItemId)?.variantKey).toBe(family.variantKey);
    expect(f.rows.practice_variants.filter((row) => row.variantKey === f.rows.practice_items[0].variantKey)).toHaveLength(1);
  });

  it("does not reassign an item that belongs to a different family", async () => {
    const family = firstFamilyForComponent("comprehension-quiz");
    const activityId = "activities:owned";
    const f = fixture({
      activities: [{ _id: activityId, componentKey: family.componentKey }],
      items: [{
        _id: "practice_items:owned",
        activityId,
        practiceItemId: "another-family:item",
        variantKey: "another-family",
        legacyProblemFamilyId: "another-family",
        variantLabel: "Set A",
      }],
    });

    await f.run();
    expect(f.rows.practice_items).toEqual([
      expect.objectContaining({ variantKey: "another-family", legacyProblemFamilyId: "another-family" }),
    ]);
  });
});
