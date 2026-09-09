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
