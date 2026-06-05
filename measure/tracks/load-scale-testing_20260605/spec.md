# Track: Load / Scale Testing

Program: High-Leverage Backlog (Tier 2)
Type: Chore
Depends on: none

## Overview

Performance work to date has been reactive — 10+ tracks fixed N+1 query patterns
after they were discovered. There is no proactive harness that exercises the
system at realistic class/school scale. This track builds a repeatable load +
scale harness that seeds representative data, drives the hot read/write paths,
and captures Convex cost (documents/bytes read, function time) via
`npx convex insights`, with budgets that fail when a path regresses.

## Functional Requirements

- FR1 — Scale seed. Deterministic seed generators for a 30-student class and a
  1,000-student school (students, classes, enrollments, SRS cards, review log,
  submissions) at realistic density.
- FR2 — Hot-path drivers. Scripts exercising the highest-cost paths: teacher
  class proficiency/dashboard, daily-practice queue, gradebook/heatmaps,
  curriculum/unit summaries.
- FR3 — Cost capture. Capture Convex insights (docs/bytes read, function
  execution time, OCC conflicts) per driven path into a comparable report.
- FR4 — Budgets. Per-path budgets (e.g., bytes read, function ms) that fail the
  harness when exceeded; baseline recorded.
- FR5 — CI hook (advisory). A scheduled/manual CI job runs the harness against a
  scale deployment and posts the report; regressions flagged.
- FR6 — Findings. Document any discovered hotspots as Tech Debt rows with the
  measured cost, feeding targeted fixes.

## Non-Functional Requirements

- Harness is deterministic and idempotent; teardown leaves no residue.
- Read-only against production-shaped data; runs on an isolated deployment.
- Reuses the N+1 lessons-learned patterns as expected-good baselines.

## Acceptance Criteria

- AC1 — Class-scale and school-scale seeds generate deterministically.
- AC2 — Hot-path drivers run and capture Convex insights into a report.
- AC3 — Per-path budgets recorded; harness fails on an injected regression (proof).
- AC4 — At least the known hot paths are measured with baselines committed.
- AC5 — Discovered hotspots logged as Tech Debt; `tsc --noEmit` and tests pass.

## Out of Scope

- Frontend rendering performance (separate concern).
- Fixing every hotspot found (this track measures + budgets; fixes are follow-ups).
- BM2 paths (IM3-focused first).
