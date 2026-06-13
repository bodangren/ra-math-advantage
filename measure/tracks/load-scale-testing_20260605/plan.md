# Track: Load / Scale Testing — Implementation Plan

Workflow: Contract-First (seed + report schemas), then build drivers; budgets as tests.
Verification: harness runs green; `tsc --noEmit` on TS helpers.

## Phase 1 — Scale Seeds

- [x] Task: Deterministic 30-student class seed (enrollments, cards, reviews, submissions) (TDD on generators)
  - Red tests: `apps/integrated-math-3/__tests__/scale/seed-class.test.ts` (34 cases: module surface, density realism, determinism, FK integrity, organization/classroom/teacher wiring, result shape contract — counts-keys guard + JSON-serializability guard for downstream snapshot/budget consumers).
  - Fixtures: `apps/integrated-math-3/__tests__/_fixtures/scale/{student-roster,density,rng}.ts` pin `SCALE_STUDENT_COUNT_CLASS=30`, frozen `SCALE_RNG_SEED_VALUE='load-2026'`, density constants.
  - Targeted Red command: `../../node_modules/.bin/vitest run __tests__/scale/seed-class.test.ts __tests__/scale/seed-school.test.ts` (from `apps/integrated-math-3/`).
  - Green commit: `1f1f3af0` — implements `apps/integrated-math-3/lib/scale/seed-class.ts` with mulberry32 PRNG, seed-derived salt for deterministic IDs.
  - Green result: **34 tests passed, 0 failed** (targeted run).
- [x] Task: Deterministic 1,020-student school seed at realistic density
  - Red tests: `apps/integrated-math-3/__tests__/scale/seed-school.test.ts` (41 cases: module surface, density realism, class distribution, determinism, FK integrity, organization wiring, single-enrollment invariant, result shape contract — counts-keys guard + JSON-serializability guard).
  - Fixtures: `SCALE_STUDENT_COUNT_SCHOOL` corrected to 1020 (34×30) so every class is a full 30-student section. `SCALE_CLASSES_PER_SCHOOL=34`, `SCALE_TEACHERS_PER_SCHOOL=34`.
  - Targeted Red command: same as Task 1 (joint run).
  - Green commit: `1f1f3af0` — implements `apps/integrated-math-3/lib/scale/seed-school.ts` with mulberry32 PRNG, seed-derived salt. Added missing `SCALE_STUDENT_COUNT_CLASS` import to school test.
  - Green result: **41 tests passed, 0 failed** (targeted run). Total Phase 1: **75/75 green**.
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
