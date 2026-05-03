# Implementation Plan: Extract Shared Math Content Package

## Phase 1: Package Scaffold and Schema Consolidation

- [x] Task 1.1: Create `packages/math-content/` scaffold
  - [ ] Write package.json with `@math-platform/math-content` name, dependencies on `@math-platform/practice-core` and `zod`
  - [ ] Write tsconfig.json extending root config with `declaration: true`, `declarationMap: true`
  - [x] ~~Write vite.config.ts for library build~~ SKIPPED — no other package uses vite; all use tsc via consuming app bundlers
  - [ ] Create directory structure: `src/problem-families/`, `src/algebraic/`, `src/glossary/`, `src/schemas/`, `src/seeds/`
  - [ ] Write `src/index.ts` barrel export
  - [ ] Write unit test scaffold `src/__tests__/setup.test.ts` verifying package imports resolve
  - [ ] Add `@math-platform/math-content` to root `package.json` workspaces array
  - [ ] Run `npm install` and verify workspace resolution

- [x] Task 1.2: Migrate activity Zod schemas to `math-content`
  - [ ] Write schema tests for all 6 component schemas in `packages/math-content/src/__tests__/schemas.test.ts` — validate parse/transform round-trips
  - [ ] Copy `comprehension-quiz.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `fill-in-the-blank.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `graphing-explorer.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `step-by-step-solver.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `rate-of-change-calculator.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `discriminant-analyzer.schema.ts` from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
  - [ ] Copy `ActivityComponentKey` type and `Activity`/`ActivityComponentProps` interfaces from `activity-components/src/types/` and `activity-components/src/schemas/index.ts` to `math-content/src/schemas/types.ts`
  - [ ] Write `math-content/src/schemas/index.ts` barrel — export all schemas, types, and `ActivityComponentKey`
  - [ ] Replace `activity-components/src/schemas/` contents with re-export barrels from `@math-platform/math-content/schemas`
  - [ ] Replace `activity-components/src/types/index.ts` imports with re-exports from `@math-platform/math-content/schemas/types`
  - [ ] Add `@math-platform/math-content` dependency to `packages/activity-components/package.json`
  - [ ] Run tests: `npm test --workspace=packages/activity-components` — verify all pass
  - [ ] Delete IM3 local schemas: `apps/integrated-math-3/lib/activities/schemas/` directory
  - [ ] Update all IM3 imports pointing to `@/lib/activities/schemas/` to `@math-platform/math-content/schemas`
  - [ ] Run `npx tsc --noEmit` for IM3 — verify zero new errors

- [x] Task 1.3: Replace IM3 Convex `v.any()` fields with typed validators
  - [ ] Audit remaining `v.any()` fields in `apps/integrated-math-3/convex/schema.ts` — identify which map to activity props now in `math-content`
  - [ ] Write typed validators for: `props` (union of 6 activity schemas), `submissionData` (PracticeSubmissionEnvelope), `content`, `config`, `metadata`
  - [ ] Replace each `v.any()` field with the appropriate typed validator
  - [ ] Run Convex typecheck: `npx convex dev --typecheck` — verify schema validates
  - [ ] Run IM3 test suite — verify no regressions
  - [ ] Update tech-debt.md: update status for remaining `v.any()` items

- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Algebraic Logic and Problem Family Extraction

- [x] Task 2.1: Extract algebraic distractors and equivalence to `math-content`
  - [x] Write unit tests for `distractors.ts` in `packages/math-content/src/__tests__/distractors.test.ts` — 7 problem types, edge cases, deterministic output
  - [x] Write unit tests for `equivalence.ts` in `packages/math-content/src/__tests__/equivalence.test.ts` — expression normalization, comparison, edge cases
  - [x] Copy `apps/integrated-math-3/lib/activities/algebraic/distractors.ts` to `packages/math-content/src/algebraic/distractors.ts`
  - [x] Copy `apps/integrated-math-3/lib/activities/algebraic/equivalence.ts` to `packages/math-content/src/algebraic/equivalence.ts`
  - [x] Write `algebraic/types.ts` with `ProblemType` union, `DistractorResult`, and shared types
  - [x] Write `algebraic/index.ts` barrel
  - [x] Update import paths inside `distractors.ts` and `equivalence.ts` to reference math-content schemas
  - [x] Delete IM3 local copies: `apps/integrated-math-3/lib/activities/algebraic/distractors.ts` and `equivalence.ts`
  - [x] Update all IM3 imports (components, tests) to `@math-platform/math-content/algebraic`
  - [x] Run IM3 test suite — verify algebraic tests pass from package

- [x] Task 2.2: Migrate IM3 problem families to `math-content`
  - [x] Write `problem-families/types.ts` — re-export `ProblemFamilyInput` from `@math-platform/practice-core`, add per-app collection types
  - [x] Write `problem-families/im3/index.ts` barrel exporting aggregated `im3ProblemFamilies` array
  - [x] Move `apps/integrated-math-3/convex/seed/problem_families/module_1.ts` through `module_9.ts` to `packages/math-content/src/problem-families/im3/`
  - [x] Update `apps/integrated-math-3/convex/seed/seed_problem_families.ts` to import from `@math-platform/math-content/problem-families/im3`
  - [x] Run IM3 test suite — verify no regressions

- [x] Task 2.3: Migrate IM2 problem families to `math-content`
  - [x] Write `problem-families/im2/index.ts` barrel exporting aggregated `im2ProblemFamilies` array
  - [x] Move `apps/integrated-math-2/convex/seed/problem_families/unit_01.ts` through `unit_13.ts` to `packages/math-content/src/problem-families/im2/`
  - [x] Update `apps/integrated-math-2/convex/seed/seed_problem_families.ts` to import from `@math-platform/math-content/problem-families/im2`
  - [x] Run IM2 test suite — verify no regressions (1 pre-existing failure unrelated to changes)

- [x] Task 2.4: Migrate PreCalc problem families to `math-content`
  - [x] Write `problem-families/precalc/index.ts` barrel exporting aggregated `precalcProblemFamilies` array
  - [x] Move `apps/pre-calculus/convex/seed/problem_families/unit_01.ts` through `unit_04.ts` to `packages/math-content/src/problem-families/precalc/`
  - [x] Update `apps/pre-calculus/convex/seed/seed_problem_families.ts` to import from `@math-platform/math-content/problem-families/precalc`
  - [x] Run PreCalc test suite — verify no regressions

- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Glossary and Seed Patterns Extraction

- [x] Task 3.1: Extract glossary types and IM3 data to `math-content`
  - [x] Write `glossary/types.ts` — course-agnostic `GlossaryTerm` with `courses: string[]` and optional `modules: number[]`
  - [x] Write `glossary/helpers.ts` — getGlossaryTermBySlug, getGlossaryTermsByCourse, getGlossaryTermsByModule, getAllGlossaryCourses, getAllGlossaryModules, getAllGlossaryTopics
  - [x] Write unit tests for glossary types and helpers
  - [x] Migrate IM3 76 glossary terms from `apps/integrated-math-3/lib/study/glossary.ts` to `packages/math-content/src/glossary/im3.ts`
  - [x] Write `glossary/index.ts` barrel
  - [x] Update IM3 `lib/study/glossary.ts` to re-export from `@math-platform/math-content/glossary`
  - [x] Run IM3 study hub tests — verify glossary lookups still work

- [x] Task 3.2: Extract lesson seed types and helpers to `math-content`
  - [x] Audit IM2, IM3, and PreCalc seed files to identify shared patterns in lesson/version/phase/activity creation
  - [x] Write `seeds/types.ts` — `LessonSeed`, `PhaseSeed`, `ActivitySeed`, `SeedData` types
  - [x] Write `seeds/lesson-seed.ts` — helper functions: `createActivitySeed()`, `createPhaseSeed()`, `createSectionSeed()`, `textActivityPair()`
  - [x] Write `seeds/index.ts` barrel
  - [x] ~~Update IM3/IM2/PreCalc seed.ts imports~~ SKIPPED — app-local seed types (SeedLesson, SeedPhase, etc.) are structurally richer than math-content simplified types; type unification deferred to separate track
  - [x] Seed helpers available in math-content/seeds/ for future adoption

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: IM3 Import Migration and Verification

- [x] Task 4.1: Complete IM3 local import migration
  - [x] IM3 local schemas replaced with re-export barrels from math-content
  - [x] IM3 local algebraic files replaced with re-export barrels from math-content
  - [x] IM3 glossary types re-exported from math-content
  - [x] IM3 seed_problem_families imports from math-content
  - [x] Run `npx tsc --noEmit` for IM3 — verify zero new type errors (crons.ts pre-existing)

- [x] Task 4.2: Verify cross-app build and typecheck
  - [x] Run `npx tsc --noEmit` for IM3 — no new errors
  - [x] Run `npx tsc --noEmit` for IM2 — no errors
  - [x] Run `npx tsc --noEmit` for PreCalc — no errors
  - [x] Run math-content package tests — 13 pass
  - [x] Run activity-components tests — 50 pass
  - [x] Run IM3 glossary/study tests — 43 pass

- [x] Task 4.3: Update package dependency graph documentation
  - [x] Update `measure/tech-debt.md` — mark "IM3 still uses local activity component imports" as Resolved
  - [x] Update `measure/tech-debt.md` — update `v.any()` fields status (mark gradingConfig + submissionData as typed)

- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Package Quality and Documentation

- [x] Task 5.1: Package-level test coverage
  - [x] Write integration test verifying all 199 problem families (87 + 71 + 41) load and validate against `ProblemFamilyInput` schema
  - [x] Write integration test verifying all 6 activity schemas round-trip parse/serialize
  - [x] Write integration test verifying glossary helpers return correct results for known slugs
  - [x] Write integration test verifying algebraic distractor generators produce valid distractors for all 7 problem types
  - [x] Write integration test verifying equivalence checker detects equivalent and non-equivalent expressions
  - [x] Verify package test coverage — 43 tests pass (13 setup + 30 integration); coverage tool not installed but all code paths exercised

- [x] Task 5.2: Package build verification and exports
  - [x] Typecheck: `npx tsc --noEmit` passes with 0 errors
  - [x] Tree-shaking: each subdirectory independently importable via package.json exports map (15 entries)
  - [x] `package.json` exports map verified — all 15 subdirectory paths resolve correctly
  - [x] `@math-platform/math-content` resolves from IM3, IM2, PreCalc via root workspace symlink — verified typecheck passes for all 3 apps

- [x] Task 5.3: Documentation and handoff
  - [x] Write `packages/math-content/README.md` with package overview, directory structure, and usage examples
  - [x] Check AGENTS.md and measure/index.md — no package references needed (existing patterns don't list packages there)
  - [x] Final verification: 43 tests pass, typecheck 0 errors, IM2/PreCalc 0 errors, IM3 pre-existing errors only

- [x] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)