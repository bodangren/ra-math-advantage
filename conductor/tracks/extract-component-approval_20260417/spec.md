# Specification: Extract Component Approval Package

## Overview

Package reusable approval mechanics while keeping app-specific review routes and targets local.

## Dependencies

- `extract-activity-runtime_20260417`

## Functional Requirements

- FR-1: Extract content hash and component identity utilities.
- FR-2: Extract queue/harness contracts and gating logic.
- FR-3: Reconcile BM2 approval hardening deltas if generic.
- FR-4: Migrate IM3 imports and keep route-level behavior app-local.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 approval harness and queue behavior remain intact.
- [ ] Package contains reusable primitives only.
- [ ] BM2 hardening reconciliation is documented.
- [ ] Approval tests pass.

## Out of Scope

- BM2 adoption.
- Workflow auth policy redesign.
