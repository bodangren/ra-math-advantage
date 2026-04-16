# Current Directive

> Updated: 2026-04-16 (Code Review — Track 9 Phase 3, Track 8, Track 6)

## Status Summary

- **Tests**: 2818 total, 6 known failures (equivalence validator — fraction/radical expressions). All others passing.
- **Build**: Passing.
- **Lint**: Passing.
- **TypeScript**: No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards and lesson_standards links for M1-M5 seeded.
- **SRS Wave 0-3**: Complete.
- **SRS Wave 4**: Track 9 Phase 3 complete (submission + SRS update flow). Phase 4 (loading states, completion polish) next.

## Fixes Applied This Review

1. **CRITICAL: `mapDbCardToContract` returned `problemFamilyId` as `cardId`** — Both `convex/srs/cards.ts` and `convex/queue/queue.ts` mapped `cardId: card.problemFamilyId`, causing every card in the same problem family (even across students) to share the same `cardId`. Fixed: `cardId: card._id`. Test mock updated to validate distinct `_id` vs `problemFamilyId`.
2. **CRITICAL: `reviewId` silently discarded by `saveReview`** — The adapter-generated `reviewId` (e.g., `rev_xxx`) was accepted as an arg but never stored in `srs_review_log`. Fixed: added `reviewId: v.optional(v.string())` to schema, stored in `saveReview` and `processReviewHandler` inserts, returned by `getReviewsByCard`/`getReviewsByStudent` (preferring stored `reviewId` over `_id`).
3. **HIGH: Stale active sessions created zombie sessions** — `startDailySessionHandler` found stale sessions from prior days but didn't close them before creating a new session, leading to two active sessions and inconsistent `getActiveSession` results. Fixed: patch stale session with `completedAt` before creating new one.
4. **HIGH: `isSameDay` used local timezone** — Day-boundary comparison used `getFullYear()`/`getMonth()`/`getDate()` (local TZ) instead of UTC methods. Server/client TZ mismatch could produce incorrect day boundaries. Fixed: use `getUTCFullYear()`/`getUTCMonth()`/`getUTCDate()`. Tests updated to use UTC-aligned timestamps and explicit `asOfDate`.
5. **MEDIUM: `isEnvelopeCorrect` treated `undefined` as correct** — `part.isCorrect !== false` passes when `isCorrect` is `undefined` (ungraded). Fixed: `part.isCorrect === true`.
6. **MEDIUM: `setTimeout` leaked on unmount** — `PracticeSessionProvider` never cleaned up the feedback-delay timeout. Fixed: store timer ID in ref, clear in `useEffect` cleanup.

## Issues Logged (Not Fixed — tracked in tech-debt.md)

- `mapDbCardToContract` still duplicated between `convex/queue/queue.ts` and `convex/srs/cards.ts` — extract to shared utility
- N+1 queries in `resolveDailyPracticeQueue` (per-card resolution) and policy-to-standard lookups
- `studentId` type mismatch: contract uses `string`, Convex uses `Id<"profiles">` — type assertions at boundary
- `objectiveId` defaults to `""` when problem family has no objectives
- `SubmissionSrsAdapter` reimplements `processReview()` instead of delegating
- `confidenceReasons` is `string[]` not union type — typos silently pass
- `mastered` proficiency label is dead code — no code path produces it
- `totalFocusLossMs` accumulated but never exposed
- `completeDailySessionHandler` loads ALL review logs to count completed cards

## Current In-Progress Track

- **Track 9: Student Daily Practice Experience** — Phase 4 complete. Phase 5 (Dashboard Integration) next.

## High-Priority Next Steps

1. **Track 9 Phase 5: Dashboard Integration** — daily practice card on student dashboard with due count and streak
2. **Track 10: Objective Proficiency Measurement** — upgrade objective-proficiency.ts to use FSRS stability; build aggregation pipeline
3. **Security & Auth Hardening (BM2 Wave A)** — port fail-closed auth guards, Convex-layer authorization
4. **Extract shared `mapDbCardToContract`** — duplicated in `convex/queue/queue.ts` and `convex/srs/cards.ts`
5. **Error analysis: test `studentIdMap` code paths** — `summarizePartOutcomes` and `buildDeterministicSummary` untested with `studentIdMap`
6. **Refactor `seed-lesson-standards.ts`** — 9 identical handlers (~700 lines) should be a factory function

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
