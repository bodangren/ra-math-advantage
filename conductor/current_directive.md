# Current Directive

> Updated: 2026-04-13 (post-review)

## Status Summary

- **Tests**: 1150 passing, 6 known equivalence failures (pattern-matching limits, 88% → exceeds 80% target)
- **Build**: passing
- **Lint**: passing
- **Active Tracks**: component-approval (Phase 2 complete), algebraic-examples (Phase 4 nearly complete)

## Immediate Priorities

1. **Component Approval — Phase 3: Developer-Only Access Guard [COMPLETE]**
   - Created shared developer review access guard (`lib/auth/developer.ts`)
   - Added guarded `/dev/component-approval` route (notFound() in production)
   - Added auth checks in dev route

2. **Component Approval — Phase 4: Review Queue UI**

2. **Algebraic Examples — Phase 4 Completion**
   - Build submission envelope assembly and register `step-by-step-solver` in activity registry
   - Complete Phase 4 verification
   - Strengthen test coverage (guided/practice mode tests are near no-ops)

3. **Component Approval — Phase 4: Review Queue UI**
   - Build review queue filters and list
   - Build review decision panel with approve/needs-changes/reject actions

## Medium-Term

4. **Track 7: Supporting Activity Components** — comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer
5. **Track 8: Module 1 Curriculum Seed** — all 8 lessons with phases, activities, standards
6. **Track 5: Graphing Components** — explore mode deferred, core variants complete

## Tech Debt to Address

- Placeholder hash for example/practice components (`convex/dev.ts:111`)
- `createdBy` should be derived from auth at public API boundaries
- Algebraic test coverage needs strengthening (20-50% step assertion coverage)
- Consider symbolic math library for equivalence validation (production)
