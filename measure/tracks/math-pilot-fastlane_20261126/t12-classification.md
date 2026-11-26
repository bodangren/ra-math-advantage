# T1.2 IM3 Test Failure Classification

Track: `math-pilot-fastlane_20261126`. Phase: Phase P1: IM3 master green. Lane: light.

Immutable `phase_base_sha`: `7732f580c5421ce185ffae035922dc3d8a207e0c`.
Role `role_base_sha`: `344e6569b2b468a53e9511eaa6e54424932e321b`.
Green HEAD for this classification: `344e6569b2b468a53e9511eaa6e54424932e321b`.

This file holds the classification of the IM3 test failures and the IM3 typecheck diagnostics.
It holds no production change. It does not close T1.2 or T1.3.

## Commands and logs

Both commands ran through `/home/daniebo/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`.

| Command | Log | Exit |
|---|---|---|
| `CI=true npm run test --workspace=apps/integrated-math-3` | `measure/runs/math-pilot-fastlane_20261126/gates/p1-classify/test-integrated-math-3.log` | 1 |
| `npm run typecheck --workspace=apps/integrated-math-3` | `measure/runs/math-pilot-fastlane_20261126/gates/p1-classify/typecheck-integrated-math-3.log` | 1 |

The test run started at 02:37 UTC and ended at 02:45 UTC. The run did not overlap 00:00 to 01:00 UTC.

## Baseline comparison

The baseline is `measure/runs/openrouter-sdk-ai-layer_20261114/gates/s4/test-integrated-math-3.log`.

| Measure | S4 baseline | Current HEAD | Change |
|---|---|---|---|
| Failed test files | 37 | 36 | -1 |
| Failed tests | 218 | 215 | -3 |
| Unique failure keys | 214 | 211 | -3 |
| New failure keys | - | 0 | - |

Three keys are fixed by the T1.1 restore commit `e74a71b6`:

- `__tests__/lib/activities/registry.test.ts > registry > registers the shared quadratic-formula activity`
- `__tests__/convex/quadratic-formula-allocation.test.ts > quadratic-formula immutable allocation > keeps exact finite keys and seeds`
- `__tests__/lib/activities/server-grading-quadratic-formula.test.ts > draft quadratic-formula server grading > rejects public equations that do not match the private seed`

No new failure key exists. The gate key set stays inside the S4 baseline.

## Class rules

- `pilot-path`: the failure sits on a pilot path. The pilot paths are login, session, student
  lessons, quiz, step solver, daily queue, teacher dashboard, gradebook, classes, lesson
  assignment, CSV export, and the quadratic-formula Lesson 1.6.
- `non-pilot`: the failure sits outside the pilot paths.
- `stale-test`: the test asserts an old contract. The commit that changed the contract is named.

A file can hold failures of two classes. The class column names the dominant class.
The `T1.2a` column names the failures that the T1.2a restore fixes.

## Failure table

| Test file | Failures | Root cause | Class | Group | T1.2a |
|---|---|---|---|---|---|
| `__tests__/convex/quadratic-formula-server-writer.test.ts` | 58 | The seed helper `buildIm3QuadraticFormulaDraftDocuments` and `upsertIm3QuadraticFormulaDrafts` do not exist, and the server-owned writer branch is absent. | pilot-path | G1 | yes |
| `__tests__/convex/quadratic-formula-allocation.test.ts` | 35 | The seed helper `upsertIm3QuadraticFormulaDrafts` does not exist, so no allocation row is written. | pilot-path | G1 | yes |
| `__tests__/convex/learningEvidence-submission-authority.red.test.ts` | 12 | The server-owned submission handler does not persist the server grade, the mastery effect, or the receipt. | pilot-path | G2 | yes |
| `curriculum/skill-graph/__tests__/module-1-integration.test.ts` | 11 | The stored Module 1 activity and SRS rows do not match the node catalog. Commit `9d1afd4d` changed the stored pilot eligibility. | stale-test | G7 | no |
| `__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx` | 7 | `PhaseRendererProps` has no `quadraticFormulaAttempt` prop and `@/lib/activities/submission` has no `checkQuadraticFormulaDiscriminant`. | pilot-path | G3 | no |
| `__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx` | 6 | `ActivityRendererProps` has no `pendingSubmissionId` and no `attemptOrdinal` prop, so the quadratic-formula card renders no answer field. | pilot-path | G3 | no |
| `__tests__/app/api/activities/submissions/route.test.ts` | 6 | The route returns HTTP 400 for the exact raw answer envelope and for the idempotency conflict sentinel. | pilot-path | G4 | no |
| `__tests__/curriculum/lesson-1-6-binding-projection.test.ts` | 5 | The seed helper `buildIm3QuadraticFormulaDraftDocuments` does not exist, and the graph node still names the renderer `step-by-step-solver` instead of `quadratic-formula`. | pilot-path | G1 | yes |
| `__tests__/convex/seed/seed-lesson-1-6.test.ts` | 5 | The seed helper `buildIm3QuadraticFormulaDraftDocuments` does not exist, and the Lesson 1.6 worked examples and quiz document do not match the current seed. | pilot-path | G1 | yes |
| `__tests__/components/activities/graphing/GraphingExplorer.test.tsx` | 5 | The shared component writes the answer keys `placed_points` and `table_values`. Commit `2c40e557` moved the component into `packages/activity-components` with these keys. The test expects `placedPoints` and `tableValues`. | stale-test | G6 | no |
| `__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts` | 8 | The seed throws "Lesson 1.1 has no published version". Commit `ee844bab` added that rule. The test fixture has no published version. | stale-test | G5 | no |
| `__tests__/lib/activities/quadratic-formula-check.test.ts` | 8 | `@/lib/activities/submission` has no `checkQuadraticFormulaDiscriminant` export, so the Guided check has no client helper. | pilot-path | G3 | yes |
| `__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx` | 4 | The shared schema has no `problemType` value `system`. Commit `2c40e557` set the shared `PROBLEM_TYPES` list. | stale-test | G6 | no |
| `__tests__/convex/learningEvidence-production-factory.red.test.ts` | 4 | The server-owned submission handler does not persist the production metadata, the SRS card, or the review. | pilot-path | G2 | yes |
| `__tests__/app/api/activities/submissions/selected-route.test.ts` | 3 | The route returns HTTP 400 for the exact quiz envelope, and the Lesson 1.6 quiz receipt selector is absent. | pilot-path | G4 | no |
| `__tests__/convex/queue/im3-pilot-queue.test.ts` | 3 | The resolved daily queue does not add the pilot identity to the queue item props. | pilot-path | G8 | no |
| `__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts` | 2 | The shared schema has no `problemType` value `system`. Commit `2c40e557` set the shared `PROBLEM_TYPES` list. | stale-test | G6 | no |
| `__tests__/components/activities/algebraic/StepByStepper.test.tsx` | 2 | The shared `StepByStepper` has no `showInitialProblem` prop. Commit `2c40e557` removed that prop. | stale-test | G6 | no |
| `__tests__/components/activities/graphing/InteractiveTableOfValues.test.tsx` | 2 | The deferred assessment mode calls `onComplete` on every value change. The test expects one call. | stale-test | G6 | no |
| `__tests__/convex/seed/seed.test.ts` | 2 | The seed text is now "Choose x = -2." (commit `8142bd70`), and the registered seed mutation list holds 68 entries, not 67. | stale-test | G5 | no |
| `__tests__/curriculum/lesson-1-6-discriminant-source.test.ts` | 2 | The Lesson 1.6 discriminant source records do not match the current node catalog. | non-pilot | G7 | no |
| `__tests__/curriculum/lesson-1-8-reconciliation.test.ts` | 2 | The Lesson 1.8 catalog records do not match the stored records. | non-pilot | G7 | no |
| `__tests__/convex/seed/domain-range-worked-phase-link.test.ts` | 2 | The test mock has no `take` method, and the test expects the error "Lesson 1.1 Phase 4 is missing". The helper `linkIm3DomainRangeWorkedPhase` in `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts` calls `take(2)` and throws "Lesson 1.1 Worked Phase 4 must be unique". Commit `8142bd70` added that helper form. | stale-test | G5 | no |
| `__tests__/lib/activities/server-grading-quadratic-formula.test.ts` | 2 | The private seed mapping now exists, and the grading path rejects the test equation because the private seed mapping is not complete. | pilot-path | G3 | yes |
| `__tests__/convex/exports-authorization.test.ts` | 1 | The submission export returns a newer pending allocation. The export must drop pending rows before it sorts and limits the finalized rows. | pilot-path | G8 | no |
| `__tests__/convex/learningEvidence-attempt-ordering.red.test.ts` | 1 | The opaque submission store accepts a reused attempt ordinal after more than 1000 accepted rows. | pilot-path | G2 | yes |
| `__tests__/convex/learningEvidence-bounded-authority.red.test.ts` | 1 | The opaque submission store accepts a duplicate attempt ordinal after 1001 rows. | pilot-path | G2 | yes |
| `__tests__/convex/activities-server-owned-recovery.red.test.ts` | 1 | The server-owned handler returns "Inactive student identity" before it checks the pilot activity metadata. | pilot-path | G2 | yes |
| `__tests__/convex/seed/seed-practice-items-idempotence.test.ts` | 1 | A practice item keeps an empty `practiceItemId` after a second seed run. | pilot-path | G5 | no |
| `__tests__/components/activities/graphing/GraphingExplorerActivity-pilot.test.tsx` | 1 | The deferred envelope holds the keys `placed_points` and `table_values`. The test expects `placedPoints` and `tableValues`. | stale-test | G6 | no |
| `__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx` | 1 | The placeholder reads "This activity is not available." Commit `0605917c` changed the text. The test expects "is not yet available". | stale-test | G6 | no |
| `__tests__/components/student/PracticeCardRenderer.test.tsx` | 1 | The placeholder reads "This activity is not available." and no longer names the component key. Commit `0605917c` changed the text. | stale-test | G6 | no |
| `__tests__/lib/activities/schemas/fill-in-the-blank.schema.test.ts` | 1 | The shared schema makes `correctAnswer` optional, so a blank answer passes. | stale-test | G6 | no |
| `__tests__/curriculum/lesson-1-6-worked-source.test.ts` | 1 | The Lesson 1.6 Worked source record does not match the current catalog. | non-pilot | G7 | no |
| `curriculum/skill-graph/__tests__/lesson-1-1-reconciliation.test.ts` | 7 | The stored SRS eligibility flags are false. Commit `9d1afd4d` aligned the stored pilot eligibility with the approval gate. | stale-test | G7 | no |
| `curriculum/skill-graph/__tests__/pilot-projection.test.ts` | 2 | The runtime projection reports no renderer-ready props for the graph quadratic modalities. Commit `9d1afd4d` changed the stored eligibility. | stale-test | G7 | no |

The table holds 36 test files and 215 failing tests. The counts match the current test log.

## Class totals

| Class | Files | Failing tests |
|---|---|---|
| pilot-path | 18 | 159 |
| stale-test | 15 | 51 |
| non-pilot | 3 | 5 |

The `T1.2a` column marks 132 failing tests in 11 files. T1.2a restores the quadratic-formula
seed helper and the server-owned writer.

## Fix groups

### G1 — Quadratic-formula seed helper

Files: `__tests__/convex/quadratic-formula-server-writer.test.ts` (58),
`__tests__/convex/quadratic-formula-allocation.test.ts` (35),
`__tests__/curriculum/lesson-1-6-binding-projection.test.ts` (5),
`__tests__/convex/seed/seed-lesson-1-6.test.ts` (5).

Fix: restore `buildIm3QuadraticFormulaDraftDocuments` and `upsertIm3QuadraticFormulaDrafts` into
`apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts` from `8142bd70^`, and name the renderer
`quadratic-formula` in the Lesson 1.6 graph node.

Risk: sensitive. The change touches seeds and the lesson binding. It needs Red then Green.

Owner: T1.2a.

### G2 — Server-owned submission writer

Files: `__tests__/convex/learningEvidence-submission-authority.red.test.ts` (12),
`__tests__/convex/learningEvidence-production-factory.red.test.ts` (4),
`__tests__/convex/learningEvidence-attempt-ordering.red.test.ts` (1),
`__tests__/convex/learningEvidence-bounded-authority.red.test.ts` (1),
`__tests__/convex/activities-server-owned-recovery.red.test.ts` (1).

Fix: restore the server-owned submission handler from `8142bd70^`. The handler must keep the
attempt ordinal authority in the opaque store, apply the mastery effect after the teacher
exposure, and return the stored receipt on a replay.

Risk: sensitive. The change touches grading and the SRS effect. It needs Red then Green.

Owner: T1.2a.

### G3 — Quadratic-formula client surface

Files: `__tests__/lib/activities/quadratic-formula-check.test.ts` (8),
`__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx` (7),
`__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx` (6),
`__tests__/lib/activities/server-grading-quadratic-formula.test.ts` (2).

Fix: export `checkQuadraticFormulaDiscriminant` from `apps/integrated-math-3/lib/activities/submission.ts`.
Add the `pendingSubmissionId` and `attemptOrdinal` props to `ActivityRendererProps` and the
`quadraticFormulaAttempt` prop to `PhaseRendererProps`. Complete the private seed mapping of the
server grading helper.

Risk: sensitive. The change touches the student answer path and grading. It needs Red then Green.
The files `__tests__/lib/activities/quadratic-formula-check.test.ts` and
`__tests__/lib/activities/server-grading-quadratic-formula.test.ts` depend on T1.2a and stay
blocked until that restore lands.

### G4 — Student submission API

Files: `__tests__/app/api/activities/submissions/route.test.ts` (6),
`__tests__/app/api/activities/submissions/selected-route.test.ts` (3).

Fix: accept the exact raw answer envelope in `POST /api/activities/submissions`, map the exact
idempotency conflict sentinel to HTTP 409, and add the Lesson 1.6 quiz receipt selector.

Risk: sensitive. The change touches grading and the idempotency contract. It needs Red then Green.

### G5 — Seed contract and seed test drift

Files: `__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts` (8),
`__tests__/convex/seed/seed.test.ts` (2),
`__tests__/convex/seed/domain-range-worked-phase-link.test.ts` (2),
`__tests__/convex/seed/seed-practice-items-idempotence.test.ts` (1).

Fix: update the test fixture to publish a lesson version, update the seed text and the seed
mutation count, add the `take` method to the test mock, and give each practice item a stable
`practiceItemId`.

Risk: sensitive for the seed behaviour. The test edits need Red then Green on the seed change.
The fixture and count edits need only the Green phase.

### G6 — Shared component contract drift

Files: `__tests__/components/activities/graphing/GraphingExplorer.test.tsx` (5),
`__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx` (4),
`__tests__/components/activities/algebraic/StepByStepper.test.tsx` (2),
`__tests__/components/activities/graphing/InteractiveTableOfValues.test.tsx` (2),
`__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts` (2),
`__tests__/components/activities/graphing/GraphingExplorerActivity-pilot.test.tsx` (1),
`__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx` (1),
`__tests__/components/student/PracticeCardRenderer.test.tsx` (1),
`__tests__/lib/activities/schemas/fill-in-the-blank.schema.test.ts` (1).

Fix: update each test to the current contract. The contracts changed in these commits:

- `2c40e557` (2026-09-17) moved the algebra and graphing components into
  `packages/activity-components`. That commit removed the `showInitialProblem` prop, set the
  shared `PROBLEM_TYPES` list without `system`, and set the snake case answer keys.
- `0605917c` (2026-09-08) set the placeholder text to "This activity is not available.".

Keep each valid behavior assertion. Change only the assertion that names the old contract.

Risk: low. The change touches no seed, no grade, and no account. It needs the Green phase.

### G7 — Curriculum graph projections

Files: `curriculum/skill-graph/__tests__/module-1-integration.test.ts` (11),
`curriculum/skill-graph/__tests__/lesson-1-1-reconciliation.test.ts` (7),
`curriculum/skill-graph/__tests__/pilot-projection.test.ts` (2),
`__tests__/curriculum/lesson-1-6-discriminant-source.test.ts` (2),
`__tests__/curriculum/lesson-1-8-reconciliation.test.ts` (2),
`__tests__/curriculum/lesson-1-6-worked-source.test.ts` (1).

Fix: align the node catalogs and the projection with the stored records, or prove that the old
contract still applies. Commit `9d1afd4d` (2026-09-09) aligned the stored pilot eligibility with
the approval gate. Commit `8142bd70` (2026-09-17) changed the node catalogs.

Risk: medium. The change touches the curriculum content. The pilot does not use these
projections, so the group stays out of the pilot path.

### G8 — Daily queue and CSV export

Files: `__tests__/convex/queue/im3-pilot-queue.test.ts` (3),
`__tests__/convex/exports-authorization.test.ts` (1).

Fix: add the pilot identity to the resolved queue item props in the daily queue, and drop the
pending allocations in the submission export query before it sorts and limits the rows.

Risk: sensitive. The change touches the daily queue and the export scope. It needs Red then Green.

## Excluded failure

The known UTC-day flake in `__tests__/convex/queue/sessions.test.ts` stays excluded. It fails only
between 00:00 and 01:00 UTC. The current run ran from 02:37 UTC to 02:45 UTC. The file holds no
failure in the current log. The row stays open in `measure/tech-debt.md`.

## T1.3 IM3 typecheck

The typecheck ran once through `heavy-run.sh`. The log holds 30 diagnostic lines and 27 unique
diagnostic keys. Every key sits in a test file. The command exited 1.

The T1.2a role wrote `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts` at 09:45:20. The
typecheck ran from 09:45:19 to 09:45:34. That write landed inside the run. The stored log
therefore does not hold the 5 keys for the seed helper exports.

The clean HEAD set holds 32 keys. The cross check is the T1.1 Green log
`measure/runs/math-pilot-fastlane_20261126/gates/green/checks-all/run.n9SmcXfe/typecheck-apps-integrated-math-3.log`.
It holds the same 32 keys and no runtime key. It ran the same committed code as HEAD for every
file it covers.

| File | Keys | Class |
|---|---|---|
| `__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx` | 9 | test |
| `__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx` | 6 | test |
| `__tests__/curriculum/lesson-1-6-binding-projection.test.ts` | 4 | test |
| `__tests__/convex/quadratic-formula-server-writer.test.ts` | 3 | test |
| `__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx` | 3 | test |
| `__tests__/convex/quadratic-formula-allocation.test.ts` | 1 | test |
| `__tests__/convex/seed/seed-lesson-1-6.test.ts` | 1 | test |
| `__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts` | 1 | test |
| `__tests__/lib/activities/schemas/index.test.ts` | 1 | test |
| `__tests__/lib/activities/quadratic-formula-check.test.ts` | 1 | test |
| `__tests__/curriculum/lesson-1-8-reconciliation.test.ts` | 1 | test |
| `__tests__/components/activities/algebraic/StepByStepper.test.tsx` | 1 | test |

The S4 baseline holds 51 keys. It holds 3 runtime keys and 48 test keys.

| Measure | S4 baseline | Clean HEAD | Stored log |
|---|---|---|---|
| Diagnostic keys | 51 | 32 | 27 |
| Runtime keys | 3 | 0 | 0 |
| Test keys | 48 | 32 | 27 |
| New keys | - | 0 | 0 |

The 5 keys that the stored log does not hold are the seed helper keys. The T1.2a restore adds the
exports, so a typecheck of the T1.2a working tree does not report them.

- `__tests__/convex/quadratic-formula-allocation.test.ts` — `upsertIm3QuadraticFormulaDrafts`
- `__tests__/convex/quadratic-formula-server-writer.test.ts` — `buildIm3QuadraticFormulaDraftDocuments`
- `__tests__/convex/quadratic-formula-server-writer.test.ts` — `upsertIm3QuadraticFormulaDrafts`
- `__tests__/convex/seed/seed-lesson-1-6.test.ts` — `buildIm3QuadraticFormulaDraftDocuments`
- `__tests__/curriculum/lesson-1-6-binding-projection.test.ts` — `buildIm3QuadraticFormulaDraftDocuments`

The three runtime keys of the baseline sit in two route files:

- `app/api/activities/quadratic-formula/attempt/route.ts` — `startQuadraticFormulaAttempt` and
  `getQuadraticFormulaAttempt` were not on the `internal.activities` type.
- `app/api/activities/quadratic-formula/check/route.ts` — `checkQuadraticFormulaDiscriminant` was
  not on the `internal.activities` type.

The T1.1 restore commit `e74a71b6` fixed those three keys.

**No runtime diagnostic remains.** No key exists in `app/`, `convex/`, `lib/`, or `components/`.
All 32 remaining keys sit in test files. The runtime part of task T1.3 is met at this HEAD. The
remaining test-file keys stay open as debt until the fix groups land.

The test log of this role is clean at HEAD. The test run ended at 09:45:18. The T1.2a write
landed at 09:45:20, and the log reports the seed helper as absent.

## Remaining disposition

- Pilot-path failures: 159 tests in 18 files. They must pass before the P1 checkpoint.
- Stale-test failures: 51 tests in 15 files. Each test needs an update to the current contract.
- Non-pilot failures: 5 tests in 3 files. They stay open as debt.

T1.2 and T1.3 stay open. This role made no production change and no test change.
