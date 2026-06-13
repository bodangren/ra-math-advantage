import type { QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import {
  computeRetentionCurve,
  computeReviewSuccessRate,
} from '@math-platform/efficacy-core';
import { suppressIfSmallN } from './suppression';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface CohortMetricsArgs {
  classId: Id<'classes'>;
  windowStartMs: number;
  windowEndMs: number;
}

export async function aggregateCohortMetricsHandler(
  ctx: QueryCtx,
  args: CohortMetricsArgs,
) {
  const { classId, windowStartMs, windowEndMs } = args;

  // Query 1: enrollments for the class
  const enrollments = await ctx.db
    .query('class_enrollments')
    .withIndex('by_class', (q) => q.eq('classId', classId))
    .collect();

  // Filter to active enrollments only
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const n = activeEnrollments.length;

  // Apply suppression
  const suppression = suppressIfSmallN(n);
  if (suppression.status === 'suppressed') {
    return {
      status: 'suppressed' as const,
      classId,
      n: suppression.n,
      metrics: {},
    };
  }

  // Collect student ids for batch queries
  const studentIds = activeEnrollments.map((e) => e.studentId);

  // Query 2: all cards for enrolled students
  const allCards: Array<{
    _id: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    cardId: string;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: string;
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string;
  }> = [];
  for (const studentId of studentIds) {
    const cards = await ctx.db
      .query('srs_cards')
      .withIndex('by_student', (q) => q.eq('studentId', studentId))
      .collect();
    allCards.push(...cards);
  }

  // Query 3: all review logs for enrolled students within window
  const allReviews: Array<{
    _id: Id<'srs_review_log'>;
    cardId: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    rating: 'Again' | 'Hard' | 'Good' | 'Easy';
    reviewedAt: number;
  }> = [];
  for (const studentId of studentIds) {
    const reviews = await ctx.db
      .query('srs_review_log')
      .withIndex('by_student_and_reviewed_at', (q) =>
        q.eq('studentId', studentId),
      )
      .collect();
    allReviews.push(...reviews);
  }

  // Filter reviews to time window (inclusive start, exclusive end)
  const inWindowReviews = allReviews.filter(
    (r) => r.reviewedAt >= windowStartMs && r.reviewedAt < windowEndMs,
  );

  // Compute retention curve via efficacy-core
  const retention = computeRetentionCurve({
    cards: allCards.map((c) => ({
      ...c,
      state: c.state as 'review' | 'new' | 'learning' | 'relearning',
    })),
    windowStartMs,
    windowEndMs,
    bucketMs: MS_PER_DAY,
  });

  // Compute review success rate via efficacy-core
  const reviewSuccess = computeReviewSuccessRate({
    reviewLogs: inWindowReviews.map((r) => ({
      rating: r.rating,
      reviewedAt: r.reviewedAt,
    })),
    windowStartMs,
    windowEndMs,
  });

  return {
    status: 'ok' as const,
    classId,
    n,
    metrics: {
      retention: retention.value,
      reviewSuccess: reviewSuccess.value,
    },
  };
}
