# Project Tracks

This file tracks all major tracks for the project.

## Module 1 Roadmap

Tracks 1–10 deliver a complete Module 1 experience from both the student and teacher standpoint.
Dependencies flow left to right: Tracks 1+2 unlock Track 3; Track 4 unlocks Tracks 5+6+7;
Tracks 1+4 unlock Track 8; Track 8 unlocks Tracks 9+10.

## Active Tracks

- [x] **[URGENT] Fix: Promise Type Mismatch in PhaseCompleteButton.test.tsx** — **COMPLETED**
   *Verify TypeScript error resolved - no changes needed*
   *Link: [./conductor/tracks/fix-phase-complete-button-type_20260412/](./conductor/tracks/fix-phase-complete-button-type_20260412/)*

- [x] **[LOW] Fix: GraphingExplorer Test Type Errors** — **COMPLETED**
   *Fix 11 TypeScript errors - comparisonAnswer prop type mismatch in test fixtures*
   *Link: [./conductor/tracks/fix-graphing-test-types_20260412/](./conductor/tracks/fix-graphing-test-types_20260412/)*

- [x] **[URGENT] Fix: Type Error in graphing-explorer.schema.ts** — **COMPLETED**
   *Fix TypeScript error - parts array type inference issue*
   *Link: [./conductor/tracks/fix-graphing-schema-type_20260412/](./conductor/tracks/fix-graphing-schema-type_20260412/)*

- [x] **[URGENT] Fix: Zod Schema Type Errors in submission.schema.ts** — **COMPLETED**
   *Fix 3 TypeScript errors caused by incorrect z.record() usage in Zod 4.x*
   *Link: [./conductor/tracks/fix-submission-schema-types_20260412/](./conductor/tracks/fix-submission-schema-types_20260412/)*

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

- [x] **Track 5: Graphing Components**
   *graphing-explorer component — interactive coordinate plane in teaching/guided/practice modes*
   *Depends on: Tracks 2, 4*
   *Link: [./conductor/tracks/graphing-components_20260406/](./conductor/tracks/graphing-components_20260406/)*
   - Phase 1: Core Canvas [COMPLETE]
   - Phase 2: Guided Interaction Workflows [COMPLETE]
   - Phase 3: Problem Variant Types [COMPLETE]
   - Phase 4: Explore Mode & Submission (partial - Explore mode deferred) [COMPLETE]

- [x] **Track 5b: Graphing Explorer Explore Mode** (continuation of Track 5)
   *Implement Explore mode with parameter sliders for quadratic exploration in Explore phases*
   *Link: [./conductor/tracks/graphing-explore-mode_20260414/](./conductor/tracks/graphing-explore-mode_20260414/)*
   - Phase 1: Explore Mode with Parameter Sliders [COMPLETE]

- [x] **Track 6: Algebraic Worked-Example Components** — **COMPLETED**
  *step-by-step-solver — all 11 algebraic problem types in teaching/guided/practice modes*
  *Depends on: Tracks 2, 4*
  *Link: [./conductor/tracks/algebraic-examples_20260406/](./conductor/tracks/algebraic-examples_20260406/)*

- [x] **Track 7: Supporting Activity Components** — **COMPLETED**
   *comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer*
   *Depends on: Tracks 2, 4*
   *Link: [./conductor/tracks/supporting-activities_20260406/](./conductor/tracks/supporting-activities_20260406/)*
   - Phase 1: Comprehension Quiz [COMPLETE]
   - Phase 2: Fill-in-the-Blank [COMPLETE]
   - Phase 3: Rate-of-Change Calculator [COMPLETE]
   - Phase 4: Discriminant Analyzer [COMPLETE]

- [x] **Track 8: Module 1 Curriculum Seed**
   *All 8 lessons seeded with phases, sections, activities, standards, and demo environment*
   *Depends on: Tracks 1, 4 (activity keys must be defined before seeding)*
   *Link: [./conductor/tracks/module-1-seed_20260406/](./conductor/tracks/module-1-seed_20260406/)*
   - Phase 1: Infrastructure & Types [COMPLETE]
   - Phase 2: Lesson 1-7 Content Authoring [COMPLETE]
   - Phase 3: Standards & Demo Environment [COMPLETE]
   - Phase 4: Lesson Seeds 1-1 through 1-4 [COMPLETE]
   - Phase 5: Lesson Seeds 1-5 through 1-8 [COMPLETE]

- [x] **Track 9: Student Lesson Flow** [Phase 4 Complete]
   *End-to-end: dashboard → lesson → phases → activities → completion → progress persistence*
   *Depends on: Tracks 3, 5, 6, 7, 8*
   *Link: [./conductor/tracks/student-lesson-flow_20260406/](./conductor/tracks/student-lesson-flow_20260406/)*
   - Phase 1: Dashboard Enhancements [COMPLETE]
   - Phase 2: Lesson Entry & Phase Navigation [COMPLETE]
   - Phase 3: Activity Interaction & Submission Flow [COMPLETE]
   - Phase 4: Loading States, Completion & Polish [COMPLETE]

- [x] **Track 10: Teacher Module 1 Experience** — **COMPLETED**
   *Dashboard, gradebook, student detail, submission review, lesson preview, course overview*
   *Depends on: Tracks 3, 5, 6, 7, 8*
   *Link: [./conductor/tracks/teacher-module1_20260406/](./conductor/tracks/teacher-module1_20260406/)*
   - Phase 1: Teacher Dashboard [COMPLETE]
   - Phase 2: Gradebook [COMPLETE]
   - Phase 3: Student Detail View [COMPLETE]
   - Phase 4: Lesson Preview & Course Overview [COMPLETE]

 - [x] **Track: Curriculum Gap Remediation** — **COMPLETED**
   *Remediate curriculum completeness gaps across ALEKS extraction, lesson source quality, daily phase packaging, non-instruction day authoring, and practice.v1 activity mapping*
   *Link: [./conductor/tracks/curriculum-gap-remediation_20260411/](./conductor/tracks/curriculum-gap-remediation_20260411/)*

 - [x] **Track: Refactor — Extract Quadratic Regex** — **COMPLETED**
   *Extract duplicated quadratic regex from canvas-utils, HintPanel, InterceptIdentification to shared utility*
   *Link: [./conductor/tracks/extract-quadratic-regex_20260411/](./conductor/tracks/extract-quadratic-regex_20260411/)*

 - [x] **Track: Refactor — Extract Linear Regex** — **COMPLETED**
   *Extract duplicated linear regex from canvas-utils, InterceptIdentification to shared utility*
   *Link: [./conductor/tracks/extract-linear-regex_20260412/](./conductor/tracks/extract-linear-regex_20260412/)*

  - [x] **Track: Component Approval**
    *Developer-only approval workflow for example, activity, and practice components with structured review notes for later LLM audits*
    *Link: [./conductor/tracks/component-approval_20260413/](./conductor/tracks/component-approval_20260413/)*
    - Phase 3: Developer-Only Access Guard [COMPLETE]
    - Phase 4: Review Queue UI [COMPLETE]
    - Phase 5: Component Review Harnesses [COMPLETE]
    - Phase 6: End-to-End Verification and Documentation [COMPLETE]

- [x] **Track: Harden Manual Component Approval**
     *Complete trustworthy manual approval hardening: real example/practice queue coverage, deterministic hashes, harness-gated approval, and Convex integration tests*
     *Link: [./conductor/tracks/harden-manual-approval_20260415/](./conductor/tracks/harden-manual-approval_20260415/)*
     - Phase 1: Queue Coverage and Real Review Targets [COMPLETE]
     - Phase 2: Content Hashing and Stale Approval [COMPLETE]
     - Phase 3: Harness Data and Approval Gating [COMPLETE]
     - Phase 4: Convex Integration Coverage and Auth Boundaries [COMPLETE]
     - Phase 5: Documentation and Status Reconciliation [COMPLETE]

- [x] **Track: Reconcile Activity Schemas** — **COMPLETED**
   *Align Zod schemas for comprehension-quiz and fill-in-the-blank with actual component props (Critical — blocks curriculum authoring)*
   *Link: [./conductor/tracks/reconcile-activity-schemas_20260414/](./conductor/tracks/reconcile-activity-schemas_20260414/)*
   - Phase 1: ComprehensionQuiz Schema Reconciliation [COMPLETE]
   - Phase 2: FillInTheBlank Schema Reconciliation [COMPLETE]

- [x] **Track: Wire StepByStepSolverActivity to Real Props** — **COMPLETED**
   *Replace hardcoded steps with real props, wire onSubmit/onComplete, integrate distractors.ts (Priority 3)*
   *Link: [./conductor/tracks/wire-step-by-step-solver_20260414/](./conductor/tracks/wire-step-by-step-solver_20260414/)*
   - Phase 1: Prop Interface & Submission Wiring [COMPLETE]
   - Phase 2: Integrate distractors.ts into StepByStepper [COMPLETE]

 - [x] **Track: Phase Skip UI Wiring** — **COMPLETED**
    *Wire existing phase skip infrastructure to PhaseCompleteButton UI — show Skip button for explore and discourse phases*
    *Link: [./conductor/tracks/phase-skip-ui_20260414/](./conductor/tracks/phase-skip-ui_20260414/)*

- [x] **Track: Module 2 Curriculum Seed**
      *Seed Module 2 lessons (2-1 through 2-5) into Convex database following module-1-seed pattern*
      *Link: [./conductor/tracks/module-2-seed_20260415/](./conductor/tracks/module-2-seed_20260415/)*
      - Phase 1: Seed Lesson 2-1 (Polynomial Functions) [COMPLETE]
      - Phase 2: Seed Lesson 2-2 (Analyzing Graphs of Polynomial Functions) [COMPLETE]
      - Phase 3: Seed Lesson 2-3 (Operations with Polynomials) [COMPLETE]
      - Phase 4: Seed Lessons 2-4 and 2-5 [COMPLETE]
      - Phase 5: Update seed.ts and Verify [COMPLETE]

- [x] **Track: Module 3 Curriculum Seed**
        *Seed Module 3 polynomial equations lessons (3-1 through 3-5) into Convex database*
        *Link: [./conductor/tracks/module-3-seed_20260415/](./conductor/tracks/module-3-seed_20260415/)*
        - Phase 1: Seed Lesson 3-1 (Solving Polynomial Equations by Graphing) [COMPLETE]
        - Phase 2: Seed Lesson 3-2 (Solving Polynomial Equations Algebraically) [COMPLETE]
        - Phase 3: Seed Lesson 3-3 (Proving Polynomial Identities) [COMPLETE]
        - Phase 4: Seed Lesson 3-4 (The Remainder and Factor Theorems) [COMPLETE]
        - Phase 5: Seed Lesson 3-5 (Roots and Zeros) [COMPLETE]
        - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 4 Curriculum Seed**
      *Seed Module 4 inverses and radical functions lessons (4-1 through 4-6) into Convex database*
      *Link: [./conductor/tracks/module-4-seed_20260415/](./conductor/tracks/module-4-seed_20260415/)*
      - Phase 1: Seed Lesson 4-1 [COMPLETE]
      - Phase 2: Seed Lesson 4-2 [COMPLETE]
      - Phase 3: Seed Lesson 4-3 [COMPLETE]
      - Phase 4: Seed Lesson 4-4 [COMPLETE]
      - Phase 5: Seed Lesson 4-5 [COMPLETE]
      - Phase 6: Seed Lesson 4-6 [COMPLETE]
      - Phase 7: Module Integration and Verification [COMPLETE]

- [~] **Track: Module 5 Curriculum Seed**
      *Seed Module 5 exponential functions and geometric series lessons (5-1 through 5-5) into Convex database*
      *Link: [./conductor/tracks/module-5-seed_20260415/](./conductor/tracks/module-5-seed_20260415/)*
      - Phase 1: Seed Lesson 5-1 [COMPLETE]
      - Phase 2: Seed Lesson 5-2 [PENDING]
      - Phase 3: Seed Lesson 5-3 [PENDING]
      - Phase 4: Seed Lesson 5-4 [PENDING]
      - Phase 5: Seed Lesson 5-5 [PENDING]
      - Phase 6: Module Integration and Verification [PENDING]

- [ ] **Track: Module 6 Curriculum Seed**
     *Seed Module 6 logarithmic functions lessons (6-1 through 6-5) into Convex database*
     *Link: [./conductor/tracks/module-6-seed_20260415/](./conductor/tracks/module-6-seed_20260415/)*

- [ ] **Track: Module 7 Curriculum Seed**
     *Seed Module 7 rational functions and equations lessons (7-1 through 7-6) into Convex database*
     *Link: [./conductor/tracks/module-7-seed_20260415/](./conductor/tracks/module-7-seed_20260415/)*

- [ ] **Track: Module 8 Curriculum Seed**
     *Seed Module 8 inferential statistics lessons (8-1 through 8-5) into Convex database*
     *Link: [./conductor/tracks/module-8-seed_20260415/](./conductor/tracks/module-8-seed_20260415/)*

- [ ] **Track: Module 9 Curriculum Seed**
     *Seed Module 9 trigonometric functions lessons (9-1 through 9-7) into Convex database*
     *Link: [./conductor/tracks/module-9-seed_20260415/](./conductor/tracks/module-9-seed_20260415/)*

## Archived Tracks

- [x] **Track: Scaffold App Pages & Layouts**
  *Link: [./conductor/archive/scaffold-pages_20260405/](./conductor/archive/scaffold-pages_20260405/)*

- [x] **Track 2: E-Textbook Design System**
  *Link: [./conductor/archive/e-textbook-design_20260406/](./conductor/archive/e-textbook-design_20260406/)*
