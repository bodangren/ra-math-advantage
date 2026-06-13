import type { SrsReviewLogEntry } from '@math-platform/srs-engine';
import type { MetricResult, ReviewSuccessRate } from '../contracts';

export interface ComputeReviewSuccessRateInput {
  reviewLogs: SrsReviewLogEntry[];
  windowStartMs: number;
  windowEndMs: number;
}

export function computeReviewSuccessRate(
  input: ComputeReviewSuccessRateInput,
): MetricResult<ReviewSuccessRate, { windowMs: [number, number]; reviewCount: number }> {
  const { reviewLogs, windowStartMs, windowEndMs } = input;

  const inWindow = reviewLogs.filter((r) => {
    const reviewedMs = new Date(r.reviewedAt).getTime();
    return reviewedMs >= windowStartMs && reviewedMs < windowEndMs;
  });

  const breakdown = { Again: 0, Hard: 0, Good: 0, Easy: 0 };
  let successCount = 0;

  for (const log of inWindow) {
    breakdown[log.rating] += 1;
    if (log.rating === 'Good' || log.rating === 'Easy') {
      successCount += 1;
    }
  }

  const totalCount = inWindow.length;

  return {
    value: {
      successCount,
      totalCount,
      successRate: totalCount > 0 ? successCount / totalCount : null,
      ratingBreakdown: breakdown,
    },
    n: totalCount,
    inputs: {
      windowMs: [windowStartMs, windowEndMs],
      reviewCount: reviewLogs.length,
    },
  };
}
