# Track: E2E Coverage Expansion

Program: Quality & Completion Backlog (Tier 1)
Type: Chore
Depends on: e2e-student-flows_20260502 (infrastructure complete)

## Overview

`e2e-student-flows_20260502` is marked "INFRASTRUCTURE COMPLETE (Playwright
config + 9 tests)". The harness exists but coverage of the critical flows is
thin. This track expands E2E coverage to assert the high-value student and
teacher journeys end-to-end against a seeded environment, and wires the suite
into CI as a gating job.

## Functional Requirements

- FR1 — Auth flows. Student and teacher login, logout, role-gated redirects,
  and deactivated-credential denial.
- FR2 — Student lesson flow. Dashboard → lesson entry → phase navigation →
  activity submission → completion → progress persistence (reload survives).
- FR3 — Activity interaction. At least one assertion per major activity type
  (graphing, step-by-step solver, comprehension quiz, fill-in-the-blank).
- FR4 — Daily practice. Start a session, answer cards, submit, see SRS-driven
  completion and streak/progress update.
- FR5 — Teacher flow. Dashboard → gradebook/heatmap drilldown → student detail →
  submission review; lesson assignment to a class.
- FR6 — CI integration. The expanded suite runs in CI against a seeded demo
  deployment with stable selectors and deterministic seed data.

## Non-Functional Requirements

- Tests use data-test selectors, not brittle text/DOM coupling.
- Deterministic seeding; no reliance on prior-run state; parallel-safe.
- Flake budget: a retried-once policy; quarantine flaky specs explicitly.

## Acceptance Criteria

- AC1 — All FR1–FR5 flows have passing E2E specs.
- AC2 — Reload-persistence assertions confirm progress/SRS writes.
- AC3 — Suite runs green in CI as a required job.
- AC4 — Stable selectors documented; seed fixtures committed.
- AC5 — `tsc --noEmit` and unit suites remain green.

## Out of Scope

- Visual-regression/screenshot diffing.
- Cross-browser matrix beyond the existing target.
- BM2 flows (IM3-focused; BM2 follow-up optional).
