import { describe, it, expect, beforeEach } from 'vitest';
import type { SrsCardState, SrsReviewLogEntry } from '@/lib/srs/contract';
import { RestAdapterStub } from '@/lib/srs/__tests__/rest-adapter-stub';

describe('RestAdapterStub', () => {
  let adapter: RestAdapterStub;
  const studentId = 'student-1';
  const now = '2026-04-16T12:00:00.000Z';

  const baseCard: SrsCardState = {
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

  beforeEach(() => {
    adapter = new RestAdapterStub();
  });

  describe('CardStore', () => {
    it('should return null for a missing card', async () => {
      const result = await adapter.getCard('nonexistent');
      expect(result).toBeNull();
    });

    it('should save and retrieve a card by id', async () => {
      await adapter.saveCard(baseCard);
      const result = await adapter.getCard(baseCard.cardId);
      expect(result).toEqual(baseCard);
    });

    it('should retrieve cards by student', async () => {
      const card2: SrsCardState = { ...baseCard, cardId: 'card-2', objectiveId: 'obj-2' };
      const otherStudentCard: SrsCardState = { ...baseCard, cardId: 'card-3', studentId: 'student-2' };
      await adapter.saveCards([baseCard, card2, otherStudentCard]);
      const results = await adapter.getCardsByStudent(studentId);
      expect(results).toHaveLength(2);
      expect(results.map((c) => c.cardId).sort()).toEqual(['card-1', 'card-2']);
    });

    it('should retrieve cards by objective', async () => {
      const card2: SrsCardState = { ...baseCard, cardId: 'card-2', objectiveId: 'obj-2' };
      await adapter.saveCards([baseCard, card2]);
      const results = await adapter.getCardsByObjective('obj-1');
      expect(results).toHaveLength(1);
      expect(results[0].cardId).toBe('card-1');
    });

    it('should retrieve a card by student and problem family', async () => {
      await adapter.saveCard(baseCard);
      const result = await adapter.getCardByStudentAndFamily(studentId, 'pf-1');
      expect(result).toEqual(baseCard);
    });

    it('should return null for mismatched student and problem family', async () => {
      await adapter.saveCard(baseCard);
      const result = await adapter.getCardByStudentAndFamily(studentId, 'pf-2');
      expect(result).toBeNull();
    });

    it('should return due cards for a student', async () => {
      const pastDue: SrsCardState = { ...baseCard, cardId: 'card-due', dueDate: '2026-04-15T12:00:00.000Z' };
      const futureDue: SrsCardState = { ...baseCard, cardId: 'card-future', dueDate: '2026-04-17T12:00:00.000Z' };
      const otherStudentDue: SrsCardState = { ...pastDue, cardId: 'card-other', studentId: 'student-2' };
      await adapter.saveCards([pastDue, futureDue, otherStudentDue]);
      const results = await adapter.getDueCards(studentId, now);
      expect(results).toHaveLength(1);
      expect(results[0].cardId).toBe('card-due');
    });

    it('should update an existing card on save', async () => {
      await adapter.saveCard(baseCard);
      const updated: SrsCardState = { ...baseCard, stability: 10 };
      await adapter.saveCard(updated);
      const result = await adapter.getCard(baseCard.cardId);
      expect(result?.stability).toBe(10);
    });

    it('should save multiple cards at once', async () => {
      const card2: SrsCardState = { ...baseCard, cardId: 'card-2' };
      await adapter.saveCards([baseCard, card2]);
      expect(await adapter.getCard('card-1')).toBeTruthy();
      expect(await adapter.getCard('card-2')).toBeTruthy();
    });
  });

  describe('ReviewLogStore', () => {
    const baseReview: SrsReviewLogEntry = {
      reviewId: 'rev-1',
      cardId: 'card-1',
      studentId,
      rating: 'Good',
      submissionId: 'sub-1',
      evidence: {
        baseRating: 'Good',
        timingAdjusted: false,
        reasons: [],
      },
      stateBefore: { stability: 5, difficulty: 4, state: 'review', reps: 5, lapses: 0 },
      stateAfter: { stability: 6, difficulty: 3.5, state: 'review', reps: 6, lapses: 0 },
      reviewedAt: now,
    };

    it('should save and retrieve reviews by card', async () => {
      await adapter.saveReview(baseReview);
      const results = await adapter.getReviewsByCard('card-1');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(baseReview);
    });

    it('should retrieve reviews by student', async () => {
      const review2: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-2', cardId: 'card-2' };
      const otherStudentReview: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-3', studentId: 'student-2' };
      await adapter.saveReview(baseReview);
      await adapter.saveReview(review2);
      await adapter.saveReview(otherStudentReview);
      const results = await adapter.getReviewsByStudent(studentId);
      expect(results).toHaveLength(2);
    });

    it('should filter reviews by student since a given date', async () => {
      const oldReview: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-old', reviewedAt: '2026-04-14T12:00:00.000Z' };
      const newReview: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-new', reviewedAt: '2026-04-16T12:00:00.000Z' };
      await adapter.saveReview(oldReview);
      await adapter.saveReview(newReview);
      const results = await adapter.getReviewsByStudent(studentId, '2026-04-15T00:00:00.000Z');
      expect(results).toHaveLength(1);
      expect(results[0].reviewId).toBe('rev-new');
    });

    it('should sort reviews by reviewedAt ascending', async () => {
      const review1: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-1', reviewedAt: '2026-04-16T14:00:00.000Z' };
      const review2: SrsReviewLogEntry = { ...baseReview, reviewId: 'rev-2', reviewedAt: '2026-04-16T10:00:00.000Z' };
      await adapter.saveReview(review1);
      await adapter.saveReview(review2);
      const results = await adapter.getReviewsByCard('card-1');
      expect(results[0].reviewId).toBe('rev-2');
      expect(results[1].reviewId).toBe('rev-1');
    });
  });
});
