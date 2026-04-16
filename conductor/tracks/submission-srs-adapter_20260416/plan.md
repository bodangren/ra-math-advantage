# Submission-to-SRS Adapter — Implementation Plan

## Phase 1: Adapter Interface Design

- [x] Task: Define `SubmissionSrsAdapter` interface
  - [x] Create `lib/srs/submission-srs-adapter.ts` with interface definition
  - [x] Define `processSubmission(input: SubmissionSrsInput): Promise<SubmissionSrsResult>` method
  - [x] Define `SubmissionSrsInput` type (submission envelope + studentId + activityId)
  - [x] Define `SubmissionSrsResult` type (card state + review log + skipped flag + error)
  - [x] Define `ProblemFamilyResolver` interface for activity → problemFamilyId mapping
  - [x] Define `SrsPersistenceAdapter` interface for card + review log reads/writes
- [x] Task: Write adapter contract tests
  - [x] Test `processSubmission` returns `SubmissionSrsResult` for valid input
  - [x] Test `processSubmission` returns `skipped: true` when no blueprint exists
  - [x] Test `processSubmission` returns error result without throwing on SRS failure
  - [x] Test adapter accepts injected dependencies (resolver, persistence, scheduler)
- [x] Task: Conductor - Phase Completion Verification 'Adapter Interface Design' (Protocol in workflow.md)

## Phase 2: Problem Family Resolution

- [ ] Task: Implement problem family resolver
  - [ ] Create `resolveProblemFamily(activityId, blueprintData)` in adapter module
  - [ ] Map `componentKey` + `standardId` → `problemFamilyId` using blueprint lookup
  - [ ] Return `null` when no blueprint entry exists (graceful skip)
  - [ ] Return `null` when blueprint data is unavailable (not yet loaded)
- [ ] Task: Write resolution tests
  - [ ] Test matching activity returns correct `problemFamilyId`
  - [ ] Test unknown activity returns `null`
  - [ ] Test empty blueprint data returns `null`
  - [ ] Test multiple activities mapping to same problem family
  - [ ] Test activity with only `componentKey` match but different `standardId` returns `null`
- [ ] Task: Conductor - Phase Completion Verification 'Problem Family Resolution' (Protocol in workflow.md)

## Phase 3: First-Seen Card Creation

- [ ] Task: Implement first-seen card creation logic
  - [ ] When `persistence.getCard(studentId, problemFamilyId)` returns `null`, call `scheduler.createCard`
  - [ ] Set initial card state to `"new"` with `due` = now
  - [ ] Persist new card via `persistence.saveCard`
  - [ ] Proceed to review pipeline with the newly created card
- [ ] Task: Write card creation tests
  - [ ] Test first submission for problem family creates card with state `"new"`
  - [ ] Test second submission finds existing card (no duplicate creation)
  - [ ] Test created card has `reps = 0`, `lapses = 0`
  - [ ] Test concurrent first-submissions for same problem family (idempotency)
  - [ ] Test card creation failure is caught and reported in result
- [ ] Task: Conductor - Phase Completion Verification 'First-Seen Card Creation' (Protocol in workflow.md)

## Phase 4: Review Processing Pipeline

- [ ] Task: Implement full submission-to-review pipeline
  - [ ] Extract submission parts (isCorrect, hintsUsed, revealStepsSeen, misconceptionTags)
  - [ ] Look up timing baseline for problem family via persistence
  - [ ] Derive timing features if baseline available, else pass undefined
  - [ ] Call `mapPracticeToSrsRating` with correctness evidence + timing features
  - [ ] Apply derived rating to card via `scheduler.reviewCard`
  - [ ] Build review log entry from before/after card state + rating + evidence
  - [ ] Persist updated card and review log atomically via persistence adapter
  - [ ] Return `SubmissionSrsResult` with updated state
- [ ] Task: Write end-to-end pipeline tests with in-memory stores
  - [ ] Test full pipeline: submit correct answer → card transitions from `"new"` to `"learning"` or `"review"`
  - [ ] Test full pipeline: submit incorrect answer → card transitions to `"relearning"` or increment lapses
  - [ ] Test pipeline with hints → derived rating reflects hint penalty
  - [ ] Test pipeline with timing baseline → rating adjusted by timing
  - [ ] Test pipeline without timing baseline → rating derived from correctness only
  - [ ] Test idempotency: same submission envelope processed twice → same card state
  - [ ] Test SRS error mid-pipeline → result contains error, does not throw
- [ ] Task: Conductor - Phase Completion Verification 'Review Processing Pipeline' (Protocol in workflow.md)

## Phase 5: Convex Integration

- [ ] Task: Implement Convex persistence adapter
  - [ ] Create `convex/srs/submissionSrsAdapter.ts` (or similar Convex module)
  - [ ] Implement `SrsPersistenceAdapter` using Convex table queries/mutations for `srs_cards` and `srs_review_log`
  - [ ] Implement atomic card + review log write using Convex mutation
  - [ ] Implement `ProblemFamilyResolver` using Track 4 blueprint query
- [ ] Task: Wire adapter into submission flow
  - [ ] Hook `processSubmission` into existing activity submission mutation/action
  - [ ] Ensure SRS processing runs after submission is persisted (non-blocking)
  - [ ] Add error boundary: catch and log SRS errors, never fail the submission mutation
  - [ ] Use Convex internal action for async SRS processing if needed to avoid blocking
- [ ] Task: Write integration tests
  - [ ] Test Convex adapter reads/writes to correct tables
  - [ ] Test submission mutation triggers SRS card update
  - [ ] Test submission mutation succeeds even when SRS processing fails
  - [ ] Test card state is queryable after submission
  - [ ] Test review log is queryable after submission
- [ ] Task: Conductor - Phase Completion Verification 'Convex Integration' (Protocol in workflow.md)

## Phase 6: Verification and Handoff

- [ ] Task: Run validation commands
  - [ ] Run focused submission-SRS adapter tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
- [ ] Task: Write junior developer handoff notes
  - [ ] Document the submission-to-SRS pipeline flow with diagram
  - [ ] Document `SubmissionSrsAdapter` interface and how to use it
  - [ ] Document error handling philosophy (SRS is additive, never blocks)
  - [ ] Document how to add new problem family mappings
  - [ ] Document idempotency guarantees and replay behavior
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
