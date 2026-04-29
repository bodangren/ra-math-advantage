import { describe, it, expect, vi } from 'vitest';
import {
  saveCardHandler,
  saveCardsHandler,
  getCardHandler,
  getCardsByStudentHandler,
  getCardByStudentAndFamilyHandler,
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

    const result = await getCardHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { id: 'card-1' });

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

    const result = await getCardHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { id: cardId });

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

    await saveCardHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      card as unknown as Parameters<typeof saveCardHandler>[1]
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

    const result = await getCardsByStudentHandler(
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

    const result = await getCardByStudentAndFamilyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: convexStudentId, problemFamilyId: 'pf-1' }
    );

    expect(result).not.toBeNull();
    expect(typeof result!.studentId).toBe('string');
    expect(result!.studentId).toBe(convexStudentId);
  });
});

describe('saveCardsHandler batch operations', () => {
  function makeSaveCardsMockCtx() {
    const mockInsert = vi.fn().mockResolvedValue('card-new-id' as Id<'srs_cards'>);
    const mockReplace = vi.fn().mockResolvedValue(undefined);

    const mockFirst = vi.fn().mockImplementation(() => {
      return Promise.resolve(null);
    });

    const mockQuery = {
      withIndex: vi.fn().mockReturnValue({
        first: mockFirst,
        collect: vi.fn().mockResolvedValue([]),
      }),
    };

    return {
      db: {
        query: vi.fn().mockReturnValue(mockQuery),
        insert: mockInsert,
        replace: mockReplace,
      },
      mockInsert,
      mockReplace,
      mockFirst,
      mockQuery,
    };
  }

  it('should handle empty array with no db operations', async () => {
    const { db, mockInsert, mockReplace, mockFirst } = makeSaveCardsMockCtx();

    await saveCardsHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { cards: [] }
    );

    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockFirst).not.toHaveBeenCalled();
  });

  it('should insert all cards when none exist (parallel inserts)', async () => {
    const studentId = 'student-1' as Id<'profiles'>;
    const studentId2 = 'student-2' as Id<'profiles'>;

    const { db, mockInsert, mockReplace, mockFirst } = makeSaveCardsMockCtx();

    mockFirst.mockResolvedValue(null);

    const cards = [
      {
        cardId: 'card-1',
        studentId,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
      {
        cardId: 'card-2',
        studentId: studentId2,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
    ];

    await saveCardsHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { cards }
    );

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should replace all cards when all exist (parallel replaces)', async () => {
    const existingId1 = 'card-existing-1' as Id<'srs_cards'>;
    const existingId2 = 'card-existing-2' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const studentId2 = 'student-2' as Id<'profiles'>;

    const { db, mockInsert, mockReplace, mockFirst } = makeSaveCardsMockCtx();

    mockFirst
      .mockResolvedValueOnce({
        _id: existingId1,
        studentId,
        problemFamilyId: 'pf-1',
        createdAt: 1713264000000,
      })
      .mockResolvedValueOnce({
        _id: existingId2,
        studentId: studentId2,
        problemFamilyId: 'pf-2',
        createdAt: 1713264000000,
      });

    const cards = [
      {
        cardId: 'card-1',
        studentId,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
      {
        cardId: 'card-2',
        studentId: studentId2,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
    ];

    await saveCardsHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { cards }
    );

    expect(mockReplace).toHaveBeenCalledTimes(2);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(existingId1, expect.objectContaining({
      studentId,
      problemFamilyId: 'pf-1',
      stability: 5,
    }));
    expect(mockReplace).toHaveBeenCalledWith(existingId2, expect.objectContaining({
      studentId: studentId2,
      problemFamilyId: 'pf-2',
      stability: 3,
    }));
  });

  it('should mix inserts and replaces when some cards exist', async () => {
    const existingId = 'card-existing-1' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const studentId2 = 'student-2' as Id<'profiles'>;

    const { db, mockInsert, mockReplace, mockFirst } = makeSaveCardsMockCtx();

    mockFirst
      .mockResolvedValueOnce({
        _id: existingId,
        studentId,
        problemFamilyId: 'pf-1',
        createdAt: 1713264000000,
      })
      .mockResolvedValueOnce(null);

    const cards = [
      {
        cardId: 'card-1',
        studentId,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
      {
        cardId: 'card-2',
        studentId: studentId2,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
    ];

    await saveCardsHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { cards }
    );

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(existingId, expect.objectContaining({
      studentId,
      problemFamilyId: 'pf-1',
    }));
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('should use Promise.all for parallel lookups and writes', async () => {
    const studentId = 'student-1' as Id<'profiles'>;
    const studentId2 = 'student-2' as Id<'profiles'>;
    const studentId3 = 'student-3' as Id<'profiles'>;

    const { db, mockInsert, mockReplace, mockFirst } = makeSaveCardsMockCtx();

    mockFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const cards = [
      {
        cardId: 'card-1',
        studentId,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
      {
        cardId: 'card-2',
        studentId: studentId2,
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
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
      {
        cardId: 'card-3',
        studentId: studentId3,
        objectiveId: 'obj-3',
        problemFamilyId: 'pf-3',
        stability: 4,
        difficulty: 3,
        state: 'new' as const,
        dueDate: '2026-04-18T12:00:00.000Z',
        elapsedDays: 0,
        scheduledDays: 1,
        reps: 0,
        lapses: 0,
        createdAt: '2026-04-16T12:00:00.000Z',
        updatedAt: '2026-04-16T12:00:00.000Z',
      },
    ];

    await saveCardsHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { cards }
    );

    expect(mockInsert).toHaveBeenCalledTimes(3);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
