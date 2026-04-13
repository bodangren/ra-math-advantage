# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved**

| Date | Track | Item | Severity | Status | Notes |
|------|-------|------|----------|--------|-------|
| 2026-04-05 | setup | No seed.ts in convex/ for demo data | Medium | Partial | **2026-04-14:** Seed Phase 1 infrastructure complete; full seed execution (DB writes) pending Phase 4-5 |
| 2026-04-05 | setup | Legacy Supabase types in AuthProvider.tsx (snake_case profile fields) | Low | Open | Should migrate to camelCase matching Convex schema |
| 2026-04-10 | activity-infrastructure | activity_completions table requires lessonId/phaseNumber not available in submission | Medium | Open | Submission mutation can't create completions without lesson context |
| 2026-04-12 | algebraic-examples | Equivalence validator 6/50 tests failing for complex cases | Low | Open | Pattern-matching limits; 88% passing exceeds 80% target. Consider symbolic math library for production. |
| 2026-04-13 | component-approval | Placeholder hash for example/practice components in submitReview | High | Open | `convex/dev.ts:113` uses static string; blocks staleness detection for 2/3 component kinds |
| 2026-04-13 | component-approval | `submitReview` takes `createdBy` as arg instead of deriving from auth | High | Open | Mitigated by route-level derivation; must remain internal-only |
| 2026-04-13 | component-approval | No auth checks in convex/dev.ts internal functions | Medium | Open | Route guard implemented; Convex function auth deferred |
| 2026-04-13 | component-approval | Review harnesses use hardcoded sample data not real component props | Medium | Open | ComponentHarnessPanel passes static data regardless of selected queue item |
| 2026-04-13 | component-approval | No tests for Convex dev functions | High | Open | Schema tests vacuous; no mutation/query behavior tested |
| 2026-04-13 | component-approval | Unbounded `take(500)` with N+1 hash computation in listReviewQueue | High | Open | 500 SHA-256 hashes per query; no index-based pre-filtering; Convex billing concern |
| 2026-04-13 | component-approval | Approval status overwritten without version/lock — race condition | High | Open | Concurrent reviews on same component silently overwrite each other |
| 2026-04-13 | algebraic-examples | Algebraic test coverage is structurally weak | Medium | Open | Tests named "all steps" check only 20-50%; guided/practice modes near no-ops |
| 2026-04-14 | supporting-activities | Guided mode submissions not recorded | Medium | Open | Guided mode calls onComplete without onSubmit; no analytics/grading data produced |
| 2026-04-13 | bundle | MarkdownRenderer lazy-load may affect TTI on lesson pages | Low | Open | Verify with lighthouse on a representative lesson page |
| 2026-04-13 | content-hash | undefined values silently dropped by JSON.stringify | Low | Open | `{a: undefined}` hashes identically to `{}`; no regression test |
| 2026-04-14 | code-review | NaN scores from division by zero in FillInTheBlank/ComprehensionQuiz | High | Resolved | **Fixed 2026-04-14:** Guard `blankIds.length` and `questions.length` before division |
| 2026-04-14 | code-review | NaN from parseFloat in ROC/DiscriminantAnalyzer submissions | Medium | Resolved | **Fixed 2026-04-14:** Added `!isNaN()` check before computing isCorrect |
| 2026-04-14 | code-review | DiscriminantAnalyzer silent coefficient fallback showing wrong results | High | Resolved | **Fixed 2026-04-14:** Shows error message when equation can't be parsed |
| 2026-04-14 | code-review | 16 TypeScript errors from prior tracks | High | Resolved | **Fixed 2026-04-14:** Registry types, activity props, seed imports, vite config |
| 2026-04-14 | code-review | Activity components pass activityId to inner components that don't accept it | High | Resolved | **Fixed 2026-04-14:** Moved activityId injection to Activity wrapper level |
| 2026-04-14 | code-review | seed.ts infinite loop calling seedStandards for each standard | High | Resolved | **Fixed 2026-04-14:** seedStandards now called once; it seeds all standards at once |
| 2026-04-14 | code-review | Security risk using Function() constructor in RateOfChangeCalculator | High | Resolved | **Fixed 2026-04-14:** Replaced with recursive descent parser for expression evaluation |
