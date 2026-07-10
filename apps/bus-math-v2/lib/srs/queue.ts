import {
  buildDailyQueueResult as buildCanonicalDailyQueue,
  type ObjectivePracticePolicy,
  type SrsCardState,
} from '@math-platform/srs-engine';
import type { DailyQueue } from './contract';

export interface QueueOptions {
  sessionSize?: number;
  now?: string;
}

/**
 * Builds a daily review queue from a list of SRS cards.
 * @param cards - Array of SRS card states
 * @param options - Queue options (sessionSize, now)
 * @returns Daily queue with cards due and session metadata
 */
export function buildDailyQueue(cards: SrsCardState[], options: QueueOptions = {}): DailyQueue {
  const { sessionSize = 10, now = new Date().toISOString() } = options;
  const cap = Number.isFinite(sessionSize) && sessionSize > 0
    ? Math.floor(sessionSize)
    : 0;
  const policies = new Map<string, ObjectivePracticePolicy>();
  for (const card of cards) {
    policies.set(card.objectiveId, {
      objectiveId: card.objectiveId,
      priority: 'essential',
    });
  }
  const result = buildCanonicalDailyQueue(cards, policies, {
    maxReviewsPerDay: cap,
    newCardsPerDay: cap,
    prioritizeOverdue: true,
  }, now);

  return {
    cards: result.items.map(({ card }) => ({
      ...card,
      problemFamilyId: (card as SrsCardState & { problemFamilyId?: string }).problemFamilyId
        ?? card.variantKey,
    })),
    sessionSize: cap,
    generatedAt: Date.parse(now),
  };
}

/**
 * Gets summary statistics for a card queue.
 * @param cards - Array of SRS card states
 * @param now - Optional current time ISO string
 * @returns Queue summary with total due, total cards, and average overdue time
 */
export function getQueueSummary(cards: SrsCardState[], now?: string): {
  totalDue: number;
  totalCards: number;
  averageOverdue: number;
} {
  const currentTime = now ?? new Date().toISOString();
  const nowMs = new Date(currentTime).getTime();
  const dueCards = cards.filter((c) => new Date(c.dueDate).getTime() <= nowMs);

  if (dueCards.length === 0) {
    return { totalDue: 0, totalCards: cards.length, averageOverdue: 0 };
  }

  const overdueMs = dueCards.map((c) => nowMs - new Date(c.dueDate).getTime());
  const averageOverdue = overdueMs.reduce((a, b) => a + b, 0) / overdueMs.length;

  return {
    totalDue: dueCards.length,
    totalCards: cards.length,
    averageOverdue,
  };
}
