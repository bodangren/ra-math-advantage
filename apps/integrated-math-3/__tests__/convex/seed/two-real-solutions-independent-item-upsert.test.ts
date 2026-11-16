import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import {
  buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments,
} from "@/convex/seed/seed_lesson_1_2";
import * as seedLesson12 from "@/convex/seed/seed_lesson_1_2";
import {
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

type Row = Record<string, unknown> & { _id: string };

type OptionalIndependentPracticeItemUpsert =
  ((ctx: never, activityId: Id<"activities">, now: number) => Promise<Id<"practice_items">>) | undefined;

function createContext(variantRows: Row[] = [], activityRows: Row[] = []) {
  const operations: string[] = [];
  let stored: Row | undefined;
  const storedItemId = "practice_items:two-real-solutions-independent";
  const patchCalls: Array<[string, Record<string, unknown>]> = [];
  const insertCalls: Array<[string, Record<string, unknown>]> = [];

  const query = (table: string) => {
    if (table !== "practice_items") {
      throw new Error(`Unexpected table ${table}`);
    }
    operations.push(`query:${table}`);
    return {
      withIndex(index: string, callback: (query: {
        eq: (field: string, value: unknown) => unknown;
      }) => unknown) {
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

describe("IM3 two-real-solutions Independent practice-item upsert", () => {
  it("upserts the exact two-real-solutions Independent item by both linked identities", async () => {
    const upsertIndependentItem = (
      seedLesson12 as {
        upsertIm3TwoRealSolutionsIndependentPracticeItem?: OptionalIndependentPracticeItemUpsert;
      }
    ).upsertIm3TwoRealSolutionsIndependentPracticeItem;
    expect(typeof upsertIndependentItem).toBe("function");
    if (typeof upsertIndependentItem !== "function") return;

    const activityId = "activities:two-real-solutions-independent" as Id<"activities">;
    const state = createContext();

    const firstId = await upsertIndependentItem(state.ctx, activityId, 100);
    const secondId = await upsertIndependentItem(state.ctx, activityId, 200);

    expect(firstId).toBe("practice_items:two-real-solutions-independent");
    expect(secondId).toBe(firstId);
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "patch:practice_items:two-real-solutions-independent",
    ]);
    expect(state.insertCalls).toHaveLength(1);
    expect(state.patchCalls).toHaveLength(1);
    expect(state.stored()).toEqual({
      ...buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(activityId, 200).item,
      _id: "practice_items:two-real-solutions-independent",
    });
    expect(state.stored()).toMatchObject({
      practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: 200,
      variantLabel: "Seed 2",
    });
    expect(state.operations.filter((operation) => operation.startsWith("query:")).every((operation) => (
      operation === "query:practice_items"
    ))).toBe(true);
  });

  it("rejects a conflicting two-real-solutions Independent practice-item mapping before writes", async () => {
    const upsertIndependentItem = (
      seedLesson12 as {
        upsertIm3TwoRealSolutionsIndependentPracticeItem?: OptionalIndependentPracticeItemUpsert;
      }
    ).upsertIm3TwoRealSolutionsIndependentPracticeItem;
    expect(typeof upsertIndependentItem).toBe("function");
    if (typeof upsertIndependentItem !== "function") return;

    const activityId = "activities:two-real-solutions-independent" as Id<"activities">;
    const state = createContext([{
      _id: "practice_items:conflict",
      practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:wrong-seed`,
      activityId,
      variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 2",
    }]);

    await expect(
      upsertIndependentItem(state.ctx, activityId, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 two-real-solutions Independent practice-item mapping");
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
    ]);
    expect(state.insertCalls).toEqual([]);
    expect(state.patchCalls).toEqual([]);
  });

  it("rejects duplicate two-real-solutions Independent practice-item rows before writes", async () => {
    const upsertIndependentItem = (
      seedLesson12 as {
        upsertIm3TwoRealSolutionsIndependentPracticeItem?: OptionalIndependentPracticeItemUpsert;
      }
    ).upsertIm3TwoRealSolutionsIndependentPracticeItem;
    expect(typeof upsertIndependentItem).toBe("function");
    if (typeof upsertIndependentItem !== "function") return;

    const activityId = "activities:two-real-solutions-independent" as Id<"activities">;
    const expected = buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(activityId, 100).item;
    const state = createContext([{
      _id: "practice_items:first",
      ...expected,
    }], [{
      _id: "practice_items:second",
      ...expected,
    }]);

    await expect(
      upsertIndependentItem(state.ctx, activityId, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 two-real-solutions Independent practice-item mapping");
    expect(state.operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}`,
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
