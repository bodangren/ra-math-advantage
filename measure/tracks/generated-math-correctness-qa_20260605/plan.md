# Track: Generated-Math Correctness QA — Implementation Plan

Workflow: Contract-First (correctness contract + harness API), then per-task TDD with property-based tests. >80% coverage on harness.
Boundary rule: harness core domain-neutral; math oracles in math-content/app.
Verification: boundary lints + `tsc --noEmit` + harness test suite.

## Phase 1 — Correctness Contract & Harness API

- [x] Task: Define the generator correctness contract type (seed → problem/answer/distractors/invariants) [red: 57db87e] [green: b613a5ab]
- [x] Task: Define `verifyGenerator(gen, opts)` API + result/report shape (Contract-First) [red: 57db87e] [green: b613a5ab]
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — All 116 tests pass (15 Phase 1). tsc + lint clean. [checkpoint: 3d262112]

## Phase 2 — Core Properties (TDD)

- [x] Task: Determinism property (same seed → identical output) (Red→Green) [green: e51c7153]
- [x] Task: Unique-correct-answer property via oracle/structural check (Red→Green) [green: e51c7153]
- [x] Task: Distractor-validity property (wrong, distinct, typed) (Red→Green) [green: e51c7153]
- [x] Task: Solvability/range invariant assertions (Red→Green) [green: e51c7153]
- [x] Task: Negative tests — injected bad generator fails each property [green: e51c7153]
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) — All 134 tests pass (13 files). tsc clean. [checkpoint: 4eace0b4]

## Phase 3 — Registry Sweep

- [~] Task: Registry test runs all existing generators through `verifyGenerator` [red: 29ad6d76]
- [~] Task: Triage failures — fix or quarantine with tracked debt rows [red: 29ad6d76]
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — CI Gate & Verification

- [ ] Task: Wire the harness as a generator gate in CI; prove it blocks a contract violation
- [ ] Task: Document how T17–T19 authors plug a generator into the harness
- [ ] Task: Final verification — boundary lints, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
