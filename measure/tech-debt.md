# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| BM2 loginRateLimits was public mutation (security) | Critical | Resolved | Converted to internalMutation; added race condition handling, Math.max clamp, violation logging (review-27) |
| apiRateLimits no stale entry cleanup | Medium | Open | Table grows unbounded; rateLimits.ts and loginRateLimits.ts both have cleanup mutations |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Partial | Package uses `string` but Convex uses `Id<...>`; bridging casts in convexReviewLogStore.ts still needed (review-27) |
| 16 `v.any()` fields in IM3 Convex schema | Medium | Partial | Down from 21; srs_review_log fully typed; srs_cards state + rating now use shared validators; remaining: submissionData, props, content, fsrsState, config, and 10 metadata fields |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| No unique constraints on rate limit tables | High | Open | Convex indexes aren't unique; try/catch upsert handles concurrent inserts but duplicates can still be created |
| Rate limiters duplicated across IM3/BM2 | Medium | Open | Same logic diverges; should extract to shared package |
| IM3/BM2 rate limiter test coverage missing | Medium | Open | No test files for IM3 rateLimits.ts or BM2 rateLimits.ts (chatbot) |
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| getDueCards fetches all cards then filters by date in-memory | Medium | Open | by_student_and_due index has dueDate but no range query used |
| srs_review_log by_reviewed_at index unused (dead) | Low | Open | Index defined but no query uses it; getReviewsByStudent filters in JS instead |
| Session history pagination fetches all then slices client-side | Medium | Open | Use Convex cursor pagination instead |
| BM2 9 governance test suites permanently skipped | Medium | Open | TODO(monorepo) comments added; all need monorepo-aware path fixes |
| Equivalence checker: 2 aspirational .todo tests | Low | Open | Need symbolic math lib |
| 40+ seed lesson tests vacuous | Low | Open | Test hardcoded data against itself; convert to data-driven validator |
| StepByStepper-guided hint tracking test flaky | Low | Open | Passes in isolation; timing/ordering issue in full run |
| BM2 activities/complete proxies errorPayload.details | Low | Open | Internal API details exposed to client |
| practice-core: computeBaseRating([]) untested edge case | Low | Open | Empty parts array returns 'Good' — may be unintended |
| srs_reviews.ts: NaN on invalid reviewedAt string | High | Resolved | Added explicit NaN check with descriptive error in saveReview and getReviewsByStudent (review-28) |
| srs/cards.ts saveCards sequential N+1 lookups | Critical | Resolved | Batched lookups via Promise.all; writes remain sequential (review-28) |
| IM3 lesson-chatbot/skip routes use `as any` for internal refs | Medium | Resolved | Removed unnecessary `as any` casts; `internal.rateLimits`, `internal.student` are fully typed (review-28) |
| IM3/BM2 .env.example missing NEXT_PUBLIC_SITE_URL | Medium | Resolved | Added to both apps (review-28) |
| BM2 .env.example was missing 13+ env vars | Critical | Resolved | Added all missing vars with documentation (review-27) |
