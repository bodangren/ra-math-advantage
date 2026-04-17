# Specification: BM2 Consume Core Packages

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `bm2-consume-core-packages_20260417`.

## Overview

Adopt core packages in BM2 incrementally while keeping BM2-only domain logic local.

## Dependencies

- `move-bm2-app-to-apps_20260417`
- `extract-practice-core_20260417`
- `extract-srs-engine_20260417`
- `extract-core-auth-convex_20260417`

## Functional Requirements

- FR-1: Practice/SRS import migration to shared packages.
- FR-2: Auth/Convex wrapper import migration to shared packages.
- FR-3: Remove duplicate local core modules only after verification.
- FR-4: Preserve BM2 domain-specific modules and API behavior.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] BM2 core imports primarily reference shared packages.
- [ ] BM2 SRS/auth tests pass.
- [ ] No accidental deletion of BM2 domain modules.
- [ ] Reconciliation log documents retained local modules.

## Out of Scope

- Runtime package adoption.
- Feature package extraction.
