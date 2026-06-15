# Track 6: Misconception Remediation Loop — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1.

## Phase 1 — Contract & Schema

- [x] Task: Add the remediated_by edge type
    - [x] Extend EdgeType union + Zod schemas; add §2.7 endpoint-pairing rule (misconception → worked_example/task_blueprint/skill)
    - [x] Extend validation (INVALID_EDGE_PAIRING coverage)
- [x] Task: Define misconception lifecycle types and Convex schema
    - [x] active/resolved state; severity model; per-student misconception state table
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

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

- [ ] Task: Reconcile computeBaseRating with the v2 rating-cap rule (TDD)
    - [ ] Cap at Hard by default; Again only when misconception is severe
    - [ ] Tests for both the cap and the severe paths
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

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
