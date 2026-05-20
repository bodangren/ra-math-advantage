# Track 5: Adaptive Placement — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (knowledge state, graph availability).

## Phase 1 — Contract & Schema

- [ ] Task: Define placement contract types
    - [ ] Placement result ({ nodeId, masteryEstimate, confidence }); abstract probe interface (pass/fail/partial)
    - [ ] Convex schema for persisted initial knowledge state
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Adaptive Tree-Walk Engine

- [ ] Task: Implement the adaptive tree-walk traversal (TDD)
    - [ ] Pass → toward advanced; fail → toward prerequisites; domain-neutral, pure
- [ ] Task: Implement convergence / frontier detection with bounded probe count (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — IM3 Reference Implementation

- [ ] Task: Implement the IM3 problem-bank probe adapter (TDD)
    - [ ] 20–30 problems mapped to graph nodes; implements probe(nodeId)
- [ ] Task: Seed placement results into the knowledge state (TDD)
    - [ ] Low-to-medium-confidence mastery estimates feeding getKnowledgeState
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Production Wiring

- [ ] Task: Wire the IM3 new-student placement flow
    - [ ] Run traversal; persist initial knowledge state; route for new students
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec §11 (Placement) with the implemented contract
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
