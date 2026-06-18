# Track 4: Next-Skill Planner

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Feature
Depends on: Track 2 — Weighted Readiness. Integrates Track 6 — Misconception
Remediation Loop (weaknessFit term); buildable with weaknessFit stubbed if
Track 6 is not yet done.
Improvement Plan: Item 4

## Overview

The outer fringe is an unranked *set* — for a large graph a mid-progress learner
has dozens of "ready" skills. `recommendedNext` is currently
`[...ready, ...unknown].slice(0, 5)` — arbitrary order. Edge probability orders
by *readiness*, but not by *value*: a skill that unlocks 30 downstream skills
should beat an equally-ready dead-end.

This track adds a planner that ranks the ready / nearly-ready set by a composite
priority score.

## Functional Requirements

- FR1 — Unlock value. `unlockValue(B)` = count (optionally weight-discounted) of
  skills reachable downstream from `B` via `prerequisite_for` edges. Graph-
  structural; precomputable.
- FR2 — Goal proximity. `goalProximity(B)` = inverse graph distance from `B` to
  the learner's goal node(s) if a goal is set; 0 otherwise.
- FR3 — Weakness fit. `weaknessFit(B)` = boost if `B` is linked (via `supports` /
  `common_misconception_with`) to a recently-failed area or an active
  misconception (Track 6). Stubbed to 0 if Track 6 is not yet integrated.
- FR4 — Composite priority.
  `priority(B) = a·readiness(B) + b·unlockValue(B) + c·goalProximity(B) +
  d·weaknessFit(B)`, with `a, b, c, d` configurable engine weights.
- FR5 — recommendedNext. `recommendedNext` becomes top-N by `priority`, replacing
  the `slice(0, 5)` placeholder. Visualization §7 updated.

## Non-Functional Requirements

- Domain-neutral; pure, deterministic scoring; no app/convex imports in core.
- `unlockValue` precomputed once per graph, not per request.
- Contract-first then TDD; >80% coverage on new modules.

## Acceptance Criteria

- AC1 — `unlockValue`, `goalProximity`, `weaknessFit` each implemented and tested.
- AC2 — Composite `priority(B)` computed with configurable weights.
- AC3 — `recommendedNext` is top-N by priority; tested against a multi-skill
  ready set.
- AC4 — Student visualization consumes the ranked output.
- AC5 — Boundary lints, `tsc --noEmit`, and all tests pass.

## Out of Scope

- Goal-setting UI / how a learner's goal node is chosen.
- Adaptive placement (Track 5).
