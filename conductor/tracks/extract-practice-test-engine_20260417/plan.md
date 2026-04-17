# Implementation Plan: Extract Practice Test Engine Package

## Phase 1: Package Extraction

### Tasks

- [ ] **Task: Create `packages/practice-test-engine` scaffold**
  - [ ] Create package config and exports.
  - [ ] Define runner contracts and score models.
  - [ ] Add baseline engine tests.

- [ ] **Task: Port generic engine modules**
  - [ ] Extract reusable runner/selection logic from IM3/BM2.
  - [ ] Remove course-specific references.
  - [ ] Add regression tests for state transitions and scoring.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Package Extraction' (Protocol in workflow.md)**

## Phase 2: App Adoption

### Tasks

- [ ] **Task: Adopt package in IM3**
  - [ ] Replace IM3 test engine component imports.
  - [ ] Keep IM3 question bank modules local.
  - [ ] Fix integration compile errors.

- [ ] **Task: Adopt package in BM2**
  - [ ] Replace BM2 test engine imports.
  - [ ] Keep BM2 question bank modules local.
  - [ ] Fix integration compile errors.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: App Adoption' (Protocol in workflow.md)**

## Phase 3: Verification and Cleanup

### Tasks

- [ ] **Task: Run practice test verification**
  - [ ] Run practice test component/unit tests in both apps.
  - [ ] Run both app lint/test/build/typecheck commands.
  - [ ] Capture behavior parity checklist.

- [ ] **Task: Prune duplicate local engine code**
  - [ ] Remove replaced local modules where safe.
  - [ ] Keep temporary shims only if needed.
  - [ ] Document final package API usage.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Verification and Cleanup' (Protocol in workflow.md)**
