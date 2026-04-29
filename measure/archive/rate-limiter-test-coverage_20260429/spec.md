# Spec: Rate Limiter Test Coverage

## Problem

No test coverage exists for the chatbot rate limiters in either IM3 (`apps/integrated-math-3/convex/rateLimits.ts`) or BM2 (`apps/bus-math-v2/convex/rateLimits.ts`). These are critical security controls that enforce per-user request limits for the AI chatbot.

## Solution

Write comprehensive unit tests for all three exported functions in IM3's rateLimits.ts:
1. `getRateLimitStatus` — query handler
2. `checkAndIncrementRateLimit` — mutation with race condition handling
3. `cleanupStaleRateLimits` — admin-only cleanup mutation

BM2's rateLimits.ts is nearly identical; tests can be adapted after IM3 tests are verified.

## Acceptance Criteria

1. Tests for `getRateLimitStatus`: no record, expired window, within window (limited and not limited)
2. Tests for `checkAndIncrementRateLimit`: first request, subsequent requests, at limit, window reset, concurrent insert race condition
3. Tests for `cleanupStaleRateLimits`: non-admin rejected, stale entries deleted, fresh entries preserved
4. All tests pass, >80% coverage on rateLimits.ts
