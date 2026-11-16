# IM1 pilot app integration

Date: 2026-09-07

## Current boundary

The IM1 practice page starts or reads an SRS session in `apps/integrated-math-1/app/student/practice/page.tsx`. It passes the session, queue, and student identifier to `PracticeSessionProvider`.

`apps/integrated-math-1/components/student/PracticeSessionProvider.tsx` only displays the session identifier and the first objective identifier. It does not render an activity. It does not collect a response. It does not submit a response.

`apps/integrated-math-1/convex/queue/queue.ts` resolves an SRS card through `practice_items.problemFamilyId`. It then copies `activities.componentKey` and `activities.props` into the queue result. The result does not include `activityId`. The copied props are a snapshot. A client submission cannot use them as grading authority.

IM1 has no student practice submission route. Its `activity_submissions` table has no idempotency key or attempt ordinal. IM1 also has no durable exact-node learning-evidence table.

## Pilot identity

Use the current approved translation pilot only:

`math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`

Use one stable activity identity for each mode:

- Worked Example: `worked_example`
- Guided Practice: `guided_practice`
- Independent Practice: `independent_practice`

Do not infer the node from `componentKey`, renderer props, a standard, or a lesson. Store the exact node identity on the server-owned activity row.

## Minimum server data

Extend the existing `activities` table in `apps/integrated-math-1/convex/schema.ts`. Add these fields:

- `stableActivityId: string`
- `masteryNodeId: string`
- `learningEvidenceMode: worked_example | guided_practice | independent_practice`
- `srsEligible: boolean`

Add an index on `stableActivityId`. The seed mutation must create or update each pilot activity by this stable identity.

Keep these current fields:

- `componentKey`
- `displayName`
- `description`
- `props`
- `gradingConfig`
- `approval`

The renderer key, prompts, constraints, and answer-part configuration already belong in `componentKey`, `props`, and `gradingConfig`. Do not add duplicate columns for them.

Extend `practice_items` only if queue lookup must distinguish modes. Add `mode` in that case. Its current `activityId`, `problemFamilyId`, and `variantLabel` already define the activity link and variant family.

Extend `activity_submissions` with these fields:

- `attemptOrdinal: number`
- `idempotencyKey: string`
- `masteryContractVersion: string`

Add indexes on `(userId, activityId, idempotencyKey)` and `(userId, activityId, attemptOrdinal)`.

Keep `score`, `maxScore`, `feedback`, `gradedAt`, and `submissionData`. Store the validated raw response in `submissionData`. Store the server grade in the existing score fields. The client must not submit or select the authoritative score.

Add one `learning_evidence` table for accepted evidence. Reuse the `practice.v1` evidence fields from `measure/practice-component-contract.md` and the existing IM3 contract:

- `learnerId`
- `nodeId`
- `submissionId`
- `activityId`
- `attemptOrdinal`
- `origin`
- `mode`
- `occurredAt`
- `gradedEvidence`
- `idempotencyKey`
- `createdAt`

Index `(learnerId, nodeId)`, `(learnerId, idempotencyKey)`, and `(learnerId, submissionId)`. A separate receipt table is not necessary for the first IM1 pilot if the mutation writes the submission and evidence in one transaction. The unique lookup and canonical-request comparison provide the replay boundary.

Do not persist these derivable values:

- renderer props copied from the activity
- lesson or module from the node catalog
- percent score, because `score / maxScore` derives it
- correctness when the stored score and grading rule derive it
- a second queue snapshot
- a second activity-to-node mapping

## Server-owned seed

Add a narrow idempotent internal seed mutation under `apps/integrated-math-1/convex/seed/`. Use the established seed style in that directory.

The seed must persist three activity rows. Each row must have the exact stable activity identity, exact node identity, exact mode, renderer key, validated mode props, and grading configuration. Set `srsEligible` to `false` for Worked Example. Set it to `true` only for approved Guided Practice and Independent Practice modes.

The seed must also persist the required `practice_items` links. It must not create broad course activities from every blueprint.

Use a fixed server-owned generator seed for each rendered attempt, or derive it deterministically from the stable activity identity and attempt ordinal. Persist the selected seed in `submissionData`. On replay, return the stored result. Do not generate a new variant for the same idempotency key.

## Queue contract

Update `ResolvedQueueItem` in `apps/integrated-math-1/convex/queue/queue.ts`. Include `activityId`, `stableActivityId`, `masteryNodeId`, and mode. Keep `componentKey` and props for display.

When the queue resolves an item, require all of these conditions:

- The activity has the approved pilot stable identity.
- `masteryNodeId` equals the SRS card `objectiveId`.
- The activity approval is current and approved.
- The mode is allowed for the current step.

Skip a row that fails this check. The queue must not repair or infer an identity.

## Authenticated submission route

Add a route at `apps/integrated-math-1/app/api/activities/[activityId]/submissions/route.ts`, or use one fixed pilot route if the dynamic route would expose unsupported activities.

Follow the Precalculus route boundary in `apps/pre-calculus/app/api/activities/precalculus-topic-1-5-polynomial-inequality-worked/submissions/route.ts`:

1. Call the IM1 request-auth helper.
2. Require the `student` role.
3. Read the learner identity from the session claim.
4. Require the `Idempotency-Key` header.
5. Parse the JSON body as `unknown`.
6. Validate an exact submission envelope and reject extra or malformed fields.
7. Call one IM1 internal mutation through `fetchInternalMutation`.
8. Map an idempotency conflict to HTTP 409.
9. Return the stored server result.

Do not accept `studentId`, `masteryNodeId`, mode, score, or expected answer from the request body. The route gets the student identifier from `requireStudentSessionClaims` or a request form of the same helper. The mutation gets the node, mode, generator seed, and rubric from the server activity row.

## Submission mutation

Add a narrow internal mutation in `apps/integrated-math-1/convex/activities.ts`. Reuse the structure of `createServerOwnedSubmissionHandler` in `apps/integrated-math-3/convex/activities.ts`.

The mutation must do these operations in one transaction:

1. Load the activity by `activityId`.
2. Require the exact pilot stable identity and exact node identity.
3. Require the expected component key, mode, approval, and `srsEligible` value.
4. Validate the raw response against the server-owned answer-part contract.
5. Query `(userId, activityId, idempotencyKey)`.
6. Return the stored result when the canonical request is identical.
7. Throw `idempotency_conflict` when the key has different content.
8. Calculate the next attempt ordinal on the server.
9. Regenerate the expected answer from the stored seed and activity contract.
10. Grade the raw response on the server.
11. Insert `activity_submissions` with the raw response, seed, ordinal, grade, and contract version.
12. Insert exact-node `learning_evidence` when policy permits it.

Worked Example evidence must use `origin: teacher_led`. It must be non-mastery-bearing. Guided Practice and Independent Practice evidence can use `origin: mastery_advantage` only after the approved exposure rule permits it. A failed or incomplete response can remain a stored submission without creating mastery-bearing evidence.

The mutation must write evidence for `activity.masteryNodeId` only. It must not write evidence for a concept, lesson, standard, parent objective, or child objective.

## Three-mode student flow

Replace the identifier-only body of `PracticeSessionProvider` with the existing activity registry and renderer path used by IM1 lessons. Keep one client state machine for the three modes.

The flow is:

1. Render Worked Example.
2. Submit or acknowledge its server-owned attempt.
3. Render Guided Practice after the Worked Example result succeeds.
4. Submit the raw guided response.
5. Show the server grade and feedback.
6. Render Independent Practice after the Guided Practice completion rule succeeds.
7. Submit the raw independent response.
8. Show the server grade and move to the next queue item.

Create one idempotency key for each visible attempt. Keep it stable during retries. Create a new key only when the student starts a new attempt. Disable duplicate submit actions while the request is pending.

The client can display local input validation. It must use the server response for correctness, score, progression, and evidence state.

## Required tests

- The page requires a student session and uses the claim learner identifier.
- The queue returns the server activity identifier and exact mastery node.
- A queue row with a mismatched card objective and activity node is absent.
- The seed is idempotent and persists exactly three pilot modes.
- Each mode renders from its validated mode specification.
- The route rejects missing auth, a non-student role, invalid JSON, a missing idempotency key, and extra body fields.
- The mutation rejects a forged node, mode, score, expected answer, seed, and unsupported activity.
- The server grade comes from the stored seed and rubric.
- An identical retry returns the same submission, grade, seed, and evidence result.
- A changed request with the same idempotency key returns a conflict.
- Worked Example evidence is non-mastery-bearing.
- Guided Practice and Independent Practice evidence name only the exact pilot node.
- A wrong response does not create mastery-bearing evidence.
- The three-mode client flow waits for each server result before it advances.

## Small implementation order

1. Add the schema fields and indexes.
2. Add the three-row pilot seed.
3. Add the queue identity fields and fail-closed checks.
4. Add the internal submit mutation and exact-node evidence write.
5. Add the authenticated route.
6. Render the three modes in `PracticeSessionProvider`.
7. Add one end-to-end pilot test for seed, render, submit, replay, grade, and exact-node evidence.

This design reuses the current activities, practice items, SRS queue, session page, activity registry, server fetch wrapper, and practice evidence contract. It adds no generic engine and no projection table.
