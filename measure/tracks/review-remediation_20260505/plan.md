# Implementation Plan: Review Remediation — 2026-05-05 Daily Work

## Phase 1: Remove Dead Import [checkpoint: <TBD>]

- [x] **Task 1.1: Remove unused `SeedActivityContent` import from `seed_lesson_standards.ts`**
  - File: `apps/integrated-math-3/convex/seed/seed_lesson_standards.ts`
  - Action: Delete line 2 (`import { SeedActivityContent } from "./types";`) — this file seeds lesson-standard links, not activities.
  - Verify: `npx tsc --noEmit` still passes for IM3 (no new errors).

## Phase 2: Normalize SRS Validator Structure

- [x] **Task 2.1: Refactor IM3 `processReview.ts` inline validator to use `VALID_STATE_TRANSITIONS` constant**
  - File: `apps/integrated-math-3/convex/srs/processReview.ts`
  - Action: Extract inline `validNext` object to module-level `const VALID_STATE_TRANSITIONS` matching the canonical structure in `packages/srs-engine/src/srs/transition-validator.ts`.

- [x] **Task 2.2: Refactor IM3 `reviews.ts` inline validator to use `VALID_STATE_TRANSITIONS` constant**
  - File: `apps/integrated-math-3/convex/srs/reviews.ts`
  - Action: Same as Task 2.1 — extract `validNext` to module-level constant.

- [x] **Task 2.3: Refactor BM2 `srs.ts` inline validator to use `VALID_STATE_TRANSITIONS` constant**
  - File: `apps/bus-math-v2/convex/srs.ts`
  - Action: Same as Task 2.1 — extract `validNext` to module-level constant.

- [x] **Task 2.4: Verify structural parity**
  - Run `diff` between each inline copy's `VALID_STATE_TRANSITIONS` and the canonical one — all four must be identical.
  - Run SRS tests: IM3 259/259 pass, BM2 23/23 pass, srs-engine 108/108 pass.

## Phase 3: Drift Detection Mechanism

- [x] **Task 3.1: Add SRS validator parity test**
  - File: `measure/scripts/check-srs-validator-parity.sh` (new)
  - Action: Write a lightweight CI script that diffs the `VALID_STATE_TRANSITIONS` constant across all four locations (canonical + 3 inline copies) and exits non-zero on mismatch.
  - Verified: script passes on current codebase.

## Phase 4: Backfill Checkpoints

- [x] **Task 4.1: Add checkpoint SHAs to reliability-contracts plan.md**
  - File: `measure/tracks/reliability-contracts_20260504/plan.md`
  - Action: Append `[checkpoint: 76059dd]` to Phase 3 heading and `[checkpoint: a0620916]` to Phase 4 heading (SHAs already recorded in `measure/tracks.md`).

## Phase 5: `as never` Improvement (Optional)

- [x] **Task 5.1: Evaluate replacing `as never` with a named seed helper** — DEFERRED
  - Rationale: `as never` at the seed-to-Convex boundary is a pragmatic bridge between seed-time `Record<string, unknown>` and Convex runtime validation. A named helper would add indirection without changing behavior. Documented in plan for future consideration.

## Phase 6: Final Verification

- [x] **Task 6.1: Verify all acceptance criteria**
  - Dead import removed from `seed_lesson_standards.ts`.
  - All three inline validators use `VALID_STATE_TRANSITIONS` constant.
  - Drift detection script exists at `measure/scripts/check-srs-validator-parity.sh` (passes).
  - Checkpoints backfilled.
  - Tests pass: srs-engine 108/108, practice-core 101/101.
  - Drift parity script: passes (all copies match canonical).
