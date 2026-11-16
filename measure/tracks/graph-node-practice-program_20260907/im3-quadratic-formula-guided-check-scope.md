# Guided discriminant check implementation scope

## Current flow

This review uses committed HEAD and the active IM3 candidate.
The shared QF component has hints but no intermediate check.
Its root fields are available before the discriminant is checked.
PhaseRenderer selects exact Guided metadata.
ActivityRenderer forwards runtime callbacks after authored props.
The strict final submission already regenerates the private answer.
Its relation validation is inline in convex/activities.ts.
The exact discriminant parser already exists in quadratic-formula-grader.ts.
Do not copy that parser.

## Server behavior

Add one authenticated POST route at /api/activities/quadratic-formula/check.
Use requireStudentRequestClaims and the existing fetchInternalQuery wrapper.
Accept only activityId, fieldId equal to discriminant, and a bounded string rawAnswer.
Derive the profile ID from verified request claims.
Do not accept a client profile ID, seed, equation, answer key, or mode.
Return only an isCorrect boolean on success.
Use private, no-store response headers.
Return a generic error on authority or service failure.
Do not return internal exception text.

Add one internalQuery in the existing activities module.
Validate arguments and the exact return shape.
Recheck the active student profile and credential relation.
Extract the existing QF activity, draft graph, item, reverse-item, and private variant checks into one local helper compatible with QueryCtx.
Use this helper from both the final writer and the check query.
Preserve all current authority checks and indexed cardinality limits.
The check query must select the Guided mapping only.
It must reject Independent and Worked identities.
Use the stored public props and private seed to regenerate the problem.
Reuse one authority helper in server-grading.ts for both grading and checking.
Reuse gradeQuadraticFormulaResponse for the discriminant comparison.
Do not expose canonical values or grade parts through the check result.
The query must not write a submission or schedule progression.

## Component behavior

Add an optional onCheckDiscriminant callback to the shared QF component.
The callback accepts the raw string and resolves to a boolean.
The shared component must not import an app route or private generator.
Pass the callback through ActivityRenderer.
In PhaseRenderer, supply the callback only for the exact Guided selection.
Use a small function in the existing submission helper module to call the route.
Validate the response boolean before resolving the callback.

In Guided mode, keep root inputs and final submission unavailable until the current discriminant receives a correct check.
Show a Check discriminant button and pending, incorrect, correct, and service-failure feedback.
Keep roots unavailable when the callback is missing.
Do not treat a failed request as a correct or incorrect mathematical answer.
An edit must invalidate the accepted discriminant and clear dependent root answers.
A response for an older value or activity must not unlock the current fields.
Use a local request sequence or equivalent direct state to reject stale responses.
Do not add persistent check state.
Independent and Worked behavior must remain unchanged.
The final submission retains the existing three-part envelope and receipt contract.

## Production paths

- packages/activity-components/src/components/algebraic/QuadraticFormulaActivity.tsx
- apps/integrated-math-3/components/lesson/ActivityRenderer.tsx
- apps/integrated-math-3/components/lesson/PhaseRenderer.tsx
- apps/integrated-math-3/lib/activities/submission.ts
- apps/integrated-math-3/lib/activities/server-grading.ts
- apps/integrated-math-3/convex/activities.ts
- apps/integrated-math-3/app/api/activities/quadratic-formula/check/route.ts

No schema, seed, graph, package dependency, registry, or published placement change is required.
Use the existing generated activities module reference.
Do not run a live deployment or seed as part of this local batch.

## Required evidence

Write failing behavioral tests before implementation.
Exercise correct, incorrect, malformed, oversized, and unauthorized requests.
Verify that client identity and private-field overrides are rejected.
Run authority cases for missing or duplicate item and variant relations, wrong mode, wrong seed, stale public equation, and non-draft graph state.
Assert an exact boolean-only response with no private data.
Assert no insert, patch, delete, or scheduler call for the check.
Keep final writer replay, privacy, and no-progression regressions green after the shared helper extraction.
Test root gating, missing callback, pending state, failed check retry, edited discriminant, and out-of-order responses in the shared component.
Test the real PhaseRenderer callback path and preserve Independent behavior.
Run relevant app and package tests, lint, builds, and separate TypeScript checks.
Real browser verification remains required before learner approval.

## Status

Parent source tracing is complete.
The assigned subagent stopped at the account usage limit before writing its scope report.
Independent scope review remains pending.
No Guided check code has been written in this batch.

## Independent scope acceptance

The reviewer resumed and accepts the backend-first scope.
The client callback must bind the stored activity ID from the trusted section.
The route receives that ID as untrusted input and verifies its stored Guided authority.
The final writer must retain its complete three-part validation and grading.
Backend implementation review and component integration remain open.
