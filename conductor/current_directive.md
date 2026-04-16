# Current Directive

> Updated: 2026-04-16 (Code Review — Track 8 Phase 1, Track 6 Phases 5-6, Error Analysis Tests)

## Status Summary

- **Tests**: 2766 total, 6 known failures (equivalence validator — fraction/radical expressions). All others passing.
- **Build**: Passing.
- **Lint**: Passing.
- **TypeScript**: Pre-existing test-file errors remain. No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards and lesson_standards links for M1-M5 seeded.
- **SRS Wave 1-2**: Complete (Tracks 1-5).
- **SRS Wave 3**: Track 6 (Submission-to-SRS Adapter) complete. Track 8 (Daily Practice Queue) Phase 1 complete.
- **Error Analysis Unit Tests**: 34 tests passing. Coverage gaps remain (studentIdMap, isCorrect:undefined).

## Fixes Applied This Review

1. **Performance: adapter card lookup fetches ALL student cards** — `processSubmissionInternal` was calling `getCardsByStudent()` then filtering by `problemFamilyId` in memory. Fixed: added `getCardByStudentAndFamily` targeted index query to `CardStore` interface, `ConvexCardStore`, and in-memory test stores. Now reads exactly 1 document instead of all student cards.
2. **Performance: getActiveSessionHandler unbounded `.collect()`** — was fetching ALL sessions for a student then filtering for active. Fixed: uses `by_student_and_status` index with `.first()` — reads 1 document instead of all sessions.
3. **Added `getCardByStudentAndFamily` Convex query** — new indexed query on `srs_cards` using `by_student_and_problem_family` for O(1) card lookups.

## Issues Logged (Not Fixed)

- `mapDbCardToContract` duplicated between `convex/queue/queue.ts` and `convex/srs/cards.ts` — extract to shared utility
- N+1 standard lookups in `getDailyPracticeQueue` (~50-100 ctx.db.get calls per invocation)
- `submissionId` required in `saveReview` validator but optional in schema

## Current In-Progress Track

- **Track 8: Daily Practice Queue Engine** — Phase 2 (Queue Item Resolution) complete. Phase 3 (Session Lifecycle) next.

## SRS Wave Progress

- **Wave 0**: Complete (Practice Timing Telemetry + Baselines)
- **Wave 1**: Complete (Tracks 1, 2, 4)
- **Wave 2**: Complete (Track 5)
- **Wave 3**: Track 6 complete. Track 8 Phase 1-2 complete (Phase 3-5 remaining).
- **Wave 4**: Not started (Tracks 10, 9, 11)

## High-Priority Next Steps

1. **Track 8 Phase 3: Session Lifecycle** — startDailySession, getActiveSession, completeDailySession mutations
2. **Security & Auth Hardening (BM2 Wave A)** — port fail-closed auth guards, Convex-layer authorization
3. **Error analysis: test studentIdMap code paths** — summarizePartOutcomes and buildDeterministicSummary untested with studentIdMap
4. **Error analysis: fix buildTeacherErrorView using activityId as studentId** — add studentIdMap param
5. **Refactor seed-lesson-standards.ts** — 9 identical handlers (~700 lines) should be a factory function
6. **Extract shared mapDbCardToContract** — duplicated in convex/queue/queue.ts and convex/srs/cards.ts

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
