# IM3 seed orchestrator repair scope

## Status

This document defines the accepted two-file repair scope.

The baseline commit is `fc78b5172e5b9e0d65e6e770f28729c7e5ef6f53`.

The candidate is `/tmp/im3-lesson18-recovery-v6l3h06f`.

Both scoped candidate paths are byte-equal to the baseline.

No source file changed during this review.

No local or remote Convex data changed during this review.

## Problem

`apps/integrated-math-3/convex/seed.ts` uses this alias:

```ts
const seedInternal = (internal as any).seed;
```

The handler then reads short properties such as `seedInternal.seedLesson1`.

Convex converts that property path to `seed:seedLesson1`.

The registered function is `seed/seed_lesson_1_1:seedLesson1`.

The same defect affects all 67 mutation references that the orchestrator uses.

The existing test creates local data objects. It does not execute the registered `seedAll` handler. It does not inspect a Convex function reference. Thus, it cannot detect this defect.

## Read-only proof

The installed Convex runtime gives these names:

```text
getFunctionName(internal.seed.seedLesson1)
  = seed:seedLesson1

getFunctionName(internal.seed.seed_lesson_1_1.seedLesson1)
  = seed/seed_lesson_1_1:seedLesson1

getFunctionName(internal.seed.seed_standards.seedStandards)
  = seed/seed_standards:seedStandards

getFunctionName(internal.seed.seed_objective_policies.seedObjectivePolicies)
  = seed/seed_objective_policies:seedObjectivePolicies
```

The generated API declares the registered modules from `seed/seed_lesson_1_1` through `seed/seed_lesson_9_7`. It also declares the standards, policy, family, item, lesson-standard, and demo modules that the handler calls.

The dirty main checkout contains a useful explicit mapping. The repair can reuse only the 67 registered references from that mapping after comparison with the generated API. The dirty checkout also contains `seedIm3Pilot` and an extra handler call. The committed baseline has no `seed_im3_pilot` module. The repair must exclude both pilot changes.

## Exact path scope

Change only these two existing paths:

1. `apps/integrated-math-3/convex/seed.ts`
2. `apps/integrated-math-3/__tests__/convex/seed/seed.test.ts`

Do not change generated API files.

Do not add a seed module.

Do not add pilot logic.

Do not change seed order, error handling, result construction, lesson data, or demo data.

## Test-first change

Add one handler regression to the existing seed test before the production repair.

Import `seedAll` from the real orchestrator.

Import `getFunctionName` from `convex/server`.

Call the real `seedAll._handler` with a small `runMutation` stub.

The stub must call `getFunctionName` for each received function reference. It must return an empty array for `seed/seed_standards:seedStandards` and the nine lesson-standard calls. It can return `undefined` for the other calls.

Assert the complete ordered list of 67 registered function names. This assertion must include:

- `seed/seed_standards:seedStandards`
- all 52 lesson functions in curriculum order
- all 9 functions in `seed/seed_lesson_standards`
- `seed/seed_objective_policies:seedObjectivePolicies`
- `seed/seed_problem_families:seedProblemFamilies`
- `seed/seed_practice_items:seedPracticeItems`
- `seed/seed_demo_env:seedDemoEnv`
- `seed/seed_demo_progress:seedDemoProgress`

The initial test must fail because the handler supplies names such as `seed:seedStandards` and `seed:seedLesson1`.

This handler test is stronger than an export-existence test. It checks every reference that the registered orchestrator passes to `ctx.runMutation`. It also keeps the current call order under test.

## Minimum production repair

Replace the broad `any` alias with one explicit object of typed generated references.

Map each existing property to its registered module and function:

- `seedStandards` to `internal.seed.seed_standards.seedStandards`
- lesson functions to their matching `internal.seed.seed_lesson_<module>_<lesson>` module
- all nine lesson-standard properties to `internal.seed.seed_lesson_standards`
- `seedObjectivePolicies` to `internal.seed.seed_objective_policies.seedObjectivePolicies`
- `seedProblemFamilies` to `internal.seed.seed_problem_families.seedProblemFamilies`
- `seedPracticeItems` to `internal.seed.seed_practice_items.seedPracticeItems`
- `seedDemoEnv` to `internal.seed.seed_demo_env.seedDemoEnv`
- `seedDemoProgress` to `internal.seed.seed_demo_progress.seedDemoProgress`

Remove the obsolete `no-explicit-any` suppression with the alias.

Do not change the handler body.

Do not add `seedIm3Pilot` to the object.

## Verification after implementation

Run the focused seed test first.

Run the applicable IM3 seed tests after the focused test passes.

Run IM3 lint.

Run the IM3 build.

Run a separate post-build TypeScript check with `npx tsc --noEmit`.

Freeze a standard repository-relative patch against the accepted baseline. Freeze an exact two-path list and a test report. Do not deploy or run the seed as part of this two-file source repair.

## Acceptance conditions

The repair is acceptable when all conditions are true:

- The failing handler regression proves the old short paths.
- The handler sends all 67 exact registered names after the repair.
- The handler call order does not change.
- The production diff only replaces the reference mapping.
- The test diff only adds the real handler regression and required imports.
- No pilot module or pilot call appears.
- The two candidate paths were clean against the accepted baseline before implementation.
- The required tests and application gates pass.
