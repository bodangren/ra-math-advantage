# Implementation Plan: Move IM3 App to apps/integrated-math-3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `move-im3-app-to-apps_20260417`.

## Phase 1: Mechanical Move

### Tasks

- [x] **Task: Move IM3 source folders into app path** - COMPLETED (fc83018)
  - [x] Move `app`, `components`, `convex`, `lib`, `curriculum`, `public`, `scripts`, and `__tests__` into `apps/integrated-math-3`.
  - [x] Preserve relative structure exactly.
  - [x] Record before/after tree snapshot for review.

- [x] **Task: Update local config paths** - COMPLETED (fc83018)
  - [x] Update `tsconfig` includes/excludes and path aliases.
  - [x] Update framework and test config file roots.
  - [x] Update package scripts to run from app path.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Mechanical Move' (Protocol in workflow.md)** - COMPLETED

## Phase 2: CI and Tooling Path Fixes

### Tasks

- [x] **Task: Update CI workflow path assumptions**
  - [x] Update workflow commands to execute in `apps/integrated-math-3`.
  - [x] Update any artifact path references in CI.
  - [x] Validate workflow YAML syntax.

- [x] **Task: Update Convex and deployment scripts**
  - [x] Update Convex dev/build helper scripts for app path.
  - [x] Update deployment config if it references old root paths.
  - [x] Document required working directory for each operational command.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: CI and Tooling Path Fixes' (Protocol in workflow.md)**

## Phase 3: Post-Move Validation

### Tasks

- [x] **Task: Run full IM3 verification suite from new path** (2026-04-18)
  - [x] Run `npm run lint` from `apps/integrated-math-3` - PASS
  - [x] Run `npm run test` from `apps/integrated-math-3` - 10 failures (pre-existing per tech-debt)
  - [x] Run `npm run build` and `npm run typecheck` from `apps/integrated-math-3` - PASS

- [x] **Task: Audit for stale old-root references** (2026-04-18)
  - [x] Search for stale `@/` and absolute-root assumptions - None found
  - [x] Root package.json correctly configured with npm workspaces
  - [x] No stale path references in apps/integrated-math-3

- [x] **Task: Conductor - User Manual Verification 'Phase 3: Post-Move Validation' (Protocol in workflow.md)** (2026-04-18)
