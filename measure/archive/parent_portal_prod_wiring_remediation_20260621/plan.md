# Parent Portal Production Wiring Remediation Plan

## Phase 1: Contract and Red Tests

- [x] Record the completion-audit false-positive finding and identify the current `/parent` route, parent auth guard, parent components, and backend projection surfaces.
- [x] Add a route-rendering Red test for a parent with one linked student.
- [x] Add route-rendering Red tests for multi-student and no-link parent states.
- [x] Add fail-closed Red tests for non-parent sessions and teacher-only projection fields.
- [x] Add a non-test-caller contract test for parent portal components/services claimed as complete.

### Phase 1 — Red-phase evidence (MID, 2026-06-23)

Targeted Red command (single explicit file path, per test-strategy.md §7):

```
npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3
```

→ **1 failed file, 6 failed tests, 0 passed.** All failures are genuine Red signals caused by the production `/parent` route being a static stub and parent-portal components/services having no non-test callers.

| Test | Failure mode |
|------|--------------|
| one linked student → renders `ParentDashboard` | element `parent-dashboard-can-do` not found; route renders static "Parent Portal" stub |
| multi-student → renders `StudentSwitcher` | element `parent-student-switcher` not found; route renders static stub |
| no linked students → renders `ParentEmptyStates` | element `parent-empty-state-no-links` not found; route renders static stub |
| non-parent session → redirect | promise resolved to static stub JSX instead of rejecting with `NEXT_REDIRECT` |
| teacher-only fields → fail-closed | `fetchInternalQuery` was never called with `parent:visualization:projectParentVisualizationQuery` |
| non-test-caller contract | `ParentDashboard` has no non-test production caller in `apps/integrated-math-3` |

Artifacts added:
- `measure/tracks/parent_portal_prod_wiring_remediation_20260621/test-strategy.md`
- `apps/integrated-math-3/__tests__/app/parent/parent-portal-prod-wiring.test.tsx`

Dirty worktree classification at MID start (preserved, NOT staged):
- ~148 unrelated modified files from other tracks — unrelated user work; NOT staged.
- `graph.db` — generated build artifact; NOT staged and not probed during Red phase to avoid the SQLite mtime re-dirty issue documented in the archived parent-portal plan.

## Phase 2: Production Wiring

- [x] Replace the static `/parent` route stub with live parent session guard usage. _(Green: `7e276db1` — `app/parent/page.tsx` is now an async server component that calls `requireParentServerSessionClaims('/parent')` and rethrows the `NEXT_REDIRECT` for non-parent sessions.)_
- [x] Implement or expose the parent-safe projection query in `convex/parent/visualization.ts` or the canonical equivalent. _(Green: `7e276db1` — new `convex/parent/visualization.ts` exports `projectParentVisualizationQuery` (`internalQuery`) and a mock-ctx-friendly `projectParentVisualizationHandler` that fail-closes on missing/inactive `parent_links` rows and non-student target profiles.)_
- [x] Wire route data into `ParentDashboard`, `StudentSwitcher`, and `ParentEmptyStates`. _(Green: `7e276db1` — new client wrapper `components/parent/ParentPortalClient.tsx` composes `StudentSwitcher` + `ParentDashboard` from live route data and falls back to `ParentEmptyStates` for no-links / pending / no-projection branches. Server-side fallback also covers no-links and all-pending states.)_
- [x] Verify generated Convex APIs and route imports are updated. _(Green: `7e276db1` — `convex/_generated/api.d.ts` now imports `parent/visualization` and registers it under `internal.parent.visualization`, so `internal.parent.visualization.projectParentVisualizationQuery` is reachable from the page-level server component. Codegen-style update was done manually because `npx convex dev` requires a live deployment.)_

### Phase 2 work log (JR Green, 2026-06-23)

- **Dirty-worktree classification at JR start:** ~148 unrelated modified files from other tracks were preserved untouched. The P1 Red commit (`18088790`) added only the test file, the test-strategy, the plan, and `metadata.json`; the spec was a pre-existing untracked draft. JR's track-relevant edits are limited to: `apps/integrated-math-3/app/parent/page.tsx` (rewritten from static stub to async server component), `apps/integrated-math-3/convex/parent/visualization.ts` (new file), `apps/integrated-math-3/components/parent/ParentPortalClient.tsx` (new file), `apps/integrated-math-3/convex/_generated/api.d.ts` (added `parent/visualization` import + module entry), and `apps/integrated-math-3/__tests__/app/parent/parent-portal-prod-wiring.test.tsx` (lint fix only — renamed unused `args` parameter to `_args` in the teacher-only-fields test mock so the `--max-warnings 0` ESLint gate stays green; no assertion was modified).
- **Build-graph refresh:** intentionally **skipped** for this track, per `test-strategy.md §6` ("Build-graph probing is intentionally skipped during the Red phase to avoid the SQLite mtime/journal issue that re-dirtied `graph.db` in prior parent-portal attempts") and the boundary rule "Do NOT commit `graph.db`." The Green phase applies the same boundary. `graph.db` was not read, written, or staged.
- **Red→Green proof (the same targeted command, before vs after wiring):**
  - P1 Red result (committed in `18088790`, re-verified at JR start): `npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3` → 1 file, **6 failed / 6 total** (~4.4s). All six failures match the table above (static-stub render, missing switcher testids, missing empty-state testid, unresolved NEXT_REDIRECT, missing `projectParentVisualizationQuery` call, missing non-test caller for `ParentDashboard`).
  - JR Green result (with all P2 wiring committed): `npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3` → 1 file, **6 passed / 6 total** (~2.1s).
- **Adjacent gates (all green):**
  - Targeted command: `npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3` → 6/6 passing.
  - All parent-portal component tests (`__tests__/components/parent/`): `ParentDashboard` 11/11, `StudentSwitcher` 9/9, `ParentEmptyStates` 14/14, `parent-privacy` 7/7, `projection-boundary` 3/3 → 44/44 passing.
  - All parent-portal convex tests (`__tests__/convex/parent/`): `links` 17/17, `export-contract` 8/8 → 25/25 passing. The `export-contract` test (which scans `convex/parent/links.ts` only, not `convex/parent/*.ts` as a glob) remains satisfied because it does not enumerate the new `visualization.ts` exports.
  - All parent-portal auth tests (`__tests__/lib/auth/`): `parent-role-guard` 18/18, `server-guards` 19/19, `developer` 8/8 → 45/45 passing.
  - Related IM3 surface (`__tests__/convex/studentVisualization.test.ts`): 5/5 passing. The student-viz handler is unaffected; the new parent-viz handler mirrors its mock-ctx-friendly pattern.
  - Knowledge-space-practice FR-3 gate: `npx vitest run projections --root packages/knowledge-space-practice` → 2 files, 18/18 passing. No planner math edits.
  - Boundary lint: `node scripts/check-monorepo-boundaries.mjs` → `No monorepo boundary violations found.`
- **TypeScript (`npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json`):**
  - P2-relevant files (`apps/integrated-math-3/app/parent/page.tsx`, `apps/integrated-math-3/convex/parent/visualization.ts`, `apps/integrated-math-3/components/parent/ParentPortalClient.tsx`, the lint-fix test edit) → **0 errors** attributed to JR's edits.
  - Pre-existing baseline errors remain (unrelated to this track): `apps/integrated-math-3/__tests__/components/parent/*.test.tsx` `Cannot find namespace 'JSX'` (pre-existing in P1 component tests), `apps/integrated-math-3/__tests__/app/parent/parent-portal-prod-wiring.test.tsx` `Property 'mockResolvedValue' does not exist on type` (pre-existing in P1 Red file, vitest-typed mock assertions don't satisfy the inferred type), plus the wider baseline of ~311 errors in `packages/math-content/src/problem-families/im3/`, `convex/objectiveProficiency.ts`, `convex/seed/*`, `convex/teacher/srs_mutations.ts`, etc. None of these baseline failures were introduced or fixed by this Green phase and all are owned by other tracks.
- **ESLint (`npx eslint --max-warnings 0 apps/integrated-math-3/app/parent apps/integrated-math-3/components/parent apps/integrated-math-3/convex/parent apps/integrated-math-3/__tests__/app/parent`):** no output (clean). The `--max-warnings 0` gate stays green because JR prefixed the unused `args` parameter with `_` in the test file (lint-only edit; no behavioral change).
- **Generated Convex APIs (`apps/integrated-math-3/convex/_generated/api.d.ts`):** added `import type * as parent_visualization from "../parent/visualization.js"` and the corresponding `"parent/visualization": typeof parent_visualization;` entry in `fullApi`. This makes `internal.parent.visualization.projectParentVisualizationQuery` reachable from `app/parent/page.tsx`. The codegen step (`npx convex dev`) was not runnable in this environment because it requires a live Convex deployment, so the update was applied manually following the same pattern Convex uses for sibling modules (e.g. `parent/links`, `teacher/lessonAssignment`).
- **Boundary discipline:**
  - Phase 3 closeout actions (move track to archive, update `measure/tracks.md`, flip `metadata.json` to `archived`) were **not** executed; they are reserved for Phase 3 / the Closeout Steward.
  - `graph.db` was not touched and is not part of this commit.
  - The ~148 unrelated dirty files from other tracks were preserved untouched and are not part of this commit.
  - The pre-existing untracked `measure/tracks/parent_portal_prod_wiring_remediation_20260621/spec.md` draft was preserved as-is; it is the canonical spec reference for this track and Phase 3 may commit it alongside closeout.
- **Commit:** `7e276db1 feat(parent-portal-prod-wiring): Phase 2 Green — wire production /parent route and parent visualization query` (6 files changed, 485 insertions(+), 14 deletions(-)). Files: `apps/integrated-math-3/app/parent/page.tsx`, `apps/integrated-math-3/convex/parent/visualization.ts` (new), `apps/integrated-math-3/components/parent/ParentPortalClient.tsx` (new), `apps/integrated-math-3/convex/_generated/api.d.ts`, `apps/integrated-math-3/__tests__/app/parent/parent-portal-prod-wiring.test.tsx` (lint fix), `measure/tracks/parent_portal_prod_wiring_remediation_20260621/plan.md` (Phase 2 work log + `[x]` markers).
- **Phase 2 status:** All four tasks `[x]`. Ready for Phase 3 (Verification and Closeout).

## Phase 3: Verification and Closeout

- [x] Run the parent portal targeted route-rendering tests.
- [x] Run the relevant app typecheck/lint/test gates or document pre-existing unrelated failures.
- [x] Update registry/archive notes to link the original rejected closeout to this remediation.
- [x] Archive this remediation only after the production route and non-test-caller proof pass.

### Phase 3 — Closeout (2026-06-23)

- **Vitest gate:** `npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3` → 1 file, **7 passed / 7 total** ✅
- **ESLint gate:** `npx eslint --max-warnings 0 apps/integrated-math-3/app/parent apps/integrated-math-3/components/parent apps/integrated-math-3/convex/parent apps/integrated-math-3/__tests__/app/parent` → exit code 0, clean ✅
- **Archive:** Track directory moved from `measure/tracks/` to `measure/archive/`.
- **Registry:** Removed from Active Tracks, added to Archived Tracks in `measure/tracks.md`.
- **Metadata:** Status set to `done`, `closed_at` and `completed` set to `2026-06-23`.
- **Closeout manifest:** Written to `automation-supervisor-closeout-manifest.json`.
- **Back-link:** Archived `parent-portal_20260605/index.md` updated with "Re-mediated by" section.
