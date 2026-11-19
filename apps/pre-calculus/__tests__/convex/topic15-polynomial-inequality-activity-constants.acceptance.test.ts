import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
} from "@math-platform/knowledge-space-practice";
import { projectActivityMap } from "@math-platform/knowledge-space-practice";

const GRAPH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../curriculum/skill-graph",
);
const SOURCE_NODE_ID = "math.precalc.example.1.5.003";
const ALIGNMENT_NODE_IDS = ["math.standard.ccss.hsa-apr-b-3"] as const;
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;
const ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
] as const;

type JsonDocument = {
  activities?: ProjectedActivity[];
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
  srsInputs?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

describe("Topic 1.5 polynomial-inequality activity constants", () => {
  it("defines exact identities, projected rows, configs, and enabled evidence", () => {
    expect(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID).toBe(
      "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts",
    );
    expect(ACTIVITY_IDS).toEqual([
      `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.worked_example`,
      `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.guided_practice`,
      `${PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID}.independent_practice`,
    ]);
    expect(new Set(ACTIVITY_IDS).size).toBe(3);

    const projection = readJson("projection/practice-v1-activity-map.json");
    const nodes = readJson("nodes.json").nodes! as unknown as Parameters<
      typeof projectActivityMap
    >[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const blueprints = readJson("blueprints.json").blueprints!;
    const projectedActivities = projection.activities!.filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    );
    const expectedActivities = projectActivityMap(nodes, edges, blueprints).filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    );

    expect(projectedActivities).toHaveLength(3);
    expect(projectedActivities).toEqual(expectedActivities);
    expect(projectedActivities.map((activity) => activity.stableActivityId)).toEqual(ACTIVITY_IDS);
    expect(projectedActivities.map((activity) => activity.mode)).toEqual(MODES);
    expect(
      projectedActivities.every((activity) => activity.sourceNodeIds.includes(SOURCE_NODE_ID)),
    ).toBe(true);
    expect(
      projectedActivities.every(
        (activity) =>
          activity.rendererKey === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
      ),
    ).toBe(true);
    expect(
      projectedActivities.every(
        (activity) =>
          JSON.stringify(activity.alignmentNodeIds) === JSON.stringify(ALIGNMENT_NODE_IDS),
      ),
    ).toBe(true);
    expect(projectedActivities.map((activity) => activity.srsEligible)).toEqual([
      false,
      true,
      true,
    ]);
    expect(projectedActivities.map((activity) => activity.gradingConfig)).toEqual([
      {
        partIds: ["roots", "intervalSigns", "solution"],
        passingScore: 3,
        partialCredit: true,
        rubric: [
          { criteria: "Identify and order the distinct real roots.", points: 1, partId: "roots" },
          {
            criteria: "Record the interval signs from left to right.",
            points: 1,
            partId: "intervalSigns",
          },
          { criteria: "Write the solution as an interval union.", points: 1, partId: "solution" },
        ],
      },
      {
        partIds: ["roots", "intervalSigns", "solution"],
        passingScore: 3,
        partialCredit: true,
        rubric: [
          { criteria: "Identify and order the distinct real roots.", points: 1, partId: "roots" },
          {
            criteria: "Record the interval signs from left to right.",
            points: 1,
            partId: "intervalSigns",
          },
          { criteria: "Write the solution as an interval union.", points: 1, partId: "solution" },
        ],
      },
      {
        partIds: ["roots", "intervalSigns", "solution"],
        passingScore: 3,
        partialCredit: true,
        rubric: [
          { criteria: "Identify and order the distinct real roots.", points: 1, partId: "roots" },
          {
            criteria: "Record the interval signs from left to right.",
            points: 1,
            partId: "intervalSigns",
          },
          { criteria: "Write the solution as an interval union.", points: 1, partId: "solution" },
        ],
      },
    ]);

    const runtimeConfigs = [
      PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
    ];
    expect(runtimeConfigs).toEqual([
      { generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY, variantSeed: 0 },
      { generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY, variantSeed: 1 },
      { generatorKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY, variantSeed: 2 },
    ]);

    const generator = getGenerator(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY);
    expect(generator.key).toBe(PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID]);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
    );
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });
});
