Committed as `db7af318d`. Parent integration matched each staged file to the frozen candidate. Parent verification passed 137 application tests and 21 shared tests, application lint, build, and separate post-build TypeScript. The shared package also passed author lint and TypeScript checks. Existing font, route-classification, and two negative-test React act warnings remain. Real browser verification remains required.

# IM3 QF allocation client independent review

## Result

Accepted.

I reviewed the frozen 11-path patch against baseline `44181dfba41d9c33e33c287a4620a198dbe9cc17`. The path list has 11 unique paths. The patch has the same 11 repository-relative entries. It does not include backend, route, schema, seed, graph, projection, or timing-hook paths.

## Prior blocker closure

The Start in-flight state now uses `activityId`, mode, and the current pending ID. A delayed Start for one identity cannot block a different identity.

The frozen submission request map now clears entries only for the identity that receives a new pending attempt. A Start for activity B does not remove the exact retry body for activity A.

The empty-selection effect increments the request revision synchronously. It does not queue a reset that can clear a later pending attempt.

The entry GET captures a request revision. Each Start increments that revision before the request begins. The GET applies its result only when the selected identity and revision still match. Thus, a delayed re-entry GET for the same activity cannot replace a newer Start result. The new regression test reproduces this order.

The Start status stores the selected activity and mode identity. The UI displays the message only while that identity remains selected. Thus, an exhausted or unavailable result for activity A cannot appear beside activity B.

## Behavior review

The read helper uses GET. Start uses POST. Both parsers reject malformed data and identity mismatches. A network failure becomes `unavailable` without static canonical props.

The renderer enables editable controls only for a valid pending allocation. It binds the selected props, ordinal, retry key, and pending submission ID to that allocation. A new pending ID remounts the shared activity and resets timing and local answers.

The submission path freezes one exact request for each activity, mode, and pending ID. The saved-awaiting-details state preserves the receipt, answers, score, maximum score, ordinal, and public props. It does not synthesize graded parts. Its retry action uses GET and cannot resubmit the answer.

A failed or exhausted next Start preserves a final or saved-awaiting-details display. The adjacent message remains owned by that identity. A valid next pending response replaces the old display and clears only same-identity frozen requests.

The repeated-root parser accepts the `x2` part with `maxScore: 0` and an overall `maxScore` of 2. Final views remain read-only. The client does not use static canonical props as an editable fallback.

## Verification

I ran the three regression-heavy application test files. All 58 tests passed:

```text
__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx
__tests__/lib/activities/submission.test.ts
__tests__/lib/activities/quadratic-formula-check.test.ts
```

Two existing negative tests printed React `act(...)` warnings. They did not fail.

The freeze report records 74 application tests and 21 shared tests. It also records successful application lint, build, and post-build TypeScript checks, plus successful shared lint and TypeScript checks.

No blocking defect remains in this client batch. The separate real-browser run remains required by its committed verification scope.
