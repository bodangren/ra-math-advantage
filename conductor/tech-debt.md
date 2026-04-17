# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| SRS queue: unbounded .collect() on srs_cards via by_student | Critical | Open | Fetches ALL cards; should use by_student_and_due or .take(N) |
| SRS queue: N+1 per-card resolution (practice_items + activities) | Critical | Open | 2 sequential DB calls per queue item; batch into 2 bulk reads |
| Misconception summary query: N+1 card resolution depth | Critical | Open | 30 students x 100 reviews = 3k+ sequential reads; will timeout |
| Teacher SRS dashboard: 3 panels return always-empty arrays | High | Open | Individual queries exist but combined dashboard stubs them out |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| PracticeSessionProvider: session completion sends no sessionId | High | Open | fetch('/api/practice/complete') has no body; wrong session risk |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| No Convex-layer authorization | Med-High | Resolved | Added in Security & Auth Hardening track: convex/auth.ts helpers, org scoping |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles"> |
| objectiveProficiency: N+1 for activity submissions + baselines | High | Open | Loops over uniqueActivityIds and familyIds |
| problem_families: by_objectiveId index uses unsafe string[] cast | High | Open | Convex array-field index semantics undocumented |
| SRS review_log: misconceptionTags not stored in evidence | High | Open | getMisconceptionSummary returns empty without this |
| FSRS stability used as avgRetention — semantic mismatch | Medium | Open | Stability = days until 90% retrievability, not percentage |
| timing.ts: addEvent doesn't guard after pagehide | Medium | Open | Events after pagehide corrupt wallClockMs |
| timing.ts: longestIdleMs underreported for blur/hidden events | Medium | Open | Uses idleDelta instead of full gap |
| mapGradeToSrsRating/mapCardState silently map unknown values | Medium | Open | Should exhaust switch or throw instead of silent default |
| Silent catch blocks in convex/student.ts, teacher.ts | Medium | Open | Swallows exceptions; Convex outages produce raw 500 |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| SRS: SubmissionSrsAdapter reimplements processReview | Medium | Open | Two parallel pipelines risk divergence |
| SRS: mapDbCardToContract duplicated in queue.ts and cards.ts | Medium | Open | Extract to shared utility |
| SRS: completeDailySessionHandler loads all review logs | Medium | Open | .collect() fetches entire history |
| SRS queue: hardcoded courseKey + duplicate config constant | Medium | Open | Extract shared constant; parameterize courseKey |
| PracticeSessionProvider: submission failure silently swallowed | Medium | Open | No user-visible error, no retry |
| PracticeCardRenderer: double timing instrumentation | Medium | Open | One hook's timing discarded |
| error-analysis: isCorrect:undefined counted as incorrect | Medium | Open | Undocumented behavior |
| error-analysis: buildTeacherErrorView uses activityId as studentId | Medium | Open | Inconsistent with other functions |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits on fraction/radical parsing |
| Content hash JSON.stringify treats undefined same as absent | Low | Open | Potential hash collisions |
| mastered proficiency label is dead code | Low | Open | Union type includes but no code path produces it |
| Dev review queue POST: no input length limits on comment/componentId | High | Open | comment is z.string().optional() with no .max(); componentId z.string().min(1) with no .max() |
| internal.student.skipPhase accessed via `as any` cast | Medium | Open | Suppresses type safety; may indicate stale generated API types |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| teacher.ts: `as never` cast on userId index query | Medium | Open | Masks potential generated schema type mismatch |
| study.ts: 4 public queries had no auth (now internalQuery) | Critical | Resolved | Converted query→internalQuery; no client code called api.study.* directly |
| PracticeTestEngine closing: missing Back to Modules button | Low | Open | Spec defines backToModulesButton but component doesn't render it; parent has back nav |
| StepByStepper-guided test: flaky hint tracking | Low | Open | Passes in isolation but fails intermittently in full suite; likely timing/timer issue |
| PracticeTestEngine: lessonsTested includes all selected, not just tested | Low | Open | Sends all selectedLessonIds even if some had 0 questions drawn |
| New test files (study.test.ts, gradebook-queries.test.ts): 25 `any` lint errors | Medium | Open | @typescript-eslint/no-explicit-any violations in test mocks |
