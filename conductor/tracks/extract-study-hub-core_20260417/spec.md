# Specification: Extract Study Hub Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-study-hub-core_20260417`.

## Overview

Share study state machine and mode primitives while keeping glossary data and persistence local.

## Dependencies

- `bm2-consume-runtime-packages_20260417`

## Functional Requirements

- FR-1: Extract BaseReviewSession and shared study mode primitives.
- FR-2: Keep glossary/session persistence app-local.
- FR-3: Adopt package in IM3 and BM2 study routes/components.
- FR-4: Preserve existing user-facing study behavior.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Both apps use package study primitives.
- [ ] Glossary and persistence remain app-local.
- [ ] Study mode tests pass in both apps.
- [ ] No domain-specific data in package.

## Out of Scope

- Cross-app glossary merge.
- SRS algorithm changes.
