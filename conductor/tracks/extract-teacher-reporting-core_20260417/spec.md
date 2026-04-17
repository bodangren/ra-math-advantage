# Specification: Extract Teacher Reporting Core Package

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `extract-teacher-reporting-core_20260417`.

## Overview

Share gradebook/course-overview/competency helper logic and reusable reporting UI primitives across apps.

## Dependencies

- `bm2-consume-runtime-packages_20260417`

## Functional Requirements

- FR-1: Extract pure reporting view-model helpers.
- FR-2: Extract reusable reporting UI primitives that are domain-agnostic.
- FR-3: Keep Convex query handlers and route wiring app-local.
- FR-4: Adopt package in both apps with parity tests.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Both apps consume reporting core package for pure logic/UI.
- [ ] Backend query handlers remain app-local.
- [ ] Reporting tests pass in both apps.
- [ ] No course-specific standards hardcoded in package.

## Out of Scope

- Unifying reporting APIs.
- Changing teacher dashboard information architecture.
