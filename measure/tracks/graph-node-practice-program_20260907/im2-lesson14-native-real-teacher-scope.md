# IM2 Lesson 1.4 native verification with real teacher introduction

## Decision

Use one fresh disposable loopback Convex backend and one fresh loopback IM2 app. Use the real login, student practice page, submission route, teacher class page, teacher evidence page, and production mutations.

Use source commit `1b1dca042`. It includes the accepted teacher introduction and chronology repair. Do not start setup until this scope passes review.

## Fixed source

Use these nodes:

- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures`

Keep the six fixed activities in this order:

1. angles Worked Problem 6;
2. angles Guided Problem 8;
3. angles Independent Problem 11;
4. sides Worked Problem 7;
5. sides Guided Problem 9;
6. sides Independent Problem 10.

Verify image paths `image2.png` through `image7.png`. Capture each activity. Confirm its prompt, alternative text, mode, problem number, seed, and figure.

## Temporary local source

Use only these temporary candidate paths:

1. `apps/integrated-math-2/curriculum/skill-graph/nodes.json`
2. `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
3. `apps/integrated-math-2/convex/triangleOrderingVerificationFixture.ts`

Keep browser and evidence tools under `/tmp/im2-lesson14-native-verification/`.

The fixture can expose only these bounded operations:

- `prepareActivities`: call the accepted triangle seed handler. Validate all six activities with `projectTriangleItem()`. Patch only `approval` and `srsEligible` for the requested stage.
- `snapshot`: return the six full activity rows. Return only the selected learners' triangle submissions, learning evidence, SRS cards, and SRS review logs. Return the scoped lesson, version, assignment, enrollment, and teacher projection fields. Omit credentials and unrelated profiles.

Do not add `addEvidencePrerequisite` or another evidence writer. Do not insert teacher evidence through the fixture.

Run `seed/seed_module_1_lessons:seedModule1Lessons`. Resolve exactly one lesson through `lessons.by_slug` with `module-1-lesson-4`. Match its physical ID to the seed result. Select the returned version for that physical lesson. Publish it through `publication:publishLesson { versionId }`.

Run `seed/seed_demo_env:seedDemoEnv`. Keep credential output private. Record only sanitized labels and physical profile IDs.

Use the real teacher class page before all Stage 1 submissions. Assign the published physical Lesson 1.4 through `classes.assignLesson`. Require one canonical `class_lessons` row. Its `assignedAt` must be before every source submission used for teacher confirmation.

## Stage 0: committed draft guards

Push the exact committed source. Keep both nodes and blueprints draft. Keep all six activities unapproved with `srsEligible: false`.

Run the triangle seed twice. Require exact row equality, stable physical IDs, and no timestamp change. Require no student activities from the production query. Send one real submission request for a sanitized physical activity ID. Require publication rejection and no write.

Expected writes:

- six activities from the first seed;
- zero triangle submissions;
- zero learning evidence;
- zero SRS cards;
- zero SRS review logs.

## Stage 1: approved content with readiness disabled

In the temporary graph source, change only both exact node and blueprint `reviewStatus` values to `approved`. Keep both readiness fields false. Push that source.

Call `prepareActivities` with all six activities approved and `srsEligible: false`. Rerun the triangle seed. Require the reviewed rows and physical IDs to remain unchanged.

Use one fresh learner. Run the activities in this exact gate order:

1. Save the angles Worked Problem 6 acknowledgement.
2. On angles Guided Problem 8, save one wrong first part. Use Playwright `page.route()`, `route.fetch()`, and `route.abort()` for one successful server write with a lost browser response. Wait until the snapshot shows the row. Retry with the exact body and `Idempotency-Key`. Require the same physical row. Reload after the wrong result and after one accepted prefix. Require the same current part, accepted answers, hint count, and reveal count. Finish all three Guided parts.
3. Finish angles Independent Problem 11.
4. Save the sides Worked Problem 7 acknowledgement.
5. Finish all three parts of sides Guided Problem 9.
6. On sides Independent Problem 10, save a wrong `missing_angle`. Require the final part to stay unavailable. Save `66`. Save a wrong final order. Reload and require the accepted `66` prefix and final part. Then save the correct final order.

Expected submissions are 14: 2 Worked, 4 Guided Problem 8, 3 Guided Problem 9, 1 Independent Problem 11, and 4 Independent Problem 10. The lost-response retry must not create row 15.

Require zero learning evidence, SRS cards, and SRS review logs after each Stage 1 write. Valid final Guided rows can show `Confirm teacher exposure` on the teacher page. Do not select those actions in Stage 1.

On the teacher evidence page, require all 14 rows. Require only the two canonical final Guided rows to offer the action. Worked, intermediate Guided, and Independent rows must not offer it. Require current-part display for incomplete rows and totals only for complete final rows.

## Stage 2: real teacher prerequisites and ready evidence

Change only both readiness fields to true in the temporary graph source. Keep the approved states. Push that source. Set only the two Independent activities to `srsEligible: true`. Keep Worked and Guided false.

Use two fresh active demo learners. Each learner must progress through both nodes in the real gate order. This gives four learner-and-node pairs. Do not create credentials.

For one of the four teacher actions, forward the POST to completion with `route.fetch()`. Then abort only the browser response. Wait for the evidence row. Retry through the same form. Require the same request body, `Idempotency-Key`, evidence ID, and physical evidence row.

Require exactly four non-mastery teacher rows. Each row must have the correct learner, node, physical final Guided submission ID, exact stable Guided activity ID, source attempt ordinal, `origin: "teacher_led"`, `mode: "guided_practice"`, `masteryBearing: false`, valid chronology, and no `gradedEvidence`. Count these rows separately from result evidence.

Run learner A in this exact order:

1. angles Worked;
2. angles Guided final;
3. teacher confirmation for angles;
4. correct angles Independent final;
5. sides Worked;
6. sides Guided final;
7. teacher confirmation for sides;
8. correct sides Independent final.

Run learner B in this exact order:

1. angles Worked;
2. angles Guided final;
3. teacher confirmation for angles;
4. incorrect angles Independent final;
5. submit the correct angles final through the real authenticated route with `revealStepsSeen: 1`;
6. reload and confirm that the completed angles sequence advances to sides;
7. sides Worked;
8. sides Guided final;
9. teacher confirmation for sides;
10. incorrect sides Independent final.

For sides, require `66` before the final order. A wrong missing angle must create no result evidence. For each eligible final result, require one exact-node mastery-bearing result row, one node-specific SRS card, and one review log. Require the teacher row time to be no later than the Independent result time.

Immediately after learner B's revealed correct angles retry, require the totals to remain at three teacher rows, three result rows, three cards, and three review logs. The retry completes the UI sequence but must add no evidence, card, or review log. Only learner B's later sides teacher action and incorrect Independent final can increase the final totals to four.

Expected Stage 2 totals:

- four teacher-led non-mastery rows;
- four mastery-bearing result rows;
- four SRS cards;
- four SRS review logs.

The revealed retry must not increase these totals.

## Evidence and exit

Save sanitized request events, response events, public activity data, submission IDs, modes, ordinals, parts, totals, counters, exact-node evidence fields, cards, review logs, teacher projections, screenshots, and table counts.

Do not save credentials, tokens, salts, hashes, environment files, full profiles, or backend secrets.

Accept the run only if all stages have the exact writes and effects above. Delete the disposable backend after evidence review. Remove the temporary fixture. Restore both graph files exactly. Confirm no temporary source, environment, or generated-file difference remains.

The temporary approved and ready graph states are verification fixtures. They do not authorize graph activation.
