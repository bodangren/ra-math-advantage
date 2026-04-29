# Implementation Plan: Activity Component Extraction

## Phase 1: Package Scaffold and Core Types [checkpoint: f62ebef]

- [x] Task: Create `packages/activity-components/` scaffold [f62ebef]
    - [x] Initialize package with `package.json`, `tsconfig.json`, `vitest.config.ts`
    - [x] Set up `src/` directory structure: `components/`, `registry/`, `schemas/`, `renderer/`, `types/`
    - [x] Configure build (tsc --noEmit)
- [x] Task: Extract shared types to package [f62ebef]
    - [x] Move `ActivityComponentProps` interface to `src/types/index.ts`
    - [x] Resolve flat vs nested prop interface inconsistency (standardize on nested canonical form)
    - [x] Export `ActivityMode` from `@math-platform/activity-runtime` (via types)
    - [x] Write tests for type exports
- [x] Task: Extract registry to package [f62ebef]
    - [x] Move `registerActivity`, `getActivityComponent`, `getRegisteredActivityKeys`, `clearActivityRegistry` to `src/registry/index.ts`
    - [x] Write unit tests for registry API

## Phase 2: Extract Activity Components [checkpoint: 85d06ef]

- [x] Task: Extract ComprehensionQuiz component [85d06ef]
    - [x] Move `ComprehensionQuiz.tsx` and `ComprehensionQuizActivity.tsx` to `src/components/quiz/`
    - [x] Move Zod schema to `src/schemas/comprehension-quiz.schema.ts`
    - [x] Write tests for component rendering and schema validation
- [x] Task: Extract FillInTheBlank component [85d06ef]
    - [x] Move `FillInTheBlank.tsx` and `FillInTheBlankActivity.tsx` to `src/components/blanks/`
    - [x] Move Zod schema to `src/schemas/fill-in-the-blank.schema.ts`
    - [x] Write tests
- [x] Task: Extract RateOfChangeCalculator component [85d06ef]
    - [x] Move `RateOfChangeCalculator.tsx` and `RateOfChangeCalculatorActivity.tsx` to `src/components/roc/`
    - [x] Move Zod schema to `src/schemas/rate-of-change.schema.ts`
    - [x] Write tests
- [x] Task: Extract DiscriminantAnalyzer component [85d06ef]
    - [x] Move `DiscriminantAnalyzer.tsx` and `DiscriminantAnalyzerActivity.tsx` to `src/components/discriminant/`
    - [x] Move Zod schema to `src/schemas/discriminant.schema.ts`
    - [x] Write tests
- [x] Task: Extract StepByStepSolver component [85d06ef]
    - [x] Move `StepByStepper.tsx`, `MathInputField.tsx`, `StepByStepSolverActivity.tsx` to `src/components/algebraic/`
    - [x] Move Zod schema to `src/schemas/step-by-step-solver.schema.ts`
    - [x] Write tests
- [x] Task: Extract GraphingExplorer component [85d06ef]
    - [x] Move `GraphingExplorer.tsx`, `GraphingExplorerActivity.tsx`, `GraphingCanvas.tsx`, `HintPanel.tsx`, `InterceptIdentification.tsx`, `InteractiveTableOfValues.tsx` to `src/components/graphing/`
    - [x] Move Zod schema to `src/schemas/graphing-explorer.schema.ts`
    - [x] Write tests

## Phase 3: Extract ActivityRenderer [checkpoint: pending]

- [x] Task: Extract ActivityRenderer to package
    - [x] Move `ActivityRenderer.tsx` to `src/renderer/ActivityRenderer.tsx`
    - [x] Ensure Suspense wrapping and timing injection logic is generic (optional `useTiming` hook)
    - [x] Write tests for renderer lookup and fallback behavior (14 tests covering registered/unregistered components and timing injection)

## Phase 4: Package Exports and IM3 Migration

- [ ] Task: Define package exports
    - [ ] Create `src/index.ts` with all public exports
    - [ ] Verify tree-shaking works (only imported components are bundled)
- [ ] Task: Migrate IM3 to use shared package
    - [ ] Replace local activity component imports with `@math-platform/activity-components`
    - [ ] Replace local registry with shared registry
    - [ ] Replace local ActivityRenderer with shared ActivityRenderer
    - [ ] Keep `equivalence.ts` and `distractors.ts` as IM3-local
    - [ ] Run IM3 test suite — all tests must pass
- [ ] Task: Update IM3 activity registration
    - [ ] Update `lib/activities/registry.ts` to re-export from package or delegate
    - [ ] Verify lazy loading still works

## Phase 5: IM2 and PreCalculus Adoption

- [ ] Task: Register shared components in IM2
    - [ ] Create `apps/integrated-math-2/lib/activities/registry.ts`
    - [ ] Import and register all 6 shared activity types
    - [ ] Verify components render in IM2 lesson context
- [ ] Task: Register shared components in PreCalculus
    - [ ] Create `apps/pre-calculus/lib/activities/registry.ts`
    - [ ] Import and register all 6 shared activity types
    - [ ] Verify components render in PreCalculus lesson context
- [ ] Task: Verify cross-app isolation
    - [ ] Confirm IM2 registrations don't affect IM3 or PreCalculus
    - [ ] Confirm PreCalculus registrations don't affect IM3 or IM2
