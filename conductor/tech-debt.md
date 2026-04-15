# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| submitReviewHandler hashes with client-sent componentKind | High | Open | Write-path uses client arg; read-path derives from placement; hash mismatch causes permanent isStale |
| Approval status race condition (no version/lock) | High | Open | Convex serializes mutations (no lost update) but no "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| No Convex-layer authorization | Med-High | Open | Auth boundary is entirely in Next.js server layer |
| Missing CCSS standards for M2/M3 | High | Open | ~30 of ~50+ standards defined; M8, M9 resolved |
| No lesson_standards links for modules 1-5 | High | Open | Only modules 6-9 have lesson-standard links |
| No unit tests for error-analysis module (8 exported functions) | High | Open | Non-trivial aggregation logic untested |
| error-analysis parseAIResponse uses fragile line-based parsing | High | Open | Breaks on markdown, multi-paragraph AI responses |
| ActivityReviewHarness handleError never reaches ActivityPreview | High | Open | Render errors crash tree silently; canApprove not blocked |
| submitReviewHandler takes createdBy as arg not from auth | High | Open | Mitigated by route-level derivation |
| Unbounded take(500) + N+1 hash in listReviewQueue | High | Open | 500 SHA-256 hashes/query |
| Activities table has no deduplication on re-seed | Medium | Open | Phase insertion is idempotent but activity inserts are not; re-seed creates duplicates |
| Seed tests are tautological (inline data, not actual seed files) | Medium | Open | Zero regression protection |
| StepByStepSolver Zod schema vs component interface mismatch | Medium | Open | Schema step shape differs from AlgebraicStep |
| ActivityRenderer does not forward section content props | Medium | Open | template, blanks etc. lost between PhaseRenderer and activity |
| Refactor seed-lesson-standards.ts duplication | Medium | Open | Module 6 and 7 seeders are 95% identical |
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
| Practice timing time base mixed (performance.now vs Date.now) | Critical | Resolved | Fixed 2026-04-16; all accumulator calls now use performance.now() |
| Idle double-counting in timing.ts handleInteraction | Medium | Resolved | Fixed 2026-04-16; Block 1 now returns after processing explicit idle |
| Wrong correctIndex in M9 lesson 9-2 discourse quiz | High | Resolved | Fixed 2026-04-16; Quadrant II reference angle answer corrected |
| Wrong componentKey in M9 lesson 9-1 Explore phase | High | Resolved | Fixed 2026-04-16; replaced graphing-explorer with comprehension-quiz |
| Two divergent submission schemas (contract.ts vs submission.schema.ts) | Medium | Resolved | Reconciled 2026-04-16; keep contract.ts canonical |
| Hardened manual approval (6 items) | Critical | Resolved | Fixed 2026-04-15 |
| Malformed dollar formatting in seed-lesson-8-4 | High | Resolved | Fixed 2026-04-16 |
| Wrong componentKey in M8 lesson 8-2/8-3 Explore phases | High | Resolved | Fixed 2026-04-16 |
