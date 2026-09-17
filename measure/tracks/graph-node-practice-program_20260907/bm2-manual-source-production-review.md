# BM2 manual source production flow review

## Scope

This review covers the Business Math 2 accounting-equation pilot.

The exact skill node is `math.bm2.skill.1.1.apply-accounting-equation`.
The exact Guided source activity is `d6b57545-65f6-4c39-80d5-000100001002`.
The source lesson is `unit-1-lesson-1`.

## Result

No production defect was found in this bounded flow.

The production source writer is `submitAssessment` in `convex/activities.ts`.
It stores the server attempt number and server time.
It replaces the client activity identifier with the stored activity document identifier.
It stores the stable source activity identifier.
It removes client `isCorrect`, `score`, and `maxScore` values from each response part.
It preserves the learner answers and the manual notebook artifact.

The teacher route gets the teacher identity from the authenticated session.
The route sends only the learner and submission identifiers to the internal mutation.
The internal mutation verifies the current published source.
It verifies the active learner profile.
It verifies the teacher role and organization.
It verifies an active enrollment in a nonarchived class that the teacher owns.
It verifies that the enrollment existed before the response.
It verifies the published lesson phase that contains the exact source activity.
It verifies that the learner started that phase before the response.

Business Math 2 has no class-to-lesson assignment model.
The current source authorization contract therefore uses the published lesson, learner progress, lesson access, and teacher class membership.
The implementation follows this contract.

The teacher action patches the stored source submission with the first teacher and time.
It then records one `teacher_led` and `guided_practice` evidence row for the exact node.
This evidence has no graded evidence value.
It does not apply mastery.
It does not create an SRS card or an SRS review log row.
A replay returns the stored receipt.
The replay does not change the first teacher stamp.
The replay does not add evidence or receipt rows.

## Literal source check

The added production-flow test uses the six source accounts.
It classifies Cash, Laptop, and Client Unpaid Invoice as assets.
It classifies Bank Loan and Credit Card Bill as liabilities.
It classifies Sarah Investment as equity.

The literal totals are:

- Assets: 6900
- Liabilities: 1900
- Equity: 5000

The equation is `6900 = 1900 + 5000`.

The real source activity currently uses automatic scoring before teacher verification.
The teacher verification remains a manual exposure action.
The resulting teacher evidence does not use the source score as mastery evidence.

## Publication state

The exact source publication check returns true for the current catalog and lesson source.
The adaptive pilot publication check returns false because the required adaptive mode specifications are incomplete.
This review does not add `guidedPracticeSpec`.
This review does not activate adaptive practice.

## Verification

The new test invokes the real `submitAssessment` handler and the real `verifyTeacherExposure` handler.
It does not insert a fabricated graded source submission.
It verifies writer replay and teacher replay with stable row counts.

The focused run passed 25 tests in four files:

- `bm2-manual-source-production-flow.test.ts`
- `learningEvidence-teacher-verification-flow.test.ts`
- `app/api/teacher/learning-evidence/bm2-pilot/route.test.ts`
- `app/api/progress/assessment/route.test.ts`
