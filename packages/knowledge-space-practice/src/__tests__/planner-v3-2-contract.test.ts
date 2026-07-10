import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLANNER_V3_2_WEIGHTS,
  plannerGraphReleaseInputV3_2Schema,
  plannerGraphReleaseOutputV3_2Schema,
  plannerPriorityScoreV3_2Schema,
  plannerRecommendationSetV3_2Schema,
  plannerRecommendationV3_2Schema,
  plannerTermsV3_2Schema,
  plannerWeightsV3_2Schema,
} from '../planner/v3-2-contract';

const terms = { readiness: 0.8, unlockValue: 0.6, goalProximity: 0.4, weaknessFit: 0.2, utility: 1 } as const;
const contributions = { readiness: 0.28, unlockValue: 0.12, goalProximity: 0.06, weaknessFit: 0.02, utility: 0.2 } as const;

function score(nodeId: string, composite = 0.68) {
  return {
    schemaVersion: 'planner.priority.v3.2' as const,
    nodeId,
    rankingMode: 'normalized-prerequisite' as const,
    composite,
    terms,
    weights: DEFAULT_PLANNER_V3_2_WEIGHTS,
    contributions,
    tieBreak: { rule: 'priority_desc_node_id_asc.v1' as const, priority: composite, nodeId },
  };
}

describe('planner.v3.2 normalized priority contract', () => {
  it('defaults to the exact approved a-e weights', () => {
    expect(plannerWeightsV3_2Schema.parse(undefined)).toEqual({ a: 0.35, b: 0.2, c: 0.15, d: 0.1, e: 0.2 });
  });

  it.each([
    ['readiness', -0.001], ['unlockValue', 1.001], ['goalProximity', Number.NaN],
    ['weaknessFit', Number.POSITIVE_INFINITY], ['utility', -1],
  ] as const)('rejects an invalid normalized %s term', (key, value) => {
    expect(plannerTermsV3_2Schema.safeParse({ ...terms, [key]: value }).success).toBe(false);
  });

  it('requires finite non-negative weights that sum to one', () => {
    expect(plannerWeightsV3_2Schema.safeParse({ ...DEFAULT_PLANNER_V3_2_WEIGHTS, e: 0.21 }).success).toBe(false);
    expect(plannerWeightsV3_2Schema.safeParse({ ...DEFAULT_PLANNER_V3_2_WEIGHTS, d: -0.1, e: 0.4 }).success).toBe(false);
  });

  it('binds contribution, composite, and deterministic tie diagnostics', () => {
    expect(plannerPriorityScoreV3_2Schema.parse(score('skill.a')).composite).toBe(0.68);
    expect(plannerPriorityScoreV3_2Schema.safeParse(score('skill.a', 0.64)).success).toBe(false);
    expect(plannerPriorityScoreV3_2Schema.safeParse({ ...score('skill.a'), tieBreak: { rule: 'priority_desc_node_id_asc.v1', priority: 0.68, nodeId: 'skill.b' } }).success).toBe(false);
  });

  it('requires utility-led scores to use only 0.7 utility and 0.3 weakness fit', () => {
    expect(plannerPriorityScoreV3_2Schema.safeParse({
      ...score('skill.a'), rankingMode: 'utility-led',
    }).success).toBe(false);
    expect(plannerPriorityScoreV3_2Schema.safeParse({
      ...score('skill.a'), rankingMode: 'utility-led', composite: 0.76,
      weights: { a: 0, b: 0, c: 0, d: 0.3, e: 0.7 },
      contributions: { readiness: 0, unlockValue: 0, goalProximity: 0, weaknessFit: 0.06, utility: 0.7 },
      tieBreak: { rule: 'priority_desc_node_id_asc.v1', priority: 0.76, nodeId: 'skill.a' },
    }).success).toBe(true);
  });
});

describe('planner.v3.2 recommendation and graph-release contracts', () => {
  it('captures the nearest instructional ancestor used for diversity', () => {
    const parsed = plannerRecommendationV3_2Schema.parse({
      schemaVersion: 'planner.recommendation.v3.2', rank: 1, score: score('skill.a'),
      diversityGroup: { groupId: 'unit.1', ancestorNodeId: 'unit.1', ancestorKind: 'instructional_unit', distance: 1 },
    });
    expect(parsed.diversityGroup.ancestorKind).toBe('instructional_unit');
  });

  it('enforces contiguous deterministic ranking, uniqueness, and diversity cap', () => {
    const recommendation = (rank: number, nodeId: string, groupId: string) => ({
      schemaVersion: 'planner.recommendation.v3.2' as const, rank, score: score(nodeId),
      diversityGroup: { groupId, ancestorNodeId: groupId, ancestorKind: 'instructional_unit' as const, distance: 1 },
    });
    expect(plannerRecommendationSetV3_2Schema.safeParse({
      schemaVersion: 'planner.recommendations.v3.2', requestedCount: 3,
      recommendations: [recommendation(1, 'a', 'u1'), recommendation(2, 'b', 'u1'), recommendation(3, 'c', 'u2')],
    }).success).toBe(true);
    expect(plannerRecommendationSetV3_2Schema.safeParse({
      schemaVersion: 'planner.recommendations.v3.2', requestedCount: 3,
      recommendations: [recommendation(1, 'b', 'u1'), recommendation(2, 'a', 'u1'), recommendation(3, 'c', 'u1')],
    }).success).toBe(false);
    expect(plannerRecommendationSetV3_2Schema.safeParse({
      schemaVersion: 'planner.recommendations.v3.2', requestedCount: 1, diversityCap: 3,
      recommendations: [recommendation(1, 'a', 'u1')],
    }).success).toBe(false);
  });

  it('binds diversity group identity to the ancestor or fallback node', () => {
    expect(plannerRecommendationV3_2Schema.safeParse({
      schemaVersion: 'planner.recommendation.v3.2', rank: 1, score: score('skill.a'),
      diversityGroup: { groupId: 'shared', ancestorNodeId: null, ancestorKind: 'self_fallback', distance: 99 },
    }).success).toBe(false);
    expect(plannerRecommendationV3_2Schema.safeParse({
      schemaVersion: 'planner.recommendation.v3.2', rank: 1, score: score('skill.a'),
      diversityGroup: { groupId: 'other', ancestorNodeId: 'unit.1', ancestorKind: 'instructional_unit', distance: 0 },
    }).success).toBe(false);
  });

  it('validates versioned graph-release input identity and references', () => {
    const input = plannerGraphReleaseInputV3_2Schema.parse({
      schemaVersion: 'planner.graph-release-input.v3.2', graphReleaseId: 'im3.2026-07-10', graphContentHash: 'sha256:abc', domain: 'integrated-math-3',
      nodes: [{ nodeId: 'a', kind: 'skill', domain: 'integrated-math-3' }, { nodeId: 'b', kind: 'skill', domain: 'integrated-math-3' }],
      edges: [{ edgeId: 'a-b', type: 'prerequisite_for', sourceId: 'a', targetId: 'b' }], goalNodeIds: ['b'],
    });
    expect(input.sparseThreshold).toBe(0.05);
  });

  it('validates reach, goal, and sparse-mode precomputation diagnostics', () => {
    const output = plannerGraphReleaseOutputV3_2Schema.parse({
      schemaVersion: 'planner.graph-release-output.v3.2', graphReleaseId: 'im3.2026-07-10', graphContentHash: 'sha256:abc', domain: 'integrated-math-3',
      skillCount: 2, skillsWithPrerequisiteInEdge: 1, prerequisiteInEdgeRatio: 0.5, sparseThreshold: 0.05,
      rankingMode: 'normalized-prerequisite', maxReach: 1,
      reachByNode: [
        { nodeId: 'a', downstreamReach: 1, normalizedUnlockValue: 1, goalDistance: 1, goalProximity: 0.5, diversityGroup: { groupId: 'a', ancestorNodeId: null, ancestorKind: 'self_fallback', distance: 0 } },
        { nodeId: 'b', downstreamReach: 0, normalizedUnlockValue: 0, goalDistance: 0, goalProximity: 1, diversityGroup: { groupId: 'b', ancestorNodeId: null, ancestorKind: 'self_fallback', distance: 0 } },
      ],
    });
    expect(output.reachByNode).toHaveLength(2);
  });

  it('rejects inconsistent graph-release aggregate diagnostics', () => {
    expect(plannerGraphReleaseOutputV3_2Schema.safeParse({
      schemaVersion: 'planner.graph-release-output.v3.2', graphReleaseId: 'bad', graphContentHash: 'sha256:bad', domain: 'math', skillCount: 2,
      skillsWithPrerequisiteInEdge: 3, prerequisiteInEdgeRatio: 1, sparseThreshold: 0.05,
      rankingMode: 'utility-led', maxReach: 0, reachByNode: [],
    }).success).toBe(false);
  });

  it('rejects reach greater than the available downstream skill population', () => {
    expect(plannerGraphReleaseOutputV3_2Schema.safeParse({
      schemaVersion: 'planner.graph-release-output.v3.2', graphReleaseId: 'bad', graphContentHash: 'sha256:bad', domain: 'math',
      skillCount: 1, skillsWithPrerequisiteInEdge: 0, prerequisiteInEdgeRatio: 0, sparseThreshold: 0.05,
      rankingMode: 'utility-led', maxReach: 999,
      reachByNode: [{ nodeId: 'ghost', downstreamReach: 999, normalizedUnlockValue: 1, goalDistance: null, goalProximity: 0,
        diversityGroup: { groupId: 'ghost', ancestorNodeId: null, ancestorKind: 'self_fallback', distance: 0 } }],
    }).success).toBe(false);
  });
});
