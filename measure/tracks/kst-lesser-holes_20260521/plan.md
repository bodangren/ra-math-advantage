# Track 8: Lesser Holes — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1. Independent of Tracks 2–7; run last in the program.

## Phase 1 — Contract & Schema

- [x] Task: Add the transfers_to edge type [checkpoint: 6208449c]
    - [x] Extend EdgeType union + Zod schemas; add §2.7 endpoint-pairing rule; extend validation
- [x] Task: Define Level Projection and progressTrend history types [checkpoint: 6208449c]
    - [x] Level Projection function signature (knowledge state → display level); progressTrend window/history input types
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) [checkpoint: 32ce33e6]

### Phase 1 — Red-phase evidence (MID handoff, 2026-06-12)

Targeted Red commands and observed failures (all failing for the expected
contract-gap reasons, not incidental fixture issues):

| Command | Result | Failing tests |
|---------|--------|---------------|
| `npx vitest run packages/knowledge-space-core/src/__tests__/edge-type-transfers-to.test.ts` | 3 failed / 4 passed (7 total) | zod accept `transfers_to` (zod enum rejects); same-domain `transfers_to` via `getInvalidEdgePairings` (no pairing rule); same-domain `transfers_to` via `validateKnowledgeSpace` (no pairing rule in pipeline) |
| `npx vitest run packages/knowledge-space-core/src/__tests__/level-projection-and-progress-trend-contract.test.ts` | 1 failed suite (0 tests ran) | `../level-projection` and `../progress-trend` modules not yet defined (expected import-time Red for Task 1.2 type contract) |
| `npx vitest run packages/knowledge-space-core/src/__tests__/contract.test.ts -t "accepts every defined edge type"` | 1 failed (49 skipped) | `transfers_to` not in zod enum, so the existing fixture-case iteration now fails on the new entry |

The 4 passing tests in the transfers_to file are intentional regression guards
(unknown-type rejection, assertNever round-trip, cross-domain valid case, and
the end-to-end positive case — the last two pass today because no rule exists
yet, which is a known pre-Green gap; the contract tests are scoped to assert
the post-Green behavior).

### Phase 1 — Green-phase evidence (JR, 2026-06-12)

All 3 targeted Red commands now pass. Full knowledge-space-core suite green.

| Command | Result |
|---------|--------|
| `npx vitest run packages/knowledge-space-core/src/__tests__/edge-type-transfers-to.test.ts` | 7 passed |
| `npx vitest run packages/knowledge-space-core/src/__tests__/level-projection-and-progress-trend-contract.test.ts` | 5 passed |
| `npx vitest run packages/knowledge-space-core/src/__tests__/contract.test.ts` | 50 passed |
| `npm run lint --workspace=packages/knowledge-space-core` | 0 warnings |
| `npx tsc --noEmit --project packages/knowledge-space-core/tsconfig.json` | clean |

Implementation changes:
- `types.ts`: added `transfers_to` to EdgeType union
- `schemas.ts`: added `transfers_to` to edgeTypeSchema enum + crossDomainOnly endpoint pairing rule
- `validation.ts`: added `transfers_to` endpoint pairing rule with crossDomainOnly check
- `level-projection.ts`: new module — knowledgeStateSchema, displayLevelSchema, LevelProjectionFn
- `progress-trend.ts`: new module — masterySnapshotSchema, progressTrendHistorySchema
- `edge-type-transfers-to.test.ts`: fixed pre-existing fixture bug (missing mathSkillB node)
- `graph.db`: updated with 5 changed files (6208449c)

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
