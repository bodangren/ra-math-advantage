# Track: WCAG 2.1 AA Remediation

Program: Quality & Completion Backlog (Tier 1)
Type: Feature
Depends on: accessibility-audit_20260502 (automated baseline)

## Overview

The `accessibility-audit_20260502` track is marked "PHASE 1 COMPLETE
(automated audit baseline established)". The baseline surfaced findings but no
remediation followed. This track fixes the WCAG 2.1 AA violations on
student- and teacher-facing routes and on the shared activity components, then
locks the gains with an automated a11y gate so regressions fail CI.

## Functional Requirements

- FR1 — Triage. Convert the audit baseline into a prioritized, deduplicated
  findings list grouped by surface (route / shared component) and success
  criterion, with severity (blocker / serious / moderate).
- FR2 — Keyboard & focus. All interactive elements are reachable and operable by
  keyboard; visible focus indicators; no keyboard traps; logical tab order.
- FR3 — Screen reader semantics. Correct roles/names/states (labels, `aria-*`,
  landmarks, headings) on forms, activity components, dashboards, and dialogs.
- FR4 — Color & contrast. Text and meaningful non-text elements meet AA contrast;
  information is not conveyed by color alone (e.g., heatmaps, status chips).
- FR5 — Activity components. The `practice.v1` activity components (graphing,
  step-by-step solver, quizzes, fill-in-the-blank, games) are operable and
  announced correctly, including dynamic answer feedback.
- FR6 — Regression gate. An automated a11y check (axe-core via the existing
  Playwright/E2E harness) runs in CI over a representative route set and fails on
  new serious/blocker violations.

## Non-Functional Requirements

- Fixes must not regress existing tests; shared-component fixes land in packages
  and are adopted by all consuming apps.
- TDD where logic exists (focus managers, color tokens); component a11y verified
  via Testing Library role/name assertions.

## Acceptance Criteria

- AC1 — Prioritized findings document committed under the track.
- AC2 — Zero blocker/serious axe violations on the audited student/teacher routes.
- AC3 — Keyboard-only walkthrough of one full lesson and one teacher flow passes.
- AC4 — Activity components pass role/name/state assertions in tests.
- AC5 — CI a11y gate is green and fails on an injected violation (proof test).
- AC6 — `npm run lint`, `tsc --noEmit`, and all app test suites pass.

## Out of Scope

- WCAG AAA criteria.
- Full manual screen-reader certification across every route (representative
  sample only).
- Net-new components (remediation of existing surfaces only).
