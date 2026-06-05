# Track: Responsive / Mobile Audit — Implementation Plan

Workflow: audit-first, then remediate highest-impact breakpoints; viewport guard as regression net.
Verification: boundary lints + per-app lint/test + `tsc --noEmit` + viewport checks.

## Phase 1 — Audit Baseline & Guard

- [ ] Task: Audit key routes at phone/tablet/desktop breakpoints; document prioritized failures
- [ ] Task: Stand up viewport-sized Playwright checks (overflow/clipping) over representative routes (failing on known-bad fixture)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Activity Components & Shell

- [ ] Task: Remediate activity components for touch/small screens (hit targets, scroll, controls) (token-level where possible)
- [ ] Task: Remediate app shell, lesson navigation, dialogs for small viewports
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Views & Verification

- [ ] Task: Make gradebook/heatmaps/dashboards degrade gracefully on tablet
- [ ] Task: Wire viewport guard into CI; final verification (lint, tsc --noEmit, tests)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
