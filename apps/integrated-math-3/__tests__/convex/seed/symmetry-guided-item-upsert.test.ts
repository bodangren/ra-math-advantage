import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import {
  buildIm3SymmetryGuidedSeedDocuments,
  upsertIm3SymmetryGuidedPracticeItem,
} from "@/convex/seed/seed_lesson_1_1";
import { IM3_SYMMETRY_GUIDED_ACTIVITY_ID } from "@/lib/practice/learning-evidence-pilot";

describe("IM3 symmetry Guided practice-item upsert", () => {
  it("upserts the exact Guided practice item by linked identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const activityId = "activities:symmetry-guided" as Id<"activities">;
    const storedItemId = "practice_items:symmetry-guided" as Id<"practice_items">;
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
                take: async (limit: number) => {
                  operations.push(`take:${limit}`);
                  return stored ? [{ ...stored, _id: storedItemId }] : [];
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedItemId };
          return storedItemId;
        },
        patch: async (id: Id<"practice_items">, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertIm3SymmetryGuidedPracticeItem(ctx, activityId, 100);
    const secondId = await upsertIm3SymmetryGuidedPracticeItem(ctx, activityId, 200);

    expect(firstId).toBe(storedItemId);
    expect(secondId).toBe(storedItemId);
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      `patch:${storedItemId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3SymmetryGuidedSeedDocuments(activityId, 200).item,
      _id: storedItemId,
    });
    expect(stored).toMatchObject({
      practiceItemId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 0",
      sourceTimestamp: 200,
    });
    expect(
      operations.filter(
        (operation) => operation.startsWith("query:") && !operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("rejects a conflicting symmetry Guided practice-item mapping before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:symmetry-guided" as Id<"activities">;
    const conflictingItemId = "practice_items:symmetry-guided-conflict" as Id<"practice_items">;
    const conflictingRow = {
      _id: conflictingItemId,
      practiceItemId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:conflict`,
      activityId,
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 0",
    };
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
                take: async (limit: number) => {
                  operations.push(`take:${limit}`);
                  return index === "by_variantKey" ? [conflictingRow] : [];
                },
              };
            },
          };
        },
        insert: async () => {
          operations.push("insert:practice_items");
          return conflictingItemId;
        },
        patch: async () => {
          operations.push(`patch:${conflictingItemId}`);
        },
      },
    } as never;

    await expect(upsertIm3SymmetryGuidedPracticeItem(ctx, activityId, 100)).rejects.toThrow(
      "Duplicate or conflicting IM3 symmetry Guided practice-item mapping",
    );
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
    ]);
    expect(
      operations.filter(
        (operation) => operation.startsWith("insert:") || operation.startsWith("patch:"),
      ),
    ).toEqual([]);
  });
});
