# Phase Skip UI Wiring — Implementation Plan

## Phase 1: Add phaseType prop to PhaseCompleteButton

- [ ] Task: Write unit tests for PhaseCompleteButton skip functionality
  - [ ] Test skip button visible only for skippable phaseTypes
  - [ ] Test skip button hidden for non-skippable phaseTypes
  - [ ] Test skip button calls skipPhaseRequest on click
  - [ ] Test onStatusChange fires with 'skipped' on successful skip
  - [ ] Test error handling when skip fails

- [ ] Task: Implement PhaseCompleteButton changes
  - [ ] Add `phaseType` prop (optional)
  - [ ] Add `skipLabel` prop for customization
  - [ ] Conditionally render Skip button for skippable phases
  - [ ] Wire skip click handler to skipPhaseRequest
  - [ ] Add 'skipped' status to ProgressStatus type
  - [ ] Update button UI for three-state display

- [ ] Task: Update LessonRenderer to pass phaseType
  - [ ] Pass activePhase.phaseType to PhaseCompleteButton
  - [ ] Verify existing functionality unchanged

## Phase 2: Verify and checkpoint

- [ ] Task: Run full test suite
- [ ] Task: Run lint and typecheck
- [ ] Task: Commit changes