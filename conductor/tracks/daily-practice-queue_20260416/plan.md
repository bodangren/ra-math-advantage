# Plan: Daily Practice Queue Engine

## Phase 1: Queue Query Implementation [checkpoint: 69b013c]

- [x] Task: Write failing integration tests for `getDailyPracticeQueue` Convex query [69b013c]
  - [x] Test: returns ordered queue items for a student with cards
  - [x] Test: returns empty queue for student with no cards
  - [x] Test: joins card data with problem family and objective policy
  - [x] Test: calls `buildDailyQueue` with correct arguments
- [x] Task: Implement `getDailyPracticeQueue` Convex query in `convex/queue/` [69b013c]
  - [x] Fetch student's SRS cards via indexed read on `srs_cards` by `studentId`
  - [x] Join with objective policies from `objective_policies`
  - [x] Call `buildDailyQueue` from `lib/srs/queue.ts` with cards, policies, config, and current timestamp
  - [x] Return ordered queue items
- [x] Task: Conductor - Phase Completion Verification 'Queue Query Implementation' (Protocol in workflow.md) [69b013c]

## Phase 2: Queue Item Resolution [checkpoint: 3e56d7c]

- [x] Task: Write failing tests for queue item resolution [3e56d7c]
  - [x] Test: resolves queue item to practice activity with `componentKey` and `props`
  - [x] Test: skips card when no practice item exists for its problem family
  - [x] Test: skips card gracefully when practice item has no activity
  - [x] Test: resolves multiple items with correct ordering preserved
- [x] Task: Implement queue item resolution logic [3e56d7c]
  - [x] Join `srs_cards` → `practice_items` by problem family ID
  - [x] Extract `componentKey` and `props` from resolved practice items
  - [x] Filter out cards with no matching practice item
  - [x] Attach resolved activity data to queue items
- [x] Task: Conductor - Phase Completion Verification 'Queue Item Resolution' (Protocol in workflow.md) [3e56d7c]

## Phase 3: Session Lifecycle

- [ ] Task: Write failing tests for session mutations
  - [ ] Test: `startDailySession` creates `srs_session` record and returns queue
  - [ ] Test: `startDailySession` resumes existing active session when one exists for today
  - [ ] Test: `getActiveSession` returns current day's active session or null
  - [ ] Test: `completeDailySession` marks session completed and updates `completedCards` count
  - [ ] Test: `completeDailySession` throws if no active session exists
- [ ] Task: Implement `startDailySession` mutation in `convex/queue/sessions.ts`
  - [ ] Check for existing active session for student today
  - [ ] If exists, return existing session and queue
  - [ ] If not, create new `srs_session` record
  - [ ] Fetch and resolve queue items
  - [ ] Return session with ordered queue
- [ ] Task: Implement `getActiveSession` query in `convex/queue/sessions.ts`
  - [ ] Query `srs_sessions` by student ID and date, filtered to active status
  - [ ] Return session with progress data or null
- [ ] Task: Implement `completeDailySession` mutation in `convex/queue/sessions.ts`
  - [ ] Validate active session exists
  - [ ] Mark session as completed
  - [ ] Update `completedCards` count from review log
- [ ] Task: Conductor - Phase Completion Verification 'Session Lifecycle' (Protocol in workflow.md)

## Phase 4: Session Config and Limits

- [ ] Task: Write failing tests for session config enforcement
  - [ ] Test: applies `SrsSessionConfig` defaults (`newCardsPerDay: 5`, `maxReviewsPerDay: 20`, `prioritizeOverdue: true`)
  - [ ] Test: enforces daily session limit — cannot start second session on same day
  - [ ] Test: queue respects `maxReviewsPerDay` cap
  - [ ] Test: queue respects `newCardsPerDay` cap
- [ ] Task: Apply `SrsSessionConfig` defaults in queue query
  - [ ] Wire config defaults into `buildDailyQueue` call
  - [ ] Cap new cards and reviews per config limits
  - [ ] Prioritize overdue cards when `prioritizeOverdue` is true
- [ ] Task: Enforce daily session limit in `startDailySession`
  - [ ] Query existing sessions for student today before creating new one
  - [ ] Return existing session instead of creating duplicate
- [ ] Task: Conductor - Phase Completion Verification 'Session Config and Limits' (Protocol in workflow.md)

## Phase 5: Verification and Handoff

- [ ] Task: Run full test suite and verify all tests pass
  - [ ] Run `npm run lint`
  - [ ] Run `npm run test` for all queue-related tests
  - [ ] Verify no type errors with `npx tsc --noEmit`
- [ ] Task: Verify integration with Track 2 `buildDailyQueue` API surface
  - [ ] Confirm function signatures match
  - [ ] Confirm return types align with queue item shape
- [ ] Task: Update track metadata with actual task count
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
