# Implementation Plan: Extract SRS Engine Package

## Phase 1: Scaffold and Extract

### Tasks

- [ ] **Task: Create `packages/srs-engine` structure**
  - [ ] Add package config/scripts/tsconfig.
  - [ ] Create barrel exports.
  - [ ] Add baseline tests.

- [ ] **Task: Move canonical IM3 SRS modules**
  - [ ] Port contract/scheduler/review-processor/queue/adapters/integration docs.
  - [ ] Preserve public API signatures.
  - [ ] Add tests for all public exports.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Scaffold and Extract' (Protocol in workflow.md)**

## Phase 2: Reconcile and Harden

### Tasks

- [ ] **Task: Diff BM2 overlapping SRS modules**
  - [ ] Diff shared files and classify deltas.
  - [ ] Identify must-keep behavior/hardening changes.
  - [ ] Document excluded domain-specific deltas.

- [ ] **Task: Merge required deltas and retest**
  - [ ] Apply required changes to package code.
  - [ ] Update tests for merged behavior.
  - [ ] Confirm no backend-specific assumptions were introduced.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile and Harden' (Protocol in workflow.md)**

## Phase 3: IM3 Migration and Validation

### Tasks

- [ ] **Task: Replace IM3 SRS imports**
  - [ ] Swap `@/lib/srs/*` imports to `@math-platform/srs-engine`.
  - [ ] Keep Convex store adapters local.
  - [ ] Fix compile errors from import boundary changes.

- [ ] **Task: Run SRS-focused verification**
  - [ ] Run queue/session/scheduler tests.
  - [ ] Run IM3 `npm run lint` and `npm run test`.
  - [ ] Run IM3 `npm run build` and `npm run typecheck`.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Migration and Validation' (Protocol in workflow.md)**
