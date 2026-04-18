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
| BM2 DailyPracticeSession SRS adapter gap | High | Resolved | Added legacyToSrsCardState/srsCardStateToLegacy adapters (2026-04-18 review #6) |
| BM2 fetchInternalQuery returns untyped `unknown` (~130 TS errors) | High | Open | All BM2 API routes access properties on `{}` without type narrowing; needs generic param |
| BM2 convex/activities.ts calls non-existent ctx.transaction() | High | Open | Dead code path — Convex doesn't have this API; will throw at runtime |
| BM2 CashFlowChallenge component type drift (~31 TS errors) | High | Open | Component accesses activity.props fields at top level; needs destructuring |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined |
| Approval status race condition (no version/lock) | High | Open | No "approve exact version" check |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Open | Multiple handlers iterate students + collect |
| Equivalence checker: 6 aspirational tests marked .todo | High | Open | Needs symbolic math lib |
| BM2 governance tests fail in monorepo context (27 tests) | Medium | Open | Repo-structure tests expect root paths; should be skipped/removed |
| BM2 303 TypeScript errors (categories B-F) | Medium | Open | ~130 untyped queries, ~31 CashFlowChallenge, ~90 test mocks, ~15 teacher UI null safety |
| BM2 ESLint not found by vinext lint | Medium | Open | vinext can't find eslint in BM2 workspace |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles"> |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Open | 520 lines of domain logic not extracted to package |
| SRS: card + review log saved non-atomically | Medium | Open | If second mutation fails, card state updated without audit trail |
| SRS: submissionSrs accepts v.any() with unsafe cast | Medium | Open | No Zod validation on submission envelope |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core has only 1 test file in-package | Medium | Open | contract.ts, srs-rating.ts, timing-baseline.ts untested at package level |
| BM2 Convex SRS schema migration deferred | Medium | Deferred | srs_cards table still uses legacy card:Record format |
| 5 packages missing vitest.config files | Low | Open | core-auth, core-convex, activity-runtime, component-approval, graphing-core |
| core-convex import extension inconsistency | Low | Resolved | Normalized to no-extension style (2026-04-18 review #6) |
| BM2 scheduler test boundary flakiness | Low | Resolved | Used `after` timestamp for upper bound tolerance (2026-04-18 review #6) |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| practice-core dual schema files | Medium | Open | submission.schema.ts + contract.ts parallel surfaces; consolidate |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific |
