# Implementation Plan: Fix Misconception Summary N+1 Query

## Phase 1: Fix N+1 Query Pattern

### Task: Parallelize Student Review Log Queries
- [x] Refactor sequential `for` loop to `Promise.all` over student IDs
- [x] Verify all existing tests pass

### Task: Batch Card Lookups with Promise.all
- [x] Refactor sequential card `ctx.db.get` calls to parallel `Promise.all` with deduped card IDs
- [x] Verify all existing tests pass

### Task: Verify and Commit
- [x] Run full test suite for srs-dashboard.test.ts (31 tests pass)
- [x] Run `npx tsc --noEmit` to verify types
- [x] Commit with git note and push

## Verification

- [x] All 8 tests in `srs-dashboard.test.ts` pass
- [x] `npx tsc --noEmit` passes
- [x] No behavioral changes to output
