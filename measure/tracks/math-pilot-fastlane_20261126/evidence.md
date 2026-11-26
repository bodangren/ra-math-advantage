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

Record PDF tracking and CI checks, CI minutes, and the visibility decision.
Record the signed synthetic rehearsal checklist, the release URL, and the acceptance result.
Record Daniel's real class decision separately.
Record the pulled scope and remaining work for the original set and deployment tracks.

## Gate logs and checkpoints

Record commands, log paths, comparison baselines, task commits, and phase checkpoint SHAs here.
