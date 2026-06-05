# Track: E2E Coverage Expansion — Implementation Plan

Workflow: extend existing Playwright harness; spec-first per flow (write the failing E2E, then make it pass with selectors/seed).
Verification: `npm run ws:im3:test` + E2E job + `tsc --noEmit`.

## Phase 1 — Deterministic Seed & Selectors

- [ ] Task: Define/commit deterministic E2E seed fixtures (student, teacher, class, assigned lessons)
- [ ] Task: Add stable data-test selectors to the routes/components under test
- [ ] Task: Document the selector + seed conventions
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Auth & Student Lesson Flow

- [ ] Task: E2E specs for login/logout/role redirects/deactivated denial (Red→Green)
- [ ] Task: E2E spec for full lesson flow incl. reload-persistence (Red→Green)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Activities & Daily Practice

- [ ] Task: E2E assertions per major activity type (Red→Green)
- [ ] Task: E2E spec for a daily-practice session incl. SRS completion/streak (Red→Green)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Flow & CI

- [ ] Task: E2E specs for gradebook/heatmap drilldown, student detail, submission review, assignment (Red→Green)
- [ ] Task: Wire suite as a required CI job against the seeded deployment; address flake budget
- [ ] Task: Final verification — tsc --noEmit, unit suites, E2E green
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
