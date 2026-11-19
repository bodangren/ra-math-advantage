import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";
import type { KnowledgeBlueprint } from "@math-platform/knowledge-space-practice";
import { leastPolynomialDegreeSchema } from "@math-platform/math-content";
import { generateTopic15LeastPolynomialDegreeOutput } from "@math-platform/math-content/knowledge-space";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, "../../../curriculum/skill-graph");
const NODE_ID =
  "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs";
const SOURCE_ID = "math.precalc.example.1.5.002";
const RENDERER_KEY = "least-polynomial-degree";
const GENERATOR_KEY = "topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const EXAMPLE_ONE_NODE_ID =
  "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form";
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

const AUTHORITY_KEYS = [
  "answer",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "expectedAnswer",
  "grading",
  "gradingMetadata",
  "leastDegree",
  "normalizedAnswer",
  "solution",
  "solutionSteps",
  "steps",
  "finalAnswer",
  "authority",
] as const;

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe("Topic 1.5 Example 2 least-degree projections", () => {
  it("matches fresh projector output for activities and both SRS surfaces", () => {
    const document = readJson("projection/practice-v1-activity-map.json");
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
    const actualActivities = document.activities!.filter((row) => row.nodeId === NODE_ID);
    const actualSrs = document.srsInputs!.filter((row) => row.nodeId === NODE_ID);
    const standalone = readJson("projection/srs-input.json");
    const actualStandalone = standalone.inputs!.filter((row) => row.nodeId === NODE_ID);

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

    const liveOutputs = [0, 1, 2].map((seed) => generateTopic15LeastPolynomialDegreeOutput(seed));
    const guidedProps = {
      ...(liveOutputs[1]!.data.rendererProps as Record<string, unknown>),
      presentationMode: "guided_practice",
      guidedSteps: ["Identify the conjugate zero.", "Count the conjugate pair and the real zeros."],
      fieldHelp: "Add 2 for the conjugate pair to the number of real zeros.",
    };
    expect(actualActivities.map((row) => row.props)).toEqual([
      {
        ...(liveOutputs[0]!.data.rendererProps as Record<string, unknown>),
        presentationMode: "worked_example",
        correctAnswer: 5,
        steps: liveOutputs[0]!.solutionSteps.map((step) => step.description),
        finalAnswer: "The least possible degree is 5.",
      },
      guidedProps,
      liveOutputs[2]!.data.rendererProps,
    ]);
    for (const row of actualActivities) {
      expect(leastPolynomialDegreeSchema.safeParse(row.props).success).toBe(true);
    }
    expectNoAuthority(actualActivities[1]!.props);
    expectNoAuthority(actualActivities[2]!.props);
    expect(actualActivities[0]!.props).toMatchObject({
      prompt: liveOutputs[0]!.prompt,
      givenNonrealZero: "i√3",
      realZeroCount: 3,
      correctAnswer: 5,
    });
    expect(actualActivities[1]!.props).toEqual(guidedProps);
    expect(actualActivities[2]!.props).toEqual(liveOutputs[2]!.data.rendererProps);

    expect(expectedSrs).toHaveLength(1);
    expect(actualSrs).toEqual(expectedSrs);
    expect(actualSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      blueprintId: `${NODE_ID}.blueprint`,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandalone).toHaveLength(1);
    const standaloneCore = actualStandalone[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandalone[0]).toMatchObject({
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });

    expect(new Set(document.activities!.map((row) => row.stableActivityId)).size).toBe(
      document.activities!.length,
    );
  });

  it("keeps Example 1 and the broad Topic 1.5 placeholder projections", () => {
    const document = readJson("projection/practice-v1-activity-map.json");
    const activities = document.activities!;
    const srsInputs = document.srsInputs!;

    expect(
      activities.filter((row) => row.nodeId === EXAMPLE_ONE_NODE_ID).map((row) => row.mode),
    ).toEqual(MODES);
    for (const placeholderId of PLACEHOLDER_NODE_IDS) {
      const rows = activities.filter((row) => row.nodeId === placeholderId);
      expect(rows.map((row) => row.mode)).toEqual(["worked_example", "guided_practice"]);
      expect(rows.every((row) => row.srsEligible === false)).toBe(true);
      expect(srsInputs.filter((row) => row.nodeId === placeholderId)).toHaveLength(1);
    }
  });
});
