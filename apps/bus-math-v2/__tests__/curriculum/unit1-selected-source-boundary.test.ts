import { describe, expect, it } from 'vitest';

import blueprints from '@/curriculum/skill-graph/blueprints.json';
import edges from '@/curriculum/skill-graph/edges.json';
import nodes from '@/curriculum/skill-graph/nodes.json';
import activityMap from '@/curriculum/skill-graph/projection/practice-v1-activity-map.json';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';

const nodeId = 'math.bm2.skill.1.1.apply-accounting-equation';
const formerMappedActivityIds = [
  'unit-1-lesson-1-activity-1',
  'unit-1-lesson-1-activity-2',
  'unit-1-lesson-1-activity-3',
];

describe('BM2 Unit 1 selected source boundary', () => {
  it('uses the exact Lesson 1 simple-event objective', () => {
    const node = nodes.nodes.find((candidate) => candidate.id === nodeId);
    expect(node).toMatchObject({
      id: nodeId,
      kind: 'skill',
      title: 'Identify how a simple business event affects the accounting equation',
      description: 'Identify how one simple business event changes Assets, Liabilities, and Equity while the accounting equation stays balanced.',
    });
  });

  it('does not claim notebook or whole-exit-ticket evidence for the event skill', () => {
    const blueprint = blueprints.blueprints.find((candidate) => candidate.nodeId === nodeId);
    expect(blueprint?.metadata.activityIds).toEqual([]);
    expect(activityMap.activities.filter((activity) => activity.nodeId === nodeId)).toEqual([]);
  });

  it('preserves the three physical Lesson 1 activities', () => {
    const lesson = buildPublishedCurriculumManifest().lessons.find(
      (candidate) => candidate.slug === 'unit-1-lesson-1',
    );
    expect(lesson?.activities.map((activity) => activity.key)).toEqual(
      expect.arrayContaining(formerMappedActivityIds),
    );
  });

  it('keeps only source-supported selected-node prerequisites', () => {
    const selectedEdges = edges.edges.filter((edge) => edge.from === nodeId);
    expect(selectedEdges.some((edge) => edge.to === 'math.bm2.skill.1.2')).toBe(false);
    expect(selectedEdges).toEqual(expect.arrayContaining([
      expect.objectContaining({
        to: 'math.bm2.skill.1.3',
        type: 'prerequisite',
        rationale: 'The learner first identifies how one simple event changes the accounting equation. The learner then records both effects and verifies balance across a series of events.',
      }),
    ]));
    expect(selectedEdges.some((edge) => edge.to === 'math.bm2.skill.1.11')).toBe(false);
  });
});
