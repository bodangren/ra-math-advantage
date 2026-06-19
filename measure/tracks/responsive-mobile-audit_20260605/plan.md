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
  - Red proof (unit test, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/viewport-guard.unit.test.ts`
    → **3 fail, 1 pass** (phone/tablet/desktop overflow assertions FAIL with the
    expected Red signal — the deliberately-bad fixture carries a `200vw`
    overflow-host that exceeds every breakpoint, so the guard's "no overflow"
    contract fails; sanity-check test (fixture contains the 200vw sentinel)
    PASSES so downstream failures are correctly attributable to the guard's
    missing implementation, not a fixture regression).
    Owner of live gate: Phase 1 closeout (Green) authors the real
    `measureViewportOverflow` implementation; Phase 1 closeout then converts
    the 3 overflow cases to `test.fixme(..., 'owned by P2 [~] activity
    remediation')` per strategy §8 so the deliberate one-shot Red stays out
    of the default `test:e2e` / `test:a11y` aggregates. Phase 3 reuses the
    same `measureViewportOverflow` helper inside the real Playwright spec
    (a future spec wires the helper against representative IM3 routes —
    this commit does not add the Playwright config / webServer / fixture
    HTML / server script because those would violate the Red-phase
    boundary by modifying non-test/non-Measure files; they belong to the
    Green/closeout role that authors the guard implementation).
    Self-contained: the fixture HTML is inlined in the test file as a
    string literal so the test runs under vitest without any external
    assets, dev:stack, or Playwright webServer.
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Activity Components & Shell

- [ ] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
- [ ] Task: Remediate app shell, lesson navigation, dialogs for small viewports
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
