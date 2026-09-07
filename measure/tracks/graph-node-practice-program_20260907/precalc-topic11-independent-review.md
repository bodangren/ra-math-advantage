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
