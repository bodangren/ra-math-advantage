# Test Strategy — E2E Coverage Expansion

Tech Lead view for `e2e-coverage-expansion_20260605`. Scope: IM3 only (BM2 follow-up out of scope).
Harness exists (`apps/integrated-math-3/playwright.config.ts`, 4 specs in `apps/integrated-math-3/e2e/`).
Verification per phase: `npm run ws:im3:test` + `npm run test:e2e --prefix apps/integrated-math-3` + `npx tsc --noEmit`.

## 1. Testing Pyramid Per Phase

| Phase | Unit/Component (vitest) | Integration (vitest+convex-test) | E2E (Playwright) |
|-------|-------------------------|----------------------------------|------------------|
| 1 — Seed & Selectors | Selector constants module unit test | Seed-builder Convex test (idempotent re-run) | Smoke spec asserts seeded entities visible |
| 2 — Auth & Lesson | (existing) | Reuse existing `login.test.ts`, `seed-demo-env` | 4 auth specs + 1 full lesson-flow w/ reload |
| 3 — Activities & Practice | (existing renderer tests) | Existing `ActivityRenderer-*.test.tsx` cover families | 1 spec per family (graphing, solver, quiz, FIB) + 1 daily-practice spec |
| 4 — Teacher & CI | — | Existing `gradebook-queries`, `lessonAssignment` tests | Gradebook drilldown, student detail, assignment specs + CI wiring |

Rule: E2E asserts the user journey only. Branch logic, error states, and edge inputs stay in vitest. Cap E2E at ≤ 12 specs total to keep wall-time < 5 min.

## 2. Shared Fixtures & Mocks

- **Reuse `apps/integrated-math-3/e2e/fixtures.ts`** — already provides `studentPage`/`teacherPage`. Extend, do not replace.
- **Selectors**: add `apps/integrated-math-3/e2e/selectors.ts` exporting `data-testid` constants. Components must adopt these via `data-testid={SEL.x}` — never inline strings. Avoids the brittle `[class*="practice"]` pattern in `daily-practice.spec.ts:18`.
- **Seed**: a single Convex action `seedDemoE2E` composes existing `seed_demo_env.ts` + `seed_demo_progress.ts` + `seed_lesson_*` modules. Exposes one idempotent entry point keyed by a fixed `E2E_SEED_KEY`. Reset via tombstone-delete of that key, not by table truncation.
- **Auth credentials**: keep the existing `student1@demo` / `teacher@demo` accounts; the seed action must guarantee these exist and are active.
- **No network mocking in E2E.** Convex is the source of truth; the seeded backend IS the test double.

## 3. Cross-Phase Edge Cases & Dependencies

- **Phase 1 blocks all others.** Seed determinism is the foundation — if Phase 1 ships flaky, Phases 2-4 will inherit flake. Gate Phase 2 start on a clean 10× run of Phase 1's smoke spec.
- **Reload persistence (FR2, AC2)** must assert against Convex-persisted state, not local component state. After reload, the assertion must read a field written by `completePhaseRequest` → `POST /api/phases/complete` (`apps/integrated-math-3/app/api/phases/complete/route.ts`).
- **Deactivated-credential denial (FR1)** — exercise `requireActiveRequestSessionClaims` path. Seed must create a deactivated student AND issue a still-valid JWT (use API-level login then deactivate via mutation, then attempt a protected route).
- **Daily-practice streak (FR4)** — `calculateStreak` (`apps/integrated-math-3/convex/srs/dashboard.ts`) reads completion timestamps. Seed must fix `Date.now` window OR seed completions with explicit timestamps so streak count is deterministic.
- **Parallel-safety (NFR)**: `playwright.config.ts` currently sets `workers: 1`. Keep it at 1 until the seed namespace per worker is implemented (out of scope here — log as tech debt if Phase 4 needs parallelism for CI budget).
- **Teacher assignment flow (FR5)** mutates `assignLessonToClassHandler`; this can pollute later runs. Wrap teacher assignment spec in a per-test `beforeEach` reseed or use a dedicated class id not consumed by student specs.

## 4. Architecture Guardrails

- **No imports from `convex/_generated/` in tests or shared selector files** (monorepo boundary rule).
- **E2E specs live only under `apps/integrated-math-3/e2e/`**, never in `__tests__/`. Vitest excludes `e2e/**` already via `vitest.config.ts` — confirm before Phase 2.
- **Seed code is convex-side**, not Playwright-side. The spec only invokes it (HTTP or `npx convex run`). No DB writes from the harness.
- **Selectors module is the sole bridge** between app code and E2E specs. App code may not import from `e2e/`.
- **`data-testid` only**; ban `getByText` for anything that the curriculum/copy team can rewrite.
- **Per-Task Graph Protocol** applies when adding `data-testid` to exported components: `build-graph inspect <Component>` pre-edit, `build-graph update` post-edit. Most additions are JSX-only (no signature change), so caller checks should pass trivially.

## 5. Per-Phase Test Approach Notes

- **Phase 1**: TDD the selector module first (export constants, a unit test asserts no duplicates and kebab-case). Then add the Convex seed action with a vitest convex-test asserting idempotent re-run yields identical document ids. Finally a single E2E smoke spec: log in, dashboard shows the seeded lesson title.
- **Phase 2**: Red first — write the deactivated-denial spec before wiring the seed flag; this forces the seed contract to expose `deactivated: boolean`. Lesson-flow spec asserts reload by capturing `localStorage.length === 0` after reload AND a server-derived completion badge being visible.
- **Phase 3**: One spec per family, each ≤ 30 lines. Use the activity-family routing in `ActivityRenderer` (graph node: `function:ActivityRenderer`) to pick representative lessons from the seeded set — do not invent new activity content. Daily-practice spec submits exactly 3 cards and asserts streak = 1.
- **Phase 4**: Teacher specs reuse `teacherPage` fixture. Gradebook drilldown asserts the cell→detail navigation (uses `GradebookGrid.tsx`). CI: add a new job `e2e-im3` in `.github/workflows/ci.yml` after the `integrated-math-3` job, running `npm run test:e2e --prefix apps/integrated-math-3` against an ephemeral Convex deploy or the seeded preview. Flake budget: retries=1 in CI (override the current `retries: process.env.CI ? 0 : 1`).

## 6. Build-Graph Findings That Shaped This Strategy

- **Graph fresh** (`graph.db` mtime 2026-06-06, today). `build-graph stats` shows 13,052 nodes / 19,639 edges.
- **No existing `submitPracticeResponse`/`submitDailyPractice`/`reviewCard` symbol** — daily-practice submission flow runs through `POST /api/practice/complete` only. Spec must hit the page UI, not invent an API.
- **`getDemoEnvironment` exists at `apps/integrated-math-3/convex/seed.ts`** and `SeedDemoEnvironment`/`SeedDemoResult` interfaces are already defined under `convex/seed/`. Phase 1 should compose these, not duplicate them.
- **`requireActiveRequestSessionClaims`** (BM2) confirms the deactivated-credential pattern exists — IM3 likely has the analogue; auth spec must target the IM3 equivalent route, not the BM2 file.
- **`assignLessonToClassHandler`** at `apps/integrated-math-3/convex/teacher/lessonAssignment.ts` has zero graph callers from UI — `assignLessonToClassAction` in `app/teacher/lessons/page.tsx` is the single entry point. Phase 4 spec must drive that page, no shortcuts.
- **`calculateStreak`** lives at `convex/srs/dashboard.ts` — confirms streak is server-computed, so deterministic seed timestamps (not client clock control) are the right lever.
- **No CI E2E job exists** (`grep playwright .github/workflows/ci.yml` → empty). Phase 4 adds the first one; budget impact must be measured against existing IM3 lint/test/typecheck/build (~ lines 107–127).

MEASURE_AGENT_RESULT
role: strategy
status: complete
track: e2e-coverage-expansion_20260605
phase: track setup
commits: none
tests_run: none (strategy doc only; no implementation)
files_changed: measure/tracks/e2e-coverage-expansion_20260605/test-strategy.md (new)
plan_updates: none — strategy is advisory, does not edit plan.md
known_failures: none
handoff: Implementer should start Phase 1 with the selectors module + seedDemoE2E composer; gate Phase 2 on a 10x clean run of the Phase 1 smoke spec. Reuse existing fixtures.ts and getDemoEnvironment/SeedDemo* — do not duplicate. Keep workers=1; defer parallel-seed namespacing as tech debt. New CI job e2e-im3 needed in Phase 4 with retries=1.
END_MEASURE_AGENT_RESULT
