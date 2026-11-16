# Specification: KST+SRS v3.1 Evidence and Calibration

## Overview

Implement the v3.1 calibration-and-evidence release after the v3 correctness
gate is complete. This track changes learner-facing truth: guess-heavy or
small-sample evidence must not inflate proficiency, revealed work must not be
rated as retrieval, and calibration artifacts must be traceable to the data
and parameters that produced them.

## Functional Requirements

1. Compute practice-variant retention strength from recency-weighted
   correctness using a one-sided 95% Wilson lower bound and rescale against a
   domain-declared guess floor.
2. Cap evidence confidence for small samples (`n < 3` low, `n < 6` medium) and
   expose diagnostic reasons for missing or weak evidence.
3. Implement the normative rating pipeline for correctness, hints, reveals,
   timing reliability, and misconception severity.
4. Extend domain adapters with versioned guess floors, age bands, and placement
   probe instruments.
5. Implement two-probe adaptive frontier placement, guess-corrected decisions,
   DAG traversal, a 24-probe budget, and the specified confidence cap.
6. Add per-priority requested-retention targets while preserving scalar-config
   compatibility.
7. Add ability-stratified calibration and the `confounded_by_ability` outcome.
8. Stamp review logs with `paramsVersion`; implement versioned FSRS fitting
   artifacts, volume gates, holdout comparison, and explicit human release.
9. Implement the offline synthetic-learner and replay-evaluation harness with
   invariant, calibration, recommendation, and release metrics.

## Non-Functional Requirements

- Evidence, fitting, and replay outputs are deterministic for a fixed input and
  configuration.
- Calibration and parameter releases never auto-apply.
- Domain adapters provide data and policy; reusable engines remain
  domain-neutral and perform no live network access.
- Tests use independent expected values or fixed fixtures, not formulas copied
  from the implementation under test.
- Batch/replay work is bounded, resumable, and auditable.

## Acceptance Criteria

- Upstream v3.1 examples and edge cases pass in behavioral tests.
- Multiple-choice guess floors reduce inflated evidence without producing
  values outside `[0,1]`.
- Rating results include base rating, caps, timing decision, and reasons.
- Fitting fails closed below volume gates and requires explicit approval when
  it beats the incumbent.
- Every replay result identifies the parameter version that scheduled its
  source reviews.

## Out of Scope

- Per-learner FSRS fitting.
- Automatic graph edits or parameter deployment.
- v3.2 utility providers, sparse ranking, and session composition.

