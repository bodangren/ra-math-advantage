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
[checkpoint: 84a6611e]

> Red-phase evidence (2026-07-03): `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-teacher-audit.test.ts` → RED, module-not-found for `../transfer-teacher-audit`. `CI=true npx vitest run --root apps/integrated-math-3 __tests__/teacher/transfer-credit/TransferCreditAuditPanel.test.tsx` → RED, missing `@/components/teacher/transfer-credit/TransferCreditAuditPanel`. Aggregate `CI=true npx vitest run packages/knowledge-space-core` → 44 passed files / 618 prior tests green, 1 failed Red file; existing IM3 transfer-credit tests remain green.
>
> RED_TEST_COMMAND for Green handoff: `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-teacher-audit.test.ts` && `CI=true npx vitest run --root apps/integrated-math-3 __tests__/teacher/transfer-credit/TransferCreditAuditPanel.test.tsx`
>
> Green-phase evidence (2026-07-03, SHA `84a6611e`): targeted Red command parts exit 0 — `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-teacher-audit.test.ts` → 9 tests pass; `CI=true npx vitest run --root apps/integrated-math-3 __tests__/teacher/transfer-credit/TransferCreditAuditPanel.test.tsx` → 7 tests pass. Final-gate matrix: `CI=true npx vitest run packages/knowledge-space-core` → 45 files / 627 tests pass (9 new + 618 prior, 0 regressions); `CI=true npx vitest run --root apps/integrated-math-3 __tests__/student/transfer-credit __tests__/teacher/transfer-credit` → 4 files / 24 tests pass (3 student + 1 teacher, jsdom); `CI=true npm run test` → 45 files / 627 tests pass; `npx tsc --noEmit` (root) → exit 0; `npm run lint` (root: knowledge-space-core + IM3) → exit 0; `node scripts/check-monorepo-boundaries.mjs` → exit 0; `bash measure/doctor.sh` → exit 0. One pre-existing unused-import warning in `apps/integrated-math-3/__tests__/convex/studentKnowledgeState.adversarial.test.ts:29:8` (`ObjectiveProficiencyResult`, archived wire-kst-pipeline track at 688c17f7d) was removed in a follow-up commit `80b33db6` (`chore(lint): remove pre-existing unused import blocking final lint gate`) so the full root lint gate could pass — the file itself is out of scope for the transfer-credit-runtime track, but the gate required it. Full IM3 suite `CI=true npm run ws:im3:test` times out at 180s (pre-existing); targeted IM3 transfer-credit suites only.
>
> Post-checkpoint fix commits (necessary for all gates to pass at HEAD): `1920a3c0` (`fix(transfer-credit): fix TypeScript errors in test files and eligibility module`) — at `84a6611e` the root tsc exited 0 (root tsconfig only includes `scripts/vitest.config.ts`), but the package-specific gate `npx tsc --noEmit -p packages/knowledge-space-core/tsconfig.json` reported 17 errors (TS18048 `entry` possibly undefined in `transfer-eligibility.ts:256`, plus type-mismatch errors in `transfer-teacher-audit.test.ts`, `transfer-eligibility.test.ts`, `transfer-skip.test.ts`, and a pre-existing `phase-5-adversarial.test.ts` `KnowledgeStateStudentRef` shape error); `1920a3c0` added the non-null assertion and corrected the test types so the package-specific tsc gate exits 0. `7cb3b704` (`fix(transfer-credit): remove student email from teacher audit panel`) — Phase 4 review-b finding PII-1: the panel was rendering student email, expanding the PII surface beyond existing IM3 teacher views; the email prop/rendering was removed. At HEAD (`7cb3b704`) all 7 acceptance gates exit 0: package vitest 45/627, IM3 transfer-credit vitest 4/24, root tsc, package tsc, boundary lint, root lint, doctor, `CI=true npm run test`.

- [x] Task: Surface transfer credits in teacher views (auditable) — Green 84a6611e
- [x] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test — 84a6611e + 80b33db6 (lint unblocker) + 1920a3c0 (package-tsc fix) + 7cb3b704 (review-b PII fix)
- [x] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md) — autonomous mode: final gates substitute for UMV (no human walkthrough) — 9c4c94c8
