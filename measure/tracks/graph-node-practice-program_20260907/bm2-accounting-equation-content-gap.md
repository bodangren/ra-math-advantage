# BM2 accounting-equation content gap

## Scope

This note reviews `math.bm2.skill.1.1.apply-accounting-equation`.
It compares the node and blueprint with the published source for `unit-1-lesson-1`.

## Current coverage

The current Guided source activity is `d6b57545-65f6-4c39-80d5-000100001002`.
It asks the learner to classify six accounts as Assets, Liabilities, or Equity.
It calculates category totals of 6900, 1900, and 5000.
It verifies that `6900 = 1900 + 5000`.

The current Independent source activity is `d6b57545-65f6-4c39-80d5-000100001003`.
It asks the learner to classify nine accounts.
It does not ask the learner to apply a business event.

The current exit ticket is `d6b57545-65f6-4c39-80d5-000100001001`.
Most items test definitions and classification.
One item asks about a 3000 bank loan.
The correct response is Assets `+3000` and Liabilities `+3000`.

The current Worked specification defines Assets, Liabilities, and Equity.
It explains why `A = L + E`.
It does not show a complete before-and-after event calculation.

The current blueprint has no `guidedPracticeSpec`.
Its `sourceNodeIds` array is empty.
The renderer is `notebook-organizer`.
The renderer mode map is empty.
The adaptive publication check correctly stays false.

## Source-supported application content

The published lesson supports these event patterns:

- Sarah invests 5000. Cash increases by 5000. Equity increases by 5000.
- Sarah borrows 3000. Cash increases by 3000. Liabilities increase by 3000.
- Sarah buys a 2000 laptop with cash. Cash decreases by 2000. Equipment increases by 2000. Total Assets do not change.
- Sarah buys a laptop on credit. Equipment increases. Liabilities increase by the same amount.

The lesson video gives one complete sequence.
The first event produces `5000 = 0 + 5000`.
The second event produces `8000 = 3000 + 5000`.

These examples support application work for the exact Lesson 1 objective.
They do not require the broader Lesson 3 transaction-analysis family.

## Required Worked content

The Worked mode must show one complete business event.
It must include the values before the event.
It must name the two affected accounts.
It must show the direction and amount for each change.
It must calculate Assets, Liabilities, and Equity after the event.
It must verify `A = L + E` with numbers.

Use the published investment and loan sequence.
Show `5000 = 0 + 5000` before the loan.
Show Cash and Liabilities increasing by 3000.
Show `8000 = 3000 + 5000` after the loan.
Explain why the two equal increases keep the equation balanced.

## Required Guided content

The Guided mode must require an event analysis response.
Account classification alone is insufficient.

Use the published laptop purchase comparison.
Give the learner the event amount and the starting equation.
Ask the learner to select or enter both affected accounts.
Ask for the direction and amount of each change.
Ask for the three ending totals.
Ask for the numerical equation check.

Provide staged support for these two cases:

- Buy equipment with cash. One asset decreases and one asset increases. Total Assets do not change.
- Buy equipment on credit. Equipment and Liabilities increase by the same amount.

Hints must reveal one decision at a time.
A hint can identify the first account, the funding source, or the balance check.
The server result must record assistance.
Teacher review must remain necessary for the model and explanation evidence.

## Required Independent content

The Independent mode must use a new event with no displayed answer.
It must require the same response structure as Guided mode.

The learner must submit:

- The two affected accounts
- The A, L, or E category for each account
- The direction and amount for each change
- The ending Assets, Liabilities, and Equity totals
- The numerical equation check
- A short explanation of why the equation remains balanced

The server can grade the numerical fields and exact structured choices.
The teacher must review the explanation and the complete event model before application mastery.
A classification-only notebook artifact must not grant application mastery.

## Authoring boundary

Do not map the current classification activities to all three adaptive modes.
Their response contract does not prove the full node capability.
Do not add a placeholder `guidedPracticeSpec`.
Do not activate the existing generated accounting-equation family.

The next authoring task must first select or create a published Lesson 1 event-analysis activity.
It must then add reviewed mode specifications that match the activity response contract.
The publication gate must stay closed until this review is complete.
