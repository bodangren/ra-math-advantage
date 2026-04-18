# Current Directive

> Updated: 2026-04-19 (Code review #10 — audit of AI tutoring adoption, teacher-reporting wiring, workbook pipeline, CI hardening)

## Mission

Primary objective is to complete Wave 6 (CI/CD hardening and docs cleanup) and address critical security issues found in review #10. BM2 type health sweep remains deferred.

## Priority Order (Execute In This Order)

1. **Waves 0-5 complete** — all packages extracted, BM2 consuming packages, AI tutoring + workbook adopted
2. **Wave 6: Monorepo CI and Deploy Hardening** — Phase 3 complete; mark track as done
3. **Wave 6: Monorepo Docs and Cleanup** — finalize integration docs, remove shims
4. **Critical: IM3 chatbot authorization** — add lesson enrollment check to prevent students accessing any lesson
5. **Critical: IM3 chatbot prompt injection** — sanitize teacher-authored content before injecting into AI prompt
6. **BM2 type health sweep** — ~296 pre-existing errors; defer unless blocking migration gates

## Non-Negotiable Rules

1. AI tutoring and workbook work in IM3 must be completed via BM2-derived package adoption
2. No dependency manager/install changes without explicit approval
3. Shared packages must not import from `apps/*` or app `convex/_generated/*`
4. BM2 business-domain code/assets remain app-local
5. Always run `npx tsc --noEmit` alongside `npm run build` — vinext build does not enforce TypeScript types
6. After extracting a package, **delete the app-local copy immediately** and rewire imports — duplicated code diverges silently

## Required Source Documents

- `conductor/monorepo-plan.md` — Roadmap and strategy
- `conductor/tracks.md` — Track registry and dependency order
- `conductor/monorepo-track-playbook.md` — Execution workflow
- `conductor/monorepo-jr-execution-spec.md` — Junior step-by-step packets
- `conductor/tech-debt.md` — Tech debt backlog
- `conductor/workflow.md` — Core Conductor protocol

## Immediate Next Actions Checklist

- [x] Waves 0-5 complete (all packages extracted, IM3+BM2 imports migrated)
- [x] BM2 SRS contract migration — **COMPLETED (2026-04-18)**
- [x] BM2 consume-core-packages — **COMPLETED (2026-04-18)**
- [x] BM2 consume-runtime-packages — **COMPLETED (2026-04-18)**
- [x] Extract practice-test-engine — **COMPLETED (2026-04-19)**
- [x] Extract study-hub-core — **COMPLETED (2026-04-19)**
- [x] Extract teacher-reporting-core — **COMPLETED (2026-04-19)**
- [x] Extract AI Tutoring Package and Adopt in IM3 — **COMPLETED (2026-04-19)**
- [x] Extract Workbook Pipeline Package and Adopt in IM3 — **COMPLETED (2026-04-19)**
- [x] Wave 6 CI/CD hardening — **Phases 1-3 COMPLETE**
- [ ] Wave 6: Monorepo docs and cleanup
- [x] **Critical: IM3 chatbot lesson enrollment auth check** — **COMPLETED (2026-04-19)**
- [x] **Critical: IM3 chatbot content sanitization before AI prompt** — **COMPLETED (2026-04-19)**
- [ ] BM2 type health sweep (~296 TS errors) — defer unless blocking

## Code Review Summary (2026-04-19 — Review #10)

Audit of 6 phases: AI tutoring extraction (BM2 Phase 1), BM2 adoption (Phase 2), IM3 chatbot implementation, teacher-reporting adoption, workbook pipeline extraction, CI deploy hardening.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Tests (IM3) | 3249/3255 pass (6 aspirational .todo) |
| Tests (ai-tutoring) | 31/31 pass |
| Tests (workbook-pipeline) | 38/38 pass |
| Tests (teacher-reporting-core) | 65/65 pass |
| Typecheck (IM3 + all new packages) | CLEAN |
| Lint (IM3) | CLEAN |

### Critical Issues Found (Tracked in tech-debt.md)

| Issue | Status |
|-------|--------|
| IM3 chatbot: no lesson enrollment authorization check | Open — tracked |
| IM3 chatbot: lesson content prompt injection via teacher markdown | Open — tracked |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| CSV injection: formula prefixes not sanitized in gradebook export | High | Added `=`, `+`, `-`, `@`, `\t` prefix sanitization |
| computeCellColor returns green for not-started lessons with high mastery | High | not_started now always returns gray; added computeMasteryColor for mastery-only contexts |
| Rate limit consumed before request body validation | High | Moved body parsing + validation before rate limit check |
| Empty AI responses never retried | High | EmptyResponseError now retryable via withRetry |
| CI: `tsc --noEmit --prefix` is not a valid tsc flag | High | Changed to `cd apps/bus-math-v2 && npx tsc --noEmit` |
| CI: IM3 npm ci --prefix won't resolve workspace packages | Medium | Changed to root `npm ci` with `--prefix` for scripts |
| phaseNumber unbounded (no upper limit) | Low | Added `phaseNumber > 50` guard |
