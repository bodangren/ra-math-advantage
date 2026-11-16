# Implementation Plan: App and Platform Consolidation

## Existing integration work

- [~] Reconcile the current package dependency direction, architecture manifest, CI typecheck order, and generated architecture facts before the broader consolidation tasks.

**Dependency:** `monorepo-architecture-contracts_20260710`  
**Baseline:** 43 identical production-file groups; approximately 123 KB duplicated source  
**Workflow:** strict contract-first TDD; preserve app product boundaries

## Accepted Architecture Debt

This track owns removal or reconciliation of these exact, expiring records:
`debt.activity-content-inversion`, `debt.bus-math-undeclared`,
`debt.im2-undeclared`, `debt.activity-components-undeclared`,
`debt.knowledge-space-practice-undeclared`, and
`debt.lesson-renderer-undeclared`.

## Phase 1: Platform and App Contract Definition

- [ ] Task: Classify duplicate source and configuration ownership
    - [ ] Produce a file-group inventory with shared/generated/intentional decisions
    - [ ] Record app-specific product constraints that prohibit extraction
- [ ] Task: Define shared configuration and app-composition contracts
    - [ ] Specify typed presets/generators for dev stack, framework, test, and lint configuration
    - [ ] Define providers, adapters, route seams, quality commands, and app extension points
- [ ] Task: Define the activity renderer/content dependency inversion fix
    - [ ] Specify a domain-owned registry adapter and reusable component input contract
    - [ ] Define package exports and prohibit the reverse `activity-components -> math-content` edge
- [ ] Task: Define consolidation metrics and freshness rules
    - [ ] Pin duplicate groups/bytes, package edges, and generated-file ownership
- [ ] Task: Measure - User Manual Verification 'Phase 1: Platform and App Contract Definition' (Protocol in workflow.md)

## Phase 2: Behavioral, Configuration, and Boundary Tests

- [ ] Task: Test shared presets and generated scaffolding
    - [ ] Verify deterministic generation, typed extension points, and stale-output detection
    - [ ] Exercise per-app overrides without leaking design/curriculum values
- [ ] Task: Test renderer registry injection behavior
    - [ ] Render representative IM3 and BM2 activities through app-owned registries
    - [ ] Verify missing/invalid registry entries fail predictably
- [ ] Task: Test course-app composition parity
    - [ ] Exercise providers, auth/Convex adapters, dev-stack startup contracts, and quality commands
    - [ ] Assert observable app behavior rather than file or symbol presence alone
- [ ] Task: Test package-direction and duplication policies
    - [ ] Inject the former reverse dependency and stale copied-config fixtures
- [ ] Task: Measure - User Manual Verification 'Phase 2: Behavioral, Configuration, and Boundary Tests' (Protocol in workflow.md)

## Phase 3: Implementation and App Adoption

- [ ] Task: Implement shared presets, generators, common types, and app template
- [ ] Task: Invert activity renderer/content registration and remove the `math-content` package dependency
- [ ] Task: Reconcile the accepted undeclared dependencies in app and shared-package manifests
- [ ] Task: Migrate IM3 and BM2 to the shared platform composition surfaces
- [ ] Task: Migrate IM1, IM2, and Precalculus scaffolding while preserving designs and curriculum
- [ ] Task: Remove superseded copies and add freshness/ownership checks
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation and App Adoption' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Consolidation Gate

- [ ] Task: Regenerate app/platform architecture and composition documentation
    - [ ] Run `measure/generate.sh`
    - [ ] Document extension points, generation commands, and ownership rules
- [ ] Task: Run all app, package, and boundary quality gates
    - [ ] Run tests, coverage, lint, typecheck, builds, and workspace dependency validation
    - [ ] Run generated-file freshness checks and `measure/doctor.sh`
- [ ] Task: Recompute and review modularity outcomes
    - [ ] Compare duplicate groups/bytes, package edges, and app parity to baseline
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Consolidation Gate' (Protocol in workflow.md)
