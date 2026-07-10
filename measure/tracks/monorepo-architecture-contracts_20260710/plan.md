# Implementation Plan: Monorepo Architecture Contracts and Enforcement

**Dependency:** none  
**Baseline:** 5 apps, 20 non-template packages, 8 packages missing from CI matrix  
**Workflow:** strict contract-first TDD; generated facts must be reproducible

## Phase 1: Architecture Contract Definition

- [~] Task: Define the versioned workspace and ownership manifest schema
    - [ ] Model apps, packages, layers, owners, domain classification, exports, and quality commands
    - [ ] Model allowed edges and explicit expiring debt records
- [ ] Task: Define dependency-DAG and boundary policies
    - [ ] Specify app/package direction, domain-content isolation, Convex generated boundaries, and public exports
    - [ ] Specify cycle, undeclared dependency, and deep-import rules
- [ ] Task: Define workspace quality-gate parity contracts
    - [ ] Derive expected workspaces from root workspaces and package manifests
    - [ ] Specify root/CI parity and required lint/test/typecheck/build capabilities
- [ ] Task: Capture reproducible architecture baselines
    - [ ] Record current package graph, CI omissions, duplicate-source metrics, and known violations
- [ ] Task: Measure - User Manual Verification 'Phase 1: Architecture Contract Definition' (Protocol in workflow.md)

## Phase 2: Behavioral and Architecture Tests

- [ ] Task: Build negative fixtures for every prohibited dependency class
    - [ ] Cover app-to-app, package-to-app, generated Convex, domain leakage, deep imports, and undeclared dependencies
    - [ ] Cover direct and transitive cycles
- [ ] Task: Test workspace and CI inventory parity
    - [ ] Fail when a workspace is absent, duplicated, or lacks required commands
    - [ ] Fail when root and CI inventories diverge
- [ ] Task: Test debt-record behavior
    - [ ] Reject unowned, unlinked, malformed, or expired exceptions
    - [ ] Prove an exception cannot match unrelated future violations
- [ ] Task: Add behavioral complements for affected package boundaries
    - [ ] Exercise public exports and at least one real consumer per shared surface
- [ ] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Architecture Tests' (Protocol in workflow.md)

## Phase 3: Implementation

- [ ] Task: Implement manifest loading, graph construction, and deterministic reporting
- [ ] Task: Replace the regex-only guard with manifest-aware dependency enforcement
- [ ] Task: Generate CI/package matrices from the workspace inventory or add parity checks that make drift impossible
- [ ] Task: Restore `math-content` lint and standalone typecheck gates
- [ ] Task: Register bounded existing debt and link each item to an approved follow-up track
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Architecture Gate

- [ ] Task: Generate package DAG, ownership, exports, and quality-gate reports
    - [ ] Run `measure/generate.sh`
    - [ ] Update architecture, tech stack, and CI documentation
- [ ] Task: Run all workspace and injected-violation gates
    - [ ] Run every package/app quality command represented in the manifest
    - [ ] Run architecture fixtures, boundary checks, and `measure/doctor.sh`
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Architecture Gate' (Protocol in workflow.md)
