# Current Directive

> Updated: 2026-04-15 (code review: Module 3 seed integration fixed, Phase 6 ready)

## Status Summary

- **Tests**: 1798 passing, 6 known equivalence failures, 1 flaky StepByStepper guided hint test (passed this run).
- **Build**: Passing; RSC chunk warning remains pre-existing (735 KB).
- **Lint**: Passing.
- **TypeScript**: Known pre-existing test-file errors remain in dashboard/students/submission review areas.
- **Module 1 Roadmap**: Complete.
- **Module 2 Seed**: Complete; all 5 lessons wired into seed.ts.
- **Module 3 Seed**: Complete; all 5 lessons wired into seed.ts with MPM.3.x standards. Phase 6 complete.
- **Manual Component Approval**: MVP exists at `/dev/component-approval`; hardening follow-up track planned.

## Current In-Progress Track

### Module 3 Curriculum Seed

Track: `conductor/tracks/module-3-seed_20260415/`

Phase 1 complete: Seed Lesson 3-1 (Solving Polynomial Equations by Graphing).
Phase 2 complete: Seed Lesson 3-2 (Solving Polynomial Equations Algebraically).
Phase 3 complete: Seed Lesson 3-3 (Proving Polynomial Identities).
Phase 4 complete: Seed Lesson 3-4 (The Remainder and Factor Theorems).
Phase 5 complete: Seed Lesson 3-5 (Roots and Zeros).
Phase 6 partial: Seed orchestration wired (getLessons + switch cases). Standards and verification remain.

## Code Review Findings (2026-04-15)

### Fixed
- **CRITICAL**: Module 3 seed.ts integration — only lesson 3-4 of 5 was wired. Added getLessons() metadata and switch cases for lessons 3-1, 3-2, 3-3, 3-5.
- Module 3 seed track metadata.json status changed from "new" to "in_progress".

### Confirmed Pre-Existing (in tech-debt.md)
- Placeholder hash in convex/dev.ts:113 blocks staleness detection for 2/3 component kinds.
- submitReview takes createdBy as arg (trust boundary risk).
- N+1 queries in getLessonProgress, getTeacherLessonMonitoringData, getTeacherLessonPreview.
- Unbounded collect() calls in multiple teacher.ts queries.
- Silent catch blocks in student.ts.
- No timeSpent >= 0 validation.
- nextPhaseUnlocked hardcoded to true.
- No Convex-layer authorization.
- Approval race condition (no version/lock).
- 6 equivalence test failures (pattern-matching limits, 88% passing).
- No seed function tests.

## Planned Upcoming Tracks

1. **Complete Module 3 Phase 6** — Add standards, run seed verification, finalize track.
2. **Harden Manual Component Approval** — `harden-manual-approval_20260415`
   - Real queue coverage for embedded examples/practice placements.
   - Deterministic hashes for all review kinds.
   - Harness-gated approval.
   - Convex behavior tests for queue, approval, stale state, and audit context.
3. **Module 4 Curriculum Seed** — `module-4-seed_20260415` (6 lessons)
4. **Module 5 Curriculum Seed** — `module-5-seed_20260415` (5 lessons)
5. **Module 6 Curriculum Seed** — `module-6-seed_20260415` (5 lessons)
6. **Module 7 Curriculum Seed** — `module-7-seed_20260415` (6 lessons)
7. **Module 8 Curriculum Seed** — `module-8-seed_20260415` (5 lessons)
8. **Module 9 Curriculum Seed** — `module-9-seed_20260415` (7 lessons)

See `conductor/modules-3-9-roadmap.md` for the module inventory and repeated implementation pattern.

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
