# Implementation Plan: Fix Pre-existing Lint Errors Across All Apps

## Phase 1: Fix IM3 Lint Errors

- [x] Task 1.1: Remove dead `SeedActivityContent` import and unused validator vars in IM3 schema files
  - Files: `apps/integrated-math-3/convex/seed/seed_lesson_standards.ts`, schema validators with unused exports
  - Action: Delete unused imports and variables; prefix with `_` if retention is required for side effects.

- [x] Task 1.2: Fix explicit `any` types in `convex/study.ts` and `e2e/accessibility.spec.ts`
  - Action: Replace with proper types where possible; add `eslint-disable-next-line` with justification where not.

- [x] Task 1.3: Fix `e2e/fixtures.ts` lint violations
  - Action: Remove unused `BrowserContext` import; fix or disable `react-hooks/rules-of-hooks` violations with justification.

- [x] Task 1.4: Fix unused `fullPath` in `scripts/validate-seed-integrity.mjs`
  - Action: Remove unused variable.

- [x] Task 1.5: Verify IM3 lint passes
  - Command: `npm run lint --prefix apps/integrated-math-3`
  - Must exit 0.

## Phase 2: Audit and Fix Remaining Apps

- [x] Task 2.1: Run BM2 lint and fix all errors
  - Command: `npm run lint --prefix apps/bus-math-v2`
  - Fix every reported error; prefer removal over suppression.

- [x] Task 2.2: Run IM1 lint and fix all errors
  - Command: `npm run lint --prefix apps/integrated-math-1`

- [x] Task 2.3: Run IM2 lint and fix all errors
  - Command: `npm run lint --prefix apps/integrated-math-2`

- [x] Task 2.4: Run PreCalc lint and fix all errors
  - Command: `npm run lint --prefix apps/pre-calculus`

## Phase 3: CI Lint Gate Expansion

- [ ] Task 3.1: Add IM1 app gate to `.github/workflows/ci.yml`
  - Add `im1` job parallel to `im3`/`bm2` with lint, test, typecheck, build steps.

- [ ] Task 3.2: Add IM2 app gate to `.github/workflows/ci.yml`
  - Add `im2` job.

- [ ] Task 3.3: Add PreCalc app gate to `.github/workflows/ci.yml`
  - Add `precalc` job.

## Phase 4: Final Verification and Cleanup

- [ ] Task 4.1: Run lint in all 5 apps and confirm zero errors
  - Commands: `npm run lint --prefix apps/<app>` for each app.

- [ ] Task 4.2: Update `measure/tech-debt.md`
  - Remove the resolved lint-error item.

- [ ] Task 4.3: Commit and checkpoint
  - Commit message: `fix(lint): Resolve pre-existing lint errors across all apps`
