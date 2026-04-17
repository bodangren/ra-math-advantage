# Implementation Plan: Move BM2 App to apps/bus-math-v2

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `move-bm2-app-to-apps_20260417`.

## Phase 1: Mechanical BM2 Move

### Tasks

- [ ] **Task: Move BM2 directories to app path**
  - [ ] Move BM2 source and support directories under `apps/bus-math-v2`.
  - [ ] Preserve structure and relative paths.
  - [ ] Capture before/after directory map.

- [ ] **Task: Preserve domain-specific areas**
  - [ ] Explicitly retain `lib/practice/engine`, business components, `public/workbooks`, `resources`, `lib/db`, and `lib/supabase`.
  - [ ] Verify no files were dropped.
  - [ ] Document preserved domain boundaries.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Mechanical BM2 Move' (Protocol in workflow.md)**

## Phase 2: Config and Workflow Updates

### Tasks

- [ ] **Task: Update BM2 configs and scripts**
  - [ ] Update BM2 tsconfig/framework/test configs for new app path.
  - [ ] Update package scripts and helper scripts.
  - [ ] Update path aliases and runtime assumptions.

- [ ] **Task: Update CI/deploy references**
  - [ ] Update workflows to execute BM2 commands from new path.
  - [ ] Update deployment command paths.
  - [ ] Validate YAML and command correctness.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Config and Workflow Updates' (Protocol in workflow.md)**

## Phase 3: Cross-App Verification

### Tasks

- [ ] **Task: Run BM2 verification suite**
  - [ ] Run BM2 lint/test/build/typecheck from app path.
  - [ ] Run critical BM2 API route tests.
  - [ ] Capture known pre-existing failures if any.

- [ ] **Task: Run IM3 regression verification**
  - [ ] Run IM3 lint/test/build/typecheck to confirm no collateral breakage.
  - [ ] Run root command fanout checks.
  - [ ] Publish move completion summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Cross-App Verification' (Protocol in workflow.md)**
