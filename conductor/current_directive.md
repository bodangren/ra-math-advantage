# Current Directive

> Updated: 2026-04-19 (Code review #11 — post-phase audit of chatbot security, provider memoization, CI hardening, docs cleanup)

## Mission

Primary objective is to address the high-severity chatbot enrollment authorization gap found in review #11, then begin new feature work. BM2 type health sweep remains deferred.

## Priority Order (Execute In This Order)

1. **Waves 0-6 complete** — all packages extracted, BM2 consuming packages, AI tutoring + workbook adopted, CI/CD hardened, docs finalized
2. **Review #11 fixes complete** — learningObjectives sanitization + abort listener leak resolved
3. **High: IM3 chatbot enrollment gap** — isStudentActivelyEnrolled only checks any-class enrollment, not lesson-class ownership; a student in Class A can access any lesson in the system
4. **BM2 type health sweep** — ~296 pre-existing errors; defer unless blocking migration gates

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
- [x] Wave 6: Monorepo docs and cleanup — **COMPLETED (2026-04-19)**
- [x] **Critical: IM3 chatbot lesson enrollment auth check** — **COMPLETED (2026-04-19)**
- [x] **Critical: IM3 chatbot content sanitization before AI prompt** — **COMPLETED (2026-04-19)**
- [x] **Review #11: learningObjectives sanitization bypass** — **FIXED (2026-04-19)**
- [x] **Review #11: AbortSignal listener leak + already-aborted** — **FIXED (2026-04-19)**
- [ ] **High: IM3 chatbot enrollment gap** — check lesson-class membership, not just any enrollment
- [ ] BM2 type health sweep (~296 TS errors) — defer unless blocking

## Code Review Summary (2026-04-19 — Review #11)

Post-phase audit of 6 phases: IM3 chatbot security fixes, chatbot provider memoization, monorepo docs cleanup, CI deploy hardening, review #10 residual fixes, AI tutoring adoption.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Tests (IM3) | 3256/3262 pass (6 aspirational .todo) |
| Tests (ai-tutoring) | 32/32 pass |
| Typecheck (IM3) | CLEAN |
| Lint (IM3) | CLEAN |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| learningObjectives bypassed sanitizeMarkdownForPrompt | High | Added .map(sanitizeMarkdownForPrompt) in assembleLessonChatbotContext |
| Abort listener leak in providers.ts | Medium | Added {once: true} + already-aborted check |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| Chatbot enrollment check doesn't verify lesson-class membership | High | isStudentActivelyEnrolled only checks any-class enrollment; student in Class A can access any lesson. Needs lesson→unit→class ownership chain check. |
| Rate limiting after all Convex queries | Moderate | Defense-in-depth concern; 4 Convex calls before rate limit hit |
| No AbortSignal propagation to provider in route.ts | Moderate | Client disconnect doesn't cancel AI provider call |
| No request body size limit | Low | Large JSON body could cause memory issues |

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
