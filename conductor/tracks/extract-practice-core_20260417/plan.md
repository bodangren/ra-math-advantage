# Implementation Plan: Extract Practice Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-practice-core_20260417`.

## Phase 1: Scaffold and Extract

### Tasks

- [x] **Task: Create package structure and config**
  - [x] Create `packages/practice-core/src` with package metadata and TS config.
  - [x] Add package scripts for lint/test/build/typecheck.
  - [x] Create `src/index.ts` barrel export.

- [x] **Task: Move canonical IM3 practice primitives**
  - [x] Move/port contract, submission schema, timing, timing baseline, SRS rating, and shared error-analysis modules.
  - [x] Keep module APIs stable.
  - [x] Add package-level unit tests for moved modules.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Scaffold and Extract' (Protocol in workflow.md)**

## Phase 2: Reconcile BM2 Deltas

### Tasks

- [ ] **Task: Diff BM2 common practice files**
  - [ ] Run per-file `diff -u` for shared files.
  - [ ] Classify each delta as required behavior, hardening, domain-specific, or docs-only.
  - [ ] Record decisions in `reconciliation-notes.md`.

- [ ] **Task: Merge required non-domain deltas**
  - [ ] Apply required behavior fixes to package code.
  - [ ] Do not import BM2 domain-specific practice engines.
  - [ ] Update tests to cover merged behavior.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile BM2 Deltas' (Protocol in workflow.md)**

## Phase 3: IM3 Import Migration and Verification

### Tasks

- [ ] **Task: Migrate IM3 imports to package**
  - [ ] Replace `@/lib/practice/*` imports with `@math-platform/practice-core`.
  - [ ] Avoid deep package internals in imports.
  - [ ] Add temporary shims only if strictly needed.

- [ ] **Task: Run verification suite**
  - [ ] Run IM3 `npm run lint`.
  - [ ] Run IM3 `npm run test`.
  - [ ] Run IM3 `npm run build` and `npm run typecheck`.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Import Migration and Verification' (Protocol in workflow.md)**
