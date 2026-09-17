import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const crossCourseEdges = JSON.parse(
  readFileSync(new URL('../cross-course-edges.json', import.meta.url), 'utf8'),
) as unknown;

const LEGACY_RATE_SKILL =
  'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
const ORIGINAL_EDGE_COUNT = 5_024;
const LEGACY_RATE_EDGE_IDS = [
  'cross-course.edge.2935',
  'cross-course.edge.2938',
  'cross-course.edge.2941',
  'cross-course.edge.2944',
  'cross-course.edge.2947',
  'cross-course.edge.2950',
  'cross-course.edge.3049',
  'cross-course.edge.3052',
  'cross-course.edge.3055',
  'cross-course.edge.3058',
  'cross-course.edge.3061',
  'cross-course.edge.3064',
  'cross-course.edge.3573',
  'cross-course.edge.3590',
  'cross-course.edge.3726',
  'cross-course.edge.3735',
  'cross-course.edge.3736',
  'cross-course.edge.3737',
  'cross-course.edge.3738',
  'cross-course.edge.3739',
  'cross-course.edge.3740',
  'cross-course.edge.3741',
  'cross-course.edge.3742',
  'cross-course.edge.3743',
  'cross-course.edge.3744',
  'cross-course.edge.3745',
  'cross-course.edge.3746',
  'cross-course.edge.3747',
] as const;

it('removes all cross-course edges for the legacy rate-of-change skill', () => {
  const edges = crossCourseEdges as unknown as Array<{
    id: string;
    sourceId?: string;
    targetId?: string;
  }>;

  expect(Array.isArray(edges)).toBe(true);
  expect(LEGACY_RATE_EDGE_IDS).toHaveLength(28);
  expect(
    edges.filter(
      edge =>
        edge.sourceId === LEGACY_RATE_SKILL ||
        edge.targetId === LEGACY_RATE_SKILL,
    ),
  ).toHaveLength(0);

  for (const edgeId of LEGACY_RATE_EDGE_IDS) {
    expect(edges.filter(edge => edge.id === edgeId)).toHaveLength(0);
  }

  const edgeIds = edges.map(edge => edge.id);
  expect(new Set(edgeIds).size).toBe(edgeIds.length);
  expect(edges).toHaveLength(4_996);
  expect(edges.length + LEGACY_RATE_EDGE_IDS.length).toBe(ORIGINAL_EDGE_COUNT);
});
