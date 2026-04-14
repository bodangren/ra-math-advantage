# Current Directive

> Updated: 2026-04-15 (code review — phase-skip-ui, module-2-seed phases 1-2)

## Status Summary

- **Tests**: 1675 passing, 6 known equivalence failures (pattern-matching limits, 88% — exceeds 80% target), 1 flaky (StepByStepper-guided hint tracking, passes in isolation)
- **Build**: passing (RSC chunk 733 KB — above 500 KB warning threshold; pre-existing)
- **Lint**: passing
- **TypeScript**: 27 errors in pre-existing test files (dashboard.test.ts isLocked, students.test.tsx mock types, SubmissionReviewPanel missing export, teacher/students page null checks) — not from recent work
- **Completed Tracks**: All Module 1 roadmap tracks complete (Tracks 1-10), plus supporting-activities, component-approval, algebraic-examples, extract-linear-regex, extract-quadratic-regex, curriculum-gap-remediation, reconcile-activity-schemas, wire-step-by-step-solver, graphing-explore-mode, phase-skip-ui

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

## Code Review Findings (2026-04-15, phase-skip-ui + module-2-seed phases 1-2)

### Issues Found and Fixed

- **LessonRenderer ignored skipped initialStatus** — `LessonRenderer.tsx:220` only checked `completed || completedPhases.has()` when computing `initialStatus` for PhaseCompleteButton. Previously-skipped phases would render "Mark Complete" instead of "Skipped". Fixed: now checks `activePhase.status === 'skipped'` first.

### Issues Found (Open)

- **Seed tests are decoupled from seed implementations** — `seed-lesson-2-1.test.ts` and `seed-lesson-2-2.test.ts` define inline data objects instead of importing from the seed modules. Changes to seed files won't break tests. Medium severity.
- **Module 2 standards incomplete** — `seed-standards.ts` has HSA-APR.B.3 and HSA-CED.A.1 but is missing HSA-APR.A.1 and HSA-APR.B.2 per the module-2-seed spec. Expected to be addressed in Phase 5.

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
- N+1 queries in getTeacherLessonPreview, getTeacherLessonMonitoringData, getLessonProgress
- Unbounded table scans in convex/student.ts getDashboardData
- TypeScript errors in dashboard.test.ts, students.test.tsx, SubmissionReviewPanel

## Next High-Level Priorities

### Immediate (next phase of work)

1. **Complete Module 2 Seed** — Phases 3-5 remaining (lessons 2-3 through 2-5, standards, verification). Actively in progress.
2. **User acceptance testing of Module 1** — Full student flow (dashboard → lesson → phases → activities → completion) and teacher flow (dashboard → gradebook → student detail → lesson preview). Verify with seeded demo data.
3. **Module 3+ curriculum authoring** — Extend curriculum beyond Modules 1-2 (10 of 52 lessons will be done after Module 2 seed completes).

### Medium-Term Tech Debt

4. **Fix Convex N+1 queries** — getTeacherLessonPreview, getTeacherLessonMonitoringData, getLessonProgress phase sections loops
5. **Add Convex dev function tests** — listReviewQueue, submitReview, getAuditContext
6. **Replace placeholder content hash** — `convex/dev.ts:113`
7. **Resolve approval race condition** — compare-and-swap or conflict detection
8. **Add error.tsx boundary** — graceful degradation for student and teacher routes
9. **Validate timeSpent >= 0** in completePhase
10. **Fix nextPhaseUnlocked** — compute actual value
11. **Reduce RSC bundle size** — currently 733 KB (target <500 KB)
12. **Fix pre-existing TypeScript errors** — dashboard.test.ts, students.test.tsx, SubmissionReviewPanel, teacher/students page

## Resolved This Session

- LessonRenderer skipped-phase initialStatus bug fixed
