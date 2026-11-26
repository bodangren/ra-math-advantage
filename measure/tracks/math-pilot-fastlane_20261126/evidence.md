# Pilot Evidence

Planning base: `9be40b4b`. The PM amendment of 2026-11-26 establishes the unified-app pilot scope.
This file contains no implementation or deployment result yet.

## P1: IM3 readiness

Record the quadratic-formula decision and seed references.
Record failure classifications, exact remaining keys, debt references, and gate logs.

### T1.1 decision

Decision: restore the quadratic-formula backend. `convex/seed/seed_lesson_1_6.ts:127,160,193`
seeds three Lesson 1.6 activities with `componentKey: "step-by-step-solver"` and
`problemType: "quadratic-formula"`. Its `buildIm3QuadraticFormulaDraftDocuments` helper
also creates draft activity and practice-variant records with `componentKey: "quadratic-formula"`.
`__tests__/convex/seed/seed-lesson-1-6.test.ts:313-322` verifies those records and their
private generator metadata. The seeded student lesson therefore depends on the quadratic-formula
activity path. The route handlers call `startQuadraticFormulaAttempt`,
`getQuadraticFormulaAttempt`, and `checkQuadraticFormulaDiscriminant`, but the current
`convex/activities.ts` exports none of these functions. The registry also lacks the
`quadratic-formula` registration, while `__tests__/lib/activities/registry.test.ts:94-95`
requires it.

Red test evidence: from `apps/integrated-math-3`, run
`npm test -- --run __tests__/convex/quadratic-formula-registered-functions.test.ts __tests__/lib/activities/registry.test.ts`
through `/home/daniebo/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`. The command exited 1.
The three Convex export checks failed because each function export was undefined. The registry
check failed because `"quadratic-formula"` was absent. The other 8 checks passed.
The failing-first test commit is `e362e70e`.

#### T1.1 Green result

Branch: restore. Green restored the quadratic-formula backend from `8142bd70^`.

Restored code:

- `convex/activities.ts` exports `getQuadraticFormulaAttempt`, `startQuadraticFormulaAttempt`, and
  `checkQuadraticFormulaDiscriminant`. Each function declares the arguments and the return value
  that the two route handlers call.
- `lib/activities/server-grading.ts` exports `IM3_QF_NODE`, `IM3_QF_DRAFT_MAPPINGS`,
  `IM3_QF_VARIANT_SCHEDULES`, `quadraticFormulaVariantKey`, `quadraticFormulaPublicProps`, and
  `checkServerOwnedQuadraticDiscriminant`. The function `gradeServerOwnedSubmission` now grades a
  quadratic-formula activity from its private generator seed.
- `convex/schema.ts` adds the optional field `allocatedVariantKey` to `activity_submissions`.
- `lib/activities/registry.ts` registers `quadratic-formula` with the shared
  `QuadraticFormulaActivity` component.

The Convex runtime keeps the declared validators private. The helper
`withDeclaredValidators` keeps them on the export, so a test can read the declared contract.

Green command: from `apps/integrated-math-3`, run
`npm test -- --run __tests__/convex/quadratic-formula-registered-functions.test.ts __tests__/lib/activities/registry.test.ts`
through `/home/daniebo/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`. The command exited 0 with
12 passing checks. The implementation commit is `e74a71b6`.

Seed evidence: the restore branch holds because Lesson 1.6 seeds three activities with
`problemType: "quadratic-formula"` at `convex/seed/seed_lesson_1_6.ts:127,160,193`. The graph node
`math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations` declares the renderer
`step-by-step-solver` in `curriculum/skill-graph/nodes.json`. The test
`__tests__/curriculum/lesson-1-6-binding-projection.test.ts:30` expects the renderer
`math.im3.renderer.quadratic-formula`.

Typecheck comparison: the baseline log
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/s4/typecheck-integrated-math-3.log` holds 51
diagnostic keys. The new log holds 32 keys, and every key is in a test file. The three runtime
route keys and 16 test keys are fixed. No new key exists.

Gate results: `gates.sh lint green`, `gates.sh test green`, and `gates.sh checks-all green` each
reported `NEWFAIL=0` against the S4 baseline. The gate logs are under
`measure/runs/math-pilot-fastlane_20261126/gates/green/`.

Remaining known failures: Green did not restore the seed helper `upsertIm3QuadraticFormulaDrafts`
and did not restore the server-owned writer branch for quadratic-formula submissions. Both change
seeds or answer grading, so each one needs its own Red then Green pair in task T1.2. Because of
that, the seed creates no `quadratic-formula` activity and no practice-variant records. The tests
`__tests__/convex/quadratic-formula-allocation.test.ts` and
`__tests__/convex/quadratic-formula-server-writer.test.ts` fail on that missing seed data. The
tests `__tests__/lib/activities/server-grading-quadratic-formula.test.ts` build an equation without
the ` = 0` suffix that the production props carry, so two of its three checks fail. Every one of
these failures also exists in the S4 baseline.

### T1.4 IM2 CI invocation

The root command `npm run curriculum:check` failed because the script exists only in the IM2 workspace.
The CI step now calls `npm run curriculum:check --workspace=apps/integrated-math-2`.
`node scripts/validate-ci.mjs` exited 0.
`npm run curriculum:check --workspace=apps/integrated-math-2` exited 0 after it checked 96 source lessons and 180 class periods.

## P2: Unified base

Record the move references, preserved history, course schema, route map, graph mapping, and P1 gate comparison.

## P3: Glossary

Record the term inventory, lookup and lesson matching evidence, review file path, and PM handoff.

## P4: Stage A deployment

Record the production target, curriculum query, build commit, RSC marker result, Worker version, URL, and smoke test.

## P5: Precalculus and Stage B deployment

Record the source inventory, schema and function mapping, tests, glossary extension, and Stage A data preservation.
Record both course smoke tests on the same URL.

## P6: Teacher path

Record the class flow, applicable tests, and combined Review A+B result.

## P7: Hardening

Record the seed test, network log, external dependencies, notation tests, and combined Review A+B result.

## P8: Class load and data

Record the target, network route, class size, p95 save time, limit errors, gradebook result, export and deletion proof for each course.
Record the data note and school terms status.
Record the teacher-ready IM3 milestone and the both-courses-live milestone separately.

## P9: Repository and release

### T9.1 Publisher PDF tracking

Green-only phase base: `7732f580c5421ce185ffae035922dc3d8a207e0c`. Role base: `7732f580c5421ce185ffae035922dc3d8a207e0c`. No Red commit applies to T1.4 or T9.1.

The inventory held 147 tracked PDFs. Git removed 33 publisher PDFs from tracking. Git kept 114 runtime PDFs.
The exact-path search found provenance references in curriculum graph data. It found no build or validation script that opens a publisher PDF.
The AP Precalculus source-inventory test checked three local Passwater PDFs. It now skips that check when any source PDF is absent.
The root `.gitignore` rule `/apps/*/curriculum/**/*.pdf` covers each removed publisher PDF. It does not cover runtime PDFs under `public/`.

Removed publisher PDFs (33):

- `apps/integrated-math-1/curriculum/reveal-math-2020-integrated-i.pdf`
- `apps/integrated-math-2/curriculum/Module 1 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 10-1 to 10-4 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 10-5 to 10-7 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 11 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 12-1 to 12-4 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 12-15 to 12-10 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 13 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 2 PRoblem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 3 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 4 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 5 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 6-1 to 6-5 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 6-6 to 6-9 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 7 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 8-1 to 8-4 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 8-5 to 8-7 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 9-1 to 9-2 Problem Types.pdf`
- `apps/integrated-math-2/curriculum/Module 9-3 to 9-8 Problem Types.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-2.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-3.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-4.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-5.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-6.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-7.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-8.pdf`
- `apps/integrated-math-3/curriculum/IM3-reveal-module-9.pdf`
- `apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf`
- `apps/pre-calculus/curriculum/APPC  Unit 2 Passwater.pdf`
- `apps/pre-calculus/curriculum/APPC  Unit 3 Passwater.pdf`
- `apps/pre-calculus/curriculum/source/originals/ap-precalculus-ced-clarification-and-guidance.pdf`
- `apps/pre-calculus/curriculum/source/originals/ap-precalculus-course-and-exam-description.pdf`

Kept runtime PDFs (114):

BM2 public PDFs (18): `apps/bus-math-v2/lib/server/lesson-assets.ts` imports these files into the server bundle. `apps/bus-math-v2/app/api/pdfs/[pdfName]/route.ts` serves them to signed-in users.

- `apps/bus-math-v2/public/pdfs/capstone_business_plan_guide.pdf`
- `apps/bus-math-v2/public/pdfs/capstone_model_tour_checklist.pdf`
- `apps/bus-math-v2/public/pdfs/capstone_pitch_rubric.pdf`
- `apps/bus-math-v2/public/pdfs/unit_01_foundational_build_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_01_polish_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_01_presentation_rubric.pdf`
- `apps/bus-math-v2/public/pdfs/unit_05_foundation_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_05_polish_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_05_presentation_rubric.pdf`
- `apps/bus-math-v2/public/pdfs/unit_06_foundation_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_06_polish_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_06_presentation_rubric.pdf`
- `apps/bus-math-v2/public/pdfs/unit_07_foundation_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_07_polish_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_07_presentation_rubric.pdf`
- `apps/bus-math-v2/public/pdfs/unit_08_foundation_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_08_polish_guide.pdf`
- `apps/bus-math-v2/public/pdfs/unit_08_presentation_rubric.pdf`

IM2 worksheet PDFs (96): `apps/integrated-math-2/app/student/lessons/[slug]/page.tsx` links each lesson to its worksheet. `apps/integrated-math-2/__tests__/curriculum/curriculum-depth.test.ts` requires each worksheet.

- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0101_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0102_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0103_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0104_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0105_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0106_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0107_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0201_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0202_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0203_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0204_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0205_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0206_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0301_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0302_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0303_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0304_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0305_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0306_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0401_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0402_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0403_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0404_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0405_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0406_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0407_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0408_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0501_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0502_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0503_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0504_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0505_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0506_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0507_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0508_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0601_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0602_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0603_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0604_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0605_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0606_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0607_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0608_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0609_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0701_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0702_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0703_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0704_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0705_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0706_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0707_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0708_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0801_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0802_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0803_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0804_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0805_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0806_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0807_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0901_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0902_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0903_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0904_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0905_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0906_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0907_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0908_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_0909_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1001_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1002_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1003_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1004_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1005_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1006_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1007_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1101_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1102_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1103_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1104_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1105_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1106_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1107_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1201_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1202_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1203_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1204_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1205_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1206_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1207_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1208_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1209_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1301_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1302_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1303_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1304_practice.pdf`
- `apps/integrated-math-2/public/curriculum/worksheets/Int2_1305_practice.pdf`

Verification after `git rm --cached`:

- `git ls-files "*.pdf"` returned 114 paths.
- All 147 inventory paths existed on disk.
- None of the 33 removed paths remained tracked.
- `git check-ignore -v` matched the new root rule for root-level and nested curriculum PDFs.
- The targeted AP Precalculus source-inventory test passed 4 tests.

The scripts suite ran because T9.1 changes a test. It exited 1 with 27 pre-existing failures in two files. `vinext-oxc-gates-script.test.ts` expects an archived gates script. `remediate-concept-blueprints.test.ts` expects an IM3 activity-map file absent at the phase base.

Record PDF tracking and CI checks, CI minutes, and the visibility decision.
Record the signed synthetic rehearsal checklist, the release URL, and the acceptance result.
Record Daniel's real class decision separately.
Record the pulled scope and remaining work for the original set and deployment tracks.

## Gate logs and checkpoints

Record commands, log paths, comparison baselines, task commits, and phase checkpoint SHAs here.
