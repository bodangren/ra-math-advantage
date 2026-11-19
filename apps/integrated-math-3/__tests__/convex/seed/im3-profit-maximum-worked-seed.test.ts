import { describe, expect, it, vi } from "vitest";

import { fillInTheBlankSchema } from "@math-platform/math-content";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3ProfitMaximumWorkedSeedDocument,
  linkIm3ProfitMaximumWorkedPhase,
  seedLesson1,
  upsertIm3ProfitMaximumGuidedActivity,
  upsertIm3ProfitMaximumGuidedPracticeItem,
  upsertIm3ProfitMaximumGuidedVariant,
  upsertIm3ProfitMaximumIndependentActivity,
  upsertIm3ProfitMaximumIndependentPracticeItem,
  upsertIm3ProfitMaximumIndependentVariant,
  upsertIm3ProfitMaximumWorkedActivity,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const GENERATOR_KEY = "quadratic-profit-model";

function generateSeedZero() {
  return getGenerator(GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MAXIMUM_NODE,
    seed: 0,
    difficulty: 0.5,
  });
}

describe("IM3 profit maximum Worked seed", () => {
  it("builds the exact generator-backed Worked activity", () => {
    const generated = generateSeedZero();
    const generatedData = generated.data as {
      rendererProps: Record<string, unknown>;
    };
    const partIds = Object.keys(generated.expectedAnswer);
    const activity = buildIm3ProfitMaximumWorkedSeedDocument(123);

    expect(IM3_PROFIT_MAXIMUM_NODE).toBe(
      "math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model",
    );
    expect(IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID).toBe(`${IM3_PROFIT_MAXIMUM_NODE}.worked_example`);
    expect(activity).toEqual({
      componentKey: "fill-in-the-blank",
      displayName: "Find and interpret the maximum of a quadratic profit model",
      description: "Worked Example 3: Find and interpret the maximum of a quadratic profit model.",
      props: generatedData.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds,
        rubric: partIds.map((partId) => ({
          criteria: `Correct ${partId}`,
          partId,
          points: generated.gradingMetadata.partMaxScores[partId],
        })),
      },
      stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: 123,
      updatedAt: 123,
    });
    expect(fillInTheBlankSchema.safeParse(activity.props).success).toBe(true);
    expect(Object.keys(generated.expectedAnswer)).toEqual([
      "optimalIncreases",
      "optimalPrice",
      "maximumProfit",
    ]);
    expect(activity.gradingConfig.partIds).toEqual([
      "optimalIncreases",
      "optimalPrice",
      "maximumProfit",
    ]);
    expect(activity.gradingConfig.rubric).toHaveLength(3);
    expect(activity.gradingConfig.rubric.every((part) => part.points === 1)).toBe(true);
    expect(Object.keys(activity)).toEqual([
      "componentKey",
      "displayName",
      "description",
      "props",
      "gradingConfig",
      "stableActivityId",
      "masteryNodeId",
      "learningEvidenceMode",
      "srsEligible",
      "createdAt",
      "updatedAt",
    ]);
  });

  it("upserts one activity and preserves createdAt on repeat", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = { _id: "activities:profit-maximum-worked", ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(activityId).toBe("activities:profit-maximum-worked");
      if (!storedActivity) throw new Error("Expected an inserted activity before patching");
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_stable_activity_id");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("stableActivityId");
                expect(value).toBe(IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3ProfitMaximumWorkedActivity(ctx, 100);
    const secondId = await upsertIm3ProfitMaximumWorkedActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-maximum-worked");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toMatchObject({
      _id: firstId,
      stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: 100,
      updatedAt: 200,
    });
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        learningEvidenceMode: "worked_example",
        srsEligible: false,
        createdAt: 100,
        updatedAt: 200,
      }),
    );
    expect(storedActivity).not.toHaveProperty("variant");
    expect(storedActivity).not.toHaveProperty("practiceItemId");
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("idempotently upserts the maximum-profit Guided activity", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = { _id: "activities:profit-maximum-guided", ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(activityId).toBe("activities:profit-maximum-guided");
      if (!storedActivity) throw new Error("Expected an inserted activity before patching");
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_stable_activity_id");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("stableActivityId");
                expect(value).toBe(IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumGuidedSeedDocuments(
      "activities:pending" as never,
      100,
    ).activity;
    const expectedSecond = buildIm3ProfitMaximumGuidedSeedDocuments(
      "activities:pending" as never,
      200,
    ).activity;

    const firstId = await upsertIm3ProfitMaximumGuidedActivity(ctx, 100);
    const secondId = await upsertIm3ProfitMaximumGuidedActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-maximum-guided");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toEqual({
      _id: firstId,
      ...expectedSecond,
      createdAt: 100,
    });
    expect(patch).toHaveBeenCalledWith(firstId, {
      ...expectedSecond,
      createdAt: 100,
    });
    expect(storedActivity).not.toHaveProperty("variant");
    expect(storedActivity).not.toHaveProperty("item");
    expect(storedActivity).not.toHaveProperty("practiceItemId");
    expect(storedActivity).not.toHaveProperty("learningEvidenceMode");
    const finalActivity = storedActivity as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalActivity)).toEqual([
      "_id",
      "componentKey",
      "displayName",
      "description",
      "props",
      "gradingConfig",
      "stableActivityId",
      "masteryNodeId",
      "srsEligible",
      "createdAt",
      "updatedAt",
    ]);
    expect(finalActivity.createdAt).toBe(expectedFirst.createdAt);
    expect(finalActivity.updatedAt).toBe(expectedSecond.updatedAt);
    expect(finalActivity.props).toEqual(expectedSecond.props);
    expect(finalActivity.gradingConfig).toEqual(expectedSecond.gradingConfig);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("idempotently upserts the maximum-profit Independent activity", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = { _id: "activities:profit-maximum-independent", ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(activityId).toBe("activities:profit-maximum-independent");
      if (!storedActivity) throw new Error("Expected an inserted activity before patching");
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_stable_activity_id");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("stableActivityId");
                expect(value).toBe(IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumIndependentSeedDocuments(
      "activities:pending" as never,
      100,
    ).activity;
    const expectedSecond = buildIm3ProfitMaximumIndependentSeedDocuments(
      "activities:pending" as never,
      200,
    ).activity;

    const firstId = await upsertIm3ProfitMaximumIndependentActivity(ctx, 100);
    const secondId = await upsertIm3ProfitMaximumIndependentActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-maximum-independent");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toEqual({
      _id: firstId,
      ...expectedSecond,
      createdAt: 100,
    });
    expect(patch).toHaveBeenCalledWith(firstId, {
      ...expectedSecond,
      createdAt: 100,
    });
    expect(storedActivity).not.toHaveProperty("variant");
    expect(storedActivity).not.toHaveProperty("item");
    expect(storedActivity).not.toHaveProperty("practiceItemId");
    expect(storedActivity).not.toHaveProperty("learningEvidenceMode");
    const finalActivity = storedActivity as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalActivity)).toEqual([
      "_id",
      "componentKey",
      "displayName",
      "description",
      "props",
      "gradingConfig",
      "stableActivityId",
      "masteryNodeId",
      "srsEligible",
      "createdAt",
      "updatedAt",
    ]);
    expect(finalActivity).toMatchObject({
      componentKey: "fill-in-the-blank",
      stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      srsEligible: true,
      props: expectedSecond.props,
      gradingConfig: expectedSecond.gradingConfig,
    });
    expect(finalActivity.createdAt).toBe(expectedFirst.createdAt);
    expect(finalActivity.updatedAt).toBe(expectedSecond.updatedAt);
    expect(finalActivity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 3,
      partialCredit: true,
      partIds: ["optimalIncreases", "optimalPrice", "maximumProfit"],
      rubric: [
        { criteria: "Correct optimalIncreases", partId: "optimalIncreases", points: 1 },
        { criteria: "Correct optimalPrice", partId: "optimalPrice", points: 1 },
        { criteria: "Correct maximumProfit", partId: "maximumProfit", points: 1 },
      ],
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("idempotently upserts the maximum-profit Guided practice variant", async () => {
    let storedVariant: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_variants");
      storedVariant = { _id: "practice_variants:profit-maximum-guided", ...document };
      return storedVariant._id;
    });
    const patch = vi.fn(async (variantId: string, document: Record<string, unknown>) => {
      expect(variantId).toBe("practice_variants:profit-maximum-guided");
      if (!storedVariant) throw new Error("Expected an inserted variant before patching");
      storedVariant = { ...storedVariant, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_variants");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_variantKey");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("variantKey");
                expect(value).toBe(IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedVariant) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumGuidedSeedDocuments(
      "activities:pending" as never,
      100,
    ).variant;
    const expectedSecond = buildIm3ProfitMaximumGuidedSeedDocuments(
      "activities:pending" as never,
      200,
    ).variant;

    const firstId = await upsertIm3ProfitMaximumGuidedVariant(ctx, 100);
    const secondId = await upsertIm3ProfitMaximumGuidedVariant(ctx, 200);

    expect(firstId).toBe("practice_variants:profit-maximum-guided");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("practice_variants", expectedFirst);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(firstId, expectedSecond);
    expect(storedVariant).toEqual({ _id: firstId, ...expectedSecond });
    expect(expectedSecond).toEqual({ ...expectedFirst, sourceTimestamp: 200 });
    expect(storedVariant).not.toHaveProperty("activity");
    expect(storedVariant).not.toHaveProperty("item");
    expect(storedVariant).not.toHaveProperty("practiceItemId");
    expect(storedVariant).not.toHaveProperty("srsEligible");
    expect(storedVariant).not.toHaveProperty("learningEvidenceMode");
    const finalVariant = storedVariant as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalVariant)).toEqual([
      "_id",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "componentKey",
      "displayName",
      "description",
      "objectiveIds",
      "difficulty",
      "metadata",
    ]);
    expect(finalVariant).toMatchObject({
      variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      componentKey: "fill-in-the-blank",
      displayName: "Find and interpret a quadratic profit maximum",
      description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
      objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID },
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("idempotently upserts the maximum-profit Independent practice variant", async () => {
    let storedVariant: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_variants");
      storedVariant = { _id: "practice_variants:profit-maximum-independent", ...document };
      return storedVariant._id;
    });
    const patch = vi.fn(async (variantId: string, document: Record<string, unknown>) => {
      expect(variantId).toBe("practice_variants:profit-maximum-independent");
      if (!storedVariant) throw new Error("Expected an inserted variant before patching");
      storedVariant = { ...storedVariant, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_variants");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_variantKey");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("variantKey");
                expect(value).toBe(IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedVariant) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumIndependentSeedDocuments(
      "activities:pending" as never,
      100,
    ).variant;
    const expectedSecond = buildIm3ProfitMaximumIndependentSeedDocuments(
      "activities:pending" as never,
      200,
    ).variant;

    const firstId = await upsertIm3ProfitMaximumIndependentVariant(ctx, 100);
    const secondId = await upsertIm3ProfitMaximumIndependentVariant(ctx, 200);

    expect(firstId).toBe("practice_variants:profit-maximum-independent");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("practice_variants", expectedFirst);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(firstId, expectedSecond);
    expect(storedVariant).toEqual({ _id: firstId, ...expectedSecond });
    expect(expectedSecond).toEqual({ ...expectedFirst, sourceTimestamp: 200 });
    expect(storedVariant).not.toHaveProperty("activity");
    expect(storedVariant).not.toHaveProperty("activityId");
    expect(storedVariant).not.toHaveProperty("item");
    expect(storedVariant).not.toHaveProperty("practiceItemId");
    expect(storedVariant).not.toHaveProperty("srsEligible");
    expect(storedVariant).not.toHaveProperty("learningEvidenceMode");
    const finalVariant = storedVariant as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalVariant)).toEqual([
      "_id",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "componentKey",
      "displayName",
      "description",
      "objectiveIds",
      "difficulty",
      "metadata",
    ]);
    expect(finalVariant).toEqual({ _id: firstId, ...expectedSecond });
    expect(finalVariant).toMatchObject({
      variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      componentKey: "fill-in-the-blank",
      displayName: "Find and interpret a quadratic profit maximum",
      description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
      objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID },
    });
    expect(finalVariant.sourceTimestamp).toBe(200);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("idempotently upserts the maximum-profit Independent practice item", async () => {
    const activityId = "activities:profit-maximum-independent" as never;
    let storedItem: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_items");
      storedItem = { _id: "practice_items:profit-maximum-independent", ...document };
      return storedItem._id;
    });
    const patch = vi.fn(async (itemId: string, document: Record<string, unknown>) => {
      expect(itemId).toBe("practice_items:profit-maximum-independent");
      if (!storedItem) throw new Error("Expected an inserted item before patching");
      storedItem = { ...storedItem, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            const expectedField = indexName === "by_variantKey" ? "variantKey" : "activityId";
            const expectedValue =
              indexName === "by_variantKey"
                ? IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
                : activityId;
            expect(indexName).toMatch(/^(by_variantKey|by_activityId)$/);
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe(expectedField);
                expect(value).toBe(expectedValue);
                return undefined;
              }),
            });
            return {
              take: vi.fn(async (limit: number) => {
                expect(limit).toBe(2);
                return storedItem ? [storedItem] : [];
              }),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumIndependentSeedDocuments(activityId, 100).item;
    const expectedSecond = buildIm3ProfitMaximumIndependentSeedDocuments(activityId, 200).item;

    const firstId = await upsertIm3ProfitMaximumIndependentPracticeItem(ctx, activityId, 100);
    const secondId = await upsertIm3ProfitMaximumIndependentPracticeItem(ctx, activityId, 200);

    expect(firstId).toBe("practice_items:profit-maximum-independent");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("practice_items", expectedFirst);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(firstId, expectedSecond);
    expect(storedItem).toEqual({ _id: firstId, ...expectedSecond });
    expect(expectedSecond).toEqual({ ...expectedFirst, sourceTimestamp: 200 });
    expect(storedItem).not.toHaveProperty("activity");
    expect(storedItem).not.toHaveProperty("variant");
    expect(storedItem).not.toHaveProperty("srsEligible");
    expect(storedItem).not.toHaveProperty("learningEvidenceMode");
    const finalItem = storedItem as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalItem)).toEqual([
      "_id",
      "practiceItemId",
      "activityId",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "variantLabel",
    ]);
    expect(finalItem).toMatchObject({
      practiceItemId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: 200,
      variantLabel: "Seed 2",
    });
    expect(query).toHaveBeenCalledTimes(4);
  });

  it("rejects corrupt maximum-profit Independent practice-item mappings before writes", async () => {
    const activityId = "activities:profit-maximum-independent" as never;
    const validItem = buildIm3ProfitMaximumIndependentSeedDocuments(activityId, 100).item;
    const baseRow = { _id: "practice_items:row-1", ...validItem };
    const corruptions = [
      {
        name: "wrong variantKey",
        byVariant: [{ ...baseRow, variantKey: "wrong-independent" }],
        byActivity: [],
      },
      {
        name: "wrong activityId",
        byVariant: [{ ...baseRow, activityId: "activities:other" }],
        byActivity: [],
      },
      {
        name: "wrong practiceItemId",
        byVariant: [{ ...baseRow, practiceItemId: "wrong-item" }],
        byActivity: [],
      },
      {
        name: "two distinct rows across indexes",
        byVariant: [baseRow],
        byActivity: [{ ...baseRow, _id: "practice_items:row-2" }],
      },
      {
        name: "two distinct rows from one index",
        byVariant: [baseRow, { ...baseRow, _id: "practice_items:row-2" }],
        byActivity: [],
      },
    ];

    for (const corruption of corruptions) {
      const insert = vi.fn();
      const patch = vi.fn();
      const query = vi.fn((table: string) => {
        expect(table).toBe("practice_items");
        return {
          withIndex: vi.fn(
            (
              indexName: string,
              indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
            ) => {
              const expectedField = indexName === "by_variantKey" ? "variantKey" : "activityId";
              const expectedValue =
                indexName === "by_variantKey"
                  ? IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
                  : activityId;
              expect(indexName).toMatch(/^(by_variantKey|by_activityId)$/);
              indexQuery({
                eq: vi.fn((field: string, value: unknown) => {
                  expect(field).toBe(expectedField);
                  expect(value).toBe(expectedValue);
                  return undefined;
                }),
              });
              return {
                take: vi.fn(async (limit: number) => {
                  expect(limit).toBe(2);
                  return indexName === "by_variantKey"
                    ? corruption.byVariant
                    : corruption.byActivity;
                }),
              };
            },
          ),
        };
      });
      const ctx = { db: { query, insert, patch } } as never;

      await expect(
        upsertIm3ProfitMaximumIndependentPracticeItem(ctx, activityId, 100),
      ).rejects.toThrow(
        "Duplicate or conflicting IM3 maximum-profit Independent practice-item mapping",
      );
      expect(insert).not.toHaveBeenCalled();
      expect(patch).not.toHaveBeenCalled();
      expect(query).toHaveBeenCalledTimes(2);
      expect(corruption.name).toBeTruthy();
    }
  });

  it("idempotently upserts the maximum-profit Guided practice item", async () => {
    const activityId = "activities:profit-maximum-guided" as never;
    let storedItem: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_items");
      storedItem = { _id: "practice_items:profit-maximum-guided", ...document };
      return storedItem._id;
    });
    const patch = vi.fn(async (itemId: string, document: Record<string, unknown>) => {
      expect(itemId).toBe("practice_items:profit-maximum-guided");
      if (!storedItem) throw new Error("Expected an inserted item before patching");
      storedItem = { ...storedItem, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            const expectedField = indexName === "by_variantKey" ? "variantKey" : "activityId";
            const expectedValue =
              indexName === "by_variantKey" ? IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID : activityId;
            expect(indexName).toMatch(/^(by_variantKey|by_activityId)$/);
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe(expectedField);
                expect(value).toBe(expectedValue);
                return undefined;
              }),
            });
            return {
              take: vi.fn(async (limit: number) => {
                expect(limit).toBe(2);
                return storedItem ? [storedItem] : [];
              }),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const expectedFirst = buildIm3ProfitMaximumGuidedSeedDocuments(activityId, 100).item;
    const expectedSecond = buildIm3ProfitMaximumGuidedSeedDocuments(activityId, 200).item;

    const firstId = await upsertIm3ProfitMaximumGuidedPracticeItem(ctx, activityId, 100);
    const secondId = await upsertIm3ProfitMaximumGuidedPracticeItem(ctx, activityId, 200);

    expect(firstId).toBe("practice_items:profit-maximum-guided");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("practice_items", expectedFirst);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(firstId, expectedSecond);
    expect(storedItem).toEqual({ _id: firstId, ...expectedSecond });
    expect(expectedSecond).toEqual({ ...expectedFirst, sourceTimestamp: 200 });
    expect(storedItem).not.toHaveProperty("activity");
    expect(storedItem).not.toHaveProperty("variant");
    expect(storedItem).not.toHaveProperty("srsEligible");
    expect(storedItem).not.toHaveProperty("learningEvidenceMode");
    const finalItem = storedItem as unknown as Record<string, unknown> & { _id: string };
    expect(Object.keys(finalItem)).toEqual([
      "_id",
      "practiceItemId",
      "activityId",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "variantLabel",
    ]);
    expect(finalItem).toMatchObject({
      practiceItemId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      variantLabel: "Seed 1",
    });
    expect(query).toHaveBeenCalledTimes(4);
  });

  it("rejects corrupt maximum-profit Guided practice-item mappings before writes", async () => {
    const activityId = "activities:profit-maximum-guided" as never;
    const validItem = buildIm3ProfitMaximumGuidedSeedDocuments(activityId, 100).item;
    const baseRow = { _id: "practice_items:row-1", ...validItem };
    const corruptions = [
      {
        name: "wrong variantKey",
        byVariant: [{ ...baseRow, variantKey: "wrong-guided" }],
        byActivity: [],
      },
      {
        name: "wrong activityId",
        byVariant: [{ ...baseRow, activityId: "activities:other" }],
        byActivity: [],
      },
      {
        name: "wrong practiceItemId",
        byVariant: [{ ...baseRow, practiceItemId: "wrong-item" }],
        byActivity: [],
      },
      {
        name: "two distinct rows across indexes",
        byVariant: [baseRow],
        byActivity: [{ ...baseRow, _id: "practice_items:row-2" }],
      },
      {
        name: "two distinct rows from one index",
        byVariant: [baseRow, { ...baseRow, _id: "practice_items:row-2" }],
        byActivity: [],
      },
    ];

    for (const corruption of corruptions) {
      const insert = vi.fn();
      const patch = vi.fn();
      const query = vi.fn((table: string) => {
        expect(table).toBe("practice_items");
        return {
          withIndex: vi.fn(
            (
              indexName: string,
              indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
            ) => {
              const expectedField = indexName === "by_variantKey" ? "variantKey" : "activityId";
              const expectedValue =
                indexName === "by_variantKey" ? IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID : activityId;
              indexQuery({
                eq: vi.fn((field: string, value: unknown) => {
                  expect(field).toBe(expectedField);
                  expect(value).toBe(expectedValue);
                  return undefined;
                }),
              });
              return {
                take: vi.fn(async (limit: number) => {
                  expect(limit).toBe(2);
                  return indexName === "by_variantKey"
                    ? corruption.byVariant
                    : corruption.byActivity;
                }),
              };
            },
          ),
        };
      });
      const ctx = { db: { query, insert, patch } } as never;

      await expect(upsertIm3ProfitMaximumGuidedPracticeItem(ctx, activityId, 100)).rejects.toThrow(
        "Duplicate or conflicting IM3 maximum-profit Guided practice-item mapping",
      );
      expect(insert).not.toHaveBeenCalled();
      expect(patch).not.toHaveBeenCalled();
      expect(query).toHaveBeenCalledTimes(2);
      expect(corruption.name).toBeTruthy();
    }
  });

  it("builds the exact generator-backed Guided activity, variant, and item", () => {
    const generated = getGenerator(GENERATOR_KEY).generate({
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      seed: 1,
      difficulty: 0.5,
    });
    const generatedData = generated.data as {
      baseSales: number;
      basePrice: number;
      priceIncrease: number;
      salesDecrease: number;
      rendererProps: Record<string, unknown>;
    };
    const partIds = Object.keys(generated.expectedAnswer);
    const firstActivityId = "activities:profit-maximum-guided-1" as never;
    const secondActivityId = "activities:profit-maximum-guided-2" as never;
    const first = buildIm3ProfitMaximumGuidedSeedDocuments(firstActivityId, 100);
    const second = buildIm3ProfitMaximumGuidedSeedDocuments(secondActivityId, 200);

    expect(generatedData).toMatchObject({
      baseSales: 270,
      basePrice: 230,
      priceIncrease: 10,
      salesDecrease: 10,
      coefficients: { a: -100, b: 400, c: 62100 },
    });
    expect(generated.prompt).toContain("Given P(x) = -100x^2 + 400x + 62100");
    expect(generated.expectedAnswer).toEqual({
      optimalIncreases: "2",
      optimalPrice: "250",
      maximumProfit: "62500",
    });
    expect(first).toEqual({
      activity: {
        componentKey: "fill-in-the-blank",
        displayName: "Mastery Advantage: Find and interpret a quadratic profit maximum",
        description: "Guided practice for IM3 Example 3.",
        props: generatedData.rendererProps,
        gradingConfig: {
          autoGrade: true,
          passingScore: 3,
          partialCredit: true,
          partIds,
          rubric: partIds.map((partId) => ({
            criteria: `Correct ${partId}`,
            partId,
            points: generated.gradingMetadata.partMaxScores[partId],
          })),
        },
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
        createdAt: 100,
        updatedAt: 100,
      },
      variant: {
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: 100,
        componentKey: "fill-in-the-blank",
        displayName: "Find and interpret a quadratic profit maximum",
        description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
        objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
        difficulty: "standard",
        metadata: {
          stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        },
      },
      item: {
        practiceItemId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-1`,
        activityId: firstActivityId,
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: 100,
        variantLabel: "Seed 1",
      },
    });
    expect(fillInTheBlankSchema.safeParse(first.activity.props).success).toBe(true);
    expect(first.activity).not.toHaveProperty("learningEvidenceMode");
    expect(Object.keys(first.activity)).toEqual([
      "componentKey",
      "displayName",
      "description",
      "props",
      "gradingConfig",
      "stableActivityId",
      "masteryNodeId",
      "srsEligible",
      "createdAt",
      "updatedAt",
    ]);
    expect(Object.keys(first.variant)).toEqual([
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "componentKey",
      "displayName",
      "description",
      "objectiveIds",
      "difficulty",
      "metadata",
    ]);
    expect(Object.keys(first.item)).toEqual([
      "practiceItemId",
      "activityId",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "variantLabel",
    ]);
    expect(second.activity).toEqual({ ...first.activity, createdAt: 200, updatedAt: 200 });
    expect(second.variant).toEqual({ ...first.variant, sourceTimestamp: 200 });
    expect(second.item).toEqual({
      ...first.item,
      activityId: secondActivityId,
      sourceTimestamp: 200,
    });
  });

  it("builds the exact generator-backed Independent activity, variant, and item", () => {
    const generated = getGenerator(GENERATOR_KEY).generate({
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      seed: 2,
      difficulty: 0.5,
    });
    const generatedData = generated.data as {
      baseSales: number;
      basePrice: number;
      priceIncrease: number;
      salesDecrease: number;
      rendererProps: Record<string, unknown>;
    };
    const partIds = Object.keys(generated.expectedAnswer);
    const firstActivityId = "activities:profit-maximum-independent-1" as never;
    const secondActivityId = "activities:profit-maximum-independent-2" as never;
    const first = buildIm3ProfitMaximumIndependentSeedDocuments(firstActivityId, 100);
    const second = buildIm3ProfitMaximumIndependentSeedDocuments(secondActivityId, 200);

    expect(generatedData).toMatchObject({
      baseSales: 1080,
      basePrice: 120,
      priceIncrease: 5,
      salesDecrease: 30,
      coefficients: { a: -150, b: 1800, c: 129600 },
    });
    expect(generated.prompt).toContain("Given P(x) = -150x^2 + 1800x + 129600");
    expect(generated.expectedAnswer).toEqual({
      optimalIncreases: "6",
      optimalPrice: "150",
      maximumProfit: "135000",
    });
    expect(first).toEqual({
      activity: {
        componentKey: "fill-in-the-blank",
        displayName: "Mastery Advantage: Find and interpret a quadratic profit maximum",
        description: "Independent practice for IM3 Example 3.",
        props: generatedData.rendererProps,
        gradingConfig: {
          autoGrade: true,
          passingScore: 3,
          partialCredit: true,
          partIds,
          rubric: partIds.map((partId) => ({
            criteria: `Correct ${partId}`,
            partId,
            points: generated.gradingMetadata.partMaxScores[partId],
          })),
        },
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
        createdAt: 100,
        updatedAt: 100,
      },
      variant: {
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: 100,
        componentKey: "fill-in-the-blank",
        displayName: "Find and interpret a quadratic profit maximum",
        description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
        objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
        difficulty: "standard",
        metadata: {
          stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        },
      },
      item: {
        practiceItemId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-2`,
        activityId: firstActivityId,
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: "kst-srs.v3.2",
        sourceTimestamp: 100,
        variantLabel: "Seed 2",
      },
    });
    expect(fillInTheBlankSchema.safeParse(first.activity.props).success).toBe(true);
    expect(first.activity).not.toHaveProperty("learningEvidenceMode");
    expect(Object.keys(first.activity)).toEqual([
      "componentKey",
      "displayName",
      "description",
      "props",
      "gradingConfig",
      "stableActivityId",
      "masteryNodeId",
      "srsEligible",
      "createdAt",
      "updatedAt",
    ]);
    expect(Object.keys(first.variant)).toEqual([
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "componentKey",
      "displayName",
      "description",
      "objectiveIds",
      "difficulty",
      "metadata",
    ]);
    expect(Object.keys(first.item)).toEqual([
      "practiceItemId",
      "activityId",
      "variantKey",
      "legacyProblemFamilyId",
      "migrationVersion",
      "sourceTimestamp",
      "variantLabel",
    ]);
    expect(second.activity).toEqual({ ...first.activity, createdAt: 200, updatedAt: 200 });
    expect(second.variant).toEqual({ ...first.variant, sourceTimestamp: 200 });
    expect(second.item).toEqual({
      ...first.item,
      activityId: secondActivityId,
      sourceTimestamp: 200,
    });
  });

  it("links one maximum Worked section at Phase 6 sequence 3", async () => {
    const phase = { _id: "phase-6" };
    const sections: Array<Record<string, unknown> & { _id: string }> = [
      {
        _id: "section-1",
        phaseVersionId: phase._id,
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "Example 3" },
      },
      {
        _id: "section-2",
        phaseVersionId: phase._id,
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "fill-in-the-blank",
          activityId: "activities:profit-model-worked",
        },
      },
    ];
    const initialSections = structuredClone(sections);
    const query = vi.fn((table: string) => ({
      withIndex: vi.fn(
        (
          indexName: string,
          indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          if (table === "phase_versions") {
            expect(indexName).toBe("by_lesson_version_and_phase");
            indexQuery({
              eq: vi.fn((field: string, value: unknown) => {
                if (field === "lessonVersionId") expect(value).toBe("lesson-version-1");
                if (field === "phaseNumber") expect(value).toBe(6);
                return {
                  eq: vi.fn((nextField: string, nextValue: unknown) => {
                    expect(nextField).toBe("phaseNumber");
                    expect(nextValue).toBe(6);
                    return undefined;
                  }),
                };
              }),
            });
            return { first: vi.fn(async () => phase) };
          }
          expect(table).toBe("phase_sections");
          expect(indexName).toBe("by_phase_version");
          indexQuery({
            eq: vi.fn((field: string, value: unknown) => {
              expect(field).toBe("phaseVersionId");
              expect(value).toBe(phase._id);
              return undefined;
            }),
          });
          return { collect: vi.fn(async () => sections) };
        },
      ),
    }));
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("phase_sections");
      const section = { _id: "section-3", ...document } as Record<string, unknown> & {
        _id: string;
      };
      sections.push(section);
      return section._id;
    });
    const patch = vi.fn(async (sectionId: string, document: Record<string, unknown>) => {
      const index = sections.findIndex((section) => section._id === sectionId);
      if (index < 0) throw new Error("Expected a known phase section");
      sections[index] = { ...sections[index], ...document };
    });
    const ctx = { db: { query, insert, patch } } as never;

    await linkIm3ProfitMaximumWorkedPhase(
      ctx,
      "lesson-version-1" as never,
      "activities:profit-maximum-worked" as never,
      100,
    );
    await linkIm3ProfitMaximumWorkedPhase(
      ctx,
      "lesson-version-1" as never,
      "activities:profit-maximum-worked" as never,
      200,
    );

    expect(sections).toHaveLength(3);
    expect(sections.slice(0, 2)).toEqual(initialSections);
    expect(sections[2]).toEqual({
      _id: "section-3",
      phaseVersionId: phase._id,
      sequenceOrder: 3,
      sectionType: "activity",
      content: {
        componentKey: "fill-in-the-blank",
        activityId: "activities:profit-maximum-worked",
      },
      createdAt: 100,
    });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(4);
  });

  it("repairs only the exact maximum activity section component", async () => {
    const phase = { _id: "phase-6" };
    const sections: Array<Record<string, unknown> & { _id: string }> = [
      {
        _id: "section-3",
        phaseVersionId: phase._id,
        sequenceOrder: 3,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:profit-maximum-worked",
        },
      },
    ];
    const query = vi.fn((table: string) => ({
      withIndex: vi.fn(
        (
          indexName: string,
          indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          if (table === "phase_versions") {
            expect(indexName).toBe("by_lesson_version_and_phase");
            indexQuery({ eq: vi.fn(() => ({ eq: vi.fn(() => undefined) })) });
            return { first: vi.fn(async () => phase) };
          }
          expect(indexName).toBe("by_phase_version");
          indexQuery({ eq: vi.fn(() => undefined) });
          return { collect: vi.fn(async () => sections) };
        },
      ),
    }));
    const insert = vi.fn();
    const patch = vi.fn(async (sectionId: string, document: Record<string, unknown>) => {
      expect(sectionId).toBe("section-3");
      sections[0] = { ...sections[0], ...document };
    });
    const ctx = { db: { query, insert, patch } } as never;

    await linkIm3ProfitMaximumWorkedPhase(
      ctx,
      "lesson-version-1" as never,
      "activities:profit-maximum-worked" as never,
      100,
    );

    expect(insert).not.toHaveBeenCalled();
    expect(patch).toHaveBeenCalledWith("section-3", {
      content: {
        componentKey: "fill-in-the-blank",
        activityId: "activities:profit-maximum-worked",
      },
    });
    expect(sections).toHaveLength(1);
  });

  it("rejects a missing Phase 6 without writes", async () => {
    const query = vi.fn((table: string) => ({
      withIndex: vi.fn(
        (
          indexName: string,
          indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          expect(table).toBe("phase_versions");
          expect(indexName).toBe("by_lesson_version_and_phase");
          indexQuery({ eq: vi.fn(() => ({ eq: vi.fn(() => undefined) })) });
          return { first: vi.fn(async () => null) };
        },
      ),
    }));
    const insert = vi.fn();
    const patch = vi.fn();
    const ctx = { db: { query, insert, patch } } as never;

    await expect(
      linkIm3ProfitMaximumWorkedPhase(
        ctx,
        "lesson-version-1" as never,
        "activities:profit-maximum-worked" as never,
        100,
      ),
    ).rejects.toThrow("Lesson 1.1 Phase 6 is missing");
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects an occupied Phase 6 sequence 3 without writes", async () => {
    const phase = { _id: "phase-6" };
    const sections = [
      {
        _id: "other-section",
        phaseVersionId: phase._id,
        sequenceOrder: 3,
        sectionType: "text",
        content: { markdown: "Other content" },
      },
    ];
    const query = vi.fn((table: string) => ({
      withIndex: vi.fn(
        (
          indexName: string,
          indexQuery: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          if (table === "phase_versions") {
            expect(indexName).toBe("by_lesson_version_and_phase");
            indexQuery({ eq: vi.fn(() => ({ eq: vi.fn(() => undefined) })) });
            return { first: vi.fn(async () => phase) };
          }
          expect(indexName).toBe("by_phase_version");
          indexQuery({ eq: vi.fn(() => undefined) });
          return { collect: vi.fn(async () => sections) };
        },
      ),
    }));
    const insert = vi.fn();
    const patch = vi.fn();
    const ctx = { db: { query, insert, patch } } as never;

    await expect(
      linkIm3ProfitMaximumWorkedPhase(
        ctx,
        "lesson-version-1" as never,
        "activities:profit-maximum-worked" as never,
        100,
      ),
    ).rejects.toThrow("Lesson 1.1 Phase 6 sequence 3 is occupied");
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });

  it("wires the maximum Worked, Guided, and Independent upserts in seedLesson1 order", () => {
    const source = (seedLesson1 as unknown as { _handler: () => unknown })._handler.toString();
    const upsertStatement =
      "const profitMaximumWorkedActivityId = await upsertIm3ProfitMaximumWorkedActivity(ctx, now);";
    const linkStatement =
      "await linkIm3ProfitMaximumWorkedPhase(ctx, lessonVersionId, profitMaximumWorkedActivityId, now);";
    const workedLinkStatement =
      "await linkIm3ProfitModelWorkedPhase(ctx, lessonVersionId, profitModelWorkedActivityId);";
    const guidedActivityStatement =
      "const profitMaximumGuidedActivityId = await upsertIm3ProfitMaximumGuidedActivity(ctx, now);";
    const guidedVariantStatement = "await upsertIm3ProfitMaximumGuidedVariant(ctx, now);";
    const guidedPracticeItemStatement =
      "await upsertIm3ProfitMaximumGuidedPracticeItem(ctx, profitMaximumGuidedActivityId, now);";
    const independentActivityStatement =
      "const profitMaximumIndependentActivityId = await upsertIm3ProfitMaximumIndependentActivity(ctx, now);";
    const independentVariantStatement = "await upsertIm3ProfitMaximumIndependentVariant(ctx, now);";
    const independentPracticeItemStatement =
      "await upsertIm3ProfitMaximumIndependentPracticeItem(ctx, profitMaximumIndependentActivityId, now);";

    expect(source).toContain(upsertStatement);
    expect(source).toContain(linkStatement);
    expect(source.split(guidedActivityStatement).length - 1).toBe(1);
    expect(source.split(guidedVariantStatement).length - 1).toBe(1);
    expect(source.split(guidedPracticeItemStatement).length - 1).toBe(1);
    expect(source.split(independentActivityStatement).length - 1).toBe(1);
    expect(source.split(independentVariantStatement).length - 1).toBe(1);
    expect(source.split(independentPracticeItemStatement).length - 1).toBe(1);
    expect(source.indexOf(upsertStatement)).toBeGreaterThan(source.indexOf(workedLinkStatement));
    expect(source.indexOf(linkStatement)).toBeGreaterThan(source.indexOf(upsertStatement));
    expect(source.indexOf(guidedActivityStatement)).toBeGreaterThan(source.indexOf(linkStatement));
    expect(source.indexOf(guidedVariantStatement)).toBeGreaterThan(
      source.indexOf(guidedActivityStatement),
    );
    expect(source.indexOf(guidedPracticeItemStatement)).toBeGreaterThan(
      source.indexOf(guidedVariantStatement),
    );
    expect(source.indexOf(independentActivityStatement)).toBeGreaterThan(
      source.indexOf(guidedPracticeItemStatement),
    );
    expect(source.indexOf(independentVariantStatement)).toBeGreaterThan(
      source.indexOf(independentActivityStatement),
    );
    expect(source.indexOf(independentPracticeItemStatement)).toBeGreaterThan(
      source.indexOf(independentVariantStatement),
    );
    expect(source).not.toContain("linkIm3ProfitMaximumGuidedPhase");

    const guidedActivity = buildIm3ProfitMaximumGuidedSeedDocuments(
      "activities:pending" as never,
      100,
    ).activity;
    expect(guidedActivity.srsEligible).toBe(true);
    expect(guidedActivity).not.toHaveProperty("learningEvidenceMode");
    const independentActivity = buildIm3ProfitMaximumIndependentSeedDocuments(
      "activities:pending" as never,
      100,
    ).activity;
    expect(independentActivity.srsEligible).toBe(true);
    expect(independentActivity).not.toHaveProperty("learningEvidenceMode");
  });
});
