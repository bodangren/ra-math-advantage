# Test Strategy — Dependency Security & Package Upgrades

This is a **chore track**: the unit under test is the audit contract and each
upgrade wave, not new feature code. The strategy treats every existing test
suite (per-app + per-package) as the regression net, and adds one small
**audit-contract unit suite** that is durable across waves.

## 1. Testing Pyramid Per Phase

| Phase | Unit (new) | Component/Integration (existing) | System (existing) |
|---|---|---|---|
| P1 Audit Contract | Heavy — audit-report schema + fixture parser | Light — `scripts/check-monorepo-boundaries.mjs` smoke | `npm ls --workspaces --depth=0`, `npm audit` baseline snapshot |
| P2 Security | None new | Re-run PTE suite (post-Vitest 4 migration) + apps affected by Next/React/Convex | All 5 app `build` + `npm audit` (0 critical/high) |
| P3 In-Range Refresh | Red-phase TDD suite pinning the four P3 deliverables (drift disposition, advisory disposition, in-range targets, quality-gates fixtures) — see `__tests__/in-range-wave-w3.test.ts` | All package + app `test` suites | All 5 app lint/test/typecheck/build + boundary check |
| P4 Framework Majors | None new | Per-migration: package suites then 5 app suites, isolated per migration | All 5 app build, audit, `npm ls` after each major |
| P5 Remaining Majors | Extend P1 audit-contract fixture for deferral evidence | Tailwind v4 visual snapshots (where present), KaTeX/Lucide consumer tests | Full repo gate (AC8) |

**Rule:** No upgrade wave is considered green until the pyramid for *that*
wave is green. Skipped suites are tracked in `plan.md` as known-failures, not
silently dropped.

## 2. Shared Fixtures & Mocks

- **`audit-baseline.json`** (P1 deliverable, lives under this track dir): the
  frozen pre-upgrade snapshot — 62 direct deps, 36 candidates, 18 advisories
  (1C/3H/14M). Every wave diffs against it.
- **`package-wave-matrix.json`** (P1): the 36-row table from spec §"Confirmed
  Upgrade Inventory" with wave assignment, current → target, owner manifest.
  Used by the audit-contract test as the source of truth.
- **Registry mock**: tests of the audit contract must NOT hit npm registry.
  Stub `npm view`/registry calls with a fixture file so the contract test is
  hermetic and CI-safe.
- **No new app-level mocks.** Existing per-app `__tests__/setup` (jsdom,
  vitest config) are reused unchanged — proving they survive each upgrade IS
  the test.

## 3. Cross-Phase Edge Cases & Dependencies

- **`"next": "latest"` drift (FR4):** add a contract assertion in P1 that
  fails if any app manifest re-introduces an open `latest` or `*` range for
  `next`, `react`, `react-dom`, `vite`, `vitest`. This assertion must keep
  passing through P2–P5.
- **PTE Vitest 2 → 4 (P2) blocks P3+ ESLint/TS work:** Vitest 4 may require
  config-syntax updates; run PTE `test` *and* `typecheck` together; do not
  let a green `test` mask broken `tsc --noEmit`.
- **Single root lockfile invariant (FR10, AC7):** every phase verification
  asserts `package-lock.json` count = 1 and no nested
  `node_modules/<workspace>/package-lock.json`.
- **`drizzle-kit` moderate advisory (FR9):** explicit negative test — audit
  contract fails if a wave silently downgrades `drizzle-kit` below current.
- **Next 15 → 16 (P4) vs `eslint-config-next` (P3 declaration align):** the
  P3 alignment must not pin `eslint-config-next@15` in a way that blocks P4;
  use a range that admits 16, or defer alignment to P4. Capture in matrix.
- **vinext 0.0.5 → 0.0.55 (P4) drags React/RSC peers:** P2 already lifted
  React to 19.2.7 and `@vitejs/plugin-rsc` to 0.5.27 — re-verify peer
  satisfaction after vinext bump, do not re-bump React in P4.
- **Tailwind 3 → 4 (P5):** breaking config + PostCSS pipeline; requires
  per-app build verification, not just unit tests. KaTeX 0.17 + Lucide v1
  may break shared `packages/lesson-renderer` and
  `packages/activity-components` consumers — run their suites first.

## 4. Architecture Guardrails

- `node scripts/check-monorepo-boundaries.mjs` MUST pass after every wave.
  No upgrade may introduce a new cross-boundary import (e.g., a package
  pulling `apps/*` or `convex/_generated/*`).
- `packages/*` must remain runtime-isolated; PTE Vitest 4 migration must not
  cause PTE to import from `apps/*`.
- The root `package.json` `workspaces` field stays
  `["apps/*","packages/*"]`. No new workspace globs.
- Only one root `package-lock.json`. No per-app lockfile, no `--legacy-peer-deps`
  pinned in npmrc as a workaround.
- Never `npm audit fix --force` (NFR).

## 5. Per-Phase Test Approach Notes

- **P1:** TDD the audit-contract suite first — red on missing app, red on
  drift, red on under-count, green only when the contract matches the frozen
  baseline fixture. Snapshot `npm ls --workspaces --depth=0` and `npm audit
  --json` as the baseline; record pre-existing failures separately so P2+
  regressions are attributable.
- **P2:** Run PTE suite under Vitest 4 *before* declaring P2 done. After
  each of {Next, React, Convex, RSC, Vitest} bump, re-run affected app
  suites individually, then all 5 builds, then `npm audit` — must show 0
  critical/high.
- **P3:** Batch the in-range refresh in one install, then run the full
  per-app `lint/test/typecheck/build` matrix once. Drift reconciliation is
  verified by re-running the P1 audit contract (it should report zero
  unintentional drift rows) and by the new
  `__tests__/in-range-wave-w3.test.ts` Red-phase suite, which pins the four
  P3 Measure deliverables (`w3-drift-disposition.json`,
  `w3-in-range-targets.json`, `w3-advisory-disposition.json`,
  `w3-quality-gates.json`). The drift suite asserts the per-package floor
  for KaTeX (≥0.16.45), Lucide React (≥0.511.0), tailwind-merge (≥3.3.0),
  ts-fsrs (≥5.3.2), Vitest (≥4.1.8), ESLint (≥9.39.4), and `eslint-config-next`
  (≥15.3.1 with a `^` range that admits 16.x for W4), plus a single-major
  invariant for `@types/node`. The advisory suite guards `drizzle-kit`
  (FR9) and pins the post-W3 fixture shape.
- **P4:** One migration per commit. After each, full per-app matrix + audit
  + `npm ls`. If a single app fails an isolated migration, revert that
  install — do not patch downstream.
- **P5:** Same isolation rule as P4. Final gate runs AC8 end-to-end. The
  audit-contract test now asserts every one of the 36 rows is either
  upgraded or has a documented deferral with owner.

## 6. Build-Graph Findings That Shaped This Strategy

`build-graph stats ./graph.db` (fresh today): **2,041 files, 13,529 nodes,
20,200 edges across 26 packages, 5 apps**. Findings:

- **No central "engine" symbol to mock.** Heaviest files are schemas
  (`apps/bus-math-v2/lib/db/schema/*`, 262/114/97 entities) and curriculum
  manifests. Upgrades affect files broadly via TS/React/Vite, so the
  regression net IS the existing per-app suites — not new upgrade-specific
  unit tests.
- **`packages/practice-test-engine` is tiny** (2 files in graph, single
  `index.ts` of types + one const, one `__tests__/index.test.ts`). Vitest
  2 → 4 risk is **config syntax**, not test logic — P2 keeps it one task.
- **`search "boundar"`** confirms `scripts/check-monorepo-boundaries.mjs`
  is the sole boundary enforcer; it excludes `__tests__/`, so audit-contract
  fixtures can legally contain boundary strings.
- **`search "audit"`** shows `audit` is overloaded (curriculum, axe,
  component-approval). The new dependency-audit contract must live under
  this track dir or `scripts/`, NOT under any app's `lib/curriculum/audit.ts`
  namespace, to avoid collision and graph ambiguity.
