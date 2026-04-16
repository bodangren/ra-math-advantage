# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Approval status race condition (no version/lock) | High | Open | Convex serializes mutations but no "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| No Convex-layer authorization | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| submitReviewHandler takes createdBy as arg not from auth | High | Open | Mitigated by route-level derivation |
| Unbounded take(500) + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query |
| error-analysis: studentIdMap code paths untested | High | Open | summarizePartOutcomes and buildDeterministicSummary accept studentIdMap but no test passes it |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; type assertions at boundary |
| Seed tests are tautological; ActivityRenderer loses section content props | Medium | Open | Zero regression protection; template/blanks lost; factory extraction needed |
| Content hash JSON.stringify treats undefined same as absent | Medium | Open | Potential hash collisions |
| N+1 phase reads in listReviewQueue (dev.ts) | Medium | Open | Sequential ctx.db.get per phase |
| Silent catch blocks in convex/student.ts, teacher.ts; no error.tsx boundaries | Medium | Open | Swallows exceptions; Convex outages produce raw 500 |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| Algebraic test coverage structurally weak | Medium | Open | Tests named "all steps" check only fraction |
| Convex V validator does not enforce timing refinements | Medium | Open | Negative durations accepted server-side |
| canApprove gate incomplete in Activity/Practice harnesses | Medium | Open | Checklist items not gated: mode selector, variant inspection |
| M9 lessons all use graphing-explorer in Explore phases | Medium | Open | unit-circle-trainer listed in contract but never used |
| Equivalence validator 6/50 tests failing; M9 uses degrees in Learn but radians in example | Low | Open | Pattern-matching limits; unexplained unit switch |
| confidenceReasons is string[] not union type | Low | Open | Typos silently pass type checking |
| PracticeTimingEvidence local type omits contract fields | Low | Open | SubmissionReviewPanel.tsx redefines contract type |
| SRS: reviewDurationMs not stored in review_log; looked up via submissionId parse | Medium | Open | Requires parsing synthetic submissionId and querying activity_submissions |
| Flaky tests: StepByStepper hint tracking, TeacherLessonPreview | Low | Open | Pass in isolation, flaky in full suite |
| collectEligibleTimings N+1 in timing_baseline.ts | Medium | Open | Queries activity_submissions per activityId in loop; acceptable at ~3 activities/family |
| getStaleBaselines doesn't use by_last_computed index | Medium | Open | take(1000) + in-memory filter; won't scale past 1000 families |
| mastered proficiency label is dead code | Medium | Open | Union type includes mastered but no code path produces it |
| Fragile type assertion on submissionData.timing | Medium | Open | collectEligibleTimings casts to local TimingSummary; no compile-time protection |
| scheduler.test.ts fully mocks ts-fsrs | Medium | Open | Tests verify wrapper logic but don't exercise real FSRS algorithm |
| error-analysis: isCorrect:undefined counted as incorrect | Medium | Open | Undocumented behavior when isCorrect is omitted from parts |
| error-analysis: buildTeacherErrorView uses activityId as studentId | Medium | Open | Inconsistent with other functions that accept studentIdMap |
| SRS queue: newCardsPerDay cap is shared across all priorities | Medium | Open | Essential/supporting/extension compete for same quota; update spec comment |
| SRS: mapDbCardToContract duplicated in queue.ts and cards.ts | Medium | Open | Extract to shared utility |
| SRS: N+1 standard lookups in getDailyPracticeQueue | Medium | Open | One ctx.db.get per policy record (~50-100/course) |
| SRS: submissionId required in saveReview validator but optional in schema | Low | Open | Should be `v.optional(v.string())` |
| SRS: objectiveId defaults to "" when family has no objectives | Medium | Open | Empty string persisted; should skip SRS or log warning |
| SRS: SubmissionSrsAdapter reimplements processReview | Medium | Open | Two parallel pipelines risk divergence; delegate to processReview |
| SRS: completeDailySessionHandler loads all review logs | Medium | Open | .collect() fetches entire history; needs indexed count query |
| Session: duplicate hardcoded config in queue.ts and sessions.ts | Low | Open | Shared constant needed |
| PracticeSessionProvider: submission failure silently swallowed | Medium | Open | No user-visible error, no retry; student loses work |
| PracticeSessionProvider: session completion is fire-and-forget | Medium | Open | Failed completion leaves stale active session |
