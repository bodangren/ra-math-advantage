# Track: Next-Skill Planner Production Wiring

## Objective

Remediate the 2026-06-21 fleet completion audit finding that `next-skill-planner_20260521` implemented genuine planner math but had no production consumer. The chosen decision is to wire it up, not descope it.

## Source Finding

Completion audit verdict: planner tests were substantial, but the only consumer (`projectStudentVisualization`) had no callers outside the package and the repo-root `convex/` surface exposed no live handler. The track therefore closed without a production path.

## Requirements

- FR-1: Expose `projectStudentVisualization` or the current planner result through a real Convex query or canonical backend module.
- FR-2: Consume that query from a student-facing production route or dashboard panel.
- FR-3: Preserve the planner's existing priority math and make no scope-reducing changes to the archived planner contract.
- FR-4: Add runtime tests proving the route/backend caller chain exists end to end.
- FR-5: Add a caller/call-path check proving the planner output has at least one non-test production consumer.

## Acceptance Criteria

- [ ] A student-facing production surface displays planner recommendations sourced from the real planner output.
- [ ] A backend query or route handler exposes the planner output without test-only composition.
- [ ] The archived planner math remains covered by its existing tests.
- [ ] New tests prove the production caller path, not just package-local behavior.
- [ ] The track registry states that next-skill-planner is being wired, not descoped.
