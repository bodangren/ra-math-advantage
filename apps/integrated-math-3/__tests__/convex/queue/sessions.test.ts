import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startDailySessionHandler,
  getActiveSessionHandler,
  completeDailySessionHandler,
} from '@/convex/queue/sessions';
import { resolveDailyPracticeQueue, type ResolvedQueueItem } from '@/convex/queue/queue';
import type { Id } from '@/convex/_generated/dataModel';

vi.mock('@/convex/queue/queue', async () => {
  return {
    resolveDailyPracticeQueue: vi.fn(),
  };
});

function makeMockCtx(overrides: {
  existingSession?: {
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
  } | null;
  insertId?: Id<'srs_sessions'>;
  reviews?: Array<{
    _id: Id<'srs_review_log'>;
    studentId: Id<'profiles'>;
    cardId: Id<'srs_cards'>;
    reviewedAt: number;
    rating: string;
  }>;
} = {}) {
  const {
    existingSession,
    insertId = 'session-new-1' as Id<'srs_sessions'>,
    reviews = [],
  } = overrides;

  const mockInsert = vi.fn().mockResolvedValue(insertId);
  const mockPatch = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn().mockImplementation((id: Id<'srs_sessions'>) => {
    if (id === insertId) {
      return Promise.resolve({
        _id: insertId,
        studentId: 'student-1' as Id<'profiles'>,
        startedAt: Date.now(),
        completedAt: undefined,
        plannedCards: 2,
        completedCards: 0,
        config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
      });
    }
    if (existingSession && id === existingSession._id) {
      return Promise.resolve(existingSession);
    }
    return Promise.resolve(null);
  });

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'srs_sessions') {
      return {
        withIndex: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(existingSession ?? null),
        }),
      };
    }
    if (tableName === 'srs_review_log') {
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue(reviews),
        }),
      };
    }
    return {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(null),
        collect: vi.fn().mockResolvedValue([]),
      }),
    };
  });

  return {
    db: {
      query: mockQuery,
      insert: mockInsert,
      patch: mockPatch,
      get: mockGet,
    },
    mockInsert,
    mockPatch,
  };
}

beforeEach(() => {
  vi.mocked(resolveDailyPracticeQueue).mockReset();
});

describe('startDailySessionHandler', () => {
  it('creates srs_session record and returns queue', async () => {
    const { db, mockInsert } = makeMockCtx({ existingSession: null });
    const queue: ResolvedQueueItem[] = [{ card: { cardId: 'c1' } as never, objectivePriority: 'essential', isOverdue: false, daysOverdue: 0, componentKey: 'step-by-step-solver', props: {} }];
    vi.mocked(resolveDailyPracticeQueue).mockResolvedValue(queue);

    const result = await startDailySessionHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { studentId: 'student-1' }
    );

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('srs_sessions', expect.objectContaining({
      studentId: 'student-1',
      plannedCards: 1,
      completedCards: 0,
    }));
    expect(result.session.studentId).toBe('student-1');
    expect(result.queue).toEqual(queue);
  });

  it('applies SrsSessionConfig defaults (newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true)', async () => {
    const { db, mockInsert } = makeMockCtx({ existingSession: null });
    const queue: ResolvedQueueItem[] = [{ card: { cardId: 'c1' } as never, objectivePriority: 'essential', isOverdue: false, daysOverdue: 0, componentKey: 'step-by-step-solver', props: {} }];
    vi.mocked(resolveDailyPracticeQueue).mockResolvedValue(queue);

    await startDailySessionHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { studentId: 'student-1' }
    );

    expect(mockInsert).toHaveBeenCalledWith('srs_sessions', expect.objectContaining({
      config: {
        newCardsPerDay: 5,
        maxReviewsPerDay: 20,
        prioritizeOverdue: true,
      },
    }));
  });

  it('resumes existing active session when one exists for today', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-existing' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: now - 3600000, // 1 hour ago, same UTC day
      plannedCards: 5,
      completedCards: 2,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db, mockInsert } = makeMockCtx({ existingSession });
    const queue: ResolvedQueueItem[] = [{ card: { cardId: 'c1' } as never, objectivePriority: 'essential', isOverdue: false, daysOverdue: 0, componentKey: 'step-by-step-solver', props: {} }];
    vi.mocked(resolveDailyPracticeQueue).mockResolvedValue(queue);

    const result = await startDailySessionHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { studentId: 'student-1', asOfDate: new Date(now).toISOString() }
    );

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.session.sessionId).toBe('session-existing');
    expect(result.queue).toEqual(queue);
  });

  it('enforces daily session limit - cannot start second session on same day', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-first' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: now - 3600000, // 1 hour ago, same UTC day
      plannedCards: 3,
      completedCards: 1,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db, mockInsert } = makeMockCtx({ existingSession });
    const queue: ResolvedQueueItem[] = [
      { card: { cardId: 'c1' } as never, objectivePriority: 'essential', isOverdue: false, daysOverdue: 0, componentKey: 'step-by-step-solver', props: {} },
    ];
    vi.mocked(resolveDailyPracticeQueue).mockResolvedValue(queue);

    const result = await startDailySessionHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { studentId: 'student-1', asOfDate: new Date(now).toISOString() }
    );

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.session.sessionId).toBe('session-first');
    expect(result.session.plannedCards).toBe(3);
  });
});

describe('getActiveSessionHandler', () => {
  it('returns current day active session and queue', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-active' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: now - 3600000, // 1 hour ago, same UTC day
      plannedCards: 3,
      completedCards: 1,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db } = makeMockCtx({ existingSession });
    const queue: ResolvedQueueItem[] = [{ card: { cardId: 'c1' } as never, objectivePriority: 'essential', isOverdue: false, daysOverdue: 0, componentKey: 'step-by-step-solver', props: {} }];
    vi.mocked(resolveDailyPracticeQueue).mockResolvedValue(queue);

    const result = await getActiveSessionHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date(now).toISOString() }
    );

    expect(result).not.toBeNull();
    expect(result!.session.sessionId).toBe('session-active');
    expect(result!.queue).toEqual(queue);
  });

  it('returns null when no active session exists', async () => {
    const { db } = makeMockCtx({ existingSession: null });

    const result = await getActiveSessionHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result).toBeNull();
  });

  it('returns null when active session is from a different day', async () => {
    const now = Date.now();
    const yesterday = new Date(now - 86400000); // 24 hours ago
    const existingSession = {
      _id: 'session-yesterday' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: yesterday.getTime(),
      plannedCards: 3,
      completedCards: 0,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db } = makeMockCtx({ existingSession });

    const result = await getActiveSessionHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date(now).toISOString() }
    );

    expect(result).toBeNull();
  });
});

describe('completeDailySessionHandler', () => {
  it('marks session completed and updates completedCards count from review log', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-active' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: now - 3600000,
      plannedCards: 5,
      completedCards: 0,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const reviews = [
      { _id: 'r1' as Id<'srs_review_log'>, studentId: 'student-1' as Id<'profiles'>, cardId: 'c1' as Id<'srs_cards'>, reviewedAt: now - 1800000, rating: 'good' },
      { _id: 'r2' as Id<'srs_review_log'>, studentId: 'student-1' as Id<'profiles'>, cardId: 'c2' as Id<'srs_cards'>, reviewedAt: now - 900000, rating: 'easy' },
      { _id: 'r3' as Id<'srs_review_log'>, studentId: 'student-1' as Id<'profiles'>, cardId: 'c3' as Id<'srs_cards'>, reviewedAt: now - 7200000, rating: 'again' },
    ];
    const { db, mockPatch } = makeMockCtx({ existingSession, reviews });

    const result = await completeDailySessionHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { studentId: 'student-1', sessionId: 'session-active' }
    );

    expect(result).toBe('session-active');
    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(mockPatch).toHaveBeenCalledWith('session-active', expect.objectContaining({
      completedAt: expect.any(Number),
      completedCards: 2,
    }));
  });

  it('throws if session does not exist', async () => {
    const { db } = makeMockCtx({ existingSession: null });

    await expect(
      completeDailySessionHandler(
        { db } as unknown as import('@/convex/_generated/server').MutationCtx,
        { studentId: 'student-1', sessionId: 'session-missing' }
      )
    ).rejects.toThrow('No active session found for student student-1');
  });

  it('throws if session belongs to a different student', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-active' as Id<'srs_sessions'>,
      studentId: 'student-2' as Id<'profiles'>,
      startedAt: now - 3600000,
      plannedCards: 5,
      completedCards: 0,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db } = makeMockCtx({ existingSession });

    await expect(
      completeDailySessionHandler(
        { db } as unknown as import('@/convex/_generated/server').MutationCtx,
        { studentId: 'student-1', sessionId: 'session-active' }
      )
    ).rejects.toThrow('No active session found for student student-1');
  });

  it('throws if session is already completed', async () => {
    const now = Date.now();
    const existingSession = {
      _id: 'session-active' as Id<'srs_sessions'>,
      studentId: 'student-1' as Id<'profiles'>,
      startedAt: now - 3600000,
      completedAt: now - 1800000,
      plannedCards: 5,
      completedCards: 5,
      config: { newCardsPerDay: 5, maxReviewsPerDay: 20, prioritizeOverdue: true },
    };
    const { db } = makeMockCtx({ existingSession });

    await expect(
      completeDailySessionHandler(
        { db } as unknown as import('@/convex/_generated/server').MutationCtx,
        { studentId: 'student-1', sessionId: 'session-active' }
      )
    ).rejects.toThrow('No active session found for student student-1');
  });
});
