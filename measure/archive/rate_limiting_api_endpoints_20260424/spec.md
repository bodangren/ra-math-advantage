# Spec: Rate Limiting API Endpoints

## Overview

Five BM2 API endpoints currently have no rate limiting, making them vulnerable to abuse and resource exhaustion: `phases/complete`, `assessment`, `activities`, `error-summary`, and `ai-error-summary`. This track adds per-user rate limiting with configurable windows and limits.

## Functional Requirements

1. Implement a reusable rate limiter middleware using Convex rate limit primitives or an in-memory token bucket
2. Apply rate limiting to all 5 unprotected endpoints
3. Return proper HTTP 429 responses with retry-after headers when limits are exceeded
4. Make rate limits configurable per endpoint (default: 60 requests/minute per user)
5. Log rate limit violations for monitoring

## Non-Functional Requirements

- Rate limiter must work in Convex's serverless environment (no persistent in-memory state)
- Must not degrade performance for legitimate usage patterns
- Must be per-user, not per-IP (trusted household LAN context)

## Acceptance Criteria

- [ ] Rate limiter middleware exists and is reusable
- [ ] All 5 endpoints enforce rate limits
- [ ] 429 responses include retry-after header
- [ ] Rate limits are configurable via constants
- [ ] Tests verify rate limit enforcement and 429 response format
- [ ] Existing endpoint tests still pass

## Out of Scope

- BM2 login endpoint rate limiting (separate concern)
- Distributed rate limiting across multiple instances
- Client-side rate limit handling UI
