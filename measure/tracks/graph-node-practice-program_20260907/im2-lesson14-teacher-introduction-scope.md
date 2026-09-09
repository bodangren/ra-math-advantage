# IM2 Lesson 1.4 teacher-led introduction scope

## Purpose

Add a production teacher-led introduction path for the two Lesson 1.4 triangle-ordering nodes.

Reuse the existing teacher evidence page, exposure form, request route, Convex mutation, and `learning_evidence` contract. Do not add a registry, schema, table, route, automatic exposure action, or new evidence type.

This change does not activate the two nodes. Keep the graph readiness fields and activity SRS fields unchanged.

## Source authority

Use the accepted Lesson 1.4 source and atomic practice implementation at `ff4b4458d` plus the accepted Worked reload repair.

Use these exact nodes:

- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures`

Use only each node's fixed Guided activity as the teacher-confirmed source:

- angles: Guided Problem 8;
- sides: Guided Problem 9.

The source lesson must be the physical lesson with slug `module-1-lesson-4`.

## Production behavior

Extend the existing exposure handler with one bounded source resolver in `convex/activities.ts`. Reuse that exported resolver in `convex/teacher.ts`. Do not create a new module, registry, or framework.

The resolver must support the existing Lesson 1.1 perpendicular-bisector source without a behavior change. It must also support the two exact triangle Guided sources.

For a triangle source, require all of these conditions:

- the node and blueprint have `reviewStatus: "approved"`;
- the activity has `approval.status: "approved"`;
- `componentKey` is `im2-question`;
- `masteryNodeId` is one of the two exact triangle node IDs;
- `learningEvidenceMode` is `guided_practice`;
- `stableActivityId` is the exact `<nodeId>.guided_practice` value;
- the seed and difficulty match the fixed Guided item in `triangle-ordering.ts`;
- the submission belongs to the selected student and physical activity;
- the submission belongs to the canonical Lesson 1.4 lesson;
- the stored `practice.v1` triangle row passes the existing strict history parser;
- the validated parser result and stored artifact show that the row reached its final Guided part.

Do not trust a stored `complete` or `finalPart` boolean by itself. Validate the complete envelope, ordered parts, answers, grades, activity identity, and response through the existing parser before the row can be a source.

The final Guided answer can be correct or incorrect. The explicit teacher action confirms that instruction occurred. Do not infer teacher-led introduction from a learner submission alone.

Keep the existing authorization checks:

- active teacher and student accounts;
- same organization;
- teacher owns the active class;
- student has an active class enrollment;
- the canonical lesson is assigned to the class;
- the source submission time is at or after both enrollment and assignment.

On a valid confirmation, write one evidence row with:

- the exact triangle `nodeId`;
- the physical Guided `submissionId`;
- the exact stable Guided `activityId`;
- the source attempt ordinal;
- `origin: "teacher_led"`;
- `mode: "guided_practice"`;
- `masteryBearing: false`;
- no `gradedEvidence`.

Preserve the existing idempotency rules. An exact retry must return the same evidence ID with `replay: true`. A reused key with different content must fail. A second key for the same physical source must return the existing canonical row only when that row has the exact expected identity. A malformed existing row must fail closed.

Do not create an SRS card or review log from the teacher action.

## Teacher projection and user interface

Extend `getStudentEvidence` so `canRecordExposure` is true for a valid final Guided triangle row only when all source, assignment, enrollment, publication, and time checks pass.

Keep it false for:

- Worked and Independent rows;
- an intermediate Guided row;
- a malformed or mixed stored envelope;
- an unapproved activity or draft graph record;
- the wrong lesson, node, stable ID, mode, seed, or difficulty;
- a row saved before enrollment or lesson assignment;
- an inactive enrollment or unauthorized teacher/student relationship.

Reuse `PerpendicularBisectorExposureForm` and `/api/teacher/perpendicular-bisector-exposure` in this bounded change. Their visible action text is already generic: `Confirm teacher exposure`. Keep the request body and response contract unchanged. Do not add a second route or form.

The teacher must open the real student evidence page and select the action for the exact final Guided row. A valid teacher action then makes a later eligible Independent result pass the existing `evaluateLearningEvidenceV1` teacher-first prerequisite.

## Exact file scope

Change exactly these six existing paths:

1. `apps/integrated-math-2/convex/activities.ts`
2. `apps/integrated-math-2/convex/teacher.ts`
3. `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-pilot.test.ts`
4. `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-teacher-candidate.test.ts`
5. `apps/integrated-math-2/__tests__/convex/triangle-ordering-practice.test.ts`
6. `apps/integrated-math-2/__tests__/app/teacher/student-evidence-perpendicular-bisector-composition.test.tsx`

Do not change the route, form, schema, graph JSON, activities, lesson source, or generated curriculum files.

The ongoing Worked reload repair overlaps `convex/activities.ts` and triangle practice tests. Finish, accept, and integrate that repair first. Rebase this change on its committed source. Preserve its behavior and tests.

## Test requirements

Write tests before the production change.

### Handler tests

Use the real handler with memory database rows.

For each exact triangle node, prove:

- an approved canonical final Guided row creates one non-mastery teacher-led evidence row;
- an exact retry returns the same row;
- a different key for the same source does not create a duplicate;
- a reused key for a different source fails;
- the row has the exact node, stable activity ID, source submission ID, attempt ordinal, origin, mode, and no graded evidence;
- no SRS card or review log is written.

Reject intermediate Guided history, Worked, Independent, wrong lesson, wrong node, wrong stable ID, wrong seed/difficulty, malformed history, unapproved activity, draft graph source, inactive enrollment, cross-organization access, wrong class owner, missing assignment, pre-enrollment source, and pre-assignment source.

Keep the complete Lesson 1.1 handler test set. Prove that its accepted payload and replay behavior remain unchanged.

### Projection tests

For both triangle nodes, prove that only the canonical final Guided row gets `canRecordExposure: true`.

Prove the false cases listed above. Preserve Lesson 1.1 projection behavior and the 20-row pagination contract.

### Composition test

Use the real teacher page, existing form, existing route, and real generalized handler.

For one exact triangle Guided source, prove:

1. the action appears only on the valid final row;
2. the first request completes in the handler but the client loses the response;
3. the retry keeps the exact body and `Idempotency-Key`;
4. the retry returns the same evidence ID;
5. only one teacher-led evidence row exists;
6. the page does not expose an action on the Worked, intermediate Guided, or Independent rows.

Then submit one eligible Independent result through the real triangle handler. Require one mastery-bearing result evidence row, one SRS card, and one review log for the exact learner and node. Require the prerequisite evidence time to be no later than the Independent result time.

## Verification

Run the four changed test files. Also run the unchanged existing exposure-route regression at `apps/integrated-math-2/__tests__/app/api/teacher/perpendicular-bisector-exposure-route.test.ts`. Run the full IM2 test suite. Run lint, build, and a separate post-build `tsc --noEmit`.

Verify that only the six scoped files changed. Preserve all unrelated bytes.

## Native follow-up

Do not execute the accepted Lesson 1.4 native run between the Worked repair and this change. After both source changes are accepted and integrated, revise the native scope and run one complete native verification.

Replace each synthetic `teacher_led` prerequisite with the real teacher page action on the learner's canonical final Guided row. Test one lost teacher-action response and exact retry. Confirm four physical non-mastery teacher-led evidence rows, one for each tested learner-and-node prerequisite. Count them separately from result evidence. Then run the later Independent correct and incorrect cases. Require four mastery-bearing result evidence rows, four cards, and four review logs.

Remove the temporary `addEvidencePrerequisite` fixture operation from that native run. Keep graph readiness temporary. Do not activate the graph from this task.
