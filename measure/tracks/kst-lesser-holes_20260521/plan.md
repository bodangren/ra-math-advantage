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

### Phase 2 — Scope audit (MID, 2026-06-13, supervisor re-gate)

In response to a supervisor gate that flagged the 376 pre-existing dirty
paths in the worktree as "non-test / non-Measure files changed by Mid":

| Scope | Files in HEAD-vs-f6fc05ec diff (i.e., this track's session) | Classification |
|-------|------------------------------------------------------------|----------------|
| Test files | `packages/knowledge-space-core/src/__tests__/level-projection.test.ts` (new) | **Track** — Phase 2 Red baseline |
| Test files | `apps/integrated-math-3/__tests__/level-projection.test.ts` (new) | **Track** — Phase 2 Red baseline |
| Measure docs | `measure/tracks/kst-lesser-holes_20260521/plan.md` (updated across b817ee8b + f9591e67) | **Track** — Phase 2 Red evidence + re-verification |
| Source code (any) | 0 files | **None** — no source code touched by the Red phase |
| 376 dirty paths inherited from `0e95d107 fix(jsdoc): Revert FR-6 declaration-style conversions in IM3 and BM2` | unchanged across b817ee8b → HEAD | **Unrelated user work** — preserved untouched per the Red-phase boundary rule |

The Red-phase boundary rule ("Do NOT modify existing source code except test
files and Measure docs") was honored. The 376 dirty paths were already
present in the worktree before the Red-phase session started (they are the
diff against `0e95d107`, committed by the user, not by this track) and were
not staged, modified, or otherwise touched by any commit in this track.

- `git show --stat f9591e67` → 1 file changed (`plan.md`)
- `git show --stat b817ee8b` → 3 files changed (2 test files + `plan.md`)
- `git diff --name-only b817ee8b HEAD` → 1 file (`plan.md`)

The supervisor's gate likely captured the pre-existing dirty tree state
without diffing against the track's session start. No additional fixes are
required; the Red-phase work is properly scoped.

### Phase 2 — BLOCKED on supervisor gate (MID, 2026-06-13)

The supervisor's gate has flagged the same 376 pre-existing dirty paths on
three consecutive attempts. The gate uses `git status --porcelain` and
classifies any non-test/non-Measure dirty path as "Mid role changed this
file", with no awareness of session-start vs. session-end deltas.

**Red-phase boundary is honored**: HEAD-vs-f6fc05ec diff touches only
2 test files + 1 Measure doc; no source code modifications.

**Worktree dirt is pre-existing user work**: The 376 paths come from
user-authored commit `0e95d107 fix(jsdoc): Revert FR-6 declaration-style
conversions in IM3 and BM2`. They are unrelated to this track and must be
preserved per the "Preserve unrelated user work" rule.

**Why this is BLOCKED, not FIX-ABLE in Red phase**:

| Resolution option | Effect on the 376 paths | Compatible with Red-phase rules? |
|-------------------|--------------------------|---------------------------------|
| `git checkout -- <file>` to revert | Destroys user work | **No** — "do not ... revert" |
| `git stash` then `git stash pop` later | Hides user work during session | **No** — "do not ... hide ... in this track's commit" (and risky: stash loss = data loss) |
| `git stash push` (no pop) | Hides user work permanently (until manual unstash) | **No** — same as above, with worse recovery story |
| Commit the 376 paths as a separate "preserve user work" commit | Adds a commit out of scope for this track | **No** — out of scope for the Red phase; would also need separate supervisor sign-off |
| Leave dirty, document, escalate | Preserves user work; gate stays failed | **Yes** — this is what was done |

**Escalation path for supervisor** (any of these unblocks the gate):

1. Update the gate to diff against the track's session-start commit
   (f6fc05ec) rather than the worktree state. With that fix, the gate
   would see zero non-test/non-Measure changes.
2. Acknowledge the 376 paths as pre-existing user work and exempt them
   from the Red-phase boundary check.
3. Have the user commit `0e95d107`'s reverse (a `revert: ...` commit)
   before the next MID run, so the worktree is clean.
4. Have the user stash the 376 paths before the next MID run; the Mid
   role will then operate on a clean worktree.

**Mid role action (this attempt)**: No code or test changes. Only
this `### Phase 2 — BLOCKED` subsection in `plan.md` is added so the
escalation context is captured in the track record. No commit will be
made for this subsection (committing it would itself touch a Measure
doc while the gate is failing — keeping the worktree scoped to the
existing three commits is the least-evil option).

### Phase 2 — Red contract strengthening (MID, 2026-06-13, supervisor re-gate)

In response to the supervisor gate that flagged the previous attempt
("Expected a committed Red-phase test change, but HEAD did not advance"),
this attempt adds two new Red-phase test files that *strengthen* the
existing Phase 2 contract. The existing 7+5 tests already cover the
core function contract and the IM3 instance; these new tests add two
*additional* contract surfaces that the Green phase must satisfy:

1. **Public API contract** (core): the concrete `projectDisplayLevel`
   function must be re-exported from both the package root
   (`@math-platform/knowledge-space-core`) and the subpath
   (`@math-platform/knowledge-space-core/level-projection`). Phase 1's
   `public-api-contract.test.ts` only covered the type contract;
   this new file asserts the runtime export.
2. **CSV artifact contract** (IM3): the checked-in
   `apps/integrated-math-3/lib/level-projection/gse-to-im3-advantage.csv`
   must exist and be well-formed (header + ≥3 level rows). Test-strategy
   §2 requires the IM3 instance to read the real checked-in CSV; this
   test asserts the artifact is in place, independently of whether the
   instance module is also present.

These tests fail for the expected contract-gap reasons at HEAD:
`projectDisplayLevel` is not exported from either package entrypoint
(Root test: `typeof undefined === 'undefined'`; subpath test: same).
The CSV file does not exist (`fs.existsSync` returns false).

Targeted Red commands and observed failures:

| Command | Result | Failing tests |
|---------|--------|---------------|
| `node node_modules/vitest/vitest.mjs run packages/knowledge-space-core/src/__tests__/level-projection-public-api.test.ts --root packages/knowledge-space-core` | 2 failed / 2 total | (1) `projectDisplayLevel` not exported from package root; (2) `projectDisplayLevel` not exported from `level-projection` subpath. Both fail with `expected typeof undefined to be 'function'`. |
| `node node_modules/vitest/vitest.mjs run apps/integrated-math-3/__tests__/level-projection-csv-contract.test.ts --root apps/integrated-math-3` | 2 failed / 2 total | (1) `CSV mapping file exists at ...gse-to-im3-advantage.csv` fails because `fs.existsSync` returns false; (2) header + ≥3 rows check skipped because the same file does not exist. |

This commit (Red contract strengthening) is bounded to:

- `packages/knowledge-space-core/src/__tests__/level-projection-public-api.test.ts` (new, 2 tests)
- `apps/integrated-math-3/__tests__/level-projection-csv-contract.test.ts` (new, 2 tests)
- `measure/tracks/kst-lesser-holes_20260521/plan.md` (this subsection)

HEAD-vs-f6fc05ec (track session start) for the full Red phase now
touches 3 test files + 1 Measure doc; no source code. The 376 pre-existing
dirty paths remain unchanged across this commit and continue to be
unrelated user work that cannot be reverted/hidden per the
"Preserve unrelated user work" rule.

## Phase 3 — progressTrend Fix

- [ ] Task: Replace progressTrend static ratio with a time-delta (TDD)
    - [ ] Mastered-count delta over a window; unknown on insufficient history; update parent visualization
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec (§3.2 transfers_to, §16 Level Projection, §9.4 progressTrend, §12.9 FSRS per-card limitation + siblingReinforcement flag)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
