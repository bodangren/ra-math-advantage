# BM2 event-analysis component fit

## Decision

No existing activity component records the complete Lesson 1 event-analysis response.
Do not write the draft mode content against the current renderer contract.

## Reusable code

`SelectionMatrix` can record one direction for each account row.
`AccountingEquationLayout` can display Assets, Liabilities, and Equity.
The `practice.v1` envelope can store all required structured answers and a manual explanation.
The envelope `answers`, `parts`, and `artifact` fields are sufficient.
No practice contract change is necessary.

The `transaction-effects` family can model affected accounts, direction, amount, category summaries, and an equity reason.
It does not record starting totals.
It does not record ending totals.
It does not record a numerical equation check.
It does not record a learner explanation.
Its current generated identifiers and standard tags belong to the broader transaction-analysis content.
Do not map that family directly to the Lesson 1 node.

The current `notebook-organizer` component records account classification and category totals.
It does not record a business event before and after the event.
Do not reuse it as proof of the full node.

## Minimum component change

Add one app-owned `AccountingEquationEventActivity` component.
Compose it from `SelectionMatrix`, `AccountingEquationLayout`, native number inputs, and one native text area.
Do not add a shared component or a new framework.

The component must accept explicit reviewed content.
It must not generate a transaction family.
Its props must contain:

- `activityId`
- `mode`
- `title`
- `eventNarrative`
- `eventAmount`
- `startingTotals`
- `accountRows`
- `directionColumns`
- `guidedHints` for Guided mode only
- `workedSolution` for Worked mode only

The student response must contain:

- `account_effects`
- `ending_assets`
- `ending_liabilities`
- `ending_equity`
- `equation_difference`
- `explanation`

The `practice.v1` parts must use the same identifiers.
The server can grade the account effects and numeric fields.
The server must not mark the explanation correct automatically.
The artifact must preserve the event, starting totals, submitted effects, ending totals, equation difference, and explanation for teacher review.

## Draft content after the component exists

Worked mode must use the published loan sequence.
Start with `5000 = 0 + 5000`.
Increase Cash and Liabilities by 3000.
End with `8000 = 3000 + 5000`.

Guided mode must compare a 2000 laptop purchase with cash and on credit.
The first case decreases Cash and increases Equipment.
It leaves total Assets unchanged.
The second case increases Equipment and Liabilities by 2000.
Hints must reveal the funding source, then the account directions, then the equation check.

Independent mode needs an answer-hidden Lesson 1 event.
It must give explicit starting totals and one event amount.
It must require both account effects, all ending totals, the equation difference, and an explanation.
A content reviewer must approve the new event before publication.

## Publication boundary

Keep the current node and blueprint state unchanged.
Keep the existing classification activity identifiers unchanged.
Keep adaptive publication false.
Do not add `guidedPracticeSpec` until the component and server grader have tests for this exact response contract.

## Implementation result

The app-owned component now exists as an isolated draft.
It uses `SelectionMatrix` and `AccountingEquationLayout`.
It adds only the amount inputs, equation difference input, explanation field, and durable submission control that this response requires.

The Worked draft uses the published loan example.
It shows the starting equation, both account changes with the 3000 amount, the explanation, and the ending equation.
Its submission is an acknowledgement only.
It contains no grade and does not create teacher attestation.

The Guided draft includes both published laptop cases.
The cash case records Cash down by 2000 and Equipment up by 2000.
The credit case records Equipment up by 2000 and Amount Owed up by 2000.
Each case records ending totals and the equation difference.
Used hints add `hintsUsed` to the applicable case parts.

The Independent draft uses a distinct owner investment event.
It includes Bank Loan and Equipment as plausible no-effect rows.
It contains no `workedSolution` or `guidedHints` property.
It contains no expected totals or expected response.

The response uses these `practice.v1` part suffixes for each case:

- `account_effects`
- `account_amounts`
- `ending_assets`
- `ending_liabilities`
- `ending_equity`
- `equation_difference`

The final `explanation` part stays ungraded for manual review.
The component does not add client grade fields.

The component validates all selections and finite numeric fields before submission.
It blocks a second click while a save is pending.
It freezes the response after an uncertain save.
The explicit retry sends the same envelope.
It calls completion only after a successful save.

Four focused component tests passed.
Oxlint passed for the three new files.
The app TypeScript check passed.
The server grader and publication mapping remain a separate bounded task.

## Parent integration review

The parent verified the source loan sequence and both laptop cases. The response records account directions, change magnitudes, ending totals, and the equation difference. It preserves an explanation for teacher review.

The parent found and repaired two input-state defects. Hint controls now remain disabled while a response is pending, failed, or saved. Account-change magnitudes must be nonnegative before submission. Students still can submit negative ending totals as scored mistakes. Network retries preserve the same frozen envelope.

The real UI-to-grader tests verify Guided scores of 16/16 and an Independent score of 11/12 with a retained sign error. The combined suite has 20 passing tests. Full app lint, standalone TypeScript, and build pass.

The component remains an isolated draft. Registration, trusted persistence, approved source mapping, teacher review, and the real student route remain pending. The pilot task stays open.

Focused coverage: 93.75% statements, 86.62% branches, 100% functions, and 95.86% lines across the component and grader.
