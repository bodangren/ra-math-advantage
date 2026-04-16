# Plan: objective-proficiency_20260416

## Phase 1: FSRS Stability Normalization [checkpoint: 2f6fe7b]

- [x] Task: Write `stabilityToRetention` function in `lib/practice/srs-proficiency.ts` [150eecd]
  - [x] Sub-task: Implement sigmoid normalization `1 - (1 / (1 + stability / scaleFactor))` with configurable `scaleFactor` (default 30)
  - [x] Sub-task: Handle edge cases: stability <= 0 returns 0, NaN returns 0, Infinity returns 1
  - [x] Sub-task: Export `STABILITY_SCALE_FACTOR` constant for configuration
- [x] Task: Write unit tests in `lib/practice/__tests__/srs-proficiency.test.ts` [150eecd]
  - [x] Sub-task: Test stability 0 → retention 0
  - [x] Sub-task: Test stability 30 → retention 0.5
  - [x] Sub-task: Test stability 90 → retention ~0.75
  - [x] Sub-task: Test stability 300 → retention ~0.909
  - [x] Sub-task: Test negative stability → retention 0
  - [x] Sub-task: Test very high stability (1000+) → retention approaching 1
  - [x] Sub-task: Test custom scaleFactor overrides default
  - [x] Sub-task: Test NaN and Infinity inputs
- [x] Task: Run tests and verify all pass [150eecd]
- [x] Task: Run `npm run lint` and fix any issues [150eecd]
- [x] Task: Conductor - Phase Completion Verification 'FSRS Stability Normalization' (Protocol in workflow.md)

## Phase 2: Card-to-Evidence Aggregation

- [x] Task: Write `aggregateCardsToEvidence` function in `lib/practice/srs-proficiency.ts`
  - [x] Sub-task: Define `SrsCardState` input type with stability, difficulty, reps, lapses, problemFamilyId, lastReviewMs, reviewDurationMs
  - [x] Sub-task: Group cards by `problemFamilyId`
  - [x] Sub-task: Per family: compute `retentionStrength` as average of `stabilityToRetention(card.stability)` across all cards
  - [x] Sub-task: Per family: compute `practiceCoverage` as proportion of cards with `reps > 0`
  - [x] Sub-task: Per family: compute `fluencyConfidence` from recent review timing (cards with duration under baseline get higher confidence)
  - [x] Sub-task: Return `ProblemFamilyEvidence[]` compatible with existing `computeObjectiveProficiency` input
- [x] Task: Write unit tests for `aggregateCardsToEvidence`
  - [x] Sub-task: Test single card with high stability produces high retentionStrength
  - [x] Sub-task: Test mix of cards averages correctly
  - [x] Sub-task: Test practiceCoverage with all/new cards (0 reps) vs reviewed cards
  - [x] Sub-task: Test empty card list returns empty evidence array
  - [x] Sub-task: Test cards from multiple families produce multiple evidence entries
  - [x] Sub-task: Test fluencyConfidence derivation from timing data
- [x] Task: Run tests and verify all pass
- [x] Task: Run `npm run lint` and fix any issues
- [x] Task: Conductor - Phase Completion Verification 'Card-to-Evidence Aggregation' (Protocol in workflow.md)

## Phase 3: Objective Proficiency Query [checkpoint: dc2ddf4]

- [x] Task: Write Convex query `getObjectiveProficiency` in `convex/objectiveProficiency.ts` [dc2ddf4]
  - [x] Sub-task: Accept `studentId` (required) and `objectiveId` (optional) arguments
  - [x] Sub-task: Fetch SRS cards for the student filtered by objective's problem families (join through `problem_families` table)
  - [x] Sub-task: Fetch recent review log entries for timing data
  - [x] Sub-task: Call `aggregateCardsToEvidence` to produce `ProblemFamilyEvidence[]`
  - [x] Sub-task: Call `computeObjectiveProficiency` and return `ObjectiveProficiencyResult`
- [x] Task: Write integration tests in `convex/__tests__/objectiveProficiency.test.ts` [dc2ddf4]
  - [x] Sub-task: Test with student who has reviewed cards — returns proficiency result
  - [x] Sub-task: Test with student who has no cards — returns zero proficiency
  - [x] Sub-task: Test with specific objectiveId filters correctly
  - [x] Sub-task: Test that existing `objective-proficiency.ts` tests still pass unchanged
- [x] Task: Run tests and verify all pass
- [x] Task: Run `npm run lint` and fix any issues
- [x] Task: Conductor - Phase Completion Verification 'Objective Proficiency Query' (Protocol in workflow.md)

## Phase 4: Student and Teacher Views

- [ ] Task: Write Convex query `getStudentProficiencySummary` in `convex/objectiveProficiency.ts`
  - [ ] Sub-task: Accept `studentId` argument
  - [ ] Sub-task: Fetch all objectives the student has cards for
  - [ ] Sub-task: Compute proficiency per objective using the aggregation pipeline
  - [ ] Sub-task: Call `buildStudentProficiencyView` and return `StudentProficiencyView`
- [ ] Task: Write Convex query `getTeacherClassProficiency` in `convex/objectiveProficiency.ts`
  - [ ] Sub-task: Accept `classId` argument
  - [ ] Sub-task: Fetch all students in the class
  - [ ] Sub-task: Compute per-objective proficiency across all students
  - [ ] Sub-task: Aggregate: count proficient per objective, average retention, struggling students list
  - [ ] Sub-task: Call `buildTeacherProficiencyView` and return `TeacherProficiencyView`
- [ ] Task: Write view tests
  - [ ] Sub-task: Test `getStudentProficiencySummary` returns grouped-by-priority view
  - [ ] Sub-task: Test `getTeacherClassProficiency` returns aggregated class view
  - [ ] Sub-task: Test teacher view identifies struggling students correctly
- [ ] Task: Run tests and verify all pass
- [ ] Task: Run `npm run lint` and fix any issues
- [ ] Task: Conductor - Phase Completion Verification 'Student and Teacher Views' (Protocol in workflow.md)

## Phase 5: Verification and Handoff

- [ ] Task: Run full test suite and confirm all existing + new tests pass
- [ ] Task: Run `npm run lint` across entire project
- [ ] Task: Verify no changes to `objective-proficiency.ts` function signatures
- [ ] Task: Document the aggregation pipeline in code comments
- [ ] Task: Update `conductor/tracks.md` with track status
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
