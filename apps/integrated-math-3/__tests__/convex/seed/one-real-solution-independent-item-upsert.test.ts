import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import {
  buildIm3OneRealSolutionIndependentPracticeSeedDocuments,
  upsertIm3OneRealSolutionIndependentPracticeItem,
} from "@/convex/seed/seed_lesson_1_2";
import { IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID } from "@/lib/practice/learning-evidence-pilot";

type Row = Record<string, unknown> & { _id: string };

function createContext(variantRows: Row[] = [], activityRows: Row[] = []) {
  const operations: string[] = [];
  let stored: Row | undefined;
  const storedItemId = "practice_items:one-real-solution-independent";
  const patchCalls: Array<[string, Record<string, unknown>]> = [];
  const insertCalls: Array<[string, Record<string, unknown>]> = [];

  const query = (table: string) => {
    if (table !== "practice_items") {
      throw new Error(`Unexpected table ${table}`);
    }
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
            if (stored) return [{ ...stored, _id: storedItemId }];
            return index === "by_variantKey" ? variantRows : activityRows;
          },
        };
      },
    };
  };
  const insert = async (table: string, document: Record<string, unknown>) => {
    operations.push(`insert:${table}`);
    insertCalls.push([table, document]);
    stored = { ...document, _id: storedItemId };
    return storedItemId;
  };
  const patch = async (id: Id<"practice_items">, document: Record<string, unknown>) => {
    operations.push(`patch:${id}`);
    patchCalls.push([id, document]);
    stored = { ...stored, ...document, _id: id };
  };

  return {
    ctx: { db: { query, insert, patch } } as never,
    operations,
    insertCalls,
    patchCalls,
    stored: () => stored,
  };
}

describe("IM3 one-real-solution Independent practice-item upsert", () => {
  it("upserts the exact Independent item by both linked identities", async () => {
    const activityId = "activities:one-real-solution-independent" as Id<"activities">;
    const state = createContext();

    const firstId = await upsertIm3OneRealSolutionIndependentPracticeItem(
      state.ctx,
      activityId,
      100,
    );
    const secondId = await upsertIm3OneRealSolutionIndependentPracticeItem(
      state.ctx,
      activityId,
      200,
    );

    expect(firstId).toBe("practice_items:one-real-solution-independent");
    expect(secondId).toBe(firstId);
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "patch:practice_items:one-real-solution-independent",
    ]);
    expect(state.insertCalls).toHaveLength(1);
    expect(state.patchCalls).toHaveLength(1);
    expect(state.stored()).toEqual({
      ...buildIm3OneRealSolutionIndependentPracticeSeedDocuments(activityId, 200).item,
      _id: "practice_items:one-real-solution-independent",
    });
    expect(state.stored()).toMatchObject({
      practiceItemId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 0",
      sourceTimestamp: 200,
    });
    expect(
      state.operations
        .filter((operation) => operation.startsWith("query:"))
        .every((operation) => operation === "query:practice_items"),
    ).toBe(true);
  });

  it("rejects a conflicting Independent practice-item mapping before writes", async () => {
    const activityId = "activities:one-real-solution-independent" as Id<"activities">;
    const state = createContext([
      {
        _id: "practice_items:conflict",
        practiceItemId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}:wrong-seed`,
        activityId,
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        variantLabel: "Seed 0",
      },
    ]);

    await expect(
      upsertIm3OneRealSolutionIndependentPracticeItem(state.ctx, activityId, 100),
    ).rejects.toThrow(
      "Duplicate or conflicting IM3 one-real-solution Independent practice-item mapping",
    );
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
    ]);
    expect(state.insertCalls).toEqual([]);
    expect(state.patchCalls).toEqual([]);
  });

  it("rejects duplicate Independent practice-item rows before writes", async () => {
    const activityId = "activities:one-real-solution-independent" as Id<"activities">;
    const expected = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(activityId, 100).item;
    const state = createContext(
      [
        {
          _id: "practice_items:first",
          ...expected,
        },
      ],
      [
        {
          _id: "practice_items:second",
          ...expected,
        },
      ],
    );

    await expect(
      upsertIm3OneRealSolutionIndependentPracticeItem(state.ctx, activityId, 100),
    ).rejects.toThrow(
      "Duplicate or conflicting IM3 one-real-solution Independent practice-item mapping",
    );
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
    ]);
    expect(state.insertCalls).toEqual([]);
    expect(state.patchCalls).toEqual([]);
  });
});
