# Implementation Plan: Move BM2 App to apps/bus-math-v2

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `move-bm2-app-to-apps_20260417`.

## Phase 1: Mechanical BM2 Move

### Tasks

- [x] **Task: Move BM2 directories to app path**
  - [x] Move BM2 source and support directories under `apps/bus-math-v2`.
  - [x] Preserve structure and relative paths.
  - [x] Capture before/after directory map.

- [x] **Task: Preserve domain-specific areas**
  - [x] Explicitly retain `lib/practice/engine`, business components, `public/workbooks`, `resources`, `lib/db`, and `lib/supabase`.
  - [x] Verify no files were dropped.
  - [x] Document preserved domain boundaries.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Mechanical BM2 Move' (Protocol in workflow.md)**

## Phase 2: Config and Workflow Updates

### Tasks

- [x] **Task: Update BM2 configs and scripts**
  - [x] Update BM2 tsconfig/framework/test configs for new app path.
  - [x] Update package scripts and helper scripts.
  - [x] Update path aliases and runtime assumptions.

- [x] **Task: Update CI/deploy references**
  - [x] Update workflows to execute BM2 commands from new path.
  - [x] Update deployment command paths.
  - [x] Validate YAML and command correctness.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: Config and Workflow Updates' (Protocol in workflow.md)**

## Phase 3: Cross-App Verification

### Tasks

- [x] **Task: Run BM2 verification suite**
  - [x] Run BM2 lint/test/build/typecheck from app path.
  - [x] Run critical BM2 API route tests.
  - [x] Capture known pre-existing failures if any.

- [x] **Task: Run IM3 regression verification**
  - [x] Run IM3 lint/test/build/typecheck to confirm no collateral breakage.
  - [x] Run root command fanout checks.
  - [x] Publish move completion summary.

- [x] **Task: Conductor - User Manual Verification 'Phase 3: Cross-App Verification' (Protocol in workflow.md)** [checkpoint: 18a7f3c]