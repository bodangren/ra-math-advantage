# Implementation Plan: Monorepo Architecture Contracts and Enforcement

**Dependency:** none  
**Baseline:** 5 apps, 20 non-template packages, 8 packages missing from CI matrix  
**Workflow:** strict contract-first TDD; generated facts must be reproducible

## Phase 1: Architecture Contract Definition [checkpoint: e202fb5]

- [x] Task: Define the versioned workspace and ownership manifest schema [ba6498b]
    - [x] Model apps, packages, layers, owners, domain classification, exports, and quality commands
    - [x] Model allowed edges and explicit expiring debt records
- [x] Task: Define dependency-DAG and boundary policies [dd2498c]
    - [x] Specify app/package direction, domain-content isolation, Convex generated boundaries, and public exports
    - [x] Specify cycle, undeclared dependency, and deep-import rules
- [x] Task: Define workspace quality-gate parity contracts [a0e9df5]
    - [x] Derive expected workspaces from root workspaces and package manifests
    - [x] Specify root/CI parity and required lint/test/typecheck/build capabilities
- [x] Task: Capture reproducible architecture baselines [207be27]
    - [x] Record current package graph, CI omissions, duplicate-source metrics, and known violations
- [x] Task: Measure - User Manual Verification 'Phase 1: Architecture Contract Definition' (Protocol in workflow.md) [e202fb5]

## Phase 2: Behavioral and Architecture Tests [checkpoint: 460a215]

- [x] Task: Build negative fixtures for every prohibited dependency class [a9ef764]
    - [x] Cover app-to-app, package-to-app, generated Convex, domain leakage, deep imports, and undeclared dependencies
    - [x] Cover direct and transitive cycles
- [x] Task: Test workspace and CI inventory parity [fb16971]
    - [x] Fail when a workspace is absent, duplicated, or lacks required commands
    - [x] Fail when root and CI inventories diverge
- [x] Task: Test debt-record behavior [68df0f3]
    - [x] Reject unowned, unlinked, malformed, or expired exceptions
    - [x] Prove an exception cannot match unrelated future violations
- [x] Task: Add behavioral complements for affected package boundaries [b3a2ee3]
    - [x] Exercise public exports and at least one real consumer per shared surface
- [x] Task: Measure - User Manual Verification 'Phase 2: Behavioral and Architecture Tests' (Protocol in workflow.md) [460a215]

## Phase 3: Implementation

- [x] Task: Implement manifest loading, graph construction, and deterministic reporting [c084d41]
- [x] Task: Replace the regex-only guard with manifest-aware dependency enforcement [85b83e7 + c620cd9]
- [x] Task: Generate CI/package matrices from the workspace inventory or add parity checks that make drift impossible [13d2f5b]
- [x] Task: Restore `math-content` lint and standalone typecheck gates [11267cf]
- [~] Task: Register bounded existing debt and link each item to an approved follow-up track
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implementation' (Protocol in workflow.md)

## Phase 4: Generate Docs, Doctor, and Architecture Gate

- [ ] Task: Generate package DAG, ownership, exports, and quality-gate reports
    - [ ] Run `measure/generate.sh`
    - [ ] Update architecture, tech stack, and CI documentation
- [ ] Task: Run all workspace and injected-violation gates
    - [ ] Run every package/app quality command represented in the manifest
    - [ ] Run architecture fixtures, boundary checks, and `measure/doctor.sh`
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Architecture Gate' (Protocol in workflow.md)
