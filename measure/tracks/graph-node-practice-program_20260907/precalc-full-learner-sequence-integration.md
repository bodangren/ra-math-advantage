# Precalculus full learner sequence integration

## Scope

The Q34 test verifies one complete Topic 1.1 teacher-first learner sequence. The test file is `apps/pre-calculus/__tests__/app/student/topic11-full-sequence.test.tsx`.

The test uses one table-aware in-memory database context. The actual queries, routes, writers, components, pages, evidence handler, and SRS stores use this context.

## Verified sequence

1. The student lesson shows the Worked example. It does not show Guided or Independent Practice.
2. The actual Worked component sends an acknowledgement through the actual student POST route and acknowledgement writer.
3. A fresh student lesson request shows the teacher-confirmation state.
4. The actual teacher candidate query supplies the teacher dashboard and form.
5. The form sends the confirmation through the actual teacher POST route and teacher writer.
6. A fresh student lesson request shows Guided and Independent Practice. It does not show the Worked acknowledgement action again.
7. The actual Guided component sends its response through the create route, server-owned writer, evidence route, and evidence handler.
8. The actual Independent component uses the same production boundaries.

The test does not insert teacher evidence, a teacher candidate, an evidence receipt, or a learner delivery state by hand.

## Exact effects

The Worked step creates one acknowledgement for the exact physical source activity. The teacher step creates one `teacher_led` evidence row for the selected node. It creates no SRS effect.

Guided Practice creates an ungraded participation record. It creates no SRS card or review.

Independent Practice stores a server-owned 3-of-3 grade. All three parts are correct. Each part records zero hints, zero reveal steps, and zero changes. The evidence uses the physical Independent submission ID and attempt ordinal 1. It creates one SRS card for the selected node and Independent activity family. It creates one `Good` review at the expected time.

A valid Guided physical submission before the Worked and teacher steps cannot progress. Its evidence request returns `awaiting_teacher_exposure`. It creates no learning evidence, evidence receipt, SRS card, or SRS review. The physical graded submission remains stored.

A replay of the accepted Independent evidence returns `delivery: replay`. It does not add a learning-evidence row, receipt, card, review, or physical submission.

## Verification

The parent test log is `/tmp/precalc-q34-parent-final-tests.log`. It reports one passing test.

The parent lint log is `/tmp/precalc-q34-parent-lint.log`. It reports no lint error.

The parent build log is `/tmp/precalc-q34-parent-build.log`. It reports a completed build. Vinext also reports its existing route-classification notice.

The parent TypeScript log is `/tmp/precalc-q34-parent-tsc.log`. It is empty. The parent command completed successfully.

The independent review is `measure/tracks/graph-node-practice-program_20260907/precalc-full-learner-sequence-independent-review.md`.

## Limits

The in-memory database implements the operations that this flow uses. It does not prove real Convex transaction rollback, isolation, or concurrency.

The test renders React components in the test environment. It is not a signed-in browser test. It does not replace live browser acceptance.
