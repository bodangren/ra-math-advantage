import { describe, it, expect } from 'vitest';
import {
  mapPracticeToSrsRating,
  computeBaseRating,
  applyTimingToRating,
  type SrsRatingInput,
} from '@math-platform/practice-core/srs-rating';
import type { PracticeTimingFeatures } from '@math-platform/practice-core/timing-baseline';

function makeTimingFeatures(
  overrides: Partial<PracticeTimingFeatures> = {}
): PracticeTimingFeatures {
  return {
    hasReliableTiming: false,
    confidence: 'high',
    reasons: [],
    ...overrides,
  };
}

function makeInput(
  parts: SrsRatingInput['parts'],
  timingFeatures?: PracticeTimingFeatures,
  baselineSampleCount?: number
): SrsRatingInput {
  return {
    parts,
    timingFeatures: timingFeatures ?? makeTimingFeatures(),
    baselineSampleCount,
  };
}

describe('computeBaseRating', () => {
  it('returns Again when any part is incorrect', () => {
    const result = computeBaseRating([
      { isCorrect: true },
      { isCorrect: false },
    ]);
    expect(result).toBe('Again');
  });

  it('returns Again when any part has misconception tags', () => {
    const result = computeBaseRating([
      { isCorrect: true, misconceptionTags: ['sign_error'] },
    ]);
    expect(result).toBe('Again');
  });

  it('returns Hard when all parts are correct but hints were used', () => {
    const result = computeBaseRating([
      { isCorrect: true, hintsUsed: 1 },
    ]);
    expect(result).toBe('Hard');
  });

  it('returns Hard when all parts are correct but reveal steps were seen', () => {
    const result = computeBaseRating([
      { isCorrect: true, revealStepsSeen: 1 },
    ]);
    expect(result).toBe('Hard');
  });

  it('returns Good when all parts are correct with no aids or misconceptions', () => {
    const result = computeBaseRating([
      { isCorrect: true },
      { isCorrect: true },
    ]);
    expect(result).toBe('Good');
  });

  it('returns Again when isCorrect is undefined and there are no other indicators', () => {
    const result = computeBaseRating([{}]);
    expect(result).toBe('Again');
  });

  it('returns Again when parts array is empty', () => {
    expect(computeBaseRating([])).toBe('Again');
  });
});

describe('applyTimingToRating', () => {
  it('does not modify Again even with fast timing', () => {
    const result = applyTimingToRating('Again', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'fast' }));
    expect(result.rating).toBe('Again');
    expect(result.timingAdjusted).toBe(false);
    expect(result.reasons).toContain('timing_fast');
  });

  it('upgrades Good to Easy with fast reliable timing and clean evidence', () => {
    const result = applyTimingToRating('Good', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'fast' }));
    expect(result.rating).toBe('Easy');
    expect(result.timingAdjusted).toBe(true);
    expect(result.reasons).toContain('timing_upgraded_easy');
  });

  it('downgrades Good to Hard with slow reliable timing', () => {
    const result = applyTimingToRating('Good', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'slow' }));
    expect(result.rating).toBe('Hard');
    expect(result.timingAdjusted).toBe(true);
    expect(result.reasons).toContain('timing_downgraded_hard');
  });

  it('downgrades Good to Hard with very_slow reliable timing', () => {
    const result = applyTimingToRating('Good', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'very_slow' }));
    expect(result.rating).toBe('Hard');
    expect(result.timingAdjusted).toBe(true);
    expect(result.reasons).toContain('timing_downgraded_hard');
  });

  it('keeps Good unchanged with expected timing', () => {
    const result = applyTimingToRating('Good', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'expected' }));
    expect(result.rating).toBe('Good');
    expect(result.timingAdjusted).toBe(false);
  });

  it('keeps Hard unchanged even with fast timing', () => {
    const result = applyTimingToRating('Hard', makeTimingFeatures({ hasReliableTiming: true, speedBand: 'fast' }));
    expect(result.rating).toBe('Hard');
    expect(result.timingAdjusted).toBe(false);
  });

  it('does not modify rating when timing is not reliable', () => {
    const result = applyTimingToRating('Good', makeTimingFeatures({ hasReliableTiming: false, speedBand: 'fast' }));
    expect(result.rating).toBe('Good');
    expect(result.timingAdjusted).toBe(false);
    expect(result.reasons).toContain('timing_ignored_unreliable');
  });
});

describe('mapPracticeToSrsRating', () => {
  it('Correct plus fast plus clean evidence becomes Easy', () => {
    const result = mapPracticeToSrsRating(
      makeInput([{ isCorrect: true }], makeTimingFeatures({ hasReliableTiming: true, speedBand: 'fast' }))
    );
    expect(result.rating).toBe('Easy');
    expect(result.baseRating).toBe('Good');
    expect(result.timingAdjusted).toBe(true);
    expect(result.reasons).toContain('timing_upgraded_easy');
  });

  it('Correct plus slow/high-confidence evidence becomes Hard', () => {
    const result = mapPracticeToSrsRating(
      makeInput([{ isCorrect: true }], makeTimingFeatures({ hasReliableTiming: true, speedBand: 'slow' }))
    );
    expect(result.rating).toBe('Hard');
    expect(result.baseRating).toBe('Good');
    expect(result.timingAdjusted).toBe(true);
    expect(result.reasons).toContain('timing_downgraded_hard');
  });

  it('Incorrect plus fast evidence remains Again', () => {
    const result = mapPracticeToSrsRating(
      makeInput([{ isCorrect: false }], makeTimingFeatures({ hasReliableTiming: true, speedBand: 'fast' }))
    );
    expect(result.rating).toBe('Again');
    expect(result.baseRating).toBe('Again');
    expect(result.timingAdjusted).toBe(false);
  });

  it('Missing or low-confidence timing does not modify rating', () => {
    const result = mapPracticeToSrsRating(
      makeInput([{ isCorrect: true }], makeTimingFeatures({ hasReliableTiming: false, confidence: 'low' }))
    );
    expect(result.rating).toBe('Good');
    expect(result.baseRating).toBe('Good');
    expect(result.timingAdjusted).toBe(false);
    expect(result.reasons).toContain('timing_ignored_unreliable');
  });

  it('includes timing metadata in audit output when reliable', () => {
    const result = mapPracticeToSrsRating(
      makeInput(
        [{ isCorrect: true }],
        makeTimingFeatures({
          hasReliableTiming: true,
          speedBand: 'expected',
          timeRatio: 1.1,
          baselineMedianActiveMs: 10_000,
        })
      )
    );
    expect(result.timingFeatures).toEqual({
      hasReliableTiming: true,
      timeRatio: 1.1,
      speedBand: 'expected',
    });
  });

  it('includes baseline sample count when available', () => {
    const result = mapPracticeToSrsRating(
      makeInput(
        [{ isCorrect: true }],
        makeTimingFeatures({
          hasReliableTiming: true,
          speedBand: 'fast',
          timeRatio: 0.4,
          baselineMedianActiveMs: 10_000,
        }),
        42
      )
    );
    expect(result.timingFeatures?.hasReliableTiming).toBe(true);
    expect(result.timingFeatures?.timeRatio).toBe(0.4);
    expect(result.timingFeatures?.baselineSampleCount).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// Phase 2 (Track 6 misconception-loop_20260521) — IM3-side rating-cap Red
// proof via the public package import path. Per test-strategy §6
// ("two suites, not one"), the new severity-aware contract is asserted from
// the consumer side too. The `rateWithCap` helper mirrors the package-level
// pattern in `packages/practice-core/src/__tests__/srs-rating-cap.test.ts`
// and uses the same narrowly-scoped `as never` cast to forward the not-yet-
// existing `options` argument.
// ---------------------------------------------------------------------------

type Severity = 'minor' | 'severe';
type SeverityByTag = Readonly<Record<string, Severity>>;

function rateWithCap(
  parts: Parameters<typeof computeBaseRating>[0],
  options?: { severityByTag?: SeverityByTag },
): ReturnType<typeof computeBaseRating> {
  const loose = computeBaseRating as unknown as (
    parts: Parameters<typeof computeBaseRating>[0],
    options?: { severityByTag?: SeverityByTag },
  ) => ReturnType<typeof computeBaseRating>;
  return loose(parts, options);
}

const IM3_TAG_SIGN_ERROR = 'math.im3.misconception.sign-error';
const IM3_TAG_LINEAR = 'math.im3.misconception.linear-misuse';

describe('computeBaseRating — rating cap (Phase 2, IM3 consumer view)', () => {
  it('rating cap (IM3) — caps at Hard for a minor IM3 misconception tag, public package import', () => {
    const rating = rateWithCap(
      [
        {
          isCorrect: true,
          hintsUsed: 0,
          revealStepsSeen: 0,
          misconceptionTags: [IM3_TAG_SIGN_ERROR],
        },
      ],
      { severityByTag: { [IM3_TAG_SIGN_ERROR]: 'minor' } },
    );
    expect(rating).toBe('Hard');
  });

  it('rating cap (IM3) — forces Again for a severe IM3 misconception tag, public package import', () => {
    const rating = rateWithCap(
      [
        {
          isCorrect: true,
          hintsUsed: 0,
          revealStepsSeen: 0,
          misconceptionTags: [IM3_TAG_LINEAR],
        },
      ],
      { severityByTag: { [IM3_TAG_LINEAR]: 'severe' } },
    );
    expect(rating).toBe('Again');
  });

  it('rating cap (IM3) — defaults a tag with no severityByTag entry to "minor" and caps at Hard', () => {
    // Same default-severity invariant as the package test, validated
    // through the consumer-side import path.
    const rating = rateWithCap(
      [
        {
          isCorrect: true,
          hintsUsed: 0,
          revealStepsSeen: 0,
          misconceptionTags: [IM3_TAG_SIGN_ERROR],
        },
      ],
      { severityByTag: {} },
    );
    expect(rating).toBe('Hard');
  });
});
