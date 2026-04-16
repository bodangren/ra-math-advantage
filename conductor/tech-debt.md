# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Approval status race condition (no version/lock) | High | Open | Convex serializes mutations (no lost update) but no "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| No Convex-layer authorization | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| submitReviewHandler takes createdBy as arg not from auth | High | Open | Mitigated by route-level derivation |
| Unbounded take(500) + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query |
| Activities table has no deduplication on re-seed | Medium | Open | Phase insertion is idempotent but activity inserts are not; re-seed creates duplicates |
| Seed tests are tautological (inline data, not actual seed files) | Medium | Open | Zero regression protection |
| StepByStepSolver Zod schema vs component interface mismatch | Medium | Open | Schema step shape differs from AlgebraicStep |
| ActivityRenderer does not forward section content props | Medium | Open | template, blanks etc. lost between PhaseRenderer and activity |
| Refactor seed-lesson-standards.ts duplication | Medium | Open | 9 handlers are ~100% identical; extract factory function |
| SRS adapters: generated API missing srs module | Medium | Resolved | Manually added srs/cards, srs/reviews, srs/processReview, srs/sessions to api.d.ts (2026-04-16) |
| Content hash JSON.stringify treats undefined same as absent | Medium | Open | Potential hash collisions |
| N+1 phase reads in listReviewQueue (dev.ts) | Medium | Open | Sequential ctx.db.get per phase |
| No error.tsx boundary for student/teacher routes | Medium | Open | Convex outages produce raw 500 |
| Guided mode submissions not recorded | Medium | Open | No onSubmit for guided practice |
| Silent catch blocks in convex/student.ts and convex/teacher.ts | Medium | Open | Swallows all exceptions |
| RSC entry chunk 750 KB (pre-existing) | Medium | Open | Code-splitning needed to get under 500 KB |
| Algebraic test coverage structurally weak | Medium | Open | Tests named "all steps" check only fraction |
| Convex V validator does not enforce timing refinements | Medium | Open | Negative durations accepted server-side |
| canApprove gate incomplete in Activity/Practice harnesses | Medium | Open | Checklist items not gated: mode selector, variant inspection |
| M9 lessons all use graphing-explorer in Explore phases | Medium | Open | unit-circle-trainer listed in contract but never used |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits for fraction/radical expressions |
| ReviewQueueItem type duplicated between component and lib | Low | Open | Slightly different shapes |
| confidenceReasons is string[] not union type | Low | Open | Typos silently pass type checking |
| PracticeTimingEvidence local type omits contract fields | Low | Open | SubmissionReviewPanel.tsx redefines contract type |
| totalFocusLossMs accumulated but never exposed | Low | Open | Dead code in timing.ts |
| Flaky tests: StepByStepper hint tracking, TeacherLessonPreview | Low | Open | Pass in isolation, flaky in full suite |
| M9 seed lesson 9-5 Learn section uses degrees, example uses radians | Low | Open | Unexplained unit switch |
| collectEligibleTimings N+1 in timing_baseline.ts | Medium | Open | Queries activity_submissions per activityId in loop; acceptable at ~3 activities/family |
| getStaleBaselines doesn't use by_last_computed index | Medium | Open | take(1000) + in-memory filter; won't scale past 1000 families |
| mastered proficiency label is dead code | Medium | Open | Union type includes mastered but no code path produces it |
| Fragile type assertion on submissionData.timing | Medium | Open | collectEligibleTimings casts to local TimingSummary; no compile-time protection |
| scheduler.test.ts fully mocks ts-fsrs | Medium | Open | Tests verify wrapper logic but don't exercise real FSRS algorithm |
| error-analysis: studentIdMap code paths untested | High | Open | summarizePartOutcomes and buildDeterministicSummary accept studentIdMap but no test passes it |
| error-analysis: isCorrect:undefined counted as incorrect | Medium | Open | Undocumented behavior when isCorrect is omitted from parts |
| error-analysis: buildTeacherErrorView uses activityId as studentId | Medium | Open | Inconsistent with other functions that accept studentIdMap |
| SRS queue: newCardsPerDay cap is shared across all priorities | Medium | Open | Essential/supporting/extension compete for same quota; update spec comment |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles">; type assertions required at boundary |
| SRS CardStore: saveCard by problemFamilyId alone | High | Resolved | Added by_student_and_problem_family index; updated saveCard/saveCards/processReview to query by (studentId, problemFamilyId) |