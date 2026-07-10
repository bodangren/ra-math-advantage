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
- `@math-platform/srs-engine/adapters`

## Compatibility

The canonical version is `srs.contract.v3`. The explicit
`SRS_CONTRACT_VERSION_LEGACY` identifier exists for migration diagnostics; it
does not select legacy behavior.

