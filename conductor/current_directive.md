# Current Directive

> Updated: 2026-04-14 (code review — Tracks 9-10, 5b, schemas, solver)

## Status Summary

- **Tests**: 1635 passing, 6 known equivalence failures (pattern-matching limits, 88% — exceeds 80% target), 1 flaky (StepByStepper-guided hint tracking, passes in isolation)
- **Build**: passing (RSC chunk 730 KB — above 500 KB warning threshold; pre-existing)
- **Lint**: passing
- **TypeScript**: passing (0 errors)
- **Completed Tracks**: All Module 1 roadmap tracks complete (Tracks 1-10), plus supporting-activities, component-approval, algebraic-examples, extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation, reconcile-activity-schemas, wire-step-by-step-solver, graphing-explore-mode

## Module 1 Roadmap: COMPLETE

All 10 tracks delivering the complete Module 1 student and teacher experience are finished:

| Track | Status |
|-------|--------|
| 1. Flexible Phase Model | COMPLETE |
| 2. E-Textbook Design System | COMPLETE |
| 3. Lesson Rendering Engine | COMPLETE |
| 4. Activity Infrastructure | COMPLETE |
| 5. Graphing Components | COMPLETE |
| 5b. Graphing Explore Mode | COMPLETE |
| 6. Algebraic Worked Examples | COMPLETE |
| 7. Supporting Activities | COMPLETE |
| 8. Module 1 Curriculum Seed | COMPLETE |
| 9. Student Lesson Flow | COMPLETE (all 4 phases) |
| 10. Teacher Module 1 | COMPLETE (all 4 phases) |

## Code Review Findings (2026-04-14, Tracks 9-10 + 5b)

### Issues Found

- **N+1 query in getTeacherLessonPreview** — `convex/teacher.ts:1014-1024` loops phases and queries sections per phase. Same pattern as the pre-existing getLessonProgress N+1. High severity for lessons with many phases.
- **Bare catch block in getTeacherLessonPreview** — `convex/teacher.ts:979-981` `try { ctx.db.get(...) } catch {}` silently swallows all exceptions. Should catch specific ConvexError.
- **getStandardsCoverage unbounded query** — `convex/teacher.ts:1074` fetches all lesson_standards with `.collect()` then filters in memory. Should use index.
- **getTeacherLessonMonitoringData N+1** — `convex/teacher.ts:588-608` queries sections per phase inside Promise.all.
- **Plan.md drift** — Track 10 Phase 4 tasks marked `[ ]` despite being implemented. Fixed this review.
- **Flaky test** — `StepByStepper-guided` hint tracking test passes in isolation but intermittently fails in full suite. Likely shared mutable state.

### Pre-existing (still open from prior reviews)

- Placeholder hash for example/practice components (`convex/dev.ts:113`)
- `createdBy` accepted as mutation arg, not derived from auth context
- Guided mode submissions not recorded (no onSubmit for guided practice)
- No tests for Convex dev functions
- Algebraic test coverage structurally weak (20-50% step assertion coverage)
- Unbounded `take(500)` in listReviewQueue with N+1 hash computation
- Approval status overwritten without version/lock — race condition
- No Convex-layer authorization — admin token = full access
- Silent catch blocks in convex/student.ts
- timeSpent not validated (negative values accepted)
- nextPhaseUnlocked hardcoded to true
- No error.tsx boundary for student routes
- getPhaseDisplayInfo crashes on unknown phaseType

## Next High-Level Priorities

### Immediate (next phase of work)

1. **User acceptance testing of Module 1** — Full student flow (dashboard → lesson → phases → activities → completion) and teacher flow (dashboard → gradebook → student detail → lesson preview). Verify with seeded demo data.
2. **Module 2+ curriculum authoring** — Extend curriculum beyond Module 1 (8 of 52 lessons done). Seed data and lesson content for remaining 8 modules.
3. **Phase skip UI wiring** — Skip infrastructure exists (schema, mutation, isSkippable helper) but PhaseCompleteButton skip button not yet exposed in UI.

### Medium-Term Tech Debt

4. **Fix Convex N+1 queries** — getTeacherLessonPreview, getTeacherLessonMonitoringData, getLessonProgress phase sections loops
5. **Add Convex dev function tests** — listReviewQueue, submitReview, getAuditContext
6. **Replace placeholder content hash** — `convex/dev.ts:113`
7. **Resolve approval race condition** — compare-and-swap or conflict detection
8. **Add error.tsx boundary** — graceful degradation for student and teacher routes
9. **Validate timeSpent >= 0** in completePhase
10. **Fix nextPhaseUnlocked** — compute actual value
11. **Reduce RSC bundle size** — currently 730 KB (target <500 KB)

## Resolved This Session

- Track 10 Phase 4 plan.md synced with implementation
