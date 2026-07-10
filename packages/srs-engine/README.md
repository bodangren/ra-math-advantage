# @math-platform/srs-engine

Domain-neutral `srs.contract.v3` implementation for FSRS scheduling and its
learner-evidence boundary.

## Ownership

This package owns:

- FSRS retention and elapsed-time calculations
- practice-variant and objective proficiency aggregation
- card creation, review processing, and immutable review logs
- placement estimates, synthesized placement cards, and evidence provenance
- daily queue selection, backlog behavior, and scheduling adapters
- recency-weighted, guess-corrected proficiency evidence and confidence diagnostics
- ability-stratified edge-calibration checks and reference-only FSRS fit artifacts
- deterministic synthetic and replay evaluation with human-only release gates

It must not import app code, app-generated Convex modules, proprietary domain
content, or knowledge-space graph implementations. Apps adapt graph topology
into the structural placement interface and keep persistence/auth wrappers
local. `knowledge-space-core` consumes already-aggregated objective evidence
and never reimplements FSRS retention.

## Public Surfaces

- `@math-platform/srs-engine/contract`
- `@math-platform/srs-engine/scheduler`
- `@math-platform/srs-engine/review-processor`
- `@math-platform/srs-engine/queue`
- `@math-platform/srs-engine/placement`
- `@math-platform/srs-engine/adaptive-placement`
- `@math-platform/srs-engine/evidence`
- `@math-platform/srs-engine/scheduler-policy`
- `@math-platform/srs-engine/fsrs-fitting`
- `@math-platform/srs-engine/evaluation`
- `@math-platform/srs-engine/adapters`

The `fsrs-fitting` and `evaluation` subpaths preserve their v3.1 contract
exports while also exposing the lifecycle and harness behavior.

## v3.1 Scheduling Provenance

Priority-aware scheduling is opt-in through
`SchedulerConfig.requestRetentionByPriority`. Omitting the map preserves the
legacy scalar target. An empty map selects the normative v3.1 defaults:
essential `0.95`, supporting `0.90`, extension `0.80`; triaged remains on the
scalar target unless explicitly overridden.

`scheduleReview` returns the updated card, effective retention target, and
`paramsVersion` as one decision. New learner review logs must persist that
exact stamp. The built-in scheduler is currently pinned to
`fsrs-defaults.ts-fsrs.v5.4.1`. Fit artifacts contain references and hashes,
not executable weights, so callers must not relabel built-in scheduling as a
fitted version.

Historical unstamped review rows remain readable. Administrative teacher
resets deliberately remain unstamped because no FSRS parameter set scheduled
their state.

## Calibration and Human Release

`evaluateFsrsFitLifecycle` validates the term-level fit artifact:

- population key: `domain × ageBand`
- minimum volume: 10,000 reviews and 100 distinct students
- exact holdout fraction: 20%
- candidate holdout log-loss must be strictly lower than the incumbent
- a named, post-window human decision is required for approval or rejection
- same-population candidate revisions must advance the incumbent revision

`resolveReleasedFsrsParameters` is a reference-only lookup over trusted
release-registry records in population → domain → built-in-default order. It
never applies weights. A future scheduling integration must bind an approved
`paramsVersion` and its exact executable weights in one validated artifact
before a fitted version can appear on review logs.

## Offline Evaluation

The `evaluation` surface has two halves:

- Synthetic evaluation uses the normative
  `guess + (1 - guess - slip) * mastery` rule, deterministic attempt traces,
  and a required versioned `SyntheticEvaluationEngine` adapter. Adapter
  callbacks must summarize the worst/complete behavior across the supplied
  trace so transient queue, recommendation, decay, or misconception failures
  cannot be hidden.
- Replay evaluation computes cumulative MAE, ten-bin calibration, placement,
  fringe, and edge metrics. Resume cursors bind the corpus, candidate and
  incumbent identities, seed, configuration, replay hash, report inputs,
  invariant evidence, baselines, and source-review fingerprint.

Release eligibility always remains `eligible_for_human_approval`; the harness
never deploys or auto-applies a release. In production operations,
`replayInputHash` must identify a reviewed candidate-prediction artifact whose
engine/parameter versions match the result labels. The pure replay API accepts
precomputed `predictedRetention` values and therefore cannot establish that
external artifact binding by itself.

## Compatibility

The canonical version is `srs.contract.v3`. The explicit
`SRS_CONTRACT_VERSION_LEGACY` identifier exists for migration diagnostics; it
does not select legacy behavior.
