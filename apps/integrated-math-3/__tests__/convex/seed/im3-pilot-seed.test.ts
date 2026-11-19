import { describe, expect, it } from "vitest";

import { comprehensionQuizSchema, stepByStepSolverSchema } from "@math-platform/math-content";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  upsertIm3GraphIndependentSeed2Activity,
  upsertIm3GraphIndependentSeed2PracticeItem,
  upsertIm3GraphIndependentSeed2Variant,
  upsertIm3GraphGuidedSeed2PracticeItem,
  buildIm3PilotSeedDocuments,
  IM3_PHASE_FOUR_WORKED_PROPS,
  IM3_PHASE_FIVE_WORKED_PROPS,
  IM3_PHASE_SIX_WORKED_PROPS,
  IM3_PHASE_EIGHT_WORKED_PROPS,
  IM3_PHASE_NINE_WORKED_PROPS,
  IM3_PHASE_ELEVEN_QUIZ_PROPS,
  IM3_TEACHER_LED_ACTIVITY_METADATA,
  upsertIm3GuidedPilotActivity,
  upsertIm3GuidedPilotPracticeItem,
  upsertIm3GuidedPilotVariant,
} from "@/convex/seed/seed_lesson_1_1";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const APPROVED_PILOT_PUBLICATION = {
  nodeReviewStatus: "approved",
  blueprintReviewStatus: "approved",
} as const;

describe("IM3 lesson 1.1 pilot seed", () => {
  it("keeps new selected activities unreviewed and inactive", () => {
    const draftIndependent = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);
    const draftGuided = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 100);
    const draftGuidedSeedTwo = buildIm3GraphGuidedSeed2Documents(
      "activities:guided-seed-2" as never,
      100,
    );
    const draftIndependentSeedTwo = buildIm3GraphIndependentSeed2Documents(
      "activities:independent-seed-2" as never,
      100,
    );
    expect(draftIndependent.activity.srsEligible).toBe(false);
    expect(draftGuided.activity.srsEligible).toBe(false);
    expect(draftGuidedSeedTwo.activity.srsEligible).toBe(false);
    expect(draftIndependentSeedTwo.activity.srsEligible).toBe(false);

    const approved = {
      nodeReviewStatus: "approved",
      blueprintReviewStatus: "approved",
    } as const;
    expect(draftIndependent.activity.approval).toEqual({ status: "unreviewed" });
    expect(draftGuided.activity.approval).toEqual({ status: "unreviewed" });
    expect(
      buildIm3GraphGuidedSeed2Documents("activities:guided-seed-2" as never, 100, approved).activity
        .srsEligible,
    ).toBe(true);
    expect(
      buildIm3GraphIndependentSeed2Documents(
        "activities:independent-seed-2" as never,
        100,
        approved,
      ).activity.srsEligible,
    ).toBe(true);
  });

  it("keeps the actual Phase 4 Worked Example 1 solver props schema-valid and ordered", () => {
    const props = stepByStepSolverSchema.parse(IM3_PHASE_FOUR_WORKED_PROPS);

    expect(props.steps).toHaveLength(10);
    expect(new Set(props.steps?.map((step) => step.id)).size).toBe(10);
    expect(props.steps?.every((step) => step.description.trim().length > 0)).toBe(true);
    expect(props.steps?.map((step) => step.expression)).toEqual([
      "x = -2",
      "f(-2) = (-2)^2 = 4",
      "x = -1",
      "f(-1) = (-1)^2 = 1",
      "x = 0",
      "f(0) = 0^2 = 0",
      "x = 1",
      "f(1) = 1^2 = 1",
      "x = 2",
      "f(2) = 2^2 = 4",
    ]);
  });

  it("keeps the actual Phase 5 Worked Example 2 solver props schema-valid and ordered", () => {
    const props = stepByStepSolverSchema.parse(IM3_PHASE_FIVE_WORKED_PROPS);

    expect(props.steps).toHaveLength(5);
    expect(new Set(props.steps?.map((step) => step.id)).size).toBe(5);
    expect(props.steps?.every((step) => step.description.trim().length > 0)).toBe(true);
    expect(props.steps?.map((step) => step.expression)).toEqual([
      "f(x) = x^2 (base parabola)",
      "g(x) = 2x^2",
      "Vertex remains at (0, 0)",
      "Points are twice as far from vertex",
      "Parabola is narrower",
    ]);
  });

  it("keeps the actual Phase 6 Worked Example 3 solver props schema-valid and ordered", () => {
    const props = stepByStepSolverSchema.parse(IM3_PHASE_SIX_WORKED_PROPS);

    expect(props.steps).toHaveLength(6);
    expect(new Set(props.steps?.map((step) => step.id)).size).toBe(6);
    expect(props.steps?.every((step) => step.description.trim().length > 0)).toBe(true);
    expect(props.steps?.map((step) => step.expression)).toEqual([
      "h(t) = -16t^2 + 80t + 4",
      "a = -16, b = 80",
      "t = -b/(2a) = -80/(2·-16) = 80/32 = 2.5",
      "h(2.5) = -16(2.5)^2 + 80(2.5) + 4",
      "h(2.5) = -100 + 200 + 4 = 104",
      "Maximum height: 104 feet at t = 2.5 seconds",
    ]);
  });

  it("keeps the actual Phase 8 Worked Example 4 solver props schema-valid and ordered", () => {
    const props = stepByStepSolverSchema.parse(IM3_PHASE_EIGHT_WORKED_PROPS);

    expect(props.steps).toHaveLength(5);
    expect(new Set(props.steps?.map((step) => step.id)).size).toBe(5);
    expect(props.steps?.every((step) => step.description.trim().length > 0)).toBe(true);
    expect(props.steps?.map((step) => step.expression)).toEqual([
      "f(1) = 1^2 + 3(1) - 4 = 0",
      "f(3) = 3^2 + 3(3) - 4 = 14",
      "Average rate of change = [f(3) - f(1)] / (3 - 1)",
      "= (14 - 0) / 2 = 7",
      "The function increases by 7 units per unit increase in x",
    ]);
  });

  it("keeps the actual Phase 9 Worked Example 5 solver props schema-valid and ordered", () => {
    const props = stepByStepSolverSchema.parse(IM3_PHASE_NINE_WORKED_PROPS);

    expect(props.steps).toHaveLength(4);
    expect(new Set(props.steps?.map((step) => step.id)).size).toBe(4);
    expect(props.steps?.every((step) => step.description.trim().length > 0)).toBe(true);
    expect(props.steps?.map((step) => step.expression)).toEqual([
      "f(5) = 28, f(2) = 7",
      "Average rate of change = [28 - 7] / [5 - 2]",
      "= 21 / 3 = 7",
      "The function increases by 7 units for each unit of x",
    ]);
  });

  it("keeps the actual Phase 11 comprehension quiz props schema-valid and ordered", () => {
    const props = comprehensionQuizSchema.parse(IM3_PHASE_ELEVEN_QUIZ_PROPS);

    expect(props.questions).toHaveLength(2);
    expect(new Set(props.questions.map((question) => question.id)).size).toBe(2);
    expect(props.questions.map((question) => question.prompt)).toEqual([
      "If $a > 1$ in $f(x) = ax^2$, the parabola becomes:",
      "The vertex of $f(x) = (x-3)^2 + 5$ is:",
    ]);
    expect(props.questions.map((question) => question.options)).toEqual([
      ["Wider", "Narrower", "Shifts up", "Shifts down"],
      ["(3, 5)", "(-3, 5)", "(3, -5)", "(-3, -5)"],
    ]);
    expect(props.questions.map((question) => question.correctAnswer)).toEqual([
      "Narrower",
      "(3, 5)",
    ]);
  });

  it("builds stable draft Independent activity, variant, and item documents for idempotent upsert", () => {
    const first = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);
    const second = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);
    const generated = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_PILOT_NODE,
      seed: 0,
      difficulty: 0.5,
    });

    expect(first).toEqual(second);
    expect(first.activity.stableActivityId).toBe(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID);
    expect(first.activity.masteryNodeId).toBe(IM3_PILOT_NODE);
    expect(first.activity.componentKey).toBe("graphing-explorer");
    expect(first.activity.srsEligible).toBe(false);
    expect(first.activity.props).toEqual(generated.data.rendererProps);
    expect(
      Object.keys(first.activity.props).some((key) =>
        /answer|grading|solution|correct|canonical|variantParameters/i.test(key),
      ),
    ).toBe(false);
    expect(first.activity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 2,
      partialCredit: true,
      partIds: ["table_values", "placed_points"],
      rubric: [
        { criteria: "Correct table_values", partId: "table_values", points: 1 },
        { criteria: "Correct placed_points", partId: "placed_points", points: 1 },
      ],
    });
    expect(first.variant.variantKey).toBe(IM3_PILOT_VARIANT_KEY);
    expect(first.variant.objectiveIds).toEqual([IM3_PILOT_NODE]);
    expect(first.item.activityId).toBe("activities:pilot");
  });

  it("freezes the teacher-led curriculum source to the same node and component", () => {
    expect(IM3_TEACHER_LED_ACTIVITY_METADATA).toEqual({
      stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      learningEvidenceMode: "worked_example",
      srsEligible: false,
    });
  });

  it("builds deterministic draft seed-1 Guided documents for the exact pilot node", () => {
    const first = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 100);
    const second = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 100);
    const generated = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_PILOT_NODE,
      seed: 1,
      difficulty: 0.5,
    });

    expect(first).toEqual(second);
    expect(first.activity.stableActivityId).toBe(IM3_GUIDED_PRACTICE_ACTIVITY_ID);
    expect(first.activity.masteryNodeId).toBe(IM3_PILOT_NODE);
    expect(first.activity.componentKey).toBe("graphing-explorer");
    expect(first.activity.props).toEqual(generated.data.rendererProps);
    expect(first.activity.srsEligible).toBe(false);
    expect(
      Object.keys(first.activity.props).some((key) =>
        /answer|solution|correct|canonical|grading|variantParameters/i.test(key),
      ),
    ).toBe(false);
    expect(first.activity.gradingConfig).toEqual({
      autoGrade: true,
      partialCredit: true,
      passingScore: 2,
      partIds: ["table_values", "placed_points"],
      rubric: [
        { criteria: "Correct table_values", partId: "table_values", points: 1 },
        { criteria: "Correct placed_points", partId: "placed_points", points: 1 },
      ],
    });
    expect(first.variant.variantKey).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(first.variant.legacyProblemFamilyId).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(first.variant.objectiveIds).toEqual([IM3_PILOT_NODE]);
    expect(first.item).toMatchObject({
      practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
      activityId: "activities:guided",
      variantKey: IM3_GUIDED_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
      variantLabel: "Seed 1",
    });
  });

  it("builds only the exact generated seed-2 Guided documents for the graph node", () => {
    const seedOne = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 100);
    const seedTwo = buildIm3GraphGuidedSeed2Documents(
      "activities:guided-seed-2" as never,
      100,
      APPROVED_PILOT_PUBLICATION,
    );
    const generatedSeedOne = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_PILOT_NODE,
      seed: 1,
      difficulty: 0.5,
    });
    const generatedSeedTwo = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_PILOT_NODE,
      seed: 2,
      difficulty: 0.5,
    });

    expect(IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID).toBe(`${IM3_GUIDED_PRACTICE_ACTIVITY_ID}:seed-2`);
    expect(IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY).toBe(`${IM3_GUIDED_PRACTICE_ACTIVITY_ID}:seed-2`);
    expect(seedTwo.activity.stableActivityId).toBe(IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID);
    expect(seedTwo.activity.masteryNodeId).toBe(IM3_PILOT_NODE);
    expect(seedTwo.activity.componentKey).toBe("graphing-explorer");
    expect(seedTwo.activity.srsEligible).toBe(true);
    expect(seedTwo.activity.displayName).toBe(seedOne.activity.displayName);
    expect(seedTwo.activity.description).toBe(
      "Complete the table and plot the points for the quadratic.",
    );
    expect(seedTwo.activity.props).toEqual(generatedSeedTwo.data.rendererProps);
    expect(seedTwo.activity.gradingConfig).toEqual({
      autoGrade: true,
      partialCredit: true,
      passingScore: 2,
      partIds: Object.keys(generatedSeedTwo.expectedAnswer),
      rubric: Object.keys(generatedSeedTwo.expectedAnswer).map((partId) => ({
        criteria: `Correct ${partId}`,
        partId,
        points: generatedSeedTwo.gradingMetadata.partMaxScores[partId],
      })),
    });
    expect(seedTwo.variant).toMatchObject({
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      componentKey: "graphing-explorer",
      objectiveIds: [IM3_PILOT_NODE],
      metadata: { stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID },
    });
    expect(seedTwo.variant.displayName).toBe(seedOne.variant.displayName);
    expect(seedTwo.variant.description).toBe(seedOne.variant.description);
    expect(seedTwo.item).toMatchObject({
      practiceItemId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      activityId: "activities:guided-seed-2",
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      variantLabel: "Seed 2",
    });
    expect((seedOne.activity.props as { equation: string }).equation).toBe("y = x^2 - x - 2");
    expect((seedTwo.activity.props as { equation: string }).equation).toBe("y = -x^2 + x - 1");
    expect(generatedSeedTwo.data.tableValues).not.toEqual(generatedSeedOne.data.tableValues);
    const seedOneCoefficients = generatedSeedOne.data as { a: number; b: number; c: number };
    const seedTwoCoefficients = generatedSeedTwo.data as { a: number; b: number; c: number };
    const seedOneVertex =
      seedOneCoefficients.c - seedOneCoefficients.b ** 2 / (4 * seedOneCoefficients.a);
    const seedTwoVertex =
      seedTwoCoefficients.c - seedTwoCoefficients.b ** 2 / (4 * seedTwoCoefficients.a);
    expect(seedTwoVertex).not.toBe(seedOneVertex);
  });

  it("builds only the exact generated seed-2 Independent documents for the graph node", () => {
    const seedZero = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);
    const seedTwo = buildIm3GraphIndependentSeed2Documents(
      "activities:independent-seed-2" as never,
      100,
      APPROVED_PILOT_PUBLICATION,
    );
    const generatedSeedTwo = getGenerator("quadratic-graph-analysis").generate({
      nodeId: IM3_PILOT_NODE,
      seed: 3,
      difficulty: 0.5,
    });

    expect(IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID).toBe(
      `${IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}:seed-2`,
    );
    expect(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY).toBe(
      `${IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}:seed-2`,
    );
    expect(seedTwo.activity).toMatchObject({
      componentKey: "graphing-explorer",
      displayName: seedZero.activity.displayName,
      description: "Complete the table and plot the points for the quadratic.",
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
      createdAt: 100,
      updatedAt: 100,
    });
    expect(seedTwo.activity.props).toEqual(generatedSeedTwo.data.rendererProps);
    expect((seedTwo.activity.props as { equation: string }).equation).toBe("y = x^2 - x + 2");
    expect(seedTwo.activity.gradingConfig).toEqual({
      autoGrade: true,
      partialCredit: true,
      passingScore: 2,
      partIds: ["table_values", "placed_points"],
      rubric: [
        { criteria: "Correct table_values", partId: "table_values", points: 1 },
        { criteria: "Correct placed_points", partId: "placed_points", points: 1 },
      ],
    });
    expect(seedTwo.activity.displayName.toLowerCase()).not.toContain("seed");
    expect(seedTwo.activity.displayName.toLowerCase()).not.toContain("pilot");
    expect(seedTwo.activity.description.toLowerCase()).not.toContain("seed");
    expect(seedTwo.activity.description.toLowerCase()).not.toContain("pilot");
    expect(seedTwo.variant).toMatchObject({
      variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      componentKey: "graphing-explorer",
      displayName: "Graph quadratic functions",
      description: "Complete a quadratic table and plot the points.",
      objectiveIds: [IM3_PILOT_NODE],
      metadata: { stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID },
    });
    expect(seedTwo.variant.displayName.toLowerCase()).not.toContain("seed");
    expect(seedTwo.variant.displayName.toLowerCase()).not.toContain("pilot");
    expect(seedTwo.variant.description.toLowerCase()).not.toContain("seed");
    expect(seedTwo.variant.description.toLowerCase()).not.toContain("pilot");
    expect(seedTwo.item).toEqual({
      practiceItemId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      activityId: "activities:independent-seed-2",
      variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2",
      sourceTimestamp: 100,
      variantLabel: "Seed 2",
    });
    expect(generatedSeedTwo.data.tableValues).toEqual([
      { x: -2, y: 8 },
      { x: -1, y: 4 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
    ]);
    expect(generatedSeedTwo.expectedAnswer).toEqual({
      table_values: [
        { x: -2, y: 8 },
        { x: -1, y: 4 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
      ],
      placed_points: [
        { x: -2, y: 8 },
        { x: -1, y: 4 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
      ],
    });
  });

  it("upserts only the exact Independent seed-2 activity and preserves seed 0", async () => {
    const operations: string[] = [];
    const activityId = "activities:independent-seed-2";
    let storedActivity: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                unique: async () => storedActivity && { ...storedActivity, _id: storedId },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedActivity = document;
          storedId = activityId;
          return activityId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedActivity = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GraphIndependentSeed2Activity(ctx, 100);
    const secondId = await upsertIm3GraphIndependentSeed2Activity(ctx, 200);
    const expected = buildIm3GraphIndependentSeed2Documents(activityId as never, 200).activity;
    const base = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);

    expect(firstId).toBe(activityId);
    expect(secondId).toBe(activityId);
    expect(storedActivity).toEqual(expected);
    expect(storedActivity?.stableActivityId).toBe(IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID);
    expect(storedActivity?.masteryNodeId).toBe(IM3_PILOT_NODE);
    expect(storedActivity?.componentKey).toBe("graphing-explorer");
    expect(storedActivity?.props).toEqual(expected.props);
    expect(storedActivity?.srsEligible).toBe(false);
    expect(base.activity.stableActivityId).toBe(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID);
    expect(base.variant.variantKey).toBe(IM3_PILOT_VARIANT_KEY);
    expect(base.item.practiceItemId).toBe(`${IM3_PILOT_VARIANT_KEY}:pilot`);
    expect(operations).toEqual([
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}`,
      "insert:activities",
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}`,
      `patch:${activityId}`,
    ]);
  });

  it("upserts only the exact Independent seed-2 variant", async () => {
    const operations: string[] = [];
    const variantId = "practice_variants:independent-seed-2";
    let storedVariant: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                unique: async () => storedVariant && { ...storedVariant, _id: storedId },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedVariant = document;
          storedId = variantId;
          return variantId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedVariant = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GraphIndependentSeed2Variant(ctx, 100);
    const secondId = await upsertIm3GraphIndependentSeed2Variant(ctx, 200);
    const expected = buildIm3GraphIndependentSeed2Documents(
      "activities:pending" as never,
      200,
    ).variant;

    expect(firstId).toBe(variantId);
    expect(secondId).toBe(variantId);
    expect(storedVariant).toEqual(expected);
    expect(storedVariant?.variantKey).toBe(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY);
    expect(storedVariant?.legacyProblemFamilyId).toBe(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY);
    expect(storedVariant?.objectiveIds).toEqual([IM3_PILOT_NODE]);
    expect(storedVariant?.metadata).toEqual({
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
    });
    expect(operations).toEqual([
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY}`,
      "insert:practice_variants",
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY}`,
      `patch:${variantId}`,
    ]);
  });

  it("upserts only the exact Independent seed-2 practice item", async () => {
    const operations: string[] = [];
    const activityId = "activities:independent-seed-2";
    const itemId = "practice_items:independent-seed-2";
    let storedItem: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                take: async () => (storedItem ? [{ ...storedItem, _id: storedId }] : []),
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedItem = document;
          storedId = itemId;
          return itemId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedItem = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GraphIndependentSeed2PracticeItem(ctx, activityId as never, 100);
    const secondId = await upsertIm3GraphIndependentSeed2PracticeItem(
      ctx,
      activityId as never,
      200,
    );
    const expected = buildIm3GraphIndependentSeed2Documents(activityId as never, 200).item;

    expect(firstId).toBe(itemId);
    expect(secondId).toBe(itemId);
    expect(storedItem).toEqual(expected);
    expect(storedItem?.practiceItemId).toBe(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY);
    expect(storedItem?.variantKey).toBe(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY);
    expect(storedItem?.activityId).toBe(activityId);
    expect(storedItem?.variantLabel).toBe("Seed 2");
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY}`,
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY}`,
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      `patch:${itemId}`,
    ]);
  });

  it("rejects duplicate or conflicting Independent seed-2 items before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:independent-seed-2";
    let rows: Record<string, unknown>[] = [
      {
        _id: "practice_items:independent-seed-2-1",
        practiceItemId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        activityId,
        variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        variantLabel: "Seed 2",
      },
      {
        _id: "practice_items:independent-seed-2-2",
        practiceItemId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        activityId,
        variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        variantLabel: "Seed 2",
      },
    ];
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
              return { take: async () => rows };
            },
          };
        },
        insert: async (table: string, _document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          return "practice_items:unexpected";
        },
        patch: async (id: string, _document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
        },
      },
    } as never;

    await expect(
      upsertIm3GraphIndependentSeed2PracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow(
      "Duplicate or conflicting IM3 graph Independent seed-2 practice-item mapping",
    );
    rows = [
      {
        _id: "practice_items:independent-seed-2-conflict",
        practiceItemId: "wrong-item",
        activityId,
        variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        variantLabel: "Seed 2",
      },
    ];
    await expect(
      upsertIm3GraphIndependentSeed2PracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow(
      "Duplicate or conflicting IM3 graph Independent seed-2 practice-item mapping",
    );

    expect(operations.some((operation) => /^(insert|patch):/.test(operation))).toBe(false);
  });

  it("upserts only the exact Guided activity row", async () => {
    const operations: string[] = [];
    const activityId = "activities:guided";
    let storedActivity: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                unique: async () => storedActivity && { ...storedActivity, _id: storedId },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedActivity = document;
          storedId = activityId;
          return activityId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedActivity = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GuidedPilotActivity(ctx, 100);
    const secondId = await upsertIm3GuidedPilotActivity(ctx, 200);
    const expected = buildIm3GuidedPilotSeedDocuments(activityId as never, 200).activity;

    expect(firstId).toBe(activityId);
    expect(secondId).toBe(activityId);
    expect(storedActivity).toEqual(expected);
    expect(storedActivity?.stableActivityId).toBe(IM3_GUIDED_PRACTICE_ACTIVITY_ID);
    expect(storedActivity?.masteryNodeId).toBe(IM3_PILOT_NODE);
    expect(storedActivity?.componentKey).toBe("graphing-explorer");
    expect(storedActivity?.props).toEqual(expected.props);
    expect(storedActivity?.gradingConfig).toEqual(expected.gradingConfig);
    expect(storedActivity?.srsEligible).toBe(false);
    expect(operations).toEqual([
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_GUIDED_PRACTICE_ACTIVITY_ID}`,
      "insert:activities",
      "query:activities",
      "index:by_stable_activity_id",
      `eq:stableActivityId:${IM3_GUIDED_PRACTICE_ACTIVITY_ID}`,
      `patch:${activityId}`,
    ]);
  });

  it("upserts only the exact Guided practice variant", async () => {
    const operations: string[] = [];
    const variantId = "practice_variants:guided";
    let storedVariant: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                unique: async () => storedVariant && { ...storedVariant, _id: storedId },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedVariant = document;
          storedId = variantId;
          return variantId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedVariant = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GuidedPilotVariant(ctx, 100);
    const secondId = await upsertIm3GuidedPilotVariant(ctx, 200);
    const expected = buildIm3GuidedPilotSeedDocuments("activities:pending" as never, 200).variant;

    expect(firstId).toBe(variantId);
    expect(secondId).toBe(variantId);
    expect(storedVariant).toEqual(expected);
    expect(storedVariant?.variantKey).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(storedVariant?.legacyProblemFamilyId).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(storedVariant?.componentKey).toBe("graphing-explorer");
    expect(storedVariant?.objectiveIds).toEqual([IM3_PILOT_NODE]);
    expect(storedVariant?.metadata).toEqual({
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
    });
    expect(operations).toEqual([
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GUIDED_VARIANT_KEY}`,
      "insert:practice_variants",
      "query:practice_variants",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GUIDED_VARIANT_KEY}`,
      `patch:${variantId}`,
    ]);
  });

  it("upserts only the exact Guided practice item", async () => {
    const operations: string[] = [];
    const activityId = "activities:guided";
    const itemId = "practice_items:guided";
    let storedItem: Record<string, unknown> | undefined;
    let storedId: string | undefined;
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
                take: async () => (storedItem ? [{ ...storedItem, _id: storedId }] : []),
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          storedItem = document;
          storedId = itemId;
          return itemId;
        },
        patch: async (id: string, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          storedItem = document;
          storedId = id;
        },
      },
    } as never;

    const firstId = await upsertIm3GuidedPilotPracticeItem(ctx, activityId as never, 100);
    const secondId = await upsertIm3GuidedPilotPracticeItem(ctx, activityId as never, 200);
    const expected = buildIm3GuidedPilotSeedDocuments(activityId as never, 200).item;

    expect(firstId).toBe(itemId);
    expect(secondId).toBe(itemId);
    expect(storedItem).toEqual(expected);
    expect(storedItem?.practiceItemId).toBe(`${IM3_GUIDED_VARIANT_KEY}:seed-1`);
    expect(storedItem?.variantKey).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(storedItem?.legacyProblemFamilyId).toBe(IM3_GUIDED_VARIANT_KEY);
    expect(storedItem?.activityId).toBe(activityId);
    expect(storedItem?.variantLabel).toBe("Seed 1");
    expect(operations).toEqual([
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GUIDED_VARIANT_KEY}`,
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      "insert:practice_items",
      "query:practice_items",
      "index:by_variantKey",
      `eq:variantKey:${IM3_GUIDED_VARIANT_KEY}`,
      "query:practice_items",
      "index:by_activityId",
      `eq:activityId:${activityId}`,
      `patch:${itemId}`,
    ]);
  });

  it("rejects duplicate or conflicting Guided practice items before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:guided";
    let rows: Record<string, unknown>[] = [
      {
        _id: "practice_items:guided-1",
        practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
        activityId,
        variantKey: IM3_GUIDED_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
        variantLabel: "Seed 1",
      },
      {
        _id: "practice_items:guided-2",
        practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
        activityId,
        variantKey: IM3_GUIDED_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
        variantLabel: "Seed 1",
      },
    ];
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
                take: async () => rows,
              };
            },
          };
        },
        insert: async (table: string, _document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          return "practice_items:unexpected";
        },
        patch: async (id: string, _document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
        },
      },
    } as never;

    await expect(upsertIm3GuidedPilotPracticeItem(ctx, activityId as never, 100)).rejects.toThrow(
      "Duplicate or conflicting IM3 Guided practice-item mapping",
    );
    rows = [
      {
        _id: "practice_items:conflict",
        practiceItemId: "wrong-item",
        activityId,
        variantKey: IM3_GUIDED_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
        variantLabel: "Seed 1",
      },
    ];
    await expect(upsertIm3GuidedPilotPracticeItem(ctx, activityId as never, 100)).rejects.toThrow(
      "Duplicate or conflicting IM3 Guided practice-item mapping",
    );

    expect(operations.some((operation) => /^(insert|patch):/.test(operation))).toBe(false);
  });

  it("rejects duplicate or conflicting graph Guided seed-2 items before writes", async () => {
    const operations: string[] = [];
    const activityId = "activities:guided-seed-2";
    const rows: Record<string, unknown>[] = [
      {
        _id: "practice_items:graph-guided-seed-2-1",
        practiceItemId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        activityId,
        variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        variantLabel: "Seed 2",
      },
      {
        _id: "practice_items:graph-guided-seed-2-2",
        practiceItemId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        activityId,
        variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        variantLabel: "Seed 2",
      },
    ];
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
              return { take: async () => rows };
            },
          };
        },
        insert: async (table: string, _document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          return "practice_items:unexpected";
        },
        patch: async (id: string, _document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
        },
      },
    } as never;

    await expect(
      upsertIm3GraphGuidedSeed2PracticeItem(ctx, activityId as never, 100),
    ).rejects.toThrow("Duplicate or conflicting IM3 graph Guided seed-2 practice-item mapping");
    expect(operations.some((operation) => /^(insert|patch):/.test(operation))).toBe(false);
  });
});
