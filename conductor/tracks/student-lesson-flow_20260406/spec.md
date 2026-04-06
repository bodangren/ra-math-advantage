# Specification — Student Lesson Flow

## Context

By this point in the project, all the individual pieces exist: the schema, the page stubs, the design system, the lesson renderer, the activity components, and the seed data. This track wires everything together into a coherent, polished student experience for Module 1. The goal is a production-quality flow where a student can log in, see their progress, navigate to a lesson, work through all phases, complete activities, and have their progress correctly tracked and persisted.

## Requirements

### Student Dashboard (Module 1)

1. **Module 1 progress card** — The dashboard must show Module 1 with 8 lessons, each with a progress bar reflecting how many phases have been completed. Lessons locked until the prior lesson's required phases are complete (configurable — default: assessment phase must be complete to unlock next lesson).

2. **"Continue" smart navigation** — The "Next Lesson" card on the dashboard points to:
   - The first incomplete lesson if student is just starting
   - The current in-progress lesson, landing on the last incomplete phase
   - If all Module 1 lessons complete: a module completion summary screen

3. **Lesson cards** — Each lesson in the Module 1 section shows:
   - Lesson number and title
   - Phase completion indicator (e.g., "6 of 12 phases complete")
   - Locked/unlocked state with visual treatment
   - Estimated time (derived from sum of `estimatedMinutes` on phases)

### Lesson Entry & Navigation

4. **Lesson landing** — When a student opens a lesson, `resolveLessonLandingPhase()` determines the correct starting phase. If starting fresh, land on phase 1 (explore). If returning, land on the first incomplete phase.

5. **Phase navigation** — Students move through phases sequentially. Moving to a later phase requires the current phase to be completed (or explicitly skipped — explore phases are skippable; assessment phases are not).

6. **Phase skip behavior** — Explore and discourse phases can be marked "skippable" in the phase config. Assessment and independent_practice phases cannot be skipped.

7. **Progress indicator** — Sticky progress bar at the top of the lesson showing X/N phases complete. Phase dots in the stepper show completed (check), in-progress (current), and locked (future) states.

### Activity Interaction Flow

8. **Activity lifecycle within a phase**:
   - Phase loads → activity renders in correct mode (resolved by `resolveActivityMode`)
   - Student interacts with activity
   - Student submits → envelope posted to `/api/activities/submit`
   - Success response → activity shows completion state
   - If activity is the last/only required activity in the phase → `PhaseCompleteButton` becomes enabled

9. **Multiple activities in a phase** — Some phases may have more than one activity (e.g., a worked example phase with an explore activity followed by a fill-in check). All required activities must be completed before the phase can be marked complete.

10. **Optimistic updates** — Activity completion and phase completion should update the UI optimistically while the server request is in flight. Revert on error.

### Phase Completion

11. **`PhaseCompleteButton` behavior** — Shows "Complete Phase" when all required activities are done. On click: POST to `/api/phases/complete`, update `student_progress` record, update phase dot in stepper to completed, auto-advance to next phase with a brief transition animation.

12. **Completion persistence** — Phase completions are idempotent (the existing `/api/phases/complete` route already handles this). On page reload, the student returns to the same position.

### Error & Loading States

13. **Loading states** — Skeleton screens for lesson load, phase transition, and activity load. No layout shift.

14. **Error states** — If a phase fails to load or an activity submission fails, show an inline error with a retry option. Never lose student work (buffer failed submissions in local state).

### Lesson Completion

15. **Module 1 completion** — After completing the assessment phase of lesson 1-8, the student sees a lesson completion screen with a summary (score, phases completed, time spent). Dashboard updates to show 100% for lesson 1-8.

## Acceptance Criteria

1. Dashboard shows correct Module 1 progress for a student with partial completion (verified against seeded data)
2. "Continue" button navigates to the correct lesson and phase
3. Lesson page loads with correct starting phase for a new and a returning student
4. Phase navigation: completing a phase enables the next; skippable phases can be skipped
5. Activity submission posts correct envelope; Convex records persist
6. Phase completion triggers stepper update and auto-advance
7. Page reload restores student to last position with correct completion state
8. Loading skeletons visible during data fetches; no layout shift
9. Failed submissions show retry option; student work not lost
10. Lesson 1-8 assessment completion shows completion screen
11. All new UI paths covered by integration tests
12. `npm run lint` and `npm run build` pass

## Out of Scope

- Teacher-facing progress visibility (Track 10)
- Retake logic / score cap at 85%
- Notifications or reminders
