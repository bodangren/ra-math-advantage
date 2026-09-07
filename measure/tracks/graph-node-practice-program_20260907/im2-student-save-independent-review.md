# IM2 student save independent review

## Scope

This review covers the current changes in:

- `components/student/PerpendicularBisectorPilot.tsx`
- `__tests__/components/PerpendicularBisectorPilot.test.tsx`
- The indexed learning-evidence history query in `convex/activities.ts`

The review compares these files with the three `/tmp/im2-*before` baselines.

## Findings

No blocking defect was found.

The pending ref closes the repeated-click race before React updates the disabled state.
The Worked button, answer input, hint button, and answer button use the saving state.
Two immediate Worked clicks therefore send one request and advance one mode.
The three-mode sequence remains Worked, Guided, and Independent.

The request key is tied to the serialized request body.
A failed request keeps the key and body in the map.
A retry with the same body uses the same key.
An edited response creates a different body and a new key.
A server-confirmed wrong answer removes the old key.
A corrected answer therefore starts a new logical attempt.
A successful response removes the key and advances one mode.

A thrown `fetch` error and a non-OK response both leave the saved request entry available for replay.
The `finally` block releases the pending guard in both cases.
The outer click handler shows the error message.

The Guided hint gate remains correct.
The learner must complete a checked attempt before a hint is available.
The next request body includes the current hint count.
A changed hint count produces a new request key.

## Indexed history query

The schema already defines `by_learner_and_node` with `learnerId` and `nodeId`.
The new query uses both fields in index order.
It returns the same learner-and-node history that the previous collection and filter returned.
It does not broaden the evidence set.
It does not change ordering or eligibility policy.

## Test assessment

The five component tests cover:

- The Guided after-attempt hint gate
- Same-body Worked replay after a failed save
- The complete three-mode sequence
- The repeated-click pending guard
- A new key for an edited response after a failed save

The tests directly inspect request keys and the edited request body.
They exercise the visible mode transitions.
The reported combined backend and component run passed 23 tests.
The reported lint, TypeScript, and build checks passed.

## Disposition

The change is suitable for a bounded standalone commit.
No source edit is required from this review.
