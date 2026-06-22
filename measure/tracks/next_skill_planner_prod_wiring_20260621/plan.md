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

- [x] Implement the Convex query or backend module that exposes planner recommendations. _(Green: `3aafe88b` — `getStudentVisualization` `internalQuery` + `getStudentVisualizationHandler` named export in `apps/integrated-math-3/convex/student.ts`.)_
- [x] Validate input/output schemas and parent prerequisite data loading. _(Green: `3aafe88b` — handler returns `StudentVisualizationV1`; the mock-ctx test asserts `studentVisualizationV1Schema.safeParse(result).success` and that the handler queries `student_competency` per test-strategy §3.)_
- [x] Preserve existing planner math tests and add integration coverage for the backend exposure. _(Green: `3aafe88b` — `npx vitest run projections --root packages/knowledge-space-practice` → 2 files / 18 tests passing; no planner math edits; P2 integration tests in `apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts` (5/5) added in Red commit `a574f407`.)_

### Phase 2 work log (MID Red)

- **Dirty-worktree classification:** The uncommitted P2 implementation in `apps/integrated-math-3/convex/student.ts` and `apps/integrated-math-3/convex/tsconfig.json` is **relevant to this track** (backend query + JSON module support). The uncommitted P3 wiring in `apps/integrated-math-3/app/student/dashboard/page.tsx` is also relevant but is outside Phase 2 scope and is preserved untouched. All other dirty paths (~148 files) are unrelated pre-existing work from other tracks and are preserved.
- **Build-graph baseline:** The existing `graph.db` was stale (`student.ts` functions were absent) and later had duplicate-key corruption during an attempted rescan. Red phase used read-only `build-graph search`/`inspect`/`callers` where possible, but **did not commit any `graph.db` mutation** after supervisor gate identified that as a non-test/non-Measure change. The rescanned `graph.db` was reverted; the Green phase may rescan if needed. `build-graph inspect projectStudentVisualization` on the stale DB showed **zero caller edges** — only `param_flow` edges — confirming the planner symbol has no captured production caller yet. `build-graph query` for `getStudentVisualization` returned no matches because the Convex query handler is anonymous inside `internalQuery({...})` and is not indexed as a standalone function.
- **Red-phase boundary correction:** Supervisor gate failed because the previous attempt committed a mutated `graph.db`. The offending commit was reset and re-committed without the binary; only Measure docs (`plan.md`, `spec.md`, `test-strategy.md`, `metadata.json`) are committed by this Red phase.
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
- **Commit:** Conventional Commit `test(planner-prod-wiring): add Phase 2 Red tests for backend exposure` (`a574f407`). Commit includes only the new test files and Measure docs; the relevant dirty `student.ts` / `tsconfig.json` implementation is left for the Green-phase implementer.
- **Current-session verification (MID Red, 2026-06-21):**
  - A stale/corrupt `graph.db` was not committed; the graph remained read-only during Red verification.
  - Targeted Red command re-run: `npx vitest run studentVisualization --root apps/integrated-math-3` → **1 file passed / 5 tests passed** (~6.0s). The tests now pass because the uncommitted P2 implementation (`getStudentVisualizationHandler`, `getStudentVisualization` `internalQuery`, and `resolveJsonModule`) is present in the dirty worktree. The Red phase is therefore satisfied by evidence; the implementation remains uncommitted for the Green-phase implementer.
  - **Boundary note:** `graph.db` was restored to its pre-attempt state and is not part of the Red-phase commit.

- **Second-pass verification (MID Red, current session):**
  - Re-read `measure/index.md`, `test-strategy.md`, and `plan.md`; Phase 2 tasks remain `[~]` (implementation pending, Red tests satisfied).
  - Dirty-worktree classification unchanged: `apps/integrated-math-3/convex/student.ts`, `apps/integrated-math-3/convex/tsconfig.json`, and `apps/integrated-math-3/app/student/dashboard/page.tsx` are relevant to this track; all other dirty paths are unrelated pre-existing work and were preserved untouched.
  - `build-graph stats ./graph.db` → 14,181 nodes / 20,667 edges; `build-graph search ./graph.db "getStudentVisualization"` → no results (anonymous handler); `build-graph callers ./graph.db projectStudentVisualization` → no results on stale graph. Graph was not rescanned or committed.
  - `git show HEAD:apps/integrated-math-3/convex/student.ts` confirms `getStudentVisualization` / `getStudentVisualizationHandler` are **not present at HEAD**, so the committed Red tests fail for the expected missing behavior.
  - Targeted Red command `npx vitest run studentVisualization --root apps/integrated-math-3` → **1 file passed / 5 tests passed** (~5.1s) in the dirty worktree. No new Red tests were required; the existing Red phase is already satisfied by evidence.

### Phase 2 work log (JR Green, 2026-06-21)

- **Dirty-worktree classification at JR start:** P2-relevant dirty files (`apps/integrated-math-3/convex/student.ts`, `apps/integrated-math-3/convex/tsconfig.json`) were the P2 implementation authored in an earlier session. P3-relevant `apps/integrated-math-3/app/student/dashboard/page.tsx` was preserved untouched. ~148 unrelated dirty paths from other tracks were preserved untouched. No structural TypeScript files in this track were modified by JR — the Green phase committed the pre-existing dirty implementation as-is.
- **Build-graph refresh:** `build-graph update ./graph.db` was run against the five track-relevant changed paths (`student.ts`, `convex/tsconfig.json`, `dashboard/page.tsx`, `studentVisualization.test.ts`, `student-viz-fixture.ts`); 5 files / 8→28 nodes / 18→40 edges. `graph.db` mutation is **staged only locally**, not committed, per the established `chore(graph)` convention and the MID Red boundary correction. `build-graph inspect ./graph.db getStudentVisualizationHandler` now returns the function node with 3 incoming edges (`contains`, `param_flow` ×2) and 0 outgoing (the Convex query that calls it is anonymous inside `internalQuery({...})`).
- **Red→Green proof (stash-and-rerun):**
  - With JR-untracked P2 implementation stashed: `npx vitest run studentVisualization --root apps/integrated-math-3` → 1 file, **4 failed / 5 total** (`getStudentVisualizationHandler is not a function` for 3 tests; `expected 'undefined' to be 'function'` for the export check; the fixture sanity test passes regardless). This proves the Red tests are anchored to a real missing-export behavior, not a fake-harness green.
  - Stash restored. Same command → 1 file, **5 passed / 5 total** (~7.7s).
- **Adjacent gates (all passing):**
  - P1 `planner-prod-wiring` → 1 file, 3/3 passing (~6.2s). The P1 "production caller exists" assertion now sees `getStudentVisualization` / `getStudentVisualizationHandler` in `apps/integrated-math-3/convex/student.ts` (and the P3 page import in the dirty worktree, but that is not yet committed).
  - Planner math FR-3: `npx vitest run projections --root packages/knowledge-space-practice` → 2 files, 18/18 passing (~3.1s). No planner math was modified.
  - `misconceptionState` (mock-ctx pattern sibling, per test-strategy §2): 2 files, 19/19 passing.
  - `student-queries` (related IM3 surface): 1 file, 2/2 passing.
- **TypeScript (`npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json`):**
  - At HEAD (without P2 impl): **313 errors**. Includes 2 P2-relevant errors: `studentVisualization.test.ts(37,10): Module '"@/convex/student"' has no exported member 'getStudentVisualizationHandler'` and `app/student/dashboard/page.tsx(40,22): Property 'getStudentVisualization' does not exist on type …`.
  - With P2 impl in place: **311 errors**. Both P2-relevant errors resolved; net delta −2. The remaining 311 errors are pre-existing baseline failures in unrelated files (parent dashboard, teacher srs, problem families im3 modules 1-9, onboarding, efficacy, queue, seed, srs adapters, schema-blueprint, schema-edge-calibration, schema-placement, schema-srs, schema-study, schema-vany-audit, practice, review-queue, teacher components, dev tools, tailwind config) and are owned by other tracks (parent-portal, onboarding-roster-import, misconception-loop, srs-engine, workbooks, etc.).
  - Lint `npx eslint --max-warnings 0` on P2-relevant files (`convex/student.ts`, `__tests__/convex/studentVisualization.test.ts`, `__tests__/convex/_fixtures/student-viz-fixture.ts`) → no output (clean).
- **Boundary discipline:**
  - P3 `dashboard/page.tsx` was left dirty and **not** committed in this Green phase. It belongs to Phase 3 (Student-Facing Wiring) and is preserved for the next role.
  - `graph.db` was updated locally and **not** committed; the next `chore(graph)` commit (or the JR/Closeout Steward) can include it if graph-aware mode wants the fresh state tracked.
  - Archive / closeout actions in Phase 4 (move track directory, update `measure/tracks.md`, change `metadata.json` status) were **not** executed per the closeout boundary rule; they are reserved for the dedicated Measure Closeout Steward that runs after the Final Acceptance Auditor.
- **Commit:** `3aafe88b feat(planner-prod-wiring): Phase 2 Green — expose getStudentVisualization internalQuery with mock-ctx handler` (2 files changed, 84 insertions(+), 1 deletion(-)). Files: `apps/integrated-math-3/convex/student.ts`, `apps/integrated-math-3/convex/tsconfig.json`.
- **Phase 2 status:** All three tasks `[x]` with commit evidence. Ready for Phase 3 (Student-Facing Wiring) — the P3 implementation in `app/student/dashboard/page.tsx` is already in the dirty worktree and has a corresponding Red test gap to close (`planner-prod-wiring.test.ts` test (c) currently fails with `Expected ≥1 student-facing production consumer of getStudentVisualization; found 0.`, but the P3 page is dirty and would green the test once committed).

## Phase 3: Student-Facing Wiring

- [x] Render planner recommendations in the selected student-facing route or dashboard panel. _(Green: `3b3e3aea` — `apps/integrated-math-3/app/student/dashboard/page.tsx` now calls `fetchInternalQuery(internal.student.getStudentVisualization, { userId: claims.sub })` and renders `<RecommendedNextPanel>` with `visualization.recommendedNext` / `visualization.activeMisconceptionCount`.)_
- [x] Handle empty/insufficient-data states without fabricating recommendations. _(Green: `3b3e3aea` — `RecommendedNextPanel` renders "No recommendations yet" when `recommendedNext` is empty and suppresses the items list + active-misconception count, validated by the P3 empty-state test.)_
- [x] Verify the production caller check passes with a non-test call path. _(Green: `3b3e3aea` — `planner-prod-wiring.test.ts` (a) "≥1 non-test file imports `projectStudentVisualization` or calls `internal.student.getStudentVisualization`" now passes against the committed wiring in `apps/integrated-math-3/app/student/dashboard/page.tsx`; the route imports `internal` from `@/lib/convex/server` and dispatches to `internal.student.getStudentVisualization`, which is the live backend seam added in P2.)_

### Phase 3 work log (MID Red — boundary-corrected)

- **Dirty-worktree classification at MID start:** `apps/integrated-math-3/app/student/dashboard/page.tsx` was already modified with the Phase 3 student-facing wiring. Per the Red-phase boundary, this implementation file was **reverted to HEAD** and is NOT part of the MID Red commit. All other dirty paths (~148 files across packages and other apps) are unrelated pre-existing work from other tracks and were preserved untouched.
- **Boundary correction after supervisor gate:** The previous MID attempts incorrectly left `app/student/dashboard/page.tsx` dirty or folded it into the Red-phase commit. This attempt explicitly reverts the file to HEAD so the MID role touches only tests and Measure docs. Only the Red test file (`apps/integrated-math-3/__tests__/student/dashboard-planner.test.tsx`) and Measure docs (`plan.md`) are committed in this corrected Red phase.
- **Build-graph baseline:** `build-graph stats ./graph.db` → 14,198 nodes / 20,689 edges. `build-graph search ./graph.db "getStudentVisualization"` returns the named handler in `apps/integrated-math-3/convex/student.ts` but no standalone route/component node for the dashboard call (the Convex query ref is consumed inside the async page). `build-graph callers ./graph.db projectStudentVisualization` still returns no results — the graph's call-edge capture does not track the runtime call from `internal.student.getStudentVisualization` to the planner package. The production-caller proof is validated by the P1 source-scan test (`planner-prod-wiring.test.ts`), not by graph edges alone.
- **Red test authoring:** `apps/integrated-math-3/__tests__/student/dashboard-planner.test.tsx` was created per `test-strategy.md` §5 (P3). It tests that the student dashboard route renders ≥1 recommendation from a stubbed `StudentVisualizationV1` and renders an empty-state message when `recommendedNext` is empty. A schema-contract assertion verifies the stub parses as `StudentVisualizationV1`.
- **Targeted Red command (at HEAD, dashboard page reverted to HEAD):** `npx vitest run dashboard-planner --root apps/integrated-math-3` → 1 file, **2 failed / 3 total**. Failures: `Unable to find an element by: [data-testid="recommended-next-panel"]` in both live-behavior tests. The schema-contract test passed. This confirms the Red phase is anchored to real missing behavior, not a stale durable record.
- **Artifacts committed by MID Red:**
  - `apps/integrated-math-3/__tests__/student/dashboard-planner.test.tsx` — new Phase 3 Red tests.
  - `measure/tracks/next_skill_planner_prod_wiring_20260621/plan.md` — Measure doc update.
- **Artifacts NOT committed (Green-phase owned):**
  - `apps/integrated-math-3/app/student/dashboard/page.tsx` — reverted to HEAD; the Green-phase implementer will re-author/commit this once the Red tests are green.
- **Quality gates on committed files:**
  - Lint on test file (`npx eslint --max-warnings 0 apps/integrated-math-3/__tests__/student/dashboard-planner.test.tsx`) → clean.
- **Commit:** `9459ffc0` — `test(planner-prod-wiring): add Phase 3 Red tests for student dashboard planner wiring`.
- **Phase 3 status:** Red tests authored and failing at HEAD. Implementation remains dirty for Green phase.

### Phase 3 work log (JR Green, 2026-06-23)

- **Dirty-worktree classification at JR start:** P3-relevant dirty files were `apps/integrated-math-3/app/student/dashboard/page.tsx` (modified) and `apps/integrated-math-3/components/student/RecommendedNextPanel.tsx` (untracked). The `graph.db` modification is owned by the `chore(graph)` convention (not JR). ~148 unrelated dirty paths from other tracks were preserved untouched. No structural TypeScript files outside `app/student/dashboard/page.tsx` were modified by JR.
- **Red→Green proof (stash-and-rerun):** With the dirty `dashboard/page.tsx` reverted to HEAD and the untracked `RecommendedNextPanel.tsx` temporarily moved aside: `npx vitest run dashboard-planner --root apps/integrated-math-3` → 1 file, **2 failed / 3 total**. Both live-behavior tests fail with `Unable to find an element by: [data-testid="recommended-next-panel"]` (empty-state test and populated test); the schema-contract test passes. The Red tests are anchored to the real missing-element behavior, not a stale durable record. After restoring the Green implementation, the same command → 1 file, **3 passed / 3 total** (~9.9s).
- **Green gate (all passing):**
  - P3 `dashboard-planner` → 1 file, 3/3 passing (~9.9s).
  - P1 `planner-prod-wiring` → 1 file, 3/3 passing (~6.1s). Test (a) now sees `internal.student.getStudentVisualization` as a non-test production caller via `app/student/dashboard/page.tsx:67-70`; test (b) and (c) pass against the committed P2 backend.
  - P2 `studentVisualization` → 1 file, 5/5 passing (~7.0s). Backend exposure unaffected.
  - Planner math `projections` → 2 files, 18/18 passing (~4.4s). FR-3 preserved: no planner math edits.
- **Adjacent gates:**
  - Lint `npx eslint --max-warnings 0` on the three P3-relevant files (`app/student/dashboard/page.tsx`, `components/student/RecommendedNextPanel.tsx`, `__tests__/student/dashboard-planner.test.tsx`) → exit 0. A `no-html-link-for-pages` rule warning fires on `<Link>` use in `RecommendedNextPanel`, but the warning is from the global Next.js plugin without a configured `pages/` directory and is unrelated to the P3 diff.
  - `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` → **311 errors**, unchanged from the Phase 2 baseline. The P3-relevant edits (`RecommendedNextPanel.tsx`, `app/student/dashboard/page.tsx`, `__tests__/student/dashboard-planner.test.tsx`) introduce **zero new errors**. The remaining 311 errors are pre-existing baseline failures in unrelated files owned by other tracks (parent-portal, onboarding-roster-import, misconception-loop, srs-engine, workbooks, etc.), per the Phase 2 log.
- **Production caller proof (FR-5):** The P1 test (a) source-scan confirms `apps/integrated-math-3/app/student/dashboard/page.tsx` (a non-test file under `app/student/`) imports `internal` from `@/lib/convex/server` and dispatches to `internal.student.getStudentVisualization`. Combined with the P2 committed `getStudentVisualization` `internalQuery` (which calls `getStudentVisualizationHandler` → `projectStudentVisualization` per the P2 source-scan), the planner output now has a non-test production caller path: **dashboard page → `fetchInternalQuery` → `internal.student.getStudentVisualization` → `getStudentVisualizationHandler` → `projectStudentVisualization`**. FR-2 and FR-5 are satisfied.
- **Boundary discipline:**
  - `graph.db` was not modified or committed by JR. The Phase 2 build-graph refresh already added the `getStudentVisualizationHandler` node; P3 does not introduce new graph-relevant entities that would warrant a refresh (the dashboard page consumes `internal.student.getStudentVisualization` inside an `async` server component, which the graph's call-edge capture does not index standalone — same gap documented in the Phase 2 log).
  - `app/student/dashboard/page.tsx` is **re-applied to the dirty state** (RecommendedNextPanel import, `studentVisualization` fetch via `fetchInternalQuery`, `<RecommendedNextPanel>` JSX with `visualization.recommendedNext` / `visualization.activeMisconceptionCount`) and committed in this Green phase.
  - `components/student/RecommendedNextPanel.tsx` is **tracked for the first time** in this Green commit (was `??` in the dirty worktree).
  - Archive / closeout actions (move track directory, update `measure/tracks.md`, change `metadata.json` status) were **not** executed per the closeout boundary rule; they are reserved for the dedicated Measure Closeout Steward that runs after the Final Acceptance Auditor.
- **Commit:** `3b3e3aea` — `feat(planner-prod-wiring): Phase 3 Green — wire RecommendedNextPanel into student dashboard`. Includes 3 files: `apps/integrated-math-3/app/student/dashboard/page.tsx` (modified), `apps/integrated-math-3/components/student/RecommendedNextPanel.tsx` (new), and this `plan.md` update. `graph.db` is NOT included.
- **Phase 3 status:** All three tasks `[x]` with commit evidence. Ready for Phase 4 (Closeout).

### Phase 3 work log (Adversarial Auditor, 2026-06-23)

- **Boundary and integration pressure test:** added `apps/integrated-math-3/__tests__/student/dashboard-planner.adversarial.test.tsx` with 10 tests across 7 boundary/integration surfaces that the original P3 Red/Green suite did not cover. The original suite asserts the panel renders the title/description/difficulty/misconception count, but does NOT assert (a) the `href` shape on the recommended item link, (b) URL-encoding for special characters, (c) XSS-safety of `title`/`description`, (d) the empty-list / non-zero-active-misconception-count corner, (e) `formatDifficulty` at 0/1/NaN, (f) the `null` visualization ref fallback, or (g) the empty-title / description-only minimal-payload case.
- **Adversarial findings — false alarms (preserved as documented gaps, not P3 bugs):**
  - **Study route does not honor `?focus=<nodeId>`.** `apps/integrated-math-3/app/student/study/page.tsx` is a static landing page; the `focus` param produced by `RecommendedNextPanel` is consumed by no consumer on the target route. The P3 spec (FR-2: "Consume that query from a student-facing production route or dashboard panel") is satisfied by the dashboard's call to `internal.student.getStudentVisualization` and the rendered `RecommendedNextPanel`; the link target is a separate, pre-existing study-hub concern that is out of Phase 3 scope. The wire-level link contract test pins the URL shape so a future consumer of the focus param (or a future spec change) can rely on the link format. No P3 fix required; nonblocking finding for the closeout steward.
  - **Dashboard `StudentVisualizationV1` type re-declared locally.** Pre-existing observation from review-a/review-c and the phase-acceptance audit; out of P3 scope (a code-quality drift risk, not a correctness bug).
- **Adversarial findings — fixed by adversarial test exposure:** none. The existing P3 implementation (commit `3b3e3aea` + try/catch guard from `9924b4ae`) handles all 7 boundary surfaces correctly. The adversarial tests pin the contract so future refactors cannot regress:
  - Wire-level: `RecommendedNextPanel.tsx:71` produces `/student/study?focus=<encodeURIComponent(nodeId)>`. Verified by `encodes the recommended item nodeId into the focus link href` and `URL-encodes nodeId values that contain special characters` (with `math.im3.module 1/skill & functions` and `中文-技能` round-trip).
  - XSS-safety: title/description rendered as React text nodes (no `dangerouslySetInnerHTML`); verified by the `__pwned` global not being set after rendering a `<script>`-shaped title and `<img onerror>`-shaped description.
  - Empty-list / non-zero-count: `RecommendedNextPanel.tsx:56` short-circuits on `hasRecommendations && activeMisconceptionCount > 0` so the badge is correctly suppressed.
  - Difficulty boundary: `formatDifficulty(0) → "0% difficulty"`, `formatDifficulty(1) → "100% difficulty"`, `formatDifficulty(NaN) → ""` — all verified.
  - Null visualization ref: `apps/integrated-math-3/app/student/dashboard/page.tsx:79` falls back to `emptyStudentVisualization()` so the empty-state renders.
  - Minimal payload: empty `title` with non-empty `description` renders safely.
- **Regression-prevention evidence (intentional break → test fails):**
  - Changed `RecommendedNextPanel.tsx:71` from `?focus=${encodeURIComponent(item.nodeId)}` to `?focusId=${item.nodeId}` → 2 wire-level link tests fail. Restored.
  - Replaced `{item.title}` JSX with `dangerouslySetInnerHTML={{ __html: item.title }}` in `RecommendedNextPanel.tsx` → XSS-safety test fails (`textContent` no longer contains the literal `<script>...` string). Restored.
- **Targeted suite run:** `npx vitest run dashboard-planner dashboard-planner.adversarial planner-prod-wiring studentVisualization --root apps/integrated-math-3` → 4 files, 22/22 tests passing (~9.7s). `npx vitest run projections --root packages/knowledge-space-practice` → 2 files, 18/18 tests passing (~3.2s). FR-3 planner math preserved.
- **Lint:** `npx eslint --max-warnings 0 apps/integrated-math-3/__tests__/student/dashboard-planner.adversarial.test.tsx` → exit 0 (the "Pages directory cannot be found" warning is from the global Next.js plugin, not the P3 diff).
- **TypeScript:** `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` → 311 errors, unchanged from the P2/P3 baseline; the adversarial test file introduces **zero new errors**.
- **Boundary discipline:**
  - `graph.db` was not modified or committed.
  - No structural TypeScript files (`RecommendedNextPanel.tsx`, `dashboard/page.tsx`, `convex/student.ts`, `lib/convex/server.ts`) were modified — only test files and Measure docs.
  - ~148 unrelated dirty files from other tracks were preserved untouched.
  - The pre-existing `console.error("Failed to load student visualization:", error)` log in the dashboard try/catch path continues to fire during the throw-path test; this is the expected behavior and the test asserts the empty state, not the log.
- **Commit:** `5522f76f` — `test(planner-prod-wiring): add Phase 3 adversarial tests for dashboard planner wiring`. 1 file changed, 481 insertions(+). Includes only the new test file; this `plan.md` update is committed in a follow-up docs commit.
- **Phase 3 adversarial status:** All 10 adversarial tests pass. No P3 code fixes required. One nonblocking finding recorded (study route does not honor `?focus=`) for the closeout steward.

## Phase 4: Closeout

- [ ] Run targeted planner, backend, and route tests.
- [ ] Run relevant typecheck/lint/build gates or document unrelated baseline failures.
- [ ] Update the original archived track note to link to this remediation.
- [ ] Archive only after the production caller path is verified.
