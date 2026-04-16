# Reusable SRS Core Library — Implementation Plan

## Phase 1: FSRS Dependency and Scheduler Foundation

- [x] Task: Install and validate `ts-fsrs` dependency
  - [x] Evaluate `ts-fsrs` npm package API and types
  - [x] Add dependency to package.json (installed during 2026-04-16 code review)
  - [x] Verify license (MIT) and bundle size compatibility
  - [x] Create a smoke test that imports and exercises basic ts-fsrs functions
- [x] Task: Write scheduler unit tests
  - [x] Test `createCard` returns valid `SrsCardState` with state="new", reps=0, lapses=0
  - [x] Test `reviewCard` with `Again` rating increments lapses, reduces stability
  - [x] Test `reviewCard` with `Good` rating increases stability and scheduledDays
  - [x] Test `reviewCard` with `Easy` rating produces longest interval
  - [x] Test maximum interval cap is respected
  - [x] Test `getDueCards` returns only cards with dueDate <= now
  - [x] Test `previewInterval` returns scheduled days without mutating card
  - [x] Test rating mapping: SrsRating.Again → Rating.Again, etc.
- [x] Task: Implement scheduler wrapper
  - [x] Create `lib/srs/scheduler.ts`
  - [x] Implement `createCard` using `ts-fsrs` `createEmptyCard` + metadata mapping
  - [x] Implement `reviewCard` using `ts-fsrs` `fsrs().next`
  - [x] Implement `getDueCards` with ISO string date comparison
  - [x] Implement `previewInterval` as a non-mutating preview
  - [x] Map between `SrsCardState` and `ts-fsrs` internal `Card` type
- [x] Task: Document scheduler configuration
  - [x] Add JSDoc for `SchedulerConfig` and its defaults
  - [x] Document why default `requestRetention` is 0.9
  - [x] Document `maximumInterval` rationale (365 days = school year)
- [ ] Task: Conductor - Phase Completion Verification 'FSRS Dependency and Scheduler Foundation' (Protocol in workflow.md)

**Note:** ts-fsrs npm package installed during 2026-04-16 code review. Phase 1 implementation and tests are validated and passing.

## Phase 2: Review Processor

- [x] Task: Write review processor tests
  - [x] Test incorrect submission → card state enters relearning
  - [x] Test correct submission, no hints → card state advances with `Good` rating
  - [x] Test correct submission with hints → card state advances with `Hard` rating
  - [x] Test timing modifier: fast timing may upgrade to `Easy`
  - [x] Test missing timing does not block review processing
  - [x] Test review log captures correct before/after state
  - [x] Test review log captures evidence (baseRating, timingAdjusted, reasons)
- [x] Task: Implement review processor
  - [x] Create `lib/srs/review-processor.ts`
  - [x] Import `mapPracticeToSrsRating` from `lib/practice/srs-rating.ts`
  - [x] Import `deriveTimingFeatures` from `lib/practice/timing-baseline.ts`
  - [x] Import `reviewCard` from scheduler
  - [x] Implement full pipeline: submission → timing features → rating → card update → review log
- [x] Task: Document review processor pipeline
  - [x] Add JSDoc showing the processing stages
  - [x] Include example of a typical correct answer review flow
  - [x] Include example of an incorrect answer review flow
- [x] Task: Conductor - Phase Completion Verification 'Review Processor' (Protocol in workflow.md) [checkpoint: TBD]

## Phase 3: Queue Primitives

- [ ] Task: Write queue tests
  - [ ] Test new cards for essential objectives appear before supporting
  - [ ] Test overdue cards sorted by days overdue descending
  - [ ] Test due cards sorted by due date ascending
  - [ ] Test triaged objectives excluded from queue entirely
  - [ ] Test `newCardsPerDay` cap respected
  - [ ] Test `maxReviewsPerDay` cap respected
  - [ ] Test empty input returns empty queue
  - [ ] Test mix of new, overdue, and due cards produces correct ordering
- [ ] Task: Implement queue builder
  - [ ] Create `lib/srs/queue.ts`
  - [ ] Implement `buildDailyQueue` with multi-pass sorting
  - [ ] Implement `isOverdue` and `daysOverdue` helpers
  - [ ] Use `SrsSessionConfig` for queue parameters
  - [ ] Keep pure — accept all data as parameters, no side effects
- [ ] Task: Conductor - Phase Completion Verification 'Queue Primitives' (Protocol in workflow.md)

## Phase 4: Adapter Interfaces

- [ ] Task: Write adapter tests
  - [ ] Test `InMemoryCardStore` implements `CardStore` interface
  - [ ] Test `InMemoryReviewLogStore` implements `ReviewLogStore` interface
  - [ ] Test scheduler + processor + in-memory stores work end-to-end
  - [ ] Test card store `getDueCards` filters correctly
- [ ] Task: Implement adapter interfaces
  - [ ] Create `lib/srs/adapters.ts`
  - [ ] Define `CardStore` and `ReviewLogStore` interfaces
  - [ ] Implement `InMemoryCardStore` and `InMemoryReviewLogStore`
  - [ ] Document how Convex adapters should implement these (for Track 5)
- [ ] Task: Conductor - Phase Completion Verification 'Adapter Interfaces' (Protocol in workflow.md)

## Phase 5: Verification and Handoff

- [ ] Task: Run validation commands
  - [ ] Run focused SRS core library tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
- [ ] Task: Write junior developer handoff notes
  - [ ] Document how to use `createCard`, `reviewCard`, `getDueCards`
  - [ ] Document the review processor pipeline with code examples
  - [ ] Document how Track 5 should implement `CardStore`/`ReviewLogStore` with Convex
  - [ ] Document FSRS parameter tuning guidance
  - [ ] Document the SrsRating → ts-fsrs Grade mapping
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
