# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| BM2 loginRateLimits was public mutation (security) | Critical | Resolved | Converted to internalMutation (review-27) |
| apiRateLimits no stale entry cleanup | Medium | Resolved | IM3 crons.ts scheduled hourly cleanup of stale chatbot_rate_limits (tech-debt-resolution) |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Resolved | Centralized to `toProfileId()` adapter; 7 scattered `as` casts removed (tech-debt-resolution) |
| 16 `v.any()` fields in IM3 Convex schema | Medium | Resolved | Typed: srs_sessions.config, activity_completions.completionData, lastValidationResult; 14 remaining are metadata bags and polymorphic fields (tech-debt-resolution) |
| BM2 chatbot prompt injection defense still weak | Medium | Resolved | Added detectPromptInjection with 6 pattern categories; system/user message separation; comprehensive tests (chatbot_prompt_guard_20260425) |
| BM2 login endpoint has no input length limits | Medium | Resolved | Username and password capped at 255 chars; 400 on exceed (tech-debt-resolution) |
| No unique constraints on rate limit tables | High | Resolved | Convex has no unique indexes; try/catch upsert pattern is the accepted approach, tested in all 3 rate limit modules (tech-debt-resolution) |
| Rate limiters duplicated across IM3/BM2 | Medium | Resolved | Extracted to @math-platform/rate-limiter package; IM3+BM2 refactored to use shared sliding-window (tech-debt-resolution) |
| IM3/BM2 rate limiter test coverage missing | Medium | Resolved | 15 package-level tests; IM3 15+10 pass; BM2 45 pass (tech-debt-resolution) |
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| srs_review_log by_reviewed_at index unused (dead) | Low | Resolved | Removed unused index from IM3 schema (tech-debt-resolution) |
| Session history pagination fetches all then slices client-side | Medium | Resolved | Replaced .collect()+slice with Convex .paginate() using real cursors; 4 new tests (tech-debt-resolution) |
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
| apiRateLimits endpoint arg was v.string() with unsafe cast | High | Resolved | Changed to v.union of 5 v.literal types; deny-by-default on unknown endpoints (review-29) |
| srs/cards.ts getCardHandler dead try/catch on `as` cast | High | Resolved | Removed dead try/catch (review-29) |
| srs/cards.ts getDueCards fetches all then filters in-memory | Medium | Resolved | Now uses `.lte("dueDate", args.asOfDate)` index range query (review-29) |
| reviews.ts handler functions not exported for testing | Medium | Resolved | Extracted and exported saveReviewHandler, getReviewsByCardHandler, getReviewsByStudentHandler (review-29) |
| Prompt guard regex false positives / no Unicode normalization | High | Resolved | Restructured regex; added NFC normalization, Cyrillic/fullwidth mapping (prompt_guard_hardening_20260429) |
| processReview.ts no studentId cross-validation | High | Resolved | Added validation at handler start; throws error on mismatch (2026-04-29) |
| cards.ts updatedAt inconsistent (Date.now vs caller) | Medium | Resolved | Both saveCardHandler and saveCardsHandler now use caller-provided timestamp consistently (tech-debt-resolution) |
| srs_reviews by_student index unused for date range | Low | Open | getReviewsByStudent filters in JS; needs by_student_and_reviewed_at index |
| BM2 apiRateLimits test mismatched deny-by-default | High | Resolved | Updated test to expect allowed=false for unknown endpoints; fixed getApiRateLimitStatus inconsistency (review-30) |
| processReview returned caller cardId not DB doc ID | High | Resolved | Changed return to cardDocId (actual Convex document ID used for DB operations) (review-30) |
| objectiveProficiency deriveSubmissionTimingsFromPreFetched dead Map | Medium | Resolved | Removed unused submissionMap that was populated but never read (review-30) |
| BM2 worker-entry bundle 5.1 MB | Critical | Resolved | Vite build output 2.9 MB (under 3 MB threshold); bundle audit script added to CI (tech-debt-resolution) |
| Prompt guard bypass via punctuation without whitespace | High | Resolved | Added `stripPunctuationToSpaces` preprocessing in `detectKeywordProximity`; 4 new test cases (tech-debt-resolution) |
| getApiRateLimitStatus had deny-by-default inconsistency | High | Resolved | Was returning isLimited=false for unknown endpoints while mutation returned allowed=false (review-30) |
| BM2 rate limiter handler test coverage still missing | Medium | Open | BM2 apiRateLimits handlers tested but rateLimits.ts (login/chatbot) still untested |
| objectiveProficiency full table scan of activity_submissions | Medium | Resolved | Replaced with per-student indexed queries via Promise.all + Set lookup (review-31) |
| objectiveProficiency full table scan of srs_cards/srs_review_log | Medium | Resolved | Replaced with per-student indexed queries via Promise.all (review-31) |
| IM3 still uses local activity component imports | Medium | Resolved | Schemas and algebraic logic migrated to @math-platform/math-content; IM3 local files now re-export from package (math-content extraction) |
