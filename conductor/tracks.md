# Project Tracks

This file tracks all major tracks for the project.

## Module 1 Roadmap

Tracks 1–10 deliver a complete Module 1 experience from both the student and teacher standpoint.
Dependencies flow left to right: Tracks 1+2 unlock Track 3; Track 4 unlocks Tracks 5+6+7;
Tracks 1+4 unlock Track 8; Track 8 unlocks Tracks 9+10.

## Active Tracks

- [x] **[URGENT] Fix: Bundle Size - Reduce RSC Entry Chunk** — **COMPLETED**
   *Reduce Facade RSC entry chunk from 687 KB to under 500 KB via code-splitting*
   *Link: [./conductor/tracks/fix-bundle-size_20260411/](./conductor/tracks/fix-bundle-size_20260411/)*

- [x] **[URGENT] Fix: InterceptIdentification Test Failures** — **COMPLETED**
   *Fix 13/23 failing tests in InterceptIdentification component*
   *Link: [./conductor/tracks/fix-intercept-tests_20260411/](./conductor/tracks/fix-intercept-tests_20260411/)*

- [x] **[URGENT] Fix: Missing student_spreadsheet_responses Table** — **COMPLETED**
   *Add missing table to convex/schema.ts to resolve 38 TypeScript errors*
   *Link: [./conductor/tracks/fix-spreadsheet-table_20260408/](./conductor/tracks/fix-spreadsheet-table_20260408/)*

- [x] **Track 1: Flexible Phase Model** — **COMPLETED**
   *Replace hardcoded 6-phase assumptions with a typed, variable-length phase system*
   *Link: [./conductor/tracks/flexible-phase-model_20260406/](./conductor/tracks/flexible-phase-model_20260406/)*

  - [x] **Track: Scaffold Component Infrastructure** — **COMPLETED**
     *Create student, teacher, and dashboard component directories with basic infrastructure*
     *Link: [./conductor/tracks/scaffold-component-infrastructure_20260408/](./conductor/tracks/scaffold-component-infrastructure_20260408/)*


- [x] **Track 3: Lesson Rendering Engine** — **COMPLETED**
  *Port + adapt LessonStepper, PhaseRenderer, PhaseCompleteButton from bus-math-v2*
  *Depends on: Tracks 1, 2*
  *Link: [./conductor/archive/lesson-rendering_20260406/](./conductor/archive/lesson-rendering_20260406/)*

- [x] **Track 4: Activity Infrastructure** — **COMPLETED**
  *Registry, mode system, props schemas, submission pipeline, completion tracking*
  *Link: [./conductor/tracks/activity-infrastructure_20260406/](./conductor/tracks/activity-infrastructure_20260406/)*

- [ ] **Track 5: Graphing Components**
  *graphing-explorer component — interactive coordinate plane in teaching/guided/practice modes*
  *Depends on: Tracks 2, 4*
  *Link: [./conductor/tracks/graphing-components_20260406/](./conductor/tracks/graphing-components_20260406/)*

- [ ] **Track 6: Algebraic Worked-Example Components**
  *step-by-step-solver — all 11 algebraic problem types in teaching/guided/practice modes*
  *Depends on: Tracks 2, 4*
  *Link: [./conductor/tracks/algebraic-examples_20260406/](./conductor/tracks/algebraic-examples_20260406/)*

- [ ] **Track 7: Supporting Activity Components**
  *comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer*
  *Depends on: Tracks 2, 4*
  *Link: [./conductor/tracks/supporting-activities_20260406/](./conductor/tracks/supporting-activities_20260406/)*

- [ ] **Track 8: Module 1 Curriculum Seed**
  *All 8 lessons seeded with phases, sections, activities, standards, and demo environment*
  *Depends on: Tracks 1, 4 (activity keys must be defined before seeding)*
  *Link: [./conductor/tracks/module-1-seed_20260406/](./conductor/tracks/module-1-seed_20260406/)*

- [ ] **Track 9: Student Lesson Flow**
  *End-to-end: dashboard → lesson → phases → activities → completion → progress persistence*
  *Depends on: Tracks 3, 5, 6, 7, 8*
  *Link: [./conductor/tracks/student-lesson-flow_20260406/](./conductor/tracks/student-lesson-flow_20260406/)*

- [ ] **Track 10: Teacher Module 1 Experience**
  *Dashboard, gradebook, student detail, submission review, lesson preview, course overview*
  *Depends on: Tracks 3, 5, 6, 7, 8*
  *Link: [./conductor/tracks/teacher-module1_20260406/](./conductor/tracks/teacher-module1_20260406/)*

 - [x] **Track: Curriculum Gap Remediation** — **COMPLETED**
   *Remediate curriculum completeness gaps across ALEKS extraction, lesson source quality, daily phase packaging, non-instruction day authoring, and practice.v1 activity mapping*
   *Link: [./conductor/tracks/curriculum-gap-remediation_20260411/](./conductor/tracks/curriculum-gap-remediation_20260411/)*

 - [x] **Track: Refactor — Extract Quadratic Regex** — **COMPLETED**
   *Extract duplicated quadratic regex from canvas-utils, HintPanel, InterceptIdentification to shared utility*
   *Link: [./conductor/tracks/extract-quadratic-regex_20260411/](./conductor/tracks/extract-quadratic-regex_20260411/)*

 - [ ] **Track: Refactor — Extract Linear Regex**
   *Extract duplicated linear regex from canvas-utils, InterceptIdentification to shared utility*
   *Link: [./conductor/tracks/extract-linear-regex_20260412/](./conductor/tracks/extract-linear-regex_20260412/)*

## Archived Tracks

- [x] **Track: Scaffold App Pages & Layouts**
  *Link: [./conductor/archive/scaffold-pages_20260405/](./conductor/archive/scaffold-pages_20260405/)*

- [x] **Track 2: E-Textbook Design System**
  *Link: [./conductor/archive/e-textbook-design_20260406/](./conductor/archive/e-textbook-design_20260406/)*
