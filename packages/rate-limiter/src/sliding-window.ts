export interface RateLimitRecord {
  requestCount: number;
  windowStart: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitStatus {
  remaining: number;
  windowExpiresAt: number;
  isLimited: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  windowExpiresAt: number;
}

/**
 * Get the current rate limit status from a record and config.
 * @param record - Existing rate limit record or null
 * @param config - Rate limit configuration
 * @param now - Current timestamp in milliseconds
 * @returns Rate limit status with remaining count and expiry
 */
export function getStatus(
  record: RateLimitRecord | null | undefined,
  config: RateLimitConfig,
  now: number = Date.now()
): RateLimitStatus {
  if (!record) {
    return {
      remaining: config.maxRequests,
      windowExpiresAt: now + config.windowMs,
      isLimited: false,
    };
  }

  if (now - record.windowStart >= config.windowMs) {
    return {
      remaining: config.maxRequests,
      windowExpiresAt: now + config.windowMs,
      isLimited: false,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - record.requestCount),
    windowExpiresAt: record.windowStart + config.windowMs,
    isLimited: record.requestCount >= config.maxRequests,
  };
}

export interface CheckResult {
  action: 'insert' | 'reset' | 'deny' | 'increment';
  result: RateLimitResult;
}

/**
 * Check rate limit and determine the required database action.
 * @param record - Existing rate limit record or null
 * @param config - Rate limit configuration
 * @param now - Current timestamp in milliseconds
 * @returns Check result with action type and rate limit outcome
 */
export function checkAndIncrement(
  record: RateLimitRecord | null | undefined,
  config: RateLimitConfig,
  now: number = Date.now()
): CheckResult {
  if (!record) {
    return {
      action: 'insert',
      result: {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - 1),
        windowExpiresAt: now + config.windowMs,
      },
    };
  }

  if (now - record.windowStart >= config.windowMs) {
    return {
      action: 'reset',
      result: {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - 1),
        windowExpiresAt: now + config.windowMs,
      },
    };
  }

  if (record.requestCount >= config.maxRequests) {
    return {
      action: 'deny',
      result: {
        allowed: false,
        remaining: 0,
        windowExpiresAt: record.windowStart + config.windowMs,
      },
    };
  }

  return {
    action: 'increment',
    result: {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - record.requestCount - 1),
      windowExpiresAt: record.windowStart + config.windowMs,
    },
  };
}

/**
 * Check if an error is a duplicate insert error from a unique constraint.
 * @param e - The error to check
 * @returns True if the error indicates a duplicate key violation
 */
export function isDuplicateInsertError(e: unknown): boolean {
  const message = e instanceof Error ? e.message : String(e);
  return message.includes('duplicate') || message.includes('unique');
}

/**
 * Format a Retry-After header value in seconds from a window expiry timestamp.
 * @param windowExpiresAt - Timestamp when the rate limit window expires
 * @returns Seconds until the window expires (minimum 1)
 */
export function formatRetryAfter(windowExpiresAt: number): number {
  return Math.max(1, Math.ceil((windowExpiresAt - Date.now()) / 1000));
}
