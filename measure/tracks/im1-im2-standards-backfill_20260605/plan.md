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
- [x] Task: Strengthen Phase 2 Red coverage — strict `runMutation` pattern, after-`seedUnits` ordering, try/catch wrapping in apps/integrated-math-1/convex/seed.ts:seedAll (supplement Red; does not implement) [Red committed e79071c8, 44816cf3; Green committed 607d3909]
  - **Red-phase boundary fix:** mid-attempt-1 ran `build-graph update ./graph.db <test-file>` after the test-file commit, modifying `graph.db` (a non-test/non-Measure artifact, tracked at `bd51b97a`). Restored via `git checkout HEAD -- graph.db`. Going forward, the Red phase may use only read-only build-graph queries (`stats`, `search`, `inspect`, `files`, `deps`, `callers`, `path`, `audit`, `query`); the mutating subcommands `update`, `scan`, and `init` are out of scope.
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) [Verified 607d3909]

## Phase 3 — IM2 Reconciliation [checkpoint: 5c184ad0]

- [x] Task: Author the 41 missing IM2 definitions; correct miscoded references [Green committed bd51b97]
- [x] Task: Integrity check passes for IM2 (Green) [Green committed bd51b97]
- [x] Task: Strengthen Phase 3 Red coverage — IM2 shape contract (≥91 entries, widened CODE_REGEX, non-empty descriptions, non-empty student-friendly descriptions, non-empty categories, isActive=true, unique codes, source-grounded inventory contract, CCSS-M framework lock) in apps/integrated-math-2/__tests__/convex/seed/seed-standards.test.ts (supplement Red; does not implement) [Red committed ae09b42c]
  - **Pattern parity:** mirrors apps/integrated-math-1/__tests__/convex/seed/seed-standards.test.ts and the IM3 template (apps/integrated-math-3/__tests__/convex/seed/seed-standards.test.ts) per test-strategy §2 and §5 P3 ("~5–8 IM2 shape tests"). The 41 definitions were already authored in bd51b97a, so this is a contract-locking commit in the same spirit as the Phase 2 supplement Red (e79071c8 / 44816cf3): implementation was already Green when the test landed.
  - **Inventory-⊆-defined (one direction):** the test asserts every standards_inventory.json entry has a corresponding seed_standards definition (the source-grounding contract from lessons-learned precalc-depth-remediation). The reverse direction (defined ⊆ inventory) is intentionally not asserted: seed_standards.ts carries 102 definitions vs 91 inventory entries because it includes forward-looking codes for planned modules.
- [x] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md) [Verified 5c184ad0 — all 18 seed tests pass, tsc clean, inventory ⊆ defined, CCSS-M locked]

## Phase 4 — Validation & Debt Closure

- [x] Task: Wire integrity check into CI; final verification (tsc --noEmit, tests) [Red committed 0be19593; Green committed 425a39da]
- [x] Task: Update Tech Debt Registry rows to Resolved [Green committed 425a39da]
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
