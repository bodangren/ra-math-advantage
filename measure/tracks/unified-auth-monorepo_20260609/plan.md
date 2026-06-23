# Track: Unified Auth Across the Monorepo — Implementation Plan

Workflow: Contract-First (package API surface), then per-task TDD.
Verification gate each phase: `tsc --noEmit` (BM2 + IM3) + auth/middleware tests.

## Phase 1 — Audit & Classification

- [x] Task: Inventory exports of `apps/bus-math-v2/lib/auth/server.ts`, `apps/integrated-math-3/lib/auth/server.ts`, and `packages/core-auth` public API — commit SHA `aaa04b08` (Red audit commit; export inventory table captured in the Green decision doc at commit SHA `7fc8fba0`).
- [x] Task: Classify each BM2 export: identical-to-package / generalizable / BM2-specific; record the target home (Contract-First decision doc) — commit SHA `7fc8fba0` (decision doc `measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md`); tally (a): 1, (b): 11, (c): 0.

### Phase 1 Red Evidence

- Baseline SHA: `5882f49671d6b65ad274fda68ceca3a56a25660c`
- RED_TEST_COMMAND: `npx vitest run unified-auth-monorepo --root apps/bus-math-v2`
- Expected failure: Contract-First decision doc `measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md` does not exist.
- Actual output: `1 failed | 1 passed` — `exports exactly the expected public identifiers` passes; `exists and contains a classified section for every BM2 export` fails with `ENOENT: no such file or directory, open .../auth-export-classification.md`.
- Commit SHA (Phase 1 Red): `aaa04b08`
- Docs SHA (Phase 1 Red evidence): `e88d19e6`

### Phase 1 Green Evidence

- GREEN_TEST_COMMAND: `npx vitest run unified-auth-monorepo --root apps/bus-math-v2`
- Actual output: `2 passed (2)` — both `exports exactly the expected public identifiers` and `exists and contains a classified section for every BM2 export` pass.
- Decision doc authored: `measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md`.
- Classification tally: (a) identical-to-package: **1**; (b) generalizable-into-package: **11**; (c) genuinely BM2-specific: **0**.
- Commit SHA (Phase 1 Green): `7fc8fba0bdcb1247e0e420ed6b191ebe7bcefb44`.
- No app code touched; no boundary lint impact.

### Phase 1 JR Green work log (2026-06-23)

Subagent: `measure-jr-green` (Phase 1 — Audit & Classification Green).

**What I did**

1. Re-ran the Phase 1 Red command on HEAD (`e88d19e6`) to confirm starting state:
   - `1 failed | 1 passed` — `exports exactly the expected public identifiers` passes; `exists and contains a classified section for every BM2 export` fails with `ENOENT: …auth-export-classification.md`.
2. Diffed each of the 12 BM2 exports against the corresponding IM3 export and the
   `packages/core-auth` public surface (`packages/core-auth/src/index.ts`).
   Recorded the comparison in an inventory table at the top of the decision doc.
3. Authored `measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md`:
   - One `## <name>` heading per BM2 export (12 total).
   - One allowed classification keyword per section
     (`identical-to-package` / `generalizable-into-package` / `bm2-specific`).
   - Inline rationale citing the BM2 line range, the IM3 mirror (or
     divergence), and the boundary-rule constraint
     (`packages/*` must not import `next/headers` / `next/navigation` /
     `next/server` / `convex/_generated/`).
   - A per-export "target home" note describing how the BM2 wrapper shrinks
     after Phase 2 promotion.
   - A cross-cutting design notes section locking in the discriminated-union
     return shape, the cookie-store parameter, the redirect-helper boundary,
     and the active-credential verifier callback.
4. Re-ran the Green command: `2 passed (2)`. Also re-ran the legacy
   `__tests__/lib/auth/*` suite (33 tests) and the new `__tests__/auth/*`
   suite to confirm no regression — all green.

**Classification outcomes**

- **(a) identical-to-package (1):** `getRequestSessionClaims` — the function
  is portable (only uses the Web-standard `Request` and
  `verifySessionToken`). It can move to `core-auth` as-is; the BM2 export
  becomes a re-export.
- **(b) generalizable-into-package (11):** all 11 remaining exports use
  Next.js APIs (`next/headers`, `next/navigation`, `next/server`) and/or
  the app's Convex helpers, so they cannot be promoted verbatim. Phase 2
  will move them into `core-auth` parameterized by:
  - a cookie-store argument (`getServerSessionClaims`),
  - a response/redirect helper or discriminated union
    (`requireRequestSessionClaims`, `requireServerSessionClaims`,
    `requireServerRoles`, plus the role-gated and active-role guards),
  - a teacher-dashboard path option
    (`requireStudentSessionClaims`),
  - a per-app active-credential verifier callback
    (`requireActiveRequestSessionClaims` and the two active-role guards),
  - a role-list option (every `requireRole`-shaped guard).
  The BM2/IM3 behavior differences (`requireActiveRequestSessionClaims`
  checks credential existence only in BM2, existence + `isActive` in IM3;
  `requireAdminRequestClaims` vs IM3's `requireDeveloperRequestClaims`) are
  captured as options, not as forks.
- **(c) bm2-specific (0):** no BM2-only domain knowledge remains after
  parameterization. The original audit's "BM2 has unique logic" finding
  dissolves once `requireAdminRequestClaims` is shown to be the same shape
  as IM3's `requireDeveloperRequestClaims`.

**Live-proof commands and outcomes**

- `npx vitest run unified-auth-monorepo --root apps/bus-math-v2` →
  `2 passed (2)` (Green).
- `npx vitest run __tests__/auth --root apps/bus-math-v2` →
  `1 file, 2 tests, all passed` (regression check).
- `npx vitest run __tests__/lib/auth --root apps/bus-math-v2` →
  `4 files, 33 tests, all passed` (regression check).

**Boundary discipline observed**

- No TypeScript source files modified (only the new markdown decision doc
  and this `plan.md`).
- No unrelated dirty files touched (151 unrelated modifications preserved).
- `graph.db` not modified.
- No closeout actions (no archive move, no metadata closeout).

**Open items for Phase 2**

- Implement the parameterized `getServerSessionClaims(cookieStore)`,
  the discriminated-union return type for the response/redirect guards,
  the active-credential verifier callback, and the role-list option
  in `packages/core-auth`.
- Add parity tests in `packages/core-auth/src/__tests__/` per
  `test-strategy.md` §1–§3, including the BM2 "credential existence
  only" deactivation check.

## Phase 2 — Promote Shared Logic into core-auth

- [ ] Task: Move generalizable logic into `packages/core-auth`, parameterizing app differences (cookie names, redirects, role maps) via options
- [ ] Task: TDD — unit tests in core-auth for the promoted logic (parity with prior BM2 behavior)

## Phase 3 — Thin the App Wrappers

- [ ] Task: Reduce BM2 `server.ts` to thin app-specific composition over core-auth; rewire BM2 importers
- [ ] Task: Where no app-specific logic remains, re-export the package directly (remove indirection); apply same review to IM3 wrapper
- [ ] Task: `tsc --noEmit` (BM2 + IM3) green

## Phase 4 — Verify & Reconcile

- [ ] Task: BM2 + IM3 auth + middleware tests green; `npm run doctor` green (no boundary violations)
- [ ] Task: Confirm no duplicated session/password/guard logic remains; update docs/tech-debt
- [ ] Task: Measure - User Manual Verification 'Phase 4'
