import { describe, expect, it } from 'vitest';
import {
  SRS_RATING_POLICY_VERSION,
  TIMING_BASELINE_POLICY_VERSION,
  srsRatingResultV31Schema,
  timingZBaselineSchema,
  type SrsRatingResultV31,
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

  const validResult = (): SrsRatingResultV31 => ({
    policyVersion: SRS_RATING_POLICY_VERSION,
    rating: 'Hard' as const,
    baseRating: 'Good' as const,
    caps: {
      hint: { stage: 'hint' as const, maxRating: 'Good' as const, applied: true, reason: 'hints_1_2' },
      reveal: null,
      misconception: { stage: 'misconception' as const, maxRating: 'Hard' as const, applied: true, reason: 'minor' },
      effective: 'Hard' as const,
    },
    timingDecision: {
      eligible: false,
      confidence: 'low' as const,
      baselineSampleCount: 0,
      partDecisions: [],
      adjustment: 'none' as const,
      changedRating: false,
      reasons: ['timing_ineligible'],
    },
    timingAdjusted: false,
    misconceptionCapped: true,
    reasons: ['hints_1_2', 'minor'],
  });

  it.each([
    {
      name: 'cap in the wrong slot',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.caps.hint!.stage = 'misconception' as 'hint';
      },
    },
    {
      name: 'effective cap not equal to the lowest declared cap',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.caps.effective = 'Good' as 'Hard';
      },
    },
    {
      name: 'final rating above the effective cap',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.rating = 'Good' as 'Hard';
      },
    },
    {
      name: 'timingAdjusted inconsistent with changedRating',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.timingAdjusted = true;
      },
    },
    {
      name: 'misconceptionCapped inconsistent with cap presence',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.misconceptionCapped = false;
      },
    },
    {
      name: 'ineligible timing with an adjustment',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.timingDecision.adjustment = 'upgrade_to_easy' as 'none';
        value.timingDecision.changedRating = true;
        value.timingAdjusted = true;
      },
    },
    {
      name: 'an unavailable part with a numeric z-score',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.timingDecision.partDecisions = [{
          partId: 'p1',
          zScore: 0,
          band: 'unavailable',
        }];
      },
    },
    {
      name: 'a fast band above the inclusive threshold',
      mutate: (value: ReturnType<typeof validResult>) => {
        value.timingDecision.partDecisions = [{
          partId: 'p1',
          zScore: 0,
          band: 'fast',
        }];
      },
    },
  ])('rejects $name', ({ mutate }) => {
    const value = validResult();
    mutate(value);
    expect(srsRatingResultV31Schema.safeParse(value).success).toBe(false);
  });
});
