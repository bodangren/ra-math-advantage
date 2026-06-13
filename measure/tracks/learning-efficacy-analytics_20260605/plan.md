# Track: Learning Efficacy & Analytics — Implementation Plan

Workflow: Contract-First (metric + experiment contracts), then per-task TDD. >80% on pure logic.
Boundary rule: reusable metric/experiment logic domain-neutral; app surfaces local.
Verification: boundary lints + per-app lint/test + `tsc --noEmit`.

## Phase 1 — Metric Contracts & Pure Logic

- [~] Task: Define outcome-metric contracts (retention, time-to-mastery, accuracy, review-success)
- [~] Task: Implement pure metric functions from SRS card/review/submission fixtures (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — deferred (manual, not Red-phase)

### Phase 1 — Red Notes (MID role, 2026-06-13)

Worktree at MID start: clean except `measure/tracks/learning-efficacy-analytics_20260605/test-strategy.md`
(produced by Strategy role; classified track-relevant — folded into this Red commit).

Build-Graph baseline (graph.db mtime 2026-06-13 10:41):
- `stabilityToRetention`, `aggregateCardsToEvidence` live in `packages/srs-engine/src/srs/srs-proficiency.ts`
  (callers = 0 outside that package per `build-graph callers`) → reuse via `@math-platform/srs-engine`.
- `PracticeSubmissionEnvelopeSchema` lives in `packages/practice-core/src/practice/submission.schema.ts`
  → reuse via `@math-platform/practice-core/submission-schema` for first-attempt accuracy.
- No nodes match `efficacy`, `experiment`, `cohort` (A/B sense) → greenfield surface, blast radius 0.

Red files added (test harness + fixtures + failing tests only — NO src/ implementation):
- `packages/efficacy-core/vitest.config.ts` — vitest include pattern for `__tests__/**/*.test.ts`
- `packages/efficacy-core/__tests__/fixtures/efficacy.fixtures.ts`
  — schema-validated fixture builders (cards, review logs, submissions) reusing srs-engine + practice-core
- `packages/efficacy-core/__tests__/metrics/contracts.test.ts` (Task 1)
- `packages/efficacy-core/__tests__/metrics/retention.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/time-to-mastery.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/accuracy.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/review-success.test.ts` (Task 2)

Tests intentionally import from `../../src/metrics/*` and `../../src/contracts` which do not yet exist.
Failure mode is "missing implementation" (ERR_MODULE_NOT_FOUND), not "stale durable record".

Targeted Red command (single bounded run, no watch, no full suite):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Red result (recorded post-run): see "Phase 1 — Red Run Log" appended below.

### Phase 1 — Red Run Log

Command (single bounded run, no watch, CI=true):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Result at 2026-06-13 (MID, pre-impl HEAD `58800dd7`):
- `Test Files  5 failed (5)` · `Tests  no tests`
- Failure mode for every suite: `Error: Cannot find module '../../src/...' imported from ...`
- 5 suites failed for the expected missing-implementation reason:
  - `__tests__/metrics/contracts.test.ts`       → `../../src/contracts`
  - `__tests__/metrics/retention.test.ts`       → `../../src/metrics/retention`
  - `__tests__/metrics/time-to-mastery.test.ts` → `../../src/metrics/time-to-mastery`
  - `__tests__/metrics/accuracy.test.ts`        → `../../src/metrics/accuracy`
  - `__tests__/metrics/review-success.test.ts`  → `../../src/metrics/review-success`

This is the canonical "missing implementation" Red state. The next role (Green/impl)
must create `packages/efficacy-core/src/contracts.ts` and the four
`packages/efficacy-core/src/metrics/*.ts` modules until every assertion in the
five suites passes, then add `packages/efficacy-core/package.json` and wire
workspace deps so the closeout gate from test-strategy §8 Phase 1 (full package
test) is runnable. Test-harness scaffolding (`vitest.config.ts`, fixtures) is
already in place and must not be edited except to extend.

Out of scope for Red: no `src/` files were created; no existing source was modified.

## Phase 2 — Cohort Aggregation (Convex)

- [ ] Task: Batched aggregation queries by class/cohort + time window (TDD, no N+1)
- [ ] Task: Small-n suppression / privacy guardrails (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Experiment Harness

- [ ] Task: Deterministic sticky A/B assignment primitive + experiment registry (TDD)
- [ ] Task: Experiment analysis report (variant comparison, sample size, significance indicator) (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Efficacy View & Verification

- [ ] Task: Admin/teacher efficacy view rendering metrics + active experiments, role-gated (TDD on render/guard)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
