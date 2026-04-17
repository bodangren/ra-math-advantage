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

- [x] **Track: Module 5 Curriculum Seed**
      *Seed Module 5 exponential functions and geometric series lessons (5-1 through 5-5) into Convex database*
      *Link: [./conductor/tracks/module-5-seed_20260415/](./conductor/tracks/module-5-seed_20260415/)*
      - Phase 1: Seed Lesson 5-1 [COMPLETE]
      - Phase 2: Seed Lesson 5-2 [COMPLETE]
      - Phase 3: Seed Lesson 5-3 [COMPLETE]
      - Phase 4: Seed Lesson 5-4 [COMPLETE]
      - Phase 5: Seed Lesson 5-5 [COMPLETE]
      - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 6 Curriculum Seed** — **COMPLETED**
        *Seed Module 6 logarithmic functions lessons (6-1 through 6-5) into Convex database*
        *Link: [./conductor/tracks/module-6-seed_20260415/](./conductor/tracks/module-6-seed_20260415/)*
        - Phase 1: Seed Lesson 6-1 [COMPLETE]
        - Phase 2: Seed Lesson 6-2 [COMPLETE]
        - Phase 3: Seed Lesson 6-3 [COMPLETE]
        - Phase 4: Seed Lesson 6-4 [COMPLETE]
        - Phase 5: Seed Lesson 6-5 [COMPLETE]
        - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 7 Curriculum Seed**
      *Seed Module 7 rational functions and equations lessons (7-1 through 7-6) into Convex database*
      *Link: [./conductor/tracks/module-7-seed_20260415/](./conductor/tracks/module-7-seed_20260415/)*
      - Phase 1: Seed Lesson 7-1 [COMPLETE]
      - Phase 2: Seed Lesson 7-2 [COMPLETE]
      - Phase 3: Seed Lesson 7-3 [COMPLETE]
      - Phase 4: Seed Lesson 7-4 [COMPLETE]
      - Phase 5: Seed Lesson 7-5 [COMPLETE]
      - Phase 6: Seed Lesson 7-6 [COMPLETE]
      - Phase 7: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 8 Curriculum Seed**
      *Seed Module 8 inferential statistics lessons (8-1 through 8-5) into Convex database*
      *Link: [./conductor/tracks/module-8-seed_20260415/](./conductor/tracks/module-8-seed_20260415/)*
       - Phase 1: Seed Lesson 8-1 [COMPLETE]
       - Phase 2: Seed Lesson 8-2 [COMPLETE]
       - Phase 3: Seed Lesson 8-3 [COMPLETE]
       - Phase 4: Seed Lesson 8-4 [COMPLETE]
       - Phase 5: Seed Lesson 8-5 [COMPLETE]
       - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 9 Curriculum Seed**
        *Seed Module 9 trigonometric functions lessons (9-1 through 9-7) into Convex database*
        *Link: [./conductor/tracks/module-9-seed_20260415/](./conductor/tracks/module-9-seed_20260415/)*
        - Phase 1: Seed Lesson 9-1 [COMPLETE]
        - Phase 2: Seed Lesson 9-2 [COMPLETE]
        - Phase 3: Seed Lesson 9-3 [COMPLETE]
         - Phase 4: Seed Lesson 9-4 [COMPLETE]
         - Phase 5: Seed Lesson 9-5 [COMPLETE]
         - Phase 6: Seed Lesson 9-6 [COMPLETE]
         - Phase 7: Seed Lesson 9-7 [COMPLETE]
         - Phase 8: Module Integration and Verification [COMPLETE]

- [x] **Track: Practice Timing Telemetry** — **COMPLETED**
     *Add canonical wall-clock, active-time, idle-time, and timing-confidence evidence to practice.v1 submissions for future SRS scoring*
     *Depends on: Module 9 Curriculum Seed completion*
     *Link: [./conductor/tracks/practice-timing-telemetry_20260415/](./conductor/tracks/practice-timing-telemetry_20260415/)*
       - Phase 1: Canonical Contract and Schema Reconciliation [COMPLETE] [checkpoint: 790e2f5]
       - Phase 2: Reusable Timing Core and React Instrumentation [COMPLETE] [checkpoint: a973651]
       - Phase 3: Activity Submission Integration [COMPLETE] [checkpoint: 733bef3]
       - Phase 4: Persistence and Review Surfaces [COMPLETE] [checkpoint: 7c3d8e1]
       - Phase 5: Verification, Documentation, and Handoff [COMPLETE] [checkpoint: b210dce]

- [x] **Track: Practice Timing Baselines** — **COMPLETED**
        *Build timing baselines and time-aware SRS evidence features after reliable practice timing telemetry exists*
        *Depends on: Practice Timing Telemetry and stable practice problem-family identifiers*
        *Link: [./conductor/tracks/practice-timing-baselines_20260415/](./conductor/tracks/practice-timing-baselines_20260415/)
        - Phase 1: Baseline and Feature Model [COMPLETE]
        - Phase 2: Baseline Persistence and Aggregation [COMPLETE]
        - Phase 3: Time-Aware SRS Rating Adapter [COMPLETE]
        - Phase 4: Objective Proficiency and Fluency Signals [COMPLETE]
        - Phase 5: UI Integration, Validation, and Handoff [COMPLETE]

- [x] **Track: Fix submitReviewHandler componentKind Derivation**
      *Derive componentKind from placement.phaseType on write path to prevent permanent isStale mismatches*
      *Link: [./conductor/tracks/fix-submit-review-handler-component-kind_20260416/](./conductor/tracks/fix-submit-review-handler-component-kind_20260416/)*
      - Phase 1: Fix componentKind Derivation [COMPLETE]

- [x] **Track: CCSS Standards Seeding for M1-M5** — **COMPLETED**
      *Add missing CCSS standards to seed-standards.ts and build lesson_standards links for modules 1-5*
      *Link: [./conductor/tracks/ccss-standards-seeding-m1-m5_20260416/](./conductor/tracks/ccss-standards-seeding-m1-m5_20260416/)*
      - Phase 1: Analyze and Document Existing Standards Coverage [COMPLETE]
      - Phase 2: Add Missing CCSS Standards to seed-standards.ts [COMPLETE]
      - Phase 3: Add lesson_standards Links for M1-M5 [COMPLETE]
      - Phase 4: Wire Seeders into seed.ts Orchestration [COMPLETE]

## Daily Practice SRS Roadmap

Post-Module-9 tracks for daily practice, spaced repetition, objective proficiency, and reusable course-agnostic infrastructure. See `conductor/daily-practice-srs-roadmap.md` for the full roadmap with wave diagrams.

Implementation order: **Wave 0 done → Wave 1 (parallel) → Wave 2 → Wave 3 (parallel) → Wave 4 (sequential) → Wave 5.**

### Wave 0 — Completed

- [x] **Track 3: Practice Timing Telemetry** — **COMPLETED**
     *Link: [./conductor/tracks/practice-timing-telemetry_20260415/](./conductor/tracks/practice-timing-telemetry_20260415/)*

- [x] **Track 7: Practice Timing Baselines** — **COMPLETED**
     *Link: [./conductor/tracks/practice-timing-baselines_20260415/](./conductor/tracks/practice-timing-baselines_20260415/)*

### Wave 1 — Foundations (start immediately, 3 tracks in parallel)

- [x] **Track 1: Daily Practice SRS Product Contract** — **COMPLETED**
     *Consolidate existing types into canonical lib/srs/contract.ts; define card state, review log, session types; version as srs.contract.v1*
     *Link: [./conductor/tracks/srs-product-contract_20260416/](./conductor/tracks/srs-product-contract_20260416/)*

- [x] **Track 2: Reusable SRS Core Library**
         *FSRS scheduler wrapper, review processor bridging srs-rating.ts to card state, queue primitives, adapter interfaces*
         *Link: [./conductor/tracks/srs-core-library_20260416/](./conductor/tracks/srs-core-library_20260416/)*
         - Phase 1: FSRS Dependency and Scheduler Foundation [COMPLETE]
         - Phase 2: Review Processor [COMPLETE]
         - Phase 3: Queue Primitives [COMPLETE]
         - Phase 4: Adapter Interfaces [COMPLETE]
         - Phase 5: Verification and Handoff [COMPLETE]

- [x] **Track 4: Practice Item and Objective Blueprint Model** — **COMPLETED**
       *Map practice activities to problem families and objectives; assign objective policies; seed data for all 9 modules*
       *Link: [./conductor/tracks/practice-item-blueprint_20260416/](./conductor/tracks/practice-item-blueprint_20260416/)*
       - Phase 1: Type Definitions and Zod Schemas [COMPLETE]
       - Phase 2: Convex Schema Extension [COMPLETE]
       - Phase 3: Objective Policy Assignment [COMPLETE]
        - Phase 4: Seed Data for Modules 1-5 [COMPLETE]
        - Phase 5: Seed Data for Modules 6-9 and Validation [COMPLETE]
        - Phase 6: Verification and Handoff [COMPLETE]

### Wave 2 — Persistence (after Wave 1)

- [x] **Track 5: Convex SRS Schema and Review Log** — **COMPLETED**
       *Add srs_cards, srs_review_log, srs_sessions tables; implement CardStore/ReviewLogStore adapters backed by Convex*
       *Depends on: Wave 1 (Tracks 1, 2, 4)*
       *Link: [./conductor/tracks/convex-srs-schema_20260416/](./conductor/tracks/convex-srs-schema_20260416/)*
       - Phase 1: Convex Schema Definitions [COMPLETE] [checkpoint: 3073154]
       - Phase 2: CardStore Adapter [COMPLETE] [checkpoint: e0d54c7]
        - Phase 3: ReviewLogStore Adapter [COMPLETE] [checkpoint: aaa6c10]
        - Phase 4: Atomic Review Persistence [COMPLETE] [checkpoint: ae766e5]
        - Phase 5: Session Management [COMPLETE] [checkpoint: ed812e1]
        - Phase 6: Verification and Handoff [COMPLETE] [checkpoint: a6d3fa0]

### Wave 3 — Integration (after Wave 2, 2 tracks in parallel)

- [x] **Track 6: Submission-to-SRS Rating Adapter**
       *Wire practice.v1 submissions through srs-rating.ts to FSRS card state updates; handle first-seen items; integrate timing baselines*
       *Depends on: Wave 2 (Track 5)*
       *Link: [./conductor/tracks/submission-srs-adapter_20260416/](./conductor/tracks/submission-srs-adapter_20260416/)*
       - Phase 1: Adapter Interface Design [COMPLETE]
       - Phase 2: Problem Family Resolution [COMPLETE]
       - Phase 3: First-Seen Card Creation [COMPLETE]
       - Phase 4: Review Processing Pipeline [COMPLETE]
       - Phase 5: Convex Integration [COMPLETE]
       - Phase 6: Verification and Handoff [COMPLETE] [checkpoint: c9e6f7a]

- [x] **Track 8: Daily Practice Queue Engine** — **COMPLETE**
       *Query SRS cards from Convex; apply queue ordering with session limits; resolve items to activities; manage session lifecycle*
       *Depends on: Wave 2 (Track 5)*
       *Link: [./conductor/tracks/daily-practice-queue_20260416/](./conductor/tracks/daily-practice-queue_20260416/)*
        - Phase 1: Queue Query Implementation [COMPLETE]
        - Phase 2: Queue Item Resolution [COMPLETE]
        - Phase 3: Session Lifecycle [COMPLETE]
        - Phase 4: Session Config and Limits [COMPLETE]
        - Phase 5: Verification and Handoff [COMPLETE]

### Wave 4 — User-Facing (after Wave 3, sequential order: 10 → 9 → 11)

- [x] **Track 10: Objective Proficiency Measurement** — **COMPLETED**
       *Upgrade objective-proficiency.ts to use FSRS stability from card states; build aggregation pipeline; student/teacher proficiency queries*
       *Depends on: Wave 2 (Track 5)*
       *Link: [./conductor/tracks/objective-proficiency_20260416/](./conductor/tracks/objective-proficiency_20260416/)*
         - Phase 1: FSRS Stability Normalization [COMPLETE] [checkpoint: 2f6fe7b]
         - Phase 2: Card-to-Evidence Aggregation [COMPLETE] [checkpoint: 6f8d690]
         - Phase 3: Objective Proficiency Query [COMPLETE] [checkpoint: 3092c86]
         - Phase 4: Student and Teacher Views [COMPLETE] [checkpoint: 72934fc]
         - Phase 5: Verification and Handoff [COMPLETE]


- [x] **Track 9: Student Daily Practice Experience** — **COMPLETE**
          *Student daily practice page, session flow, card rendering with activity components, submission with timing, completion states*
          *Depends on: Tracks 6, 8 (Wave 3)*
          *Link: [./conductor/tracks/student-daily-practice_20260416/](./conductor/tracks/student-daily-practice_20260416/)*
           - Phase 1: Daily Practice Page and Session Loading [COMPLETE] [checkpoint: 6b5ab71]
           - Phase 2: Card Rendering and Activity Integration [COMPLETE] [checkpoint: d9d842e]
           - Phase 3: Submission and SRS Update Flow [COMPLETE] [checkpoint: b41dcc5]
           - Phase 4: Progress and Completion States [COMPLETE] [checkpoint: 7f3d2a1]
           - Phase 5: Dashboard Integration [COMPLETE] [checkpoint: f526aab]
           - Phase 6: Verification and Handoff [COMPLETE] [checkpoint: 33ff6e5]

- [x] **Track 11: Teacher SRS Dashboard and Interventions** — **COMPLETED**
       *Class health overview, weak objectives panel, struggling students, misconception diagnostics, basic interventions*
       *Depends on: Track 10 (Wave 4)*
       *Link: [./conductor/tracks/teacher-srs-dashboard_20260416/](./conductor/tracks/teacher-srs-dashboard_20260416/)*
        - Phase 1: Class Health Queries [COMPLETE]
        - Phase 2: Weak Objectives and Struggling Students [COMPLETE]
        - Phase 3: Misconception Diagnostics [COMPLETE]
        - Phase 4: Intervention Mutations [COMPLETE] [checkpoint: 6bff97a]
        - Phase 5: Dashboard UI Components [COMPLETE] [checkpoint: 3e975bc]
        - Phase 6: Verification and Handoff [COMPLETE]


### Wave 5 — Polish (after Wave 4)

- [x] **Track 12: Cross-Course Extraction and Developer Docs** — **COMPLETED**
        *Boundary audit, interface documentation, integration guide (INTEGRATION.md), adapter verification*
        *Depends on: All tracks 1-11*
        *Link: [./conductor/tracks/cross-course-extraction_20260416/](./conductor/tracks/cross-course-extraction_20260416/)*
         - Phase 1: Boundary Audit [COMPLETE] [checkpoint: d3475cd]
         - Phase 2: Interface Documentation [COMPLETE] [checkpoint: ad4afe8]
         - Phase 3: Integration Guide [COMPLETE] [checkpoint: e76b1b3]
         - Phase 4: Adapter Verification [COMPLETE] [checkpoint: 91aa23b]
         - Phase 5: Verification and Handoff [COMPLETE]

- [x] **Track: Error Analysis Unit Tests**
      *Add unit tests for error-analysis module — 8 untested exported functions with aggregation logic*
      *Link: [./conductor/tracks/error-analysis-unit-tests_20260416/](./conductor/tracks/error-analysis-unit-tests_20260416/)*
      - Phase 1: Test Infrastructure and Authorization Tests [COMPLETE]
      - Phase 2: Aggregation Function Tests [COMPLETE]
      - Phase 3: Summary Assembly and View Builder Tests [COMPLETE]
      - Phase 4: Verification [COMPLETE]

- [x] **Track: SRS Queue Performance Fixes** — **COMPLETED**
       *Fix critical N+1 query patterns in SRS daily practice queue: batch policy resolution, bulk practice item and activity lookups, and bound unbounded card collection*
       *Link: [./conductor/tracks/srs-queue-performance_20260417/](./conductor/tracks/srs-queue-performance_20260417/)*
       - Phase 1: Batch Queue Resolution and Bound Card Queries [COMPLETE]
       - Phase 2: Verification and Handoff [COMPLETE]

- [x] **Track: PracticeSessionProvider sessionId Fix** — **COMPLETED**
       *Fix PracticeSessionProvider to send sessionId with completion, preventing wrong-session completion race conditions*
       *Link: [./conductor/tracks/practice-session-provider-sessionid_20260417/](./conductor/tracks/practice-session-provider-sessionid_20260417/)*
       - Phase 1: Wire sessionId Through Completion Flow [COMPLETE]

## BM2 Alignment Tracks

Tracks ported from `bus-math-v2` per the BM2 Alignment Report. Ordered by recommended implementation wave.

### Wave A — Quick Wins (start now)

- [x] **Track: Security & Auth Hardening** — **COMPLETED**
     *Port fail-closed auth guards, Convex-layer authorization, credential revocation, middleware role checks from bus-math-v2*
     *Link: [./conductor/tracks/security-auth-hardening_20260416/](./conductor/tracks/security-auth-hardening_20260416/)*

- [x] **Track: Cloudflare CI/CD Hardening** — **COMPLETED**
     *Port GitHub Actions pipeline with lint/test/build gates, Cloudflare Workers deployment, concurrency control*
     *Link: [./conductor/tracks/ci-cd-hardening_20260416/](./conductor/tracks/ci-cd-hardening_20260416/)*

### Wave B — High-Value Classroom Features (after SRS Wave 1)

- [x] **Track: Practice Test Engine** — **COMPLETED**
      *Port 6-phase test runner, question banks for M1-M9, score persistence, post-answer feedback, test selection UI*
      *Link: [./conductor/tracks/practice-test-engine_20260416/](./conductor/tracks/practice-test-engine_20260416/)*
      - Phase 1: Data Structures and Question Banks [COMPLETE]
      - Phase 2: Convex Schema and Persistence [COMPLETE]
      - Phase 3: Test Engine UI [COMPLETE] [checkpoint: fd61fbf]

- [x] **Track: Teacher Gradebook & Competency Heatmaps**
       *Port course overview grid, unit gradebook, competency heatmaps with CCSS standards, submission detail modal, reporting drill-down IA*
       *Link: [./conductor/tracks/teacher-gradebook-heatmaps_20260416/](./conductor/tracks/teacher-gradebook-heatmaps_20260416/)*
       - Phase 1: Pure Logic — Gradebook and Overview [COMPLETE] [checkpoint: 074cee1]
       - Phase 2: Convex Queries for Reporting [COMPLETE] [checkpoint: e753143]
       - Phase 3: UI Components [COMPLETE] [checkpoint: 47afac5]
       - Phase 4: Competency Heatmaps [COMPLETE] [checkpoint: 33a9cf5]

### Wave C — Student Engagement (after SRS Wave 3)

- [x] **Track: Student Study Hub — Flashcards & SRS Review**
       *Port BaseReviewSession, FlashcardPlayer, ReviewSession with FSRS scheduling, IM3 glossary, term mastery tracking*
       *Link: [./conductor/tracks/study-hub-flashcards_20260416/](./conductor/tracks/study-hub-flashcards_20260416/)*
        - Phase 1: Glossary and SRS Core [COMPLETE] [checkpoint: 7902acf]
        - Phase 2: Convex Tables and Mutations [COMPLETE] [checkpoint: b3e8ccd]
        - Phase 3: UI Components and Routes [COMPLETE] [checkpoint: 47afac5]

- [x] **Track: Student Study Hub — Matching & Speed Round Games**
      *Port click-based matching game and timed speed round game, reusing IM3 glossary*
      *Link: [./conductor/tracks/study-hub-games_20260416/](./conductor/tracks/study-hub-games_20260416/)*

### Wave D — Differentiators (after core features stable)

- [ ] **Track: AI Tutoring — Lesson Chatbot**
     *Port floating one-shot Q&A widget, OpenRouter integration, rate limiting, lesson context assembly*
     *Link: [./conductor/tracks/ai-chatbot_20260416/](./conductor/tracks/ai-chatbot_20260416/)*

- [ ] **Track: Workbook System & Artifact Pipeline**
     *Port build-time manifest generation, client/server workbook resolution, download routes with auth, UI integration*
     *Link: [./conductor/tracks/workbook-system_20260416/](./conductor/tracks/workbook-system_20260416/)*

## Archived Tracks

- [x] **Track: Scaffold App Pages & Layouts**
  *Link: [./conductor/archive/scaffold-pages_20260405/](./conductor/archive/scaffold-pages_20260405/)*

- [x] **Track 2: E-Textbook Design System**
  *Link: [./conductor/archive/e-textbook-design_20260406/](./conductor/archive/e-textbook-design_20260406/)*
