# Track 1: Wire the KST Pipeline + v2 Mastery Model — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Boundary rule: `knowledge-space-core` / `-practice` stay domain-neutral.

## Phase 1 — Canonical Contract & Schema

- [~] Task: Bring kst-srs.v2 contract into the repo
    - [~] Copy SPECIFICATION.md (kst-srs.v2) into the repo (packages/knowledge-space-core/ or measure/)
    - [~] Reconcile measure/knowledge-space.md into an architecture summary pointing at it
    - [~] Update measure/index.md with the new reference
- [~] Task: Define Knowledge State & Mastery types/schemas
    - [~] masteryLevel (0–1), four-way state (mastered/decaying/inProgress/untouched)
    - [~] KnowledgeState shape; configurable thresholds module (masteryEnter 0.90, masteryExit 0.70, etc.)
    - [~] Zod schemas + exported TypeScript types in knowledge-space-core
- [~] Task: Define SRS→KST bridge interface/types
    - [~] Input: SRS card states + ObjectiveProficiencyResult[]; Output: learner state
    - [~] Place interface in a domain-neutral surface (no app/convex imports)
- [~] Task: Define getKnowledgeState / getOuterFringe exported signatures
    - [~] Time-aware signatures; structured so Track 2 can swap weighted readiness into the fringe
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

## Phase 2 — Knowledge State & Mastery Engine

- [ ] Task: Implement getKnowledgeState with hysteresis (TDD)
    - [ ] Tests: enter (isProficient && retention≥enter), exit to decaying (<exit), re-enter on recovery, decay over time
    - [ ] Implement pure, deterministic function
- [ ] Task: Implement getOuterFringe (TDD)
    - [ ] Tests: fringe membership, time-awareness, binary prerequisite gating
    - [ ] Standalone exported function (not inside the visualization projection)
- [ ] Task: Wire thresholds config + refactor visualization computeNodeState to consume the new engine (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

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
