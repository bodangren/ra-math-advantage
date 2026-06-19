# Track: Responsive / Mobile Audit — Implementation Plan

Workflow: audit-first, then remediate highest-impact breakpoints; viewport guard as regression net.
Verification: boundary lints + per-app lint/test + `tsc --noEmit` + viewport checks.

## Phase 1 — Audit Baseline & Guard

- [x] Task: Audit key routes at phone/tablet/desktop breakpoints; document prioritized failures (red: b81e24d4; green: c098089b)
  - Red proof (artifact contract, MID role, vitest):
    `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 fail** (audit doc absent at `apps/integrated-math-3/docs/responsive-audit-baseline.md`).
  - Red commit: `b81e24d4` (test file + plan.md + folded `test-strategy.md`).
  - Green closeout: `CI=true npx vitest run --root apps/integrated-math-3 __tests__/responsive/audit-baseline.contract.test.ts`
    → **5/5 pass** (audit doc authored at `apps/integrated-math-3/docs/responsive-audit-baseline.md`;
    20 prioritized failures across 3 breakpoints × 6 representative routes, severity
    column with critical/high/medium/low tiers). Green commit: `c098089b`.
- [x] Task: Stand up viewport-sized Playwright checks (overflow/clipping) over representative routes (failing on known-bad fixture) (red: 35179c6c, cca1c224; green: 6d842315)
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
  - MID role (2026-06-20) — workflow.md Phase Completion Protocol Steps 1–4
    preparation. Phase 1 has no remaining code/test Red to author (Tasks 1 & 2 are
    both Green at HEAD; see commits above). The remaining incomplete task IS the
    protocol sign-off itself, which has no testable code contract — it requires
    the user to manually confirm the audit baseline + Playwright infra stand-up
    meet expectations. Status: **blocked on user feedback** (Step 5 of the
    protocol).
  - **Step 2.3 — Test coverage check (workflow.md).** Six files added in Phase 1
    (`git diff --name-only b81e24d4^..HEAD -- apps/integrated-math-3/`):
    | File | Test covering it |
    |------|------------------|
    | `apps/integrated-math-3/docs/responsive-audit-baseline.md` | `__tests__/responsive/audit-baseline.contract.test.ts` (5 contract assertions on doc shape, severity tiers, 3 breakpoints, 6 representative routes) |
    | `apps/integrated-math-3/e2e/viewport-guard.spec.ts` | `__tests__/responsive/viewport-playwright-infra.contract.test.ts` (asserts spec exists, references VIEWPORTS, uses `test.fixme` + ownership annotation) |
    | `apps/integrated-math-3/playwright.config.ts` | `__tests__/responsive/viewport-playwright-infra.contract.test.ts` (asserts separate `viewport` project, `devices[...]` reference, post-`chromium` ordering) |
    | `__tests__/responsive/audit-baseline.contract.test.ts` | (self) |
    | `__tests__/responsive/viewport-guard.unit.test.ts` | (self) |
    | `__tests__/responsive/viewport-playwright-infra.contract.test.ts` | (self) |
    All non-test Phase 1 deliverables have a corresponding test. ✓
  - **Step 3 — Automated test evidence (workflow.md).** Bounded Red command run
    at HEAD (Phase 1 contract suite):
    `CI=true npx vitest run --root apps/integrated-math-3 \
      __tests__/responsive/audit-baseline.contract.test.ts \
      __tests__/responsive/viewport-guard.unit.test.ts \
      __tests__/responsive/viewport-playwright-infra.contract.test.ts`
    → **12 passed, 3 skipped, 15 total** (0 fail). The 3 skipped are the
    `viewport-guard.unit.test.ts` known-bad-fixture overflow cases committed as
    `test.skip()` per test-strategy §8 (one-shot Red converted to exclusion from
    default aggregates; vitest v4.1.8 lacks `test.fixme`, `test.skip` achieves the
    same effect). vitest v4.1.8; runtime ~28s.
  - **build-graph cross-check (Graph-Aware Mode).** `build-graph stats` reports
    14,179 nodes / 2,067 files (graph.db fresh 2026-06-20). `build-graph search
    viewport|mobile|breakpoint` returns **zero nodes** — confirms test-strategy
    §6 finding that the viewport guard is greenfield; no existing responsive
    test infra to integrate with. Responsive-aware components already present:
    `HeaderSimple`, `LessonStepper`, `StudentNavigation`, `TeacherNavigation`,
    `ChartContainer` (Recharts `ResponsiveContainer`). No new Phase 1 surface to
    author tests against.
  - **Step 4 — Proposed Manual Verification Plan (workflow.md).** The user is
    asked to confirm the following Phase 1 deliverables match expectations:
    1. **Audit baseline** (`apps/integrated-math-3/docs/responsive-audit-baseline.md`):
       20 prioritized failures across 3 breakpoints × 6 representative routes
       with severity tiers (critical 4, high 6, medium 5, low 5). Sanity-check
       the top 6 remediation candidates ordered for Phase 2.
    2. **Playwright viewport infra** (`apps/integrated-math-3/e2e/viewport-guard.spec.ts`
       + `apps/integrated-math-3/playwright.config.ts` `viewport` project):
       verify the spec uses `test.fixme` for the known-bad fixture with "owned
       by P2" annotation; verify `viewport` is a separate project from `chromium`.
       NB: the `viewport` project currently uses `devices['Desktop Chrome']` —
       §4 ideal is "3 device presets", but the contract test only requires a
       `devices[...]` reference (test passes). Phase 3 should harden the project
       to Pixel 5 / iPad / Desktop Chrome device presets when wiring CI.
    3. **Guard non-vacuous proof** (strategy §7): the known-bad-fixture
       `200vw` overflow-host sentinel is captured by `viewport-guard.unit.test.ts`
       (`width: 200vw` + `known-bad-overflow-host` data-testid) and by
       `e2e/viewport-guard.spec.ts` (3 viewport cases as `test.fixme`).
       Confirm the deliberate Red signal is preserved correctly.
    4. **Skip-exclusion honored**: `test.skip` (no `test.fixme` in vitest v4.1.8)
       on the 3 breakpoint overflow cases means the deliberate Red stays out of
       `test:e2e` / `test:a11y` aggregates until Phase 3 wires CI.
  - **Next role / handoff.** Awaiting user "yes" or feedback per workflow.md
    Step 5. On approval, the protocol proceeds to Step 6 (checkpoint commit) +
    Step 7 (git notes verification report) + Step 8 (record checkpoint SHA) +
    Step 9 (commit plan update). Phase 2 begins immediately on checkpoint.

## Phase 2 — Activity Components & Shell

- [ ] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
- [ ] Task: Remediate app shell, lesson navigation, dialogs for small viewports
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
