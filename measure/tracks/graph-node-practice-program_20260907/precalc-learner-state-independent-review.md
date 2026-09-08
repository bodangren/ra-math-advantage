# Precalculus Q27 learner delivery-state independent review

## Decision

Accept `/tmp/precalc-q27-learner-state-backend.patch` for parent integration.

The revised query derives learner state from the exact selected source acknowledgement and its trusted teacher event. It does not persist a second state. It remains closed while the production catalog is draft.

## Learner and source authority

`getTopic11LearnerDeliveryStateHandler` loads the learner profile and the credential by username. It requires a student profile, an active credential, and exact profile ID, username, role, and organization fields. Invalid learner authority returns `null`.

The query reuses `getApprovedTopic11WorkedSourceHandler`. This requires the exact selected graph node, complete Worked blueprint, approved physical activity, exact physical identity, and current published Lesson 1.1 source link.

The acknowledgement lookup uses `activity_submissions.by_user_and_activity` with the learner ID and exact physical activity ID. It uses `collect()`. It does not use a fixed row limit.

Each accepted acknowledgement must have:

- the exact learner and physical activity IDs;
- the exact selected stable activity ID;
- `learning-evidence.v1` as the mastery contract;
- the canonical six-field empty Worked `practice.v1` envelope;
- a positive integer attempt ordinal;
- a finite, nonnegative time that is not in the future;
- no score, maximum score, feedback, or grading time.

The query also requires the physical activity, physical approval, lesson version, Worked phase, and source section to exist no later than the acknowledgement. It calls `hasCurrentTopic11Source` with the acknowledgement time. Thus, a later source publication or approval cannot make an earlier imported acknowledgement authoritative.

Current source or approval withdrawal makes the state unavailable. A damaged or future acknowledgement becomes equivalent to no valid acknowledgement and returns `needs_acknowledgement` while the current source remains available.

## Teacher-event identity

The query reads evidence through `learning_evidence.by_learner_and_node`. It accepts only the exact selected node and learner from the indexed query. It then requires:

- the selected stable source activity ID;
- origin `teacher_led`;
- mode `teaching`;
- the acknowledgement attempt ordinal and occurrence time;
- no graded evidence;
- the teacher writer's exact submission-bound idempotency key.

The submission ID is bound through `precalc:teacher-led:submission:<submissionId>`. This is the current teacher writer contract. An event for another learner, node, activity, mode, ordinal, time, or submission key does not enable practice.

If more than one canonical acknowledgement exists, the query remains `awaiting_teacher_confirmation` until one exact acknowledgement has its matching teacher event. It then returns `ready_for_practice`. An unrelated additional acknowledgement does not hide or invalidate the confirmed source. The uncapped query prevents a later row from displacing the valid acknowledgement.

## State results

The state transitions are correct:

- Exact current source and no canonical acknowledgement: `needs_acknowledgement`.
- Canonical acknowledgement and no matching teacher event: `awaiting_teacher_confirmation`.
- Canonical acknowledgement and exact teacher event: `ready_for_practice`.
- Invalid learner authority or unavailable current source: `null`.

The acknowledgement and teacher confirmation do not create an SRS card or review log.

## Early-practice proof

The final test uses the real selected Guided writer and the real learning-evidence handler before any Worked acknowledgement or teacher event. The writer stores the attempt. The evidence handler returns `awaiting_teacher_exposure`.

The flow creates no learning evidence row, evidence receipt, SRS card, or SRS review log. The learner state remains `needs_acknowledgement`. Thus, an early Guided attempt cannot replace the source acknowledgement or trusted teacher introduction.

## Test evidence

I ran `topic11-selected-teacher-backend.test.ts` in `/tmp/precalc-q27-candidate-20260908/apps/pre-calculus`.

The result was 44 passing tests. The suite includes the real acknowledgement writer, the real teacher writer, the real early Guided writer, and the real evidence handler.

The author also reports these successful gates:

- lint;
- build;
- post-build standalone TypeScript.

## Scope limit

This patch adds only the derived backend query and its tests. It does not add the learner UI gate. It does not add the teacher candidate query. Those consumers remain separate tasks in the accepted integration plan.
