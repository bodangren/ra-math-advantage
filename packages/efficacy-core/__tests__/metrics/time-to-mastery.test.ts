/**
 * Phase 1 Red — Time-to-mastery metric (Task 2).
 *
 * Per-objective stat computed from a single student's cards + review logs
 * over the canonical SRS contract. Mastery is reached on the FIRST review
 * whose `stateAfter.stability` clears the configured retention threshold
 * (via `stabilityToRetention` from `@math-platform/srs-engine`).
 *
 * Imports `../../src/metrics/time-to-mastery` which does not yet exist at
 * HEAD — Red command must fail with ERR_MODULE_NOT_FOUND.
 *
 * Edge cases pinned (per test-strategy §4):
 * - no review logs (zero reviews) -> reachedMastery: false, daysToMastery: null
 * - reviews never cross threshold -> reachedMastery: false
 * - mastery on first review -> daysToMastery: 0
 * - mastery after several reviews -> deterministic day diff over UTC ms
 */

import { describe, it, expect } from 'vitest';

import { computeTimeToMastery } from '../../src/metrics/time-to-mastery';
import { stabilityToRetention } from '@math-platform/srs-engine';
import {
  COHORT_WINDOW_START_MS,
  MS_PER_DAY,
  isoAt,
  makeCard,
  makeReviewLog,
} from '../fixtures/efficacy.fixtures';

const MASTERY_RETENTION = 0.8;

describe('computeTimeToMastery', () => {
  it('returns reachedMastery=false and null daysToMastery when there are no reviews', () => {
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1', reps: 0, stability: 0 })],
      reviewLogs: [],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(result.value.objectiveId).toBe('obj_quadratic');
    expect(result.value.reachedMastery).toBe(false);
    expect(result.value.daysToMastery).toBeNull();
    expect(result.value.reviewsToMastery).toBe(0);
    expect(result.n).toBe(0);
    expect(result.inputs.masteryThreshold).toBe(MASTERY_RETENTION);
  });

  it('returns reachedMastery=false when no review clears the threshold', () => {
    // stabilityToRetention(15) ≈ 0.333; threshold 0.8 is unreachable.
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c1',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r2',
          cardId: 'c1',
          reviewedAtMs: baseMs + 1 * MS_PER_DAY,
          stateBefore: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
          stateAfter: { stability: 15, difficulty: 0, state: 'review', reps: 2, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(result.value.reachedMastery).toBe(false);
    expect(result.value.daysToMastery).toBeNull();
    expect(result.value.reviewsToMastery).toBe(2);
    expect(result.n).toBe(2);
  });

  it('returns daysToMastery=0 when the very first review clears the threshold', () => {
    // stabilityToRetention(150) ≈ 0.833 > 0.8 (default scaleFactor 30)
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c1',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 150, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(stabilityToRetention(150)).toBeGreaterThan(MASTERY_RETENTION);
    expect(result.value.reachedMastery).toBe(true);
    expect(result.value.daysToMastery).toBe(0);
    expect(result.value.reviewsToMastery).toBe(1);
  });

  it('measures days from FIRST review to FIRST review clearing the threshold', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c1',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r2',
          cardId: 'c1',
          reviewedAtMs: baseMs + 2 * MS_PER_DAY,
          stateBefore: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
          stateAfter: { stability: 40, difficulty: 0, state: 'review', reps: 2, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r3',
          cardId: 'c1',
          reviewedAtMs: baseMs + 7 * MS_PER_DAY,
          stateBefore: { stability: 40, difficulty: 0, state: 'review', reps: 2, lapses: 0 },
          stateAfter: { stability: 200, difficulty: 0, state: 'review', reps: 3, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    // First review at day 0; mastery review at day 7.
    expect(result.value.reachedMastery).toBe(true);
    expect(result.value.daysToMastery).toBe(7);
    expect(result.value.reviewsToMastery).toBe(3);
    expect(result.n).toBe(3);
  });

  it('considers reviews across multiple cards for the same objective, using earliest first-review and earliest mastery review', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [
        makeCard({ cardId: 'c_a', problemFamilyId: 'pf_a' }),
        makeCard({ cardId: 'c_b', problemFamilyId: 'pf_b' }),
      ],
      reviewLogs: [
        // c_a first review (objective baseline)
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c_a',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
        }),
        // c_b reaches mastery 3 days later
        makeReviewLog({
          reviewId: 'r2',
          cardId: 'c_b',
          reviewedAtMs: baseMs + 3 * MS_PER_DAY,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 200, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(result.value.reachedMastery).toBe(true);
    expect(result.value.daysToMastery).toBe(3);
    expect(result.value.reviewsToMastery).toBe(2);
  });

  it('ignores reviews referencing cards not in the input card set (defensive)', () => {
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        // Review for an unknown card; must be ignored
        makeReviewLog({
          reviewId: 'r_orphan',
          cardId: 'c_unknown',
          reviewedAtMs: COHORT_WINDOW_START_MS,
          stateAfter: { stability: 200, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(result.value.reachedMastery).toBe(false);
    expect(result.value.daysToMastery).toBeNull();
    expect(result.n).toBe(0);
  });

  it('counts only reviews up to and including the mastery review (not later reviews)', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_quadratic',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c1',
          reviewedAtMs: baseMs,
          stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
          stateAfter: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r2',
          cardId: 'c1',
          reviewedAtMs: baseMs + 3 * MS_PER_DAY,
          stateBefore: { stability: 5, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
          stateAfter: { stability: 200, difficulty: 0, state: 'review', reps: 2, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r3',
          cardId: 'c1',
          reviewedAtMs: baseMs + 10 * MS_PER_DAY,
          stateBefore: { stability: 200, difficulty: 0, state: 'review', reps: 2, lapses: 0 },
          stateAfter: { stability: 300, difficulty: 0, state: 'review', reps: 3, lapses: 0 },
        }),
        makeReviewLog({
          reviewId: 'r4',
          cardId: 'c1',
          reviewedAtMs: baseMs + 20 * MS_PER_DAY,
          stateBefore: { stability: 300, difficulty: 0, state: 'review', reps: 3, lapses: 0 },
          stateAfter: { stability: 400, difficulty: 0, state: 'review', reps: 4, lapses: 0 },
        }),
      ],
      masteryThreshold: MASTERY_RETENTION,
    });

    expect(result.value.reachedMastery).toBe(true);
    expect(result.value.daysToMastery).toBe(3);
    expect(result.value.reviewsToMastery).toBe(2);
    expect(result.n).toBe(4);
  });

  it('echoes objectiveId, threshold, and lastReviewAtMs in the inputs descriptor for traceability', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const result = computeTimeToMastery({
      objectiveId: 'obj_trace',
      cards: [makeCard({ cardId: 'c1' })],
      reviewLogs: [
        makeReviewLog({
          reviewId: 'r1',
          cardId: 'c1',
          reviewedAtMs: baseMs + 1 * MS_PER_DAY,
          stateAfter: { stability: 200, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
        }),
      ],
      masteryThreshold: 0.8,
    });
    expect(result.inputs.objectiveId).toBe('obj_trace');
    expect(result.inputs.masteryThreshold).toBe(0.8);
    expect(result.inputs.firstReviewAtMs).toBe(baseMs + 1 * MS_PER_DAY);
    // Sanity: ISO conversion is deterministic.
    expect(isoAt(baseMs + 1 * MS_PER_DAY)).toBe(new Date(baseMs + 1 * MS_PER_DAY).toISOString());
  });
});
