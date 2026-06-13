# Test Strategy — Load / Scale Testing

Tech Lead notes for `load-scale-testing_20260605`. Companion to `spec.md` and `plan.md`.
Scope: IM3 only (per spec); BM2/IM1/IM2 are out-of-scope for drivers.

## 1. Testing Pyramid Per Phase

| Phase | Unit (most) | Integration | E2E / Live (fewest) |
|-------|-------------|-------------|---------------------|
| P1 Seeds | Pure generator functions: deterministic IDs, density math, foreign-key integrity, idempotency | One in-memory `convex-test` run inserting the 30-student seed; assert row counts per table | One scripted insert of class-scale seed against an isolated dev deployment (manual UMV gate) |
| P2 Drivers | Report-shape Zod schema, cost-record reducers, OCC counter merge | `convex-test` driver-as-library: drive each hot path once, capture `runStats`, assert keys present | Real `npx convex insights` parse against a deployment seeded by P1; one driver per hot path |
| P3 Budgets/CI | Pure budget evaluator: pass/fail/diff vs baseline; regression injector | Harness orchestration: seed → drive → evaluate → report (mocked insights) | Scheduled CI invocation against scale deployment posting the report artifact |

Heaviest investment is P1+P3 unit logic (deterministic, fast, high-ROI) and one bounded live-smoke per phase. Drivers themselves are thin glue and mostly verified through their report outputs.

## 2. Shared Fixtures & Mocks

- `__tests__/_fixtures/scale/` — seeded `studentRoster30`, `studentRoster1000`, frozen RNG seed `0xLOAD2026`, expected-row-count snapshots.
- `__tests__/_fixtures/insights/` — recorded `npx convex insights` JSON samples (one per hot path) for parser tests; never call live in unit tests.
- `lib/scale/cost-record.ts` (new) — pure types/zod schema for `{ path, docsRead, bytesRead, fnTimeMs, occConflicts }`; reused by drivers, evaluator, and report writer.
- Mock surface: factor a thin `InsightsClient` interface so unit tests pass an in-memory fake; the real CLI shell-out lives behind one adapter file.
- Reuse `convex-test` setup already in `apps/integrated-math-3/__tests__/convex/seed/`.

## 3. Cross-Phase Edge Cases & Dependencies

- **Determinism**: re-running P1 seed twice produces identical row IDs and counts (idempotency); P2 drivers must not write (read-only over P1 data) — assert via post-driver row-count delta = 0.
- **Density realism** (FR1): per-student card count, review-log depth, submission count match published-curriculum module size; encoded as fixture snapshots.
- **N+1 regression guards** (lessons 2026-04-19 / 2026-04-23 / 2026-04-29): budgets must trip if a hot path re-introduces per-student `.collect()` loops or sequential awaits. P3 includes a synthetic regression test that injects a `for await` and asserts the harness fails.
- **Multi-entry index pitfall** (lesson 2026-04-23): seed generator unit tests assert `objectiveIds` is `string[]`, not pre-stringified.
- **Pagination** (lesson 2026-05-03): driver must traverse `continueCursor` to completion when a path paginates; tested via fixture with `isDone:false` then `true`.
- **OCC**: P2 driver runs include a small write-storm sub-driver to surface OCC counts; P3 budget includes an OCC ceiling.
- **Phase dependencies**: P2 cannot land before P1 seeds are deterministic-tested; P3 cannot record baselines until P2 reports stabilize for two consecutive runs (variance ≤ 5%).

## 4. Architecture Guardrails

- All harness code lives under `apps/integrated-math-3/scripts/scale/` and `apps/integrated-math-3/lib/scale/`. **Do not** add to `packages/` (lessons-learned: keep packages domain-neutral).
- No imports from `convex/_generated/` outside the convex tree (per AGENTS.md monorepo boundary rules).
- Harness is **read-only against shared deployments**; writes occur only on an isolated `dev`/scale deployment whose URL is required and asserted before any driver runs.
- `graph.db` is tracked binary — harness must not invoke `build-graph scan/update` (lesson 2026-06-06).
- Governance/path tests use `fileURLToPath(import.meta.url)`, never `process.cwd()` (lesson 2026-05-03).
- Replace `v.any()` with `v.record(v.string(), v.any())` for any new Convex validators (lesson 2026-05-03).

## 5. Per-Phase Test Approach

- **P1**: TDD on generator pure functions first (counts, FK integrity, RNG seed reproducibility). Then a single `convex-test` insertion test asserting table counts. Snapshot expected per-table totals to fixture JSON; updates require a commit message rationale.
- **P2**: TDD on the cost-record schema and on the report aggregator (merge per-run stats → comparable record). Driver functions are thin; covered by one integration test each that asserts the expected report row appears with non-null cost fields. The `npx convex insights` parser is unit-tested against recorded JSON fixtures.
- **P3**: TDD on the budget evaluator (`evaluate(record, budget) → {pass, deltas[]}`) including the **proof test** (AC3): inject a synthetic regression record and assert the harness exits non-zero. CI job is a thin wrapper; tested via command-construction proof (no real network) plus one bounded smoke that runs `--dry-run` against the scale deployment.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph stats`: 13,924 nodes / 540 IM3 files / 277 convex files — large but tractable; harness-only changes do not need `update` after edits.
- `build-graph search seed` confirms IM3 already has a deterministic seed surface (`convex/seed.ts` + 50+ `convex/seed/seed_lesson_*.ts` and matching `__tests__/convex/seed/*`). **Reuse it**; FR1's "30-student class" is a *roster + enrollments + cards/reviews/submissions* layer **on top of** existing curriculum seeds, not a replacement.
- `build-graph search dailyPractice` resolves IM3 hot path to `apps/integrated-math-3/convex/queue/queue.ts:resolveDailyPracticeQueue` (and `getDailyPracticeQueueHandler`). Ambiguous-name collisions across IM1/IM3 confirm drivers must select symbols by IM3 file path, not by bare name.
- `build-graph search proficiency` surfaces `packages/srs-engine/src/srs/objective-proficiency.ts:aggregateCardsToEvidence` and IM3 `convex/objectiveProficiency.ts` as the proficiency hot path; `competency-heatmap.ts` (`packages/teacher-reporting-core` + IM3 lib) is the heatmap path; `lib/teacher/gradebook-export.ts` is the export path.
- `build-graph search insights/budget/harness` returns no production cost-capture or budget evaluator — both are net-new, justifying contract-first TDD for `cost-record` and `budget-evaluator`.
- `build-graph stats` "top imports" (`server.d.ts`, `dataModel.d.ts`, `contract.ts`) confirm shared surfaces; non-additive signature changes there would be high-blast-radius — this track must avoid touching them.

## 7. Live-Proof Plan (Red command + Green/closeout gate per phase)

Each phase distinguishes **artifact/contract tests** (verify shapes, schemas, deterministic generators, evaluator logic — fast, no deployment) from **live-behavior tests** (prove the harness moves real bytes against an isolated Convex deployment).

| Phase | Artifact/contract Red command (TDD) | Live-behavior gate (Green/closeout) |
|-------|-------------------------------------|--------------------------------------|
| P1 | `npx vitest run apps/integrated-math-3/__tests__/scale/seed-class.test.ts apps/integrated-math-3/__tests__/scale/seed-school.test.ts` (deterministic counts, FK integrity, idempotency) | One bounded run: `node apps/integrated-math-3/scripts/scale/seed.mjs --scale=class --deployment=$IM3_SCALE_URL` exits 0 and a follow-up read query returns the expected roster size. Documented in UMV. |
| P2 | `npx vitest run apps/integrated-math-3/__tests__/scale/cost-record.test.ts apps/integrated-math-3/__tests__/scale/insights-parser.test.ts apps/integrated-math-3/__tests__/scale/drivers.test.ts` (uses recorded insights JSON fixtures) | Bounded smoke: `node apps/integrated-math-3/scripts/scale/run.mjs --paths=daily-practice,gradebook,heatmap,proficiency --once --deployment=$IM3_SCALE_URL` writes a report with non-null docsRead/bytesRead per path. UMV reviews the report. |
| P3 | `npx vitest run apps/integrated-math-3/__tests__/scale/budget-evaluator.test.ts apps/integrated-math-3/__tests__/scale/regression-proof.test.ts apps/integrated-math-3/__tests__/scale/ci-command.test.ts` — the **regression-proof** test injects an inflated cost record and asserts non-zero exit (AC3). `ci-command.test.ts` is a **command-construction proof** that asserts the exact CLI string and env contract built for CI; it does NOT exec the runner. | Bounded live closeout: `node apps/integrated-math-3/scripts/scale/run.mjs --evaluate --baseline=baselines.json --deployment=$IM3_SCALE_URL` exits 0 on baseline; a manual `--inject-regression` rerun exits 1. Then `npx tsc --noEmit --project apps/integrated-math-3/tsconfig.json` and `npm run --prefix apps/integrated-math-3 test` pass. |

**Fake harness boundary**: Recorded-insights JSON fixtures and the in-memory `InsightsClient` fake are used **only** to test parser/evaluator/report-writer plumbing. Every production gate command above (`seed.mjs`, `run.mjs`, `--evaluate`) has a paired non-fake bounded smoke or command-construction proof, so the fakes cannot fall through into "ran the full suite, looked green" without the live smoke also being green. The CI workflow itself is asserted by the command-construction test, not stubbed.

**Intentionally-red files**: none introduced by this track. The wider repo carries known reds documented in `tech-debt.md` (BM2 user-menu, GradebookDrillDown, IM3 react-hooks rules, math-content `tsc`); harness verification scopes vitest invocations to `apps/integrated-math-3/__tests__/scale/**` to avoid pulling those in. The synthetic regression test in P3 is **green by default** and only goes red when invoked with the explicit `--inject-regression` flag — it is never picked up by aggregate runs because it lives behind a CLI-only entry point, not a `*.test.ts` Vitest target.

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: load-scale-testing_20260605
phase: track setup
commits: none
tests_run: build-graph stats ./graph.db (pass); build-graph search seed/proficiency/dailyPractice/gradebook/heatmap/insights/harness/budget (pass); build-graph callers (ambiguous — disambiguated by file path, expected for monorepo)
files_changed: measure/tracks/load-scale-testing_20260605/test-strategy.md (created)
plan_updates: none — plan.md unchanged; strategy authored as companion doc per request
known_failures: none in this strategy doc; pre-existing reds catalogued in tech-debt.md (BM2 user-menu, GradebookDrillDown, IM3 react-hooks v6, math-content tsc) and explicitly excluded from harness verification scope
handoff: Implementer should start P1 with TDD on pure seed generators in apps/integrated-math-3/lib/scale/ and __tests__/scale/, reusing existing convex/seed/* curriculum seeds and adding a roster/enrollment/SRS layer on top. Net-new modules: lib/scale/cost-record.ts (zod schema), lib/scale/budget-evaluator.ts, lib/scale/insights-client.ts (adapter). Drivers go under scripts/scale/. Do not modify packages/ or convex/_generated/. Ensure $IM3_SCALE_URL points at an isolated deployment before any live smoke. graph.db is fresh (mtime ~82min ago); no rescan needed unless harness adds exported symbols outside scripts/.
END_MEASURE_AGENT_RESULT
