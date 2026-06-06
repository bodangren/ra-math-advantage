# Track 3: Edge Calibration Loop — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (proficiency verdicts, knowledge state).

## Phase 1 — Contract & Schema [checkpoint: 592b074b]

- [x] Task: Define calibration types [red: 5c5974d0, b43c504c, 391add96] [green: 293394c2]
    - [x] Observation type (paired proficiency verdicts), contingency table, edge calibration record (α, β, status)
    - [x] necessity / informativeness result types; calibration status enum (confirmed / refuted / untested)
- [x] Task: Define Convex schema for calibration state and review queue [red: 5c5974d0, 391add96] [green: 293394c2]
    - [x] edge_calibration table (α, β, lastUpdated, status); calibration_review_queue table
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)
    - Automated: CI=true npm run test → 216/216 passed
    - Changed files: edge-calibration.ts (new), index.ts (exports), schema.ts (2 tables), graph.db
    - Manual: types and schema match spec FR1–FR7; CalibrationStatus disjoint from ReviewStatus

## Phase 2 — Calibration Core [checkpoint: 46ad1d99]

- [x] Task: Implement observation extraction (TDD) [green: e44a459f]
    - [x] Pair per-student objective-proficiency verdicts into (A, B) observations [green: e44a459f]
- [x] Task: Implement contingency table + necessity + informativeness (TDD) [green: e44a459f]
- [x] Task: Implement Beta-Bernoulli posterior update + recency decay (TDD) [green: e44a459f]
    - [x] Incremental α/β update; posterior mean → weight; variance → confidence; λ decay [green: e44a459f]
- [x] Task: Implement confounding guardrail and untested classification (TDD) [green: e44a459f]
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)
    - Automated: CI=true npx vitest run packages/srs-engine/ → 191/191 passed (83 edge-calibration + 108 existing)
    - Changed files: edge-calibration.ts (+10 functions), edge-calibration-contingency.test.ts, edge-calibration-posterior.test.ts, graph.db
    - Manual: all Phase 2 functions match spec FR1–FR5; classifyStatus enforces confounding guardrail with paired-obs requirement; necessity = P(profB | !A); informativeness = lift with NaN-free sentinels; decay preserves mean ratio

## Phase 3 — Review Queue and Persistence

- [x] Task: Implement calibration review-queue builder (TDD) [red: c500715c] [green: e950292e]
    - [x] Flag edges diverging from authored weight/confidence beyond threshold; attach contingency table
- [x] Task: Implement Convex persistence adapter for calibration state + queue (TDD) [red: d63cf3ba] [green: 06199b87]
    - [x] Batch reads/writes with Promise.all (avoid N+1)
    - Red: d63cf3ba — `apps/integrated-math-3/__tests__/convex/edgeCalibration.test.ts` (9 tests) fails to load: `@/convex/edgeCalibration` not yet implemented.
    - Green: 06199b87 — `apps/integrated-math-3/convex/edgeCalibration.ts` (new), `packages/srs-engine/src/index.ts` (+10 exports)
- [x] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
    - Automated: CI=true npx vitest run __tests__/convex/ → 92/92 files passed (1206/1206 tests)
    - Automated: CI=true npx vitest run packages/srs-engine/ → 15/15 files passed (211/211 tests)
    - Changed files: edgeCalibration.ts (new Convex adapter), srs-engine/src/index.ts (+10 exports), graph.db
    - Manual: N+1 guard verified (single batched read + single Promise.all); only touches edge_calibration + calibration_review_queue; divergence thresholds (0.5 weight, 1.5 confidence) match test fixtures; untested edges excluded from queue

## Phase 4 — Docs & Doctor

- [~] Task: Update in-repo kst-srs.v2 spec §6 (Edge Calibration) with the implemented model
    - Red: pending mid-role handoff — `packages/knowledge-space-core/src/__tests__/phase4-spec-section-6-implementation.test.ts` (new) asserts §6 documents the implemented CalibrationStatus enum, contingency-table field names, Beta(α,β) parameters, persistence tables, divergence thresholds, N+1 guard, and NFR "graph never auto-edited". Currently fails: §6 has the high-level FR1–FR6 narrative but is missing the implementation-level details.
- [~] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
    - Red: pending mid-role handoff — `packages/knowledge-space-core/src/__tests__/phase4-doctor-generate-scripts.test.ts` (new) asserts `measure/scripts/doctor.{sh,mjs}` and `measure/scripts/generate.{sh,mjs}` exist and exit 0. Currently fails: neither script is present in `measure/scripts/`.
- [~] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
    - Red: pending mid-role handoff — `packages/knowledge-space-core/src/__tests__/phase4-final-verification.test.ts` (new) runs `scripts/check-monorepo-boundaries.mjs` as a subprocess and asserts exit code 0 (boundary lint must be green). Currently fails: the boundary linter flags false positives in existing test fixtures (e.g. `packages/knowledge-space-core/src/__tests__/boundary.test.ts:89` contains the `apps/` fixture pattern as a string literal). Phase 4 Green must either scope the linter to source-only or add a `--exclude-tests` flag.
- [~] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
    - No automated test; manual protocol per `measure/workflow.md` §Phase Completion Verification. Mid-role writes the proposed manual verification plan and the user (supervisor) executes it.
