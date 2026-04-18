# Implementation Plan: Monorepo Boundary Guardrails

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-boundary-guards_20260417`.

## Phase 1: Define Guard Rules

### Tasks

- [x] **Task: Define forbidden import patterns**
  - [x] List forbidden path patterns (`apps/`, `convex/_generated`).
  - [x] List allowed exceptions if absolutely required.
  - [x] Store rule definitions in script-readable format.

- [x] **Task: Create local guard script**
  - [x] Implement check script using grep pattern scanning.
  - [x] Return non-zero exit code on violations.
  - [x] Print actionable output with file and line context.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Define Guard Rules' (Protocol in workflow.md)**

## Phase 2: CI Integration

### Tasks

- [x] **Task: Add guard script to CI workflows**
  - [x] Insert boundary check step before package/app build steps.
  - [x] Ensure failures stop pipeline early.
  - [x] Document required command in repo docs.

- [x] **Task: Validate cross-platform behavior**
  - [x] Verify script works in local shell and CI shell.
  - [x] Confirm path normalization handles app and package directories correctly.
  - [x] Fix any shell portability issues.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: CI Integration' (Protocol in workflow.md)**

## Phase 3: Proof and Handoff

### Tasks

- [x] **Task: Execute negative and positive tests**
  - [x] Temporarily add a known-bad import and confirm script fails.
  - [x] Remove bad import and confirm script passes.
  - [x] Capture proof in track notes.

- [x] **Task: Finalize guardrail documentation**
  - [x] Document common violation patterns and fixes.
  - [x] Link to script in monorepo docs.
  - [x] Publish handoff notes for package extraction tracks.

- [x] **Task: Conductor - User Manual Verification 'Phase 3: Proof and Handoff' (Protocol in workflow.md)**
