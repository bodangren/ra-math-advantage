import { describe, it, expect, vi } from 'vitest';
import {
  processReviewHandler,
  type ProcessReviewArgs,
} from '@/convex/srs/processReview';
import type { Id } from '@/convex/_generated/dataModel';

function makeMockCtx(overrides: {
  existingCard?: {
    _id: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    createdAt: number;
  } | null;
  insertId?: Id<'srs_review_log'>;
} = {}) {
  const { existingCard, insertId } = overrides;

  const mockReplace = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn().mockResolvedValue(insertId ?? ('log-123' as Id<'srs_review_log'>));

  const mockQuery = {
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(existingCard ?? null),
    }),
  };

  return {
    db: {
      query: vi.fn().mockReturnValue(mockQuery),
      replace: mockReplace,
      insert: mockInsert,
    },
    mockReplace,
    mockInsert,
    mockQuery,
  };
}

function makeArgs(overrides: Partial<ProcessReviewArgs> = {}): ProcessReviewArgs {
  return {
    cardState: {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'family-1',
      stability: 2.5,
      difficulty: 0,
      state: 'review',
      dueDate: '2026-04-17T00:00:00.000Z',
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 3,
      lapses: 0,
      lastReview: '2026-04-16T00:00:00.000Z',
      createdAt: '2026-04-15T00:00:00.000Z',
      updatedAt: '2026-04-16T12:00:00.000Z',
      ...overrides.cardState,
    },
    reviewEntry: {
      reviewId: 'rev-1',
      cardId: 'card-1',
      studentId: 'student-1',
      rating: 'Good',
      submissionId: 'sub-1',
      evidence: { baseRating: 'Good', timingAdjusted: false, reasons: ['correct'] },
      stateBefore: { stability: 2.5, difficulty: 0, state: 'review', reps: 3, lapses: 0 },
      stateAfter: { stability: 3.5, difficulty: 0, state: 'review', reps: 4, lapses: 0 },
      reviewedAt: '2026-04-16T12:00:00.000Z',
      ...overrides.reviewEntry,
    },
  };
}

describe('processReviewHandler', () => {
  it('should update existing card and insert review log atomically', async () => {
    const existingCard = {
      _id: 'card-doc-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      createdAt: 1713139200000,
    };
    const { db, mockReplace, mockInsert } = makeMockCtx({ existingCard });
    const args = makeArgs();

    const result = await processReviewHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(existingCard._id, expect.objectContaining({
      studentId: existingCard.studentId,
      problemFamilyId: args.cardState.problemFamilyId,
      stability: args.cardState.stability,
      difficulty: args.cardState.difficulty,
      state: args.cardState.state,
      dueDate: args.cardState.dueDate,
      elapsedDays: args.cardState.elapsedDays,
      scheduledDays: args.cardState.scheduledDays,
      reps: args.cardState.reps,
      lapses: args.cardState.lapses,
      lastReview: args.cardState.lastReview,
      createdAt: existingCard.createdAt,
      updatedAt: new Date(args.cardState.updatedAt).getTime(),
    }));

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('srs_review_log', expect.objectContaining({
      cardId: existingCard._id,
      studentId: args.reviewEntry.studentId,
      rating: args.reviewEntry.rating,
      submissionId: args.reviewEntry.submissionId,
      evidence: args.reviewEntry.evidence,
      stateBefore: args.reviewEntry.stateBefore,
      stateAfter: args.reviewEntry.stateAfter,
      reviewedAt: new Date(args.reviewEntry.reviewedAt).getTime(),
    }));

    expect(result).toEqual({
      cardId: args.cardState.cardId,
      logEntryId: 'log-123',
    });
  });

  it('should insert new card when no existing card is found', async () => {
    const { db, mockReplace, mockInsert } = makeMockCtx({ insertId: 'log-456' as Id<'srs_review_log'> });
    const args = makeArgs();

    const result = await processReviewHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledTimes(2);

    const cardInsertCall = mockInsert.mock.calls[0];
    expect(cardInsertCall[0]).toBe('srs_cards');
    expect(cardInsertCall[1]).toMatchObject({
      studentId: args.cardState.studentId,
      problemFamilyId: args.cardState.problemFamilyId,
      stability: args.cardState.stability,
      createdAt: new Date(args.cardState.createdAt).getTime(),
      updatedAt: new Date(args.cardState.updatedAt).getTime(),
    });

    const logInsertCall = mockInsert.mock.calls[1];
    expect(logInsertCall[0]).toBe('srs_review_log');

    expect(result).toEqual({
      cardId: args.cardState.cardId,
      logEntryId: 'log-456',
    });
  });

  it('should propagate error and not insert log if card update fails', async () => {
    const existingCard = {
      _id: 'card-doc-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      createdAt: 1713139200000,
    };
    const { db, mockReplace, mockInsert } = makeMockCtx({ existingCard });
    mockReplace.mockRejectedValue(new Error('Replace failed'));
    const args = makeArgs();

    await expect(processReviewHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args)).rejects.toThrow('Replace failed');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should handle sequential reviews by updating card state each time', async () => {
    const existingCard = {
      _id: 'card-doc-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      createdAt: 1713139200000,
    };
    const ctx1 = makeMockCtx({ existingCard, insertId: 'log-1' as Id<'srs_review_log'> });
    const ctx2 = makeMockCtx({ existingCard, insertId: 'log-2' as Id<'srs_review_log'> });

    const args1 = makeArgs({
      cardState: { ...makeArgs().cardState, reps: 3, stability: 2.5 },
    });
    await processReviewHandler({ db: ctx1.db } as unknown as import('@/convex/_generated/server').MutationCtx, args1);

    const args2 = makeArgs({
      cardState: { ...makeArgs().cardState, reps: 4, stability: 3.5 },
    });
    await processReviewHandler({ db: ctx2.db } as unknown as import('@/convex/_generated/server').MutationCtx, args2);

    expect(ctx1.mockReplace).toHaveBeenCalledWith(
      existingCard._id,
      expect.objectContaining({ reps: 3, stability: 2.5 }),
    );
    expect(ctx2.mockReplace).toHaveBeenCalledWith(
      existingCard._id,
      expect.objectContaining({ reps: 4, stability: 3.5 }),
    );
  });
});
