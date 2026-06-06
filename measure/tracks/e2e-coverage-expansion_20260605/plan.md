# Track: E2E Coverage Expansion — Implementation Plan

Workflow: extend existing Playwright harness; spec-first per flow (write the failing E2E, then make it pass with selectors/seed).
Verification: `npm run ws:im3:test` + E2E job + `tsc --noEmit`.

## Phase 1 — Deterministic Seed & Selectors

- [x] Task: Define/commit deterministic E2E seed fixtures (student, teacher, class, assigned lessons) — Red: structural test for `seedDemoE2E` action (`4d7c6baa`)
- [x] Task: Add stable data-test selectors to the routes/components under test — Red: selectors module unit test + E2E smoke spec (`4d7c6baa`)
- [x] Task: Document the selector + seed conventions (`e7a2228d`)
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) (`e7a2228d`)

## Phase 2 — Auth & Student Lesson Flow [checkpoint: ce055f4f]

- [x] Task: E2E specs for login/logout/role redirects/deactivated denial (Red→Green) (Red: `5cb403dd`, `69e0469e`, `872d00e7`, Green: `3cb6f8b6`)
- [x] Task: E2E spec for full lesson flow incl. reload-persistence (Red→Green) (Red: `5cb403dd`, `69e0469e`, `872d00e7`, Green: `3cb6f8b6`)
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) (`3cb6f8b6`)

## Phase 3 — Activities & Daily Practice

- [x] Task: E2E assertions per major activity type (Red→Green) (Red: `0367d7a6`)
- [x] Task: E2E spec for a daily-practice session incl. SRS completion/streak (Red→Green) (Red: `0367d7a6`)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Flow & CI

- [ ] Task: E2E specs for gradebook/heatmap drilldown, student detail, submission review, assignment (Red→Green)
- [ ] Task: Wire suite as a required CI job against the seeded deployment; address flake budget
- [ ] Task: Final verification — tsc --noEmit, unit suites, E2E green
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
