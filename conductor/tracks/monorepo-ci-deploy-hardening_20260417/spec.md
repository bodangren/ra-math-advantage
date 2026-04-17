# Specification: Monorepo CI and Deploy Hardening

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-ci-deploy-hardening_20260417`.

## Overview

Harden CI and deploy processes so package and app validation is deterministic and independently deployable.

## Dependencies

- `extract-workbook-pipeline-and-adopt-im3_20260417`

## Functional Requirements

- FR-1: Root CI Matrix: validate packages and both apps with clear dependency ordering.
- FR-2: Deploy Path Correctness: each app deploy job targets correct app path.
- FR-3: Convex Ops Clarity: document/gate Convex generation/deploy commands per app.
- FR-4: Boundary Checks in CI: run import-boundary guard scripts as mandatory checks.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Root CI validates packages + both apps.
- [ ] Deploy jobs run from correct app paths.
- [ ] Convex command docs are explicit per app.
- [ ] CI failures produce actionable diagnostics.

## Out of Scope

- New runtime features.
- Cross-app release process redesign beyond CI/deploy pathing.
