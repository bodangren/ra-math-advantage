# Track 8: Lesser Holes — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1. Independent of Tracks 2–7; run last in the program.

## Phase 1 — Contract & Schema

- [ ] Task: Add the transfers_to edge type
    - [ ] Extend EdgeType union + Zod schemas; add §2.7 endpoint-pairing rule; extend validation
- [ ] Task: Define Level Projection and progressTrend history types
    - [ ] Level Projection function signature (knowledge state → display level); progressTrend window/history input types
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Level Projection

- [ ] Task: Implement the Level Projection (TDD)
    - [ ] Domain-supplied monotonic knowledge-state → display-level function; presentation-only
    - [ ] IM3 instance derived from the existing CSV level mapping
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — progressTrend Fix

- [ ] Task: Replace progressTrend static ratio with a time-delta (TDD)
    - [ ] Mastered-count delta over a window; unknown on insufficient history; update parent visualization
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec (§3.2 transfers_to, §16 Level Projection, §9.4 progressTrend, §12.9 FSRS per-card limitation + siblingReinforcement flag)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
