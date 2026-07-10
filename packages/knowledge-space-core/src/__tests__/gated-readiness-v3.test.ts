import { describe, expect, it } from 'vitest';

import {
  buildKstState,
  computeWeightedReadiness,
  getOuterFringe,
  getOuterFringeV3,
} from '../index';
import type { KnowledgeStateEntry } from '../mastery-state';
import type { KnowledgeSpace, KnowledgeSpaceEdge } from '../types';

function skill(id: string): KnowledgeSpace['nodes'][number] {
  return {
    id,
    kind: 'skill',
    title: id,
    domain: 'test',
    sourceRefs: ['test'],
    reviewStatus: 'draft',
    metadata: {},
  };
}

function prerequisite(
  sourceId: string,
  targetId: string,
  weight: number,
): KnowledgeSpaceEdge {
  return {
    id: `${sourceId}->${targetId}`,
    type: 'prerequisite_for',
    sourceId,
    targetId,
    weight,
    confidence: 'high',
    sourceRefs: ['test'],
    reviewStatus: 'draft',
  };
}

function entry(nodeId: string, mastery: number): KnowledgeStateEntry {
  return {
    nodeId,
    mastery,
    retention: mastery,
    isProficient: mastery >= 0.9,
    state: mastery >= 0.9 ? 'mastered' : mastery > 0 ? 'inProgress' : 'untouched',
  };
}

function graphWithTarget(
  prerequisites: ReadonlyArray<{ id: string; weight: number }>,
): KnowledgeSpace {
  return {
    nodes: [...prerequisites.map(({ id }) => skill(id)), skill('B')],
    edges: prerequisites.map(({ id, weight }) => prerequisite(id, 'B', weight)),
  };
}

describe('kst-srs.v3.2 gated weighted readiness', () => {
  it('blocks the upstream hard-gate example even when soft prerequisites are mastered', () => {
    const graph = graphWithTarget([
      { id: 'A', weight: 1 },
      { id: 'C', weight: 0.5 },
      { id: 'D', weight: 0.5 },
      { id: 'E', weight: 0.5 },
    ]);
    const state = new Map([
      ['A', entry('A', 0)],
      ['C', entry('C', 1)],
      ['D', entry('D', 1)],
      ['E', entry('E', 1)],
    ]);

    expect(computeWeightedReadiness('B', state, graph)).toEqual({
      score: 0,
      state: 'blocked',
    });
  });

  it('matches the upstream decaying hard-gate worked example', () => {
    const graph = graphWithTarget([
      { id: 'A', weight: 1 },
      { id: 'C', weight: 0.5 },
      { id: 'D', weight: 0.5 },
    ]);
    const state = new Map([
      ['A', entry('A', 0.92)],
      ['C', entry('C', 1)],
      ['D', entry('D', 0.7)],
    ]);

    const result = computeWeightedReadiness('B', state, graph);
    expect(result.score).toBeCloseTo(0.782, 8);
    expect(result.state).toBe('nearly_ready');
  });

  it('preserves the v2 weighted average when there are no hard-gate edges', () => {
    const graph = graphWithTarget([
      { id: 'A', weight: 0.75 },
      { id: 'C', weight: 0.25 },
    ]);
    const state = new Map([
      ['A', entry('A', 0.6)],
      ['C', entry('C', 1)],
    ]);

    expect(computeWeightedReadiness('B', state, graph).score).toBeCloseTo(0.7, 8);
  });

  it('uses neutral factors for missing hard or soft prerequisite groups', () => {
    const hardOnly = graphWithTarget([{ id: 'A', weight: 1 }]);
    const softOnly = graphWithTarget([{ id: 'A', weight: 0.5 }]);
    const zeroWeightOnly = graphWithTarget([{ id: 'A', weight: 0 }]);
    const state = new Map([['A', entry('A', 0.65)]]);

    expect(computeWeightedReadiness('B', state, hardOnly).score).toBe(0.65);
    expect(computeWeightedReadiness('B', state, softOnly).score).toBe(0.65);
    expect(computeWeightedReadiness('B', state, zeroWeightOnly).score).toBe(1);
  });
});

describe('kst-srs.v3.2 outer fringe', () => {
  it('returns versioned ready and nearly_ready skill buckets', () => {
    const graph: KnowledgeSpace = {
      nodes: [
        skill('root'),
        skill('near'),
        skill('blocked'),
        {
          id: 'task',
          kind: 'task_blueprint',
          title: 'Task',
          domain: 'test',
          sourceRefs: ['test'],
          reviewStatus: 'draft',
          metadata: {},
        },
      ],
      edges: [
        prerequisite('root', 'near', 1),
        prerequisite('missing', 'blocked', 1),
      ],
    };
    const state = new Map([['root', entry('root', 0.7)]]);

    expect(getOuterFringeV3(state, graph)).toEqual({
      ready: [{ nodeId: 'root', readiness: 1 }],
      nearly_ready: [{ nodeId: 'near', readiness: 0.7 }],
    });
  });

  it('threads custom hard-gate and readiness thresholds through v3 and legacy surfaces', () => {
    const graph = graphWithTarget([{ id: 'A', weight: 0.8 }]);
    const state = new Map([['A', entry('A', 0.75)]]);
    const config = {
      hardGateThreshold: 0.75,
      nearThreshold: 0.7,
      readyThreshold: 0.9,
    };

    expect(getOuterFringeV3(state, graph, config).nearly_ready).toContainEqual({
      nodeId: 'B',
      readiness: 0.75,
    });
    expect(getOuterFringe(state, graph, undefined, config)).toContainEqual({
      nodeId: 'B',
      readiness: 0.75,
      readinessState: 'nearly_ready',
    });
  });

  it('threads v3 configuration through the SRS bridge convenience pipeline', () => {
    const graph = graphWithTarget([{ id: 'A', weight: 0.8 }]);
    const result = buildKstState(
      [],
      [{ objectiveId: 'A', retentionStrength: 0.75, practiceCoverage: 1, isProficient: true }],
      graph,
      1_700_000_000_000,
      { hardGateThreshold: 0.75, nearThreshold: 0.7, readyThreshold: 0.9 },
    );

    expect(result.fringe).toContainEqual({
      nodeId: 'B',
      readiness: 0.75,
      readinessState: 'nearly_ready',
    });
    expect(result.fringeV3.nearly_ready).toContainEqual({
      nodeId: 'B',
      readiness: 0.75,
    });
  });
});
