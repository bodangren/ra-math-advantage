# Implementation Plan — Activity Infrastructure

## Phase 1: Registry & Mode System

- [ ] Task: Create activity registry `lib/activities/registry.ts`
    - [ ] Write tests: `getActivityComponent()` returns component for registered key, null for unknown
    - [ ] Write tests: `getRegisteredKeys()` returns all 6 Module 1 keys
    - [ ] Implement registry with lazy-loaded placeholder components for each key

- [ ] Task: Create mode system `lib/activities/modes.ts`
    - [ ] Write tests: teacher role always resolves to `teaching` mode
    - [ ] Write tests: student in `worked_example` phase → `guided`; `independent_practice` → `practice`; `assessment` → `practice`
    - [ ] Write tests: activity-level config override works
    - [ ] Implement `ActivityMode` type, `resolveActivityMode()` function

- [ ] Task: Define `ActivityComponentProps` interface in `types/activity.ts`
    - [ ] Write tests: type compatibility with `PracticeSubmissionEnvelope` from contract
    - [ ] Implement interface with `activity`, `mode`, `onSubmit`, `onComplete`

- [ ] Task: Conductor — Phase Completion Verification 'Registry & Mode System' (Protocol in workflow.md)

## Phase 2: Props Schemas

- [ ] Task: Create `lib/activities/schemas/graphing-explorer.schema.ts`
    - [ ] Write tests: validates correct props (equation, domain, range, points); rejects malformed
    - [ ] Implement Zod schema

- [ ] Task: Create `lib/activities/schemas/step-by-step-solver.schema.ts`
    - [ ] Write tests: validates correct props (problemType, steps, equation, hints); rejects malformed
    - [ ] Implement Zod schema

- [ ] Task: Create remaining 4 props schemas
    - [ ] Write tests for `comprehension-quiz.schema.ts` (questions, choices, correctAnswers)
    - [ ] Write tests for `fill-in-the-blank.schema.ts` (template, blanks, answers)
    - [ ] Write tests for `rate-of-change-calculator.schema.ts` (sourceType, data, interval)
    - [ ] Write tests for `discriminant-analyzer.schema.ts` (equation, coefficients)
    - [ ] Implement all 4 schemas

- [ ] Task: Create schema index `lib/activities/schemas/index.ts` mapping componentKey → schema
    - [ ] Write test: `getPropsSchema(key)` returns correct schema for each key
    - [ ] Implement index with `getPropsSchema()` function

- [ ] Task: Conductor — Phase Completion Verification 'Props Schemas' (Protocol in workflow.md)

## Phase 3: Submission Pipeline

- [ ] Task: Create client-side submission handler `lib/activities/submission.ts`
    - [ ] Write tests: builds valid envelope, validates against practice.v1 schema
    - [ ] Write tests: posts to API endpoint, handles success and error responses
    - [ ] Implement `submitActivity()` function

- [ ] Task: Create API route `app/api/activities/submit/route.ts`
    - [ ] Write tests: validates envelope, calls Convex mutation, returns confirmation
    - [ ] Write tests: rejects invalid envelope with 400, rejects unauthenticated with 401
    - [ ] Implement POST handler

- [ ] Task: Verify/update `convex/activities.ts` submission mutation
    - [ ] Write tests: creates activity_submissions record, creates activity_completions record
    - [ ] Write tests: updates student_competency when standardId is present
    - [ ] Implement or update `submitActivity` mutation

- [ ] Task: Conductor — Phase Completion Verification 'Submission Pipeline' (Protocol in workflow.md)

## Phase 4: Completion Tracking

- [ ] Task: Create `lib/activities/completion.ts`
    - [ ] Write tests: tracks completed activities per phase; returns `allComplete` boolean
    - [ ] Write tests: integrates with PhaseCompleteButton gating logic
    - [ ] Implement `PhaseActivityTracker` class or functions

- [ ] Task: Conductor — Phase Completion Verification 'Completion Tracking' (Protocol in workflow.md)
