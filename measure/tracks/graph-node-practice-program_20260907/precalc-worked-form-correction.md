# Precalculus Q36 Worked form correction

## Defect

The Topic 1.1 page rendered `LessonResponse` for every phase. The exact selected Worked-only phase therefore showed a second generic response form after the selected acknowledgement flow.

The extra form was a real production-page defect. It was not a legacy fixture section.

## Correction

The page now detects a phase that contains only one activity section whose physical activity ID and component key match the exact validated Topic 1.1 Worked source. It does not render the generic `LessonResponse` form for that Worked-only phase.

The page still renders the selected Worked activity, waiting state, or unavailable state from the existing delivery contract. It also keeps the phase response history.

A phase with any additional section is a mixed phase. The page keeps the generic response form for a mixed phase. This rule prevents the change from hiding a response that belongs to related text or another activity. Unrelated phases keep their response forms.

## Test evidence

The existing full-sequence page test now checks all three delivery states:

- `needs_acknowledgement`
- `awaiting_teacher_confirmation`
- `ready_for_practice`

In each selected Worked-only state, the generic `Your work and explanation` form is absent.

The same test adds a mixed text section and a historical response. It verifies that the generic form and the historical response remain visible for the mixed phase.

The test first failed on the unconditional form. It then passed after the correction.

- Red log: `/tmp/precalc-q36-worked-form-red.log`
- Green log: `/tmp/precalc-q36-worked-form-green.log`
- Focused lint: passed

## Local browser reload

The local web server loaded the corrected page through hot reload. A fresh signed-in student lesson-page reload produced these results:

- Generic form count: 0
- Generic `Submit response` count: 0
- Guided activity count: 1
- Independent activity count: 1
- Worked review button count: 0

Screenshot: `/tmp/precalc-q36-student-final-fixed.png`

Result: `/tmp/precalc-q36-worked-form-reload.json`

The page does not restore the prior Guided and Independent success messages after a fresh reload. It shows fresh practice controls. This behavior is outside the generic Worked-form correction. The stored attempts and evidence remain durable.

## Browser proof script correction

The complete prior Q36 flow uses these scripts:

- `/tmp/precalc-q36-browser-flow.cjs`: Worked acknowledgement and teacher candidate inspection
- `/tmp/precalc-q36-browser-phase2.cjs`: teacher confirmation and student practice availability
- `/tmp/precalc-q36-browser-phase3.cjs`: Guided and Independent browser submissions
- `/tmp/precalc-q36-browser-replay-check.cjs`: dashboard reload check
- `/tmp/precalc-q36-worked-form-reload.cjs`: corrected lesson-page reload check

The dashboard reload check is a stable read check. It is not an ambiguous-network retry test.

## Integration artifact

Patch: `/tmp/precalc-q36-worked-form-fix.patch`

`git apply --check` passed against current main. The patch contains only the lesson page and its existing full-sequence test. I did not edit main or commit.

## Null-source correction

A parent review found that two missing content fields could compare equal to two missing source fields when the validated source was null. The first fix could therefore hide an unrelated generic form.

I added a failing page regression for this case. The phase contains one unrelated activity with no `activityId` or `componentKey`, and the approved source query returns null. I then require a non-null validated Worked source before I compare identity fields.

The test also verifies that a wrong physical activity ID and a wrong component key each preserve the generic form. The final focused test and lint pass.

Red log: `/tmp/precalc-q36-worked-form-null-red.log`

## Parent integration status

The parent applied the narrow patch to the shared worktree. The composed learner-flow test, lint, build, and standalone TypeScript passed. Logs are `/tmp/precalc-q36-parent-{tests,lint,build,tsc}.log`. The selected lesson page and composed test are untracked files. This result does not prove committed HEAD integration. Task Q37 traces the required pending runtime dependencies before integration.
