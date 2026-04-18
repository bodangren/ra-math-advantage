# Implementation Plan: Extract Activity Runtime Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-activity-runtime_20260417`.

## Phase 1: Package Extraction

### Tasks

- [x] **Task: Scaffold `packages/activity-runtime`**
  - [x] Create package config/exports/tests.
  - [x] Define public type exports for runtime contracts.
  - [x] Create baseline runtime smoke tests.

- [x] **Task: Extract IM3 runtime modules**
  - [x] Port phase model, mode contracts, activity registry interfaces, and renderer primitives.
  - [x] Preserve API signatures for IM3 call sites.
  - [x] Add tests for exported runtime behavior.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Package Extraction' (Protocol in workflow.md)**

## Phase 2: IM3 Migration

### Tasks

- [x] **Task: Replace runtime imports in IM3**
  - [x] Swap shared runtime imports to package.
  - [x] Keep activity components in IM3 app path.
  - [x] Fix breakages caused by import moves only.

- [x] **Task: Stabilize runtime boundaries**
  - [x] Run boundary guard checks.
  - [x] Confirm no app-specific activity logic leaked into package.
  - [x] Document any temporary adapter shim.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: IM3 Migration' (Protocol in workflow.md)**

## Phase 3: Verification and Handoff

### Tasks

- [ ] **Task: Execute lesson runtime verification**
  - [ ] Run lesson renderer/navigation/component tests.
  - [ ] Run IM3 lint/test/build/typecheck.
  - [ ] Capture known gaps and next-track prerequisites.

- [ ] **Task: Publish extraction notes**
  - [ ] Summarize moved modules and preserved local modules.
  - [ ] Link package public API docs.
  - [ ] Confirm readiness for component-approval extraction.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Verification and Handoff' (Protocol in workflow.md)**
