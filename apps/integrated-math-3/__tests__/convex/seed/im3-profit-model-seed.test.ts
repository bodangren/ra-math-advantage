import { describe, expect, it, vi } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { fillInTheBlankSchema } from "@math-platform/math-content";
import { parseMathSegments } from "@/lib/textbook/parse-math-segments";
import {
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitModelWorkedSeedDocument,
  buildIm3ProfitModelIndependentSeedDocuments,
  linkIm3ProfitModelWorkedPhase,
  upsertIm3ProfitModelIndependentActivity,
  upsertIm3ProfitModelIndependentPracticeItem,
  upsertIm3ProfitModelIndependentVariant,
  upsertIm3ProfitModelGuidedActivity,
  upsertIm3ProfitModelGuidedPracticeItem,
  upsertIm3ProfitModelGuidedVariant,
  upsertIm3ProfitModelWorkedActivity,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const NODE_ID = IM3_PROFIT_MODEL_NODE;
const GENERATOR_KEY = "quadratic-profit-model";
const STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID;
const GUIDED_STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID;
const WORKED_STABLE_ACTIVITY_ID = IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID;
const PART_IDS = [
  "priceBase",
  "priceStep",
  "salesBase",
  "salesLoss",
  "coefficientA",
  "coefficientB",
  "coefficientC",
] as const;

function generateSeedTwo() {
  return getGenerator(GENERATOR_KEY).generate({
    nodeId: NODE_ID,
    seed: 2,
    difficulty: 0.5,
  });
}

function generateSeedZero() {
  return getGenerator(GENERATOR_KEY).generate({
    nodeId: NODE_ID,
    seed: 0,
    difficulty: 0.5,
  });
}

describe("IM3 profit-model identity constants", () => {
  it("exports the exact shared node and Guided activity ID", () => {
    expect(IM3_PROFIT_MODEL_NODE).toBe(
      "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context",
    );
    expect(IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context.guided_practice",
    );
    expect(IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context.worked_example",
    );
    expect(NODE_ID).toBe(IM3_PROFIT_MODEL_NODE);
    expect(GUIDED_STABLE_ACTIVITY_ID).toBe(IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID);
    expect(WORKED_STABLE_ACTIVITY_ID).toBe(IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID);
    expect(buildIm3ProfitModelWorkedSeedDocument(123).stableActivityId).toBe(
      IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
    );
  });
});

function generateSeedOne() {
  return getGenerator(GENERATOR_KEY).generate({
    nodeId: NODE_ID,
    seed: 1,
    difficulty: 0.5,
  });
}

describe("IM3 profit-model Independent seed documents", () => {
  it("builds the exact seed-1 Guided activity, variant, and item from the generator", () => {
    const generated = generateSeedOne();
    const generatedData = generated.data as {
      baseSales: number;
      basePrice: number;
      priceIncrease: number;
      salesDecrease: number;
      coefficients: { a: number; b: number; c: number };
      rendererProps: Record<string, unknown> & {
        blanks: Array<{ id: string; correctAnswer: string }>;
      };
    };
    const documents = buildIm3ProfitModelGuidedSeedDocuments(
      "activities:profit-model-guided" as never,
      123,
    );

    expect(generatedData).toMatchObject({
      baseSales: 270,
      basePrice: 230,
      priceIncrease: 10,
      salesDecrease: 10,
      coefficients: { a: -100, b: 400, c: 62100 },
    });
    expect(documents.activity).toMatchObject({
      componentKey: "fill-in-the-blank",
      props: generatedData.rendererProps,
      stableActivityId: GUIDED_STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      srsEligible: true,
      createdAt: 123,
      updatedAt: 123,
    });
    expect(fillInTheBlankSchema.safeParse(documents.activity.props).success).toBe(true);
    expect(generated.expectedAnswer).toEqual({
      priceBase: "230",
      priceStep: "10",
      salesBase: "270",
      salesLoss: "10",
      coefficientA: "-100",
      coefficientB: "400",
      coefficientC: "62100",
    });
    expect(generatedData.rendererProps.blanks.map((blank) => blank.id)).toEqual(PART_IDS);
    expect(documents.activity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 7,
      partialCredit: true,
      partIds: [...PART_IDS],
      rubric: PART_IDS.map((partId) => ({
        criteria: `Correct ${partId}`,
        partId,
        points: generated.gradingMetadata.partMaxScores[partId],
      })),
    });
    expect(documents.variant).toMatchObject({
      variantKey: GUIDED_STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: GUIDED_STABLE_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      componentKey: "fill-in-the-blank",
      objectiveIds: [NODE_ID],
      difficulty: "standard",
      sourceTimestamp: 123,
      metadata: { stableActivityId: GUIDED_STABLE_ACTIVITY_ID },
    });
    expect(documents.item).toMatchObject({
      practiceItemId: `${GUIDED_STABLE_ACTIVITY_ID}:seed-1`,
      activityId: "activities:profit-model-guided",
      variantKey: GUIDED_STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: GUIDED_STABLE_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: 123,
      variantLabel: "Seed 1",
    });
    expect(Object.keys(documents)).toEqual(["activity", "variant", "item"]);
    expect(Object.keys(documents.activity)).not.toContain("learningEvidenceMode");
  });

  it("links the Worked activity into Phase 6", async () => {
    const lessonVersionId = "lesson-versions:profit";
    const activityId = "activities:profit-model-worked";
    const sections = [
      {
        _id: "phase-sections:profit-text",
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "old text" },
      },
      {
        _id: "phase-sections:profit-activity",
        sequenceOrder: 2,
        sectionType: "activity",
        content: { componentKey: "step-by-step-solver", activityId: "old-activity" },
      },
    ];
    const patch = vi.fn(async (id: string, document: Record<string, unknown>) => {
      const section = sections.find((candidate) => candidate._id === id);
      if (!section) throw new Error(`Unknown section ${id}`);
      Object.assign(section, document);
    });
    const query = vi.fn((table: string) => {
      if (table === "phase_versions") {
        return {
          withIndex: vi.fn(
            (
              indexName: string,
              configure: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
            ) => {
              expect(indexName).toBe("by_lesson_version_and_phase");
              const indexQuery = {
                eq: vi.fn((field: string, value: unknown) => {
                  expect(field === "lessonVersionId" || field === "phaseNumber").toBe(true);
                  expect(value === lessonVersionId || value === 6).toBe(true);
                  return indexQuery;
                }),
              };
              configure(indexQuery);
              return {
                first: vi.fn(async () => ({ _id: "phase-versions:profit-6" })),
              };
            },
          ),
        };
      }
      expect(table).toBe("phase_sections");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            configure: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_phase_version");
            configure({
              eq: vi.fn((field: string, value: unknown) => {
                expect(field).toBe("phaseVersionId");
                expect(value).toBe("phase-versions:profit-6");
                return undefined;
              }),
            });
            return { collect: vi.fn(async () => sections) };
          },
        ),
      };
    });
    const ctx = { db: { query, patch } } as never;

    await linkIm3ProfitModelWorkedPhase(ctx, lessonVersionId as never, activityId as never);

    expect(patch).toHaveBeenCalledTimes(2);
    expect(patch).toHaveBeenNthCalledWith(1, "phase-sections:profit-text", {
      content: {
        markdown:
          "## Example 3: Use Quadratic Functions\n\nA ski resort sold 680 holiday weekend passes at &#36;120 per pass. For each &#36;5 price increase, it expects to sell 20 fewer passes. Let x be the number of &#36;5 price increases. Build and simplify P(x) = (120 + 5x)(680 - 20x).",
      },
    });
    const patchedMarkdown = (
      patch.mock.calls[0]?.[1] as {
        content: { markdown: string };
      }
    ).content.markdown;
    expect(
      parseMathSegments(patchedMarkdown).filter((segment) => segment.type === "inline-math"),
    ).toEqual([]);
    expect(patch).toHaveBeenNthCalledWith(2, "phase-sections:profit-activity", {
      content: {
        componentKey: "fill-in-the-blank",
        activityId,
      },
    });
  });

  it("upserts the Guided activity by stable ID and preserves createdAt", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    let nextActivityId = 1;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = { _id: `activities:profit-model-guided-${nextActivityId++}`, ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(storedActivity?._id).toBe(activityId);
      if (!storedActivity) throw new Error("Expected an inserted activity before patching");
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_stable_activity_id");
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                expect(field).toBe("stableActivityId");
                expect(value).toBe(GUIDED_STABLE_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;
    const generated = generateSeedOne();

    const firstId = await upsertIm3ProfitModelGuidedActivity(ctx, 100);
    const secondId = await upsertIm3ProfitModelGuidedActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-model-guided-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toMatchObject({
      _id: "activities:profit-model-guided-1",
      props: generated.data.rendererProps,
      stableActivityId: GUIDED_STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      srsEligible: true,
      createdAt: 100,
      updatedAt: 200,
    });
    expect(storedActivity).not.toHaveProperty("learningEvidenceMode");
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        props: generated.data.rendererProps,
        stableActivityId: GUIDED_STABLE_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        srsEligible: true,
        createdAt: 100,
        updatedAt: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("upserts the Worked activity by stable ID and preserves createdAt", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("activities");
      storedActivity = { _id: "activities:profit-model-worked", ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(activityId).toBe("activities:profit-model-worked");
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
                expect(value).toBe(WORKED_STABLE_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedActivity) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3ProfitModelWorkedActivity(ctx, 100);
    const secondId = await upsertIm3ProfitModelWorkedActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-model-worked");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedActivity).toMatchObject({
      _id: "activities:profit-model-worked",
      stableActivityId: WORKED_STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: 100,
      updatedAt: 200,
    });
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        stableActivityId: WORKED_STABLE_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        learningEvidenceMode: "worked_example",
        srsEligible: false,
        createdAt: 100,
        updatedAt: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("upserts the Guided variant by variant key and preserves its physical ID", async () => {
    let storedVariant: (Record<string, unknown> & { _id: string }) | null = null;
    let nextVariantId = 1;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_variants");
      storedVariant = {
        _id: `practice-variants:profit-model-guided-${nextVariantId++}`,
        ...document,
      };
      return storedVariant._id;
    });
    const patch = vi.fn(async (variantId: string, document: Record<string, unknown>) => {
      expect(storedVariant?._id).toBe(variantId);
      if (!storedVariant) throw new Error("Expected an inserted variant before patching");
      storedVariant = { ...storedVariant, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_variants");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            expect(indexName).toBe("by_variantKey");
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                expect(field).toBe("variantKey");
                expect(value).toBe(GUIDED_STABLE_ACTIVITY_ID);
                return undefined;
              }),
            });
            return { unique: vi.fn(async () => storedVariant) };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3ProfitModelGuidedVariant(ctx, 100);
    const secondId = await upsertIm3ProfitModelGuidedVariant(ctx, 200);
    const expectedVariant = buildIm3ProfitModelGuidedSeedDocuments(
      "activities:pending" as never,
      200,
    ).variant;

    expect(firstId).toBe("practice-variants:profit-model-guided-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedVariant).toMatchObject({ _id: firstId, ...expectedVariant });
    expect(patch).toHaveBeenCalledWith(firstId, expectedVariant);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("builds the source-aligned Worked activity from generator seed 0", () => {
    const generated = generateSeedZero();
    const generatedData = generated.data as {
      rendererProps: {
        blanks: Array<{ id: string; correctAnswer: string; isMath?: boolean }>;
      };
    };
    const activity = buildIm3ProfitModelWorkedSeedDocument(123);

    expect(activity).toEqual({
      componentKey: "fill-in-the-blank",
      displayName: "Build and simplify a quadratic profit model",
      description: "Worked Example 3: Build and simplify a quadratic profit model from context.",
      props: {
        template:
          "A ski resort sells 680 passes at a base price of $120. Each price increase is $5, and 20 fewer passes are sold for each increase. Let x be the number of price increases. Worked solution: p(x) = 120 + 5x; s(x) = 680 - 20x; P(x) = (120 + 5x)(680 - 20x) = 120(680) - 120(20x) + 5x(680) - 5x(20x) = -100x^2 + 1000x + 81600. Check the key values: base price {{blank:priceBase}}, price increase {{blank:priceStep}}, base sales {{blank:salesBase}}, sales loss {{blank:salesLoss}}, a {{blank:coefficientA}}, b {{blank:coefficientB}}, and c {{blank:coefficientC}}.",
        blanks: generatedData.rendererProps.blanks,
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 7,
        partialCredit: true,
        partIds: [
          "priceBase",
          "priceStep",
          "salesBase",
          "salesLoss",
          "coefficientA",
          "coefficientB",
          "coefficientC",
        ],
        rubric: [
          { criteria: "Correct priceBase", partId: "priceBase", points: 1 },
          { criteria: "Correct priceStep", partId: "priceStep", points: 1 },
          { criteria: "Correct salesBase", partId: "salesBase", points: 1 },
          { criteria: "Correct salesLoss", partId: "salesLoss", points: 1 },
          { criteria: "Correct coefficientA", partId: "coefficientA", points: 1 },
          { criteria: "Correct coefficientB", partId: "coefficientB", points: 1 },
          { criteria: "Correct coefficientC", partId: "coefficientC", points: 1 },
        ],
      },
      stableActivityId: WORKED_STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      learningEvidenceMode: "worked_example",
      srsEligible: false,
      createdAt: 123,
      updatedAt: 123,
    });
    expect(activity.props.template).toContain("p(x) = 120 + 5x");
    expect(activity.props.template).toContain("s(x) = 680 - 20x");
    expect(activity.props.template).toContain("P(x) = (120 + 5x)(680 - 20x)");
    expect(activity.props.template).toContain("-100x^2 + 1000x + 81600");
    expect(activity.props.blanks).toEqual(generatedData.rendererProps.blanks);
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

  it("derives the exact seed-2 activity, variant, and item from the generator", () => {
    const generated = generateSeedTwo();
    const generatedData = generated.data as {
      rendererProps: Record<string, unknown> & {
        blanks: Array<{ id: string; correctAnswer: string }>;
      };
    };
    const documents = buildIm3ProfitModelIndependentSeedDocuments(
      "activities:profit-model-independent" as never,
      123,
    );

    expect(documents.activity).toMatchObject({
      componentKey: "fill-in-the-blank",
      props: generatedData.rendererProps,
      stableActivityId: STABLE_ACTIVITY_ID,
      masteryNodeId: NODE_ID,
      srsEligible: true,
    });
    expect(fillInTheBlankSchema.safeParse(documents.activity.props).success).toBe(true);

    const expectedPartIds = Object.keys(generated.expectedAnswer).sort();
    expect(expectedPartIds).toEqual([...PART_IDS].sort());
    expect(generatedData.rendererProps.blanks.map((blank) => blank.id)).toEqual(PART_IDS);
    expect(generatedData.rendererProps.blanks.map((blank) => blank.correctAnswer)).toEqual(
      PART_IDS.map((partId) => generated.expectedAnswer[partId]),
    );
    expect(documents.activity.gradingConfig).toMatchObject({
      autoGrade: true,
      partialCredit: true,
      partIds: PART_IDS,
    });
    expect(documents.activity.gradingConfig?.rubric).toEqual(
      PART_IDS.map((partId) => ({
        criteria: `Correct ${partId}`,
        partId,
        points: 1,
      })),
    );

    expect(documents.variant).toMatchObject({
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
      componentKey: "fill-in-the-blank",
      objectiveIds: [NODE_ID],
    });
    expect(documents.item).toMatchObject({
      practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
      variantKey: STABLE_ACTIVITY_ID,
      legacyProblemFamilyId: STABLE_ACTIVITY_ID,
    });
  });

  it("inserts once and patches the same activity on a later upsert", async () => {
    let storedActivity: (Record<string, unknown> & { _id: string }) | null = null;
    let nextActivityId = 1;
    const insert = vi.fn(async (_table: string, document: Record<string, unknown>) => {
      storedActivity = { _id: `activities:profit-model-${nextActivityId++}`, ...document };
      return storedActivity._id;
    });
    const patch = vi.fn(async (activityId: string, document: Record<string, unknown>) => {
      expect(storedActivity?._id).toBe(activityId);
      if (!storedActivity) throw new Error("Expected an inserted activity before patching");
      storedActivity = { ...storedActivity, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("activities");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
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

    const firstId = await upsertIm3ProfitModelIndependentActivity(ctx, 100);
    const secondId = await upsertIm3ProfitModelIndependentActivity(ctx, 200);

    expect(firstId).toBe("activities:profit-model-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
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

  it("inserts once and patches the same variant on a later upsert", async () => {
    let storedVariant: (Record<string, unknown> & { _id: string }) | null = null;
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_variants");
      storedVariant = { _id: "practice-variants:profit-model-1", ...document };
      return storedVariant._id;
    });
    const patch = vi.fn(async (variantId: string, document: Record<string, unknown>) => {
      expect(storedVariant?._id).toBe(variantId);
      if (!storedVariant) throw new Error("Expected an inserted variant before patching");
      storedVariant = { ...storedVariant, ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_variants");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
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

    const firstId = await upsertIm3ProfitModelIndependentVariant(ctx, 100);
    const secondId = await upsertIm3ProfitModelIndependentVariant(ctx, 200);

    expect(firstId).toBe("practice-variants:profit-model-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        variantKey: STABLE_ACTIVITY_ID,
        objectiveIds: [NODE_ID],
        sourceTimestamp: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("inserts once and patches the same practice item on a later upsert", async () => {
    const activityId = "activities:profit-model-independent";
    const storedItems: Array<Record<string, unknown> & { _id: string }> = [];
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_items");
      const item = { _id: "practice-items:profit-model-1", ...document };
      storedItems.push(item);
      return item._id;
    });
    const patch = vi.fn(async (itemId: string, document: Record<string, unknown>) => {
      const index = storedItems.findIndex((item) => item._id === itemId);
      expect(index).toBeGreaterThanOrEqual(0);
      storedItems[index] = { ...storedItems[index], ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            const filter = { field: "", value: "" };
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                filter.field = field;
                filter.value = value;
                return undefined;
              }),
            });
            expect(["by_variantKey", "by_activityId"]).toContain(indexName);
            return {
              take: vi.fn(async () =>
                storedItems.filter((item) => String(item[filter.field]) === filter.value),
              ),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3ProfitModelIndependentPracticeItem(
      ctx,
      activityId as never,
      100,
    );
    const secondId = await upsertIm3ProfitModelIndependentPracticeItem(
      ctx,
      activityId as never,
      200,
    );

    expect(firstId).toBe("practice-items:profit-model-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith(
      firstId,
      expect.objectContaining({
        practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
        activityId,
        variantKey: STABLE_ACTIVITY_ID,
        sourceTimestamp: 200,
      }),
    );
    expect(query).toHaveBeenCalledTimes(4);
  });

  it("inserts once and patches the same Guided practice item on a later upsert", async () => {
    const activityId = "activities:profit-model-guided";
    const storedItems: Array<Record<string, unknown> & { _id: string }> = [];
    const insert = vi.fn(async (table: string, document: Record<string, unknown>) => {
      expect(table).toBe("practice_items");
      const item = { _id: "practice-items:profit-model-guided-1", ...document };
      storedItems.push(item);
      return item._id;
    });
    const patch = vi.fn(async (itemId: string, document: Record<string, unknown>) => {
      const index = storedItems.findIndex((item) => item._id === itemId);
      expect(index).toBeGreaterThanOrEqual(0);
      storedItems[index] = { ...storedItems[index], ...document };
    });
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            const filter = { field: "", value: "" };
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                filter.field = field;
                filter.value = value;
                return undefined;
              }),
            });
            expect(["by_variantKey", "by_activityId"]).toContain(indexName);
            return {
              take: vi.fn(async (limit: number) => {
                expect(limit).toBe(2);
                return storedItems.filter((item) => String(item[filter.field]) === filter.value);
              }),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert, patch } } as never;

    const firstId = await upsertIm3ProfitModelGuidedPracticeItem(ctx, activityId as never, 100);
    const secondId = await upsertIm3ProfitModelGuidedPracticeItem(ctx, activityId as never, 200);
    const expected = buildIm3ProfitModelGuidedSeedDocuments(activityId as never, 200).item;

    expect(firstId).toBe("practice-items:profit-model-guided-1");
    expect(secondId).toBe(firstId);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledTimes(1);
    expect(storedItems).toEqual([{ _id: firstId, ...expected }]);
    expect(patch).toHaveBeenCalledWith(firstId, expected);
    expect(query).toHaveBeenCalledTimes(4);
  });

  it("rejects a conflicting Guided practice-item mapping before writes", async () => {
    const activityId = "activities:profit-model-guided";
    const conflictingItem = {
      _id: "practice-items:profit-model-guided-conflict",
      practiceItemId: `${GUIDED_STABLE_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: "wrong-guided-variant",
      variantLabel: "Seed 1",
    };
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            indexQuery({
              eq: vi.fn((field: string, value: string) => {
                if (indexName === "by_variantKey") {
                  expect(field).toBe("variantKey");
                  expect(value).toBe(GUIDED_STABLE_ACTIVITY_ID);
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
    const insert = vi.fn();
    const patch = vi.fn();
    const ctx = { db: { query, insert, patch } } as never;

    await expect(
      upsertIm3ProfitModelGuidedPracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 profit-model Guided practice-item mapping");
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects duplicate practice-item mappings", async () => {
    const activityId = "activities:profit-model-independent";
    const duplicateItems = [
      {
        _id: "practice-items:profit-model-1",
        practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2`,
        activityId,
        variantKey: STABLE_ACTIVITY_ID,
        variantLabel: "Seed 2",
      },
      {
        _id: "practice-items:profit-model-2",
        practiceItemId: `${STABLE_ACTIVITY_ID}:seed-2-duplicate`,
        activityId,
        variantKey: STABLE_ACTIVITY_ID,
        variantLabel: "Seed 2",
      },
    ];
    const query = vi.fn((table: string) => {
      expect(table).toBe("practice_items");
      return {
        withIndex: vi.fn(
          (
            indexName: string,
            indexQuery: (q: { eq: (field: string, value: string) => unknown }) => unknown,
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
              take: vi.fn(async () => (indexName === "by_variantKey" ? duplicateItems : [])),
            };
          },
        ),
      };
    });
    const ctx = { db: { query, insert: vi.fn(), patch: vi.fn() } } as never;

    await expect(
      upsertIm3ProfitModelIndependentPracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 profit-model practice-item mapping");
  });
});
