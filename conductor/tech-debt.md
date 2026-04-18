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
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | SrsCardState uses string, Convex uses Id<"profiles"> |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Open | 520 lines of domain logic not extracted to package |
| SRS: card + review log saved non-atomically | Medium | Open | If second mutation fails, card state updated without audit trail |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| practice-core has only 1 test file in-package | Medium | Open | contract.ts, srs-rating.ts, timing-baseline.ts untested at package level |
| 5 packages missing vitest.config files | Low | Open | core-auth, core-convex, activity-runtime, component-approval, graphing-core |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| practice-core dual schema files | Medium | Open | submission.schema.ts + contract.ts parallel surfaces; consolidate |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific |
| ai-tutoring: learningObjectives bypassed sanitizeMarkdownForPrompt | High | Resolved | Sanitized via .map() in assembleLessonChatbotContext (review #11) |
| teacher-reporting-core .js import extension inconsistency | Low | Open | Uses .js extensions while other packages don't |
| study-hub-core BaseReviewSession untested in-package | Low | Open | Tested from IM3 imports but not in package's own test suite |
| IM3 lib/study local copy not wired to study-hub-core types | Medium | Open | GlossaryTerm is wider than StudyTerm; structural compatibility works but not explicitly adopted |
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Open | Exported public API with zero test coverage |
| ai-tutoring: as any cast in providers.ts response parsing | Medium | Open | Need typed interface for OpenRouterResponse |
| IM3 chatbot: no tests for route.ts, rateLimits.ts, LessonChatbot.tsx | High | Open | Three new files with zero test coverage — route.ts now tested (2026-04-19) |
| IM3 chatbot: prompt injection risk in buildPrompt | Medium | Resolved | Added sanitizeMarkdownForPrompt in lesson-context.ts (2026-04-19) |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
| IM3 chatbot: no lesson enrollment auth + lesson content prompt injection | Critical | Resolved | Added isStudentActivelyEnrolled check + sanitizeMarkdownForPrompt (2026-04-19) |
| CI: package test/lint continue-on-error swallows failures | High | Open | Broken packages can merge without detection |
| CI: BM2 redundant || true + continue-on-error | Low | Open | Both layers suppress failures; remove one |
| workbook-pipeline: capstone filename hardcoded to BM2 domain | Medium | Open | "investor_ready_workbook" is business-math-specific; parameterize |
| workbook-pipeline: workbooks.client.ts double-cast bypasses types | Medium | Open | `as unknown as WorkbookManifest` — use zod validation |
| teacher-reporting: versionByLessonId picks first version silently | Medium | Open | No guarantee first version is the active one |
| ai-tutoring: abort listener leak + missed already-aborted signal | Medium | Resolved | Added {once:true} + aborted check (review #11) |
| IM3 chatbot: enrollment check doesn't verify lesson-class membership | High | Open | isStudentActivelyEnrolled checks any enrollment, not lesson ownership |