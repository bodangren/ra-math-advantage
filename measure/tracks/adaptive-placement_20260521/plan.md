# Track 5: Adaptive Placement — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (knowledge state, graph availability).

## Phase 1 — Contract & Schema

- [x] Task: Define placement contract types (dd335a66)
    - [x] Placement result ({ nodeId, masteryEstimate, confidence }); abstract probe interface (pass/fail/partial)
    - [x] Convex schema for persisted initial knowledge state
- [x] Task: Measure - User Manual Verification 'Phase 1' (037090ce)

## Phase 2 — Adaptive Tree-Walk Engine [checkpoint: 5b97e05f]

- [x] Task: Implement the adaptive tree-walk traversal (TDD) (81307209)
    - [x] Pass → toward advanced; fail → toward prerequisites; domain-neutral, pure
- [x] Task: Implement convergence / frontier detection with bounded probe count (TDD) (81307209)
- [x] Task: Extend tree-walk test coverage for structural patterns and async probes (TDD, Red) (d261e1f1) (73bb4752)
    - [x] Diamond/convergent DAGs, multi-prerequisite nodes, non-prereq edge filtering, self-loops
    - [x] Async `ProbeAdapter` support (engine type allows `Promise<ProbeResult>`) — GREEN
    - [x] Property-based termination on small generated DAGs
    - [x] Probe error propagation (probe throws → engine surfaces error, not silent crash)
- [x] Task: Extend tree-walk test coverage round 2 — invalid probe result handling (TDD, Red) (0b862005)
    - [x] Async probe rejection propagation (regression lock-in; current behavior correct)
    - [x] Sync probe result validation (non-canonical string, null, undefined, number, uppercase variant) — engine surfaces `/invalid probe result/i` error with the offending value
    - [x] Async probe result validation (resolves to non-canonical value) — engine surfaces `/invalid probe result/i` error with the offending value
- [x] Task: Measure - User Manual Verification 'Phase 2' (5b97e05f)

> **Known test debt (3 tests):** Resolved in 73bb4752 — bare node IDs fixed to dot-separated format; adapter preset corrected; engine made async. See `measure/tech-debt.md` items tagged `Track 5 P2` (all Resolved).

## Phase 3 — IM3 Reference Implementation [checkpoint: f238aa1c]

- [x] Task: Implement the IM3 problem-bank probe adapter (TDD) (fb574831)
    - [x] 20–30 problems mapped to graph nodes; implements probe(nodeId)
    - [x] Multi-branch IM3 graph end-to-end traversal (pass-one-branch / fail-another)
    - [x] Full 25-entry problem bank end-to-end property: probe count is bounded regardless of preset
- [x] Task: Seed placement results into the knowledge state (TDD) (fb574831)
    - [x] Low-to-medium-confidence mastery estimates feeding getKnowledgeState
    - [x] Pure factory + edge cases: buildPlacementKnowledgeStateSeed does not mutate input; empty input is a no-op; store is reusable
- [x] Task: Phase 3 Red-phase regression hardening — non-finite masteryEstimate rejection (200f0184)
    - [x] Red-phase tests for NaN / non-numeric masteryEstimate rejection in buildPlacementKnowledgeStateSeed (5 tests: 2 fail Red, 3 regression locks)
    - [x] Locks the test strategy §3 "must remain explicit" spirit for seed-builder edge cases
    - [x] **Green-phase follow-up (13362e28):** `Number.isFinite()` guard added to range check in `apps/integrated-math-3/lib/placement/seed-knowledge-state.ts`; NaN and non-numeric masteryEstimate values now rejected.
- [x] Task: Measure - User Manual Verification 'Phase 3' (f238aa1c)

> **Resolved (Phase 4):** `seedPlacementResultsIntoStore` returning-student guard test conflicted with upsert semantics. Always-upsert implemented; guard logic now lives in the Phase 4 caller `runNewStudentPlacementFlow`. (Was Tech Debt Registry row "Track 5 P3".)

## Phase 4 — Production Wiring [checkpoint: 0878bdd0]

- [x] Task: Wire the IM3 new-student placement flow (ad1515c4)
    - [x] Run traversal; persist initial knowledge state; route for new students (36 tests passing)
- [x] Task: Measure - User Manual Verification 'Phase 4' (0878bdd0)

## Phase 5 — Docs & Doctor

- [x] Task: Update in-repo kst-srs.v2 spec §8 (Placement) with the implemented contract (cbc48616)
- [x] Task: Run architectural lint (`node scripts/check-monorepo-boundaries.mjs`) + per-package `tsc --noEmit`; fix findings (`measure/generate.sh`/`doctor.sh` do not exist — substituted the real boundary linter)
- [x] Task: Final verification — boundary lints, per-app lint, tsc --noEmit, CI=true npm run test
- [~] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)

## Known Gaps (relocated from Tech Debt Registry, 2026-06-05)

These were tracked as durable tech debt but are really in-flight gaps owned by this track. Recorded here so the registry stays scoped to cross-track durable items.

- **End-to-end integration deferred (blocked on KST Track 1):** the `PlacementResult → getKnowledgeState` integration test cannot be written until `wire-kst-pipeline` defines `getKnowledgeState`. **Do not mark this track fully done** until Track 1 lands and this seam is verified. (Was "Track 5 P1".)
- **`schema-placement.test.ts` indexes shape mismatch:** Phase 1 test expects `Record<string, ReadonlyArray<string>>` but Convex `TableDefinition.indexes` is `Array<{ indexDescriptor, fields }>`. Surfaces on `tsc --noEmit`. Fix the test's expected shape. (Was "Track 5 P2".)
- **Placement contract documentation location:** resolved — the implemented contract now lives in kst-srs.v2 spec §8 (commit cbc48616). (Was "Track 5 P5 §8/§11".)
