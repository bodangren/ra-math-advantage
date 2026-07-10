# Implementation Plan: KST+SRS v3.1 Evidence and Calibration

**Dependency:** `kst-srs-v3-core-correctness_20260710`  
**Workflow:** strict contract-first TDD; synthetic data only in reusable packages

## Phase 1: Contract & Schema Definition [checkpoint: 43d4205]

- [x] Task: Define v3.1 proficiency evidence and rating contracts [5cb6894]
    - [x] Version evidence inputs, confidence diagnostics, and rating outputs
    - [x] Define guess-floor and timing-baseline schemas
- [x] Task: Extend domain-adapter and placement contracts [4fd6184]
    - [x] Add versioned guess floors, age bands, and probe instruments
    - [x] Define two-probe decisions, frontier state, stopping reasons, and confidence caps
- [x] Task: Define scheduler calibration and evaluation artifacts [3beffd0]
    - [x] Add per-priority requested retention and `paramsVersion` to affected contracts
    - [x] Define parameter-fit provenance, holdout metrics, approval state, and fallback resolution
    - [x] Define synthetic-cohort and replay-result schemas
- [x] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md) [43d4205]

## Phase 2: Behavioral and Contract Tests [checkpoint: 3a6fb86]

- [x] Task: Test proficiency evidence mathematics [02c2562]
    - [x] Cover guess-floor rescaling, half-life weighting, Wilson bounds, and zero/one extremes
    - [x] Cover small-sample confidence caps and missing-baseline diagnostics
- [x] Task: Test the normative rating mapper [32c8ceb]
    - [x] Cover correctness, hint, reveal, timing, and misconception precedence
    - [x] Verify unreliable timing cannot change a rating
- [x] Task: Test adaptive placement and priority retention [591a74b]
    - [x] Exercise two-probe traversal, budget exhaustion, disconnected DAGs, and deterministic stopping
    - [x] Verify scalar configuration remains backward compatible
- [x] Task: Test calibration, fitting, and replay release gates [7570a61]
    - [x] Cover ability-band agreement and `confounded_by_ability`
    - [x] Cover population fallback, volume rejection, holdout comparison, and human approval
    - [x] Exercise synthetic learner invariants and parameter-version attribution
- [x] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Contract Tests' (Protocol in workflow.md) [3a6fb86]

## Phase 3: Implementation

- [x] Task: Implement v3.1 evidence aggregation and confidence diagnostics [4cd6001]
- [x] Task: Implement the staged practice-to-SRS rating mapper [9d0062f]
- [x] Task: Implement two-probe adaptive frontier placement [3186111]
- [x] Task: Implement per-priority retention and review-log parameter stamping [b6d5425]
- [x] Task: Implement ability-stratified edge calibration and versioned FSRS fitting [070eb1d]
- [x] Task: Implement the offline synthetic and replay evaluation harness [1918590]
- [~] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Release Gate

- [ ] Task: Regenerate contract, package, and evaluation documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Document population fallback and human-release operations
- [ ] Task: Run the complete v3.1 quality gate
    - [ ] Run package tests with coverage, lint, and typecheck
    - [ ] Run replay determinism and fixture-integrity checks
    - [ ] Run `measure/doctor.sh` and monorepo boundary checks
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Release Gate' (Protocol in workflow.md)
