import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '@/convex/_generated/server';
import {
  saveReviewHandler,
  getReviewsByCardHandler,
  getReviewsByStudentHandler,
} from '@/convex/srs/reviews';

interface MockReviewDbRecord {
  _id: Id<'srs_review_log'>;
  cardId: Id<'srs_cards'>;
  studentId: Id<'profiles'>;
  rating: string;
  reviewId?: string;
  submissionId?: string;
  evidence: { action: 'teacher_reset'; objectiveId: string } | { baseRating: 'Again' | 'Hard' | 'Good' | 'Easy'; timingAdjusted: boolean; reasons: string[]; misconceptionTags?: string[] };
  stateBefore: { stability: number; difficulty: number; state: 'new' | 'learning' | 'review' | 'relearning'; reps: number; lapses: number };
  stateAfter: { stability: number; difficulty: number; state: 'new' | 'learning' | 'review' | 'relearning'; reps: number; lapses: number };
  reviewedAt: number;
}

function makeMockMutationCtx(overrides: {
  insertId?: Id<'srs_review_log'>;
} = {}) {
  const { insertId = 'review-new-1' as Id<'srs_review_log'> } = overrides;
  const mockInsert = vi.fn().mockResolvedValue(insertId);
  return {
    db: {
      insert: mockInsert,
    },
    mockInsert,
  };
}

function makeMockQueryCtx(overrides: {
  reviews?: MockReviewDbRecord[];
} = {}) {
  const {
    reviews = [],
  } = overrides;

  const mockCollect = vi.fn().mockResolvedValue(reviews);

  const mockQuery = {
    withIndex: vi.fn().mockReturnValue({
      collect: mockCollect,
    }),
  };

  return {
    db: {
      query: vi.fn().mockReturnValue(mockQuery),
    },
  };
}

describe('saveReview', () => {
  it('should insert review log with all required fields', async () => {
    const { db, mockInsert } = makeMockMutationCtx();
    const ctx = { db } as unknown as MutationCtx;

    const reviewData = {
      reviewId: 'rev-1',
      cardId: 'card-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      rating: 'Good' as const,
      submissionId: 'sub-1',
      evidence: {
        baseRating: 'Good' as const,
        timingAdjusted: false,
        reasons: ['correct'],
      },
      stateBefore: {
        stability: 5,
        difficulty: 4,
        state: 'review' as const,
        reps: 5,
        lapses: 0,
      },
      stateAfter: {
        stability: 6,
        difficulty: 4,
        state: 'review' as const,
        reps: 6,
        lapses: 0,
      },
      reviewedAt: '2026-04-29T12:00:00.000Z',
    };

    await saveReviewHandler(ctx, reviewData);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const call = mockInsert.mock.calls[0];
    expect(call[0]).toBe('srs_review_log');
    const inserted = call[1];
    expect(inserted.cardId).toBe('card-1');
    expect(inserted.studentId).toBe('student-1');
    expect(inserted.rating).toBe('Good');
    expect(inserted.reviewId).toBe('rev-1');
    expect(inserted.submissionId).toBe('sub-1');
    expect(inserted.evidence).toEqual({
      baseRating: 'Good',
      timingAdjusted: false,
      reasons: ['correct'],
    });
    expect(inserted.stateBefore).toEqual({
      stability: 5,
      difficulty: 4,
      state: 'review',
      reps: 5,
      lapses: 0,
    });
    expect(inserted.stateAfter).toEqual({
      stability: 6,
      difficulty: 4,
      state: 'review',
      reps: 6,
      lapses: 0,
    });
    expect(inserted.reviewedAt).toBe(new Date('2026-04-29T12:00:00.000Z').getTime());
  });

  it('should handle missing optional reviewId and submissionId', async () => {
    const { db, mockInsert } = makeMockMutationCtx();
    const ctx = { db } as unknown as MutationCtx;

    const reviewData = {
      cardId: 'card-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      rating: 'Hard' as const,
      evidence: {
        baseRating: 'Hard' as const,
        timingAdjusted: true,
        reasons: ['slow'],
      },
      stateBefore: {
        stability: 5,
        difficulty: 4,
        state: 'review' as const,
        reps: 5,
        lapses: 0,
      },
      stateAfter: {
        stability: 6,
        difficulty: 4,
        state: 'review' as const,
        reps: 6,
        lapses: 1,
      },
      reviewedAt: '2026-04-29T12:00:00.000Z',
    };

    await saveReviewHandler(ctx, reviewData);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const call = mockInsert.mock.calls[0];
    const inserted = call[1];
    expect(inserted.reviewId).toBeUndefined();
    expect(inserted.submissionId).toBeUndefined();
    expect(inserted.stateBefore).toEqual({
      stability: 5,
      difficulty: 4,
      state: 'review',
      reps: 5,
      lapses: 0,
    });
    expect(inserted.stateAfter).toEqual({
      stability: 6,
      difficulty: 4,
      state: 'review',
      reps: 6,
      lapses: 1,
    });
  });

  it('should handle teacher_reset evidence type', async () => {
    const { db, mockInsert } = makeMockMutationCtx();
    const ctx = { db } as unknown as MutationCtx;

    const reviewData = {
      reviewId: 'rev-2',
      cardId: 'card-2' as Id<'srs_cards'>,
      studentId: 'student-2' as Id<'profiles'>,
      rating: 'Again' as const,
      evidence: {
        action: 'teacher_reset' as const,
        objectiveId: 'obj-123',
      },
      stateBefore: {
        stability: 1,
        difficulty: 5,
        state: 'learning' as const,
        reps: 1,
        lapses: 0,
      },
      stateAfter: {
        stability: 1,
        difficulty: 5,
        state: 'new' as const,
        reps: 0,
        lapses: 0,
      },
      reviewedAt: '2026-04-29T13:00:00.000Z',
    };

    await saveReviewHandler(ctx, reviewData);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const call = mockInsert.mock.calls[0];
    const inserted = call[1];
    expect(inserted.evidence).toEqual({
      action: 'teacher_reset',
      objectiveId: 'obj-123',
    });
    expect(inserted.stateBefore).toEqual({
      stability: 1,
      difficulty: 5,
      state: 'learning',
      reps: 1,
      lapses: 0,
    });
    expect(inserted.stateAfter).toEqual({
      stability: 1,
      difficulty: 5,
      state: 'new',
      reps: 0,
      lapses: 0,
    });
  });
});

describe('getReviewsByCard', () => {
  it('should return reviews sorted by reviewedAt ascending', async () => {
    const reviews: MockReviewDbRecord[] = [
      {
        _id: 'review-2' as Id<'srs_review_log'>,
        cardId: 'card-1' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Good',
        reviewId: 'rev-2',
        submissionId: 'sub-2',
        evidence: {
          baseRating: 'Good' as const,
          timingAdjusted: false,
          reasons: ['correct'],
        },
        stateBefore: { stability: 5, difficulty: 4, state: 'review' as const, reps: 5, lapses: 0 },
        stateAfter: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
        reviewedAt: 1777460400000,
      },
      {
        _id: 'review-1' as Id<'srs_review_log'>,
        cardId: 'card-1' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Hard',
        reviewId: 'rev-1',
        submissionId: 'sub-1',
        evidence: {
          baseRating: 'Hard' as const,
          timingAdjusted: true,
          reasons: ['slow'],
        },
        stateBefore: { stability: 5, difficulty: 4, state: 'review' as const, reps: 5, lapses: 0 },
        stateAfter: { stability: 4, difficulty: 4, state: 'review' as const, reps: 6, lapses: 1 },
        reviewedAt: 1777456800000,
      },
    ];
    const { db } = makeMockQueryCtx({ reviews });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByCardHandler(ctx, { cardId: 'card-1' as Id<'srs_cards'> });

    expect(result).toHaveLength(2);
    expect(result[0].reviewId).toBe('rev-1');
    expect(result[1].reviewId).toBe('rev-2');
    expect(result[0].reviewedAt).toBe('2026-04-29T10:00:00.000Z');
    expect(result[1].reviewedAt).toBe('2026-04-29T11:00:00.000Z');
  });

  it('should return empty array when no reviews exist for card', async () => {
    const { db } = makeMockQueryCtx({ reviews: [] });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByCardHandler(ctx, { cardId: 'card-nonexistent' as Id<'srs_cards'> });

    expect(result).toHaveLength(0);
  });

  it('should map database fields to contract format correctly', async () => {
    const dbReview: MockReviewDbRecord = {
      _id: 'review-1' as Id<'srs_review_log'>,
      cardId: 'card-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      rating: 'Easy',
      submissionId: undefined,
      evidence: {
        baseRating: 'Easy' as const,
        timingAdjusted: false,
        reasons: ['fast'],
        misconceptionTags: ['misconception-1'],
      },
      stateBefore: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
      stateAfter: { stability: 8, difficulty: 4, state: 'review' as const, reps: 7, lapses: 0 },
      reviewedAt: 1777456800000,
    };
    const { db } = makeMockQueryCtx({ reviews: [dbReview] });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByCardHandler(ctx, { cardId: 'card-1' as Id<'srs_cards'> });

    expect(result).toHaveLength(1);
    expect(result[0].reviewId).toBe('review-1');
    expect(result[0].cardId).toBe('card-1');
    expect(result[0].studentId).toBe('student-1');
    expect(result[0].submissionId).toBe('');
    expect(result[0].evidence).toEqual({
      baseRating: 'Easy',
      timingAdjusted: false,
      reasons: ['fast'],
      misconceptionTags: ['misconception-1'],
    });
    expect(result[0].reviewedAt).toBe('2026-04-29T10:00:00.000Z');
  });
});

describe('getReviewsByStudent', () => {
  it('should return reviews sorted by reviewedAt ascending', async () => {
    const reviews: MockReviewDbRecord[] = [
      {
        _id: 'review-2' as Id<'srs_review_log'>,
        cardId: 'card-1' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Good',
        reviewId: 'rev-2',
        submissionId: 'sub-2',
        evidence: {
          baseRating: 'Good' as const,
          timingAdjusted: false,
          reasons: ['correct'],
        },
        stateBefore: { stability: 5, difficulty: 4, state: 'review' as const, reps: 5, lapses: 0 },
        stateAfter: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
        reviewedAt: 1777460400000,
      },
      {
        _id: 'review-1' as Id<'srs_review_log'>,
        cardId: 'card-2' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Easy',
        reviewId: 'rev-1',
        submissionId: 'sub-1',
        evidence: {
          baseRating: 'Easy' as const,
          timingAdjusted: false,
          reasons: ['fast'],
        },
        stateBefore: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
        stateAfter: { stability: 8, difficulty: 4, state: 'review' as const, reps: 7, lapses: 0 },
        reviewedAt: 1777456800000,
      },
    ];
    const { db } = makeMockQueryCtx({ reviews });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByStudentHandler(ctx, { studentId: 'student-1' as Id<'profiles'> });

    expect(result).toHaveLength(2);
    expect(result[0].reviewId).toBe('rev-1');
    expect(result[1].reviewId).toBe('rev-2');
  });

  it('should filter by since timestamp when provided', async () => {
    const reviews: MockReviewDbRecord[] = [
      {
        _id: 'review-2' as Id<'srs_review_log'>,
        cardId: 'card-1' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Good',
        reviewId: 'rev-2',
        submissionId: 'sub-2',
        evidence: {
          baseRating: 'Good' as const,
          timingAdjusted: false,
          reasons: ['correct'],
        },
        stateBefore: { stability: 5, difficulty: 4, state: 'review' as const, reps: 5, lapses: 0 },
        stateAfter: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
        reviewedAt: 1777460400000,
      },
      {
        _id: 'review-1' as Id<'srs_review_log'>,
        cardId: 'card-2' as Id<'srs_cards'>,
        studentId: 'student-1' as Id<'profiles'>,
        rating: 'Easy',
        reviewId: 'rev-1',
        submissionId: 'sub-1',
        evidence: {
          baseRating: 'Easy' as const,
          timingAdjusted: false,
          reasons: ['fast'],
        },
        stateBefore: { stability: 6, difficulty: 4, state: 'review' as const, reps: 6, lapses: 0 },
        stateAfter: { stability: 8, difficulty: 4, state: 'review' as const, reps: 7, lapses: 0 },
        reviewedAt: 1777456800000,
      },
    ];
    const { db } = makeMockQueryCtx({ reviews });
    const ctx = { db } as unknown as QueryCtx;

    const since = '2026-04-29T11:00:00.000Z';
    const result = await getReviewsByStudentHandler(ctx, { studentId: 'student-1' as Id<'profiles'>, since });

    expect(result).toHaveLength(1);
    expect(result[0].reviewId).toBe('rev-2');
  });

  it('should return empty array when no reviews exist for student', async () => {
    const { db } = makeMockQueryCtx({ reviews: [] });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByStudentHandler(ctx, { studentId: 'student-nonexistent' as Id<'profiles'> });

    expect(result).toHaveLength(0);
  });

  it('should map database fields to contract format correctly', async () => {
    const dbReview: MockReviewDbRecord = {
      _id: 'review-1' as Id<'srs_review_log'>,
      cardId: 'card-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      rating: 'Again',
      submissionId: 'sub-1',
      evidence: {
        action: 'teacher_reset' as const,
        objectiveId: 'obj-123',
      },
      stateBefore: { stability: 1, difficulty: 5, state: 'learning' as const, reps: 1, lapses: 0 },
      stateAfter: { stability: 1, difficulty: 5, state: 'new' as const, reps: 0, lapses: 0 },
      reviewedAt: 1777456800000,
    };
    const { db } = makeMockQueryCtx({ reviews: [dbReview] });
    const ctx = { db } as unknown as QueryCtx;

    const result = await getReviewsByStudentHandler(ctx, { studentId: 'student-1' as Id<'profiles'> });

    expect(result).toHaveLength(1);
    expect(result[0].reviewId).toBe('review-1');
    expect(result[0].cardId).toBe('card-1');
    expect(result[0].studentId).toBe('student-1');
    expect(result[0].submissionId).toBe('sub-1');
    expect(result[0].evidence).toEqual({
      action: 'teacher_reset',
      objectiveId: 'obj-123',
    });
    expect(result[0].reviewedAt).toBe('2026-04-29T10:00:00.000Z');
  });
});
