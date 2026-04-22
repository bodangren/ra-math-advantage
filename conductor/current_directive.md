# Current Directive

> Updated: 2026-04-23 (Code review #14 — audit of 6 recent work phases: BM2 triage Phase 1, chatbot security, provider memoization, misconception N+1, practice-core testing, teacher assignment UI)

## Mission

Monorepo migration complete (Waves 0-6). All major feature tracks done. Current focus: tech debt triage (Phase 1 complete), hardening remaining issues, and preparing for next feature development cycle.

## Priority Order (Execute In This Order)

1. **Monorepo tech debt triage** — Phase 1 (BM2 TypeScript) complete; Phases 2-8 remain
2. **RSC bundle optimization** — 750 KB entry chunk needs code-splitting (target < 500 KB)
3. **SRS & practice correctness** — misconception tags, atomic card saves, studentId type mismatch
4. **CI/CD hardening** — remove continue-on-error swallowing failures, add staging gate

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

- [x] Waves 0-6 complete (all packages extracted, IM3+BM2 imports migrated, CI/CD hardened)
- [x] Review #11 fixes (learningObjectives sanitization + abort listener leak)
- [x] Review #12 fixes (chatbot enrollment fallback + game streak bug + math sanitization)
- [x] Review #13 fixes (prompt injection via triple-quote delimiters + teacher UI revalidatePath)
- [x] Teacher assignment UI for class_lessons (class selector using URL routing, assign/unassign working)
- [x] BM2 Phase 1 triage complete (0 TS errors, re-export shims for auth/practice, governance skips)
- [ ] Monorepo tech debt triage Phases 2-8 (SRS correctness, N+1, CI/CD, package quality)
- [ ] RSC entry chunk code-splitting (750 KB → < 500 KB)
- [ ] LessonChatbot.tsx component test coverage
- [ ] Seed mutation integration tests (current tests validate static types only)

## Code Review Summary (2026-04-23 — Review #14)

Audit of 6 work phases since Review #13: BM2 TypeScript triage Phase 1, teacher lesson assignment UI, seed class lessons, practice-core testing, misconception N+1 fix, chatbot security/provider work.

### Verification Results

| Check | Result |
|-------|--------|
| Build (IM3) | PASS |
| Tests (IM3) | 3279/3286 pass (6 aspirational .todo, 1 pre-existing flaky in full suite) |
| Typecheck (IM3) | CLEAN |
| Lint (IM3) | CLEAN |
| Chatbot route tests | 9/9 PASS |
| Teacher query tests | 79/79 PASS |

### Issues Fixed in This Review

| Issue | Severity | Fix |
|-------|----------|-----|
| Enrollment fallback grants unrestricted access when no class_lessons | High | Changed to deny-by-default in student.ts:445 |
| Prompt injection sanitization too weak | High | Added newline stripping, role-switch token removal, bracket stripping in sanitizeInput |
| N+1 queries in 4 teacher SRS handlers | High | Parallelized with Promise.all in srs-queries.ts (getOverdueLoad, getPracticeStreaks, getStrugglingStudentsHandler, getClassSrsHealth) |
| Test validates insecure enrollment behavior | Medium | Updated test to expect 403 for deny-by-default |

### Issues Found (Deferred)

| Issue | Severity | Notes |
|-------|----------|-------|
| `internal as any` casts in chatbot route | Medium | Generated types stale; run npx convex dev |
| practice-core: computeBaseRating([]) returns 'Good' | Medium | Empty parts array edge case untested |
| practice-core: seed tests don't exercise mutation | Medium | Tests validate static type, not actual seedDemoEnv |
| Misconception tags not persisted in review evidence | High | getMisconceptionSummary always returns empty |
| SRS sessions index undefined sorting | High | by_student_and_status needs explicit completedAt filter |
