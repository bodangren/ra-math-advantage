import { describe, it, expect } from 'vitest';
import {
  getStatus,
  checkAndIncrement,
  isDuplicateInsertError,
  formatRetryAfter,
} from '../sliding-window';
import type { RateLimitConfig, RateLimitRecord } from '../sliding-window';

const config: RateLimitConfig = { windowMs: 60_000, maxRequests: 5 };
const now = 1_000_000;

describe('getStatus', () => {
  it('returns full quota when no record exists', () => {
    const result = getStatus(null, config, now);
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(5);
    expect(result.windowExpiresAt).toBe(now + 60_000);
  });

  it('returns full quota when window has expired', () => {
    const record: RateLimitRecord = { requestCount: 5, windowStart: now - 61_000 };
    const result = getStatus(record, config, now);
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(5);
  });

  it('returns remaining quota within window', () => {
    const record: RateLimitRecord = { requestCount: 2, windowStart: now };
    const result = getStatus(record, config, now);
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(3);
    expect(result.windowExpiresAt).toBe(now + 60_000);
  });

  it('returns isLimited=true at cap', () => {
    const record: RateLimitRecord = { requestCount: 5, windowStart: now };
    const result = getStatus(record, config, now);
    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

describe('checkAndIncrement', () => {
  it('returns insert action for new record', () => {
    const result = checkAndIncrement(null, config, now);
    expect(result.action).toBe('insert');
    expect(result.result.allowed).toBe(true);
    expect(result.result.remaining).toBe(4);
  });

  it('returns reset action for expired window', () => {
    const record: RateLimitRecord = { requestCount: 5, windowStart: now - 61_000 };
    const result = checkAndIncrement(record, config, now);
    expect(result.action).toBe('reset');
    expect(result.result.allowed).toBe(true);
    expect(result.result.remaining).toBe(4);
  });

  it('returns deny action when at limit', () => {
    const record: RateLimitRecord = { requestCount: 5, windowStart: now };
    const result = checkAndIncrement(record, config, now);
    expect(result.action).toBe('deny');
    expect(result.result.allowed).toBe(false);
    expect(result.result.remaining).toBe(0);
  });

  it('returns increment action within window', () => {
    const record: RateLimitRecord = { requestCount: 2, windowStart: now };
    const result = checkAndIncrement(record, config, now);
    expect(result.action).toBe('increment');
    expect(result.result.allowed).toBe(true);
    expect(result.result.remaining).toBe(2);
  });

  it('clamps remaining to 0 when count exceeds max', () => {
    const record: RateLimitRecord = { requestCount: 10, windowStart: now };
    const result = checkAndIncrement(record, config, now);
    expect(result.action).toBe('deny');
    expect(result.result.remaining).toBe(0);
  });
});

describe('isDuplicateInsertError', () => {
  it('detects duplicate key errors', () => {
    expect(isDuplicateInsertError(new Error('duplicate key value violates unique constraint'))).toBe(true);
  });

  it('detects unique constraint errors', () => {
    expect(isDuplicateInsertError(new Error('unique constraint violation'))).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isDuplicateInsertError(new Error('Database connection lost'))).toBe(false);
  });

  it('handles non-Error values', () => {
    expect(isDuplicateInsertError('duplicate entry')).toBe(true);
    expect(isDuplicateInsertError('something else')).toBe(false);
  });
});

describe('formatRetryAfter', () => {
  it('returns seconds until window expires', () => {
    const windowExpiresAt = Date.now() + 30_000;
    const result = formatRetryAfter(windowExpiresAt);
    expect(result).toBeGreaterThanOrEqual(29);
    expect(result).toBeLessThanOrEqual(31);
  });

  it('returns at least 1 second', () => {
    const windowExpiresAt = Date.now() - 1000;
    expect(formatRetryAfter(windowExpiresAt)).toBe(1);
  });
});
