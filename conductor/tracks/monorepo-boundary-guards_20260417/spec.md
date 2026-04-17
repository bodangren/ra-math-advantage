# Specification: Monorepo Boundary Guardrails

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-boundary-guards_20260417`.

## Overview

Prevent architecture drift by codifying forbidden import boundaries in scripts and CI.

## Dependencies

- `move-im3-app-to-apps_20260417`

## Functional Requirements

- FR-1: Forbidden Import Check: packages may not import from `apps/*`.
- FR-2: Convex Generated API Check: packages may not import app-local `convex/_generated` modules.
- FR-3: CI Enforcement: guard checks run in CI and fail builds on violations.
- FR-4: Developer Feedback: check output must identify file and offending import pattern.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Guard script exists and runs locally.
- [ ] CI runs guard script on every relevant change.
- [ ] Known bad import example fails check.
- [ ] No false positives on allowed imports.

## Out of Scope

- Extracting package code.
- Changing app behavior.
- Adding runtime authorization guards.
