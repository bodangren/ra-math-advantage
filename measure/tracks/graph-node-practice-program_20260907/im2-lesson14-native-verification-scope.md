# IM2 Lesson 1.4 native verification scope

## Decision

Use a fresh disposable loopback Convex backend and a fresh loopback IM2 app. Use the real login, student practice page, submission route, server mutations, student query, and teacher evidence page.

The committed graph remains draft. Do not bypass the production publication functions. Use a temporary local source overlay that changes only the two exact node and blueprint publication fields. Restore the source files after the disposable run.

## Source authority

Use commit `ff4b4458d` plus the forthcoming accepted three-path Worked reload repair as the application source. Do not start native setup until that repair passes independent review and integration.

Keep these exact node IDs:

- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures`

Keep the six fixed stable activity IDs, modes, seeds, native problem numbers, and figure paths from `lib/practice/triangle-ordering.ts`.

Verify these native files return HTTP 200 from the real app:

- `/curriculum/module-1-lesson-4/image2.png`
- `/curriculum/module-1-lesson-4/image3.png`
- `/curriculum/module-1-lesson-4/image4.png`
- `/curriculum/module-1-lesson-4/image5.png`
- `/curriculum/module-1-lesson-4/image6.png`
- `/curriculum/module-1-lesson-4/image7.png`

Capture one screenshot for each of the six rendered activities. Confirm that the prompt and alternative text match the fixed native problem.

## Temporary local source

Use only these temporary candidate paths:

1. `apps/integrated-math-2/curriculum/skill-graph/nodes.json`
2. `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
3. `apps/integrated-math-2/convex/triangleOrderingVerificationFixture.ts` (temporary local-only file)

Keep the browser runner and evidence inspector outside the repository under `/tmp/im2-lesson14-native-verification/`.

Do not change the schema, production query, production mutation, route, component, activity content, graph edges, source documents, images, or another graph record.

## Fixture duties

The temporary Convex fixture must call the accepted `seedTriangleOrderingPracticeHandler()`. It must not copy the seed logic.

It can expose only bounded local verification operations:

- `prepareActivities`: validate all six seeded activities against `projectTriangleItem()`. Patch only their `approval` and `srsEligible` fields for the requested stage.
- `addEvidencePrerequisite`: insert one explicit non-mastery `teacher_led` learning-evidence row for one synthetic learner and one exact node. Validate the active learner, exact node, and a real physical source submission ID first. Use these exact evaluator fields: `learnerId`, exact `nodeId`, physical `submissionId`, exact source stable `activityId`, positive safe `attemptOrdinal`, `origin: "teacher_led"`, `mode: "guided_practice"`, ISO `occurredAt`, nonempty unique `idempotencyKey`, `masteryBearing: false`, and finite `createdAt`. Omit `gradedEvidence`. This row is a disclosed test precondition for `evaluateLearningEvidenceV1`. It is not product evidence.
- `snapshot`: return the six complete activity rows and only the selected synthetic learners' triangle submissions, learning evidence, SRS cards, and SRS review logs. Include the teacher projection inputs needed for comparison. Resolve exactly one lesson through `lessons.by_slug` with slug `module-1-lesson-4`. Return that scoped lesson and its lesson versions. Match the seed result by physical `lessonId`, then require its `lessonVersionId` to belong to that exact lesson. Fail if the lesson is missing or duplicated, or if the seed pair is absent or inconsistent. Do not select by array position or title. Omit credentials and unrelated profiles.

Do not add a reset, general data editor, publication override, alternate query, alternate grader, alternate submission handler, or alternate teacher projection.

Run `seed/seed_module_1_lessons:seedModule1Lessons` on the fresh backend. Use the bounded `snapshot` lookup to identify the canonical lesson. Match its physical ID to the seed result and select that result's exact lesson version. The seed result has no slug. Publish that exact version through the existing `publication:publishLesson` internal mutation before the teacher assignment flow. Then use the existing `seed/seed_demo_env:seedDemoEnv` function to create the local organization, class, teacher, and student accounts. Keep its credential output private. Do not put a password, salt, hash, token, or complete profile document in evidence.

## Stage 0: committed draft guards

Push the exact committed source first. Keep both nodes and blueprints draft. Keep all six activities unapproved and `srsEligible: false`.

Run the triangle seed twice. Compare all six complete rows from both calls. Require the same physical IDs and full row content. Require no approval and no changed timestamp on the second call.

Use the real student login and open `/student/practice`. Require the production triangle query to return no activities.

Use a sanitized fixture snapshot to get one physical activity ID. Send one real submission route request for that ID. Require rejection through the production publication guard. Compare all effect tables before and after. Expected writes in this stage:

- six activity rows from the first seed;
- zero triangle submissions;
- zero learning-evidence rows;
- zero SRS cards;
- zero SRS review logs.

## Stage 1: approved content with readiness disabled

In the temporary source copy, change only these fields for the two exact graph records:

- node `reviewStatus`: `approved`;
- blueprint `reviewStatus`: `approved`;
- node `independentPracticeReady`: keep `false`;
- blueprint `metadata.independentPracticeReady`: keep `false`.

Do not change a title, kind, source reference, edge, metadata field, or other record. Push this temporary source to the disposable backend.

Call `prepareActivities` with `approval.status: approved` and `srsEligible: false` for all six exact activities. Rerun the real seed. Require all approvals, physical IDs, and full reviewed rows to remain unchanged.

Before any Stage 1 learner submission, complete the real teacher lesson-assignment flow described below. Verify its canonical `class_lessons` row in the baseline. Then use the real learner page. Require exactly six activities total in this order: angles Worked Problem 6, angles Guided Problem 8, angles Independent Problem 11, sides Worked Problem 7, sides Guided Problem 9, and sides Independent Problem 10. This is the component sequence. Run the browser in this order.

Run these flows with one fresh learner:

1. Save each Worked acknowledgement. Require no grade and no evidence.
2. For Guided Problem 8, save one wrong first part. Require one hint and cumulative hint count 1. Retry with the exact request after an ambiguous network failure. Require the same submission ID and no new row. Then finish all three parts.
3. Reload after the wrong Guided result and after one correct accepted prefix. Require the same current part, exact accepted prefix, hint count, and reveal count.
4. Finish Guided Problem 9 normally. Require three ordered part rows.
5. Finish Independent Problem 11 with its one final part.
6. For Independent Problem 10, submit a wrong `missing_angle`. Require the final part to remain unavailable. Submit `66`, then submit a wrong final order. Require `finalPart: true`, `complete: false`, and separate missing-angle and final-order grades. Reload and require the final part and accepted `66` prefix. Submit the correct final order and require total 2 of 2.

Use the installed Playwright request interception for the one ambiguous-failure case. Match only the selected triangle submission POST. Call `route.fetch()` so the real app and Convex mutation finish. Read the complete upstream response. Then call `route.abort()` so only the browser loses the response. Wait for the inspector to observe the committed row before the learner clicks retry. Record both request bodies and `Idempotency-Key` values. Require exact equality. Use an external loopback proxy only if the installed interception cannot complete these exact semantics.

Expected triangle submissions for this exact sequence are 14:

- 2 Worked acknowledgements;
- 4 Guided Problem 8 rows;
- 3 Guided Problem 9 rows;
- 1 Independent Problem 11 row;
- 4 Independent Problem 10 rows.

The lost response retry must not add row 15.

Require zero learning evidence, SRS cards, and SRS review logs after every Stage 1 submission.

## Teacher read

Before Stage 1 learner submissions, use the real teacher login and open `/teacher/classes/<class-id>`. Use the real lesson-assignment form and `classes.assignLesson` mutation to assign the published canonical Lesson 1.4 to the demo class. Require one `class_lessons` row with that physical lesson ID. Do not insert the assignment through the temporary fixture.

After the Stage 1 learner submissions, open `/teacher/students/<student-id>?classId=<class-id>` with the IDs from the sanitized seed result.

Require every staged triangle attempt to appear. Require intermediate and incorrect rows to show the current public part ID, raw learner answer, and current-part score. Require only complete final rows to show totals. Require `canRecordExposure: false` for every triangle row. Do not call the perpendicular exposure route for a triangle row.

## Stage 2: later-ready evidence behavior

Use only active student accounts created by `seed/seed_demo_env:seedDemoEnv`. Do not create credentials. Record a sanitized mapping from local labels such as `stage1`, `angles-correct`, and `sides-negative` to physical profile IDs. Do not record usernames or passwords. Use a fresh learner for each learner-and-node pair. A learner can be reused for the other node when that learner has no completed sequence for that node.

In the same temporary source copy, change only these readiness fields for the two exact records:

- node `independentPracticeReady`: `true`;
- blueprint `metadata.independentPracticeReady`: `true`.

Keep the approved review states. Push the temporary source to the disposable backend. Call `prepareActivities` so only the two Independent activities have `srsEligible: true`. Keep Worked and Guided false.

Allocate the existing active demo learners as follows: one learner for Stage 1; one learner for angles-correct and sides-correct; and one learner for angles-incorrect and sides-incorrect. After the incorrect angles final, reuse that same incomplete learner-and-node sequence for the reveal-count exclusion. For each evidence learner and exact node, first save its real Worked acknowledgement. Pass that physical acknowledgement submission ID and its exact stable activity identity to `addEvidencePrerequisite` once. The fixture evidence origin and mode are synthetic evaluator inputs; report this fact explicitly. Do not count the Worked acknowledgement as teacher evidence. Do not leave a dangling submission ID. Record these rows separately as synthetic non-mastery preconditions. Do not count them as triangle result evidence.

Run these production submission flows:

- Angles node, correct final answer: one correct exact-node mastery evidence row, one node-specific SRS card, and one review log.
- Angles node, incorrect final answer: one incorrect exact-node mastery evidence row, one node-specific SRS card, and one review log.
- Sides node Problem 10, correct `66` then correct final order: one correct sides-node mastery evidence row. Do not create missing-angle evidence.
- Sides node Problem 10, wrong `missing_angle`: create no result evidence. Then save `66` and an incorrect final order: create one incorrect sides-node mastery evidence row. Do not create missing-angle evidence.
- After the angles-incorrect learner has one incorrect final receipt, use the real authenticated submission route to submit the correct final answer with `revealStepsSeen: 1`. The handler permits this because the prior receipt is incomplete and the reveal counter is monotonic. Require no additional result evidence, card, or review log.

Require every result evidence row to reference its real final submission ID, exact stable activity ID, exact attempt ordinal, and exact node. Require the negative final receipt to remain `complete: false` while its graded evidence is incorrect.

After the four eligible final results, expect four mastery-bearing result evidence rows, four SRS cards, and four SRS review logs. The later revealed correct retry must not increase any of these counts. Count the synthetic teacher-led prerequisites separately.

## Browser and evidence files

Record only sanitized evidence:

- source-stage description;
- query results with public activity data;
- request and response events;
- submission IDs, modes, ordinals, public parts, totals, and counters;
- exact-node evidence, card, and review-log fields;
- teacher public projection;
- screenshots;
- pre-stage and post-stage table counts.

Do not record credentials, tokens, salts, hashes, environment files, complete unrelated profiles, or backend secrets.

## Exit conditions

Accept native behavior only if all stages pass with the stated writes and zero unexpected effects. Memory tests remain source evidence. The disposable run supplies transaction, browser, reload, and teacher evidence.

Delete the disposable backend after evidence review. Remove the temporary fixture. Restore both graph JSON files exactly. Confirm that the candidate has no temporary source, environment, or generated-file difference.

The temporary approved and ready graph states are verification fixtures. They do not authorize a source activation commit. The current production teacher-led exposure action supports only Lesson 1.1. Stage 2 proves conditional persistence with synthetic prerequisites. It does not prove a production triangle introduction flow. Complete the separately tracked exact-node teacher-led introduction and its real teacher/student verification before activation. A later activation patch must separately change the two canonical node rows, two canonical blueprint rows, and six activity approval/SRS states only after this native evidence is accepted.
