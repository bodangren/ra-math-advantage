# Track 5: Adaptive Placement — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (knowledge state, graph availability).

## Phase 1 — Contract & Schema

- [x] Task: Define placement contract types (dd335a66)
    - [x] Placement result ({ nodeId, masteryEstimate, confidence }); abstract probe interface (pass/fail/partial)
    - [x] Convex schema for persisted initial knowledge state
- [~] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Adaptive Tree-Walk Engine

- [x] Task: Implement the adaptive tree-walk traversal (TDD) (81307209)
    - [x] Pass → toward advanced; fail → toward prerequisites; domain-neutral, pure
- [x] Task: Implement convergence / frontier detection with bounded probe count (TDD) (81307209)
- [x] Task: Extend tree-walk test coverage for structural patterns and async probes (TDD, Red) (d261e1f1) (73bb4752)
    - [x] Diamond/convergent DAGs, multi-prerequisite nodes, non-prereq edge filtering, self-loops
    - [x] Async `ProbeAdapter` support (engine type allows `Promise<ProbeResult>`) — GREEN
    - [x] Property-based termination on small generated DAGs
    - [x] Probe error propagation (probe throws → engine surfaces error, not silent crash)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

> **Known test debt (3 tests):** Resolved in 73bb4752 — bare node IDs fixed to dot-separated format; adapter preset corrected; engine made async. See `measure/tech-debt.md` items tagged `Track 5 P2` (all Resolved).

## Phase 3 — IM3 Reference Implementation

- [x] Task: Implement the IM3 problem-bank probe adapter (TDD) (fb574831)
    - [x] 20–30 problems mapped to graph nodes; implements probe(nodeId)
    - [x] Multi-branch IM3 graph end-to-end traversal (pass-one-branch / fail-another)
    - [x] Full 25-entry problem bank end-to-end property: probe count is bounded regardless of preset
- [x] Task: Seed placement results into the knowledge state (TDD) (fb574831)
    - [x] Low-to-medium-confidence mastery estimates feeding getKnowledgeState
    - [x] Pure factory + edge cases: buildPlacementKnowledgeStateSeed does not mutate input; empty input is a no-op; store is reusable
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

> **Known tech debt (1 test):** `seedPlacementResultsIntoStore` returning-student guard test conflicts with upsert semantics test. Always-upsert implemented; guard logic deferred to Phase 4 caller. See `measure/tech-debt.md` item tagged `Track 5 P3`.

## Phase 4 — Production Wiring

- [x] Task: Wire the IM3 new-student placement flow (ad1515c4)
    - [x] Run traversal; persist initial knowledge state; route for new students (36 tests passing)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — Docs & Doctor

- [x] Task: Update in-repo kst-srs.v2 spec §8 (Placement) with the implemented contract
- [x] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [x] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
