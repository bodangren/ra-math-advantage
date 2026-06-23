# Track: Responsive / Mobile Audit

Program: Strategic Backlog (Tier 3)
Type: Chore
Depends on: none (coordinates with wcag-aa-remediation_20260605 on shared components)

## Overview

Students frequently work on tablets and phones, but the apps have not been
audited for responsive behavior. This track establishes a responsive baseline
across the key student and teacher surfaces, remediates the highest-impact
breakpoint failures (especially interactive activity components and data-dense
teacher views), and adds a lightweight viewport regression guard.

## Functional Requirements

- FR1 — Audit baseline. A documented audit of key routes at standard breakpoints
  (phone, tablet, desktop), listing failures by severity.
- FR2 — Activity components. The `practice.v1` activity components (graphing,
  solver, quizzes, games) are usable and legible on touch/small screens —
  hit targets, scrolling, no clipped controls.
- FR3 — Navigation & layout. App shell, lesson navigation, and dialogs adapt to
  small viewports (no horizontal overflow, reachable controls).
- FR4 — Teacher data views. Gradebook/heatmaps/dashboards degrade gracefully on
  tablet (scroll/stack rather than break).
- FR5 — Regression guard. A small set of viewport-sized checks (Playwright) over
  representative routes to catch overflow/clipping regressions.

## Non-Functional Requirements

- Prefer shared/token-level fixes in packages over per-app patches; consuming
  apps adopt.
- Touch hit targets meet a minimum size; coordinate with the a11y track.
- No functional regressions; TDD on any layout logic helpers.

## Acceptance Criteria

- AC1 — Audit baseline committed with prioritized failures.
- AC2 — Activity components usable + legible on phone/tablet (verified).
- AC3 — No horizontal overflow / clipped controls on the audited routes.
- AC4 — Teacher data views degrade gracefully on tablet.
- AC5 — Viewport regression guard runs in CI; lint, tsc --noEmit, tests pass.

## Out of Scope

- Native mobile apps / PWA offline (separate track).
- Full redesign — remediation of existing layouts only.
- Pixel-perfect parity across every device.
