# Current Directive

> Updated: 2026-04-19 (Code review #9 — audit of AI tutoring extraction, adoption, and teacher-reporting wiring)

## Mission

Primary objective is to execute the monorepo migration roadmap in Conductor order, with strict package/app boundaries and no BM2 business-domain leakage.

## Priority Order (Execute In This Order)

1. **Waves 0-5 complete** — readiness gate, tooling shell, move apps, boundary guards, all packages extracted, app import migration done, BM2 fully consuming core + runtime packages, AI tutoring extracted and adopted in IM3 + BM2
2. **BM2 SRS contract migration complete** — Convex schema migrated to flat SrsCardState
3. **Next: Extract Workbook Pipeline Package and Adopt in IM3** — last Wave 5 track
4. **Then: Wave 6** — monorepo CI/CD hardening and docs cleanup
5. **BM2 type health sweep** — ~296 pre-existing errors; defer unless blocking migration gates

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

- [x] Waves 0-4 complete (all packages extracted, IM3+BM2 imports migrated)
- [x] BM2 SRS contract migration — **COMPLETED (2026-04-18)**
- [x] BM2 consume-core-packages — **COMPLETED (2026-04-18)**
- [x] BM2 consume-runtime-packages — **COMPLETED (2026-04-18)**
- [x] Extract practice-test-engine — **COMPLETED (2026-04-19)**
- [x] Extract study-hub-core — **COMPLETED (2026-04-19)**
- [x] Extract teacher-reporting-core — **COMPLETED (2026-04-19)**
- [x] Extract AI Tutoring Package and Adopt in IM3 — **COMPLETED (2026-04-19)**
- [ ] Extract Workbook Pipeline Package and Adopt in IM3
- [ ] Wave 6: CI/CD hardening, docs cleanup
- [ ] BM2 type health sweep (~296 TS errors) — defer unless blocking

## Code Review Summary (2026-04-19 — Review #9)

Audit of 6 phases since review #8: AI tutoring package extraction (Phase 1), BM2 adoption (Phase 2), IM3 chatbot implementation, teacher-reporting adoption, workbook manifest update, plan/docs reconciliation.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Tests (IM3) | 3249/3255 pass (6 aspirational .todo) |
| Tests (ai-tutoring) | 31/31 pass |
| Tests (teacher-reporting-core) | 65/65 pass |
| Typecheck (IM3) | CLEAN |
| Typecheck (all new packages) | CLEAN |
| Lint (IM3) | CLEAN |

### Critical Issues Fixed

| Issue | Severity | Fix |
|-------|----------|-----|
| Rate limiting completely broken — `fetchInternalMutation` admin auth has no user identity; `ctx.auth.getUserIdentity()` always returns null | Critical | Mutations now accept `userId`/`adminProfileId` args; API route resolves profile first |
| `isRetryableError` default `return true` masks programming errors as transient | Critical | Default now `return false`; explicit network pattern allowlist |
| `cleanupStaleRateLimits` unbounded `.collect()` could OOM | Medium (was unbounded) | Changed to `.filter().take(100)` |

### High Issues Fixed

| Issue | Severity | Fix |
|-------|----------|-----|
| HTTP headers reference "Business Math v2" instead of "Integrated Math 3" | High | Updated `HTTP-Referer` and `X-Title` |
| CSV export: masteryLevel values and status labels not passed through `escapeCsvValue` | High | All cell values now consistently escaped |
| `isUnitTest: orderIndex === 11` hardcoded in shared package | High | `RawLesson.isUnitTest` now caller-controlled; defaults to false |

### Medium Issues Fixed

| Issue | Severity | Fix |
|-------|----------|-----|
| Misleading `(400)` in empty-response error message | Medium | Changed to `[EMPTY_RESPONSE]` sentinel |
| `getLessonForChatbot` fragile learningObjectives parsing | Medium | Uses array directly instead of split(index[0]) |
| Prompt injection delimiters missing in buildPrompt | Medium | Added triple-quote delimiters around student question |

### Issues Tracked But Not Fixed (in tech-debt.md)

| Issue | Severity | Notes |
|-------|----------|-------|
| ai-tutoring: resolveOpenRouterProviderFromEnv untested | Medium | Exported public API with zero test coverage |
| ai-tutoring: `as any` cast in providers.ts | Medium | Need typed OpenRouterResponse interface |
| IM3 chatbot: no tests for route.ts, rateLimits.ts, LessonChatbot.tsx | High | Three new files with zero test coverage |
| IM3 chatbot: prompt injection risk beyond delimiters | Medium | No system-level content guard |
| IM3 Convex types stale: rateLimits + student.getLessonForChatbot | Medium | Must run `npx convex dev` to regenerate api.d.ts |
| teacher-reporting: Tailwind CSS coupling in cellBgClass | High | Shared package returns Tailwind classes; prevents non-Tailwind consumers |
| teacher-reporting: course-overview passes 'not_started' sentinel | Medium | Works but semantically misleading |
