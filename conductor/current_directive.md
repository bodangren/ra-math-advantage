# Current Directive

> Updated: 2026-04-15 (code review: harden-manual-approval Phases 3-4, module 2-3 seeds)

## Status Summary

- **Tests**: 1847 passing, 6 known equivalence failures.
- **Build**: Passing; RSC chunk warning remains pre-existing (734 KB).
- **Lint**: Passing.
- **TypeScript**: Fixed 6 new TS errors from harden-manual-approval track. 25 pre-existing test-file errors remain (students.test.tsx, dashboard.test.ts).
- **Module 1 Roadmap**: Complete.
- **Module 2 Seed**: Complete; all 5 lessons wired into seed.ts.
- **Module 3 Seed**: Complete; all 5 lessons wired into seed.ts with MPM.3.x standards.
- **Manual Component Approval**: Phases 1-4 complete. Phase 5 (docs/reconciliation) pending.

## Code Review Findings (2026-04-15, review 2)

### Fixed This Review
- **CRITICAL**: ReviewQueueView filter state disconnected from ReviewQueueClient — filters were cosmetic-only. Now uses client's filters/setFilters directly.
- **HIGH**: Selected item not cleared after successful review submission. Panel remained open showing reviewed item.
- **MEDIUM**: ReviewDecisionPanel submitting state never reset on success (only on error). Now uses `finally` block.
- **MEDIUM**: Duplicate `Date.now()` in submitReviewHandler creating inconsistent timestamps. Single `now` variable reused.
- **TS FIX**: review-queue.test.ts phaseVersionId type mismatch (3 errors fixed via proper Doc type casting).
- **TS FIX**: SubmissionEvidence type missing from error-analysis exports (fixed both component and test errors).
- **TS FIX**: teacher/students/page.tsx `detail` possibly null (added non-null assertion consistent with existing pattern).

### New Issues Recorded in tech-debt.md
- submitReviewHandler componentKind not validated server-side (Medium)
- Incorrect CCSS description for HSA-APR.B.2 (High)
- No lesson_standards seeding pipeline (High)
- Missing CCSS standards for M2/M3 content (Medium)

### Confirmed Pre-Existing (unchanged)
- submitReview takes createdBy as arg (trust boundary risk).
- N+1 queries in getLessonProgress, getTeacherLessonMonitoringData, getTeacherLessonPreview.
- Unbounded collect() calls in multiple teacher.ts queries.
- Silent catch blocks in student.ts.
- No timeSpent >= 0 validation.
- nextPhaseUnlocked hardcoded to true.
- No Convex-layer authorization.
- Approval race condition (no version/lock).
- 6 equivalence test failures (pattern-matching limits, 88% passing).

## Current In-Progress Track

### Harden Manual Component Approval

Track: `conductor/tracks/harden-manual-approval_20260415/`

Phases 1-4 complete. Phase 5 ready: Documentation and Status Reconciliation.

## Planned Upcoming Tracks

1. **Module 4 Curriculum Seed** — `module-4-seed_20260415` (6 lessons)
2. **Module 5 Curriculum Seed** — `module-5-seed_20260415` (5 lessons)
3. **Module 6 Curriculum Seed** — `module-6-seed_20260415` (5 lessons)
4. **Module 7 Curriculum Seed** — `module-7-seed_20260415` (6 lessons)
5. **Module 8 Curriculum Seed** — `module-8-seed_20260415` (5 lessons)
6. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.

## Medium-Term Tech Debt

1. Fix Convex N+1 queries in teacher/student progress paths.
2. Fix incorrect CCSS standard description (HSA-APR.B.2).
3. Build lesson_standards seeding pipeline.
4. Add missing CCSS standards for M2/M3 (HSA-APR.C.4, HSA-APR.C.5, HSA-REI.D.11).
5. Validate componentKind server-side in submitReviewHandler.
6. Resolve approval race condition.
7. Add student/teacher error boundaries.
8. Validate `timeSpent >= 0` in phase completion.
9. Compute real `nextPhaseUnlocked`.
10. Reduce RSC bundle size.
11. Fix pre-existing TypeScript test errors.
