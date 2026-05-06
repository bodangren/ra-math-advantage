# Implementation Plan: Fix Pre-existing Lint Errors Across All Apps

## Phase 1: Fix IM3 Lint Errors

- [x] Task 1.1: Fix `any` type in `e2e/accessibility.spec.ts`
  - File: `apps/integrated-math-3/e2e/accessibility.spec.ts` — `page: any` → `page: Page`.
  - Note: The 6 schema validators and `SeedActivityContent` import listed in the spec had no lint errors — validators are consumed by `activityPropsValidator` union, and `SeedActivityContent` was already absent.

- [x] Task 1.2: Fix `e2e/fixtures.ts` lint violations
  - Action: Remove unused `BrowserContext` import; suppress `react-hooks/rules-of-hooks` on Playwright fixture callbacks with justification.

- [x] Task 1.3: Fix unused `fullPath` in `scripts/validate-seed-integrity.mjs`
  - Action: Remove unused variable.

- [x] Task 1.4: Verify IM3 lint passes
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

- [x] Task 3.1: Add IM1, IM2, and PreCalc CI gates to `.github/workflows/ci.yml`
  - Added as 3 separate `im1`, `im2`, `precalc` jobs, each running lint → typecheck → build.
  - Test steps deferred (pre-existing Convex provider test failures in those apps).

- [x] Task 3.2: Refactor `im1`/`im2`/`precalc` jobs into a single matrix strategy [checkpoint: a0d6f74]
  - Review fix: deduplicate 3 identical jobs into `strategy.matrix` with app name and prefix.

## Phase 4: Final Verification and Cleanup [checkpoint: 97f1efd]

- [x] Task 4.1: Run lint in all 5 apps and confirm zero errors
  - Commands: `npm run lint --prefix apps/<app>` for each app.

- [x] Task 4.2: Update `measure/tech-debt.md`
  - Remove the resolved lint-error item.

- [x] Task 4.3: Commit and checkpoint
  - Commit message: `fix(lint): Resolve pre-existing lint errors across all apps`
