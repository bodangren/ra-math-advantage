# Implementation Plan: Monorepo Tooling Shell

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-tooling-shell_20260417`.

## Phase 1: Root Workspace Setup

### Tasks

- [x] **Task: Create root workspace files**
  - [x] Add approved workspace file(s) at root (e.g., `pnpm-workspace.yaml` or npm workspaces).
  - [x] Add root `package.json` script entries for `lint`, `test`, `build`, and `typecheck`.
  - [x] Validate file syntax and command resolution.

- [x] **Task: Create task runner pipeline config**
  - [x] Add task-runner config (e.g., `turbo.json`) if approved in readiness track. **DEFERRED: npm workspaces approved, turbo not approved. Fan-out via `npm run --workspace=<pkg>` CLI flags documented in migration index.**
  - [x] Define dependency order for `build`, `test`, `lint`, and `typecheck`. **Documented via npm workspaces CLI patterns in migration index.**
  - [x] Dry-run root commands and record output.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Root Workspace Setup' (Protocol in workflow.md)** [checkpoint: local]

## Phase 2: Package Template and Guard Scripts

### Tasks

- [x] **Task: Create package template skeleton**
  - [x] Create `packages/_template` with `package.json`, `tsconfig.json`, and `src/index.ts`.
  - [x] Add sample test and lint script placeholders.
  - [x] Document how to copy template for new packages.

- [x] **Task: Wire root helper scripts**
  - [x] Add helper script(s) for running commands in each app path.
  - [x] Ensure scripts fail fast on first package/app error.
  - [x] Document invocation examples in track notes.

- [x] **Task: Conductor - User Manual Verification 'Phase 2: Package Template and Guard Scripts' (Protocol in workflow.md)** [checkpoint: local]

## Phase 3: Baseline Validation

### Tasks

- [x] **Task: Run full IM3 baseline verification**
  - [x] Run `npm run lint`. 35 pre-existing errors (tech-debt #47)
  - [x] Run `npm run test`. ~11 pre-existing failures in equivalence.test.ts (tech-debt #41)
  - [x] Run `npm run build`. PASS
  - [x] Run `npm run typecheck`. Pre-existing type errors in codebase

- [x] **Task: Finalize non-breaking handoff**
  - [x] Confirm no app directories were moved.
  - [x] Capture command outputs and any residual warnings.
  - [x] Publish migration-shell readiness summary.

- [x] **Task: Conductor - User Manual Verification 'Phase 3: Baseline Validation' (Protocol in workflow.md)** [checkpoint: Phase 3 complete]
