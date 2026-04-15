# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation |
| Unbounded `take(500)` + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query; Convex billing concern |
| Approval status race condition (no version/lock) | High | Open | Concurrent reviews silently overwrite |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| Unbounded table scans in getDashboardData | Med-High | Open | `.collect()` on lessons, lesson_versions, phase_versions |
| getLessonProgress fetches ALL user progress | Med-High | Open | `.withIndex("by_user").collect()` returns all rows |
| No Convex-layer authorization | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| submitReviewHandler hashes with client-sent componentKind | High | Open | Hash may mismatch queue's resolved kind |
| Missing CCSS standards for M2/M3/M9 | High | Open | ~30 of ~50+ standards defined; M8 resolved 2026-04-16 |
| No lesson_standards links for modules 1-5 | High | Open | Only modules 6-8 have lesson-standard links; M9 pending |
| Module 3/4/5 seed standards lack lesson-standard links | Medium | Open | lesson_standards table needs linking |
| Seed tests are tautological (inline data, not actual seed files) | Medium | Open | Zero regression protection |
| No unit tests for error-analysis module (8 exported functions) | High | Open | Non-trivial aggregation logic untested |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| error-analysis studentIdMap uses activityId as key | High | Open | Wrong semantic key |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | onRenderError prop is dead code |
| StepByStepSolver Zod schema vs component interface mismatch | Medium | Open | Schema step shape differs from AlgebraicStep |
| Two divergent submission schemas (contract.ts vs submission.schema.ts) | Medium | Open | Mode enums and interactionHistory shapes differ |
| ActivityRenderer does not forward section content props | Medium | Open | template, blanks etc. lost between PhaseRenderer and activity |
| Refactor seed-lesson-standards.ts duplication | Medium | Open | Module 6 and 7 seeders are 95% identical; extract shared function |
| Content hash JSON.stringify treats `{a:undefined}` same as `{}` | Medium | Open | Potential hash collisions |
| N+1 phase reads in listReviewQueue (dev.ts) | Medium | Open | Sequential ctx.db.get per phase |
| No error.tsx boundary for student/teacher routes | Medium | Open | Convex outages produce raw 500 |
| Guided mode submissions not recorded | Medium | Open | No onSubmit for guided practice |
| Silent catch blocks in convex/student.ts and convex/teacher.ts | Medium | Open | Swallows all exceptions |
| RSC entry chunk 735 KB (pre-existing) | Medium | Open | Code-splitting needed to get under 500 KB |
| Algebraic test coverage structurally weak | Medium | Open | Tests named "all steps" check only fraction |
| Equivalence validator 6/50 tests failing | Low | Open | Pattern-matching limits for fraction/radical expressions |
| ReviewQueueItem type duplicated between component and lib | Low | Open | Slightly different shapes cause type mismatch risk |
| Legacy Supabase types in AuthProvider.tsx | Low | Open | snake_case profile fields should match Convex schema |
| Flaky tests: StepByStepper hint tracking, TeacherLessonPreview | Low | Open | Pass in isolation, flaky in full suite |
| Incorrect CCSS description for HSA-APR.B.2 | High | Resolved | Fixed 2026-04-16; corrected to Remainder Theorem |
| Missing HSF-LE.A.1 and HSA-CED.A.2 standards | High | Resolved | Added to seed-standards.ts 2026-04-16; M7 L5 links will now work |
| Hardened manual approval (6 items) | Critical | Resolved | Fixed 2026-04-15; harness gating, hash, hook, submissions |
| Malformed dollar formatting in seed-lesson-8-4 Example 2 | High | Resolved | Fixed 2026-04-16; `$20$`→`$20`, `$50$`→`$50` |
| Wrong componentKey in M8 lesson 8-2/8-3 Explore phases | High | Resolved | Fixed 2026-04-16; graphing-explorer y=1/x replaced with comprehension-quiz |
