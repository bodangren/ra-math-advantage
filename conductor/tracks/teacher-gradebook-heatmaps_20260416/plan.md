# Implementation Plan: Teacher Gradebook & Competency Heatmaps

## Phase 1: Pure Logic — Gradebook and Overview

### Tasks

- [x] **Task: Port gradebook pure logic**
  - [x] Write unit tests for `assembleGradebookRows`, `computeCellColor`, `computeLessonStatus`, `buildGradebookCell` in `__tests__/lib/teacher/gradebook.test.ts`
  - [x] Implement `lib/teacher/gradebook.ts` adapted for IM3 module/lesson schema (moduleNumber instead of unitNumber)

- [x] **Task: Port course overview pure logic**
  - [x] Write unit tests for `assembleCourseOverviewRows` in `__tests__/lib/teacher/course-overview.test.ts`
  - [x] Implement `lib/teacher/course-overview.ts` with per-module average mastery aggregation

- [x] **Task: Port color system and accessibility helpers**
  - [x] Write tests for `computeCellColor`, `cellBgClass`, `cellColorLabel` covering all 4 color states + edge cases
  - [x] Color helpers implemented in `lib/teacher/gradebook.ts` (cellBgClass, cellColorLabel)
  - [x] Verify WCAG AA contrast for all color combinations

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** [checkpoint: 074cee1]

## Phase 2: Convex Queries for Reporting [checkpoint: pending]

### Tasks

- [x] **Task: Implement course overview query**
  - [x] Write tests for `getTeacherCourseOverviewData` covering student list, progress aggregation, module mastery
  - [x] Implement in `convex/teacher.ts` using existing progress tables + lesson_standards

- [x] **Task: Implement unit gradebook query**
  - [x] Write tests for `getTeacherGradebookData` covering per-lesson status, mastery, IP/assessment badges
  - [x] Implement query with phase-level → lesson-level status aggregation

- [x] **Task: Implement submission detail query**
  - [x] Write tests for `getSubmissionDetail` covering phase evidence, practice evidence, score computation
  - [x] Implement query joining activity_submissions, activity_completions, and phase data

- [x] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: UI Components

### Tasks

- [ ] **Task: Implement CourseOverviewGrid component**
  - [ ] Write component tests for grid rendering, cell coloring, sorting, navigation links
  - [ ] Implement `CourseOverviewGrid.tsx` with sticky name column and sort controls

- [ ] **Task: Implement GradebookGrid component**
  - [ ] Write component tests for cell rendering, badge overlays, click-to-modal, lesson navigation
  - [ ] Implement `GradebookGrid.tsx` with cell click handler opening SubmissionDetailModal

- [ ] **Task: Implement SubmissionDetailModal component**
  - [ ] Write component tests for modal open/close, evidence display, mode filter tabs
  - [ ] Implement `SubmissionDetailModal.tsx` with phase-by-phase evidence cards, practice evidence rendering, misconception tags

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

## Phase 4: Competency Heatmaps

### Tasks

- [ ] **Task: Port competency heatmap pure logic**
  - [ ] Write tests for `assembleCompetencyHeatmapRows`, `assembleStudentCompetencyDetail`, `computeCompetencyColor`
  - [ ] Implement `lib/teacher/competency-heatmap.ts` using CCSS standards from seed-standards.ts

- [ ] **Task: Implement Convex queries for competency data**
  - [ ] Write tests for `getTeacherCompetencyHeatmapData` and `getTeacherStudentCompetencyDetail`
  - [ ] Implement queries joining lesson_standards, student progress, and competency data

- [ ] **Task: Implement heatmap UI components**
  - [ ] Write component tests for CompetencyHeatmapGrid and StudentCompetencyDetailGrid
  - [ ] Implement `CompetencyHeatmapGrid.tsx` (students × standards table)
  - [ ] Implement `StudentCompetencyDetailGrid.tsx` (single student drill-down)

- [ ] **Task: Create route pages and breadcrumb navigation**
  - [ ] Create `/teacher/gradebook`, `/teacher/units/[moduleNumber]`, `/teacher/units/[moduleNumber]/lessons/[lessonId]` pages
  - [ ] Create `/teacher/competency` and `/teacher/students/[studentId]/competency` pages
  - [ ] Implement shared breadcrumb component with ChevronLeft navigation

- [ ] **Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)**
