# Track: IM1/IM2 Standards Backfill

Program: Quality & Completion Backlog (Tier 1)
Type: Chore
Depends on: none (data/content track)

## Overview

Two open Tech Debt Registry items: IM1 has no competency-standard definitions —
77 placeholder standard nodes exist without descriptions — and IM2's
`seed_standards.ts` defines 48 standards while lesson-standards reference 91
unique codes (41 missing). These gaps weaken standards alignment, gradebook
heatmaps, and any skill-standard edge work. This track authors the missing
definitions from authoritative sources and reconciles the seeds so every
referenced code resolves to a real, described standard.

## Functional Requirements

- FR1 — IM1 definitions. Replace the 77 IM1 placeholder standard nodes with
  authored definitions (code, title, description) from the canonical standards
  source for IM1.
- FR2 — IM2 reconciliation. Add the 41 missing IM2 standard definitions so all
  91 referenced codes resolve; correct any miscoded references.
- FR3 — Referential integrity. Every `lesson_standards`/skill-standard reference
  in IM1 and IM2 resolves to a defined standard; zero dangling codes.
- FR4 — Seed wiring. Definitions land in the apps' `seed_standards.ts` and are
  wired into seed orchestration, idempotently.
- FR5 — Validation. A check (test or script) asserts no undefined referenced
  codes remain, runnable in CI.

## Non-Functional Requirements

- Definitions are source-grounded (no generic/AI-invented descriptions); cite the
  source per the curriculum-authoring lesson (precalc-depth-remediation).
- Idempotent seeds; deterministic ordering.

## Acceptance Criteria

- AC1 — IM1: 77 placeholder nodes replaced with described definitions.
- AC2 — IM2: all 91 referenced codes resolve; 41 gaps closed.
- AC3 — Integrity check passes (zero dangling references) in CI.
- AC4 — Seeds run idempotently; `tsc --noEmit` and tests pass.
- AC5 — Tech Debt Registry rows updated to Resolved.

## Out of Scope

- Skill-level standard *edges* (owned by Skill Graph Track 4 / future alignment).
- IM3/PreCalc standards (tracked separately).
- Re-mapping lessons to different standards (definition backfill only).
