# Track: Learning Efficacy & Analytics

Program: High-Leverage Backlog (Tier 2)
Type: Feature
Depends on: SRS engine (live); richer signal after KST Track 1

## Overview

The platform has a sophisticated FSRS + KST learning engine, but a codebase
check confirms there is **no** instrumentation measuring whether it actually
improves learning — no outcome metrics, cohort comparison, or experiment
framework. This track adds an efficacy measurement layer: derive learning-outcome
metrics from existing SRS/practice data, expose them to instructors/admins, and
provide a lightweight A/B assignment + analysis harness so engine changes (e.g.,
the KST v2 improvements) can be evaluated rather than assumed.

## Functional Requirements

- FR1 — Outcome metrics. Compute retention curves, time-to-mastery per
  objective/skill, first-attempt accuracy trends, and review-success rate from
  existing SRS card states + review log + practice submissions.
- FR2 — Cohort comparison. Aggregate metrics by class/cohort and time window with
  privacy-safe minimums (suppress small-n).
- FR3 — Experiment assignment. A deterministic, sticky A/B assignment primitive
  (student → variant) with a registry of active experiments and guardrails.
- FR4 — Experiment analysis. Per-experiment metric comparison (variant A vs B)
  with sample sizes and a simple significance indicator; read-only report.
- FR5 — Surfaces. An admin/teacher efficacy view rendering the metrics + active
  experiments, reusing the reporting IA.
- FR6 — Privacy & boundaries. No PII in analytics payloads; metric computation is
  pure and testable; reusable metric logic extractable for sibling courses.

## Non-Functional Requirements

- Metrics derived from existing tables — no new heavy write path in hot loops.
- Batched/aggregated Convex reads (no N+1); precompute where needed.
- Pure metric functions with >80% coverage; statistics are explainable, not opaque.

## Acceptance Criteria

- AC1 — Retention, time-to-mastery, accuracy, and review-success metrics computed and tested on fixtures.
- AC2 — Cohort aggregation respects small-n suppression (tested).
- AC3 — A/B assignment is deterministic + sticky; experiment registry enforced (tested).
- AC4 — Experiment report compares variants with sample sizes + significance indicator.
- AC5 — Efficacy view renders for authorized roles; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Causal inference beyond simple A/B comparison.
- External analytics/BI integrations.
- Changing the learning engine itself (measurement only).
