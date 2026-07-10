import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLACEMENT_PROBE_BUDGET,
  DEFAULT_PLACEMENT_STAGNATION_LIMIT,
  PLACEMENT_DECISION_PROBE_COUNT,
  PLACEMENT_POLICY_VERSION,
  PLACEMENT_TIE_BREAK_PROBE_COUNT,
  isPlacementFrontierStateV31,
  isPlacementProbeDecisionV31,
  isPlacementProbeEvidenceV31,
  placementFrontierStateSchema,
  placementProbeDecisionSchema,
  placementProbeEvidenceSchema,
} from '../srs/placement-contract';
import { PLACEMENT_POLICY_VERSION as contractSurfaceVersion } from '../srs/contract';
import { PLACEMENT_POLICY_VERSION as placementSurfaceVersion } from '../srs/placement';
import { PLACEMENT_POLICY_VERSION as rootSurfaceVersion } from '../index';
import { PLACEMENT_POLICY_VERSION as packageSubpathVersion } from '@math-platform/srs-engine/placement-contract';

const instrument = {
  instrumentId: 'math.im3.multiple-choice-4',
  instrumentVersion: '2026.1',
  instrumentPolicyVersion: 'math-placement.v1',
  guessFloorPolicyVersion: 'math-answer-formats.v1',
  highFidelity: false,
} as const;

const guessFloor = {
  policyVersion: 'math-answer-formats.v1',
  answerFormat: 'multiple-choice-4',
  value: 0.25,
} as const;

function probe(
  probeIndex: 1 | 2 | 3,
  outcome: 'pass' | 'fail' | 'partial',
  overrides: Record<string, unknown> = {},
) {
  const rawPerformance = outcome === 'pass' ? 1 : outcome === 'partial' ? 0.625 : 0;
  return {
    policyVersion: PLACEMENT_POLICY_VERSION,
    probeId: `probe-${probeIndex}`,
    nodeId: 'math.im3.linear-functions',
    probeIndex,
    outcome,
    rawPerformance,
    guessCorrectedPerformance: Math.max(0, (rawPerformance - 0.25) / 0.75),
    guessFloor,
    instrument,
    ...overrides,
  };
}

describe('v3.1 placement probe evidence contract', () => {
  it('versions deterministic policy defaults', () => {
    expect(PLACEMENT_POLICY_VERSION).toBe('placement.v3.1');
    expect(PLACEMENT_DECISION_PROBE_COUNT).toBe(2);
    expect(PLACEMENT_TIE_BREAK_PROBE_COUNT).toBe(3);
    expect(DEFAULT_PLACEMENT_PROBE_BUDGET).toBe(24);
    expect(DEFAULT_PLACEMENT_STAGNATION_LIMIT).toBe(4);
    expect([
      contractSurfaceVersion,
      placementSurfaceVersion,
      rootSurfaceVersion,
      packageSubpathVersion,
    ]).toEqual(Array(4).fill(PLACEMENT_POLICY_VERSION));
  });

  it('requires auditable guess correction and rejects chance-only passes', () => {
    expect(isPlacementProbeEvidenceV31(probe(1, 'pass'))).toBe(true);

    expect(placementProbeEvidenceSchema.safeParse(probe(1, 'pass', {
      rawPerformance: 0.25,
      guessCorrectedPerformance: 0,
    })).success).toBe(false);

    expect(placementProbeEvidenceSchema.safeParse(probe(1, 'fail', {
      guessCorrectedPerformance: 0.5,
    })).success).toBe(false);

    expect(placementProbeEvidenceSchema.safeParse(probe(1, 'pass', {
      instrument: {
        ...instrument,
        guessFloorPolicyVersion: 'different-floor-policy.v2',
      },
    })).success).toBe(false);
  });

  it('rejects unknown fields instead of silently accepting contract drift', () => {
    expect(placementProbeEvidenceSchema.safeParse({
      ...probe(1, 'pass'),
      rawCorrect: true,
    }).success).toBe(false);
    expect(placementProbeEvidenceSchema.safeParse(probe(1, 'pass', {
      instrument: {
        instrumentId: instrument.instrumentId,
        instrumentVersion: instrument.instrumentVersion,
        policyVersion: instrument.instrumentPolicyVersion,
        highFidelity: false,
      },
    })).success).toBe(false);
  });
});

describe('v3.1 strict two-probe decision contract', () => {
  it('accepts unanimous two-probe decisions', () => {
    const advance = {
      policyVersion: PLACEMENT_POLICY_VERSION,
      nodeId: 'math.im3.linear-functions',
      probes: [probe(1, 'pass'), probe(2, 'pass')],
      decision: 'advance',
      confidenceCap: 'medium',
    };

    expect(placementProbeDecisionSchema.parse(advance).decision).toBe('advance');
    expect(isPlacementProbeDecisionV31({
      ...advance,
      probes: [probe(1, 'fail'), probe(2, 'fail')],
      decision: 'retreat',
    })).toBe(true);
    expect(placementProbeDecisionSchema.safeParse({
      ...advance,
      decision: 'retreat',
    }).success).toBe(false);
  });

  it('requires a third probe for every non-unanimous opening pair', () => {
    const mixedPair = {
      policyVersion: PLACEMENT_POLICY_VERSION,
      nodeId: 'math.im3.linear-functions',
      probes: [probe(1, 'pass'), probe(2, 'fail')],
      decision: 'retreat',
      confidenceCap: 'medium',
    };
    expect(placementProbeDecisionSchema.safeParse(mixedPair).success).toBe(false);
    expect(placementProbeDecisionSchema.safeParse({
      ...mixedPair,
      probes: [...mixedPair.probes, probe(3, 'pass')],
      decision: 'advance',
    }).success).toBe(true);
    expect(placementProbeDecisionSchema.safeParse({
      ...mixedPair,
      probes: [probe(1, 'partial'), probe(2, 'partial')],
    }).success).toBe(false);
  });

  it('counts partial as half a pass and validates the declared decision', () => {
    const probes = [probe(1, 'pass'), probe(2, 'partial'), probe(3, 'fail')];
    const base = {
      policyVersion: PLACEMENT_POLICY_VERSION,
      nodeId: 'math.im3.linear-functions',
      probes,
      confidenceCap: 'medium',
    };

    expect(placementProbeDecisionSchema.safeParse({ ...base, decision: 'retreat' }).success).toBe(true);
    expect(placementProbeDecisionSchema.safeParse({ ...base, decision: 'advance' }).success).toBe(false);
  });

  it('permits a high confidence cap only when every probe uses a declared high-fidelity instrument', () => {
    const standard = {
      policyVersion: PLACEMENT_POLICY_VERSION,
      nodeId: 'math.im3.linear-functions',
      probes: [probe(1, 'pass'), probe(2, 'pass')],
      decision: 'advance',
      confidenceCap: 'high',
    };
    expect(placementProbeDecisionSchema.safeParse(standard).success).toBe(false);

    const highFidelityInstrument = { ...instrument, highFidelity: true };
    expect(placementProbeDecisionSchema.safeParse({
      ...standard,
      probes: [
        probe(1, 'pass', { instrument: highFidelityInstrument }),
        probe(2, 'pass', { instrument: highFidelityInstrument }),
      ],
    }).success).toBe(true);
  });
});

describe('v3.1 frontier-state and stopping contracts', () => {
  const activeFrontier = {
    policyVersion: PLACEMENT_POLICY_VERSION,
    entryPointNodeId: 'math.im3.linear-functions',
    frontier: [
      {
        nodeId: 'math.im3.linear-functions',
        contentGroup: 'functions',
        status: 'eligible',
        probeCount: 0,
      },
    ],
    probesUsed: 0,
    stoppingReason: null,
  } as const;

  it('applies the bounded defaults and validates active state', () => {
    const parsed = placementFrontierStateSchema.parse(activeFrontier);
    expect(parsed.probeBudget).toBe(24);
    expect(parsed.stagnationLimit).toBe(4);
    expect(parsed.unchangedProbeCount).toBe(0);
    expect(isPlacementFrontierStateV31(parsed)).toBe(true);
  });

  it('requires unique frontier nodes and a valid budget accounting', () => {
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      frontier: [...activeFrontier.frontier, activeFrontier.frontier[0]],
    }).success).toBe(false);
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      probesUsed: 25,
    }).success).toBe(false);
  });

  it('enforces deterministic budget, stagnation, and resolution stopping reasons', () => {
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      probesUsed: 24,
      stoppingReason: 'probe_budget_exhausted',
    }).success).toBe(true);
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      unchangedProbeCount: 4,
      stoppingReason: 'frontier_stagnated',
    }).success).toBe(true);
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      frontier: [{ ...activeFrontier.frontier[0], status: 'mastered' }],
      stoppingReason: 'frontier_resolved',
    }).success).toBe(true);
    expect(placementFrontierStateSchema.safeParse({
      ...activeFrontier,
      probesUsed: 24,
      stoppingReason: null,
    }).success).toBe(false);
  });
});
