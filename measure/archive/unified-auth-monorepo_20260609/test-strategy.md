# Test Strategy — unified-auth-monorepo_20260609

Role: Contract-First package API surface, then per-task TDD.

## 1. Testing pyramid per phase

- **Phase 1 — Audit & Classification**: Source-level contract tests (artifact/doc-contract).
  - Assert the public export inventory of `apps/bus-math-v2/lib/auth/server.ts`.
  - Assert the existence and shape of the Contract-First decision doc.
  - No live behavior tests; this phase is documentation/audit.
- **Phase 2 — Promote Shared Logic into core-auth**: Unit tests in `packages/core-auth` for promoted helpers.
  - Live behavior: session/guard helpers, cookie parsing, role checks, active-credential checks.
  - Parity tests against the pre-promotion BM2 behavior (where behavior differs from IM3).
- **Phase 3 — Thin the App Wrappers**: Unit tests for the thinned BM2/IM3 wrappers.
  - Verify wrappers delegate to `packages/core-auth`.
  - Verify app-specific composition (cookie names, redirect targets, role maps) is wired correctly.
- **Phase 4 — Verify & Reconcile**: Integration + boundary lint.
  - `tsc --noEmit` for BM2 and IM3.
  - Auth + middleware test suites green.
  - `npm run doctor` boundary checks green.
  - Smoke tests for login/session/role/deactivation revocation.

## 2. Shared fixtures / mocks

- Reuse existing BM2 auth mocks in `apps/bus-math-v2/__tests__/lib/auth/`.
- New shared fixtures (if needed) live in `packages/core-auth/src/__tests__/` and must be package-local.
- `next/headers`, `next/navigation`, and `next/server` are mocked in wrapper tests; `packages/core-auth` tests must not depend on Next.js APIs.

## 3. Cross-phase edge cases & dependencies

- Phase 1 must run before Phase 2; the decision doc is the contract for promotion.
- Phase 2 promotion must preserve BM2-specific behavior differences (e.g., `requireActiveRequestSessionClaims` currently checks credential existence only, while IM3 also checks `isActive`).
- Phase 3 must keep all existing BM2/IM3 importers working without signature changes (additive-only package API where possible).
- Phase 4 `npm run doctor` must remain green; no app code may import duplicated package logic.
- Boundary rule: `packages/*` must not import from `apps/` or `convex/_generated/`.

## 4. Architecture guardrails

- All new shared auth logic lives in `packages/core-auth`.
- App wrappers (`apps/*/lib/auth/server.ts`) contain only thin, clearly app-specific composition.
- Parameterize app differences (cookie names, redirect targets, role maps) via options, not forks.
- Decision docs live under `measure/tracks/unified-auth-monorepo_20260609/decisions/`.

## 5. Per-phase test approach

- **P1 Red**: `unified-auth-monorepo.test.ts` fails because `auth-export-classification.md` does not exist.
  **P1 Green**: decision doc authored; test passes.
- **P2 Red**: new core-auth tests for promoted BM2 helpers fail because helpers are not yet in package.
  **P2 Green**: helpers promoted + tests pass.
- **P3 Red**: wrapper delegation tests fail because BM2 `server.ts` still contains local logic.
  **P3 Green**: wrappers thinned + delegation tests pass.
- **P4 Red**: aggregate `tsc`, auth/middleware tests, or `doctor` fail due to remaining duplication.
  **P4 Green**: all gates pass.

## 6. Live-proof plan (targeted Red → Green/closeout gate)

- **P1 Red**: `npx vitest run unified-auth-monorepo --root apps/bus-math-v2` → decision doc missing.
  **P1 Green**: decision doc present with section per BM2 export and valid classifications.
- **P2 Red**: `npx vitest run --root packages/core-auth` promoted-helper tests fail.
  **P2 Green**: core-auth tests pass.
- **P3 Red**: `npx vitest run lib/auth/server --root apps/bus-math-v2` wrapper delegation tests fail.
  **P3 Green**: BM2 wrapper tests pass; repeat for IM3.
- **P4 Red**: aggregate `tsc`/`doctor`/auth tests show boundary or duplication violations.
  **P4 Green**: `tsc --noEmit` (BM2 + IM3), auth + middleware tests, and `npm run doctor` all green.

## 7. Artifact-contract vs live-behavior; fakes

- **Artifact/doc-contract tests**: Phase 1 export inventory and decision-doc shape assertions.
- **Live-behavior tests**: Phase 2–4 session/guard/wrapper tests exercising real code paths.
- Fakes/mocks are acceptable for Next.js server APIs and Convex internal queries, but promotion parity tests must use real `packages/core-auth` implementations.
