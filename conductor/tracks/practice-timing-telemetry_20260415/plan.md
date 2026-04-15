# Practice Timing Telemetry - Implementation Plan

## Phase 1: Canonical Contract and Schema Reconciliation [checkpoint: 790e2f5]

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

## Phase 2: Reusable Timing Core and React Instrumentation [checkpoint: a973651]

- [x] Task: Write unit tests for the pure timing accumulator [a973651]
  - [x] Test wall-clock and active time accumulation
  - [x] Test idle threshold handling with a 30 second default
  - [x] Test pause/resume behavior
  - [x] Test confidence downgrade reasons
- [x] Task: Implement a course-agnostic timing accumulator [a973651]
  - [x] Create a pure module for timing session state and transitions
  - [x] Use serializable timestamps and numeric durations
  - [x] Keep browser APIs out of the pure module
- [x] Task: Implement a React timing hook or wrapper [a973651]
  - [x] Use `Date.now()` for persisted timestamps
  - [x] Use `performance.now()` for elapsed duration math
  - [x] Subscribe to `visibilitychange`, `focus`, `blur`, and `pagehide`
  - [x] Clean up all listeners on unmount
- [x] Task: Add browser-event tests [a973651]
  - [x] Test hidden-tab intervals are not counted as active time
  - [x] Test blur/focus intervals affect confidence
  - [x] Test pagehide marks an interrupted or low-confidence session
  - [x] Test a long interaction gap is counted as idle time
- [x] Task: Conductor - Phase Completion Verification 'Reusable Timing Core and React Instrumentation' (Protocol in workflow.md) [a973651]

## Phase 3: Activity Submission Integration [checkpoint: 733bef3]

- [x] Task: Write integration tests for timed practice submission
  - [x] Test activity wrapper appends timing to a real `practice.v1` envelope
  - [x] Test component-provided timing is not overwritten incorrectly
  - [x] Test missing activityId or synthetic submissions are not accepted as real timing evidence
- [x] Task: Inject timing through the activity rendering path
  - [x] Prefer wrapper-level timing so individual activities do not duplicate logic
  - [x] Ensure activityId, mode, status, attemptNumber, submittedAt, and timing are assembled consistently
  - [x] Preserve existing `onSubmit` behavior
- [x] Task: Wire representative activity families
  - [x] Verify comprehension quiz submissions include timing
  - [x] Verify fill-in-the-blank submissions include timing
  - [x] Verify graphing activity submissions include timing and keep interactionHistory
  - [x] Verify StepByStepSolver submissions include timing based on real attempt data
- [x] Task: Guard non-student and non-practice contexts
  - [x] Ensure teaching/preview harnesses do not create student timing evidence
  - [x] Ensure guided mode behavior is explicit: either record timing or document why not
  - [x] Ensure timing does not block phase completion if submission timing is absent
- [x] Task: Conductor - Phase Completion Verification 'Activity Submission Integration' (Protocol in workflow.md)

## Phase 4: Persistence and Review Surfaces

- [x] Task: Update Convex submission validation and storage tests
  - [x] Test `submitActivity` accepts timing fields
  - [x] Test old submissions without timing still pass
  - [x] Test invalid timing is rejected before persistence (Note: Convex V validator doesn't enforce Zod-style refinements; client-side validation required)
- [x] Task: Persist timing on practice submissions
  - [x] Ensure `activity_submissions.submissionData` stores the canonical timing fields
  - [x] Do not add separate timing tables in this track unless required by validator limits
  - [x] Keep all persistence idempotent with existing submission flow
- [x] Task: Expose timing in review/debug surfaces
  - [x] Add a compact timing summary where submission evidence is displayed
  - [x] Show confidence and confidence reasons for developer/teacher review
  - [x] Avoid adding new gradebook metrics in this track
- [x] Task: Add backward compatibility safeguards
  - [x] Ensure teacher review handles submissions with no timing
  - [x] Ensure malformed legacy analytics timing is ignored rather than normalized silently
  - [x] Add a tech-debt note if any legacy submission schema remains unresolved
- [x] Task: Conductor - Phase Completion Verification 'Persistence and Review Surfaces' (Protocol in workflow.md) [checkpoint: 7c3d8e1]

## Phase 5: Verification, Documentation, and Handoff

- [x] Task: Run validation commands [6f8a2c3]
  - [x] Run focused practice contract/timing tests (65 passed)
  - [x] Run relevant activity submission tests (35 passed)
  - [x] Run `npm run lint` (passed)
  - [x] Run `npm run typecheck` or document known pre-existing failures (25 pre-existing errors in students.test.tsx and dashboard.test.ts)
- [x] Task: Update Conductor planning artifacts [e8f3c9a]
  - [x] Mark completed tasks and phases in this plan
  - [x] Update `conductor/tracks.md`
  - [x] Update `conductor/current_directive.md` if this becomes active work
- [ ] Task: Write junior developer handoff notes
  - [ ] Document how new activities should use timing
  - [ ] Document when timing confidence should be low
  - [ ] Document how future SRS tracks should consume timing
- [ ] Task: Conductor - Phase Completion Verification 'Verification, Documentation, and Handoff' (Protocol in workflow.md)
