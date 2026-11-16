import {
  PROFICIENCY_EVIDENCE_POLICY_VERSION,
  practiceVariantEvidenceInputSchema,
  practiceVariantEvidenceResultSchema,
} from './proficiency-evidence-contract';

import type {
  PracticeAttemptEvidence,
  PracticeVariantEvidenceInputV31,
  PracticeVariantEvidenceResultV31,
} from './proficiency-evidence-contract';

export {
  PROFICIENCY_EVIDENCE_POLICY_VERSION,
  EVIDENCE_DIAGNOSTIC_REASONS,
  guessFloorRefSchema,
  practiceAttemptEvidenceSchema,
  practiceVariantEvidenceInputSchema,
  practiceVariantEvidenceResultSchema,
} from './proficiency-evidence-contract';

export type {
  GuessFloorRef,
  PracticeAttemptEvidence,
  PracticeVariantEvidenceInputV31,
  PracticeVariantEvidenceResultV31,
  EvidenceDiagnosticReason,
} from './proficiency-evidence-contract';

/** The v3.1 evidence policy decays attempt weight by half every ten attempts. */
export const PROFICIENCY_EVIDENCE_HALF_LIFE = 10;

/** One-sided 95% normal critical value required by the v3.1 evidence policy. */
export const ONE_SIDED_WILSON_Z = 1.645;

/** Timing evidence passed from the domain-specific baseline evaluator. */
export interface EvidenceTimingContext {
  baselineSampleCount: number;
  timingReliable: boolean;
  fluencyConfidence: 'none' | 'low' | 'medium' | 'high';
}

/** Recency-weighted correctness statistics before conservative correction. */
export interface RecencyWeightedCorrectness {
  weightedCorrectnessRate: number;
  effectiveSampleSize: number;
}

/**
 * A readonly-compatible input surface for callers that construct evidence with
 * `as const`. Runtime parsing still enforces the canonical strict contract.
 */
export type PracticeVariantEvidenceInput = Omit<
  PracticeVariantEvidenceInputV31,
  'attempts'
> & {
  readonly attempts: readonly PracticeAttemptEvidence[];
};

function clampUnitInterval(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Compute recency-weighted correctness using sequence only to establish order.
 * The decay distance is the attempt's ordinal position from the newest item,
 * so gaps in sequence identifiers do not invent unobserved attempts.
 */
export function computeRecencyWeightedCorrectness(
  attempts: readonly PracticeAttemptEvidence[],
): RecencyWeightedCorrectness {
  if (attempts.length === 0) {
    return { weightedCorrectnessRate: 0, effectiveSampleSize: 0 };
  }

  const ordered = [...attempts].sort((left, right) => left.sequence - right.sequence);
  let weightSum = 0;
  let squaredWeightSum = 0;
  let correctWeightSum = 0;

  ordered.forEach((attempt, index) => {
    const positionsInPast = ordered.length - index - 1;
    const weight = 0.5 ** (positionsInPast / PROFICIENCY_EVIDENCE_HALF_LIFE);
    weightSum += weight;
    squaredWeightSum += weight * weight;
    if (attempt.isCorrect) {
      correctWeightSum += weight;
    }
  });

  return {
    weightedCorrectnessRate: correctWeightSum / weightSum,
    effectiveSampleSize: (weightSum * weightSum) / squaredWeightSum,
  };
}

/** Compute the one-sided Wilson lower confidence bound for a weighted rate. */
export function oneSidedWilsonLowerBound(
  correctnessRate: number,
  effectiveSampleSize: number,
  z = ONE_SIDED_WILSON_Z,
): number {
  if (effectiveSampleSize === 0) {
    return 0;
  }
  if (
    !Number.isFinite(correctnessRate)
    || correctnessRate < 0
    || correctnessRate > 1
    || !Number.isFinite(effectiveSampleSize)
    || effectiveSampleSize < 0
    || !Number.isFinite(z)
    || z <= 0
  ) {
    throw new RangeError('Wilson inputs must be finite and within their valid ranges');
  }

  const zSquared = z * z;
  const numerator = correctnessRate
    + zSquared / (2 * effectiveSampleSize)
    - z * Math.sqrt(
      (correctnessRate * (1 - correctnessRate)
        + zSquared / (4 * effectiveSampleSize))
      / effectiveSampleSize,
    );
  const denominator = 1 + zSquared / effectiveSampleSize;
  return clampUnitInterval(numerator / denominator);
}

/** Remove the chance-performance contribution declared by the domain adapter. */
export function rescaleAgainstGuessFloor(
  conservativeCorrectness: number,
  guessFloor: number,
): number {
  if (
    !Number.isFinite(conservativeCorrectness)
    || conservativeCorrectness < 0
    || conservativeCorrectness > 1
    || !Number.isFinite(guessFloor)
    || guessFloor < 0
    || guessFloor >= 1
  ) {
    throw new RangeError('Correctness and guess floor must be finite valid probabilities');
  }
  return clampUnitInterval((conservativeCorrectness - guessFloor) / (1 - guessFloor));
}

function resolveTimingContext(context?: EvidenceTimingContext): {
  baselineSampleCount: number;
  timingReliable: boolean;
  fluencyConfidence: EvidenceTimingContext['fluencyConfidence'];
  diagnosticReason?: 'missing_timing_baseline'
    | 'insufficient_timing_baseline'
    | 'unreliable_timing';
} {
  if (context === undefined) {
    return {
      baselineSampleCount: 0,
      timingReliable: false,
      fluencyConfidence: 'none',
      diagnosticReason: 'missing_timing_baseline',
    };
  }
  if (!Number.isInteger(context.baselineSampleCount) || context.baselineSampleCount < 0) {
    throw new RangeError('baselineSampleCount must be a nonnegative integer');
  }
  if (context.baselineSampleCount < 10) {
    return {
      baselineSampleCount: context.baselineSampleCount,
      timingReliable: false,
      fluencyConfidence: 'none',
      diagnosticReason: 'insufficient_timing_baseline',
    };
  }
  if (!context.timingReliable) {
    return {
      baselineSampleCount: context.baselineSampleCount,
      timingReliable: false,
      fluencyConfidence: 'none',
      diagnosticReason: 'unreliable_timing',
    };
  }
  return {
    baselineSampleCount: context.baselineSampleCount,
    timingReliable: true,
    fluencyConfidence: context.fluencyConfidence,
  };
}

/** Execute the complete deterministic v3.1 practice-variant evidence pipeline. */
export function computePracticeVariantEvidence(
  input: PracticeVariantEvidenceInput,
  timingContext?: EvidenceTimingContext,
): PracticeVariantEvidenceResultV31 {
  const parsed = practiceVariantEvidenceInputSchema.parse({
    ...input,
    attempts: [...input.attempts],
  });
  const recency = computeRecencyWeightedCorrectness(parsed.attempts);
  const wilsonLowerBound = oneSidedWilsonLowerBound(
    recency.weightedCorrectnessRate,
    recency.effectiveSampleSize,
  );
  const retentionStrength = rescaleAgainstGuessFloor(
    wilsonLowerBound,
    parsed.guessFloor.value,
  );
  const timing = resolveTimingContext(timingContext);
  const diagnosticReasons: PracticeVariantEvidenceResultV31['diagnosticReasons'] = [];

  let evidenceConfidenceCap: PracticeVariantEvidenceResultV31['evidenceConfidenceCap'] = null;
  if (parsed.attempts.length === 0) {
    evidenceConfidenceCap = 'none';
    diagnosticReasons.push('no_attempts');
  } else if (parsed.attempts.length < 3) {
    evidenceConfidenceCap = 'low';
    diagnosticReasons.push('small_sample_low_cap');
  } else if (parsed.attempts.length < 6) {
    evidenceConfidenceCap = 'medium';
    diagnosticReasons.push('small_sample_medium_cap');
  }

  if (
    parsed.attempts.length > 0
    && parsed.guessFloor.value > 0
    && wilsonLowerBound > 0
    && retentionStrength === 0
  ) {
    diagnosticReasons.push('guess_floor_removed_signal');
  }
  if (timing.diagnosticReason !== undefined) {
    diagnosticReasons.push(timing.diagnosticReason);
  }

  return practiceVariantEvidenceResultSchema.parse({
    policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
    variantKey: parsed.variantKey,
    retentionStrength,
    practiceCoverage: parsed.practiceCoverage,
    fluencyConfidence: timing.fluencyConfidence,
    baselineSampleCount: timing.baselineSampleCount,
    timingReliable: timing.timingReliable,
    rawAttemptCount: parsed.attempts.length,
    effectiveSampleSize: recency.effectiveSampleSize,
    weightedCorrectnessRate: recency.weightedCorrectnessRate,
    wilsonLowerBound,
    guessFloor: parsed.guessFloor,
    evidenceConfidenceCap,
    diagnosticReasons,
  });
}
