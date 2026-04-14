# Phase Skip UI Wiring — Specification

## Overview

Wire the existing phase skip infrastructure to the PhaseCompleteButton UI. The skip mutation and isSkippable() helper already exist; only the button UI needs to be added.

## Functional Requirements

1. **PhaseCompleteButton** receives `phaseType` prop
2. **Skip visibility**: When `isSkippable(phaseType) === true`, show a "Skip" option alongside "Mark Complete"
3. **Skip behavior**: Clicking "Skip" calls `skipPhaseRequest` and transitions phase to 'skipped' status
4. **UX states**: Three states — `not_started` (Mark Complete | Skip), `completed` (Completed), `skipped` (Skipped)
5. **Propagation**: `onStatusChange` fires with `'skipped'` status when skip succeeds
6. **LessonRenderer** passes `phaseType` to PhaseCompleteButton

## Non-Functional Requirements

- Maintain existing button styling and accessibility
- No breaking changes to existing PhaseCompleteButton API
- Skippable phases: 'explore' and 'discourse' (defined in SKIPPABLE_PHASE_TYPES)

## Acceptance Criteria

- [ ] PhaseCompleteButton accepts optional `phaseType` prop
- [ ] Skip button appears only for skippable phase types
- [ ] Clicking Skip calls skipPhaseRequest with correct payload
- [ ] Status transitions to 'skipped' on successful skip
- [ ] onStatusChange callback fires with 'skipped' status
- [ ] Tests cover skip button visibility and click behavior
- [ ] No TypeScript errors, lint passes

## Out of Scope

- Backend skip mutation (already exists)
- Schema changes (already has 'skipped' status)
- isSkippable() function (already exists)