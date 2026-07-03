# Track 2: Weighted Readiness — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (getKnowledgeState, getOuterFringe, threshold config).

## Phase 1 — Contract & Schema

- [x] Task: Define readiness types and threshold config [6a7845a]
    - [x] Readiness score type; readiness state enum (ready / nearly_ready / blocked)
    - [x] Add readyThreshold (0.80) and nearThreshold (0.50) to Track 1's threshold block
    - [x] Extend node-state types to include nearly_ready
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Readiness Engine

- [x] Task: Implement readiness(B) (TDD) [a5f12b3]
    - [x] Tests: no prerequisites (=1), partial, full, decaying-prerequisite cases
    - [x] Pure function consuming Track 1 mastery levels and edge weights
- [x] Task: Integrate weighted readiness into getOuterFringe (TDD) [a5f12b3]
    - [x] Replace binary gating; fringe = ready ∪ nearly_ready with scores
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Projection Integration

- [~] Task: Update visualization computeNodeState and student payload (TDD)
    - [ ] computeNodeState consumes weighted readiness; expose nearly_ready bucket
- [ ] Task: Update in-repo kst-srs.v2 spec §5.3 (weight semantics + readiness formula)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
