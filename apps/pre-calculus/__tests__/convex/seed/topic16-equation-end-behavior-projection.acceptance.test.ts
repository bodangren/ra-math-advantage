import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
  SrsProjectionEntry,
} from "@math-platform/knowledge-space-practice";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";
import { getPropsSchema } from "@math-platform/math-content/schemas";
import { polynomialEquationEndBehaviorSchema } from "@math-platform/math-content/schemas";
import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const SOURCE_ID = "math.precalc.example.1.6.003";
const ALIGNMENT_IDS = ["math.standard.ccss.hsf-if-b-4", "math.standard.ccss.hsf-if-c-7c"] as const;
const RENDERER_KEY = "polynomial-equation-end-behavior";
const GENERATOR_KEY = "topic16-equation-end-behavior";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Record whether each left and right end goes up or down.",
] as const;

type StoredSrsRow = SrsProjectionEntry & {
  apTopic?: unknown;
  calculatorRequired?: unknown;
  frqTaskModel?: unknown;
};

type ProjectionDocument = {
  activities?: ProjectedActivity[];
  inputs?: StoredSrsRow[];
  srsInputs?: SrsProjectionEntry[];
};

type GraphDocument = {
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): ProjectionDocument & GraphDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as ProjectionDocument &
    GraphDocument;
}

describe("Topic 1.6 Example 3 equation-end-behavior projections", () => {
  it("stores exact projector output with readiness", () => {
    const nodesDocument = readJson("nodes.json");
    const nodes = nodesDocument.nodes! as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const blueprints = readJson("blueprints.json").blueprints!;
    const activityDocument = readJson("projection/practice-v1-activity-map.json");
    const standaloneDocument = readJson("projection/srs-input.json");

    const expectedActivities = projectActivityMap(nodes, edges, blueprints);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints);
    const actualActivities = activityDocument.activities!;
    const actualCombinedSrs = activityDocument.srsInputs!;
    const actualStandaloneSrs = standaloneDocument.inputs!;
    const expectedTargetActivities = expectedActivities.filter((row) => row.nodeId === NODE_ID);
    const actualTargetActivities = actualActivities.filter((row) => row.nodeId === NODE_ID);
    const expectedTargetSrs = expectedSrs.filter((row) => row.nodeId === NODE_ID);
    const actualTargetCombinedSrs = actualCombinedSrs.filter((row) => row.nodeId === NODE_ID);
    const actualTargetStandaloneSrs = actualStandaloneSrs.filter((row) => row.nodeId === NODE_ID);

    expect(expectedTargetActivities).toHaveLength(3);
    expect(actualTargetActivities).toHaveLength(3);
    expect(actualTargetActivities).toEqual(expectedTargetActivities);
    expect(actualTargetActivities.map((row) => row.mode)).toEqual(MODES);
    expect(actualTargetActivities.map((row) => row.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    for (const row of actualTargetActivities) expect(row.sourceNodeIds).toContain(SOURCE_ID);
    expect(actualTargetActivities.map((row) => row.alignmentNodeIds)).toEqual(
      Array.from({ length: 3 }, () => [...ALIGNMENT_IDS]),
    );
    expect(actualTargetActivities.every((row) => row.rendererKey === RENDERER_KEY)).toBe(true);
    expect(actualTargetActivities.map((row) => row.gradingConfig.partIds)).toEqual(
      Array.from({ length: 3 }, () => PART_IDS),
    );
    expect(actualTargetActivities.map((row) => row.gradingConfig.passingScore)).toEqual([
      12, 12, 12,
    ]);
    expect(actualTargetActivities.map((row) => row.gradingConfig.partialCredit)).toEqual([
      true,
      true,
      true,
    ]);
    expect(actualTargetActivities.every((row) => row.gradingConfig.rubric === undefined)).toBe(
      true,
    );
    expect(actualTargetActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);

    const workedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const guidedOutput = generateTopic16EquationEndBehaviorOutput(1);
    const independentOutput = generateTopic16EquationEndBehaviorOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "The six polynomial end behaviors are shown above.",
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "guided_practice",
      guidedSteps: GUIDED_STEPS,
      fieldHelp: "Choose Up or Down for the left and right end of each polynomial.",
    };
    const independentProps = independentOutput.data.rendererProps;
    expect(actualTargetActivities.map((row) => row.props)).toEqual([
      workedProps,
      guidedProps,
      independentProps,
    ]);
    expect(Object.keys(actualTargetActivities[1]!.props).sort()).toEqual([
      "fieldHelp",
      "guidedSteps",
      "items",
      "presentationMode",
      "prompt",
    ]);
    expect(Object.keys(actualTargetActivities[2]!.props).sort()).toEqual([
      "items",
      "presentationMode",
      "prompt",
    ]);
    for (const row of actualTargetActivities) {
      expect(polynomialEquationEndBehaviorSchema.safeParse(row.props).success).toBe(true);
      expect(getPropsSchema(RENDERER_KEY)).toBe(polynomialEquationEndBehaviorSchema);
    }

    expect(expectedTargetSrs).toHaveLength(1);
    expect(actualTargetCombinedSrs).toHaveLength(1);
    expect(actualTargetCombinedSrs).toEqual(expectedTargetSrs);
    expect(actualTargetCombinedSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      blueprintId: `${NODE_ID}.blueprint`,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualTargetStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualTargetStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedTargetSrs[0]);
    expect(actualTargetStandaloneSrs[0]).toMatchObject({
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });

    const expectedNonTargetActivities = expectedActivities.filter((row) => row.nodeId !== NODE_ID);
    const actualNonTargetActivities = actualActivities.filter((row) => row.nodeId !== NODE_ID);
    expect(actualNonTargetActivities).toHaveLength(expectedNonTargetActivities.length);
    for (const nodeId of new Set(expectedNonTargetActivities.map((row) => row.nodeId))) {
      expect(
        actualNonTargetActivities.filter((row) => row.nodeId === nodeId).map((row) => row.mode),
      ).toEqual(
        expectedNonTargetActivities.filter((row) => row.nodeId === nodeId).map((row) => row.mode),
      );
    }
    expect(actualNonTargetActivities).toHaveLength(178);
    expect(actualCombinedSrs.filter((row) => row.nodeId !== NODE_ID)).toHaveLength(83);
    expect(actualStandaloneSrs.filter((row) => row.nodeId !== NODE_ID)).toHaveLength(83);
    expect(actualActivities).toHaveLength(181);
    expect(actualCombinedSrs).toHaveLength(84);
    expect(actualStandaloneSrs).toHaveLength(84);
    expect(new Set(actualActivities.map((row) => row.stableActivityId)).size).toBe(
      actualActivities.length,
    );

    const targetNode = nodesDocument.nodes!.filter((node) => node.id === NODE_ID);
    expect(targetNode).toHaveLength(1);
    expect(targetNode[0]?.independentPracticeReady).toBe(true);
  });
});
