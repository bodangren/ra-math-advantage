# Current Directive

> Updated: 2026-04-17 (Code review: Practice Test Engine Phases 1-3, Teacher Gradebook Phases 1-2)

## Status Summary

- **Tests**: 3194 total, 6 known failures (equivalence validator — fraction/radical expressions). 1 flaky test (StepByStepper-guided hint tracking — passes in isolation). All others passing.
- **Build**: Passing.
- **Lint**: 35 `any` errors in test files (13 new in study.test.ts, 12 new in gradebook-queries.test.ts, rest pre-existing).
- **TypeScript**: No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards and lesson_standards links for M1-M5 seeded.
- **SRS Waves**: Waves 0-5 complete (all tracks done through Wave 5 Track 12).
- **BM2 Alignment**: Wave A complete. Wave B: Practice Test Engine complete (Phases 1-3). Teacher Gradebook Phase 1-2 complete (Phase 3-4 remaining).

## Code Review: Practice Test Engine Phases 1-3, Teacher Gradebook Phases 1-2 (2026-04-17)

### Scope

Reviewed commits `5f63d30..ab08010` covering:
- **Practice Test Engine** Phase 1: Data Structures and Question Banks (9 module configs, helper functions)
- **Practice Test Engine** Phase 2: Convex Schema and Persistence (study_sessions + practice_test_results tables, handlers)
- **Practice Test Engine** Phase 3: Test Engine UI (PracticeTestEngine component, selection, route pages, API route)
- **Teacher Gradebook** Phase 1: Pure Logic — Gradebook and Overview (assembleGradebookRows, assembleCourseOverviewRows, color system)
- **Teacher Gradebook** Phase 2: Convex Queries for Reporting (extracted testable handlers, course overview + gradebook + submission detail queries)

### Fixes Applied

1. **CRITICAL: Four public Convex queries had zero auth** — `getPracticeTestResults`, `getRecentStudySessions`, `getPracticeTestResultsForTeacher`, `getStudySessionsForTeacher` were defined as `query()` (public, callable by any client) with no identity/role/org verification. Any authenticated user could read any other user's practice test results and study sessions. Converted all four to `internalQuery()`. Verified no client code calls `api.study.*` directly.
2. **HIGH: Practice test complete route missing score ≤ questionCount validation** — Added `.refine()` to Zod schema. Also added `.max()` bounds on array lengths, question count (100), and duration (86400s).

### No Issues Found In

- Question bank helpers: Fisher-Yates shuffle correct, edge cases handled
- Convex schema: clean index design for study_sessions and practice_test_results
- Pure logic functions (assembleGradebookRows, assembleCourseOverviewRows): well-structured, comprehensive test coverage
- Handler extraction pattern: testable handlers + thin internalQuery wrappers, consistent with auth.ts pattern
- Color system: correct 4-color mapping with WCAG-compliant Tailwind classes
- API route auth guard: `requireStudentRequestClaims` correctly applied
- React component state management: correct use of refs for values needed in onComplete callback

### Issues Logged (tracked in tech-debt.md)

- PracticeTestEngine closing: missing Back to Modules button per spec (Low)
- PracticeTestEngine: lessonsTested includes all selected lessons, not just those with drawn questions (Low)
- StepByStepper-guided test: flaky hint tracking (Low — timing issue)
- New test files: 25 `any` lint errors in study.test.ts and gradebook-queries.test.ts (Medium)
- Pre-existing: equivalence validator 6/50 tests failing (Low)

## High-Priority Next Steps

1. **Teacher Gradebook Phase 3: UI Components** — CourseOverviewGrid, GradebookGrid, SubmissionDetailModal
2. **Teacher Gradebook Phase 4: Competency Heatmaps** — Pure logic, Convex queries, heatmap UI, route pages
3. **Student Study Hub — Flashcards & SRS Review (BM2 Wave C)** — Port BaseReviewSession, FlashcardPlayer with FSRS scheduling
4. **SRS queue: batch resolution** — Replace N+1 per-card reads with bulk reads (Critical perf, tracked in tech-debt.md)
5. **PracticeSessionProvider: send sessionId with completion** — Prevents wrong-session completion (High)
6. **Wire combined dashboard query** — Replace empty array stubs in getTeacherSrsDashboardData with actual data
7. **Fix `stability` → `avgRetention` semantic mismatch** — Convert FSRS stability to actual retention percentage
8. **Address lint `any` errors in new test files** — 25 new violations in study.test.ts and gradebook-queries.test.ts

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
