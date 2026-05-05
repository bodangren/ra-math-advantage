# Specification: Fix Pre-existing Lint Errors Across All Apps

## Overview

The project currently has pre-existing lint errors that block `npm run lint` in `apps/integrated-math-3` and likely exist in other apps. This track eliminates all lint failures across the monorepo, adds missing CI lint gates for `integrated-math-1`, `integrated-math-2`, and `pre-calculus`, and ensures lint is a blocking quality gate in CI.

## Functional Requirements

1. **Fix IM3 lint errors** — Resolve the 12 known errors:
   - Unused variables in schema validators (`graphingExplorerPropsValidator`, `stepByStepSolverPropsValidator`, `comprehensionQuizPropsValidator`, `fillInTheBlankPropsValidator`, `rateOfChangeCalculatorPropsValidator`, `discriminantAnalyzerPropsValidator`)
   - `any` types in `convex/study.ts` and `e2e/accessibility.spec.ts`
   - `BrowserContext` unused import and `react-hooks/rules-of-hooks` violations in `e2e/fixtures.ts`
   - Unused `fullPath` in `scripts/validate-seed-integrity.mjs`

2. **Audit and fix remaining apps** — Run `npm run lint` in `apps/bus-math-v2`, `apps/integrated-math-1`, `apps/integrated-math-2`, and `apps/pre-calculus`; fix all errors found.

3. **Add CI lint gates** — Extend `.github/workflows/ci.yml` to run lint for `integrated-math-1`, `integrated-math-2`, and `pre-calculus` so they cannot regress.

4. **Verify root-level lint orchestration** — Ensure `npm run lint` (or equivalent workspace fanout) can be run cleanly from the repo root.

## Non-Functional Requirements

- Prefer removing dead code over suppressing lint rules.
- For unavoidable `any` types, use explicit `eslint-disable-next-line` comments with a justification.
- Do not change runtime behavior; this is a purely static-analysis cleanup track.

## Acceptance Criteria

- [ ] `npm run lint` passes cleanly in all 5 apps (`integrated-math-3`, `bus-math-v2`, `integrated-math-1`, `integrated-math-2`, `pre-calculus`).
- [ ] `.github/workflows/ci.yml` includes a lint step for IM1, IM2, and PreCalc.
- [ ] `tech-debt.md` is updated: the lint-error item is removed or marked Resolved.
- [ ] No new TypeScript compilation errors introduced (`npx tsc --noEmit` in affected apps).
- [ ] No test failures introduced.

## Out of Scope

- Refactoring for performance or readability (unless required to resolve a lint error).
- Adding new lint rules or changing ESLint configuration.
- Fixing TypeScript errors that are not also lint errors.
