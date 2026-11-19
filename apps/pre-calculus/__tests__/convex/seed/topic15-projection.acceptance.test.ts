import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";
import { realZerosAndMultiplicitiesSchema } from "@math-platform/math-content";
import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";
import type { KnowledgeBlueprint } from "@math-platform/knowledge-space-practice";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form";
const SOURCE_ID = "math.precalc.example.1.5.001";
const RENDERER_KEY = "real-zeros-and-multiplicities";
const GENERATOR_KEY = "topic15-real-zeros-and-multiplicities-from-factored-form";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const PLACEHOLDER_NODE_IDS = [
  "math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior",
  "math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem",
] as const;

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
  blueprints?: KnowledgeBlueprint[];
  activities?: Array<Record<string, unknown>>;
  srsInputs?: Array<Record<string, unknown>>;
  inputs?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect([
      "answer",
      "answerKey",
      "correctAnswer",
      "correctAnswers",
      "expectedAnswer",
      "grading",
      "gradingMetadata",
      "solution",
      "solutionSteps",
      "steps",
      "finalAnswer",
      "authority",
    ]).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe("Topic 1.5 Example 1 activity and SRS projections", () => {
  it("matches exact projector output for the three activity modes and both SRS surfaces", () => {
    const nodes = readJson("nodes.json").nodes! as unknown as Parameters<
      typeof projectActivityMap
    >[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const blueprints = readJson("blueprints.json").blueprints!;
    const expectedActivities = projectActivityMap(nodes, edges, blueprints).filter(
      (row) => row.nodeId === NODE_ID,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints).filter(
      (row) => row.nodeId === NODE_ID,
    );
    const activityProjection = readJson("projection/practice-v1-activity-map.json");
    const standaloneProjection = readJson("projection/srs-input.json");
    const actualActivities = activityProjection.activities!.filter((row) => row.nodeId === NODE_ID);
    const actualCombinedSrs = activityProjection.srsInputs!.filter((row) => row.nodeId === NODE_ID);
    const actualStandaloneSrs = standaloneProjection.inputs!.filter(
      (row) => row.nodeId === NODE_ID,
    );

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual(MODES);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    for (const row of actualActivities) expect(row.sourceNodeIds).toContain(SOURCE_ID);
    expect(actualActivities.every((row) => row.rendererKey === RENDERER_KEY)).toBe(true);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual(
      Array.from({ length: 3 }, () => expectedActivities[0]!.gradingConfig),
    );
    for (const row of actualActivities) {
      expect(realZerosAndMultiplicitiesSchema.safeParse(row.props).success).toBe(true);
    }

    const liveOutputs = [0, 1, 2].map((seed) =>
      generateTopic15RealZerosAndMultiplicitiesOutput(seed),
    );
    expect(actualActivities.map((row) => row.props)).toEqual([
      {
        ...(liveOutputs[0]!.data.rendererProps as Record<string, unknown>),
        presentationMode: "worked_example",
        correctAnswers: liveOutputs[0]!.expectedAnswer,
        steps: liveOutputs[0]!.solutionSteps.map((step) => step.description),
        finalAnswer:
          "For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).",
      },
      {
        ...(liveOutputs[1]!.data.rendererProps as Record<string, unknown>),
        presentationMode: "guided_practice",
        guidedSteps: [
          "Identify each factor that can make the function equal zero.",
          "Count the repeated factors for each zero.",
        ],
        fieldHelp: "List the zeros in ascending order and give the multiplicity of each zero.",
      },
      liveOutputs[2]!.data.rendererProps,
    ]);
    expectNoAuthority(actualActivities[1]!.props);
    expectNoAuthority(actualActivities[2]!.props);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual(
      Array.from({ length: 3 }, () => ({
        partIds: ["a", "b"],
        passingScore: 2,
        partialCredit: true,
        rubric: [
          {
            criteria: "Identify all real zeros and their multiplicities for f.",
            points: 1,
            partId: "a",
          },
          {
            criteria: "Identify all real zeros and their multiplicities for g.",
            points: 1,
            partId: "b",
          },
        ],
      })),
    );
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      blueprintId: `${NODE_ID}.blueprint`,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(new Set(activityProjection.activities!.map((row) => row.stableActivityId)).size).toBe(
      activityProjection.activities!.length,
    );
    expect(new Set(actualCombinedSrs.map((row) => row.nodeId)).size).toBe(1);
  });

  it("keeps both broad Topic 1.5 placeholder projections intact", () => {
    const actualActivities = readJson("projection/practice-v1-activity-map.json").activities!;
    const actualSrs = readJson("projection/practice-v1-activity-map.json").srsInputs!;
    for (const placeholderId of PLACEHOLDER_NODE_IDS) {
      const rows = actualActivities.filter((row) => row.nodeId === placeholderId);
      expect(rows.map((row) => row.stableActivityId)).toEqual([
        `${placeholderId}.worked_example`,
        `${placeholderId}.guided_practice`,
      ]);
      expect(rows.every((row) => row.srsEligible === false)).toBe(true);
      expect(actualSrs.filter((row) => row.nodeId === placeholderId)).toHaveLength(1);
    }
  });
});
