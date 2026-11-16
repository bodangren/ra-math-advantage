# Q34 full learner sequence independent review

## Decision

Accept the corrected test as an in-process composition test.

## Verified sequence

The test uses one database context for all operations. It renders the actual student Lesson page before acknowledgement. The page does not show Guided Practice. The actual Worked component sends its acknowledgement through the actual POST route and acknowledgement writer. The next page render shows the teacher-pending state.

The actual teacher dashboard uses the real candidate query. The actual form sends its request through the teacher POST route and teacher writer. The test does not insert teacher history, a candidate, a receipt, or a delivery state. The next student page render removes the Worked action and shows the real Guided and Independent components.

Both practice components send their envelopes through the actual create route and server-owned writer. They send the returned opaque IDs through the actual evidence route and evidence handler. Guided Practice stores participation without graded learning evidence or an SRS effect. Independent Practice stores an exact 3-of-3 grade and creates one SRS card and one `Good` review.

## Boundary checks

The premature Guided request now contains a valid `practice.v1` timestamp and attempt number. The create route stores the physical graded submission. The evidence boundary returns `awaiting_teacher_exposure` and creates no learning evidence, receipt, card, or review. Thus, the test proves that an early physical grade cannot cause progression. It does not claim that the create writer rejects all early submissions.

The final assertions check the learner, node, stable activity, physical submission, ordinal, grade, per-part correctness, assistance counters, card family, rating, and event times. The evidence replay returns `delivery: replay`. It does not add another evidence row, receipt, card, review, or physical submission.

## Fixture limits

The table-aware database implements the query operations used by this flow. It is not a real Convex transaction or concurrency test. The render test is not live browser acceptance. The test makes neither claim.

## Verification

`npx vitest run __tests__/app/student/topic11-full-sequence.test.tsx`

Result: 1 test passed.
