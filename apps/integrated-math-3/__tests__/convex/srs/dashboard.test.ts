import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  getDayStart,
  calculateStreak,
  getPracticeStatsHandler,
} from '@/convex/srs/dashboard';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('getDayStart', () => {
  it('returns midnight UTC for a given timestamp', () => {
    const timestamp = Date.UTC(2026, 3, 25, 14, 30, 0);
    const result = getDayStart(timestamp);
    expect(result).toBe(Date.UTC(2026, 3, 25, 0, 0, 0, 0));
  });

  it('returns same value for any time within the same UTC day', () => {
    const morning = Date.UTC(2026, 3, 25, 0, 0, 0);
    const evening = Date.UTC(2026, 3, 25, 23, 59, 59);
    expect(getDayStart(morning)).toBe(getDayStart(evening));
  });

  it('returns different values for different UTC days', () => {
    const day1 = Date.UTC(2026, 3, 25, 12, 0, 0);
    const day2 = Date.UTC(2026, 3, 26, 0, 0, 0);
    expect(getDayStart(day1)).not.toBe(getDayStart(day2));
    expect(getDayStart(day2) - getDayStart(day1)).toBe(MS_PER_DAY);
  });

  it('handles midnight UTC exactly', () => {
    const midnight = Date.UTC(2026, 0, 1, 0, 0, 0);
    expect(getDayStart(midnight)).toBe(midnight);
  });

  it('handles timestamps near day boundary', () => {
    const justBeforeMidnight = Date.UTC(2026, 3, 25, 23, 59, 59, 999);
    const result = getDayStart(justBeforeMidnight);
    expect(result).toBe(Date.UTC(2026, 3, 25, 0, 0, 0, 0));
  });
});

describe('calculateStreak', () => {
  it('returns 0 when no completed sessions', () => {
    expect(calculateStreak([], Date.now())).toBe(0);
  });

  it('returns 1 when practiced today only', () => {
    const today = Date.UTC(2026, 3, 25, 0, 0, 0);
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    expect(calculateStreak([today + 3600000], now)).toBe(1);
  });

  it('returns 1 when practiced yesterday only', () => {
    const yesterday = Date.UTC(2026, 3, 24, 12, 0, 0);
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    expect(calculateStreak([yesterday], now)).toBe(1);
  });

  it('returns 0 when most recent practice was 2+ days ago', () => {
    const twoDaysAgo = Date.UTC(2026, 3, 23, 12, 0, 0);
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    expect(calculateStreak([twoDaysAgo], now)).toBe(0);
  });

  it('counts consecutive days backward from most recent', () => {
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    const today = Date.UTC(2026, 3, 25, 10, 0, 0);
    const yesterday = Date.UTC(2026, 3, 24, 10, 0, 0);
    const twoDaysAgo = Date.UTC(2026, 3, 23, 10, 0, 0);
    expect(calculateStreak([today, yesterday, twoDaysAgo], now)).toBe(3);
  });

  it('stops counting at a gap in consecutive days', () => {
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    const today = Date.UTC(2026, 3, 25, 10, 0, 0);
    const yesterday = Date.UTC(2026, 3, 24, 10, 0, 0);
    const threeDaysAgo = Date.UTC(2026, 3, 22, 10, 0, 0);
    expect(calculateStreak([today, yesterday, threeDaysAgo], now)).toBe(2);
  });

  it('deduplicates multiple sessions on the same day', () => {
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    const today1 = Date.UTC(2026, 3, 25, 9, 0, 0);
    const today2 = Date.UTC(2026, 3, 25, 13, 0, 0);
    const yesterday = Date.UTC(2026, 3, 24, 10, 0, 0);
    expect(calculateStreak([today1, today2, yesterday], now)).toBe(2);
  });

  it('works when starting from yesterday instead of today', () => {
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    const yesterday = Date.UTC(2026, 3, 24, 10, 0, 0);
    const twoDaysAgo = Date.UTC(2026, 3, 23, 10, 0, 0);
    const threeDaysAgo = Date.UTC(2026, 3, 22, 10, 0, 0);
    expect(calculateStreak([yesterday, twoDaysAgo, threeDaysAgo], now)).toBe(3);
  });

  it('handles long streak correctly', () => {
    const now = Date.UTC(2026, 3, 25, 14, 0, 0);
    const timestamps: number[] = [];
    for (let i = 0; i < 30; i++) {
      timestamps.push(Date.UTC(2026, 3, 25 - i, 10, 0, 0));
    }
    expect(calculateStreak(timestamps, now)).toBe(30);
  });
});

function makeDashboardMockCtx(overrides: {
  sessions?: Array<{
    _id: Id<'srs_sessions'>;
    studentId: Id<'profiles'>;
    startedAt: number;
    completedAt?: number;
    plannedCards: number;
    completedCards: number;
    config: unknown;
  }>;
  queueItems?: Array<{ _id: string }>;
} = {}) {
  const { sessions = [] } = overrides;

  const sessionQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        if (fn) {
          const mockQ: { eq: () => typeof mockQ } = {
            eq: vi.fn().mockReturnThis(),
          };
          fn(mockQ);
        }
        return {
          collect: vi.fn().mockResolvedValue(sessions),
          order: vi.fn().mockReturnThis(),
        };
      }
    ),
  };

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'srs_sessions') return sessionQueryMock;
    return {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue([]),
        order: vi.fn().mockReturnThis(),
      }),
    };
  });

  return {
    db: {
      query: mockQuery,
    },
  };
}

vi.mock('@/convex/queue/queue', () => ({
  resolveDailyPracticeQueue: vi.fn().mockResolvedValue([]),
}));

describe('getPracticeStatsHandler', () => {
  it('returns streak 0 and dueCount 0 when no sessions and no queue', async () => {
    const { db } = makeDashboardMockCtx();
    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.streak).toBe(0);
    expect(result.dueCount).toBe(0);
    expect(result.lastPracticedAt).toBeNull();
  });

  it('returns streak 1 when practiced today', async () => {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const { db } = makeDashboardMockCtx({
      sessions: [
        {
          _id: 'session-1' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: todayMs,
          completedAt: todayMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
      ],
    });

    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.streak).toBe(1);
    expect(result.lastPracticedAt).not.toBeNull();
  });

  it('returns streak 3 for three consecutive days', async () => {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - MS_PER_DAY;
    const twoDaysAgoMs = todayMs - 2 * MS_PER_DAY;

    const { db } = makeDashboardMockCtx({
      sessions: [
        {
          _id: 'session-1' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: twoDaysAgoMs,
          completedAt: twoDaysAgoMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
        {
          _id: 'session-2' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: yesterdayMs,
          completedAt: yesterdayMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
        {
          _id: 'session-3' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: todayMs,
          completedAt: todayMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
      ],
    });

    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.streak).toBe(3);
  });

  it('ignores sessions without completedAt', async () => {
    const { db } = makeDashboardMockCtx({
      sessions: [
        {
          _id: 'session-1' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: Date.now(),
          plannedCards: 5,
          completedCards: 0,
          config: {},
        },
      ],
    });

    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.streak).toBe(0);
    expect(result.lastPracticedAt).toBeNull();
  });

  it('uses asOfDate for streak calculation instead of Date.now()', async () => {
    const referenceDate = '2026-04-25T14:00:00.000Z';
    const todayMs = Date.UTC(2026, 3, 25, 0, 0, 0);
    const yesterdayMs = todayMs - MS_PER_DAY;
    const twoDaysAgoMs = todayMs - 2 * MS_PER_DAY;

    const { db } = makeDashboardMockCtx({
      sessions: [
        {
          _id: 'session-1' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: twoDaysAgoMs,
          completedAt: twoDaysAgoMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
        {
          _id: 'session-2' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: yesterdayMs,
          completedAt: yesterdayMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
        {
          _id: 'session-3' as Id<'srs_sessions'>,
          studentId: 'student-1' as Id<'profiles'>,
          startedAt: todayMs,
          completedAt: todayMs + 30 * 60 * 1000,
          plannedCards: 5,
          completedCards: 5,
          config: {},
        },
      ],
    });

    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: referenceDate }
    );

    expect(result.streak).toBe(3);
  });

  it('returns dueCount from queue length', async () => {
    const { db } = makeDashboardMockCtx();

    const { resolveDailyPracticeQueue } = await import('@/convex/queue/queue');
    (resolveDailyPracticeQueue as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { _id: 'item-1' },
      { _id: 'item-2' },
      { _id: 'item-3' },
    ]);

    const result = await getPracticeStatsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.dueCount).toBe(3);
  });
});
