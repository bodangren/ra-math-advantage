# Practice Timing Telemetry - Implementation Plan

## Phase 1: Canonical Contract and Schema Reconciliation

- [x] Task: Audit current practice submission schemas [e64ead6]
  - [x] Compare `lib/practice/contract.ts`, `lib/practice/submission.schema.ts`, and `convex/practice_submission.ts` [e64ead6]
  - [x] Identify enum, interactionHistory, and validator drift that would affect timing [e64ead6]
  - [x] Document any non-timing schema cleanup required before implementation [e64ead6]
- [x] Task: Write contract tests for timing fields [e64ead6]
  - [x] Test envelope validates with no timing fields for backward compatibility [e64ead6]
  - [x] Test envelope validates with a full timing summary [e64ead6]
  - [x] Test part-level timing validates when present [e64ead6]
  - [x] Test negative durations and impossible activeMs > wallClockMs are rejected [e64ead6]
- [x] Task: Add canonical timing types and validators [e64ead6]
  - [x] Add timing schemas/types to the canonical practice contract module [e64ead6]
  - [x] Update the Convex validator to match the canonical shape [e64ead6]
  - [x] Remove or deprecate divergent local typing where practical [e64ead6]
- [x] Task: Update documentation [e64ead6]
  - [x] Update `conductor/practice-component-contract.md` with timing fields [e64ead6]
  - [x] Add notes that timing belongs in canonical fields, not arbitrary `analytics` [e64ead6]
  - [x] Document timing as optional process evidence, not a standalone grade [e64ead6]
- [x] Task: Conductor - Phase Completion Verification 'Canonical Contract and Schema Reconciliation' (Protocol in workflow.md) [e64ead6]

## Phase 2: Reusable Timing Core and React Instrumentation

- [ ] Task: Write unit tests for the pure timing accumulator
  - [ ] Test wall-clock and active time accumulation
  - [ ] Test idle threshold handling with a 30 second default
  - [ ] Test pause/resume behavior
  - [ ] Test confidence downgrade reasons
- [ ] Task: Implement a course-agnostic timing accumulator
  - [ ] Create a pure module for timing session state and transitions
  - [ ] Use serializable timestamps and numeric durations
  - [ ] Keep browser APIs out of the pure module
- [ ] Task: Implement a React timing hook or wrapper
  - [ ] Use `Date.now()` for persisted timestamps
  - [ ] Use `performance.now()` for elapsed duration math
  - [ ] Subscribe to `visibilitychange`, `focus`, `blur`, and `pagehide`
  - [ ] Clean up all listeners on unmount
- [ ] Task: Add browser-event tests
  - [ ] Test hidden-tab intervals are not counted as active time
  - [ ] Test blur/focus intervals affect confidence
  - [ ] Test pagehide marks an interrupted or low-confidence session
  - [ ] Test a long interaction gap is counted as idle time
- [ ] Task: Conductor - Phase Completion Verification 'Reusable Timing Core and React Instrumentation' (Protocol in workflow.md)

## Phase 3: Activity Submission Integration

- [ ] Task: Write integration tests for timed practice submission
  - [ ] Test activity wrapper appends timing to a real `practice.v1` envelope
  - [ ] Test component-provided timing is not overwritten incorrectly
  - [ ] Test missing activityId or synthetic submissions are not accepted as real timing evidence
- [ ] Task: Inject timing through the activity rendering path
  - [ ] Prefer wrapper-level timing so individual activities do not duplicate logic
  - [ ] Ensure activityId, mode, status, attemptNumber, submittedAt, and timing are assembled consistently
  - [ ] Preserve existing `onSubmit` behavior
- [ ] Task: Wire representative activity families
  - [ ] Verify comprehension quiz submissions include timing
  - [ ] Verify fill-in-the-blank submissions include timing
  - [ ] Verify graphing activity submissions include timing and keep interactionHistory
  - [ ] Verify StepByStepSolver submissions include timing based on real attempt data
- [ ] Task: Guard non-student and non-practice contexts
  - [ ] Ensure teaching/preview harnesses do not create student timing evidence
  - [ ] Ensure guided mode behavior is explicit: either record timing or document why not
  - [ ] Ensure timing does not block phase completion if submission timing is absent
- [ ] Task: Conductor - Phase Completion Verification 'Activity Submission Integration' (Protocol in workflow.md)

## Phase 4: Persistence and Review Surfaces

- [ ] Task: Update Convex submission validation and storage tests
  - [ ] Test `submitActivity` accepts timing fields
  - [ ] Test old submissions without timing still pass
  - [ ] Test invalid timing is rejected before persistence
- [ ] Task: Persist timing on practice submissions
  - [ ] Ensure `activity_submissions.submissionData` stores the canonical timing fields
  - [ ] Do not add separate timing tables in this track unless required by validator limits
  - [ ] Keep all persistence idempotent with existing submission flow
- [ ] Task: Expose timing in review/debug surfaces
  - [ ] Add a compact timing summary where submission evidence is displayed
  - [ ] Show confidence and confidence reasons for developer/teacher review
  - [ ] Avoid adding new gradebook metrics in this track
- [ ] Task: Add backward compatibility safeguards
  - [ ] Ensure teacher review handles submissions with no timing
  - [ ] Ensure malformed legacy analytics timing is ignored rather than normalized silently
  - [ ] Add a tech-debt note if any legacy submission schema remains unresolved
- [ ] Task: Conductor - Phase Completion Verification 'Persistence and Review Surfaces' (Protocol in workflow.md)

## Phase 5: Verification, Documentation, and Handoff

- [ ] Task: Run validation commands
  - [ ] Run focused practice contract/timing tests
  - [ ] Run relevant activity submission tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
  - [ ] Update `conductor/current_directive.md` if this becomes active work
- [ ] Task: Write junior developer handoff notes
  - [ ] Document how new activities should use timing
  - [ ] Document when timing confidence should be low
  - [ ] Document how future SRS tracks should consume timing
- [ ] Task: Conductor - Phase Completion Verification 'Verification, Documentation, and Handoff' (Protocol in workflow.md)
