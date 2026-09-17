# Implementation Plan: KST+SRS v3.2 IM3 Runtime and Data Migration

**Dependencies:** `kst-srs-v3-2-planner-session_20260710` and
`monorepo-architecture-contracts_20260710`

**Migration method:** Widen -> migrate -> verify -> cut over -> wait -> narrow

**Deployment rule:** Do not change a live deployment without explicit approval

## Read Before Work

Read these files in this order:

1. `AGENTS.md`
2. `measure/workflow.md`
3. `convex/_generated/ai/guidelines.md` for the IM3 app
4. `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/spec.md`
5. `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/runtime-inventory.md`
6. `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/cutover-contract.md`
7. `measure/tracks/kst-srs-v3-2-im3-runtime-migration_20260710/phase-3-manual-verification.md`
8. `kst-srs.v3.2/SPECIFICATION.md`

Before each edit, run `git diff -- <file>`. Preserve unrelated changes. Do not
run a migration, cutover, rollback, schema deployment, or data write without
the approval required by the task below.

## Fixed Limits

- [x] Shared KST and SRS packages remain canonical.
- [x] IM3 owns its Convex schema, adapters, routes, and deployment.
- [x] BC compatibility is a contract and build check. BC does not read IM3 data.
- [x] APPC, IM1, and IM2 are compatibility consumers only in this track.
- [x] Do not add a second migration framework, queue, card model, or graph.
- [x] Do not add a hash, checksum, source-tree manifest, or audit chain.
- [x] Keep sensitive learner answers out of migration and comparison records.

## Completed Work

### Phase 1: Contract and Schema Widening [checkpoint: `c29bffb`]

- [x] Inventory the v2 persistence and runtime surface [`ecca7fc`].
- [x] Define widened schemas and versioned adapters [`96bd05d`].
- [x] Define cutover, comparison, and rollback contracts [`45af637`].
- [x] Complete the Phase 1 manual verification [`496e720`].

### Phase 2: Migration and Runtime Tests [checkpoint: `5d0a66f`]

- [x] Test widen, dry-run, resume, replay, and rollback behavior [`ae08bb1`].
- [x] Test placement and practice-variant backfills [`1b5cd5a`].
- [x] Test v2 and v3.2 observable-output comparison [`5d071b6`].
- [x] Test all app consumers against the final package contract [`ea3f1ec`].
- [x] Complete the Phase 2 manual verification [`090d896`].

### Phase 3A: Widen, Migrate, and Cut Over

- [x] Implement widened schemas and dual-version adapters [`358d8b2`].
- [x] Reconcile the IM3 package declarations [`34b0c83`].
- [x] Implement bounded dual reads, dual writes, comparison, and server flags
  [`f90fd9a`].
- [x] Add the approved Convex migration component and batched migrations
  [`879355b`].
- [x] Run the isolated development dry run and verification queries [`5361de7`].
- [x] Cut IM3 and the BC queue adapter to canonical v3.2 behavior [`21aa9f0`].
- [x] Complete the Phase 3 manual verification [`3be2faa`].

## Phase 3B: Post-Cutover Narrowing

This phase is blocked until Task 3.8 is complete. Do not prepare a narrowing
deployment in advance.

- [ ] Task 3.8: Prove that narrowing is authorized.
  - [ ] Obtain the live cutover timestamp from the server-owned runtime-control
    record. Do not use a date from a client or this plan.
  - [ ] Prove that at least 14 full days have elapsed since that timestamp.
  - [ ] Run the existing bounded migration verification query.
  - [ ] Require zero unmigrated `practice_variants`, `practice_items`,
    `srs_cards`, `srs_review_log`, `placement_results`, and `srs_sessions` rows.
  - [ ] Require zero `data_gap` and zero `unexpected` comparison events for the
    release under review.
  - [ ] Record the existing migration status and comparison results in the
    phase verification note. Do not create a new report format.
  - [ ] Obtain explicit user approval for post-window narrowing.
  - [ ] Stop if any check fails or approval is absent.
- [ ] Task 3.9: Write narrowing tests before production edits.
  - [ ] Update `apps/integrated-math-3/__tests__/convex/schema-srs.test.ts` to
    require `variantKey` and reject the two legacy identity fields after
    narrowing.
  - [ ] Update
    `apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts` to
    prove reads use `by_student_and_variant` only.
  - [ ] Update
    `apps/integrated-math-3/__tests__/lib/srs/v3-runtime-contract.test.ts` to
    prove the runtime accepts one canonical `variantKey` and has no legacy
    fallback or dual-write helper.
  - [ ] Update `apps/integrated-math-3/__tests__/convex/srs/runtime.test.ts` to
    prove a client cannot select compare or rollback behavior.
  - [ ] Keep migration history tests for the completed backfill. Mark them as
    historical fixtures only when they no longer import live runtime helpers.
  - [ ] Run the focused tests and record the expected Red failures.
  - [ ] Stop if a test fails for an unrelated standing baseline.
- [ ] Task 3.10: Narrow the persisted variant identity.
  - [ ] Edit `apps/integrated-math-3/convex/schema.ts`.
  - [ ] Make `variantKey` required on `srs_cards`.
  - [ ] Remove `legacyProblemFamilyId` and `problemFamilyId` from
    `srs_cards`.
  - [ ] Remove indexes `by_legacy_problem_family` and
    `by_historic_problem_family`.
  - [ ] Remove `legacyProblemFamilyId` from `practice_variants` and
    `practice_items` only after the zero-unmigrated check covers those tables.
  - [ ] Keep `migrationVersion` and `sourceTimestamp` unless the approved
    cutover contract explicitly requires their removal.
  - [ ] Do not change BC storage fields in this task.
- [ ] Task 3.11: Remove legacy IM3 readers and dual writes.
  - [ ] Edit `apps/integrated-math-3/lib/srs/v3-runtime-contract.ts` so live
    callers require one non-blank `variantKey`.
  - [ ] Edit `apps/integrated-math-3/convex/srs/cards.ts` so
    `findCardByStudentAndVariant` performs one canonical indexed read.
  - [ ] Replace `dualWriteFields` with the smallest canonical write object.
  - [ ] Remove legacy input fields from `SaveCardArgs` and the Convex validator.
  - [ ] Use `rg -n 'legacyProblemFamilyId|problemFamilyId|dualWriteFields|rollback_v2' apps/integrated-math-3 --glob '!**/__tests__/**'` to find
    remaining live callers.
  - [ ] Update each live caller to use `variantKey`.
  - [ ] Do not rename domain terms in historical migration files or unrelated
    curriculum documents.
- [ ] Task 3.12: Retire v2 runtime selection after the rollback window.
  - [ ] Remove the live v2 comparison path only after Task 3.8 approval.
  - [ ] Remove the `rollback_v2` choice from server validators and handlers.
  - [ ] Keep one canonical v3.2 path for queue, knowledge-state, placement, and
    review-day behavior.
  - [ ] Keep historical comparison rows readable if an existing teacher or
    operator view uses them.
  - [ ] Do not delete historical data in this track.
- [ ] Task 3.13: Make the narrowing tests Green.
  - [ ] Run the exact focused selectors from Task 3.9.
  - [ ] Run all IM3 migration, card, queue, placement, knowledge-state, and
    submission-SRS tests.
  - [ ] Run the BC queue compatibility tests.
  - [ ] Stop on a current-only failure. Do not restore a fallback to make a
    stale fixture pass.
- [ ] Task 3.14: Measure - User Manual Verification 'Phase 3B: Post-Cutover Narrowing' (Protocol in `measure/workflow.md`).

## Phase 4: Generate Docs, Doctor, and Migration Closeout

- [ ] Task 4.1: Update existing operator documentation.
  - [ ] Update `runtime-inventory.md` to show the final canonical fields and
    indexes.
  - [ ] Update `cutover-contract.md` with the completed rollback-window and
    narrowing result.
  - [ ] Update `phase-3-manual-verification.md` or add the standard Phase 4
    manual-verification file. Do not create a custom report format.
  - [ ] Record the existing dry-run, run, status, resume, verification, and
    rollback commands.
  - [ ] Do not add hashes or a provenance manifest.
- [ ] Task 4.2: Run IM3 quality gates.
  - [ ] Run the focused migration and runtime tests first.
  - [ ] Run `CI=true npm run ws:im3:test`.
  - [ ] Run `CI=true npm run ws:im3:lint`.
  - [ ] Run `CI=true npm run ws:im3:typecheck`.
  - [ ] Run `CI=true npx tsc --noEmit --project apps/integrated-math-3/tsconfig.json`.
  - [ ] Run `CI=true npm run ws:im3:build`.
  - [ ] Run Convex code generation if a registered function signature changed.
  - [ ] Inspect generated changes before keeping them.
- [ ] Task 4.3: Run package and consumer gates.
  - [ ] Run test, lint, typecheck, and build for `packages/srs-engine`.
  - [ ] Run test, lint, typecheck, and build for
    `packages/knowledge-space-core` and `packages/knowledge-space-practice`.
  - [ ] Run the BC queue compatibility selector.
  - [ ] Run the IM1, IM2, APPC, and BC typecheck and build commands.
  - [ ] Compare app test failures with the recorded pre-track baseline.
  - [ ] Stop on a current-only failure.
- [ ] Task 4.4: Generate repository facts and run architecture gates.
  - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
  - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
  - [ ] Run `npm run generate`.
  - [ ] Inspect every generated diff.
  - [ ] Run `npm run doctor`.
  - [ ] Run `git diff --check`.
- [ ] Task 4.5: Close the migration without a live deployment.
  - [ ] Report whether Task 3.8 remained blocked or received approval.
  - [ ] If narrowing code is ready but deployment approval is absent, leave the
    deployment task open. Do not claim that live data is narrowed.
  - [ ] Update `measure/tracks.md` and this plan with exact verified results.
  - [ ] Do not perform a production deploy as part of documentation closeout.
- [ ] Task 4.6: Measure - User Manual Verification 'Phase 4: Generate Docs, Doctor, and Migration Closeout' (Protocol in `measure/workflow.md`).
