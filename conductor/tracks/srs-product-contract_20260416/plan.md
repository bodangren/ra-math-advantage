# Daily Practice SRS Product Contract — Implementation Plan

## Phase 1: Module Scaffolding and Re-exports [checkpoint: d333936]

- [x] Task: Create `lib/srs/contract.ts` module [8888bb7]
  - [x] Create directory `lib/srs/`
  - [x] Add `SRS_CONTRACT_VERSION = 'srs.contract.v1'` constant
  - [x] Re-export `SrsRating`, `SrsRatingInput`, `SrsRatingResult` from `lib/practice/srs-rating.ts`
  - [x] Re-export `ObjectivePriority`, `ObjectivePracticePolicy`, `PRIORITY_DEFAULTS`, `EvidenceConfidence`, `ObjectiveProficiencyResult`, `StudentProficiencyView`, `TeacherProficiencyView` from `lib/practice/objective-proficiency.ts`
  - [x] Re-export `PracticeTimingBaseline`, `PracticeTimingFeatures`, `TimingSpeedBand` from `lib/practice/timing-baseline.ts`
  - [x] Re-export `PracticeSubmissionEnvelope`, `PracticeSubmissionPart`, `PracticeTimingSummary` from `lib/practice/contract.ts`
- [x] Task: Write re-export verification tests [8888bb7]
  - [x] Test that imported types compile from `lib/srs/contract`
  - [x] Test that re-exported `SrsRating` matches source module values
  - [x] Test that re-exported `PRIORITY_DEFAULTS` matches source module values
- [x] Task: Conductor - Phase Completion Verification 'Module Scaffolding and Re-exports' (Protocol in workflow.md) [8888bb7]

## Phase 2: New Type Definitions

- [ ] Task: Write card state type tests
  - [ ] Test `SrsCardState` accepts valid data for each card state: new, learning, review, relearning
  - [ ] Test `SrsCardState` rejects missing required fields
  - [ ] Test serialization round-trips (no Date objects, all ISO strings)
- [ ] Task: Define `SrsCardState` type
  - [ ] Add `SrsCardState` with cardId, studentId, objectiveId, problemFamilyId, stability, difficulty, state, dueDate, elapsedDays, scheduledDays, reps, lapses, lastReview, createdAt, updatedAt
  - [ ] Add `SrsCardId` branded type
- [ ] Task: Write review log type tests
  - [ ] Test `SrsReviewLogEntry` captures before/after state
  - [ ] Test evidence field includes baseRating, timingAdjusted, reasons
- [ ] Task: Define `SrsReviewLogEntry` type
  - [ ] Add reviewId, cardId, studentId, rating, submissionId, evidence, stateBefore, stateAfter, reviewedAt
- [ ] Task: Write session type tests
  - [ ] Test `SrsSessionConfig` has sensible defaults
  - [ ] Test `SrsSession` tracks planned vs completed cards
- [ ] Task: Define `SrsSessionConfig` and `SrsSession` types
  - [ ] Add `SrsSessionConfig` with newCardsPerDay, maxReviewsPerDay, prioritizeOverdue
  - [ ] Add `SrsSession` with sessionId, studentId, startedAt, completedAt, plannedCards, completedCards, config
- [ ] Task: Conductor - Phase Completion Verification 'New Type Definitions' (Protocol in workflow.md)

## Phase 3: Instructional Language and Guidelines

- [ ] Task: Define instructional language constants
  - [ ] Add `STUDENT_DAILY_PRACTICE_COPY` constants for session-level messaging
  - [ ] Add `TEACHER_DAILY_PRACTICE_COPY` constants for dashboard messaging
  - [ ] Extend existing `deriveStudentGuidance`/`deriveTeacherGuidance` or reference them
  - [ ] Ensure no punitive or speed-shaming language in any constant
- [ ] Task: Write instructional language tests
  - [ ] Test student copy contains no speed references or rankings
  - [ ] Test teacher copy uses diagnostic language only
  - [ ] Test all copy strings are non-empty
- [ ] Task: Add module-level documentation
  - [ ] Add JSDoc to `lib/srs/contract.ts` with triage handling rules
  - [ ] Document the `srs.contract.v1` versioning strategy
  - [ ] Document how downstream tracks should import from this module
- [ ] Task: Conductor - Phase Completion Verification 'Instructional Language and Guidelines' (Protocol in workflow.md)

## Phase 4: Verification and Handoff

- [ ] Task: Run validation commands
  - [ ] Run focused SRS contract tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
- [ ] Task: Write junior developer handoff notes
  - [ ] Document which types are re-exports vs new definitions
  - [ ] Document how Track 2 (scheduler) uses `SrsCardState`
  - [ ] Document how Track 5 (schema) maps `SrsCardState` to Convex tables
  - [ ] Document triage handling contract for Track 5 and Track 8
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
