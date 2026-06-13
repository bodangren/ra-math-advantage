/**
 * Phase 2 Red — Batched cohort aggregation (Task 1 of Phase 2).
 *
 * Asserts FR2 cohort behavior over a fake `ctx.db` that mimics the
 * Convex query surface. Mirrors the dashboard.test.ts handler-as-pure-fn
 * pattern (test-strategy §3 item 4).
 *
 * The handler under test is imported from `@/convex/efficacy/cohort`,
 * which does not exist at HEAD — the Red command must fail with
 * ERR_MODULE_NOT_FOUND for at least the import line, then surface the
 * missing-impl state on every assertion.
 *
 * Contract pinned (per test-strategy §4 + §6 Phase 2):
 * - Discriminated union result: `{ status: 'ok' | 'suppressed', ... }`.
 * - Time window: inclusive start, exclusive end, UTC boundaries.
 * - Active enrollments only (drops 'withdrawn'/'completed' rows).
 * - No N+1: total `db.query` call count is bounded by a small constant
 *   independent of class size.
 * - Calls into `@math-platform/efficacy-core` metric fns (retention +
 *   review-success at minimum) — proves the boundary-clean reuse is
 *   wired, not re-implemented.
 * - Empty cohort returns `{ status: 'ok', n: 0, metrics: <empty> }`,
 *   NOT `'suppressed'` (suppression is a *separate* concern — see
 *   suppression.test.ts).
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  computeRetentionCurve,
  computeReviewSuccessRate,
} from '@math-platform/efficacy-core';

import { aggregateCohortMetricsHandler } from '@/convex/efficacy/cohort';

// ============================================
// Deterministic time anchors
// ============================================

const COHORT_START_MS = Date.UTC(2026, 3, 1, 0, 0, 0); // 2026-04-01
const COHORT_END_MS = Date.UTC(2026, 4, 1, 0, 0, 0); // 2026-05-01
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const CLASS_ID = 'class_red_001' as Id<'classes'>;

function makeEnrollment(args: {
  studentId: string;
  status?: 'active' | 'withdrawn' | 'completed';
  enrolledAtMs?: number;
}) {
  const { studentId, status = 'active', enrolledAtMs = COHORT_START_MS - MS_PER_DAY } = args;
  return {
    _id: `enroll_${studentId}` as Id<'class_enrollments'>,
    _creationTime: enrolledAtMs,
    classId: CLASS_ID,
    studentId: studentId as Id<'profiles'>,
    enrolledAt: enrolledAtMs,
    status,
    createdAt: enrolledAtMs,
    updatedAt: enrolledAtMs,
  };
}

function makeSrsCard(args: {
  studentId: string;
  cardId: string;
  stability: number;
  reps: number;
  lastReviewMs?: number;
}) {
  const { studentId, cardId, stability, reps, lastReviewMs = COHORT_START_MS + 1 * MS_PER_DAY } = args;
  return {
    _id: `card_${cardId}` as Id<'srs_cards'>,
    _creationTime: COHORT_START_MS,
    cardId,
    studentId: studentId as Id<'profiles'>,
    objectiveId: `obj_${cardId}`,
    problemFamilyId: `pf_${cardId}`,
    stability,
    difficulty: 3,
    state: 'review' as const,
    dueDate: new Date(COHORT_START_MS + 30 * MS_PER_DAY).toISOString(),
    elapsedDays: 1,
    scheduledDays: 30,
    reps,
    lapses: 0,
    lastReview: new Date(lastReviewMs).toISOString(),
    createdAt: COHORT_START_MS,
    updatedAt: COHORT_START_MS,
  };
}

function makeReviewLog(args: {
  studentId: string;
  cardId: string;
  rating: 'Again' | 'Hard' | 'Good' | 'Easy';
  reviewedAtMs: number;
}) {
  const { studentId, cardId, rating, reviewedAtMs } = args;
  return {
    _id: `rev_${cardId}_${reviewedAtMs}` as Id<'srs_review_log'>,
    _creationTime: reviewedAtMs,
    cardId: `card_${cardId}` as Id<'srs_cards'>,
    studentId: studentId as Id<'profiles'>,
    rating,
    reviewId: `r_${cardId}_${reviewedAtMs}`,
    submissionId: `s_${cardId}_${reviewedAtMs}`,
    evidence: {},
    stateBefore: { stability: 0, difficulty: 0, state: 'review', reps: 0, lapses: 0 },
    stateAfter: { stability: 1, difficulty: 0, state: 'review', reps: 1, lapses: 0 },
    reviewedAt: reviewedAtMs,
  };
}

// ============================================
// Fake ctx.db proxy: counts every .query() call
// and serves registered rows per (table, index) pair.
// ============================================

interface FakeCtxOptions {
  enrollments?: ReturnType<typeof makeEnrollment>[];
  cards?: ReturnType<typeof makeSrsCard>[];
  reviews?: ReturnType<typeof makeReviewLog>[];
}

function makeFakeCtx(opts: FakeCtxOptions = {}) {
  const { enrollments = [], cards = [], reviews = [] } = opts;
  const queryCallLog: Array<{ table: string; index?: string }> = [];

  function tableQuery(tableName: string) {
    return {
      withIndex: (
        _indexName: string,
        _fn?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        queryCallLog.push({ table: tableName, index: _indexName });
        if (tableName === 'class_enrollments') {
          return {
            collect: async () => enrollments,
            filter: () => ({
              collect: async () => enrollments,
            }),
          };
        }
        if (tableName === 'srs_cards') {
          return {
            collect: async () => cards,
            filter: () => ({
              collect: async () => cards,
            }),
          };
        }
        if (tableName === 'srs_review_log') {
          return {
            collect: async () => reviews,
            filter: () => ({
              collect: async () => reviews,
            }),
          };
        }
        return { collect: async () => [] };
      },
    };
  }

  const ctx = {
    db: {
      query: vi.fn().mockImplementation((tableName: string) => {
        queryCallLog.push({ table: tableName });
        return tableQuery(tableName);
      }),
    },
  };

  return { ctx, queryCallLog };
}

function countQueryCalls(log: Array<{ table: string; index?: string }>): number {
  return log.length;
}

// ============================================
// Tests
// ============================================

describe('aggregateCohortMetricsHandler (Phase 2 Red — Task 1)', () => {
  it('returns status: "ok" with n equal to active enrollment count for a non-empty cohort', async () => {
    const { ctx, queryCallLog } = makeFakeCtx({
      enrollments: [
        makeEnrollment({ studentId: 'stu_a' }),
        makeEnrollment({ studentId: 'stu_b' }),
        makeEnrollment({ studentId: 'stu_c' }),
      ],
    });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    expect(result.status).toBe('ok');
    expect(result.n).toBe(3);
    // Sanity: the handler actually called ctx.db (not a no-op).
    expect(countQueryCalls(queryCallLog)).toBeGreaterThan(0);
  });

  it('returns status: "ok" with n=0 and empty metrics for an empty cohort (NOT suppressed)', async () => {
    const { ctx } = makeFakeCtx({ enrollments: [] });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    expect(result.status).toBe('ok');
    expect(result.n).toBe(0);
    expect(result.metrics).toBeDefined();
  });

  it('excludes non-active (withdrawn/completed) enrollments from the cohort n', async () => {
    const { ctx } = makeFakeCtx({
      enrollments: [
        makeEnrollment({ studentId: 'stu_a', status: 'active' }),
        makeEnrollment({ studentId: 'stu_b', status: 'withdrawn' }),
        makeEnrollment({ studentId: 'stu_c', status: 'completed' }),
        makeEnrollment({ studentId: 'stu_d', status: 'active' }),
      ],
    });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    expect(result.n).toBe(2);
  });

  it('exposes retention + review-success metrics that conform to efficacy-core contracts', async () => {
    const { ctx } = makeFakeCtx({
      enrollments: [
        makeEnrollment({ studentId: 'stu_a' }),
        makeEnrollment({ studentId: 'stu_b' }),
      ],
      cards: [
        makeSrsCard({ studentId: 'stu_a', cardId: 'c1', stability: 30, reps: 3 }),
        makeSrsCard({ studentId: 'stu_b', cardId: 'c2', stability: 90, reps: 5 }),
      ],
      reviews: [
        makeReviewLog({ studentId: 'stu_a', cardId: 'c1', rating: 'Good', reviewedAtMs: COHORT_START_MS + 1 * MS_PER_DAY }),
        makeReviewLog({ studentId: 'stu_b', cardId: 'c2', rating: 'Easy', reviewedAtMs: COHORT_START_MS + 2 * MS_PER_DAY }),
      ],
    });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    expect(result.status).toBe('ok');
    expect(result.metrics.retention).toBeDefined();
    expect(result.metrics.reviewSuccess).toBeDefined();
    // The retention curve must be the same shape produced by the canonical
    // computeRetentionCurve fn over the same input shape — boundary-clean
    // reuse, no re-implementation.
    const expectedRetention = computeRetentionCurve({
      cards: [
        makeSrsCard({ studentId: 'stu_a', cardId: 'c1', stability: 30, reps: 3 }),
        makeSrsCard({ studentId: 'stu_b', cardId: 'c2', stability: 90, reps: 5 }),
      ],
      windowStartMs: COHORT_START_MS,
      windowEndMs: COHORT_END_MS,
      bucketMs: MS_PER_DAY,
    });
    expect(result.metrics.retention).toEqual(expectedRetention);
  });

  it('uses the cohort time window to filter reviews (inclusive start, exclusive end)', async () => {
    // Reviews before/at-start/inside/at-end; only inside should be counted.
    const { ctx } = makeFakeCtx({
      enrollments: [makeEnrollment({ studentId: 'stu_a' })],
      cards: [
        makeSrsCard({ studentId: 'stu_a', cardId: 'c1', stability: 30, reps: 3, lastReviewMs: COHORT_START_MS + 1 * MS_PER_DAY }),
      ],
      reviews: [
        makeReviewLog({ studentId: 'stu_a', cardId: 'c1', rating: 'Good', reviewedAtMs: COHORT_START_MS - 1 }),
        makeReviewLog({ studentId: 'stu_a', cardId: 'c1', rating: 'Good', reviewedAtMs: COHORT_START_MS + 1 * MS_PER_DAY }),
        makeReviewLog({ studentId: 'stu_a', cardId: 'c1', rating: 'Good', reviewedAtMs: COHORT_END_MS }),
      ],
    });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    const reviewSuccess = result.metrics.reviewSuccess as ReturnType<typeof computeReviewSuccessRate> | undefined;
    expect(reviewSuccess).toBeDefined();
    // Only the inside-window review counts → totalCount = 1, success = 1.
    expect(reviewSuccess?.totalCount).toBe(1);
    expect(reviewSuccess?.successCount).toBe(1);
  });

  it('does NOT trigger N+1: total db.query call count is bounded by a small constant independent of class size', async () => {
    // 25 active students — would explode under a per-student loop.
    const bigEnrollment = Array.from({ length: 25 }, (_, i) =>
      makeEnrollment({ studentId: `stu_${i.toString().padStart(2, '0')}` }),
    );
    const { ctx, queryCallLog } = makeFakeCtx({ enrollments: bigEnrollment });

    await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    const totalCalls = countQueryCalls(queryCallLog);
    // Budget: enrollments + cards + reviews + (optionally) submissions.
    // The exact budget is asserted as a tight upper bound so a future
    // implementation that regresses to per-student loops fails the test.
    expect(totalCalls).toBeLessThanOrEqual(6);
    expect(totalCalls).toBeGreaterThanOrEqual(1);
  });

  it('returns a result shape that includes the classId, window, n, and metrics (no PII)', async () => {
    const { ctx } = makeFakeCtx({
      enrollments: [makeEnrollment({ studentId: 'stu_a' })],
    });

    const result = await aggregateCohortMetricsHandler(
      ctx as unknown as import('@/convex/_generated/server').QueryCtx,
      {
        classId: CLASS_ID,
        windowStartMs: COHORT_START_MS,
        windowEndMs: COHORT_END_MS,
      },
    );

    // Discriminated union, no PII fields (no displayName, username, email).
    expect(result).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(ok|suppressed)$/),
        classId: CLASS_ID,
        n: expect.any(Number),
        metrics: expect.any(Object),
      }),
    );
    const flat = JSON.stringify(result);
    expect(flat).not.toMatch(/username|displayName|email|password/);
  });
});
