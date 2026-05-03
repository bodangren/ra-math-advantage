# Plan: Extract Shared Rate Limiter Package

## Phase 1: Package Scaffold and Core Logic [x] [checkpoint: 97e601c]

- [x] Write test: `checkRateLimit` returns allowed=true when under limit
- [x] Write test: `checkRateLimit` returns allowed=false when over limit
- [x] Write test: `getRateLimitStatus` returns current count and reset time
- [x] Write test: `cleanupStaleEntries` removes entries older than maxAge
- [x] Create `packages/rate-limiter/` with package.json, tsconfig.json
- [x] Extract core sliding-window logic from IM3 `lib/rate-limits.ts`
- [x] Define `RateLimitAdapter` interface for Convex table operations
- [x] Implement `checkRateLimit`, `getRateLimitStatus`, `cleanupStaleEntries`

## Phase 2: Convex Adapter and Integration [x] [checkpoint: dcc6056]

- [x] Write test: IM3 adapter correctly delegates to Convex mutations
- [x] Write test: BM2 adapter correctly delegates to Convex mutations
- [x] Create IM3 Convex adapter in `apps/integrated-math-3/lib/rate-limits/adapter.ts`
- [x] Create BM2 Convex adapter in `apps/bus-math-v2/lib/rate-limits/adapter.ts`
- [x] Wire adapters to existing Convex `apiRateLimits` table
- [x] Verify adapter interface handles concurrent inserts correctly (try/catch upsert)

## Phase 3: App Migration [x]

- [x] Write test: IM3 rate limiter endpoints still function after migration
- [x] Write test: BM2 rate limiter endpoints still function after migration
- [x] Update IM3 `lib/rate-limits.ts` to re-export from `@math-platform/rate-limiter`
- [x] Update BM2 `lib/rate-limits.ts` to re-export from `@math-platform/rate-limiter`
- [x] Remove duplicated logic from both apps
- [x] Run `npx tsc --noEmit` in both apps — no type errors

## Phase 4: BM2 Test Coverage [x] [checkpoint: e72c95a]

- [x] Write tests for BM2 `rateLimits.ts` — `checkAndIncrementRateLimit`, `getRateLimitStatus`, `cleanupStaleRateLimits`
- [x] Port IM3 rate limiter test patterns to BM2
- [x] Verify BM2 rate limiter handlers pass with shared package
- [x] Target: 20+ total tests across package and app-level adapters (15 package + BM2 tests)

## Phase 5: Verification and Handoff [x]

- [x] Run full IM3 test suite — all tests pass
- [x] Run full BM2 test suite — all tests pass
- [x] Run `npm run lint` in both apps — no errors
- [x] Verify no behavioral changes in rate limiting endpoints
- [x] Update tech-debt.md — mark rate limiter duplication as Resolved
- [x] Document package API in README.md
- [x] Handoff
