# Track: Unified Auth Across the Monorepo — Implementation Plan

Workflow: Contract-First (package API surface), then per-task TDD.
Verification gate each phase: `tsc --noEmit` (BM2 + IM3) + auth/middleware tests.

## Phase 1 — Audit & Classification

- [~] Task: Inventory exports of `apps/bus-math-v2/lib/auth/server.ts`, `apps/integrated-math-3/lib/auth/server.ts`, and `packages/core-auth` public API
- [~] Task: Classify each BM2 export: identical-to-package / generalizable / BM2-specific; record the target home (Contract-First decision doc)

### Phase 1 Red Evidence

- Baseline SHA: `5882f49671d6b65ad274fda68ceca3a56a25660c`
- RED_TEST_COMMAND: `npx vitest run unified-auth-monorepo --root apps/bus-math-v2`
- Expected failure: Contract-First decision doc `measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md` does not exist.
- Actual output: `1 failed | 1 passed` — `exports exactly the expected public identifiers` passes; `exists and contains a classified section for every BM2 export` fails with `ENOENT: no such file or directory, open .../auth-export-classification.md`.
- Commit SHA (Phase 1 Red): `aaa04b08`

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
