# Implementation Plan: BM2 Consume Core Packages

## Phase 1: Practice and SRS Adoption

### Tasks

- [ ] **Task: Migrate BM2 practice imports**
  - [ ] Replace BM2 practice primitive imports with `@math-platform/practice-core`.
  - [ ] Resolve compile/test breakages.
  - [ ] Keep `lib/practice/engine` local and untouched.

- [ ] **Task: Migrate BM2 SRS imports**
  - [ ] Replace BM2 SRS engine imports with `@math-platform/srs-engine`.
  - [ ] Preserve BM2-only analytics/answer input mappings locally if not yet packaged.
  - [ ] Run SRS-focused tests.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Practice and SRS Adoption' (Protocol in workflow.md)**

## Phase 2: Auth and Convex Adoption

### Tasks

- [ ] **Task: Migrate BM2 auth imports**
  - [ ] Replace shared auth helper imports with `@math-platform/core-auth`.
  - [ ] Validate session revocation and role guard behavior.
  - [ ] Run auth route tests.

- [ ] **Task: Migrate BM2 Convex wrapper imports**
  - [ ] Replace shared convex wrapper imports with `@math-platform/core-convex`.
  - [ ] Keep Supabase compatibility helpers app-local.
  - [ ] Run API route and wrapper tests.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Auth and Convex Adoption' (Protocol in workflow.md)**

## Phase 3: Cleanup and Verification

### Tasks

- [ ] **Task: Prune duplicate local core modules**
  - [ ] Delete or deprecate duplicated local modules replaced by packages.
  - [ ] Keep temporary shims only if required and documented.
  - [ ] Update docs/import examples.

- [ ] **Task: Run full BM2 verification**
  - [ ] Run BM2 lint/test/build/typecheck.
  - [ ] Run root multi-app command checks.
  - [ ] Publish adoption completion report.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Cleanup and Verification' (Protocol in workflow.md)**
