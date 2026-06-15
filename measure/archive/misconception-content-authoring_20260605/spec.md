# Track: Misconception Content Authoring

Program: High-Leverage Backlog (Tier 2)
Type: Feature (content + authoring)
Depends on: misconception-loop_20260521 (KST T6: remediated_by edges, lifecycle)

## Overview

KST Track 6 builds the misconception *mechanism* — `remediated_by` edge type,
SRS rating-cap reconciliation, per-student active/resolved lifecycle, and planner
injection of remediation activities. The mechanism is inert without content:
there is no authored misconception taxonomy nor remediation activities tied to
it. Existing `distractors.ts` data is a starting signal but not a structured
misconception model. This track authors a source-grounded misconception
taxonomy for a prioritized skill set, links misconceptions to detecting
distractors and to remediation activities via `remediated_by`, so the T6 loop
actually fires.

## Functional Requirements

- FR1 — Taxonomy schema. A misconception node schema (id, description, affected
  skills, detection signals) consistent with the knowledge-space contract.
- FR2 — Detection mapping. Link misconceptions to the distractors/answer patterns
  that signal them, reusing existing `distractors.ts` where possible.
- FR3 — Remediation activities. Author remediation activities (or map existing
  ones) targeted at each misconception, linked via `remediated_by` edges.
- FR4 — Prioritized coverage. Cover a high-value skill set first (e.g., IM3 M1 +
  the most common algebra misconceptions), not all skills.
- FR5 — Loop wiring. Verify the T6 loop consumes the authored content: detection
  → active misconception → injected remediation → resolution.
- FR6 — Authoring guidance. Document the authoring process so coverage can expand.

## Non-Functional Requirements

- Source-grounded misconceptions (research/curriculum-based), not invented.
- Content lives in app/domain content layers; schema/edge types stay in the
  domain-neutral contract.
- TDD on mapping/loop-wiring logic; content validated by schema + integrity check.

## Acceptance Criteria

- AC1 — Misconception taxonomy schema defined and validated.
- AC2 — Prioritized skill set has authored misconceptions linked to detection signals.
- AC3 — `remediated_by` edges connect misconceptions to remediation activities; integrity check passes.
- AC4 — T6 loop demonstrably fires on a seeded wrong-answer pattern (detection → remediation → resolution), tested.
- AC5 — Authoring guide committed; boundary lints, tsc --noEmit, tests pass.

## Out of Scope

- Building the T6 mechanism itself (owned by misconception-loop_20260521).
- Full-catalog misconception coverage (prioritized subset first).
- Auto-generating misconceptions via LLM (human/source-authored here).
