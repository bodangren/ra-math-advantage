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
| error-analysis: studentIdMap code paths untested | High | Open | summarizePartOutcomes and buildDeterministicSummary untested with studentIdMap |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; type assertions at boundary |
| SRS queue: unbounded .collect() on srs_cards via by_student | Critical | Open | Fetches ALL cards; should use by_student_and_due or .take(N) |
| SRS queue: N+1 per-card resolution (practice_items + activities) | Critical | Open | 2 sequential DB calls per queue item; batch into 2 bulk reads |
| objectiveProficiency: N+1 for activity submissions + baselines | High | Open | Loops over uniqueActivityIds and familyIds for sequential reads |
| objectiveProficiency: fragile submissionId parsing (lastIndexOf "-") | Medium | Open | Breaks if activityId contains dashes; document format or use robust separator |
| objectiveProficiency: card retention inflated per-review not per-card | Medium | Open | Cards with many reviews over-weighted in avg retention; document if intentional |
| objectiveProficiency: internalQuery may need to be query for client access | Medium | Open | FR-3 spec implies client-callable; currently internal-only |
| Content hash JSON.stringify treats undefined same as absent | Medium | Open | Potential hash collisions |
| Silent catch blocks in convex/student.ts, teacher.ts; no error.tsx boundaries | Medium | Open | Swallows exceptions; Convex outages produce raw 500 |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| Convex V validator does not enforce timing refinements | Medium | Open | Negative durations accepted server-side |
| canApprove gate incomplete in Activity/Practice harnesses | Medium | Open | Checklist items not gated: mode selector, variant inspection |
| Equivalence validator 6/50 tests failing (fraction/radical parsing) | Low | Open | Pattern-matching limits; tracked, not near-term |
| SRS: reviewDurationMs not stored in review_log; parsed via submissionId | Medium | Open | Requires parsing synthetic submissionId and querying activity_submissions |
| collectEligibleTimings N+1 in timing_baseline.ts | Medium | Open | Queries activity_submissions per activityId in loop; acceptable at ~3 activities/family |
| getStaleBaselines doesn't use by_last_computed index | Medium | Open | take(1000) + in-memory filter; won't scale past 1000 families |
| mastered proficiency label is dead code | Medium | Open | Union type includes mastered but no code path produces it |
| error-analysis: isCorrect:undefined counted as incorrect | Medium | Open | Undocumented behavior when isCorrect is omitted from parts |
| error-analysis: buildTeacherErrorView uses activityId as studentId | Medium | Open | Inconsistent with other functions that accept studentIdMap |
| SRS: mapDbCardToContract duplicated in queue.ts and cards.ts | Medium | Open | Extract to shared utility |
| SRS: N+1 standard lookups in getDailyPracticeQueue | Medium | Open | One ctx.db.get per policy record (~50-100/course) |
| SRS: objectiveId defaults to "" when family has no objectives | Medium | Open | Empty string persisted; should skip SRS or log warning |
| SRS: SubmissionSrsAdapter reimplements processReview | Medium | Open | Two parallel pipelines risk divergence; delegate to processReview |
| SRS: completeDailySessionHandler loads all review logs | Medium | Open | .collect() fetches entire history; needs indexed count query |
| SRS queue: hardcoded courseKey + duplicate config constant | Medium | Open | Extract shared constant; parameterize courseKey |
| Sessions: duplicate getActiveSession naming across queue/sessions.ts and srs/sessions.ts | Medium | Open | Different return shapes under same name; confusing for callers |
| PracticeSessionProvider: submission failure silently swallowed | Medium | Open | No user-visible error, no retry; student loses work |
| PracticeSessionProvider: session completion sends no sessionId | High | Open | fetch('/api/practice/complete') has no body; completion may target wrong session |
| PracticeSessionProvider: session completion is fire-and-forget | Medium | Open | Failed completion leaves stale active session |
| PracticeCardRenderer: double timing instrumentation (renderer + ActivityRenderer) | Medium | Open | One hook's timing discarded; remove or consolidate |
| SRS queue: newCardsPerDay cap shared across all priorities | Medium | Open | Essential/supporting/extension compete for same quota |
| SRS sessions: by_student_and_status index relies on undefined sorting before defined | High | Open | No explicit filter for completedAt=undefined; fragile implicit ordering |
| SRS review_log: misconceptionTags not stored in evidence (Medium) | Medium | Open | submission-srs-adapter only stores baseRating/timingAdjusted/reasons; misconceptionTags needed for getMisconceptionSummary query to work end-to-end |
