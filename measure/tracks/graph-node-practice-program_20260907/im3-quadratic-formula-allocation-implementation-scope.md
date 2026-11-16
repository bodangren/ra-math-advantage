# IM3 Quadratic Formula allocation implementation scope

## Decision

Implement immutable learner attempts with the existing submission, activity, item, and variant tables. Add only the optional `activity_submissions.allocatedVariantKey` string field. The server writes it. Never accept it from a learner or include it in public output.

The first pending attempt reuses the existing fixed variant. Later variants are shared by learners of the same mode. Keep the existing four metadata fields: generatorKey, seed, stableActivityId, and mode. Do not add a table, index, metadata version, hash, or registry.

## Private variant schedule

Keep Guided canonical seed 1 and Independent canonical seed 2. Use later Guided seeds 7, 12, and 4. Use later Independent seeds 8, 14, and 30. The first canonical problem has irrational roots. The later problems have distinct integer roots, a repeated root, and complex roots, in that order.

The canonical key remains the fixed stable activity ID. Later keys are `<stableActivityId>.variant.<index>`, where index is 1, 2, or 3 in the later schedule. Never derive a seed from the learner ordinal. The schedules were executed against the candidate generator and contain distinct equations and solution sets.

This is a finite initial implementation. It does not establish unlimited practice or full course coverage. Exhaustion returns an explicit unavailable state and creates no rows.

## Attempt storage and selection

A pending row has the existing required learner, fixed activity, timestamps, practice.v1 envelope, ordinal, and retry key fields. Its status is `submissionData.status: draft`. Its answers and parts are empty. It has no score, grade, timing, mastery contract, evidence, or scheduler effect.

The row stores the selected allocatedVariantKey. Its authoritative ordinal is the next learner/activity ordinal. Set its attemptNumber to the same ordinal. Use a server retry key derived from the inserted row ID, with a short QF prefix. The insert and key patch occur within one transaction. No intermediate row is public.

A learner with no prior submission starts on the canonical variant. A learner with a final canonical or legacy row starts later index 1 on the next explicit Start action. A final suffix index advances to the next index. Legacy ordinals do not consume schedule entries. Validate the allocated sequence and selected relations. Reject duplicate, skipped, unknown, mismatched, or exhausted keys without writes.

Reuse a valid pending row. Two concurrent Start requests must return the same pending row. Different learners at the same later position reuse one exact shared variant and item. Validate before mutation. Do not patch existing variants or items.

## Authority and replay

Validate active learner identity, the exact fixed activity and mode, canonical draft graph state, and the selected private relation. Select canonical and later items by their exact variant keys. Each key must have one item tied to the fixed activity and one valid variant. Keep exact objective, component, seed, mode, and metadata checks. Valid later items must not break canonical authority. Reject malformed extra relations in seed reruns.

Separate fixed activity identity from selected variant props. Generate public props from the selected private seed. Parse them with the current component schema. Keep the existing equation equality check in the grader. Keep the fixed stored activity props unchanged.

Look up a matching retry key after identity and request validation. Preserve legacy same-key and same-body finalized replay before requiring a pending handle. Legacy rows without allocatedVariantKey always use the canonical seed, even when their ordinal exceeds one. New non-replay QF submissions require a learner-owned pending handle. Require the submitted attemptNumber to equal the pending ordinal before writes. Do not accept a different value and then replace it, because that breaks exact request replay. Finalize that same row. Preserve its identity, ordinal, private reference, key, and creation time. Keep exact Convex-serialized body comparison for retries.

## HTTP and public state

Add one attempt route with GET for current state and POST for explicit Start. Both use authenticated claims and exact activity/mode validation. GET never allocates. It returns no-attempt, pending, or final state. POST returns an existing pending state, creates the next pending state, or returns exhausted state.

Pending output contains only state, pending submission ID, fixed activity ID, mode, authoritative ordinal, opaque retry key, and validated public props. Final output contains the fixed activity identity, mode, ordinal, public props, saved receipt ID, score, maximum score, submitted answers, and graded parts. Select only the three QF answer keys. Select only partId, rawAnswer, isCorrect, score, and maxScore from each graded part. Do not return the full submission document or its private reference. Use exact output validators and private no-store responses.

Keep the final practice.v1 JSON body unchanged. Carry the optional pending handle in a dedicated `X-Pending-Submission-Id` header. Pass it as an optional internal writer argument. Reject a pending handle on a non-QF request. Old finalized retries can omit it.

Add pendingSubmissionId to the Guided check HTTP body and internal query arguments for allocated attempts. Bind the ID in the parent callback closure later. The shared rawAnswer-only callback stays unchanged. The response remains exactly one isCorrect boolean. It must check the selected learner-owned pending variant.

## Seed rerun

Change only QF relation validation in the Lesson 1.6 seed. Validate the exact canonical item and variant by key. Allow only valid scheduled later relations. Reject malformed extras. Preserve all existing canonical and later variant/item bytes. Do not change source Worked phases or deployed versions. Do not run a live seed in this source batch.

## Backend paths

- `apps/integrated-math-3/convex/schema.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/lib/activities/server-grading.ts`
- `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
- `apps/integrated-math-3/app/api/activities/quadratic-formula/attempt/route.ts`
- `apps/integrated-math-3/app/api/activities/quadratic-formula/check/route.ts`
- `apps/integrated-math-3/app/api/activities/submissions/route.ts`

Use the existing writer, seed, grading, and route tests. Add focused attempt-route and allocation tests as needed. List exact test paths before editing. Client integration is the next required batch. The teacher/export correction runs separately.

## Required proof

Write failing tests before code. Prove canonical first use, legacy first-next behavior, each later regime, distinct problems, fixed props preservation, shared relation reuse, pending reload, final reload without allocation, explicit next, exact retry, ownership, mode isolation, invalid relation rejection, and exhaustion without effects. Prove repeated-root scoring uses the existing two-point maximum. Preserve generic writer rejection of QF-linked activities.

Prove seed reruns preserve all variant and item records after later allocations. Prove the full public outputs contain expected learner data and no private variant key, seed, metadata, or canonical-answer sentinel. Use both pending and final rows in consumer regressions. Pending rows must not produce evidence, competency, SRS, or scheduler effects.

Memory fixtures do not prove Convex transaction concurrency or rollback. Real local transaction and browser verification remain required before learner rollout. This source batch does not publish the draft graph or mark those requirements complete.

## Bounded history read

Use the existing `by_user_activity_attempt_ordinal` index. Query one learner and one fixed activity. Order by ordinal in descending order. Read at most six rows.

The six rows have these roles:

1. Up to four allocated rows cover the complete finite schedule.
2. One legacy row is the transition anchor.
3. One older legacy row is the excess sentinel.

Do not set a maximum on the number of legitimate finalized legacy rows.

Validate every row in the tail that affects the current state. Require a positive safe ordinal. Require strictly descending unique ordinals in the inspected tail. Require adjacent ordinals only within the allocated prefix and at its transition from the newest legacy row. Do not require older legacy ordinals to be contiguous. Require the exact fixed activity and mode in the envelope. Require all allocated rows to form the newest contiguous prefix of the tail. Require at most four allocated rows. Require no more than one pending row. Require a pending row to be the newest row. Apply the full pending or final row validator to each allocated row.

Reverse the allocated prefix before schedule validation. If the tail has no legacy anchor, require the allocated keys to start with canonical index 0 at ordinal 1. If the tail has a legacy anchor, require the allocated keys to start with suffix index 1 immediately after that anchor. Require each later key to advance by one. Reject duplicate, skipped, unknown, and exhausted keys.

Use the newest row for `GET`. Use its ordinal plus one for a new pending row. Select the next schedule index from the newest validated allocated key. If there is no allocated row, select canonical index 0 when the tail is empty. Select suffix index 1 when a legacy anchor exists.

Keep exact retry lookup on `by_user_activity_idempotency_key`. This index gives a bounded single-row read. Validate learner, activity, handle, body, and selected relation after the lookup.

The fifth allocated row is an excess sentinel. It makes an overlong allocated suffix fail. A legacy anchor after four allocated rows also makes the sequence fail because a legacy transition can use only suffix indexes 1 through 3. The row after the anchor checks the immediate legacy boundary and ordinal order without reading the full legacy prefix.

This bounded read detects all invalid allocated sequences that the current writer can create or receive. It detects an invalid latest legacy row and an invalid transition boundary. It does not validate every row in an arbitrarily long legacy prefix.

This design needs one explicit append-only writer assumption: all rows before the inspected legacy anchor were created by the prior server writer and are finalized legacy rows with valid positive ordinals. All legacy receipts predate the first allocated row. The current writer enforces this transition. After the first allocated row exists, it permits only exact indexed legacy replay or finalization of the learner-owned pending row. It does not create a new legacy row. Under this rule, an older allocated row or an older pending row cannot exist behind a newer legacy prefix.

Add focused tests for zero rows, a long legacy prefix, three later rows after a legacy prefix, four canonical-to-later rows without legacy history, a fifth allocated row, an allocated row after a legacy boundary, duplicate or skipped allocated keys, duplicate pending rows, an invalid newest row, and exact legacy replay through the idempotency index.
