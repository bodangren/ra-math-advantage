# Q37 Stale Source Writer Fix Proposal

## Defect

The browser submission route accepted a new Guided submission while the selected Worked source was stale.

`createServerOwnedSubmission` validates the learner identity, publication, and selected practice activity. It does not validate the learner's current Topic 1.1 delivery state before a new insert.

The existing `getTopic11LearnerDeliveryStateHandler` already validates:

- the current approved Worked source identity,
- a valid acknowledgement for that source,
- the exact teacher confirmation for that acknowledgement.

## Minimum implementation

Keep the accepted idempotent replay branch before the delivery-state check. This permits a same-tuple retry after the server accepted a request, even if source state changes before the retry response.

Before a new Guided or Independent insert, call `getTopic11LearnerDeliveryStateHandler` for the learner. Require `ready_for_practice`. Throw the exact internal marker `practice_unavailable` for all other states.

Map `practice_unavailable` in the existing route to a safe non-success response. Use HTTP 409 with `{ error: "Practice is not available" }`. Keep the current 409 idempotency-conflict response unchanged. Keep other internal failures mapped to the existing generic 500 response.

Do not add a fingerprint, schema field, stored authority value, or new helper.

## Test-first scope

Change four paths:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/__tests__/convex/selected-topic11-submission-writer.test.ts`
- `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`
- `apps/pre-calculus/__tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

Add writer regressions for:

- no acknowledgement,
- acknowledgement without teacher confirmation,
- stale Worked source after confirmation,
- ready learner new insert,
- accepted same-tuple replay after later source staleness.

Add route regressions for direct and wrapped `practice_unavailable` errors. Assert HTTP 409 and the exact safe response. Assert that unrelated backend errors remain HTTP 500.

No UI, query, schema, fixture, source publication, graph, seed, or evidence writer change is required.
