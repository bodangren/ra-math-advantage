import { describe, expect, it } from 'vitest';
import {
  SRS_RATING_POLICY_VERSION,
  TIMING_BASELINE_POLICY_VERSION,
  srsRatingResultV31Schema,
  timingZBaselineSchema,
} from '../practice/v3-1-contracts';

describe('v3.1 rating and timing contracts', () => {
  it('keeps policy versions separate from practice.v1', () => {
    expect(SRS_RATING_POLICY_VERSION).toBe('srs-rating.v3.1');
    expect(TIMING_BASELINE_POLICY_VERSION).toBe('timing-baseline.v3.1');
  });

  it('validates mean/stddev timing baselines', () => {
    expect(timingZBaselineSchema.safeParse({
      policyVersion: TIMING_BASELINE_POLICY_VERSION,
      variantKey: 'variant-1',
      sampleCount: 12,
      meanMs: 1_000,
      stdDevMs: 200,
      computedAt: '2026-07-10T00:00:00.000Z',
    }).success).toBe(true);
    expect(timingZBaselineSchema.safeParse({
      policyVersion: TIMING_BASELINE_POLICY_VERSION,
      variantKey: 'variant-1', sampleCount: -1, meanMs: 1, stdDevMs: -1,
      computedAt: 'bad',
    }).success).toBe(false);
  });

  it('requires explicit cap and timing decisions in rating output', () => {
    expect(srsRatingResultV31Schema.safeParse({
      policyVersion: SRS_RATING_POLICY_VERSION,
      rating: 'Hard',
      baseRating: 'Good',
      caps: {
        hint: { stage: 'hint', maxRating: 'Good', applied: true, reason: 'hints_1_2' },
        reveal: null,
        misconception: { stage: 'misconception', maxRating: 'Hard', applied: true, reason: 'minor' },
        effective: 'Hard',
      },
      timingDecision: {
        eligible: false,
        confidence: 'low',
        baselineSampleCount: 0,
        partDecisions: [],
        adjustment: 'none',
        changedRating: false,
        reasons: ['timing_ineligible'],
      },
      timingAdjusted: false,
      misconceptionCapped: true,
      reasons: ['hints_1_2', 'minor'],
    }).success).toBe(true);
  });
});
