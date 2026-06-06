# Track: IM1/IM2 Standards Backfill — Implementation Plan

Workflow: Contract-First (integrity check), then source-grounded authoring with validation.
Verification: per-app `tsc --noEmit` + seed integrity test.

## Phase 1 — Integrity Check & Source Inventory

- [x] Task: Write a failing integrity check that lists undefined referenced codes for IM1 + IM2 (Red) [Red committed f0a78f2]
- [x] Task: Inventory canonical standards sources for IM1 and IM2; record provenance [Green committed bd51b97]
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) [Verified bd51b97]

## Phase 2 — IM1 Definitions

- [x] Task: Author 77 IM1 standard definitions (code/title/description) from source into seed_standards.ts [Green committed bd51b97]
- [x] Task: Wire into seed orchestration idempotently; integrity check passes for IM1 (Green) [Green committed bd51b97]
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — IM2 Reconciliation

- [x] Task: Author the 41 missing IM2 definitions; correct miscoded references [Green committed bd51b97]
- [x] Task: Integrity check passes for IM2 (Green) [Green committed bd51b97]
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Validation & Debt Closure

- [ ] Task: Wire integrity check into CI; final verification (tsc --noEmit, tests)
- [ ] Task: Update Tech Debt Registry rows to Resolved
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
