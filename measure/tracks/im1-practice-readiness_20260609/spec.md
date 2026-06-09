# Track: IM1 Practice Readiness

Program: Skill Graph Runtime Enablement
Type: Feature
Depends on: core-algebra-generators (T17), advanced-math-generators (T18),
geometry-stats-trig-generators (T19) mechanisms; wire-kst-pipeline (KST T1) for live state.

## Overview

The Skill Graph IM1 Rollout (Track 9) is marked complete, but per
`measure/skill-graph-im1-rollout-audit.md` it produced **0/138 skills with
working generators** — 724 nodes, 138 **STUB** blueprints, 414 projected
activities, and no `problem-families/im1` directory in
`packages/math-content/src/`. IM1 is a validated directed graph with **no
interactive practice content**. The 2026-06-09 audit named this a "ghost course"
risk: stakeholders may believe IM1 is student-ready when it is not.

The legacy hand-authored `problem-families` / lesson-seed direction was
deprecated (tracks.md: "Problem Families & Practice Items — All Apps —
WONTIMPLEMENT FOR REMAINING SCOPE") in favor of the skill-graph generator
pipeline. So IM1 content readiness = **execute generators** for IM1 skills and
project real blueprints — not author a content directory by hand.

This track owns IM1 practice readiness as an explicit deliverable, so it is not
silently distributed across the skill-scoped generator tracks (T17–T19) with no
course-level accountability.

## Functional Requirements

- FR1 — Map all 138 IM1 skills to generator families; produce a coverage matrix
  identifying which are served by existing/in-progress generators (T17–T19 scope)
  and which are genuine gaps.
- FR2 — Implement deterministic generators for IM1 skills under
  `packages/math-content/src/problem-families/im1/`, reusing T17–T19 mechanisms;
  each generator passes the Generated-Math Correctness QA harness (golden-answer).
- FR3 — Replace IM1 STUB blueprints with real worked-example/guided/independent
  blueprints wired to the generators.
- FR4 — Vertical slice: take one IM1 module end-to-end to a student practice route
  with live (or seeded) state, proving the pipeline renders IM1 practice.
- FR5 — Refresh `skill-graph-im1-rollout-audit.md` readiness numbers from the new state.

## Acceptance Criteria

- AC1 — `packages/math-content/src/problem-families/im1/` exists with generators
  for the prioritized IM1 skills; correctness-QA harness green for all of them.
- AC2 — IM1 blueprint coverage > 0% (target: the vertical-slice module fully real,
  remainder tracked with explicit per-skill status).
- AC3 — One IM1 module is reachable and practiceable at a student route.
- AC4 — Updated readiness audit reflects true generator coverage.
- AC5 — No boundary violations; `npm run doctor` green.

## Out of Scope

- 100% generator coverage of all 138 skills in one track (prioritize a vertical
  slice + the highest-traffic skills; track the long tail).
- IM2/IM3/PreCalc generators (their own tracks).
