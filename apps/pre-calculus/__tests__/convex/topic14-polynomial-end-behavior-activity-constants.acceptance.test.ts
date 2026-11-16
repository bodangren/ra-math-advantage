import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from '@/convex/activities';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const PROJECTION_PATH = path.resolve(
  process.cwd(),
  'curriculum/skill-graph/projection/practice-v1-activity-map.json',
);

const ACTIVITY_IDS = [
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
] as const;

describe('Topic 1.4 polynomial end behavior activity constants', () => {
  it('defines exact identities, projections, configs, generator mapping, and evidence enablement', () => {
    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID).toBe(
      'math.precalc.skill.1.4.determine-end-behavior-from-leading-term',
    );
    expect(ACTIVITY_IDS).toEqual([
      `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.worked_example`,
      `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.guided_practice`,
      `${PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID}.independent_practice`,
    ]);
    expect(new Set(ACTIVITY_IDS).size).toBe(3);

    const projection = JSON.parse(fs.readFileSync(PROJECTION_PATH, 'utf8')) as {
      activities: Array<{ nodeId: string; stableActivityId: string; mode: string }>;
    };
    const allStableActivityIds = projection.activities.map((activity) => activity.stableActivityId);
    expect(new Set(allStableActivityIds).size).toBe(allStableActivityIds.length);

    const projectedActivities = projection.activities.filter(
      (activity) => activity.nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
    );
    expect(projectedActivities).toHaveLength(3);
    expect(projectedActivities.map((activity) => activity.stableActivityId)).toEqual(ACTIVITY_IDS);
    expect(projectedActivities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);

    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY).toBe(
      'polynomial-end-behavior',
    );
    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY).toBe(
      'topic14-polynomial-end-behavior',
    );
    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
      variantSeed: 0,
    });
    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
      variantSeed: 1,
    });
    expect(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG).toEqual({
      generatorKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY,
      variantSeed: 2,
    });

    const generator = getGenerator(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY);
    expect(generator.key).toBe(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID]);

    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).toContain(
      PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
    );
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it('connects the enabled capability to seed and submission paths', () => {
    const seedSource = fs.readFileSync(
      path.resolve(process.cwd(), 'convex/seed/seed_lesson_1_4.ts'),
      'utf8',
    );
    const evidenceSource = fs.readFileSync(
      path.resolve(process.cwd(), 'convex/learningEvidence.ts'),
      'utf8',
    );
    const activitiesSource = fs.readFileSync(
      path.resolve(process.cwd(), 'convex/activities.ts'),
      'utf8',
    );

    expect(seedSource).toContain('PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_');
    expect(evidenceSource).toContain('PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_');
    expect(activitiesSource).toContain('createTopic14PolynomialEndBehaviorSubmission');
    expect(activitiesSource).toContain('createTopic14PolynomialEndBehaviorWorkedSubmission');
  });
});
