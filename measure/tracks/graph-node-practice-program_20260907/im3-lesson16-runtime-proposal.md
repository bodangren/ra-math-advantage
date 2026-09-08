# IM3 Lesson 1.6 runtime proposal

## Review basis

This review uses committed `HEAD`. It does not use the dirty main working tree. I inspected the saved worktree `8111` only as preserved evidence. I did not change it.

The full Lesson 1.6 source group has five stable source IDs.

| Source ID | Printed source | Demonstrated response |
|---|---|---|
| `math.im3.example.1.6.036` | Example 1, page 43 | Solve `0 = -4.9t² + 11.7t + 42`, approximate both real roots, and reject the negative time in context. |
| `math.im3.example.1.6.037` | Example 2, page 44 | Solve `x² + 4x - 17 = 0` and give `-2 ± √21`. |
| `math.im3.example.1.6.038` | Example 3, page 44 | Solve `5x² + 8x + 11 = 0` and give `(-4 ± i√39)/5`. |
| `math.im3.example.1.6.039` | Example 4, page 46 | For `2x² - 10x + 7 = 0`, find the discriminant and describe the number and type of roots. The Check repeats both responses for `2x² + 8x + 8 = 0`. |
| `math.im3.example.1.6.040` | Example 5, page 46 | For `-5x² + 10x - 15 = 0`, find the discriminant and describe the number and type of roots. The Check repeats both responses for `10x² - 4x + 7 = 0`. |

Sources `.036`, `.037`, and `.038` support quadratic-formula work. Sources `.039` and `.040` support the separate discriminant skill. Source `.038` alone supports one complex-root exemplar. It does not prove the broad quadratic-formula skill.

## Current generator flow

The registry exposes `quadratic-formula` through these files:

- `packages/math-content/src/knowledge-space/generators/registry.ts`
- `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts`
- `packages/math-content/src/quadratic-formula.ts`

The generator selects four regimes from the seed. The regimes are two integer roots, one repeated root, two irrational roots, and two complex roots. The generator returns the equation, coefficients, discriminant, roots, and solution steps. The adapter returns part IDs `discriminant`, `x1`, and `x2` when two roots exist.

The generator has correctness defects:

- Each irrational result contains the same combined `±` string in `x1` and `x2`.
- Each complex result contains the same combined `±` string in `x1` and `x2`.
- `rootSample` uses only the first root. A Worked result can omit the second integer root.
- The final step therefore does not consistently state all roots.
- Existing adversarial tests require the duplicate `±` representation. Those tests preserve the defect.
- The complex-root test parser uses the radicand divided by the denominator as the imaginary magnitude. It does not use the square root of the radicand.
- Symbolic root parts use `exact_match`. Equivalent forms, reversed root order, spaces, reduced fractions, and equivalent radical forms can fail.

The source supports irrational and complex exact forms. The source also supports approximate contextual real roots. The present generator produces algebraic equations only. It does not ask the learner to interpret a root in context. It therefore does not cover the full response in Example 1.

## Current renderer and submission flow

The renderer path is:

1. `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx` resolves the component key.
2. `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx` sends fixed `steps`, `problemType`, and `equation` to `StepByStepper`.
3. `packages/activity-components/src/components/algebraic/StepByStepper.tsx` checks each response against solution-bearing step data in the browser.
4. `packages/math-content/src/schemas/step-by-step-solver.schema.ts` builds parts named `step_0`, `step_1`, and later step indexes.

This flow does not call the generator. It does not bind a generated seed to renderer props. It also does not bind the submitted `step_*` parts to the generator parts `discriminant`, `x1`, and `x2`. The browser receives the correct step expressions. Independent mode can therefore receive solution-bearing data before submission.

Only practice mode calls `onPracticeComplete`. Teaching and Guided modes do not produce the same submitted response contract. Current component tests prove static rendering. They do not prove generated attempt identity, server grading, a strict receipt, or exact-node evidence.

## Current server and evidence flow

`apps/integrated-math-3/components/student/PracticeSessionProvider.tsx` uses the strict submission path only for two selected graphing pilot activities. Other activities use `/api/activities/submit`.

`apps/integrated-math-3/lib/activities/server-grading.ts` grades only the selected graphing pilot IDs. It strips client grade fields for every other activity. It does not grade quadratic-formula parts.

`apps/integrated-math-3/convex/activities.ts` has two relevant writers:

- `submitActivity` trusts part scores that arrive in the submitted envelope. It can update standard competency and schedule SRS work. This path is not suitable for quadratic-formula mastery evidence.
- `createServerOwnedSubmissionHandler` validates and grades the selected graphing pilot. It supports exact idempotent replay. It does not accept the Lesson 1.6 skill or its component contract.

The exact learning-evidence route also recognizes the selected graphing pilot contract. There is no exact-node evidence contract for the quadratic-formula skill.

The saved draft projection cannot solve these gaps. Its three rows use fixed props. Its Independent row states `unique_seeds` without generated props. Its rows also set `srsEligible: true` while the node and blueprint are draft. The current projector would set them to false.

## Minimum implementation

Keep the skill node and blueprint draft during implementation and review. Keep all modes outside the learner queue until approval. Draft quality assurance is an interim verification stage. The completion goal is usable approved-node practice with server-owned grading, a strict receipt, and exact-node evidence. Approval and activation remain separate reviewed changes.

Reuse the generalized practice, receipt, and learning-evidence contracts where they support this response shape. Extend those contracts with an explicit activity mapping. Do not create a second isolated pilot by default.

Use four bounded stages.

### 1. Repair generator mathematics

Change only the generator, adapter, and their existing tests.

- Return two distinct explicit roots for irrational and complex cases.
- Return the correct number of roots for each regime.
- Put all roots in the final Worked step.
- Keep deterministic seed behavior.
- Put parentheses around a negative value of `b` in the discriminant substitution.
- Correct the independent test parser.
- Replace the tests that require duplicate `±` roots.

This stage must not change grading policy, runtime routing, node approval, or activity eligibility.

### 2. Define one public response contract

Use one contract for generated Guided and Independent attempts. Use the part IDs `discriminant`, `x1`, and `x2`. Represent a repeated root with one root part or with an explicit multiplicity contract. Do not create two different answers for one repeated root.

Do not use `step_*` parts as scored answers. Step history can remain telemetry. It must not be the authoritative answer.

The contract must preserve an unordered root set. The grader must accept the two roots in either order. It must accept mathematically equivalent real, irrational, and complex values. A normal expression-equivalence rule is insufficient unless it supports `i`, radicals, fractions, and unordered pairs. Add a narrow quadratic-root normalizer if the existing grader does not support these forms.

### 3. Separate public props from server data

Generate the attempt on the server. Persist or recover its seed and exact activity variant. Send only public data to the component.

- Worked can show the full source steps for `.036`, `.037`, or `.038`.
- Guided can show a hint or one revealed step only after the learner requests it.
- Independent can show the equation and answer fields. It must not receive expected answers or future solution steps before submission.
- A retry must use the same activity ID, seed, answer body, and idempotency key.
- A new attempt must use a new attempt identity and can use a new seed.

The contextual response from Example 1 needs a separate interpretation part. The algebraic generator does not supply that part. Do not claim that generated algebraic practice covers the contextual decision.

Likely implementation paths are:

- `packages/math-content/src/quadratic-formula.ts`
- `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts`
- `packages/math-content/src/schemas/step-by-step-solver.schema.ts`
- `packages/activity-components/src/components/algebraic/StepByStepSolverActivity.tsx`
- `packages/activity-components/src/components/algebraic/StepByStepper.tsx`
- `apps/integrated-math-3/components/activities/algebraic/StepByStepSolverActivity.tsx`
- `apps/integrated-math-3/components/student/PracticeSessionProvider.tsx`

Reuse or remove the app wrapper after the shared and app contracts are compared. Do not keep two submission builders with different part ID separators.

### 4. Add a server-owned inactive contract

Add explicit server grading only after the public response contract is stable. Reuse the strict receipt and idempotency pattern. Do not add the Lesson 1.6 IDs to the selected graphing pilot constants.

The writer must select a stored activity. It must validate the stable activity ID, mastery node ID, component key, mode, seed identity, part set, and canonical server answer. It must remove all client grade fields before grading.

While the node and blueprint are draft, the activity must remain `srsEligible: false`. A saved submission can support internal quality assurance. It must have no `learning-evidence.v1` mastery contract. The learning-evidence route must reject it. A later approval task can activate the explicit publication boundary and exact-node evidence mapping after source, component, grader, and browser review pass. That approved-node practice and exact-node evidence are the required final outcome.

Likely server paths are:

- `apps/integrated-math-3/lib/activities/server-grading.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- `apps/integrated-math-3/lib/activities/submission.ts`

Do not use generic `submitActivity` for this contract. Its current score and competency behavior trusts client fields.

## Required tests

Add tests before each implementation stage.

Generator tests must prove:

- each distinct integer pair contains both roots;
- irrational and complex pairs contain two distinct explicit roots;
- every real root has a near-zero polynomial residual;
- every complex root has near-zero real and imaginary residuals;
- the repeated-root count is correct;
- the final Worked step contains every result;
- negative `b` substitution is unambiguous;
- the same seed gives the same result;
- adapter answers and part IDs match the repaired roots.

Component tests must prove:

- the registry resolves `step-by-step-solver`;
- the generated equation reaches the visible component;
- Guided help appears only after its control is used;
- Independent props contain no expected answer or solution steps;
- the submitted parts are `discriminant`, `x1`, and `x2` as applicable;
- the component does not submit a blank required answer;
- the first submit freezes the attempt through a failed request;
- a retry keeps the exact envelope and key;
- a remounted new attempt resets inputs and help counters.

Server tests must prove:

- the server ignores client correctness and score fields;
- both root orders pass;
- equivalent integer, irrational, and complex forms pass;
- wrong signs, one missing root, a duplicate root, and a wrong discriminant fail;
- the server selects the stored seed and activity identity;
- an idempotent replay returns the original receipt and does not insert twice;
- a changed body with the same key fails;
- a draft activity cannot create SRS, competency, or exact-node evidence;
- the learning-evidence route rejects a draft Lesson 1.6 submission.

A browser test is required before any approval task. It must run real Worked, Guided, and Independent modes. It must verify reload, retry, persisted attempt identity, server grade, and the absence of mastery effects while the content remains draft.

## Decision

The minimum safe first change is the generator mathematics repair. The current three-mode saved blueprint is not usable as a learner or mastery flow. Keep it inactive during repair. Complete the public response and generalized server-owned contracts in separate reviewed tasks. Then complete the reviewed approval and activation step so the approved node can produce exact-node evidence. Keep worktree `8111` until its unique blueprint and test files have a committed or explicit preservation disposition.
