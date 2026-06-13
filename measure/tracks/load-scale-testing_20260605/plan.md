# Track: Load / Scale Testing — Implementation Plan

Workflow: Contract-First (seed + report schemas), then build drivers; budgets as tests.
Verification: harness runs green; `tsc --noEmit` on TS helpers.

## Phase 1 — Scale Seeds

- [~] Task: Deterministic 30-student class seed (enrollments, cards, reviews, submissions) (TDD on generators)
  - Red tests: `apps/integrated-math-3/__tests__/scale/seed-class.test.ts` (35 cases: module surface, density realism, determinism, FK integrity, organization/classroom/teacher wiring, result shape contract — counts-keys guard + JSON-serializability guard for downstream snapshot/budget consumers).
  - Fixtures: `apps/integrated-math-3/__tests__/_fixtures/scale/{student-roster,density,rng}.ts` pin `SCALE_STUDENT_COUNT_CLASS=30`, frozen `SCALE_RNG_SEED_VALUE='load-2026'`, density constants.
  - Targeted Red command: `../../node_modules/.bin/vitest run __tests__/scale/seed-class.test.ts __tests__/scale/seed-school.test.ts` (from `apps/integrated-math-3/`).
  - Red result at HEAD (mid attempt 2, 2026-06-14): **2 test files failed (0 tests run)** — vite:import-analysis cannot resolve `@/lib/scale/seed-class` (missing module). Failures are missing-behavior, not stale records.
  - Plan note: Green phase will implement `apps/integrated-math-3/lib/scale/seed-class.ts` exporting `generateClassSeed`, `SCALE_RNG_SEED`, and the `ClassSeedInput` / `ClassSeedResult` types. The `counts` keys MUST be exactly `[enrollments, reviewLog, srsCards, students, submissions]` (alphabetical) — the result-shape contract test pins this. The result MUST be JSON-serializable (no Map/Set/Date/BigInt) — pinned by the same contract block. The one in-memory `convex-test` insertion test (asserting per-table row counts against a snapshot fixture) is owned by the Green / closeout role, not this Red role.
- [~] Task: Deterministic 1,000-student school seed at realistic density
  - Red tests: `apps/integrated-math-3/__tests__/scale/seed-school.test.ts` (41 cases: module surface, density realism, class distribution, determinism, FK integrity, organization wiring, single-enrollment invariant, result shape contract — counts-keys guard + JSON-serializability guard).
  - Same fixtures as Task 1; pins `SCALE_STUDENT_COUNT_SCHOOL=1000`, `SCALE_CLASSES_PER_SCHOOL=34`, `SCALE_TEACHERS_PER_SCHOOL=34`.
  - Targeted Red command: same as Task 1 (joint run).
  - Red result at HEAD (mid attempt 2, 2026-06-14): **2 test files failed (0 tests run)** — vite:import-analysis cannot resolve `@/lib/scale/seed-school` (missing module).
  - Plan note: Green phase will implement `apps/integrated-math-3/lib/scale/seed-school.ts` exporting `generateSchoolSeed`, `SCALE_RNG_SEED`, and the `SchoolSeedInput` / `SchoolSeedResult` types. The `counts` keys MUST be exactly `[classes, enrollments, reviewLog, srsCards, students, submissions, teachers]` (alphabetical) — pinned by the result-shape contract test. The result MUST be JSON-serializable. The in-memory `convex-test` insertion test belongs to Green / closeout.
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Hot-Path Drivers & Cost Capture

- [ ] Task: Drivers for teacher proficiency/dashboard, daily-practice queue, gradebook/heatmaps, curriculum summaries
- [ ] Task: Capture Convex insights (docs/bytes/time/OCC) into a comparable report
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Budgets & CI

- [ ] Task: Record baselines; define per-path budgets; harness fails on injected regression (proof test)
- [ ] Task: Add scheduled/manual CI job against a scale deployment posting the report
- [ ] Task: Log discovered hotspots as Tech Debt rows with measured cost
- [ ] Task: Final verification — harness green, tsc --noEmit, tests
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
