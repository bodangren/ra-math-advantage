# Implementation Plan: KST+SRS v3 Contract and Core Correctness

**Dependency:** none  
**Source:** approved specification; upstream `kst-srs.v3.2` snapshot  
**Workflow:** strict contract-first TDD; atomic commits and Git notes per task

## Phase 1: Contract & Schema Definition [checkpoint: c85c814]

- [x] Task: Vendor and register the canonical v3.2 contract [f533ad9]
    - [x] Copy the upstream specification and migration notes without modification
    - [x] Add a machine-readable provenance manifest with version, source, hashes, and capture time
    - [x] Update `measure/index.md` and `measure/knowledge-space.md` canonical references
- [x] Task: Define v3 engine and SRS contracts [e4a4e7b]
    - [x] Add validated `hardGateThreshold` and `trendThreshold` configuration
    - [x] Version the affected knowledge-space and SRS contracts
    - [x] Define placement evidence, synthesized-card, and backlog-result schemas
- [x] Task: Establish canonical package ownership and compatibility surfaces [2cf5031]
    - [x] Assign FSRS retention, proficiency, placement, and queue behavior to `srs-engine`
    - [x] Define adapter inputs consumed by `knowledge-space-core` without duplicating FSRS formulas
    - [x] Document v2-compatible and intentionally breaking surfaces
- [x] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md) [3f54c45]
    - [x] User approved the Phase 1 contract, ownership, and compatibility surfaces
    - [x] `knowledge-space-core`: 681 tests passed; typecheck and lint passed
    - [x] `srs-engine`: 239 tests passed; typecheck and lint passed
    - [x] Coverage baseline recorded: core 95.76% statements / 87.27% branches; SRS 63.32% statements / 69.71% branches
    - [x] Vendored v3.2 specification and migration hashes reverified

## Phase 2: Behavioral and Contract Tests [checkpoint: 92b6214]

- [x] Task: Encode the upstream v3 worked examples as executable fixtures [5ae4f7e, 644314e, b4a9368, 53ffdc9]
    - [x] Test hard-gate readiness with mastered soft prerequisites
    - [x] Test elapsed-time retention and minimum aggregation excluding `reps = 0`
    - [x] Test not-A-conditioned calibration and symmetric trend thresholds
- [x] Task: Test placement and daily-queue correctness [24dcb0c, 6fdfe9b]
    - [x] Test confidence-to-stability synthesis, direct/inferred provenance, and hard-edge closure
    - [x] Test reviews-first lowest-retention ordering, caps, and backlog suppression
    - [x] Test deterministic tie-breaking and invalid input handling
- [x] Task: Test ownership and compatibility behavior [810510d, 9eadc7d, e321701, 6726ef6]
    - [x] Prove all package/app consumers resolve the canonical SRS implementation
    - [x] Add behavioral complements for boundary and export checks
    - [x] Pin the v3 migration property for graphs without hard-gate edges
- [x] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Contract Tests' (Protocol in workflow.md)
    - [x] User directed autonomous correct closeout and continuation to the next track
    - [x] Core 695/695, SRS 253/253, and projection 379/379 tests passed
    - [x] Changed-module coverage exceeded 80% branches and 94% statements
    - [x] Worked examples and invalid-input cases manually inspected against v3.2

## Phase 3: Implementation [checkpoint: ddc7baa]

- [x] Task: Implement gated readiness across state, fringe, and projections [5ae4f7e]
- [x] Task: Consolidate FSRS retention and objective aggregation in `srs-engine` [644314e, 810510d]
- [x] Task: Correct edge-calibration posterior updates and invalidate stale v2 derived values [b4a9368]
- [x] Task: Implement placement card synthesis and hard-edge evidence closure [24dcb0c]
- [x] Task: Rewrite daily queue selection and backlog behavior [6fdfe9b, 6726ef6]
- [x] Task: Apply progress-trend correction and versioned exports [53ffdc9, 810510d]
- [x] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)
    - [x] Canonical retention call sites use explicit elapsed time; no competing formulas remain
    - [x] Business Math delegates queue selection to `srs-engine`
    - [x] IM3 consumes reviewed-card minimum retention without a local formula
    - [x] Package typecheck/lint passed; touched app tests and changed-file lint passed

## Phase 4: Generate Docs, Doctor, and Release Gate

- [x] Task: Regenerate Measure architecture and contract documentation [e8cf4f2]
    - [x] Run `measure/generate.sh`
    - [x] Update package maps and migration guidance
- [x] Task: Run the complete v3 correctness quality gate [239a865, 5c8cf5b]
    - [x] Run focused package tests and coverage
    - [x] Run all consumer typechecks, lint, builds, and boundary checks
        - Core, SRS, and projection packages pass; root lint/build pass
        - Full IM3/BM2 `tsc` baseline remains red from logged practice-variant schema drift
    - [x] Run `measure/doctor.sh` and verify the vendored hashes
- [x] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Release Gate' (Protocol in workflow.md)
    - [x] User directed correct closeout, archive, and continuation without another pause
    - [x] Core: 695 tests; 95.81% statements / 87.36% branches
    - [x] SRS: 259 tests; 87.25% statements / 80.76% branches
    - [x] Projection: 379 tests; TypeScript and lint pass
    - [x] Root lint/build, boundary lint, Measure generate/doctor, and v3.2 hashes pass
