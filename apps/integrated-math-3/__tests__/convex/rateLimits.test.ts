import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRateLimitStatus,
  checkAndIncrementRateLimit,
  cleanupStaleRateLimits,
} from '@/convex/rateLimits';
import type { Id } from '@/convex/_generated/dataModel';

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;
const STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function makeMockCtx(overrides: {
  rateLimitRecord?: {
    _id: Id<'chatbot_rate_limits'>;
    userId: Id<'profiles'>;
    requestCount: number;
    windowStart: number;
    createdAt: number;
    updatedAt: number;
  } | null;
  profile?: {
    _id: Id<'profiles'>;
    role: string;
  } | null;
  insertId?: Id<'chatbot_rate_limits'>;
} = {}) {
  const { rateLimitRecord, profile, insertId } = overrides;

  const mockInsert = vi.fn().mockResolvedValue(insertId ?? ('rl-123' as Id<'chatbot_rate_limits'>));
  const mockPatch = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn().mockResolvedValue(profile ?? null);

  const mockUnique = vi.fn().mockResolvedValue(rateLimitRecord ?? null);
  const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
  const mockFilter = vi.fn().mockReturnValue({
    take: vi.fn().mockResolvedValue([]),
  });

  return {
    db: {
      query: vi.fn().mockImplementation((table: string) => {
        if (table === 'chatbot_rate_limits') {
          if (rateLimitRecord !== undefined) {
            mockUnique.mockResolvedValue(rateLimitRecord);
          }
          return { withIndex: mockWithIndex, filter: mockFilter };
        }
        return { withIndex: mockWithIndex };
      }),
      get: mockGet,
      insert: mockInsert,
      patch: mockPatch,
      delete: mockDelete,
    },
    mockInsert,
    mockPatch,
    mockDelete,
    mockGet,
    mockUnique,
    mockWithIndex,
    mockFilter,
  };
}

describe('(getRateLimitStatus as any)', () => {
  it('should return full quota when no record exists', async () => {
    const { db } = makeMockCtx({ rateLimitRecord: null });

    const result = await (getRateLimitStatus as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW);
    expect(result.windowExpiresAt).toBeGreaterThan(Date.now());
  });

  it('should return full quota when window has expired', async () => {
    const now = Date.now();
    const expiredStart = now - RATE_LIMIT_WINDOW_MS - 1000;
    const { db } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: 5,
        windowStart: expiredStart,
        createdAt: expiredStart,
        updatedAt: expiredStart,
      },
    });

    const result = await (getRateLimitStatus as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW);
  });

  it('should return remaining quota when within window and not limited', async () => {
    const now = Date.now();
    const { db } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: 2,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    const result = await (getRateLimitStatus as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 2);
    expect(result.windowExpiresAt).toBe(now + RATE_LIMIT_WINDOW_MS);
  });

  it('should return isLimited=true when at request cap', async () => {
    const now = Date.now();
    const { db } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: MAX_REQUESTS_PER_WINDOW,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    const result = await (getRateLimitStatus as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

describe('(checkAndIncrementRateLimit as any)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow first request and insert new record', async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const { db, mockInsert } = makeMockCtx({ rateLimitRecord: null });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('chatbot_rate_limits', {
      userId: 'user-1',
      requestCount: 1,
      windowStart: now,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('should allow subsequent requests within window', async () => {
    const now = Date.now();
    const { db, mockPatch } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: 2,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 3);
    expect(mockPatch).toHaveBeenCalledWith('rl-1', {
      requestCount: 3,
      updatedAt: expect.any(Number),
    });
  });

  it('should deny request when at rate limit', async () => {
    const now = Date.now();
    const { db, mockPatch, mockInsert } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: MAX_REQUESTS_PER_WINDOW,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(mockPatch).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should reset window when expired', async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const expiredStart = now - RATE_LIMIT_WINDOW_MS - 1000;
    const { db, mockPatch } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: 5,
        windowStart: expiredStart,
        createdAt: expiredStart,
        updatedAt: expiredStart,
      },
    });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 1);
    expect(mockPatch).toHaveBeenCalledWith('rl-1', {
      requestCount: 1,
      windowStart: now,
      updatedAt: now,
    });
  });

  it('should handle concurrent insert race condition', async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const { db, mockInsert, mockPatch, mockUnique } = makeMockCtx({ rateLimitRecord: null });

    mockInsert.mockRejectedValueOnce(new Error('duplicate key value violates unique constraint'));
    mockUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      _id: 'rl-existing' as Id<'chatbot_rate_limits'>,
      userId: 'user-1' as Id<'profiles'>,
      requestCount: 1,
      windowStart: now,
      createdAt: now,
      updatedAt: now,
    });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 2);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockPatch).toHaveBeenCalledWith('rl-existing', {
      requestCount: 2,
      updatedAt: expect.any(Number),
    });
  });

  it('should throw on non-duplicate insert errors', async () => {
    const { db, mockInsert } = makeMockCtx({ rateLimitRecord: null });
    mockInsert.mockRejectedValueOnce(new Error('Database connection lost'));

    await expect(
      (checkAndIncrementRateLimit as any)({ db } as never, {
        userId: 'user-1' as Id<'profiles'>,
      }),
    ).rejects.toThrow('Database connection lost');
  });

  it('should clamp remaining to 0 when count exceeds max', async () => {
    const now = Date.now();
    const { db } = makeMockCtx({
      rateLimitRecord: {
        _id: 'rl-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        requestCount: MAX_REQUESTS_PER_WINDOW + 10,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    const result = await (checkAndIncrementRateLimit as any)({ db } as never, {
      userId: 'user-1' as Id<'profiles'>,
    });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe('cleanupStaleRateLimits', () => {
  it('should reject non-admin users', async () => {
    const { db } = makeMockCtx({
      profile: { _id: 'user-1' as Id<'profiles'>, role: 'student' },
    });

    await expect(
      (cleanupStaleRateLimits as any)({ db } as never, {
        adminProfileId: 'user-1' as Id<'profiles'>,
      }),
    ).rejects.toThrow('Unauthorized: admin only');
  });

  it('should reject when profile does not exist', async () => {
    const { db } = makeMockCtx({ profile: null });

    await expect(
      (cleanupStaleRateLimits as any)({ db } as never, {
        adminProfileId: 'user-1' as Id<'profiles'>,
      }),
    ).rejects.toThrow('Unauthorized: admin only');
  });

  it('should delete stale entries and return count', async () => {
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const staleEntries = [
      {
        _id: 'rl-stale-1' as Id<'chatbot_rate_limits'>,
        userId: 'user-1' as Id<'profiles'>,
        windowStart: now - STALE_ENTRY_THRESHOLD_MS - 1000,
        requestCount: 1,
        createdAt: now - STALE_ENTRY_THRESHOLD_MS - 1000,
        updatedAt: now - STALE_ENTRY_THRESHOLD_MS - 1000,
      },
      {
        _id: 'rl-stale-2' as Id<'chatbot_rate_limits'>,
        userId: 'user-2' as Id<'profiles'>,
        windowStart: now - STALE_ENTRY_THRESHOLD_MS - 2000,
        requestCount: 3,
        createdAt: now - STALE_ENTRY_THRESHOLD_MS - 2000,
        updatedAt: now - STALE_ENTRY_THRESHOLD_MS - 2000,
      },
    ];

    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockFilter = vi.fn().mockReturnValue({
      take: vi.fn().mockResolvedValue(staleEntries),
    });
    const mockQuery = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockGet = vi.fn().mockResolvedValue({
      _id: 'admin-1' as Id<'profiles'>,
      role: 'admin',
    });

    const result = await (cleanupStaleRateLimits as any)(
      { db: { query: mockQuery, get: mockGet, delete: mockDelete } } as never,
      { adminProfileId: 'admin-1' as Id<'profiles'> },
    );

    expect(result.deletedCount).toBe(2);
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('rl-stale-1');
    expect(mockDelete).toHaveBeenCalledWith('rl-stale-2');

    vi.useRealTimers();
  });

  it('should not delete fresh entries', async () => {
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockFilter = vi.fn().mockReturnValue({
      take: vi.fn().mockResolvedValue([]),
    });
    const mockQuery = vi.fn().mockReturnValue({ filter: mockFilter });
    const mockGet = vi.fn().mockResolvedValue({
      _id: 'admin-1' as Id<'profiles'>,
      role: 'admin',
    });

    const result = await (cleanupStaleRateLimits as any)(
      { db: { query: mockQuery, get: mockGet, delete: mockDelete } } as never,
      { adminProfileId: 'admin-1' as Id<'profiles'> },
    );

    expect(result.deletedCount).toBe(0);
    expect(mockDelete).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
