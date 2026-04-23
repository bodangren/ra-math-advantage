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
| Deactivated users can access BM2 API routes | High | Resolved | All 10 endpoints now use requireActive*SessionClaims; workbooks + pdfs routes fixed in review-18 |
| Teacher SRS queries: N+1 per-student unbounded .collect() loops | High | Resolved | Batched via Promise.all in objectiveProficiency.ts |
| Equivalence checker: 6 aspirational tests marked .todo | High | Partial | 4 converted to real tests (pattern-matching); 2 remain .todo (need symbolic math lib) |
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Resolved | Test files updated with Id<"profiles"> casts in review-17 |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Resolved | Extracted to packages/srs-engine/src/srs/; all imports rewired to @math-platform/srs-engine |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Open | Diverges silently; needs package adoption |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Open | 73 local vs 12 package imports; engine/ subtree is BM2-specific |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| 5 production `as any` casts on Convex `internal` (IM3) | Medium | Open | Stale generated types; run npx convex dev to regenerate; seed.ts `(internal as any).seed` confirmed in review-18 |
| 21 `v.any()` fields in IM3 Convex schema | Medium | Open | Zero runtime validation on content, props, submissionData, evidence, fsrsState |
| No rate limiting on 5 BM2 API endpoints | Medium | Open | phases/complete, assessment, activities, error-summary, ai-error-summary |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| practice-core: computeBaseRating([]) untested edge case | Medium | Open | Empty parts array returns 'Good' — may be unintended |
| IM3 lib/study local copy not wired to study-hub-core types | Medium | Resolved | GlossaryTerm now extends StudyTerm from @math-platform/study-hub-core |
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Open | Exported public API with zero test coverage |
| ai-tutoring: as any cast in providers.ts response parsing | Medium | Open | Need typed interface for OpenRouterResponse |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
| CI: BM2 double-silencing in CI | Medium | Resolved | Removed || true from 4 BM2 steps; job-level continue-on-error preserved |
| RSC entry chunk 750 KB | Medium | Partial | Activity lazy-loading done (6 chunks); page chunk 785 KB, vendor-charts 830 KB; further splitting needed |
| Cloudflare worker deploys to production on every push | Medium | Open | No staging step, no canary, no approval gate |
| workbook-pipeline: capstone filename hardcoded to BM2 domain | Medium | Open | "investor_ready_workbook" is business-math-specific; parameterize |
| workbook-pipeline: workbooks.client.ts double-cast bypasses types | Medium | Open | `as unknown as WorkbookManifest` — use zod validation |
| teacher-reporting: versionByLessonId picks first version silently | Medium | Open | No guarantee first version is the active one |
| BM2 ~30 files still import via re-export stubs | Low | Open | Works via stubs; migration to direct @math-platform/* imports deferred |
| BM2 duplicate PASSWORD_ALPHABET in convex/auth.ts | Low | Open | Can't import from core-auth; added comment noting derivation |
| StepByStepper-guided hint tracking test flaky in full suite | Low | Open | Passes in isolation; timing/ordering issue in full run |
| SubmissionDetailModal: array index used as React key | Low | Open | Should use stable ID |
| teacher-reporting-core .js import extension inconsistency | Low | Resolved | Removed .js from 12 relative imports; consistent with other packages |
| SRS dashboard.ts streak calc untested | High | Open | Non-trivial logic with zero test coverage |
| SRS reviews.ts untested | Medium | Open | saveReview, getReviewsByCard, getReviewsByStudent — no tests |
| isStudentEnrolledInClassForLesson N+1 | Medium | Open | 2 sequential queries per enrollment in loop; batch with Promise.all |
| 40+ seed lesson tests vacuous | Low | Open | Test hardcoded data against itself; convert to data-driven validator |
| N+1: lesson_versions per-lesson in public.ts | Medium | Open | getCurriculum + getUnitSummaries query per lesson; fetch once, build map |
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| BM2 activities/complete/route.ts proxies errorPayload.details | Low | Open | Internal API details exposed to client; sanitize upstream response |
| SRS engine studentId:string vs Convex Id<"profiles"> | Medium | Open | 7 bridging casts in convexCardStore.ts; type mismatch in @math-platform/srs-engine package |
