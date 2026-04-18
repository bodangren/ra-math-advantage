import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SrsReviewLogEntry } from '@/lib/srs/contract';
import { ConvexReviewLogStore } from '@/lib/srs/convexReviewLogStore';

const mockRunMutation = vi.fn();
const mockRunQuery = vi.fn();

interface MockCtx {
  runMutation: typeof mockRunMutation;
  runQuery: typeof mockRunQuery;
}

const mockCtx = {
  runMutation: mockRunMutation,
  runQuery: mockRunQuery,
} as unknown as MockCtx & import('@/convex/_generated/server').MutationCtx;

function makeReviewLog(overrides: Partial<SrsReviewLogEntry> = {}): SrsReviewLogEntry {
  return {
    reviewId: 'rev-1',
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
    reviewedAt: '2026-04-16T12:00:00.000Z',
    ...overrides,
  };
}

describe('ConvexReviewLogStore', () => {
  let store: ConvexReviewLogStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new ConvexReviewLogStore(mockCtx);
  });

  describe('saveReview', () => {
    it('should call runMutation with the correct args', async () => {
      const entry = makeReviewLog();
      mockRunMutation.mockResolvedValue(undefined);

      await store.saveReview(entry);

      expect(mockRunMutation).toHaveBeenCalledTimes(1);
      expect(mockRunMutation).toHaveBeenCalledWith(
        expect.anything(),
        {
          reviewId: entry.reviewId,
          cardId: entry.cardId,
          studentId: entry.studentId,
          rating: entry.rating,
          submissionId: entry.submissionId,
          evidence: entry.evidence,
          stateBefore: entry.stateBefore,
          stateAfter: entry.stateAfter,
          reviewedAt: entry.reviewedAt,
        },
      );
    });
  });

  describe('getReviewsByCard', () => {
    it('should call runQuery and return mapped reviews', async () => {
      const mockReviews: SrsReviewLogEntry[] = [
        makeReviewLog({ reviewId: 'rev-1', cardId: 'card-1' }),
        makeReviewLog({ reviewId: 'rev-2', cardId: 'card-1', rating: 'Again' }),
      ];
      mockRunQuery.mockResolvedValue(mockReviews);

      const result = await store.getReviewsByCard('card-1');

      expect(mockRunQuery).toHaveBeenCalledTimes(1);
      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { cardId: 'card-1' },
      );
      expect(result).toEqual(mockReviews);
    });
  });

  describe('getReviewsByStudent', () => {
    it('should call runQuery with studentId only when since is not provided', async () => {
      const mockReviews: SrsReviewLogEntry[] = [
        makeReviewLog({ reviewId: 'rev-1', studentId: 'student-1' }),
      ];
      mockRunQuery.mockResolvedValue(mockReviews);

      const result = await store.getReviewsByStudent('student-1');

      expect(mockRunQuery).toHaveBeenCalledTimes(1);
      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { studentId: 'student-1', since: undefined },
      );
      expect(result).toEqual(mockReviews);
    });

    it('should call runQuery with studentId and since when provided', async () => {
      const mockReviews: SrsReviewLogEntry[] = [
        makeReviewLog({ reviewId: 'rev-1', studentId: 'student-1' }),
      ];
      mockRunQuery.mockResolvedValue(mockReviews);

      const result = await store.getReviewsByStudent('student-1', '2026-04-10T12:00:00.000Z');

      expect(mockRunQuery).toHaveBeenCalledTimes(1);
      expect(mockRunQuery).toHaveBeenCalledWith(
        expect.anything(),
        { studentId: 'student-1', since: '2026-04-10T12:00:00.000Z' },
      );
      expect(result).toEqual(mockReviews);
    });
  });
});
