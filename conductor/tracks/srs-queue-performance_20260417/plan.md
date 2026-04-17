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

- [~] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

## Phase 2: Verification and Handoff

### Tasks

- [ ] **Task: Run full verification suite**
  - [ ] Run `CI=true npm run test`
  - [ ] Run `npm run lint`
  - [ ] Run `npm run build`
  - [ ] Verify no regressions in queue-related tests

- [ ] **Task: Update tech-debt registry**
  - [ ] Mark resolved SRS queue N+1 items in `tech-debt.md`
  - [ ] Add any discovered issues

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**
