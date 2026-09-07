# IM3 Worked Review Action Independent Review

## Disposition

The `LessonRenderer` requires an explicit student action. It does not submit a Worked acknowledgement when the phase renders. The local retry keeps the same request body and idempotency key.

The selected quadratic action is not connected to the selected server-owned route. This is a blocking production-flow mismatch. The component tests, route tests, and writer tests use separate seams. All seams pass, but they do not form one selected student flow.

## Verified student path

The student lesson page renders `LessonRenderer` with `mode="practice"`. The renderer selects the exact quadratic Worked section only when these fields match:

- `componentKey: graphing-explorer`
- `stableActivityId: math.im3.activity.1.1.graph-quadratic-functions.worked`
- `masteryNodeId: math.im3.skill.1.1.graph-quadratic-functions`
- `learningEvidenceMode: worked_example`
- `srsEligible: false`

The renderer shows `I reviewed this worked example`. It sends no request before the learner selects this action. The phase remains gated until the request succeeds.

The action builds an empty `practice.v1` Worked acknowledgement. It stores the request body and key in refs before the request. A same-mount retry sends the same timestamp, body, and key. The renderer does not mark the activity complete after an error.

## Blocking route mismatch

`LessonRenderer.handleActivitySubmit` always calls `submitActivity`. That client calls `POST /api/activities/submit`. The singular route calls `internal.activities.submitActivity`. This is the legacy writer.

The selected route is `POST /api/activities/submissions`. It calls `internal.activities.createServerOwnedSubmission`. The selected Worked route test covers this plural route. The selected Worked writer test calls `createServerOwnedSubmissionHandler` directly.

The real action therefore bypasses the selected Worked checks in `createServerOwnedSubmissionHandler`. These checks include the current node and blueprint publication, stored activity approval, exact props, exact grading configuration, `learningEvidenceMode`, `srsEligible`, and the active credential profile.

The legacy writer checks only the selected stable activity ID, node ID, and component key for this Worked activity. It does not apply the complete selected publication and activity boundary.

Do not use `submitIm3PilotActivity` unchanged for this action. That helper creates the server-owned submission and then calls the learning-evidence progression route. A Worked acknowledgement is a source for later teacher exposure. It is not graded mastery evidence.

Minimum repair: add or reuse a create-only client call to the plural server-owned route. Use it for the exact selected Worked action. Keep the current body and idempotency key during response-loss retries. Add one composition test from `LessonRenderer` through the plural route and the real selected writer.

## Reload defect

The renderer stores completion only in component state. The student lesson query does not give the renderer the existing physical Worked acknowledgement.

The key is deterministic: `worked-example:${activityId}`. After a page reload, the renderer creates a new `submittedAt` value with the same key. The strict selected writer compares `submittedAt`. It rejects this request as `idempotency_conflict`.

The existing rerender test keeps the same component instance and its completion state. It does not unmount and reload the student page. The completed-phase tests also mock the client. They do not prove recovery from an existing acknowledgement.

Minimum repair: give the lesson response the existing acknowledgement identity or completion state. The client can then mark that exact activity complete without a second create. An alternative is a server read for the existing acknowledgement before the action. Do not weaken the writer replay comparison.

## Phase and preview behavior

The phase completion button remains disabled while a required Worked activity has no successful local result. A request failure keeps the gate closed. A successful result opens the gate.

The server-provided `activePhase.completed` flag bypasses the local activity gate. However, the explicit Worked action still appears for a completed phase because local `completedActivities` starts empty. This behavior contributes to the reload defect.

The teacher lesson page uses `mode="teaching"` and `showTeacherPreviewBadge`. Teaching mode excludes `workedSource`. It shows no acknowledgement action and no phase completion button. This behavior is correct for preview.

## Test evidence

I ran these current tests:

- `LessonRenderer-activity-submission.test.tsx`
- `selected-worked-ack-route.test.ts`
- `selected-quadratic-worked-ack.test.ts`
- `app/api/activities/submit/route.test.ts`
- `lib/activities/submission.test.ts`

All 76 tests passed. The passing groups prove their separate seams. They do not prove that the rendered selected action reaches the selected route and writer.

## Files reviewed

- `apps/integrated-math-3/app/student/lesson/[lessonSlug]/page.tsx`
- `apps/integrated-math-3/app/teacher/lesson/[lessonSlug]/page.tsx`
- `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- `apps/integrated-math-3/lib/activities/submission.ts`
- `apps/integrated-math-3/app/api/activities/submit/route.ts`
- `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/__tests__/components/lesson/LessonRenderer-activity-submission.test.tsx`
- `apps/integrated-math-3/__tests__/app/api/activities/selected-worked-ack-route.test.ts`
- `apps/integrated-math-3/__tests__/convex/selected-quadratic-worked-ack.test.ts`

This review does not approve the graph node, blueprint, lesson publication, or physical activity.

## Author response

The exact selected quadratic Worked action now uses a create-only client call to `POST /api/activities/submissions`. It does not call the singular legacy route. It does not call mastery progression.

The student client now reads the stored acknowledgement from an authenticated `GET /api/activities/submissions` request. The internal query uses the existing learner, activity, and idempotency-key index. It checks the active learner credential, current graph publication, approved physical activity, exact source props, exact mode, ungraded state, and acknowledgement envelope. It returns no row for another learner. The response uses `Cache-Control: private, no-store`.

The renderer hydrates the exact activity completion after a remount. A failed create also performs the same authoritative lookup. A confirmed stored acknowledgement closes the phase gate. A failed lookup does not create or complete an acknowledgement.

The focused tests first failed because the renderer still used the old seam. The completed tests join the renderer client to the actual plural route dispatch. They also cover a full remount, cross-learner lookup isolation, explicit action, and no write during lookup.

Verification after the repair:

- 73 focused tests passed.
- Oxlint passed with no warnings.
- TypeScript passed with `npx tsc --noEmit`.

## Integration owner review

The owner added four lookup corruption tests. The original query accepted an envelope for another physical activity, a missing learning-evidence contract, a zero ordinal, and a mismatched envelope attempt. All four tests failed before the repair. The lookup now checks the exact physical envelope, contract, positive server ordinal, matching attempt, and finite server timestamp.

The combined current app check passes 138 tests, lint, standalone TypeScript, and build. These tests include the rendered caller and actual route dispatch. Backend handler tests use controlled database fixtures. They do not prove a deployed or approved student journey. Selected-only HEAD integration remains open.
