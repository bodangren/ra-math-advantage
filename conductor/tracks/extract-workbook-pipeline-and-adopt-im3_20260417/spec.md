# Specification: Extract Workbook Pipeline Package and Adopt in IM3

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-workbook-pipeline-and-adopt-im3_20260417`.

## Overview

Use BM2 workbook pipeline as canonical implementation and avoid duplicate IM3 local pipeline creation.

## Dependencies

- `bm2-consume-core-packages_20260417`

## Functional Requirements

- FR-1: Extract workbook manifest generation/parsing/path resolution/client lookup primitives.
- FR-2: Keep workbook asset files app-local in each app.
- FR-3: Migrate BM2 workbook pipeline imports to package.
- FR-4: Implement IM3 workbook system using package imports.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] `packages/workbook-pipeline` is consumed by BM2 and IM3.
- [ ] Workbook assets remain local to each app.
- [ ] IM3 workbook track is completed via package path.
- [ ] Workbook tests pass in both apps.

## Out of Scope

- Unifying workbook assets across courses.
- Converting workbook file formats.
