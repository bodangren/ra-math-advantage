# Track: Transfer-Credit Runtime — Implementation Plan

Workflow: Contract-First (transfer policy), then per-task TDD. >80% on pure logic.
Boundary rule: transfer/equivalence logic domain-neutral; course UX app-local.
Verification: boundary lints + per-app lint/test + `tsc --noEmit`.

## Phase 1 — Equivalence Resolution & Transfer Policy

- [x] Task: Resolve skill → equivalence component; pull component mastery from KST state (TDD) — Green 83ab12a
- [x] Task: Define + implement confidence-discounted transfer policy (Contract-First, TDD) — Green 83ab12a
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) (deferred:human)

## Phase 2 — Skip Eligibility in the Practice Path

- [ ] Task: Compute transfer-eligibility threshold; flag eligible skills/lessons (TDD)
- [ ] Task: Integrate eligibility into next-skill/practice resolution (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Student UX & Confirmation Check

- [ ] Task: "Already mastered in <course>" UI with skip / confirmation-check / reversible skip (TDD on logic)
- [ ] Task: Optional brief verification before granting skip (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Visibility & Verification

- [ ] Task: Surface transfer credits in teacher views (auditable)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
