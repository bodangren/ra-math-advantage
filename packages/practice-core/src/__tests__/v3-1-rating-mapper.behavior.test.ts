import { describe, expect, it } from 'vitest';
import {
  mapPracticeToSrsRatingV31,
  type SrsRatingInputV31,
} from '../practice/srs-rating';

const COMPUTED_AT = '2026-07-10T00:00:00.000Z';

type RatingPart = SrsRatingInputV31['parts'][number];

function part(overrides: Partial<RatingPart> = {}): RatingPart {
  return {
    partId: 'p1',
    isCorrect: true,
    hintsUsed: 0,
    revealStepsSeen: 0,
    totalRevealSteps: 3,
    misconceptionTags: [],
    ...overrides,
  };
}

function input(
  parts: RatingPart[],
  options: {
    confidence?: 'low' | 'medium' | 'high';
    perPartMs?: Record<string, number>;
    sampleCount?: number;
    meanMs?: number;
    stdDevMs?: number;
    severityByTag?: Readonly<Record<string, 'minor' | 'severe'>>;
  } = {},
): SrsRatingInputV31 {
  const {
    confidence = 'medium',
    perPartMs = Object.fromEntries(parts.map(({ partId }) => [partId, 100])),
    sampleCount = 10,
    meanMs = 100,
    stdDevMs = 20,
    severityByTag = {},
  } = options;

  return {
    parts,
    timing: {
      confidence,
      perPartMs,
      baselinesByPart: Object.fromEntries(parts.map(({ partId }) => [
        partId,
        {
          policyVersion: 'timing-baseline.v3.1',
          variantKey: `variant:${partId}`,
          sampleCount,
          meanMs,
          stdDevMs,
          computedAt: COMPUTED_AT,
        },
      ])),
    },
    severityByTag,
  };
}

describe('mapPracticeToSrsRatingV31 — normative staged mapper', () => {
  it.each([
    {
      name: 'all parts correct',
      parts: [part(), part({ partId: 'p2' })],
      expectedBase: 'Good',
      expectedRating: 'Good',
    },
    {
      name: 'some parts correct',
      parts: [part(), part({ partId: 'p2', isCorrect: false })],
      expectedBase: 'Hard',
      expectedRating: 'Hard',
    },
    {
      name: 'all parts incorrect',
      parts: [part({ isCorrect: false }), part({ partId: 'p2', isCorrect: false })],
      expectedBase: 'Again',
      expectedRating: 'Again',
    },
  ] as const)('maps correctness for $name', ({ parts, expectedBase, expectedRating }) => {
    const result = mapPracticeToSrsRatingV31(input([...parts]));

    expect(result.baseRating).toBe(expectedBase);
    expect(result.rating).toBe(expectedRating);
  });

  it.each([
    { hints: [0], expected: 'Easy', cap: null },
    { hints: [2], expected: 'Good', cap: 'Good' },
    { hints: [1, 2], expected: 'Hard', cap: 'Hard' },
  ] as const)('sums $hints hints and applies the normative cap', ({ hints, expected, cap }) => {
    const parts = hints.map((hintsUsed, index) => part({
      partId: `p${index + 1}`,
      hintsUsed,
    }));
    const perPartMs = Object.fromEntries(parts.map(({ partId }) => [partId, 75]));

    const result = mapPracticeToSrsRatingV31(input(parts, { perPartMs }));

    expect(result.rating).toBe(expected);
    expect(result.caps.hint?.maxRating ?? null).toBe(cap);
  });

  it('caps a correct answer at Hard after any worked step is revealed', () => {
    const result = mapPracticeToSrsRatingV31(input([
      part({ revealStepsSeen: 1, totalRevealSteps: 3 }),
    ]));

    expect(result.rating).toBe('Hard');
    expect(result.caps.reveal?.maxRating).toBe('Hard');
  });

  it('rates an all-revealed answer Again because it is re-study, not recall', () => {
    const result = mapPracticeToSrsRatingV31(input([
      part({ revealStepsSeen: 3, totalRevealSteps: 3 }),
    ]));

    expect(result.rating).toBe('Again');
    expect(result.caps.reveal?.maxRating).toBe('Again');
  });

  it.each([
    { name: 'fast', activeMs: 75, expected: 'Easy', adjustment: 'upgrade_to_easy' },
    { name: 'slow', activeMs: 145, expected: 'Hard', adjustment: 'downgrade_one_step' },
  ] as const)(
    'applies the reliable $name timing threshold',
    ({ activeMs, expected, adjustment }) => {
      const result = mapPracticeToSrsRatingV31(input([part()], {
        perPartMs: { p1: activeMs },
      }));

      expect(result.rating).toBe(expected);
      expect(result.timingAdjusted).toBe(true);
      expect(result.timingDecision.adjustment).toBe(adjustment);
    },
  );

  it.each([
    {
      name: 'low-confidence fast timing',
      options: { confidence: 'low' as const, perPartMs: { p1: 1 } },
    },
    {
      name: 'a nine-sample slow baseline',
      options: { confidence: 'high' as const, sampleCount: 9, perPartMs: { p1: 1_000 } },
    },
  ])('does not let $name change the correctness rating', ({ options }) => {
    const result = mapPracticeToSrsRatingV31(input([part()], options));

    expect(result.rating).toBe('Good');
    expect(result.timingAdjusted).toBe(false);
    expect(result.timingDecision.eligible).toBe(false);
    expect(result.timingDecision.adjustment).toBe('none');
    expect(result.timingDecision.changedRating).toBe(false);
  });

  it('applies a minor misconception after fast timing and hint caps', () => {
    const result = mapPracticeToSrsRatingV31(input([
      part({ hintsUsed: 1, misconceptionTags: ['sign-error'] }),
    ], {
      perPartMs: { p1: 75 },
      severityByTag: { 'sign-error': 'minor' },
    }));

    expect(result.rating).toBe('Hard');
    expect(result.misconceptionCapped).toBe(true);
    expect(result.caps.misconception?.maxRating).toBe('Hard');
    expect(result.caps.effective).toBe('Hard');
  });

  it('lets a severe misconception win over every earlier stage', () => {
    const result = mapPracticeToSrsRatingV31(input([
      part({ misconceptionTags: ['structural-error'] }),
    ], {
      perPartMs: { p1: 75 },
      severityByTag: { 'structural-error': 'severe' },
    }));

    expect(result.baseRating).toBe('Good');
    expect(result.rating).toBe('Again');
    expect(result.misconceptionCapped).toBe(true);
    expect(result.caps.misconception?.maxRating).toBe('Again');
    expect(result.caps.effective).toBe('Again');
  });
});
