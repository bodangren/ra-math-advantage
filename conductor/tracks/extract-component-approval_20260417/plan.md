# Implementation Plan: Extract Component Approval Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-component-approval_20260417`.

## Phase 1: Extract Core Primitives

### Tasks

- [x] **Task: Scaffold `packages/component-approval`**
  - [x] Create package skeleton and export barrel.
  - [x] Add tests scaffold for hash and queue contracts.
  - [x] Define package API boundaries.

- [x] **Task: Port IM3 approval core modules**
  - [x] Move content hash/component ID/review queue contract modules.
  - [x] Move harness gating primitives.
  - [x] Add package tests for deterministic behavior.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Extract Core Primitives' (Protocol in workflow.md)**

## Phase 2: Reconcile and Integrate

### Tasks

- [ ] **Task: Reconcile BM2 hardening deltas**
  - [ ] Diff BM2 approval helper deltas.
  - [ ] Merge generic hardening improvements only.
  - [ ] Keep app-specific route code local.

- [ ] **Task: Migrate IM3 imports**
  - [ ] Replace IM3 approval primitive imports with package imports.
  - [ ] Keep API routes and page wiring in app.
  - [ ] Resolve compile/test breakages from import changes.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile and Integrate' (Protocol in workflow.md)**

## Phase 3: Verification

### Tasks

- [ ] **Task: Run approval verification suite**
  - [ ] Run IM3 review harness tests.
  - [ ] Run related convex approval tests.
  - [ ] Run IM3 lint/test/build/typecheck.

- [ ] **Task: Finalize package handoff**
  - [ ] Document package API and retained app-local modules.
  - [ ] Document adoption notes for BM2 runtime track.
  - [ ] Close with summary and risk notes.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md)**
