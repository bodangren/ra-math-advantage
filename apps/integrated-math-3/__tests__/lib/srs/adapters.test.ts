import { describe, it, expect, beforeEach } from 'vitest';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { SrsCardState, SrsReviewLogEntry } from '@math-platform/srs-engine';
import {
  InMemoryCardStore,
  InMemoryReviewLogStore,
  type CardStore,
  type ReviewLogStore,
} from '@math-platform/srs-engine';
import { createCard } from '@math-platform/srs-engine';
import { processReview } from '@math-platform/srs-engine';

const mockNow = '2026-04-16T12:00:00.000Z';

function makeCard(overrides: Partial<SrsCardState> = {}): SrsCardState {
  return {
    cardId: `card-${Math.random().toString(36).slice(2)}`,
    studentId: 'student-1',
    objectiveId: 'obj-1',
    problemFamilyId: 'pf-1',
    stability: 0,
    difficulty: 0,
    state: 'new',
    dueDate: mockNow,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    createdAt: mockNow,
    updatedAt: mockNow,
    ...overrides,
  };
}

function makeReviewLog(overrides: Partial<SrsReviewLogEntry> = {}): SrsReviewLogEntry {
  return {
    reviewId: `rev-${Math.random().toString(36).slice(2)}`,
    cardId: 'card-1',
    studentId: 'student-1',
    rating: 'Good',
    submissionId: 'sub-1',
    evidence: {
      baseRating: 'Good',
      timingAdjusted: false,
      reasons: ['correct'],
    },
    stateBefore: { stability: 0, difficulty: 0, state: 'new', reps: 0, lapses: 0 },
    stateAfter: { stability: 1, difficulty: 0, state: 'learning', reps: 1, lapses: 0 },
    reviewedAt: mockNow,
    ...overrides,
  };
}

describe('InMemoryCardStore', () => {
  let store: CardStore;

  beforeEach(() => {
    store = new InMemoryCardStore();
  });

  it('should return null for missing card', async () => {
    const card = await store.getCard('nonexistent');
    expect(card).toBeNull();
  });

  it('should save and retrieve a card by id', async () => {
    const card = makeCard({ cardId: 'card-1' });
    await store.saveCard(card);
    const retrieved = await store.getCard('card-1');
    expect(retrieved).toEqual(card);
  });

  it('should update an existing card', async () => {
    const card = makeCard({ cardId: 'card-1', state: 'new' });
    await store.saveCard(card);
    const updated = { ...card, state: 'review' as const };
    await store.saveCard(updated);
    const retrieved = await store.getCard('card-1');
    expect(retrieved?.state).toBe('review');
  });

  it('should get cards by student', async () => {
    const card1 = makeCard({ cardId: 'c1', studentId: 's1' });
    const card2 = makeCard({ cardId: 'c2', studentId: 's1' });
    const card3 = makeCard({ cardId: 'c3', studentId: 's2' });
    await store.saveCards([card1, card2, card3]);
    const result = await store.getCardsByStudent('s1');
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.cardId).sort()).toEqual(['c1', 'c2']);
  });

  it('should get cards by objective', async () => {
    const card1 = makeCard({ cardId: 'c1', objectiveId: 'o1' });
    const card2 = makeCard({ cardId: 'c2', objectiveId: 'o2' });
    await store.saveCards([card1, card2]);
    const result = await store.getCardsByObjective('o1');
    expect(result).toHaveLength(1);
    expect(result[0].cardId).toBe('c1');
  });

  it('should get due cards filtered by student and now', async () => {
    const pastDue = makeCard({
      cardId: 'c1',
      studentId: 's1',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    const futureDue = makeCard({
      cardId: 'c2',
      studentId: 's1',
      dueDate: '2026-04-17T12:00:00.000Z',
      state: 'review',
    });
    const otherStudent = makeCard({
      cardId: 'c3',
      studentId: 's2',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    await store.saveCards([pastDue, futureDue, otherStudent]);
    const result = await store.getDueCards('s1', mockNow);
    expect(result).toHaveLength(1);
    expect(result[0].cardId).toBe('c1');
  });

  it('should save multiple cards with saveCards', async () => {
    const cards = [makeCard({ cardId: 'c1' }), makeCard({ cardId: 'c2' })];
    await store.saveCards(cards);
    const c1 = await store.getCard('c1');
    const c2 = await store.getCard('c2');
    expect(c1).not.toBeNull();
    expect(c2).not.toBeNull();
  });
});

describe('InMemoryReviewLogStore', () => {
  let store: ReviewLogStore;

  beforeEach(() => {
    store = new InMemoryReviewLogStore();
  });

  it('should save and retrieve reviews by card', async () => {
    const log1 = makeReviewLog({ reviewId: 'r1', cardId: 'c1' });
    const log2 = makeReviewLog({ reviewId: 'r2', cardId: 'c1' });
    const log3 = makeReviewLog({ reviewId: 'r3', cardId: 'c2' });
    await store.saveReview(log1);
    await store.saveReview(log2);
    await store.saveReview(log3);
    const result = await store.getReviewsByCard('c1');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.reviewId).sort()).toEqual(['r1', 'r2']);
  });

  it('should retrieve reviews by student with optional since filter', async () => {
    const log1 = makeReviewLog({ reviewId: 'r1', studentId: 's1', reviewedAt: '2026-04-10T12:00:00.000Z' });
    const log2 = makeReviewLog({ reviewId: 'r2', studentId: 's1', reviewedAt: '2026-04-15T12:00:00.000Z' });
    const log3 = makeReviewLog({ reviewId: 'r3', studentId: 's2', reviewedAt: '2026-04-15T12:00:00.000Z' });
    await store.saveReview(log1);
    await store.saveReview(log2);
    await store.saveReview(log3);

    const all = await store.getReviewsByStudent('s1');
    expect(all).toHaveLength(2);

    const since = await store.getReviewsByStudent('s1', '2026-04-12T12:00:00.000Z');
    expect(since).toHaveLength(1);
    expect(since[0].reviewId).toBe('r2');
  });
});

describe('End-to-end: scheduler + processor + in-memory stores', () => {
  let cardStore: CardStore;
  let reviewLogStore: ReviewLogStore;

  beforeEach(() => {
    cardStore = new InMemoryCardStore();
    reviewLogStore = new InMemoryReviewLogStore();
  });

  it('should create a card, process a review, and persist both card and log', async () => {
    const card = createCard({
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      now: mockNow,
    });
    await cardStore.saveCard(card);

    const submission = {
      contractVersion: 'practice.v1' as const,
      activityId: toConvexActivityId('activity-1'),
      mode: 'independent_practice' as const,
      status: 'submitted' as const,
      attemptNumber: 1,
      submittedAt: mockNow,
      answers: { part1: 'answer' },
      parts: [
        {
          partId: 'part1',
          rawAnswer: 'answer',
          normalizedAnswer: 'answer',
          isCorrect: true,
        },
      ],
    };

    const result = processReview({ card, submission, now: mockNow });

    await cardStore.saveCard(result.updatedCard);
    await reviewLogStore.saveReview(result.reviewLog);

    const storedCard = await cardStore.getCard(card.cardId);
    const storedLogs = await reviewLogStore.getReviewsByCard(card.cardId);

    expect(storedCard).not.toBeNull();
    expect(storedCard?.reps).toBe(card.reps + 1);
    expect(storedLogs).toHaveLength(1);
    expect(storedLogs[0].rating).toBe(result.rating);
  });

  it('should support multiple reviews on the same card', async () => {
    let card = createCard({
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      now: mockNow,
    });
    await cardStore.saveCard(card);

    for (let i = 0; i < 3; i++) {
      const submission = {
        contractVersion: 'practice.v1' as const,
        activityId: toConvexActivityId('activity-1'),
        mode: 'independent_practice' as const,
        status: 'submitted' as const,
        attemptNumber: i + 1,
        submittedAt: mockNow,
        answers: { part1: 'answer' },
        parts: [{ partId: 'part1', rawAnswer: 'answer', normalizedAnswer: 'answer', isCorrect: true }],
      };

      const result = processReview({ card, submission, now: mockNow });
      await cardStore.saveCard(result.updatedCard);
      await reviewLogStore.saveReview(result.reviewLog);
      card = result.updatedCard;
    }

    const logs = await reviewLogStore.getReviewsByCard(card.cardId);
    expect(logs).toHaveLength(3);

    const storedCard = await cardStore.getCard(card.cardId);
    expect(storedCard?.reps).toBe(3);
  });
});

describe('CardStore getDueCards filtering', () => {
  let store: CardStore;

  beforeEach(() => {
    store = new InMemoryCardStore();
  });

  it('should only return cards for the requested student', async () => {
    const s1Due = makeCard({
      cardId: 'c1',
      studentId: 's1',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    const s2Due = makeCard({
      cardId: 'c2',
      studentId: 's2',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    await store.saveCards([s1Due, s2Due]);

    const result = await store.getDueCards('s1', mockNow);
    expect(result).toHaveLength(1);
    expect(result[0].cardId).toBe('c1');
  });

  it('should exclude cards with future due dates', async () => {
    const pastDue = makeCard({
      cardId: 'c1',
      studentId: 's1',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    const futureDue = makeCard({
      cardId: 'c2',
      studentId: 's1',
      dueDate: '2026-04-17T12:00:00.000Z',
      state: 'review',
    });
    await store.saveCards([pastDue, futureDue]);

    const result = await store.getDueCards('s1', mockNow);
    expect(result).toHaveLength(1);
    expect(result[0].cardId).toBe('c1');
  });

  it('should include cards due exactly at now', async () => {
    const exactDue = makeCard({
      cardId: 'c1',
      studentId: 's1',
      dueDate: mockNow,
      state: 'review',
    });
    await store.saveCard(exactDue);

    const result = await store.getDueCards('s1', mockNow);
    expect(result).toHaveLength(1);
  });
});
