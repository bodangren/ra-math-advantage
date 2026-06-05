# Track: Transfer-Credit Runtime

Program: High-Leverage Backlog (Tier 2)
Type: Feature
Depends on: skill-cross-course-equivalence_20260509 (edges); wire-kst-pipeline_20260521 (KST learner state)

## Overview

Skill Graph Track 13 authored `equivalent_to` edges across IM1/IM2/IM3/PreCalc,
and wired SRS/teacher projections to treat equivalence components as single
learner-state targets. A codebase check confirms this is **not surfaced to
students at runtime** — a learner who mastered a skill in IM2 still grinds its
IM3 equivalent. This track turns the authored equivalence asset into student
value: transfer mastery across equivalent skills and let students skip
already-mastered work, transparently and reversibly.

## Functional Requirements

- FR1 — Equivalence resolution. Resolve a skill to its equivalence component and
  pull cross-course mastery from KST learner state for the whole component.
- FR2 — Transfer policy. Define how equivalent mastery seeds a target-course
  skill's knowledge state (confidence-discounted, never blindly "100%"),
  configurable and testable.
- FR3 — Skip eligibility. A skill/lesson is "transfer-eligible" when its
  component mastery exceeds a threshold; expose this in the next-skill/practice
  path so the student can skip or fast-check.
- FR4 — Student UX. Show "You already mastered this in <course>" with an option
  to skip or take a short confirmation check; skipping is reversible.
- FR5 — Confirmation check. An optional brief verification before granting skip,
  to guard against stale/over-credited transfer.
- FR6 — Teacher visibility. Transfer credits are visible/auditable to teachers.

## Non-Functional Requirements

- Transfer logic is pure + domain-neutral where possible; course wiring app-local.
- Confidence-discounted, reversible — never silently inflate mastery.
- Batched reads; no N+1 across components.

## Acceptance Criteria

- AC1 — Equivalence component resolution returns correct cross-course mastery (tested).
- AC2 — Transfer policy seeds target knowledge state with discounted confidence (tested).
- AC3 — Transfer-eligible skills are flagged in the practice/next-skill path.
- AC4 — Student can skip or take a confirmation check; skip is reversible.
- AC5 — Teacher view shows transfer credits; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Authoring new equivalence edges (T13 owns the graph).
- Cross-institution credit/transcripts.
- `transfers_to` partial-transfer edges (KST Lesser Holes T8).
