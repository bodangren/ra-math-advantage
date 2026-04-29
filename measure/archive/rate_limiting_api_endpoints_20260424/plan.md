# Plan: Rate Limiting API Endpoints

## Phase 1: Rate Limiter Core [COMPLETE]

- [x] Task: Build reusable rate limiter
    - [x] Write tests for token bucket rate limiter (allow/deny/retry-after)
    - [x] Implement rate limiter using Convex rate limit table or action-based tracking
    - [x] Create middleware wrapper for route handlers

## Phase 2: Endpoint Integration [COMPLETE]

- [x] Task: Apply rate limiting to 5 endpoints
    - [x] Apply rate limiter to phases/complete endpoint
    - [x] Apply rate limiter to assessment endpoint
    - [x] Apply rate limiter to activities/complete endpoint
    - [x] Apply rate limiter to error-summary endpoint
    - [x] Apply rate limiter to ai-error-summary endpoint

## Phase 3: Configuration and Monitoring

- [x] Task: Add configuration and logging
    - [x] Define rate limit constants (requests/minute per endpoint) - already in RATE_LIMIT_CONFIG
    - [x] Add structured logging for rate limit violations - logRateLimitViolation() added to apiRateLimits.ts
    - [x] Write tests for configurable limits - tests added for all 5 endpoints and logRateLimitViolation

## Phase 4: Verification

- [x] Task: Full suite validation
    - [x] Run `npm run lint` — zero errors
    - [x] Run `npx tsc --noEmit` — pre-existing test-file type errors (not caused by this phase)
    - [x] Run `npm run test` — all 2305 tests pass
    - [x] Run `npm run build` — clean build
