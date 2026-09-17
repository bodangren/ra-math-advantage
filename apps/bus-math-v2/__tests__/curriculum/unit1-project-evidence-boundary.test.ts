import { describe, expect, it } from 'vitest';

import blueprints from '@/curriculum/skill-graph/blueprints.json';
import activityMap from '@/curriculum/skill-graph/projection/practice-v1-activity-map.json';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';

const boundaries = [
  {
    nodeId: 'math.bm2.skill.1.8',
    lessonSlug: 'unit-1-lesson-8',
    activityId: 'unit-1-lesson-8-activity-1',
  },
  {
    nodeId: 'math.bm2.skill.1.9',
    lessonSlug: 'unit-1-lesson-9',
    activityId: 'unit-1-lesson-9-activity-1',
  },
  {
    nodeId: 'math.bm2.skill.1.10',
    lessonSlug: 'unit-1-lesson-10',
    activityId: 'unit-1-lesson-10-activity-1',
  },
] as const;

describe('BM2 Unit 1 project evidence boundary', () => {
  it.each(boundaries)('keeps $activityId as lesson work without exact $nodeId evidence', (boundary) => {
    const blueprint = blueprints.blueprints.find(
      (candidate) => candidate.nodeId === boundary.nodeId,
    );
    expect(blueprint?.metadata.activityIds).toEqual([]);
    expect(activityMap.activities.some((activity) => (
      activity.nodeId === boundary.nodeId || activity.stableActivityId === boundary.activityId
    ))).toBe(false);

    const lesson = buildPublishedCurriculumManifest().lessons.find(
      (candidate) => candidate.slug === boundary.lessonSlug,
    );
    expect(lesson?.activities.some((activity) => activity.key === boundary.activityId)).toBe(true);
  });
});
