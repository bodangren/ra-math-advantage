# Implementation Plan: BM2 Consume Runtime Packages

## Phase 1: Activity Runtime Adoption

### Tasks

- [ ] **Task: Replace BM2 runtime primitive imports**
  - [ ] Migrate BM2 runtime contracts/registry/modes imports to package.
  - [ ] Keep concrete activity components local.
  - [ ] Run runtime component tests.

- [ ] **Task: Stabilize runtime adapters**
  - [ ] Add/adjust app-local adapters for package interfaces.
  - [ ] Resolve typing mismatches.
  - [ ] Document adapter boundaries.

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Activity Runtime Adoption' (Protocol in workflow.md)**

## Phase 2: Component Approval Adoption

### Tasks

- [ ] **Task: Migrate approval primitive imports**
  - [ ] Replace BM2 approval primitive imports with package imports.
  - [ ] Keep route-level auth and page wiring local.
  - [ ] Run approval tests.

- [ ] **Task: Verify hash/queue compatibility**
  - [ ] Validate deterministic hashing parity on sample fixtures.
  - [ ] Validate queue/harness gating behavior.
  - [ ] Record any residual incompatibilities.

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Component Approval Adoption' (Protocol in workflow.md)**

## Phase 3: Graphing Core Adoption and Verification

### Tasks

- [ ] **Task: Adopt graphing-core utility imports**
  - [ ] Migrate parser/canvas utility imports where compatible.
  - [ ] Retain BM2 exploration configs local.
  - [ ] Run graphing tests.

- [ ] **Task: Run full BM2 verification**
  - [ ] Run BM2 lint/test/build/typecheck.
  - [ ] Run root multi-app checks.
  - [ ] Publish runtime package adoption summary.

- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Graphing Core Adoption and Verification' (Protocol in workflow.md)**
