# Precalculus Topic 1.1 independent review

Date: 2026-09-07

Scope: `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs` only.

## Decision

The recovered flow is fail closed in the current repository. The node and blueprint both have `reviewStatus: draft`. `isPrecalculusPilotPublished()` therefore returns false. The production student dashboard receives no Topic 1.1 activities. The student acknowledgement mutation rejects a direct call. The teacher mutation returns `submission_not_found`. This is correct. This review does not approve the curriculum.

The hypothetical approved-path implementation has two authorization gaps. Do not enable this flow until the gaps are corrected and tested.

## P1 findings

### The teacher mutation does not verify the published lesson-to-activity link

`submitTopic11TeacherSubmission` finds the lesson with `unitNumber: 1` and `orderIndex: 1`. It verifies a `class_lessons` assignment. It does not load a published `lesson_version`. It does not load the phase that contains the source activity. It does not prove that the approved activity belongs to the assigned published lesson.

A counterexample can pass the current checks. An approved activity row can have the canonical stable ID, component, props, and approval. The class can have any assigned lesson row for Unit 1 Topic 1.1. The activity can be absent from every published phase. The mutation still records exposure.

The seed currently links this source activity to the lesson phase. That current seed fact does not make the mutation safe against stale, partial, or changed database state.

Required correction: load the assigned lesson's published version and its phase activity link. Require the exact source activity document or stable activity ID in that published lesson before exposure is recorded.

Source: `apps/pre-calculus/convex/learningEvidence.ts:2821-2887`.

### The teacher mutation does not compare teacher and learner organizations

The mutation verifies teacher role, learner role, class ownership, and active enrollment. It does not require `teacher.organizationId === learner.organizationId`.

The normal enrollment mutation prevents a new cross-organization enrollment. The evidence boundary must still validate the stored relationship. A stale or imported cross-organization enrollment can pass the current evidence mutation.

Required correction: compare the stored teacher and learner organization IDs in the evidence mutation. Add a negative test with a valid owned class and active enrollment but different organizations.

Source: `apps/pre-calculus/convex/learningEvidence.ts:2829-2839`.

## P2 findings

### The student success text claims a teacher-led attempt before teacher action

The student component says `Your Topic 1.1 teacher-led attempt was saved.` after the student acknowledgement is stored. No teacher has acted at this point. The database correctly contains no teacher evidence.

Use text such as `Your worked-example acknowledgement was saved.` Keep the teacher term for the later verified teacher action.

Source: `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx:87-90`.

### The teacher interface does not show the lesson identity for the acknowledgement

The action appears under `Practice results`. It shows the stable activity ID and an ungraded score. It shows the selected student and class. It does not show `Unit 1 Topic 1.1`, the assigned lesson, the submission time, or the stored response state next to the verification action.

The server revalidates hidden identifiers. This prevents a client-only trust bypass. The interface still needs enough information for a teacher to make the intended review decision.

Required correction: show the source lesson title, activity title, submission time, and acknowledgement state with the action. Add interface tests for pending, error, retry, and success states.

Source: `apps/pre-calculus/components/course/TeacherCourse.tsx:45-49`.

### The new focused tests do not exercise the route or teacher interface

`topic11-trusted-teacher-flow.test.ts` calls Convex handlers directly. It proves server replay and several negative cases. It uses compressed fixtures and mocks the node and blueprint as approved. There is no focused test for `/api/teacher/course`. There is no focused test for the `TeacherCourse` action.

Required verification: drive the student component or route, stored submission, teacher course route, teacher interface action, Convex mutation, and subsequent independent evidence decision in one bounded flow. Test pending, error, retry, and success behavior.

## Checks that passed

- The student acknowledgement route uses the authenticated student identity.
- The stored source row uses a server timestamp and server attempt ordinal.
- The student acknowledgement creates no learning evidence.
- The teacher action derives the teacher identity from the active teacher session.
- The mutation revalidates the client-provided class, learner, and submission IDs.
- The mutation requires teacher ownership, a non-archived class, active enrollment, and the exact assigned Unit 1 Topic 1.1 lesson.
- The mutation rejects enrollment and assignment times after the submission time.
- The mutation requires the exact source stable ID, component, node, mode, source type, and approved activity state.
- The mutation requires an ungraded Worked acknowledgement owned by the learner.
- Replay uses the same evidence idempotency key. It does not create a second teacher event.
- Teacher evidence uses the stored source submission time. Later learner evidence sees the teacher event through the normal evidence history.
- Teacher exposure does not write SRS or Knowledge Space Tracing (KST) effects. Later eligible Independent evidence remains the only mastery path.
- The source seed links the activity to a Worked phase. Its approval resets to `unreviewed` when source content changes.

## Test evidence

The focused command passed 34 tests in four files:

- `__tests__/convex/topic11-trusted-teacher-flow.test.ts`
- `__tests__/convex/topic11-teacher-first-publication.test.ts`
- `__tests__/convex/topic11-pilot-publication-boundary.test.ts`
- `__tests__/convex/topic11-daily-handler.acceptance.test.ts`

The run did not include a teacher route or teacher interface test because no focused Topic 1.1 tests exist for those surfaces.

## Author response: P1 implementation

The Topic 1.1 teacher mutation now requires equal teacher and learner organization IDs. It also loads the assigned lesson's published versions, their phases, and their sections. It requires an activity section that contains the exact physical source activity ID or canonical stable source ID.

The new authorization test failed before the repair for all three counterexamples. It now rejects an organization mismatch, a draft-only lesson version, and a published phase without the exact source activity. Its positive case accepts the exact activity in the published assigned lesson.

A new teacher route test proves that the route derives the teacher ID from the session. It proves that a client trust field does not reach the mutation. It also proves that the route does not expose the internal authorization reason.

The focused final run passed 41 tests in six files. Oxlint passed for all changed Topic 1.1 files. `npx tsc --noEmit` passed. The full app lint still has unrelated warnings in the concurrent untracked `topic11-daily-handler.acceptance.test.ts`; this change did not edit those lines.

The node and blueprint remain draft. The current production flow remains fail closed. The P2 interface and text findings remain open.

## Independent review of the recovered P1 repair

Date: 2026-09-07

The organization repair is correct. The mutation compares the stored teacher and learner organization IDs. It also requires teacher ownership of a non-archived class and an active learner enrollment in that class.

The assigned lesson linkage is partly correct. The mutation uses the exact class and Topic 1.1 lesson in `class_lessons`. It requires `assignment.assignedAt <= submission.submittedAt`. It then searches published versions of that same lesson and searches their phases for the source activity.

### P1: Any old published version can authorize the current source

The mutation accepts the first matching source from any lesson version with `status === 'published'`. It does not select one current published version. It does not sort by `version` or `createdAt`.

A stale database can contain two published versions. Version 1 can contain the Topic 1.1 source. Version 2 can be the current version and omit that source. The current loop accepts Version 1 and records teacher exposure.

The mutation must apply the application's current-version rule. If the data contract permits only one published version, enforce that invariant at this write boundary. Otherwise, select the latest published version by the authoritative `version` field and inspect only its phases.

The new authorization test has only one lesson version. Add a counterexample with two published versions. Put the source only in the older version. The mutation must reject it.

### P1: The records do not prove publication at submission time

The mutation checks enrollment and assignment times against `submission.submittedAt`. It does not check the lesson-version, phase, or section creation times. The schema also has no `publishedAt` value for a lesson version.

A lesson version and source section can be created after the learner submission. A teacher can then verify the old submission. The current mutation treats the new publication as if it existed when the learner submitted the acknowledgement.

If the contract requires the source to be published when the learner responds, the current schema cannot prove this fact. Add an authoritative publication time or immutable publication record. Require it to be no later than the submission time. A `createdAt` check is only sufficient if the product contract makes lesson versions immutable after creation and creates them in the published state.

### Source activity identity

The phase link accepts either the physical Convex activity document ID or the canonical stable activity ID. This is consistent with the two stored section formats that the code supports. The mutation separately loads the submission's physical activity and requires its stable ID, component, node, mode, source type, and approval status.

The stable-ID branch does not compare a physical document ID. This is safe only while the stable ID is the canonical source identity. The `activities.by_stable_activity_id` index does not enforce uniqueness. Seed and mutation tests must keep stable activity IDs unique.

The new positive test covers only the physical database ID branch. Add one positive test for a canonical stable-ID phase link. Add one negative test for duplicate activity documents with the same stable ID if imported or stale database records are in scope.

### Production teacher route

The route requires a teacher or administrator session. It derives `teacherId` from the session. It accepts the class, learner, and opaque submission identities. The internal mutation revalidates all three stored relationships.

Zod strips an extra client trust field. The route test confirms that this field does not reach the mutation. A rejected internal authorization returns one generic error. The route does not expose the internal reason.

The route checks role claims. The internal mutation also reloads the teacher profile and role. This is the required durable authorization boundary.

### Verification

I ran the focused authorization and route tests. Both test files passed. All seven tests passed.

The recovered repair closes the organization and missing-phase-link defects. Current production remains fail closed because the node and blueprint are draft. The current-version and historical-publication-time defects remain blockers for an approved production path.

## Current-version repair

The production lesson loader defines the current published version as the published row with the highest `version` value. The Topic 1.1 teacher mutation now applies the same rule. It inspects phases from only that version. It rejects a source that exists only in an older published version.

The mutation now also applies the existing canonical activity uniqueness contract. The seed uses `.unique()` on `activities.by_stable_activity_id`. The teacher mutation now requires exactly one row for the Topic 1.1 stable source ID. That row must be the physical activity referenced by the submission.

The focused tests now include these cases:

- The current published version contains the physical activity document ID.
- The current published version contains the canonical stable activity ID.
- Only an older published version contains the source.
- Two physical activity rows have the canonical stable activity ID.

All 20 tests passed in four focused files. TypeScript compilation passed. Focused Oxlint passed.

The historical-publication-time item is not an established P1 defect. The current contract requires current publication when the teacher performs the trusted action. It requires enrollment and assignment before the learner response. It permits the teacher to attest prior instruction later. No product or data contract requires proof that the database publication state existed at the learner response time. A historical publication record would be a stronger new policy and requires a separate product decision. This repair does not add that policy or schema.

## Production flow verification

The new test `topic11-real-production-flow.test.ts` uses one shared memory database. It calls the production Topic 1.1 Worked acknowledgement writer. It calls the production teacher mutation next. It then calls the production Guided and Independent server grader and the production evidence and SRS mutation.

The fixture uses the current seed activity fields and grading configurations. It uses a test-only approved node and blueprint. The current draft publication still fails closed outside this isolated fixture.

The test proves these results:

- The Worked acknowledgement does not create learner evidence.
- The teacher mutation creates one teacher-led event. Its replay does not create another event.
- A correct Guided attempt receives a server score of 3 of 3. It creates no SRS card.
- An incorrect Independent attempt remains incorrect in stored evidence.
- Reusing its idempotency key with corrected answers fails with `idempotency_conflict`.
- Replaying its evidence submission returns the first durable result.
- A new correct Independent attempt receives a server score of 3 of 3.
- Both Independent attempts update one card for the exact Topic 1.1 node. They create two review logs.

The production handlers passed this flow without a source repair. No app backend file changed in this task.

Oxlint and TypeScript passed. The focused run passed 122 tests in five files. No browser test, deployed Convex test, deployment, or curriculum approval was done.
