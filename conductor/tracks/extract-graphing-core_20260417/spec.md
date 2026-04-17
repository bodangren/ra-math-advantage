# Specification: Extract Graphing Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-graphing-core_20260417`.

## Overview

Share graphing utility primitives across apps while keeping domain exploration configs app-specific.

## Dependencies

- `extract-activity-runtime_20260417`

## Functional Requirements

- FR-1: Extract parser and coordinate/canvas math modules.
- FR-2: Reconcile IM3/BM2 utility deltas and preserve required behavior.
- FR-3: Keep business and lesson-specific exploration configs in apps.
- FR-4: Migrate IM3 imports to package.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 graphing tests pass using package imports.
- [ ] No business-specific exploration configs are included in package.
- [ ] Parser behavior remains backward-compatible.
- [ ] Boundary checks pass.

## Out of Scope

- Graphing component UI redesign.
- BM2 adoption.
