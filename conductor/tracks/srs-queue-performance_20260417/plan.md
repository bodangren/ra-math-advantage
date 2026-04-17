# Implementation Plan: SRS Queue Performance Fixes

## Phase 1: Batch Queue Resolution and Bound Card Queries

### Tasks

- [x] **Task: Write tests for batched queue resolution** [f3e7e0c]
  - [x] Add tests verifying that `db.get` is called with batched standard IDs, not one-at-a-time
  - [x] Add tests verifying that `practice_items` and `activities` are resolved in bulk, not per-queue-item
  - [x] Ensure all existing `__tests__/convex/queue/queue.test.ts` tests still pass

- [x] **Task: Refactor `resolveDailyPracticeQueue` for batched reads** [f3e7e0c]
  - [x] Replace `ctx.db.get(standardId)` loop with `Promise.all` batch lookup for standards
  - [x] Refactor `resolveQueueItem` into a bulk resolver: collect unique `problemFamilyId`s, query practice_items in parallel, then batch-get activities with `Promise.all`
  - [x] Add `.take(100)` bound to the `srs_cards` query
  - [x] Preserve exact ordering and null-skipping behavior

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** [cd42e66]

## Phase 2: Verification and Handoff [checkpoint: eaed5ca]

### Tasks

- [~] **Task: Run full verification suite**
  - [x] Run `CI=true npm run test`
  - [x] Run `npm run lint`
  - [x] Run `npm run build`
  - [x] Verify no regressions in queue-related tests

- [x] **Task: Update tech-debt registry**
  - [x] Mark resolved SRS queue N+1 items in `tech-debt.md`
  - [x] Add any discovered issues

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**
