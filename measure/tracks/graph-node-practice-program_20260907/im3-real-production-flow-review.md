# IM3 Real Production Flow Independent Review

Date: 2026-09-07

## Decision

The repaired production path works for one new, correct Independent submission under a hypothetical approved publication. The current catalog stays inactive. The selected node and its blueprint have `reviewStatus: draft`.

The new flow test uses the production Worked writer, teacher attestation handler, Independent writer, server grader, evidence wrapper, and SRS stores. It verifies two stored submissions, two evidence rows, one SRS card, and one SRS review log.

## Independent Math Check

The Independent seed uses `seed: 0` and `difficulty: 0.5`. The generator gives the equation `y = -x^2 - 1`. The required x-values are `-2, -1, 0, 1, 2`.

Direct substitution gives these points:

| x | Calculation | y | Point |
|---:|---|---:|---|
| -2 | `-(-2)^2 - 1` | -5 | `(-2, -5)` |
| -1 | `-(-1)^2 - 1` | -2 | `(-1, -2)` |
| 0 | `-(0)^2 - 1` | -1 | `(0, -1)` |
| 1 | `-(1)^2 - 1` | -2 | `(1, -2)` |
| 2 | `-(2)^2 - 1` | -5 | `(2, -5)` |

These literal values match the generator output. The server grader uses `table_values` and `placed_points`. It requires exact table values. It permits a `0.25` coordinate tolerance for plotted points. The snake_case answer keys match the seeded rubric and the stored submission parts.

The new production-flow test gets its submitted answers from the same generator that creates the activity. Thus, that test proves system integration. It does not independently prove the mathematics. Add the literal points above to this test to prevent a shared generator error from passing both setup and assertion.

## Trust Boundary Evidence

- The student Worked write contains `answers: {}` and `parts: []`. It has no score, maximum score, or grade time.
- The Worked write does not create learning evidence.
- The teacher route accepts only an authenticated `teacher` role. It rejects extra request fields. It requires an idempotency key.
- The teacher mutation reloads the teacher, student, class, enrollment, source submission, activity, lesson, assignment, and current published lesson version.
- The teacher mutation requires the exact source activity, exact props, empty response, active enrollment, owned class, same organization, and valid submission time.
- The teacher action creates ungraded `teacher_led` evidence with mode `teaching`. It does not convert the student acknowledgement into a grade.
- The Independent writer reloads the activity and calculates the grade from stored activity props and raw answer parts. It stores the two server results as `2/2`.
- The evidence wrapper reloads the stored submission. It applies mastery and SRS from the server grade. It does not read a client score or client history.

## Findings

### P1 test coverage: the real production-flow test does not test replay

`im3-graph-real-production-flow.test.ts` runs each production boundary one time. It does not replay the Worked writer, teacher attestation, Independent writer, or evidence wrapper. It therefore does not prove that this exact composed flow keeps two submissions, two evidence rows, one card, and one review log after lost-response retries.

Other focused tests cover the parts separately. `activities-create-idempotency.red.test.ts` covers writer replay. `im3-graph-teacher-exposure.test.ts` covers teacher replay. `learningEvidence-submission-authority.red.test.ts` covers receipt replay and confirms that the mastery bridge runs one time. Add a second call at each boundary to the real-flow test. Assert unchanged row counts and `delivery: replay` for the evidence result.

### P2 teacher replay validation accepts an inconsistent stored evidence row

`recordIm3GraphTeacherExposureHandler` treats an existing row as a replay when its learner, idempotency key, source submission, and `origin: teacher_led` match. It does not also require the expected node, stable activity, mode, contract version, or attempt ordinal. The same-source fallback has the same limit.

A concrete counterexample is an existing `teacher_led` row for the same source submission with `nodeId: math.im3.skill.other`, `activityId: wrong`, and the requested idempotency key. The handler returns `replay: true`. It does not create the required graph introduction. Later Independent evidence can remain in `awaiting_teacher_exposure` even though the teacher UI reports success.

Require the replay row to equal the canonical attestation identity before return. Reject a conflicting row. This change protects availability and record integrity. The route authentication and new-write authorization are correct.

### P2 test defect: one focused recovery test is red

`activities-server-owned-recovery.red.test.ts` expects a Promise rejection from the exported Convex handler. The handler rejects the activity ID synchronously before it returns a Promise. The test therefore fails before Vitest can apply `.rejects`.

Wrap the call in an async function or use a synchronous throw assertion. The production rejection is correct. The failed assertion prevents the affected focused suite from being green.

## Test Results

Command:

```text
CI=true npm run test -- --run __tests__/convex/im3-graph-real-production-flow.test.ts __tests__/convex/im3-graph-teacher-exposure.test.ts __tests__/app/api/teacher/graph-exposure-route.test.ts __tests__/lib/activities/server-grading.test.ts __tests__/convex/activities-server-owned-recovery.red.test.ts __tests__/convex/learningEvidence-submission-authority.red.test.ts
```

Result: 292 tests passed. One test failed because of the synchronous assertion defect above. The real production-flow test, 16 teacher-exposure tests, three teacher-route tests, 135 server-grading tests, and 135 submission-authority tests passed.

## Files Reviewed

- `apps/integrated-math-3/__tests__/convex/im3-graph-real-production-flow.test.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/lib/activities/server-grading.ts`
- `apps/integrated-math-3/convex/learningEvidence.ts`
- `apps/integrated-math-3/app/api/teacher/graph-exposure/route.ts`
- `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`

## Repair Resolution

The bounded repair is complete.

- The teacher replay now requires the exact contract, node, activity, attempt ordinal, origin, mode, learner, and source submission.
- Five Red tests reproduced malformed replay rows. All five tests are now green.
- The real production-flow test now uses the literal solved points. It also proves a wrong `0/2` grade and a correct `2/2` grade.
- The flow test now replays the Worked writer, teacher action, Independent writer, evidence wrapper, and SRS effect. The replay creates no additional submission, evidence, card, or review-log row.
- The synchronous handler rejection test now uses the exported handler's synchronous contract.

The focused result is 298 passing tests in six files. Lint, `tsc --noEmit`, and the production build pass. The build reports existing middleware and KaTeX output warnings.

Before copies are in `/tmp/im3-real-flow-repair-before`. After copies are in `/tmp/im3-real-flow-repair-after`.
