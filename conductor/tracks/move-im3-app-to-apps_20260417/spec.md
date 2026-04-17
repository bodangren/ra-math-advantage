# Specification: Move IM3 App to apps/integrated-math-3

## Overview

Perform IM3 directory migration with strict mechanical scope. No logic refactors allowed in this track except path-related fixes.

## Dependencies

- `monorepo-tooling-shell_20260417`

## Functional Requirements

- FR-1: Directory Relocation: move IM3 source folders to `apps/integrated-math-3/`.
- FR-2: Config Path Updates: update TypeScript aliases, test config, framework config, and scripts for new paths.
- FR-3: CI/Deploy Path Updates: update workflow and deployment references to new app location.
- FR-4: Runtime Integrity: all IM3 dev/test/build/typecheck commands pass from new location.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 root directories live under `apps/integrated-math-3/`.
- [ ] No stale imports referencing old root paths remain.
- [ ] CI and deploy references target the new app path.
- [ ] IM3 lint/test/build/typecheck all pass post-move.

## Out of Scope

- Extracting shared packages.
- Moving BM2 into the repo.
- Behavioral refactors unrelated to path migration.
