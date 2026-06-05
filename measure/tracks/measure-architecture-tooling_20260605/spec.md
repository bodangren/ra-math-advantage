# Track: Measure Architecture Tooling

Program: Quality & Completion Backlog (Tier 1)
Type: Chore
Depends on: none

## Overview

Multiple track plans reference `measure/generate.sh` and `measure/doctor.sh`,
and the Doctor workflow (`measure/references/doctor.md`) HALTs if they (or
`npm run generate` / `npm run doctor`) are missing. None exist. The
`measure/generated/` facts (architecture.json, routes.md) referenced by the
index are likewise absent. This track builds the real generate + doctor tooling
so `/measure:doctor` runs and generated docs describe what currently exists.

## Functional Requirements

- FR1 — Generate script. `npm run generate` (and/or `measure/generate.sh`)
  produces `measure/generated/architecture.json` (package/app boundary graph,
  exports) and `measure/generated/routes.md` (app routes), deterministically.
- FR2 — Doctor script. `npm run doctor` (and/or `measure/doctor.sh`) runs the
  architectural lints — at minimum the existing
  `scripts/check-monorepo-boundaries.mjs` — plus generated-doc freshness
  (fails if `generate` output is stale vs working tree) and reports findings.
- FR3 — Boundary integration. Doctor wraps the existing boundary checker and any
  per-package lint relevant to architecture, with a single pass/fail exit code.
- FR4 — Freshness check. Doctor detects when `measure/generated/` is out of date
  and instructs running `generate`.
- FR5 — Docs reconciliation. Update plans/tech-debt that cite phantom scripts to
  the real commands; remove the Tech Debt Registry tooling-gap row on completion.

## Non-Functional Requirements

- Scripts are non-interactive and CI-friendly (single execution, clear exit
  codes); cross-platform Node where practical.
- Generated facts are machine-generated only — never hand-edited.

## Acceptance Criteria

- AC1 — `npm run generate` writes architecture.json + routes.md deterministically.
- AC2 — `npm run doctor` runs boundary + freshness checks with correct exit codes.
- AC3 — Doctor fails on an injected boundary violation and on stale generated docs (proof tests).
- AC4 — `/measure:doctor` workflow no longer HALTs on missing tooling.
- AC5 — Phantom-script references reconciled; Tech Debt row resolved.

## Out of Scope

- The full repo-graph/build-graph knowledge graph (Graph-Aware Mode) — optional follow-up.
- Auto-fixing lint findings (report only).
