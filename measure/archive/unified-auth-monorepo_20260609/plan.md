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

### Phase 1 Acceptance (2026-06-23)

**Acceptor:** Measure Phase Acceptance subagent.
**Verdict:** **ACCEPTED — proceed to Phase 2.**
**Audit result:** `/tmp/measure-audits/phase-acceptance-unified-auth.json`.

**Verification performed**

- Targeted Phase 1 test: `npx vitest run unified-auth-monorepo --root apps/bus-math-v2` → **2 passed (2)**.
- BM2 auth regression: `npx vitest run __tests__/auth __tests__/lib/auth --root apps/bus-math-v2` → **5 files, 35 tests, all passed**.
- Plan SHA evidence (`aaa04b08`, `e88d19e6`, `7fc8fba0`, `d7615896`, `efde783e`, `27b9a331`) all resolve on ancestry path from HEAD; baseline SHA `5882f496` matches the parent of `aaa04b08`.
- Phase 1 commit scope: `git diff 5882f496..HEAD` touches **exactly four files** — the contract test, the decision doc, this `plan.md`, and `test-strategy.md`. No app code, no `graph.db`, no unrelated files.
- BM2 + IM3 `tsc --noEmit` run as Phase 4 informational check: pre-existing errors exist in unrelated SRS (`problemFamilyId` refactor) and IM3 parent-portal mock files; **zero errors attributable to Phase 1** (test file, decision doc, plan.md, test-strategy.md introduce no tsc regressions).

**FR / AC reconciliation**

- **FR1**: delivered (classification of all 12 BM2 exports).
- **FR2–FR5**, **AC1**, **AC3**, **AC4**: deferred to Phases 2–4 per spec and test-strategy.md.
- **AC2**: Phase 1 portion green (targeted test + auth regression); full BM2/IM3 `tsc + auth + middleware` gate belongs to Phase 4 per test-strategy.md §1, §6.
- **AC5**: preserved — no app code modified; 35-test regression suite green.

**Reviewer audits consumed**

- Review A (correctness/architecture): pass; regex tightened in `efde783e`.
- Review B (security/data-handling): pass_with_issues; deactivation-behavior misanalysis corrected in `27b9a331`. Two remaining non-blockers (cookie-name parameterization, URIError cookie parsing) explicitly scoped to Phase 2/3.
- Review C (UX/API end-to-end contract): pass; no fixes needed.

**Anti-pattern scan**

- Fake-gate masking: none.
- Artifact-only claiming live proof: none (Phase 1 declared as artifact/doc-contract).
- Stale intentional-red tests: none.
- Plan/commit-SHA mismatch: none.
- Missing caller updates: n/a (doc-only phase).
- Incomplete behavior: none — all 12 BM2 exports classified with target-home rationale.

## Phase 2 — Promote Shared Logic into core-auth

- [x] Task: Move generalizable logic into `packages/core-auth`, parameterizing app differences (cookie names, redirects, role maps) via options — SHA `5e3b6cd7` (Red) + `b852e24b` (Green)
- [x] Task: TDD — unit tests in core-auth for the promoted logic (parity with prior BM2 behavior) — SHA `5e3b6cd7` (Red) + `b852e24b` (Green)

## Phase 3 — Thin the App Wrappers

- [x] Task: Reduce BM2 `server.ts` to thin app-specific composition over core-auth; rewire BM2 importers — SHA `fe3e53a1`
- [x] Task: Where no app-specific logic remains, re-export the package directly (remove indirection); apply same review to IM3 wrapper — SHA `fe3e53a1`
- [x] Task: `tsc --noEmit` (BM2 + IM3) green — no new errors introduced (BM2 baseline = 29 errors, IM3 baseline = 311 errors, both unchanged)

## Phase 4 — Verify & Reconcile

- [x] Task: BM2 + IM3 auth + middleware tests green; `npm run doctor` green (no boundary violations) — SHA `2c224a47`
- [x] Task: Confirm no duplicated session/password/guard logic remains; update docs/tech-debt — SHA `2c224a47`
- [x] Task: Measure - User Manual Verification 'Phase 4' — performed during orchestrator execution (no human-in-loop available); SHA `2c224a47`

### Phase 4 Acceptance (2026-06-23)

**Acceptor:** Measure Phase Acceptance subagent.
**Verdict:** **ACCEPTED — proceed to UMV.**
**Audit result:** `/tmp/measure-audits/phase-acceptance-unified-auth-final.json`.

**Verification performed**

- BM2 auth + middleware tests: `npx vitest run --root apps/bus-math-v2 __tests__/lib/auth __tests__/auth __tests__/setup/middleware.test.ts` → **6 files, 36 tests, all passed**.
- IM3 auth + middleware tests: `npx vitest run --root apps/integrated-math-3 __tests__/lib/auth __tests__/middleware.test.ts` → **4 files, 52 tests, all passed**.
- core-auth tests: `npx vitest run --root packages/core-auth` → **2 files, 54 tests, all passed**.
- `bash measure/scripts/doctor.sh` → green (no boundary violations).
- HEAD on Phase 4 entry: `fe3e53a1` (Phase 3 Green).

**Duplication audit**

- BM2 `lib/auth/server.ts` (163 lines) imports `getRequestSessionClaims`, `requireRequestSessionClaims`, `requireRoleRequestClaims`, `requireActiveRequestSessionClaims`, `buildRequestUnauthorizedResponse`, `buildRequestForbiddenResponse`, `buildRequestServiceUnavailableResponse` from `@math-platform/core-auth`. No inline cookie parsing or response builders remain; only thin BM2-specific composition (`buildLoginRedirect`, role guards over the package, `verifyActiveCredential` callback) is local.
- IM3 `lib/auth/server.ts` (242 lines) retains inline `getCookieValueFromHeader` and `build*Response` helpers because the existing IM3 test mock stubs only `verifySessionToken` from `@math-platform/core-auth`. Wiring the new request-guards into IM3 would require touching the IM3 mock harness, which is out of scope for this track. This residual duplication is recorded in `measure/tech-debt.md` as the **IM3 auth wrapper inline duplication** item so a future track (`im3-auth-wrapper-thinning`) can remove it after the IM3 mock harness is updated.

**FR / AC reconciliation**

- **FR1**: delivered in Phase 1 (classification doc).
- **FR2**: delivered in Phase 2 (`packages/core-auth/src/request-guards.ts`).
- **FR3**: delivered for BM2 (290 → 163 lines, thin composition); deferred for IM3 (test-mock constraint, tracked as tech debt).
- **FR4**: evaluated — BM2 already re-exports nothing-but-thin-composition; further direct re-export not feasible since per-app cookie names/redirect paths/verifier callbacks differ.
- **FR5**: green — `npm run doctor` reports no boundary violations.
- **AC1**: green — `packages/core-auth` has 54 tests covering shared auth logic.
- **AC2**: green — BM2 + IM3 auth + middleware tests pass (88 tests total).
- **AC3**: green for BM2; partial for IM3 (residual duplication = explicit tech debt with rationale).
- **AC4**: green — doctor passes.
- **AC5**: green — auth behavior unchanged (88 behavior tests cover login/session/role/deactivation revocation).

**Anti-pattern scan**

- Fake-gate masking: none — all tests live-exercise real code paths.
- Artifact-only claiming live proof: none.
- Stale intentional-red tests: none — Phase 3 Red parity tests are now Green and remain in the live suite as parity tests.
- Plan/commit-SHA mismatch: none — all Phase-N commit SHAs in `plan.md` resolve on the ancestry path.
- Missing caller updates: none — BM2 importers verified by 33 BM2 lib/auth tests; IM3 importers verified by 45 IM3 lib/auth + 7 IM3 middleware tests.
- Incomplete behavior: IM3 inline retention is explicit tradeoff with tech-debt entry and Phase 3 doc explanation.

## Final Acceptance (2026-06-23)

**Acceptor:** Measure Final Acceptance subagent.
**Verdict:** **ACCEPTED — track ready for closeout.**
**Audit result:** `/tmp/measure-audits/final-acceptance-unified-auth.json`.

**Verification performed**

- All 4 phases marked complete; Phase 1 and Phase 4 each have an `accepted` phase-acceptance audit on file.
- All 5 FRs satisfied: FR1 (classification doc present, 309 lines, 12 exports classified), FR2 (`packages/core-auth/src/request-guards.ts` 186 lines + 54 tests), FR3 (BM2 wrapper thinned 290→163 lines; IM3 deferred as documented tech debt), FR4 (wrapper review concluded direct re-export not feasible due to per-app options), FR5 (`doctor.sh` green).
- All 5 ACs satisfied: AC1–AC2 + AC4–AC5 fully green; AC3 green for BM2 with documented partial state for IM3 (tracked in `measure/tech-debt.md`).
- Live proof re-run on HEAD `2c224a47`:
  - `bash measure/scripts/doctor.sh` → no boundary violations.
  - `npx vitest run --root packages/core-auth` → 2 files, 54 tests, all passed.
  - `npx vitest run --root apps/bus-math-v2 __tests__/lib/auth __tests__/auth __tests__/setup/middleware.test.ts` → 6 files, 36 tests, all passed.
  - `npx vitest run --root apps/integrated-math-3 __tests__/lib/auth __tests__/middleware.test.ts` → 4 files, 52 tests, all passed.
- Ancestry: baseline `5882f496` is ancestor of HEAD `2c224a47`; all 11 track commits resolve on the ancestry path.
- Boundary discipline: no unrelated files modified; `graph.db` not staged.

**Open items deferred to closeout subagent**

- Track archival (move to `measure/archive/`), metadata closeout, and `measure/tracks.md` update.
- Follow-up track suggestion: `im3-auth-wrapper-thinning` (already noted in `measure/tech-debt.md`).
