import type { SrsCardState } from '@math-platform/srs-engine';
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
  const nowMs = new Date(now).getTime();

  const dueCards = cards
    .filter((c) => new Date(c.dueDate).getTime() <= nowMs)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, sessionSize);

  return {
    cards: dueCards,
    sessionSize,
    generatedAt: Date.now(),
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