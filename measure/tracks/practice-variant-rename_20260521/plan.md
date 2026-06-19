# Track 7: Practice-Variant Rename — Implementation Plan

Workflow: Contract-First refactor — rename mechanically, keep tests green at each
phase; add migration tests. >80% coverage maintained.
Depends on: Track 1. Sequence after Track 1 to avoid churn collisions.

## Phase 1 — Contract & Schema

- [x] Task: Rename types and schemas in practice-core  *(JR Green, 2026-06-19, commit 96fd073f)*
    - [x] ProblemFamily → PracticeVariant; problemFamilyId → variantKey; Zod schemas; problem-family.ts module
- [x] Task: Define the Convex schema rename and data migration  *(JR Green, 2026-06-19, commit 96fd073f)*
    - [x] srs_cards.problemFamilyId → variantKey; migration script; migration tests
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

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

- [~] Task: Rename across srs-engine (TDD — keep tests green) *(MID Red in progress, 2026-06-19)*
    - [ ] scheduler, contract, objective-proficiency, srs-proficiency; variantKey threading
    - [ ] minProblemFamilies → minVariants; ProblemFamilyEvidence → PracticeVariantEvidence
    - [ ] Single-variant default (variantKey = objectiveId)

> **MID Red handoff (2026-06-19):** See `test-strategy.md` §7 (Live-Proof Plan), row "P2".
> Red proof lives at `packages/srs-engine/src/__tests__/variant-rename.test.ts` (new).
> Existing `__tests__/*.test.ts` files are intentionally NOT modified in the Red phase
> per the directive "use specific test files/cases" — flipping their assertions en bloc
> belongs to the Green step (where the source rename lands and they would otherwise turn
> Red without a target).
>
> **Dirty worktree (preserved, NOT staged in this track's commit):**
> - `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (M) —
>   onboarding test, unrelated to this track.
> - `measure/automation-supervisor.py` (M) — supervisor hardening, unrelated to this track.
>
> **Targeted Red command (run 2026-06-19, vitest 4.1.8):**
> `./node_modules/.bin/vitest run packages/srs-engine/src/__tests__/variant-rename.test.ts`
> → **20 failed, 2 passed** of 22.
> The 2 passes are FR-invariant sanity checks (`aggregateCardsToEvidence([])`
> returns `[]`; `InMemoryTimingBaselineResolver` is still on the module surface —
> FR1 does not rename it). The 20 substantive Red failures span all five rename
> surfaces in scope for Phase 2:
> - **Contract** (2 fail): `createMockSrsCard` carries `problemFamilyId`, not
>   `variantKey`; `variantKey` overrides do not round-trip.
> - **Scheduler** (4 fail): `createCard({ variantKey })` ignores `variantKey`
>   and writes `problemFamilyId`; FR2 single-variant default is not implemented
>   (no defaulting of `variantKey` to `objectiveId`).
> - **SRS Proficiency** (2 fail): `aggregateCardsToEvidence` groups cards by
>   `problemFamilyId`, so input `{ variantKey }` collapses into one bucket;
>   the byte-for-byte numeric assertion cannot be reached.
> - **Objective Proficiency** (6 fail): `PROFICIENCY_THRESHOLD_DEFAULTS.*`
>   expose `minProblemFamilies`, not `minVariants`; `computeObjectiveProficiency`
>   reads `problemFamilyEvidences` + `minProblemFamilies` and throws
>   `Cannot read properties of undefined (reading 'length')` when the test
>   passes `variantEvidences`; emitted `problemFamilyDetails[i].variantKey`
>   is undefined.
> - **Adapters** (3 fail): `InMemoryCardStore.getCardByStudentAndVariant` is
>   `undefined` (HEAD exposes `getCardByStudentAndFamily`).
> - **Submission Adapter module** (3 fail): `InMemoryPracticeVariantResolver`
>   is `undefined` on `submission-srs-adapter` module (HEAD exports
>   `InMemoryProblemFamilyResolver`).
>
> All 20 fail with the expected missing-behavior modes (legacy field writes,
> missing renamed exports, undefined reads). The strategy's Red-command target
> is met — the live gate `npm --workspace @math-platform/srs-engine run test`
> is owned by the Green step.
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
