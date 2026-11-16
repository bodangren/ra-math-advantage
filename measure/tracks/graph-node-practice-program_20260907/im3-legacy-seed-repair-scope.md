# IM3 legacy lesson seed repair scope

## Decision

The parent accepts Batch A only. Batch B remains under contract review.

Use direct seed data edits.

Do not add a runtime converter.

Do not widen the Convex schema.

Do not map a domain-specific solver type to a different type.

The saved remote result contains 51 failed lesson transactions and one successful Lesson 1.6 transaction. The 51 recorded first failures are 41 graph `title` fields, two unsupported solver types, two activity-section `props` fields, one graph `equations` field, and five old quiz shapes.

Static inspection shows more failures behind the first rejected write. These hidden failures must be fixed before the seed can be complete.

## Batch A: direct unambiguous seed corrections

Change each failed lesson seed file directly. This is every `seed_lesson_<module>_<lesson>.ts` file except `seed_lesson_1_6.ts`.

Make these mechanical corrections:

- Write only `activityId` and `componentKey` to activity section content.
- Convert all 208 old quiz questions from `question`, `options`, and `correctIndex` to `id`, `type`, `prompt`, `options`, and `correctAnswer`.
- Use a stable one-based question ID.
- Set the old quiz type to `multiple_choice`.
- Select `correctAnswer` from the unchanged option at the original `correctIndex`.
- Add a stable one-based `id` and a required `description` to all 1,079 old solver steps.
- Preserve each step `expression` and `explanation` byte-for-byte.
- Use the existing explanation text as the description. Do not remove the explanation.
- Rename `completing-square` to the existing `completing_the_square` enum value in Lesson 1.5.
- Remove `title` from graph props. Preserve that text through the existing activity `displayName` when it adds information that the phase title does not contain.
- Convert each one-function graph to `equation` and `plot_from_equation`.
- Convert each two-function comparison graph to `equation`, `comparisonEquation`, and `compare_functions`.
- Remove old `features` fields because the current graph component does not consume them.

Preserve all formulas, step explanations, question prompts, options, correct answers, lesson IDs, phase IDs, section order, and activity order.

Lesson 1.6 must remain byte-identical.

Batch A changes 52 existing paths:

- the 51 failed lesson seed files
- `apps/integrated-math-3/__tests__/convex/seed/seed.test.ts`

Do not add `seed/utils.ts` to this batch.

## Batch B: exact solver contract review

Four lesson files contain truthful solver domain tags that the current shared contract excludes:

- `seed_lesson_1_3.ts`: three `simplify_imaginary` activities and five `complex_operations` activities
- `seed_lesson_1_5.ts`: one `vertex-form` activity
- `seed_lesson_1_7.ts`: four `inequality` activities
- `seed_lesson_1_8.ts`: five `system` activities

Lesson 1.8 also stores five systems as two separate equations.

Do not change these tags to `polynomial` or `graphing`.

The current renderer already renders supplied steps. It does not select a solver algorithm from `problemType`. It passes `problemType` to an optional distractor callback and submission metadata. The registry does not supply that callback. Thus, adding exact enum values does not require a new solver algorithm.

Review this minimum shared contract scope before implementation:

- `packages/math-content/src/schemas/step-by-step-solver.schema.ts`
- `packages/math-content/src/__tests__/schemas.test.ts`
- `apps/integrated-math-3/convex/schema.ts`
- `packages/activity-components/src/components/algebraic/StepByStepSolverActivity.tsx`
- the existing focused component test for the solver
- the four affected lesson seed files and their existing seed tests

The likely minimum enum change adds the four exact tags to the shared Zod schema, the Convex validator, and the component type through its existing imported `ProblemType`.

The system equation shape needs a separate exact choice. Prefer explicit `equations: [string, string]` support if the component and submission contract can preserve both equations without joining them. Do not concatenate them into a false single equation. Do not approve this part until its display and submission behavior has a focused test.

Batch B must be accepted before the four affected lesson transactions can pass. Batch A can prepare their unambiguous fields, but it must not claim complete seed success.

## Test-first proof

Add direct source-contract tests before edits.

The test must load the actual 52 lesson modules and run their registered handlers against fresh memory fixtures. It must inspect every activity and section insert. It must enforce the exact current schema fields. It must also compare converted quiz answers and solver text with the source values captured before the change.

The initial test must show the same one-pass and 51-fail boundary, plus the hidden invalid writes after earlier failures are removed.

A narrow memory fixture is not final proof of Convex schema acceptance.

After both batches pass source review, push the accepted source to a disposable local Convex backend. Run `seedAll` from an empty database. Require all 52 lesson results and all 79 lesson-standard results to succeed. Check the stored activity props and minimal activity-section projections. Only then retry the failed remote lesson seeds and their dependent mappings. Preserve the existing test accounts and seeded Lesson 1.6.

## Exclusions

Do not change the production schema to accept old graph, quiz, step, or section shapes.

Do not add a normalization adapter.

Do not change demo-progress behavior or composite practice-item variants in this scope.

Do not deploy or seed while this scope is under review.

Batch A must also map the two graph equation arrays to existing exact contracts: the Lesson 1.8 quadratic/linear pair uses equation, linearEquation, and graph_system; the Lesson 2.1 comparison pair uses equation, comparisonEquation, and compare_functions. Preserve both source strings. Batch A tests must make the four unresolved solver-contract lessons explicit. Do not claim current schema acceptance for them. Use actual handler assertions for the repaired shapes and independent source-diff verification for all preserved text. Do not add generated audit manifests or copy the production schema into a new runtime validator.
