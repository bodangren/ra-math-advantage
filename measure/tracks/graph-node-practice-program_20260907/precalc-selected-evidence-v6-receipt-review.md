# Precalculus Q18 evidence v6 receipt review

## Result

Accepted. I found no blocking defect in the receipt correction.

## Semantic review

The route now accepts only the three states that the selected evidence handler can produce.

- Awaiting teacher exposure has `persisted:false`, `masteryApplied:false`, `delivery:'new'`, `reason:'awaiting_teacher_exposure'`, `eligible:false`, `exposureState:'awaiting_teacher_exposure'`, and `masteryBearing:false`.
- Guided participation has `persisted:true`, `masteryApplied:false`, `reason:'ungraded_evidence'`, `eligible:false`, `exposureState:'introduced'`, and `masteryBearing:false`.
- Independent evidence has `persisted:true`, `masteryApplied:true`, `reason:'eligible'`, `eligible:true`, `exposureState:'introduced'`, and `masteryBearing:true`.

The route requires `decision.idempotency:'new'` for a successful result. This is correct for both deliveries. The handler stores the original decision in the receipt. A receipt replay changes only the top-level `delivery` field to `replay`. It does not recompute the decision as an evaluator replay.

The awaiting state cannot report replay delivery because the handler does not store a receipt for that state. Guided and Independent receipt replays remain valid because the projector permits both top-level delivery values while it retains the stored `idempotency:'new'` decision.

The `eligible` state remains mastery-bearing even when the independently graded answer is wrong. This is required. The SRS bridge must process an eligible wrong answer as an `Again` review. The route does not confuse correctness with mastery eligibility.

The projector continues to return only the safe result fields. It rejects malformed combinations with the controlled HTTP 500 response.

## Test review

The five new cases cover the inconsistent combinations from the v5 review. They also cover a false mastery application, an invalid awaiting replay, and an evaluator-style replay decision inside a stored receipt.

The existing production route test confirms that a valid stored receipt replay has top-level `delivery:'replay'` and retains `decision.idempotency:'new'`.

I ran these related suites:

- receipt contract
- route contract
- production route
- selected Topic 1.1 evidence
- selected writer-to-evidence flow

Result: 5 files passed and 43 tests passed.

## Scope

This review covers only the route receipt projection and its new regression test. It does not replace the separate transaction-engine, trusted teacher producer, or source-publication reviews.
