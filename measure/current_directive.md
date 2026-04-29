# Current Directive

> Updated: 2026-04-29 (Phase 2 complete — Activity Component Extraction: all 6 activity types extracted to @math-platform/activity-components package)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Three new course apps scaffolded (IM1, IM2, PreCalc). All rate limiters use internalMutation with deny-by-default validation. SRS validators centralized. Current focus: BM2 worker bundle optimization, prompt guard hardening, Convex schema type safety, curriculum authoring for new apps.

## Priority Order (Execute In This Order)

1. **BM2 worker-entry bundle optimization** — 5.1 MB is 49% of Cloudflare 10 MB limit; needs tree-shaking audit and code-splitting (Critical)
2. **Prompt guard punctuation bypass** — `bypass.the.system` evades both regex and proximity detection after non-word char stripping (High)
3. **objectiveProficiency full table scan** — O(total_submissions) regardless of class size; needs student-scoped queries (Medium)
4. **Convex schema strict validation** — 16 v.any() fields remain; priority: submissionData, props, content, config
5. **Curriculum content authoring — IM1, IM2, PreCalc** — Seed complete curriculum for all three new apps
6. **Activity component extraction** — Extract generic IM3 activity components to shared package for cross-app reuse
7. **BM2 governance test re-enablement** — 9 skipped suites need monorepo-aware path fixes
8. **Rate limiter duplication** — IM3/BM2 chatbot rate limiters diverge; should extract to shared package
9. **SRS engine studentId type alignment** — Package defines `studentId: string` but Convex uses `Id<"profiles">`; bridging casts needed
10. **Convex unique index alternatives** — No unique constraints on rate limit tables; duplicates can still occur

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption
2. No dependency manager/install changes without explicit approval
3. Shared packages must not import from `apps/*` or app `convex/_generated/*`
4. BM2 business-domain code/assets remain app-local
5. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
6. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently
7. Never return `error.message` in API error responses — use generic messages + server-side logging
8. All rate limiters must be `internalMutation`/`internalQuery` — never public `mutation`/`query`

## Required Source Documents

- `measure/monorepo-plan.md` — Roadmap and strategy
- `measure/tracks.md` — Track registry and dependency order
- `measure/tech-debt.md` — Tech debt backlog
- `measure/workflow.md` — Core Measure protocol

## Immediate Next Actions Checklist

- [x] Waves 0-6 complete (all packages extracted, IM3+BM2 imports migrated, CI/CD hardened)
- [x] Review #11-28 fixes (all security, auth, SRS, N+1, objectiveIds, tech-debt triage, scaffolded apps, rate limiters)
- [x] Fix apiRateLimits race condition (try/catch upsert pattern)
- [x] Add .env.example to all apps
- [x] SRS reviews.ts test coverage
- [x] BM2 loginRateLimits: mutation → internalMutation, race condition handling, Math.max clamp, violation logging (review-27)
- [x] Login route: remove `as any` casts, use proper `internal.loginRateLimits` reference (review-27)
- [x] Lesson-chatbot route: remove `as any` casts, typed userId (review-27 → review-28)
- [x] SRS rating: `v.string()` → `srsRatingValidator` (union of 4 FSRS literals) (review-27)
- [x] SRS card state: inline union → `srsCardStateLiteralValidator` (shared across schema, cards.ts, processReview.ts, validators.ts) (review-27)
- [x] reviews.ts: `cardId`/`studentId` `v.string()` → `v.id()`, remove `as Id<>` casts (review-27)
- [x] reviews.ts: `reviewId`/`submissionId` `v.string()` → `v.optional(v.string())`, remove `|| undefined` (review-27)
- [x] processReview.ts: same reviewId/submissionId/rating fixes (review-27)
- [x] srs_mutations.ts: `"manual_reset"` → `"Again"` (invalid rating value) (review-27)
- [x] convexReviewLogStore.ts: add `Id<>` casts for cardId/studentId bridging (review-27)
- [x] IM3/BM2 rateLimits.ts: Math.max(0, ...) on all remaining paths (review-27)
- [x] BM2 rateLimits.ts: cleanup uses `.filter().take(100)` instead of `.collect()` (review-27)
- [x] IM3 rateLimits.ts: remove unnecessary `ctx.db.get(args.userId)` — use `args.userId` directly (review-27)
- [x] BM2 .env.example: added 13+ missing env vars with documentation (review-27)
- [x] All 5 app .env.example: added `NEXT_PUBLIC_SITE_URL` and `CONVEX_DEPLOY_KEY` (review-28)
- [x] Reviews test: added `stateBefore`/`stateAfter` assertions (review-27)
- [x] srs/cards.ts saveCards: sequential await → batch lookups via Promise.all (review-28)
- [x] srs/reviews.ts: NaN validation on reviewedAt and since dates (review-28)
- [x] IM3 lesson-chatbot route: removed `as any` casts on internal.rateLimits/internal.student (review-28)
- [x] IM3 phases/skip route: removed `as any` cast on internal.student.skipPhase (review-28)
- [x] srs/cards.ts getCardHandler: removed dead try/catch on `as` cast (review-29)
- [x] srs/cards.ts getDueCards: use index range query `.lte("dueDate", ...)` instead of in-memory filter (review-29)
- [x] BM2 apiRateLimits: endpoint arg `v.string()` → `v.union(v.literal(...))`, deny-by-default (review-29)
- [x] reviews.ts: extract and export handler functions for direct testing without `as any` (review-29)
- [x] Prompt guard Unicode normalization and regex restructuring (prompt_guard_hardening_20260429)
- [x] processReview.ts studentId cross-validation (added validation, mismatch throws error)
- [x] Teacher SRS Queries N+1 batch fix (batched srs_cards, srs_review_log, competency_standards)
- [x] Rate limiter test coverage (IM3 rateLimits.ts — 15 tests)
- [x] BM2 apiRateLimits test fix — unknown endpoint now denied-by-default (review-30)
- [x] processReview.ts return value fix — returns actual DB document ID not caller cardId (review-30)
- [x] BM2 getApiRateLimitStatus deny-by-default consistency fix (review-30)
- [x] objectiveProficiency dead code removal (unused submissionMap) (review-30)
- [ ] BM2 worker-entry bundle optimization (5.1 MB → target <3 MB)
- [ ] Prompt guard punctuation bypass hardening
- [ ] BM2 9 governance tests re-enablement
- [x] Activity component extraction for cross-app reuse (Phase 2 complete — 6 activity types extracted, 36 tests passing)
- [ ] Convex schema strict validation (16 v.any() fields remain)
- [ ] objectiveProficiency student-scoped queries (replace full table scan)

## Code Review Summary (2026-04-29 — Review #30)

Audit of the past 6 work phases: review-29 (endpoint validation, handler extraction), Prompt Guard Hardening, Process Review studentId Cross-Validation, Teacher SRS Queries N+1 Batch Fix, SRS saveCards Batch Mutation, and Rate Limiter Test Coverage.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Lint (BM2) | Pass (0 warnings) |
| Tests (IM3) | 3333 passed, 2 todo |
| Tests (BM2) | 2308 passed, 35 skipped |
| Build (IM3) | Pass (354 KB page chunk) |
| Build (BM2) | Pass (5.1 MB worker-entry — needs optimization) |

### Issues Fixed in This Review (Review #30)

| Issue | Severity | Fix |
|-------|----------|-----|
| BM2 apiRateLimits test: expected allow=true for unknown endpoint | Critical | Updated test to expect allowed=false; handler was changed to deny-by-default in review-29 |
| processReview returns caller-provided cardId not DB document ID | High | Changed return value to `cardDocId as string` — the actual Convex document ID used for DB writes |
| BM2 getApiRateLimitStatus returned isLimited=false for unknown endpoints | High | Changed to deny-by-default (isLimited=true, remaining=0) to match mutation behavior |
| objectiveProficiency deriveSubmissionTimingsFromPreFetched: dead submissionMap | Medium | Removed unused Map that was populated but never read |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 worker-entry bundle 5.1 MB | Critical | 49% of Cloudflare 10 MB limit; needs tree-shaking/code-splitting |
| Prompt guard bypass via punctuation without whitespace | High | `bypass.the.system` evades proximity detection after non-word char stripping |
| objectiveProficiency full table scan of activity_submissions | Medium | O(total_submissions) regardless of class size |
| cards.ts updatedAt inconsistent (Date.now vs caller) | Medium | Updates use Date.now() but inserts use caller-provided timestamp |
| srs_reviews by_student index unused for date range | Low | getReviewsByStudent filters in JS; needs by_student_and_reviewed_at index |
| No unique constraints on any rate limit table | High | Convex indexes aren't unique; duplicates can still be created |
| Rate limiters duplicated across IM3 and BM2 | Medium | Same logic diverges; should extract to shared package |
| BM2 rateLimits.ts (login/chatbot) still untested | Medium | Only apiRateLimits.ts and loginRateLimits.ts have tests |
| 16 v.any() fields remain in IM3 schema | Medium | Priority: submissionData, props, content, config |
