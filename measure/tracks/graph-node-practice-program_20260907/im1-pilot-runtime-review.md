# IM1 Verbal-to-Numerical Pilot Runtime Review

Date: 2026-09-07.

Status: Read-only review complete. No runtime or graph change occurred in this
review.

## Result

The current generator and renderer do not provide valid evidence for the
selected translation capability. They primarily grade arithmetic evaluation.
The current projection does not carry the real generator output to the student
renderer.

The selected node is:

`math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`

Its source capability is to translate words into a numerical expression. The
student must select the correct operations, order, and grouping. Evaluation is
a separate source capability, objective `1b`.

## Current path

| Layer | Current file | Current behavior |
|---|---|---|
| Problem family | `packages/math-content/src/problem-families/im1/index.ts` | The family description says “then evaluate.” It combines `1a` and `1b`. |
| Generator | `packages/math-content/src/problem-families/im1/generators.ts` | `1-1-verbal-to-numerical` generates a verbal phrase, an expression, and a numeric value. It asks the learner to write an expression and evaluate it. |
| Generator grade | Same generator | `expectedAnswer`, `partAnswers`, and `partGradingRules` contain only `result`. The rule is `exact_match`. The expression is present only in `data` and solution steps. It is not a graded part. |
| Blueprint | `apps/integrated-math-1/curriculum/skill-graph/blueprints.json` | Worked and Guided specifications ask for expression translation and evaluation. Independent practice defines only numeric part `result`. |
| Projection | `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json` | The rows contain placeholder prompts. They do not contain a rendered verbal phrase, expected expression, or live generator output. |
| Shared schema | `packages/activity-components/src/schemas/step-by-step-solver.schema.ts` | The schema accepts `problemType`, `equation`, optional algebraic steps, and hints. It has no verbal prompt or translation-answer field. |
| Shared renderer | `packages/activity-components/src/components/algebraic/StepByStepSolverActivity.tsx` and `StepByStepper.tsx` | Guided mode selects a displayed solution step. Independent mode asks the learner to reproduce each solution-step expression. It does not ask for one translation of the verbal phrase. |
| Shared submission | `StepByStepSolverActivity.tsx` | The browser sets each step's `isCorrect` value and submits it. This is not server-owned grading of the generated expression. |
| Existing blank schema | `packages/activity-components/src/schemas/fill-in-the-blank.schema.ts` | Each blank has `id`, one required `correctAnswer`, and optional `isMath`. The schema has no accepted-answer list and cannot omit the answer from Independent client props. |
| Existing blank renderer | `packages/activity-components/src/components/blanks/FillInTheBlank.tsx` | The renderer already uses `MathInputField` in all three modes. It compares trimmed, case-folded text. Guided mode reveals the answer after an incorrect response. Independent mode calculates correctness in the browser. It calls completion without waiting for persistence. |
| Math domain registry | `packages/math-content/src/knowledge-space/generators/registry.ts` | `getGenerator('1-1-verbal-to-numerical')` is unavailable. The generator exists only in the separate `IM1_GENERATORS` list. |
| Existing tests | `packages/math-content/src/problem-families/im1/__tests__/1-1-verbal-to-numerical.test.ts` | The tests prove determinism and generic generator shape. They do not require an expression answer or prove the learner translates the phrase. |

## Semantic defect

For a generated prompt such as “the sum of 5 and the product of 3 and 4,” the
capability answer is `5 + 3 * 4` or an equivalent grouped form. The current
generator grades only `17`. A learner can enter `17` without constructing an
expression. This result proves evaluation or recall of the result. It does not
prove translation.

The current Guided renderer also exposes solution-step expressions as answer
choices. The first step can be text such as `"sum" means addition`. The renderer
sends this through KaTeX as mathematical content. Later steps can replace the
original operands with evaluated intermediate values. Selecting these steps
does not require the learner to construct the requested expression.

The current Independent renderer grades every solution step by normalized text
equality in the browser. It can mark a mathematically equivalent expression
incorrect. It can also award the translation node from evaluation steps. The
submitted `isCorrect` flags are browser-owned.

## Blueprint defects

The three specifications do not assess one stable capability:

- Worked mode is acceptable as an instructional demonstration only after it
  stops treating final evaluation as evidence for `1a`.
- Guided mode includes identification, translation, and evaluation checks.
  Only the translation response can provide evidence for `1a`.
- Independent mode has only `{ "result": "number" }`. It cannot measure
  verbal-to-numerical translation.

The source mapping to Lesson 1-1 Examples 1 and 2 is now present in the current
blueprint. These examples support translation. Do not add evaluation examples
4 through 8 to this node.

## Smallest reusable correction

Reuse `FillInTheBlank` and `MathInputField`. Do not add an expression-
translation component. The blank activity already supports one math response,
Worked display, Guided input, and Independent input. A small schema and grading
change is sufficient.

Extend each blank with these optional fields:

```ts
type Blank = {
  id: string;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  isMath?: boolean;
};
```

Worked and Guided props can contain `correctAnswer` and `acceptedAnswers`.
Independent props must omit both fields. The mode adapter must require an
answer for Worked and Guided modes. Independent mode must submit the raw value
without local correctness. The server must own its accepted list.

Use this bounded shape for a Worked or Guided item:

```ts
{
  template: 'Write a numerical expression for “the difference of 20 and the product of 4 and 3”: {{blank:expression}}',
  blanks: [{
    id: 'expression',
    correctAnswer: '20 - 4 * 3',
    acceptedAnswers: [
      '20 - 4 * 3',
      '20 - (4 * 3)',
      '20 - 4 × 3',
      '20 - (4 × 3)',
    ],
    isMath: true,
  }],
}
```

The bounded templates must produce a finite accepted set. Apply only narrow
notation normalization before membership comparison. Remove whitespace.
Normalize `×` to `*`, `÷` to `/`, and the Unicode minus sign to `-`. Do not
evaluate the expression. Do not remove internal parentheses. Do not reorder
operands. The accepted set above rejects `8`, `4 * 3 - 20`, and
`(20 - 4) * 3`.

The server-owned grading metadata must use the expression part for this node:

```ts
expectedAnswer: { expression: "5 + 3 * 4" }
partAnswers: { expression: "5 + 3 * 4" }
partMaxScores: { expression: 1 }
partGradingRules: { expression: "custom" }
```

The custom rule must compare against the private finite accepted set. The
existing `numeric_tolerance` and general `expression_equivalence` rules are not
suitable. They can accept the same evaluated constant from a different
structure. A generalized computer algebra system or expression parser is not
required for these bounded templates.

The renderer must show the verbal phrase. Worked mode must show the complete
translation and explain the grouping. Guided mode must accept one expression.
It must record hint and reveal assistance. Independent mode must not receive or
show the solution before submission.

The submission must contain part ID `expression` and the raw student
expression. The server must ignore browser-owned correctness. The blank
renderer must await `onSubmit`. It must call `onComplete` only after a
successful save. It must preserve the learner response after a rejected save.

## Generator adapter correction

Keep the deterministic template generation. Add the generated expression to
the assessed output. Keep the numeric result in `data.value` and the solution
steps. A later objective `1b` adapter can use this result as separate evidence.
The `1a` adapter must project only `expression` as a participating part.

For example, the corrected generator result can contain:

```ts
data: { verbal, expression, value, acceptedExpressions }
expectedAnswer: { expression }
partAnswers: { expression }
partMaxScores: { expression: 1 }
partGradingRules: { expression: 'custom' }
```

The value remains available for the separate `1b` activity. It must not enter
the `1a` score or evidence event.

Register the corrected generator in the runtime path used by the graph domain
adapter. The smallest compatible choices are:

1. Add an adapter for the existing IM1 generator to the main math generator
   registry under `1-1-verbal-to-numerical`.
2. Change the blueprint only if the runtime registry requires a different
   stable key. Do not maintain two keys for one generator.

The adapter must translate `GeneratorOutput.data.verbal` into the blank
template. It must map the generated expression to blank ID `expression`.
Worked and Guided adapters can include the accepted forms. The Independent
adapter must keep accepted forms in private server grading data. It must not
map the generated numeric result into the `1a` response.

## Required behavior tests

1. A generator test must assert that `expression` is the sole `1a` mastery
   part and that `data.value` remains available for `1b`.
2. Use at least one grouping-sensitive case. Example: “the product of 4 and the
   difference between 11 and 3” must require `4 * (11 - 3)`. The response
   `4 * 11 - 3` must fail.
3. Use an order-sensitive case. “The difference of 11 and 3” must reject
   `3 - 11`.
4. Accept only emitted structural forms after narrow notation normalization.
   Accept `3 × 4` and `3 * 4` when both normalize to an accepted form. Reject
   the evaluated scalar.
5. Guided mode must record hint or reveal assistance.
6. Independent mode must conceal the expected expression before submission.
7. A rejected save must preserve the learner's expression and must not call
   completion.
8. The server result must control correctness and exact-node evidence. Ignore a
   browser correctness field.
9. A registry test must resolve the blueprint generator key through the same
   adapter used by runtime graph projection.
10. A signed-in route test must render the verbal phrase, store the expression,
    grade it, and persist evidence for the selected node only.

## Identity verification

The six new IM1 Module 1 skill IDs in the current canonical node file exactly
match a fresh assembler run over the current class-period plan and module
overview:

- `math.im1.skill.1.1.evaluate-numerical-expressions-accurately-using-the-order-of`
- `math.im1.skill.1.2.evaluate-algebraic-expressions-by-substituting-given-values`
- `math.im1.skill.1.3.use-the-commutative-associative-identity-and-inverse-propert`
- `math.im1.skill.1.4.use-the-distributive-property-to-simplify-algebraic-expressi`
- `math.im1.skill.1.5.evaluate-absolute-value-expressions-by-substituting-given-va`
- `math.im1.skill.1.6.determine-a-reasonable-level-of-accuracy-when-performing-mul`

The ID comparison found no mismatch. This verifies deterministic construction.
It does not approve the rows or their future practice specifications.

## Recommended implementation order

1. Add failing generator semantics and registry tests.
2. Correct the generator grading part and add the main-registry adapter.
3. Extend the existing blank schema and activity with accepted-form and
   persistence behavior tests.
4. Update the one pilot blueprint and regenerate only its three projection
   rows.
5. Add the server grader and exact-node evidence test.
6. Verify all three modes in the signed-in IM1 student route.

Keep objective `1b` separate. A later evaluation activity can reuse the numeric
result from the generator templates, but its evidence must target the new `1b`
node.
