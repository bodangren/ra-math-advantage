# Current Directive

> Updated: 2026-04-14 (post-code-review, Phase 3-4 review)

## Status Summary

- **Tests**: 1389 passing, 6 known equivalence failures (pattern-matching limits, 88% — exceeds 80% target), 1 flaky (StepByStepper-guided hint tracking — passes in isolation)
- **Build**: passing (RSC chunk 722 KB — above 500 KB warning threshold; pre-existing)
- **Lint**: passing
- **TypeScript**: passing (0 errors)
- **Completed Tracks**: supporting-activities Phase 1-4, component-approval (all 6 phases), algebraic-examples (all 4 phases), extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation, reconcile-activity-schemas, wire-step-by-step-solver (Phase 1-2), module-1-seed Phase 1-3

## Code Review Findings (2026-04-14, Phase 3-4)

### Fixed (this review session)
- **seed.ts infinite loop** — `seedStandards` was called in a loop for each standard, but seeds ALL standards at once; now called once
- **Security risk in RateOfChangeCalculator** — replaced `Function()` constructor with recursive descent parser for expression evaluation

### Pre-existing (from prior reviews, still open)
- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- `createdBy` accepted as mutation arg, not derived from auth context
- Guided mode submissions not recorded (no onSubmit call for guided practice)
- No tests for Convex dev functions (listReviewQueue, submitReview, getAuditContext)
- Algebraic test coverage structurally weak (20-50% step assertion coverage)
- Unbounded `take(500)` in listReviewQueue with N+1 hash computation
- Approval status overwritten without version/lock — race condition on concurrent reviews

## Immediate Priorities

1. **Track 8: Module 1 Curriculum Seed (Phase 4-5)**
   - Phase 1-3 complete (types, utils, entry point, standards, demo env, progress)
   - Phase 4-5: Lesson seeds 1-1 through 1-8
   - Depends on Tracks 1, 4 (both complete)

2. **Track 5: Graphing Components — Explore Mode**
   - Deferred from earlier; parameter slider interaction

3. **Track 9: Student Lesson Flow**
   - End-to-end: dashboard → lesson → phases → activities → completion → progress persistence
   - Depends on: Tracks 3, 5, 6, 7, 8

4. **Track 10: Teacher Module 1 Experience**
   - Dashboard, gradebook, student detail, submission review, lesson preview
   - Depends on: Tracks 3, 5, 6, 7, 8

## Medium-Term

5. **Add Convex dev function tests** — listReviewQueue, submitReview, getAuditContext
6. **Replace placeholder content hash for example/practice** — `convex/dev.ts:113`
7. **Guided mode submission recording** — FillInTheBlank and ComprehensionQuiz should call onSubmit in guided mode
8. **Resolve approval race condition** — add compare-and-swap or conflict detection to submitReview
9. **Optimize listReviewQueue** — use indexes for pre-filtering, limit hash computation

## Tech Debt to Address

- ~~16 TypeScript errors from prior tracks~~ — **RESOLVED** (2026-04-14)
- ~~NaN scores from division by zero~~ — **RESOLVED** (2026-04-14)
- ~~NaN from parseFloat in submissions~~ — **RESOLVED** (2026-04-14)
- ~~DiscriminantAnalyzer silent coefficient fallback~~ — **RESOLVED** (2026-04-14)
- ~~seed.ts infinite loop~~ — **RESOLVED** (2026-04-14)
- ~~Security risk in RateOfChangeCalculator~~ — **RESOLVED** (2026-04-14)
- Placeholder hash for example/practice components
- `createdBy` should be derived from auth at public API boundaries
- Algebraic test coverage needs strengthening (88% but structural weakness)
- Consider symbolic math library for equivalence validation (production)
- Unbounded `take(500)` in listReviewQueue — performance concern for Convex billing
