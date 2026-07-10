import { describe, expect, it } from 'vitest';

import { planRecommendationsV3_2 } from '../planner/v3-2-recommendations';
import { assessReviewLoadV3_2 } from '../planner/v3-2-review-load';

const fallbackGroup = (nodeId: string) => ({
  groupId: nodeId,
  ancestorNodeId: null,
  ancestorKind: 'self_fallback' as const,
  distance: 0,
});

const ancestorGroup = (groupId: string) => ({
  groupId,
  ancestorNodeId: groupId,
  ancestorKind: 'instructional_unit' as const,
  distance: 1,
});

function candidate(nodeId: string, readiness: number, groupId?: string) {
  return {
    nodeId,
    readiness,
    unlockValue: 0,
    goalProximity: 0,
    weaknessFit: 0,
    utility: 0,
    diversityGroup: groupId ? ancestorGroup(groupId) : fallbackGroup(nodeId),
  };
}

describe('planner.v3.2 recommendation diversity', () => {
  it('caps each nearest instructional ancestor at two and fills from other groups', () => {
    const result = planRecommendationsV3_2({
      rankingMode: 'normalized-prerequisite', readyThreshold: 0.8, requestedCount: 4,
      candidates: [
        candidate('u1-a', 1, 'unit.1'),
        candidate('u1-b', 0.99, 'unit.1'),
        candidate('u1-c', 0.98, 'unit.1'),
        candidate('u2-a', 0.9, 'unit.2'),
        candidate('u3-a', 0.85, 'unit.3'),
      ],
    });
    expect(result.recommendations.map((entry) => entry.score.nodeId)).toEqual([
      'u1-a', 'u1-b', 'u2-a', 'u3-a',
    ]);
    expect(result.recommendations.filter((entry) => entry.diversityGroup.groupId === 'unit.1')).toHaveLength(2);
  });

  it('does not collapse unrelated fallback nodes into one diversity group', () => {
    const result = planRecommendationsV3_2({
      rankingMode: 'normalized-prerequisite', readyThreshold: 0.8, requestedCount: 3,
      candidates: [candidate('a', 1), candidate('b', 1), candidate('c', 1)],
    });
    expect(result.recommendations.map((entry) => entry.score.nodeId)).toEqual(['a', 'b', 'c']);
  });
});

describe('planner.v3.2 seven-day review-load budgeting', () => {
  const asOf = '2026-07-10T00:00:00.000Z';

  function cards(count: number, dueDate = '2026-07-17T00:00:00.000Z') {
    return Array.from({ length: count }, (_, index) => ({ cardId: `card.${index}`, dueDate }));
  }

  it('includes overdue cards and the exact seven-day boundary, excluding later cards', () => {
    const assessment = assessReviewLoadV3_2({
      asOf,
      maxReviewsPerDay: 20,
      cards: [
        { cardId: 'overdue', dueDate: '2026-07-09T00:00:00.000Z' },
        { cardId: 'boundary', dueDate: '2026-07-17T00:00:00.000Z' },
        { cardId: 'later', dueDate: '2026-07-17T00:00:00.001Z' },
      ],
    });
    expect(assessment).toMatchObject({ dueWithinHorizon: 2, projectedDailyLoad: 2 / 7, reviewLoadState: 'normal' });
  });

  it.each([
    [67, 'normal', 'allowed'],
    [68, 'elevated', 'allowed'],
    [112, 'elevated', 'allowed'],
    [113, 'saturated', 'zero'],
  ] as const)('classifies %i cards as %s', (count, state, allowance) => {
    expect(assessReviewLoadV3_2({ asOf, maxReviewsPerDay: 20, cards: cards(count) })).toMatchObject({
      reviewLoadState: state,
      newSkillAllowance: allowance,
    });
  });

  it('suppresses every new-skill recommendation when the projected budget is saturated', () => {
    const reviewLoad = assessReviewLoadV3_2({ asOf, maxReviewsPerDay: 20, cards: cards(180) });
    const result = planRecommendationsV3_2({
      rankingMode: 'normalized-prerequisite', readyThreshold: 0.8, requestedCount: 2,
      candidates: [candidate('a', 1), candidate('b', 0.9)],
      reviewLoad,
    });
    expect(result.recommendations).toEqual([]);
    expect(result.reviewLoad).toMatchObject({ reviewLoadState: 'saturated', guidance: 'review-day' });
  });

  it('rejects invalid timestamps and duplicate card identities', () => {
    expect(() => assessReviewLoadV3_2({
      asOf,
      maxReviewsPerDay: 20,
      cards: [{ cardId: 'same', dueDate: 'bad' }, { cardId: 'same', dueDate: asOf }],
    })).toThrow();
  });
});
