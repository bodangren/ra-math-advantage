# Implementation Plan: Move IM3 App to apps/integrated-math-3

## Phase 1: Mechanical Move

### Tasks

- [ ] **Task: Move IM3 source folders into app path**
  - [ ] Move `app`, `components`, `convex`, `lib`, `curriculum`, `public`, `scripts`, and `__tests__` into `apps/integrated-math-3`.
  - [ ] Preserve relative structure exactly.
  - [ ] Record before/after tree snapshot for review.

- [ ] **Task: Update local config paths**
  - [ ] Update `tsconfig` includes/excludes and path aliases.
  - [ ] Update framework and test config file roots.
  - [ ] Update package scripts to run from app path.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Mechanical Move' (Protocol in workflow.md)**

## Phase 2: CI and Tooling Path Fixes

### Tasks

- [ ] **Task: Update CI workflow path assumptions**
  - [ ] Update workflow commands to execute in `apps/integrated-math-3`.
  - [ ] Update any artifact path references in CI.
  - [ ] Validate workflow YAML syntax.

- [ ] **Task: Update Convex and deployment scripts**
  - [ ] Update Convex dev/build helper scripts for app path.
  - [ ] Update deployment config if it references old root paths.
  - [ ] Document required working directory for each operational command.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: CI and Tooling Path Fixes' (Protocol in workflow.md)**

## Phase 3: Post-Move Validation

### Tasks

- [ ] **Task: Run full IM3 verification suite from new path**
  - [ ] Run `npm run lint` from `apps/integrated-math-3`.
  - [ ] Run `npm run test` from `apps/integrated-math-3`.
  - [ ] Run `npm run build` and `npm run typecheck` from `apps/integrated-math-3`.

- [ ] **Task: Audit for stale old-root references**
  - [ ] Search for stale `@/` and absolute-root assumptions.
  - [ ] Fix remaining path issues only; no unrelated refactors.
  - [ ] Publish post-move checklist and known follow-ups.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Post-Move Validation' (Protocol in workflow.md)**
