# Current Directive

> Updated: 2026-04-23 (Code review #16 — full monorepo audit: 6 work phases, build/test/lint health, tech-debt reconciliation)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Current focus: security hardening, tech debt reduction, and preparing for next feature development cycle.

## Priority Order (Execute In This Order)

1. **BM2 deactivated-user access** — 7 API endpoints use JWT-only auth; need `requireActive*SessionClaims` to revoke access on deactivation
2. **BM2 rate limiting gaps** — 5 endpoints lack rate limiting; phases/complete, assessment, activities, error-summary, ai-error-summary
3. **BM2 chatbot prompt injection** — sanitizeInput is insufficient; add system prompt guard or LLM-based filter
4. **N+1 query: phase sections** — One DB query per phase inside loop in progress/preview/monitoring handlers
5. **Teacher SRS N+1 per-student** — Multiple handlers iterate students + unbounded .collect() loops
6. **Convex generated types stale** — 5 production `as any` casts; run `npx convex dev` to regenerate
7. **RSC bundle optimization** — 750 KB entry chunk needs code-splitting (target < 500 KB)
8. **CI: Remove BM2 double-silencing** — Job-level `continue-on-error: true` AND step-level `|| true` on 4 steps; only one layer needed
9. **Monorepo tech-debt triage Phase 2–8** — SRS correctness, N+1 queries, CI/CD, package quality, AI tutoring, UI, cleanup

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
- [x] Review #11 fixes (learningObjectives sanitization + abort listener leak)
- [x] Review #12 fixes (chatbot enrollment fallback + game streak bug + math sanitization)
- [x] Review #13 fixes (prompt injection via triple-quote delimiters + teacher UI revalidatePath)
- [x] Review #14 fixes (seed all units, functional class selector, info leakage, error handling, rate limiting)
- [x] Review #15 fixes (SrsRating type alignment in tests)
- [x] Review #16 fixes (lesson-title-consistency.test.ts vacuous pass, tech-debt reconciliation)
- [x] SRS misconception tag persistence + atomic saves + content hash guard
- [x] BM2 TypeScript errors resolved (0 errors, down from 296)
- [ ] BM2 deactivated-user access — swap getRequestSessionClaims for requireActive*SessionClaims on 7 endpoints
- [ ] BM2 rate limiting gaps — add rate limiting to 5 unprotected endpoints
- [ ] BM2 chatbot prompt injection — add system prompt guard beyond sanitizeInput
- [ ] N+1 queries: phase sections + teacher SRS per-student
- [ ] RSC entry chunk code-splitting (750 KB → < 500 KB)
- [ ] Convex generated types regeneration (eliminate `as any` casts)
- [ ] CI: Remove BM2 double-silencing (choose one: continue-on-error OR || true, not both)
- [ ] Monorepo tech-debt triage Phases 2–8

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
