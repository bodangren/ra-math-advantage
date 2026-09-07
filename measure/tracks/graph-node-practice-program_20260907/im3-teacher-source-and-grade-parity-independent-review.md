# IM3 Teacher Source and Grade Parity Independent Review

## Disposition

I found no blocking defect in the two reviewed guards.

The teacher source guard now binds the acknowledgement to the exact selected Worked content. The SRS guard now binds the aggregate grade to the authoritative stored parts. Both guards fail before a teacher evidence or SRS write.

## Teacher Worked source guard

`isExactIm3GraphWorkedAcknowledgement` now requires exactly two activity props. They are `variant: plot_from_equation` and `equation: f(x) = x^2`. It also requires exactly two grading fields. They are `autoGrade: false` and `partialCredit: false`.

These values match `buildIm3WorkedPilotSeedDocument`. They also match the strict selected Worked create boundary. The valid Q10 seeded acknowledgement remains accepted after a test-only publication and activity approval.

The mutation and candidate query use the same helper. A changed source therefore cannot appear as a teacher candidate and cannot pass a direct teacher action. The caller also requires the approved physical activity, selected stable ID, selected node, `graphing-explorer`, `worked_example`, `srsEligible: false`, current published lesson placement, class ownership, enrollment, assignment time, and current graph publication.

The four new negative cases cover an extra source prop, changed grading, missing grading, and an extra grading key. They verify that the mutation writes no teacher evidence. A direct changed-equation case is not present in this test table. The exact equality guard makes that case fail through the same branch. This is a small test coverage gap, not a current behavior defect.

The existing valid candidate and replay tests still pass. A student Worked acknowledgement remains non-mastery evidence. The teacher action adds one replay-safe `teacher_led` event.

## Stored grade and part parity guard

`createSelectedGraphSrsSubmission` reloads the physical submission. It requires at least one graded part. Each part must have finite score fields, a positive maximum, a bounded score, and an `isCorrect` value that agrees with its score.

The helper sums all part scores and maxima. Both totals must equal the stored aggregate score and maximum. It then calls the existing exact selected submission boundary. That boundary checks the selected activity, node, mode, response parts, answers, raw values, artifact, ordinal, and server timestamps.

This order is safe. An aggregate mismatch throws before `SubmissionSrsAdapter` runs. The new test verifies that the mismatch creates no SRS card and no SRS review log. The learner and node mismatch cases have the same no-write result.

The assisted fixture now uses the strict physical Worked acknowledgement shape. Two hints still cap the rating at `Good`. Three hints cap it at `Hard`. Unsupported reveal telemetry fails at the selected writer. The SRS adapter receives the stored hint counts. An identical evidence replay keeps one SRS card and one review log.

## Verification

I ran five focused test files. All 169 tests passed.

- `im3-graph-teacher-exposure.test.ts`
- `im3-guided-assisted-evidence.test.ts`
- `im3-graph-real-production-flow.test.ts`
- `selected-quadratic-seed-submission.test.ts`
- `learningEvidence-submission-authority.red.test.ts`

This review does not approve the graph node, blueprint, lesson publication, or physical activities.

## Integration owner disposition

The owner added the direct changed-equation case to the teacher rejection table. The teacher guard rejects changed equations, extra props, changed grading, missing grading, and extra grading keys. The regression first proved four accepted invalid configurations. The current app integration check passes 138 tests, lint, standalone TypeScript, and build. The teacher and SRS runtime changes remain pending selected-only HEAD integration.
