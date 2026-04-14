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

- [x] Task: Implement Module 1 gradebook grid [954ecf7]
    - [x] Write tests: grid renders 5 student rows × 8 lesson columns; cells show correct percentages
    - [x] Write tests: cell color coding uses `lib/teacher/gradebook.ts` logic adapted for percentages
    - [x] Update `app/teacher/gradebook/page.tsx` with real data and grid component

- [x] Task: Implement gradebook cell drill-down navigation [954ecf7]
    - [x] Write tests: clicking a cell navigates to student detail pre-scrolled to that lesson
    - [x] Implement cell link and URL params for pre-scroll target

- [x] Task: Implement CSV export for gradebook [954ecf7]
    - [x] Write tests: CSV string contains correct headers and student data
    - [x] Implement `lib/teacher/gradebook-export.ts` `buildGradebookCsv()` function
    - [x] Add export button to gradebook page with download trigger

- [ ] Task: Conductor — Phase Completion Verification 'Gradebook' (Protocol in workflow.md)

## Phase 3: Student Detail View

- [x] Task: Implement per-lesson phase breakdown for student detail
    - [x] Write tests: shows all 8 lessons; each phase shows correct status (not_started/in_progress/completed/skipped)
    - [x] Write tests: pre-scroll to lesson from gradebook drill-down works
    - [x] Update `app/teacher/students/page.tsx` and student detail components
    - [checkpoint: 58f83c0]

- [x] Task: Implement activity submission review panel
    - [x] Write tests: "Review" button appears for completed activity phases
    - [x] Write tests: panel shows teaching-mode activity + student submission answers side by side
    - [x] Implement `SubmissionReviewPanel` component

- [x] Task: Implement error analysis display in review panel
    - [x] Write tests: `buildDeterministicSummary()` output rendered as readable summary
    - [x] Write tests: misconception tags shown per part; hints used count shown
    - [x] Integrate `lib/practice/error-analysis/` into submission review panel

- [x] Task: Implement progress timeline
    - [x] Write tests: timeline shows phases in chronological order with correct timestamps
    - [x] Implement `ProgressTimeline` component using `completedAt` data from Convex

- [ ] Task: Conductor — Phase Completion Verification 'Student Detail View' (Protocol in workflow.md)

## Phase 4: Lesson Preview & Course Overview

- [x] Task: Implement teacher lesson preview route [c294666]
    - [x] Write tests: teacher navigating to lesson renders in teaching mode (all steps revealed)
    - [x] Write tests: "Teacher Preview" badge visible; no phase completion buttons
    - [x] Create dedicated `/teacher/lesson/[lessonSlug]/page.tsx` with `getTeacherLessonPreview` Convex query

- [x] Task: Implement free phase navigation for teacher preview [c294666]
    - [x] Write tests: teacher can click any phase in stepper regardless of completion state
    - [x] All phases set to 'available' status in preview; LessonRenderer hides PhaseCompleteButton in teaching mode

- [x] Task: Implement standards coverage map [c294666]
    - [x] Write tests: renders standards × lesson linkage matrix
    - [x] Add `getStandardsCoverage` Convex query; update `app/teacher/units/page.tsx` with standards map

- [x] Task: Implement lesson metadata panel [c294666]
    - [x] Write tests: shows objectives, vocabulary, estimated time, standards, phase sequence summary
    - [x] Implement `LessonMetadataPanel` component; wire into units/course overview page

- [ ] Task: Conductor — Phase Completion Verification 'Lesson Preview & Course Overview' (Protocol in workflow.md)
