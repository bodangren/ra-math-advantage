import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import {
  buildIm3SymmetryGuidedSeedDocuments,
  upsertIm3SymmetryGuidedVariant,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
} from "@/lib/practice/learning-evidence-pilot";

describe("IM3 symmetry Guided variant upsert", () => {
  it("upserts the exact Guided variant by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedVariantId = "practice_variants:symmetry-guided" as Id<"practice_variants">;
    const ctx = {
      db: {
        query(table: string) {
          operations.push(`query:${table}`);
          return {
            withIndex(
              index: string,
              callback: (query: { eq: (field: string, value: unknown) => unknown }) => unknown,
            ) {
              operations.push(`index:${index}`);
              callback({
                eq: (field: string, value: unknown) => {
                  operations.push(`eq:${field}:${String(value)}`);
                  return undefined;
                },
              });
              return {
                unique: async () => {
                  operations.push("unique");
                  return stored ? { ...stored, _id: storedVariantId } : null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedVariantId };
          return storedVariantId;
        },
        patch: async (id: Id<"practice_variants">, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertIm3SymmetryGuidedVariant(ctx, 100);
    const secondId = await upsertIm3SymmetryGuidedVariant(ctx, 200);

    expect(firstId).toBe(storedVariantId);
    expect(secondId).toBe(storedVariantId);
    expect(operations).toEqual([
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}`,
      "unique",
      "insert:practice_variants",
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}`,
      "unique",
      `patch:${storedVariantId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3SymmetryGuidedSeedDocuments("activities:pending" as Id<"activities">, 200).variant,
      _id: storedVariantId,
    });
    expect(stored).toMatchObject({
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      objectiveIds: [IM3_SYMMETRY_NODE],
      metadata: { stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID },
    });
    expect(
      operations.filter(
        (operation) => operation.includes("activities") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });
});
