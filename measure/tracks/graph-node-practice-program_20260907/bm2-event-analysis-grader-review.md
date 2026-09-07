# BM2 event-analysis grader implementation note

## Scope

This change adds a pure grader for the draft event-analysis response.
It does not add a route, a Convex write, a publication mapping, or an approval.

## Server-owned cases

The grader keeps its expected values in a private constant.
It does not import the browser draft props.
It does not accept expected answers from the client.

The Guided cash case starts at `7000 = 2000 + 5000`.
A 2000 cash purchase changes Cash down by 2000 and Equipment up by 2000.
The ending equation remains `7000 = 2000 + 5000`.

The Guided credit case starts at `5000 = 0 + 5000`.
A 2000 credit purchase changes Equipment up by 2000 and Amount Owed up by 2000.
The ending equation is `7000 = 2000 + 5000`.

The Independent investment case starts at `5000 = 1000 + 4000`.
A 1000 owner investment changes Cash up by 1000 and Owner's Equity up by 1000.
Bank Loan and Equipment have no effect and an amount of zero.
The ending equation is `6000 = 1000 + 5000`.

## Validation

The grader accepts only Guided or Independent submissions.
It requires the `practice.v1` contract and submitted status.
It requires the exact case and part identifiers for the selected mode.
It rejects missing, extra, unknown, and duplicate parts.
It rejects a conflict between `answers` and `parts`.
It rejects client `isCorrect`, `score`, and `maxScore` fields.
It rejects invalid direction values.
It requires finite numeric values.
It rejects negative account-change amounts because each amount is a magnitude.
It accepts finite negative ending totals and equation differences as valid wrong responses.
It requires nonnegative integer hint counts.
It takes the maximum hint count in each case and adds the case counts.
It therefore does not multiply one used hint by the number of parts in that case.
It rejects positive hint assistance in Independent mode.

## Scoring

Each account category, account effect, and account amount has one automatic point.
Each ending total and equation difference has one automatic point.
The Guided maximum is 20 points.
The Independent maximum is 16 points.
Valid wrong answers stay in the result with a zero or partial part score.

The explanation has no automatic correctness value.
It has the status `manual_review_required`.
Its rubric asks the teacher to verify the explanation of equal account changes and equation balance.

## Verification

Fourteen focused grader tests passed.
The tests use literal accounting math.
They cover correct and wrong responses, sign errors, reordered record keys, shape attacks, invalid numbers, assistance, and the manual rubric.
Oxlint passed for the grader and test.
The app TypeScript check passed.

## UI-to-grader verification

A separate integration test now sends the real component envelope to the real pure grader.

The Guided test uses both laptop cases.
It enters all account directions, change amounts, ending totals, and equation differences through the visible controls.
It uses one hint in the cash case and two hints in the credit case.
The grader returns 20 of 20 automatic points and three total hints.
It returns the explanation with `manual_review_required`.

The Independent test enters the owner-investment response through the visible controls.
It enters negative 6000 for ending Assets.
The component preserves this finite sign error in the envelope.
The test also enters an incorrect Cash category. The grader returns 14 of 16 automatic points.
It keeps the negative value in the wrong part result.
It keeps the explanation for manual review.

The complete focused component and grader run passed 21 tests in three files.
Oxlint passed for the new integration test.
The app TypeScript check passed.
No UI-to-grader contract mismatch was found.

## Parent review and integration boundary

The parent verified the literal before-and-after equations in all three assessed cases. The grader preserves wrong finite totals, compares answer records without key-order dependence, and adds assistance once per case. The 21 focused tests, full app lint, standalone TypeScript, and build pass.

This pure function does not authorize an activity. The future trusted writer must bind the exact stored activity, node, mode, and approved content before it calls the grader. It must persist the automatic result and the manual-review response. The teacher must review the complete event model and explanation before application mastery. A numeric score alone cannot complete that review.

The parent also found that the UI accepted negative change magnitudes that this grader rejects. The component now rejects negative change magnitudes before submission. A regression verifies that correction enables submission. The grader correctly retains negative ending totals as student mistakes.

## Category-response review

The parent found that the earlier activity supplied the account categories. Those labels did not establish learner classification. Guided and Independent now require category choices through the existing matrix control. Their public props contain no category answers. The private grader validates the choices and awards one point for each correct category.

The artifact preserves the choices for teacher review. A wrong Cash category and a negative ending Assets value remain in the real UI-to-grader result. They reduce the Independent score to 14/16. Explanation review remains manual.

Coverage passes: 93.33% statements, 86.12% branches, 100% functions, and 95.3% lines. No source publication or trusted storage is enabled by this change.
