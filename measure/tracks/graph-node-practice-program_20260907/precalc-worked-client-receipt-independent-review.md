# Q26 Worked acknowledgement component independent review

## Decision

Accept the patch.

I found no blocking defect in the reviewed component scope.

## Receipt boundary

`readReceipt` requires a successful HTTP response and an object with exactly three keys: `submissionId`, `attemptOrdinal`, and `submittedAt`.

It requires a nonempty submission ID. It requires a positive integer attempt ordinal. It requires an exact ISO timestamp that round-trips through `Date`.

The checks match the Topic 1.1 route response contract. The route applies the same exact-key, ordinal, and timestamp rules before it sends the response.

The component does not set the saved state or refresh the route until `readReceipt` succeeds. An unsuccessful response, invalid JSON, a malformed success body, or a network failure keeps the component in the retry state.

The component uses one `idempotencyKeyRef`. It creates the key before the first request. It does not replace the key after a failure. It also sends the same empty JSON object on each retry. The malformed-receipt and network-failure tests verify these properties.

The component uses one safe error message. It does not show a server error or a transport error to the learner.

## Render and projection contract

The tests render the real `PrecalculusTopic11DailyCurriculumPilot`. They click the real review button and inspect the actual fetch request, status text, retry button, and disabled saved state.

The component receives `stableActivityId` and `activityProps` from the Q24 projection. The lesson page requires the projected database activity ID and component key before it renders the component. The dashboard uses the separate Worked projection. The component passes the projected stable ID to the interval activity.

The component sets `activityId` and `mode="teaching"` after it spreads the projected renderer props. Renderer props cannot replace these two values.

The request body remains `{}`. It does not add learner answers, a client score, an attempt number, or a client timestamp.

## Verification

I ran the focused component and route tests in `/tmp/precalc-q26-candidate-20260908/apps/pre-calculus`:

```text
npx vitest run \
  __tests__/app/api/activities/precalculus-topic-1-1/submissions/route.red.test.ts \
  __tests__/components/student/PrecalculusTopic11DailyCurriculumPilot-receipt.test.tsx \
  __tests__/components/student/PrecalculusTopic11DailyCurriculumPilot.red.test.tsx

3 test files passed.
35 tests passed.
```

The reviewed patch changes only the component and its two component test files. It does not change publication, grading, teacher evidence, or graph approval.
