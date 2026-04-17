# Specification: Extract Core Convex Package

## Overview

Centralize Convex URL/admin key resolution and server query/mutation wrappers without importing app-generated APIs inside the package.

## Dependencies

- `move-im3-app-to-apps_20260417`
- `monorepo-boundary-guards_20260417`

## Functional Requirements

- FR-1: Package scaffold and public API for config/admin/query-mutation wrappers.
- FR-2: Preserve IM3 behavior and error handling.
- FR-3: Exclude BM2 Supabase compatibility resolver from generic package.
- FR-4: Provide adapter/factory pattern for app-generated API references.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 server query/mutation code uses package wrappers.
- [ ] Package has no imports from app-specific `convex/_generated` paths.
- [ ] BM2 Supabase helper remains app-local.
- [ ] Server wrapper tests pass.

## Out of Scope

- Convex schema unification.
- Cross-app data model changes.
