# Track 1: Wire the KST Pipeline + v2 Mastery Model — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Boundary rule: `knowledge-space-core` / `-practice` stay domain-neutral.

## Phase 1 — Canonical Contract & Schema

- [x] Task: Bring kst-srs.v2 contract into the repo (commit e5f8681d)
    - [x] Copy SPECIFICATION.md (kst-srs.v2) into the repo (packages/knowledge-space-core/ or measure/) — file already in-repo at kst-srs.v2/SPECIFICATION.md; co-location deferred to Phase 5 per test-strategy §0.1
    - [x] Reconcile measure/knowledge-space.md into an architecture summary pointing at it
    - [x] Update measure/index.md with the new reference
- [x] Task: Define Knowledge State & Mastery types/schemas (commit e5f8681d)
    - [x] masteryLevel (0–1), four-way state (mastered/decaying/inProgress/untouched)
    - [x] KnowledgeState shape; configurable thresholds module (masteryEnter 0.90, masteryExit 0.70, etc.)
    - [x] Zod schemas + exported TypeScript types in knowledge-space-core
- [x] Task: Define SRS→KST bridge interface/types (commit e5f8681d)
    - [x] Input: SRS card states + ObjectiveProficiencyResult[]; Output: learner state
    - [x] Place interface in a domain-neutral surface (no app/convex imports)
- [x] Task: Define getKnowledgeState / getOuterFringe exported signatures (commit e5f8681d)
    - [x] Time-aware signatures; structured so Track 2 can swap weighted readiness into the fringe
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) deferred:user

### Phase 1 Red Evidence

- **Targeted command:** `CI=true npx vitest run packages/knowledge-space-core`
- **Result:** 6 new test files failed; 22 existing test files passed.
  - New tests: 30 failed / 30 total (mastery-state-contract: 13, knowledge-state-engine-signature: 5, outer-fringe-signature: 4, srs-bridge-contract: 4, boundary-phase1: 1, docs-reconciliation: 3).
  - Existing tests: 302 passed / 302 total.
- **Failure reasons (by file):**
  - `mastery-state-contract.test.ts` — `MASTERY_THRESHOLDS_DEFAULT`, `masteryThresholdsSchema`, and `knowledgeStateEntrySchema` are not exported from `../index`.
  - `knowledge-state-engine-signature.test.ts` — `getKnowledgeState` is not exported as a function.
  - `outer-fringe-signature.test.ts` — `getOuterFringe` is not exported as a function.
  - `srs-bridge-contract.test.ts` — `getKnowledgeState` is missing; `../srs-bridge` module does not exist.
  - `boundary-phase1.test.ts` — Phase 1 module pins (`MASTERY_THRESHOLDS_DEFAULT`, `getKnowledgeState`, `getOuterFringe`) are undefined.
  - `docs-reconciliation.test.ts` — `measure/knowledge-space.md` lacks a canonical pointer to `SPECIFICATION.md`; `measure/index.md` lacks a "Knowledge Space Contract" row; `measure/knowledge-space.md` still contains "source of truth".
- **Lint / type-check:**
  - `npm run ws:im3:lint` → exit 0.
  - `npx tsc --noEmit` (root tsconfig) → exit 0.
  - `npm run --workspace=packages/knowledge-space-core typecheck` (`tsc --noEmit` in package) → exit 1 (expected Red: missing exports for `MASTERY_THRESHOLDS_DEFAULT`, `getKnowledgeState`, `getOuterFringe`, `SrsToKstBridge`, etc.).
- **Attribution:** Red tests authored by `measure-mid-red` at baseline `66e3148f`. Green role target modules are listed in `test-strategy.md` §1.1.

### Phase 1 Green Evidence

- **Implementation summary.** Created four contract-first modules under `packages/knowledge-space-core/src/` (no algorithmic behavior — Phase 2 owns hysteresis/fringe membership):
  - `mastery-state.ts` — `MasteryThresholds` interface, frozen `MASTERY_THRESHOLDS_DEFAULT`, `MasteryState` union (4-way), `KnowledgeStateEntry` interface, `KnowledgeStateEvidence` interface, `masteryThresholdsSchema` (zod `strictObject`, rejects extra keys), `knowledgeStateEntrySchema` (zod, validates 0–1 ranges + enum state). Distinct from the projection `KnowledgeState` (test-strategy §0.2 — no shadowing).
  - `knowledge-state-engine.ts` — `getKnowledgeState(student, evidence, graph, now, thresholds?) : Map<string, KnowledgeStateEntry>` signature stub returning an empty Map. `KnowledgeStateStudentRef` and `KnowledgeStateEvidence` types exported for the cross-module seam.
  - `outer-fringe.ts` — `FringeEntry`, `ReadinessFn` types and standalone `getOuterFringe(state, graph, readinessFn?) : FringeEntry[]` signature stub returning `[]`. Standalone top-level export satisfies FR3.
  - `srs-bridge.ts` — interface-only `SrsToKstBridge` with `buildLearnerState(input, now): LearnerStateOutput`. `SrsBridgeInput` (cards + proficiencyResults), `LearnerStateOutput` (evidence-shaped), and a structural `ObjectiveProficiencyResult` re-declared locally to keep core dependency-free. No concrete `buildLearnerState` value is exported.
  - `index.ts` — re-exports the new symbols.
- **Docs reconciliation** (`measure/knowledge-space.md`, `measure/index.md`) — replaced "source of truth" language with a pointer to `kst-srs.v2/SPECIFICATION.md` and added the "Knowledge Space Contract" row to the reference table.
- **Gate results (all exit 0):**
  - `CI=true npx vitest run packages/knowledge-space-core` → exit 0. **332 / 332 tests pass** (302 existing + 30 new — labeled counts confirmed by per-file test counts: mastery-state-contract 13, knowledge-state-engine-signature 5, outer-fringe-signature 4, srs-bridge-contract 4, boundary-phase1 1, docs-reconciliation 3 = 30 new).
  - `npm run --workspace=packages/knowledge-space-core typecheck` (`tsc --noEmit` in package) → exit 0.
  - `node scripts/check-monorepo-boundaries.mjs` → exit 0.
  - `npm run ws:im3:lint` → exit 0.
  - `npx tsc --noEmit` (repo root) → exit 0.
- **Anti-patterns guarded** (per test-strategy §1.11):
  - **A1** — UMV remains `[b] deferred:user` (structured marker); no substring heuristic relied on.
  - **A3** — `mastery-state-contract.test.ts` asserts threshold defaults via labeled `toEqual({ masteryEnter: 0.9, masteryExit: 0.7, ... })`; not a digit regex.
  - **A4** — every contract test has positive + negative assertions (schema parses valid AND rejects invalid; export exists AND is a function; `MasteryState` exhaustiveness checked).
  - **A5** — every "all checks pass" claim in this block is backed by the exit 0 listed above; nothing claimed that is not in the gate outputs.
  - **A6** — docs reconciliation does not claim the v2 pipeline is "wired" or "resolved"; it asserts only that the **contract** is canonical (`kst-srs.v2/SPECIFICATION.md` is referenced as the source of theoretical authority). The "Current Measure Tracks" footer updates Track 1's status factually (active, contract in repo).
  - **A7** — boundary `boundary-phase1.test.ts` runs grep over all new `.ts` files and asserts zero violations; the live `scripts/check-monorepo-boundaries.mjs` also exits 0.
  - **A11** — `tests/measure_orchestrator_audit.sh` was not touched in this phase; no live-contract regression.
  - **A12** — `measure/automation-supervisor.py` was not edited.
- **Plan task flips `[~] → [x]` with commit SHA** — see commit recorded below.
- **UMV task** (`[b] deferred:user`) preserved per test-strategy §1.10.

## Phase 2 — Knowledge State & Mastery Engine

- [x] Task: Implement getKnowledgeState with hysteresis (TDD)
    - [x] Tests: enter (isProficient && retention≥enter), exit to decaying (<exit), re-enter on recovery, decay over time
    - [x] Implemented pure, deterministic function (commit 6d4b1f3f)
- [x] Task: Implement getOuterFringe (TDD)
    - [x] Tests: fringe membership, time-awareness, binary prerequisite gating
    - [x] Standalone exported function (commit 6d4b1f3f)
- [x] Task: Wire thresholds config + refactor visualization computeNodeState to consume the new engine (TDD)
    - [x] computeNodeState() added to level-projection.ts, delegates to getKnowledgeState (commit 6d4b1f3f)
- [b] Task: Measure - User Manual Verification 'Phase 2' deferred:user

### Phase 2 Red Evidence

- **Targeted command:** `CI=true npx vitest run packages/knowledge-space-core`
- **Result:** 3 new test files added; 15 passed / 28 failed (expected Red against Phase 1 stubs).
  - New test files: `knowledge-state-engine-hysteresis.test.ts`, `outer-fringe-behavior.test.ts`, `compute-node-state.test.ts`.
  - Existing test files (29): all 364 tests passed (unchanged).
- **Failure reasons:** Phase 1 stubs returned empty Map/[]; `stabilityToRetention` missing; `computeNodeState` not exported.
- **Commit:** 09adba23

### Phase 2 Green Evidence

- **Implementation summary:**
  - `stabilityToRetention()` — exponential decay model `retention = exp(-deltaDays / (stability * scale))`, exported for bridge reuse.
  - `determineState()` — pure hysteresis state machine with deep-decay fallback (`masteryExit * 0.5` → inProgress).
  - `getKnowledgeState()` — full engine: evidence matching, retention computation from stability+time, mastery mapping (`retention * (isProficient ? 1.0 : 0.6)`), hysteresis with `previousState` parameter.
  - `getOuterFringe()` — binary prerequisite gating (default) + `readinessFn` seam for weighted readiness.
  - `computeNodeState()` — thin visualization wrapper in `level-projection.ts` delegating to `getKnowledgeState` (defends A4 — no parallel threshold literals).
  - Evidence type extended with `stability`/`lastReviewedAt` (backward-compatible optional fields).
- **Gate results (all exit 0):**
  - `CI=true npx vitest run packages/knowledge-space-core` → 407/407 pass (32 files)
  - `npm run --workspace=packages/knowledge-space-core typecheck` → exit 0
  - `node scripts/check-monorepo-boundaries.mjs` → exit 0
  - `npm run lint --prefix packages/knowledge-space-core` → exit 0
  - `npx tsc --noEmit` → exit 0
- **Lint fixes:** Removed unused imports/variables from test files.
- **Commit:** 6d4b1f3f

### Phase 2 Acceptance Evidence

- **Status:** pass (5ea9334e)
- **Reviews:** A (correctness/purity) ✓, B (no boundary leaks/unsafe mutation) ✓, C (backward-compatible signatures, readinessFn seam intact) ✓

### Phase 2 Adversarial Evidence

- **Status:** pass (19b3000c)
- **Tests:** 35 adversarial tests covering time-travel, rapid cycles, missing data, corrupted input, threshold boundaries, empty/single/multi-node DAGs, 100-iteration determinism, exhaustive determineState(160 combinations), immutability.
- **Full suite:** 442/442 pass (33 test files).



## Phase 3 — SRS→KST Bridge

- [ ] Task: Implement the bridge (TDD)
    - [ ] Convert card states + proficiency results → learner state using stabilityToRetention
    - [ ] Tests for mastered / decaying / inProgress / untouched transitions
- [ ] Task: Synthetic fixture coverage for the full bridge → knowledge-state → fringe path (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Production Wiring (apps/integrated-math-3)

- [ ] Task: Make the IM3 knowledge-space graph loadable at runtime
    - [ ] Load nodes+edges from completed rollout artifacts
    - [ ] Note closed-system validation caveat (lessons-learned 2026-05-10): course-level validation is meaningful only for structural edges
- [ ] Task: Convex query exposing KST learner state for a student
    - [ ] Compose bridge + getKnowledgeState + projection; batch reads with Promise.all (avoid N+1)
- [ ] Task: Wire one IM3 production route to render KST-derived student state
    - [ ] Consume the visualization projection payload (not raw graph)
    - [ ] Add vitest resolve.alias if a new package is introduced (lessons-learned 2026-05-03)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — Docs, Audit & Doctor

- [ ] Task: Update knowledge-space-practice-projection-audit.md from placeholder to wired Math (IM3) status
- [ ] Task: Run architectural lint (`node scripts/check-monorepo-boundaries.mjs`) + per-package `tsc --noEmit`; fix findings (note: `measure/generate.sh`/`doctor.sh` do not exist — use the real boundary linter)
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
