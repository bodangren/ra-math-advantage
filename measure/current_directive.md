# Current Directive

> Updated: 2026-04-29 (Code review #29 — dead code removal, index range query, endpoint validation, handler extraction)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Three new course apps scaffolded (IM1, IM2, PreCalc). All rate limiters now use internalMutation with race condition handling. SRS validators fully centralized with typed rating union and card state literal. Current focus: remaining Convex schema type safety, test coverage gaps, performance hardening, curriculum authoring for new apps.

## Priority Order (Execute In This Order)

1. **processReview.ts studentId cross-validation** — cardState.studentId and reviewEntry.studentId accepted independently; mismatch creates corrupt data (High)
2. **teacher/srs_queries.ts: N+1 parallel fan** — Each fires 30+ parallel queries per class; batch via broader queries (High)
3. **RSC bundle optimization** — page chunk still large; needs further code-splitting
4. **SRS engine studentId type alignment** — Package defines `studentId: string` but Convex uses `Id<"profiles">`; bridging casts needed in convexReviewLogStore.ts
5. **BM2 governance test re-enablement** — 9 skipped suites need monorepo-aware path fixes
6. **objectiveProficiency.ts: sequential outer loop** — Flatten to single Promise.all over all (objective, student) pairs
7. **Rate limiter test coverage** — No tests for IM3 rateLimits.ts or BM2 rateLimits.ts (chatbot)
8. **Rate limiter duplication** — IM3/BM2 chatbot rate limiters diverge; should extract to shared package
9. **Convex unique index alternatives** — No unique constraints on rate limit tables; duplicates can still occur
10. **Curriculum content authoring — IM1, IM2, PreCalc** — Seed complete curriculum for all three new apps
11. **Activity component extraction** — Extract generic IM3 activity components to shared package for cross-app reuse
12. **Convex schema strict validation** — 16 v.any() fields remain; priority: submissionData, props, content, config

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
- [ ] teacher/srs_queries.ts: N+1 parallel fan → broader batched queries
- [ ] BM2 9 governance tests re-enablement
- [x] Rate limiter test coverage (IM3 rateLimits.ts — 15 tests)
- [ ] Activity component extraction for cross-app reuse
- [ ] Convex schema strict validation (16 v.any() fields remain)

## Code Review Summary (2026-04-29 — Review #29)

Audit of the past 6 work phases: Teacher SRS Queries N+1 Batch Fix, SRS reviews.ts Test Coverage, SRS saveCards Batch Mutation, SRS Dashboard Streak Test Coverage, Chatbot Prompt Injection Defense, and RSC Bundle Optimization.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Lint (BM2) | Pass (0 warnings) |
| Tests (IM3) | 3317 passed, 2 todo |
| Tests (BM2) | 2308 passed, 35 skipped |
| Build (IM3) | Pass (354 KB page chunk) |
| Build (BM2) | Pass |

### Issues Fixed in This Review (Review #29)

| Issue | Severity | Fix |
|-------|----------|-----|
| srs/cards.ts getCardHandler: dead try/catch around `as` cast | Critical | Removed — `as` is compile-time only, never throws; `db.get()` returns null for invalid IDs |
| srs/cards.ts getDueCards: fetches all cards then filters in-memory | Medium | Now uses `.lte("dueDate", args.asOfDate)` index range query — O(1) DB round trip |
| BM2 apiRateLimits: endpoint arg `v.string()` with unsafe `as` cast | High | Changed to `v.union(v.literal(...))` for all 5 endpoints; deny-by-default on unknown |
| reviews.test.ts: `as any` casts bypass all type checking | Medium | Extracted and exported handler functions; test imports handlers directly with proper types |
| reviews.ts: handler functions not exported for testing | Medium | Extracted `saveReviewHandler`, `getReviewsByCardHandler`, `getReviewsByStudentHandler` |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| Prompt guard no Unicode/homoglyph normalization | High | `normalizeInput` is only `trim()`; Cyrillic/fullwidth/zero-width bypass all regexes |
| Prompt guard regex false positives on common English | High | Optional trailing group matches sentences with just "ignore" or "forget" |
| processReview.ts no studentId cross-validation | High | cardState.studentId and reviewEntry.studentId accepted independently |
| cards.ts updatedAt inconsistent (Date.now vs caller) | Medium | Updates use Date.now() but inserts use caller-provided timestamp |
| objectiveProficiency full table scan of activity_submissions | Medium | O(total_submissions) regardless of class size |
| srs_reviews by_student index unused for date range | Low | getReviewsByStudent filters in JS; needs by_student_and_reviewed_at index |
| No unique constraints on any rate limit table | High | Convex indexes aren't unique; duplicates can still be created |
| Rate limiters duplicated across IM3 and BM2 | Medium | Same logic diverges; should extract to shared package |
| No test coverage for IM3 rateLimits.ts or BM2 rateLimits.ts (chatbot) | Medium | Only apiRateLimits.ts and loginRateLimits.ts have tests |
| 16 v.any() fields remain in IM3 schema | Medium | Priority: submissionData, props, content, config |
