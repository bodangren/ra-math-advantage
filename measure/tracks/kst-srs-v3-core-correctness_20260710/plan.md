# Implementation Plan: KST+SRS v3 Contract and Core Correctness

**Dependency:** none  
**Source:** approved specification; upstream `kst-srs.v3.2` snapshot  
**Workflow:** strict contract-first TDD; atomic commits and Git notes per task

## Phase 1: Contract & Schema Definition

- [ ] Task: Vendor and register the canonical v3.2 contract
    - [ ] Copy the upstream specification and migration notes without modification
    - [ ] Add a machine-readable provenance manifest with version, source, hashes, and capture time
    - [ ] Update `measure/index.md` and `measure/knowledge-space.md` canonical references
- [ ] Task: Define v3 engine and SRS contracts
    - [ ] Add validated `hardGateThreshold` and `trendThreshold` configuration
    - [ ] Version the affected knowledge-space and SRS contracts
    - [ ] Define placement evidence, synthesized-card, and backlog-result schemas
- [ ] Task: Establish canonical package ownership and compatibility surfaces
    - [ ] Assign FSRS retention, proficiency, placement, and queue behavior to `srs-engine`
    - [ ] Define adapter inputs consumed by `knowledge-space-core` without duplicating FSRS formulas
    - [ ] Document v2-compatible and intentionally breaking surfaces
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md)

## Phase 2: Behavioral and Contract Tests

- [ ] Task: Encode the upstream v3 worked examples as executable fixtures
    - [ ] Test hard-gate readiness with mastered soft prerequisites
    - [ ] Test elapsed-time retention and minimum aggregation excluding `reps = 0`
    - [ ] Test not-A-conditioned calibration and symmetric trend thresholds
- [ ] Task: Test placement and daily-queue correctness
    - [ ] Test confidence-to-stability synthesis, direct/inferred provenance, and hard-edge closure
    - [ ] Test reviews-first lowest-retention ordering, caps, and backlog suppression
    - [ ] Test deterministic tie-breaking and invalid input handling
- [ ] Task: Test ownership and compatibility behavior
    - [ ] Prove all package/app consumers resolve the canonical SRS implementation
    - [ ] Add behavioral complements for boundary and export checks
    - [ ] Pin the v3 migration property for graphs without hard-gate edges
- [ ] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Contract Tests' (Protocol in workflow.md)

## Phase 3: Implementation

- [ ] Task: Implement gated readiness across state, fringe, and projections
- [ ] Task: Consolidate FSRS retention and objective aggregation in `srs-engine`
- [ ] Task: Correct edge-calibration posterior updates and invalidate stale v2 derived values
- [ ] Task: Implement placement card synthesis and hard-edge evidence closure
- [ ] Task: Rewrite daily queue selection and backlog behavior
- [ ] Task: Apply progress-trend correction and versioned exports
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Release Gate

- [ ] Task: Regenerate Measure architecture and contract documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Update package maps and migration guidance
- [ ] Task: Run the complete v3 correctness quality gate
    - [ ] Run focused package tests and coverage
    - [ ] Run all consumer typechecks, lint, builds, and boundary checks
    - [ ] Run `measure/doctor.sh` and verify the vendored hashes
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Release Gate' (Protocol in workflow.md)

