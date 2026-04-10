# Implementation Plan — Activity Infrastructure

## Phase 1: Registry & Mode System [checkpoint: 4269236]

- [x] Task: Create activity registry `lib/activities/registry.ts` [ef7cbcd]
    - [x] Write tests: `getActivityComponent()` returns component for registered key, null for unknown
    - [x] Write tests: `getRegisteredKeys()` returns all 6 Module 1 keys
    - [x] Implement registry with lazy-loaded placeholder components for each key

- [x] Task: Create mode system `lib/activities/modes.ts` [b69c4bd]
    - [x] Write tests: teacher role always resolves to `teaching` mode
    - [x] Write tests: student in `worked_example` phase → `guided`; `independent_practice` → `practice`; `assessment` → `practice`
    - [x] Write tests: activity-level config override works
    - [x] Implement `ActivityMode` type, `resolveActivityMode()` function

- [x] Task: Define `ActivityComponentProps` interface in `types/activity.ts` [d1fd880]
    - [x] Write tests: type compatibility with `PracticeSubmissionEnvelope` from contract
    - [x] Implement interface with `activity`, `mode`, `onSubmit`, `onComplete`

- [x] Task: Conductor — Phase Completion Verification 'Registry & Mode System' (Protocol in workflow.md) [4269236]

## Phase 2: Props Schemas [checkpoint: 946e5b3]

- [x] Task: Create `lib/activities/schemas/graphing-explorer.schema.ts` [308f449]
    - [x] Write tests: validates correct props (equation, domain, range, points); rejects malformed
    - [x] Implement Zod schema

- [x] Task: Create `lib/activities/schemas/step-by-step-solver.schema.ts` [9a77480]
    - [x] Write tests: validates correct props (problemType, steps, equation, hints); rejects malformed
    - [x] Implement Zod schema

- [x] Task: Create remaining 4 props schemas [2f78751, 1eb1dd3, ea71f0b, 42fc266]
    - [x] Write tests for `comprehension-quiz.schema.ts` (questions, choices, correctAnswers)
    - [x] Write tests for `fill-in-the-blank.schema.ts` (template, blanks, answers)
    - [x] Write tests for `rate-of-change-calculator.schema.ts` (sourceType, data, interval)
    - [x] Write tests for `discriminant-analyzer.schema.ts` (equation, coefficients)
    - [x] Implement all 4 schemas

- [x] Task: Create schema index `lib/activities/schemas/index.ts` mapping componentKey → schema [5258992]
    - [x] Write test: `getPropsSchema(key)` returns correct schema for each key
    - [x] Implement index with `getPropsSchema()` function

- [x] Task: Conductor — Phase Completion Verification 'Props Schemas' (Protocol in workflow.md) [946e5b3]

## Phase 3: Submission Pipeline [checkpoint: b6c0580]

- [x] Task: Create client-side submission handler `lib/activities/submission.ts` [d6d968a]
    - [x] Write tests: builds valid envelope, validates against practice.v1 schema
    - [x] Write tests: posts to API endpoint, handles success and error responses
    - [x] Implement `submitActivity()` function

- [x] Task: Create API route `app/api/activities/submit/route.ts` [d6d968a]
    - [x] Write tests: validates envelope, calls Convex mutation, returns confirmation
    - [x] Write tests: rejects invalid envelope with 400, rejects unauthenticated with 401
    - [x] Implement POST handler

- [x] Task: Verify/update `convex/activities.ts` submission mutation [d6d968a]
    - [x] Write tests: creates activity_submissions record, creates activity_completions record
    - [x] Write tests: updates student_competency when standardId is present
    - [x] Implement or update `submitActivity` mutation

- [x] Task: Conductor — Phase Completion Verification 'Submission Pipeline' (Protocol in workflow.md)

## Phase 4: Completion Tracking [checkpoint: fcf486f]

- [x] Task: Create `lib/activities/completion.ts` [fcf486f]
    - [x] Write tests: tracks completed activities per phase; returns `allComplete` boolean
    - [x] Write tests: integrates with PhaseCompleteButton gating logic
    - [x] Implement `PhaseActivityTracker` class or functions

- [x] Task: Conductor — Phase Completion Verification 'Completion Tracking' (Protocol in workflow.md)
