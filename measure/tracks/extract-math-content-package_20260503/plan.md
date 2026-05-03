# Implementation Plan: Extract Shared Math Content Package

## Phase 1: Package Scaffold and Schema Consolidation

- [x] Task 1.1: Create `packages/math-content/` scaffold
  - [ ] Write package.json with `@math-platform/math-content` name, dependencies on `@math-platform/practice-core` and `zod`
  - [ ] Write tsconfig.json extending root config with `declaration: true`, `declarationMap: true`
  - [ ] Write vite.config.ts for library build with `rollupOptions.input` for each subdirectory entry point
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
  - [ ] Update IM3 `convex/seed/seed.ts` to import seed types from `@math-platform/math-content/seeds`
  - [ ] Update IM2 `convex/seed/seed.ts` similarly
  - [ ] Update PreCalc `convex/seed/seed.ts` similarly
  - [ ] Run all 3 app test suites — verify seed types compile and don't break mutations

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: IM3 Import Migration and Verification

- [ ] Task 4.1: Complete IM3 local import migration
  - [ ] Grep all remaining imports from `@/lib/activities/` in IM3 that should now use `@math-platform/math-content`
  - [ ] Grep all remaining imports from `@/lib/study/glossary` in IM3
  - [ ] Update `apps/integrated-math-3/lib/activities/registry.ts` — import schemas and types from `@math-platform/math-content/schemas`
  - [ ] Update `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx` — import distractors/equivalence from `@math-platform/math-content/algebraic`
  - [ ] Update all test files that import from former local paths
  - [ ] Verify zero local activity schema or algebraic logic imports remain in IM3
  - [ ] Run `npx tsc --noEmit` for IM3 — verify zero type errors
  - [ ] Run `CI=true npm test --workspace=apps/integrated-math-3` — verify all tests pass

- [ ] Task 4.2: Verify cross-app build and typecheck
  - [ ] Run `npx tsc --noEmit` for all 5 apps (IM1, IM2, IM3, PreCalc, BM2) — verify zero errors
  - [ ] Run `npm run build` at root — verify monorepo builds successfully
  - [ ] Run `CI=true npm test` for IM2 — verify problem families and seeding pass
  - [ ] Run `CI=true npm test` for PreCalc — verify problem families and seeding pass
  - [ ] Run `CI=true npm test --workspace=packages/math-content` — verify all package tests pass
  - [ ] Run `CI=true npm test --workspace=packages/activity-components` — verify re-exports work

- [ ] Task 4.3: Update package dependency graph documentation
  - [ ] Update `measure/tech-stack.md` with `@math-platform/math-content` package entry and dependency edges
  - [ ] Update `measure/tech-debt.md` — mark "IM3 still uses local activity component imports" as Resolved
  - [ ] Update `measure/tech-debt.md` — update `v.any()` fields status (mark schema-typed ones as Resolved, list remaining)
  - [ ] Add lesson learned: "When extracting shared packages, always use barrel re-exports in the old location to maintain backward compatibility"

- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Package Quality and Documentation

- [ ] Task 5.1: Package-level test coverage
  - [ ] Write integration test verifying all 199 problem families (87 + 71 + 41) load and validate against `ProblemFamilyInput` schema
  - [ ] Write integration test verifying all 6 activity schemas round-trip parse/serialize
  - [ ] Write integration test verifying glossary helpers return correct results for known slugs
  - [ ] Write integration test verifying algebraic distractor generators produce valid distractors for all 7 problem types
  - [ ] Write integration test verifying equivalence checker detects equivalent and non-equivalent expressions
  - [ ] Verify package test coverage >80%

- [ ] Task 5.2: Package build verification and exports
  - [ ] Verify `npm run build --workspace=packages/math-content` produces correct output in `dist/`
  - [ ] Verify tree-shaking: each subdirectory (`problem-families`, `algebraic`, `glossary`, `schemas`, `seeds`) is independently importable
  - [ ] Verify `package.json` exports map correctly maps subdirectory paths
  - [ ] Verify `@math-platform/math-content` resolves correctly when imported from each app workspace

- [ ] Task 5.3: Documentation and handoff
  - [ ] Write `packages/math-content/README.md` with package overview, directory structure, and usage examples
  - [ ] Update any affected `AGENTS.md` or `measure/` documentation with package reference
  - [ ] Final `npm run build && npx tsc --noEmit` verification across all apps

- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)