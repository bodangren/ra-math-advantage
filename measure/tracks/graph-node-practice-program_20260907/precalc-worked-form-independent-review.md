# Q36 Worked form correction independent review

## Disposition

Accept the scoped correction for the current shared Precalculus integration tree.

The correction suppresses `LessonResponse` only when all of these conditions are true:

- The route is Topic 1.1.
- `workedSource` is present.
- The phase has exactly one section.
- The section type is `activity`.
- The section physical activity ID matches the approved Worked source.
- The section component key matches the approved Worked source.

The truthy `workedSource` check fixes the former `undefined === undefined` case. A null source cannot suppress the ordinary response form.

The predicate does not over-hide the form. A mixed phase keeps the form and its prior response history. A wrong physical activity ID keeps the form. A wrong component key keeps the form. Missing section identity fields keep the form. The three selected delivery states suppress the generic form for the exact single-section Worked phase.

## Test evidence

I ran this test in `/tmp/precalc-q35-rename-current-main/apps/pre-calculus`:

`npx vitest run __tests__/app/student/topic11-full-sequence.test.tsx`

Result: 1 file passed and 1 test passed. The test took 228 ms.

This is a real page composition test. It uses `LessonPage`, the actual acknowledgement route and writer, the actual teacher route and writer, and the actual Guided and Independent submission and evidence routes. The added assertions exercise the rendered page. They do not test a copy of the predicate.

The final branch also makes the approved source query return null by changing the stored activity to draft. It then confirms that the ordinary form remains visible. The same branch clears the section content. The direct truthy guard supplies the independent null-source protection.

## Browser and reload artifacts

I inspected `/tmp/precalc-q36-student-final.png` and `/tmp/precalc-q36-teacher-final.png`. The student dashboard shows the completed Topic 1.1 state and no due review. The teacher dashboard shows no pending Topic 1.1 confirmation. The teacher roster reports zero lesson responses. This is consistent with suppressing the generic Worked response form.

The files `persisted.json` and `persisted-after-dashboard-reload.json` are byte-identical. The reload created no new stored rows. The saved browser script uses a normal page reload for each dashboard.

The original `phase1.json` records the defect before this correction. It shows `Your work and explanation` after the Worked acknowledgement. The earlier `-final.png` files are dashboard screenshots.

I also inspected `/tmp/precalc-q36-student-final-fixed.png`. This corrected lesson screenshot shows the Guided and Independent cards. It does not show the generic response form or a Worked review action. `/tmp/precalc-q36-worked-form-reload.json` confirms the same page state after reload: zero generic forms, zero generic submit actions, one Guided card, one Independent card, and zero Worked review actions. These artifacts visually confirm the corrected ready-for-practice lesson state.

## Integration boundary

The patch changes only the Topic 1.1 lesson page and its composed sequence test. It does not change storage, grading, evidence, or approval behavior.

Both affected files are untracked relative to committed HEAD in the parent integration state. This review accepts the behavior in the shared worktree and disposable local candidate. It does not claim that committed HEAD contains the lesson page integration.
