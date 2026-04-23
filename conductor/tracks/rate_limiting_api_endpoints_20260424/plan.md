# Plan: Rate Limiting API Endpoints

## Phase 1: Rate Limiter Core

- [ ] Task: Build reusable rate limiter
    - [ ] Write tests for token bucket rate limiter (allow/deny/retry-after)
    - [ ] Implement rate limiter using Convex rate limit table or action-based tracking
    - [ ] Create middleware wrapper for route handlers

## Phase 2: Endpoint Integration

- [ ] Task: Apply rate limiting to 5 endpoints
    - [ ] Write integration tests for phases/complete rate limiting
    - [ ] Apply rate limiter to phases/complete endpoint
    - [ ] Apply rate limiter to assessment endpoint
    - [ ] Apply rate limiter to activities endpoint
    - [ ] Apply rate limiter to error-summary endpoint
    - [ ] Apply rate limiter to ai-error-summary endpoint

## Phase 3: Configuration and Monitoring

- [ ] Task: Add configuration and logging
    - [ ] Define rate limit constants (requests/minute per endpoint)
    - [ ] Add structured logging for rate limit violations
    - [ ] Write tests for configurable limits

## Phase 4: Verification

- [ ] Task: Full suite validation
    - [ ] Run `npm run lint` — zero errors
    - [ ] Run `npx tsc --noEmit` — zero errors
    - [ ] Run `npm run test` — all tests pass
    - [ ] Run `npm run build` — clean build
