# Specification: KST+SRS v3.2 Planner and Session Quality

## Overview

Implement the v3.2 planner and domain-utility release after v3.1. The planner
must compare only normalized signals, accommodate domains with deliberately
sparse prerequisite graphs, account for future review debt, diversify student
recommendations, and compose deterministic sessions without changing which
cards the v3 queue selected.

## Functional Requirements

1. Normalize readiness, unlock value, goal proximity, weakness fit, and domain
   utility to `[0,1]`; adopt default weights `0.35/0.20/0.15/0.10/0.20`.
2. Log-scale downstream reach against graph-wide maximum reach and retain
   deterministic priority and node-ID tie-breaking.
3. Define and implement a `DomainUtilityProvider` that is deterministic,
   versioned, adapter-registered, and returns non-empty signal provenance.
4. Detect prerequisite-sparse domains at graph-release time and rank ready
   candidates by `0.7 * utility + 0.3 * weaknessFit`; prohibit synthetic
   prerequisites as a ranking workaround.
5. Apply a maximum of two recommendations per nearest instructional ancestor,
   filling overflow positions from other groups.
6. Project seven-day review load, classify `normal`, `elevated`, or `saturated`,
   and recommend zero new skills when projected load exceeds the budget.
7. Present selected reviews round-robin across objectives, then new cards.
8. Apply deterministic plus/minus-five-percent interval fuzz and choose the
   lightest projected day inside the bounded window without exceeding the
   maximum interval.

## Non-Functional Requirements

- Utility providers perform no live network calls and expose every source and
  source version used in a score.
- Graph-release precomputation and all runtime ranking are deterministic.
- Session composition cannot add, remove, or reprioritize queue selections.
- Projections remain role-specific; React code does not infer graph truth or
  review-load state.
- Domain content and signal datasets remain outside reusable engines.

## Acceptance Criteria

- Upstream dominance, sparse-domain, review-load, diversity, interleaving, and
  deterministic-fuzz examples pass exactly.
- Planner scores never leave `[0,1]` for valid configuration.
- Missing utility providers are inert and do not change ordering through a
  hidden renormalization.
- Repeated `(cardId, reps)` inputs produce the same fuzz and due date.
- Student and teacher projections validate with additive review-load fields.

## Out of Scope

- Authoring production frequency or semantic utility datasets.
- Production IM3 data migration and feature rollout.
- Changing the v3 queue-selection set.

