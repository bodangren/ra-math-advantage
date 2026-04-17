# Specification: Extract Practice Test Engine Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-practice-test-engine_20260417`.

## Overview

Share practice test engine behavior while keeping question banks app-local.

## Dependencies

- `bm2-consume-runtime-packages_20260417`

## Functional Requirements

- FR-1: Extract generic test runner state machine and scoring contracts.
- FR-2: Extract generic test selection UI primitives.
- FR-3: Keep question banks and course content app-local.
- FR-4: Adopt package in both IM3 and BM2.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Both apps run practice tests via package engine components.
- [ ] Question banks remain app-local.
- [ ] Practice test tests pass in both apps.
- [ ] No domain data in package.

## Out of Scope

- Question bank unification.
- SRS queue behavior changes.
