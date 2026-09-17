# IM3 graph teacher exposure independent review

Date: 2026-09-07

Node: `math.im3.skill.1.1.graph-quadratic-functions`

## Decision

The current repository fails closed because the node and blueprint are draft. The production candidate query returns no rows. The teacher mutation rejects the current publication. This is correct. This review does not approve the curriculum.

The teacher interface and its authorization structure are present. The tests do not prove the claimed full student-to-teacher-to-Independent production flow. Two stored-source validation gaps remain in the hypothetical approved path.

## P1: The teacher boundary does not validate the stored source submission contract

`recordIm3GraphTeacherExposureHandler` checks submission ownership and the linked activity. It does not validate these stored submission fields:

- `stableActivityId`
- `masteryContractVersion`
- `submissionData.contractVersion`
- `submissionData.activityId`
- `submissionData.mode`
- `submissionData.status`
- the expected acknowledgement answer and part shape
- a finite server `attemptOrdinal`
- a finite server `submittedAt`
- absence of mastery grade fields

Thus, a malformed or unrelated envelope stored against the approved Worked activity can become teacher evidence. The candidate query also offers that row to the teacher.

The normal writer overwrites the mode with `worked_example` and owns the timestamp and ordinal. The teacher trust boundary must still validate the stored record. It must not assume that all historical, imported, or partially migrated rows came from the current writer.

Required correction: use one exact stored-source validator in the candidate query and mutation. Validate the full server-owned acknowledgement identity and shape.

Sources: `apps/integrated-math-3/convex/learningEvidence.ts:2770-2853`, `:2864-2920`.

## P1: The published phase binding does not validate the approved source props

`isActivityInPublishedLesson` requires the newest published lesson version, a Worked phase, the physical activity ID, and section component `graphing-explorer`. The mutation separately requires activity stable ID, node ID, component, mode, SRS flag, and approval.

It does not validate `activity.props` against the canonical Worked graph source. It does not validate the section's stable activity ID, node ID, evidence mode, or SRS flag. An approved activity document with the expected identity metadata but changed graph props can pass. The teacher would attest to a source that is not the reviewed Worked example.

Required correction: validate the canonical source props or a current approved projection using direct field comparison. Also require the section identity fields that the lesson renderer already requires.

Sources: `apps/integrated-math-3/convex/learningEvidence.ts:2743-2768`, `:2798-2807`; `apps/integrated-math-3/components/lesson/LessonRenderer.tsx:103-122`.

## Test claim correction

The test named `uses the acknowledged source, teacher action, and later Independent grade in one flow` does not call the production student writer or student submission route. Its source submission is a fixture row. Its Independent submission is a local object returned by a fake loader. It calls `buildIm3StoredEvidence`, `recordIm3GraphTeacherExposureHandler`, and `createIm3SubmissionLearningEvidenceHandler` directly.

The test does not call:

- `/api/activities/submissions`
- `createServerOwnedSubmissionHandler`
- `submitIm3PublishedEvidenceHandler`
- the production SRS bridge
- the student Graphing Explorer interface

Thus, it is a useful policy composition test. It is not a full production flow test. The Independent assertion proves the pure handler decision with fabricated stored evidence. It does not prove the actual production Independent writer, grader, wrapper, or SRS effect.

Source: `apps/integrated-math-3/__tests__/convex/im3-graph-teacher-exposure.test.ts`.

## Checks that passed

- The publication gate requires the exact current node and blueprint to be approved.
- The helper uses only the newest published lesson version. A detached newer publication withdraws the source.
- The helper requires a Worked phase and the exact physical activity ID.
- The mutation verifies teacher role, same organization, class ownership, non-archived class, active enrollment, submission ownership, assignment, and source time after enrollment and assignment.
- The mutation verifies the activity stable ID, node ID, component, mode, SRS flag, and approval state.
- A student Worked submission is not converted automatically into teacher evidence.
- Replay by the same key is stable. A key used for another source conflicts.
- A second key for the same source returns the existing teacher event.
- Existing learner evidence remains in history when teacher evidence is added.
- Teacher evidence uses the teacher action time. Learner work completed before teacher verification does not become retroactively eligible through an earlier source timestamp.
- The route derives the teacher identity from the session. It rejects student sessions, missing keys, and extra identity fields.
- The teacher form shows class, student, lesson, response, grade state, and submission time. It locks selection while pending. It preserves the retry body and key after a network failure.
- The teacher form is mounted on the production teacher student page.

## P2 observations

The route permits administrators. The mutation then requires `classroom.teacherId === args.teacherId`. The candidate query also loads only classes indexed by the administrator ID. An administrator cannot use the action for a class owned by another teacher. Align the route role with the actual mutation policy, or define and test administrator scope.

The form removes a confirmed candidate only from local state. A refresh depends on the candidate query finding the durable evidence row. The handler tests cover both parts separately. No test drives the route result through a page refresh and query omission.

## Verification

The focused run passed 27 tests in four executed files:

- `__tests__/convex/im3-graph-teacher-exposure.test.ts`
- `__tests__/app/api/teacher/graph-exposure-route.test.ts`
- `__tests__/components/teacher/Im3GraphExposureForm.test.tsx`
- `curriculum/skill-graph/__tests__/pilot-submission-evidence.test.ts`

The requested `activities-server-owned-submission.acceptance.test.ts` filter did not execute in this run. Vitest reported only the four files above. No production browser flow or deployed Convex flow was run.

## Author response and production-flow result

The new test `im3-graph-real-production-flow.test.ts` now uses one shared memory database. It calls the production legacy Worked writer. It then calls the teacher attestation handler. It calls the production server-owned Independent writer and grader next. It finishes with the production evidence and SRS wrapper. The positive setup does not insert a submission or evidence row.

The first Red run found a production grading defect. `GraphingExplorerActivity` and the `quadratic-graph-analysis` generator use `table_values` and `placed_points`. The server grader required `tableValues` and `placedPoints`. A correct Independent response could not pass canonical answer validation. The server mapping now uses the component and generator keys.

The next run reached the SRS adapter. The first memory database did not implement the `MutationCtx.runQuery` or `db.replace` methods that the production Convex card store uses. The test database now supports those methods. The same test now proves a score of 2 of 2, eligible evidence, one SRS card, and one SRS review log.

The teacher boundary now uses one exact Worked acknowledgement validator in the candidate query and mutation. It checks the server contract stamp, ordinal, timestamp, absence of grade fields, `practice.v1`, physical activity ID, mode, status, client timestamp, empty acknowledgement answers and parts, and the reviewed graph props. These checks match the current legacy writer and Worked acknowledgement contract.

The earlier recommendation to require extra identity fields in the phase section was too strict. The current published lesson section stores the physical activity ID and component key. The implementation keeps that exact section contract. It validates the stable activity ID, node ID, mode, SRS flag, approval, and props on the referenced activity document.

The route, query, and mutation now require the teacher role. They do not describe an administrator as eligible for a class-owner action that an administrator cannot complete.

The focused final run passed 20 tests in three files. `npm run lint` and `npx tsc --noEmit` also passed. No browser test, deployed Convex test, deployment, or curriculum approval was done.
