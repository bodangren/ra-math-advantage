# Current Directive

> Updated: 2026-04-29 (Code review #26 — SRS validator DRY fix, rate limiter race condition hardening, .env.example rollout)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Three new course apps scaffolded (IM1, IM2, PreCalc). BM2 and IM3 rate limiters now both use defensive try/catch upserts. Current focus: remaining Convex schema type safety, curriculum authoring for new apps, performance hardening.

## Priority Order (Execute In This Order)

1. **SRS reviews.ts test coverage** — saveReview, getReviewsByCard, getReviewsByStudent have zero tests
2. **RSC bundle optimization** — page chunk 891 KB; vendor-charts 830 KB; needs further code-splitting
3. **SRS engine studentId type alignment** — Package defines `studentId: string` but Convex uses `Id<"profiles">`; 7 bridging casts
4. **BM2 governance test re-enablement** — 9 skipped suites need monorepo-aware path fixes
5. **srs/cards.ts saveCards: sequential await** — CRITICAL: 2N sequential DB operations for N cards
6. **teacher/srs_queries.ts: N+1 parallel fan** — Each fires 30+ parallel queries per class; batch via broader queries
7. **objectiveProficiency.ts: sequential outer loop** — Flatten to single Promise.all over all (objective, student) pairs
8. **Curriculum content authoring — IM1, IM2, PreCalc** — Seed complete curriculum for all three new apps (depends on activity component extraction)
9. **Activity component extraction** — Extract generic IM3 activity components to shared package for cross-app reuse
10. **Chatbot prompt injection defense** — sanitizeInput too weak; needs system prompt guard or LLM filter
11. **Convex schema strict validation** — 18 v.any() fields remain; priority: submissionData, props, content (user-facing)

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
- [x] Fix apiRateLimits race condition (High — duplicate inserts break .unique())
- [x] Add DESIGN.md + product.md to IM1
- [x] Fix BM2 rate limiting auth failure — converted apiRateLimits.ts and rateLimits.ts to internalMutation with explicit userId; updated all 5 API routes and chatbot route; removed broken rate limit from deprecated activities/complete shim; added cookie forwarding in shim (review-25)
- [x] Extract shared srs validators to `convex/srs/validators.ts` — eliminates DRY violation across schema.ts, reviews.ts, processReview.ts (review-26)
- [x] Fix IM3 rateLimits.ts race condition — added try/catch upsert pattern + Math.max(0, ...) clamp; converted to internalMutation/internalQuery for consistency with BM2 (review-26)
- [x] Fix BM2 rateLimits.ts race condition — added try/catch upsert pattern + Math.max(0, ...) clamp (review-26)
- [x] Add .env.example to all apps — IM3, IM1, IM2, PreCalc created; BM2 already existed (review-26)
- [ ] SRS reviews.ts test coverage
- [ ] RSC bundle: page chunk 891 KB → < 500 KB
- [ ] srs/cards.ts saveCards: sequential await → batch
- [ ] teacher/srs_queries.ts: N+1 parallel fan → broader batched queries
- [ ] BM2 9 governance tests re-enablement
- [ ] Activity component extraction for cross-app reuse
- [ ] Convex schema strict validation (18 v.any() fields remain)

## Code Review Summary (2026-04-29 — Review #26)

Audit of the past 6 work phases: Convex Schema Strict Validation Phase 2 (SRS review_log typed validators), review-25 (BM2 internalMutation migration fixes), .env.example track creation, WIP rate limiting endpoint integration, workbooks-manifest timestamp update, apiRateLimits race condition track closure.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Typecheck (IM1/IM2/PC) | Pass (0 errors each) |
| Lint (IM3) | Pass (0 warnings) |
| Lint (BM2) | Pass (0 warnings) |
| Tests (IM3) | 3301 passed, 2 todo (272 test files) |
| Tests (BM2) | 2307 passed, 35 skipped (340 test files) |
| Build (IM3) | Pass |
| Build (BM2) | Pass |

### Issues Fixed in This Review (Review #26)

| Issue | Severity | Fix |
|-------|----------|-----|
| IM3 `rateLimits.ts` missing race condition fix | HIGH | Added try/catch upsert pattern around `ctx.db.insert` in `checkAndIncrementRateLimit` |
| BM2 `rateLimits.ts` missing race condition fix | HIGH | Added try/catch upsert pattern around `ctx.db.insert` in `checkAndIncrementRateLimit` |
| IM3 `rateLimits.ts` public mutation/query mismatch | HIGH | Converted to `internalMutation`/`internalQuery` for consistency with BM2 and correct typing |
| IM3/BM2 `rateLimits.ts` negative remaining | MEDIUM | Added `Math.max(0, ...)` clamp on `remaining` in all return paths |
| SRS validator DRY violation | MEDIUM | Extracted `srsCardStatePickValidator` and `srsEvidenceValidator` to `convex/srs/validators.ts`; imported in schema.ts, reviews.ts, processReview.ts |
| Missing `.env.example` for 4 apps | MEDIUM | Created `.env.example` for IM3, IM1, IM2, PreCalc with app-specific env vars |
| Convex Schema Strict Validation track status mismatch | LOW | Updated metadata.json from `pending` to `in_progress`; updated plan.md and tracks.md |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 Convex generated types stale after internalMutation migration | HIGH | Manually patched `apiRateLimits`; `rateLimits` still shows as public; needs full `npx convex dev` regen |
| BM2 chatbot route uses `as any` for rateLimits internal ref | MEDIUM | `(internal as any).rateLimits` cast needed because generated types don't reflect internal conversion |
| srs/cards.ts saveCards: sequential await in for loop | CRITICAL | 2N sequential DB operations for N cards |
| teacher/srs_queries.ts: 5 per-student N+1 parallel fans | HIGH | Each fires 30+ parallel queries per class; should batch via broader queries |
| objectiveProficiency.ts: sequential outer loop over objectives | HIGH | Flattens to single Promise.all over all (objective, student) pairs |
| SRS queue test flaky in full suite | LOW | Passes in isolation; timing/ordering issue in full run |
| 18 v.any() fields remain in IM3 schema | MEDIUM | Down from 21 after Phase 2; remaining include submissionData, props, content, metadata fields |
