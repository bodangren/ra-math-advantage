# Test Strategy — Learning Efficacy & Analytics

Track: `learning-efficacy-analytics_20260605` · Tech Lead: Strategy role
Workflow: Contract-First, then per-task TDD (Red → Green → Refactor). Coverage target: >80% on pure logic.

## 1. Build-Graph Findings That Shaped This Strategy

- `packages/srs-engine/src/srs/{contract,fixtures,scheduler,srs-proficiency}.ts` already exposes `SrsCardState`, `SrsReviewLogEntry`, `stabilityToRetention`, `aggregateCardsToEvidence`, plus deterministic fixture builders → **reuse these as canonical fixtures** for retention/time-to-mastery tests; do not invent parallel SRS shapes.
- `packages/practice-core/src/practice/submission.schema.ts` defines `PracticeSubmissionEnvelopeSchema` (parts, timing, attemptNumber, status) → first-attempt accuracy must be derived from this schema.
- `packages/teacher-reporting-core/src/teacher-reporting/` (gradebook, course-overview, competency-heatmap) already follows pure-function + Vitest pattern → **mirror its layout** for new metric/experiment libs, not the app surface.
- No nodes match `experiment`, `cohort`, `assignment` (in the A/B sense), `variant` (in the A/B sense), or `efficacy` → entire experiment surface is greenfield. No callers to break (blast radius = 0 outside this track until Phase 4 surface).
- Convex tests in `apps/integrated-math-3/__tests__/convex/srs/*.test.ts` import handlers directly (`getPracticeStatsHandler`) and unit-test pure helpers — **no `convex-test` runtime is used**; we will follow the same pattern for cohort aggregation.
- `scripts/check-monorepo-boundaries.mjs` (+ `monorepo-boundary-rules.json`) is the boundary lint enforcer; reusable metric/experiment logic must live in a shared `packages/` lib (proposed `packages/efficacy-core/`) and must not import from `apps/` or `convex/_generated/`.

## 2. Testing Pyramid Per Phase

| Phase | Unit (pure) | Integration | Contract | Component | Manual |
|-------|-------------|-------------|----------|-----------|--------|
| 1 Metrics | **majority** — pure metric fns over fixtures | — | type+schema contract for metric inputs/outputs | — | `Phase 1` checklist |
| 2 Cohort  | aggregator helpers, suppression predicate | Convex handler imported as plain fn (no live deploy) | small-n threshold contract | — | `Phase 2` checklist |
| 3 Experiment | hash/assign primitive, registry guards, stats fn | registry+assign composed | assignment determinism contract; report shape contract | — | `Phase 3` checklist |
| 4 Surface | role-guard helper | — | — | RTL render of efficacy view + role denial | `Phase 4` checklist + boundary lints + `tsc --noEmit` + `CI=true npm run test` |

Pyramid intent: ≥70% unit, ~20% Convex-handler-as-pure-fn integration, ≤10% component/RTL. No live Convex deploys, no Playwright in this track.

## 3. Shared Test Fixtures & Mocks

Single source of truth, ordered by reuse priority:

1. **SRS fixtures**: `packages/srs-engine/src/srs/fixtures.ts` — use `generateCardId`/builders for cards & review logs. Do not duplicate.
2. **Submission fixtures**: build a tiny `efficacy.fixtures.ts` inside the new `packages/efficacy-core/__tests__/fixtures/` that composes `PracticeSubmissionEnvelopeSchema` minimal valid objects. Schema-validated at fixture-build time so fixture rot fails loudly.
3. **Cohort/time fixtures**: deterministic `Date.UTC(...)` constants (mirror `dashboard.test.ts:11` pattern). No `Date.now()` in tests.
4. **No Convex `ctx` mocking**: tests import handler functions directly (e.g., `getCohortMetricsHandler`) and pass a fake `ctx` object with stubbed `db.query(...).withIndex(...).collect()` shaped via a tiny in-test helper, mirroring `__tests__/convex/srs/dashboard.test.ts`.
5. **Hash mock for assignment**: assignment primitive must take an injectable hash fn; tests pin the hash → variant mapping (no `Math.random`, no global mocks).

## 4. Cross-Phase Edge Cases & Dependencies

- Empty cohort, single-student cohort (small-n suppression must trigger), cohort entirely below threshold.
- Time-window boundaries: review on cohort start ms, on cohort end ms, daylight-saving-irrelevant UTC math.
- SRS card with `reps === 0` (excluded from retention curve, included in coverage).
- Submission with `attemptNumber > 1` only (no first attempt → first-attempt accuracy = `null`, not `0`).
- Experiment registry: duplicate experiment id, archived experiment, student in two overlapping experiments (must be deterministic and documented).
- Sticky assignment must survive (a) re-running with same inputs, (b) registry reorder, (c) variant weight rebalance for *new* enrollees only — existing assignments are frozen.
- Significance indicator: zero-variance group, n=0 in one variant, identical means.
- Phase 4 view: unauthorized role (student), authorized teacher with empty data, authorized teacher with suppressed cohort.

## 5. Architecture Guardrails

- Reusable metric & experiment logic lives in **`packages/efficacy-core/`** (proposed). It MUST NOT import from `apps/*`, `convex/`, `convex/_generated/`, or any app-specific UI lib. Enforced by `scripts/check-monorepo-boundaries.mjs`.
- App-specific Convex handlers live in `apps/integrated-math-3/convex/efficacy/` and call into `@ra/efficacy-core` only.
- Efficacy view lives in `apps/integrated-math-3/app/teacher/efficacy/` and `components/teacher/efficacy/`. App owns its design system per `apps/integrated-math-3/DESIGN.md`.
- No PII in metric payloads — enforced by a contract test asserting metric output schemas contain only ids + counts + ratios + bucketed timestamps.
- No new write paths in hot loops (FR/NFR) — verified by `grep` test in Phase 2 ensuring no `ctx.db.insert` / `ctx.db.patch` appears in `convex/efficacy/**`.
- Per-task graph protocol: run `build-graph inspect` on any newly exported symbol pre-edit and `build-graph update graph.db <files>` post-edit when signatures, schemas, or JSX hierarchy change.

## 6. Per-Phase Test Approach Notes

**Phase 1 — Metric Contracts & Pure Logic.** Contract-first: write Zod (or zod-equivalent already in repo) schemas for `RetentionPoint`, `TimeToMasteryStat`, `AccuracyTrend`, `ReviewSuccessRate`. Schema-shape tests assert versioning. Then per-metric TDD over SRS+submission fixtures, including the edge cases above. Stats explainability: each metric exports a `compute…(input) => { value, n, inputs }` shape so tests can assert traceability.

**Phase 2 — Cohort Aggregation (Convex).** Define a small-n suppression contract (`MIN_COHORT_N` constant, exported) and test that cohorts below threshold return `{ status: 'suppressed', n }` rather than redacted-but-leaky data. Convex query tests import handlers as functions and assert no N+1 by counting calls on a fake `ctx.db` proxy that increments per `query()`/`get()`. Cap acceptable call count per cohort by class-size.

**Phase 3 — Experiment Harness.** Assignment primitive is `assign({ studentId, experimentId, variants, hash }) => variantId`. Test determinism (same input → same output across 10k iterations), distribution (chi-square *only* on a fixed seed range, not flaky percentages), stickiness (registry mutation does not reassign existing students). Registry test enforces uniqueness, status lifecycle, guardrail caps. Report-shape contract test asserts `{ variantA: {n, mean, ci?}, variantB: {…}, significance: 'none'|'weak'|'strong' }` with explicit thresholds.

**Phase 4 — Efficacy View & Verification.** RTL test renders the page with a fake props snapshot from Phase 1–3 outputs (no Convex live calls); asserts metric tiles, experiment list, and role gate. Unauthorized role test asserts redirect/`null` per existing `app/admin/dashboard/page.tsx` pattern. Final gates: `scripts/check-monorepo-boundaries.mjs`, `npm run lint --prefix apps/integrated-math-3`, `npx tsc --noEmit` (root and app), `CI=true npm run test --prefix apps/integrated-math-3`, plus package tests for `efficacy-core`.

## 7. Artifact/Contract Tests vs. Live-Behavior Tests

- **Artifact / contract tests (documentation-grade):** Zod schema shapes for metric outputs, experiment-report shape, suppression-result discriminated union, registry-entry schema. These prove *we shipped the agreed shape*, not that real data flows through it.
- **Live-behavior tests (the real gate):** pure metric functions over fixtures, suppression predicate over real-shaped cohorts, assignment determinism+stickiness over 10k synthetic students, Convex handler invoked as a function with a fake `ctx` that exercises the real query plan, RTL render with realistic props.
- A contract test passing is **never** sufficient evidence a phase is Green — every phase must close with at least one live-behavior test from the table in §2.

## 8. Live-Proof Plan (Per-Phase Red Command + Green/Closeout Gate)

Targeted commands hit only this track's files; no aggregate suite is allowed to provide first-time Green.

| Phase | Targeted Red command (must fail before impl) | Green / closeout gate |
|-------|----------------------------------------------|------------------------|
| 1 | `npx vitest run packages/efficacy-core/__tests__/metrics` (from repo root) | `npm run test --prefix packages/efficacy-core` (full pkg) **and** `CI=true npx vitest run packages/efficacy-core/__tests__/metrics` exits 0 with non-zero test count |
| 2 | `CI=true npx vitest run __tests__/convex/efficacy/cohort.test.ts --dir apps/integrated-math-3` | `CI=true npm run test --prefix apps/integrated-math-3 -- __tests__/convex/efficacy` then full `CI=true npm run test --prefix apps/integrated-math-3` |
| 3 | `CI=true npx vitest run packages/efficacy-core/__tests__/experiment` | `npm run test --prefix packages/efficacy-core` then `CI=true npx vitest run apps/integrated-math-3/__tests__/convex/efficacy/experimentReport.test.ts` |
| 4 | `CI=true npx vitest run apps/integrated-math-3/__tests__/components/teacher/efficacy` | `node scripts/check-monorepo-boundaries.mjs` ✓ → `npm run lint --prefix apps/integrated-math-3` ✓ → `npx tsc --noEmit` (root + app) ✓ → `CI=true npm run test --prefix apps/integrated-math-3` ✓ → `npm run test --prefix packages/efficacy-core` ✓ |

Notes: `vitest run` (not `watch`) and `CI=true` ensure single execution. Each Red command names an exact file/dir that exists only inside this track; no fall-through to other suites.

## 9. Fake Harnesses & Aggregate-Suite Discovery

- The fake `ctx.db` proxy used in Phase 2 is **runner plumbing only**. It must not back any production gate. Phase 2's closeout gate runs the full app Vitest suite (`CI=true npm run test --prefix apps/integrated-math-3`) which exercises the real handler imports and would catch a stub leaking into shipped code.
- The injectable hash fn in Phase 3 is **runner plumbing only**. Production code must wire the real hash (e.g., `sha256` of `studentId|experimentId`) and Phase 3's closeout adds a non-fake "command-construction" test that imports the production assignment factory with no overrides and asserts it returns a stable variant for a pinned student/experiment pair — bounded (one assertion, no loops over real data) and incapable of falling through to the full suite.
- **No intentionally-red files** are introduced by this track. Every Red test created during a `[~]` task is flipped Green within that task before the task is marked `[x]`. If a task must be paused with a known-failing test on disk, the file is renamed `*.todo.test.ts` (excluded by the `vitest` `include` glob `__tests__/**/*.test.{ts,tsx}`) and an explicit `[~]` task in `plan.md` owns it. The aggregate suite (`npm run test --prefix apps/integrated-math-3`) will not discover `*.todo.test.ts` files.
- Any pre-existing red files outside this track are out of scope and remain owned by their originating tracks; this strategy does not silence them.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: learning-efficacy-analytics_20260605
phase: track setup
commits: none
tests_run: none (strategy doc only; no impl per instructions)
files_changed: measure/tracks/learning-efficacy-analytics_20260605/test-strategy.md (new)
plan_updates: none — plan.md untouched; strategy supplements it
known_failures: none
handoff: Implementer should start Phase 1 by scaffolding packages/efficacy-core (boundary-clean, no app/convex imports), reusing srs-engine fixtures and PracticeSubmissionEnvelopeSchema, and following the per-phase Red commands in §8. Confirm packages/efficacy-core is acceptable as the shared lib name before scaffolding; check monorepo-boundary-rules.json needs an entry for it. Greenfield experiment surface (no callers) means low blast radius until Phase 4 view ships.
END_MEASURE_AGENT_RESULT
