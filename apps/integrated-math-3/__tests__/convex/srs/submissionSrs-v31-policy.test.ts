import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "@/convex/_generated/server";
import { lookupVariantForScheduling } from "@/convex/srs/submissionSrs";

type TableName =
  | "practice_items"
  | "practice_variants"
  | "competency_standards"
  | "objective_policies";

function makeLookupCtx(rows: Partial<Record<TableName, unknown>>) {
  const indexCalls: Array<{ table: TableName; index: string; equals: unknown[] }> = [];
  const query = vi.fn((table: TableName) => ({
    withIndex: (
      index: string,
      build: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
    ) => {
      const equals: unknown[] = [];
      const q = {
        eq: (_field: string, value: unknown) => {
          equals.push(value);
          return q;
        },
      };
      build(q);
      indexCalls.push({ table, index, equals });
      return { first: async () => rows[table] ?? null };
    },
  }));

  return {
    ctx: { db: { query } } as unknown as MutationCtx,
    indexCalls,
  };
}

describe("IM3 trusted v3.1 scheduling policy resolution", () => {
  it("resolves objective priority only from the server-owned policy tables", async () => {
    const { ctx, indexCalls } = makeLookupCtx({
      practice_items: { variantKey: "linear.eq.v1" },
      practice_variants: { variantKey: "linear.eq.v1", objectiveIds: ["A-REI.1"] },
      competency_standards: { _id: "standard-1", code: "A-REI.1" },
      objective_policies: { policy: "extension", courseKey: "integrated-math-3" },
    });

    const result = await lookupVariantForScheduling(ctx, "activity-1");

    expect(result).toEqual({
      variantKey: "linear.eq.v1",
      objectiveId: "A-REI.1",
      schedulerContext: {
        objectivePriority: "extension",
        config: { requestRetentionByPriority: {} },
      },
    });
    expect(indexCalls).toContainEqual({
      table: "objective_policies",
      index: "by_standardId_and_courseKey",
      equals: ["standard-1", "integrated-math-3"],
    });
  });

  it("fails safely to essential when no objective policy exists", async () => {
    const { ctx } = makeLookupCtx({
      practice_items: { variantKey: "linear.eq.v1" },
      practice_variants: { variantKey: "linear.eq.v1", objectiveIds: ["A-REI.1"] },
      competency_standards: { _id: "standard-1", code: "A-REI.1" },
    });

    const result = await lookupVariantForScheduling(ctx, "activity-1");

    expect(result?.schedulerContext?.objectivePriority).toBe("essential");
  });

  it("rejects a variant with no objective instead of scheduling an empty key", async () => {
    const { ctx } = makeLookupCtx({
      practice_items: { variantKey: "orphan.v1" },
      practice_variants: { variantKey: "orphan.v1", objectiveIds: [] },
    });

    await expect(lookupVariantForScheduling(ctx, "activity-1")).resolves.toBeNull();
  });

  it("uses the legacy practice-item identity when resolving an existing row", async () => {
    const { ctx } = makeLookupCtx({
      practice_items: {
        variantKey: "quadratic.graph.v1:legacy-activity-id",
        legacyProblemFamilyId: "quadratic.graph.v1",
      },
      practice_variants: {
        variantKey: "quadratic.graph.v1",
        objectiveIds: ["A-REI.1"],
      },
    });

    await expect(lookupVariantForScheduling(ctx, "legacy-activity-id")).resolves.toMatchObject({
      variantKey: "quadratic.graph.v1",
      objectiveId: "A-REI.1",
    });
  });

  it("opts the production adapter into atomic persistence", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../../convex/srs/submissionSrs.ts"),
      "utf8",
    );

    expect(source).toMatch(/requireAtomicPersistence:\s*true/);
  });
});
