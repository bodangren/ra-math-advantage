import { z } from 'zod';
import { guessFloorRefSchema } from './proficiency-evidence-contract';

/** Contract version for the v3.1 adaptive-frontier placement release. */
export const PLACEMENT_POLICY_VERSION = 'placement.v3.1' as const;

/** Two matching probes resolve a node; every other opening pair needs a tie-break probe. */
export const PLACEMENT_DECISION_PROBE_COUNT = 2 as const;
export const PLACEMENT_TIE_BREAK_PROBE_COUNT = 3 as const;

/** Normative bounded-walk defaults from kst-srs.v3.2 §11.2. */
export const DEFAULT_PLACEMENT_PROBE_BUDGET = 24 as const;
export const DEFAULT_PLACEMENT_STAGNATION_LIMIT = 4 as const;

export const PLACEMENT_PROBE_OUTCOMES = ['pass', 'fail', 'partial'] as const;
export const PLACEMENT_DECISIONS = ['advance', 'retreat'] as const;
export const PLACEMENT_FRONTIER_STATUSES = [
  'blocked',
  'eligible',
  'mastered',
  'failed',
  'inferred',
] as const;
export const PLACEMENT_STOPPING_REASONS = [
  'probe_budget_exhausted',
  'frontier_stagnated',
  'frontier_resolved',
] as const;

export const placementProbeOutcomeSchema = z.enum(PLACEMENT_PROBE_OUTCOMES);
export const placementDecisionDirectionSchema = z.enum(PLACEMENT_DECISIONS);
export const placementFrontierStatusSchema = z.enum(PLACEMENT_FRONTIER_STATUSES);
export const placementStoppingReasonSchema = z.enum(PLACEMENT_STOPPING_REASONS);
export const placementConfidenceCapSchema = z.enum(['medium', 'high']);

/**
 * Immutable snapshot of the domain-owned probe declaration used for a probe.
 * Keeping the snapshot with the evidence makes a later audit independent of
 * whichever adapter version happens to be live at replay time.
 */
export const placementProbeInstrumentSnapshotSchema = z.strictObject({
  instrumentId: z.string().min(1),
  instrumentVersion: z.string().min(1),
  instrumentPolicyVersion: z.string().min(1),
  guessFloorPolicyVersion: z.string().min(1),
  highFidelity: z.boolean(),
});

/**
 * A single probe's auditable, guess-corrected evidence. The adapter determines
 * pass/fail/partial, while this schema proves that the numeric signal was
 * corrected against the instrument's declared guess floor.
 */
export const placementProbeEvidenceSchema = z.strictObject({
  policyVersion: z.literal(PLACEMENT_POLICY_VERSION),
  probeId: z.string().min(1),
  nodeId: z.string().min(1),
  probeIndex: z.number().int().min(1).max(PLACEMENT_TIE_BREAK_PROBE_COUNT),
  outcome: placementProbeOutcomeSchema,
  rawPerformance: z.number().finite().min(0).max(1),
  guessCorrectedPerformance: z.number().finite().min(0).max(1),
  guessFloor: guessFloorRefSchema,
  instrument: placementProbeInstrumentSnapshotSchema,
}).superRefine((evidence, ctx) => {
  const expected = Math.max(
    0,
    (evidence.rawPerformance - evidence.guessFloor.value)
      / (1 - evidence.guessFloor.value),
  );
  if (Math.abs(evidence.guessCorrectedPerformance - expected) > 1e-12) {
    ctx.addIssue({
      code: 'custom',
      path: ['guessCorrectedPerformance'],
      message: 'guessCorrectedPerformance must match the declared guess floor',
    });
  }
  if (evidence.instrument.guessFloorPolicyVersion !== evidence.guessFloor.policyVersion) {
    ctx.addIssue({
      code: 'custom',
      path: ['instrument', 'guessFloorPolicyVersion'],
      message: 'instrument guess-floor provenance must match the evidence guess floor',
    });
  }
  if (evidence.outcome === 'pass' && evidence.guessCorrectedPerformance <= 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['outcome'],
      message: 'chance-only performance cannot produce a pass',
    });
  }
});

function outcomeWeight(outcome: PlacementProbeOutcome): number {
  if (outcome === 'pass') return 1;
  if (outcome === 'partial') return 0.5;
  return 0;
}

/**
 * A completed decision for one frontier node. This is a contract validator,
 * not the traversal algorithm: callers still own probe execution and graph
 * movement, but cannot persist an internally inconsistent decision.
 */
export const placementProbeDecisionSchema = z.strictObject({
  policyVersion: z.literal(PLACEMENT_POLICY_VERSION),
  nodeId: z.string().min(1),
  probes: z.array(placementProbeEvidenceSchema)
    .min(PLACEMENT_DECISION_PROBE_COUNT)
    .max(PLACEMENT_TIE_BREAK_PROBE_COUNT),
  decision: placementDecisionDirectionSchema,
  confidenceCap: placementConfidenceCapSchema,
}).superRefine((result, ctx) => {
  const probeIds = new Set<string>();
  result.probes.forEach((probe, index) => {
    if (probeIds.has(probe.probeId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['probes', index, 'probeId'],
        message: 'probeId must be unique within a decision',
      });
    }
    probeIds.add(probe.probeId);
    if (probe.nodeId !== result.nodeId) {
      ctx.addIssue({
        code: 'custom',
        path: ['probes', index, 'nodeId'],
        message: 'every probe must target the decision node',
      });
    }
    if (probe.probeIndex !== index + 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['probes', index, 'probeIndex'],
        message: 'probeIndex must be contiguous and start at 1',
      });
    }
  });

  const first = result.probes[0];
  const second = result.probes[1];
  if (!first || !second) return;

  const unanimousPass = first.outcome === 'pass' && second.outcome === 'pass';
  const unanimousFail = first.outcome === 'fail' && second.outcome === 'fail';
  if (result.probes.length === PLACEMENT_DECISION_PROBE_COUNT) {
    if (!unanimousPass && !unanimousFail) {
      ctx.addIssue({
        code: 'custom',
        path: ['probes'],
        message: 'a non-unanimous opening pair requires a third probe',
      });
    }
  } else if (unanimousPass || unanimousFail) {
    ctx.addIssue({
      code: 'custom',
      path: ['probes'],
      message: 'a unanimous opening pair must stop after two probes',
    });
  }

  const expectedDecision = result.probes.length === PLACEMENT_DECISION_PROBE_COUNT
    ? (unanimousPass ? 'advance' : 'retreat')
    : (result.probes.reduce(
        (total, probe) => total + outcomeWeight(probe.outcome),
        0,
      ) > result.probes.length / 2 ? 'advance' : 'retreat');
  if (result.decision !== expectedDecision) {
    ctx.addIssue({
      code: 'custom',
      path: ['decision'],
      message: `decision must be ${expectedDecision} for the supplied probes`,
    });
  }

  if (
    result.confidenceCap === 'high'
    && result.probes.some((probe) => !probe.instrument.highFidelity)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['confidenceCap'],
      message: 'high confidence requires declared high-fidelity instruments',
    });
  }
});

export const placementFrontierNodeStateSchema = z.strictObject({
  nodeId: z.string().min(1),
  contentGroup: z.string().min(1).nullable().optional(),
  status: placementFrontierStatusSchema,
  probeCount: z.number().int().nonnegative().max(PLACEMENT_TIE_BREAK_PROBE_COUNT),
});

const resolvedFrontierStatuses = new Set<PlacementFrontierStatus>([
  'mastered',
  'failed',
  'inferred',
]);

type PlacementFrontierStoppingInput = {
  frontier: readonly { status: PlacementFrontierStatus }[];
  probesUsed: number;
  probeBudget: number;
  unchangedProbeCount: number;
  stagnationLimit: number;
};

/** Resolve simultaneous stop conditions in the specification's declared order. */
export function resolvePlacementStoppingReason(
  state: PlacementFrontierStoppingInput,
): PlacementStoppingReason | null {
  if (state.probesUsed >= state.probeBudget) return 'probe_budget_exhausted';
  if (state.unchangedProbeCount >= state.stagnationLimit) return 'frontier_stagnated';
  if (state.frontier.every((node) => resolvedFrontierStatuses.has(node.status))) {
    return 'frontier_resolved';
  }
  return null;
}

/** Serializable state boundary for a resumable adaptive-frontier session. */
export const placementFrontierStateSchema = z.strictObject({
  policyVersion: z.literal(PLACEMENT_POLICY_VERSION),
  entryPointNodeId: z.string().min(1),
  frontier: z.array(placementFrontierNodeStateSchema),
  probesUsed: z.number().int().nonnegative(),
  probeBudget: z.number().int().positive().default(DEFAULT_PLACEMENT_PROBE_BUDGET),
  unchangedProbeCount: z.number().int().nonnegative().default(0),
  stagnationLimit: z.number().int().positive().default(DEFAULT_PLACEMENT_STAGNATION_LIMIT),
  stoppingReason: placementStoppingReasonSchema.nullable(),
}).superRefine((state, ctx) => {
  const seen = new Set<string>();
  state.frontier.forEach((node, index) => {
    if (seen.has(node.nodeId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['frontier', index, 'nodeId'],
        message: 'frontier nodeId values must be unique',
      });
    }
    seen.add(node.nodeId);
  });
  if (state.probesUsed > state.probeBudget) {
    ctx.addIssue({
      code: 'custom',
      path: ['probesUsed'],
      message: 'probesUsed cannot exceed probeBudget',
    });
  }
  if (state.unchangedProbeCount > state.stagnationLimit) {
    ctx.addIssue({
      code: 'custom',
      path: ['unchangedProbeCount'],
      message: 'unchangedProbeCount cannot exceed stagnationLimit',
    });
  }

  const expectedReason = resolvePlacementStoppingReason(state);
  if (state.stoppingReason !== expectedReason) {
    ctx.addIssue({
      code: 'custom',
      path: ['stoppingReason'],
      message: `stoppingReason must be ${expectedReason ?? 'null'} for the supplied frontier state`,
    });
  }
});

export type PlacementProbeOutcome = z.infer<typeof placementProbeOutcomeSchema>;
export type PlacementDecisionDirection = z.infer<typeof placementDecisionDirectionSchema>;
export type PlacementFrontierStatus = z.infer<typeof placementFrontierStatusSchema>;
export type PlacementStoppingReason = z.infer<typeof placementStoppingReasonSchema>;
export type PlacementConfidenceCap = z.infer<typeof placementConfidenceCapSchema>;
export type PlacementProbeInstrumentSnapshot = z.infer<typeof placementProbeInstrumentSnapshotSchema>;
export type PlacementProbeEvidenceV31 = z.infer<typeof placementProbeEvidenceSchema>;
export type PlacementProbeDecisionV31 = z.infer<typeof placementProbeDecisionSchema>;
export type PlacementFrontierNodeState = z.infer<typeof placementFrontierNodeStateSchema>;
export type PlacementFrontierStateV31 = z.infer<typeof placementFrontierStateSchema>;

export function isPlacementProbeEvidenceV31(value: unknown): value is PlacementProbeEvidenceV31 {
  return placementProbeEvidenceSchema.safeParse(value).success;
}

export function isPlacementProbeDecisionV31(value: unknown): value is PlacementProbeDecisionV31 {
  return placementProbeDecisionSchema.safeParse(value).success;
}

export function isPlacementFrontierStateV31(value: unknown): value is PlacementFrontierStateV31 {
  return placementFrontierStateSchema.safeParse(value).success;
}
