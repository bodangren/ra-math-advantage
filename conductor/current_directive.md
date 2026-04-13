# Current Directive

> Updated: 2026-04-13 (post-review)

## Status Summary

- **Tests**: 1226 passing, 6 known equivalence failures (pattern-matching limits, 88% → exceeds 80% target), 1 flaky test (StepByStepper-guided hint tracking — passes in isolation)
- **Build**: passing (RSC chunk 514 KB — still above 500 KB warning threshold)
- **Lint**: passing
- **Completed Tracks**: component-approval (all 6 phases), algebraic-examples (all 4 phases), extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation

## Code Review Findings (2026-04-13)

### Fixed
- **getAuditContext returned approved reviews** — `convex/dev.ts` now filters by status `needs_changes`/`rejected` only, matching developer-notes.md spec
- **ActivityReviewHarness mode check always true** — `|| true` tautology removed
- **extract-quadratic-regex plan.md** — duplicate phase headings and incomplete final verification cleaned up

### Known Tech Debt (see `conductor/tech-debt.md` for full list)
- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- Review harnesses use hardcoded sample data, not real component props
- `StepByStepSolverActivity` ignores `activityId`/`onSubmit`/`onComplete` props
- `createdBy` accepted as mutation arg, not derived from `ctx.auth`
- Algebraic test coverage structurally weak (guided/practice modes near no-ops)

## Immediate Priorities

1. **Track 7: Supporting Activity Components**
   - comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer
   - Depends on Tracks 2, 4 (both complete)

2. **Track 8: Module 1 Curriculum Seed**
   - All 8 lessons with phases, activities, standards
   - Depends on Tracks 1, 4 (both complete)

3. **Track 5: Graphing Components — Explore Mode**
   - Deferred from earlier; parameter slider interaction

4. **Wire StepByStepSolverActivity to real props**
   - Replace hardcoded sample steps with activity data from registry
   - Connect `onSubmit`/`onComplete` callbacks

5. **Replace placeholder content hash for example/practice**
   - `convex/dev.ts:113` → actual `computeComponentContentHash` call

## Medium-Term

6. **Track 9: Student Lesson Flow** — end-to-end dashboard → lesson → completion
7. **Track 10: Teacher Module 1 Experience** — gradebook, student detail, submission review
8. **Convex function-level auth for dev mutations** — add `ctx.auth` checks to `submitReview`
9. **Equivalence validator productionization** — consider symbolic math library

## Tech Debt to Address

- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- `createdBy` should be derived from auth at public API boundaries
- Algebraic test coverage needs strengthening (20-50% step assertion coverage)
- Consider symbolic math library for equivalence validation (production)
