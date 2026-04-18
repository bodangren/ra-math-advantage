# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| SRS queue: unbounded .collect() on srs_cards via by_student | Critical | Resolved | Fixed: added .take(100) bound in convex/queue/queue.ts (2026-04-17) |
| SRS queue: N+1 per-card resolution (practice_items + activities) | Critical | Resolved | Fixed: replaced sequential resolveQueueItem with batched Promise.all lookups (2026-04-17) |
| Misconception summary query: N+1 card resolution depth | Critical | Open | 30 students x 100 reviews = 3k+ sequential reads; will timeout |
| Teacher SRS dashboard: 3 panels return always-empty arrays | High | Open | Individual queries exist but combined dashboard stubs them out |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| PracticeSessionProvider: session completion sends no sessionId | High | Resolved | Fixed: POST body now includes sessionId; API route validates and forwards; Convex mutation verifies exact session (2026-04-17) |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| No Convex-layer authorization | Med-High | Resolved | Added in Security & Auth Hardening track: convex/auth.ts helpers, org scoping |
| getTeacherLessonPreview: no auth guard on lesson content | Critical | Resolved | Fixed: added userId arg + getAuthorizedTeacher check (2026-04-17) |
| getStandardsCoverage: no auth guard on standards data | Critical | Resolved | Fixed: added userId arg + getAuthorizedTeacher check (2026-04-17) |
| FlashcardsPage: "All Modules" only loads Module 1 terms | Critical | Resolved | Fixed: restructured to RSC+client, passes GLOSSARY (2026-04-17) |
| Flashcard session results never persisted | Critical | Resolved | Fixed: added fetchInternalMutation call matching pattern (2026-04-17) |
| BaseReviewSession: stale closure in onComplete callback | High | Resolved | Fixed: compute final counts as local vars + functional updater (2026-04-17) |
| MatchingGame: wrong-answer timer not cleared before reuse | Medium | Resolved | Fixed: clearTimeout before setTimeout (2026-04-17) |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles"> |
| objectiveProficiency: N+1 for activity submissions + baselines | High | Open | Loops over uniqueActivityIds and familyIds |
| problem_families: by_objectiveId index uses unsafe string[] cast | High | Open | Convex array-field index semantics undocumented |
| SRS review_log: misconceptionTags not stored in evidence | High | Open | getMisconceptionSummary returns empty without this |
| FSRS stability used as avgRetention — semantic mismatch | Medium | Open | Stability = days until 90% retrievability, not percentage |
| mapGradeToSrsRating/mapCardState silently map unknown values | Medium | Open | Should exhaust switch or throw instead of silent default |
| Silent catch blocks in convex/student.ts, teacher.ts | Medium | Open | Swallows exceptions; Convex outages produce raw 500 |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| SRS: SubmissionSrsAdapter reimplements processReview | Medium | Open | Two parallel pipelines risk divergence |
| SRS: mapDbCardToContract duplicated in queue.ts and cards.ts | Medium | Open | Extract to shared utility |
| SRS: completeDailySessionHandler loads all review logs | Medium | Open | .collect() fetches entire history |
| SRS queue: hardcoded courseKey + duplicate config constant | Medium | Open | Extract shared constant; parameterize courseKey |
| PracticeSessionProvider: submission failure silently swallowed | Medium | Open | No user-visible error, no retry |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits on fraction/radical parsing |
| internal.student.skipPhase accessed via `as any` cast | Medium | Open | Suppresses type safety; may indicate stale generated API types |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| study.ts: 4 public queries had no auth (now internalQuery) | Critical | Resolved | Converted query→internalQuery; no client code called api.study.* directly |
| PracticeTestEngine closing: missing Back to Modules button | Low | Open | Spec defines backToModulesButton but component doesn't render it; parent has back nav |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite; likely timing/timer issue |
| New test files (study.test.ts, gradebook-queries.test.ts, timing-baseline.test.ts): 35 `any` lint errors | Medium | Open | @typescript-eslint/no-explicit-any violations in test mocks |
| N+1 queries in getTeacherDashboardData and getTeacherSrsDashboardData | High | Resolved | Fixed: batched per-student srs_cards, srs_sessions, and profiles queries via Promise.all (2026-04-17) |
| buildStudentProgressSnapshot: signature not updated after N+1 refactor | Critical | Resolved | Fixed: updated function to accept progressRows directly; updated both call sites (2026-04-18) |
| Unbounded .collect() on lesson_versions, competency_standards, lesson_standards in teacher.ts | High | Open | Multiple handlers fetch entire tables; will grow expensive over time |
| SubmissionDetailModal: array index used as React key for evidence list | Low | Open | Should use stable ID (e.g., evidence.activityId) |
| Session day-boundary tests: 3 failures in sessions.test.ts | Medium | Open | isSameDay edge cases with active session resume; pre-existing |
| lesson-title-consistency: 2 test failures | Low | Open | Conductor track titles/seed phase counts drift from lesson source headings |
