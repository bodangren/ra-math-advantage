import { describe, expect, it } from 'vitest';

import { PROFICIENCY_EVIDENCE_POLICY_VERSION } from '../srs/proficiency-evidence-contract';
import {
  computePracticeVariantEvidence,
  computeRecencyWeightedCorrectness,
  oneSidedWilsonLowerBound,
  rescaleAgainstGuessFloor,
} from '../srs/proficiency-evidence';

const reliableTiming = {
  baselineSampleCount: 12,
  timingReliable: true,
  fluencyConfidence: 'high',
} as const;

function attemptsFromOutcomes(
  outcomesOldestToNewest: readonly boolean[],
  answerFormat = 'free-response',
) {
  return outcomesOldestToNewest.map((isCorrect, sequence) => ({
    attemptId: `attempt-${sequence}`,
    sequence,
    isCorrect,
    answerFormat,
  }));
}

function evidenceInput(
  outcomesOldestToNewest: readonly boolean[],
  guessFloor = 0,
  answerFormat = 'free-response',
) {
  return {
    policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
    variantKey: 'variant-linear-equations',
    attempts: attemptsFromOutcomes(outcomesOldestToNewest, answerFormat),
    practiceCoverage: 0.8,
    guessFloor: {
      policyVersion: 'math-answer-formats.v1',
      answerFormat,
      value: guessFloor,
    },
  } as const;
}

describe('v3.1 recency-weighted proficiency evidence mathematics', () => {
  it('weights newer sequence positions more heavily and ignores array order', () => {
    const chronological = attemptsFromOutcomes([
      false, false, false, false, false, false,
      true, true, true, true, true, true,
    ]);
    const shuffled = [
      chronological[8], chronological[1], chronological[11], chronological[4],
      chronological[6], chronological[0], chronological[9], chronological[3],
      chronological[10], chronological[5], chronological[7], chronological[2],
    ];

    const improving = computeRecencyWeightedCorrectness(shuffled);
    const regressing = computeRecencyWeightedCorrectness(
      attemptsFromOutcomes([
        true, true, true, true, true, true,
        false, false, false, false, false, false,
      ]),
    );

    expect(improving.weightedCorrectnessRate).toBeCloseTo(0.6024989407, 10);
    expect(improving.effectiveSampleSize).toBeCloseTo(11.3574271462, 10);
    expect(regressing.weightedCorrectnessRate).toBeCloseTo(0.3975010593, 10);
    expect(improving.weightedCorrectnessRate).toBeGreaterThan(regressing.weightedCorrectnessRate);
  });

  it('matches the independent Wilson and guess-floor fixtures from the v3.1 spec', () => {
    expect(oneSidedWilsonLowerBound(0.3, 10)).toBeCloseTo(0.1268668529, 10);
    expect(oneSidedWilsonLowerBound(0.8, 10)).toBeCloseTo(0.5407687136, 10);
    expect(oneSidedWilsonLowerBound(1, 5)).toBeCloseTo(0.6488429508, 10);

    expect(rescaleAgainstGuessFloor(0.1268668529, 0.25)).toBe(0);
    expect(rescaleAgainstGuessFloor(0.5407687136, 0.25))
      .toBeCloseTo(0.3876916181, 10);
    expect(rescaleAgainstGuessFloor(0.5407687136, 0))
      .toBeCloseTo(0.5407687136, 10);
  });

  it('applies recency, Wilson, and guess correction as one deterministic pipeline', () => {
    const multipleChoice = computePracticeVariantEvidence(
      evidenceInput(
        [false, false, true, true, true, true, true, true, true, true],
        0.25,
        'multiple-choice-4',
      ),
      reliableTiming,
    );
    const freeResponse = computePracticeVariantEvidence(
      evidenceInput(
        [false, false, true, true, true, true, true, true, true, true],
        0,
      ),
      reliableTiming,
    );

    expect(multipleChoice.weightedCorrectnessRate).toBeCloseTo(0.851301645, 9);
    expect(multipleChoice.wilsonLowerBound).toBeCloseTo(0.5905240071, 10);
    expect(multipleChoice.retentionStrength).toBeCloseTo(0.4540320095, 10);
    expect(freeResponse.retentionStrength).toBeCloseTo(0.5905240071, 10);
    expect(multipleChoice.retentionStrength).toBeLessThan(freeResponse.retentionStrength);
  });

  it('removes chance-level signal and remains finite at zero and one extremes', () => {
    const chance = computePracticeVariantEvidence(
      evidenceInput(
        [false, false, false, false, false, false, false, true, true, true],
        0.25,
        'multiple-choice-4',
      ),
      reliableTiming,
    );
    const noneCorrect = computePracticeVariantEvidence(
      evidenceInput([false, false, false, false, false, false]),
      reliableTiming,
    );
    const allCorrect = computePracticeVariantEvidence(
      evidenceInput([true, true, true, true, true, true]),
      reliableTiming,
    );

    expect(chance.wilsonLowerBound).toBeCloseTo(0.1743065096, 10);
    expect(chance.retentionStrength).toBe(0);
    expect(chance.diagnosticReasons).toContain('guess_floor_removed_signal');
    expect(noneCorrect.weightedCorrectnessRate).toBe(0);
    expect(noneCorrect.wilsonLowerBound).toBe(0);
    expect(noneCorrect.retentionStrength).toBe(0);
    expect(allCorrect.wilsonLowerBound).toBeCloseTo(0.6861990884, 10);
    expect(allCorrect.retentionStrength).toBeCloseTo(0.6861990884, 10);
    for (const value of [
      chance.retentionStrength,
      noneCorrect.retentionStrength,
      allCorrect.retentionStrength,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('v3.1 proficiency evidence confidence and timing diagnostics', () => {
  it.each([
    { count: 2, cap: 'low', reason: 'small_sample_low_cap' },
    { count: 3, cap: 'medium', reason: 'small_sample_medium_cap' },
    { count: 5, cap: 'medium', reason: 'small_sample_medium_cap' },
    { count: 6, cap: null, reason: null },
  ] as const)('caps $count attempts at $cap', ({ count, cap, reason }) => {
    const result = computePracticeVariantEvidence(
      evidenceInput(Array.from({ length: count }, () => true)),
      reliableTiming,
    );

    expect(result.rawAttemptCount).toBe(count);
    expect(result.evidenceConfidenceCap).toBe(cap);
    if (reason === null) {
      expect(result.diagnosticReasons).not.toContain('small_sample_low_cap');
      expect(result.diagnosticReasons).not.toContain('small_sample_medium_cap');
    } else {
      expect(result.diagnosticReasons).toContain(reason);
    }
  });

  it('fails closed without attempts instead of producing NaN', () => {
    const result = computePracticeVariantEvidence(evidenceInput([]), reliableTiming);

    expect(result.rawAttemptCount).toBe(0);
    expect(result.effectiveSampleSize).toBe(0);
    expect(result.weightedCorrectnessRate).toBe(0);
    expect(result.wilsonLowerBound).toBe(0);
    expect(result.retentionStrength).toBe(0);
    expect(result.evidenceConfidenceCap).toBe('none');
    expect(result.diagnosticReasons).toContain('no_attempts');
  });

  it('distinguishes missing, insufficient, unreliable, and reliable timing evidence', () => {
    const input = evidenceInput([true, true, true, true, true, true]);
    const missing = computePracticeVariantEvidence(input);
    const insufficient = computePracticeVariantEvidence(input, {
      baselineSampleCount: 5,
      timingReliable: false,
      fluencyConfidence: 'none',
    });
    const unreliable = computePracticeVariantEvidence(input, {
      baselineSampleCount: 12,
      timingReliable: false,
      fluencyConfidence: 'low',
    });
    const reliable = computePracticeVariantEvidence(input, reliableTiming);

    expect(missing.diagnosticReasons).toContain('missing_timing_baseline');
    expect(insufficient.diagnosticReasons).toContain('insufficient_timing_baseline');
    expect(unreliable.diagnosticReasons).toContain('unreliable_timing');
    expect(unreliable.fluencyConfidence).toBe('none');
    expect(reliable.diagnosticReasons).not.toContain('missing_timing_baseline');
    expect(reliable.diagnosticReasons).not.toContain('insufficient_timing_baseline');
    expect(reliable.diagnosticReasons).not.toContain('unreliable_timing');
    expect(reliable.fluencyConfidence).toBe('high');
  });
});
