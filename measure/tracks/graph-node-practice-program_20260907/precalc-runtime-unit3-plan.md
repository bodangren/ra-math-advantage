# Precalculus Q37 unit 3 plan

## Decision

The next integration unit must add the selected Topic 1.1 read model to `convex/activities.ts`.

This unit must not add the lesson page or teacher UI. HEAD does not yet have their required course query, routes, or components. A page-only patch would not compile.

## Current HEAD state

The investigation used the isolated unit 2 candidate based on `1cd1158e`. Implementation starts from committed HEAD `250a4167`, which includes unit 2 as `04e6dbd1`.

HEAD already has these selected contracts:

- exact Topic 1.1 constants and graph grader
- schema fields and indexes used by selected submissions and evidence
- the Worked acknowledgement writer
- the Guided and Independent server-owned writer
- the selected evidence handler
- the selected teacher confirmation handler
- the selected evidence HTTP route

HEAD does not have these learner queries:

- `getApprovedPrecalculusPilot`
- `getApprovedTopic11WorkedSource`
- `getTopic11LearnerDeliveryState`

HEAD also does not have `convex/course.ts`, the selected Worked acknowledgement route, the selected student components, the lesson response components, or the lesson page.

## Unit 3 production scope

Change only:

- `apps/pre-calculus/convex/activities.ts`

Add the three selected read contracts below. Reuse the existing HEAD constants, graders, publication predicates, source identity checks, and schema indexes.

### Approved practice projection

Add `getApprovedPrecalculusPilotHandler` and `getApprovedPrecalculusPilot`.

The handler must return no rows unless the exact node and blueprint publication is approved. It must require one approved physical row for each selected stable activity. It must verify the stable activity ID, component key, node, mode, and reviewed content identity. It must regenerate safe public props from the reviewed server contract. Independent props must not contain answers. The current draft catalog must return an empty array.

The later page must use this query only for Guided and Independent. Worked must come from the stricter Worked projection.

### Exact Worked projection

Add the accepted Q24 `getApprovedTopic11WorkedSourceHandler` and `getApprovedTopic11WorkedSource`.

The handler must require:

- exact approved node and blueprint publication
- exact `workedExampleSpec`
- one approved physical Worked activity
- exact stable activity, component, node, mode, display, description, props, and grading identity
- one current highest published Topic 1.1 lesson version
- exactly one Phase 4 row with `phaseType:"worked_example"`
- exactly one sequence 2 section in that phase
- exactly one selected physical source link across all current-version phases
- the selected link and sequence 2 section to be the same object
- valid creation and approval times

This requires the accepted Q24 tightening of `hasCurrentTopic11Source`. The same helper is already used by the acknowledgement and teacher handlers. Thus, this unit also closes their duplicate-phase and cross-phase source-authority gap.

The result must use the validated physical activity ID and component key. It must use reviewed blueprint renderer props. It must return `null` for the current draft publication.

### Learner delivery state

Add `isStoredTopic11Acknowledgement`, `isTopic11TeacherConfirmationForSubmission`, `getTopic11LearnerDeliveryStateHandler`, and `getTopic11LearnerDeliveryState`.

The query must validate the active student credential before it reads or replays state. It must use the strict Worked projection. It must accept only the canonical ungraded six-field acknowledgement for the exact learner and physical activity. It must reject future, damaged, changed-source, pre-approval, and pre-publication acknowledgements.

The state must be:

- `null` when identity or current publication is invalid
- `needs_acknowledgement` when no valid acknowledgement exists
- `awaiting_teacher_confirmation` after a valid acknowledgement and before exact same-submission teacher evidence
- `ready_for_practice` only after the exact trusted teacher confirmation

A student Worked acknowledgement must never create or substitute for teacher evidence.

## Unit 3 test scope

Use backend-only tests. Do not import the untracked lesson page or `convex/course.ts` in this unit.

Add or extract these tests:

1. A real seed creates the exact physical Worked row and Phase 4 sequence 2 link.
2. Current draft graph publication returns no Worked or practice projection.
3. A hypothetical approved publication and physical review returns the exact Worked projection.
4. Changed Worked props, grading, display text, node, mode, component, stable ID, or approval returns `null`.
5. Duplicate physical rows, duplicate highest published versions, duplicate Phase 4 rows, an occupied sequence 2, a cross-phase link, and a second selected link return `null`.
6. Guided and Independent projections use server-generated props. Independent props contain no expected answers.
7. An inactive or mismatched student credential returns `null`.
8. A valid student with no acknowledgement gets `needs_acknowledgement`.
9. An exact acknowledgement gets `awaiting_teacher_confirmation`.
10. A same-node teacher event for another learner, another submission, another ordinal, another time, or a future event does not unlock practice.
11. The exact teacher confirmation gets `ready_for_practice`.
12. More than the old fixed query limit of acknowledgements does not hide a valid row.
13. Repeated valid acknowledgements do not change the result or create writes.
14. Every read test asserts zero evidence, receipt, SRS card, and SRS review-log writes.

Reuse the accepted Q24 projection cases and Q27 learner-state cases. Split them from mixed page and teacher fixtures. Do not copy the full current-main `activities.ts` or its later-topic tests.

## Expected Red behavior

Against the Q37 unit 2 candidate:

- imports for all three query handlers fail because HEAD does not export them
- the duplicate Phase 4 and cross-phase authority tests expose the weaker current `hasCurrentTopic11Source`

These are behavior failures. A missing untracked page is not the Red condition for this unit.

## Unit 4 dependency after this change

After unit 3, add the minimum learner delivery surface as a separate unit:

- selected `course.getLesson` query
- Worked acknowledgement HTTP route
- `LessonWrittenResponse`
- `LessonResponse`
- `PrecalculusTopic11DailyCurriculumPilot`
- `PrecalculusMasteryAdvantagePilot`
- selected lesson page
- real seed-to-page-to-route composition test

That unit must preserve the Q36 rule. A one-activity selected Worked phase must not show the generic response form. Mixed and unrelated phases must keep it. The page must use the strict physical activity ID and component key from unit 3.

The teacher candidate query, teacher route, teacher form placement, and dashboard can follow as a separate teacher surface unit. Their backend writer already exists in the selected evidence module.

## Exclusions

Do not copy the 9,751-line pending main `activities.ts`. Extract only selected query functions and the accepted source-layout tightening.

Do not add the pending broad camel `learningEvidence.ts` module. Do not remove the HEAD fingerprint contract. Do not add later-topic handlers, a new table, a registry, a hash, a package, or an approval state.
