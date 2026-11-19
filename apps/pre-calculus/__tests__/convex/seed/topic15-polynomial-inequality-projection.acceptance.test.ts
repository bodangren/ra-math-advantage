import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";
import type { KnowledgeBlueprint } from "@math-platform/knowledge-space-practice";
import { polynomialInequalitySignChartSchema } from "@math-platform/math-content";
import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, "../../../curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts";
const SOURCE_ID = "math.precalc.example.1.5.003";
const RENDERER_KEY = "polynomial-inequality-sign-chart";
const GENERATOR_KEY = "topic15-polynomial-inequality-sign-chart";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const EXAMPLE_ONE_NODE_ID =
  "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form";
const EXAMPLE_TWO_NODE_ID =
  "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs";
const PLACEHOLDER_NODE_IDS = [
  "math.precalc.skill.1.5.find-zeros-with-multiplicity-and-graph-behavior",
  "math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem",
] as const;

type JsonDocument = {
  activities?: Array<Record<string, unknown>>;
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  inputs?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
  srsInputs?: Array<Record<string, unknown>>;
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
  "isCorrect",
  "leastDegree",
  "normalizedAnswer",
  "score",
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

describe("Topic 1.5 Example 3 polynomial-inequality projections", () => {
  it("matches fresh activity and SRS projection output for the exact sign-chart node", () => {
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
    expect(actualActivities.map((row) => row.alignmentNodeIds)).toEqual(
      Array.from({ length: 3 }, () => ["math.standard.ccss.hsa-apr-b-3"]),
    );
    expect(actualActivities.every((row) => row.rendererKey === RENDERER_KEY)).toBe(true);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual(
      Array.from({ length: 3 }, () => expectedActivities[0]!.gradingConfig),
    );

    const workedOutput = generateTopic15PolynomialInequalityOutput(0);
    const guidedOutput = generateTopic15PolynomialInequalityOutput(1);
    const independentOutput = generateTopic15PolynomialInequalityOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "The solution is (-4, -1) ∪ (3, ∞).",
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "guided_practice",
      guidedSteps: [
        "Find and sort the distinct real roots.",
        "Test one value in each interval and record the sign.",
        "Use the inequality operator to write the interval union.",
      ],
      fieldHelp: {
        roots: "Enter the sorted distinct real roots.",
        intervalSigns: "Enter one sign for each interval from left to right.",
        solution: "Write the solution as an interval union.",
      },
    };
    const independentProps = independentOutput.data.rendererProps;
    expect(actualActivities.map((row) => row.props)).toEqual([
      workedProps,
      guidedProps,
      independentProps,
    ]);
    for (const row of actualActivities) {
      expect(polynomialInequalitySignChartSchema.safeParse(row.props).success).toBe(true);
    }
    expect(actualActivities[0]!.props).toMatchObject({
      prompt: "Solve (x - 3)(x + 1)(x + 4) > 0.",
      expression: "(x - 3)(x + 1)(x + 4)",
      operator: ">",
      distinctRootCount: 3,
      correctAnswers: {
        roots: [-4, -1, 3],
        intervalSigns: ["-", "+", "-", "+"],
        solution: "(-4, -1) ∪ (3, ∞)",
      },
      finalAnswer: "The solution is (-4, -1) ∪ (3, ∞).",
    });
    expectNoAuthority(
      Object.fromEntries(
        Object.entries(actualActivities[1]!.props as Record<string, unknown>).filter(
          ([key]) => key !== "fieldHelp",
        ),
      ),
    );
    expectNoAuthority(actualActivities[2]!.props);

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

  it("preserves accepted Example 1, Example 2, and broad placeholder projections", () => {
    const document = readJson("projection/practice-v1-activity-map.json");
    const activities = document.activities!;
    const srsInputs = document.srsInputs!;
    for (const nodeId of [EXAMPLE_ONE_NODE_ID, EXAMPLE_TWO_NODE_ID]) {
      expect(activities.filter((row) => row.nodeId === nodeId).map((row) => row.mode)).toEqual(
        MODES,
      );
    }
    for (const placeholderId of PLACEHOLDER_NODE_IDS) {
      const rows = activities.filter((row) => row.nodeId === placeholderId);
      expect(rows.map((row) => row.mode)).toEqual(["worked_example", "guided_practice"]);
      expect(rows.every((row) => row.srsEligible === false)).toBe(true);
      expect(srsInputs.filter((row) => row.nodeId === placeholderId)).toHaveLength(1);
    }
  });
});
