import { describe, expect, it } from 'vitest';

import {
  nextPlacementStagnationCount,
  runAdaptivePlacement,
} from '../srs/adaptive-placement';
import { resolvePlacementStoppingReason } from '../srs/placement-contract';
import type {
  PlacementProbeDecisionV31,
  PlacementProbeEvidenceV31,
  PlacementProbeOutcome,
} from '../srs/placement-contract';
import type { PlacementEstimate } from '../srs/contract';

type ProbeRequest = {
  nodeId: string;
  probeIndex: 1 | 2 | 3;
};

const guessFloor = {
  policyVersion: 'math-answer-formats.v1',
  answerFormat: 'multiple-choice-4',
  value: 0.25,
} as const;

const standardInstrument = {
  instrumentId: 'math.im3.multiple-choice-4',
  instrumentVersion: '2026.1',
  instrumentPolicyVersion: 'math-placement.v1',
  guessFloorPolicyVersion: guessFloor.policyVersion,
  highFidelity: false,
} as const;

function rawPerformance(outcome: PlacementProbeOutcome): number {
  if (outcome === 'pass') return 1;
  if (outcome === 'partial') return 0.625;
  return 0;
}

function probeFrom(
  outcomesByNode: Readonly<Record<string, readonly PlacementProbeOutcome[]>>,
  calls: string[] = [],
) {
  return async ({ nodeId, probeIndex }: ProbeRequest) => {
    calls.push(`${nodeId}:${probeIndex}`);
    const outcome = outcomesByNode[nodeId]?.[probeIndex - 1];
    if (!outcome) throw new Error(`Missing fixture outcome for ${nodeId}:${probeIndex}`);
    return {
      probeId: `${nodeId}-probe-${probeIndex}`,
      outcome,
      rawPerformance: rawPerformance(outcome),
    };
  };
}

function config(
  entryPointNodeId: string,
  nodeIds: readonly string[],
  prerequisiteEdges: readonly { sourceId: string; targetId: string; weight: number }[],
  probe: ReturnType<typeof probeFrom>,
  overrides: Record<string, unknown> = {},
) {
  return {
    entryPointNodeId,
    nodes: nodeIds.map((nodeId) => ({
      nodeId,
      contentGroup: 'algebra',
      unlockValue: 1,
    })),
    prerequisiteEdges,
    hardGateThreshold: 0.8,
    guessFloor,
    instrument: standardInstrument,
    probe,
    ...overrides,
  };
}

describe('v3.1 adaptive frontier placement (intentional Red)', () => {
  it('uses two unanimous probes and a third probe only to break a mixed decision', async () => {
    const advanceCalls: string[] = [];
    const advance = await runAdaptivePlacement(config(
      'entry',
      ['entry'],
      [],
      probeFrom({ entry: ['pass', 'pass', 'fail'] }, advanceCalls),
    ));

    expect(advanceCalls).toEqual(['entry:1', 'entry:2']);
    expect(advance.decisions[0]).toMatchObject({
      nodeId: 'entry',
      decision: 'advance',
      confidenceCap: 'medium',
    });
    expect(advance.decisions[0]?.probes.map(
      (probe: PlacementProbeEvidenceV31) => probe.outcome,
    )).toEqual([
      'pass',
      'pass',
    ]);

    const tieBreakCalls: string[] = [];
    const exactTie = await runAdaptivePlacement(config(
      'entry',
      ['entry'],
      [],
      probeFrom({ entry: ['pass', 'fail', 'partial'] }, tieBreakCalls),
    ));

    expect(tieBreakCalls).toEqual(['entry:1', 'entry:2', 'entry:3']);
    expect(exactTie.decisions[0]).toMatchObject({
      nodeId: 'entry',
      decision: 'retreat',
    });
  });

  it('walks forward to hard-edge children and backward to unresolved hard-edge parents', async () => {
    const forward = await runAdaptivePlacement(config(
      'middle',
      ['parent', 'middle', 'child-a', 'child-b'],
      [
        { sourceId: 'parent', targetId: 'middle', weight: 1 },
        { sourceId: 'middle', targetId: 'child-b', weight: 1 },
        { sourceId: 'middle', targetId: 'child-a', weight: 1 },
      ],
      probeFrom({
        middle: ['pass', 'pass'],
        'child-a': ['pass', 'pass'],
        'child-b': ['fail', 'fail'],
      }),
    ));

    expect(forward.decisions.map(
      (decision: PlacementProbeDecisionV31) => [decision.nodeId, decision.decision],
    )).toEqual([
      ['middle', 'advance'],
      ['child-a', 'advance'],
      ['child-b', 'retreat'],
    ]);
    expect(forward.stoppingReason).toBe('frontier_resolved');

    const backward = await runAdaptivePlacement(config(
      'child',
      ['parent', 'child'],
      [{ sourceId: 'parent', targetId: 'child', weight: 1 }],
      probeFrom({
        child: ['fail', 'fail'],
        parent: ['pass', 'pass'],
      }),
    ));

    expect(backward.decisions.map(
      (decision: PlacementProbeDecisionV31) => [decision.nodeId, decision.decision],
    )).toEqual([
      ['child', 'retreat'],
      ['parent', 'advance'],
    ]);
  });

  it('exhausts the default 24-probe budget without probing beyond it', async () => {
    const nodeIds = Array.from({ length: 13 }, (_, index) => `node-${index}`);
    const edges = nodeIds.slice(1).map((targetId, index) => ({
      sourceId: nodeIds[index]!,
      targetId,
      weight: 1,
    }));
    const outcomes = Object.fromEntries(
      nodeIds.map((nodeId) => [nodeId, ['pass', 'pass'] as const]),
    );
    const calls: string[] = [];

    const result = await runAdaptivePlacement(config(
      nodeIds[0]!,
      nodeIds,
      edges,
      probeFrom(outcomes, calls),
    ));

    expect(result.probesUsed).toBe(24);
    expect(result.decisions).toHaveLength(12);
    expect(result.stoppingReason).toBe('probe_budget_exhausted');
    expect(calls.some((call) => call.startsWith('node-12:'))).toBe(false);
  });

  it('keeps disconnected graph components untouched', async () => {
    const calls: string[] = [];
    const result = await runAdaptivePlacement(config(
      'connected-a',
      ['connected-a', 'connected-b', 'island-a', 'island-b'],
      [
        { sourceId: 'connected-a', targetId: 'connected-b', weight: 1 },
        { sourceId: 'island-a', targetId: 'island-b', weight: 1 },
      ],
      probeFrom({
        'connected-a': ['pass', 'pass'],
        'connected-b': ['pass', 'pass'],
      }, calls),
    ));

    expect(calls).toEqual([
      'connected-a:1',
      'connected-a:2',
      'connected-b:1',
      'connected-b:2',
    ]);
    expect(result.estimates.map((estimate: PlacementEstimate) => estimate.nodeId))
      .not.toContain('island-a');
    expect(result.estimates.map((estimate: PlacementEstimate) => estimate.nodeId))
      .not.toContain('island-b');
  });

  it('counts an unchanged frontier as a set and stops at exactly four observations', () => {
    let unchangedProbeCount = 0;
    for (let observation = 0; observation < 4; observation += 1) {
      unchangedProbeCount = nextPlacementStagnationCount(
        ['node-b', 'node-a'],
        ['node-a', 'node-b'],
        unchangedProbeCount,
      );
    }

    expect(unchangedProbeCount).toBe(4);
    expect(resolvePlacementStoppingReason({
      frontier: [{ status: 'eligible' }],
      probesUsed: 4,
      probeBudget: 24,
      unchangedProbeCount,
      stagnationLimit: 4,
    })).toBe('frontier_stagnated');
    expect(nextPlacementStagnationCount(
      ['node-a', 'node-b'],
      ['node-a', 'node-c'],
      unchangedProbeCount,
    )).toBe(0);
  });

  it('produces identical output regardless of node and edge input order', async () => {
    const nodeIds = ['root', 'child-b', 'child-a'];
    const edges = [
      { sourceId: 'root', targetId: 'child-b', weight: 1 },
      { sourceId: 'root', targetId: 'child-a', weight: 1 },
    ];
    const outcomes = {
      root: ['pass', 'pass'],
      'child-a': ['pass', 'pass'],
      'child-b': ['fail', 'fail'],
    } as const;

    const canonical = await runAdaptivePlacement(config(
      'root',
      nodeIds,
      edges,
      probeFrom(outcomes),
    ));
    const reordered = await runAdaptivePlacement(config(
      'root',
      [...nodeIds].reverse(),
      [...edges].reverse(),
      probeFrom(outcomes),
    ));

    expect(reordered).toEqual(canonical);
  });

  it('caps direct confidence at medium unless the probe instrument is high fidelity', async () => {
    const standard = await runAdaptivePlacement(config(
      'entry',
      ['entry'],
      [],
      probeFrom({ entry: ['pass', 'pass'] }),
    ));
    const highFidelity = await runAdaptivePlacement(config(
      'entry',
      ['entry'],
      [],
      probeFrom({ entry: ['pass', 'pass'] }),
      { instrument: { ...standardInstrument, highFidelity: true } },
    ));

    expect(standard.estimates[0]).toMatchObject({
      nodeId: 'entry',
      confidence: 'medium',
      evidenceType: 'direct',
      inferenceDepth: 0,
    });
    expect(highFidelity.estimates[0]).toMatchObject({
      nodeId: 'entry',
      confidence: 'high',
      evidenceType: 'direct',
      inferenceDepth: 0,
    });
  });
});
