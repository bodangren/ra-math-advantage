# Specification: Extract Core Auth + Convex Infrastructure

## Overview

Extract shared authentication/session utilities and shared Convex server wrappers into monorepo packages while preserving app-level behavior and keeping generated Convex APIs app-local.

This track intentionally combines auth + convex infrastructure to match the monorepo migration roadmap sequence.

## Dependencies

- `move-im3-app-to-apps_20260417`
- `monorepo-boundary-guards_20260417`

## Functional Requirements

- FR-1: Extract shared auth primitives into `packages/core-auth`:
  - session token helpers
  - password hashing/verification
  - role/developer/admin guard helpers
  - active-session revocation helpers (from BM2 hardening)
- FR-2: Reconcile auth `server.ts` deltas between IM3 and BM2 via configurable APIs (cookie names, redirects, optional guard toggles).
- FR-3: Extract shared Convex wrappers into `packages/core-convex`:
  - admin key/url resolution
  - server-side query/mutation wrappers
  - adapter/factory pattern so packages do not import app-generated Convex API modules directly
- FR-4: Keep BM2 Supabase compatibility/profile resolver app-local; do not pull it into shared package code.
- FR-5: Migrate IM3 imports to package APIs with behavior parity verified.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] `packages/core-auth` and `packages/core-convex` exist with stable public APIs.
- [ ] IM3 auth/server wrappers compile and pass tests via package imports.
- [ ] Active-session revocation and role guard behavior remain covered by tests.
- [ ] `packages/*` do not import any `apps/*/convex/_generated/*` modules.
- [ ] BM2-only Supabase compatibility code remains app-local.

## Out of Scope

- Cross-app Convex schema unification.
- JWT format redesign.
- BM2 adoption of new packages (handled in `bm2-consume-core-packages_20260417`).
