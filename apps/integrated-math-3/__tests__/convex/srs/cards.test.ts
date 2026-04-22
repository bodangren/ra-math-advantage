import { describe, it, expect, vi } from 'vitest';
import {
  saveCard,
  getCard,
  getCardsByStudent,
  getCardByStudentAndFamily,
} from '@/convex/srs/cards';
import type { Id } from '@/convex/_generated/dataModel';
import type { SrsCardState } from '@math-platform/srs-engine';

function makeMockCtx(overrides: {
  existingCard?: {
    _id: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string;
    createdAt: number;
    updatedAt: number;
  } | null;
  cards?: Array<{
    _id: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string;
    createdAt: number;
    updatedAt: number;
  }>;
  insertId?: Id<'srs_cards'>;
} = {}) {
  const {
    existingCard,
    cards,
    insertId = 'card-new-1' as Id<'srs_cards'>,
  } = overrides;

  const mockInsert = vi.fn().mockResolvedValue(insertId);
  const mockReplace = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn().mockResolvedValue(existingCard ?? null);

  const mockQuery = {
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(existingCard ?? null),
      collect: vi.fn().mockResolvedValue(cards ?? (existingCard ? [existingCard] : [])),
    }),
  };

  return {
    db: {
      query: vi.fn().mockReturnValue(mockQuery),
      insert: mockInsert,
      replace: mockReplace,
      get: mockGet,
    },
    mockInsert,
    mockReplace,
    mockGet,
    mockQuery,
  };
}

describe('mapDbCardToContract studentId type alignment', () => {
  it('should return studentId as plain string, not Id<"profiles">', async () => {
    const convexId = 'k56b7c1a2d3e4f5g6h7i8j9k0l1m2n3o' as Id<'profiles'>;
    const existingCard = {
      _id: 'card-1' as Id<'srs_cards'>,
      studentId: convexId,
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 5,
      difficulty: 4,
      state: 'review' as const,
      dueDate: '2026-04-16T12:00:00.000Z',
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      lastReview: '2026-04-16T12:00:00.000Z',
      createdAt: 1713264000000,
      updatedAt: 1713264000000,
    };
    const { db } = makeMockCtx({ existingCard });

    const result = await getCard({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { id: 'card-1' });

    expect(result).not.toBeNull();
    expect(typeof result!.studentId).toBe('string');
    expect(result!.studentId).toBe(convexId);
  });

  it('should return cardId as plain string, not Id<"srs_cards">', async () => {
    const cardId = 'k56b7c1a2d3e4f5g6h7i8j9k0l1m2n3o' as Id<'srs_cards'>;
    const existingCard = {
      _id: cardId,
      studentId: 'student-1' as Id<'profiles'>,
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 5,
      difficulty: 4,
      state: 'review' as const,
      dueDate: '2026-04-16T12:00:00.000Z',
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      lastReview: '2026-04-16T12:00:00.000Z',
      createdAt: 1713264000000,
      updatedAt: 1713264000000,
    };
    const { db } = makeMockCtx({ existingCard });

    const result = await getCard({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { id: cardId });

    expect(result).not.toBeNull();
    expect(typeof result!.cardId).toBe('string');
    expect(result!.cardId).toBe(cardId);
  });

  it('should round-trip studentId through save and load as plain string', async () => {
    const studentId = 'student-abc-123';
    const card: SrsCardState = {
      cardId: 'card-1',
      studentId,
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

    const { db, mockInsert } = makeMockCtx({ insertId: 'card-1' as Id<'srs_cards'> });

    await saveCard(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      card
    );

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const inserted = mockInsert.mock.calls[0][1];
    expect(typeof inserted.studentId).toBe('string');
    expect(inserted.studentId).toBe(studentId);
  });

  it('getCardsByStudent returns studentId as plain string for all cards', async () => {
    const convexStudentId = 'k56b7c1a2d3e4f5g6h7i8j9k0l1m2n3o' as Id<'profiles'>;
    const cards = [
      {
        _id: 'card-1' as Id<'srs_cards'>,
        studentId: convexStudentId,
        objectiveId: 'obj-1',
        problemFamilyId: 'pf-1',
        stability: 5,
        difficulty: 4,
        state: 'review' as const,
        dueDate: '2026-04-16T12:00:00.000Z',
        elapsedDays: 5,
        scheduledDays: 5,
        reps: 5,
        lapses: 0,
        createdAt: 1713264000000,
        updatedAt: 1713264000000,
      },
      {
        _id: 'card-2' as Id<'srs_cards'>,
        studentId: convexStudentId,
        objectiveId: 'obj-2',
        problemFamilyId: 'pf-2',
        stability: 3,
        difficulty: 5,
        state: 'learning' as const,
        dueDate: '2026-04-17T12:00:00.000Z',
        elapsedDays: 1,
        scheduledDays: 2,
        reps: 2,
        lapses: 1,
        createdAt: 1713264000000,
        updatedAt: 1713264000000,
      },
    ];
    const { db } = makeMockCtx({ cards });

    const result = await getCardsByStudent(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: convexStudentId }
    );

    expect(result).toHaveLength(2);
    for (const card of result) {
      expect(typeof card.studentId).toBe('string');
      expect(card.studentId).toBe(convexStudentId);
    }
  });

  it('getCardByStudentAndFamily returns studentId as plain string', async () => {
    const convexStudentId = 'k56b7c1a2d3e4f5g6h7i8j9k0l1m2n3o' as Id<'profiles'>;
    const existingCard = {
      _id: 'card-1' as Id<'srs_cards'>,
      studentId: convexStudentId,
      objectiveId: 'obj-1',
      problemFamilyId: 'pf-1',
      stability: 5,
      difficulty: 4,
      state: 'review' as const,
      dueDate: '2026-04-16T12:00:00.000Z',
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
      createdAt: 1713264000000,
      updatedAt: 1713264000000,
    };
    const { db } = makeMockCtx({ existingCard });

    const result = await getCardByStudentAndFamily(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: convexStudentId, problemFamilyId: 'pf-1' }
    );

    expect(result).not.toBeNull();
    expect(typeof result!.studentId).toBe('string');
    expect(result!.studentId).toBe(convexStudentId);
  });
});
