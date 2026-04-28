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
| SRS CardStore: studentId type mismatch (contract vs schema) | High | Open | 7 bridging casts in convexCardStore.ts; package types need branded string |
| lib/practice/objective-proficiency.ts + objective-policy.ts unmigrated | High | Resolved | Extracted to packages/srs-engine/src/srs/; all imports rewired to @math-platform/srs-engine |
| BM2 lib/auth ~250 lines duplicated from core-auth | High | Resolved | Re-export shims replace constants/session/password/demo-provisioning; server.ts + ip-hash.ts stay local |
| BM2 lib/practice ~1305 lines duplicated from practice-core | High | Resolved | Re-export shims replace contract/timing/timing-baseline/srs-rating/error-analysis; engine/ stays local |
| getTeacherClassProficiencyHandler massive N+1 | High | Resolved | Pre-fetched all data outside S×O loop; reduced ~1800 queries to O(1) pre-fetches + local Map lookups |
| SRS dashboard.ts streak calc untested | High | Resolved | Tests existed but imports broken; exported getDayStart + calculateStreak; all 14 streak tests now pass |
| BM2 chatbot prompt injection defense still weak | Medium | Open | sanitizeInput only strips markdown chars; no system prompt guard or LLM-based filter |
| 5 production `as any` casts on Convex `internal` (IM3) | Medium | Open | Stale generated types; run npx convex dev to regenerate |
| 21 `v.any()` fields in IM3 Convex schema | Medium | Open | Zero runtime validation on content, props, submissionData, evidence, fsrsState |
| No rate limiting on 5 BM2 API endpoints | Medium | Open | phases/complete, assessment, activities, error-summary, ai-error-summary |
| BM2 login endpoint has no input length limits | Medium | Open | Multi-MB payloads could exhaust memory/slow hashing |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Open | Generated api.d.ts missing new handlers; must run npx convex dev to regenerate |
| RSC entry chunk 750 KB | Medium | Partial | Activity lazy-loading done (6 chunks); page chunk 785 KB, vendor-charts 830 KB; further splitting needed |
| Cloudflare deploy uses partial npm install | Medium | Resolved | Changed to root-level `npm ci`; workspace deps now resolved |
| teacher-reporting: versionByLessonId picks first version silently | Medium | Resolved | Selects published > review > draft > archived; status field added to RawLessonVersion |
| SRS reviews.ts untested | Medium | Open | saveReview, getReviewsByCard, getReviewsByStudent — no tests |
| isStudentEnrolledInClassForLesson N+1 | Medium | Resolved | Replaced with by_lesson index + Set membership check; Promise.all for fallback |
| N+1: lesson_versions per-lesson in public.ts | Medium | Resolved | getCurriculum + getUnitSummaries now use buildLatestPublishedLessonVersionMap for single batch query |
| internal Convex fns rely on action wrapper for auth | Medium | Open | activities.ts, study.ts, srs/cards.ts, student.ts have no defense-in-depth |
| getDueCards fetches all cards then filters by date in-memory | Medium | Open | by_student_and_due index has dueDate but no range query used |
| Session history pagination fetches all then slices client-side | Medium | Open | Use Convex cursor pagination instead |
| equivalence.ts factoredPattern4 can't match negative leading coeff | Medium | Resolved | Fixed: groups now use ([+-]?\d*\.?\d*); parseCoeff helper handles ±1 edge case |
| BM2 9 governance test suites permanently skipped | Medium | Open | TODO(monorepo) comments added; all need monorepo-aware path fixes |
| 40+ seed lesson tests vacuous | Low | Open | Test hardcoded data against itself; convert to data-driven validator |
| StepByStepper-guided hint tracking test flaky in full suite | Low | Open | Passes in isolation; timing/ordering issue in full run |
| SubmissionDetailModal: array index used as React key | Low | Resolved | Use `${evidence.componentKey}-${evidence.submittedAt}` as stable key |
| BM2 activities/complete/route.ts proxies errorPayload.details | Low | Open | Internal API details exposed to client; sanitize upstream response |
| practice-core: computeBaseRating([]) untested edge case | Low | Open | Empty parts array returns 'Good' — may be unintended |
