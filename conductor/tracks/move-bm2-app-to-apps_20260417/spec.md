# Specification: Move BM2 App to apps/bus-math-v2

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `move-bm2-app-to-apps_20260417`.

## Overview

Move BM2 into monorepo once IM3 host and core package patterns are proven. Keep BM2 domain modules local.

## Dependencies

- `monorepo-readiness_20260417`
- `extract-graphing-core_20260417`

## Functional Requirements

- FR-1: Directory Relocation: move BM2 app directories under `apps/bus-math-v2`.
- FR-2: Domain Preservation: keep BM2 business engines, workbook assets, and data layers local.
- FR-3: Config and CI Update: update BM2 scripts/config/CI/deploy references.
- FR-4: Runtime Integrity: BM2 and IM3 both pass verification after move.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] BM2 app runs from new monorepo path.
- [ ] Domain-specific BM2 directories remain intact/local.
- [ ] Both apps pass lint/test/build/typecheck.
- [ ] CI/deploy paths compile with both app locations.

## Out of Scope

- BM2 package adoption.
- Shared package extraction in this track.
