# IM1 Expression Implementation Review

Date: 2026-09-07.

This review checks the current FillInTheBlank changes and the IM1 objective 1a generator. It does not approve curriculum or runtime activation.

## Decision

The Independent component now conceals client correctness and preserves a response after a failed save. The generator now grades the expression field instead of the evaluated scalar. These changes correct the main objective mismatch.

The production adapter and server grader remain the decision boundary. They must prevent generator answers and evaluation values from reaching Independent props. They must also use a finite structural answer list. Client completion is not evidence of server correctness.

## Math input syntax

`MathInputField` is a text input with a KaTeX preview. It returns the exact text from the HTML input through `onChange`. It does not return a syntax tree or MathML. The component now uses `normalizeSolverAnswer` only for optional client validation.

FillInTheBlank uses its own narrower normalization for Guided checks. It converts Unicode minus to `-`, multiplication signs to `*`, division signs to `/`, removes whitespace, and ignores case. Thus `20 - 4 * 3` and `20 − (4 × 3)` can match only when both exact structural forms appear in `acceptedAnswers`. The normalizer does not remove or add parentheses. It does not evaluate expressions.

This finite comparison correctly rejects the scalar `8`. It also rejects a wrong grouping such as `(20 - 4) * 3` unless that exact form is added by mistake. It does not accept all mathematically equivalent rewrites. That is correct for this bounded objective if the approved finite list contains every allowed notation form.

## Mode behavior and concealment

The component accepts only `teaching`, `guided`, or `practice` at its TypeScript boundary. The schema for renderer props does not include mode. The activity wrapper supplies mode separately.

Teaching mode displays `correctAnswer`. Guided mode uses `correctAnswer` and `acceptedAnswers` for client feedback. Practice mode does not compute `isCorrect`, `score`, `correctCount`, or a score percentage. Its submission contains only the raw answer, word-bank use, part identity, and maximum score.

Independent props can omit `correctAnswer` and `acceptedAnswers`. The updated schema permits this. The production adapter must use that answerless shape. It must not pass these generator fields to the client:

- `data.expression`
- `data.acceptedExpressions`
- `data.value`
- `expectedAnswer`
- `solutionSteps`
- `gradingMetadata.partAnswers`

The current component test proves that an answerless schema value parses. It does not prove that the production adapter conceals every server field.

## Save and completion behavior

The submit handler sets `submitted` before it calls `onSubmit`. This disables repeat submission while a promise is pending. It awaits the callback. It calls `onComplete` only after that callback resolves.

If the callback rejects, the component clears `submitted`, shows `Your response was not saved. Submit it again.`, keeps the typed response, and does not call `onComplete`. The tests cover the pending and rejected paths.

One integration condition remains. `onSubmit` is optional and can return `void`. If it is absent or returns before durable server work completes, the component calls `onComplete` without proof of persistence. The production adapter must always supply a promise that resolves only after the server accepts the submission. A component completion callback must not create a correct grade or mastery result.

## Hints and reveal policy

FillInTheBlank props and its schema have no hint metadata and no reveal-policy field. Guided mode marks feedback as shown on each input change. On the first wrong character, it displays `Correct answer: ...`. This is immediate answer reveal.

This behavior is compatible only with an explicitly approved immediate-reveal Guided activity. It cannot implement staged hints or `after_attempt` reveal semantics. The adapter must not claim that such metadata is active. If the IM1 Guided blueprint requires hints or delayed reveal, the current component is not sufficient without a bounded component change.

## Generator scope

The changed generator maps only this exact node:

`math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`

Its prompt now asks only for a numerical expression. `expectedAnswer`, `partAnswers`, and the part ID use `expression`. The evaluated number remains in `data.value`, but it is not an accepted expression. The 50-seed test verifies that the scalar is absent from `acceptedExpressions`.

The generated expressions cover addition, subtraction, multiplication, division, a sum with a product, a product with a grouped difference, a grouped sum divided by a number, and a product followed by subtraction. The accepted list contains the ASCII expression and a display-symbol variant. It is finite and deterministic.

Some solution steps weaken the objective boundary. The nested product example changes the full expression from `a * ((b + c) - c)` to `a × b`. The sum-and-product example changes `a + b * c` to `a + productValue`. These steps evaluate the inner operation instead of preserving the translated structure. The expected answer remains correct, but Worked or Guided use of these steps can teach objective 1b evaluation during objective 1a practice. Keep the full unevaluated expression in the translation step. Put evaluation only in a separately labeled explanation if the approved mode requires it.

## Required adapter and server checks

- Build Independent props from the prompt and an answerless `expression` blank.
- Keep the finite accepted list on the server.
- Normalize only the approved notation variants.
- Reject the evaluated scalar.
- Reject wrong grouping.
- Reject missing, extra, or non-string expression parts.
- Return a durable save promise to the component.
- Call completion only after accepted persistence.
- Derive correctness, score, and mastery only from the server result.
- Do not expose hint or reveal metadata that the component does not implement.
- Keep the activity and evidence target on the exact objective 1a node.

## Test gaps

Add production-path tests that inspect the actual Independent client props. Assert that no answer, scalar, accepted list, solution step, or grading answer is present.

Add server-grade cases for ASCII operators, Unicode operators, the approved parenthesized variant, the scalar, wrong grouping, extra equality text, missing expression, and a non-string value.

Add an integration test in which the server rejects the submission. Require the input value and retry action to remain available. Add a success test that proves the completion callback occurs after the durable server response.

Add a Guided policy test before activation. It must either approve immediate reveal or require a supported delayed reveal and hint sequence.
