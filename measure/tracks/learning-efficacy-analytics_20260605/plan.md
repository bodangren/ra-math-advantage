# Track: Learning Efficacy & Analytics — Implementation Plan

Workflow: Contract-First (metric + experiment contracts), then per-task TDD. >80% on pure logic.
Boundary rule: reusable metric/experiment logic domain-neutral; app surfaces local.
Verification: boundary lints + per-app lint/test + `tsc --noEmit`.

## Phase 1 — Metric Contracts & Pure Logic

- [x] Task: Define outcome-metric contracts (retention, time-to-mastery, accuracy, review-success) — `a732c7c7`
- [x] Task: Implement pure metric functions from SRS card/review/submission fixtures (TDD) — `a732c7c7`
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

Red files added (test files + Measure docs only — NO src/ implementation, NO build/runtime config):
- `packages/efficacy-core/__tests__/fixtures/efficacy.fixtures.ts`
  — schema-validated fixture builders (cards, review logs, submissions) reusing srs-engine + practice-core
- `packages/efficacy-core/__tests__/metrics/contracts.test.ts` (Task 1)
- `packages/efficacy-core/__tests__/metrics/retention.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/time-to-mastery.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/accuracy.test.ts` (Task 2)
- `packages/efficacy-core/__tests__/metrics/review-success.test.ts` (Task 2)

Tests intentionally import from `../../src/metrics/*` and `../../src/contracts` which do not yet exist.
Failure mode is "missing implementation" (ERR_MODULE_NOT_FOUND), not "stale durable record".

Targeted Red command (single bounded run, no watch, no full suite, no vitest config needed —
vitest's default `include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']` discovers the suites):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Red result (recorded post-run): see "Phase 1 — Red Run Log" appended below.

### Phase 1 — Red Run Log

Command (single bounded run, no watch, CI=true):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Result at 2026-06-13 (MID attempt 2, pre-impl HEAD `f89240d8`):
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
five suites passes, then add `packages/efficacy-core/package.json` + `vitest.config.ts`
+ `tsconfig.json` and wire workspace deps so the closeout gate from test-strategy
§8 Phase 1 (`npm run test --prefix packages/efficacy-core`) is runnable.

Out of scope for Red: no `src/` files were created; no `package.json`, `vitest.config.ts`,
`tsconfig.json`, or other build/runtime config was created or modified; no existing source
was modified.

### Phase 1 — Supervisor-Gate Remediation (MID attempt 2, 2026-06-13)

Attempt 1 (commit `f89240d8`) added `packages/efficacy-core/vitest.config.ts` as
"test harness scaffolding". The supervisor flagged this as a Red-phase boundary
violation: vitest.config.ts is a build/runtime config file, not a test file or
Measure doc, and so falls outside the Red-phase write boundary. Attempt 2 removes
it. The Red command behaves identically without it because vitest's defaults
discover `.test.ts` files via its built-in `include` glob, and the test files
themselves were valid and unchanged.

Files changed in attempt 2:
- DELETED `packages/efficacy-core/vitest.config.ts`
- MODIFIED `measure/tracks/learning-efficacy-analytics_20260605/plan.md`
  (this Red Notes/Run Log + this Remediation subsection).
The 5 Red test files and the fixtures file are unchanged from attempt 1.

### Phase 1 — Re-Verification (MID attempt 3, 2026-06-13)

Re-ran the targeted Red command at HEAD `f7ef274b` to confirm the canonical
missing-implementation failure mode still reproduces for a fresh MID session.
No source files or build config were created or modified between attempt 2 and
attempt 3 (worktree is clean per `git status --porcelain`).

Build-graph baseline (graph.db mtime 2026-06-13 10:41, TypeScript project, no
rescan needed):
- `build-graph search ./graph.db "stabilityToRetention"`
  → 1 hit in `packages/srs-engine/src/srs/srs-proficiency.ts` (canonical
  retention-normalization function reused by the time-to-mastery suite).
- `build-graph search ./graph.db "PracticeSubmissionEnvelopeSchema"`
  → 18 field hits in `packages/practice-core/src/practice/submission.schema.ts`
  + `packages/practice-core/src/practice/contract.ts` (canonical schema
  reused by the accuracy suite).
- `build-graph search ./graph.db "efficacy"` → 0 hits → greenfield surface
  (Phase 1 adds all nodes; blast radius = 0).
- Symbol existence confirmed via `packages/{srs-engine,practice-core}/src/index.ts`:
  `createMockSrsCard`, `createMockSrsReviewLog`, `createMockPracticeEnvelope`,
  `practiceSubmissionEnvelopeSchema` are all exported from the package roots
  the fixtures import them from.

Targeted Red command re-run (single bounded run, no watch, CI=true):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Result at 2026-06-13 (MID attempt 3, pre-impl HEAD `f7ef274b`):
- `Test Files  5 failed (5)` · `Tests  no tests`
- Failure mode for every suite (identical to attempt 2): `Error: Cannot find
  module '../../src/...' imported from ...` — i.e., the expected
  missing-implementation Red state.
- 5 suites fail for the expected missing-implementation reason:
  - `__tests__/metrics/contracts.test.ts`       → `../../src/contracts`
  - `__tests__/metrics/retention.test.ts`       → `../../src/metrics/retention`
  - `__tests__/metrics/time-to-mastery.test.ts` → `../../src/metrics/time-to-mastery`
  - `__tests__/metrics/accuracy.test.ts`        → `../../src/metrics/accuracy`
  - `__tests__/metrics/review-success.test.ts`  → `../../src/metrics/review-success`
- 0 false-pass tests, 0 stale-durable-record failures.

Verdict: Red state is canonical and reproducible. Tests are properly wired
to the canonical SRS/practice-core fixtures; the 5 Red files are durable and
ready to be flipped Green by the next role (Green/impl).

Files changed in attempt 3:
- MODIFIED `measure/tracks/learning-efficacy-analytics_20260605/plan.md`
  (this Re-Verification subsection).
No test files touched, no src/ files added, no build/runtime config touched.

### Phase 1 — Green Run Log (JR role, 2026-06-13, commit `68ebd3cb`)

Implementation files created:
- `packages/efficacy-core/package.json` — workspace package config
- `packages/efficacy-core/tsconfig.json` — extends root tsconfig
- `packages/efficacy-core/vitest.config.ts` — test runner config
- `packages/efficacy-core/src/contracts.ts` — EFFICACY_CONTRACT_VERSION + 4 Zod schemas + MetricResultSchema
- `packages/efficacy-core/src/metrics/retention.ts` — computeRetentionCurve
- `packages/efficacy-core/src/metrics/time-to-mastery.ts` — computeTimeToMastery
- `packages/efficacy-core/src/metrics/accuracy.ts` — computeAccuracyTrend
- `packages/efficacy-core/src/metrics/review-success.ts` — computeReviewSuccessRate
- `packages/efficacy-core/src/index.ts` — barrel re-exports

Bug fix in existing code:
- `packages/srs-engine/src/srs/transition-validator.ts` — added `relearning` as valid
  target from `review` and `relearning` states (FSRS produces these transitions on
  card lapse; validator was overly restrictive).

Build-graph updated locally (7 files: 5 → 35 nodes, 7 → 40 edges); graph.db
not committed due to pre-commit hook policy (ALLOW_GRAPH_DB=1 required).

Targeted Red command re-run (single bounded run, no watch, CI=true):
`CI=true npx vitest run --dir packages/efficacy-core __tests__/metrics`

Result: `Test Files  5 passed (5)` · `Tests  43 passed (43)` — all Green.

Closeout gate (`npm test --prefix packages/efficacy-core`):
`Test Files  5 passed (5)` · `Tests  43 passed (43)` — Green.

TypeScript gate (`tsc --noEmit --project packages/efficacy-core/tsconfig.json`):
Clean — no errors.

### Phase 1 — Adversarial Audit Log (2026-06-13, commit `78a7ca0a` + follow-up)

Adversarial review found that `computeTimeToMastery` used every input card id instead
of only cards matching the requested `objectiveId`, so an out-of-objective review could
shift mastery timing. It also rounded sub-day mastery intervals. Commit `78a7ca0a`
added regression tests and fixed the metric to filter by objective and preserve
fractional days.

Supervisor follow-up reran gates via `source "$HOME/.nvm/nvm.sh"` and fixed only the
issues exposed by those gates:
- Aligned existing time-to-mastery test fixtures with the new per-objective contract.
- Added `packages/efficacy-core/eslint.config.mjs` so the package lint script runs.

Verification:
- `CI=true npm run test --prefix packages/efficacy-core` → `Test Files 5 passed (5)` · `Tests 46 passed (46)`
- `npm run lint --prefix packages/efficacy-core` → pass
- `npx tsc --noEmit --project packages/efficacy-core/tsconfig.json` → pass
- `CI=true npm test` → knowledge-space-core root suite `18 passed (18)` · `262 passed (262)`

## Phase 2 — Cohort Aggregation (Convex)

- [~] Task: Batched aggregation queries by class/cohort + time window (TDD, no N+1)
- [~] Task: Small-n suppression / privacy guardrails (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 2 — Red Notes (MID role, 2026-06-13)

**Worktree at MID start:** one dirty file —
`measure/generated/architecture.json` — adds the `efficacy-core` package entry.
**Classification:** generated/registrar doc, but the change is *direct evidence
of the track's Phase 1 scaffolding* (adding `packages/efficacy-core` per
test-strategy §1, the boundary-clean shared lib this phase's Red tests will
consume). Folding into this Red commit per the MID dirty-worktree protocol
with an explicit plan note.

**Build-Graph baseline** (graph.db mtime 2026-06-13 14:51, TypeScript project,
no rescan needed — `graph.db` is `<24h` old and the Phase 1 source delta was
scanned into it by the JR role):
- `build-graph search ./graph.db "cohort"` → 0 hits → greenfield (Phase 2 adds
  all cohort symbols; blast radius = 0 outside the new `convex/efficacy/`
  directory).
- `build-graph search ./graph.db "efficacy"` → 0 hits → greenfield.
- `build-graph search ./graph.db "suppression"` → 0 hits → greenfield.
- `build-graph search ./graph.db "MIN_COHORT"` → 0 hits → greenfield.
- `build-graph search ./graph.db "getPracticeStatsHandler"` →
  `apps/integrated-math-3/convex/srs/dashboard.ts` (canonical Convex
  handler-as-pure-fn pattern, mirrored by cohort tests).
- `build-graph inspect ./graph.db "getPracticeStatsHandler"` shows the
  signature `function getPracticeStatsHandler(ctx: QueryCtx, args: { ... })`
  and an `internalQuery` export wrapper. Cohort handler tests follow the
  same pattern: import the handler function directly, pass a fake `ctx`.
- `build-graph search ./graph.db "by_student_and_reviewed_at"` →
  `apps/integrated-math-3/convex/schema.ts:618` (the index the cohort
  handler will use to filter reviews by `[studentId, reviewedAt]` range).
- `build-graph search ./graph.db "by_class"` → 2 hits in
  `apps/integrated-math-3/convex/schema.ts:266` (`class_enrollments.by_class`)
  and `apps/integrated-math-3/convex/schema.ts:256` (`classes.by_teacher`).
- Per-task graph protocol: the test files import from
  `@/convex/efficacy/cohort` and `@/convex/efficacy/suppression` which
  don't exist yet — pre-edit `build-graph inspect` skipped because
  the symbols are greenfield (callers = 0 by construction); post-edit
  `build-graph update` will be unnecessary for test files (no exports).

**Red files added** (test files + Measure docs only — NO src/, NO
build/runtime config; tests target handlers that don't yet exist so failure
mode is "missing implementation" via the standard im3 test runner):

- `apps/integrated-math-3/__tests__/convex/efficacy/cohort.test.ts` (Task 1)
  — batched aggregation by class + time window; no N+1; calls into
  `@math-platform/efficacy-core` metric fns; returns discriminated
  `{ status: 'ok' | 'suppressed', ... }` union.
- `apps/integrated-math-3/__tests__/convex/efficacy/suppression.test.ts`
  (Task 2) — `MIN_COHORT_N` constant contract; `suppressIfSmallN` predicate
  over boundary, zero, single, and above-threshold cohorts; privacy
  guarantee that suppressed payloads carry `n` + `status` only (no
  metric values, no PII).

**Test-design constraints honored** (test-strategy §3, §6, §8):
- Handler-as-pure-fn integration: tests import the handler function
  directly with `import { aggregateCohortMetricsHandler } from
  '@/convex/efficacy/cohort'`; pass a fake `ctx` with stubbed
  `db.query(...).withIndex(...).collect()` (mirrors
  `__tests__/convex/srs/dashboard.test.ts:108-154`).
- N+1 detection: a small `countQueryCalls(mockCtx)` helper asserts the
  total `db.query` invocation count is **bounded by a small constant
  independent of class size** (3-4 reads: enrollments, cards, reviews,
  submissions — never a per-student loop).
- Suppression is a pure helper imported from a module the test imports
  via `@/convex/efficacy/suppression` — no `ctx` mocking required, which
  is the canonical "tiny in-test helper" pattern (test-strategy §3 item 4
  is *Convex handler tests only*).
- Boundary safety: time-window tests use `Date.UTC(...)` constants
  pinned at fixture-build time (test-strategy §3 item 3).
- Small-n contract: pinned boundary at `n === MIN_COHORT_N - 1` →
  suppressed, `n === MIN_COHORT_N` → ok; `n === 0` and `n === 1` both
  suppressed (single-student privacy guarantee from test-strategy §4).
- No write paths: cohort tests never exercise `db.insert`/`db.patch` —
  the handler is read-only by contract (test-strategy §5).

**Targeted Red command** (single bounded run, no watch, no fall-through
to the full app suite):
`CI=true npx vitest run __tests__/convex/efficacy --dir apps/integrated-math-3`

(The im3 vitest config `include: ['__tests__/**/*.test.{ts,tsx}']` picks up
both new files; the `__tests__/convex/efficacy` path arg restricts to this
phase's suites. No live Convex deploy, no Playwright, no full app suite.)

### Phase 2 — Red Run Log

Command (single bounded run, no watch, no fall-through, CI=true):
`CI=true npx vitest run __tests__/convex/efficacy/` (from
`apps/integrated-math-3`)

Result at 2026-06-13 (MID attempt 1, pre-impl HEAD):
- `Test Files  2 failed (2)` · `Tests  no tests`
- Failure mode for every suite: vite `import-analysis` error —
  `Failed to resolve import "@/convex/efficacy/cohort" from ...` and
  `Failed to resolve import "@/convex/efficacy/suppression" from ...`.
- 2 suites fail for the expected missing-implementation reason:
  - `__tests__/convex/efficacy/cohort.test.ts`        → `@/convex/efficacy/cohort`
  - `__tests__/convex/efficacy/suppression.test.ts`   → `@/convex/efficacy/suppression`
- 0 false-pass tests, 0 stale-durable-record failures. This is the
  canonical "missing implementation" Red state for handler-as-pure-fn
  tests in this app (mirrors `__tests__/convex/srs/dashboard.test.ts`'s
  error shape).

This Red state is **not a fluke of stale fixtures or wrong command** —
it is the contract-the-future-impl-must-satisfy pinned at HEAD. The
next role (Green/impl) must create
`apps/integrated-math-3/convex/efficacy/cohort.ts` (exporting
`aggregateCohortMetricsHandler` and a `cohort` `internalQuery` wrapper)
and `apps/integrated-math-3/convex/efficacy/suppression.ts` (exporting
`MIN_COHORT_N`, `suppressIfSmallN`, `CohortSuppressionResult`) until
every assertion in the two suites passes.

Out of scope for Red: no `src/` files were created; no
`package.json`, `vitest.config.ts`, `tsconfig.json`, or other
build/runtime config was created or modified; no existing source was
modified. The dirty `measure/generated/architecture.json` (efficacy-core
package entry added by Phase 1) is track-relevant and folded into this
Red commit per the MID dirty-worktree protocol.

### Phase 2 — Supervisor-Gate Remediation (reserved)

If the supervisor flags any Red-phase boundary violation, this section
will record the remediation.

## Phase 3 — Experiment Harness

- [ ] Task: Deterministic sticky A/B assignment primitive + experiment registry (TDD)
- [ ] Task: Experiment analysis report (variant comparison, sample size, significance indicator) (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Efficacy View & Verification

- [ ] Task: Admin/teacher efficacy view rendering metrics + active experiments, role-gated (TDD on render/guard)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
