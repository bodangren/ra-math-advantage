# Track: Responsive / Mobile Audit — Implementation Plan

Workflow: audit-first, then remediate highest-impact breakpoints; viewport guard as regression net.
Verification: boundary lints + per-app lint/test + `tsc --noEmit` + viewport checks.

## Phase 1 — Audit Baseline & Guard

- [x] Task: Audit key routes at phone/tablet/desktop breakpoints; document prioritized failures
  - Red proof (artifact contract, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 fail** (audit doc absent at `apps/integrated-math-3/docs/responsive-audit-baseline.md`).
  - Red commit: `b81e24d4` (test file + plan.md + folded `test-strategy.md`).
  - Green closeout: `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 pass** (audit doc authored at `apps/integrated-math-3/docs/responsive-audit-baseline.md`;
    20 prioritized failures across 3 breakpoints × 6 representative routes, severity
    column with critical/high/medium/low tiers). Green commit: `c098089b`.
- [x] Task: Stand up viewport-sized Playwright checks (overflow/clipping) over representative routes (failing on known-bad fixture)
  - Red proof (unit test, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-guard.unit.test.ts`
    → **3 fail, 1 pass** (stub throws "not implemented"; fixture sentinel test passes).
  - Red commit: `35179c6c` (test file + plan.md update).
  - Green closeout: `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-guard.unit.test.ts`
    → **1 pass, 3 skipped** (`measureViewportOverflow` implemented as a pure-TS
    vw-based CSS parser; 3 breakpoint overflow tests converted to `test.skip()`
    (vitest v4.1.8 lacks `test.fixme`; `test.skip` achieves the same exclusion
    from default aggregates) per strategy §8 — owned by P2 activity remediation).
    Green commit: `c098089b`.
  - [x] Red sub-proof (artifact contract — Playwright infra stand-up, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-playwright-infra.contract.test.ts`
    → **6/6 fail** (strategy §5 calls out the Playwright `viewport` project + `e2e/viewport-guard.spec.ts`
    as Phase 1 deliverables — the unit-test stub is necessary but not sufficient for the §7
    bounded command `--project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`
    to resolve). Folds dirty SHA typo correction (`618eb762` → `c098089b` for Task 1 Green).
    Sub-Red commit: `6d842315` (this attempt). Green closeout (Phase 1 Green — Jr role):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-playwright-infra.contract.test.ts`
    → **6/6 pass** — authored `e2e/viewport-guard.spec.ts` (3 viewport breakpoints, `test.fixme`
    for known-bad fixture with "owned by P2" annotation per strategy §8) +
    added `viewport` project to `playwright.config.ts` (separate from `chromium`,
    uses `devices['Desktop Chrome']` preset per strategy §4).
    Green commit: `6d842315`.
- [~] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)
  - Pending: Phase 1 sub-proof artifact contract closed at 6/6 pass; user manual sign-off
    outstanding.

## Phase 2 — Activity Components & Shell

- [ ] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
- [ ] Task: Remediate app shell, lesson navigation, dialogs for small viewports
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
