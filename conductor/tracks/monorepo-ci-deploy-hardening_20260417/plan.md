# Implementation Plan: Monorepo CI and Deploy Hardening

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-ci-deploy-hardening_20260417`.

## Phase 1: CI Pipeline Matrix [COMPLETE]

### Tasks

- [x] **Task: Define and implement CI matrix**
  - [x] Add package validation jobs.
  - [x] Add per-app lint/test/build/typecheck jobs.
  - [x] Set ordering so package failures block app fanout.

- [x] **Task: Integrate boundary guards**
  - [x] Ensure boundary guard checks run in CI.
  - [x] Fail fast on boundary violations.
  - [x] Include script output in CI logs.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: CI Pipeline Matrix' (Protocol in workflow.md)**

## Phase 2: Deploy and Convex Paths

### Tasks

- [ ] **Task: Update app deploy workflows**
  - [ ] Set working directories to `apps/integrated-math-3` and `apps/bus-math-v2`.
  - [ ] Validate app-specific deploy command paths.
  - [ ] Document environment variable scope per app.

- [ ] **Task: Document Convex operational commands**
  - [ ] List app-specific Convex dev/generate/deploy commands.
  - [ ] Add preflight checks for wrong working directory.
  - [ ] Publish quick-reference ops section.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Deploy and Convex Paths' (Protocol in workflow.md)**

## Phase 3: Reliability Validation

### Tasks

- [ ] **Task: Run end-to-end CI/deploy dry run**
  - [ ] Execute full CI matrix on migration branch.
  - [ ] Run deploy dry-run or staging deploy checks.
  - [ ] Capture timing/flaky step observations.

- [ ] **Task: Finalize hardening report**
  - [ ] Document final pipeline graph and ownership.
  - [ ] List unresolved non-blocking issues as follow-up tasks.
  - [ ] Publish handoff notes for docs/cleanup track.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Reliability Validation' (Protocol in workflow.md)**
