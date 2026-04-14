# Current Directive

> Updated: 2026-04-14 (post-code-review, Track 9 Phase 3 review)

## Status Summary

- **Tests**: 1533 passing, 6 known equivalence failures (pattern-matching limits, 88% — exceeds 80% target), 0 flaky
- **Build**: passing (RSC chunk 720 KB — above 500 KB warning threshold; pre-existing)
- **Lint**: passing
- **TypeScript**: passing (0 errors)
- **Completed Tracks**: supporting-activities Phase 1-4, component-approval (all 6 phases), algebraic-examples (all 4 phases), extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation, reconcile-activity-schemas, wire-step-by-step-solver (Phase 1-2), module-1-seed (all 5 phases), graphing-explore-mode (Phase 1), student-lesson-flow Phase 1-3

## Code Review Findings (2026-04-14, Track 9 Phase 3)

### Fixed (this review session)
- **Skipped phases don't count toward lesson unlock** — `buildPublishedUnitProgressRows` only counted `status === "completed"`, not `"skipped"`. Students who skipped phases would have subsequent lessons permanently locked. Now includes skipped phases.
- **Unhandled rejection in activity submission test** — Mock PhaseRenderer called `onActivitySubmit` without handling the rejected promise. Mock now catches rejection.
- **handleActivityComplete undoes rollback** — After `handleActivitySubmit` rolled back a failed submission, `handleActivityComplete` re-added the activity to the completed set. Added idempotency guard.

### Pre-existing (from prior reviews, still open)
- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- `createdBy` accepted as mutation arg, not derived from auth context
- Guided mode submissions not recorded (no onSubmit call for guided practice)
- No tests for Convex dev functions (listReviewQueue, submitReview, getAuditContext)
- Algebraic test coverage structurally weak (20-50% step assertion coverage)
- Unbounded `take(500)` in listReviewQueue with N+1 hash computation
- Approval status overwritten without version/lock — race condition on concurrent reviews

### New findings (this review)
- **N+1 query in getLessonProgress** — One DB query per phase inside a loop for phase sections (convex/student.ts:90-98). High severity for lessons with many phases.
- **Unbounded table scans** — `getDashboardData` fetches all lessons, lesson_versions, phase_versions with `.collect()`. Doesn't scale past ~100 lessons.
- **getLessonProgress fetches ALL user progress** — `.withIndex("by_user").collect()` returns every progress row, not lesson-scoped.
- **No Convex-layer authorization** — Admin token provides full access to all student data; auth boundary is entirely in Next.js server layer.
- **Silent catch blocks** — `try { ctx.db.get(...) } catch {}` in multiple places swallows all exceptions.
- **timeSpent not validated** — Negative values accepted, corrupts progress data.
- **nextPhaseUnlocked hardcoded to true** — Return value from completePhase is always true regardless of actual state.
- **No error.tsx boundary** — Convex outages produce raw 500 with no user-facing fallback.
- **getPhaseDisplayInfo crashes on unknown phaseType** — Unchecked index into PHASE_DISPLAY_INFO map.

## Immediate Priorities

1. **Track 9: Student Lesson Flow — Phase 4**
   - Loading states, lesson completion screen, Module 1 completion screen, E2E verification
   - Status: Phases 1-3 complete; Phase 4 ready to start

2. **Track 10: Teacher Module 1 Experience**
   - Dashboard, gradebook, student detail, submission review, lesson preview
   - Depends on: Tracks 3, 5, 6, 7, 8 (all complete)
   - Status: Ready to start — all dependencies met

3. **Track 5b: Graphing Explorer Explore Mode (Phase 2+)**
   - Phase 1 complete; consider adding more exploration types beyond quadratic
   - Low priority — current implementation sufficient for Module 1

## Medium-Term

4. **Fix Convex N+1 queries** — getLessonProgress phase sections loop; consider batch query or denormalization
5. **Scope getLessonProgress to lesson phase IDs** — Don't fetch all user progress for one lesson
6. **Add Convex dev function tests** — listReviewQueue, submitReview, getAuditContext
7. **Replace placeholder content hash for example/practice** — `convex/dev.ts:113`
8. **Guided mode submission recording** — FillInTheBlank and ComprehensionQuiz should call onSubmit in guided mode
9. **Resolve approval race condition** — add compare-and-swap or conflict detection to submitReview
10. **Optimize listReviewQueue** — use indexes for pre-filtering, limit hash computation
11. **Add error.tsx boundary for student routes** — graceful degradation on Convex outage
12. **Validate timeSpent >= 0** in completePhase mutation
13. **Fix nextPhaseUnlocked** — compute actual value based on phase count

## Tech Debt to Address

- ~~Skipped phases lock progression~~ — **RESOLVED** (2026-04-14)
- ~~Unhandled rejection in activity test~~ — **RESOLVED** (2026-04-14)
- ~~handleActivityComplete rollback race~~ — **RESOLVED** (2026-04-14)
- ~~16 TypeScript errors from prior tracks~~ — **RESOLVED** (2026-04-14)
- ~~NaN scores from division by zero~~ — **RESOLVED** (2026-04-14)
- ~~NaN from parseFloat in submissions~~ — **RESOLVED** (2026-04-14)
- ~~DiscriminantAnalyzer silent coefficient fallback~~ — **RESOLVED** (2026-04-14)
- ~~seed.ts infinite loop~~ — **RESOLVED** (2026-04-14)
- ~~Security risk in RateOfChangeCalculator~~ — **RESOLVED** (2026-04-14)
- ~~seed.ts ctx.runMutation type error~~ — **RESOLVED** (2026-04-14)
- ~~seed-demo-env.ts TypeScript error~~ — **RESOLVED** (2026-04-14)
- ~~Explore equation formatting~~ — **RESOLVED** (2026-04-14)
- N+1 query in getLessonProgress
- Unbounded table scans in getDashboardData
- No Convex-layer authorization
- Placeholder hash for example/practice components
- `createdBy` should be derived from auth at public API boundaries
- Algebraic test coverage needs strengthening (88% but structural weakness)
- Unbounded `take(500)` in listReviewQueue — performance concern for Convex billing
