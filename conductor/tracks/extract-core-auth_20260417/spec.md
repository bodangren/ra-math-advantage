# Specification: Extract Core Auth Package

## Overview

Centralize session, password, and guard helpers with configurable app behavior.

## Dependencies

- `move-im3-app-to-apps_20260417`
- `monorepo-boundary-guards_20260417`

## Functional Requirements

- FR-1: Extract common auth files into package.
- FR-2: Reconcile `server.ts` differences (BM2 revocation + IM3 developer guard behavior).
- FR-3: Support configurable redirects/cookie names/role compatibility.
- FR-4: Migrate IM3 imports to package.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 auth routes compile and pass tests using package imports.
- [ ] Revocation helper behavior is preserved.
- [ ] Developer/admin/student/teacher guards remain covered by tests.
- [ ] No app-specific routing logic hardcoded in package.

## Out of Scope

- BM2 adoption in this track.
- JWT format redesign.
