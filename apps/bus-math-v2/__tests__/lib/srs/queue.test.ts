import { describe, it, expect } from 'vitest';
import { buildDailyQueue, getQueueSummary } from '../../../lib/srs/queue';
import type { SrsCardState } from '@math-platform/srs-engine';

function makeCard(variantKey: string, studentId: string, dueOffsetMs: number): SrsCardState {
  const now = new Date();
  const dueDate = new Date(now.getTime() + dueOffsetMs).toISOString();
  return {
    cardId: `card_${variantKey}_${studentId}`,
    studentId,
    objectiveId: variantKey,
    variantKey,
    stability: 0,
    difficulty: 0,
    state: 'review',
    dueDate,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

describe('lib/srs/queue', () => {
  describe('buildDailyQueue', () => {
    it('returns empty queue when no cards are due', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const queue = buildDailyQueue([futureCard]);
      expect(queue.cards).toHaveLength(0);
    });

    it('returns all due cards up to sessionSize', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', -3000),
        makeCard('classification', 'student-3', -1000),
      ];
      const queue = buildDailyQueue(cards, { sessionSize: 10 });
      expect(queue.cards).toHaveLength(3);
    });

    it('caps at sessionSize', () => {
      const cards = Array.from({ length: 15 }, (_, i) =>
        makeCard(`family-${i}`, `student-${i}`, -(15 - i) * 1000)
      );
      const queue = buildDailyQueue(cards, { sessionSize: 5 });
      expect(queue.cards).toHaveLength(5);
    });

    it('uses canonical v3.2 review selection and deterministic presentation interleaving', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', -10000),
        makeCard('classification', 'student-3', -2000),
      ];
      cards[0].stability = 10;
      cards[0].elapsedDays = 10;
      cards[1].stability = 30;
      cards[1].elapsedDays = 10;
      cards[2].stability = 5;
      cards[2].elapsedDays = 10;
      const queue = buildDailyQueue(cards);
      // Selection prioritizes lowest retention, then v3.2 presentation
      // interleaves reviews by objective with a deterministic ID tie-break.
      expect(queue.cards[0].problemFamilyId).toBe('accounting-equation');
      expect(queue.cards[1].problemFamilyId).toBe('adjustment-effects');
      expect(queue.cards[2].problemFamilyId).toBe('classification');
    });

    it('includes sessionSize in result', () => {
      const queue = buildDailyQueue([], { sessionSize: 5 });
      expect(queue.sessionSize).toBe(5);
    });

    it('includes generatedAt timestamp', () => {
      const before = Date.now();
      const queue = buildDailyQueue([]);
      const after = Date.now();
      expect(queue.generatedAt).toBeGreaterThanOrEqual(before);
      expect(queue.generatedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('getQueueSummary', () => {
    it('returns zero due when all cards are in future', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const summary = getQueueSummary([futureCard]);
      expect(summary.totalDue).toBe(0);
      expect(summary.totalCards).toBe(1);
    });

    it('returns correct due count', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', 100000),
      ];
      const summary = getQueueSummary(cards);
      expect(summary.totalDue).toBe(1);
      expect(summary.totalCards).toBe(2);
    });

    it('calculates average overdue time', () => {
      const card1 = makeCard('accounting-equation', 'student-1', -10000);
      const card2 = makeCard('adjustment-effects', 'student-2', -20000);
      const summary = getQueueSummary([card1, card2]);
      expect(summary.averageOverdue).toBe(15000);
    });

    it('returns zero averageOverdue when no cards are due', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const summary = getQueueSummary([futureCard]);
      expect(summary.averageOverdue).toBe(0);
    });
  });
});
