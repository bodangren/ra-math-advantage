# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Misconception summary query: N+1 card resolution depth | Critical | Open | 30 students x 100 reviews = 3k+ sequential reads; will timeout |
| Misconception tags not persisted in review evidence | High | Open | getMisconceptionSummary always returns empty |
| BM2 DailyPracticeSession SRS adapter gap | High | Resolved | Flat schema migration complete; adapters removed (2026-04-18 review #7) |
| BM2 fetchInternalQuery returns untyped `unknown` (~130 TS errors) | High | Open | All BM2 API routes access properties on `{}` without type narrowing; needs generic param |
| BM2 convex/activities.ts calls non-existent ctx.transaction() | High | Open | Dead code path — Convex doesn't have this API; will throw at runtime |
| BM2 CashFlowChallenge component type drift (~31 TS errors) | High | Open | Component accesses activity.props fields at top level; needs destructuring |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | Multiple handlers iterate students + collect |
| Equivalence checker: 6 aspirational tests marked .todo | High | Open | Needs symbolic math lib |
| BM2 governance tests fail in monorepo context (27 tests) | Medium | Open | Repo-structure tests expect root paths; should be skipped/removed |
| StepByStepper-guided hint tracking test flaky in full suite | Low | Open | Passes in isolation; timing/ordering issue in full run |
| BM2 296 TypeScript errors (categories B-F) | Medium | Open | ~130 untyped queries, ~31 CashFlowChallenge, ~90 test mocks, ~15 teacher UI null safety |
| BM2 ESLint not found by vinext lint | Medium | Open | vinext can't find eslint in BM2 workspace |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles"> |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Open | 520 lines of domain logic not extracted to package |
| SRS: card + review log saved non-atomically | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core has only 1 test file in-package | Medium | Open | contract.ts, srs-rating.ts, timing-baseline.ts untested at package level |
| BM2 Convex SRS schema migration | High | Resolved | srs_cards migrated to flat SrsCardState fields (2026-04-18, Phase 3) |
| 5 packages missing vitest.config files | Low | Open | core-auth, core-convex, activity-runtime, component-approval, graphing-core |
| core-convex import extension inconsistency | Low | Resolved | Normalized to no-extension style (2026-04-18 review #6) |
| BM2 scheduler test boundary flakiness | Low | Resolved | Used `after` timestamp for upper bound tolerance (2026-04-18 review #6) |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| practice-core dual schema files | Medium | Open | submission.schema.ts + contract.ts parallel surfaces; consolidate |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific; timing imports redirected to package (2026-04-18) |
| teacher-reporting-core gradebook-export CSV header alignment | High | Resolved | Fixed in review #8 — mastery headers excluded when includeMasteryLevel=false (2026-04-19) |
| teacher-reporting gradebook.ts hard-coded isUnitTest=orderIndex===11 | High | Resolved | Fixed in review #9 — RawLesson.isUnitTest now caller-controlled; default false (2026-04-19) |
| teacher-reporting-core gradebook-export CSV cell escaping | Medium | Resolved | Fixed in review #9 — all cell values now pass through escapeCsvValue (2026-04-19) |
| teacher-reporting-core course-overview passes 'not_started' to computeCellColor | Medium | Open | Semantically misleading sentinel; fragile if computeCellColor logic changes |
| teacher-reporting-core .js import extension inconsistency | Low | Open | Uses .js extensions while other packages don't; works but inconsistent |
| study-hub-core BaseReviewSession untested in-package | Low | Open | Tested from IM3 imports but not in package's own test suite |
| IM3 lib/study local copy not wired to study-hub-core types | Medium | Open | GlossaryTerm is wider than StudyTerm; structural compatibility works but not explicitly adopted |
| ai-tutoring: isRetryableError default was return true | Critical | Resolved | Fixed in review #9 — now defaults to false; network patterns are explicit allowlist (2026-04-19) |
| ai-tutoring: HTTP headers reference wrong project | Medium | Resolved | Fixed in review #9 — updated to Integrated Math 3 (2026-04-19) |
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Open | Exported public API with zero test coverage |
| ai-tutoring: as any cast in providers.ts response parsing | Medium | Open | Need typed interface for OpenRouterResponse |
| IM3 chatbot rate limiting: fetchInternalMutation has no user identity | Critical | Resolved | Fixed in review #9 — mutations accept userId/profileId args; API route resolves profile first (2026-04-19) |
| IM3 chatbot: no tests for route.ts, rateLimits.ts, LessonChatbot.tsx | High | Open | Three new files with zero test coverage |
| IM3 chatbot: prompt injection risk in buildPrompt | Medium | Open | User question interpolated directly; added triple-quote delimiters but no system-level guard |
| IM3 getLessonForChatbot: learningObjectives parsing fragile | Medium | Resolved | Fixed in review #9 — now uses array directly instead of split(index[0]) (2026-04-19) |
| IM3 rateLimits cleanupStaleRateLimits: unbounded .collect() | Medium | Resolved | Fixed in review #9 — now uses .filter().take(100) (2026-04-19) |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
