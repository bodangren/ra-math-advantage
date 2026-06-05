# Track: Load / Scale Testing — Implementation Plan

Workflow: Contract-First (seed + report schemas), then build drivers; budgets as tests.
Verification: harness runs green; `tsc --noEmit` on TS helpers.

## Phase 1 — Scale Seeds

- [ ] Task: Deterministic 30-student class seed (enrollments, cards, reviews, submissions) (TDD on generators)
- [ ] Task: Deterministic 1,000-student school seed at realistic density
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Hot-Path Drivers & Cost Capture

- [ ] Task: Drivers for teacher proficiency/dashboard, daily-practice queue, gradebook/heatmaps, curriculum summaries
- [ ] Task: Capture Convex insights (docs/bytes/time/OCC) into a comparable report
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Budgets & CI

- [ ] Task: Record baselines; define per-path budgets; harness fails on injected regression (proof test)
- [ ] Task: Add scheduled/manual CI job against a scale deployment posting the report
- [ ] Task: Log discovered hotspots as Tech Debt rows with measured cost
- [ ] Task: Final verification — harness green, tsc --noEmit, tests
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
