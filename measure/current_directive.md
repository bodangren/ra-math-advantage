# Current Directive

> Updated: 2026-04-28 (Code review #23 — N+1 query fixes, rate limiting audit, schema type safety, scaffolded app gaps)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Three new course apps scaffolded (IM1, IM2, PreCalc). Current focus: wire BM2 rate limiting to routes, fix Convex schema type safety, curriculum authoring for new apps.

## Priority Order (Execute In This Order)

1. **Fix apiRateLimits race condition** — Concurrent inserts for same user+endpoint create duplicate records that permanently break .unique()
3. **IM1 DESIGN.md and product.md** — IM2/PreCalc have both; IM1 is missing them
4. **Add .env.example to all apps** — No env reference exists for any app
5. **Convex schema strict validation** — 21 v.any() fields; priority: submissionData, props, content (user-facing)
6. **SRS reviews.ts test coverage** — saveReview, getReviewsByCard, getReviewsByStudent have zero tests
7. **RSC bundle optimization** — page chunk 891 KB; vendor-charts 830 KB; needs further code-splitting
8. **SRS engine studentId type alignment** — Package defines `studentId: string` but Convex uses `Id<"profiles">`; 7 bridging casts
9. **BM2 governance test re-enablement** — 9 skipped suites need monorepo-aware path fixes
10. **Curriculum content authoring — IM1, IM2, PreCalc** — Seed complete curriculum for all three new apps (depends on activity component extraction)
11. **Activity component extraction** — Extract generic IM3 activity components to shared package for cross-app reuse
12. **Chatbot prompt injection defense** — sanitizeInput too weak; needs system prompt guard or LLM filter

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption
2. No dependency manager/install changes without explicit approval
3. Shared packages must not import from `apps/*` or app `convex/_generated/*`
4. BM2 business-domain code/assets remain app-local
5. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
6. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently
7. Never return `error.message` in API error responses — use generic messages + server-side logging

## Required Source Documents

- `measure/monorepo-plan.md` — Roadmap and strategy
- `measure/tracks.md` — Track registry and dependency order
- `measure/tech-debt.md` — Tech debt backlog
- `measure/workflow.md` — Core Measure protocol

## Immediate Next Actions Checklist

- [x] Waves 0-6 complete (all packages extracted, IM3+BM2 imports migrated, CI/CD hardened)
- [x] Review #11-22 fixes (all security, auth, SRS, N+1, objectiveIds, tech-debt triage, scaffolded apps)
- [x] Teacher.ts N+1: listActivePhaseIds, listStudentDetailUnits, getTeacherDashboardData, getTeacherStudentCompetencyDetail — all batched via Promise.all (review-23)
- [x] apiRateLimits remaining negative clamp — Math.max(0, ...) added (review-23)
- [x] Wire BM2 apiRateLimits to 5 API routes (complete — all 5 endpoints enforce rate limits)
- [ ] Fix apiRateLimits race condition (High — duplicate inserts break .unique())
- [x] Add DESIGN.md + product.md to IM1
- [ ] Add .env.example to all apps
- [ ] Convex schema strict validation (21 v.any() fields)
- [ ] SRS reviews.ts test coverage
- [ ] RSC bundle: page chunk 891 KB → < 500 KB
- [ ] BM2 9 governance tests re-enablement
- [ ] Activity component extraction for cross-app reuse

## Code Review Summary (2026-04-28 — Review #24)

Comprehensive audit of the past 6 work phases: rate limiting endpoint integration, teacher proficiency N+1 fix, lesson version query optimization, monorepo tech-debt triage, IM3 chatbot security, chatbot provider memoization.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors — all 26 pre-existing test-file errors fixed) |
| Typecheck (IM1/IM2/PC) | Pass (0 errors each) |
| Lint (IM3) | Pass (0 warnings) |
| Lint (BM2) | Pass (0 warnings) |
| Tests (IM3) | 3301 passed, 2 todo (272 test files) |
| Tests (BM2) | 2307 passed, 35 skipped (349 test files) |
| Tests (packages) | All 12 packages pass |
| Build (IM3) | Pass |
| Build (BM2) | Pass |

### Issues Fixed in This Review (Review #24)

| Issue | Severity | Fix |
|-------|----------|-----|
| apiRateLimits mutation required unused `userId` arg | CRITICAL | Removed `userId` from mutation args — handler derives user from auth identity; routes weren't passing it, causing runtime validation failures |
| BM2 TypeScript errors in test files | HIGH | Fixed 26 errors across 6 test files: literal type casts (`as const`), mock data alignment, missing props, supabase dir exclusion from tsconfig |
| teacher.ts listActivePhaseIds: 3 sequential .collect() calls | HIGH | Wrapped in Promise.all |
| teacher.ts getTeacherDashboardData: 3 sequential .collect() | MEDIUM | Wrapped in Promise.all |
| apiRateLimits remaining can go negative | HIGH | Added Math.max(0, ...) clamp |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| apiRateLimits duplicate-insert race condition | HIGH | Concurrent mutations can create duplicate records breaking .unique() permanently |
| apiRateLimits no stale entry cleanup | MEDIUM | Table grows unbounded unlike other rate limit modules |
| IM1 missing DESIGN.md and product.md | HIGH | IM2/PreCalc have both; IM1 has neither |
| No .env.example in any app | MEDIUM | New developers have no env reference |
| 21 v.any() fields in IM3 Convex schema | MEDIUM | Priority: submissionData, props, content, evidence |
| SRS reviews.ts: zero test coverage | MEDIUM | saveReview, getReviewsByCard, getReviewsByStudent untested |
| RSC page chunk 891 KB, vendor-charts 830 KB | MEDIUM | Further code-splitting needed |
| teacher/srs_queries.ts: 5 per-student N+1 parallel fans | HIGH | Each fires 30+ parallel queries per class; should batch via broader queries |
| objectiveProficiency.ts: sequential outer loop over objectives | HIGH | Flattens to single Promise.all over all (objective, student) pairs |
| srs/cards.ts saveCards: sequential await in for loop | CRITICAL | 2N sequential DB operations for N cards |
