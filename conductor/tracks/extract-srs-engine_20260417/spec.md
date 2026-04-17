# Specification: Extract SRS Engine Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-srs-engine_20260417`.

## Overview

Package SRS contract, scheduler, review processor, queue primitives, adapter interfaces, and integration docs from IM3 audited code.

## Dependencies

- `extract-practice-core_20260417`

## Functional Requirements

- FR-1: SRS Package Scaffold: create package with strict typed public exports.
- FR-2: Canonical Extraction: move IM3 SRS engine modules into package.
- FR-3: BM2 Reconciliation: merge required non-domain deltas from BM2 SRS modules.
- FR-4: App Boundary: keep Convex store adapters app-local unless explicitly generalized.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Package exports SRS contract/scheduler/processor/queue APIs.
- [ ] IM3 daily practice flows compile with package imports.
- [ ] No app-generated Convex import leakage into package.
- [ ] Reconciliation decisions are documented.

## Out of Scope

- BM2 package adoption.
- Teacher analytics extraction.
- Convex schema changes.
