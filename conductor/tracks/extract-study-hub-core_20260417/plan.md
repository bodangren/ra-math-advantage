# Implementation Plan: Extract Study Hub Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-study-hub-core_20260417`.

## Phase 1: Extract Shared Study Primitives

### Tasks

- [ ] **Task: Create `packages/study-hub-core`**
  - [ ] Scaffold package and export surface.
  - [ ] Define shared interfaces for session/mode components.
  - [ ] Add base tests.

- [ ] **Task: Port common study components/helpers**
  - [ ] Extract BaseReviewSession and mode primitives.
  - [ ] Strip app-specific data/persistence coupling.
  - [ ] Add tests for transitions and callbacks.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Extract Shared Study Primitives' (Protocol in workflow.md)**

## Phase 2: Adopt in Both Apps

### Tasks

- [ ] **Task: Integrate in IM3 study routes**
  - [ ] Swap IM3 study primitive imports to package.
  - [ ] Keep IM3 glossary and persistence calls local.
  - [ ] Run IM3 study tests.

- [ ] **Task: Integrate in BM2 study routes**
  - [ ] Swap BM2 study primitive imports to package.
  - [ ] Keep BM2 glossary and persistence local.
  - [ ] Run BM2 study tests.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Adopt in Both Apps' (Protocol in workflow.md)**

## Phase 3: Verification and Cleanup

### Tasks

- [ ] **Task: Run cross-app study verification**
  - [ ] Run study mode tests in both apps.
  - [ ] Run both app lint/test/build/typecheck.
  - [ ] Confirm no UX regressions in state-machine behavior.

- [ ] **Task: Clean duplicate local primitives**
  - [ ] Remove replaced local study primitive modules.
  - [ ] Document package integration patterns.
  - [ ] Publish handoff summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Verification and Cleanup' (Protocol in workflow.md)**
