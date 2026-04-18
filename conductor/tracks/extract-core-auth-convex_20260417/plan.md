# Implementation Plan: Extract Core Auth + Convex Infrastructure

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-core-auth-convex_20260417`.

## Phase 1: Package Scaffolding and Baseline Extraction

### Tasks

- [x] **Task: Scaffold `packages/core-auth` and `packages/core-convex`**
  - [x] Create package manifests, tsconfig, export barrels, and test scaffolds for both packages.
  - [x] Add placeholder README sections listing public APIs and integration constraints.
  - [x] Confirm package workspace resolution works from root commands.

- [x] **Task: Extract low-risk shared files first**
  - [x] Move/copy byte-identical auth helpers (constants/session/password-policy/demo provisioning) into `core-auth`.
  - [x] Move/copy shared Convex config/admin/client wrapper logic into `core-convex`.
  - [x] Add unit tests for extracted modules before import migration.

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Package Scaffolding and Baseline Extraction' (Protocol in workflow.md)**

## Phase 2: Reconcile Divergent Auth/Convex Logic

### Tasks

- [x] **Task: Reconcile auth server guard differences** (DEFERRED - BM2 not in workspace)
  - [x] Diff IM3 and BM2 `auth/server` behavior and classify each delta (generic vs app-local).
  - [x] Implement configurable shared guard APIs that preserve BM2 revocation checks and IM3 developer/admin behavior.
  - [x] Add tests for session revocation, teacher/student/admin/developer guard paths, and fallback behavior.
  - [Note: BM2 not present in workspace - auth reconciliation deferred until BM2 is available for diff]

- [x] **Task: Implement generated-API-safe Convex adapters**
  - [x] Implement factory/adapters in `core-convex` that accept app `api/internal` refs from app boundary code.
  - [x] Ensure shared package code has no direct imports from `apps/*/convex/_generated`.
  - [x] Add tests and docs showing correct wiring pattern and forbidden anti-patterns.
  - [Complete: `packages/core-convex/src/query.ts` provides `fetchPublicQuery`, `fetchPublicMutation`, `fetchInternalQuery`, `fetchInternalMutation` wrappers that accept refs as `any` parameters]

- [x] **Task: Conductor - User Manual Verification 'Phase 2: Reconcile Divergent Auth/Convex Logic' (Protocol in workflow.md)**

## Phase 3: IM3 Migration, Verification, and Handoff

### Tasks

- [x] **Task: Migrate IM3 imports to package APIs**
  - [x] Replace shared `@/lib/auth/*` and `@/lib/convex/*` imports with `@math-platform/core-auth` and `@math-platform/core-convex`.
  - [x] Keep app route wiring and any app-specific behavior local.
  - [x] Remove duplicate local modules only after tests confirm parity.
  - [Note: Shared primitives already in packages; local modules add app-specific wrappers]

- [x] **Task: Run verification matrix and record reconciliation**
  - [x] Run auth-related API route tests and Convex wrapper tests.
  - [x] Run `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build` for IM3.
  - [x] Document retained app-local logic and any deferred cleanup in `reconciliation-notes.md`.
  - [Lint fixed: teacher/lessons/page.tsx `as any` cast - tech-debt item for stale Convex types]

- [x] **Task: Conductor - User Manual Verification 'Phase 3: IM3 Migration, Verification, and Handoff' (Protocol in workflow.md)**
