# Danielson Ponytail Cleanup Plan

## Phase 1: Contract and Schema

- [x] Task 1: Freeze the deletion boundary
  - [x] Record the user-approved removal list.
  - [x] Verify every candidate index against production queries.
  - [x] Remove obsolete audit and hash requirements from the earlier tracks.

## Phase 2: Tests

- [x] Task 2: Adjust behavioral tests before production edits
  - [x] Remove tests that protect deleted hashes and dead surfaces.
  - [x] Add GBF retry, GBF priority, bootstrap, and retained-state tests.

## Phase 3: Implement

- [x] Task 3: Delete and simplify
  - [x] Update `AGENTS.md`.
  - [x] Remove audit-only hashes and the access-audit subsystem.
  - [x] Remove verified dead code, indexes, review data, and duplicate contracts.
  - [x] Simplify GBF retry and connect GBF priority.
  - [x] Add the first-administrator seed path.

## Phase 4: Generate and Verify

- [~] Task 4: Run all gates and complete an independent review
  - [x] Run Danielson tests, coverage, lint, application typecheck, Convex typecheck, and build.
  - [x] Run architecture generation, boundaries, and Measure Doctor.
  - [ ] Review the completed diff for over-engineering and specification errors.
