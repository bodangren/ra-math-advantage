# Implementation Plan: Monorepo Tooling Shell

## Phase 1: Root Workspace Setup

### Tasks

- [ ] **Task: Create root workspace files**
  - [ ] Add approved workspace file(s) at root (e.g., `pnpm-workspace.yaml` or npm workspaces).
  - [ ] Add root `package.json` script entries for `lint`, `test`, `build`, and `typecheck`.
  - [ ] Validate file syntax and command resolution.

- [ ] **Task: Create task runner pipeline config**
  - [ ] Add task-runner config (e.g., `turbo.json`) if approved in readiness track.
  - [ ] Define dependency order for `build`, `test`, `lint`, and `typecheck`.
  - [ ] Dry-run root commands and record output.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Root Workspace Setup' (Protocol in workflow.md)**

## Phase 2: Package Template and Guard Scripts

### Tasks

- [ ] **Task: Create package template skeleton**
  - [ ] Create `packages/_template` with `package.json`, `tsconfig.json`, and `src/index.ts`.
  - [ ] Add sample test and lint script placeholders.
  - [ ] Document how to copy template for new packages.

- [ ] **Task: Wire root helper scripts**
  - [ ] Add helper script(s) for running commands in each app path.
  - [ ] Ensure scripts fail fast on first package/app error.
  - [ ] Document invocation examples in track notes.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Package Template and Guard Scripts' (Protocol in workflow.md)**

## Phase 3: Baseline Validation

### Tasks

- [ ] **Task: Run full IM3 baseline verification**
  - [ ] Run `npm run lint`.
  - [ ] Run `npm run test`.
  - [ ] Run `npm run build`.
  - [ ] Run `npm run typecheck`.

- [ ] **Task: Finalize non-breaking handoff**
  - [ ] Confirm no app directories were moved.
  - [ ] Capture command outputs and any residual warnings.
  - [ ] Publish migration-shell readiness summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Baseline Validation' (Protocol in workflow.md)**
