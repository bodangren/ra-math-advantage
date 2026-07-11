# Implementation Plan: KST+SRS v3.2 IM3 Runtime and Data Migration

**Dependencies:** `kst-srs-v3-2-planner-session_20260710`, `monorepo-architecture-contracts_20260710`  
**Migration strategy:** widen → dual write/read → dry-run migration → verify → cut over → narrow  
**Workflow:** strict contract-first TDD; no production deploy without explicit approval

## Accepted Architecture Debt

This track owns removal or reconciliation of the exact, expiring
`debt.im3-undeclared` record as IM3 adopts the canonical runtime packages.

## Phase 1: Contract & Schema Widening Definition

- [x] Task: Inventory the complete v2 persistence and runtime surface [ecca7fc]
    - [ ] Map tables, fields, indexes, handlers, adapters, routes, and UI consumers
    - [ ] Record data-volume and migration-risk assumptions per table
- [x] Task: Define widened Convex schemas and versioned adapters [96bd05d]
    - [ ] Add optional v3.2 fields and correctly named indexes
    - [ ] Define old/new read precedence, dual-write behavior, and migration-version markers
    - [ ] Define validated internal migration and verification result contracts
- [x] Task: Define cutover, comparison, and rollback contracts [45af637]
    - [ ] Add feature-flag and divergence-report schemas
    - [ ] Specify cutover thresholds, rollback window, and deprecated-field policy
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Widening Definition' (Protocol in workflow.md)

## Phase 2: Migration and Runtime Tests

- [ ] Task: Test widen–migrate–narrow behavior
    - [ ] Cover old-only, new-only, mixed, malformed, and concurrently created documents
    - [ ] Prove dry-run rollback, batching, resume, idempotency, and verification
- [ ] Task: Test placement and practice-variant backfills
    - [ ] Prove provenance/timestamps are preserved and no synthetic review history is created
    - [ ] Prove `problemFamilyId` and `variantKey` dual-read/write semantics during transition
- [ ] Task: Test v2/v3.2 comparison and IM3 user flows
    - [ ] Cover knowledge state, placement, dashboard recommendation, daily queue, and review-day messaging
    - [ ] Assert divergences affect observable outputs, not merely that queries were called
- [ ] Task: Test every monorepo consumer against the final contract
    - [ ] Cover IM3 and BM2 behavior plus IM1/IM2/Precalculus build/type compatibility
    - [ ] Pin BM2 to the canonical queue implementation
- [ ] Task: Measure - User Manual Verification 'Phase 2: Migration and Runtime Tests' (Protocol in workflow.md)

## Phase 3: Widen, Migrate, Cut Over, and Narrow

- [ ] Task: Implement widened schemas and dual-version adapters
- [ ] Task: Reconcile the accepted IM3 package dependencies in the app manifest
- [ ] Task: Implement dual writes, bounded dual reads, comparison telemetry, and feature flags
- [ ] Task: Obtain explicit approval and integrate `@convex-dev/migrations` if not already installed
- [ ] Task: Implement batched placement, card, review-log, and practice-variant migrations
- [ ] Task: Run local/dev dry runs, inspect status, and execute verification queries
- [ ] Task: Cut IM3 runtime and BM2 queue consumers to canonical v3.2 behavior
- [ ] Task: After verification and rollback-window approval, narrow schemas and remove v2 readers
- [ ] Task: Measure - User Manual Verification 'Phase 3: Widen, Migrate, Cut Over, and Narrow' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Migration Closeout

- [ ] Task: Regenerate architecture, routes, schema, and migration documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Record dry-run, execution, verification, cutover, rollback, and resume commands
- [ ] Task: Run IM3 and shared-package quality gates
    - [ ] Run focused tests, coverage, lint, typecheck, and build
    - [ ] Run Convex codegen/typecheck and migration status verification
- [ ] Task: Run all-consumer compatibility and architecture gates
    - [ ] Run BM2/IM1/IM2/Precalculus gates, boundary checks, and `measure/doctor.sh`
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Migration Closeout' (Protocol in workflow.md)
