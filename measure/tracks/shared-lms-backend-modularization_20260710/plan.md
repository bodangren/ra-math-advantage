# Implementation Plan: Shared LMS Backend Modularization

**Dependency:** `monorepo-architecture-contracts_20260710`  
**Default shape:** normal shared package plus app-owned Convex adapters; packaged components only for isolated persistence  
**Workflow:** strict contract-first TDD; incremental app migration

## Accepted Architecture Debt

This track owns removal or reconciliation of the exact, expiring
`debt.math-content-undeclared` record.

## Phase 1: Contract, Schema, and Boundary Definition

- [ ] Task: Inventory common LMS tables, handlers, and app policy seams
    - [ ] Compare schema/handler behavior across all five apps
    - [ ] Classify common, configurable, domain-specific, and app-only surfaces
- [ ] Task: Define the shared LMS contract package
    - [ ] Define roles, DTOs, validators, table fragments, index names, and errors
    - [ ] Define pure service inputs/outputs without generated Convex types
- [ ] Task: Decide component versus library boundaries
    - [ ] Evaluate table ownership, app-ID crossings, auth/env needs, and query composition
    - [ ] Record an ADR for each candidate; default core LMS tables to app-owned composition
    - [ ] For any packaged component, define tables, public API, wrappers, exports, and example app
- [ ] Task: Define per-app composition and migration contracts
    - [ ] Specify schema assembly, adapter interfaces, configuration, and compatibility guarantees
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract, Schema, and Boundary Definition' (Protocol in workflow.md)

## Phase 2: Behavioral, Schema, and Component Tests

- [ ] Task: Test shared schema fragments and contract validation
    - [ ] Verify required fields, unions, index naming, DTO round-trips, and invalid inputs
    - [ ] Compare composed schemas with existing app contracts
- [ ] Task: Test shared pure LMS services
    - [ ] Cover auth-independent credential/profile, enrollment, lesson, progress, and submission behavior
    - [ ] Exercise error and concurrency-sensitive cases
- [ ] Task: Test app-owned Convex adapters and authorization
    - [ ] Use behavioral Convex tests with real function execution and observable outputs
    - [ ] Verify auth is server-derived and queries remain indexed and bounded
- [ ] Task: If a packaged component is approved, test package and example consumption
    - [ ] Register component schema/modules with `convex-test`
    - [ ] Test app wrappers, string ID boundaries, args/returns validators, codegen, and package exports
- [ ] Task: Measure - User Manual Verification 'Phase 2: Behavioral, Schema, and Component Tests' (Protocol in workflow.md)

## Phase 3: Implementation and Incremental Adoption

- [ ] Task: Implement the shared LMS contract and pure-service package
- [ ] Task: Implement schema composition and thin app adapter utilities
- [ ] Task: Reconcile the accepted math-content dependency in the package manifest
- [ ] Task: Implement any approved isolated packaged component and authenticated app wrappers
- [ ] Task: Migrate IM3 and BM2 common backend behavior to the shared surfaces
- [ ] Task: Migrate IM1, IM2, and Precalculus scaffolds without changing course policy
- [ ] Task: Remove superseded duplicate behavior and verify stored-data compatibility
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation and Incremental Adoption' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Cross-App Gate

- [ ] Task: Regenerate architecture, schema ownership, and component documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Document app wrappers, configuration seams, and component installation/build order
- [ ] Task: Run package and all-app quality gates
    - [ ] Run shared package tests/coverage/lint/typecheck/build
    - [ ] Run Convex codegen/typechecks and all app tests/builds
- [ ] Task: Verify modularity and duplication outcomes
    - [ ] Run dependency/DAG checks, duplicate-behavior audit, and `measure/doctor.sh`
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Cross-App Gate' (Protocol in workflow.md)
