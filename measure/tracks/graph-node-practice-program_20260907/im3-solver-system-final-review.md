# IM3 solver system final independent review

## Decision

Accept the frozen 11-path patch.

Baseline: `e910eb7e76616143330e766674ee772a61c6f642`

Reviewed artifacts:

- `/tmp/im3-solver-system-contract.patch`
- `/tmp/im3-solver-system-contract.paths.txt`
- `/tmp/im3-solver-system-contract.report.md`
- `/tmp/im3-lesson18-recovery-v6l3h06f`

## Scope and reconstruction

The path list contains the exact 11 paths from the committed scope. All patch headers use repository-relative `a/` and `b/` paths.

I reconstructed each path from `git show e910eb7e76616143330e766674ee772a61c6f642:<path>`. The patch applied with `patch -p1`. Every reconstructed file is byte-equal to the frozen candidate file.

The patch does not add a file. It does not change the app schema re-export, distractor re-export, shared fallback wrapper, seed adapter, or any unrelated lesson seed.

## Contract review

The shared schema owner exports one 12-value `PROBLEM_TYPES` tuple. It contains the five prior values and the seven exact source values:

- `simplify_imaginary`
- `complex_operations`
- `vertex-form`
- `inequality`
- `system`
- `polynomial`
- `rate_of_change`

The Zod schema uses a strict discriminated union. A system requires only `equations: { first, second }`. Each equation must be nonempty. A system rejects `equation`, a missing equation field, an extra equation field, and an array. A non-system record requires only a nonempty `equation` and rejects `equations`.

The step contract is unchanged. It requires nonempty `id`, `description`, and `expression`. It permits optional `explanation`. The schema remains strict.

`AlgebraicSubmissionInput` uses the same exclusive equation union. `buildAlgebraicSubmission` writes the ordered system object to `artifact.equations` and omits `artifact.equation`. It preserves the inverse rule for an ordinary activity. Existing answer and part construction is unchanged.

The Convex validator contains the same 12 literals and two exclusive shapes. It uses the native strict `{ first, second }` object. Its step fields match the shared contract. The known Convex string validator limit remains explicit in the accepted scope. Public Zod validation rejects empty strings.

## Source preservation

I extracted the five Lesson 1.8 equation arrays from the committed baseline and the five equation objects from the candidate. The ordered string pairs are equal:

1. `x = 2y^2 + 3y + 1`; `-x + y = -1`
2. `x^2 = y + 5`; `-x + y = 7`
3. `y = x^2 - 2x + 6`; `y = 4x + 1`
4. `R = -0.1x^2 + 4x`; `R = 42`
5. `y = x^2 + 2x`; `y = -x^2 + 4x + 6`

The patch changes only the container shape and the Batch A required step fields in that lesson. It does not join, select, derive, or replace an equation.

The aggregate seed test runs all 52 actual handler exports. It parses every stored step-by-step solver record with the shared production schema. It preserves the exact 18 source-domain records: five `complex_operations`, four `inequality`, three `simplify_imaginary`, five `system`, and one `vertex-form`. It also requires records for canonical `completing_the_square`, `polynomial`, and `rate_of_change`.

## Runtime review

The registered IM3 wrapper still imports the app-owned distractor re-export. It passes the truthful problem type to the existing callback.

For a system, the wrapper renders a group named `System of equations`. It renders both equations in stored order with `InlineMath`. It sends the exact ordered object to the submission builder. It does not pass a default single equation.

`StepByStepper` adds only the optional `showInitialProblem` property. Its default is `true`. Guided and practice modes use it only around their existing first problem block. The system wrapper passes `false`. Other consumers retain the prior default. Steps, distractor behavior, answer checks, and completion behavior are unchanged.

The wrapper tests cover teaching, guided, and practice system rendering. They require both equations, reject the default equation and duplicate Problem label, verify the `system` distractor argument, and verify exclusive system and ordinary artifacts.

## Independent tests

I ran:

```text
cd packages/math-content
npm test -- --run src/__tests__/schemas.test.ts
```

Result: 1 file and 29 tests passed.

I ran:

```text
cd apps/integrated-math-3
npm test -- --run __tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts __tests__/components/activities/algebraic/StepByStepper.test.tsx __tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx __tests__/convex/seed/seed-lesson-1-8.test.ts __tests__/convex/seed/seed.test.ts __tests__/lib/activities/registry.test.ts __tests__/components/lesson/ActivityRenderer.test.tsx
```

Result: 7 files and 90 tests passed.

The author reports that all 62 seed-test files and 841 tests passed. The author also reports successful lint and TypeScript checks for both changed packages, plus IM3 lint, pre-build TypeScript, production build, and post-build TypeScript.

## Boundary

The memory handler test proves source construction and public schema compatibility. It does not prove Convex storage transactions. The accepted scope requires a separate local Convex seed run after integration. This patch does not claim a system-solving or distractor-correctness proof.

## Integration

Parent review accepted the patch. Commit: `a3235c125`. The staged paths and bytes matched the frozen candidate. The commit preserved six mixed main files. Local storage verification remains pending.
