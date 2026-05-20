# Track 6: Misconception Remediation Loop — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1.

## Phase 1 — Contract & Schema

- [ ] Task: Add the remediated_by edge type
    - [ ] Extend EdgeType union + Zod schemas; add §2.7 endpoint-pairing rule (misconception → worked_example/task_blueprint/skill)
    - [ ] Extend validation (INVALID_EDGE_PAIRING coverage)
- [ ] Task: Define misconception lifecycle types and Convex schema
    - [ ] active/resolved state; severity model; per-student misconception state table
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Rating Reconciliation

- [ ] Task: Reconcile computeBaseRating with the v2 rating-cap rule (TDD)
    - [ ] Cap at Hard by default; Again only when misconception is severe
    - [ ] Tests for both the cap and the severe paths
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Lifecycle Engine

- [ ] Task: Implement active/resolved lifecycle transitions (TDD)
    - [ ] Active on detection; resolved after N consecutive clean attempts on affected skills
- [ ] Task: Implement Convex persistence for per-student misconception state (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Integration

- [ ] Task: Implement planner injection of remediated_by activities (TDD)
    - [ ] Active misconception's remedy injected ahead of normal progression; weaknessFit hook for Track 4
- [ ] Task: Add active-misconception counts to student and teacher projections (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec (§3.2 remediated_by, §3.7, §8.4 rating cap, §13.3)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
