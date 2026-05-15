# Spec: Extract Shared Rate Limiter Package

## Problem

Rate limiting logic is duplicated across IM3 and BM2 with diverging implementations. The same `checkAndIncrementRateLimit`, `getRateLimitStatus`, and `cleanupStaleRateLimits` functions exist in both apps with subtle behavioral differences. This duplication means bug fixes and improvements must be applied twice, and inconsistencies can cause silent failures.

## Goal

Extract rate limiting into a shared `@math-platform/rate-limiter` package with a single canonical implementation, Convex adapter interface, and comprehensive test coverage.

## Requirements

1. **Shared Package**: Create `packages/rate-limiter/` with the core rate limiting logic (sliding window, cleanup, status queries).
2. **Convex Adapter**: Define an adapter interface so both IM3 and BM2 can provide their own Convex table bindings.
3. **Unified API**: `checkRateLimit(userId, endpoint, limit, windowMs)`, `getRateLimitStatus(userId, endpoint)`, `cleanupStaleEntries(maxAgeMs)`.
4. **Test Coverage**: Port existing IM3 rate limiter tests (15 tests) and add coverage for the adapter interface.
5. **Migration**: Update both IM3 and BM2 to import from the shared package.

## Non-Goals

- Redis-based distributed rate limiting (Convex-only for now)
- Per-IP rate limiting (user-based only)
- Rate limiting UI/dashboard

## Success Criteria

- Single `@math-platform/rate-limiter` package with 20+ tests
- IM3 and BM2 both consume the shared package
- No behavioral changes in existing rate limiting
- BM2 `rateLimits.ts` test coverage added (currently untested)
