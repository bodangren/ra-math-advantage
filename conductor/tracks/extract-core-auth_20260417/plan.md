# Implementation Plan: Extract Core Auth Package

## Phase 1: Package Setup and Common File Extraction

### Tasks

- [ ] **Task: Scaffold `packages/core-auth`**
  - [ ] Create package config and export barrel.
  - [ ] Add tests scaffold.
  - [ ] Define package public surface.

- [ ] **Task: Extract common auth primitives**
  - [ ] Port constants/session/password-policy/demo-provisioning common logic.
  - [ ] Preserve existing function signatures where possible.
  - [ ] Add package tests for extracted modules.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Package Setup and Common File Extraction' (Protocol in workflow.md)**

## Phase 2: `server.ts` Reconciliation

### Tasks

- [ ] **Task: Diff and classify `server.ts` deltas**
  - [ ] Classify BM2 revocation logic vs IM3 developer route behavior.
  - [ ] Define package-level configurable APIs.
  - [ ] Document retained vs app-local behavior.

- [ ] **Task: Implement merged guard APIs**
  - [ ] Implement request/server guard helpers with config options.
  - [ ] Add tests for active-session checks and role guards.
  - [ ] Validate non-breaking behavior for IM3 call sites.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: `server.ts` Reconciliation' (Protocol in workflow.md)**

## Phase 3: IM3 Migration and Verification

### Tasks

- [ ] **Task: Migrate IM3 auth imports**
  - [ ] Replace shared helper imports with `@math-platform/core-auth`.
  - [ ] Keep route-level app behavior local.
  - [ ] Remove duplicate local helper files where safe.

- [ ] **Task: Run auth verification suite**
  - [ ] Run auth API route tests.
  - [ ] Run `npm run lint` + `npm run test` + `npm run build` + `npm run typecheck`.
  - [ ] Document any intentionally deferred edge case.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Migration and Verification' (Protocol in workflow.md)**
