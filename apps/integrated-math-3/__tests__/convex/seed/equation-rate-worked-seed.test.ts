import { describe, expect, it } from "vitest";

import { rateOfChangeCalculatorSchema } from "@math-platform/math-content";
import type { MutationCtx } from "@/convex/_generated/server";
import {
  buildIm3EquationRateWorkedSeedDocument,
  upsertIm3EquationRateWorkedActivity,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const FORBIDDEN_PROP_KEYS = new Set([
  "answer",
  "answers",
  "correctAnswer",
  "expectedAnswer",
  "gradingRules",
  "isCorrect",
  "score",
  "maxScore",
]);

function expectNoForbiddenPropKeys(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoForbiddenPropKeys);
    return;
  }
  if (value === null || typeof value !== "object") return;

  Object.entries(value).forEach(([key, nestedValue]) => {
    expect(FORBIDDEN_PROP_KEYS.has(key)).toBe(false);
    expectNoForbiddenPropKeys(nestedValue);
  });
}

describe("IM3 equation-rate Worked seed", () => {
  it("defines the exact source-faithful activity document without answer authority", () => {
    expect(IM3_EQUATION_RATE_WORKED_ACTIVITY_ID).toBe(`${IM3_EQUATION_RATE_NODE}.worked_example`);
    expect(IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID).toBe(`${IM3_EQUATION_RATE_NODE}.guided_practice`);
    expect(IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID).toBe(
      `${IM3_EQUATION_RATE_NODE}.independent_practice`,
    );

    const activity = buildIm3EquationRateWorkedSeedDocument(100);

    expect(activity).toMatchObject({
      stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      componentKey: "rate-of-change-calculator",
      props: {
        sourceType: "function",
        data: { expression: "f(x) = -x^2 + 2x - 1" },
        interval: { start: -4, end: 4 },
      },
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      gradingConfig: {
        autoGrade: true,
        passingScore: 7,
        partialCredit: true,
        partIds: ["f_a", "f_b", "rate"],
        rubric: [
          { criteria: "Correct f_a", partId: "f_a", points: 2 },
          { criteria: "Correct f_b", partId: "f_b", points: 2 },
          { criteria: "Correct rate", partId: "rate", points: 3 },
        ],
      },
      createdAt: 100,
      updatedAt: 100,
    });
    expect(activity.createdAt).toBe(100);
    expect(activity.updatedAt).toBe(100);
    expect(rateOfChangeCalculatorSchema.parse(activity.props)).toEqual(activity.props);
    expectNoForbiddenPropKeys(activity.props);
  });

  it("inserts once and patches the same physical activity without changing createdAt", async () => {
    const rows: Array<Record<string, unknown> & { _id: string }> = [];
    const queryCalls: Array<{ table: string; index: string; unique: boolean }> = [];
    const insertCalls: Array<[string, Record<string, unknown>]> = [];
    const patchCalls: Array<[string, Record<string, unknown>]> = [];

    const ctx = {
      db: {
        query(table: string) {
          return {
            withIndex(
              index: string,
              configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
            ) {
              let stableActivityId: unknown;
              const indexQuery = {
                eq(field: string, value: unknown) {
                  stableActivityId = value;
                  return indexQuery;
                },
              };
              configure(indexQuery);
              return {
                unique: async () => {
                  queryCalls.push({ table, index, unique: true });
                  return rows.find((row) => row.stableActivityId === stableActivityId) ?? null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          const id = "activities:equation-rate-worked";
          rows.push({ _id: id, ...document });
          insertCalls.push([table, document]);
          return id;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          patchCalls.push([id, document]);
          const row = rows.find((candidate) => candidate._id === id);
          if (row) Object.assign(row, document);
        },
      },
    } as unknown as MutationCtx;

    const firstId = await upsertIm3EquationRateWorkedActivity(ctx, 100);
    const secondId = await upsertIm3EquationRateWorkedActivity(ctx, 200);

    expect(firstId).toBe("activities:equation-rate-worked");
    expect(secondId).toBe(firstId);
    expect(queryCalls).toEqual([
      { table: "activities", index: "by_stable_activity_id", unique: true },
      { table: "activities", index: "by_stable_activity_id", unique: true },
    ]);
    expect(insertCalls).toHaveLength(1);
    expect(patchCalls).toHaveLength(1);
    expect(patchCalls[0]).toMatchObject([
      "activities:equation-rate-worked",
      { createdAt: 100, updatedAt: 200 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      _id: firstId,
      stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      createdAt: 100,
      updatedAt: 200,
    });
  });
});
