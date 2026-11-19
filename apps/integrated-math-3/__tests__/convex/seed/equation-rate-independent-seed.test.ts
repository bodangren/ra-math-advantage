import { describe, expect, it, vi } from "vitest";

import { rateOfChangeCalculatorSchema } from "@math-platform/math-content";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  buildIm3EquationRateIndependentSeedDocuments,
  upsertIm3EquationRateIndependentActivity,
  upsertIm3EquationRateIndependentPracticeItem,
  upsertIm3EquationRateIndependentVariant,
} from "@/convex/seed/seed_lesson_1_1";

const NODE_ID = "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation";
const GENERATOR_KEY = "average-rate-of-change";
const STABLE_ACTIVITY_ID = `${NODE_ID}.independent_practice`;
const FORBIDDEN_KEYS = new Set([
  "correctAnswer",
  "expectedAnswer",
  "solutionSteps",
  "gradingMetadata",
  "partAnswers",
  "identifiedValues",
  "finalAnswer",
  "isCorrect",
  "score",
  "maxScore",
]);

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsForbiddenKey);
  }
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.entries(value).some(
    ([key, nestedValue]) => FORBIDDEN_KEYS.has(key) || containsForbiddenKey(nestedValue),
  );
}

describe("IM3 equation-rate Independent seed documents", () => {
  it("builds the exact seed-2 activity, variant, and item from the generator", () => {
    const generated = getGenerator(GENERATOR_KEY).generate({
      nodeId: NODE_ID,
      seed: 2,
      difficulty: 0.5,
    });
    const documents = buildIm3EquationRateIndependentSeedDocuments(
      "activities:equation-rate-independent" as never,
      123,
    );
    const expectedRendererProps = {
      sourceType: "function",
      data: { expression: "f(x) = -2x^2 + 2x - 2" },
      interval: { start: 0, end: 4 },
    };

    expect(getGenerator(GENERATOR_KEY).key).toBe(GENERATOR_KEY);
    expect(generated.data.rendererProps).toEqual(expectedRendererProps);
    expect(generated.expectedAnswer).toEqual({ f_a: -2, f_b: -26, rate: -6 });
    expect(rateOfChangeCalculatorSchema.parse(documents.activity.props)).toEqual(
      expectedRendererProps,
    );
    expect(documents.activity).toMatchObject({
      componentKey: "rate-of-change-calculator",
      props: expectedRendererProps,
      stableActivityId: STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      srsEligible: true,
      createdAt: 123,
      updatedAt: 123,
    });
    expect(documents.activity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 7,
      partialCredit: true,
      partIds: ["f_a", "f_b", "rate"],
      rubric: [
        { criteria: "Correct f_a", partId: "f_a", points: 2 },
        { criteria: "Correct f_b", partId: "f_b", points: 2 },
        { criteria: "Correct rate", partId: "rate", points: 3 },
      ],
    });
    expect(containsForbiddenKey(documents.activity.props)).toBe(false);

    expect(documents.variant).toMatchObject({
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      componentKey: "rate-of-change-calculator",
      objectiveIds: [NODE_ID],
      metadata: { stableActivityId: STABLE_ACTIVITY_ID },
    });
    expect(documents.item).toMatchObject({
      practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
      activityId: "activities:equation-rate-independent",
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      variantLabel: "Seed 2",
    });
  });

  it("inserts once and patches the same equation-rate activity on a later upsert", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = {
        _id: "activities:equation-rate-independent-1",
        ...document,
      };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(storedActivity?._id).toBe(activityId);
      if (!storedActivity) {
        throw new Error("Expected an inserted activity before patching");
      }
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (queryBuilder: {
              eq: (field: string, value: string) => unknown;
            }) => unknown,
          ) => {
            expect(indexName).toBe("by_stable_activity_id");
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                expect(field).toBe("stableActivityId");
                expect(value).toBe(STABLE_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3EquationRateIndependentActivity(ctx, 100);
    const secondId = await upsertIm3EquationRateIndependentActivity(ctx, 200);

    expect(firstId).toBe("activities:equation-rate-independent-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toMatchObject({
      stableActivityId: STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      srsEligible: true,
      updatedAt: 200,
    });
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        stableActivityId: STABLE_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        srsEligible: true,
        updatedAt: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("inserts once and patches the same equation-rate variant on a later upsert", async () => {
    let storedVariant: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_variants");
      storedVariant = {
        _id: "practice-variants:equation-rate-independent-1",
        ...document,
      };
      return storedVariant._id;
    });
    const patch = vi.fn(async (variantId: string, document: Record<string, unknown>) => {
      expect(storedVariant?._id).toBe(variantId);
      if (!storedVariant) {
        throw new Error("Expected an inserted variant before patching");
      }
      storedVariant = { ...storedVariant, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_variants");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (queryBuilder: {
              eq: (field: string, value: string) => unknown;
            }) => unknown,
          ) => {
            expect(indexName).toBe("by_variantKey");
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                expect(field).toBe("variantKey");
                expect(value).toBe(STABLE_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedVariant) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3EquationRateIndependentVariant(ctx, 100);
    const secondId = await upsertIm3EquationRateIndependentVariant(ctx, 200);

    expect(firstId).toBe("practice-variants:equation-rate-independent-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedVariant).toMatchObject({
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      componentKey: "rate-of-change-calculator",
      objectiveIds: [NODE_ID],
      sourceTimestamp: 200,
    });
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        variantKey: STABLE_ACTIVITY_ID,
        legacyProblemFamilyId: STABLE_ACTIVITY_ID,
        componentKey: "rate-of-change-calculator",
        objectiveIds: [NODE_ID],
        sourceTimestamp: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("inserts once and patches the same equation-rate practice item on a later upsert", async () => {
    const activityId = "activities:equation-rate-independent";
    let storedItem: (Record<string, unknown> & { _id: string }) | null = null;
    const indexCalls: string[] = [];
    const takeLimits: number[] = [];
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_items");
      storedItem = {
        _id: "practice-items:equation-rate-independent-1",
        ...document,
      };
      return storedItem._id;
    });
    const patch = vi.fn(async (itemId: string, document: Record<string, unknown>) => {
      expect(storedItem?._id).toBe(itemId);
      if (!storedItem) {
        throw new Error("Expected an inserted practice item before patching");
      }
      storedItem = { ...storedItem, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (queryBuilder: {
              eq: (field: string, value: string) => unknown;
            }) => unknown,
          ) => {
            indexCalls.push(indexName);
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                if (indexName === "by_variantKey") {
                  expect(field).toBe("variantKey");
                  expect(value).toBe(STABLE_ACTIVITY_ID);
                } else {
                  expect(indexName).toBe("by_activityId");
                  expect(field).toBe("activityId");
                  expect(value).toBe(activityId);
                }
                return undefined;
              }),
            });
            return {
              take: vi.fn(async (limit: number) => {
                takeLimits.push(limit);
                return storedItem ? [storedItem] : [];
              }),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3EquationRateIndependentPracticeItem(
      ctx,
      activityId as never,
      100,
    );
    const secondId = await upsertIm3EquationRateIndependentPracticeItem(
      ctx,
      activityId as never,
      200,
    );

    expect(firstId).toBe("practice-items:equation-rate-independent-1");
    expect(secondId).toBe(firstId);
    expect(indexCalls).toEqual([
      "by_variantKey",
      "by_activityId",
      "by_variantKey",
      "by_activityId",
    ]);
    expect(takeLimits).toEqual([2, 2, 2, 2]);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedItem).toMatchObject({
      practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      variantLabel: "Seed 2",
      sourceTimestamp: 200,
    });
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
        activityId,
        variantKey: STABLE_ACTIVITY_ID,
        legacyProblemFamilyId: STABLE_ACTIVITY_ID,
        variantLabel: "Seed 2",
        sourceTimestamp: 200,
      }),
    );
  });

  it("rejects a conflicting equation-rate practice-item mapping before writing", async () => {
    const activityId = "activities:equation-rate-independent";
    const conflictingItem = {
      _id: "practice-items:equation-rate-conflict",
      practiceItemId: `${STABLE_ACTIVITY_ID}:wrong-seed`,
      activityId,
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      variantLabel: "Wrong seed",
    };
    const insert = vi.fn();
    const patch = vi.fn();
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (queryBuilder: {
              eq: (field: string, value: string) => unknown;
            }) => unknown,
          ) => {
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                if (indexName === "by_variantKey") {
                  expect(field).toBe("variantKey");
                  expect(value).toBe(STABLE_ACTIVITY_ID);
                } else {
                  expect(indexName).toBe("by_activityId");
                  expect(field).toBe("activityId");
                  expect(value).toBe(activityId);
                }
                return undefined;
              }),
            });
            return {
              take: vi.fn(async () => (indexName === "by_variantKey" ? [conflictingItem] : [])),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    await expect(
      upsertIm3EquationRateIndependentPracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 equation-rate practice-item mapping");
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });
});
