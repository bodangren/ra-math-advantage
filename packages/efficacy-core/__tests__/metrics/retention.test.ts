/**
 * Phase 1 Red — Retention curve metric (Task 2).
 *
 * Asserts FR1 retention behavior over a deterministic SRS card fixture set.
 * Imports `../../src/metrics/retention` which does not yet exist at HEAD —
 * Red command fails with ERR_MODULE_NOT_FOUND. Reuses
 * `@math-platform/srs-engine` `stabilityToRetention` indirectly via the
 * canonical SRS card shape (no parallel SRS math).
 *
 * Edge cases pinned (per test-strategy §4):
 * - empty input
 * - card with reps === 0 excluded from retention but counted in coverage
 * - cohort-window boundaries (inclusive on start, exclusive on end)
 * - deterministic UTC bucketing (no DST math)
 */

import { describe, it, expect } from 'vitest';

import { computeRetentionCurve } from '../../src/metrics/retention';
import {
  COHORT_WINDOW_START_MS,
  COHORT_WINDOW_END_MS,
  MS_PER_DAY,
  isoAt,
  makeCard,
} from '../fixtures/efficacy.fixtures';

describe('computeRetentionCurve', () => {
  it('returns an empty curve and n=0 for an empty card set', () => {
    const result = computeRetentionCurve({
      cards: [],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.value).toEqual([]);
    expect(result.n).toBe(0);
    expect(result.inputs.cardCount).toBe(0);
    expect(result.inputs.windowMs).toEqual([COHORT_WINDOW_START_MS, COHORT_WINDOW_END_MS]);
  });

  it('excludes cards with reps === 0 from the retention curve', () => {
    const result = computeRetentionCurve({
      cards: [
        makeCard({ cardId: 'c_new', reps: 0, stability: 0 }),
        makeCard({ cardId: 'c_new_2', reps: 0, stability: 12 }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.value).toEqual([]);
    expect(result.n).toBe(0);
  });

  it('buckets retention by UTC day, inclusive start, exclusive end', () => {
    const reviewedDay1 = COHORT_WINDOW_START_MS + 0 * MS_PER_DAY;
    const reviewedDay2 = COHORT_WINDOW_START_MS + 1 * MS_PER_DAY;

    const result = computeRetentionCurve({
      cards: [
        makeCard({
          cardId: 'c_day1_a',
          reps: 3,
          stability: 30,
          lastReview: isoAt(reviewedDay1),
        }),
        makeCard({
          cardId: 'c_day1_b',
          reps: 3,
          stability: 90,
          lastReview: isoAt(reviewedDay1 + 60_000),
        }),
        makeCard({
          cardId: 'c_day2_a',
          reps: 5,
          stability: 30,
          lastReview: isoAt(reviewedDay2),
        }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });

    expect(result.n).toBe(3);
    expect(result.value).toHaveLength(2);

    const day1 = result.value.find((p) => p.bucketStartMs === reviewedDay1);
    const day2 = result.value.find((p) => p.bucketStartMs === reviewedDay2);
    expect(day1).toBeDefined();
    expect(day2).toBeDefined();

    // Day 1: stability 30 -> 0.5, stability 90 -> 0.75; avg 0.625
    expect(day1!.cardCount).toBe(2);
    expect(day1!.averageRetention).toBeCloseTo(0.625, 4);

    // Day 2: stability 30 -> 0.5
    expect(day2!.cardCount).toBe(1);
    expect(day2!.averageRetention).toBeCloseTo(0.5, 4);

    // Bucket end is exclusive (start + bucketMs)
    expect(day1!.bucketEndMs).toBe(reviewedDay1 + MS_PER_DAY);
  });

  it('excludes cards whose lastReview falls outside the window (start inclusive, end exclusive)', () => {
    const justBeforeWindow = COHORT_WINDOW_START_MS - 1;
    const atWindowStart = COHORT_WINDOW_START_MS;
    const atWindowEnd = COHORT_WINDOW_END_MS;

    const result = computeRetentionCurve({
      cards: [
        makeCard({ cardId: 'c_before', reps: 3, stability: 30, lastReview: isoAt(justBeforeWindow) }),
        makeCard({ cardId: 'c_at_start', reps: 3, stability: 30, lastReview: isoAt(atWindowStart) }),
        makeCard({ cardId: 'c_at_end', reps: 3, stability: 30, lastReview: isoAt(atWindowEnd) }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });

    // Only the 'at_start' card is inside [start, end).
    expect(result.n).toBe(1);
    expect(result.value).toHaveLength(1);
    expect(result.value[0].cardCount).toBe(1);
  });

  it('emits MetricResult shape with n equal to included card count and inputs trace', () => {
    const result = computeRetentionCurve({
      cards: [
        makeCard({ cardId: 'c_a', reps: 2, stability: 30 }),
        makeCard({ cardId: 'c_b', reps: 0, stability: 30 }), // excluded
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.n).toBe(1);
    expect(result.inputs.cardCount).toBe(2); // total input, not filtered
    expect(result.inputs.windowMs).toEqual([COHORT_WINDOW_START_MS, COHORT_WINDOW_END_MS]);
  });
});
