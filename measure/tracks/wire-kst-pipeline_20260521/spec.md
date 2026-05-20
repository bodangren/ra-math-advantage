# Track 1: Wire the KST Pipeline + v2 Mastery Model

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature

## Overview

`knowledge-space-core` and `knowledge-space-practice` implement the v1 KST
contract (graph types, projections, visualizations) but are consumed only by
tests and a dev-only QA harness (`apps/bus-math-v2/app/(dev)/blueprint-qa/`) —
no production route. `srs-engine` is in production, but nothing converts SRS /
objective-proficiency output into a knowledge-space learner state. The KST half
is therefore inert: there is no `getOuterFringe`, no producer of `learnerState`,
and no SRS→KST bridge.

This track wires the KST pipeline end-to-end and, at the same time, upgrades the
mastery model to the time-aware, hysteresis-based definition from `kst-srs.v2`
(Improvement Plan Item 1) — so the bridge is built v2-correct once rather than
binary-then-reworked. Follow-on tracks cover weighted readiness, calibration,
planner, placement, misconception loop, and the practice-variant rename.

## Functional Requirements

- FR1 — Canonical contract. Bring `SPECIFICATION.md` (kst-srs.v2) into the repo
  as the canonical KST+SRS contract; reconcile `measure/knowledge-space.md` into
  an architecture summary that points at it; update `measure/index.md`.
- FR2 — Knowledge State & Mastery (v2 Item 1). Implement a time-aware
  knowledge-state module in a reusable package:
  - per-skill mastery level m ∈ [0,1];
  - hysteresis — enter mastered when `isProficient && retention ≥ masteryEnter`
    (0.90); drop to `decaying` when `retention < masteryExit` (0.70); re-enter
    on recovery;
  - four-way state: mastered / decaying / inProgress / untouched;
  - `getKnowledgeState(student, now)` — always recomputed, never stored;
  - named, configurable thresholds in one place.
- FR3 — `getOuterFringe`. Implement the outer fringe as a standalone exported
  reusable function (not buried in the visualization projection), time-aware.
  Binary prerequisite gating is acceptable here, but structured so Track 2 can
  swap in the weighted-readiness score.
- FR4 — SRS→KST bridge. A module converting SRS card states + objective-
  proficiency results into a knowledge-space learner state (the input the
  visualization projections expect), using `stabilityToRetention` for retention.
- FR5 — Production wiring. Connect at least one `apps/integrated-math-3`
  production route to a visualization projection fed by the bridge, so a real
  student sees KST-derived state (mastered / ready / review-due).
- FR6 — Graph availability. Make an IM3 knowledge-space graph (nodes + edges
  from the completed rollout tracks) loadable at runtime by the wired route.

## Non-Functional Requirements

- `knowledge-space-core` / `-practice` stay domain-neutral — no app/convex
  imports (existing boundary lint must still pass).
- Contract-first then TDD per Measure workflow; >80% coverage on new modules.
- Knowledge-state and outer-fringe computation are pure, deterministic functions.

## Acceptance Criteria

- AC1 — `kst-srs.v2` SPECIFICATION.md exists in-repo; `measure/knowledge-space.md`
  and `measure/index.md` reconciled.
- AC2 — `getKnowledgeState` and `getOuterFringe` exported from a reusable
  package, with unit tests covering hysteresis enter/exit/re-enter, decay, and
  fringe membership.
- AC3 — SRS→KST bridge converts card + proficiency state into a learner state;
  tested against synthetic fixtures.
- AC4 — One IM3 production route renders KST-derived student state from live data.
- AC5 — `knowledge-space-practice-projection-audit.md` updated from placeholder
  to reflect the wired Math (IM3) pipeline.
- AC6 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope (follow-on tracks)

- Weighted readiness via edge weight (Track 2); edge calibration (Track 3);
  next-skill planner — `recommendedNext` stays "first N" (Track 4); placement
  (Track 5); misconception `remediated_by` + lifecycle (Track 6);
  "problem family" → "practice variant" rename (Track 7); `transfers_to`,
  Level Projection, `progressTrend` fix (Track 8).
- English/GSE domain wiring.

## Open Questions (resolve during implementation)

- Misconception rating divergence: `computeBaseRating` currently forces `Again`
  on any misconception tag; the v2 plan (Item 6) proposes capping at `Hard`.
  Out of scope here — flagged for Track 6.
