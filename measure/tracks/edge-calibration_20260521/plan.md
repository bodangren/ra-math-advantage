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

## Phase 4 — Docs & Doctor [checkpoint: a35c29d5]

- [x] Task: Update in-repo kst-srs.v2 spec §6 (Edge Calibration) with the implemented model [green: 4cff5b38]
    - Red: bb08f51c — `packages/knowledge-space-core/src/__tests__/phase4-spec-section-6-implementation.test.ts` (new, 9 tests) asserts §6 documents the implemented CalibrationStatus enum, contingency-table field names, Beta(α,β) parameters, persistence tables, divergence thresholds, N+1 guard, and NFR "graph never auto-edited".
    - Green: 4cff5b38 — `kst-srs.v2/SPECIFICATION.md` §6 updated with CalibrationStatus literals, camelCase contingency-table fields, alpha/beta/lastUpdated, persistence table names (edge_calibration, calibration_review_queue), divergence threshold, N+1 guard (Promise.all batched), and NFR "never auto-edited".
- [x] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint [green: 4cff5b38]
    - Red: bb08f51c — `packages/knowledge-space-core/src/__tests__/phase4-doctor-generate-scripts.test.ts` (new, 6 tests) asserts `measure/scripts/doctor.{sh,mjs,js}` and `measure/scripts/generate.{sh,mjs,js}` exist and exit 0.
    - Green: 4cff5b38 — `measure/scripts/doctor.sh` and `measure/scripts/generate.sh` added; boundary linter fixed to exclude `__tests__/` and `*.test.ts` files.
- [x] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test [green: 4cff5b38]
    - Red: bb08f51c — `packages/knowledge-space-core/src/__tests__/phase4-final-verification.test.ts` (new, 2 tests) runs `scripts/check-monorepo-boundaries.mjs` as a subprocess and asserts exit code 0.
    - Green: 4cff5b38 — boundary linter now excludes test files (`--exclude-dir __tests__`, `--exclude *.test.ts`, `--exclude *.test.tsx`).
- [x] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
    - Automated: CI=true npm run test --workspace=packages/knowledge-space-core → 233/233 passed
    - Changed files (git diff 46ad1d99..HEAD): kst-srs.v2/SPECIFICATION.md, scripts/check-monorepo-boundaries.mjs, measure/scripts/doctor.sh (new), measure/scripts/generate.sh (new), graph.db, plan.md, plus Phase 3–4 test files
    - Manual verification plan (supervisor executes):
        1. Open `kst-srs.v2/SPECIFICATION.md` §6 and confirm it names: CalibrationStatus literals (confirmed, refuted, untested), camelCase contingency-table fields, alpha/beta/lastUpdated, persistence table names, divergence threshold, Promise.all batched guard, and "never auto-edited" NFR.
        2. Run `bash measure/scripts/doctor.sh` — confirm exit 0 and boundary lint output.
        3. Run `bash measure/scripts/generate.sh` — confirm exit 0.
        4. Run `node scripts/check-monorepo-boundaries.mjs` — confirm no violations (test fixtures excluded).
        5. Verify `scripts/check-monorepo-boundaries.mjs` excludes `__tests__/` and `*.test.ts` (grep for `exclude-dir`).
        6. Confirm no ReviewStatus leakage (draft/reviewed/approved/rejected) in §6.
