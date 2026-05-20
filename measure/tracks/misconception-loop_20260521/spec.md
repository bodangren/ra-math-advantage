# Track 6: Misconception Remediation Loop

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model
Improvement Plan: Item 6

## Overview

`misconception` nodes, `common_misconception_with` edges, and `misconceptionTags`
exist — misconceptions are thoroughly *recorded* but never *consumed* to change
instruction. The one existing consumer, `computeBaseRating`, forces a full
`Again` on any misconception tag, with no remediation routing and no per-student
lifecycle.

This track closes the loop: misconceptions point at their remedy, a detected
misconception adjusts (rather than always maxes out) the SRS penalty, and a
per-student lifecycle drives remediation until the misconception is resolved.

## Functional Requirements

- FR1 — `remediated_by` edge type. New edge type `remediated_by`
  (`misconception → worked_example | task_blueprint | skill`). Add to the edge
  type union, schemas, the §2.7 endpoint-pairing rules, and validation.
- FR2 — Rating-cap reconciliation. Resolve the divergence between the v1
  implementation (`computeBaseRating` forces `Again` on any misconception tag)
  and the v2 plan. Decision: a detected misconception **caps the rating at
  `Hard`** by default; it forces `Again` only when the misconception is marked
  **severe** (severity read from misconception node metadata or tag). Update
  `computeBaseRating` accordingly.
- FR3 — Per-student misconception lifecycle. A misconception is `active` when
  detected and becomes `resolved` after N consecutive clean attempts on the
  affected skill(s). Persist per-student misconception state in Convex.
- FR4 — Planner injection. While a misconception is `active`, its `remediated_by`
  activity is injected into the practice queue ahead of normal progression, and
  it feeds the Track 4 planner's `weaknessFit` term.
- FR5 — Projections. Add an active-misconception count to the student and teacher
  views; the teacher `misconceptionClusters` projection already exists.

## Non-Functional Requirements

- `remediated_by` and lifecycle types are domain-neutral; Convex persistence is
  app-local.
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — `remediated_by` edge type defined with an endpoint-pairing rule; validated.
- AC2 — `computeBaseRating` caps at `Hard` by default, `Again` only for severe
  misconceptions; tested for both paths.
- AC3 — `active → resolved` lifecycle implemented and persisted; resolution after
  N consecutive clean attempts; tested.
- AC4 — Active misconceptions inject their `remediated_by` activity into the queue
  and feed the planner's `weaknessFit` term.
- AC5 — Student and teacher views expose active-misconception counts.
- AC6 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- Authoring remediation content (worked examples / task blueprints).
- Misconception detection itself (already exists via `misconceptionTags`).
