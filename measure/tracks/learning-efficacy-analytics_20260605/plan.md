# Track: Learning Efficacy & Analytics — Implementation Plan

Workflow: Contract-First (metric + experiment contracts), then per-task TDD. >80% on pure logic.
Boundary rule: reusable metric/experiment logic domain-neutral; app surfaces local.
Verification: boundary lints + per-app lint/test + `tsc --noEmit`.

## Phase 1 — Metric Contracts & Pure Logic

- [ ] Task: Define outcome-metric contracts (retention, time-to-mastery, accuracy, review-success)
- [ ] Task: Implement pure metric functions from SRS card/review/submission fixtures (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Cohort Aggregation (Convex)

- [ ] Task: Batched aggregation queries by class/cohort + time window (TDD, no N+1)
- [ ] Task: Small-n suppression / privacy guardrails (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Experiment Harness

- [ ] Task: Deterministic sticky A/B assignment primitive + experiment registry (TDD)
- [ ] Task: Experiment analysis report (variant comparison, sample size, significance indicator) (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Efficacy View & Verification

- [ ] Task: Admin/teacher efficacy view rendering metrics + active experiments, role-gated (TDD on render/guard)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
