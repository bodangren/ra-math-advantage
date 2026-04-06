# Implementation Plan — Student Lesson Flow

## Phase 1: Dashboard Enhancements

- [ ] Task: Update student dashboard to show Module 1 with lesson cards and progress
    - [ ] Write tests: renders 8 lesson cards with correct titles, progress bars, locked/unlocked state
    - [ ] Write tests: estimated time shown per lesson from phase `estimatedMinutes` sum
    - [ ] Update `app/student/dashboard/page.tsx` and `lib/student/dashboard.ts` view model

- [ ] Task: Implement lesson lock/unlock logic
    - [ ] Write tests: lesson 1-2 locked until lesson 1-1 assessment phase complete
    - [ ] Write tests: lesson 1-1 always unlocked (first lesson)
    - [ ] Implement `isLessonUnlocked()` in `lib/student/dashboard.ts`

- [ ] Task: Implement "Continue" smart navigation
    - [ ] Write tests: no progress → points to lesson 1-1 phase 1
    - [ ] Write tests: partial progress → points to first incomplete phase of current lesson
    - [ ] Write tests: all Module 1 complete → points to completion summary
    - [ ] Update `buildStudentDashboardViewModel()` to include `continueUrl`

- [ ] Task: Conductor — Phase Completion Verification 'Dashboard Enhancements' (Protocol in workflow.md)

## Phase 2: Lesson Entry & Phase Navigation

- [ ] Task: Verify and harden `resolveLessonLandingPhase()` for all scenarios
    - [ ] Write tests: fresh start → phase 1; returning → first incomplete phase; all done → last phase
    - [ ] Write tests: handles skippable phase gaps correctly (student skipped phase 3, returns to phase 3)
    - [ ] Fix any edge cases in `lib/student/lesson-runtime.ts`

- [ ] Task: Implement phase skip behavior
    - [ ] Write tests: explore/discourse phases allow skip; assessment/independent_practice do not
    - [ ] Write tests: skipped phase recorded in progress as `status: 'skipped'`
    - [ ] Add `isSkippable` flag handling to `PhaseCompleteButton` and progress schema

- [ ] Task: Update Convex student queries to return full phase content + activity records
    - [ ] Write tests: query returns phases with sections, activities, and completion status
    - [ ] Update `convex/student.ts` `getLessonWithContent` to include activity data

- [ ] Task: Conductor — Phase Completion Verification 'Lesson Entry & Navigation' (Protocol in workflow.md)

## Phase 3: Activity Interaction & Submission Flow

- [ ] Task: Wire activity submission through the full pipeline
    - [ ] Write integration tests: activity submit → `/api/activities/submit` → Convex → completion flag
    - [ ] Write tests: optimistic UI update on submit; revert on error
    - [ ] Connect `onSubmit` callback from `ActivityRenderer` through to API route

- [ ] Task: Implement phase completion gating from activity completions
    - [ ] Write tests: single-activity phase → PhaseCompleteButton enabled after activity submit
    - [ ] Write tests: multi-activity phase → button enabled only after all required activities complete
    - [ ] Implement `PhaseActivityTracker` state in lesson renderer

- [ ] Task: Wire `PhaseCompleteButton` to phase completion API and stepper
    - [ ] Write integration tests: button click → POST `/api/phases/complete` → stepper dot updates → auto-advance
    - [ ] Implement phase advance animation (smooth transition between phases)

- [ ] Task: Implement failed submission recovery
    - [ ] Write tests: network failure on submit → error state shown; retry button works; work not lost
    - [ ] Implement local submission buffer with retry logic

- [ ] Task: Conductor — Phase Completion Verification 'Activity Interaction & Submission' (Protocol in workflow.md)

## Phase 4: Loading States, Completion, & Polish

- [ ] Task: Implement skeleton screens for lesson and activity loading
    - [ ] Write tests: skeleton shown during lesson data fetch; replaced by content on load
    - [ ] Implement `LessonSkeleton` and `ActivitySkeleton` components

- [ ] Task: Implement lesson completion screen
    - [ ] Write tests: shown after final assessment phase completes in any lesson; shows score summary
    - [ ] Implement `LessonCompleteScreen` component; wire into lesson renderer

- [ ] Task: Implement Module 1 completion screen
    - [ ] Write tests: shown when all 8 lessons complete; links to dashboard
    - [ ] Implement `ModuleCompleteScreen` component

- [ ] Task: End-to-end flow verification with seeded data
    - [ ] Login as `student1@demo` (0% progress) — verify can reach lesson 1-1
    - [ ] Login as `student5@demo` (100% lesson 1-1) — verify lesson 1-2 is unlocked
    - [ ] Complete a phase as student1; verify dashboard progress updates

- [ ] Task: Conductor — Phase Completion Verification 'Loading States & Polish' (Protocol in workflow.md)
