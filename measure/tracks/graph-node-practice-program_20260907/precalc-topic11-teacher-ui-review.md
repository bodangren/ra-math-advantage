# Precalculus Topic 1.1 Teacher Interface Review

Date: 2026-09-07

Scope: The Topic 1.1 teacher confirmation interface and its student acknowledgement text. This review does not approve the curriculum.

## Correct behavior

The form shows the learner name, Topic 1.1 lesson title, worked-example identity, and submission time. It states that the student acknowledgement is saved and that teacher confirmation is pending. It does not claim teacher action before the teacher submits the form.

The form shows only classes that have the Topic 1.1 lesson assigned and have an active enrollment for the selected learner. The server still checks class ownership, archive state, active enrollment, assignment, source identity, and time.

The form blocks a second submission while the request is pending. It disables the class selector and submit button. A `pending` reference closes the small interval before the React state update. The form keeps the selected class after an error. It supports retry. It removes the action after a successful response.

The student success text now says `Your worked-example acknowledgement was saved.` This text correctly describes the student action. It does not imply teacher verification.

The production teacher route derives the teacher identity from the session. The client sends only the selected class, learner, and opaque submission IDs with the action name.

## P2: A page reload loses the verified state

The success state exists only in local component state. `TeacherCourse` creates a confirmation form for every matching source submission. `getTeacherData` does not return the Topic 1.1 teacher evidence or receipt state.

After a successful confirmation, a page reload shows `Teacher confirmation is pending` and offers the action again. The backend replay is safe, but the interface gives the teacher incorrect state.

Required correction: project the durable Topic 1.1 receipt or teacher evidence for each source submission. Pass a `confirmed` initial state to the form. Show the confirmed state after reload. Keep the backend replay protection.

Add a test that renders an already verified submission from server data. The form must show `Classroom introduction confirmed.` It must not show a confirmation button.

## P2: The class list includes choices that the server must reject on time order

The client filter checks assignment identity and active enrollment status. It does not compare `assignment.assignedAt` or `enrollment.enrolledAt` with the source submission time.

A teacher can assign Topic 1.1 or enroll the learner after the acknowledgement. The class then appears in the selector. The server correctly rejects the action because its trusted records are later than the submission. The interface returns only a generic retry error.

Required correction: include the stored assignment and enrollment times in the `TeacherData` type. Exclude a class when either time is later than `submission.submittedAt`. Keep the same server checks.

Add tests for a late assignment and a late enrollment. Neither class must appear as eligible for that submission.

## Test coverage

The new component tests cover:

- Learner, lesson, worked-example, and submission-time context
- Pending controls
- A failed request and retry
- Stable request identity across retry
- Successful confirmation
- No eligible class
- Integration with one assigned and actively enrolled class

The tests do not send two submit events before React updates. The `pending` reference implements this protection, but a direct double-submit regression test would make the contract explicit.

The tests do not cover a non-2xx response separately from a rejected network request. Both paths enter the same error state in the component.

## Decision

The interface no longer creates or implies teacher approval before the teacher action. Its request-state behavior is safe. The class filter uses the correct assignment and enrollment identities.

The durable confirmed state and time-aware class filtering remain open interface defects. The server trust boundary rejects these invalid or replayed actions, so these defects do not create false teacher evidence.

## Resolution

`getTeacherData` now returns `topic11TeacherConfirmed: boolean` on each submission. The value is true only when existing evidence has all of these stored identities:

- The same learner
- The same source submission ID
- The exact Topic 1.1 node
- The exact Topic 1.1 source activity
- The `teacher_led` origin

The query uses the existing `by_learner_and_submission_id` index. It reads at most two evidence rows for each of the visible Topic 1.1 source submissions. It does not add a table or duplicate the confirmation state. A regression test adds more than 200 unrelated historical events and confirms that the latest source confirmation is still present.

The teacher interface now passes this durable value to the form. A reload shows `Classroom introduction confirmed.` and does not show the action again.

The interface now filters class choices by the stored enrollment and assignment times. A class does not appear if the enrollment or assignment occurred after the source submission.

The final focused run passed 10 tests in four files. The run includes the durable query projection, course authorization tests, form state tests, and teacher-page integration tests. TypeScript compilation passed. Focused Oxlint passed.
