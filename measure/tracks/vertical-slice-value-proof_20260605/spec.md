# Track: Vertical Slice Value Proof

Program: High-Leverage Backlog (Tier 2)
Type: Feature
Depends on: wire-kst-pipeline_20260521 (KST T1); core-algebra-generators_20260510 (T17)

## Overview

The Skill Graph program produced thousands of nodes and ~4,839 edges across four
courses, but KST Track 1 states the graph is "wired into no production route".
This track proves end-to-end value on the smallest meaningful slice — IM3 Module
1 — by connecting graph → real generators → KST learner state → a live student
route. It is a depth-first integration milestone: prefer one module working in
front of a student over more breadth-first infrastructure.

## Functional Requirements

- FR1 — Real generators for M1. Deterministic generators covering IM3 M1's
  lesson-level skills (closing the 3/16 coverage gap for this module), each
  passing the Generated-Math Correctness QA harness.
- FR2 — Graph load at runtime. IM3 M1 nodes/edges loadable at runtime (structural
  edges validated per the closed-system caveat).
- FR3 — KST learner state. A Convex query composes the SRS→KST bridge +
  `getKnowledgeState` to return M1 learner state for a student (batched reads,
  no N+1).
- FR4 — Live student route. One IM3 route renders M1 knowledge state + serves
  graph-derived practice (via the visualization projection payload, not raw
  graph), and records submissions back into SRS/KST.
- FR5 — Replaces a legacy slice. The M1 practice path is served from graph
  projections rather than the hand-authored activity map, behind a flag.
- FR6 — Demo verification. A scripted demo proves a student can place, practice,
  and see mastery move for M1.

## Non-Functional Requirements

- Reuses KST T1 + T17 outputs; this track is integration + the M1 generator
  subset, not re-implementation.
- Flagged rollout so legacy M1 remains a fallback.
- TDD on the composition query and route logic.

## Acceptance Criteria

- AC1 — M1 lesson-skill generators exist and pass the correctness harness.
- AC2 — KST learner-state query returns correct M1 state for seeded students (tested, no N+1).
- AC3 — The live route renders state + practice from projections and writes submissions back.
- AC4 — Mastery demonstrably moves after correct practice (demo + test).
- AC5 — Flag toggles graph-served vs legacy M1; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Modules beyond IM3 M1 (breadth rollout is later).
- Full generator coverage for M2–M9.
- Removing the legacy activity map (flagged coexistence only).
