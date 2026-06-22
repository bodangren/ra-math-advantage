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

- [ ] Replace the static `/parent` route stub with live parent session guard usage.
- [ ] Implement or expose the parent-safe projection query in `convex/parent/visualization.ts` or the canonical equivalent.
- [ ] Wire route data into `ParentDashboard`, `StudentSwitcher`, and `ParentEmptyStates`.
- [ ] Verify generated Convex APIs and route imports are updated.

## Phase 3: Verification and Closeout

- [ ] Run the parent portal targeted route-rendering tests.
- [ ] Run the relevant app typecheck/lint/test gates or document pre-existing unrelated failures.
- [ ] Update registry/archive notes to link the original rejected closeout to this remediation.
- [ ] Archive this remediation only after the production route and non-test-caller proof pass.
