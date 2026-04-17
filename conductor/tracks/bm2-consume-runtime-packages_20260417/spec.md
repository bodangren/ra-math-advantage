# Specification: BM2 Consume Runtime Packages

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `bm2-consume-runtime-packages_20260417`.

## Overview

Complete BM2 runtime package adoption with domain boundaries preserved.

## Dependencies

- `bm2-consume-core-packages_20260417`
- `extract-activity-runtime_20260417`
- `extract-component-approval_20260417`
- `extract-graphing-core_20260417`

## Functional Requirements

- FR-1: Adopt activity runtime package for shared runtime primitives.
- FR-2: Adopt component approval package for hashing/queue/harness primitives.
- FR-3: Adopt graphing-core where API alignment is clean.
- FR-4: Keep BM2 business activity implementations local.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] BM2 runtime tests pass with package imports.
- [ ] Component approval behavior remains stable.
- [ ] Graphing behavior remains stable after utility adoption.
- [ ] BM2 domain components remain app-local.

## Out of Scope

- Practice test/study/reporting feature packages.
- IM3 feature adoption.
