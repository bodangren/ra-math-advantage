import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { KnowledgeBlueprint, ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const GRAPH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../curriculum/skill-graph',
);
const SOURCE_NODE_ID = 'math.precalc.example.1.6.003';
const ALIGNMENT_NODE_IDS = [
  'math.standard.ccss.hsf-if-b-4',
  'math.standard.ccss.hsf-if-c-7c',
] as const;
const MODES = ['worked_example', 'guided_practice', 'independent_practice'] as const;
const ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
] as const;
const PART_IDS = [
  'a_leftEnd', 'a_rightEnd', 'b_leftEnd', 'b_rightEnd',
  'c_leftEnd', 'c_rightEnd', 'd_leftEnd', 'd_rightEnd',
  'e_leftEnd', 'e_rightEnd', 'f_leftEnd', 'f_rightEnd',
] as const;

type JsonDocument = {
  activities?: ProjectedActivity[];
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  nodes?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(
    fs.readFileSync(path.join(GRAPH_DIR, fileName), 'utf8'),
  ) as JsonDocument;
}

describe('Topic 1.6 equation-end-behavior activity constants', () => {
  it('defines exact identities, projection rows, configs, and disabled evidence', () => {
    expect(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID).toBe(
      'math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations',
    );
    expect(ACTIVITY_IDS).toEqual([
      `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.worked_example`,
      `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.guided_practice`,
      `${PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID}.independent_practice`,
    ]);
    expect(new Set(ACTIVITY_IDS).size).toBe(3);
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    );

    const projection = readJson('projection/practice-v1-activity-map.json');
    const nodes = readJson('nodes.json').nodes! as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readJson('edges.json').edges! as unknown as Parameters<typeof projectActivityMap>[1];
    const blueprints = readJson('blueprints.json').blueprints!;
    const actualActivities = projection.activities!.filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    );
    const expectedActivities = projectActivityMap(nodes, edges, blueprints)
      .filter((activity) => activity.nodeId === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID);

    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((activity) => activity.stableActivityId)).toEqual(ACTIVITY_IDS);
    expect(actualActivities.map((activity) => activity.mode)).toEqual(MODES);
    expect(actualActivities.every((activity) => activity.sourceNodeIds.includes(SOURCE_NODE_ID))).toBe(true);
    expect(actualActivities.every((activity) => activity.rendererKey
      === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY)).toBe(true);
    expect(actualActivities.every((activity) =>
      JSON.stringify(activity.alignmentNodeIds) === JSON.stringify(ALIGNMENT_NODE_IDS))).toBe(true);
    expect(actualActivities.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((activity) => activity.gradingConfig)).toEqual([
      {
        partIds: PART_IDS,
        passingScore: 12,
        partialCredit: true,
      },
      {
        partIds: PART_IDS,
        passingScore: 12,
        partialCredit: true,
      },
      {
        partIds: PART_IDS,
        passingScore: 12,
        partialCredit: true,
      },
    ]);

    expect([
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
    ]).toEqual([
      {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 0,
      },
      {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 1,
      },
      {
        generatorKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY,
        variantSeed: 2,
      },
    ]);

    const generator = getGenerator(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY);
    expect(generator.key).toBe(PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([
      PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    ]);
  });
});
