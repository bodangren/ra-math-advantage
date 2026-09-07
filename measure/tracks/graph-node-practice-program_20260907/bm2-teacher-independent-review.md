# Business Math 2 Teacher Verification Independent Review

Date: 2026-09-07

## Review boundary

This review covers the current Business Math 2 (BM2) teacher verification path. It does not approve curriculum content.

The exact pilot scope is:

- Node: `math.bm2.skill.1.1.apply-accounting-equation`
- Guided source activity: `d6b57545-65f6-4c39-80d5-000100001002`
- Lesson: `unit-1-lesson-1`
- Independent problem family: `accounting-equation`

I traced the stored student submission, the teacher gradebook action, the teacher route, the internal mutation, the evidence store, and later Independent eligibility.

## Verified behavior

The gradebook shows the verification action only for the exact Guided source activity. The user interface states that the action records exposure and does not record mastery. It waits for the teacher route and shows an error if the request fails.

The teacher route requires an active teacher session. It accepts only `learnerId` and `submissionId`. It gets the teacher identity from the session. It does not accept a client claim for teacher exposure.

The internal mutation checks these facts:

- The actor has the `teacher` or `admin` role.
- The learner has the `student` role.
- The teacher and learner have the same organization.
- The learner has an active enrollment that started before the submission.
- A class for that enrollment belongs to the teacher, unless the actor is an administrator.
- The submission belongs to the learner.
- The stored activity and submission use the exact Guided source activity.
- The stored mode is `guided_practice`.
- A published lesson version contains the source activity.
- The learner has phase progress that started before the submission.

The evidence adapter has a narrow objective scope. It maps only the exact Guided source to `teacher_led` evidence for the exact accounting-equation skill. It maps only `accounting-equation` Independent records and generated IDs that match `accounting-equation-<number>-(assets|liabilities|equity)` to mastery evidence. It requires stored server grading data for Independent evidence.

The focused positive test proves this sequence: teacher verification stores non-mastery exposure, then a later correct Independent submission becomes eligible and updates mastery.

## Blocking findings

### P0: The mutation does not verify a class lesson assignment

`verifyTeacherExposure` sets `enrollmentIsAuthorized` from one class. It then sets `lessonAssignmentIsAuthorized` from a separate `student_progress` row. The code does not connect the lesson, phase, or progress to the authorized class.

The BM2 schema has no `class_lessons` table or equivalent class-to-lesson assignment record. The variable name `lessonAssignmentIsAuthorized` is therefore incorrect. The check proves prior learner progress. It does not prove that this teacher assigned or taught this lesson in this class.

Concrete counterexample:

1. A learner is actively enrolled in Teacher A's class.
2. The learner starts the pilot phase through another class or through direct access.
3. The learner submits the Guided source.
4. Teacher A opens the submission in the gradebook.
5. The mutation accepts the enrollment from Teacher A's class and the unrelated phase progress.
6. The mutation writes `teacher_led` exposure for Teacher A.
7. A later Independent response can become eligible because of that exposure.

The route cannot resolve this defect. It does not send a class or assignment identity. The mutation must receive a server-selected class and lesson assignment identity, or it must read an existing trusted record that connects this exact learner, class, lesson version, and source activity. The assignment and enrollment must both exist before the Guided submission time.

The focused test does not test an assignment. Its `assignedAt` option writes `student_progress.startedAt` and `student_progress.createdAt`. The test name hides the missing class assignment boundary.

### P0: Evidence writes do not enforce the current pilot publication state

`isBm2PilotPublished()` checks the exact node, blueprint, renderer, three mode specifications, published manifest, and authored source. Neither `learningEvidence.verifyTeacherExposure` nor `learningEvidence.submit` calls it.

The evidence handler always supplies `BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds` to the eligibility decision. That constant always includes the pilot node. The handler can therefore write teacher exposure and apply later mastery after the node, blueprint, lesson manifest, or authored activity becomes unavailable or loses review status.

Both write boundaries must fail closed when `isBm2PilotPublished()` is false:

- Teacher verification must not patch `gradedBy` or append `teacher_led` evidence.
- Student evidence submission must not append evidence or apply an SRS review.

The current tests use the live reviewed catalog. They do not include a hypothetical unreviewed node, blueprint, or unpublished activity fixture. Add direct mutation tests for all three unavailable states.

### P1: An archived class can authorize verification

The `classes` schema has an `archived` Boolean field. The enrollment check accepts any class document that has the correct teacher. It does not reject `class.archived === true`.

Concrete counterexample:

1. A learner retains an active enrollment row in an archived class.
2. The enrollment predates the submission.
3. The teacher still owns the archived class.
4. The mutation accepts the class as authorization.

The mutation must require an active enrollment in a non-archived class. A regression test must use a complete class row with `archived: true`.

### P2: Replay changes the teacher verification timestamp

The mutation patches `gradedBy`, `gradedAt`, and `updatedAt` before the evidence handler detects an existing receipt. A repeated request returns replay behavior, but it replaces the original verification time.

The first trusted teacher action must keep its original actor and time. The mutation must read the existing receipt or trusted verification fields before it patches the submission. A replay test must confirm that the first `gradedBy` and `gradedAt` values do not change.

## Test evidence

I ran this command in `apps/bus-math-v2`:

```text
npm run test -- --run __tests__/convex/learningEvidence-teacher-verification-flow.test.ts __tests__/app/api/teacher/learning-evidence/bm2-pilot/route.test.ts __tests__/components/teacher/SubmissionDetailModal.integration.test.tsx
```

Result: 3 test files passed. All 12 tests passed.

These tests verify the session-owned teacher identity, rejected client authority fields, durable error handling, exact source selection, time order for enrollment and phase progress, the positive teacher-to-Independent flow, and the gradebook interaction.

They do not test these required boundaries:

- A source phase that belongs to a different class context
- A missing class lesson assignment
- An archived class
- A current unreviewed node or blueprint
- A current unpublished or mismatched authored activity
- A replay that preserves the first verification actor and time

## Source locations

- Publication predicate: `apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts:23`
- Objective and source adapter: `apps/bus-math-v2/convex/learningEvidence.ts:188`
- Always-enabled node decision: `apps/bus-math-v2/convex/learningEvidence.ts:327`
- Teacher verification mutation: `apps/bus-math-v2/convex/learningEvidence.ts:750`
- Separate enrollment and progress checks: `apps/bus-math-v2/convex/learningEvidence.ts:768`
- Teacher route: `apps/bus-math-v2/app/api/teacher/learning-evidence/bm2-pilot/route.ts:5`
- Gradebook verification action: `apps/bus-math-v2/components/teacher/SubmissionDetailModal.tsx:532`
- Misnamed assignment fixture: `apps/bus-math-v2/__tests__/convex/learningEvidence-teacher-verification-flow.test.ts:15`

The current implementation proves a narrow objective mapping and a functional user interface. It does not yet prove trusted teacher ownership of the lesson assignment. It also does not enforce current publication at the durable write boundary.
