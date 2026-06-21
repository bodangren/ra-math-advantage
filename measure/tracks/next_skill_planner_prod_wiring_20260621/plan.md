# Next-Skill Planner Production Wiring Plan

## Phase 1: Contract and Caller Discovery

- [x] Record the completion-audit finding and the user decision to wire the planner.
- [x] Identify the canonical planner export and current student visualization/dashboard surfaces.
- [~] Add a Red test that fails when planner output has no production backend query or route caller.
- [~] Add a Red test for the student-facing surface consuming planner recommendations.

### Phase 1 work log (MID Red)

- **Audit anchor (Build-graph findings):** `build-graph callers projectStudentVisualization` → no results. Source-scan (grep -rln) confirms `projectStudentVisualization` is imported only from `packages/knowledge-space-practice/src/index.ts`, `packages/knowledge-space-practice/src/projections/index.ts`, and three test files inside `packages/knowledge-space-practice/src/__tests__/`. **Zero non-test production consumers** — the audit verdict stands.
- **Canonical planner export:** `projectStudentVisualization` in `packages/knowledge-space-practice/src/projections/visualization.ts:115`. Returns `StudentVisualizationV1` (Zod schema in `projections/schemas.ts`).
- **Canonical student-facing surface:** `apps/integrated-math-3/app/student/dashboard/page.tsx:28` already consumes `internal.student.getDashboardData` via `fetchInternalQuery` from `@/lib/convex/server`. P3 wiring extends this page.
- **Internal-API seam:** `internal.student.*` is the canonical namespace — `student.ts` is registered in `convex/_generated/api.d.ts:101,206`. P2 adds `getStudentVisualization` (chosen name) to `apps/integrated-math-3/convex/student.ts`.
- **Dirty-worktree classification at MID start:** 150 files modified. None of the 150 dirty paths live under `apps/integrated-math-3/convex/student.ts` or `apps/integrated-math-3/app/student/dashboard/page.tsx` (the targets of this track's wiring). They are pre-existing in-flight work from `spec-compliance-and-process-integrity_20260612` and `repo-hygiene-remediation_20260616`. **Classification: unrelated user work — preserved.** No overlap with this track's Red-phase commit; commit only the new test file.
- **Targeted Red command:** `npx vitest run planner-prod-wiring --root apps/integrated-math-3`
- **Targeted Red command result (2026-06-21 MID Red phase):** 1 file, **2 failed / 2 total**, 5.47s. Both new tests fail with the expected missing-implementation reasons — no unrelated-baseline noise:
  - **Test (a)** — `Phase 1 — planner production caller exists`: `Expected ≥1 non-test production caller of the next-skill planner; found 0.` (assertion at line 248). Failure message documents what P2/P3 must do; not a stale-durable Red.
  - **Test (b)** — `Phase 1 — internal.student.getStudentVisualization is registered`: `Expected 'export const getStudentVisualization = internalQuery({...})' in apps/integrated-math-3/convex/student.ts.` (assertion at line 312). Source-file scan proves the API seam is missing; not a stale-durable Red.
- **Artifacts authored (untracked at session end; commit listed below):**
  - `apps/integrated-math-3/__tests__/planner-prod-wiring.test.ts` — both Red tests + `findProductionCallers` helper exported for P2/P3 re-use.
- **Commit (pending):** Conventional Commit, e.g. `test(planner-prod-wiring): add Phase 1 Red tests for planner production caller + getStudentVisualization seam`. Commit only the new test file; do NOT touch the 150 dirty unrelated files.

## Phase 2: Backend Exposure

- [ ] Implement the Convex query or backend module that exposes planner recommendations.
- [ ] Validate input/output schemas and parent prerequisite data loading.
- [ ] Preserve existing planner math tests and add integration coverage for the backend exposure.

## Phase 3: Student-Facing Wiring

- [ ] Render planner recommendations in the selected student-facing route or dashboard panel.
- [ ] Handle empty/insufficient-data states without fabricating recommendations.
- [ ] Verify the production caller check passes with a non-test call path.

## Phase 4: Closeout

- [ ] Run targeted planner, backend, and route tests.
- [ ] Run relevant typecheck/lint/build gates or document unrelated baseline failures.
- [ ] Update the original archived track note to link to this remediation.
- [ ] Archive only after the production caller path is verified.
