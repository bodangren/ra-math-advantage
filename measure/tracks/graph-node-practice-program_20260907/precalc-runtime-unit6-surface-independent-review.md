# Precalculus Q37 Unit 6 Surface Independent Review

## Decision

Accepted. I found no blocking defect in the seven-path candidate.

## Production trace

The dashboard requires a teacher session. It uses the session teacher ID for the selected candidate query. It renders the exact learner, submission, acknowledgement time, lesson label, and eligible class choices from that query.

The route calls `requireTeacherRequestClaims` before it parses or uses the request body. The strict request schema accepts only `recordTopic11Exposure`, `classId`, `studentId`, and `submissionId`. The route supplies the teacher ID from the authenticated claim. It calls `internal.selectedLearningEvidence.submitTopic11TeacherSubmission`.

The response parser requires the complete selected-writer result. It requires `masteryApplied: false`, `kstApplied: false`, an introduced teacher-led decision, no mastery-bearing status, matching delivery and decision idempotency, and the correct persistence value. The public response contains only `delivery: new` or `delivery: replay`. A malformed internal result gets a generic error.

The form stores the serialized class, learner, and submission tuple before the request. It keeps that exact body after a network failure, non-OK response, or malformed success receipt. It locks the class selector until a valid receipt clears the retry body. The synchronous ref lock prevents two pending requests.

The selected teacher writer records one `teacher_led` learning-evidence event. Its mastery bridge does no work. The candidate route, page, and form contain no student-competency or spaced-repetition-system write. The focused composition test confirms that the teacher action creates no student competency, SRS card, or SRS review.

## Test review

The route tests cover the authenticated teacher claim, selected writer reference, strict request fields, exact new and replay receipts, contradictory results, extra internal result fields, and private error projection.

The form tests cover an ambiguous network failure, an invalid success receipt, tuple retention, selector locking, a replay success, and two synchronous submissions.

The dashboard tests cover the session-owned teacher query, exact candidate rendering, and the empty state.

The composition test uses the actual acknowledgement writer, learner delivery-state handler, candidate handler, route, and selected teacher writer over one in-memory database. It proves waiting, candidate visibility, one teacher event, candidate removal, ready-for-practice state, and zero mastery or SRS effects. This is real handler composition. It is not an actual Convex backend transaction test. The next Unit 7 local-backend plan keeps that distinction.

## Verification

- `git apply --reverse --check --whitespace=error-all /tmp/precalc-q37-unit6-surface-final.patch` against the frozen candidate: PASS. This proves that the supplied patch is the candidate delta.
- Four focused files: PASS.
- 16 tests: PASS.

I did not edit the candidate.
