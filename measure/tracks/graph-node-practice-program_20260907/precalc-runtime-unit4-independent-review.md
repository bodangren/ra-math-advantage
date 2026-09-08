# Precalculus Q37 unit 4 final independent review

## Decision

Accept the final candidate for the unit 4 scope.

The final patch fixes the public section projection and the selected practice fallback defects. It also closes the response-size test gap.

## Public lesson projection

`course.getLesson` constructs a new public content object for each section. It copies only string `markdown`, `activityId`, and `componentKey` values.

The projector checks the stored value before it reads a property. It returns an empty object for `null`, arrays, strings, and numbers. It does not return nested `props`, grading data, answers, or unrelated stored fields.

The test calls the actual committed legacy `seedLesson1_1` handler. The seed stores nested activity props. The test then calls the actual `getLesson` handler. The returned activity section keeps its public identity and removes the nested content.

Current HEAD does not contain the selected Topic 1.1 phase-4, sequence-2 source link. The selected page fixtures are hypothetical fixtures. The report states this limit. The accepted Q22 seed remains a next-unit prerequisite. See `/tmp/precalc-q37-unit5-seed-review.md`.

## Selected learner components

`PrecalculusTopic11DailyCurriculumPilot` requires the stable activity ID and the projected Worked props. It has no browser content fallback.

`PrecalculusMasteryAdvantagePilot` now also requires the stable activity ID and projected activity props. It does not import or call the Topic 1.1 generator. It does not construct a fallback activity ID. A malformed runtime caller gets a closed unavailable state with no submit control.

The lesson page passes props from the strict server queries. It shows the Worked action only for the matching physical source. It shows the waiting state after the acknowledgement. It shows Guided and Independent practice only in the ready state. The Q36 guard keeps the ordinary response form for mixed, unrelated, null-source, wrong-ID, and wrong-component phases.

## Server boundaries

The learner check requires an active student profile. It checks credential profile ID, username, role, organization, and active status.

The ordinary response writer accepts exactly 10,000 characters. It rejects 10,001 characters. It rejects blank input, a missing phase, and a phase in a draft lesson. The test checks the physical row count after these cases.

The acknowledgement route accepts only an empty object. It preserves the opaque idempotency-key bytes. It builds the canonical six-field Worked envelope on the server. Its composition test calls the actual `createTopic11DailySubmission` handler. The test finds one ungraded acknowledgement and no learning evidence, SRS card, or SRS review.

## Independent verification

I ran the final seven focused files. All 49 tests passed.

The supplied final logs agree with this result:

- Unit 4 focused tests: 49 of 49 passed.
- Unit 3 backend tests: 151 of 151 passed.
- Lint passed.
- The fresh build passed.
- Post-build mapped standalone TypeScript passed with no diagnostics.

The final patch contains 18 repository paths. The production practice component has no generator import. Generator imports in the patch occur only in tests that construct expected source-aligned props.

## Limits

The test uses the real legacy seed for the projection boundary. It does not prove a selected source seed that is absent from HEAD. This unit does not add the teacher interface, source approval, a deployment, or a live data write.
