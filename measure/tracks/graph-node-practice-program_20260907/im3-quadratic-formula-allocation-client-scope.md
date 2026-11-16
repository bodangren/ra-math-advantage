# IM3 Quadratic Formula allocation client scope

## Decision

Use the existing five client paths. Keep `LessonRenderer` as the attempt state owner. Keep `PhaseRenderer` as the section adapter. Keep the app `ActivityRenderer` as the timing and retry-envelope boundary. Keep `QuadraticFormulaActivity` as the Quadratic Formula user interface.

Do not add a registry, context, store, schema, or timing reset API. Do not change generic activities or Worked activities. Do not publish the draft sections.

## Current flow and required correction

The current lesson passes fixed section props to the activity. The activity builds attempt number 1. The app renderer adds timing and caches one envelope. The lesson adds a random retry key. The Guided check uses only the fixed activity ID and raw answer.

This flow does not use the allocated pending row. It cannot select a later server variant. It can grade against the wrong private variant. It also gives the client authority over the retry key and attempt ordinal.

The server attempt route is the authority. A `GET` returns `no_attempt`, `pending`, or `final`. It never allocates. A `POST` Start returns `pending` or `exhausted`. A pending response supplies the pending submission ID, fixed activity ID, mode, ordinal, retry key, and selected public props. A final response supplies read-only public props, `submissionId` as the receipt ID, score, maximum score, submitted answers, and graded parts.

The final receipt field is `submissionId`. A valid repeated-root result has an `x2` part with `maxScore: 0` and an overall `maxScore` of 2. The backend regression now covers this result. The client parser must also accept it. A zero-weight part must not make a saved result unavailable.

## Five production paths

### `apps/integrated-math-3/lib/activities/submission.ts`

Add exact client types and strict parsers for the public attempt states. Add one read helper and one Start helper for `/api/activities/quadratic-formula/attempt`. The read helper uses `GET`. The Start helper uses `POST`. Both send the fixed activity ID and exact practice mode as query parameters. Treat a network error, non-success response, unknown field, missing field, invalid state, or identity mismatch as unavailable.

Add `pendingSubmissionId` to the Quadratic Formula submission input. Send it only as `X-Pending-Submission-Id` on the existing server-owned submission request. Preserve the final practice.v1 body. Preserve the server retry key as `Idempotency-Key`. Do not send the pending header for generic or Worked submissions.

Add `pendingSubmissionId` to `checkQuadraticFormulaDiscriminant`. Keep the shared callback signature as `rawAnswer` only. Send the fixed activity ID, `fieldId: "discriminant"`, raw answer, and pending submission ID in the check body.

Require an exact receipt match for an allocated final save. A successful response is valid only when `submissionId === pendingSubmissionId`. Return an error for a different or empty receipt ID. Keep existing legacy replay behavior outside an allocated attempt.

### `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`

Own one Quadratic Formula attempt state for the active selected section. Identify it with fixed activity ID and exact mode. The state can be loading, no attempt, pending, saved-awaiting-details, final, exhausted, or unavailable. Store saved-awaiting-details and final states separately from transient read and Start errors.

On entry to a selected Guided or Independent section, issue one `GET`. Do not issue `POST` during render, mount, reload, phase navigation, or retry recovery. Ignore a response if the active activity ID or mode changed before it settled.

Show explicit Start for `no_attempt`. Start performs one deduplicated `POST`. A valid pending response becomes the only source for selected public props, pending submission ID, retry key, and ordinal. Do not render the fixed static section props as a fallback when allocation is unavailable.

Use the pending ordinal in the practice.v1 envelope. Use the pending retry key. Use the pending submission ID for the submission header. Freeze the exact body and these three server values for all retries. Remove `crypto.randomUUID()` from the Quadratic Formula path.

After a valid matching final receipt, retain a read-only saved-awaiting-details view. Use the selected equation, frozen submitted answers, returned overall score, returned maximum score, and authoritative ordinal. Mark the activity complete after this valid receipt. Do not show part correctness or reuse the frozen ungraded parts as graded evidence.

Fetch authoritative final details with `GET`. Replace saved-awaiting-details only with a valid matching final response. The full final view shows the selected equation, submitted answers, authoritative graded parts, score, maximum score, and ordinal. Both views are read-only. Neither view mounts editable response controls.

If the details read fails, keep saved-awaiting-details and completion. Show a separate details retry action. This action performs `GET`. It never resubmits the answer and never changes the frozen submission request.

Show an explicit Start next attempt action from saved-awaiting-details and final. Keep the saved display visible while Start is pending. If Start returns exhausted or fails, preserve that display. Show the exhaustion or error next to it. Replace it only after a valid new pending response.

Clear the old request cache when a new pending identity becomes active. Do not reuse a frozen body, retry promise, completion result, or check result across activity, mode, or pending submission identity changes. Ignore stale read, Start, submission, and follow-up read results after any such change.

### `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`

Receive the resolved Quadratic Formula attempt view from `LessonRenderer`. For a pending state, pass the server-selected props to the app `ActivityRenderer`. Pass the fixed activity ID and exact mode. Bind the Guided raw-answer callback to the current pending submission ID.

Key the app `ActivityRenderer` instance with the pending submission ID. This key unmounts and remounts `ActivityRenderer` for each new pending attempt. It resets the timing hook, the app renderer envelope cache, and the shared activity state. Keep the current generic renderer identity behavior for all other activities.

Do not call the Guided check without a current pending identity. Ignore a check result after the activity, mode, or pending identity changes.

Render the Start, unavailable, exhausted, saved-awaiting-details, and final states from the resolved attempt view. Do not pass static canonical props to an editable Quadratic Formula activity in these states.

### `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`

Include the pending submission identity in the Quadratic Formula cache identity. Keep one exact timing-enriched envelope for retries of that pending identity. Clear the cache when the identity changes.

Do not assume that the nested registered component key resets timing. `usePracticeTiming` belongs to this app renderer. `PhaseRenderer` must key this app renderer by pending submission ID so the hook unmounts and starts a new accumulator.

Pass the authoritative ordinal to the shared component. Preserve trusted app props after the activity props spread. Keep the existing hostile-prop protection.

### `packages/activity-components/src/components/algebraic/QuadraticFormulaActivity.tsx`

Accept the authoritative attempt ordinal as a required value for editable Guided and Independent attempts. Require a safe integer greater than zero. Fail closed and render no response controls if the ordinal is absent or invalid. Put the valid ordinal in `attemptNumber` when the component builds the practice.v1 envelope. Teaching mode does not require an ordinal and keeps its current behavior.

Use the required keyed full app-renderer remount for a new pending identity. This remount clears answers, hints, changed counts, lock state, pending state, error state, saved state, the frozen envelope, discriminant revisions, active check revisions, check state, the app envelope cache, and timing. Do not add a redundant reset effect for an unkeyed consumer.

Keep the Guided callback signature as `(rawAnswer: string) => Promise<boolean>`. The parent closure owns the pending submission ID. Keep the existing response controls, native form behavior, exact retry envelope, and Worked display.

## Request and stale-response rules

Use one identity tuple: fixed activity ID, exact practice mode, and pending submission ID when present. Capture this tuple before each asynchronous request. Apply a response only if the tuple is still current.

Deduplicate a request for the same identity. A stale request must not unlock Guided roots, replace props, clear a final result, mark completion, or change the frozen retry request.

A successful final save is durable client state after the receipt ID matches the pending ID. It enters saved-awaiting-details. A failed details read cannot change it to unsaved. A details retry cannot resubmit it. A later Start failure cannot change it to pending or editable.

## Exact test paths and required proof

### `apps/integrated-math-3/__tests__/lib/activities/submission.test.ts`

- Prove strict `GET` and `POST` attempt parsing for no-attempt, pending, final, and exhausted states.
- Prove unknown or private fields fail closed.
- Prove identity, mode, ordinal, props, answer, part, score, and receipt validation.
- Prove a repeated-root final response accepts `x2.maxScore: 0` with overall `maxScore: 2`.
- Prove the pending submission header and server retry header are exact while the JSON body stays unchanged.
- Prove an empty or mismatched final receipt fails.
- Prove Guided checks send the bound pending submission ID and only the raw learner answer.
- Prove generic and Worked requests do not receive the pending header.

### `apps/integrated-math-3/__tests__/lib/activities/quadratic-formula-check.test.ts`

Update the existing exact request assertions to include the pending submission ID. Preserve the true and false correctness cases. Preserve rejection of non-success, malformed, expanded, and network-failure responses. Add rejection of a missing or invalid pending identity before the request.

### `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`

- Prove reload performs `GET` only and never allocates.
- Prove no-attempt requires an explicit Start action.
- Prove pending state uses server props, pending ID, retry key, and ordinal.
- Prove no static canonical fallback appears after read or Start failure.
- Prove retry reuses one body, pending ID, retry key, ordinal, timestamp, and timing summary.
- Prove completion requires a nonempty receipt that exactly matches the pending ID.
- Prove a matching save enters saved-awaiting-details and does not show correctness from ungraded frozen parts.
- Prove a failed details `GET` remains saved and complete and offers a read retry.
- Prove the details retry performs `GET` and never resubmits.
- Prove final reload is read-only and shows equation, answers, parts, score, maximum score, and ordinal.
- Prove saved-awaiting-details can Start next while it keeps the saved display during the request.
- Prove next Start exhaustion or failure preserves the prior saved-awaiting-details or final view.
- Prove a valid next pending response replaces the final view and clears prior attempt state.
- Prove stale read, Start, submit, and refresh responses cannot affect a changed activity, mode, or pending identity.
- Prove generic and Worked lesson flows keep their current behavior.

### `apps/integrated-math-3/__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx`

- Prove only a pending allocation mounts editable controls with the server-selected equation.
- Prove the Guided callback sends raw answer through a closure bound to the current pending ID.
- Prove a stale Guided result cannot unlock a new pending attempt.
- Prove Start, final, exhausted, and unavailable states do not mount editable controls.
- Prove the app `ActivityRenderer` receives a new React key for a new pending submission ID.

### `apps/integrated-math-3/__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx`

- Prove one pending identity freezes one timing-enriched envelope across retry.
- Prove a new pending identity clears the cached envelope.
- Prove two pending attempts get different timing baselines. Use the real mount and unmount behavior of `usePracticeTiming`, or a lifecycle mock that records each hook mount.
- Prove hostile activity props cannot replace the trusted activity ID, mode, ordinal, pending identity, or callbacks.

### `packages/activity-components/src/__tests__/quadratic-formula-activity.test.tsx`

- Prove a valid authoritative ordinal is used in the envelope.
- Prove invalid or absent editable ordinals fail closed while teaching remains available.
- Prove the keyed new pending identity clears answers, hints, check state, saved state, error state, locks, and the frozen retry envelope.
- Prove stale Guided checks do not unlock controls after pending identity changes.
- Prove an old retry cannot submit after pending identity changes.
- Preserve existing blank repeated-root, native Enter, exact retry, callback-loss, and Worked-mode tests.

## Excluded work

Do not change backend paths in this client batch. Do not change the timing hook. Do not create a static canonical fallback. Do not add a client allocation registry. Do not change the graph, source records, seed schedule, schema, routes, or draft publication state.

Full application gates, real local transaction checks, and browser checks must wait until the backend and client batches are combined and frozen.

## Scope review

Parent and independent review accept the five production paths and six existing test paths. The first review found the omitted Guided check helper test. The corrected scope includes it. The parent corrected an invalid proposal to display ungraded input parts as a graded result. A matching receipt now produces a saved-awaiting-details state until the server returns graded details. Backend acceptance is required before client implementation starts.
