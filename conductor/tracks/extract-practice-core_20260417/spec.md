# Specification: Extract Practice Core Package

## Overview

Create canonical `practice-core` package containing practice contract, submission schema, timing logic, timing baselines, SRS rating, and reusable error-analysis primitives.

## Dependencies

- `move-im3-app-to-apps_20260417`
- `monorepo-boundary-guards_20260417`

## Functional Requirements

- FR-1: Package Scaffold: create `packages/practice-core` with build/test/typecheck support.
- FR-2: Canonical Extraction: move IM3 practice primitives into package with stable exports.
- FR-3: BM2 Reconciliation: diff common files and merge required behavior only.
- FR-4: Import Migration: replace IM3 local imports with package imports.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] `@math-platform/practice-core` exports all required primitives.
- [ ] IM3 compiles and tests with package imports only for extracted modules.
- [ ] Reconciliation notes capture every BM2 delta decision.
- [ ] No package imports from app directories.

## Out of Scope

- BM2 adoption of the package.
- Moving accounting practice family engines.
- SRS engine extraction.
