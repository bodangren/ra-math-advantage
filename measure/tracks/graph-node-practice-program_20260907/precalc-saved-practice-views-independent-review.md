# Q38 saved practice views independent review

## Verdict

Accept the proposal with the contract details in this review.

The proposal uses the existing submission and receipt records. It does not need a new table or schema index. It must not infer lesson completion, mastery, or readiness from a saved attempt.

## Committed runtime findings

- The lesson page authenticates the learner. It reads ordinary responses, the current Worked source, delivery state, and approved practice activities.
- The student dashboard is a static page. It does not authenticate the learner.
- `activity_submissions` has the required `by_user_and_activity_and_attempt_ordinal` index.
- `learning_evidence_receipts` has the required `by_learner_and_submission_id` index.
- Guided and independent submissions use different stable activity IDs and physical activity rows.
- The submission writer owns `score`, `maxScore`, `feedback`, `attemptOrdinal`, and the stored graded envelope.
- The evidence route accepts only an authenticated learner and an opaque submission ID. The mutation checks submission ownership and canonical activity identity.
- The current client keeps the submission ID, score, feedback, and delivery result only in React state. A reload loses that state.

## Minimum implementation scope

### Learner query

Add one internal learner query for the two selected practice modes.

1. Authenticate the learner profile and its active credential. Reject a teacher, an inactive learner, an inconsistent credential, or a learner ID that does not own the rows.
2. Resolve the two physical activities with `activities.by_stable_activity_id`. Require one row for each stable ID. Validate the component key and the stored mode identity. Keep current publication availability out of the historical-result decision.
3. For each mode, query `activity_submissions.by_user_and_activity_and_attempt_ordinal` with the authenticated learner ID and physical activity ID. Use descending order and `first()`. Do not collect all attempts. Do not scan the submission table.
4. Validate the selected row before return. Require exact learner ownership, physical activity ID, stable activity ID, `learning-evidence.v1`, a positive integer ordinal, finite timestamps, finite server score bounds, feedback text, and a canonical graded `practice.v1` envelope for the same mode and ordinal.
5. Recompute the grade from the stored canonical envelope and the mode's fixed server variant. Require the stored score, maximum score, graded parts, and feedback contract to agree with the server grade. Do not trust stored client answers as grade authority.
6. Read the receipt with `by_learner_and_submission_id(...).unique()` for the same learner and submission ID.
7. Validate the receipt with the same semantic rules as the evidence route. Guided practice can have `ungraded_evidence`. Independent practice can have `eligible`. A receipt must agree with `persisted`, `masteryApplied`, exposure state, and the stored mode.
8. Return a small view model. Include mode, opaque submission ID, ordinal, submitted time, score, maximum score, feedback, and delivery state. Use `delivered`, `needs_delivery`, or `invalid_receipt` as distinct states.

A missing receipt can return `needs_delivery`. A malformed or contradictory receipt must return `invalid_receipt`. Do not present a malformed receipt as successful delivery. Do not offer the normal missing-receipt retry for a conflicting stored receipt.

### Lesson page

Add the saved-result query to the existing Topic 1.1 parallel read. Pass each saved mode result to its practice component or a small saved-result view.

Show the saved attempt before a fresh form with an explicit label such as `Saved guided practice attempt`. Keep the score and feedback inside that saved-attempt section. Do not label `masteryApplied` as mastery or lesson completion.

For `needs_delivery`, show an explicit `Retry evidence delivery` action. The action must post the existing opaque submission ID to the existing evidence route. It must not post the stored envelope to the submission route. A successful retry can refresh the page and show the validated receipt.

The `Start new attempt` action must create new client state and blank controls. It must not delete or alter the saved result. Keep the old result labeled while the new form is open.

Page rendering and page reload must call queries only. They must not submit evidence, create a submission, update SRS data, or add a receipt.

### Student dashboard

Require the student session on the dashboard. Reuse the existing lesson list query and the same saved-result query. Show authenticated lesson links and the two selected saved results.

Keep these concepts separate:

- A saved attempt means that the server stored and graded one physical submission.
- Evidence delivery means that a valid receipt exists.
- `masteryApplied` means that the practice record was updated for that evidence decision.
- Lesson completion and mastery are not established by this feature.

## Acceptance tests

### Query tests

1. Return only the authenticated learner's latest guided and latest independent attempts.
2. Prove bounded reads. Add many older attempts and unrelated learner submissions. Verify two indexed descending `first()` queries select the correct rows.
3. Reject a missing profile, teacher identity, inactive credential, mismatched credential, and cross-learner row.
4. Reject or omit duplicate physical activity identity, wrong stable activity ID, wrong component key, wrong physical mode, wrong activity ID, and wrong envelope mode.
5. Reject a noninteger ordinal, envelope ordinal mismatch, invalid timestamp, missing score, nonfinite score, invalid score bounds, invalid maximum score, and malformed feedback.
6. Reject a changed envelope, answer/part mismatch, grade mismatch, and a mode variant mismatch by recomputing the canonical server grade.
7. Return `delivered` only for an exact learner/submission receipt with a mode-consistent decision.
8. Return `needs_delivery` when no receipt exists.
9. Return `invalid_receipt` for a malformed, contradictory, wrong-mode, wrong-learner, or wrong-submission receipt.
10. Prove that the query performs no insert, patch, replace, delete, evidence delivery, mastery update, or SRS update.

### Route and component tests

1. Reload a lesson with persisted guided and independent rows. Show both saved scores and feedback values.
2. Reload with a missing receipt. Do not send a POST automatically.
3. Select `Retry evidence delivery`. Send one POST with only the existing submission ID. Do not call the submission route.
4. Retry after an ambiguous evidence response with the same submission ID. Accept a valid replay result.
5. Reject a malformed evidence response and keep the explicit retry available only when the stored query state is `needs_delivery`.
6. Select `Start new attempt`. Reset the answer controls and client envelope. Keep the saved attempt visible and labeled.
7. Submit the new attempt. Verify that it receives the next server ordinal. Verify that reload selects it as latest.
8. Render the dashboard without a session. Verify the normal student authentication response.
9. Render the dashboard as one learner. Verify that no other learner's result appears.
10. Verify the dashboard lesson links and saved results use the same query data as the lesson page.
11. Verify that the UI does not use `complete`, `completed`, or `mastered` for a saved submission or `masteryApplied` receipt.

## Scope limits

Do not add a completion table, saved-result table, new submission index, background delivery, reload mutation, broad submission scan, or dashboard mastery calculation. Reuse the existing submission writer, evidence route, canonical grader, activity identity helpers, and receipt rules.
