# Precalculus selected evidence integration plan

## Scope and current state

This plan covers `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs` only.

The selected generator and grader are committed in `078603f8`. The selected submission writer is under revision. Do not integrate its evidence consumer until the writer passes independent review.

The committed evidence route accepts browser-authored evidence. Replace that request with exactly `{ submissionId }`. The server must derive learner identity from the authenticated session. The physical stored submission must supply the mode, answers, assistance, grade, attempt ordinal, and event time.

The pending `convex/learningEvidence.ts` contains a selected `submitTopic11TeacherSubmission` action. This action is absent from the committed `convex/learning-evidence.ts`. Integrate and verify the trusted teacher action, Worked acknowledgement producer, provider, and teacher interface separately. A student acknowledgement alone must not create teacher exposure.

## Required contract preservation

Keep the committed evidence schema, normalization, and `learningEvidenceFingerprintV1` serializer. Preserve its existing database field. Do not expand the fingerprint contract.

Reuse `SubmissionSrsAdapter` and the current card and review stores. Pass the complete selected stored parts and assistance to the adapter. Do not replace them with a fabricated aggregate part.

Keep all effects in one Convex mutation. Use a receipt indexed by learner and physical submission ID. A Convex index is not a uniqueness constraint. The transaction must read the indexed range, reject duplicate records, and insert once. Concurrent transactions must rely on Convex transaction conflict handling.

## Authentication and replay

Validate the active learner profile and matching credential before receipt replay. Validate the opaque submission ID for its table.

Return a valid stored receipt before checking current source publication. A lost response must not repeat evidence or spaced repetition system (SRS) effects after source withdrawal.

For a new effect, validate ownership, exact selected stable and physical activity identities, complete approved mode content, current source approval, the exact stored practice envelope, the server grade, and server time. Reject malformed or foreign submissions without exposing internal details.

Build evidence with a submission-derived idempotency key. Read prior evidence and selected node history before any effect. Reject conflicting attempts. If evidence exists without its required receipt, reject the incomplete state. Do not repeat SRS or synthesize success.

## Teacher exposure and time

The shared evaluator requires teacher exposure at or before the submission event time. Use the immutable server submission time as the practice event time.

A later teaching event cannot qualify an earlier practice attempt. A later delivery of verified exposure can qualify that attempt only when the verified exposure occurred at or before the attempt. The teacher producer must establish this occurrence time. It must not accept a browser-supplied timestamp.

An awaiting decision creates no evidence, receipt, card, or review. A later retry must use the same stored submission time.

After valid exposure, Guided practice can store participation evidence. Keep its evidence ungraded and non-mastery bearing. Preserve the server grade in the physical submission. Guided practice must not update SRS.

After valid exposure, Independent practice can store mastery evidence. Correct and incorrect answers remain valid attempts. Derive the SRS rating from stored part grades and assistance.

## Transaction order and tests

For an eligible Independent attempt, apply SRS, append evidence, and append the receipt within the same mutation. Any thrown operation must roll back all effects.

Test the real selected writer output through the evidence handler. Test Guided participation, correct and incorrect Independent attempts, assistance, foreign identity, malformed stored content, conflicting attempts, source withdrawal, and receipt replay.

Test both temporal cases: exposure after the attempt remains ineligible; delayed delivery of verified earlier exposure can become eligible. Test that inactive credentials cannot replay a receipt.

Test rollback and concurrent duplicate delivery with a transactional test environment. A memory store without rollback does not prove Convex atomicity. Preserve separate tests for effect ordering and duplicate-record rejection.

Run affected tests, lint, a fresh build, and standalone TypeScript. Verify the real student and teacher flow after the required source approval. Passing a hypothetical approved fixture does not approve the curriculum.

## Parent evidence

The parent inspected the committed Precalculus evidence module, the pending selected teacher action, and the shared evaluator. The evaluator checks `teacher.occurredAt <= submission.occurredAt`.

The existing shared evaluator suite passes all 35 tests. Log: `/tmp/q18-evidence-policy-parent-tests.log`. This verifies the shared temporal policy. It does not verify the pending Precalculus teacher action or the new evidence transaction.

Independent review accepts this corrected plan. See `precalc-selected-evidence-plan-review.md`. The pending teacher producer uses truncated lesson-version, phase, and section queries. Repair those lookups before accepting the teacher producer. Runtime implementation remains under Task Q18.
