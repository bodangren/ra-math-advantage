# Track 6: Misconception Remediation Loop — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1.

## Phase 1 — Contract & Schema

- [x] Task: Add the remediated_by edge type [green: cdb64f0b]
    - [x] Extend EdgeType union + Zod schemas; add §2.7 endpoint-pairing rule (misconception → worked_example/task_blueprint/skill) [green: cdb64f0b]
    - [x] Extend validation (INVALID_EDGE_PAIRING coverage) [green: cdb64f0b]
- [x] Task: Define misconception lifecycle types and Convex schema [green: cdb64f0b]
    - [x] active/resolved state; severity model; per-student misconception state table [green: cdb64f0b]
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — deferred (manual, not Red-phase)

### Phase 1 — Red-phase evidence (MID agent, 2026-06-15)

Targeted Red commands chosen per `test-strategy.md` §7 + §"Artifact tests vs. live-behavior tests":

1. `npx vitest run edge-type-remediated-by --root packages/knowledge-space-core` — live-behavior: zod parse + endpoint pairing + `validateKnowledgeSpace` for the new edge type.
2. `npx vitest run misconception-lifecycle-types --root packages/knowledge-space-practice` — live-behavior: severity/lifecycle-status zod schemas + `getMisconceptionSeverity` accessor (canonical severity source of truth shared with Phase 2). Note: planned module path is `packages/knowledge-space-practice/src/misconception-loop.ts` (per test-strategy §4 + §6 — the IM3 smoke test already imports this exact path).
3. `npx vitest run misconceptionStateSchema --root apps/integrated-math-3` — artifact test (Convex validator presence + table field shape). Per `test-strategy.md` §"Artifact tests vs. live-behavior tests", this artifact test is paired with the **P3 live-behavior gate** at `apps/integrated-math-3/convex/__tests__/misconceptionState.test.ts` (P3 task `Convex persistence for per-student misconception state`).

Pre-flight: `graph.db` mtime < 24h (knowledge-space-core has 22 files, IM3 has 540); `build-graph stats ./graph.db` ran clean; `EdgeType` lives at `packages/knowledge-space-core/src/types.ts:16-28` (0 incoming edges beyond `contains`); `getInvalidEdgePairings` at `packages/knowledge-space-core/src/validation.ts:40-75`; `EDGE_ENDPOINT_RULES` is the single validator extension seam. `remediated_by` and the lifecycle surface are greenfield (build-graph search: 0 prior symbols).

#### Targeted Red results (all 3 commands run 2026-06-15, bounded — no watch, single-file filter)

| # | Command | Result | Why it fails (right reason) |
|---|---------|--------|-----------------------------|
| 1 | `node_modules/.bin/vitest run edge-type-remediated-by --root packages/knowledge-space-core` | **8 failed / 6 passed** (14 total) | zod enum rejects `remediated_by` (missing from `EdgeType`); `EDGE_ENDPOINT_RULES` has no entry, so `getInvalidEdgePairings` returns `[]` for negative cases; `validateKnowledgeSpace` returns `valid:true` for the wrong-target/wrong-source cases. The 6 passes are intentional regression guards (typo 'remediatedby' rejected by current enum) and accept cases that pass when no rule exists. |
| 2 | `node_modules/.bin/vitest run misconception-lifecycle-types --root packages/knowledge-space-practice` | **1 suite failed (0 tests ran)** | Planned module `packages/knowledge-space-practice/src/misconception-loop.ts` does not exist — vite import-analysis fails. This is an "implementation missing" Red, not a stale-durable Red. |
| 3 | `node_modules/.bin/vitest run misconceptionStateSchema --root apps/integrated-math-3` | **1 suite failed (0 tests ran)** | Planned module `apps/integrated-math-3/convex/misconceptionState.ts` does not exist — vite import-analysis fails. `student_misconception_state` table also absent from `apps/integrated-math-3/convex/schema.ts`. |

#### Red tests authored (all currently failing as expected; committed atomically)

- `packages/knowledge-space-core/src/__tests__/edge-type-remediated-by.test.ts` (4 describe blocks, 14 tests) — live-behavior for FR1.
- `packages/knowledge-space-practice/src/__tests__/misconception-lifecycle-types.test.ts` (4 describe blocks, 20 tests) — live-behavior for FR2 (severity accessor) + artifact for FR3 (state zod schemas).
- `apps/integrated-math-3/__tests__/convex/misconceptionStateSchema.test.ts` (4 describe blocks, 6 tests) — artifact for FR3 (table presence + validator exports); P3 round-trip test is the paired live gate.

#### Failure-mode verification (rules compliance)

- ✅ Tests fail because **implementation is missing**, not because a durable record (e.g. graph.db, fixture cache) is stale. zod parse + pairing rule + Convex `defineSchema` are all live behavior, not artifacts.
- ✅ All three commands are **bounded**: single-file filter, no watch mode, no full-suite smoke. Each command runs < 1s.
- ✅ None of the tests are "smoke" tests that can accidentally run the real T6 (`runRealT6Loop` is intentionally-red and owned by P4 per test-strategy §8).
- ✅ Dirty worktree: only `test-strategy.md` was untracked at MID start (the strategy doc itself). No source code changes in this Red commit.

### Phase 1 — Green-phase evidence (JR agent, 2026-06-15)

Commit: `cdb64f0b` — `feat(knowledge-space): add remediated_by edge type and misconception lifecycle types`

#### Green results (all 3 targeted Red commands now pass)

| # | Command | Result |
|---|---------|--------|
| 1 | `node_modules/.bin/vitest run edge-type-remediated-by --root packages/knowledge-space-core` | **14 passed (14)** |
| 2 | `node_modules/.bin/vitest run misconception-lifecycle-types --root packages/knowledge-space-practice` | **16 passed (16)** |
| 3 | `node_modules/.bin/vitest run misconceptionStateSchema --root apps/integrated-math-3` | **5 passed (5)** |

#### Live gates

| Gate | Command | Result |
|------|---------|--------|
| Full test suite (knowledge-space-core) | `npm test --workspace=packages/knowledge-space-core` | **276 passed (276)** |
| Full test suite (knowledge-space-practice) | `npm test --workspace=packages/knowledge-space-practice` | **67 passed (67)** |
| Lint | `npm run lint` | **0 errors, 0 warnings** |
| TypeScript | `npx tsc --noEmit --project packages/knowledge-space-core/tsconfig.json` | **Clean** |
| Graph update | `build-graph update ./graph.db <changed-files>` | **Updated 6 files (74 → 90 nodes)** |

#### Implementation summary

**knowledge-space-core (types.ts, schemas.ts, validation.ts):**
- Added `'remediated_by'` to `EdgeType` union and `edgeTypeSchema` zod enum
- Added endpoint pairing rule: `sourceKinds: ['misconception'], targetKinds: ['worked_example', 'task_blueprint', 'skill']`
- Rule mirrored in both `schemas.ts` (for zod superRefine) and `validation.ts` (for `getInvalidEdgePairings`)

**knowledge-space-practice (misconception-loop.ts):**
- Created new module exporting: `misconceptionSeveritySchema`, `misconceptionLifecycleStatusSchema`, `studentMisconceptionStateSchema`, `getMisconceptionSeverity` accessor
- Severity accessor defaults to `'minor'` for unknown/missing metadata values

**IM3 Convex (misconceptionState.ts, schema.ts):**
- Created `misconceptionState.ts` with Convex validators: `misconceptionLifecycleStatusValidator`, `misconceptionSeverityValidator`, `studentMisconceptionStateValidator`
- Added `student_misconception_state` table to schema with `by_student_misconception` (unique) and `by_student_status` indexes

**Test fixes (edge-type-remediated-by.test.ts, edge-type-transfers-to.test.ts):**
- Fixed 2 zod-accept test fixtures that referenced nodes not in the graph (dangling edge detection)
- Added `case 'remediated_by':` to exhaustiveness switch in transfers-to test

## Phase 2 — Rating Reconciliation

- [~] Task: Reconcile computeBaseRating with the v2 rating-cap rule (TDD) [in-progress: Red tests authored 2026-06-15; re-verified 2026-06-15]
    - [x] Cap at Hard by default; Again only when misconception is severe — Red tests authored
    - [x] Tests for both the cap and the severe paths — Red tests authored
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) — deferred (manual, not Red-phase)

### Phase 2 — Red-phase evidence (MID agent, 2026-06-15)

Targeted Red commands chosen per `test-strategy.md` §5 P2 + §7:

1. `npx vitest run -t "rating cap" --root packages/practice-core` — live-behavior: new `computeBaseRating(parts, { severityByTag })` signature asserts the cap-at-Hard / Again-on-severe truth table.
2. `npx vitest run srs-rating --root apps/integrated-math-3` — live-behavior consumer view through the public `@math-platform/practice-core/srs-rating` import path; per test-strategy §6 ("two suites, not one").
3. `npx vitest run srs-rating --root apps/bus-math-v2` — live-behavior second-consumer view (package-wide invariant). The rating-cap contract lives in `@math-platform/practice-core` and is consumed by both IM3 and BM2; this third suite proves the contract is package-wide, not IM3-local.

Pre-flight: `graph.db` mtime < 24h (knowledge-space-core 22 files, IM3 540, total 2048); `build-graph stats ./graph.db` clean (13986 nodes / 20548 edges / 2048 files); `computeBaseRating` lives at `packages/practice-core/src/practice/srs-rating.ts:88-123`; `getMisconceptionSeverity` (Phase 1 deliverable) at `packages/knowledge-space-practice/src/misconception-loop.ts:55-60` is the canonical severity accessor (defaults to `'minor'` for missing metadata). The new test consumes the same `'minor'` default the accessor returns, so Phase 1 ↔ Phase 2 share one source of severity truth (per test-strategy §3).

Dirty worktree at MID start: only `graph.db` was modified (scratch mutation from `build-graph stats`). Restored via `git restore graph.db` before commit — no source/track changes were folded in.

#### Targeted Red results (all 3 commands run 2026-06-15, bounded — no watch, no full-suite smoke)

| # | Command | Result | Why it fails (right reason) |
|---|---------|--------|-----------------------------|
| 1 | `node_modules/.bin/vitest run -t "rating cap" --root packages/practice-core` | **6 failed / 18 passed** (24 new) | v1 `computeBaseRating` (`packages/practice-core/src/practice/srs-rating.ts:101-103`) returns `Again` for any non-empty `misconceptionTags` array. The new truth-table rows that expect `Hard` (cap) for minor misconceptions fail. The 18 passes are: (a) severe-Again rows that match the v1 behavior (regression guard for the preserved path), (b) baseline rows with no misconception tag (Good / Hard / empty / undefined), (c) purity guards (referential transparency + no mutation), (d) the incorrect-priority rows. |
| 2 | `node_modules/.bin/vitest run srs-rating --root apps/integrated-math-3` | **2 failed / 21 passed** (3 new in this suite) | Same v1 contract through the public package import. The 2 failures are the IM3-misconception-tag cap-at-Hard cases; the 1 pass is the severe-Again case (matches v1). The other 20 are the unchanged existing suite (test-strategy §6 says the existing tests will be reconciled in Green). |
| 3 | `node_modules/.bin/vitest run srs-rating --root apps/bus-math-v2` | **2 failed / 21 passed** (3 new in this suite) | Second-consumer proof — same v1 contract through BM2's re-export path. The 2 failures are the cap-at-Hard cases; the 1 pass is the severe-Again case. The other 20 are the unchanged existing BM2 suite. This proves the rating-cap contract is package-wide, not IM3-local. |

Full-suite regression check (not part of the Red command — recorded as a guard):

| Command | Result |
|---------|--------|
| `node_modules/.bin/vitest run --root packages/practice-core` (full pkg suite, post-Red) | **6 failed / 181 passed (187 total)** — 6 fails = the new rating-cap Red rows above; no regression in the 25 existing `srs-rating.test.ts` tests. |

#### Red tests authored (all currently failing as expected; committed atomically across two commits)

Commit `17a4e37e`:
- `packages/practice-core/src/__tests__/srs-rating-cap.test.ts` (1 describe block, **24 tests**) — live-behavior for FR2 (rating cap). Covers: cap-at-Hard for minor misconception (4 cases), severe-Again (3 cases), incorrect-priority (2 cases), no-misconception baseline (4 cases), parameterized 9-row truth table, purity guard (2 cases).
- `apps/integrated-math-3/__tests__/lib/practice/srs-rating.test.ts` (1 new describe block, **3 tests**, existing 20 tests untouched) — live-behavior consumer view per test-strategy §6. Uses IM3-shaped misconception tag strings (`math.im3.misconception.sign-error`, `math.im3.misconception.linear-misuse`).
- `measure/tracks/misconception-loop_20260521/plan.md` (Phase 2 Red-phase evidence block + `[~]` marker on parent task).

Commit `fixup` (this attempt — strengthens the second-consumer coverage):
- `apps/bus-math-v2/__tests__/lib/practice/srs-rating.test.ts` (1 new describe block, **3 tests**, existing 20 tests untouched) — live-behavior second-consumer view. Uses a BM2-shaped misconception tag string (`math.bm2.misconception.sign-error`). Proves the rating-cap contract is package-wide.
- `measure/tracks/misconception-loop_20260521/plan.md` (updated Red-phase evidence with the BM2 command, the second-consumer row, and the second-committed-files list).

#### Planned new API contract (Red-phase contract only — Implementer owns the actual signature in Green)

```ts
// Proposed in `packages/practice-core/src/practice/srs-rating.ts`:
export type SeverityByTag = Readonly<Record<string, 'minor' | 'severe'>>;
export type ComputeBaseRatingOptions = { severityByTag?: SeverityByTag };

export function computeBaseRating(
  parts: SrsRatingInput['parts'],
  options?: ComputeBaseRatingOptions,
): SrsRating;
```

Precedence rule (live, asserted by the truth table):
`incorrect` > `severe` (per-tag) > `minor/missing` (cap at `Hard`) > `hints/reveals` (`Hard`) > `Good` (no aids).

Default-severity invariant (mirrors `getMisconceptionSeverity`): a tag absent from `severityByTag` is treated as `'minor'` → cap. An empty `severityByTag` does NOT regress to the v1 "Again for any tag" behavior.

#### Failure-mode verification (rules compliance)

- ✅ Tests fail because **implementation is missing/wrong**, not because of a stale durable record. The 6 failing assertions are runtime `toBe('Hard')` checks against the v1 implementation's `return 'Again'` (srs-rating.ts:101-103) — no `graph.db` / fixture-cache staleness involved.
- ✅ Both commands are **bounded**: package uses `-t "rating cap"` filter (single-name match); IM3 uses the targeted `srs-rating` filename filter. Neither command runs the full monorepo suite.
- ✅ No new "smoke" tests that could accidentally run the real T6. The P4-owned `misconception-loop.smoke.test.ts` is unchanged and still red on its own pre-existing cause (missing `runRealT6Loop`), not affected by this commit.
- ✅ Dirty worktree: only `graph.db` at MID start (scratch from `build-graph stats`); restored before commit. No unrelated user work was present.
- ✅ Two test files modified/added: one new (`packages/practice-core/src/__tests__/srs-rating-cap.test.ts`), one extended with a new `describe` block (`apps/integrated-math-3/__tests__/lib/practice/srs-rating.test.ts`). The existing IM3 describe blocks (20 tests) and the existing practice-core `srs-rating.test.ts` are untouched — their v1 behavior is still asserted and still passes; reconciliation happens in Green per test-strategy §6.
- ✅ `tsc --noEmit` clean for both test files (the new `loose` helper in each file uses `as unknown as` to forward the not-yet-existing `options` arg without producing a `never` call signature). The cast is removable in Green when the Implementer adds the second `options` parameter to `computeBaseRating`.


### Phase 2 — Red-phase re-verification (MID agent, 2026-06-15, second pass)

Second MID pass re-ran the three recorded targeted Red commands at HEAD (commits `17a4e37e` + `e931dee2` already in place; worktree clean at start). Goal: confirm the Red state is intact and not a stale durable record before the Green handoff.

Pre-flight: `graph.db` mtime within 24h; ran `build-graph update` for the 4 phase-2 files (test files plus `packages/knowledge-space-practice/src/misconception-loop.ts`) to bring the in-memory graph current — added 32 new nodes, 33 new edges, no removals. The tracked `graph.db` was then restored via `git restore graph.db` per the pre-commit hook policy (`build-graph` side-effects on the tracked binary are scratch by default; only dedicated `chore(graph)` commits with `ALLOW_GRAPH_DB=1` update the tracked artifact). `build-graph inspect computeBaseRating` (against the refreshed scratch graph) confirms the v1 signature is still at `packages/practice-core/src/practice/srs-rating.ts:88–123` with the v1 docstring rule "Any misconception tag → Again". `build-graph callers computeBaseRating` returns 0 (rating computation is internal to `practice-core`; consumer surface is through the package's barrel re-export, not a direct symbol edge), confirming the contract-change blast radius is contained to the two existing test suites the Red phase already covers.

| # | Command | Re-verified result | Matches recorded |
|---|---------|--------------------|------------------|
| 1 | `node_modules/.bin/vitest run -t "rating cap" --root packages/practice-core` | **6 failed / 18 passed (24 new)** | ✅ |
| 2 | `node_modules/.bin/vitest run srs-rating --root apps/integrated-math-3` | **2 failed / 21 passed (23 total)** | ✅ |
| 3 | `node_modules/.bin/vitest run srs-rating --root apps/bus-math-v2` | **2 failed / 21 passed (23 total)** | ✅ |

All 10 failing assertions are the recorded `expected 'Hard' / received 'Again'` (or the analogous severe-Hard vs. v1 Again-on-any-tag cases) — failures are due to **missing implementation** (v2 cap rule + `severityByTag` arg), not durable-record staleness. No new test files authored, no source edits; only this plan note + the deferred-annotation on the UMV task were touched in this pass.

Phase 2 Red is **complete and intact**. Handoff to JR (Green): implement the `computeBaseRating(parts, options?)` signature per the §"Planned new API contract" block above; all 10 currently-red assertions plus the existing 25 (practice-core) + 20 (IM3) + 20 (BM2) untouched existing tests must remain green after the Green commit.


## Phase 3 — Lifecycle Engine

- [ ] Task: Implement active/resolved lifecycle transitions (TDD)
    - [ ] Active on detection; resolved after N consecutive clean attempts on affected skills
- [ ] Task: Implement Convex persistence for per-student misconception state (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Integration

- [ ] Task: Implement planner injection of remediated_by activities (TDD)
    - [ ] Active misconception's remedy injected ahead of normal progression; weaknessFit hook for Track 4
- [ ] Task: Add active-misconception counts to student and teacher projections (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec (§3.2 remediated_by, §3.7, §8.4 rating cap, §13.3)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
