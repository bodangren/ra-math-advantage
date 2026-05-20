# Track 2: Weighted Readiness

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model
Improvement Plan: Item 2

## Overview

`edge.weight` is defined as "relationship strength" but is consumed nowhere
outside `edge-suggestions.ts` — a dead field. Prerequisites are treated as hard
binary gates (`prereqEdges.every(masteredIds.has(...))`), so the model cannot
express "usually needed, but partially compensable."

This track makes `weight` a live field: a weighted readiness score replaces
binary prerequisite gating. `getOuterFringe` (built in Track 1 with binary
gating, structured for this swap) consumes the readiness score instead.

## Functional Requirements

- FR1 — Readiness score. Define and implement, for a node `B`:
  `readiness(B) = Σ(w_i · m_i) / Σ(w_i)` over `prerequisite_for` edges `i → B`,
  where `w_i` is edge weight and `m_i` the student mastery level (0–1) of
  prerequisite `i` from Track 1's knowledge state. `readiness = 1` if `B` has no
  prerequisites.
- FR2 — Readiness states. `ready` (`readiness ≥ readyThreshold`, default 0.80),
  `nearly_ready` (`≥ nearThreshold`, default 0.50), `blocked` (otherwise).
  Thresholds named and configurable alongside Track 1's threshold block.
- FR3 — Outer fringe. `getOuterFringe` consumes weighted readiness, replacing the
  binary gating placeholder. Fringe = ready ∪ nearly_ready, each carrying its
  readiness score.
- FR4 — Projection integration. Visualization `computeNodeState` uses weighted
  readiness; the student visualization payload distinguishes `nearly_ready`.
- FR5 — Contract update. In the in-repo `kst-srs.v2` spec, document `weight`'s
  operational meaning (how necessary a prerequisite is) and the readiness formula
  (§9.4).

## Non-Functional Requirements

- Domain-neutral; pure, deterministic functions; no app/convex imports in core.
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — `readiness(B)` implemented and tested: no prerequisites, partial
  satisfaction, full satisfaction, and decaying-prerequisite cases.
- AC2 — `readyThreshold` / `nearThreshold` configurable; three readiness states
  produced.
- AC3 — `getOuterFringe` uses weighted readiness; fringe entries carry scores.
- AC4 — Student visualization exposes `nearly_ready`; `computeNodeState` updated.
- AC5 — In-repo spec §9.4 documents `weight` semantics and the formula.
- AC6 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- Calibrating the numeric weight values from outcome data (Track 3).
- Ranking the ready set by priority (Track 4).
