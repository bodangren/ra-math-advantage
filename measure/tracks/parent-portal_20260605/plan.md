# Track: Parent Portal — Implementation Plan

Workflow: Contract-First (role + linking + projection consumption), then per-task TDD. >80% on guards/logic.
Boundary rule: consume the parent projection payload; no raw-graph or teacher data.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Parent Role, Auth & Linking

- [ ] Task: Add parent role + fail-closed guards (linked-students-only) (TDD)
- [ ] Task: Parent↔student linking mechanism (teacher/invite), revocable (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Parent Progress View

- [ ] Task: Query + render the parent visualization projection (progress/mastery/engagement), read-only (TDD)
- [ ] Task: Multi-student switcher (TDD)
- [ ] Task: Privacy assertions — no teacher-only/other-student/raw-graph data (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — States & Verification

- [ ] Task: Empty/pending states (pre-link, no-activity)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
