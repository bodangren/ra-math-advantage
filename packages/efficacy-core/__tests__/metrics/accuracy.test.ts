/**
 * Phase 1 Red — First-attempt accuracy trend metric (Task 2).
 *
 * Derived from `PracticeSubmissionEnvelope` (canonical practice.v1 schema)
 * via the `@math-platform/practice-core` package. Only submissions with
 * `attemptNumber === 1` count toward the trend; parts with `isCorrect`
 * undefined are excluded (insufficient evidence, not "incorrect").
 *
 * Imports `../../src/metrics/accuracy` which does not yet exist at HEAD —
 * Red command must fail with ERR_MODULE_NOT_FOUND.
 *
 * Edge cases pinned (per test-strategy §4):
 * - empty submissions list
 * - only second+ attempts -> bucket has firstAttemptCount=0 and firstAttemptAccuracy=null
 *   (NOT 0, per explicit strategy callout)
 * - UTC-bucketed timestamps
 * - parts with isCorrect undefined excluded from numerator AND denominator
 */

import { describe, it, expect } from 'vitest';

import { computeAccuracyTrend } from '../../src/metrics/accuracy';
import {
  COHORT_WINDOW_START_MS,
  COHORT_WINDOW_END_MS,
  MS_PER_DAY,
  isoAt,
  makeSubmission,
} from '../fixtures/efficacy.fixtures';
import { createMockPracticeEnvelope } from '@math-platform/practice-core';

describe('computeAccuracyTrend', () => {
  it('returns an empty trend and n=0 for an empty submission list', () => {
    const result = computeAccuracyTrend({
      submissions: [],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.value).toEqual([]);
    expect(result.n).toBe(0);
  });

  it('emits firstAttemptAccuracy=null (not 0) when no first attempts exist in a populated input', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const submissions = [
      makeSubmission({ attemptNumber: 2, isCorrect: true, submittedAtMs: baseMs }).envelope,
      makeSubmission({ attemptNumber: 3, isCorrect: false, submittedAtMs: baseMs + 1000 }).envelope,
    ];
    const result = computeAccuracyTrend({
      submissions,
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    // No first attempts -> no buckets with first-attempt evidence.
    expect(result.n).toBe(0);
    expect(result.value.every((p) => p.firstAttemptAccuracy === null)).toBe(true);
  });

  it('counts only first attempts when computing the rate', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const submissions = [
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: baseMs }).envelope,
      makeSubmission({ attemptNumber: 1, isCorrect: false, submittedAtMs: baseMs + 1000 }).envelope,
      makeSubmission({ attemptNumber: 2, isCorrect: true, submittedAtMs: baseMs + 2000 }).envelope, // ignored
    ];
    const result = computeAccuracyTrend({
      submissions,
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.n).toBe(2);
    expect(result.value).toHaveLength(1);
    expect(result.value[0].firstAttemptCount).toBe(2);
    expect(result.value[0].firstAttemptAccuracy).toBeCloseTo(0.5, 6);
  });

  it('buckets accuracy by UTC day across the window', () => {
    const day1 = COHORT_WINDOW_START_MS;
    const day2 = COHORT_WINDOW_START_MS + 1 * MS_PER_DAY;
    const submissions = [
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: day1 }).envelope,
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: day1 + 5_000 }).envelope,
      makeSubmission({ attemptNumber: 1, isCorrect: false, submittedAtMs: day2 }).envelope,
    ];
    const result = computeAccuracyTrend({
      submissions,
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.value).toHaveLength(2);
    const d1 = result.value.find((p) => p.bucketStartMs === day1);
    const d2 = result.value.find((p) => p.bucketStartMs === day2);
    expect(d1?.firstAttemptCount).toBe(2);
    expect(d1?.firstAttemptAccuracy).toBeCloseTo(1.0, 6);
    expect(d2?.firstAttemptCount).toBe(1);
    expect(d2?.firstAttemptAccuracy).toBeCloseTo(0.0, 6);
    // bucketEndMs is exclusive: start + bucketMs
    expect(d1?.bucketEndMs).toBe(day1 + MS_PER_DAY);
  });

  it('excludes parts where isCorrect is undefined from both numerator and denominator', () => {
    const baseMs = COHORT_WINDOW_START_MS;
    const envelope = createMockPracticeEnvelope({
      activityId: 'act_partial',
      attemptNumber: 1,
      status: 'submitted',
      submittedAt: isoAt(baseMs),
      parts: [
        { partId: 'p1', rawAnswer: 'a', isCorrect: true },
        { partId: 'p2', rawAnswer: 'b' }, // isCorrect undefined -> excluded
        { partId: 'p3', rawAnswer: 'c', isCorrect: false },
      ],
    });

    const result = computeAccuracyTrend({
      submissions: [envelope],
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });

    // 1 correct of 2 graded parts = 0.5.
    expect(result.value).toHaveLength(1);
    expect(result.value[0].firstAttemptAccuracy).toBeCloseTo(0.5, 6);
    expect(result.value[0].firstAttemptCount).toBe(2);
  });

  it('excludes submissions submitted outside [windowStart, windowEnd)', () => {
    const justBeforeWindow = COHORT_WINDOW_START_MS - 1;
    const atWindowStart = COHORT_WINDOW_START_MS;
    const atWindowEnd = COHORT_WINDOW_END_MS;
    const submissions = [
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: justBeforeWindow }).envelope,
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: atWindowStart }).envelope,
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: atWindowEnd }).envelope,
    ];
    const result = computeAccuracyTrend({
      submissions,
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    // Only the 'at_start' submission is inside [start, end).
    expect(result.n).toBe(1);
  });

  it('echoes window and submissionCount in the inputs descriptor for traceability', () => {
    const submissions = [
      makeSubmission({ attemptNumber: 1, isCorrect: true, submittedAtMs: COHORT_WINDOW_START_MS }).envelope,
      makeSubmission({ attemptNumber: 2, isCorrect: true, submittedAtMs: COHORT_WINDOW_START_MS + 1000 }).envelope,
    ];
    const result = computeAccuracyTrend({
      submissions,
      windowStartMs: COHORT_WINDOW_START_MS,
      windowEndMs: COHORT_WINDOW_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.inputs.submissionCount).toBe(2); // total input, not filtered
    expect(result.inputs.windowMs).toEqual([COHORT_WINDOW_START_MS, COHORT_WINDOW_END_MS]);
    expect(result.n).toBe(1); // only first attempts counted
  });
});
