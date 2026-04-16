# Current Directive

> Updated: 2026-04-17 (Track 10 Phase 3 complete — Objective Proficiency Query)

## Status Summary

- **Tests**: 2823 total, 6 known failures (equivalence validator — fraction/radical expressions). All others passing.
- **Build**: Passing.
- **Lint**: Passing.
- **TypeScript**: No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards and lesson_standards links for M1-M5 seeded.
- **SRS Wave 0-3**: Complete.
- **SRS Wave 4**: Track 9 complete (all 6 phases). Track 10 Phase 3 complete (Objective Proficiency Query). Phase 4 (Student and Teacher Views) next.

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
- `completeDailySessionHandler` loads ALL review logs to count completed cards
- `reviewDurationMs` not stored in `srs_review_log`; looked up via synthetic `submissionId` parse

## Current In-Progress Track

- **Track 10: Objective Proficiency Measurement** — Phase 3 complete. Phase 4 (Student and Teacher Views) next.

## High-Priority Next Steps

1. **Track 10 Phase 4: Student and Teacher Views** — `getStudentProficiencySummary` and `getTeacherClassProficiency` Convex queries with view builders
2. **Track 10 Phase 5: Verification and Handoff** — full test suite, docs, and track completion
3. **Track 11: Teacher SRS Dashboard and Interventions** — class health, weak objectives, struggling students, interventions
4. **Security & Auth Hardening (BM2 Wave A)** — port fail-closed auth guards, Convex-layer authorization
5. **Extract shared `mapDbCardToContract`** — duplicated in `convex/queue/queue.ts` and `convex/srs/cards.ts`
6. **Error analysis: test `studentIdMap` code paths** — `summarizePartOutcomes` and `buildDeterministicSummary` untested with `studentIdMap`

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
