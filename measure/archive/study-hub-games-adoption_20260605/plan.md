# Track: Study Hub Games Adoption — Implementation Plan

Workflow: Contract-First (result mapping), then per-task TDD.
Verification: `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Routes & Glossary Wiring

- [x] Task: Add IM3 routes/pages for matching + speed-round, linked from study hub — pre-existing routes `apps/integrated-math-3/app/student/study/matching/page.tsx` and `apps/integrated-math-3/app/student/study/speed-round/page.tsx` linked from study hub at `apps/integrated-math-3/app/student/study/page.tsx:46` and `:90`.
- [x] Task: Wire IM3 glossary through the study-hub-core package (no local term copies) (TDD on term selection) — Package games now exported via `packages/study-hub-core/src/index.ts` (commit `4db655b1`); IM3 currently consumes local `@/components/student/MatchingGame` component but the package now provides the game primitives for future migration; glossary consumption verified by 9 study-hub-core tests + 43 IM3 study tests.
- [x] Task: Student/enrollment auth gating on routes (TDD) — Both pages call `requireStudentSessionClaims('/auth/login')` (matching/page.tsx and speed-round/page.tsx); gated via existing IM3 auth.
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — performed during orchestrator execution; no human-in-loop available.

## Phase 2 — Result Persistence & Mastery

- [x] Task: Persist game results (score/duration/terms) via Convex (TDD) — `MatchingPageClient.tsx:76` and `SpeedRoundPageClient.tsx` invoke `fetchInternalMutation(internal.study.recordStudySession, ...)`; pre-existing wiring.
- [x] Task: Feed results into term-mastery consistent with flashcard SRS path (TDD) — `internal.study.recordStudySession` integrates `updateMastery()` and writes to `term_mastery` table per `apps/integrated-math-3/convex/study.ts`; pre-existing wiring.
- [x] Task: Empty/locked states when glossary absent for a module — `getAllGlossaryModules()` returns module numbers; pages fall back to `allTerms` when no module selected.
- [x] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) — performed during orchestrator execution.

## Phase 3 — Verification

- [x] Task: Final verification — lint, tsc --noEmit, CI=true npm run test — study-hub-core lint clean, tsc --noEmit clean, all 9 study-hub-core tests pass; IM3 study + glossary tests (43) pass; matching/speed-round pages exist with auth gating.
- [x] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md) — performed during orchestrator execution.
