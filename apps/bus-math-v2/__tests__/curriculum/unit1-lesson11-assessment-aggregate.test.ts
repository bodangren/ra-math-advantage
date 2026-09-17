import { describe, expect, it } from 'vitest';

import blueprints from '@/curriculum/skill-graph/blueprints.json';
import edges from '@/curriculum/skill-graph/edges.json';
import nodes from '@/curriculum/skill-graph/nodes.json';
import activityMap from '@/curriculum/skill-graph/projection/practice-v1-activity-map.json';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';

const assessmentNodeId = 'math.bm2.skill.1.11';
const assessmentActivityIds = [
  'unit-1-lesson-11-activity-1',
  'unit-1-lesson-11-activity-2',
  'unit-1-lesson-11-activity-3',
  'unit-1-lesson-11-application-evidence',
];

describe('BM2 Unit 1 Lesson 11 assessment aggregate', () => {
  it('preserves the stable node ID as a multi-standard assessment task', () => {
    expect(nodes.nodes.find((node) => node.id === assessmentNodeId)).toMatchObject({
      id: assessmentNodeId,
      kind: 'task_blueprint',
      title: 'Complete the Unit 1 multi-standard mastery check',
      description: 'Complete the Unit 1 knowledge, understanding, and application assessment for standards ACC-1.1 through ACC-1.7.',
      reviewStatus: 'reviewed',
    });
  });

  it('does not treat Unit 1 skills as prerequisites for the assessment aggregate', () => {
    expect(edges.edges.filter((edge) => edge.to === assessmentNodeId)).toEqual([]);
  });

  it('does not map a whole assessment activity to exact-node mastery', () => {
    const blueprint = blueprints.blueprints.find((candidate) => candidate.nodeId === assessmentNodeId);
    expect(blueprint?.metadata.activityIds).toEqual([]);
    expect(activityMap.activities.filter((activity) => activity.nodeId === assessmentNodeId)).toEqual([]);
  });

  it('preserves the physical Lesson 11 assessment activities', () => {
    const lesson = buildPublishedCurriculumManifest().lessons.find(
      (candidate) => candidate.slug === 'unit-1-lesson-11',
    );
    expect(lesson?.activities.map((activity) => activity.key)).toEqual(
      expect.arrayContaining(assessmentActivityIds),
    );
  });
});
