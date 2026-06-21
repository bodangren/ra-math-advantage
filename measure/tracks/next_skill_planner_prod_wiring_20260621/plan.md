# Next-Skill Planner Production Wiring Plan

## Phase 1: Contract and Caller Discovery

- [x] Record the completion-audit finding and the user decision to wire the planner.
- [x] Identify the canonical planner export and current student visualization/dashboard surfaces.
- [x] Add a Red test that fails when planner output has no production backend query or route caller.
- [x] Add a Red test for the student-facing surface consuming planner recommendations.

### Phase 1 work log (MID Red)

- **Audit anchor (Build-graph findings):** `build-graph callers projectStudentVisualization` → no results. Source-scan confirms `projectStudentVisualization` is imported only from `packages/knowledge-space-practice/src/index.ts`, `packages/knowledge-space-practice/src/projections/index.ts`, and test files inside `packages/knowledge-space-practice/src/__tests__/`. **Zero non-test graph callers** — the audit verdict stands.
- **Canonical planner export:** `projectStudentVisualization` in `packages/knowledge-space-practice/src/projections/visualization.ts:115`. Returns `StudentVisualizationV1` (Zod schema in `projections/schemas.ts`).
- **Canonical student-facing surface:** `apps/integrated-math-3/app/student/dashboard/page.tsx:28` already consumes `internal.student.getDashboardData` via `fetchInternalQuery` from `@/lib/convex/server`. P3 wiring extends this page.
- **Internal-API seam:** `internal.student.*` is the canonical namespace — `student.ts` is registered in `convex/_generated/api.d.ts`. P2 adds `getStudentVisualization` (chosen name) to `apps/integrated-math-3/convex/student.ts`.
- **Dirty-worktree classification at MID start:** `apps/integrated-math-3/convex/student.ts` and `apps/integrated-math-3/convex/tsconfig.json` were modified with an uncommitted P2 implementation (`getStudentVisualization` internalQuery + `resolveJsonModule`). These are **relevant to the track** (P2 backend exposure) but were not authored in this Red phase. They are left dirty for the next phase and were not included in the P1 commit. The remaining ~148 dirty paths are unrelated pre-existing work from other tracks and were preserved untouched.
- **Contract tightening:** The original P1(a)/P1(b) assertions were already green at MID start because of the uncommitted `student.ts` implementation. Per Measure workflow, the contract was tightened rather than faking a Red phase. A third assertion was added requiring a student-facing file under `app/student/` to reference `getStudentVisualization`.
- **Targeted Red command:** `npx vitest run planner-prod-wiring --root apps/integrated-math-3`
- **Targeted Red command result (2026-06-21 MID Red phase):** 1 file, **1 failed / 3 total**, ~5.7s. The tightened student-facing-surface test fails with the expected missing-implementation reason; the two original assertions pass because the P2 backend query is already present in the dirty worktree:
  - **Test (a)** — `Phase 1 — planner production caller exists`: passes (found `projectStudentVisualization` import in `apps/integrated-math-3/convex/student.ts`).
  - **Test (b)** — `Phase 1 — internal.student.getStudentVisualization is registered`: passes (found `export const getStudentVisualization = internalQuery({...})` in `apps/integrated-math-3/convex/student.ts`).
  - **Test (c)** — `Phase 1 — student-facing surface consumes planner recommendations`: fails with `Expected ≥1 student-facing production consumer of getStudentVisualization; found 0.` This is the live Red gate for Phase 3.
- **Artifacts authored:**
  - `apps/integrated-math-3/__tests__/planner-prod-wiring.test.ts` — three P1 tests (two green because P2 is dirty-implemented, one Red for the student surface) + `findProductionCallers` / `findStudentSurfaceReferences` helpers exported for P2/P3 re-use.
- **Commit:** Conventional Commit `test(planner-prod-wiring): add Phase 1 Red tests with tightened student-surface contract`. Commit includes only the new test file; the relevant dirty `student.ts`/`tsconfig.json` implementation is left for the P2/P3 implementer.

## Phase 2: Backend Exposure

- [~] Implement the Convex query or backend module that exposes planner recommendations.
- [~] Validate input/output schemas and parent prerequisite data loading.
- [~] Preserve existing planner math tests and add integration coverage for the backend exposure.

### Phase 2 work log (MID Red)

- **Dirty-worktree classification:** The uncommitted P2 implementation in `apps/integrated-math-3/convex/student.ts` and `apps/integrated-math-3/convex/tsconfig.json` is **relevant to this track** (backend query + JSON module support). The uncommitted P3 wiring in `apps/integrated-math-3/app/student/dashboard/page.tsx` is also relevant but is outside Phase 2 scope and is preserved untouched. All other dirty paths (~148 files) are unrelated pre-existing work from other tracks and are preserved.
- **Build-graph baseline:** `graph.db` was rescanned from HEAD because the existing DB was stale (student.ts functions were absent). Fresh scan: 14,847 nodes / 21,615 edges. `build-graph inspect projectStudentVisualization` still shows **zero caller edges** — only `param_flow` edges — confirming the planner symbol has no captured production caller yet. `build-graph query` for `getStudentVisualization` returns no matches because the Convex query handler is anonymous inside `internalQuery({...})` and is not indexed as a standalone function.
- **Red contract tightening:** The uncommitted `getStudentVisualization = internalQuery({...})` exposes the live API shape, but it is not mock-ctx testable because the handler is not exported separately. Per test-strategy.md §2 (mock-ctx harness, no `convex-test` dependency), Phase 2 Red requires `getStudentVisualizationHandler` to be exported from `apps/integrated-math-3/convex/student.ts`.
- **Prerequisite data-loading gap:** The current implementation derives `learnerState` solely from `placement_results`. test-strategy.md §3 requires Phase 2 to derive `learnerState` from `student_competency` / `srs_cards` / `objective_policies` OR accept an explicit learner-state input. The Red test asserts the handler queries `student_competency`.
- **Targeted Red command:** `npx vitest run studentVisualization --root apps/integrated-math-3`
- **Targeted Red command result (2026-06-21 MID Red phase):** 1 file, **4 failed / 5 total**, ~7.4s.
  - **Test "handler exists as a named export for mock-ctx testing"** — fails: `getStudentVisualizationHandler` is `undefined`.
  - **Tests "returns a payload that parses as StudentVisualizationV1", "recommendedNext matches direct projection", "loads prerequisite proficiency data from student_competency"** — fail with `TypeError: getStudentVisualizationHandler is not a function`.
  - **Test "fixture projection parses as StudentVisualizationV1"** — passes (sanity-checks the fixture/planner contract).
- **Artifacts authored:**
  - `apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts` — Phase 2 Red tests (handler export, Zod parse, recommendedNext parity, prerequisite data-loading).
  - `apps/integrated-math-3/__tests__/convex/_fixtures/student-viz-fixture.ts` — frozen 4-node/2-edge fixture per test-strategy.md §2.
- **Commit:** Conventional Commit `test(planner-prod-wiring): add Phase 2 Red tests for backend exposure` (`4d9b8e07`). Commit includes only the new test files and Measure docs; the relevant dirty `student.ts` / `tsconfig.json` implementation is left for the Green-phase implementer.

## Phase 3: Student-Facing Wiring

- [ ] Render planner recommendations in the selected student-facing route or dashboard panel.
- [ ] Handle empty/insufficient-data states without fabricating recommendations.
- [ ] Verify the production caller check passes with a non-test call path.

## Phase 4: Closeout

- [ ] Run targeted planner, backend, and route tests.
- [ ] Run relevant typecheck/lint/build gates or document unrelated baseline failures.
- [ ] Update the original archived track note to link to this remediation.
- [ ] Archive only after the production caller path is verified.
