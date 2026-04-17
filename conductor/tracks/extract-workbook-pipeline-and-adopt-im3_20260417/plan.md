# Implementation Plan: Extract Workbook Pipeline Package and Adopt in IM3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-workbook-pipeline-and-adopt-im3_20260417`.

## Phase 1: Extract BM2 Workbook Pipeline Primitives

### Tasks

- [ ] **Task: Create `packages/workbook-pipeline`**
  - [ ] Scaffold package and exports.
  - [ ] Port manifest generation/parsing/path resolver/client lookup helpers.
  - [ ] Add package tests for filename parsing and traversal protection.

- [ ] **Task: Define app-local asset integration contract**
  - [ ] Document required asset directory conventions per app.
  - [ ] Document route helper usage patterns.
  - [ ] Document security constraints for download paths.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Extract BM2 Workbook Pipeline Primitives' (Protocol in workflow.md)**

## Phase 2: BM2 Adoption

### Tasks

- [ ] **Task: Migrate BM2 workbook imports**
  - [ ] Replace BM2 workbook pipeline helper imports with package imports.
  - [ ] Keep BM2 workbook files and route wiring local.
  - [ ] Run BM2 workbook route/component tests.

- [ ] **Task: Validate BM2 parity**
  - [ ] Verify manifest generation output parity.
  - [ ] Verify download route behavior parity.
  - [ ] Document any compatibility shim.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: BM2 Adoption' (Protocol in workflow.md)**

## Phase 3: IM3 Adoption and Completion

### Tasks

- [ ] **Task: Implement IM3 workbook system via package**
  - [ ] Update IM3 workbook track implementation to use package helpers.
  - [ ] Keep IM3 workbook assets local.
  - [ ] Add IM3 workbook route/component tests.

- [ ] **Task: Run cross-app verification**
  - [ ] Run workbook-related tests in both apps.
  - [ ] Run both app lint/test/build/typecheck.
  - [ ] Mark IM3 workbook deferred track as completed-by-package path.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Adoption and Completion' (Protocol in workflow.md)**
