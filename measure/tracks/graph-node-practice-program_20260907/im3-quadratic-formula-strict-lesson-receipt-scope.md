# IM3 quadratic-formula strict lesson receipt scope

## Finding

This review uses committed `HEAD` and the explicit IM3 candidate as the baseline.
The dirty main working tree has an unrelated `submissionKeys` map.
The committed renderer and the candidate do not have that map.
This scope does not treat the dirty-main map as existing behavior.

The existing server-owned create path is sufficient.
The learner callback must use it only for an exact quadratic-formula section.
The batch does not need a new route, table, variant allocation, or progression call.

The shared `QuadraticFormulaActivity` creates one `practice.v1` envelope.
It sends `activityId`, `mode`, `status`, `attemptNumber`, `submittedAt`, `answers`, and `parts`.
It freezes that envelope before the first request.
It retries the same envelope after a rejected callback.
It calls `onComplete` only after the callback resolves.

`PhaseRenderer` passes the outer stored activity ID to `LessonRenderer` as the first callback argument.
The payload also contains an activity ID.
`LessonRenderer` does not compare these two IDs.
A mismatched payload can submit one activity and mark a different section complete.
The batch must reject this mismatch before any request or completion state change.

`LessonRenderer` currently sends ordinary activities through `submitActivity`.
It marks the activity complete before the request.
It also ignores a resolved `{ success: false }` result.
This behavior can unlock the phase without a receipt.
The batch must mark completion only after a positive receipt.
It must throw when either submission helper returns `{ success: false }`.
This correction must apply to the directly affected generic path and the new strict path.

## Exact selected identities

Use the active phase section as the trusted selection source.
Do not select the strict path from the client payload.
Do not select it from `componentKey` alone.

The Guided fixture must match all these fields:

- `componentKey`: `quadratic-formula`
- `stableActivityId`: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.guided_practice`
- `masteryNodeId`: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`
- `learningEvidenceMode`: `guided_practice`
- `srsEligible`: `false`
- public `activityProps.presentationMode`: `guided`

The Independent fixture must match all these fields:

- `componentKey`: `quadratic-formula`
- `stableActivityId`: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.independent_practice`
- `masteryNodeId`: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`
- `learningEvidenceMode`: `independent_practice`
- `srsEligible`: `false`
- public `activityProps.presentationMode`: `independent`

Require the payload mode to equal the selected section mode.
Require the payload activity ID to equal the outer section activity ID.
Reject a nonmatching stable ID, node ID, component key, mode, or `srsEligible` value before a request.
An unrelated section keeps the generic path. A section that identifies QF through its component, stable ID, or node but fails the exact contract must be rejected before any write.
The strict backend remains the authority for the stored activity, item, variant, draft status, generated answer, and grade.

## Minimum production changes

Change two production files:

1. `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
   - Resolve the submitted activity from the active phase sections.
   - Validate the outer and payload activity IDs before all writes.
   - Match the exact Guided or Independent QF identity from the section.
   - Call `createServerOwnedActivitySubmission` for an exact QF match.
   - Forward the complete frozen envelope, including `submittedAt` and all permitted telemetry.
   - Add the minimum QF retry state that reuses one idempotency key for the same frozen request.
   - Treat only `{ success: true, submissionId }` as a receipt.
   - Keep the activity incomplete after a rejection, a resolved failure, or an invalid receipt.
   - Delete retry state only after success.
   - Keep draft QF submissions free of a progression call.
   - Move generic completion after its positive receipt.

2. `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
   - Derive the QF component mode from the exact trusted section metadata.
   - Pass `guided` for the exact Guided section.
   - Pass `practice` for the exact Independent section.
   - Keep all existing Worked and unrelated mode rules.

Do not change `lib/activities/submission.ts`.
Its `createServerOwnedActivitySubmission` function already preserves a supplied idempotency key, builds the envelope, calls `/api/activities/submissions`, rejects HTTP failures, and requires a nonempty `submissionId`.
Do not change the route, Convex writer, schema, seed, graph, or activity component in this batch.

## Minimum behavioral tests

Change two existing test files:

1. `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`
   - Execute an exact Guided fixture and an exact Independent fixture.
   - Assert that each uses `createServerOwnedActivitySubmission` and never uses `submitActivity`.
   - Assert exact forwarding of activity ID, selected mode, status, attempt number, timestamp, answers, parts, and permitted telemetry.
   - Assert that completion occurs only after a positive receipt.
   - Assert that a resolved failure keeps the phase locked and shows retry feedback through the component.
   - Assert that an ambiguous rejection retries the exact payload and idempotency key.
   - Assert that a double submit makes one in-flight request.
   - Assert that an outer/payload activity-ID mismatch makes no request and does not complete the section.
   - Use table cases for each selected identity field and confirm that one changed field does not enter the strict QF path.
   - Confirm that the generic path also waits for `{ success: true }` and does not complete on `{ success: false }`.
   - Assert that no QF case calls the learning-evidence progression helper.

2. `apps/integrated-math-3/__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx`
   - Render exact Guided and Independent sections under the normal lesson mode.
   - Assert the Guided fixture shows Guided behavior and emits `guided_practice`.
   - Assert the Independent fixture emits `independent_practice`.
   - Assert that a metadata mismatch does not receive a selected QF mode.
   - Preserve the current rejected-promise retry test and exact same-envelope assertion.

The tests must use direct draft fixtures.
They must not add either draft activity to a published learner lesson.
They must not claim approval or learner placement.

## Scope

The minimum scope is four paths: two production files and their two existing behavioral test files.
The batch has no learner placement.
It has no new route or storage.
It has no progression effect.
It does not change approval state.

## Parent constraints

Use only committed HEAD or the explicit IM3 candidate as the baseline. Do not import `server-grading.ts` into a client component. It imports the private generator and seed mapping. Keep public identity selection in the existing renderer modules and reuse one selector where practical. No new registry is required. Preserve the original timestamp and all accepted telemetry. Reject an unknown outer activity ID or a mismatched payload ID before writing. The generic branch must also require a positive receipt before completion.
