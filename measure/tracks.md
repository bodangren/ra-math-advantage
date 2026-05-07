# Project Tracks

This file tracks all major tracks for the project.

## Module 1 Roadmap

Tracks 1–10 deliver a complete Module 1 experience from both the student and teacher standpoint.
Dependencies flow left to right: Tracks 1+2 unlock Track 3; Track 4 unlocks Tracks 5+6+7;
Tracks 1+4 unlock Track 8; Track 8 unlocks Tracks 9+10.

## Active Tracks

- [ ] **Track: Practice Worksheet Example Import**
   *Extract IM1, IM2, and IM3 Practice Worksheet Student Bundles into structured worked-example descriptions for reusable React worked, guided, and independent practice components*
   *Link: [./measure/tracks/practice-worksheet-example-import_20260507/](./measure/tracks/practice-worksheet-example-import_20260507/)*

- [x] **Track: Fix Pre-existing Lint Errors Across All Apps**
   *Fix lint errors in all 5 apps and add CI lint gates for IM1, IM2, and PreCalc*
   *Link: [./measure/archive/fix-lint-errors_20260505/](./measure/archive/fix-lint-errors_20260505/)*

- [ ] **Track: Review Remediation — 2026-05-05 Daily Work**
   *Remediate issues found during Measure review: dead import in seed_lesson_standards.ts, SRS validator structural drift, missing drift detection, missing checkpoints, as never anti-pattern*
   *Link: [./measure/tracks/review-remediation_20260505/](./measure/tracks/review-remediation_20260505/)*

- [x] **Track: Review Remediation — 2026-05-04 Daily Work**
   *Remediate issues found during Measure review: failing accessibility tests, code duplication drift risk, partial schema compliance, seed-file type regression, under-documented validation gaps*
   *Link: [./measure/archive/review-remediation_20260504/](./measure/archive/review-remediation_20260504/)*

- [x] **Track: BM2 Deactivated-User Access**
   *Swap JWT-only auth for active-credential verification on all 10 BM2 API endpoints to revoke access on deactivation*
   *Link: [./measure/archive/bm2-deactivated-user-access_20260423/](./measure/archive/bm2-deactivated-user-access_20260423/)*
    - Phase 1: Swap Auth Helpers and Update Tests [x] (review-20: added workbooks + pdfs routes missed in initial sweep)

- [x] **[URGENT] Fix: Promise Type Mismatch in PhaseCompleteButton.test.tsx** — **COMPLETED**
   *Verify TypeScript error resolved - no changes needed*
   *Link: [./measure/tracks/fix-phase-complete-button-type_20260412/](./measure/tracks/fix-phase-complete-button-type_20260412/)*

- [x] **[LOW] Fix: GraphingExplorer Test Type Errors** — **COMPLETED**
   *Fix 11 TypeScript errors - comparisonAnswer prop type mismatch in test fixtures*
   *Link: [./measure/tracks/fix-graphing-test-types_20260412/](./measure/tracks/fix-graphing-test-types_20260412/)*

- [x] **[URGENT] Fix: Type Error in graphing-explorer.schema.ts** — **COMPLETED**
   *Fix TypeScript error - parts array type inference issue*
   *Link: [./measure/tracks/fix-graphing-schema-type_20260412/](./measure/tracks/fix-graphing-schema-type_20260412/)*

- [x] **[URGENT] Fix: Zod Schema Type Errors in submission.schema.ts** — **COMPLETED**
   *Fix 3 TypeScript errors caused by incorrect z.record() usage in Zod 4.x*
   *Link: [./measure/tracks/fix-submission-schema-types_20260412/](./measure/tracks/fix-submission-schema-types_20260412/)*

- [x] **[URGENT] Fix: Bundle Size - Reduce RSC Entry Chunk** — **COMPLETED**
   *Reduce Facade RSC entry chunk from 687 KB to under 500 KB via code-splitting*
   *Link: [./measure/tracks/fix-bundle-size_20260411/](./measure/tracks/fix-bundle-size_20260411/)*

- [x] **[URGENT] Fix: InterceptIdentification Test Failures** — **COMPLETED**
   *Fix 13/23 failing tests in InterceptIdentification component*
   *Link: [./measure/tracks/fix-intercept-tests_20260411/](./measure/tracks/fix-intercept-tests_20260411/)*

- [x] **[URGENT] Fix: Missing student_spreadsheet_responses Table** — **COMPLETED**
   *Add missing table to convex/schema.ts to resolve 38 TypeScript errors*
   *Link: [./measure/tracks/fix-spreadsheet-table_20260408/](./measure/tracks/fix-spreadsheet-table_20260408/)*

- [x] **Track 1: Flexible Phase Model** — **COMPLETED**
   *Replace hardcoded 6-phase assumptions with a typed, variable-length phase system*
   *Link: [./measure/tracks/flexible-phase-model_20260406/](./measure/tracks/flexible-phase-model_20260406/)*

  - [x] **Track: Scaffold Component Infrastructure** — **COMPLETED**
     *Create student, teacher, and dashboard component directories with basic infrastructure*
     *Link: [./measure/tracks/scaffold-component-infrastructure_20260408/](./measure/tracks/scaffold-component-infrastructure_20260408/)*


- [x] **Track 3: Lesson Rendering Engine** — **COMPLETED**
  *Port + adapt LessonStepper, PhaseRenderer, PhaseCompleteButton from bus-math-v2*
  *Depends on: Tracks 1, 2*
  *Link: [./measure/archive/lesson-rendering_20260406/](./measure/archive/lesson-rendering_20260406/)*

- [x] **Track 4: Activity Infrastructure** — **COMPLETED**
  *Registry, mode system, props schemas, submission pipeline, completion tracking*
  *Link: [./measure/tracks/activity-infrastructure_20260406/](./measure/tracks/activity-infrastructure_20260406/)*

- [x] **Track 5: Graphing Components**
   *graphing-explorer component — interactive coordinate plane in teaching/guided/practice modes*
   *Depends on: Tracks 2, 4*
   *Link: [./measure/tracks/graphing-components_20260406/](./measure/tracks/graphing-components_20260406/)*
   - Phase 1: Core Canvas [COMPLETE]
   - Phase 2: Guided Interaction Workflows [COMPLETE]
   - Phase 3: Problem Variant Types [COMPLETE]
   - Phase 4: Explore Mode & Submission (partial - Explore mode deferred) [COMPLETE]

- [x] **Track 5b: Graphing Explorer Explore Mode** (continuation of Track 5)
   *Implement Explore mode with parameter sliders for quadratic exploration in Explore phases*
   *Link: [./measure/tracks/graphing-explore-mode_20260414/](./measure/tracks/graphing-explore-mode_20260414/)*
   - Phase 1: Explore Mode with Parameter Sliders [COMPLETE]

- [x] **Track 6: Algebraic Worked-Example Components** — **COMPLETED**
  *step-by-step-solver — all 11 algebraic problem types in teaching/guided/practice modes*
  *Depends on: Tracks 2, 4*
  *Link: [./measure/tracks/algebraic-examples_20260406/](./measure/tracks/algebraic-examples_20260406/)*

- [x] **Track 7: Supporting Activity Components** — **COMPLETED**
   *comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer*
   *Depends on: Tracks 2, 4*
   *Link: [./measure/tracks/supporting-activities_20260406/](./measure/tracks/supporting-activities_20260406/)*
   - Phase 1: Comprehension Quiz [COMPLETE]
   - Phase 2: Fill-in-the-Blank [COMPLETE]
   - Phase 3: Rate-of-Change Calculator [COMPLETE]
   - Phase 4: Discriminant Analyzer [COMPLETE]

- [x] **Track 8: Module 1 Curriculum Seed**
   *All 8 lessons seeded with phases, sections, activities, standards, and demo environment*
   *Depends on: Tracks 1, 4 (activity keys must be defined before seeding)*
   *Link: [./measure/tracks/module-1-seed_20260406/](./measure/tracks/module-1-seed_20260406/)*
   - Phase 1: Infrastructure & Types [COMPLETE]
   - Phase 2: Lesson 1-7 Content Authoring [COMPLETE]
   - Phase 3: Standards & Demo Environment [COMPLETE]
   - Phase 4: Lesson Seeds 1-1 through 1-4 [COMPLETE]
   - Phase 5: Lesson Seeds 1-5 through 1-8 [COMPLETE]

- [x] **Track 9: Student Lesson Flow** [Phase 4 Complete]
   *End-to-end: dashboard → lesson → phases → activities → completion → progress persistence*
   *Depends on: Tracks 3, 5, 6, 7, 8*
   *Link: [./measure/tracks/student-lesson-flow_20260406/](./measure/tracks/student-lesson-flow_20260406/)*
   - Phase 1: Dashboard Enhancements [COMPLETE]
   - Phase 2: Lesson Entry & Phase Navigation [COMPLETE]
   - Phase 3: Activity Interaction & Submission Flow [COMPLETE]
   - Phase 4: Loading States, Completion & Polish [COMPLETE]

- [x] **Track 10: Teacher Module 1 Experience** — **COMPLETED**
   *Dashboard, gradebook, student detail, submission review, lesson preview, course overview*
   *Depends on: Tracks 3, 5, 6, 7, 8*
   *Link: [./measure/tracks/teacher-module1_20260406/](./measure/tracks/teacher-module1_20260406/)*
   - Phase 1: Teacher Dashboard [COMPLETE]
   - Phase 2: Gradebook [COMPLETE]
   - Phase 3: Student Detail View [COMPLETE]
   - Phase 4: Lesson Preview & Course Overview [COMPLETE]

 - [x] **Track: Curriculum Gap Remediation** — **COMPLETED**
   *Remediate curriculum completeness gaps across ALEKS extraction, lesson source quality, daily phase packaging, non-instruction day authoring, and practice.v1 activity mapping*
   *Link: [./measure/tracks/curriculum-gap-remediation_20260411/](./measure/tracks/curriculum-gap-remediation_20260411/)*

 - [x] **Track: Refactor — Extract Quadratic Regex** — **COMPLETED**
   *Extract duplicated quadratic regex from canvas-utils, HintPanel, InterceptIdentification to shared utility*
   *Link: [./measure/tracks/extract-quadratic-regex_20260411/](./measure/tracks/extract-quadratic-regex_20260411/)*

 - [x] **Track: Refactor — Extract Linear Regex** — **COMPLETED**
   *Extract duplicated linear regex from canvas-utils, InterceptIdentification to shared utility*
   *Link: [./measure/tracks/extract-linear-regex_20260412/](./measure/tracks/extract-linear-regex_20260412/)*

  - [x] **Track: Component Approval**
    *Developer-only approval workflow for example, activity, and practice components with structured review notes for later LLM audits*
    *Link: [./measure/tracks/component-approval_20260413/](./measure/tracks/component-approval_20260413/)*
    - Phase 3: Developer-Only Access Guard [COMPLETE]
    - Phase 4: Review Queue UI [COMPLETE]
    - Phase 5: Component Review Harnesses [COMPLETE]
    - Phase 6: End-to-End Verification and Documentation [COMPLETE]

- [x] **Track: Harden Manual Component Approval**
     *Complete trustworthy manual approval hardening: real example/practice queue coverage, deterministic hashes, harness-gated approval, and Convex integration tests*
     *Link: [./measure/archive/harden-manual-approval_20260415/](./measure/archive/harden-manual-approval_20260415/)*
     - Phase 1: Queue Coverage and Real Review Targets [COMPLETE]
     - Phase 2: Content Hashing and Stale Approval [COMPLETE]
     - Phase 3: Harness Data and Approval Gating [COMPLETE]
     - Phase 4: Convex Integration Coverage and Auth Boundaries [COMPLETE]
     - Phase 5: Documentation and Status Reconciliation [COMPLETE]

- [x] **Track: Reconcile Activity Schemas** — **COMPLETED**
   *Align Zod schemas for comprehension-quiz and fill-in-the-blank with actual component props (Critical — blocks curriculum authoring)*
   *Link: [./measure/tracks/reconcile-activity-schemas_20260414/](./measure/tracks/reconcile-activity-schemas_20260414/)*
   - Phase 1: ComprehensionQuiz Schema Reconciliation [COMPLETE]
   - Phase 2: FillInTheBlank Schema Reconciliation [COMPLETE]

- [x] **Track: Wire StepByStepSolverActivity to Real Props** — **COMPLETED**
   *Replace hardcoded steps with real props, wire onSubmit/onComplete, integrate distractors.ts (Priority 3)*
   *Link: [./measure/tracks/wire-step-by-step-solver_20260414/](./measure/tracks/wire-step-by-step-solver_20260414/)*
   - Phase 1: Prop Interface & Submission Wiring [COMPLETE]
   - Phase 2: Integrate distractors.ts into StepByStepper [COMPLETE]

 - [x] **Track: Phase Skip UI Wiring** — **COMPLETED**
    *Wire existing phase skip infrastructure to PhaseCompleteButton UI — show Skip button for explore and discourse phases*
    *Link: [./measure/tracks/phase-skip-ui_20260414/](./measure/tracks/phase-skip-ui_20260414/)*

- [x] **Track: Module 2 Curriculum Seed**
      *Seed Module 2 lessons (2-1 through 2-5) into Convex database following module-1-seed pattern*
      *Link: [./measure/tracks/module-2-seed_20260415/](./measure/tracks/module-2-seed_20260415/)*
      - Phase 1: Seed Lesson 2-1 (Polynomial Functions) [COMPLETE]
      - Phase 2: Seed Lesson 2-2 (Analyzing Graphs of Polynomial Functions) [COMPLETE]
      - Phase 3: Seed Lesson 2-3 (Operations with Polynomials) [COMPLETE]
      - Phase 4: Seed Lessons 2-4 and 2-5 [COMPLETE]
      - Phase 5: Update seed.ts and Verify [COMPLETE]

- [x] **Track: Module 3 Curriculum Seed**
        *Seed Module 3 polynomial equations lessons (3-1 through 3-5) into Convex database*
        *Link: [./measure/tracks/module-3-seed_20260415/](./measure/tracks/module-3-seed_20260415/)*
        - Phase 1: Seed Lesson 3-1 (Solving Polynomial Equations by Graphing) [COMPLETE]
        - Phase 2: Seed Lesson 3-2 (Solving Polynomial Equations Algebraically) [COMPLETE]
        - Phase 3: Seed Lesson 3-3 (Proving Polynomial Identities) [COMPLETE]
        - Phase 4: Seed Lesson 3-4 (The Remainder and Factor Theorems) [COMPLETE]
        - Phase 5: Seed Lesson 3-5 (Roots and Zeros) [COMPLETE]
        - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 4 Curriculum Seed**
      *Seed Module 4 inverses and radical functions lessons (4-1 through 4-6) into Convex database*
      *Link: [./measure/archive/module-4-seed_20260415/](./measure/archive/module-4-seed_20260415/)*
      - Phase 1: Seed Lesson 4-1 [COMPLETE]
      - Phase 2: Seed Lesson 4-2 [COMPLETE]
      - Phase 3: Seed Lesson 4-3 [COMPLETE]
      - Phase 4: Seed Lesson 4-4 [COMPLETE]
      - Phase 5: Seed Lesson 4-5 [COMPLETE]
      - Phase 6: Seed Lesson 4-6 [COMPLETE]
      - Phase 7: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 5 Curriculum Seed**
      *Seed Module 5 exponential functions and geometric series lessons (5-1 through 5-5) into Convex database*
      *Link: [./measure/archive/module-5-seed_20260415/](./measure/archive/module-5-seed_20260415/)*
      - Phase 1: Seed Lesson 5-1 [COMPLETE]
      - Phase 2: Seed Lesson 5-2 [COMPLETE]
      - Phase 3: Seed Lesson 5-3 [COMPLETE]
      - Phase 4: Seed Lesson 5-4 [COMPLETE]
      - Phase 5: Seed Lesson 5-5 [COMPLETE]
      - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 6 Curriculum Seed** — **COMPLETED**
        *Seed Module 6 logarithmic functions lessons (6-1 through 6-5) into Convex database*
        *Link: [./measure/tracks/module-6-seed_20260415/](./measure/tracks/module-6-seed_20260415/)*
        - Phase 1: Seed Lesson 6-1 [COMPLETE]
        - Phase 2: Seed Lesson 6-2 [COMPLETE]
        - Phase 3: Seed Lesson 6-3 [COMPLETE]
        - Phase 4: Seed Lesson 6-4 [COMPLETE]
        - Phase 5: Seed Lesson 6-5 [COMPLETE]
        - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 7 Curriculum Seed**
      *Seed Module 7 rational functions and equations lessons (7-1 through 7-6) into Convex database*
      *Link: [./measure/archive/module-7-seed_20260415/](./measure/archive/module-7-seed_20260415/)*
      - Phase 1: Seed Lesson 7-1 [COMPLETE]
      - Phase 2: Seed Lesson 7-2 [COMPLETE]
      - Phase 3: Seed Lesson 7-3 [COMPLETE]
      - Phase 4: Seed Lesson 7-4 [COMPLETE]
      - Phase 5: Seed Lesson 7-5 [COMPLETE]
      - Phase 6: Seed Lesson 7-6 [COMPLETE]
      - Phase 7: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 8 Curriculum Seed**
      *Seed Module 8 inferential statistics lessons (8-1 through 8-5) into Convex database*
      *Link: [./measure/tracks/module-8-seed_20260415/](./measure/tracks/module-8-seed_20260415/)*
       - Phase 1: Seed Lesson 8-1 [COMPLETE]
       - Phase 2: Seed Lesson 8-2 [COMPLETE]
       - Phase 3: Seed Lesson 8-3 [COMPLETE]
       - Phase 4: Seed Lesson 8-4 [COMPLETE]
       - Phase 5: Seed Lesson 8-5 [COMPLETE]
       - Phase 6: Module Integration and Verification [COMPLETE]

- [x] **Track: Module 9 Curriculum Seed**
        *Seed Module 9 trigonometric functions lessons (9-1 through 9-7) into Convex database*
        *Link: [./measure/archive/module-9-seed_20260415/](./measure/archive/module-9-seed_20260415/)*
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
     *Link: [./measure/tracks/practice-timing-telemetry_20260415/](./measure/tracks/practice-timing-telemetry_20260415/)*
       - Phase 1: Canonical Contract and Schema Reconciliation [COMPLETE] [checkpoint: 790e2f5]
       - Phase 2: Reusable Timing Core and React Instrumentation [COMPLETE] [checkpoint: a973651]
       - Phase 3: Activity Submission Integration [COMPLETE] [checkpoint: 733bef3]
       - Phase 4: Persistence and Review Surfaces [COMPLETE] [checkpoint: 7c3d8e1]
       - Phase 5: Verification, Documentation, and Handoff [COMPLETE] [checkpoint: b210dce]

- [x] **Track: Practice Timing Baselines** — **COMPLETED**
        *Build timing baselines and time-aware SRS evidence features after reliable practice timing telemetry exists*
        *Depends on: Practice Timing Telemetry and stable practice problem-family identifiers*
*Link: [./measure/archive/practice-timing-baselines_20260415/](./measure/archive/practice-timing-baselines_20260415/)
        - Phase 1: Baseline and Feature Model [COMPLETE]
        - Phase 2: Baseline Persistence and Aggregation [COMPLETE]
        - Phase 3: Time-Aware SRS Rating Adapter [COMPLETE]
        - Phase 4: Objective Proficiency and Fluency Signals [COMPLETE]
        - Phase 5: UI Integration, Validation, and Handoff [COMPLETE]

- [x] **Track: Fix submitReviewHandler componentKind Derivation**
      *Derive componentKind from placement.phaseType on write path to prevent permanent isStale mismatches*
      *Link: [./measure/archive/fix-submit-review-handler-component-kind_20260416/](./measure/archive/fix-submit-review-handler-component-kind_20260416/)*
      - Phase 1: Fix componentKind Derivation [COMPLETE]

- [x] **Track: CCSS Standards Seeding for M1-M5** — **COMPLETED**
      *Add missing CCSS standards to seed-standards.ts and build lesson_standards links for modules 1-5*
      *Link: [./measure/archive/ccss-standards-seeding-m1-m5_20260416/](./measure/archive/ccss-standards-seeding-m1-m5_20260416/)*
      - Phase 1: Analyze and Document Existing Standards Coverage [COMPLETE]
      - Phase 2: Add Missing CCSS Standards to seed-standards.ts [COMPLETE]
      - Phase 3: Add lesson_standards Links for M1-M5 [COMPLETE]
      - Phase 4: Wire Seeders into seed.ts Orchestration [COMPLETE]

## Daily Practice SRS Roadmap

Post-Module-9 tracks for daily practice, spaced repetition, objective proficiency, and reusable course-agnostic infrastructure. See `measure/daily-practice-srs-roadmap.md` for the full roadmap with wave diagrams.

Implementation order: **Wave 0 done → Wave 1 (parallel) → Wave 2 → Wave 3 (parallel) → Wave 4 (sequential) → Wave 5.**

### Wave 0 — Completed

- [x] **Track 3: Practice Timing Telemetry** — **COMPLETED**
     *Link: [./measure/tracks/practice-timing-telemetry_20260415/](./measure/tracks/practice-timing-telemetry_20260415/)*

- [x] **Track 7: Practice Timing Baselines** — **COMPLETED**
     *Link: [./measure/tracks/practice-timing-baselines_20260415/](./measure/tracks/practice-timing-baselines_20260415/)*

### Wave 1 — Foundations (start immediately, 3 tracks in parallel)

- [x] **Track 1: Daily Practice SRS Product Contract** — **COMPLETED**
     *Consolidate existing types into canonical lib/srs/contract.ts; define card state, review log, session types; version as srs.contract.v1*
     *Link: [./measure/tracks/srs-product-contract_20260416/](./measure/tracks/srs-product-contract_20260416/)*

- [x] **Track 2: Reusable SRS Core Library**
         *FSRS scheduler wrapper, review processor bridging srs-rating.ts to card state, queue primitives, adapter interfaces*
         *Link: [./measure/tracks/srs-core-library_20260416/](./measure/tracks/srs-core-library_20260416/)*
         - Phase 1: FSRS Dependency and Scheduler Foundation [COMPLETE]
         - Phase 2: Review Processor [COMPLETE]
         - Phase 3: Queue Primitives [COMPLETE]
         - Phase 4: Adapter Interfaces [COMPLETE]
         - Phase 5: Verification and Handoff [COMPLETE]

- [x] **Track 4: Practice Item and Objective Blueprint Model** — **COMPLETED**
       *Map practice activities to problem families and objectives; assign objective policies; seed data for all 9 modules*
       *Link: [./measure/tracks/practice-item-blueprint_20260416/](./measure/tracks/practice-item-blueprint_20260416/)*
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
       *Link: [./measure/archive/convex-srs-schema_20260416/](./measure/archive/convex-srs-schema_20260416/)*
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
       *Link: [./measure/tracks/submission-srs-adapter_20260416/](./measure/tracks/submission-srs-adapter_20260416/)*
       - Phase 1: Adapter Interface Design [COMPLETE]
       - Phase 2: Problem Family Resolution [COMPLETE]
       - Phase 3: First-Seen Card Creation [COMPLETE]
       - Phase 4: Review Processing Pipeline [COMPLETE]
       - Phase 5: Convex Integration [COMPLETE]
       - Phase 6: Verification and Handoff [COMPLETE] [checkpoint: c9e6f7a]

- [x] **Track 8: Daily Practice Queue Engine** — **COMPLETE**
       *Query SRS cards from Convex; apply queue ordering with session limits; resolve items to activities; manage session lifecycle*
       *Depends on: Wave 2 (Track 5)*
       *Link: [./measure/archive/daily-practice-queue_20260416/](./measure/archive/daily-practice-queue_20260416/)*
        - Phase 1: Queue Query Implementation [COMPLETE]
        - Phase 2: Queue Item Resolution [COMPLETE]
        - Phase 3: Session Lifecycle [COMPLETE]
        - Phase 4: Session Config and Limits [COMPLETE]
        - Phase 5: Verification and Handoff [COMPLETE]

### Wave 4 — User-Facing (after Wave 3, sequential order: 10 → 9 → 11)

- [x] **Track 10: Objective Proficiency Measurement** — **COMPLETED**
       *Upgrade objective-proficiency.ts to use FSRS stability from card states; build aggregation pipeline; student/teacher proficiency queries*
       *Depends on: Wave 2 (Track 5)*
       *Link: [./measure/archive/objective-proficiency_20260416/](./measure/archive/objective-proficiency_20260416/)*
         - Phase 1: FSRS Stability Normalization [COMPLETE] [checkpoint: 2f6fe7b]
         - Phase 2: Card-to-Evidence Aggregation [COMPLETE] [checkpoint: 6f8d690]
         - Phase 3: Objective Proficiency Query [COMPLETE] [checkpoint: 3092c86]
         - Phase 4: Student and Teacher Views [COMPLETE] [checkpoint: 72934fc]
         - Phase 5: Verification and Handoff [COMPLETE]


- [x] **Track 9: Student Daily Practice Experience** — **COMPLETE**
          *Student daily practice page, session flow, card rendering with activity components, submission with timing, completion states*
          *Depends on: Tracks 6, 8 (Wave 3)*
          *Link: [./measure/archive/student-daily-practice_20260416/](./measure/archive/student-daily-practice_20260416/)*
           - Phase 1: Daily Practice Page and Session Loading [COMPLETE] [checkpoint: 6b5ab71]
           - Phase 2: Card Rendering and Activity Integration [COMPLETE] [checkpoint: d9d842e]
           - Phase 3: Submission and SRS Update Flow [COMPLETE] [checkpoint: b41dcc5]
           - Phase 4: Progress and Completion States [COMPLETE] [checkpoint: 7f3d2a1]
           - Phase 5: Dashboard Integration [COMPLETE] [checkpoint: f526aab]
           - Phase 6: Verification and Handoff [COMPLETE] [checkpoint: 33ff6e5]

- [x] **Track 11: Teacher SRS Dashboard and Interventions** — **COMPLETED**
       *Class health overview, weak objectives panel, struggling students, misconception diagnostics, basic interventions*
       *Depends on: Track 10 (Wave 4)*
       *Link: [./measure/archive/teacher-srs-dashboard_20260416/](./measure/archive/teacher-srs-dashboard_20260416/)*
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
        *Link: [./measure/tracks/cross-course-extraction_20260416/](./measure/tracks/cross-course-extraction_20260416/)*
         - Phase 1: Boundary Audit [COMPLETE] [checkpoint: d3475cd]
         - Phase 2: Interface Documentation [COMPLETE] [checkpoint: ad4afe8]
         - Phase 3: Integration Guide [COMPLETE] [checkpoint: e76b1b3]
         - Phase 4: Adapter Verification [COMPLETE] [checkpoint: 91aa23b]
         - Phase 5: Verification and Handoff [COMPLETE]

- [x] **Track: Error Analysis Unit Tests**
      *Add unit tests for error-analysis module — 8 untested exported functions with aggregation logic*
      *Link: [./measure/archive/error-analysis-unit-tests_20260416/](./measure/archive/error-analysis-unit-tests_20260416/)*
      - Phase 1: Test Infrastructure and Authorization Tests [COMPLETE]
      - Phase 2: Aggregation Function Tests [COMPLETE]
      - Phase 3: Summary Assembly and View Builder Tests [COMPLETE]
      - Phase 4: Verification [COMPLETE]

- [x] **Track: SRS Queue Performance Fixes** — **COMPLETED**
       *Fix critical N+1 query patterns in SRS daily practice queue: batch policy resolution, bulk practice item and activity lookups, and bound unbounded card collection*
       *Link: [./measure/archive/srs-queue-performance_20260417/](./measure/archive/srs-queue-performance_20260417/)*
       - Phase 1: Batch Queue Resolution and Bound Card Queries [COMPLETE]
       - Phase 2: Verification and Handoff [COMPLETE]

- [x] **Track: PracticeSessionProvider sessionId Fix** — **COMPLETED**
       *Fix PracticeSessionProvider to send sessionId with completion, preventing wrong-session completion race conditions*
       *Link: [./measure/archive/practice-session-provider-sessionid_20260417/](./measure/archive/practice-session-provider-sessionid_20260417/)*
       - Phase 1: Wire sessionId Through Completion Flow [COMPLETE]

## BM2 Alignment Tracks

Tracks ported from `bus-math-v2` per the BM2 Alignment Report. Ordered by recommended implementation wave.

### Wave A — Quick Wins (start now)

- [x] **Track: Security & Auth Hardening** — **COMPLETED**
     *Port fail-closed auth guards, Convex-layer authorization, credential revocation, middleware role checks from bus-math-v2*
     *Link: [./measure/tracks/security-auth-hardening_20260416/](./measure/tracks/security-auth-hardening_20260416/)*

- [x] **Track: Cloudflare CI/CD Hardening** — **COMPLETED**
     *Port GitHub Actions pipeline with lint/test/build gates, Cloudflare Workers deployment, concurrency control*
     *Link: [./measure/tracks/ci-cd-hardening_20260416/](./measure/tracks/ci-cd-hardening_20260416/)*

### Wave B — High-Value Classroom Features (after SRS Wave 1)

- [x] **Track: Practice Test Engine** — **COMPLETED**
      *Port 6-phase test runner, question banks for M1-M9, score persistence, post-answer feedback, test selection UI*
      *Link: [./measure/archive/practice-test-engine_20260416/](./measure/archive/practice-test-engine_20260416/)*
      - Phase 1: Data Structures and Question Banks [COMPLETE]
      - Phase 2: Convex Schema and Persistence [COMPLETE]
      - Phase 3: Test Engine UI [COMPLETE] [checkpoint: fd61fbf]

- [x] **Track: Teacher Gradebook & Competency Heatmaps**
       *Port course overview grid, unit gradebook, competency heatmaps with CCSS standards, submission detail modal, reporting drill-down IA*
       *Link: [./measure/archive/teacher-gradebook-heatmaps_20260416/](./measure/archive/teacher-gradebook-heatmaps_20260416/)*
       - Phase 1: Pure Logic — Gradebook and Overview [COMPLETE] [checkpoint: 074cee1]
       - Phase 2: Convex Queries for Reporting [COMPLETE] [checkpoint: e753143]
       - Phase 3: UI Components [COMPLETE] [checkpoint: 47afac5]
       - Phase 4: Competency Heatmaps [COMPLETE] [checkpoint: 33a9cf5]

### Wave C — Student Engagement (after SRS Wave 3)

- [x] **Track: Student Study Hub — Flashcards & SRS Review**
       *Port BaseReviewSession, FlashcardPlayer, ReviewSession with FSRS scheduling, IM3 glossary, term mastery tracking*
       *Link: [./measure/archive/study-hub-flashcards_20260416/](./measure/archive/study-hub-flashcards_20260416/)*
        - Phase 1: Glossary and SRS Core [COMPLETE] [checkpoint: 7902acf]
        - Phase 2: Convex Tables and Mutations [COMPLETE] [checkpoint: b3e8ccd]
        - Phase 3: UI Components and Routes [COMPLETE] [checkpoint: 47afac5]

- [x] **Track: Student Study Hub — Matching & Speed Round Games**
      *Port click-based matching game and timed speed round game, reusing IM3 glossary*
      *Link: [./measure/archive/student-study-hub-games_20260419/](./measure/archive/student-study-hub-games_20260419/)*
      - Phase 1: Matching Game [COMPLETE]
      - Phase 2: Speed Round Game [COMPLETE]
      - Phase 3: Adoption (pending - requires game routes/pages in IM3)

### Wave D — Differentiators (after core features stable)

- [x] **Track: AI Tutoring — Lesson Chatbot** — **DEFERRED**
     *Deferred: will be brought in from another repo during monorepo conversion*
     *Link: [./measure/archive/ai-chatbot_20260416/](./measure/archive/ai-chatbot_20260416/)*

- [x] **Track: Workbook System & Artifact Pipeline** — **DEFERRED**
     *Deferred: will be brought in from another repo during monorepo conversion*
     *Link: [./measure/archive/workbook-system_20260416/](./measure/archive/workbook-system_20260416/)*

## Migration Prerequisite Cleanup (2026-04-17)

- [x] **Track: Fix Teacher Dashboard N+1 Queries** — **COMPLETED**
     *Batch per-student SRS dashboard queries to remove sequential N+1 behavior in teacher analytics.*
     *Link: [./measure/tracks/fix-teacher-dashboard-n1-queries_20260417/](./measure/tracks/fix-teacher-dashboard-n1-queries_20260417/)*

- [x] **Track: CCSS Standards Seeding for M6-M9** — **COMPLETED**
       *Audit module 6-9 lesson-standard coverage and reconcile any missing competency standards/descriptions.*
       *Link: [./measure/archive/ccss-standards-seeding-m6-m9_20260417/](./measure/archive/ccss-standards-seeding-m6-m9_20260417/)*
       - Phase 1: Coverage Audit [COMPLETE]
       - Phase 2: Reconciliation and Seed Updates [COMPLETE]
       - Phase 3: Validation and Handoff [COMPLETE]

## Monorepo Migration Program (IM3 + BM2)

Execution playbook for junior implementation: [./measure/monorepo-track-playbook.md](./measure/monorepo-track-playbook.md)
Detailed junior track packets (exact files + commands + verification): [./measure/monorepo-jr-execution-spec.md](./measure/monorepo-jr-execution-spec.md)

AI Tutoring and Workbook scope is explicitly **import/adopt from BM2**, not greenfield IM3 reimplementation.

### Wave 0 — Readiness

- [x] **Track: Monorepo Readiness Gate** — **COMPLETE**
      *Lock migration prerequisites, ownership, rollback protocol, and tooling decision.*
      *Link: [./measure/archive/monorepo-readiness_20260417/](./measure/archive/monorepo-readiness_20260417/)*
      - Phase 1: Audit and Triage [COMPLETE]
      - Phase 2: Tooling and Governance Decision [COMPLETE]
      - Phase 3: Measure Control Artifacts [COMPLETE]

### Wave 1 — Host Monorepo Shell

- [x] **Track: Monorepo Tooling Shell** — **COMPLETE**
     *Create root workspace shell, task fanout scripts, and package template without moving apps yet.*
     *Link: [./measure/archive/monorepo-tooling-shell_20260417/](./measure/archive/monorepo-tooling-shell_20260417/)*
     - Phase 1: Root Workspace Setup [COMPLETE]
     - Phase 2: Package Template and Guard Scripts [COMPLETE]
     - Phase 3: Baseline Validation [COMPLETE]

- [x] **Track: Move IM3 App to apps/integrated-math-3** — **COMPLETED**
       *Relocate IM3 app paths and update local scripts/config while preserving runtime behavior.*
       *Link: [./measure/archive/move-im3-app-to-apps_20260417/](./measure/archive/move-im3-app-to-apps_20260417/)*
       - Phase 1: Mechanical Move [COMPLETE]
       - Phase 2: CI and Tooling Path Fixes [COMPLETE]
       - Phase 3: Post-Move Validation [COMPLETE] (2026-04-18)

- [x] **Track: Monorepo Boundary Guardrails**
     *Add automated checks preventing shared packages from depending on app-owned paths.*
     *Link: [./measure/archive/monorepo-boundary-guards_20260417/](./measure/archive/monorepo-boundary-guards_20260417/)*
     - Phase 1: Define Guard Rules [COMPLETE]
     - Phase 2: CI Integration [COMPLETE]
     - Phase 3: Proof and Handoff [COMPLETE]

### Wave 2 — Core Engine Packages From IM3

- [x] **Track: Extract Practice Core Package** — **COMPLETED**
     *Extract practice contract, timing, baseline, and rating primitives into package.*
     *Link: [./measure/archive/extract-practice-core_20260417/](./measure/archive/extract-practice-core_20260417/)*
     - Phase 1: Scaffold and Extract [COMPLETE]
     - Phase 2: Reconcile BM2 Deltas [COMPLETE]
     - Phase 3: IM3 Import Migration and Verification [COMPLETE]

 - [x] **Track: Extract SRS Engine Package** — **COMPLETED**
      *Extract scheduler/review/queue core, keeping app-specific persistence adapters local.*
      *Link: [./measure/archive/extract-srs-engine_20260417/](./measure/archive/extract-srs-engine_20260417/)*
      - Phase 1: Scaffold and Extract [COMPLETE]
      - Phase 2: Reconcile and Harden [COMPLETE]
      - Phase 3: IM3 Migration and Validation [COMPLETE]

 - [x] **Track: Extract Core Auth + Convex Infrastructure** — **COMPLETED**
      *Extract shared auth/session/password/guard helpers and shared Convex wrapper factories in one coordinated infra track.*
      *Link: [./measure/archive/extract-core-auth-convex_20260417/](./measure/archive/extract-core-auth-convex_20260417/)*

### Wave 3 — Runtime and Approval Packages

- [x] **Track: Extract Activity Runtime Package** — **COMPLETED**
      *Extract lesson/phase/runtime contracts while keeping activity implementations app-local.*
      *Link: [./measure/archive/extract-activity-runtime_20260417/](./measure/archive/extract-activity-runtime_20260417/)*
      - Phase 1: Package Extraction [COMPLETE]
      - Phase 2: IM3 Migration [COMPLETE]
      - Phase 3: Verification and Handoff [COMPLETE]

- [x] **Track: Extract Component Approval Package**
      *Extract review queue/hash/harness approval primitives to shared package.*
      *Link: [./measure/archive/extract-component-approval_20260417/](./measure/archive/extract-component-approval_20260417/)*
      - Phase 1: Extract Core Primitives [COMPLETE]
      - Phase 2: Reconcile and Integrate [COMPLETE]

- [x] **Track: Extract Graphing Core Package**
       *Extract graphing math/parser primitives while preserving course-specific configs locally.*
       *Link: [./measure/archive/extract-graphing-core_20260417/](./measure/archive/extract-graphing-core_20260417/)*
       - Phase 1: Extract Utility Primitives [COMPLETE]
       - Phase 2: Reconcile Deltas [COMPLETE]
       - Phase 3: IM3 Migration and Verification [COMPLETE]

### Critical Blocker — App Import Migration

- [x] **Track: App Import Migration** — **COMPLETED**
       *Delete duplicate code in lib/auth/, lib/srs/, lib/practice/, lib/convex/ and rewire all imports to @math-platform/* packages.*
       *Link: [./measure/archive/app-import-migration_20260418/](./measure/archive/app-import-migration_20260418/)*
       - Phase 1: lib/auth/ Migration [COMPLETE]
       - Phase 2: lib/practice/ Migration [COMPLETE]
       - Phase 3: lib/srs/ Migration [COMPLETE]
       - Phase 4: lib/convex/ Migration [COMPLETE]
       - Phase 5: package.json Dependency Fix [COMPLETE]
       - Phase 6: Final Verification [COMPLETE]

### Wave 4 — Bring BM2 Into the Monorepo

- [x] **Track: Move BM2 App to apps/bus-math-v2** — **COMPLETED**
      *Relocate BM2 app while preserving business-domain modules and deployment behavior.*
      *Link: [./measure/archive/move-bm2-app-to-apps_20260417/](./measure/archive/move-bm2-app-to-apps_20260417/)*
      - Phase 1: Mechanical BM2 Move [COMPLETE]
      - Phase 2: Config and Workflow Updates [COMPLETE]
      - Phase 3: Cross-App Verification [COMPLETE] [checkpoint: 9877509]

- [x] **Track: BM2 Consume Core Packages** — **COMPLETE**
       *Replace duplicated BM2 core imports with shared practice/srs/auth/convex packages.*
       *Link: [./measure/archive/bm2-consume-core-packages_20260417/](./measure/archive/bm2-consume-core-packages_20260417/)*
       - Phase 1: Practice and SRS Adoption [COMPLETE] - practice imports migrated to @math-platform/practice-core; SRS imports verified (71 tests pass)
       - Phase 2: Auth and Convex Adoption [COMPLETE] - middleware migrated; server.ts remains local
       - Phase 3: Cleanup and Verification [COMPLETE] - import redirects complete; full pruning deferred (requires audit)

- [x] **Track: BM2 Consume Runtime Packages** — **COMPLETE**
      *Adopt shared runtime/approval/graphing package APIs where boundaries are clean.*
      *Link: [./measure/archive/bm2-consume-runtime-packages_20260417/](./measure/archive/bm2-consume-runtime-packages_20260417/)*
      - Phase 1: Activity Runtime Adoption [COMPLETE] - architectural incompatibility documented (BM2 registry is BM2-specific)
      - Phase 2: Component Approval Adoption [COMPLETE] - content-hash migrated; 19 tests pass
      - Phase 3: Graphing Core Adoption [COMPLETE] - linear/quadratic parsers migrated; 89 tests pass

### Wave 4.5 — SRS Contract Migration (Prerequisite for bm2-consume-core-packages completion)

- [x] **Track: BM2 SRS Contract Migration** — **COMPLETE**
       *Migrate BM2 legacy SRS contract (card: Record, numeric timestamps) to FSRS-aligned contract in @math-platform/srs-engine.*
       *Link: [./measure/archive/bm2-srs-contract-migration_20260418/](./measure/archive/bm2-srs-contract-migration_20260418/)*
       - Phase 1: Contract Rewrite [COMPLETE]
         - Contract types migrated to srs-engine package types
         - Build passes (verified)
       - Phase 2: Test Fixture Updates [COMPLETE] (2026-04-18)
         - queue.test.ts, review-processor.test.ts updated to SrsCardState format
         - scheduler.test.ts boundary condition fixed
         - SRS tests now pass
       - Phase 3: Convex Schema Migration [COMPLETE] (2026-04-18)
          - srs_cards table migrated to flat SrsCardState fields
          - Handler and component updates complete
          - SRS tests: 147 pass
        - Phase 4: Adapter Layer [SKIPPED]
          - Adapters no longer needed since Convex stores flat SrsCardState

### Wave 5 — Feature Packages and IM3 Pending Tracks

- [x] **Track: Extract Practice Test Engine Package**
      *Extract test-runner primitives and adopt in both apps while keeping banks local.*
      *Link: [./measure/archive/extract-practice-test-engine_20260417/](./measure/archive/extract-practice-test-engine_20260417/)*
      - Phase 1: Package Extraction [COMPLETE]
      - Phase 2: App Adoption [COMPLETE] - reconciled package API to match IM3 format; updated BM2 component to use new shuffleAnswers signature

- [x] **Track: Extract Study Hub Core Package**
      *Extract flashcard/review/game core primitives while keeping glossary data local.*
      *Link: [./measure/archive/extract-study-hub-core_20260417/](./measure/archive/extract-study-hub-core_20260417/)*
      - Phase 1: Extract Shared Study Primitives [COMPLETE]
      - Phase 2: Adopt in IM3 [COMPLETE] - BaseReviewSession imports migrated to package; FlashcardPlayer/ReviewSession updated

- [x] **Track: Extract Teacher Reporting Core Package**
      *Extract pure gradebook/reporting logic while keeping Convex queries app-local.*
      *Link: [./measure/archive/extract-teacher-reporting-core_20260417/](./measure/archive/extract-teacher-reporting-core_20260417/)*
      - Phase 1: Pure Logic Extraction [COMPLETE]
      - Phase 2: Adoption in IM3/BM2 [COMPLETE] - IM3 fully migrated; BM2 partial (gradebook has BM2-specific extensions)

- [x] **Track: Extract AI Tutoring Package and Adopt in IM3** — **COMPLETED**
      *Extract BM2 tutoring primitives and complete IM3 chatbot via package imports.*
      *Link: [./measure/archive/extract-ai-tutoring-and-adopt-im3_20260417/](./measure/archive/extract-ai-tutoring-and-adopt-im3_20260417/)]
      - Phase 1: Package Extraction from BM2 [COMPLETE]
      - Phase 2: BM2 Adoption [COMPLETE]
      - Phase 3: IM3 Adoption [COMPLETE] — chatbot route, component, rate limits, Convex schema

- [x] **Track: Extract Workbook Pipeline Package and Adopt in IM3** — **COMPLETED**
      *Extract BM2 workbook pipeline primitives and complete IM3 workbook via package imports.*
      *Link: [./measure/archive/extract-workbook-pipeline-and-adopt-im3_20260417/](./measure/archive/extract-workbook-pipeline-and-adopt-im3_20260417/)*
      - Phase 1: Extract BM2 Workbook Pipeline Primitives [COMPLETE]
      - Phase 2: BM2 Adoption [COMPLETE]
      - Phase 3: IM3 Adoption and Completion [COMPLETE]

### Wave 6 — Monorepo Hardening

- [x] **Track: Monorepo CI and Deploy Hardening** — **COMPLETED**
      *Finalize root CI matrix, boundary checks, and per-app deploy path correctness.*
      *Link: [./measure/archive/monorepo-ci-deploy-hardening_20260417/](./measure/archive/monorepo-ci-deploy-hardening_20260417/)*
      - Phase 1: CI Pipeline Matrix [COMPLETE]
      - Phase 2: Deploy and Convex Paths [COMPLETE]
      - Phase 3: Reliability Validation [COMPLETE]

- [x] **Track: Monorepo Docs and Cleanup** — **COMPLETED**
      *Finalize integration docs, remove shims, and reconcile stale path references.*
      *Link: [./measure/archive/monorepo-docs-and-cleanup_20260417/](./measure/archive/monorepo-docs-and-cleanup_20260417/)*
      - Phase 1: Author Final Documentation [COMPLETE]
      - Phase 2: Remove Migration Residue [COMPLETE] (validation scans confirmed clean)
      - Phase 3: Final Validation and Handoff [COMPLETE]

- [x] **Track: IM3 Chatbot Security Fixes** — **COMPLETED**
      *Fix two critical security issues: (1) add lesson enrollment authorization check, (2) sanitize teacher-authored content before AI prompt injection.*
      *Link: [./measure/archive/im3-chatbot-security_20260419/](./measure/archive/im3-chatbot-security_20260419/)*
      - Phase 1: Lesson Enrollment Authorization Check [COMPLETE]
      - Phase 2: Prompt Injection Sanitization [COMPLETE]

- [x] **Track: IM3 Chatbot Provider Memoization** — **COMPLETED**
      *Memoize resolveOpenRouterProviderFromEnv to reuse provider across requests and add AbortSignal support for client disconnect handling*
      *Link: [./measure/archive/im3-chatbot-provider-memoization_20260419/](./measure/archive/im3-chatbot-provider-memoization_20260419/)*
      - Phase 1: Memoize Provider and Add AbortSignal Support [COMPLETE]

- [x] **Track: Fix Misconception Summary N+1 Query** — **COMPLETED**
  *Fix critical N+1 sequential query in getMisconceptionSummaryHandler using Promise.all parallelization*
  *Link: [./measure/archive/fix-misconception-summary-n1_20260419/](./measure/archive/fix-misconception-summary-n1_20260419/)*

- [x] **Track: practice-core Package Testing** — **COMPLETED**
  *Add package-level unit tests to practice-core for contract.ts, srs-rating.ts, and timing-baseline.ts*
  *Link: [./measure/archive/practice-core-testing_20260419/](./measure/archive/practice-core-testing_20260419/)*

## Teacher Assignment UI (2026-04-19)

- [x] **Track: Teacher Lesson Assignment UI** — **COMPLETED**
  *Build UI for teachers to assign lessons to their classes, populating class_lessons table*
  *Link: [./measure/archive/teacher-lesson-assignment-ui_20260419/](./measure/archive/teacher-lesson-assignment-ui_20260419/)*
  - Phase 1: Convex Queries [COMPLETE]
  - Phase 2: Convex Mutations [COMPLETE]
  - Phase 3: Teacher UI [COMPLETE]
  - Phase 4: Verification [COMPLETE]

- [x] **Track: Seed Class Lessons for Demo** — **COMPLETED**
  *Seed class_lessons entries for demo environment — assigns Module 1 lessons to demo class*
  *Link: [./measure/archive/seed-class-lessons_20260419/](./measure/archive/seed-class-lessons_20260419/)*
  - Phase 1: Seed Mutation and Demo Wiring [COMPLETE]
  - Phase 2: Verification [COMPLETE]

 - [x] **Track: Monorepo Tech Debt Triage & Resolution** — **COMPLETED**
      *Investigate and resolve all 45 open tech debt items to solidify monorepo migration — triage, fix, or close each item*
      *Link: [./measure/archive/monorepo-tech-debt-triage_20260422/](./measure/archive/monorepo-tech-debt-triage_20260422/)*
       - Phase 1: BM2 TypeScript & Runtime Correctness [x] [checkpoint: e0d36db]
      - Phase 2: SRS & Practice Correctness [x]
      - Phase 3: N+1 Query Performance [x]
      - Phase 4: CI/CD & Deployment Hardening [x]
       - Phase 5: Package Quality & Consistency [x] [checkpoint: cbae9ca]
       - Phase 6: AI Tutoring & Workbook Quality [x] [checkpoint: a6b2a11]
        - Phase 7: UI & Minor Items [x]
       - Phase 8: Tech Debt Registry Cleanup & Final Verification [x]

- [x] **Track: Convex Schema Strict Validation** — **COMPLETED**
       *Replace 21 v.any() fields in IM3 Convex schema with typed validators and eliminate 5 production as any casts on Convex internal*
       *Link: [./measure/archive/convex_schema_strict_validation_20260424/](./measure/archive/convex_schema_strict_validation_20260424/)*
       - Phase 1: Audit and Type Discovery [COMPLETE]
       - Phase 2: SRS review_log typed validators [COMPLETE] (review-26: extracted shared validators to srs/validators.ts)
       - Phase 3: Eliminate as any casts [DEFERRED]
       - Phase 4: Verification [COMPLETE]

- [x] **Track: Rate Limiting API Endpoints** — **COMPLETED**
      *Add per-user rate limiting to 5 unprotected BM2 API endpoints: phases/complete, assessment, activities, error-summary, ai-error-summary*
      *Link: [./measure/tracks/rate_limiting_api_endpoints_20260424/](./measure/tracks/rate_limiting_api_endpoints_20260424/)*
      - Phase 1: Rate Limiter Core [COMPLETE]
      - Phase 2: Endpoint Integration [COMPLETE] (minimax-m2)
      - Phase 3: Configuration and Monitoring [COMPLETE] (minimax-m2)
      - Phase 4: Verification [COMPLETE] (minimax-m2)

- [x] **Track: Fix apiRateLimits Race Condition** — **COMPLETED**
       *Fix concurrent inserts for same user+endpoint creating duplicate records that break .unique() via try/catch upsert pattern*
       *Link: [./measure/archive/fix-apiratelimits-race-condition_20260428/](./measure/archive/fix-apiratelimits-race-condition_20260428/)*
       - Phase 1: Race Condition Fix [COMPLETE] - 14 tests including concurrent request simulation
       - Phase 2: Documentation [COMPLETE]

- [x] **Track: Add .env.example to All Apps** — **COMPLETED**
       *Add `.env.example` files to all apps (IM3, BM2, IM1, IM2, PreCalc) providing reference for required environment variables*
       *Link: [./measure/archive/add_env_example_all_apps_20260428/](./measure/archive/add_env_example_all_apps_20260428/)*
       - Phase 1: Audit Existing Environment Variables [COMPLETE]
       - Phase 2: Create .env.example for Each App [COMPLETE]
       - Phase 3: Verification [COMPLETE]

- [x] **Track: Fix getTeacherClassProficiencyHandler N+1 Queries** — **COMPLETED**
      *Pre-fetch problem_families, timing_baselines, activity_submissions, competency_standards, objective_policies outside S×O loop to reduce ~1800 queries to O(1) pre-fetches*
      *Link: [./measure/archive/teacher-class-proficiency-n1_20260424/](./measure/archive/teacher-class-proficiency-n1_20260424/)*

- [x] **Track: Lesson Version Query Optimization** — **COMPLETED**
      *Fix N+1 query patterns in public.ts getCurriculum/getUnitSummaries and isStudentEnrolledInClassForLesson via batched parallel queries*
      *Link: [./measure/archive/lesson_version_query_optimization_20260424/](./measure/archive/lesson_version_query_optimization_20260424/)*
      - Phase 1: Curriculum Query Batching [COMPLETE]
      - Phase 2: Enrollment Query Batching [COMPLETE]
      - Phase 3: Verification [COMPLETE]

## Test Suite Maintenance

## Archived Tracks

- [x] **Track: Scaffold App Pages & Layouts**
  *Link: [./measure/archive/scaffold-pages_20260405/](./measure/archive/scaffold-pages_20260405/)*

- [x] **Track 2: E-Textbook Design System**
  *Link: [./measure/archive/e-textbook-design_20260406/](./measure/archive/e-textbook-design_20260406/)*

- [x] **Harden Test Suite** — **COMPLETED**
  *Audit and repair the test suite to ensure all tests are meaningful, non-trivial, and correctly verify behavior.*
  *IM3: 267/267 pass. BM2: Convex generated type stubs added; 28 pre-existing infra failures remain (outside spec scope).*
  *Link: [./measure/archive/harden-test-suite_20260419/](./measure/archive/harden-test-suite_20260419/)*

## Tech Debt Resolution (2026-04-29)

- [x] **Track: Monorepo Tech Debt Resolution** — **COMPLETED** (28 of 28 tasks complete)
  *Resolve all 24 open/partial tech debt items, add missing test coverage, and implement metrics/monitoring guardrails*
  *Link: [./tracks/tech-debt-resolution_20260429/](./tracks/tech-debt-resolution_20260429/)*
  - Phase 1: Tasks 1.1 ✅, 1.2 ✅, 1.3 ✅, 1.4 ✅
  - Phase 2: Tasks 2.1 ✅, 2.2 ✅, 2.3 ✅, 2.4 ✅
  - Phase 3: Tasks 3.1 ✅, 3.2 ✅, 3.3 ✅, 3.4 ✅, 3.5 ✅, 3.6 ✅
  - Phase 4: Task 4.1 ✅
  - Phase 5: Tasks 5.1 ✅, 5.2 ✅, 5.3 ✅, 5.4 ✅, 5.5 ✅, 5.6 ✅, 5.7 ✅
  - Phase 6: Tasks 6.1 ✅, 6.2 ✅, 6.3 ✅, 6.4 ✅

- [x] **Track: Tech Debt Resolution v2**
  *Resolve 11 remaining open tech debt items — auth hardening, schema typing, CI integration, test coverage, and cleanup*
  *Link: [./tracks/tech-debt-resolution-v2_20260503/](./tracks/tech-debt-resolution-v2_20260503/)*

## Upcoming Tracks

- [ ] **Track: BM2 Activity Prop Validators** — **DEFERRED**
  *Create Convex validators for 40+ BM2 component types and replace v.record(v.string(), v.any()) with discriminated unions*
  *Link: [./measure/tracks/bm2-activity-prop-validators/](./measure/tracks/bm2-activity-prop-validators/)*

- [x] **Track: Reliability Contracts and DB Boundary Enforcement** — **COMPLETED**
   *Enforce strict data contracts at the database boundary, introduce branded types for IDs, and export canonical test fixtures*
   *Link: [./measure/tracks/reliability-contracts_20260504/](./measure/tracks/reliability-contracts_20260504/)*
   - Phase 1: Branded Types & Test Fixtures [COMPLETE] [checkpoint: eaf6fe8]
   - Phase 2: Convex Schema Boundary Enforcement [COMPLETE] [checkpoint: e2366a8]
   - Phase 3: SRS State Transition Validation [COMPLETE] [checkpoint: 76059dd]
   - Phase 4: App Adoption and Final Verification [COMPLETE] [checkpoint: a0620916]

- [x] **Track: SRS reviews.ts Test Coverage** — **COMPLETED**
     *Add unit tests for saveReview, getReviewsByCard, and getReviewsByStudent in convex/srs/reviews.ts*
     *Link: [./archive/srs_reviews_test_coverage_20260429/](./archive/srs_reviews_test_coverage_20260429/)*
     - Phase 1: Unit Tests for saveReview, getReviewsByCard, getReviewsByStudent [COMPLETE]
- [x] **Track: SRS saveCards Batch Mutation** — **COMPLETED**
     *Fix sequential await in saveCards by batching lookups and writes via Promise.all (2N → 2 DB round trips)*
     *Link: [./archive/srs-cards-batch-mutation_20260429/](./archive/srs-cards-batch-mutation_20260429/)*
     - Phase 1: Promise.all Batching [COMPLETE] (minimax-m2)
- [x] **Track: SRS Dashboard Streak Test Coverage** *Link: [./archive/srs_dashboard_streak_test_20260425/](./archive/srs_dashboard_streak_test_20260425/)*
- [x] **Track: Chatbot Prompt Injection Defense** — **COMPLETED**
     *Strengthen BM2/IM3 chatbot prompt injection defense with system prompt guard and pattern-based detection*
     *Link: [./archive/chatbot_prompt_guard_20260425/](./archive/chatbot_prompt_guard_20260425/)*
     - Phase 1: Core Injection Detection [COMPLETE]
     - Phase 2: BM2 Integration [COMPLETE]
     - Phase 3: IM3 Integration [COMPLETE]
     - Phase 4: Polish [COMPLETE]
- [x] **Track: RSC Bundle Optimization** — **COMPLETED**
     *Reduce RSC entry page chunk from 891 KB to 354 KB via vendor chunking (lucide-react, zod, @radix-ui, clsx, monorepo packages)*
     *Link: [./archive/rsc_bundle_optimization_20260429/](./archive/rsc_bundle_optimization_20260429/)*
      - Phase 1: Analyze and Document [COMPLETE]
      - Phase 2: Apply Code-Splitting [COMPLETE]
      - Phase 3: Verify (354 KB < 500 KB target) [COMPLETE]

- [x] **Track: Prompt Guard Hardening** — **COMPLETED**
     *Fix critical prompt injection defense vulnerabilities: Unicode/homoglyph normalization and regex false positive restructuring*
     *Link: [./archive/prompt_guard_hardening_20260429/](./archive/prompt_guard_hardening_20260429/)*
      - Phase 1: Unicode Normalization [COMPLETE]
      - Phase 2: Regex Restructuring [COMPLETE]
      - Phase 3: Verification and Handoff [COMPLETE]

- [x] **Track: SRS saveCards Batch Mutation** — **COMPLETED**
      *Batch saveCards lookups and writes via Promise.all to eliminate 2N sequential DB operations*
*Link: [./archive/srs-cards-batch-mutation_20260429/](./archive/srs-cards-batch-mutation_20260429/)*
      - Phase 1: Fix saveCards Sequential Await → Promise.all Batching [COMPLETE]

- [x] **Track: Teacher SRS Queries N+1 Batch Fix** — **COMPLETED**
      *Batch 2N+ per-student queries in getTeacherClassProficiencyHandler to O(1) broad queries*
      *Link: [./archive/teacher-srs-queries-batch_20260429/](./archive/teacher-srs-queries-batch_20260429/)*
      - Phase 1: Batch srs_cards and srs_review_log Queries [COMPLETE]
      - Phase 2: Batch competency_standards Query [COMPLETE]

- [x] **Track: Process Review studentId Cross-Validation** — **COMPLETED**
     *Add validation to processReviewHandler ensuring cardState.studentId matches reviewEntry.studentId*
     *Link: [./archive/process-review-student-cross-validation_20260429/](./archive/process-review-student-cross-validation_20260429/)*

- [x] **Track: Rate Limiter Test Coverage** — **COMPLETED**
     *Add unit tests for IM3 chatbot rateLimits.ts — getRateLimitStatus, checkAndIncrementRateLimit, cleanupStaleRateLimits*
     *Link: [./archive/rate-limiter-test-coverage_20260429/](./archive/rate-limiter-test-coverage_20260429/)*

## AP Precalculus

- [x] **Track: Scaffold AP Precalculus Application** — **COMPLETED**
     *Create minimal runnable shell for apps/pre-calculus/ — config, Convex schema, design system, auth, layout, landing page, seed data*
     *Link: [./archive/scaffold-pre-calculus_20260425/](./archive/scaffold-pre-calculus_20260425/)*

- [x] **Track: AP Precalculus Curriculum Definition** — **COMPLETED**
      *Define the canonical AP Precalculus curriculum pipeline from the College Board CED, clarification guidance, and local Passwater PDFs, matching IM3's course/unit/lesson/class-period planning model*
      *Link: [./tracks/precalc-curriculum-definition_20260501/](./tracks/precalc-curriculum-definition_20260501/)*

## Integrated Math 2

- [x] **Track: Scaffold Integrated Math 2 Application** — **COMPLETED**
     *Create minimal runnable shell for apps/integrated-math-2/ — config, Convex schema, design system (IM3 orange), auth, layout, landing page, seed data (13 units, ~67 lessons)*
     *Link: [./archive/scaffold-im2_20260425/](./archive/scaffold-im2_20260425/)*

- [x] **Track: Integrated Math 2 Curriculum Definition** — **COMPLETED**
     *Define the canonical IM2 curriculum pipeline from overview and local problem-type PDFs, matching IM3's course/unit/lesson/class-period planning model*
     *Link: [./archive/im2-curriculum-definition_20260501/](./archive/im2-curriculum-definition_20260501/)*
     - Phase 1: Source Inventory and Canonical Contract [x]
     - Phase 2: PDF Extraction and Source Normalization [x]
     - Phase 3: Unit, Lesson, and Class-Period Planning [x]
     - Phase 4: Implementation Bridge and Audit [x]
     - Phase 5: Curriculum Depth Remediation [x]

## Integrated Math 1

- [x] **Track: Scaffold Integrated Math 1 Application** — **COMPLETED**
     *Create minimal runnable shell for apps/integrated-math-1/ — config, Convex schema, design system (IM2 orange), auth, layout, landing page, seed data (14 modules, ~99 lessons)*
     *Link: [./archive/scaffold-im1_20260425/](./archive/scaffold-im1_20260425/)*

- [x] **Track: IM1 DESIGN.md and product.md** — **COMPLETED**
     *Add missing DESIGN.md and product.md to IM1 for parity with IM2 and PreCalc*
     *Link: [./archive/im1_design_and_product_docs_20260428/](./archive/im1_design_and_product_docs_20260428/)*
     - Phase 1: Author DESIGN.md [COMPLETE]
     - Phase 2: Author product.md [COMPLETE]
     - Phase 3: Verification [COMPLETE]

## Multi-App Curriculum Program (IM1, IM2, PreCalc)

Parallel tracks delivering complete curriculum for all three new apps. Tracks 1 and 2-4 can run in parallel; Tracks 5-8 are sequential dependencies.

- [x] **Track: Cross-App Component Extraction & Adoption** — **COMPLETED**
     *Extract all shareable components to packages: math activities, shell/auth, lesson rendering, study hub games, practice tests, teacher UI. Migrate IM3/BM2, adopt in IM1/IM2/PreCalc.*
     *Link: [./tracks/extract-activity-components_20260425/](./tracks/extract-activity-components_20260425/)*

- [ ] **Track: Curriculum Content Authoring — IM1**
     *Author complete curriculum content for Integrated Math 1: 14 modules, ~99 lessons*
     *Link: [./tracks/curriculum-authoring-im1_20260425/](./tracks/curriculum-authoring-im1_20260425/)*

- [x] **Track: BM2 Worker-Entry Bundle Optimization** — **COMPLETED**
      *Reduce BM2 worker-entry bundle from 5.1 MB to under 3 MB via tree-shaking, code-splitting, and import auditing*
      *Result: 2.0 MB (manualChunks + drizzle decoupling + lazy-loaded activities). CI-enforced 3 MB audit.*
      *Link: [./tracks/bm2-bundle-optimization_20260503/](./tracks/bm2-bundle-optimization_20260503/)*

- [x] **Track: Extract Shared Rate Limiter Package** — **COMPLETED**
      *Extract duplicated rate limiting logic from IM3/BM2 into shared @math-platform/rate-limiter package*
      *Result: 15 tests pass. Both apps consume via package. Concurrent inserts verified.*
      *Link: [./tracks/shared-rate-limiter-package_20260503/](./tracks/shared-rate-limiter-package_20260503/)*

- [x] **Track: Session History Cursor Pagination** — **COMPLETED**
      *Replace fetch-all-then-slice pattern with Convex cursor pagination for session history queries*
      *Result: Filter-before-paginate via by_student_and_status index + neq filter. BM2 N/A.*
      *Link: [./tracks/session-history-pagination_20260503/](./tracks/session-history-pagination_20260503/)*

- [x] **Track: Curriculum Content Authoring — IM2** — **COMPLETED**
     *Author complete curriculum content for Integrated Math 2: 13 units, ~67 lessons*
     *Link: [./tracks/curriculum-authoring-im2_20260425/](./tracks/curriculum-authoring-im2_20260425/)*

- [x] **Track: Curriculum Content Authoring — PreCalc** — **COMPLETED**
      *Author AP Precalculus lesson phases from the CED/Passwater planning layer: 4 units, 58 CED topics; Unit 4 locally unsourced and not AP-exam-assessed*
      *Depends on: AP Precalculus Curriculum Definition*
      *Link: [./tracks/curriculum-authoring-precalc_20260425/](./tracks/curriculum-authoring-precalc_20260425/)*

- [x] **Track: Standards & Objective Seeding — All Apps** — **PARTIALLY COMPLETE** (IM2 + PreCalc done; IM1 skipped)
     *Seed competency standards, lesson-standards mappings, and objective policies for IM1, IM2, and PreCalculus*
     *Depends on: Tracks 2, 3, 4*
     *Link: [./tracks/standards-seeding-multi-app_20260425/](./tracks/standards-seeding-multi-app_20260425/)*

- [x] **Track: Lesson Seeding — All Apps** — **PARTIALLY COMPLETE** (IM2 70 lessons + PreCalc 58 lessons done; IM1 skipped)
     *Seed all curriculum lessons into Convex database for IM1, IM2, and PreCalculus*
     *Depends on: Tracks 2, 3, 4, 5*
     *Link: [./tracks/lesson-seeding-multi-app_20260425/](./tracks/lesson-seeding-multi-app_20260425/)*

- [x] **Track: Problem Families & Practice Items — All Apps** — **PARTIALLY COMPLETE** (IM2 67 + PreCalc 40 families done; IM1 skipped)
     *Define problem families and practice item blueprints for IM1, IM2, and PreCalculus*
     *Depends on: Track 6*
     *Link: [./tracks/problem-families-multi-app_20260425/](./tracks/problem-families-multi-app_20260425/)*

- [x] **Track: Demo Environment & Verification — All Apps** — **PARTIALLY COMPLETE** (IM2 + PreCalc done; IM1 skipped)
     *Seed demo environments and run end-to-end verification for IM1, IM2, and PreCalculus*
     *Depends on: Tracks 6, 7*
      *Link: [./tracks/demo-verification-multi-app_20260425/](./tracks/demo-verification-multi-app_20260425/)*

- [x] **Track: Convex Best Practices Audit** — **AUDITED** (All 10 phases audited; Phase 9 fixes applied; remaining remediation deferred)
     *Systematic audit of all Convex backend code across 5 apps against Convex best practices — 10 categories, document findings and fix inline*
     *Link: [./tracks/convex-best-practices-audit_20260425/](./tracks/convex-best-practices-audit_20260425/)*

- [x] **Track: WCAG 2.1 AA Accessibility Audit & Remediation** — **PHASE 1 COMPLETE** (Automated audit baseline established)
     *Audit and remediate all student/teacher-facing routes against WCAG 2.1 AA — keyboard navigation, screen reader support, color contrast, activity component accessibility*
     *Link: [./tracks/accessibility-audit_20260502/](./tracks/accessibility-audit_20260502/)*

- [x] **Track: E2E Test Coverage for Critical Student Flows** — **INFRASTRUCTURE COMPLETE** (Playwright config + 9 tests)
     *Add Playwright E2E tests for login, lesson navigation, activity interaction, daily practice, and teacher dashboard flows*
     *Link: [./tracks/e2e-student-flows_20260502/](./tracks/e2e-student-flows_20260502/)*

- [x] **Track: Student Progress Data Export API** — **BACKEND COMPLETE** (Convex queries + CSV util + 12 tests; UI pending)
      *Add Convex queries and teacher UI for exporting student progress, class gradebook, and submission data as CSV/JSON*
      *Link: [./tracks/data-export-api_20260502/](./tracks/data-export-api_20260502/)*

- [x] **Track: Extract Shared Math Content Package** — **COMPLETED**
     *Extract practice problems, worked examples, algebraic logic, glossaries, and lesson seed patterns from IM2/IM3/PreCalc into shared @math-platform/math-content package; resolve v.any() schema fields and IM3 local import tech debt*
     *Depends on: Cross-App Component Extraction (complete)*
     *Link: [./tracks/extract-math-content-package_20260503/](./tracks/extract-math-content-package_20260503/)*
     - Phase 1: Package Scaffold & Schema Consolidation [x] (vite.config skipped — tsc-only pattern; schemas consolidated; v.any() reduced)
     - Phase 2: Algebraic Logic & Problem Families [x] (199 families + distractors + equivalence extracted)
     - Phase 3: Glossary & Seed Patterns [x] (76 terms, 6 helpers, seed types; app seed.ts imports skipped — type incompatibility)
     - Phase 4: IM3 Import Migration [x] (re-export barrels; 0 new type errors)
     - Phase 5: Package Quality & Documentation [x] [checkpoint: bd141ea] (43 tests, build verified, README done)

- [ ] **Track: Reliability Contracts & DB Boundary Enforcement**
     *Replace critical `v.any()` schema definitions with discriminated unions, introduce Branded IDs to prevent reference bugs, enforce SRS transitions mathematically, and export canonical test fixtures.*
     *Link: [./tracks/reliability-contracts_20260504/](./tracks/reliability-contracts_20260504/)*
