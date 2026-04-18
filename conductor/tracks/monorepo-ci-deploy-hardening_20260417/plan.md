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

- [x] **Task: Update app deploy workflows**
  - [x] Set working directories to `apps/integrated-math-3` and `apps/bus-math-v2`.
  - [x] Validate app-specific deploy command paths.
  - [x] Document environment variable scope per app.

- [x] **Task: Document Convex operational commands**
  - [x] List app-specific Convex dev/generate/deploy commands.
  - [x] Add preflight checks for wrong working directory.
  - [x] Publish quick-reference ops section.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: Deploy and Convex Paths' (Protocol in workflow.md)**

## Phase 3: Reliability Validation

### Tasks

- [x] **Task: Run end-to-end CI/deploy dry run**
  - [x] Execute full CI matrix on migration branch.
  - [x] Run deploy dry-run or staging deploy checks.
  - [x] Capture timing/flaky step observations.

- [x] **Task: Finalize hardening report**
  - [x] Document final pipeline graph and ownership.
  - [x] List unresolved non-blocking issues as follow-up tasks.
  - [x] Publish handoff notes for docs/cleanup track.

- [x] **Task: Conductor - User Manual Verification 'Phase 3: Reliability Validation' (Protocol in workflow.md)**
