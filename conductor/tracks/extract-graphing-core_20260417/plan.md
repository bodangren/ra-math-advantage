# Implementation Plan: Extract Graphing Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-graphing-core_20260417`.

## Phase 1: Extract Utility Primitives

### Tasks

- [ ] **Task: Create `packages/graphing-core` scaffold**
  - [ ] Create package config, exports, and tests.
  - [ ] Add parser and coordinate utility exports.
  - [ ] Set up baseline parser tests.

- [ ] **Task: Port IM3 graphing utility modules**
  - [ ] Move linear parser, quadratic parser, and canvas utility logic.
  - [ ] Preserve utility signatures and semantics.
  - [ ] Add regression tests for key parsing/canvas cases.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Extract Utility Primitives' (Protocol in workflow.md)**

## Phase 2: Reconcile Deltas

### Tasks

- [ ] **Task: Diff BM2 graphing utility equivalents**
  - [ ] Classify deltas into required behavior vs domain config.
  - [ ] Merge required utility behavior.
  - [ ] Exclude BM2 exploration config data from package.

- [ ] **Task: Document retained app-local graphing config**
  - [ ] List config files that stay in each app.
  - [ ] Document package integration boundary for configs.
  - [ ] Add notes for BM2 runtime adoption track.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile Deltas' (Protocol in workflow.md)**

## Phase 3: IM3 Migration and Verification

### Tasks

- [ ] **Task: Migrate IM3 utility imports**
  - [ ] Replace IM3 graphing utility imports with package imports.
  - [ ] Keep graphing components in app path.
  - [ ] Fix compile issues due to module moves.

- [ ] **Task: Run graphing verification**
  - [ ] Run graphing utility and component tests.
  - [ ] Run IM3 lint/test/build/typecheck.
  - [ ] Publish final reconciliation summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Migration and Verification' (Protocol in workflow.md)**
