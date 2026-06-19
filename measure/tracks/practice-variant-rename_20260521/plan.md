# Track 7: Practice-Variant Rename — Implementation Plan

Workflow: Contract-First refactor — rename mechanically, keep tests green at each
phase; add migration tests. >80% coverage maintained.
Depends on: Track 1. Sequence after Track 1 to avoid churn collisions.

## Phase 1 — Contract & Schema

- [~] Task: Rename types and schemas in practice-core  *(MID Red, 2026-06-19)*
    - [~] ProblemFamily → PracticeVariant; problemFamilyId → variantKey; Zod schemas; problem-family.ts module
- [~] Task: Define the Convex schema rename and data migration  *(MID Red, 2026-06-19)*
    - [~] srs_cards.problemFamilyId → variantKey; migration script; migration tests
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §7 (Live-Proof Plan). Red
> tests live at `packages/practice-core/src/__tests__/practice-item.test.ts` and
> `apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`.
>
> **Dirty worktree (preserved, not in this track's commits):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — spec-compliance-and-process-integrity
>   hardening, unrelated to this track.
> - `measure/tracks/practice-variant-rename_20260521/test-strategy.md` (??) —
>   this track's strategy doc, folded into the Red-phase commit.
>
> **Red commands + fail counts (run 2026-06-19, vitest 4.1.8):**
> 1. P1 contract Red:
>    `./node_modules/.bin/vitest run packages/practice-core/src/__tests__/practice-item.test.ts -t "variantKey"`
>    → **5 failed, 1 passed** of 6. Failures are Zod parse errors complaining
>    about a missing `problemFamilyId` (the current schema still requires the
>    legacy field) and the "rejects the legacy problemFamilyId field" assertion
>    failing because the current schema still accepts the legacy name. The 1
>    passing case is the `PracticeItem` type contract test — TypeScript types
>    are erased at runtime so `@ts-expect-error` is a no-op there; the test
>    itself is a TypeScript-level guard and will enforce the contract once
>    `tsc --noEmit` is run.
> 2. P1 migration Red:
>    `./node_modules/.bin/vitest run apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`
>    → **4 failed, 0 passed** of 4. All failures are
>    `Cannot find module '.../rename-problem-family'` — the migration module
>    does not exist yet, so the test will turn Green only after Phase 1's
>    implementation task adds `apps/integrated-math-3/convex/migrations/rename-problem-family.ts`.
>    `MemoryDb` (in-test, per strategy §2) is the bounded fake harness; the
>    live `npx convex run` gate for production data is owned by the P3 task.

## Phase 2 — Engine Rename

- [ ] Task: Rename across srs-engine (TDD — keep tests green)
    - [ ] scheduler, contract, objective-proficiency, srs-proficiency; variantKey threading
    - [ ] minProblemFamilies → minVariants; ProblemFamilyEvidence → PracticeVariantEvidence
    - [ ] Single-variant default (variantKey = objectiveId)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Projection, App Rename, and Migration

- [ ] Task: Rename in knowledge-space-practice SRS projection and app call sites (TDD)
    - [ ] projections/srs.ts; apps/integrated-math-3 lib/srs and convex call sites; fixtures and tests
- [ ] Task: Execute and verify the Convex data migration on existing card data
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec §12.1 / §13 (practice variant; Card definition)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
