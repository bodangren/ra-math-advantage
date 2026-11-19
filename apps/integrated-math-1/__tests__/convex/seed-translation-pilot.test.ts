import { describe, expect, it } from "vitest";
import { seedTranslationPilotHandler } from "@/convex/seed/seed_translation_pilot";

function store() {
  const tables: Record<string, Array<Record<string, unknown>>> = {
    activities: [],
    practice_items: [],
  };
  let sequence = 0;
  const db = {
    query: (table: string) => ({
      withIndex: (
        _name: string,
        select: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        let selected = [...tables[table]];
        const chain = {
          eq(field: string, value: unknown) {
            selected = selected.filter((row) => row[field] === value);
            return chain;
          },
        };
        select(chain);
        return { unique: async () => selected[0] ?? null };
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}_${++sequence}`;
      tables[table].push({ _id: id, ...value });
      return id;
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const row = Object.values(tables)
        .flat()
        .find((item) => item._id === id)!;
      for (const [key, field] of Object.entries(value)) {
        if (field === undefined) delete row[key];
        else row[key] = field;
      }
    },
  };
  return { ctx: { db }, tables };
}

describe("IM1 translation pilot seed", () => {
  it("is idempotent and preserves reviewed eligibility when content is unchanged", async () => {
    const { ctx, tables } = store();
    await seedTranslationPilotHandler(ctx as never);
    const independent = tables.activities.find(
      (row) => row.learningEvidenceMode === "independent_practice",
    )!;
    independent.approval = { status: "approved" };
    independent.srsEligible = true;
    await seedTranslationPilotHandler(ctx as never);
    expect(tables.activities).toHaveLength(3);
    expect(tables.practice_items).toHaveLength(3);
    expect(independent).toMatchObject({ approval: { status: "approved" }, srsEligible: true });
  });

  it("invalidates approval and eligibility when reviewed content differs", async () => {
    const { ctx, tables } = store();
    await seedTranslationPilotHandler(ctx as never);
    const independent = tables.activities.find(
      (row) => row.learningEvidenceMode === "independent_practice",
    )!;
    independent.approval = { status: "approved" };
    independent.srsEligible = true;
    independent.props = { stale: true };
    await seedTranslationPilotHandler(ctx as never);
    expect(independent.approval).toBeUndefined();
    expect(independent.srsEligible).toBe(false);
  });
});
