import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Id } from '../../convex/_generated/dataModel';
import {
  getRateLimitStatus,
  checkAndIncrementRateLimit,
  cleanupStaleRateLimits,
} from '../../convex/rateLimits';

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;
const STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const mockQuery = vi.fn();
const mockWithIndex = vi.fn();
const mockUnique = vi.fn();
const mockCollect = vi.fn();
const mockFilter = vi.fn();
const mockTake = vi.fn();
const mockInsert = vi.fn().mockResolvedValue('new_id');
const mockPatch = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);
const mockGet = vi.fn();

function createMockCtx() {
  mockUnique.mockResolvedValue(null);
  mockCollect.mockResolvedValue([]);
  mockTake.mockResolvedValue([]);
  mockWithIndex.mockReturnValue({ unique: mockUnique, collect: mockCollect });
  mockFilter.mockReturnValue({ take: mockTake });

  mockQuery.mockReturnValue({
    withIndex: mockWithIndex,
    filter: mockFilter,
    collect: mockCollect,
  });

  return {
    auth: { getUserIdentity: vi.fn() },
    db: {
      query: mockQuery,
      insert: mockInsert,
      patch: mockPatch,
      delete: mockDelete,
      get: mockGet,
    },
  };
}

describe('rateLimits handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue('new_id');
    mockPatch.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
  });

  describe('getRateLimitStatus', () => {
    it('returns full remaining when no rate limit record exists', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const result = await getRateLimitStatus(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW);
      expect(result.isLimited).toBe(false);
      expect(result.windowExpiresAt).toBeGreaterThan(Date.now() - 1000);
    });

    it('returns full remaining when window has expired', async () => {
      const ctx = createMockCtx();
      const expiredWindowStart = Date.now() - RATE_LIMIT_WINDOW_MS - 1000;
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: 5,
        windowStart: expiredWindowStart,
      });

      const result = await getRateLimitStatus(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW);
      expect(result.isLimited).toBe(false);
    });

    it('returns correct remaining within active window', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: 3,
        windowStart: Date.now(),
      });

      const result = await getRateLimitStatus(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.remaining).toBe(2);
      expect(result.isLimited).toBe(false);
    });

    it('returns isLimited true when at max requests', async () => {
      const ctx = createMockCtx();
      const windowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: MAX_REQUESTS_PER_WINDOW,
        windowStart,
      });

      const result = await getRateLimitStatus(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.remaining).toBe(0);
      expect(result.isLimited).toBe(true);
      expect(result.windowExpiresAt).toBe(windowStart + RATE_LIMIT_WINDOW_MS);
    });

    it('returns remaining 0 when requestCount exceeds max', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: MAX_REQUESTS_PER_WINDOW + 2,
        windowStart: Date.now(),
      });

      const result = await getRateLimitStatus(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.remaining).toBe(0);
      expect(result.isLimited).toBe(true);
    });
  });

  describe('checkAndIncrementRateLimit', () => {
    it('creates new record with count=1 for first request', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 1);
      expect(result.windowExpiresAt).toBeGreaterThan(Date.now() - 1000);
      expect(mockInsert).toHaveBeenCalledWith('chatbot_rate_limits', {
        userId: 'user-1',
        requestCount: 1,
        windowStart: expect.any(Number),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it('increments count within active window', async () => {
      const ctx = createMockCtx();
      const windowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: 2,
        windowStart,
      });

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 3);
      expect(mockPatch).toHaveBeenCalledWith('entry-1', {
        requestCount: 3,
        updatedAt: expect.any(Number),
      });
    });

    it('denies request when at max requests', async () => {
      const ctx = createMockCtx();
      const windowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: MAX_REQUESTS_PER_WINDOW,
        windowStart,
      });

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.windowExpiresAt).toBe(windowStart + RATE_LIMIT_WINDOW_MS);
    });

    it('resets window when expired', async () => {
      const ctx = createMockCtx();
      const expiredWindowStart = Date.now() - RATE_LIMIT_WINDOW_MS - 1000;
      mockUnique.mockResolvedValue({
        _id: 'entry-1',
        userId: 'user-1',
        requestCount: MAX_REQUESTS_PER_WINDOW,
        windowStart: expiredWindowStart,
      });

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 1);
      expect(mockPatch).toHaveBeenCalledWith('entry-1', {
        requestCount: 1,
        windowStart: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it('handles concurrent insert conflict by re-reading and incrementing', async () => {
      const ctx = createMockCtx();
      const windowStart = Date.now();

      mockUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: 'entry-1',
          userId: 'user-1',
          requestCount: 1,
          windowStart,
        });

      mockInsert.mockRejectedValueOnce(
        new Error('duplicate key value violates unique constraint')
      );

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 2);
      expect(mockPatch).toHaveBeenCalledWith('entry-1', {
        requestCount: 2,
        updatedAt: expect.any(Number),
      });
    });

    it('handles concurrent insert where re-read finds record at limit', async () => {
      const ctx = createMockCtx();
      const windowStart = Date.now();

      mockUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: 'entry-1',
          userId: 'user-1',
          requestCount: MAX_REQUESTS_PER_WINDOW,
          windowStart,
        });

      mockInsert.mockRejectedValueOnce(
        new Error('duplicate key value violates unique constraint')
      );

      const result = await checkAndIncrementRateLimit(ctx as never, {
        userId: 'user-1' as unknown as Id<'profiles'>,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('throws if concurrent insert fails and record disappears', async () => {
      const ctx = createMockCtx();

      mockUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockInsert.mockRejectedValueOnce(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(
        checkAndIncrementRateLimit(ctx as never, {
          userId: 'user-1' as unknown as Id<'profiles'>,
        })
      ).rejects.toThrow('Rate limit record disappeared after concurrent insert');
    });

    it('re-throws non-duplicate insert errors', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);
      mockInsert.mockRejectedValueOnce(new Error('database connection lost'));

      await expect(
        checkAndIncrementRateLimit(ctx as never, {
          userId: 'user-1' as unknown as Id<'profiles'>,
        })
      ).rejects.toThrow('database connection lost');
    });
  });

  describe('cleanupStaleRateLimits', () => {
    it('throws Unauthorized for non-admin users', async () => {
      const ctx = createMockCtx();
      mockGet.mockResolvedValue({
        _id: 'user-1',
        role: 'student',
      });

      await expect(
        cleanupStaleRateLimits(ctx as never, {
          userId: 'user-1' as unknown as Id<'profiles'>,
        })
      ).rejects.toThrow('Unauthorized: admin only');
    });

    it('throws Unauthorized when profile not found', async () => {
      const ctx = createMockCtx();
      mockGet.mockResolvedValue(null);

      await expect(
        cleanupStaleRateLimits(ctx as never, {
          userId: 'user-1' as unknown as Id<'profiles'>,
        })
      ).rejects.toThrow('Unauthorized: admin only');
    });

    it('deletes stale entries for admin users', async () => {
      const ctx = createMockCtx();
      mockGet.mockResolvedValue({
        _id: 'admin-1',
        role: 'admin',
      });

      const now = Date.now();
      const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

      mockTake.mockResolvedValue([
        { _id: 'stale-1', windowStart: staleThreshold - 1000 },
        { _id: 'stale-2', windowStart: staleThreshold - 2000 },
      ]);

      const result = await cleanupStaleRateLimits(ctx as never, {
        userId: 'admin-1' as unknown as Id<'profiles'>,
      });

      expect(result.deletedCount).toBe(2);
      expect(mockDelete).toHaveBeenCalledWith('stale-1');
      expect(mockDelete).toHaveBeenCalledWith('stale-2');
    });

    it('returns zero when no stale entries exist', async () => {
      const ctx = createMockCtx();
      mockGet.mockResolvedValue({
        _id: 'admin-1',
        role: 'admin',
      });

      mockTake.mockResolvedValue([]);

      const result = await cleanupStaleRateLimits(ctx as never, {
        userId: 'admin-1' as unknown as Id<'profiles'>,
      });

      expect(result.deletedCount).toBe(0);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('skips entries that pass filter but are not actually stale', async () => {
      const ctx = createMockCtx();
      mockGet.mockResolvedValue({
        _id: 'admin-1',
        role: 'admin',
      });

      const now = Date.now();
      const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

      mockTake.mockResolvedValue([
        { _id: 'stale-1', windowStart: staleThreshold - 1000 },
        { _id: 'recent-1', windowStart: now - 1000 },
      ]);

      const result = await cleanupStaleRateLimits(ctx as never, {
        userId: 'admin-1' as unknown as Id<'profiles'>,
      });

      expect(result.deletedCount).toBe(1);
      expect(mockDelete).toHaveBeenCalledWith('stale-1');
      expect(mockDelete).not.toHaveBeenCalledWith('recent-1');
    });
  });
});
