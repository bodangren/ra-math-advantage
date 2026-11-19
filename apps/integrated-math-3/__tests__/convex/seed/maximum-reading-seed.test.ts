import { describe, expect, it } from "vitest";

import { graphingExplorerSchema } from "@math-platform/math-content";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import type { Id } from "@/convex/_generated/dataModel";
import {
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3MaximumReadingWorkedSeedDocument,
  upsertIm3MaximumReadingGuidedActivity,
  upsertIm3MaximumReadingGuidedPracticeItem,
  upsertIm3MaximumReadingGuidedVariant,
  upsertIm3MaximumReadingWorkedActivity,
  upsertIm3MaximumReadingIndependentActivity,
  upsertIm3MaximumReadingIndependentVariant,
  upsertIm3MaximumReadingIndependentPracticeItem,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const ACTIVITY_ID = "activities:maximum-reading-seed" as Id<"activities">;
const NOW = 100;
const MAXIMUM_READING_RUBRIC = [
  {
    criteria: "Identify the maximum value from the displayed graph.",
    partId: "maximum_value",
    points: 1,
  },
];
const FORBIDDEN_PROP_KEYS = new Set([
  "answer",
  "answers",
  "correctAnswer",
  "expectedAnswer",
  "gradingRules",
  "gradingMetadata",
  "partAnswers",
  "finalAnswer",
  "solutionSteps",
  "isCorrect",
  "score",
  "maxScore",
]);

describe("IM3 maximum-reading seed documents", () => {
  it("builds exact deterministic Worked, Guided, and Independent documents", () => {
    const worked = buildIm3MaximumReadingWorkedSeedDocument(NOW);
    const guided = buildIm3MaximumReadingGuidedSeedDocuments(ACTIVITY_ID, NOW);
    const guidedAgain = buildIm3MaximumReadingGuidedSeedDocuments(ACTIVITY_ID, NOW);
    const independent = buildIm3MaximumReadingIndependentSeedDocuments(ACTIVITY_ID, NOW);
    const independentAgain = buildIm3MaximumReadingIndependentSeedDocuments(ACTIVITY_ID, NOW);
    const generator = getGenerator("quadratic-graph-analysis");
    const guidedGenerated = generator.generate({
      nodeId: IM3_MAXIMUM_READING_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const independentGenerated = generator.generate({
      nodeId: IM3_MAXIMUM_READING_NODE,
      seed: 34,
      difficulty: 0.5,
    });

    expect(buildIm3MaximumReadingWorkedSeedDocument).toHaveLength(1);
    expect(buildIm3MaximumReadingGuidedSeedDocuments).toHaveLength(2);
    expect(buildIm3MaximumReadingIndependentSeedDocuments).toHaveLength(2);
    expect(worked).toEqual({
      componentKey: "graphing-explorer",
      displayName: "Identify a quadratic maximum from its graph",
      description: "Worked Example 2: Identify the maximum value from the graph.",
      props: {
        equation: "f(x) = -x^2 + 6x - 4",
        variant: "plot_from_equation",
        responseVariant: "maximum_value",
        domain: [-2, 8],
        range: [-3, 7],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ["maximum_value"],
        rubric: MAXIMUM_READING_RUBRIC,
      },
      stableActivityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(graphingExplorerSchema.parse(worked.props)).toEqual(worked.props);
    expect(guided).toEqual(guidedAgain);
    expect(independent).toEqual(independentAgain);
    expect(guidedGenerated.data.rendererProps).toEqual({
      equation: "y = -x^2 - 1",
      variant: "plot_from_equation",
      responseVariant: "maximum_value",
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(guidedGenerated.expectedAnswer).toEqual({ maximum_value: -1 });
    expect(guidedGenerated.gradingMetadata).toEqual({
      partAnswers: { maximum_value: -1 },
      partMaxScores: { maximum_value: 1 },
      partGradingRules: { maximum_value: "numeric_tolerance" },
    });
    expect(guided.activity).toEqual({
      componentKey: "graphing-explorer",
      displayName: "Guided maximum value from a quadratic graph",
      description: "Use the graph of a quadratic function to identify its maximum value.",
      props: guidedGenerated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ["maximum_value"],
        rubric: MAXIMUM_READING_RUBRIC,
      },
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(guided.variant).toEqual({
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: NOW,
      componentKey: "graphing-explorer",
      displayName: "Guided maximum value from a quadratic graph",
      description: "Use the graph to identify the maximum value of the quadratic.",
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID },
    });
    expect(guided.item).toEqual({
      practiceItemId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId: ACTIVITY_ID,
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: NOW,
      variantLabel: "Seed 0",
    });
    expect(graphingExplorerSchema.parse(guided.activity.props)).toEqual(guided.activity.props);
    expect(independentGenerated.data.rendererProps).toEqual({
      equation: "y = -x^2 + 2",
      variant: "plot_from_equation",
      responseVariant: "maximum_value",
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(independentGenerated.expectedAnswer).toEqual({ maximum_value: 2 });
    expect(independent.activity).toEqual({
      componentKey: "graphing-explorer",
      displayName: "Independent maximum value from a quadratic graph",
      description: "Independent practice for the maximum value from a quadratic graph.",
      props: independentGenerated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ["maximum_value"],
        rubric: MAXIMUM_READING_RUBRIC,
      },
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(independent.variant).toEqual({
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: NOW,
      componentKey: "graphing-explorer",
      displayName: "Independent maximum value from a quadratic graph",
      description: "Practice identifying the maximum value of a quadratic graph.",
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID },
    });
    expect(independent.item).toEqual({
      practiceItemId: `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
      activityId: ACTIVITY_ID,
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: NOW,
      variantLabel: "Seed 34",
    });
    expect(graphingExplorerSchema.parse(independent.activity.props)).toEqual(
      independent.activity.props,
    );

    const scanProps = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(scanProps);
        return;
      }
      Object.entries(value).forEach(([key, nestedValue]) => {
        expect(FORBIDDEN_PROP_KEYS.has(key)).toBe(false);
        scanProps(nestedValue);
      });
    };
    scanProps(worked.props);
    scanProps(guided.activity.props);
    scanProps(independent.activity.props);
  });

  it("upserts the maximum-reading Worked activity by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedActivityId = "activities:maximum-reading-worked" as Id<"activities">;
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
                  return stored ? { ...stored, _id: storedActivityId } : null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedActivityId };
          return storedActivityId;
        },
        patch: async (id: Id<"activities">, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertIm3MaximumReadingWorkedActivity(ctx, 100);
    const secondId = await upsertIm3MaximumReadingWorkedActivity(ctx, 200);

    expect(firstId).toBe(storedActivityId);
    expect(secondId).toBe(storedActivityId);
    expect(operations).toEqual([
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID}`,
      "unique",
      "insert:activities",
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID}`,
      "unique",
      `patch:${storedActivityId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingWorkedSeedDocument(200),
      createdAt: 100,
      _id: storedActivityId,
    });
    expect(
      operations.filter(
        (operation) =>
          operation.includes("practice_variants") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("upserts the maximum-reading Guided activity by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedActivityId = "activities:maximum-reading-guided" as Id<"activities">;
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
                  return stored ? { ...stored, _id: storedActivityId } : null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedActivityId };
          return storedActivityId;
        },
        patch: async (id: Id<"activities">, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertIm3MaximumReadingGuidedActivity(ctx, 100);
    const secondId = await upsertIm3MaximumReadingGuidedActivity(ctx, 200);

    expect(firstId).toBe(storedActivityId);
    expect(secondId).toBe(storedActivityId);
    expect(operations).toEqual([
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "unique",
      "insert:activities",
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "unique",
      `patch:${storedActivityId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingGuidedSeedDocuments(storedActivityId, 200).activity,
      createdAt: 100,
      _id: storedActivityId,
    });
    expect(stored).toMatchObject({
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
    });
    expect(
      operations.filter(
        (operation) =>
          operation.includes("practice_variants") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("upserts the maximum-reading Guided variant by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedVariantId = "practice_variants:maximum-reading-guided" as Id<"practice_variants">;
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

    const firstId = await upsertIm3MaximumReadingGuidedVariant(ctx, 100);
    const secondId = await upsertIm3MaximumReadingGuidedVariant(ctx, 200);

    expect(firstId).toBe(storedVariantId);
    expect(secondId).toBe(storedVariantId);
    expect(operations).toEqual([
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "unique",
      "insert:practice_variants",
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "unique",
      `patch:${storedVariantId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingGuidedSeedDocuments("activities:pending" as Id<"activities">, 200)
        .variant,
      _id: storedVariantId,
    });
    expect(stored).toMatchObject({
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      metadata: { stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID },
    });
    expect(
      operations.filter(
        (operation) => operation.includes("activities") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("upserts the maximum-reading Guided practice item by linked identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const activityId = "activities:maximum-reading-guided" as Id<"activities">;
    const storedItemId = "practice_items:maximum-reading-guided" as Id<"practice_items">;
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

    const firstId = await upsertIm3MaximumReadingGuidedPracticeItem(ctx, activityId, 100);
    const secondId = await upsertIm3MaximumReadingGuidedPracticeItem(ctx, activityId, 200);

    expect(firstId).toBe(storedItemId);
    expect(secondId).toBe(storedItemId);
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      `patch:${storedItemId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingGuidedSeedDocuments(activityId, 200).item,
      _id: storedItemId,
    });
    expect(stored).toMatchObject({
      practiceItemId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 0",
      sourceTimestamp: 200,
    });
    expect(
      operations.filter(
        (operation) => operation.startsWith("query:") && !operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("rejects a conflicting maximum-reading Guided practice-item mapping before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:maximum-reading-guided-conflict" as Id<"activities">;
    const conflictingItemId =
      "practice_items:maximum-reading-guided-conflict" as Id<"practice_items">;
    const conflictingRow = {
      _id: conflictingItemId,
      practiceItemId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:conflict`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
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

    await expect(upsertIm3MaximumReadingGuidedPracticeItem(ctx, activityId, 100)).rejects.toThrow(
      "Duplicate or conflicting IM3 maximum-reading Guided practice-item mapping",
    );
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}`,
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

  it("upserts the maximum-reading Independent activity by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedActivityId = "activities:maximum-reading-independent" as Id<"activities">;
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
                  return stored ? { ...stored, _id: storedActivityId } : null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedActivityId };
          return storedActivityId;
        },
        patch: async (id: Id<"activities">, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertIm3MaximumReadingIndependentActivity(ctx, 100);
    const secondId = await upsertIm3MaximumReadingIndependentActivity(ctx, 200);

    expect(firstId).toBe(storedActivityId);
    expect(secondId).toBe(storedActivityId);
    expect(operations).toEqual([
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "unique",
      "insert:activities",
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "unique",
      `patch:${storedActivityId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingIndependentSeedDocuments(storedActivityId, 200).activity,
      createdAt: 100,
      _id: storedActivityId,
    });
    expect(stored).toMatchObject({
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true,
    });
    expect(
      operations.filter(
        (operation) =>
          operation.includes("practice_variants") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("upserts the maximum-reading Independent variant by stable identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedVariantId =
      "practice_variants:maximum-reading-independent" as Id<"practice_variants">;
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

    const firstId = await upsertIm3MaximumReadingIndependentVariant(ctx, 100);
    const secondId = await upsertIm3MaximumReadingIndependentVariant(ctx, 200);

    expect(firstId).toBe(storedVariantId);
    expect(secondId).toBe(storedVariantId);
    expect(operations).toEqual([
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "unique",
      "insert:practice_variants",
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "unique",
      `patch:${storedVariantId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingIndependentSeedDocuments(
        "activities:pending" as Id<"activities">,
        200,
      ).variant,
      _id: storedVariantId,
    });
    expect(stored).toMatchObject({
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      metadata: { stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID },
      migrationVersion: "kst-srs.v3.2",
      componentKey: "graphing-explorer",
      difficulty: "standard",
      sourceTimestamp: 200,
    });
    expect(
      operations.filter(
        (operation) => operation.includes("activities") || operation.includes("practice_items"),
      ),
    ).toEqual([]);
  });

  it("upserts the maximum-reading Independent practice item by linked identity", async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const activityId = "activities:maximum-reading-independent" as Id<"activities">;
    const storedItemId = "practice_items:maximum-reading-independent" as Id<"practice_items">;
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

    const firstId = await upsertIm3MaximumReadingIndependentPracticeItem(ctx, activityId, 100);
    const secondId = await upsertIm3MaximumReadingIndependentPracticeItem(ctx, activityId, 200);

    expect(firstId).toBe(storedItemId);
    expect(secondId).toBe(storedItemId);
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
      "take:2",
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "take:2",
      `patch:${storedItemId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3MaximumReadingIndependentSeedDocuments(activityId, 200).item,
      _id: storedItemId,
    });
    expect(stored).toMatchObject({
      practiceItemId: `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 34",
      sourceTimestamp: 200,
    });
    expect(
      operations.filter(
        (operation) =>
          operation === "insert:activities" ||
          operation === "patch:activities" ||
          operation === "insert:practice_variants" ||
          operation === "patch:practice_variants",
      ),
    ).toEqual([]);
  });

  it("rejects a conflicting maximum-reading Independent practice-item mapping before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:maximum-reading-independent-conflict" as Id<"activities">;
    const conflictingItemId =
      "practice_items:maximum-reading-independent-conflict" as Id<"practice_items">;
    const conflictingRow = {
      _id: conflictingItemId,
      practiceItemId: `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:conflict`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 34",
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

    await expect(
      upsertIm3MaximumReadingIndependentPracticeItem(ctx, activityId, 100),
    ).rejects.toThrow(
      "Duplicate or conflicting IM3 maximum-reading Independent practice-item mapping",
    );
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}`,
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
