# Implementation Plan: Monorepo Docs and Cleanup

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-docs-and-cleanup_20260417`.

## Phase 1: Author Final Documentation

### Tasks

- [ ] **Task: Write root integration documentation**
  - [ ] Create/finish `INTEGRATION.md` with package creation/adoption flow.
  - [ ] Document app-specific deploy/Convex commands.
  - [ ] Document boundary rules and review checklist.

- [ ] **Task: Write package authoring template docs**
  - [ ] Document required file layout for new packages.
  - [ ] Provide import/export conventions.
  - [ ] Provide testing requirements per package change.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Author Final Documentation' (Protocol in workflow.md)**

## Phase 2: Remove Migration Residue

### Tasks

- [ ] **Task: Remove temporary shims and deprecated paths**
  - [ ] Find and remove temporary compatibility shims.
  - [ ] Replace stale old-root path references in code/docs/scripts.
  - [ ] Run search checks for stale patterns.

- [ ] **Task: Finalize ownership mapping**
  - [ ] Create clear map of package-owned vs app-owned modules.
  - [ ] Document BM2 domain modules that must remain local.
  - [ ] Link ownership map from monorepo docs.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Remove Migration Residue' (Protocol in workflow.md)**

## Phase 3: Final Validation and Handoff

### Tasks

- [ ] **Task: Run final cross-repo verification**
  - [ ] Run both app lint/test/build/typecheck.
  - [ ] Run root CI command fanout locally.
  - [ ] Confirm boundary guards and docs references pass checks.

- [ ] **Task: Publish final migration closeout**
  - [ ] Summarize delivered tracks and remaining known issues.
  - [ ] Link all monorepo track artifacts.
  - [ ] Mark migration program complete in tracks registry.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Final Validation and Handoff' (Protocol in workflow.md)**
