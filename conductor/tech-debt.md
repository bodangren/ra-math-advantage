# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation; must remain internal-only |
| Unbounded `take(500)` + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query; Convex billing concern |
| Approval status race condition (no version/lock) | High | Open | Concurrent reviews silently overwrite |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| Unbounded table scans in getDashboardData | Med-High | Open | `.collect()` on lessons, lesson_versions, phase_versions |
| getLessonProgress fetches ALL user progress, not lesson-scoped | Med-High | Open | `.withIndex("by_user").collect()` returns all rows |
| No Convex-layer authorization — admin token = full access | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| submitReviewHandler hashes with client-sent componentKind | High | Open | Hash may mismatch queue's resolved kind; permanent stale mismatch |
| ReviewQueueClient had dual selectedItem state (dead state) | Critical | Resolved | Fixed 2026-04-15; renamed to useReviewQueueClient, removed dead state |
| Approve button disabled logic had unreachable branch | Critical | Resolved | Fixed 2026-04-15; simplified to `disabled={!harnessCanApprove}` |
| ExampleReviewHarness canApprove ignored verification checkboxes | High | Resolved | Fixed 2026-04-15; algorithmicChecked+coherentFeedbackChecked now gate approval |
| generateAISummary silently swallowed all errors | High | Resolved | Fixed 2026-04-15; added console.error logging |
| Missing CCSS standards for M5/M6 (HSF-LE.A.x, HSF-IF.C.7e, HSF-BF.B.5) | High | Resolved | Added to seed-standards.ts 2026-04-15; M5/M6 lesson links pending |
| No lesson_standards seeding pipeline | High | Partial | Module 6 pipeline built 2026-04-15; extend pattern to M3-M5 |
| Incorrect CCSS description for HSA-APR.B.2 (seed-standards.ts) | High | Open | Describes Binomial Theorem instead of Remainder Theorem |
| Missing CCSS standards for M2/M3 (HSA-APR.C.4, HSA-APR.C.5, HSA-REI.D.11) | Medium | Open | Standards gap in seed-standards.ts |
| Module 3/4 seed standards lack lesson-standard links | Medium | Open | lesson_standards table needs linking in seed functions |
| Seed tests are tautological (inline data, not actual seed files) | Medium | Open | Zero regression protection; changes to seed files won't break tests |
| No unit tests for error-analysis module (8 exported functions) | High | Open | Non-trivial aggregation logic untested |
| PracticeReviewHarness SubmissionEnvelope diverges from practice.v1 contract | Medium | Open | Missing contractVersion, mode, status; wrong field names |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ReviewQueueItem type duplicated between component and lib | Low | Open | Slightly different shapes cause type mismatch risk |
| Content hash JSON.stringify treats `{a:undefined}` same as `{}` | Medium | Open | Potential hash collisions for undefined vs missing props |
| N+1 phase reads in listReviewQueue (dev.ts:54-59) | Medium | Open | Sequential ctx.db.get per phase; batch-fetch needed |
| No error.tsx boundary for student/teacher routes | Medium | Open | Convex outages produce raw 500 |
| Algebraic test coverage structurally weak (20-50% step assertion) | Medium | Open | Tests named "all steps" check only fraction |
| Guided mode submissions not recorded | Medium | Open | No onSubmit for guided practice; no analytics data |
| Silent catch blocks in convex/student.ts and convex/teacher.ts | Medium | Open | Swallows all exceptions including non-format errors |
| RSC entry chunk 734 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| Legacy Supabase types in AuthProvider.tsx | Low | Open | snake_case profile fields should match Convex schema |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits; 88% passing exceeds 80% target |
| dashboard.test.ts TypeScript errors (missing isLocked) | Low | Open | 12 tests; pre-existing |
| Flaky tests: StepByStepper hint tracking, TeacherLessonPreview | Low | Open | Pass in isolation, flaky in full suite |
| useExampleReviewHarnessState hook canApprove bypasses verification | Critical | Resolved | Fixed 2026-04-15; hook now includes algorithmicVerified + coherentFeedbackVerified |
| StepByStepSolverActivity submissions always isCorrect:true | Critical | Resolved | Fixed 2026-04-15; PracticeMode passes real attempts via callback |
| Module 7 lessons not wired into seed.ts | High | Resolved | Fixed 2026-04-15; added switch cases and getLessons() entries for 7-1, 7-2 |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | onRenderError prop is dead code; render errors silently lost |
| error-analysis studentIdMap uses activityId as key | High | Open | Wrong semantic key — should be student-specific, not activity-specific |
| StepByStepSolver Zod schema vs component interface mismatch | Medium | Open | Schema step shape (id, description, expression) differs from AlgebraicStep (expression, explanation, hint) |
| Two divergent submission schemas (contract.ts vs submission.schema.ts) | Medium | Open | Mode enums differ; interactionHistory shapes differ |
| equation-solver and drag-drop-categorization are PlaceholderComponents | Medium | Open | Render null silently; no fallback UI |
| ActivityRenderer does not forward section content props | Medium | Open | template, blanks etc. lost between PhaseRenderer and activity components |
| Seed tests are tautological (inline data, not actual seed files) | Medium | Open | Zero regression protection; changes to seed files won't break tests |
| No lesson-standards links for modules 1-5 and 7 | High | Open | Only module 6 has 8 links; 44+ lessons have no standards |
| Missing CCSS standards for modules 2, 3, 5, 7-9 | High | Open | Only 17 of ~50+ standards defined in seed-standards.ts |
| No seed-specific tests | Medium | Open | Zero test coverage for seed functions, consistency, or idempotency |
