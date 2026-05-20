# Track 8: Lesser Holes

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model (otherwise
independent; runs last in the program).
Improvement Plan: Item 8

## Overview

Three smaller v2 items, grouped because none warrants a standalone track:
cross-domain transfer (`transfers_to`), the levels-vs-no-levels tension (Level
Projection), and the `progressTrend` static-ratio bug. The FSRS per-card
limitation is documented here as well.

## Functional Requirements

- FR1 — `transfers_to` edge type. A weighted, cross-domain edge type distinct
  from `equivalent_to` (which is *identity*). Add to the edge type union,
  schemas, the §2.7 endpoint-pairing rules, and validation. Consumption logic
  (seeding a prior on a target card's initial stability/difficulty) is defined
  in the spec but marked future / low-priority — this track only establishes the
  edge type so data collection can begin.
- FR2 — Level Projection. A domain-supplied monotonic function from knowledge
  state → display level. State explicitly that levels are presentation-only — a
  *projection*, never an input to any KST/SRS computation. The existing
  `gse-to-*-advantage.csv` mappings are the reference instance; provide an IM3
  level projection.
- FR3 — `progressTrend` fix. Replace the static mastered-ratio computation
  (`visualization.ts:218-224`, which mislabels a beginner as "declining") with a
  real time-delta of mastered-count over a window. Define when `unknown` is
  produced (insufficient history).
- FR4 — FSRS per-card limitation. Document, in the in-repo spec, that FSRS
  schedules each variant card independently even though sibling variants under
  one objective are correlated. Optionally define a config flag
  `siblingReinforcement` (a successful review applies a partial stability bump to
  sibling cards) — flag definition only, implementation marked future.

## Non-Functional Requirements

- `transfers_to` and Level Projection types are domain-neutral; the IM3 level
  projection instance is app-local.
- Level Projection never feeds KST/SRS computation — presentation only.
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — `transfers_to` edge type defined with an endpoint-pairing rule and
  validation; distinct from `equivalent_to`.
- AC2 — Level Projection implemented as a presentation-only projection; an IM3
  instance derives display levels from the existing CSV mapping.
- AC3 — `progressTrend` is a real time-delta over a window; `unknown` produced on
  insufficient history; parent visualization updated.
- AC4 — FSRS per-card limitation documented; `siblingReinforcement` flag defined
  (implementation out of scope).
- AC5 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- `transfers_to` consumption logic (prior on initial card stability).
- `siblingReinforcement` implementation (flag definition only).
