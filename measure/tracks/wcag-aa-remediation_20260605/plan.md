# Track: WCAG 2.1 AA Remediation — Implementation Plan

Workflow: Contract-First (findings + gate), then per-task TDD. >80% coverage on new logic.
Verification substitute for Doctor: `node scripts/check-monorepo-boundaries.mjs` + per-app `npm run ws:<app>:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Triage & Gate Harness

- [ ] Task: Produce prioritized findings list from the audit baseline (grouped by surface + success criterion + severity)
- [ ] Task: Stand up axe-core a11y assertions in the Playwright/E2E harness (TDD: failing check on a known-bad fixture)
- [ ] Task: Define the representative route set the gate runs over
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Shared Activity Components (packages)

- [ ] Task: Remediate keyboard/focus + role/name/state on graphing + step-by-step-solver (TDD)
- [ ] Task: Remediate quizzes, fill-in-the-blank, study-hub games (TDD)
- [ ] Task: Announce dynamic answer feedback via live regions (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Student Routes

- [ ] Task: Remediate lesson/phase navigation + dashboard (keyboard, landmarks, headings) (TDD where logic exists)
- [ ] Task: Remediate daily-practice + completion states
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Routes & Color/Contrast

- [ ] Task: Remediate gradebook, heatmaps, dashboards — no color-only meaning; AA contrast tokens (TDD on tokens)
- [ ] Task: Remediate forms/dialogs (assignment UI, interventions)
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5 — CI Gate & Verification

- [ ] Task: Wire the a11y gate into CI; prove it fails on an injected serious violation
- [ ] Task: Final verification — boundary lints, per-app lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
