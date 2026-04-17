# Specification: Monorepo Tooling Shell

## Overview

Install monorepo control plane at repository root. Keep IM3 app in current location during this track so failures are isolated to tooling setup.

## Dependencies

- `monorepo-readiness_20260417`

## Functional Requirements

- FR-1: Root Workspace Config: add approved workspace files and root scripts.
- FR-2: Root Task Orchestration: define lint/test/build/typecheck commands for app/package fanout.
- FR-3: Package Template: create starter package template with `src/index.ts` and TypeScript config.
- FR-4: Non-Breaking Baseline: IM3 must continue to pass existing commands before any folder move.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Root workspace files exist and parse.
- [ ] Root scripts run and delegate correctly.
- [ ] Template package can build and typecheck.
- [ ] IM3 existing lint/test/build/typecheck remain green.

## Out of Scope

- Moving IM3 files.
- Creating production shared packages.
- Adopting packages in BM2.
