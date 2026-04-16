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

## Phase 2: New Type Definitions [checkpoint: 6352313]

- [x] Task: Write card state type tests [8888bb7]
  - [x] Test `SrsCardState` accepts valid data for each card state: new, learning, review, relearning
  - [x] Test `SrsCardState` rejects missing required fields (compile-time via TypeScript)
  - [x] Test serialization round-trips (no Date objects, all ISO strings)
- [x] Task: Define `SrsCardState` type [8888bb7]
  - [x] Add `SrsCardState` with cardId, studentId, objectiveId, problemFamilyId, stability, difficulty, state, dueDate, elapsedDays, scheduledDays, reps, lapses, lastReview, createdAt, updatedAt
  - [x] Add `SrsCardId` branded type
- [x] Task: Write review log type tests [8888bb7]
  - [x] Test `SrsReviewLogEntry` captures before/after state
  - [x] Test evidence field includes baseRating, timingAdjusted, reasons
- [x] Task: Define `SrsReviewLogEntry` type [8888bb7]
  - [x] Add reviewId, cardId, studentId, rating, submissionId, evidence, stateBefore, stateAfter, reviewedAt
- [x] Task: Write session type tests [8888bb7]
  - [x] Test `SrsSessionConfig` has sensible defaults
  - [x] Test `SrsSession` tracks planned vs completed cards
- [x] Task: Define `SrsSessionConfig` and `SrsSession` types [8888bb7]
  - [x] Add `SrsSessionConfig` with newCardsPerDay, maxReviewsPerDay, prioritizeOverdue
  - [x] Add `SrsSession` with sessionId, studentId, startedAt, completedAt, plannedCards, completedCards, config
- [x] Task: Conductor - Phase Completion Verification 'New Type Definitions' (Protocol in workflow.md) [d333936]

## Phase 3: Instructional Language and Guidelines [checkpoint: f2ebd09]

- [x] Task: Define instructional language constants [8888bb7]
  - [x] Add `STUDENT_DAILY_PRACTICE_COPY` constants for session-level messaging
  - [x] Add `TEACHER_DAILY_PRACTICE_COPY` constants for dashboard messaging
  - [x] Extend existing `deriveStudentGuidance`/`deriveTeacherGuidance` or reference them
  - [x] Ensure no punitive or speed-shaming language in any constant
- [x] Task: Write instructional language tests [8888bb7]
  - [x] Test student copy contains no speed references or rankings
  - [x] Test teacher copy uses diagnostic language only
  - [x] Test all copy strings are non-empty
- [x] Task: Add module-level documentation [8888bb7]
  - [x] Add JSDoc to `lib/srs/contract.ts` with triage handling rules
  - [x] Document the `srs.contract.v1` versioning strategy
  - [x] Document how downstream tracks should import from this module
- [x] Task: Conductor - Phase Completion Verification 'Instructional Language and Guidelines' (Protocol in workflow.md) [6352313]

## Phase 4: Verification and Handoff [checkpoint: c6913e2]

- [x] Task: Run validation commands [b0d1db5]
  - [x] Run focused SRS contract tests (26/26 passing)
  - [x] Run `npm run lint` (passing)
  - [x] Run `npm run typecheck` (25 pre-existing test-file errors remain; no new errors)
- [x] Task: Update Conductor planning artifacts [b0d1db5]
  - [x] Mark completed tasks and phases in this plan
  - [x] Update `conductor/tracks.md`
- [x] Task: Write junior developer handoff notes [b0d1db5]
  - [x] Document which types are re-exports vs new definitions
  - [x] Document how Track 2 (scheduler) uses `SrsCardState`
  - [x] Document how Track 5 (schema) maps `SrsCardState` to Convex tables
  - [x] Document triage handling contract for Track 5 and Track 8
- [x] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md) [b0d1db5]
