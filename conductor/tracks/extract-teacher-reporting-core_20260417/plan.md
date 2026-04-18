# Implementation Plan: Extract Teacher Reporting Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-teacher-reporting-core_20260417`.

## Phase 1: Pure Logic Extraction

### Tasks

- [x] **Task: Create `packages/teacher-reporting-core`**
  - [x] Scaffold package and exports.
  - [x] Define reporting helper interfaces.
  - [x] Add baseline helper tests.

- [x] **Task: Extract gradebook/overview/heatmap pure helpers**
  - [x] Port pure helper functions and transformers.
  - [x] Strip backend or app routing assumptions.
  - [x] Add regression tests for helper outputs.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Pure Logic Extraction' (Protocol in workflow.md)****

## Phase 2: UI Primitive Extraction

### Tasks

- [ ] **Task: Extract reusable reporting UI primitives**
  - [ ] Port reusable table/grid primitives that are domain-neutral.
  - [ ] Parameterize labels/columns where needed.
  - [ ] Add component tests for generic rendering behavior.

- [ ] **Task: Keep app-specific query/render layers local**
  - [ ] Retain query calls and route-specific wiring in each app.
  - [ ] Introduce adapter layers for package inputs.
  - [ ] Document boundaries in notes.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: UI Primitive Extraction' (Protocol in workflow.md)**

## Phase 3: Adoption and Verification

### Tasks

- [ ] **Task: Adopt package in IM3 and BM2**
  - [ ] Replace shared reporting helper imports in both apps.
  - [ ] Keep app query handlers local.
  - [ ] Fix type mismatches.

- [ ] **Task: Run reporting verification**
  - [ ] Run reporting unit/component tests in both apps.
  - [ ] Run full lint/test/build/typecheck in both apps.
  - [ ] Publish parity and residual-risk summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Adoption and Verification' (Protocol in workflow.md)**
