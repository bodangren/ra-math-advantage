import { describe, it, expect, vi } from 'vitest';
import { ConvexCardStore, toProfileId } from '@/lib/srs/convexCardStore';
import type { Id } from '@/convex/_generated/dataModel';
import type { SrsCardState, SrsReviewLogEntry } from '@math-platform/srs-engine';

describe('toProfileId', () => {
  it('passes through a valid string as Id<"profiles">', () => {
    const result = toProfileId('student-abc-123');
    expect(result).toBe('student-abc-123');
  });

  it('rejects empty string', () => {
    expect(() => toProfileId('')).toThrow('studentId must be a non-empty string');
  });

  it('rejects whitespace-only string', () => {
    expect(() => toProfileId('   ')).toThrow('studentId must be a non-empty string');
  });

  it('trims whitespace from valid IDs', () => {
    const result = toProfileId('  student-1  ');
    expect(result).toBe('student-1');
  });

  it('type-narrows string to Id<"profiles"> at compile time', () => {
    // Compile-time assertion: toProfileId output is assignable to Id<"profiles">
    const id: Id<'profiles'> = toProfileId('test-id');
    expect(id).toBe('test-id');
  });
});

describe('ConvexCardStore.saveCardAndReview', () => {
  it('calls processReviewHandler directly instead of runMutation', async () => {
    const mockInsert = vi.fn().mockResolvedValue('card-doc-1' as Id<'srs_cards'>);
    const mockReplace = vi.fn().mockResolvedValue(undefined);
    const mockQuery = {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(null),
      }),
    };
    const mockRunMutation = vi.fn().mockResolvedValue(undefined);

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue(mockQuery),
        insert: mockInsert,
        replace: mockReplace,
      },
      runMutation: mockRunMutation,
    };

    const store = new ConvexCardStore(ctx as unknown as import('@/convex/_generated/server').MutationCtx);

    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 5,
      difficulty: 4,
      state: 'review',
      dueDate: '2026-04-16T12:00:00.000Z',
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      lastReview: '2026-04-16T12:00:00.000Z',
      createdAt: '2026-04-16T12:00:00.000Z',
      updatedAt: '2026-04-16T12:00:00.000Z',
    };

    const reviewLog: SrsReviewLogEntry = {
      reviewId: 'rev-1',
      cardId: 'card-1',
      studentId: 'student-1',
      rating: 'Good',
      submissionId: 'sub-1',
      evidence: {
        baseRating: 'Good',
        timingAdjusted: false,
        reasons: [],
      },
      stateBefore: { stability: 5, difficulty: 4, state: 'review', reps: 5, lapses: 0 },
      stateAfter: { stability: 6, difficulty: 3.5, state: 'review', reps: 6, lapses: 0 },
      reviewedAt: '2026-04-16T12:00:00.000Z',
    };

    await store.saveCardAndReview(card, reviewLog);

    // Should NOT use runMutation - direct DB access for atomicity
    expect(mockRunMutation).not.toHaveBeenCalled();
    // Should insert both card and review log via processReviewHandler
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsert).toHaveBeenNthCalledWith(1, 'srs_cards', expect.any(Object));
    expect(mockInsert).toHaveBeenNthCalledWith(2, 'srs_review_log', expect.any(Object));
  });

  it('replaces existing card and inserts review log atomically', async () => {
    const existingCard = {
      _id: 'card-doc-1' as Id<'srs_cards'>,
      studentId: 'student-1' as Id<'profiles'>,
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 3,
      difficulty: 5,
      state: 'learning' as const,
      dueDate: '2026-04-15T12:00:00.000Z',
      elapsedDays: 2,
      scheduledDays: 3,
      reps: 2,
      lapses: 1,
      createdAt: 1713264000000,
      updatedAt: 1713264000000,
    };

    const mockQuery = {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingCard),
      }),
    };
    const mockReplace = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn().mockResolvedValue('rev-doc-1' as Id<'srs_review_log'>);
    const mockRunMutation = vi.fn().mockResolvedValue(undefined);

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue(mockQuery),
        replace: mockReplace,
        insert: mockInsert,
      },
      runMutation: mockRunMutation,
    };

    const store = new ConvexCardStore(ctx as unknown as import('@/convex/_generated/server').MutationCtx);

    const card: SrsCardState = {
      cardId: 'card-1',
      studentId: 'student-1',
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 5,
      difficulty: 4,
      state: 'review',
      dueDate: '2026-04-16T12:00:00.000Z',
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      lastReview: '2026-04-16T12:00:00.000Z',
      createdAt: '2026-04-16T12:00:00.000Z',
      updatedAt: '2026-04-16T12:00:00.000Z',
    };

    const reviewLog: SrsReviewLogEntry = {
      reviewId: 'rev-1',
      cardId: 'card-1',
      studentId: 'student-1',
      rating: 'Good',
      submissionId: 'sub-1',
      evidence: {
        baseRating: 'Good',
        timingAdjusted: false,
        reasons: [],
      },
      stateBefore: { stability: 3, difficulty: 5, state: 'learning', reps: 2, lapses: 1 },
      stateAfter: { stability: 5, difficulty: 4, state: 'review', reps: 3, lapses: 1 },
      reviewedAt: '2026-04-16T12:00:00.000Z',
    };

    await store.saveCardAndReview(card, reviewLog);

    expect(mockRunMutation).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('srs_review_log', expect.any(Object));
  });
});
