# Precalculus Q18 selected evidence v5 independent review

## Result

Revise the route receipt projector before integration. The handler and store flow resolve the prior evidence defects. The route still accepts internally inconsistent receipt and decision combinations.

## P1 — The route validates enum members but not their semantic combination

`projectDecision` validates each field separately. `projectResult` validates only three cross-field rules. It can return HTTP 200 for this impossible result:

```ts
{
  persisted: true,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'conflict',
    exposureState: 'awaiting_teacher_exposure',
    eligible: false,
    reason: 'eligible',
    masteryBearing: false,
  },
}
```

The `reason: 'eligible'` value requires an eligible, introduced, mastery-bearing decision for this selected Independent path. The example instead combines conflict, awaiting exposure, and non-mastery fields. The current checks accept it because `persisted` is true and `masteryApplied` is false.

A second invalid result also passes:

```ts
{
  persisted: true,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'ungraded_evidence',
    masteryBearing: true,
  },
}
```

For this consumer, `ungraded_evidence` is Guided participation. It must be non-mastery-bearing and must not report `eligible: true`.

Use the three actual selected result states as the minimum route contract:

- Awaiting: `persisted:false`, `masteryApplied:false`, `delivery:'new'`, `reason:'awaiting_teacher_exposure'`, `eligible:false`, `exposureState:'awaiting_teacher_exposure'`, and `masteryBearing:false`.
- Guided participation: `persisted:true`, `masteryApplied:false`, `delivery:'new'` or `'replay'`, `reason:'ungraded_evidence'`, `eligible:false`, `exposureState:'introduced'`, and `masteryBearing:false`.
- Independent evidence: `persisted:true`, `masteryApplied:true`, `delivery:'new'` or `'replay'`, `reason:'eligible'`, `eligible:true`, `exposureState:'introduced'`, and `masteryBearing:true`.

Require the actual evaluator `idempotency` value for each stored decision. Do not accept `conflict` inside a successful receipt. The handler returns attempt conflict through the separate rejected result.

Add direct route tests for the two malformed combinations above. Expect status 500 and the controlled error body.

## Verified corrections

The route accepts one opaque physical submission ID. It derives the learner from `requireStudentRequestClaims`. It rejects client learner and evidence fields. The production call uses `internal['learning-evidence'].submitSelected`. The runtime test checks the real hyphenated function name.

The handler authenticates the active learner before receipt lookup. The composition test disables the credential after a durable receipt. Replay then rejects and creates no additional effect.

The evidence handler accepts the committed writer's stored shape. It checks the exact top-level, answer, and part keys. It preserves `hintsUsed`, `revealStepsSeen`, and `changedCount`. It independently grades the stored answers.

The writer-to-store composition test passes the full stored envelope to the real `SubmissionSrsAdapter`. A correct Independent response with three total hints produces `Hard`. An incorrect response with six total hints produces `Again`. The stored physical submission keeps the server score and assistance values.

Guided evidence remains ungraded and does not create an SRS review. Independent evidence stores the server grade and one SRS review. Durable replay does not create a second evidence row, receipt, card review, or card update.

The source identity check binds the physical activity row, stable activity ID, component, title, description, node, mode, approval, and variant. A changed source fails closed before effects.

The temporal policy remains correct. Only teacher evidence with `occurredAt` at or before the immutable submission time qualifies the attempt.

## Verification limit

The in-memory database harness exercises the real writer, evidence handler, evidence store adapter, receipt store adapter, and SRS adapter. It is stronger than isolated dependency mocks. It is not a Convex transaction engine. It does not prove rollback after a late write failure or concurrent insert conflict retry.

Keep the accepted plan requirement for a real Convex transactional test. Do not install `convex-test` in this patch.

The trusted teacher producer and user interface remain separate prerequisites. The positive fixtures insert teacher history directly. They do not prove the production teacher mutation, assignment checks, or source lookup.

No candidate or main file changed during this review.
