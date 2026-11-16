import { describe, expect, it } from 'vitest';

import blueprints from '@/curriculum/skill-graph/blueprints.json';
import edges from '@/curriculum/skill-graph/edges.json';
import nodes from '@/curriculum/skill-graph/nodes.json';
import activityMap from '@/curriculum/skill-graph/projection/practice-v1-activity-map.json';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';

const assessmentNodeId = 'math.bm2.skill.2.11';
const assessmentActivityIds = [
  'unit-2-lesson-11-mastery',
  'unit-2-lesson-11-model-proof',
];

describe('BM2 Unit 2 Lesson 11 assessment aggregate', () => {
  it('preserves the stable ID as an assessment task', () => {
    expect(nodes.nodes.find((node) => node.id === assessmentNodeId)).toMatchObject({
      id: assessmentNodeId,
      kind: 'task_blueprint',
      title: 'Complete the Unit 2 transaction-flow mastery check',
      description: 'Complete the Unit 2 classification, posting, formula, and mini-ledger assessment.',
      reviewStatus: 'reviewed',
    });
  });

  it('does not use skill prerequisites as assessment eligibility gates', () => {
    expect(edges.edges.filter((edge) => edge.to === assessmentNodeId)).toEqual([]);
  });

  it('does not project the whole assessment as exact aggregate evidence', () => {
    const blueprint = blueprints.blueprints.find((candidate) => candidate.nodeId === assessmentNodeId);
    expect(blueprint?.metadata.activityIds).toEqual([]);
    expect(activityMap.activities.filter((activity) => activity.nodeId === assessmentNodeId)).toEqual([]);
  });

  it('preserves the physical published assessment activities', () => {
    const lesson = buildPublishedCurriculumManifest().lessons.find(
      (candidate) => candidate.slug === 'unit-2-lesson-11',
    );
    expect(lesson?.activities.map((activity) => activity.key)).toEqual(
      expect.arrayContaining(assessmentActivityIds),
    );
  });
});
