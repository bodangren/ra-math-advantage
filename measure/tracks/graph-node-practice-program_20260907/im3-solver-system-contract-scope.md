# IM3 step-by-step solver contract scope

## Decision

The parent accepts this eleven-file scope after candidate-based independent review. Apply it after Batch A is frozen and its overlapping Lesson 1.8 source is committed.

Use one strict public contract for the app schema, Convex schema, app wrapper, and practice submission builder. Preserve the source-defined problem type. Preserve a system as two equations. Do not convert a system to one equation string.

The IM3 registry uses the app-owned `StepByStepSolverActivity`. This wrapper already passes the installed `generateDistractors` callback from `@math-platform/math-content/algebraic`. Keep this callback. The shared fallback wrapper is not the IM3 runtime path.

## Current mismatch

The shared schema accepts only five problem types:

- `quadratic_formula`
- `factoring`
- `completing_the_square`
- `square_root_property`
- `graphing`

The committed lesson seeds also use these exact values:

- `simplify_imaginary`
- `complex_operations`
- `vertex-form`
- `inequality`
- `system`
- `polynomial`
- `rate_of_change`

Do not rename these stored values in this batch. In particular, do not coerce `vertex-form` to a quadratic type, `inequality` to a linear type, or `system` to a generic fallback. The distractor generator supports its documented types. It can use its existing generic fallback for a truthful problem type that has no specialized distractor function.

The five Lesson 1.8 solver records use `problemType: "system"` and exact two-entry `equations` arrays. They have no `equation` field. The shared schema and app wrapper currently require or default one equation. The wrapper does not display the two source equations. Its builder can therefore submit a fabricated default equation and lose both source equations.

Preserve the current strict step schema. Each step requires `id`, `description`, and `expression`, with optional `explanation`. Batch A supplies these fields without removing the source text. Do not loosen this contract or undo the Batch A normalization.

## Minimum contract

Define and export one `PROBLEM_TYPES` tuple from `packages/math-content/src/schemas/step-by-step-solver.schema.ts`. Include the five current public types and all seven additional exact seed values listed above. Use this tuple for `ProblemType` and the schema.

Use a strict discriminated union by `problemType`:

- For `problemType: "system"`, require `equations` as `{ first: string, second: string }`. The shared schema requires both strings to be nonempty. Do not accept `equation`.
- For every other allowed problem type, require one nonempty `equation`. Do not accept `equations`.
- Both branches accept the same optional `steps` and `hints` fields.

Make `AlgebraicSubmissionInput` the same union. Keep the common activity, mode, attempts, hints, and interaction fields. For a system submission, write the exact ordered `{ first, second }` equations object to `artifact.equations`. Do not write `artifact.equation`. For a non-system submission, write the exact source equation to `artifact.equation`. Do not write `artifact.equations`. Keep the practice.v1 answers and parts unchanged unless a test shows that the existing step response contract requires a correction.

Do not join the two equations with punctuation. Do not select one equation. Do not create a placeholder equation. Do not derive an equation from a solution step.

## Runtime rendering

Update the app-owned `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx`.

Use the shared `ProblemType` and strict equation union. Preserve the current defaults and behavior for ordinary non-system records. A configured system must use only its two supplied equations. It must never receive the default single equation. Do not add a default-prop framework.

For `system`, render a labeled problem block before `StepByStepper`. Render both equations in stored order with the existing KaTeX `InlineMath` renderer. Give the group an accessible label such as `System of equations`. Do not use `steps[0].expression` as the system prompt. Pass the exact two equations to `buildAlgebraicSubmission`.

For all modes, keep the existing steps and `generateDistractors` callback. Pass the truthful stored `problemType` to `StepByStepper`. Do not add solver logic, an adapter, or a new distractor registry.

## Convex storage validator

Update `apps/integrated-math-3/convex/schema.ts` to match the same source contract:

- Add all exact problem-type literals.
- Use a strict logical union for the single-equation and two-equation system shapes.
- Store `equations` as a strict object with `first` and `second` string fields.
- Preserve the strict step fields: required `id`, `description`, and `expression`, with optional `explanation`.

Convex `v.object` rejects unknown fields. Use a native strict `{ first, second }` object so the database enforces the exact cardinality and field types. Convex `v.string()` does not enforce nonempty text. The shared public Zod schema enforces nonempty strings. Do not add a seed-boundary parse for this purpose. In `seed_lesson_1_8.ts`, map each of the five current arrays to this object without changing either equation string or their order. Do not concatenate the strings.


## Exact paths

1. `packages/math-content/src/schemas/step-by-step-solver.schema.ts`
2. `packages/math-content/src/__tests__/schemas.test.ts`
3. `apps/integrated-math-3/convex/schema.ts`
4. `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx`
5. `apps/integrated-math-3/convex/seed/seed_lesson_1_8.ts`
6. `apps/integrated-math-3/__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts`
7. `apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx`
8. `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-8.test.ts`
9. `apps/integrated-math-3/__tests__/convex/seed/seed.test.ts`
10. `packages/activity-components/src/components/algebraic/StepByStepper.tsx`
11. `apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepper.test.tsx`

The app schema file is a re-export. It does not need a change. The app distractor file is also a re-export. It does not need a change. Do not change the shared fallback wrapper because IM3 does not register it. Do not add another file.

## Required tests

Test the shared and app schema through the real re-export. Require every exact stored problem type. Require all other values to fail.

Test one valid non-system record and one valid system record. Require a system to have exactly the nonempty `first` and `second` fields. Reject a missing field and any extra field. Reject `equation` on a system. Reject `equations` on a non-system record. Reject an object that has both fields. Reject missing equation data. Require the current step fields: nonempty `id`, `description`, and `expression`, with optional `explanation`. Reject a step that omits a required field.

In the app wrapper test:

- Render a system in teaching, guided, and practice mode.
- Require both equations in stored order in the accessible `System of equations` group.
- Require no fabricated default equation.
- Require the truthful `system` value to reach the existing distractor callback path.
- Complete a practice interaction. Require `artifact.problemType` to be `system` and `artifact.equations` to equal the ordered `{ first, second }` source object. Require `artifact` not to contain `equation`.
- Repeat the submission check for a single-equation type. Require its exact `artifact.equation` and no `equations` field.

The seed contract test must inspect the actual Lesson 1.3, 1.5, 1.7, and 1.8 handler outputs. Do not copy seed objects into the test. Require each step-by-step activity to parse with the production app schema. Require the exact `simplify_imaginary`, `complex_operations`, `vertex-form`, `inequality`, and `system` values to survive. Require Batch A to use canonical `completing_the_square`. Require all five Lesson 1.8 system activities to retain the two exact equation strings in ordered `{ first, second }` objects and no `equation` field. This is classification and preservation proof. It is not a solver correctness test.

Also scan the current seed handler set through the existing seed-output fixture, or add bounded cases for `polynomial` and `rate_of_change`, so the schema change does not leave the current Convex literals wider than the public runtime contract.

## Verification

Run the new seed contract test, the app schema test, the wrapper test, the activity registry tests, and the shared schema tests. Run all current seed handler tests because the contract changes the real seed validator. Run lint in the IM3 app and the changed shared package. Run both TypeScript checks. Run the IM3 build.

A local Convex seed run must accept all step-by-step records after Batch A and this contract batch are integrated. This proof is separate from unit tests.

## Boundaries

This batch preserves source records and transports them correctly. It does not add a system solver, new grading algorithm, new distractor algorithm, renderer adapter, generic coercion, or fabricated Worked solution.

The five Lesson 1.8 systems include nonlinear systems. The existing distractor function named `system` only changes answer coordinates. Its presence does not prove that each source step is mathematically correct. Keep broader mathematical validation separate.

The ninth path is a direct test dependency from accepted Batch A. Its aggregate handler test asserts the five legacy system arrays. Update that assertion to the exact native equation objects and remove obsolete unresolved wording. Preserve the exact domain-type counts. Parse every stored solver record from all 52 actual handlers with the real shared public schema. This replaces a pending contract check with the implemented contract; it must not remove coverage.

The shared stepper is a required display dependency. It labels steps[0].expression as Problem in guided and practice modes. Add one optional showInitialProblem boolean, with a default of true. Thread it only to those two existing prompt blocks. The IM3 system wrapper sets it to false because the wrapper renders both source equations. Keep all solution steps and grading behavior unchanged. Existing consumers keep the default behavior. Test both modes with the option off and with its default. The system wrapper test must reject the duplicate Problem prompt while retaining the ordered two-equation group. Do not use CSS hiding or replace a source solution step.
