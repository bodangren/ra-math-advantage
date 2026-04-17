# Specification: Extract Activity Runtime Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-activity-runtime_20260417`.

## Overview

Share lesson/activity runtime contracts and renderer primitives while keeping concrete course components app-local.

## Dependencies

- `extract-practice-core_20260417`
- `monorepo-boundary-guards_20260417`

## Functional Requirements

- FR-1: Extract phase model, mode system, registry contracts, and renderer primitives.
- FR-2: Keep course-specific activity implementations out of package.
- FR-3: Migrate IM3 runtime imports to package.
- FR-4: Preserve lesson flow behavior and tests.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 lesson runtime compiles with package imports.
- [ ] No concrete activity components are moved into package.
- [ ] Runtime tests pass.
- [ ] Boundary guards remain clean.

## Out of Scope

- BM2 runtime adoption.
- Graphing config extraction.
