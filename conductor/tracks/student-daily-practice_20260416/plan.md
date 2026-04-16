# Plan: Student Daily Practice

**Track ID:** `student-daily-practice_20260416`

---

## Phase 1: Daily Practice Page and Session Loading [checkpoint: 6b5ab71]

- [x] Task: Create `app/student/practice/page.tsx` server component
  - [x] Add auth guard using `requireStudentSessionClaims`
  - [x] Fetch active session or trigger new session creation via queue engine
  - [x] Render client-side practice session wrapper
  - [x] Handle redirect when no session available
- [x] Task: Create `components/student/PracticeSessionProvider.tsx` client component
  - [x] Manage session state (loading, active, complete, empty)
  - [x] Subscribe to queue items via `getDailyPracticeQuery`
  - [x] Track current card index
- [x] Task: Write page-level tests with mocked Convex
  - [x] Test auth redirect for unauthenticated users
  - [x] Test session loading with active session
  - [x] Test empty state when no cards due
- [x] Task: Conductor - Phase Completion Verification 'Daily Practice Page and Session Loading' (Protocol in workflow.md)

---

## Phase 2: Card Rendering and Activity Integration [checkpoint: d9d842e]

- [x] Task: Create `components/student/PracticeCardRenderer.tsx`
  - [x] Accept queue item and render via activity registry (`lib/activities/registry.ts`)
  - [x] Pass `ActivityComponentProps` (`activity`, `onSubmit`, `onComplete`)
  - [x] Wire `usePracticeTiming` hook for timing instrumentation
  - [x] Show card progress indicator (X of Y)
- [x] Task: Create `components/student/CardProgressBar.tsx`
  - [x] Display current card index and total count
  - [x] Accessible progress bar with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
  - [x] Responsive layout
- [x] Task: Write component tests
  - [x] Test card renders correct activity component from registry
  - [x] Test progress bar displays correct count
  - [x] Test timing accumulator starts on mount
- [x] Task: Conductor - Phase Completion Verification 'Card Rendering and Activity Integration' (Protocol in workflow.md)

---

## Phase 3: Submission and SRS Update Flow [checkpoint: b41dcc5]

- [x] Task: Implement `onSubmit` handler in `PracticeCardRenderer`
  - [x] Build `PracticeSubmissionEnvelope` with timing data from `TimingAccumulator`
  - [x] Submit to `activity_submissions` via Convex mutation
  - [x] Trigger SRS adapter (Track 6) to update card state
  - [x] Show brief feedback state (correct/incorrect) before advancing
- [x] Task: Create `components/student/SubmissionFeedback.tsx`
  - [x] Show correct/incorrect indicator (2-second display)
  - [x] Use `STUDENT_DAILY_PRACTICE_COPY` language (no speed rankings, no punitive language)
  - [x] Auto-advance to next card after feedback
- [x] Task: Write flow tests
  - [x] Test envelope construction includes timing data
  - [x] Test SRS adapter is called with correct parameters
  - [x] Test feedback displays then advances
  - [x] Test final card triggers completion instead of advance
- [x] Task: Conductor - Phase Completion Verification 'Submission and SRS Update Flow' (Protocol in workflow.md)

---

## Phase 4: Progress and Completion States

- [x] Task: Create `components/student/CompletionScreen.tsx`
  - [x] Show cards completed count
  - [x] Use `STUDENT_DAILY_PRACTICE_COPY` language ("All done for today! Come back tomorrow.")
  - [x] Include link back to student dashboard
  - [x] Responsive, accessible layout
- [x] Task: Create `components/student/EmptyPracticeState.tsx`
  - [x] Show "No practice due today. Come back tomorrow!"
  - [x] Include link back to student dashboard
  - [x] Use encouraging tone per Track 1 copy guidelines
- [x] Task: Update `PracticeSessionProvider` to handle completion and empty transitions
  - [x] Transition to completion state after last card
  - [x] Transition to empty state when queue returns zero items
- [x] Task: Write state tests
  - [x] Test completion screen renders after all cards answered
  - [x] Test empty state renders when no cards due
  - [x] Test copy text matches `STUDENT_DAILY_PRACTICE_COPY`
- [x] Task: Conductor - Phase Completion Verification 'Progress and Completion States' (Protocol in workflow.md)

---

## Phase 5: Dashboard Integration

- [ ] Task: Create `components/student/DailyPracticeCard.tsx` dashboard widget
  - [ ] Show items due today count
  - [ ] Show current streak
  - [ ] Show last practiced date
  - [ ] Link to `/student/practice`
- [ ] Task: Add `DailyPracticeCard` to student dashboard page (`app/student/dashboard/page.tsx`)
  - [ ] Fetch due count via Convex query
  - [ ] Place in dashboard layout alongside existing progress cards
- [ ] Task: Write dashboard integration tests
  - [ ] Test widget renders due count correctly
  - [ ] Test widget links to practice page
  - [ ] Test widget handles zero items due
- [ ] Task: Conductor - Phase Completion Verification 'Dashboard Integration' (Protocol in workflow.md)

---

## Phase 6: Verification and Handoff

- [ ] Task: Run full test suite and verify all tests pass
- [ ] Task: Run `npm run lint` and fix any issues
- [ ] Task: Verify accessibility (keyboard navigation, screen reader labels)
- [ ] Task: Verify responsive layout on mobile viewport
- [ ] Task: Update `conductor/tracks.md` with completion status
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
