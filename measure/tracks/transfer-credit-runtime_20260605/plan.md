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

> Red-phase evidence (2026-07-03): `CI=true npx vitest run packages/knowledge-space-core/src/__tests__/transfer-eligibility.test.ts packages/knowledge-space-core/src/__tests__/transfer-eligibility-path.test.ts` → 2 failed suites, module-not-found for `../transfer-eligibility`. Aggregate `CI=true npx vitest run packages/knowledge-space-core` → 41 passed, 2 failed, 560 tests passed.
>
> Green-phase evidence (2026-07-03, SHA `e0d82ab6`): targeted command → 33 tests pass (2 files), aggregate `CI=true npx vitest run packages/knowledge-space-core` → 43 files, 593 tests pass (0 regressions vs Phase 1). `npx tsc --noEmit` clean, `npm run lint --workspace=packages/knowledge-space-core` clean, `node scripts/check-monorepo-boundaries.mjs` clean, `bash measure/doctor.sh` exits 0.

- [x] Task: Compute transfer-eligibility threshold; flag eligible skills/lessons (TDD) — Green e0d82ab
- [x] Task: Integrate eligibility into next-skill/practice resolution (TDD) — Green e0d82ab
- [b] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md) deferred:human

## Phase 3 — Student UX & Confirmation Check

- [ ] Task: "Already mastered in <course>" UI with skip / confirmation-check / reversible skip (TDD on logic)
- [ ] Task: Optional brief verification before granting skip (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Teacher Visibility & Verification

- [ ] Task: Surface transfer credits in teacher views (auditable)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
