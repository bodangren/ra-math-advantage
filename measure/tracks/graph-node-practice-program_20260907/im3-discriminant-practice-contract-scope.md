# IM3 discriminant practice contract scope

## Result

Use the existing `discriminant-analyzer` renderer identity. Replace its learner response and grading behavior before it becomes active practice. Reuse `generateQuadraticFormula` only as a deterministic source of integer coefficients. Do not ask the learner to solve for roots.

This work does not make the discriminant skill active. It does not approve a source record or a graph record.

## Source evidence

The native `Key Concept • Discriminant` table on page 45 defines four classifications. Its stated domain is `ax² + bx + c = 0`, where `a`, `b`, and `c` are rational numbers and `a ≠ 0`:

- A positive perfect-square discriminant gives two real rational roots.
- A positive non-perfect-square discriminant gives two real irrational roots.
- A zero discriminant gives one real rational root.
- A negative discriminant gives two complex roots.

The table is the direct source authority for the four-case classification rule. The current graph has no source node for this Key Concept table. It has the Lesson 1.6 instructional unit, the broad classification skill, an ALEKS-derived concept, and the two Worked examples. The minimum source correction is to add the native page 45 reference to the existing classification skill. Do not invent a separate table node unless a later source contract requires one.

The records `math.im3.example.1.6.039` and `math.im3.example.1.6.040` are Worked examples. They include the answers. Record `.039` computes `44` and identifies two real irrational roots. Record `.040` computes `-200` and identifies two complex roots. These records can support Worked presentation. They do not supply unanswered Guided or Independent evidence.

The first direct unanswered checks are on native page 46:

- `2x² + 8x + 8 = 0` asks for the discriminant and the number and type of roots. Its discriminant is `0`. It has one real rational root.
- `10x² - 4x + 7 = 0` asks for the discriminant and the number and type of roots. Its discriminant is `-264`. It has two complex roots.

Native page 48 has the general unanswered demand for Problems 24 through 35: `Find the value of the discriminant for each quadratic equation. Then describe the number and type of roots for the equation.` This demand covers all four classifications. It is the correct source basis for generated practice after source review records the exact page and problem range on the existing capability. A new source node is not required merely to cite this demand.

Problems 39 through 47 also require learners to solve each equation with the Quadratic Formula. Do not use those complete prompts as evidence for this separate classification activity. A discriminant-only response does not satisfy their final response demand.

## Existing implementation findings

### Renderer and schema

The shared component is in `packages/activity-components/src/components/discriminant/DiscriminantAnalyzer.tsx`. Its wrapper is `DiscriminantAnalyzerActivity.tsx`. The registered property schema accepts an equation and optional numeric coefficients.

The component is not a valid scored practice component in its current form:

- It computes the answer in the browser.
- It puts `correctDiscriminant` and `correctClassification` in the learner payload.
- It puts a client-owned score and correctness result in the payload.
- It uses floating-point tolerance for the discriminant.
- It calls `onComplete` without a server receipt.
- Independent mode collects only the discriminant. It does not collect the requested classification.
- Guided mode offers only three classification values. It does not distinguish rational roots from irrational roots when the discriminant is positive.
- Guided mode asks for `a`, `b`, and `c`. The check prompts ask for the discriminant and the number and type of roots. Coefficient identification can be a hint or a Worked step. It must not add score to the check response.
- Its equation parser is display code. It can backtrack incorrectly on multi-digit terms. Do not use it as server authority.

The Convex activity property validator and the math renderer registry also accept public coefficients. They contain no learner response contract and no private expected answer contract.

### Generator

There is no discriminant-specific generator. The graph gap queue correctly marks this generator as missing.

The ALEKS-derived node `math.im3.skill.1.aleks.discriminant-analysis` does not prove practice readiness. Its metadata says `component-planned`. Its `generatorKey` is `algebraic-step-solver`, but no discriminant generator is present. It also has `independentPracticeReady: true`. These fields contradict the executable state. Treat the readiness flag as stale. Do not select this concept as a ready practice skill or use its generic generator binding as authority.

`packages/math-content/src/quadratic-formula.ts` already generates bounded integer coefficients for four regimes: two distinct rational roots, one repeated root, two irrational roots, and two complex roots. It returns the discriminant and roots. A discriminant activity can reuse only its generated `a`, `b`, `c`, `quadratic`, and `discriminant` values. The server must derive the classification from the discriminant. The public activity must not include the generated roots or expected discriminant.

This reuse is an implementation reuse. It does not make solving with the Quadratic Formula a prerequisite. The unsupported prerequisite edge `math.im3.edge.m1.063` was removed in commit `a85d31f16`. This activity must not restore it.

## Minimum learner response

Use the same fixed public response shape in Guided and Independent modes:

```ts
type DiscriminantResponse = {
  discriminant: string;
  classification:
    | 'two_real_rational'
    | 'two_real_irrational'
    | 'one_real_rational'
    | 'two_complex';
};
```

The activity displays the server-selected quadratic equation. It can also display `a`, `b`, and `c` as a Guided hint. The coefficients are problem data. They are not learner answers in this contract.

Independent mode keeps both fields available and submits them together.

Guided mode first accepts the discriminant through an optional server check. A correct result unlocks the classification choices. An edit invalidates the check and locks classification again. A failed or stale check does not unlock classification. Final submission still includes both fields and receives full server grading. This follows the existing Guided QF check behavior, but it uses the discriminant activity identity and authority.

Do not ask for a root value. Do not expose the expected classification before final grading.

## Server grading contract

The server loads the exact activity, item, and variant relation. It validates the selected skill, component, mode, and draft publication state. It regenerates the problem from private variant metadata. It verifies that the generated public equation and coefficients match the stored public activity properties.

The server computes `D = b² - 4ac` from the regenerated integer coefficients. It does not parse the displayed equation. It does not trust a client coefficient, expected answer, score, correctness value, seed, or classification.

The discriminant parser accepts one trimmed base-10 integer string. It rejects decimals, exponents, arithmetic expressions, non-finite values, empty input, and oversized input. This is sufficient for the reused generator and the cited source checks. Exact integer equality determines correctness.

The server derives the classification as follows:

```text
D < 0                     -> two_complex
D = 0                     -> one_real_rational
D > 0 and sqrt(D) integer -> two_real_rational
D > 0 otherwise           -> two_real_irrational
```

Use integer perfect-square detection. Do not use a floating tolerance.

Grade two independently observed parts:

- `discriminant`: 1 point.
- `classification`: 1 point.

The total score is 2. A learner can receive one point when exactly one response is correct. The server returns ordinary part results and a receipt. Draft records must produce zero competency, spaced-repetition, or learning-evidence effects.

The Guided check accepts only `{ activityId, fieldId: 'discriminant', rawAnswer }`. It returns only `{ isCorrect: boolean }`. It does not write a submission. It does not return the discriminant, classification, coefficients, seed, roots, or grading metadata.

## Minimum later implementation scope

No new table or renderer registry entry is necessary. The renderer already exists. A later implementation needs these bounded changes:

1. Update the shared discriminant component and its existing component tests. Remove client grading and correct-answer fields. Add the four classification values. Add receipt-controlled completion.
2. Update the existing discriminant activity property and response schemas only where the fixed response contract requires it. Keep private generation metadata outside public properties.
3. Reuse `generateQuadraticFormula` through a small discriminant-specific mapping in the existing IM3 activity grading boundary. Do not duplicate its random coefficient generation.
4. Add a strict discriminant branch to the existing server grader. Add exact parser and four-regime grading tests.
5. Add exact server-owned activity, item, and variant validation to the existing Convex writer and Guided check path. Reject alternate client-grade writers for any linked discriminant activity.
6. Add reviewed Guided and Independent draft seed records only after stable source mappings exist. Keep them inactive and outside lesson placement until approval.
7. Add behavioral tests for server authority, replay, conflicts, zero effects, private metadata exclusion, both modes, all four classifications, partial credit, malformed responses, Guided stale checks, and receipt-controlled completion.

## Required rejection cases

Reject or fail closed for these cases:

- The learner is not authenticated.
- The activity does not belong to the learner-selected section or attempt.
- The activity, item, variant, skill, component, or mode relation does not match exactly.
- A duplicate or missing relation makes the selected variant ambiguous.
- The record is approved, rejected, or needs changes when the draft-only gate requires `unreviewed`.
- Public properties do not match the regenerated private variant.
- The response has an unknown field, missing field, invalid enum, expression instead of an integer, non-finite value, or oversized value.
- A generic client-grade submission path targets or links to this server-owned activity.
- A retry changes any accepted request field.

## Evidence that remains necessary

Before implementation, a source review must add the native page 45 source reference to the existing classification skill. It must also record exact page 46 check references or the page 48 problem range on the existing capability. Preserve existing identities. Do not create source nodes solely for provenance. Preserve each combined demand as one prompt with two scored response parts.

The graph and blueprint remain draft. The existing `.039` and `.040` mappings are Worked-only evidence. This proposal does not approve the generator, activities, source nodes, blueprint, or prerequisite edges.

## Parent source verification

The parent directly viewed the native page 45 table. It states the rational-coefficient domain and all four classifications. Native page 48 text confirms that Problems 24 through 35 ask for both discriminant and classification. Problems 39 through 47 add a separate solving demand.

The current renderer does not grade classification and omits it from Independent response controls. The ALEKS concept readiness flag is inconsistent with its component-planned metadata. Neither condition proves usable practice. The source repair must correct the existing references and false readiness without increasing the skill inventory.

The generated standard-form integer coefficient subset does not cover every source representation. For example, Problem 35 has a nonzero right side. Record that remaining representation requirement when selecting practice variants.
