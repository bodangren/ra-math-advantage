# IM3 quadratic formula response contract reuse review

## Decision

Use the existing IM3 server-owned submission path. Add one narrow app-owned quadratic-root parser and grader. Do not use the current general expression-equivalence function for root grading.

Keep the activity draft and `srsEligible: false` during implementation. Do not send the submission to the learning-evidence route until a later approval task.

## Existing APIs to reuse

Use these current contracts without a second pilot:

- `buildPracticeSubmissionEnvelope` from `@math-platform/practice-core/contract` builds the `practice.v1` envelope.
- `practiceSubmissionEnvelopeSchema` validates the route body.
- `createServerOwnedActivitySubmission` in `apps/integrated-math-3/lib/activities/submission.ts` sends the envelope with `Idempotency-Key`.
- `POST` in `apps/integrated-math-3/app/api/activities/submissions/route.ts` authenticates the learner, rejects extra envelope keys, validates the contract, and calls the internal writer.
- `createServerOwnedSubmissionHandler` in `apps/integrated-math-3/convex/activities.ts` owns activity lookup, learner authority, idempotent replay, conflict rejection, attempt ordinal allocation, grade persistence, and submission identity.
- The `by_user_activity_idempotency_key` index supplies exact replay lookup.
- The `by_user_activity_attempt_ordinal` index supplies the next server-owned attempt ordinal.
- `canonicalPayload` and `canonicalWorkedPayload` in the current IM3 writer define its JSON-string replay comparison. The writer has no `sameJson` helper. A later extension must preserve exact nested response identity without claiming that a reusable `sameJson` API exists.
- `gradeServerOwnedSubmission` and `ServerOwnedActivity` in `apps/integrated-math-3/lib/activities/server-grading.ts` are the correct extension point for an explicit quadratic-formula mapping.

The current response should use part IDs `discriminant`, `x1`, and `x2`. Every public variant must use the fixed fields `discriminant`, `x1`, and `x2`. A repeated-root variant requires the learner to enter the root in `x1` and leave `x2` blank. The route must select the expected behavior from the stored activity variant. It must not expose the canonical root count or accept a client-selected shape.

## Existing equivalence code

`checkEquivalence` in `packages/math-content/src/algebraic/equivalence.ts` is not safe for this contract.

- Its complex parser accepts only simple decimal real and imaginary terms.
- It does not parse complex fractions with radicals.
- Its radical parser accepts only a single positive integer coefficient and radicand, or a narrow sum form.
- It does not canonicalize expressions such as `sqrt(156)/10` and `sqrt(39)/5`.
- It compares some forms through floating-point values.
- It does not define an unordered root-set contract.

`normalizeSolverAnswer` in `@math-platform/activity-components/schemas` only removes spaces, normalizes one minus glyph, sorts text separated by `or`, and compares strings. It does not prove mathematical equivalence.

`gradeRoots` in `apps/pre-calculus/lib/practice/topic15-polynomial-inequality-sign-chart.ts` correctly shows the unordered-array pattern. It accepts only finite safe integers. It cannot grade irrational or complex roots.

No installed direct dependency provides a suitable symbolic parser to `@math-platform/math-content` or the IM3 app. `fraction.js` exists only as a transitive lockfile package. Do not import it without an approved dependency change. No install is necessary for the minimum solution.

## Minimum parser and grader

Add a small helper beside the IM3 server grader. Keep its grammar limited to the quadratic generator output contract.

Parse one root into a canonical algebraic value:

- a rational real part;
- an optional rational coefficient;
- one square root with a nonnegative integer radicand;
- an optional `i` factor;
- an explicit plus or minus sign.

Accept the source forms that the UI documents. Normalize ASCII and Unicode minus, `sqrt(...)`, `√`, `\sqrt{...}`, optional spaces, optional outer parentheses, explicit or implicit multiplication, and rational division. Reduce rational factors. Extract square factors from the radicand. Normalize the sign to the coefficient.

Do not accept variables, functions, exponent syntax, multiple radicals, nested operations, `eval` input, `NaN`, infinity, an empty string, or trailing text.

Compare each submitted root with a server-generated canonical root. Compare the unordered root multiset. Use explicit multiplicity. Do not use a `Set`, because a set hides duplicate-root errors.

For two-root variants:

- require exactly `x1` and `x2` once each;
- accept either order;
- reject one missing root;
- reject an extra root;
- reject the same root twice when the canonical roots differ;
- reject one correct and one incorrect sign.

For a repeated-root variant:

- require the correct root in `x1`;
- require `x2` to be blank;
- give `x2` zero score weight, but make a nonblank `x2` prevent a fully correct root result;
- keep multiplicity in the private server-generated result, not in public props.

Require the `discriminant` part for every variant. Parse it as a finite safe integer and compare it exactly with the server-generated discriminant. Reject numeric strings with trailing characters.

## Exact-form policy

Integer and rational roots can use reduced or unreduced equivalent fractions. Irrational and complex variants must keep an exact radical form. Do not accept a decimal approximation as an exact irrational or complex answer.

A safe normal form can reduce these examples to the same value:

- `sqrt(156)/10` and `sqrt(39)/5`;
- `(-8 + 2i sqrt(39))/10` and `(-4 + i sqrt(39))/5`;
- `-2 + sqrt(21)` and `sqrt(21) - 2`;
- the two conjugate roots in either answer-field order.

The parser must reject a form if it cannot prove equality inside its limited grammar. It must fail closed.

## Server-owned activity selection

Extend the existing explicit activity mapping in `server-grading.ts`. Do not add the Lesson 1.6 ID to a graphing-pilot constant.

The writer must derive or verify all of these fields from the stored activity:

- document ID and stable activity ID;
- mastery node ID;
- component key;
- mode;
- generator key and seed;
- exact generated equation and coefficients;
- discriminant;
- canonical root count and values;
- expected part IDs;
- draft review state and `srsEligible: false`.

Generate the canonical answer on the server from the stored seed with the existing quadratic-formula generator. Reject a stored activity if its public equation or variant does not agree with that output. Remove all client `isCorrect`, `score`, and `maxScore` fields before grading.

Return the existing server-owned submission result with `submissionId`, `score`, and `maxScore`. On an exact replay, return the original record. If the same key has a different envelope, throw `idempotency_conflict`. A new attempt must use a new key and receives a new server attempt ordinal.

## Receipt and evidence boundary

The activity-submission result is the receipt for draft quality assurance. Reuse the existing persisted submission identity and grade fields.

Do not call `submitIm3PilotActivity` for this draft activity. That function proceeds to `/api/learning-evidence/im3-pilot` and requires an eligible mastery receipt. The current learning-evidence handler correctly owns receipt-first progression, replay, mastery, and KST effects for approved mappings.

For the draft quadratic-formula activity:

- persist one server-owned submission;
- persist its server grade;
- create no SRS row;
- update no competency row;
- create no `learning-evidence.v1` row;
- create no learning-evidence receipt;
- reject an attempt to use the graphing-pilot evidence route.

A later approval task can add an exact publication mapping and reuse the current receipt-first learning-evidence handler. Do not weaken that handler to accept any graded submission.

## Public response boundary

Do not reuse `buildAlgebraicSubmission` as the authoritative response builder. It sends `step_*` parts and client correctness. Keep step history as optional telemetry only.

Add a quadratic-formula response builder that sends only:

- `answers.discriminant`, `answers.x1`, and `answers.x2` for every variant;
- matching parts with raw answers and no grade fields;
- the generated activity ID, mode, attempt number, and timestamp;
- optional interaction telemetry that does not contain expected answers.

Independent public props must not include canonical roots, grading rules, or future solution steps. Guided props can include only the reviewed help that the learner has requested. The server must recover all answer authority from the stored seed.

## Required rejection tests

Add behavioral tests for these cases:

- wrong activity ID, stable ID, node ID, component key, mode, generator key, or seed;
- public equation that differs from the server-generated equation;
- missing, duplicate, unknown, or extra part IDs;
- answer and part raw-answer disagreement;
- client grade fields;
- missing root, duplicate root for distinct solutions, wrong conjugate sign, wrong radical, or wrong rational denominator;
- decimal approximation submitted for an exact irrational or complex root;
- malformed fraction, zero denominator, negative radicand outside the explicit `i` form, nested radical, variable, function call, nonfinite value, or trailing text;
- wrong discriminant;
- changed payload with the same idempotency key;
- inactive learner or mismatched learner authority;
- draft submission causing any SRS, competency, mastery, KST, evidence, or evidence-receipt effect.

Also test accepted reversed order and equivalent integer, rational, simplified radical, and complex conjugate forms. Test exact replay after JSON round-trip so object identity cannot hide a shallow-comparison defect.

## Recommended scope order

1. Repair the generator roots and final Worked step in `@math-platform/math-content`.
2. Add the app-owned restricted root parser and server grader in `apps/integrated-math-3/lib/activities/server-grading.ts`, with a focused test file.
3. Extend the existing IM3 route shape validator and Convex explicit activity mapping.
4. Add the public `discriminant` and root-part response builder.
5. Verify stored draft submissions and zero progression effects.
6. Complete approval, activation, and exact-node evidence in a separate reviewed task.

This plan reuses the current submission and receipt contracts. It adds no registry, second pilot, dependency, or new evidence path.
