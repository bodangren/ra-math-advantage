# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Misconception tags not persisted in review evidence | High | Resolved | submission-srs-adapter now persists tags in review evidence |
| SRS sessions: by_student_and_status index relies on undefined sorting | High | Open | No explicit filter for completedAt=undefined |
| Approval status race condition (no version/lock) | High | Open | Content hash mismatch check added (review-15); still not fully atomic but materially safer |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Open | One DB query per phase inside loop |
| Deactivated users can access BM2 API routes | High | Open | 7 endpoints use JWT-only verification; need requireActive*SessionClaims |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| 5 production `as any` casts on Convex `internal` (IM3) | Medium | Open | Stale generated types; run npx convex dev to regenerate |
| 21 `v.any()` fields in IM3 Convex schema | Medium | Open | Zero runtime validation on content, props, submissionData, evidence, fsrsState |
| No rate limiting on 5 BM2 API endpoints | Medium | Open | phases/complete, assessment, activities, error-summary, ai-error-summary |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| BM2 component_approvals role requirement leaked in error | Low | Resolved | Changed from "admin role required" to generic "Unauthorized" |
| Demo seed only assigns Unit 1 lessons | Low | Resolved | seed-demo-env.ts now queries all lessons without unit filter |
| practice-core: computeBaseRating([]) untested edge case | Medium | Open | Empty parts array returns 'Good' — may be unintended |
| BM2 duplicate PASSWORD_ALPHABET in convex/auth.ts | Low | Open | Can't import from core-auth; added comment noting derivation |
| BM2 ~30 files still import via re-export stubs instead of direct package | Low | Open | Works via stubs; migration to direct @math-platform/* imports deferred |
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
| 5 packages missing vitest.config files | Low | Resolved | Added vitest.config.ts to all 5 packages (monorepo-repair_20260419) |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| practice-core dual schema files | Medium | Open | submission.schema.ts + contract.ts parallel surfaces; consolidate |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific |
| teacher-reporting-core .js import extension inconsistency | Low | Open | Uses .js extensions while other packages don't |
| IM3 lib/study local copy not wired to study-hub-core types | Medium | Open | GlossaryTerm is wider than StudyTerm; structural compatibility works but not explicitly adopted |
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Open | Exported public API with zero test coverage |
| ai-tutoring: as any cast in providers.ts response parsing | Medium | Open | Need typed interface for OpenRouterResponse |
| IM3 chatbot: no tests for LessonChatbot.tsx | High | Resolved | 12 tests added for all chatbot states |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
| CI: package test/lint continue-on-error swallows failures | High | Resolved | Removed continue-on-error from package matrix (monorepo-repair_20260419) |
| CI: BM2 redundant || true + continue-on-error | Low | Resolved | Removed continue-on-error; BM2 now uses workspace commands (monorepo-repair_20260419) |
| workbook-pipeline: capstone filename hardcoded to BM2 domain | Medium | Open | "investor_ready_workbook" is business-math-specific; parameterize |
| workbook-pipeline: workbooks.client.ts double-cast bypasses types | Medium | Open | `as unknown as WorkbookManifest` — use zod validation |
| teacher-reporting: versionByLessonId picks first version silently | Medium | Open | No guarantee first version is the active one |
| class_lessons table empty — chatbot falls back to open enrollment | High | Open | Teacher assignment UI built; proper seeding still needed via /teacher/lessons page |
| Misconception summary fetches ALL reviews before date filter | Medium | Open | Filters by sinceMs in-memory; should use range query when index supports it |
