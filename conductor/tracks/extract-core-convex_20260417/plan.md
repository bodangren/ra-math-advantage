# Implementation Plan: Extract Core Convex Package

## Phase 1: Extract Shared Convex Wrappers

### Tasks

- [ ] **Task: Create `packages/core-convex`**
  - [ ] Scaffold package files and exports.
  - [ ] Add config/admin helper modules.
  - [ ] Add tests for env resolution and auth setup.

- [ ] **Task: Port server wrapper logic**
  - [ ] Implement generic server query/mutation wrappers.
  - [ ] Keep error messages/parity with existing IM3 usage.
  - [ ] Exclude BM2-specific Supabase resolver code.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Extract Shared Convex Wrappers' (Protocol in workflow.md)**

## Phase 2: Adapter API for Generated Modules

### Tasks

- [ ] **Task: Implement app adapter/factory pattern**
  - [ ] Create factory that accepts app `api/internal` references.
  - [ ] Refactor wrappers to consume injected refs.
  - [ ] Add tests proving no direct generated import in package.

- [ ] **Task: Document integration contract**
  - [ ] Document required adapter wiring in each app.
  - [ ] Provide code examples in package README or docs.
  - [ ] List anti-patterns (direct generated import in package).

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Adapter API for Generated Modules' (Protocol in workflow.md)**

## Phase 3: IM3 Adoption and Verification

### Tasks

- [ ] **Task: Migrate IM3 imports**
  - [ ] Replace `@/lib/convex/*` wrapper imports with package imports.
  - [ ] Wire adapter factory in IM3 app boundary.
  - [ ] Remove redundant local wrappers as safe.

- [ ] **Task: Run verification suite**
  - [ ] Run server query/mutation route tests.
  - [ ] Run IM3 lint/test/build/typecheck.
  - [ ] Record migration notes and deferred cleanup items.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Adoption and Verification' (Protocol in workflow.md)**
