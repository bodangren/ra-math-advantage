# IM2 Lesson 1.4 Worked reload repair scope

## Decision

Repair the Worked acknowledgement recovery and canonical lesson binding before native browser verification. Change three existing paths only.

The accepted query currently appends every Worked item before it reads submission history. After a reload, the component starts at the first Worked item again. It creates an unnecessary acknowledgement and prevents exact resume at the saved Guided or Independent part.

## Exact paths

1. `apps/integrated-math-2/convex/activities.ts`
2. `apps/integrated-math-2/__tests__/convex/triangle-ordering-practice.test.ts`
3. `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-teacher-candidate.test.ts`

Do not change the client, route, schema, seed, graph, activity content, evidence logic, or teacher projection.

## Shared stored acknowledgement validator

Add one small private helper in `convex/activities.ts`. Use it for the Worked query branch, same-key replay, and newest-row check before a new-key write.

The helper must require:

- row `userId` and `activityId` equal the selected learner and physical activity;
- row `lessonId` equals the canonical Lesson 1.4 physical lesson ID;
- a nonempty stored idempotency key;
- a positive safe attempt ordinal;
- finite `submittedAt`, `createdAt`, and `updatedAt` row times;
- no `score`, `maxScore`, `feedback`, `gradedAt`, mastery contract, or evidence field;
- an exact `practice.v1` envelope;
- exact physical `activityId`;
- mode `worked_example`;
- status `submitted`;
- envelope attempt number equal to the row ordinal;
- a valid submitted timestamp that represents the stored row submission time;
- exact empty `answers` and exact empty `parts`;
- an exact artifact with only `request`;
- an exact request with only empty `answers`, nonnegative safe `hintsUsed`, and nonnegative safe `revealStepsSeen`.

Return the validated request counters. Do not accept an extra envelope, artifact, request, grade, answer, part, or private field.

## Canonical lesson binding

Resolve exactly one lesson with slug `module-1-lesson-4` through the existing `by_slug` index. Fail closed if it is missing or duplicated.

Store that physical lesson ID as `lessonId` on every new Worked acknowledgement. Pass it to the shared validator. A stored Worked acknowledgement without this exact lesson ID is malformed.

Do not weaken or special-case the teacher query lesson-assignment filter. The canonical binding must make the Worked row visible through the existing filter.

## Query behavior

In the Worked branch of `getTrianglePracticeHandler()`:

1. Read only the newest row with the existing descending `by_user_activity_attempt_ordinal` index.
2. If no row exists, append the public Worked item.
3. If a valid Worked acknowledgement exists, omit that Worked item and continue to the next mode.
4. If the newest row is malformed, let the existing fail-closed query boundary return the complete triangle practice result as unavailable.

Do not scan older rows. Do not use a client flag. Do not add a completion table.

This behavior lets a reload start at the first unfinished Guided or Independent item. It also prevents a completed Worked item from returning to the sequence.

## Mutation replay behavior

Keep the indexed same-key lookup first.

For a same-key row:

- validate the complete stored acknowledgement with the shared helper;
- require the submitted empty answers and both counters to equal the stored request;
- return the same physical submission ID;
- return conflict for a changed request;
- return invalid stored history for a malformed row.

When no same-key row exists, read only the newest learner-and-activity row through the descending attempt-ordinal index before insertion.

- If no row exists, resolve the canonical Lesson 1.4 row and insert the first acknowledgement with its physical `lessonId`.
- If a valid acknowledgement exists and the new request has the same empty answers and counters, return the existing physical submission ID. Do not insert a duplicate row.
- If a valid acknowledgement exists and either counter differs, return conflict. Do not insert a row.
- If the newest row is malformed, return invalid stored history. Do not insert a row.

Do not increment an ordinal after a valid Worked completion.

## Required tests

Use the actual query and bounded submission handlers.

Prove:

1. Before acknowledgement, the query returns all six activities in canonical order.
2. After the angles Worked acknowledgement, a reload omits only that item and starts with angles Guided Problem 8.
3. After the sides Worked acknowledgement, a reload omits that item and keeps the current sides Guided or Independent position.
4. A same-key exact retry returns the same physical row and ID.
5. A different key with the same request returns the same physical row and ID.
6. A same-key or different-key changed counter returns conflict with no write.
7. A malformed newest Worked envelope makes the query unavailable.
8. Each malformed field listed above blocks same-key replay and a different-key write with no effect.
9. A valid Worked acknowledgement still writes no grade, learning evidence, SRS card, or SRS review log.
10. With a real Lesson 1.4 class assignment, `teacher.getStudentEvidence` includes the Worked acknowledgement. It shows an empty answer, score 0, maximum score 1, and `canRecordExposure: false`.
11. A wrong or missing Worked `lessonId` is rejected by query recovery and replay.
12. Graded Guided and Independent history behavior remains unchanged.

Compare complete table snapshots for every rejected operation. Keep JSON object key order without authority where an object map is compared.

## Verification

Run the changed server test and the existing component, route, teacher, seed, and perpendicular regression tests. Then run the full IM2 suite, lint, build, and a separate post-build TypeScript check.

Memory fixtures do not prove real Convex transactions. After source acceptance, resume the native scope in `/tmp/im2-lesson14-native-verification-scope.md`. Its expected Stage 1 count remains 14 because each Worked item has one physical acknowledgement and reload adds no duplicate.
