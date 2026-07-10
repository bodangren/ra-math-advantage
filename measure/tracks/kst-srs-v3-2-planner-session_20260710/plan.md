# Implementation Plan: KST+SRS v3.2 Planner and Session Quality

**Dependency:** `kst-srs-v3-1-evidence-calibration_20260710`  
**Workflow:** strict contract-first TDD; deterministic, domain-neutral engines

## Phase 1: Contract & Schema Definition [checkpoint: e790f8e]

- [x] Task: Version planner priority and recommendation contracts [0225dd7]
    - [x] Define normalized term schemas, five weights, score diagnostics, and diversity grouping
    - [x] Define graph-release precomputation inputs and outputs
- [x] Task: Define domain utility and sparse-mode contracts [628b469]
    - [x] Add provider identity, version, learner context, utility, and signal provenance schemas
    - [x] Add adapter registration and sparse-domain release metadata
- [x] Task: Define review-load and session-composition contracts [5808f7f]
    - [x] Add load budget configuration and role-projection fields
    - [x] Define interleaving, deterministic fuzz, projected-day load, and maximum-interval invariants
- [x] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md) [e790f8e]

## Phase 2: Behavioral and Contract Tests [checkpoint: 963edca]

- [x] Task: Test normalized planner mathematics and deterministic ranking [41bed80]
    - [x] Reproduce the raw-count dominance correction example
    - [x] Cover degenerate graphs, unreachable goals, cycles, and invalid weights
- [x] Task: Test utility providers and sparse-domain behavior [21a0310]
    - [x] Verify provenance, versioning, no-provider behavior, and adapter isolation
    - [x] Verify sparse detection and utility-led ranking without synthetic edges
- [x] Task: Test diversity and review-load budgeting [1aaa656]
    - [x] Cover ancestor caps, overflow filling, elevated/saturated thresholds, and zero-new recommendations
- [x] Task: Test deterministic session composition [e84fb18]
    - [x] Cover objective round-robin ordering, new-card placement, fuzz stability, and lightest-day selection
    - [x] Prove composition preserves the selected-card set
- [x] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Contract Tests' (Protocol in workflow.md) [963edca]

## Phase 3: Implementation

- [x] Task: Implement normalized planner terms, weights, and graph precomputation [14de4e9]
- [~] Task: Implement domain utility registration and the synthetic reference provider
- [ ] Task: Implement sparse-mode ranking and recommendation diversity
- [ ] Task: Implement review-load budgeting and role-specific projection fields
- [ ] Task: Implement deterministic interleaving, interval fuzz, and load balancing
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Release Gate

- [ ] Task: Regenerate planner, adapter, projection, and session documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Document utility-provider authoring and review-load UX requirements
- [ ] Task: Run the complete v3.2 engine quality gate
    - [ ] Run focused and full package tests, coverage, lint, and typecheck
    - [ ] Run determinism, boundary, and generated-artifact freshness checks
    - [ ] Run `measure/doctor.sh`
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Release Gate' (Protocol in workflow.md)
