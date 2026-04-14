# Implementation Plan — Teacher Module 1 Experience

## Phase 1: Teacher Dashboard

- [x] Task: Wire teacher dashboard to real Module 1 student data
    - [x] Write tests: renders student list with correct completion %, current lesson, last active
    - [x] Write tests: "at-a-glance" status (on-track/behind/not-started) computed correctly
    - [x] Update `app/teacher/dashboard/page.tsx` to use `internal.teacher.getTeacherDashboardData`
    - [x] Update `lib/teacher/` dashboard view model for variable-phase lessons

- [x] Task: Implement module filter dropdown
    - [x] Write tests: filter by module updates displayed students correctly (Module 1 only for now)
    - [x] Implement filter in dashboard component

- [x] Task: Verify routing from student row to Student Detail view
    - [x] Write tests: clicking a student row navigates to `/teacher/students/[studentId]`
    - [x] Implement/verify link and route handler

- [ ] Task: Conductor — Phase Completion Verification 'Teacher Dashboard' (Protocol in workflow.md)

## Phase 2: Gradebook

- [ ] Task: Implement Module 1 gradebook grid
    - [ ] Write tests: grid renders 5 student rows × 8 lesson columns; cells show correct percentages
    - [ ] Write tests: cell color coding uses `lib/teacher/gradebook.ts` logic adapted for percentages
    - [ ] Update `app/teacher/gradebook/page.tsx` with real data and grid component

- [ ] Task: Implement gradebook cell drill-down navigation
    - [ ] Write tests: clicking a cell navigates to student detail pre-scrolled to that lesson
    - [ ] Implement cell link and URL params for pre-scroll target

- [ ] Task: Implement CSV export for gradebook
    - [ ] Write tests: CSV string contains correct headers and student data
    - [ ] Implement `lib/teacher/gradebook-export.ts` `buildGradebookCsv()` function
    - [ ] Add export button to gradebook page with download trigger

- [ ] Task: Conductor — Phase Completion Verification 'Gradebook' (Protocol in workflow.md)

## Phase 3: Student Detail View

- [ ] Task: Implement per-lesson phase breakdown for student detail
    - [ ] Write tests: shows all 8 lessons; each phase shows correct status (not_started/in_progress/completed/skipped)
    - [ ] Write tests: pre-scroll to lesson from gradebook drill-down works
    - [ ] Update `app/teacher/students/page.tsx` and student detail components

- [ ] Task: Implement activity submission review panel
    - [ ] Write tests: "Review" button appears for completed activity phases
    - [ ] Write tests: panel shows teaching-mode activity + student submission answers side by side
    - [ ] Implement `SubmissionReviewPanel` component

- [ ] Task: Implement error analysis display in review panel
    - [ ] Write tests: `buildDeterministicSummary()` output rendered as readable summary
    - [ ] Write tests: misconception tags shown per part; hints used count shown
    - [ ] Integrate `lib/practice/error-analysis/` into submission review panel

- [ ] Task: Implement progress timeline
    - [ ] Write tests: timeline shows phases in chronological order with correct timestamps
    - [ ] Implement `ProgressTimeline` component using `completedAt` data from Convex

- [ ] Task: Conductor — Phase Completion Verification 'Student Detail View' (Protocol in workflow.md)

## Phase 4: Lesson Preview & Course Overview

- [ ] Task: Implement teacher lesson preview route
    - [ ] Write tests: teacher navigating to lesson renders in teaching mode (all steps revealed)
    - [ ] Write tests: "Teacher Preview" badge visible; no phase completion buttons
    - [ ] Add teacher mode detection in `app/student/lesson/[lessonSlug]/page.tsx` or create dedicated `/teacher/lesson/[lessonSlug]/page.tsx`

- [ ] Task: Implement free phase navigation for teacher preview
    - [ ] Write tests: teacher can click any phase in stepper regardless of completion state
    - [ ] Override sequential lock when role is teacher

- [ ] Task: Implement standards coverage map
    - [ ] Write tests: renders 6 standards × lesson linkage matrix
    - [ ] Update `app/teacher/units/page.tsx` with `assembleCourseOverviewRows()` and standards map

- [ ] Task: Implement lesson metadata panel
    - [ ] Write tests: shows objectives, vocabulary, estimated time, standards, phase sequence summary
    - [ ] Implement `LessonMetadataPanel` component; wire into units/course overview page

- [ ] Task: Conductor — Phase Completion Verification 'Lesson Preview & Course Overview' (Protocol in workflow.md)
