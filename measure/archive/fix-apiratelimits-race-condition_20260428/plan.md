# Fix apiRateLimits Race Condition - Implementation Plan

## Phase 1: Fix Race Condition in checkAndIncrementApiRateLimitHandler

### Tasks

- [x] Write test case that simulates concurrent requests (two simultaneous calls)
- [x] Implement atomic upsert: try insert, catch duplicate, re-query and patch
- [x] Verify tests pass (14 tests in apiRateLimits.test.ts)
- [x] Run full BM2 test suite
- [x] Run typecheck and lint
- [x] Build BM2

## Phase 2: Documentation and Finalization

### Tasks

- [x] Update tech-debt.md (remove resolved item if applicable)
- [x] Update lessons-learned.md
- [ ] Commit with note and push (model: minimax-m2)
- [x] Update tracks.md with new track