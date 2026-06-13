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

### Phase 1 — Adversarial audit evidence (2026-06-12)

Audit found a public API integration gap: Phase 1 added `level-projection.ts` and
`progress-trend.ts` but did not expose them through the package root/subpath
exports required by downstream packages. Added `public-api-contract.test.ts`,
root exports, and package subpath exports.

| Command | Result |
|---------|--------|
| `npm test` | pass — 15 files / 247 tests in `packages/knowledge-space-core` |
| `type_check packages/knowledge-space-core/src/index.ts` | pass |
| `type_check packages/knowledge-space-core/src/__tests__/public-api-contract.test.ts` | pass |

## Phase 2 — Level Projection

- [~] Task: Implement the Level Projection (TDD)  *(MID Red — 2026-06-13)*
    - [~] Domain-supplied monotonic knowledge-state → display-level function; presentation-only
    - [~] IM3 instance derived from the existing CSV level mapping
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 2 — Red-phase evidence (MID handoff, 2026-06-13)

Targeted Red commands and observed failures (both failing for the expected
contract-gap reasons — missing implementation, not incidental fixture issues):

| Command | Result | Failing tests |
|---------|--------|---------------|
| `node node_modules/vitest/vitest.mjs run packages/knowledge-space-core/src/__tests__/level-projection.test.ts --root packages/knowledge-space-core` | 7 failed / 7 total | All 7: `TypeError: projectDisplayLevel is not a function` — symbol is not yet exported from `../level-projection` (Phase 1 only added the type contract). Failing tests: (1) export contract, (2) arity=2 (presentation-only, no edges), (3) empty state → L1, (4) full mastery → L3, (5) avg=0.5 → L2, (6) does not mutate input state, (7) monotonicity. |
| `node node_modules/vitest/vitest.mjs run apps/integrated-math-3/__tests__/level-projection.test.ts --root apps/integrated-math-3` | 1 failed suite (0 tests ran) | `Failed to resolve import "@/lib/level-projection/im3-level-projection" from "apps/integrated-math-3/__tests__/level-projection.test.ts"` — the IM3 instance module does not exist yet (and neither does the underlying `gse-to-im3-advantage.csv`). All 5 IM3 tests (export contract, empty-state anchor, bottom-level anchor, top-level anchor, monotonicity sweep) are blocked at file-load. |

Red-signal interpretation:

- The core test file fails 7/7 with the *exact* contract-gap message
  (`projectDisplayLevel is not a function`), proving the export is missing
  and not merely a TS type-check issue.
- The IM3 test file fails at file-load (no test cases run) because the
  module under test is missing entirely. This is the strongest Red signal
  possible — there is no implementation to even invoke.

Test-strategy §7 alignment:

- Core: `npx vitest run packages/knowledge-space-core/src/__tests__/level-projection.test.ts` → 7/7 failed
- IM3: `npx vitest run -t "IM3 level projection" --root apps/integrated-math-3` → file-load failure (filter resolves all 5 cases to the same suite)

Files added by this Red commit (no other paths touched):

- `packages/knowledge-space-core/src/__tests__/level-projection.test.ts` (new, 7 tests)
- `apps/integrated-math-3/__tests__/level-projection.test.ts` (new, 5 tests)
- `measure/tracks/kst-lesser-holes_20260521/plan.md` (Measure doc update only)

Dirty worktree note: 376 unrelated paths in the worktree (JSDoc reverts
across IM3 + other packages) are pre-existing and outside the scope of this
track. They are preserved untouched.

### Phase 2 — Red-phase re-verification (MID, 2026-06-13)

Re-ran the two targeted Red commands at HEAD to confirm the Red state still
holds before the Green phase begins. Build-graph is fresh
(13,879 nodes / 20,482 edges / 2,038 files, mtime 2026-06-12 22:19);
`build-graph search levelProjection` / `projectDisplayLevel` / `LevelProjection`
all return 0 nodes — confirming the greenfield state.

| Command | Result | Failing tests |
|---------|--------|---------------|
| `npx vitest run packages/knowledge-space-core/src/__tests__/level-projection.test.ts` | 7 failed / 7 total | All 7: `TypeError: projectDisplayLevel is not a function` — symbol is not yet exported from `../level-projection` (Phase 1 only added the type contract). Failing tests: (1) export contract, (2) arity=2 (presentation-only, no edges), (3) empty state → L1, (4) full mastery → L3, (5) avg=0.5 → L2, (6) does not mutate input state, (7) monotonicity. |
| `npx vitest run apps/integrated-math-3/__tests__/level-projection.test.ts --root apps/integrated-math-3` | 1 failed suite (0 tests ran) | `Failed to resolve import "@/lib/level-projection/im3-level-projection"` — IM3 instance module does not exist yet (and neither does the underlying `gse-to-im3-advantage.csv`). All 5 IM3 tests blocked at file-load. |

The Red state is intact. The Green phase can proceed in the next role:
the implementer must add `projectDisplayLevel` to
`packages/knowledge-space-core/src/level-projection.ts` and create
`apps/integrated-math-3/lib/level-projection/{gse-to-im3-advantage.csv,
im3-level-projection.ts}` to satisfy both targeted suites.

## Phase 3 — progressTrend Fix

- [ ] Task: Replace progressTrend static ratio with a time-delta (TDD)
    - [ ] Mastered-count delta over a window; unknown on insufficient history; update parent visualization
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec (§3.2 transfers_to, §16 Level Projection, §9.4 progressTrend, §12.9 FSRS per-card limitation + siblingReinforcement flag)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
