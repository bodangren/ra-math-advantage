# Track 5: Adaptive Placement

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model
Improvement Plan: Item 5

## Overview

A new student has an empty mastered set, so the whole bottom of the graph is
"ready" and nothing above. There is no diagnostic that seeds the initial
knowledge state — every student starts from zero and grinds up, regardless of
prior knowledge.

This track adds a domain-neutral placement contract: an adaptive tree-walk that
locates a learner's mastery frontier in roughly `O(log n)` probes, plus an IM3
problem-bank reference implementation.

## Functional Requirements

- FR1 — Placement contract. Placement produces an initial knowledge state — a set
  of `{ nodeId, masteryEstimate, confidence }` — that seeds `getKnowledgeState`.
- FR2 — Adaptive tree-walk. Probe a node; on pass, move toward more advanced
  skills (downstream in the prerequisite direction); on fail, move toward
  prerequisites; converge on the mastery frontier without testing every node.
- FR3 — Abstract probe interface. `probe(nodeId) → pass | fail | partial`,
  domain-implemented. The traversal is domain-neutral; the probe is not.
- FR4 — IM3 reference implementation. A 20–30 problem bank implementing `probe`
  for IM3, exercised by the same traversal.
- FR5 — Seeding. Placement results enter the knowledge state as low-to-medium-
  confidence mastery estimates, refined by subsequent practice. They are also a
  source of order-variation for edge calibration (Track 3).
- FR6 — Production wiring. An IM3 placement flow for new students that runs the
  traversal and persists the resulting initial knowledge state.

## Non-Functional Requirements

- Traversal algorithm is domain-neutral and pure; the probe is domain-supplied.
- Probe count bounded — target `O(log n)`, not full enumeration.
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — Placement contract types defined; output seeds `getKnowledgeState`.
- AC2 — Adaptive tree-walk converges on the frontier; probe count is bounded;
  tested against synthetic graphs.
- AC3 — `probe` interface is abstract; traversal has no domain imports.
- AC4 — IM3 problem-bank reference implementation drives the traversal end-to-end.
- AC5 — IM3 new-student placement flow persists the initial knowledge state.
- AC6 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- A GSE chatbot probe implementation (separate domain).
- Re-placement / knowledge-state drift detection over time.
