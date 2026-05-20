# Track 3: Edge Calibration Loop

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model
Improvement Plan: Item 3

## Overview

Prerequisite edges are derived from *lesson sequence* (`edge-suggestions.ts`),
which is not the same as prerequisite structure. The graph is authored once and
never validated against student outcomes. The product's headline promise ("never
asks a student to learn something they're not ready for") is only as good as the
authored edges.

This track adds a data-driven calibration loop: a Beta-Bernoulli posterior per
`prerequisite_for` edge, computed from paired objective-proficiency verdicts, that
surfaces a human review queue of edges whose evidence diverges from their
authored weight/confidence. The graph is never auto-edited.

## Functional Requirements

- FR1 — Observation extraction. An observation is a pair of objective-proficiency
  verdicts for one student on `(A, B)` where the student has a verdict on both.
  Use proficiency verdicts, not single attempts.
- FR2 — Contingency table and statistics. Per `prerequisite_for` edge `A → B`,
  maintain the 2×2 table (proficient/not-proficient A × proficient/not B) and
  compute: **necessity** = `1 − P(proficient B | not proficient A)`;
  **informativeness (lift)** = `P(proficient B | proficient A) −
  P(proficient B | not proficient A)`.
- FR3 — Beta-Bernoulli posterior. Model edge necessity as `Beta(α, β)`:
  consistent observations increment `α`, violations increment `β`.
  `weight ← posterior mean`; `confidence ← bucketed posterior variance`.
- FR4 — Recency decay. Periodically multiply `α, β` by `λ < 1` so the posterior
  tracks recent cohorts.
- FR5 — Confounding guardrail. If no student has attempted `B` without a verdict
  on `A`, necessity is *unmeasured*, not *confirmed*. Define a third status
  `untested`, distinct from `confirmed` / `refuted`.
- FR6 — Calibration review queue. Edges whose calibrated posterior diverges from
  authored `weight` / `confidence` beyond a threshold are flagged with their
  contingency table for human review, reusing the `reviewStatus` machinery.
- FR7 — Persistence. Convex tables for per-edge calibration state (`α`, `β`,
  `lastUpdated`, status) and the review queue; domain-neutral core logic, app-
  specific persistence in the app.

## Non-Functional Requirements

- The graph is never auto-edited — output is a human review queue only.
- Calibration core is pure and domain-neutral; Convex persistence is app-local.
- Incremental updates (no full recomputation per observation).
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — Observation extraction produces paired verdicts; tested with synthetic
  cohorts.
- AC2 — Necessity and informativeness computed from the contingency table.
- AC3 — Beta-Bernoulli posterior updates incrementally; weight/confidence derived.
- AC4 — Recency decay applied; recent observations dominate.
- AC5 — `untested` distinguished from `confirmed` / `refuted` via the confounding
  guardrail.
- AC6 — Review queue lists divergent edges with contingency tables.
- AC7 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- Acting on the review queue (human curation task).
- Calibrating cross-course `equivalent_to` edges.
- Auto-editing the graph from calibration output.
