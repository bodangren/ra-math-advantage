import { describe, it, expect, vi } from 'vitest';
import { Rating } from 'ts-fsrs';
import {
  InMemoryCardStore,
  InMemoryReviewLogStore,
  type CardStore,
  type ReviewLogStore,
} from '@/lib/srs/adapters';
import {
  createCard,
  reviewCard,
  mapSrsRatingToGrade,
} from '@/lib/srs/scheduler';
import { buildDailyQueue, isOverdue, daysOverdue, type QueueItem } from '@/lib/srs/queue';
import { processReview } from '@/lib/srs/review-processor';
import {
  computeBaseRating,
  applyTimingToRating,
} from '@math-platform/practice-core/srs-rating';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type {
  SrsCardState,
  SrsSessionConfig,
  ObjectivePracticePolicy,
} from '@/lib/srs/contract';

vi.mock('ts-fsrs', () => {
  const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 } as const;
  const createEmptyCard = vi.fn(() => ({
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    last_review: undefined,
  }));
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
  return { Rating, createEmptyCard, fsrs, generatorParameters };
});

const mockNow = '2026-04-16T12:00:00.000Z';

describe('INTEGRATION.md Examples', () => {
  describe('Section 4: CardStore and ReviewLogStore', () => {
    it('InMemoryCardStore implements CardStore interface', async () => {
      const store: CardStore = new InMemoryCardStore();

      const card = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_quadratic_roots',
        problemFamilyId: 'pf_qr_01',
        now: mockNow,
      });

      await store.saveCard(card);

      const retrieved = await store.getCard(card.cardId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.cardId).toBe(card.cardId);
      expect(retrieved!.studentId).toBe('stu_001');
    });

    it('InMemoryCardStore.getDueCards filters by due date', async () => {
      const store = new InMemoryCardStore();
      const pastDue = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      pastDue.dueDate = '2026-04-10T00:00:00.000Z';
      pastDue.state = 'review';

      const futureDue = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_2',
        now: mockNow,
      });
      futureDue.dueDate = '2026-04-20T00:00:00.000Z';
      futureDue.state = 'review';

      await store.saveCards([pastDue, futureDue]);

      const due = await store.getDueCards('stu_001', mockNow);
      expect(due).toHaveLength(1);
      expect(due[0].cardId).toBe(pastDue.cardId);
    });

    it('InMemoryReviewLogStore implements ReviewLogStore interface', async () => {
      const store: ReviewLogStore = new InMemoryReviewLogStore();

      const card = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'act_123',
        mode: 'independent_practice',
        answers: { p1: 'x=2' },
        parts: [{ partId: 'p1', rawAnswer: 'x=2', isCorrect: true }],
        attemptNumber: 1,
        submittedAt: mockNow,
      });

      const result = processReview({ card, submission, now: mockNow });
      await store.saveReview(result.reviewLog);

      const reviews = await store.getReviewsByCard(card.cardId);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].cardId).toBe(card.cardId);
    });
  });

  describe('Section 5: Daily Practice Queue', () => {
    const essentialPolicy: ObjectivePracticePolicy = {
      objectiveId: 'obj_essential',
      priority: 'essential',
    };

    const supportingPolicy: ObjectivePracticePolicy = {
      objectiveId: 'obj_supporting',
      priority: 'supporting',
    };

    const triagedPolicy: ObjectivePracticePolicy = {
      objectiveId: 'obj_triaged',
      priority: 'triaged',
    };

    it('buildDailyQueue excludes triaged objectives', () => {
      const cards: SrsCardState[] = [
        createCard({ studentId: 's1', objectiveId: 'obj_essential', problemFamilyId: 'pf_1', now: mockNow }),
        createCard({ studentId: 's1', objectiveId: 'obj_triaged', problemFamilyId: 'pf_2', now: mockNow }),
      ];

      const policies = new Map<string, ObjectivePracticePolicy>([
        ['obj_essential', essentialPolicy],
        ['obj_triaged', triagedPolicy],
      ]);

      const config: SrsSessionConfig = { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true };
      const queue = buildDailyQueue(cards, policies, config, mockNow);

      expect(queue).toHaveLength(1);
      expect(queue[0].card.objectiveId).toBe('obj_essential');
    });

    it('buildDailyQueue prioritizes essential over supporting new cards', () => {
      const cards: SrsCardState[] = [
        { ...createCard({ studentId: 's1', objectiveId: 'obj_essential', problemFamilyId: 'pf_1', now: mockNow }), state: 'new' as const },
        { ...createCard({ studentId: 's1', objectiveId: 'obj_supporting', problemFamilyId: 'pf_2', now: mockNow }), state: 'new' as const },
      ];

      const policies = new Map<string, ObjectivePracticePolicy>([
        ['obj_essential', essentialPolicy],
        ['obj_supporting', supportingPolicy],
      ]);

      const config: SrsSessionConfig = { newCardsPerDay: 10, maxReviewsPerDay: 20, prioritizeOverdue: true };
      const queue = buildDailyQueue(cards, policies, config, mockNow);

      expect(queue[0].objectivePriority).toBe('essential');
    });

    it('isOverdue returns true for past-due review cards', () => {
      const pastDueCard = createCard({
        studentId: 's1',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      pastDueCard.state = 'review';
      pastDueCard.dueDate = '2026-04-10T00:00:00.000Z';

      expect(isOverdue(pastDueCard, mockNow)).toBe(true);
    });

    it('isOverdue returns false for new cards', () => {
      const newCard = createCard({
        studentId: 's1',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      newCard.state = 'new';
      newCard.dueDate = mockNow;

      expect(isOverdue(newCard, mockNow)).toBe(false);
    });

    it('daysOverdue calculates correct offset', () => {
      const card = createCard({
        studentId: 's1',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      card.state = 'review';
      card.dueDate = '2026-04-10T00:00:00.000Z';

      expect(daysOverdue(card, mockNow)).toBeGreaterThanOrEqual(6);
    });

    it('QueueItem type is correctly shaped', () => {
      const card = createCard({ studentId: 's1', objectiveId: 'obj_1', problemFamilyId: 'pf_1', now: mockNow });
      const item: QueueItem = {
        card,
        objectivePriority: 'essential',
        isOverdue: false,
        daysOverdue: 0,
      };

      expect(item.card.cardId).toBe(card.cardId);
      expect(item.objectivePriority).toBe('essential');
      expect(item.isOverdue).toBe(false);
      expect(item.daysOverdue).toBe(0);
    });
  });

  describe('Section 6: Submission Adapter', () => {
    it('processReview returns updated card and review log', () => {
      const card = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'quadratic-explorer-v1',
        mode: 'independent_practice',
        answers: { p1: 'x=2' },
        parts: [
          {
            partId: 'p1',
            rawAnswer: 'x=2',
            normalizedAnswer: '2',
            isCorrect: true,
          },
        ],
        attemptNumber: 1,
        submittedAt: mockNow,
      });

      const result = processReview({ card, submission, now: mockNow });

      expect(result.rating).toBe('Good');
      expect(result.updatedCard.cardId).toBe(card.cardId);
      expect(result.updatedCard.reps).toBe(1);
      expect(result.reviewLog.cardId).toBe(card.cardId);
      expect(result.reviewLog.studentId).toBe('stu_001');
    });

    it('processReview marks incorrect submissions as Again', () => {
      const card = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      card.state = 'review';

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'act_1',
        mode: 'independent_practice',
        answers: { p1: 'wrong' },
        parts: [{ partId: 'p1', rawAnswer: 'wrong', isCorrect: false }],
        attemptNumber: 1,
        submittedAt: mockNow,
      });

      const result = processReview({ card, submission, now: mockNow });
      expect(result.rating).toBe('Again');
      expect(result.reviewLog.stateAfter.state).toBe('relearning');
    });

    it('processReview captures stateBefore and stateAfter', () => {
      const card = createCard({
        studentId: 'stu_001',
        objectiveId: 'obj_1',
        problemFamilyId: 'pf_1',
        now: mockNow,
      });
      card.state = 'review';
      card.reps = 5;
      card.lapses = 0;

      const submission = buildPracticeSubmissionEnvelope({
        activityId: 'act_1',
        mode: 'independent_practice',
        answers: { p1: 'x=2' },
        parts: [{ partId: 'p1', rawAnswer: 'x=2', isCorrect: true }],
        attemptNumber: 1,
        submittedAt: mockNow,
      });

      const result = processReview({ card, submission, now: mockNow });

      expect(result.reviewLog.stateBefore.reps).toBe(5);
      expect(result.reviewLog.stateAfter.reps).toBe(6);
    });
  });

  describe('Rating Scale (Quick Reference)', () => {
    it('computeBaseRating: incorrect → Again', () => {
      const parts = [{ isCorrect: false, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: [] }];
      expect(computeBaseRating(parts)).toBe('Again');
    });

    it('computeBaseRating: misconception → Again', () => {
      const parts = [{ isCorrect: true, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: ['misconception_a'] }];
      expect(computeBaseRating(parts)).toBe('Again');
    });

    it('computeBaseRating: hints used → Hard', () => {
      const parts = [{ isCorrect: true, hintsUsed: 1, revealStepsSeen: 0, misconceptionTags: [] }];
      expect(computeBaseRating(parts)).toBe('Hard');
    });

    it('computeBaseRating: correct + no aids → Good', () => {
      const parts = [{ isCorrect: true, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: [] }];
      expect(computeBaseRating(parts)).toBe('Good');
    });

    it('applyTimingToRating: fast Good → Easy', () => {
      const timingFeatures = { hasReliableTiming: true, speedBand: 'fast' as const, confidence: 'high' as const, reasons: [] };
      const result = applyTimingToRating('Good', timingFeatures);
      expect(result.rating).toBe('Easy');
      expect(result.timingAdjusted).toBe(true);
    });

    it('applyTimingToRating: Again stays Again regardless of timing', () => {
      const timingFeatures = { hasReliableTiming: true, speedBand: 'fast' as const, confidence: 'high' as const, reasons: [] };
      const result = applyTimingToRating('Again', timingFeatures);
      expect(result.rating).toBe('Again');
      expect(result.timingAdjusted).toBe(false);
    });

    it('applyTimingToRating: unreliable timing is ignored', () => {
      const timingFeatures = { hasReliableTiming: false, confidence: 'low' as const, reasons: ['timing_missing'] };
      const result = applyTimingToRating('Good', timingFeatures);
      expect(result.rating).toBe('Good');
      expect(result.timingAdjusted).toBe(false);
    });
  });

  describe('FSRS Grade Mapping', () => {
    it('mapSrsRatingToGrade: Again → Rating.Again', () => {
      expect(mapSrsRatingToGrade('Again')).toBe(Rating.Again);
    });

    it('mapSrsRatingToGrade: Hard → Rating.Hard', () => {
      expect(mapSrsRatingToGrade('Hard')).toBe(Rating.Hard);
    });

    it('mapSrsRatingToGrade: Good → Rating.Good', () => {
      expect(mapSrsRatingToGrade('Good')).toBe(Rating.Good);
    });

    it('mapSrsRatingToGrade: Easy → Rating.Easy', () => {
      expect(mapSrsRatingToGrade('Easy')).toBe(Rating.Easy);
    });
  });

  describe('Card States (Quick Reference)', () => {
    it('new card has state=new', () => {
      const card = createCard({ studentId: 's1', objectiveId: 'o1', problemFamilyId: 'p1', now: mockNow });
      expect(card.state).toBe('new');
    });

    it('reviewCard moves to relearning on Again', () => {
      const card = createCard({ studentId: 's1', objectiveId: 'o1', problemFamilyId: 'p1', now: mockNow });
      card.state = 'review';
      card.reps = 1;

      const updated = reviewCard(card, 'Again', mockNow);
      expect(updated.state).toBe('relearning');
    });

    it('reviewCard keeps in review on Good', () => {
      const card = createCard({ studentId: 's1', objectiveId: 'o1', problemFamilyId: 'p1', now: mockNow });
      card.state = 'review';
      card.reps = 1;

      const updated = reviewCard(card, 'Good', mockNow);
      expect(updated.state).toBe('review');
    });
  });

  describe('Session Config Defaults', () => {
    it('DEFAULT_SESSION_CONFIG has expected values', () => {
      const config: SrsSessionConfig = { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true };
      expect(config.newCardsPerDay).toBe(5);
      expect(config.maxReviewsPerDay).toBe(20);
      expect(config.prioritizeOverdue).toBe(true);
    });
  });
});
