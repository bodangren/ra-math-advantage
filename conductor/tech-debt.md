# Tech Debt Registry

> This file is curated working memory, not an append-only log. Keep it at or below **50 lines**.
> Remove or summarize resolved items when they no longer need to influence near-term planning.
>
> **Severity:** `Critical` | `High` | `Medium` | `Low`
> **Status:** `Open` | `Resolved`

| Item | Sev | Status | Notes |
|------|-----|--------|-------|
| Approval status race condition (no version/lock) | High | Resolved | Content hash mismatch check added (review-15); stale approval rejected |
| N+1 query: phase sections in progress/preview/monitoring queries | High | Resolved | Batched via Promise.all in student.ts and teacher.ts |
| Deactivated users can access BM2 API routes | High | Open | 7 endpoints use JWT-only verification; need requireActive*SessionClaims |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Resolved | Batched via Promise.all in objectiveProficiency.ts |
| Equivalence checker: 6 aspirational tests marked .todo | High | Open | Needs symbolic math lib |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Resolved | By design: SRS engine uses string for storage-agnosticism; Convex adapter handles conversion |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Resolved | Foundational types (ObjectivePriority, ObjectivePracticePolicy) extracted to srs-engine; app-level logic is Convex-specific |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| 5 production `as any` casts on Convex `internal` (IM3) | Medium | Open | Stale generated types; run npx convex dev to regenerate |
| 21 `v.any()` fields in IM3 Convex schema | Medium | Open | Zero runtime validation on content, props, submissionData, evidence, fsrsState |
| No rate limiting on 5 BM2 API endpoints | Medium | Open | phases/complete, assessment, activities, error-summary, ai-error-summary |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| practice-core: computeBaseRating([]) untested edge case | Medium | Open | Empty parts array returns 'Good' — may be unintended |
| practice-core dual schema files | Medium | Resolved | submission.schema.ts deprecated; contract.ts is canonical; kept for backward compatibility |
| IM3 lib/study local copy not wired to study-hub-core types | Medium | Open | GlossaryTerm is wider than StudyTerm; structural compatibility works but not explicitly adopted |
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Open | Exported public API with zero test coverage |
| ai-tutoring: as any cast in providers.ts response parsing | Medium | Open | Need typed interface for OpenRouterResponse |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
| CI: BM2 double-silencing in CI | Medium | Open | Job-level continue-on-error: true AND step-level || true on 4 steps |
| RSC entry chunk 750 KB | Medium | Open | Code-splitting needed to get under 500 KB |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| workbook-pipeline: capstone filename hardcoded to BM2 domain | Medium | Open | "investor_ready_workbook" is business-math-specific; parameterize |
| workbook-pipeline: workbooks.client.ts double-cast bypasses types | Medium | Open | `as unknown as WorkbookManifest` — use zod validation |
| teacher-reporting: versionByLessonId picks first version silently | Medium | Open | No guarantee first version is the active one |
| BM2 ~30 files still import via re-export stubs | Low | Open | Works via stubs; migration to direct @math-platform/* imports deferred |
| BM2 duplicate PASSWORD_ALPHABET in convex/auth.ts | Low | Open | Can't import from core-auth; added comment noting derivation |
| StepByStepper-guided hint tracking test flaky in full suite | Low | Open | Passes in isolation; timing/ordering issue in full run |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| teacher-reporting-core .js import extension inconsistency | Low | Open | Uses .js extensions while other packages don't |
| SRS sessions completedAt=undefined filter | High | Resolved | Explicit filter added in sessions.ts |
| SRS card+review non-atomic saves | Medium | Resolved | saveCardAndReview() persists in single transaction |
| Misconception summary date filter | Medium | Resolved | Moved to Convex .filter(q.gte(q.field("reviewedAt"), sinceMs)) |
| BM2 TypeScript errors (was 296) | Medium | Resolved | BM2 typecheck now passes with 0 errors |
| class_lessons table empty | High | Resolved | seed_demo_env.ts inserts class_lessons entries for demo class |
| lesson-title-consistency test vacuous pass | High | Resolved | Regex updated to match underscored filenames after rename |
| CI: package test/lint continue-on-error | High | Resolved | Removed from package matrix (monorepo-repair_20260419) |
