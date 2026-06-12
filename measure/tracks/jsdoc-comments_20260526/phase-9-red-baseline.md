# Phase 9 Red Baseline — Packages `components/`, `lib/`, `other/`

> **Track:** jsdoc-comments_20260526
> **Phase:** 9 — Packages `components/`, `lib/`, `other/` — 41 functions (plan heading)
> **Red baseline commit:** `2a132247` (Phase 8 Red baseline; Phase 9 guards created at this commit)
> **Date:** 2026-06-12

## Scope

Phase 9 covers all functions in `packages/*/src/components/`, `packages/*/src/lib/`,
`packages/*/src/hooks/`, `packages/*/src/utils/`, and `packages/*/src/types/`.

Phase 8 covered `packages/*/src/` top-level files. Phase 9 covers the subdirectories.

## Live Graph Counts (post-refresh)

> **Important:** The initial graph.db was from Phase 5 (stale). After `build-graph scan`,
> Phase 9 scope shows **0 NULL functions** — Phase 8's `packages/*/src/` LIKE pattern
> already covers all subdirectories. The 38-NULL count below was from the stale graph.

| Metric | Count |
|--------|-------|
| Total functions in scope | 44 |
| NULL summaries (total) | 0 (Phase 8 already covered) |
| NULL summaries (exported) | 0 |
| NULL summaries (internal) | 0 |
| Already documented | 44 |

## Guard Scripts

| Guard | Command | Expected Result |
|-------|---------|-----------------|
| Coverage | `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-remaining.sh` | FAIL (exit 1), 38 NULL |
| Line-length | `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-remaining.sh` | TBD (run to establish baseline) |
| Verification | `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-9.sh` | FAIL (exit 1), 3 unfilled fields |

## Per-File NULL Breakdown

| File | NULL count |
|------|-----------|
| packages/activity-components/src/components/roc/RateOfChangeCalculator.tsx | 5 |
| packages/activity-components/src/components/quiz/ComprehensionQuiz.tsx | 5 |
| packages/activity-components/src/components/discriminant/DiscriminantAnalyzer.tsx | 4 |
| packages/activity-components/src/components/algebraic/StepByStepper.tsx | 4 |
| packages/activity-components/src/components/blanks/FillInTheBlank.tsx | 3 |
| packages/lesson-renderer/src/components/VideoPlayer.tsx | 2 |
| packages/lesson-renderer/src/components/Skeletons.tsx | 2 |
| packages/activity-components/src/components/algebraic/StepByStepSolverActivity.tsx | 2 |
| packages/activity-components/src/components/graphing/*.tsx | 6 (1 each) |
| packages/activity-components/src/components/blanks/FillInTheBlankActivity.tsx | 1 |
| packages/activity-components/src/components/discriminant/DiscriminantAnalyzerActivity.tsx | 1 |
| packages/activity-components/src/components/algebraic/MathInputField.tsx | 1 |
| packages/activity-components/src/components/roc/RateOfChangeCalculatorActivity.tsx | 1 |
| packages/lesson-renderer/src/lib/cn.ts | 1 |

## NFR-1 Baseline

TBD — run `check-jsdoc-line-length-packages-remaining.sh` to establish.

## Green-Phase Definition of Done

1. All 38 NULL functions have JSDoc (summary, @param, @returns, @throws if applicable)
2. All JSDoc lines ≤ 120 chars (NFR-1)
3. No function signatures, logic, or behavior changed (FR-6)
4. Coverage guard returns PASS (0 NULL)
5. Line-length guard returns PASS (0 violations)
6. graph.db refreshed via `build-graph scan`
