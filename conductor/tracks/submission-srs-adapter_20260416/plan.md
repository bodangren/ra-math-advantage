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

- [x] Task: Implement problem family resolver
  - [x] Create `resolveProblemFamily(activityId, blueprintData)` in adapter module
  - [x] Map `componentKey` + `standardId` → `problemFamilyId` using blueprint lookup
  - [x] Return `null` when no blueprint entry exists (graceful skip)
  - [x] Return `null` when blueprint data is unavailable (not yet loaded)
- [x] Task: Write resolution tests
  - [x] Test matching activity returns correct `problemFamilyId`
  - [x] Test unknown activity returns `null`
  - [x] Test empty blueprint data returns `null`
  - [x] Test multiple activities mapping to same problem family
  - [x] Test activity with only `componentKey` match but different `standardId` returns `null`
- [x] Task: Conductor - Phase Completion Verification 'Problem Family Resolution' (Protocol in workflow.md)

## Phase 3: First-Seen Card Creation

- [x] Task: Implement first-seen card creation logic
  - [x] When `persistence.getCard(studentId, problemFamilyId)` returns `null`, call `scheduler.createCard`
  - [x] Set initial card state to `"new"` with `due` = now
  - [x] Persist new card via `persistence.saveCard`
  - [x] Proceed to review pipeline with the newly created card
- [x] Task: Write card creation tests
  - [x] Test first submission for problem family creates card with state `"new"`
  - [x] Test second submission finds existing card (no duplicate creation)
  - [x] Test created card has `reps = 0`, `lapses = 0`
  - [x] Test concurrent first-submissions for same problem family (idempotency)
  - [x] Test card creation failure is caught and reported in result
- [x] Task: Conductor - Phase Completion Verification 'First-Seen Card Creation' (Protocol in workflow.md)

## Phase 4: Review Processing Pipeline

- [x] Task: Implement full submission-to-review pipeline
  - [x] Extract submission parts (isCorrect, hintsUsed, revealStepsSeen, misconceptionTags)
  - [x] Look up timing baseline for problem family via persistence
  - [x] Derive timing features if baseline available, else pass undefined
  - [x] Call `mapPracticeToSrsRating` with correctness evidence + timing features
  - [x] Apply derived rating to card via `scheduler.reviewCard`
  - [x] Build review log entry from before/after card state + rating + evidence
  - [x] Persist updated card and review log atomically via persistence adapter
  - [x] Return `SubmissionSrsResult` with updated state
- [x] Task: Write end-to-end pipeline tests with in-memory stores
  - [x] Test full pipeline: submit correct answer → card transitions from `"new"` to `"learning"` or `"review"`
  - [x] Test full pipeline: submit incorrect answer → card transitions to `"relearning"` or increment lapses
  - [x] Test pipeline with hints → derived rating reflects hint penalty
  - [x] Test pipeline with timing baseline → rating adjusted by timing
  - [x] Test pipeline without timing baseline → rating derived from correctness only
  - [x] Test idempotency: same submission envelope processed twice → same card state
  - [x] Test SRS error mid-pipeline → result contains error, does not throw
- [x] Task: Conductor - Phase Completion Verification 'Review Processing Pipeline' (Protocol in workflow.md)

## Phase 5: Convex Integration

- [x] Task: Implement Convex persistence adapter
  - [x] Create `convex/srs/submissionSrs.ts` with `processSubmissionSrs` internalMutation
  - [x] Use existing `ConvexCardStore` and `ConvexReviewLogStore` for SRS persistence
  - [x] Implement `ProblemFamilyResolver` using direct `ctx.db.query` on `practice_items` and `problem_families`
  - [x] Implement `TimingBaselineResolver` using direct `ctx.db.query` on `timing_baselines`
  - [x] Fixed cross-student card collision bug: added `by_student_and_problem_family` index to `srs_cards` and updated `saveCard`/`saveCards`/`processReview` to query by `(studentId, problemFamilyId)`
- [x] Task: Wire adapter into submission flow
  - [x] Hook `processSubmissionSrs` into `submitActivity` via `ctx.scheduler.runAfter(0, ...)`
  - [x] SRS processing runs asynchronously after submission persistence
  - [x] Add error boundary: catch and log scheduler/SRS errors, never fail the submission mutation
- [x] Task: Write integration tests
  - [x] Test `processSubmissionSrsHandler` returns skipped when no practice item exists
  - [x] Test `processSubmissionSrsHandler` returns skipped when problem family is missing
  - [x] Test successful submission creates card and review log via Convex stores
  - [x] Test SRS errors are caught and returned without throwing
  - [x] Test timing baseline lookup when available
- [x] Task: Conductor - Phase Completion Verification 'Convex Integration' (Protocol in workflow.md)

## Phase 6: Verification and Handoff

- [x] Task: Run validation commands
  - [x] Run focused submission-SRS adapter tests (14 tests pass)
  - [x] Run `npm run lint` (passes)
  - [x] Run `npm run typecheck` or document known pre-existing failures (pre-existing test-file errors only)
- [x] Task: Update Conductor planning artifacts
  - [x] Mark completed tasks and phases in this plan
  - [x] Update `conductor/tracks.md`
- [x] Task: Write junior developer handoff notes
  - [x] Document the submission-to-SRS pipeline flow with diagram
  - [x] Document `SubmissionSrsAdapter` interface and how to use it
  - [x] Document error handling philosophy (SRS is additive, never blocks)
  - [x] Document how to add new problem family mappings
  - [x] Document idempotency guarantees and replay behavior
- [x] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md) [checkpoint: c9e6f7a]
