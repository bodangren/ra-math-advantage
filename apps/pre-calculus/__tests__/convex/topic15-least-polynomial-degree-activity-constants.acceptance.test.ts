import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  generateTopic15LeastPolynomialDegreeOutput,
  getGenerator,
} from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PROJECTION_PATH = path.resolve(
  appRoot,
  "curriculum/skill-graph/projection/practice-v1-activity-map.json",
);
const SOURCE_NODE_ID = "math.precalc.example.1.5.002";
const ALIGNMENT_NODE_IDS = [
  "math.standard.ccss.hsa-apr-b-3",
  "math.standard.ccss.n-cn-c-7",
] as const;
const ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
] as const;

describe("Topic 1.5 least-polynomial-degree activity constants", () => {
  it("defines exact identities, projected rows, configs, and enabled evidence", () => {
    expect(PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID).toBe(
      "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs",
    );
    expect(ACTIVITY_IDS).toEqual([
      `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.worked_example`,
      `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.guided_practice`,
      `${PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID}.independent_practice`,
    ]);
    expect(new Set(ACTIVITY_IDS).size).toBe(3);

    const projection = JSON.parse(fs.readFileSync(PROJECTION_PATH, "utf8")) as {
      activities: Array<{
        nodeId: string;
        stableActivityId: string;
        sourceNodeIds: string[];
        rendererKey: string;
        mode: string;
        alignmentNodeIds: string[];
        props: Record<string, unknown>;
        gradingConfig: Record<string, unknown>;
        srsEligible: boolean;
      }>;
    };
    const allStableActivityIds = projection.activities.map((activity) => activity.stableActivityId);
    expect(new Set(allStableActivityIds).size).toBe(allStableActivityIds.length);

    const projectedActivities = projection.activities.filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
    );
    expect(projectedActivities).toHaveLength(3);

    const outputs = [0, 1, 2].map((seed) => generateTopic15LeastPolynomialDegreeOutput(seed));
    const publicProps = outputs.map(
      (output) => output.data.rendererProps as Record<string, unknown>,
    );
    const expectedProps = [
      {
        ...publicProps[0]!,
        presentationMode: "worked_example",
        correctAnswer: 5,
        steps: [
          "Because f has real coefficients, x = -i√3 is also a zero.",
          "The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.",
          "Therefore, the least possible degree is 2 + 3 = 5.",
        ],
        finalAnswer: "The least possible degree is 5.",
      },
      {
        ...publicProps[1]!,
        presentationMode: "guided_practice",
        guidedSteps: [
          "Identify the conjugate zero.",
          "Count the conjugate pair and the real zeros.",
        ],
        fieldHelp: "Add 2 for the conjugate pair to the number of real zeros.",
      },
      publicProps[2]!,
    ];
    const projectedGradingConfig = {
      partIds: ["leastDegree"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        { criteria: "Identify the least possible degree.", points: 1, partId: "leastDegree" },
      ],
    };
    const runtimeConfigs = [
      PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
    ];
    expect(
      projectedActivities.map((activity) => ({
        stableActivityId: activity.stableActivityId,
        nodeId: activity.nodeId,
        sourceNodeIds: activity.sourceNodeIds,
        rendererKey: activity.rendererKey,
        mode: activity.mode,
        alignmentNodeIds: activity.alignmentNodeIds,
        props: activity.props,
        gradingConfig: activity.gradingConfig,
        srsEligible: activity.srsEligible,
      })),
    ).toEqual(
      expectedProps.map((props, index) => ({
        stableActivityId: ACTIVITY_IDS[index],
        nodeId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
        sourceNodeIds: [
          SOURCE_NODE_ID,
          "math.precalc.skill.1.5.apply-complex-conjugate-zeros-theorem",
        ],
        rendererKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
        mode: ["worked_example", "guided_practice", "independent_practice"][index],
        alignmentNodeIds: ALIGNMENT_NODE_IDS,
        props,
        gradingConfig: projectedGradingConfig,
        srsEligible: index > 0,
      })),
    );

    expect(runtimeConfigs).toEqual([
      {
        generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
        variantSeed: 0,
      },
      {
        generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
        variantSeed: 1,
      },
      {
        generatorKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY,
        variantSeed: 2,
      },
    ]);

    const generator = getGenerator(PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY);
    expect(generator.key).toBe(PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID]);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
    );
  });
});
