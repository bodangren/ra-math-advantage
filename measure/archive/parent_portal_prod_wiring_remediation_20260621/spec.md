# Track: Parent Portal Production Wiring Remediation

## Objective

Remediate the 2026-06-21 fleet completion audit finding that `parent-portal_20260605` closed against proxy tests while the production `/parent` route remained a static stub and the parent portal components, guards, mutations, and projections had no live caller.

## Source Finding

Completion audit verdict: `parent-portal` was a false positive because `/parent` did not call the parent auth guard, did not fetch parent links/projection data, and did not render the delivered parent dashboard flow. Prior tests passed by inspecting source or isolated components rather than rendering the production route.

## Requirements

- FR-1: `/parent` must be a real production route that calls `requireParentServerSessionClaims` or the current canonical parent-role session guard.
- FR-2: The route must fetch parent/student links and a parent-safe student progress projection from the live backend surface.
- FR-3: Add the missing `convex/parent/visualization.ts` query or the current equivalent backend module and expose it through generated Convex APIs.
- FR-4: The route must render `ParentDashboard`, `StudentSwitcher`, and `ParentEmptyStates` from live route data instead of static placeholder content.
- FR-5: Parent projection data must exclude teacher-only fields and fail closed for non-parent sessions.
- FR-6: Tests must render the production `/parent` route and prove at least one non-test caller exists for every parent portal component/service claimed complete.

## Acceptance Criteria

- [ ] Production `/parent` route renders a real parent dashboard for a parent with one linked student.
- [ ] Production `/parent` route renders a switcher for a parent with multiple linked students.
- [ ] Production `/parent` route renders the empty/pending state for a parent with no active links.
- [ ] Non-parent sessions are denied by the same guard used in production.
- [ ] Parent projection query is reachable from the route and has a non-test caller.
- [ ] Tests avoid source-regex acceptance and assert runtime route behavior.
- [ ] Completion audit note in the archived `parent-portal_20260605` record is superseded by this remediation track, not silently rewritten.
