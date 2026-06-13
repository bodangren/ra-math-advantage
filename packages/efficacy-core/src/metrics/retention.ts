import { stabilityToRetention } from '@math-platform/srs-engine';
import type { SrsCardState } from '@math-platform/srs-engine';
import type { MetricResult, RetentionPoint } from '../contracts';

export interface ComputeRetentionCurveInput {
  cards: SrsCardState[];
  windowStartMs: number;
  windowEndMs: number;
  bucketMs: number;
}

export function computeRetentionCurve(
  input: ComputeRetentionCurveInput,
): MetricResult<RetentionPoint[], { cardCount: number; windowMs: [number, number] }> {
  const { cards, windowStartMs, windowEndMs, bucketMs } = input;

  const eligible = cards.filter((c) => {
    if (c.reps === 0) return false;
    if (!c.lastReview) return false;
    const reviewMs = new Date(c.lastReview).getTime();
    return reviewMs >= windowStartMs && reviewMs < windowEndMs;
  });

  const buckets = new Map<number, RetentionPoint>();

  for (const card of eligible) {
    const reviewMs = new Date(card.lastReview!).getTime();
    const bucketIndex = Math.floor((reviewMs - windowStartMs) / bucketMs);
    const bucketStartMs = windowStartMs + bucketIndex * bucketMs;
    const bucketEndMs = bucketStartMs + bucketMs;

    const existing = buckets.get(bucketStartMs);
    if (existing) {
      const totalRetention =
        existing.averageRetention * existing.cardCount +
        stabilityToRetention(card.stability);
      existing.cardCount += 1;
      existing.averageRetention = totalRetention / existing.cardCount;
    } else {
      buckets.set(bucketStartMs, {
        bucketStartMs,
        bucketEndMs,
        averageRetention: stabilityToRetention(card.stability),
        cardCount: 1,
      });
    }
  }

  return {
    value: [...buckets.values()],
    n: eligible.length,
    inputs: {
      cardCount: cards.length,
      windowMs: [windowStartMs, windowEndMs],
    },
  };
}
