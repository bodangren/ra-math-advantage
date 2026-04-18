import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SrsCardState } from '@/lib/srs/contract';
import { RestAdapterStub } from '@/lib/srs/__tests__/rest-adapter-stub';
import { processReview } from '@/lib/srs/review-processor';
import { buildDailyQueue } from '@/lib/srs/queue';
import { buildPracticeSubmissionEnvelope } from '@/lib/practice/contract';

vi.mock('ts-fsrs', () => {
  const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 } as const;
  const fsrs = vi.fn(() => ({
    next: vi.fn((card, now, rating) => {
      const isAgain = rating === Rating.Again;
      const isEasy = rating === Rating.Easy;
      const isGood = rating === Rating.Good;
      const newStability = isAgain ? card.stability * 0.5 : isEasy ? card.stability * 2.5 : isGood ? card.stability * 1.5 : card.stability * 1.2;
      const newScheduledDays = isAgain ? 1 : isEasy ? 14 : isGood ? 7 : 3;
      return {
        card: {
          ...card,
          stability: newStability,
          difficulty: isAgain ? Math.min(card.difficulty + 1, 10) : Math.max(card.difficulty - 0.5, 1),
          state: isAgain ? 3 : 2,
          reps: card.reps + 1,
          lapses: isAgain ? card.lapses + 1 : card.lapses,
          due: new Date(Date.now() + newScheduledDays * 86400000),
          scheduled_days: newScheduledDays,
          last_review: new Date(),
        },
        log: {},
      };
    }),
  }));
  const generatorParameters = vi.fn((props) => ({
    request_retention: props?.request_retention ?? 0.9,
    maximum_interval: props?.maximum_interval ?? 365,
    enable_short_term: props?.enable_short_term ?? false,
    w: [],
    enable_fuzz: false,
    learning_steps: [],
    relearning_steps: [],
  }));
  return { Rating, fsrs, generatorParameters };
});

import { createCard, reviewCard, getDueCards } from '@/lib/srs/scheduler';

describe('REST Adapter Integration', () => {
  let adapter: RestAdapterStub;
  const studentId = 'student-1';
  const now = '2026-04-16T12:00:00.000Z';

  beforeEach(() => {
    adapter = new RestAdapterStub();
  });

  describe('scheduler produces a valid session using the REST adapter', () => {
    it('should retrieve due cards from adapter and apply review ratings', async () => {
      const pastDueCard = createCard({
        studentId,
        objectiveId: 'obj-1',
        problemFamilyId: 'pf-1',
        now: '2026-04-15T12:00:00.000Z',
      });
      pastDueCard.dueDate = '2026-04-15T12:00:00.000Z';
      pastDueCard.state = 'review';
      pastDueCard.reps = 3;
      pastDueCard.stability = 5;

      const futureCard = createCard({
        studentId,
        objectiveId: 'obj-2',
        problemFamilyId: 'pf-2',
        now,
      });
      futureCard.dueDate = '2026-04-17T12:00:00.000Z';
      futureCard.state = 'review';
      futureCard.reps = 3;
      futureCard.stability = 5;

      await adapter.saveCards([pastDueCard, futureCard]);

      const allCards = await adapter.getCardsByStudent(studentId);
      const dueCards = getDueCards(allCards, now);
      expect(dueCards).toHaveLength(1);
      expect(dueCards[0].cardId).toBe(pastDueCard.cardId);

      const updatedCard = reviewCard(dueCards[0], 'Good', now);
      await adapter.saveCard(updatedCard);

      const stored = await adapter.getCard(pastDueCard.cardId);
      expect(stored).not.toBeNull();
      expect(stored!.reps).toBe(pastDueCard.reps + 1);
      expect(stored!.state).toBe('review');
    });

    it('should create a new card, save to adapter, and schedule first review', async () => {
      const newCard = createCard({
        studentId,
        objectiveId: 'obj-1',
        problemFamilyId: 'pf-1',
        now,
      });
      await adapter.saveCard(newCard);

      const retrieved = await adapter.getCardByStudentAndFamily(studentId, 'pf-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved!.state).toBe('new');

      const reviewed = reviewCard(retrieved!, 'Good', now);
      await adapter.saveCard(reviewed);

      const afterReview = await adapter.getCard(newCard.cardId);
      expect(afterReview!.reps).toBe(1);
      expect(afterReview!.state).toBe('review');
    });
  });

  describe('review processor updates cards through the REST adapter', () => {
    it('should process a submission review and persist updated card to adapter', async () => {
      const card: SrsCardState = {
        cardId: 'card-1',
        studentId,
        objectiveId: 'obj-1',
        problemFamilyId: 'pf-1',
        stability: 5,
        difficulty: 4,
        state: 'review',
        dueDate: now,
        elapsedDays: 5,
        scheduledDays: 5,
        reps: 5,
        lapses: 0,
        lastReview: now,
        createdAt: now,
        updatedAt: now,
      };
      await adapter.saveCard(card);

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'act-1',
        mode: 'independent_practice',
        answers: { p1: 'x=2' },
        parts: [
          {
            partId: 'p1',
            rawAnswer: 'x=2',
            normalizedAnswer: 'x=2',
            isCorrect: true,
            hintsUsed: 0,
            revealStepsSeen: 0,
            misconceptionTags: [],
          },
        ],
        timing: {
          startedAt: now,
          submittedAt: now,
          wallClockMs: 5000,
          activeMs: 4500,
          idleMs: 500,
          pauseCount: 0,
          focusLossCount: 0,
          visibilityHiddenCount: 0,
          confidence: 'medium',
        },
      });

      const result = processReview({ card, submission, now });
      await adapter.saveCard(result.updatedCard);
      await adapter.saveReview(result.reviewLog);

      const storedCard = await adapter.getCard(card.cardId);
      expect(storedCard).not.toBeNull();
      expect(storedCard!.reps).toBe(card.reps + 1);

      const reviews = await adapter.getReviewsByCard(card.cardId);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(result.rating);
      expect(reviews[0].evidence.baseRating).toBe(result.reviewLog.evidence.baseRating);
    });

    it('should load card from adapter, process review, and save back', async () => {
      const card = createCard({ studentId, objectiveId: 'obj-1', problemFamilyId: 'pf-1', now });
      card.state = 'review';
      card.reps = 2;
      card.stability = 3;
      await adapter.saveCard(card);

      const loaded = await adapter.getCardByStudentAndFamily(studentId, 'pf-1');
      expect(loaded).not.toBeNull();

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'act-2',
        mode: 'independent_practice',
        answers: { p1: '4' },
        parts: [
          {
            partId: 'p1',
            rawAnswer: '4',
            normalizedAnswer: '4',
            isCorrect: true,
            hintsUsed: 0,
            revealStepsSeen: 0,
            misconceptionTags: [],
          },
        ],
      });

      const result = processReview({ card: loaded!, submission, now });
      await adapter.saveCard(result.updatedCard);

      const updated = await adapter.getCard(card.cardId);
      expect(updated!.reps).toBe(3);
    });
  });

  describe('queue engine builds a practice session end-to-end with the REST adapter', () => {
    it('should build a daily queue from cards stored in the adapter', async () => {
      const card1 = createCard({ studentId, objectiveId: 'obj-1', problemFamilyId: 'pf-1', now });
      card1.dueDate = '2026-04-15T12:00:00.000Z';
      card1.state = 'review';
      card1.reps = 3;

      const card2 = createCard({ studentId, objectiveId: 'obj-2', problemFamilyId: 'pf-2', now });
      card2.state = 'new';

      const card3 = createCard({ studentId, objectiveId: 'obj-3', problemFamilyId: 'pf-3', now });
      card3.dueDate = '2026-04-17T12:00:00.000Z';
      card3.state = 'review';
      card3.reps = 3;

      await adapter.saveCards([card1, card2, card3]);

      const allCards = await adapter.getCardsByStudent(studentId);
      const policies = new Map([
        ['obj-1', { objectiveId: 'obj-1', priority: 'essential' as const }],
        ['obj-2', { objectiveId: 'obj-2', priority: 'supporting' as const }],
        ['obj-3', { objectiveId: 'obj-3', priority: 'extension' as const }],
      ]);
      const config = { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true };

      const queue = buildDailyQueue(allCards, policies, config, now);

      expect(queue.length).toBeGreaterThan(0);
      expect(queue.length).toBeLessThanOrEqual(config.maxReviewsPerDay);

      const newItems = queue.filter((item) => item.card.state === 'new');
      const reviewItems = queue.filter((item) => item.card.state !== 'new');

      expect(newItems).toHaveLength(1);
      expect(newItems[0].card.cardId).toBe(card2.cardId);

      expect(reviewItems.length).toBeGreaterThanOrEqual(1);
      expect(reviewItems[0].card.cardId).toBe(card1.cardId);
    });

    it('should respect newCardsPerDay and maxReviewsPerDay caps', async () => {
      const cards: SrsCardState[] = [];
      for (let i = 0; i < 10; i++) {
        const card = createCard({ studentId, objectiveId: `obj-${i}`, problemFamilyId: `pf-${i}`, now });
        card.state = 'new';
        cards.push(card);
      }
      for (let i = 10; i < 30; i++) {
        const card = createCard({ studentId, objectiveId: `obj-${i}`, problemFamilyId: `pf-${i}`, now });
        card.dueDate = '2026-04-15T12:00:00.000Z';
        card.state = 'review';
        card.reps = 1;
        cards.push(card);
      }
      await adapter.saveCards(cards);

      const allCards = await adapter.getCardsByStudent(studentId);
      const policies = new Map(
        cards.map((c) => [c.objectiveId, { objectiveId: c.objectiveId, priority: 'essential' as const }])
      );
      const config = { newCardsPerDay: 3, maxReviewsPerDay: 10, prioritizeOverdue: true };

      const queue = buildDailyQueue(allCards, policies, config, now);
      expect(queue.length).toBeLessThanOrEqual(config.maxReviewsPerDay);

      const newItems = queue.filter((item) => item.card.state === 'new');
      expect(newItems.length).toBeLessThanOrEqual(config.newCardsPerDay);
    });
  });
});
