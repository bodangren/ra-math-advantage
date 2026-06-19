# Track: Responsive / Mobile Audit — Implementation Plan

Workflow: audit-first, then remediate highest-impact breakpoints; viewport guard as regression net.
Verification: boundary lints + per-app lint/test + `tsc --noEmit` + viewport checks.

## Phase 1 — Audit Baseline & Guard

- [~] Task: Audit key routes at phone/tablet/desktop breakpoints; document prioritized failures
  - Red proof (artifact contract, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 fail** (audit doc absent at `apps/integrated-math-3/docs/responsive-audit-baseline.md`).
    Owner of live gate: same test re-run on the closeout commit (AC1). Documented in
    `apps/integrated-math-3/__tests__/responsive/audit-baseline.contract.test.ts` (file
    contract + 5 shape assertions: existence, "prioritized failures" heading, severity
    tier, 3-breakpoint coverage, 6-route coverage per strategy §2 + §5).
- [~] Task: Stand up viewport-sized Playwright checks (overflow/clipping) over representative routes (failing on known-bad fixture)
  - Red proof (live Playwright, MID role):
    `CI=true npx playwright test --config apps/integrated-math-3/playwright.config.ts --project=viewport e2e/viewport-guard.spec.ts -g "known-bad fixture"`
    → **3 fail, 1 pass** (phone/tablet/desktop overflow assertions FAIL with the
    expected Red signal — guard correctly detects the deliberate `200vw` overflow;
    fixture-file existence assertion PASSES, gating downstream failures correctly).
    Owner of live gate: same command on the closeout commit (Phase 3 CI wiring per
    strategy §7). Stand-up includes: `viewport` Playwright project
    (`apps/integrated-math-3/playwright.config.ts`), per-project webServer pointing
    at `scripts/viewport-fixture-server.mjs`, `public/responsive-audit/__known-bad-fixture.html`
    static fixture, `e2e/viewport-guard.spec.ts` guard with inline per-test HTTP
    server fallback for environments without the dev webServer.
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Activity Components & Shell

- [ ] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
- [ ] Task: Remediate app shell, lesson navigation, dialogs for small viewports
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
