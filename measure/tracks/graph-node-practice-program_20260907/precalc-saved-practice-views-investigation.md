# Selected saved practice views investigation

The committed lesson page queries ordinary responses, current Worked source, delivery state, and approved practice activities. It does not query physical practice submissions or receipts. PrecalculusMasteryAdvantagePilot keeps score, feedback, submission identity, and delivery status only in client state. Reload discards that state. The student dashboard remains a static placeholder.

Use existing activity_submissions and learning_evidence_receipts records. The schema already has by_user_and_activity_and_attempt_ordinal and by_learner_and_submission_id indexes. The existing approved-practice handler resolves the exact physical activities. The existing delivery-state handler controls whether new practice is available. Do not add a completion table or duplicate stored status.

Proposed bounded work:

1. Add a learner-scoped read for the latest accepted attempt in each selected practice mode. Use the current physical activity identity and indexed descending attempt lookup. Validate the stored mode, learner, identity, grade, and receipt relationship before presenting a result. Keep current source availability separate from historical saved work.
2. Show the saved attempt, score, feedback, and practice-record delivery state on lesson reload. A page read must not submit or deliver evidence. A missing receipt must have an explicit retry action that uses the stored submission ID and existing evidence route. Do not create another physical submission for that retry.
3. Keep a saved attempt visibly separate from a new attempt. The Start new attempt action must clear the client attempt state and open fresh answer controls. Do not show an old score beside a new unanswered form without labeling the distinction.
4. Replace the student dashboard placeholder with authenticated lesson links and the selected saved practice results. Reuse the existing lesson query and the same saved-result read. Do not infer lesson completion or mastery from a submission count or from masteryApplied. That value means a practice record was updated.

Test ownership, inactive identity, physical-mode mismatches, missing or malformed receipts, saved result reload, explicit delivery retry, and new-attempt reset. Preserve ordinary responses and current source gating. Verify the lesson and dashboard against actual persisted rows in the retained local browser environment.

This is a scope proposal. The writer readiness repair proceeds first. The read and UI contract still need independent review before implementation.
