/**
 * Phase 1 Red — Review-success rate metric (Task 2).
 *
 * Computes the fraction of SRS reviews rated Good or Easy across an input
 * set of `SrsReviewLogEntry` values. Reuses the canonical FSRS rating
 * enum from `@math-platform/srs-engine` — no parallel rating shape.
 *
 * Imports `../../src/metrics/review-success` which does not yet exist at
 * HEAD — Red command must fail with ERR_MODULE_NOT_FOUND.
 *
 * Edge cases pinned (per test-strategy §4):
 * - empty input -> successRate=null (NOT 0), ratingBreakdown all zero
 * - all Again -> successRate=0
 * - all Easy  -> successRate=1
 * - mixed     -> exact breakdown
 * - time-window filter excludes out-of-window reviews
 */

import { describe, it, expect } from 'vitest';

import { computeReviewSuccessRate } from '../../src/metrics/review-success';
import {
  COHORT_WINDOW_START_MS,
  COHORT_WINDOW_END_MS,
  MS_PER_DAY,
  makeReviewLog,
} from '../fixtures/efficacy.fixtures';

describe('computeReviewSuccessRate', () => {
  it('returns successRate=null and all-zero ratingBreakdown for empty input', () => {
    const result = computeReviewSuccessRate({
      reviewLogs: [],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.value.successRate).toBeNull();
    expect(result.value.successCount).toBe(0);
    expect(result.value.totalCount).toBe(0);
    expect(result.value.ratingBreakdown).toEqual({ Again: 0, Hard: 0, Good: 0, Easy: 0 });
    expect(result.n).toBe(0);
  });

  it('returns successRate=0 when every review is Again', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeReviewSuccessRate({
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          rating: 'Again',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 1, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
          stateAfter: { stability: 0.5, difficulty: 0, state: 'relearning', reps: 2, lapses: 1 },
        }),
        makeReviewLog({
          reviewId: 'r2',
          rating: 'Again',
          reviewedAtMs: baseMs + 1 * MS_PER_DAY,
          stateBefore: { stability: 0.5, difficulty: 0, state: 'relearning', reps: 2, lapses: 1 },
          stateAfter: { stability: 0.3, difficulty: 0, state: 'relearning', reps: 3, lapses: 2 },
        }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.value.successRate).toBe(0);
    expect(result.value.successCount).toBe(0);
    expect(result.value.totalCount).toBe(2);
    expect(result.value.ratingBreakdown.Again).toBe(2);
    expect(result.value.ratingBreakdown.Good).toBe(0);
    expect(result.n).toBe(2);
  });

  it('returns successRate=1 when every review is Easy', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeReviewSuccessRate({
      reviewLogs: [
        makeReviewLog({ reviewId: 'r1', rating: 'Easy', reviewedAtMs: baseMs }),
        makeReviewLog({ reviewId: 'r2', rating: 'Easy', reviewedAtMs: baseMs + 1000 }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.value.successRate).toBe(1);
    expect(result.value.successCount).toBe(2);
    expect(result.value.totalCount).toBe(2);
    expect(result.value.ratingBreakdown.Easy).toBe(2);
    expect(result.value.ratingBreakdown.Good).toBe(0);
  });

  it('classifies Good and Easy as success; Again and Hard as failure', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeReviewSuccessRate({
      reviewLogs: [
        makeReviewLog({ reviewId: 'r1', rating: 'Again', reviewedAtMs: baseMs }),
        makeReviewLog({ reviewId: 'r2', rating: 'Hard', reviewedAtMs: baseMs + 1000 }),
        makeReviewLog({ reviewId: 'r3', rating: 'Good', reviewedAtMs: baseMs + 2000 }),
        makeReviewLog({ reviewId: 'r4', rating: 'Good', reviewedAtMs: baseMs + 3000 }),
        makeReviewLog({ reviewId: 'r5', rating: 'Easy', reviewedAtMs: baseMs + 4000 }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.value.totalCount).toBe(5);
    expect(result.value.successCount).toBe(3); // 2 Good + 1 Easy
    expect(result.value.successRate).toBeCloseTo(0.6, 6);
    expect(result.value.ratingBreakdown).toEqual({ Again: 1, Hard: 1, Good: 2, Easy: 1 });
  });

  it('excludes reviews whose reviewedAt is outside [windowStart, windowEnd)', () => {
    const result = computeReviewSuccessRate({
      reviewLogs: [
        makeReviewLog({ reviewId: 'r_before', rating: 'Good', reviewedAtMs: COHORT_WINDOW_START_MS - 1 }),
        makeReviewLog({ reviewId: 'r_at_start', rating: 'Good', reviewedAtMs: COHORT_WINDOW_START_MS }),
        makeReviewLog({ reviewId: 'r_at_end', rating: 'Good', reviewedAtMs: COHORT_WINDOW_END_MS }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.value.totalCount).toBe(1);
    expect(result.value.successCount).toBe(1);
    expect(result.n).toBe(1);
  });

  it('echoes the time window in the inputs descriptor for traceability', () => {
    const result = computeReviewSuccessRate({
      reviewLogs: [
        makeReviewLog({ reviewId: 'r1', rating: 'Good', reviewedAtMs: COHORT_WINDOW_START_MS }),
      ],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
    });
    expect(result.inputs.windowMs).toEqual([COHORT_WINDOW_START_MS, COHORT_WINDOW_END_MS]);
    expect(result.inputs.reviewCount).toBe(1);
  });
});
