# Implementation Plan: Extract SRS Engine Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-srs-engine_20260417`.

## Phase 1: Scaffold and Extract [COMPLETE] [checkpoint: b586849]

### Tasks

- [x] **Task: Create `packages/srs-engine` structure**
  - [x] Add package config/scripts/tsconfig.
  - [x] Create barrel exports.
  - [x] Add baseline tests.

- [x] **Task: Move canonical IM3 SRS modules**
  - [x] Port contract/scheduler/review-processor/queue/adapters/integration docs.
  - [x] Preserve public API signatures.
  - [x] Add tests for all public exports.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Scaffold and Extract' (Protocol in workflow.md)**

## Phase 2: Reconcile and Harden [COMPLETE]

### Tasks

- [x] **Task: Diff BM2 overlapping SRS modules**
  - [x] Diff shared files and classify deltas.
  - [x] Identify must-keep behavior/hardening changes.
  - [x] Document excluded domain-specific deltas.

- [x] **Task: Merge required deltas and retest**
  - [x] Apply required changes to package code.
  - [x] Update tests for merged behavior.
  - [x] Confirm no backend-specific assumptions were introduced.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile and Harden' (Protocol in workflow.md)**

## Phase 3: IM3 Migration and Validation [COMPLETE]

### Tasks

- [x] **Task: Replace IM3 SRS imports**
  - [x] Swap `@/lib/srs/*` imports to `@math-platform/srs-engine`.
  - [x] Keep Convex store adapters local.
  - [x] Fix compile errors from import boundary changes.

- [x] **Task: Run SRS-focused verification**
  - [x] Run queue/session/scheduler tests.
  - [x] Run IM3 `npm run lint` and `npm run test`.
  - [x] Run IM3 `npm run build` and `npm run typecheck`.

- [x] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Migration and Validation' (Protocol in workflow.md)**
