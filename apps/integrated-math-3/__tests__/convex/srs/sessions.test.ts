import { describe, it, expect, vi } from 'vitest';
import {
  createSessionHandler,
  completeSessionHandler,
  getActiveSessionHandler,
  getSessionHistoryHandler,
  type CreateSessionArgs,
  type CompleteSessionArgs,
} from '@/convex/srs/sessions';
import type { Id } from '@/convex/_generated/dataModel';

function makeMockCtx(overrides: {
  insertId?: Id<'srs_sessions'>;
  existingSession?: {
    _id: Id<'srs_sessions'>;
    studentId: Id<'profiles'>;
    startedAt: number;
  } | null;
  sessions?: Array<{
    _id: Id<'srs_sessions'>;
    studentId: Id<'profiles'>;
    startedAt: number;
    completedAt?: number;
    plannedCards: number;
    completedCards: number;
    config: {
      newCardsPerDay: number;
      maxReviewsPerDay: number;
      prioritizeOverdue: boolean;
    };
  }>;
} = {}) {
  const { insertId = 'session-new-1' as Id<'srs_sessions'>, existingSession, sessions } = overrides;

  const mockReplace = vi.fn().mockResolvedValue(undefined);
  const mockPatch = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn().mockResolvedValue(insertId);
  const mockGet = vi.fn().mockResolvedValue(existingSession);

  const mockOrder = vi.fn().mockReturnValue({
    collect: vi.fn().mockResolvedValue(sessions ?? (existingSession ? [existingSession] : [])),
  });

  const mockFilter = vi.fn().mockReturnValue({
    first: vi.fn().mockResolvedValue(existingSession ?? null),
    collect: vi.fn().mockResolvedValue(sessions ?? (existingSession ? [existingSession] : [])),
    order: mockOrder,
  });

  const mockQuery = {
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(existingSession ?? null),
      collect: vi.fn().mockResolvedValue(sessions ?? (existingSession ? [existingSession] : [])),
      order: mockOrder,
      filter: mockFilter,
    }),
  };

  return {
    db: {
      query: vi.fn().mockReturnValue(mockQuery),
      replace: mockReplace,
      patch: mockPatch,
      insert: mockInsert,
      get: mockGet,
    },
    mockReplace,
    mockPatch,
    mockInsert,
    mockGet,
    mockQuery,
  };
}

describe('createSessionHandler', () => {
  it('should insert session with correct fields', async () => {
    const { db, mockInsert } = makeMockCtx({ insertId: 'session-abc' as Id<'srs_sessions'> });
    const args: CreateSessionArgs = {
      studentId: 'student-1',
      plannedCards: 20,
      config: {
        newCardsPerDay: 10,
        maxReviewsPerDay: 100,
        prioritizeOverdue: true,
      },
    };

    const result = await createSessionHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('srs_sessions', expect.objectContaining({
      studentId: 'student-1',
      plannedCards: 20,
      completedCards: 0,
      config: { newCardsPerDay: 10, maxReviewsPerDay: 100, prioritizeOverdue: true },
    }));
    expect(result).toBe('session-abc');
  });

  it('should set startedAt to current timestamp', async () => {
    const before = Date.now();
    const { db, mockInsert } = makeMockCtx();
    const args: CreateSessionArgs = {
      studentId: 'student-2',
      plannedCards: 15,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 50, prioritizeOverdue: false },
    };

    await createSessionHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args);
    const after = Date.now();

    const insertCall = mockInsert.mock.calls[0][1];
    expect(insertCall.startedAt).toBeGreaterThanOrEqual(before);
    expect(insertCall.startedAt).toBeLessThanOrEqual(after);
  });
});

describe('completeSessionHandler', () => {
  it('should patch session with completedAt and completedCards', async () => {
    const existingSession = {
      _id: 'session-doc-1' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: 1713264000000,
    };
    const { db, mockPatch } = makeMockCtx({ existingSession });
    const args: CompleteSessionArgs = {
      sessionId: 'session-doc-1',
      completedCards: 18,
    };

    const result = await completeSessionHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args);

    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(mockPatch).toHaveBeenCalledWith(existingSession._id, expect.objectContaining({
      completedAt: expect.any(Number),
      completedCards: 18,
    }));
    expect(result).toBe(existingSession._id);
  });

  it('should throw if session not found', async () => {
    const { db } = makeMockCtx({ existingSession: null });
    const args: CompleteSessionArgs = {
      sessionId: 'nonexistent',
      completedCards: 5,
    };

    await expect(
      completeSessionHandler({ db } as unknown as import('@/convex/_generated/server').MutationCtx, args)
    ).rejects.toThrow('Session not found: nonexistent');
  });
});

describe('getActiveSessionHandler', () => {
  it('should return null when no active session exists', async () => {
    const { db } = makeMockCtx({ existingSession: null });

    const result = await getActiveSessionHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { studentId: 'student-1' });

    expect(result).toBeNull();
  });

  it('should apply explicit completedAt=undefined filter to avoid relying on index sort order', async () => {
    const activeSession = {
      _id: 'session-active' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: Date.now(),
      plannedCards: 5,
      completedCards: 0,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db, mockQuery } = makeMockCtx({ existingSession: activeSession });

    await getActiveSessionHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    const withIndexResult = mockQuery.withIndex('by_student_and_status');
    expect(withIndexResult.filter).toHaveBeenCalled();
  });

  it('should not return a completed session even if it sorts first in the index', async () => {
    // Simulate the scenario where a completed session sorts before active sessions
    // in the by_student_and_status index. The explicit filter should exclude it.
    const completedSession = {
      _id: 'session-completed' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: Date.now() - 86400000,
      completedAt: Date.now(),
      plannedCards: 5,
      completedCards: 5,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };

    const mockFilter = vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(null),
    });

    const mockQueryObj = {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(completedSession),
        filter: mockFilter,
      }),
    };

    const db = {
      query: vi.fn().mockReturnValue(mockQueryObj),
    };

    const result = await getActiveSessionHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(mockFilter).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe('getSessionHistoryHandler', () => {
  it('should paginate completed sessions using filter-before-paginate (no post-filter underfill)', async () => {
    const completedSessions = [
      { _id: 's1' as Id<'srs_sessions'>, studentId: 'student-1' as Id<'profiles'>, startedAt: 1713264000000, completedAt: 1713350400000, plannedCards: 20, completedCards: 18, config: { newCardsPerDay: 10, maxReviewsPerDay: 100, prioritizeOverdue: true } },
      { _id: 's2' as Id<'srs_sessions'>, studentId: 'student-1' as Id<'profiles'>, startedAt: 1713177600000, completedAt: 1713264000000, plannedCards: 20, completedCards: 20, config: { newCardsPerDay: 10, maxReviewsPerDay: 100, prioritizeOverdue: true } },
    ];

    const mockPaginate = vi.fn().mockResolvedValue({
      page: completedSessions,
      isDone: true,
      continueCursor: 'cursor-end',
    });

    const mockFilter = vi.fn().mockReturnValue({ paginate: mockPaginate });
    const mockOrder = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });

    const db = { query: mockQuery };
    const result = await getSessionHistoryHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { studentId: 'student-1', limit: 10 });

    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0].sessionId).toBe('s1');
    expect(result.sessions[1].sessionId).toBe('s2');
    expect(result.nextCursor).toBeNull();
    expect(mockWithIndex).toHaveBeenCalledWith('by_student_and_status', expect.any(Function));
    expect(mockFilter).toHaveBeenCalled();
    expect(mockPaginate).toHaveBeenCalledWith({ cursor: null, numItems: 10 });
  });

  it('should return nextCursor when more completed results exist', async () => {
    const sessions = [
      { _id: 's1' as Id<'srs_sessions'>, studentId: 'student-1' as Id<'profiles'>, startedAt: 1713264000000, completedAt: 1713350400000, plannedCards: 20, completedCards: 18, config: { newCardsPerDay: 10, maxReviewsPerDay: 100, prioritizeOverdue: true } },
    ];

    const mockPaginate = vi.fn().mockResolvedValue({
      page: sessions,
      isDone: false,
      continueCursor: 'next-page-cursor',
    });

    const mockFilter = vi.fn().mockReturnValue({ paginate: mockPaginate });
    const mockOrder = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });

    const db = { query: mockQuery };
    const result = await getSessionHistoryHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { studentId: 'student-1', limit: 1 });

    expect(result.sessions).toHaveLength(1);
    expect(result.nextCursor).toBe('next-page-cursor');
  });

  it('should exclude incomplete sessions via neq filter (no underfill from post-filter)', async () => {
    const allSessions = [
      { _id: 's1' as Id<'srs_sessions'>, studentId: 'student-1' as Id<'profiles'>, startedAt: 1713264000000, completedAt: 1713350400000, plannedCards: 20, completedCards: 18, config: { newCardsPerDay: 10, maxReviewsPerDay: 100, prioritizeOverdue: true } },
      { _id: 's-active' as Id<'srs_sessions'>, studentId: 'student-1' as Id<'profiles'>, startedAt: Date.now(), plannedCards: 10, completedCards: 0, config: { newCardsPerDay: 5, maxReviewsPerDay: 50, prioritizeOverdue: false } },
    ];

    const completedOnly = [allSessions[0]];

    const mockPaginate = vi.fn().mockResolvedValue({
      page: completedOnly,
      isDone: true,
      continueCursor: 'end',
    });

    const mockFilter = vi.fn().mockReturnValue({ paginate: mockPaginate });
    const mockOrder = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });

    const db = { query: mockQuery };
    const result = await getSessionHistoryHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { studentId: 'student-1', limit: 10 });

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].sessionId).toBe('s1');
    expect(mockFilter).toHaveBeenCalled();
  });

  it('should pass cursor to paginate when provided', async () => {
    const mockPaginate = vi.fn().mockResolvedValue({
      page: [],
      isDone: true,
      continueCursor: 'end',
    });

    const mockFilter = vi.fn().mockReturnValue({ paginate: mockPaginate });
    const mockOrder = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });

    const db = { query: mockQuery };
    await getSessionHistoryHandler({ db } as unknown as import('@/convex/_generated/server').QueryCtx, { studentId: 'student-1', limit: 10, cursor: 'some-cursor' });

    expect(mockPaginate).toHaveBeenCalledWith({ cursor: 'some-cursor', numItems: 10 });
  });
});