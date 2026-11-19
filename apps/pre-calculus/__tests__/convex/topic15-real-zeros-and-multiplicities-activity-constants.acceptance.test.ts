import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
} from "@/convex/activities";
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PROJECTION_PATH = path.resolve(
  appRoot,
  "curriculum/skill-graph/projection/practice-v1-activity-map.json",
);

const ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
] as const;

describe("Topic 1.5 real zeros and multiplicities activity constants", () => {
  it("defines exact identities, projected rows, configs, and generator mapping", () => {
    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID).toBe(
      "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form",
    );
    expect(ACTIVITY_IDS).toEqual([
      `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.worked_example`,
      `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.guided_practice`,
      `${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.independent_practice`,
    ]);
    expect(new Set(ACTIVITY_IDS).size).toBe(3);

    const projection = JSON.parse(fs.readFileSync(PROJECTION_PATH, "utf8")) as {
      activities: Array<{
        nodeId: string;
        stableActivityId: string;
        rendererKey: string;
        mode: string;
      }>;
    };
    const allStableActivityIds = projection.activities.map((activity) => activity.stableActivityId);
    expect(new Set(allStableActivityIds).size).toBe(allStableActivityIds.length);

    const projectedActivities = projection.activities.filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    );
    expect(projectedActivities).toHaveLength(3);
    expect(projectedActivities.map((activity) => activity.stableActivityId)).toEqual(ACTIVITY_IDS);
    expect(projectedActivities.map((activity) => activity.rendererKey)).toEqual([
      PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
    ]);
    expect(projectedActivities.map((activity) => activity.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    for (const activityId of ACTIVITY_IDS) {
      expect(allStableActivityIds.filter((candidate) => candidate === activityId)).toHaveLength(1);
    }

    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY).toBe(
      "real-zeros-and-multiplicities",
    );
    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY).toBe(
      "topic15-real-zeros-and-multiplicities-from-factored-form",
    );
    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
      variantSeed: 0,
    });
    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
      variantSeed: 1,
    });
    expect(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
      variantSeed: 2,
    });

    const generator = getGenerator(
      PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY,
    );
    expect(generator.key).toBe(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID]);

    expect(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => nodeId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
      ),
    ).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });
});
