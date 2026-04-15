# Current Directive

> Updated: 2026-04-15 (planning refresh - approval hardening and Modules 3-9 tracks)

## Status Summary

- **Tests**: Last broad report: 1675 passing, 6 known equivalence failures, 1 flaky StepByStepper guided hint test.
- **Build**: Last broad report passing; RSC chunk warning remains pre-existing.
- **Lint**: Last focused runs passing.
- **TypeScript**: Known pre-existing test-file errors remain in dashboard/students/submission review areas.
- **Module 1 Roadmap**: Complete; Module 1 seed files were realigned to curriculum counts/order on 2026-04-15.
- **Module 2 Seed**: Complete; all 5 lessons wired into seed.ts, HSA-APR.A.1 and HSA-APR.B.2 added to seed-standards.ts.
- **Manual Component Approval**: MVP exists at `/dev/component-approval`; hardening follow-up track is now planned.

## Current In-Progress Track

### Module 3 Curriculum Seed

Track: `conductor/tracks/module-3-seed_20260415/`

Phase 1 complete: Seed Lesson 3-1 (Solving Polynomial Equations by Graphing).
Phase 2 complete: Seed Lesson 3-2 (Solving Polynomial Equations Algebraically).
Phase 3 complete: Seed Lesson 3-3 (Proving Polynomial Identities).
Phase 4 complete: Seed Lesson 3-4 (The Remainder and Factor Theorems).
Phase 5 complete: Seed Lesson 3-5 (Roots and Zeros).
Ready to begin Phase 6: Module Integration and Verification.

## Planned Upcoming Tracks

1. **Harden Manual Component Approval** - `harden-manual-approval_20260415`
   - Real queue coverage for embedded examples/practice placements.
   - Deterministic hashes for all review kinds.
   - Harness-gated approval.
   - Convex behavior tests for queue, approval, stale state, and audit context.

2. **Module 3 Curriculum Seed** - `module-3-seed_20260415`
3. **Module 4 Curriculum Seed** - `module-4-seed_20260415`
4. **Module 5 Curriculum Seed** - `module-5-seed_20260415`
5. **Module 6 Curriculum Seed** - `module-6-seed_20260415`
6. **Module 7 Curriculum Seed** - `module-7-seed_20260415`
7. **Module 8 Curriculum Seed** - `module-8-seed_20260415`
8. **Module 9 Curriculum Seed** - `module-9-seed_20260415`

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.

## Open Review Findings

- Seed tests are still largely inline-data tests; curriculum consistency guardrails now cover seed implementation titles/counts/order, but direct seed-module behavior tests should continue improving.
- Module 2 standards are incomplete until Module 2 Phase 5 is done.
- Manual approval has known hardening gaps tracked in `harden-manual-approval_20260415` and `conductor/tech-debt.md`.

## Medium-Term Tech Debt

1. Fix Convex N+1 queries in teacher/student progress paths.
2. Add Convex dev function tests.
3. Replace placeholder example/practice content hash.
4. Resolve approval race condition.
5. Add student/teacher error boundaries.
6. Validate `timeSpent >= 0` in phase completion.
7. Compute real `nextPhaseUnlocked`.
8. Reduce RSC bundle size.
9. Fix pre-existing TypeScript test errors.
