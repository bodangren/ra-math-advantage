import { describe, it, expect, vi } from 'vitest';
import type { SrsCardState } from '@/lib/srs/contract';

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

import { Rating } from 'ts-fsrs';
import {
  createCard,
  reviewCard,
  getDueCards,
  previewInterval,
  mapSrsRatingToGrade,
  mapGradeToSrsRating,
  type SchedulerConfig,
  DEFAULT_SCHEDULER_CONFIG,
} from '@/lib/srs/scheduler';

const mockNow = '2026-04-16T12:00:00.000Z';

describe('SchedulerConfig', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_SCHEDULER_CONFIG.requestRetention).toBe(0.9);
    expect(DEFAULT_SCHEDULER_CONFIG.maximumInterval).toBe(365);
    expect(DEFAULT_SCHEDULER_CONFIG.enableShortTermPreview).toBe(false);
  });
});

describe('Rating mapping', () => {
  it('should map SrsRating.Again to Rating.Again', () => {
    expect(mapSrsRatingToGrade('Again')).toBe(Rating.Again);
  });

  it('should map SrsRating.Hard to Rating.Hard', () => {
    expect(mapSrsRatingToGrade('Hard')).toBe(Rating.Hard);
  });

  it('should map SrsRating.Good to Rating.Good', () => {
    expect(mapSrsRatingToGrade('Good')).toBe(Rating.Good);
  });

  it('should map SrsRating.Easy to Rating.Easy', () => {
    expect(mapSrsRatingToGrade('Easy')).toBe(Rating.Easy);
  });

  it('should map Rating.Again to SrsRating.Again', () => {
    expect(mapGradeToSrsRating(Rating.Again)).toBe('Again');
  });

  it('should map Rating.Hard to SrsRating.Hard', () => {
    expect(mapGradeToSrsRating(Rating.Hard)).toBe('Hard');
  });

  it('should map Rating.Good to SrsRating.Good', () => {
    expect(mapGradeToSrsRating(Rating.Good)).toBe('Good');
  });

  it('should map Rating.Easy to SrsRating.Easy', () => {
    expect(mapGradeToSrsRating(Rating.Easy)).toBe('Easy');
  });
});

describe('createCard', () => {
  it('should return valid SrsCardState with state=new, reps=0, lapses=0', () => {
    const card = createCard({
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      now: mockNow,
    });

    expect(card.state).toBe('new');
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.studentId).toBe('student-1');
    expect(card.objectiveId).toBe('obj-1');
    expect(card.problemFamilyId).toBe('pf-1');
  });

  it('should generate a unique cardId', () => {
    const card1 = createCard({ studentId: 's1', objectiveId: 'o1', problemFamilyId: 'p1', now: mockNow });
    const card2 = createCard({ studentId: 's1', objectiveId: 'o1', problemFamilyId: 'p1', now: mockNow });
    expect(card1.cardId).not.toBe(card2.cardId);
  });

  it('should set dueDate to now for new cards', () => {
    const card = createCard({
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      now: mockNow,
    });
    expect(card.dueDate).toBe(mockNow);
  });

  it('should set createdAt and updatedAt to now', () => {
    const card = createCard({
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      now: mockNow,
    });
    expect(card.createdAt).toBe(mockNow);
    expect(card.updatedAt).toBe(mockNow);
  });
});

describe('reviewCard', () => {
  const baseCard: SrsCardState = {
    cardId: 'card-1',
    studentId: 'student-1',
    objectiveId: 'obj-1',
    problemFamilyId: 'pf-1',
    stability: 5,
    difficulty: 4,
    state: 'review',
    dueDate: mockNow,
    elapsedDays: 5,
    scheduledDays: 5,
    reps: 5,
    lapses: 0,
    lastReview: mockNow,
    createdAt: mockNow,
    updatedAt: mockNow,
  };

  it('should increment lapses on Again rating', () => {
    const updated = reviewCard(baseCard, 'Again', mockNow);
    expect(updated.lapses).toBe(baseCard.lapses + 1);
  });

  it('should reduce stability on Again rating', () => {
    const updated = reviewCard(baseCard, 'Again', mockNow);
    expect(updated.stability).toBeLessThan(baseCard.stability);
  });

  it('should increase stability on Good rating', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    expect(updated.stability).toBeGreaterThan(baseCard.stability);
  });

  it('should increase stability on Easy rating more than Good', () => {
    const goodCard = reviewCard(baseCard, 'Good', mockNow);
    const easyCard = reviewCard(baseCard, 'Easy', mockNow);
    expect(easyCard.stability).toBeGreaterThan(goodCard.stability);
  });

  it('should increase scheduledDays on Good rating', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    expect(updated.scheduledDays).toBeGreaterThan(baseCard.scheduledDays);
  });

  it('should move to relearning state on Again rating', () => {
    const updated = reviewCard(baseCard, 'Again', mockNow);
    expect(updated.state).toBe('relearning');
  });

  it('should stay in review state on Good rating', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    expect(updated.state).toBe('review');
  });

  it('should increment reps on any rating', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    expect(updated.reps).toBe(baseCard.reps + 1);
  });

  it('should update lastReview timestamp', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    expect(updated.lastReview).not.toBe(baseCard.lastReview);
    expect(updated.lastReview).toBeTruthy();
  });

  it('should set dueDate in the future based on interval', () => {
    const updated = reviewCard(baseCard, 'Good', mockNow);
    const dueDateMs = new Date(updated.dueDate).getTime();
    const nowMs = new Date(mockNow).getTime();
    expect(dueDateMs).toBeGreaterThan(nowMs);
  });
});

describe('getDueCards', () => {
  const createDueCard = (dueOffsetMinutes: number): SrsCardState => ({
    cardId: `card-${dueOffsetMinutes}`,
    studentId: 'student-1',
    objectiveId: 'obj-1',
    problemFamilyId: 'pf-1',
    stability: 5,
    difficulty: 4,
    state: 'review',
    dueDate: new Date(Date.now() + dueOffsetMinutes * 60000).toISOString(),
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 1,
    lapses: 0,
    lastReview: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('should return cards with dueDate <= now', () => {
    const pastDue = createDueCard(-30);
    const notDue = createDueCard(30);
    const cards = [pastDue, notDue];
    const now = new Date().toISOString();
    const due = getDueCards(cards, now);
    expect(due).toHaveLength(1);
    expect(due[0].cardId).toBe(pastDue.cardId);
  });

  it('should return cards with dueDate exactly equal to now', () => {
    const exactNow = new Date().toISOString();
    const card: SrsCardState = {
      ...createDueCard(0),
      dueDate: exactNow,
    };
    const due = getDueCards([card], exactNow);
    expect(due).toHaveLength(1);
  });

  it('should return empty array when no cards are due', () => {
    const futureCard = createDueCard(60);
    const now = new Date().toISOString();
    const due = getDueCards([futureCard], now);
    expect(due).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const now = new Date().toISOString();
    const due = getDueCards([], now);
    expect(due).toHaveLength(0);
  });
});

describe('previewInterval', () => {
  const baseCard: SrsCardState = {
    cardId: 'card-1',
    studentId: 'student-1',
    objectiveId: 'obj-1',
    problemFamilyId: 'pf-1',
    stability: 5,
    difficulty: 4,
    state: 'review',
    dueDate: mockNow,
    elapsedDays: 5,
    scheduledDays: 5,
    reps: 5,
    lapses: 0,
    lastReview: mockNow,
    createdAt: mockNow,
    updatedAt: mockNow,
  };

  it('should return positive interval for Good rating', () => {
    const interval = previewInterval(baseCard, 'Good');
    expect(interval).toBeGreaterThan(0);
  });

  it('should return interval for Again rating', () => {
    const interval = previewInterval(baseCard, 'Again');
    expect(interval).toBeGreaterThanOrEqual(1);
  });

  it('should return larger interval for Easy than Good', () => {
    const easyInterval = previewInterval(baseCard, 'Easy');
    const goodInterval = previewInterval(baseCard, 'Good');
    expect(easyInterval).toBeGreaterThan(goodInterval);
  });

  it('should not mutate original card', () => {
    const originalStability = baseCard.stability;
    previewInterval(baseCard, 'Good');
    expect(baseCard.stability).toBe(originalStability);
  });
});

describe('maximum interval cap', () => {
  it('should cap interval at maximumInterval from config', () => {
    const longWaitCard: SrsCardState = {
      cardId: 'card-long',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 100,
      difficulty: 3,
      state: 'review',
      dueDate: mockNow,
      elapsedDays: 300,
      scheduledDays: 300,
      reps: 50,
      lapses: 0,
      lastReview: mockNow,
      createdAt: mockNow,
      updatedAt: mockNow,
    };

    const config: SchedulerConfig = {
      requestRetention: 0.9,
      maximumInterval: 365,
      enableShortTermPreview: false,
    };

    const updated = reviewCard(longWaitCard, 'Good', mockNow, config);
    expect(updated.scheduledDays).toBeLessThanOrEqual(365);
  });
});