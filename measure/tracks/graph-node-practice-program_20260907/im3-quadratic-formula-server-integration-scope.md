# IM3 quadratic-formula server integration scope

## Decision

Extend the existing server-owned submission path. Keep the quadratic-formula node, blueprint, activities, and progression inactive. Store a server grade for quality assurance. Create no competency, SRS, mastery, knowledge-state, learning-evidence, or evidence-receipt effect.

No protected quadratic-formula attempt exists now. The first `activity_submissions` row is created only when the server accepts a submission. The activity, practice item, and private practice variant form the stored grading authority before that write.

## Exact draft identities

Use these existing graph identities:

- Node: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`.
- Component and generator: `quadratic-formula`.
- Guided activity: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.guided_practice`.
- Guided submission mode: `guided_practice`.
- Independent activity: `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations.independent_practice`.
- Independent submission mode: `independent_practice`.

The committed projection contains the Guided identity. It does not contain an Independent activity row. The preserved draft blueprint declares an Independent `unique_seeds` policy but does not assign a concrete seed. Therefore, the implementation must select and record exact reviewed seeds before it writes seed code. Do not infer them from array order. The parent accepts Guided seed `1` and Independent seed `2` for these first draft storage records. Tests must state these integers directly. These two records do not establish all-regime or unique-attempt coverage.

Do not replace the source Worked activity. Do not treat its fixed Example 3 equation as a generated learner attempt.

## Storage authority

Reuse `activities`, `practice_items`, and `practice_variants`. Add no table or index.

For each mode, require exactly one coherent relation:

- `activities.stableActivityId` equals the exact mode identity.
- `activities.masteryNodeId` equals the exact Lesson 1.6 node.
- `activities.componentKey` equals `quadratic-formula`.
- `activities.srsEligible` is `false`.
- `activities.props.presentationMode` agrees with the activity ID and submitted mode.
- One `practice_items` row has the physical `activityId` and exact `variantKey`.
- One `practice_variants` row has that exact `variantKey`.
- The variant `componentKey` equals the activity component key.
- The variant `objectiveIds` is exactly the one-element array that contains the Lesson 1.6 node.
- The private metadata is an exact bounded object. It contains `generatorKey`, `seed`, `stableActivityId`, and `mode` with the values above.

Reject a missing relation, duplicate relation, extra objective, wrong physical activity ID, wrong component, wrong mode, wrong seed, unsafe seed, or changed generated equation. Never select an arbitrary duplicate.

Store the seed only in `practice_variants.metadata`. Do not store it in `activities.props` or `gradingConfig`. `getActivityById` returns `gradingConfig`, so neither public field can contain canonical answers, roots, root count, grading rules, or seed.

`objectiveProficiency.ts` reads variants only to derive variant keys and objective membership. Its student, teacher, and knowledge-proficiency results do not return variant documents or metadata. Add behavioral public-result assertions for these consumers. Assert that the seed and canonical answers are absent. Keep the same assertion for `student.getLessonProgress` and the activity read.

## Minimum production changes

1. `apps/integrated-math-3/convex/schema.ts`
   Add the committed public quadratic-formula props union. Keep the fixed public shape. Add no private answer or seed field.

2. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
   Build and idempotently upsert the two reviewed draft records. Generate each public equation from its exact seed. Store one coherent activity, variant, and item relation for each mode. Keep `srsEligible: false`.

3. `apps/integrated-math-3/lib/activities/server-grading.ts`
   Add an explicit quadratic-formula branch. Regenerate the problem from the validated private seed. Require the generated equation to equal the public equation. Call `gradeQuadraticFormulaResponse` with only `discriminant`, `x1`, and `x2`. Do not use the general expression grader. Return no mastery contract version.

4. `apps/integrated-math-3/convex/activities.ts`
   Add one explicit draft QF mapping in `createServerOwnedSubmissionHandler`. Validate the authenticated active student and credential. Validate the complete storage relation above. Preserve indexed idempotency and attempt ordinal allocation.

   Use a QF-specific canonical replay payload. Follow the existing `canonicalPayload` and `canonicalWorkedPayload` pattern. Include every accepted request field that changes the stored request, including status, attempt number, submitted time, answers, parts, and permitted telemetry. The current writer has no `sameServerOwnedRequest` function. Do not invent or claim that API. Normalize the server-added graded status and grade fields for replay. Keep the original QF request attempt number as request telemetry in `submissionData`; the separate indexed `attemptOrdinal` is the server authority. This preserves exact request comparison without a new storage field. Do not change existing graph-pilot ordinal behavior.

   Insert only the server grade. Omit `masteryContractVersion`.

   Add narrow early rejection in the existing inline `submitActivity` handler for any QF candidate identified by either exact stable ID, the QF node with component `quadratic-formula`, or the exact physical activity linked to a QF variant. This blocks `/api/activities/submit` before its client-part persistence, competency update, and SRS scheduling.

   Add the same narrow rejection to `submitAssessment`. This mutation currently accepts client score fields and inserts without loading the activity. It must load the target activity only for this guard, identify the QF candidates above, and reject before insertion. Do not change behavior for unrelated assessments or approved pilots.

5. `apps/integrated-math-3/app/api/activities/submissions/route.ts`
   Accept only the fixed answer and part IDs `discriminant`, `x1`, and `x2`. Require exact answer-to-part raw-value agreement. Permit blank `x2` only at this shape boundary. Reject grade fields, missing parts, duplicates, unknown parts, and extra parts. The server grader decides whether blank `x2` is correct.

No lesson renderer change is part of this draft backend task. A later reviewed placement can route QF through `createServerOwnedActivitySubmission`. The generic lesson route must remain rejected until then.

## Required behavioral tests

- Execute the seed builders and upserts. Assert exact IDs, reviewed seeds, modes, public equations, one coherent activity-item-variant relation, replay stability, and no private value in public activity fields.
- Execute public activity, lesson-progress, student-proficiency, teacher-proficiency, and knowledge-proficiency consumers. Assert that variant metadata, seed, and canonical answers do not appear.
- Execute the real server-owned POST route. Test authentication, the exact three-field shape, answer-to-part equality, duplicate and extra parts, client grades, blank `x2`, and the exact internal mutation arguments.
- Execute grading for every generated regime. Test equivalent exact forms, unordered distinct roots, repeated-root blank `x2`, wrong or malformed values, changed equations, wrong generator identity, and unsafe seeds.
- Execute the Convex writer with indexed fixtures. Test every activity-item-variant identity mismatch and duplicate. Test first create, JSON-round-tripped replay, changed-payload conflict, and the next attempt ordinal.
- Execute both alternate authenticated routes for both QF modes. Assert that generic `submitActivity` and `submitAssessment` reject before any submission, competency, SRS, review, mastery, knowledge-state, evidence, or receipt write.
- Submit a valid stored draft submission to the learning-evidence path. Assert rejection and zero effects.

## Bounded implementation

The backend task changes these five production files and their local tests:

1. `apps/integrated-math-3/convex/schema.ts`
2. `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`
3. `apps/integrated-math-3/lib/activities/server-grading.ts`
4. `apps/integrated-math-3/convex/activities.ts`
5. `apps/integrated-math-3/app/api/activities/submissions/route.ts`

Reuse `apps/integrated-math-3/lib/activities/submission.ts` without a change. Add no route, registry, table, index, dependency, graph approval, lesson placement, or progression effect.

## Parent implementation limits

Read the real functions before each edit. No `legacySubmitActivityHandler` exists in the accepted baseline. Extract a small handler only if behavioral testing requires it. Do not import a seed module into the runtime grader. Define the two exact mode mappings in the existing grader module and reuse them from seed code. Validate draft approval state explicitly. Reject existing approved records before any seed update. Do not silently overwrite unrelated or inconsistent variant relations. Use transactions for all upserts. Do not deploy or seed a live database in this batch.
