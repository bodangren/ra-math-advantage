# Current Directive

> Updated: 2026-04-24 (Code review #20 — audit of past 6 phases, BM2 workbook/PDF auth fix, cards.ts redundant cast cleanup)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Current focus: tech debt reduction (Phases 5-8 remaining), package quality, and preparing for next feature development cycle.

## Priority Order (Execute In This Order)

1. **Monorepo tech-debt triage Phase 5** — Package Quality & Consistency: add vitest.config to 5 packages, fix teacher-reporting-core .js extensions, wire lib/study to study-hub-core
2. **BM2 rate limiting gaps** — 5 endpoints lack rate limiting; phases/complete, assessment, activities, error-summary, ai-error-summary
3. **N+1 queries in public.ts** — lesson_versions queried per lesson in getCurriculum and getUnitSummaries; fetch once and build map
4. **SRS dashboard.ts + reviews.ts test coverage** — streak calculation and review persistence have zero tests
5. **Convex generated types stale** — 5 production `as any` casts; run `npx convex dev` to regenerate
6. **RSC bundle optimization** — page chunk 785 KB; vendor-charts 830 KB; needs further code-splitting (target page < 500 KB)
7. **SRS engine studentId type alignment** — Package defines `studentId: string` but Convex uses `Id<"profiles">`; 7 bridging casts in convexCardStore.ts
8. **Monorepo tech-debt triage Phase 6–8** — AI tutoring quality, UI fixes, tech-debt cleanup

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption
2. No dependency manager/install changes without explicit approval
3. Shared packages must not import from `apps/*` or app `convex/_generated/*`
4. BM2 business-domain code/assets remain app-local
5. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
6. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently
7. Never return `error.message` in API error responses — use generic messages + server-side logging

## Required Source Documents

- `conductor/monorepo-plan.md` — Roadmap and strategy
- `conductor/tracks.md` — Track registry and dependency order
- `conductor/tech-debt.md` — Tech debt backlog
- `conductor/workflow.md` — Core Conductor protocol

## Immediate Next Actions Checklist

- [x] Waves 0-6 complete (all packages extracted, IM3+BM2 imports migrated, CI/CD hardened)
- [x] Review #11-18 fixes (all security, auth, SRS, N+1, objectiveIds fixes)
- [x] CI: Remove BM2 double-silencing (removed `|| true`; `continue-on-error` preserved)
- [x] Lazy-load activity components + Suspense boundaries (registry.ts, ActivityRenderer.tsx)
- [x] Bundle-size CI audit step added to workflow
- [ ] Monorepo tech-debt triage Phase 5 (Package Quality)
- [ ] N+1 queries: public.ts lesson_versions per-lesson fetch
- [ ] SRS engine studentId type alignment (string → branded type)
- [ ] Convex generated types regeneration
- [ ] RSC bundle: page chunk 785 KB → < 500 KB
- [ ] Monorepo tech-debt triage Phase 6-8

## Code Review Summary (2026-04-23 — Review #16)

Full monorepo audit covering the last 6 work phases (monorepo-repair, hyphenated module rename, harden-test-suite, high-priority tech debt, security audit review-14/15, tech-debt triage track).

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Tests (IM3) | 3293 passed, 6 todo |
| Build (IM3) | Pass |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| lesson-title-consistency.test.ts regex matches old hyphenated filenames — passes vacuously | HIGH | Updated 3 regex patterns from `seed-lesson-` to `seed_lesson_` to match renamed Convex modules |

### Code Review Summary (2026-04-23 — Review #17)

Post-extraction import audit covering SRS module migration, BM2 auth hardening, and track metadata reconciliation.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Tests (IM3) | 3223 passed, 6 todo (266 test files) |
| Build (IM3) | Pass |

### Issues Fixed in This Review (Review #17)

| Issue | Severity | Fix |
|-------|----------|-----|
| SRS extraction left 14 dangling imports in Convex files and components | CRITICAL | Added exports to packages/srs-engine/src/index.ts; rewired all imports to @math-platform/srs-engine |
| BM2 auth routes used `!claims` check but requireActive* returns `SessionClaims \| Response` | HIGH | Changed to `instanceof Response` pattern in all 8 BM2 API routes |
| BM2 test files passed plain Request where NextRequest expected | MEDIUM | Added NextRequest type casts in test helpers |
| SRS test files string studentId vs Id<"profiles"> type mismatch | MEDIUM | Added Id<"profiles"> casts in cards.test.ts and processReview.test.ts |
| Track metadata drift (3/6 tracks had wrong status) | LOW | Updated bm2-deactivated-user-access and monorepo-tech-debt-triage metadata |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 CI double-silencing (continue-on-error + || true) | Medium | BM2 job has job-level `continue-on-error: true` AND step-level `|| true` on 4 steps; failures completely hidden |
| 7 BM2 endpoints allow deactivated-user access | High | Need requireActive*SessionClaims |
| BM2 chatbot sanitizeInput too weak for prompt injection | Medium | Needs system prompt guard or LLM filter |
| 5 BM2 endpoints lack rate limiting | Medium | phases/complete, assessment, activities, error-summary, ai-error-summary |
| 21 `v.any()` fields in IM3 Convex schema | Medium | Incrementally add Zod schemas |
| N+1 queries: phase sections + teacher SRS | High | One DB query per phase; teacher handlers iterate students + collect |
| RSC entry chunk 750 KB | Medium | Code-splitting needed to get under 500 KB |

### Code Review Summary (2026-04-23 — Review #18)

Full code audit covering the last 6 work phases (BM2 deactivated-user access, tech debt triage Phases 1-3, N+1 query performance, SRS correctness).

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Tests (IM3) | 3223 passed, 6 todo (266 test files) |
| Tests (BM2) | 2293 passed, 35 skipped (339 test files) |
| Build (IM3) | Pass |
| Build (BM2) | Pass |

### Issues Fixed in This Review (Review #18)

| Issue | Severity | Fix |
|-------|----------|-----|
| objectiveIds array index query: eq() passed array instead of element — returned 0 results | CRITICAL | Removed `as unknown as string[]` cast; Convex multi-entry array index expects single element. Fixed in objectiveProficiency.ts (2 locations) and srs_mutations.ts (1 location) |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| SRS dashboard.ts streak calc untested | High | Non-trivial logic with zero test coverage |
| SRS reviews.ts untested | Medium | saveReview, getReviewsByCard, getReviewsByStudent — no tests |
| isStudentEnrolledInClassForLesson N+1 | Medium | 2 sequential queries per enrollment in loop; batch with Promise.all |
| 40+ seed lesson tests vacuous | Low | Test hardcoded data against itself; convert to data-driven validator |

### Code Review Summary (2026-04-24 — Review #19)

Post-Phase-4 audit covering tech debt triage Phases 1-4 (BM2 TS fix, SRS correctness, N+1 perf, CI/CD hardening) plus lazy-loading, Suspense boundaries, and bundle-size CI.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Lint (IM3) | Pass (0 warnings) |
| Tests (IM3) | 3226 passed, 6 todo (266 test files) |
| Build (IM3) | Pass (6.54s) |

### Issues Fixed in This Review (Review #19)

| Issue | Severity | Fix |
|-------|----------|-----|
| `readFileSync` unused import in bundle-size-audit.mjs | LOW | Removed unused import |
| Dead ternary branch in bundle-size-audit.mjs findFiles | LOW | Simplified to direct string ops |
| Orphaned check-bundle-size.mjs (not referenced anywhere) | LOW | Deleted file |
| registry.ts: rate-of-change-calculator registered twice (placeholder + real) | LOW | Removed from PLACEHOLDER_KEYS; renamed constant |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| N+1: lesson_versions per-lesson in public.ts getCurriculum | Medium | Fetch all versions upfront, build map |
| N+1: class_lessons per-enrollment in student.ts isStudentEnrolledInClassForLesson | Medium | 2 sequential queries per loop iteration |
| N+1: saveCards loop in srs/cards.ts | Medium | Query+write per card; batch queries |
| Auth: internal Convex functions rely on action wrapper for auth | Medium | Architectural pattern; defense-in-depth missing |
| error.message returned from seed.ts internal mutations | Low | 13 locations; internal-only risk |
| Page chunk 785 KB, vendor-charts 830 KB | Medium | Further code-splitting needed |
| CI: inconsistent --prefix vs --workspace vs cd && patterns | Low | Cosmetic; works but confusing |

### Code Review Summary (2026-04-24 — Review #20)

Full audit of past 6 work phases: security hardening pre-work, SRS type alignment, deactivated-user access, SRS extraction imports, BM2 auth patterns, and plan tracking.

### Verification Results

| Check | Result |
|-------|--------|
| Typecheck (IM3) | Pass (0 errors) |
| Typecheck (BM2) | Pass (0 errors in app code; pre-existing readonly-array test errors unrelated) |
| Lint (IM3) | Pass (0 warnings) |
| Tests (IM3) | 3226 passed, 6 todo (266 test files) |
| Tests (BM2 workbook/pdf) | 19 passed (3 test files) |
| Build (IM3) | Pass (6.53s; page 785 KB, vendor-charts 830 KB) |

### Issues Fixed in This Review (Review #20)

| Issue | Severity | Fix |
|-------|----------|-----|
| 3 BM2 routes (workbooks/capstone, workbooks/[unit]/[lesson], pdfs/[pdfName]) still use `getRequestSessionClaims` — deactivated users can access | CRITICAL | Swapped to `requireActiveRequestSessionClaims` with `instanceof Response` check pattern |
| 3 BM2 route test files mock `getRequestSessionClaims` instead of `requireActiveRequestSessionClaims` | HIGH | Updated all 3 test files to mock `requireActiveRequestSessionClaims` and return `new Response(...)` for unauthenticated tests |
| 5 redundant `as Id<"profiles">` casts in cards.ts (args/fields already typed) | MEDIUM | Removed all 5 redundant casts from saveCardHandler, saveCards, and getDueCards |
| Stale describe block references old path `lib/practice/objective-proficiency.ts` | LOW | Updated to `@math-platform/srs-engine` in contract.test.ts |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| BM2 activities/complete/route.ts proxies `errorPayload.details` from internal API | Low | Could expose internal info; sanitize upstream response |
| SRS engine `studentId: string` vs Convex `Id<"profiles">` type mismatch | Medium | 7 bridging casts in convexCardStore.ts; package types need branded string |
| JSDoc `@example` blocks silently dropped during SRS extraction | Low | 6 symbols lost documentation; restore in package version |
