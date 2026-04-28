# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| BM2 apiRateLimits and rateLimits auth failure on API routes | Critical | Resolved | Mutations used ctx.auth.getUserIdentity() but were called via unauthenticated fetchPublicMutation/fetchInternalMutation; converted to internalMutation with explicit userId arg (review-25) |
| BM2 apiRateLimits duplicate-insert race condition | High | Resolved | Fixed via try/catch upsert pattern in checkAndIncrementApiRateLimitHandler |
| IM3 rateLimits duplicate-insert race condition | High | Resolved | Fixed via try/catch upsert pattern in checkAndIncrementRateLimit (review-26) |
| BM2 rateLimits duplicate-insert race condition | High | Resolved | Fixed via try/catch upsert pattern in checkAndIncrementRateLimit (review-26) |
| apiRateLimits no stale entry cleanup | Medium | Open | Table grows unbounded; rateLimits.ts and loginRateLimits.ts both have cleanup mutations |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | 7 bridging casts in convexCardStore.ts; package types need branded string |
| 18 `v.any()` fields in IM3 Convex schema | Medium | Partial | Down from 21; SRS review_log fields typed + shared validators extracted (review-26); remaining: submissionData, props, content, fsrsState, and 12 metadata fields |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| RSC page chunk 891 KB, vendor-charts 830 KB | Medium | Open | Activity lazy-loading done; further code-splitting needed to get under 500 KB |
| SRS reviews.ts untested | Medium | Resolved | saveReview, getReviewsByCard, getReviewsByStudent — 10 tests added (minimax-m2) |
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| getDueCards fetches all cards then filters by date in-memory | Medium | Open | by_student_and_due index has dueDate but no range query used |
| Session history pagination fetches all then slices client-side | Medium | Open | Use Convex cursor pagination instead |
| N+1: teacher.ts 5 sequential .collect() in competency detail | High | Resolved | Batched via Promise.all (review-23) |
| N+1: teacher.ts listActivePhaseIds 3 sequential .collect() | Medium | Resolved | Batched via Promise.all (review-23) |
| N+1: teacher.ts getTeacherDashboardData 3 sequential .collect() | Medium | Resolved | Batched via Promise.all (review-23) |
| apiRateLimits remaining could go negative | Medium | Resolved | Added Math.max(0, ...) clamp (review-23) |
| IM1 missing DESIGN.md and product.md | High | Resolved | Both files created (minimax-m2) |
| Scaffolded apps missing .env.example | Medium | Resolved | .env.example created for IM3, IM1, IM2, PreCalc; BM2 already had one (review-26) |
| BM2 9 governance test suites permanently skipped | Medium | Open | TODO(monorepo) comments added; all need monorepo-aware path fixes |
| SRS validator DRY violation | Low | Resolved | Extracted srsCardStatePickValidator and srsEvidenceValidator to convex/srs/validators.ts (review-26) |
| IM3/BM2 rateLimits remaining could go negative | Medium | Resolved | Added Math.max(0, ...) clamp in checkAndIncrementRateLimit (review-26) |
| Equivalence checker: 2 aspirational .todo tests | Low | Open | Need symbolic math lib |
| 40+ seed lesson tests vacuous | Low | Open | Test hardcoded data against itself; convert to data-driven validator |
| StepByStepper-guided hint tracking test flaky | Low | Open | Passes in isolation; timing/ordering issue in full run |
| BM2 activities/complete proxies errorPayload.details | Low | Open | Internal API details exposed to client |
| practice-core: computeBaseRating([]) untested edge case | Low | Open | Empty parts array returns 'Good' — may be unintended |
