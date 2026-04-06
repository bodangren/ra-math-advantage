# Specification — Teacher Module 1 Experience

## Context

The teacher pages (dashboard, gradebook, students, units) were stubbed in the scaffold-pages track. This track wires them to real Module 1 data and builds out the complete teacher workflow: monitoring class progress, drilling into individual students, reviewing submissions, and previewing lesson content.

The existing `lib/teacher/gradebook.ts` and `lib/teacher/course-overview.ts` logic should be usable with only minor adaptations for variable-length phases.

## Requirements

### Teacher Dashboard

1. **Class progress overview** — The teacher dashboard shows all students in the teacher's organization with:
   - Overall Module 1 completion percentage
   - Current lesson (last lesson the student touched)
   - Last active timestamp
   - At-a-glance status: on-track / behind / not-started

2. **Module filter** — Dropdown to filter the dashboard view by module (Module 1 only in scope now, but UI should anticipate multiple).

3. **Student quick-link** — Clicking a student row navigates to the Student Detail view.

### Gradebook

4. **Module 1 gradebook grid** — Shows a grid: rows = students, columns = lessons 1-1 through 1-8. Each cell shows the student's completion percentage for that lesson (phases completed / total phases).

5. **Cell color coding** — Uses the existing `lib/teacher/gradebook.ts` color computation logic (adapts to percentage-based rather than fixed phase count).

6. **Drill-down** — Clicking a cell navigates to the Student Detail view for that student, pre-scrolled to that lesson.

7. **Export** — CSV export of the gradebook grid (student name, lesson columns, percentage values).

### Student Detail View

8. **Per-lesson breakdown** — For a selected student, shows all 8 Module 1 lessons expanded with per-phase completion status (not started / in progress / completed / skipped).

9. **Activity submission review** — For any completed activity phase, shows a "Review" button. Clicking opens a panel showing:
   - The activity in `teaching` mode (full solution visible)
   - The student's actual submission (answers, hints used, step attempts)
   - Auto-generated error analysis (using existing `lib/practice/error-analysis/buildDeterministicSummary`)

10. **Progress timeline** — A visual timeline of when the student completed each phase (using `completedAt` timestamps from `student_progress`).

### Teacher Lesson Preview

11. **Lesson preview mode** — When a teacher navigates to `/student/lesson/[lessonSlug]` (or a dedicated `/teacher/lesson/[lessonSlug]` route), the lesson renders in `teaching` mode:
    - All steps in worked examples visible simultaneously
    - All activities in teaching mode (read-only, full solutions shown)
    - No phase completion tracking
    - A "Teacher Preview" badge in the header

12. **Phase-by-phase navigation** — Teacher can jump to any phase freely (no sequential lock).

### Course Overview

13. **Standards coverage map** — Shows which competency standards are covered by which lessons in Module 1. Based on `lib/teacher/course-overview.ts` `assembleCourseOverviewRows`.

14. **Lesson metadata panel** — For each lesson: learning objectives, vocabulary terms, estimated time, standards alignment, and phase sequence summary.

## Acceptance Criteria

1. Teacher dashboard shows all 5 demo students with correct Module 1 progress percentages
2. Gradebook renders 5×8 grid with correct cell values and color coding
3. CSV export produces correct data
4. Student detail shows all 8 lessons with per-phase status; matches `student_progress` records
5. Activity submission review shows student submission alongside correct solution
6. Error analysis summary rendered for completed practice submissions
7. Lesson preview opens in teaching mode; all steps/solutions visible; no completion tracking
8. Standards coverage map shows 6 Module 1 standards with lesson linkages
9. All teacher pages protected by `requireTeacherSessionClaims()`
10. All new components have unit tests; `npm run lint` and `npm run build` pass

## Out of Scope

- Real-time progress updates (polling is acceptable; WebSocket/Convex live queries deferred)
- Teacher content editing / CMS
- Grade input (teacher override scores)
- Modules 2-9 gradebook columns
