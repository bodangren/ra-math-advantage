# Track: Data Export Teacher UI — Implementation Plan

Workflow: Contract-First (UI↔query mapping), then per-task TDD. >80% on new helpers.
Verification: `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Helpers & Scope Mapping [checkpoint: 87415abf]

- [x] Task: Define scope→query mapping + filename builder pure helpers (TDD Red→Green) — Green committed [red: 218e943c, 524911bb, 95dd66bf; green: 9b0543c2]
- [x] Task: Confirm CSV util contract via snapshot test (column order, escaping) — Green committed [red: ff1952e0; green: 9b0543c2]
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — Checkpoint: 87415abf

## Phase 2 — Export Panel UI

- [ ] Task: Build teacher-only export panel (dataset/scope/format controls), role-gated (TDD on render + guard)
- [ ] Task: Wire client download with descriptive filename
- [ ] Task: Empty/large/error states (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Authorization & Verification

- [ ] Task: Test cross-class denial reuses teacher-of-class guard (Red→Green)
- [ ] Task: Final verification — lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
