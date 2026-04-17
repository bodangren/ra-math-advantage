# Current Directive

> Updated: 2026-04-17 (Code review: Study Hub Games Phases 2-3, SRS Queue Perf, PracticeSessionProvider sessionId fix)

## Status Summary

- **Tests**: 3362 total, 7 known failures (6 equivalence validator + 1 flaky StepByStepper-guided). All others passing.
- **Build**: Passing.
- **Lint**: 35 `any` errors in test files (pre-existing, not new).
- **TypeScript**: No new TS errors.
- **Module 1-9 Roadmap**: All modules seeded (M1-M9 complete). CCSS standards for M1-M5 seeded.
- **SRS Waves**: Waves 0-5 complete (all tracks done through Wave 5 Track 12).
- **BM2 Alignment**: Wave A complete. Wave B complete (Practice Test Engine, Teacher Gradebook). Wave C complete (Flashcards, Matching, Speed Round). Wave D remaining: AI Chatbot, Workbook System.

## Code Review: Study Hub Games Phases 2-3, SRS Queue Perf, SessionId Fix (2026-04-17)

### Scope

Reviewed commits `4a1c7f2..e1d62b1` covering ~1350 lines across 24 files:
- **Study Hub Games** Phase 2: SpeedRoundGame (90s timer, 3 lives, streaks, multiple-choice, module filter)
- **Study Hub Games** Phase 3: Polish (shared infrastructure, session recording, final verification)
- **SRS Queue Performance Fixes**: Batch queue resolution, bound card queries, deduplicated lookups
- **PracticeSessionProvider sessionId Fix**: Wire sessionId through completion flow

### Fixes Applied

1. **MEDIUM: SpeedRoundGame timer effect recreated interval every second** — `useEffect` dependency on `[isComplete, timeLeft]` caused interval teardown/recreate on every tick. Fixed: removed `timeLeft` from deps; interval now runs continuously until `isComplete`.

### No Issues Found In

- **SpeedRoundGame component**: Clean state management, proper feedback timer cleanup (clearTimeout before setTimeout), correct Fisher-Yates shuffle reuse, comprehensive test coverage (10 tests including game-over, timeout, streak tracking)
- **SpeedRoundPageClient**: Module filter, session persistence via `fetchInternalMutation`, proper `useCallback` memoization of `handleComplete`
- **SRS queue batch resolution**: Correct deduplication of problem family IDs, `Promise.all` over unique IDs, `.take(100)` bound on card queries, thorough batch verification tests
- **sessionId fix (PracticeSessionProvider → API route → Convex mutation)**: Clean 3-layer wiring with proper validation at each layer (missing sessionId → 400, wrong student → error, already completed → error)
- **Session tests**: New test cases for exact-session completion, mismatch errors, already-completed errors
- **API route tests**: Missing sessionId, invalid body, auth failure coverage
- **Tech debt updates**: Correctly marked resolved items, added new discovered issues

### Issues Logged (tracked in tech-debt.md)

No new issues discovered during this review cycle. Previously tracked items remain:
- Misconception summary query N+1 (Critical, Open)
- Teacher SRS dashboard empty array stubs (High, Open)
- SRS sessions index fragility (High, Open)
- Approval status race condition (High, Open)
- N+1 phase sections (High, Open)
- N+1 getTeacherDashboardData/getTeacherSrsDashboardData (High, Open)

### Previous Review Items Resolved

Since the last review (2026-04-17 earlier):
- [x] Study Hub Games Phase 2: SpeedRoundGame — DONE
- [x] Study Hub Games Phase 3: Polish — DONE
- [x] SRS queue: batch resolution — DONE (Critical perf fix)
- [x] PracticeSessionProvider: send sessionId — DONE (High priority fix)

## High-Priority Next Steps

1. **CCSS standards seeding for M6-M9** — M1-M5 standards done; M6-M9 still missing lesson_standards links
2. **N+1 queries in getTeacherDashboardData/getTeacherSrsDashboardData** — 30 sequential DB round-trips per student; batch with single query (High)
3. **Wire combined dashboard query** — Replace empty array stubs in getTeacherSrsDashboardData with actual data
4. **Misconception summary query: N+1 card resolution** — Will timeout at scale (Critical perf)
5. **SRS sessions: by_student_and_status index fragility** — Relies on undefined sorting; add explicit filter
6. **Fix `stability` → `avgRetention` semantic mismatch** — Convert FSRS stability to actual retention percentage
7. **Address lint `any` errors in test files** — 35 violations (pre-existing)
8. **Unbounded .collect() on lesson_versions, competency_standards, lesson_standards** — Will grow expensive

### Wave D (After core features stable)

- AI Tutoring — Lesson Chatbot (BM2 alignment)
- Workbook System & Artifact Pipeline (BM2 alignment)

See `conductor/daily-practice-srs-roadmap.md` for the post-Module-9 daily practice SRS sequence.
See `conductor/tech-debt.md` for full issue registry.
