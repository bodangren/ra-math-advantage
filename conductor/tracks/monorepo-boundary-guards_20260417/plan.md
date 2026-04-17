# Implementation Plan: Monorepo Boundary Guardrails

## Phase 1: Define Guard Rules

### Tasks

- [ ] **Task: Define forbidden import patterns**
  - [ ] List forbidden path patterns (`apps/`, `convex/_generated`).
  - [ ] List allowed exceptions if absolutely required.
  - [ ] Store rule definitions in script-readable format.

- [ ] **Task: Create local guard script**
  - [ ] Implement check script using `rg` pattern scanning.
  - [ ] Return non-zero exit code on violations.
  - [ ] Print actionable output with file and line context.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Define Guard Rules' (Protocol in workflow.md)**

## Phase 2: CI Integration

### Tasks

- [ ] **Task: Add guard script to CI workflows**
  - [ ] Insert boundary check step before package/app build steps.
  - [ ] Ensure failures stop pipeline early.
  - [ ] Document required command in repo docs.

- [ ] **Task: Validate cross-platform behavior**
  - [ ] Verify script works in local shell and CI shell.
  - [ ] Confirm path normalization handles app and package directories correctly.
  - [ ] Fix any shell portability issues.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: CI Integration' (Protocol in workflow.md)**

## Phase 3: Proof and Handoff

### Tasks

- [ ] **Task: Execute negative and positive tests**
  - [ ] Temporarily add a known-bad import and confirm script fails.
  - [ ] Remove bad import and confirm script passes.
  - [ ] Capture proof in track notes.

- [ ] **Task: Finalize guardrail documentation**
  - [ ] Document common violation patterns and fixes.
  - [ ] Link to script in monorepo docs.
  - [ ] Publish handoff notes for package extraction tracks.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Proof and Handoff' (Protocol in workflow.md)**
