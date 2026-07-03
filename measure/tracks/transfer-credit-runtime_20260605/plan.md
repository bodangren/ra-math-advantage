# Track: Transfer-Credit Runtime — Implementation Plan

Workflow: Contract-First (transfer policy), then per-task TDD. >80% on pure logic.
Boundary rule: transfer/equivalence logic domain-neutral; course UX app-local.
Verification: boundary lints + per-app lint/test + `tsc --noEmit`.

## Phase 1 — Equivalence Resolution & Transfer Policy
[checkpoint: 603da145]

- [x] Task: Resolve skill → equivalence component; pull component mastery from KST state (TDD) — Green 83ab12a
- [x] Task: Define + implement confidence-discounted transfer policy (Contract-First, TDD) — Green 83ab12a
- [x] Task: Measure - User Manual Verification 'Phase 1' (automated: 42/42 tests, tsc, boundary lint, doctor) — 603da145

## Phase 2 — Skip Eligibility in the Practice Path
[checkpoint: 9174c810]

> Red-phase evidence (2026-07-03): `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-eligibility.test.ts packages/knowledge-space-core/src/__tests__/transfer-eligibility-path.test.ts` → 2 failed suites, module-not-found for `../transfer-eligibility`. Aggregate `CI=true npx vitest run packages/knowledge-space-core` → 41 passed, 2 failed, 560 tests passed.
>
> Green-phase evidence (2026-07-03, SHA `e0d82ab6`): targeted command → 33 tests pass (2 files), aggregate `CI=true npx vitest run packages/knowledge-space-core` → 43 files, 593 tests pass (0 regressions vs Phase 1). `npx tsc --noEmit` clean, `npm run lint --workspace=packages/knowledge-space-core` clean, `node scripts/check-monorepo-boundaries.mjs` clean, `bash measure/doctor.sh` exits 0.

- [x] Task: Compute transfer-eligibility threshold; flag eligible skills/lessons (TDD) — Green e0d82ab
- [x] Task: Integrate eligibility into next-skill/practice resolution (TDD) — Green e0d82ab
- [x] Task: Measure - User Manual Verification 'Phase 2' (automated: 593/593 tests, tsc, boundaries, doctor, lint) — 9174c810

## Phase 3 — Student UX & Confirmation Check
[checkpoint: d0c25224]

> Red-phase evidence (2026-07-03): `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-skip.test.ts apps/integrated-math-3/__tests__/student/transfer-credit` → RED. Package test fails with `Cannot find module '../transfer-skip'`; app tests fail with missing modules `@/lib/transfer-credit/student-skip` and `@/components/student/transfer-credit/TransferCreditPrompt`, plus missing exports `shouldRequireConfirmationCheck` / `grantSkipAfterCheck` from `@math-platform/knowledge-space-core`. Aggregate `CI=true npx vitest run packages/knowledge-space-core` → 593 passed, 1 failed suite (new Red file), 0 regressions.
>
> RED_TEST_COMMAND for Green handoff: `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-skip.test.ts apps/integrated-math-3/__tests__/student/transfer-credit`
>
> Green-phase evidence (2026-07-03, SHA `d6801b70`): targeted command parts exit 0 — `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-skip.test.ts` → 25 tests pass; `CI=true npx vitest run --root apps/integrated-math-3 __tests__/student/transfer-credit` → 17 tests pass (3 files, jsdom). The combined one-line `vitest run packages/... apps/...` command cannot resolve the IM3 `@/` alias when invoked from the repo root (vitest picks one config per invocation), so the two ecosystems are run separately — same outcome. Aggregate `CI=true npx vitest run packages/knowledge-space-core` → 44 files, 618 tests pass (25 new + 593 prior, 0 regressions). `npx tsc --noEmit` clean, `node scripts/check-monorepo-boundaries.mjs` clean, `bash measure/doctor.sh` exits 0. `npm run lint --workspace=packages/knowledge-space-core` clean; IM3 scoped lint on changed files (`components/student/transfer-credit/TransferCreditPrompt.tsx`, `lib/transfer-credit/student-skip.ts`) clean. Full root `npm run lint` flags a pre-existing unused-import warning in `apps/integrated-math-3/__tests__/convex/studentKnowledgeState.adversarial.test.ts:29:8` (ObjectiveProficiencyResult) committed by the archived wire-kst-pipeline track at 688c17f7d — **out of scope** for this track; not modified. Full IM3 suite `CI=true npm run ws:im3:test` times out at 180s (same behavior as Red); recorded in `known_failures`.

- [x] Task: "Already mastered in <course>" UI with skip / confirmation-check / reversible skip (TDD on logic) — Green d6801b70
- [x] Task: Optional brief verification before granting skip (TDD) — Green d6801b70
- [x] Task: Measure - User Manual Verification 'Phase 3' (automated via §4 gates in autonomous mode) — checkpoint c9f740d1

## Phase 4 — Teacher Visibility & Verification

- [ ] Task: Surface transfer credits in teacher views (auditable)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
