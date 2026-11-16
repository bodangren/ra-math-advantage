import { describe, expect, it } from 'vitest';

import {
  nextPlacementStagnationCount,
  runAdaptivePlacement,
} from '../srs/adaptive-placement';
import { isPlacementFrontierStateV31 } from '../srs/placement-contract';
import { runAdaptivePlacement as rootRunAdaptivePlacement } from '../index';
import { runAdaptivePlacement as subpathRunAdaptivePlacement } from '@math-platform/srs-engine/adaptive-placement';

const guessFloor = {
  policyVersion: 'math-answer-formats.v1',
  answerFormat: 'multiple-choice-4',
  value: 0.25,
} as const;

const instrument = {
  instrumentId: 'math.im3.multiple-choice-4',
  instrumentVersion: '2026.1',
  instrumentPolicyVersion: 'math-placement.v1',
  guessFloorPolicyVersion: guessFloor.policyVersion,
  highFidelity: false,
} as const;

function passingProbe(calls: string[] = []) {
  return async ({ nodeId, probeIndex }: { nodeId: string; probeIndex: 1 | 2 | 3 }) => {
    calls.push(`${nodeId}:${probeIndex}`);
    return {
      probeId: `${nodeId}:${probeIndex}`,
      outcome: 'pass' as const,
      rawPerformance: 1,
    };
  };
}

function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    entryPointNodeId: 'root',
    nodes: [{ nodeId: 'root', contentGroup: 'algebra', unlockValue: 1 }],
    prerequisiteEdges: [],
    hardGateThreshold: 0.8,
    guessFloor,
    instrument,
    probe: passingProbe(),
    ...overrides,
  };
}

describe('adaptive placement validation and graph boundaries', () => {
  it('publishes the implementation through the root and package subpath', () => {
    expect(rootRunAdaptivePlacement).toBe(runAdaptivePlacement);
    expect(subpathRunAdaptivePlacement).toBe(runAdaptivePlacement);
  });

  it('rejects duplicate nodes, dangling edges, and cycles on hard or soft prerequisite edges', async () => {
    await expect(runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'algebra', unlockValue: 1 },
        { nodeId: 'root', contentGroup: 'geometry', unlockValue: 2 },
      ],
    }))).rejects.toThrow(/unique/i);

    await expect(runAdaptivePlacement(baseConfig({
      prerequisiteEdges: [{ sourceId: 'root', targetId: 'missing', weight: 1 }],
    }))).rejects.toThrow(/declared nodes/i);

    await expect(runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'algebra', unlockValue: 1 },
        { nodeId: 'child', contentGroup: 'algebra', unlockValue: 2 },
      ],
      prerequisiteEdges: [
        { sourceId: 'root', targetId: 'child', weight: 1 },
        { sourceId: 'child', targetId: 'root', weight: 1 },
      ],
    }))).rejects.toThrow(/DAG/i);

    await expect(runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'algebra', unlockValue: 1 },
        { nodeId: 'soft-child', contentGroup: 'algebra', unlockValue: 2 },
      ],
      prerequisiteEdges: [
        { sourceId: 'root', targetId: 'soft-child', weight: 0.2 },
        { sourceId: 'soft-child', targetId: 'root', weight: 0.2 },
      ],
    }))).rejects.toThrow(/DAG/i);
  });

  it('does not traverse soft edges or apply soft-edge evidence closure', async () => {
    const calls: string[] = [];
    const result = await runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'algebra', unlockValue: 1 },
        { nodeId: 'soft-child', contentGroup: 'algebra', unlockValue: 2 },
      ],
      prerequisiteEdges: [{ sourceId: 'root', targetId: 'soft-child', weight: 0.79 }],
      probe: passingProbe(calls),
    }));

    expect(calls).toEqual(['root:1', 'root:2']);
    expect(result.estimates.map((estimate) => estimate.nodeId)).toEqual(['root']);
  });

  it('walks backward through multiple unresolved prerequisite levels', async () => {
    const calls: string[] = [];
    const outcomes: Record<string, 'pass' | 'fail'> = {
      child: 'fail',
      parent: 'fail',
      grandparent: 'pass',
    };
    const result = await runAdaptivePlacement({
      ...baseConfig(),
      entryPointNodeId: 'child',
      nodes: ['grandparent', 'parent', 'child'].map((nodeId) => ({
        nodeId,
        contentGroup: 'algebra',
        unlockValue: 1,
      })),
      prerequisiteEdges: [
        { sourceId: 'grandparent', targetId: 'parent', weight: 1 },
        { sourceId: 'parent', targetId: 'child', weight: 1 },
      ],
      probe: async ({ nodeId, probeIndex }) => {
        calls.push(`${nodeId}:${probeIndex}`);
        const outcome = outcomes[nodeId]!;
        return {
          probeId: `${nodeId}:${probeIndex}`,
          outcome,
          rawPerformance: outcome === 'pass' ? 1 : 0,
        };
      },
    });

    expect(result.decisions.map((decision) => [decision.nodeId, decision.decision])).toEqual([
      ['child', 'retreat'],
      ['parent', 'retreat'],
      ['grandparent', 'advance'],
    ]);
    expect(calls).toHaveLength(6);
  });

  it('does not infer ancestor mastery from a retreat decision with a positive tie score', async () => {
    const outcomes = ['pass', 'fail', 'partial'] as const;
    const result = await runAdaptivePlacement({
      ...baseConfig(),
      entryPointNodeId: 'child',
      nodes: ['parent', 'child'].map((nodeId) => ({
        nodeId,
        contentGroup: 'algebra',
        unlockValue: 1,
      })),
      prerequisiteEdges: [{ sourceId: 'parent', targetId: 'child', weight: 1 }],
      probeBudget: 3,
      probe: async ({ nodeId, probeIndex }) => {
        const outcome = outcomes[probeIndex - 1]!;
        return {
          probeId: `${nodeId}:${probeIndex}`,
          outcome,
          rawPerformance: outcome === 'pass' ? 1 : outcome === 'partial' ? 0.625 : 0,
        };
      },
    });

    expect(result.decisions[0]?.decision).toBe('retreat');
    expect(result.estimates).toHaveLength(1);
    expect(result.estimates[0]).toMatchObject({
      nodeId: 'child',
      evidenceType: 'direct',
    });
    expect(result.stoppingReason).toBe('probe_budget_exhausted');
  });

  it('limits a wide content-group level to the top three unlock values', async () => {
    const calls: string[] = [];
    const children = [
      { nodeId: 'low', contentGroup: 'wide', unlockValue: 1 },
      { nodeId: 'high', contentGroup: 'wide', unlockValue: 4 },
      { nodeId: 'mid-high', contentGroup: 'wide', unlockValue: 3 },
      { nodeId: 'mid-low', contentGroup: 'wide', unlockValue: 2 },
    ];
    const result = await runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'entry', unlockValue: 0 },
        ...children,
      ],
      prerequisiteEdges: children.map((node) => ({
        sourceId: 'root',
        targetId: node.nodeId,
        weight: 1,
      })),
      probe: passingProbe(calls),
    }));

    expect(result.decisions.map((decision) => decision.nodeId)).toEqual([
      'root',
      'high',
      'mid-high',
      'mid-low',
    ]);
    expect(calls.some((call) => call.startsWith('low:'))).toBe(false);
  });

  it('applies representative caps across staggered parents with independent group limits', async () => {
    const calls: string[] = [];
    const representativeNodes = [
      { nodeId: 'aaa-low', contentGroup: 'wide-a', unlockValue: 1, parent: 'parent-a' },
      { nodeId: 'zzz-high', contentGroup: 'wide-a', unlockValue: 10, parent: 'parent-a' },
      { nodeId: 'bbb-mid', contentGroup: 'wide-a', unlockValue: 8, parent: 'parent-b' },
      { nodeId: 'ccc-upper', contentGroup: 'wide-a', unlockValue: 9, parent: 'parent-b' },
      { nodeId: 'aaa-low-b', contentGroup: 'wide-b', unlockValue: 1, parent: 'parent-a' },
      { nodeId: 'zzz-high-b', contentGroup: 'wide-b', unlockValue: 10, parent: 'parent-a' },
      { nodeId: 'bbb-mid-b', contentGroup: 'wide-b', unlockValue: 8, parent: 'parent-b' },
      { nodeId: 'ccc-upper-b', contentGroup: 'wide-b', unlockValue: 9, parent: 'parent-b' },
    ];
    const result = await runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'entry', unlockValue: 0 },
        { nodeId: 'parent-a', contentGroup: 'parents', unlockValue: 2 },
        { nodeId: 'parent-b', contentGroup: 'parents', unlockValue: 1 },
        ...representativeNodes.map(({ parent: _parent, ...node }) => node),
      ],
      prerequisiteEdges: [
        { sourceId: 'root', targetId: 'parent-a', weight: 1 },
        { sourceId: 'root', targetId: 'parent-b', weight: 1 },
        ...representativeNodes.map((node) => ({
          sourceId: node.parent,
          targetId: node.nodeId,
          weight: 1,
        })),
      ],
      probe: passingProbe(calls),
    }));

    expect(result.decisions.map((decision) => decision.nodeId)).toEqual([
      'root',
      'parent-a',
      'parent-b',
      'zzz-high',
      'ccc-upper',
      'bbb-mid',
      'zzz-high-b',
      'ccc-upper-b',
      'bbb-mid-b',
    ]);
    expect(calls.some((call) => call.startsWith('aaa-low:'))).toBe(false);
    expect(calls.some((call) => call.startsWith('aaa-low-b:'))).toBe(false);
  });

  it('waits for every hard parent before probing a diamond child', async () => {
    const calls: string[] = [];
    const result = await runAdaptivePlacement(baseConfig({
      nodes: [
        { nodeId: 'root', contentGroup: 'entry', unlockValue: 0 },
        { nodeId: 'parent-a', contentGroup: 'parents', unlockValue: 2 },
        { nodeId: 'parent-b', contentGroup: 'parents', unlockValue: 1 },
        { nodeId: 'child', contentGroup: 'child', unlockValue: 5 },
      ],
      prerequisiteEdges: [
        { sourceId: 'root', targetId: 'parent-a', weight: 1 },
        { sourceId: 'root', targetId: 'parent-b', weight: 1 },
        { sourceId: 'parent-a', targetId: 'child', weight: 1 },
        { sourceId: 'parent-b', targetId: 'child', weight: 1 },
      ],
      probe: passingProbe(calls),
    }));

    expect(result.decisions.map((decision) => decision.nodeId)).toEqual([
      'root',
      'parent-a',
      'parent-b',
      'child',
    ]);
    expect(calls.indexOf('child:1')).toBeGreaterThan(calls.indexOf('parent-b:2'));
  });

  it('returns a valid pending frontier when the budget ends mid-decision', async () => {
    const oneProbe = await runAdaptivePlacement(baseConfig({
      probeBudget: 1,
      probe: async () => ({ probeId: 'p1', outcome: 'pass', rawPerformance: 1 }),
    }));
    expect(oneProbe.decisions).toEqual([]);
    expect(oneProbe.probesUsed).toBe(1);
    expect(oneProbe.frontierState).toMatchObject({
      probesUsed: 1,
      probeBudget: 1,
      stoppingReason: 'probe_budget_exhausted',
      frontier: [{ nodeId: 'root', status: 'eligible', probeCount: 1 }],
    });
    expect(isPlacementFrontierStateV31(oneProbe.frontierState)).toBe(true);

    const pair = ['pass', 'fail'] as const;
    const twoProbeMixed = await runAdaptivePlacement(baseConfig({
      probeBudget: 2,
      probe: async ({ probeIndex }: { probeIndex: 1 | 2 | 3 }) => ({
        probeId: `p${probeIndex}`,
        outcome: pair[probeIndex - 1]!,
        rawPerformance: probeIndex === 1 ? 1 : 0,
      }),
    }));
    expect(twoProbeMixed.decisions).toEqual([]);
    expect(twoProbeMixed.probesUsed).toBe(2);
    expect(twoProbeMixed.frontierState).toMatchObject({
      probesUsed: 2,
      probeBudget: 2,
      stoppingReason: 'probe_budget_exhausted',
      frontier: [{ nodeId: 'root', status: 'eligible', probeCount: 2 }],
    });
    expect(isPlacementFrontierStateV31(twoProbeMixed.frontierState)).toBe(true);
  });

  it('handles mixed and partial tie-break permutations normatively', async () => {
    const cases = [
      { outcomes: ['pass', 'fail', 'pass'], expected: 'advance' },
      { outcomes: ['fail', 'pass', 'pass'], expected: 'advance' },
      { outcomes: ['pass', 'partial', 'partial'], expected: 'advance' },
      { outcomes: ['partial', 'partial', 'partial'], expected: 'retreat' },
      { outcomes: ['fail', 'partial', 'pass'], expected: 'retreat' },
      { outcomes: ['partial', 'pass', 'fail'], expected: 'retreat' },
    ] as const;

    for (const { outcomes, expected } of cases) {
      const result = await runAdaptivePlacement(baseConfig({
        probe: async ({ probeIndex }: { probeIndex: 1 | 2 | 3 }) => {
          const outcome = outcomes[probeIndex - 1]!;
          return {
            probeId: `${outcome}:${probeIndex}`,
            outcome,
            rawPerformance: outcome === 'pass' ? 1 : outcome === 'partial' ? 0.625 : 0,
          };
        },
      }));
      expect(result.decisions[0]?.decision, outcomes.join('-')).toBe(expected);
      expect(result.decisions[0]?.probes).toHaveLength(3);
    }
  });

  it('can stop for stagnation mid-decision and exposes the pending probe count', async () => {
    const result = await runAdaptivePlacement(baseConfig({
      stagnationLimit: 1,
      probe: async () => ({ probeId: 'p1', outcome: 'pass', rawPerformance: 1 }),
    }));

    expect(result.stoppingReason).toBe('frontier_stagnated');
    expect(result.probesUsed).toBe(1);
    expect(result.decisions).toEqual([]);
    expect(result.frontierState).toMatchObject({
      unchangedProbeCount: 1,
      stagnationLimit: 1,
      stoppingReason: 'frontier_stagnated',
      frontier: [{ nodeId: 'root', probeCount: 1 }],
    });
    expect(isPlacementFrontierStateV31(result.frontierState)).toBe(true);
  });

  it('rejects malformed probe results and invalid stagnation inputs', async () => {
    await expect(runAdaptivePlacement(baseConfig({
      probe: async () => ({
        probeId: 'probe-1',
        outcome: 'pass',
        rawPerformance: 1,
        undeclared: true,
      }),
    }) as Parameters<typeof runAdaptivePlacement>[0])).rejects.toThrow();

    expect(() => nextPlacementStagnationCount(['root'], ['root'], -1)).toThrow(
      /non-negative integer/i,
    );
    expect(nextPlacementStagnationCount(
      ['root', 'root'],
      ['root'],
      2,
    )).toBe(3);
  });
});
