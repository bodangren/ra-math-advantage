# IM3 Selected Graph Teacher Integration Scope

Date: 2026-09-07

## Purpose

This scope completes the teacher-first flow for `math.im3.skill.1.1.graph-quadratic-functions`. It starts from the committed `f(x) = x²` Worked source. It does not include the other IM3 node pilots.

## Current HEAD boundary

HEAD contains the three selected physical activity seeds. HEAD also contains server-owned grading for the selected Guided and Independent activities in `convex/activities.ts`. The submission route accepts only Guided and Independent envelopes.

HEAD does not contain these parts:

- A server-owned Worked acknowledgement writer.
- A verified teacher candidate query.
- A verified teacher attestation mutation.
- A teacher API route.
- A teacher selection control.
- A Worked acknowledgement caller in the lesson UI.
- A link from teacher evidence to its source submission.

The current `learning_evidence` table has no `submissionId`. It also has no learner-and-submission index. These are the only new persistence fields that the selected teacher flow needs. Keep the existing required `fingerprint` field. Do not add a receipt table for this bounded patch.

## Required files

### Existing files

- `apps/integrated-math-3/convex/schema.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/convex/learningEvidence.ts`
- `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- `apps/integrated-math-3/app/teacher/students/page.tsx`

### New files

- `apps/integrated-math-3/app/api/teacher/graph-exposure/route.ts`
- `apps/integrated-math-3/components/teacher/Im3GraphExposureForm.tsx`
- `apps/integrated-math-3/__tests__/convex/im3-selected-teacher-exposure.test.ts`
- `apps/integrated-math-3/__tests__/convex/im3-selected-real-production-flow.test.ts`
- `apps/integrated-math-3/__tests__/app/api/teacher/graph-exposure-route.test.ts`
- `apps/integrated-math-3/__tests__/components/teacher/Im3GraphExposureForm.test.tsx`
- A selected-only lesson acknowledgement test beside the existing `LessonRenderer` submission tests.

Do not copy the current 2,900-line mixed `learningEvidence.ts` diff. Extract only the selected graph functions and their direct helpers.

## Schema change

Add `submissionId: v.optional(v.id("activity_submissions"))` to `learning_evidence`.

Add this index:

```ts
.index("by_learner_and_submission_id", ["learnerId", "submissionId"])
```

The selected teacher mutation uses this field for one attestation per learner source submission. Existing rows remain valid. The current activity-submission fields and indexes are sufficient.

## Student Worked acknowledgement

Add one selected Worked branch to the existing server-owned submission handler. Do not add a general Worked registry.

The branch must require all these values:

- The authenticated profile has the student role.
- The matching credential is active and belongs to that profile, username, role, and organization.
- The activity has `IM3_TEACHER_LED_ACTIVITY_ID`.
- The activity has `IM3_PILOT_NODE`.
- The component is `graphing-explorer`.
- The mode is `worked_example`.
- SRS eligibility is false.
- Physical activity approval is approved.
- The current node and blueprint are approved.
- The envelope has status `submitted`, empty answers, and empty parts.
- The envelope contains no score or grade fields.

Persist the acknowledgement without `score`, `maxScore`, or `gradedAt`. Keep the same request key for an identical retry. Reject a changed body with the same key. Return an explicit acknowledgement result. Do not call the learning-evidence adapter for this student write.

Extend the existing activity submission route before its Guided and Independent answer validation. Use the active student session helper. Return the durable acknowledgement result. Do not accept client teacher evidence.

Add the selected Worked caller to `LessonRenderer`. Use the physical activity ID from the published lesson section. Await the durable response before completion. Retain the same payload and key after an uncertain network failure. Prevent duplicate clicks. Do not auto-submit another Worked activity.

## Current publication check

Use the committed node and blueprint catalogs. Require the exact selected node to be a reviewed skill. Require its exact blueprint to be approved.

For lesson containment, find `module-1-lesson-1`. Select the unique highest published lesson version. Require the exact Worked activity ID in that version. Do not accept containment in an older published version when a newer version exists.

Use the same current-version helper in the candidate query and the attestation mutation. This prevents a stale candidate from bypassing a new lesson publication.

## Teacher identity and source authorization

The API route must use an active session check. It must then require the exact teacher role. It must not allow the admin role for this action.

The Convex mutation must independently verify these values:

- The teacher profile exists and has the teacher role.
- The teacher credential is active.
- The credential profile ID, username, role, and organization match the teacher profile.
- The student profile exists and has the student role.
- The teacher and student have the same organization.
- The class belongs to the teacher and is not archived.
- The student has an active enrollment in that class.
- Lesson 1.1 is assigned to that class.
- The acknowledgement belongs to that student.
- The acknowledgement occurred after enrollment and lesson assignment.
- The source is the exact approved selected Worked activity in the current published lesson version.
- The stored acknowledgement has the exact empty Worked envelope and has no grade.

The mutation receives `teacherId`, `classId`, `studentId`, `submissionId`, and `idempotencyKey`. It derives all source data from Convex.

## Evidence and replay

Create one `teacher_led` and `teaching` evidence event. Use the selected node and Worked stable activity ID. Use the source attempt ordinal. Store the source `submissionId`.

Compute the existing required evidence fingerprint with `learningEvidenceFingerprintV1`. Do not add another identity field or hash.

Check the learner-and-idempotency index and the learner-and-submission index before insertion.

- An identical key and source returns the existing evidence ID.
- A different key for the same source returns the same evidence ID.
- A key used for another source returns `idempotency_conflict`.
- A same-source row with a different node, activity, mode, origin, contract version, or attempt ordinal returns `idempotency_conflict`.

The student acknowledgement remains stored as history. It never becomes `teacher_led` evidence by itself.

## Candidate query

The query receives only the authenticated teacher profile ID. It verifies the teacher profile and active credential again.

It reads only classes owned by that teacher. It reads only active enrollments in the same organization. It requires the assigned Lesson 1.1 source in the unique current published version. It returns only exact student Worked acknowledgements that occurred after assignment and enrollment. It excludes a source that already has teacher evidence.

Return these display fields:

- Class name.
- Student name.
- Lesson title.
- Submission time.
- Actual stored response.
- Server grade as null for the acknowledgement.
- The three IDs required by the route.

Do not show a raw ID input.

## Teacher UI and API

Add the candidate query to the existing teacher students page. Fetch it only when the teacher selects a student. Filter the returned candidates to that selected student before rendering the form.

The form uses a select control. It shows the class, student, lesson, acknowledgement response, and submission time. It posts the selected class, student, and submission IDs to the new route.

The route gets the teacher ID from the active session. It rejects extra body fields. It maps a wrapped `idempotency_conflict` error to HTTP 409 without returning internal text.

The form keeps the same key and body after a network failure. It disables selection and submission while a request is pending. A different candidate gets a different key. A successful candidate is removed and a confirmation appears. An empty list shows a clear empty state.

## Required tests

1. Prove a student Worked acknowledgement creates a durable ungraded submission and no evidence.
2. Prove inactive credentials, non-student owners, changed activity identity, changed mode, non-empty answers, unpublished curriculum, and unapproved physical activity fail before writes.
3. Prove the candidate query enforces teacher ownership, organization, active enrollment, assignment time, current published version, and exact source identity.
4. Prove another teacher, another class, another learner, a pre-assignment source, and a stale lesson version cannot attest.
5. Prove identical replay and same-source replay make one evidence row. Prove a conflicting key makes no write.
6. Prove the real flow: Worked UI acknowledgement, candidate query, teacher mutation, later Independent server grade, and teacher-first eligibility.
7. Prove the route uses the authenticated teacher and maps a realistic wrapped conflict to HTTP 409.
8. Prove the form has no raw ID input and preserves its body and key after network failure.
9. Prove the selected lesson page waits for the acknowledgement and does not complete after a failed save.

Use hypothetical approved catalog and activity fixtures in tests. Keep current production draft data fail-closed.

## Integration order

1. Add the optional evidence source field and its index.
2. Add the selected Worked acknowledgement branch and route behavior.
3. Add the selected teacher candidate and attestation functions.
4. Add the teacher API route and selection form.
5. Add the lesson acknowledgement caller.
6. Run the selected backend, route, UI, and real-flow tests.
7. Run app lint, standalone TypeScript, and build.

Do not approve the node, blueprint, or physical activities in this work.
