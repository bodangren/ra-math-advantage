import { stabilityToRetention } from '@math-platform/srs-engine';
import type { SrsCardState, SrsReviewLogEntry } from '@math-platform/srs-engine';
import type { MetricResult, TimeToMasteryStat } from '../contracts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ComputeTimeToMasteryInput {
  objectiveId: string;
  cards: SrsCardState[];
  reviewLogs: SrsReviewLogEntry[];
  masteryThreshold: number;
}

export function computeTimeToMastery(
  input: ComputeTimeToMasteryInput,
): MetricResult<TimeToMasteryStat, { objectiveId: string; masteryThreshold: number; firstReviewAtMs: number | null }> {
  const { objectiveId, cards, reviewLogs, masteryThreshold } = input;

  const cardIds = new Set(cards.map((c) => c.cardId));
  const relevant = reviewLogs
    .filter((r) => cardIds.has(r.cardId))
    .sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());

  if (relevant.length === 0) {
    return {
      value: {
        objectiveId,
        daysToMastery: null,
        reviewsToMastery: 0,
        reachedMastery: false,
      },
      n: 0,
      inputs: { objectiveId, masteryThreshold, firstReviewAtMs: null },
    };
  }

  const firstReviewAtMs = new Date(relevant[0].reviewedAt).getTime();

  let masteryReviewAtMs: number | null = null;
  let reviewsToMasteryCount = 0;
  for (let i = 0; i < relevant.length; i++) {
    const log = relevant[i];
    if (stabilityToRetention(log.stateAfter.stability) >= masteryThreshold) {
      masteryReviewAtMs = new Date(log.reviewedAt).getTime();
      reviewsToMasteryCount = i + 1;
      break;
    }
  }

  const reachedMastery = masteryReviewAtMs !== null;
  const daysToMastery = reachedMastery
    ? Math.round((masteryReviewAtMs! - firstReviewAtMs) / MS_PER_DAY)
    : null;

  return {
    value: {
      objectiveId,
      daysToMastery,
      reviewsToMastery: reachedMastery ? reviewsToMasteryCount : relevant.length,
      reachedMastery,
    },
    n: relevant.length,
    inputs: { objectiveId, masteryThreshold, firstReviewAtMs },
  };
}
