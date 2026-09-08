# Precalculus Topic 1.1 teacher delivery integration plan

## Result

The Q19 backend supplies the learner acknowledgement writer and the trusted teacher confirmation writer. The Q18 evidence path supplies private grading and SRS processing. The application still needs a narrow delivery path that connects the source seed, the learner, and the teacher.

The minimum flow is:

1. Seed one exact Topic 1.1 Worked physical activity and link it to the exact Worked phase.
2. Project that Worked source with the Q19 source predicates.
3. Let the signed-in learner acknowledge the projected source.
4. Derive a teacher candidate from the stored acknowledgement.
5. Let the assigned teacher confirm the classroom introduction.
6. Show Guided and Independent practice only after the trusted teacher event exists.
7. Persist Guided and Independent results through the Q18 evidence and SRS path.

Do not approve a graph row, blueprint, lesson version, or physical activity in this work. The production flow must remain closed until a separate human review approves all required source records.

## Existing contracts to reuse

### Source identity

Import these existing constants from `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`:

- `PRECALCULUS_PILOT_NODE_ID`
- `PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID`
- `PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY`

Do not move or duplicate these constants.

### Q19 acknowledgement and teacher authority

Reuse the committed Q19 functions:

- `activities.createTopic11DailySubmission`
- the Q19 exact Worked publication predicate
- the Q19 exact physical Worked activity predicate
- `learning-evidence.submitTopic11TeacherSubmission`

The learner acknowledgement writer requires an active learner profile, the exact published Topic 1.1 source, the exact approved physical Worked activity, and a canonical empty `practice.v1` acknowledgement. It writes no grade, learning evidence, or SRS state.

The teacher writer requires an active teacher and learner, the same organization, a teacher-owned class, active enrollment, a Topic 1.1 assignment, valid event times, the exact learner-owned acknowledgement, and the current exact source. It writes one `teacher_led` event. It writes no learner grade and no SRS state.

### Q18 practice evidence

Reuse the Q18 v6 Guided and Independent submission and evidence handlers. Keep their global publication contract unchanged. Do not add the Worked source requirements to the global Guided or Independent predicate.

The Q18 handler must remain the server authority for grade, assistance, evidence, and SRS state. A learner acknowledgement is not teacher evidence. A UI state does not authorize evidence.

### Existing indexes and section fields

Resolve the physical activity through `activities.by_stable_activity_id`. Then use the existing `activity_submissions.by_user_and_activity` index for the learner acknowledgement lookup. Do not add a `userId + stableActivityId` index.

The lesson section already contains its physical `activityId` and `componentKey`. Compare these fields with the strict Worked projection. Do not change `course.getLesson` unless an actual composition test proves that one of these fields is missing.

## Integration 1: exact source seed

The pending `apps/pre-calculus/convex/seed/seed_lesson_1_1.ts` creates the selected Worked activity and links it to the Worked phase. Keep this branch narrow.

The seed must:

- create or find exactly one selected stable activity;
- store the selected component key;
- store the exact reviewed display name, description, props, and grading configuration;
- use the physical activity `_id` in the phase section;
- validate the exact lesson version and phase that the seed owns;
- reject a duplicate stable activity;
- reject a duplicate selected phase link;
- reject an occupied selected sequence instead of replacing another activity;
- preserve approval only when the complete source identity is structurally equal;
- reset changed content to `unreviewed` under the established seed policy;
- preserve ordinary Topic 1.1 sections and later lessons.

Required tests:

- first seed creates one unreviewed source and one exact phase link;
- identical replay preserves an existing human approval and physical ID;
- changed props, grading, display text, or link identity invalidates approval or rejects the conflict;
- duplicate stable rows and duplicate or occupied links reject without partial writes;
- the source remains unavailable while any required publication state is not approved.

Files:

- `apps/pre-calculus/convex/seed/seed_lesson_1_1.ts`
- one focused selected source seed test

## Integration 2: Worked-only approved projection

Do not use `getApprovedPrecalculusPilot` for the Worked lesson source. That query requires the complete three-mode pilot. Its contract is broader than the Q19 Worked acknowledgement contract.

Add a selected Worked-only query beside the existing activity queries. Reuse the Q19 exact Worked publication predicate and exact physical activity predicate. Do not create a second content comparator.

Return only public display fields:

- physical `activityId`;
- stable activity ID;
- node ID;
- component key;
- mode `worked_example`;
- safe Worked props derived from the reviewed `workedExampleSpec`.

Return `null` when the node, blueprint, lesson version, phase link, physical activity, physical approval, props, grading configuration, or component identity does not match the Q19 source contract.

The lesson caller must compare the raw section `activityId` and `componentKey` with this projection. It must pass the projected props to `PrecalculusTopic11DailyCurriculumPilot`. It must show the existing unavailable state on mismatch. It must not use the component's stale browser fallback.

The dashboard can use the same Worked-only projection. Keep `getApprovedPrecalculusPilot` unchanged for the current Guided and Independent projection.

Required tests:

- actual seed section to projection to real lesson caller to real Worked renderer;
- unreviewed physical row returns no source;
- a hypothetical approved fixture returns the exact reviewed Worked content;
- changed display text, props, grading, component, stable ID, or section activity ID returns no actionable source;
- graph, blueprint, lesson, or physical approval withdrawal returns no actionable source;
- no fallback shows an answer or acknowledgement control after rejection;
- ordinary sections and later topics remain unchanged.

Files:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`
- `apps/pre-calculus/app/student/dashboard/page.tsx`
- focused projection and real-caller tests

Do not change `apps/pre-calculus/convex/course.ts` for the learner lesson projection unless the real composition test loses the existing section fields.

## Integration 3: learner acknowledgement route and UI

Keep the request body empty. Build the canonical Worked acknowledgement on the server. Call `activities.createTopic11DailySubmission`.

The public route must:

- require the signed-in learner identity;
- preserve every byte of the opaque `Idempotency-Key`;
- use trimming only to reject a whitespace-only key;
- reject a key longer than 256 characters;
- reject request body fields, including grade, score, origin, node, mode, and activity identity;
- map direct or wrapped `idempotency_conflict` errors to HTTP 409;
- validate the exact safe receipt before return.

The safe receipt must contain only the submission ID, positive attempt ordinal, and canonical submitted time. The learner component must validate the same shape. It must retain the exact key and empty body after a network failure or malformed success.

Production callers must pass the strict Worked projection. Do not depend on the component's hard-coded default content.

Required tests:

- signed-in learner and active-profile checks;
- empty body and exact opaque key bytes;
- whitespace-only and oversized key rejection;
- extra body and client-grade rejection;
- direct and wrapped conflict mapping;
- malformed success and network failure keep the same retry body and key;
- the real Worked action stores an acknowledgement with empty parts and no score;
- a replay returns the same physical submission and does not add evidence or SRS state.

Files:

- `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`
- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`
- focused route and component tests

## Integration 4: learner delivery state and coherent mode visibility

Add one selected learner-state query in `convex/activities.ts`. Derive state from the exact physical activity, the learner's canonical acknowledgement, and exact same-node `teacher_led` evidence.

Use these states:

- `needs_acknowledgement`: no canonical acknowledgement exists;
- `awaiting_teacher_confirmation`: the acknowledgement exists and the trusted teacher event does not exist;
- `ready_for_practice`: the acknowledgement and trusted teacher event both exist.

Use `activities.by_stable_activity_id` and `activity_submissions.by_user_and_activity`. Do not add a table or schema index. Reject duplicate physical activities. Do not use a capped recent-submission query as an authority boundary.

Use these UI rules:

- Show the strict Worked source only in `needs_acknowledgement`.
- Show a clear pending state in `awaiting_teacher_confirmation`.
- Do not show Guided or Independent before `ready_for_practice`.
- Show Guided and Independent from the existing approved three-mode projection only in `ready_for_practice`.
- Do not show the Worked acknowledgement action again after it is stored.

This teacher-first rule matches the persistence policy. Guided evidence cannot persist before the trusted teacher event. The UI must not report an unpersisted Guided result as sequence completion. The server evidence handler remains the final authority if the UI state is stale.

Required tests:

- acknowledgement changes `needs_acknowledgement` to `awaiting_teacher_confirmation`;
- teacher evidence changes the state to `ready_for_practice`;
- another learner, node, activity, or submission does not change the state;
- repeated visits do not show another Worked action;
- Guided and Independent are absent before teacher confirmation;
- Guided and Independent are present only after confirmation and full mode publication;
- direct early practice submission remains non-evidentiary and causes no SRS effect.

Files:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`
- `apps/pre-calculus/app/student/dashboard/page.tsx`
- focused state and page tests

## Integration 5: selected teacher candidates and confirmation

Add one selected-only candidate query in `apps/pre-calculus/convex/course.ts`. Keep broad `getTeacherData` unchanged.

For each enrolled learner, resolve the exact physical source through `activities.by_stable_activity_id`. Query acknowledgements through `activity_submissions.by_user_and_activity`. Do not use the current latest-100 submission list for authority.

Return a candidate only when all Q19 source and teacher conditions can be checked:

- exact selected stable ID, physical ID, component, mode, props, grading, and approval;
- canonical learner-owned empty acknowledgement;
- no existing selected `teacher_led` event for that submission;
- active same-organization learner;
- active enrollment that began no later than the acknowledgement;
- teacher-owned class;
- Topic 1.1 assignment that began no later than the acknowledgement;
- current exact lesson and Worked source publication.

Return only the learner name, submission ID, acknowledgement time, lesson title, and eligible class choices. Do not return raw submission data or grades.

Pass this selected candidate array into `TeacherCourse.tsx`. Continue to use `Topic11ExposureForm`. The dashboard and gradebook page modules need no change unless their actual result type does not pass the new field.

Make the selected teacher route action strict. Reject unknown client trust fields. Validate the exact safe result from `submitTopic11TeacherSubmission`. Return a small confirmation result with an explicit new-or-replay delivery value. Do not return internal decision details.

The form must validate this result before it removes or confirms the candidate. A malformed HTTP 200 response remains a retryable error. A failed retry must preserve the exact class, learner, and submission tuple.

Required tests:

- teacher-owned roster, organization, enrollment, assignment, and event-time scope;
- a valid acknowledgement remains visible after more than 100 unrelated submissions;
- invalid physical source, source withdrawal, or existing teacher event removes the candidate;
- the form shows learner name, lesson, source context, and acknowledgement time;
- the form does not show raw database IDs as inputs or raw submission JSON;
- the selected tuple reaches the route unchanged;
- strict request rejection for origin, evidence, score, grade, and other unknown fields;
- empty, error, pending, failure, retry, new-success, and replay-success states;
- malformed HTTP 200 does not confirm or remove the candidate.

Files:

- `apps/pre-calculus/convex/course.ts`
- `apps/pre-calculus/components/course/TeacherCourse.tsx`
- `apps/pre-calculus/components/course/Topic11ExposureForm.tsx`
- `apps/pre-calculus/app/api/teacher/course/route.ts`
- teacher dashboard or gradebook page only if its actual data type requires a change
- focused candidate, form, and route tests

## Required production-flow composition test

Add one table-aware test. Use real handlers and real components. Use hypothetical approved fixtures only inside the test. Keep production catalogs and seeded rows unchanged.

The test must perform this sequence:

1. Run the real Topic 1.1 source seed.
2. Prove that the unreviewed source does not project or render.
3. Apply a hypothetical approved graph, blueprint, lesson, and physical fixture.
4. Run the Worked-only projection.
5. Pass the actual seed section and projection to the real learner caller and renderer.
6. Click the real learner acknowledgement action.
7. Send the real route request to `createTopic11DailySubmission`.
8. Query the real selected teacher candidate.
9. Select the class in the real `Topic11ExposureForm`.
10. Send the real teacher route request to `submitTopic11TeacherSubmission`.
11. Query the learner state and obtain `ready_for_practice`.
12. Submit literal Guided answers through the real component and server writer. Verify stored assistance and evidence behavior.
13. Submit literal Independent answers through the real component and private grader.
14. Deliver evidence and verify the exact SRS state.
15. Replay acknowledgement, teacher confirmation, activity submission, and evidence delivery. Verify stable physical IDs, row counts, receipts, card repetitions, and logs.

Add a second path that attempts Guided and Independent before teacher confirmation. Neither attempt can create accepted learning evidence or an SRS effect. Add a wrong Independent answer after teacher confirmation and verify the canonical `Again` result.

Do not replace the seed, projection, route, candidate query, form, mutation, evidence handler, or SRS store with a forwarding stub.

## Dependency order

1. Use the committed Q19 acknowledgement and teacher backend.
2. Use the accepted Q18 v6 Guided and Independent evidence path.
3. Reconcile the current pending main camel-case backend files with those committed selected functions. Preserve later-topic work.
4. Integrate and review the selected source seed. Keep it unreviewed.
5. Add the Worked-only approved projection.
6. Harden the learner acknowledgement route and component.
7. Bind the lesson and dashboard callers to the strict projection.
8. Add the derived learner delivery-state query and coherent mode gating.
9. Add the selected teacher candidate query.
10. Harden the teacher route and form result handling.
11. Run the real production-flow composition test.
12. Complete a separate human source and physical activity review.
13. Seed or deploy only through separately authorized deployment work.

## Approval boundary

This plan does not approve source content. The source seed remains `unreviewed`. The current production catalog must remain unavailable until separate review approves the selected graph node, blueprint, lesson version, exact phase link, and physical activities.

A successful seed is not an approval. A learner acknowledgement is not teacher evidence. A teacher confirmation is not learner mastery. Only the server-graded Independent evidence path can update SRS after the trusted teacher event exists.
