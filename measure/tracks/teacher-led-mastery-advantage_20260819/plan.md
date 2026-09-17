# Implementation Plan: Teacher-Led First Exposure and Mastery Advantage Pilots

**Track type:** Feature closeout

**Pilot limit:** One node in each app

**Execution order:** Reconcile -> Remove -> Verify -> Close

## Read Before Work

Read these files in this order:

1. `AGENTS.md`
2. `measure/workflow.md`
3. `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
4. `measure/practice-component-contract.md`
5. `kst-srs.v3.2/SPECIFICATION.md`
6. The app product file for the app that you change

Run `git diff -- <file>` before each edit. Preserve unrelated work. Do not edit
a file only because it is near a pilot file.

## Fixed Decisions

- This track proves exactly one node in each app.
- IM3 reuses its existing KST and SRS path.
- APPC and BC apply SRS only in this pilot.
- APPC and BC receipts keep `kstApplied: false`.
- APPC belongs to the single IM1 to APPC course-series graph.
- BC is outside that graph and has no graph in the repository.
- Evidence retry uses only the opaque server-owned `submissionId`.
- Idempotency conflict checks compare normalized fields directly.
- This track adds no hash, fingerprint, checksum, or provenance field.

## Verified Baseline on 2026-08-21

- The accepted focused gate passed 57 files and 517 tests.
- IM3 passed 24 focused files and 186 focused tests.
- BC passed 17 focused files and 133 focused tests.
- APPC passed 14 focused files and 157 focused tests before the APPC
  graph-wide KST tests were added.
- The APPC graph-wide KST selector has 9 Green tests and 4 Red tests.
- Full-suite current-only failures were zero against the recorded baselines.
- The route report generator uses the installed `repo-graph` command.
- The IM3 phase-completion route and button have retry regression coverage.

## Phase 1: Reconcile Ownership

- [ ] **Task 1.1: Approve the corrected pilot specification.**
  - [ ] Confirm that IM3 is KST plus SRS in this pilot.
  - [ ] Confirm that APPC and BC are SRS-only in this pilot.
  - [ ] Confirm that `kstApplied: false` is required for APPC and BC.
  - [ ] Confirm that graph-wide work is absent from this track.
- [ ] **Task 1.2: Move APPC graph-wide KST ownership without changing tests.**
  - [ ] Keep these Red tests unchanged:
    - `apps/pre-calculus/__tests__/lib/curriculum/skill-graph-loader.test.ts`
    - `apps/pre-calculus/__tests__/convex/precalculus-kst-consumer.red.test.ts`
    - `apps/pre-calculus/__tests__/convex/learning-evidence-production-flow.red.test.ts`
    - `apps/pre-calculus/__tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx`
  - [ ] Record the 9 Green and 4 Red baseline in the APPC rollout plan.
  - [ ] Do not implement those tests as pilot closeout work.
- [ ] **Task 1.3: Update the Measure registry.**
  - [ ] Describe this track as a one-node proof.
  - [ ] Add the IM3, APPC, and BC rollout tracks.
  - [ ] Show that each rollout depends on this pilot contract.
- [ ] **Task 1.4: Measure - User Manual Verification 'Phase 1: Reconcile Ownership' (Protocol in `measure/workflow.md`).**

## Phase 2: Removal-First Audit

- [ ] **Task 2.1: Confirm that the track added no unauthorized hash.**
  - [ ] Search only track-owned production files for `createHash`, `sha256`,
    `fingerprint`, and new checksum fields.
  - [ ] Remove a track-added occurrence unless an existing protocol requires it.
  - [ ] Do not change password hashing, IP hashing, or component-approval legacy
    behavior.
- [ ] **Task 2.2: Confirm that APPC and BC do not duplicate KST.**
  - [ ] Keep the shared SRS-to-KST bridge in
    `@math-platform/knowledge-space-core` as the only bridge implementation.
  - [ ] Remove any pilot-local KST bridge or snapshot writer that duplicates it.
  - [ ] Keep the APPC and BC pilot receipt field at `kstApplied: false`.
- [ ] **Task 2.3: Confirm that IM3 phase completion still works.**
  - [ ] Run
    `apps/integrated-math-3/__tests__/app/api/phases/complete/route.test.ts`.
  - [ ] Run
    `apps/integrated-math-3/__tests__/components/lesson/PhaseCompleteButton.test.tsx`.
  - [ ] Run
    `apps/integrated-math-3/__tests__/convex/student-phase-completion-completed-row.red.test.ts`.
  - [ ] Require one idempotency key for the logical completion attempt.
  - [ ] Require retry to reuse that key.
  - [ ] Stop if a pilot change breaks ordinary phase completion.
- [ ] **Task 2.4: Measure - User Manual Verification 'Phase 2: Removal-First Audit' (Protocol in `measure/workflow.md`).**

## Phase 3: Pilot Regression Gate

- [ ] **Task 3.1: Run the exact focused pilot selectors.**
  - [ ] Run the recorded 24-file IM3 selector.
  - [ ] Run the recorded 17-file BC selector.
  - [ ] Run the recorded 14-file APPC pilot selector.
  - [ ] Run the Practice Core and SRS Engine selectors.
  - [ ] Require the recorded 57-file and 517-test total unless an inspected test
    addition changes the count.
- [ ] **Task 3.2: Run app and package quality gates.**
  - [ ] Run test, lint, typecheck, and build for IM3 and APPC.
  - [ ] Run test, lint, explicit `npx tsc --noEmit`, and build for BC.
  - [ ] Run test, lint, typecheck, and build for `practice-core`, `srs-engine`,
    and `knowledge-space-core`.
  - [ ] Compare full-app failures with the recorded pre-track baselines.
  - [ ] Stop on a current-only failure.
- [ ] **Task 3.3: Verify public trust boundaries.**
  - [ ] Require student role on every pilot producer and consumer.
  - [ ] Require a bounded non-blank `Idempotency-Key` on create routes.
  - [ ] Reject browser-owned learner, score, grade, ordinal, time, and origin.
  - [ ] Require evidence retry to send only `{ submissionId }`.
  - [ ] Require safe HTTP 409 responses for idempotency conflicts.
- [ ] **Task 3.4: Measure - User Manual Verification 'Phase 3: Pilot Regression Gate' (Protocol in `measure/workflow.md`).**

## Phase 4: Generated Facts and Closeout

- [ ] **Task 4.1: Run repository fact gates.**
  - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
  - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
  - [ ] Run `npm run generate`.
  - [ ] Inspect each generated diff.
  - [ ] Run `npm run doctor`.
  - [ ] Run `git diff --check`.
  - [ ] Do not add a report runner, hash, checksum, or manifest.
- [ ] **Task 4.2: Run smoke checks only with the required authorization.**
  - [ ] A local Convex and Next smoke may create local test data only after the
    user approves that write.
  - [ ] A persistent deployment check is read-only unless the user approves a
    write.
  - [ ] Do not replace a blocked smoke with a mock production claim.
- [ ] **Task 4.3: Write the final pilot report.**
  - [ ] Report the exact node enabled in each app.
  - [ ] Report KST and SRS effects for each app.
  - [ ] State that course-wide readiness is not complete.
  - [ ] Link the three rollout plans.
  - [ ] Record any authorized smoke that did not run.
- [ ] **Task 4.4: Measure - User Manual Verification 'Phase 4: Generated Facts and Closeout' (Protocol in `measure/workflow.md`).**
