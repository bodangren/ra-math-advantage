# Precalculus Q36 browser proof independent review

## Verdict

The artifacts prove one successful local browser path from learner acknowledgement through teacher confirmation, Guided submission, Independent submission, evidence storage, and one SRS review. They do not yet prove a complete and unambiguous learner experience because an unrelated generic `Worked example` response card remains visible after the selected Worked acknowledgement is complete.

Treat the backend path as verified for this fixture. Keep the browser acceptance task open until the extra card is removed or clearly separated from the selected Topic 1.1 delivery path and tested after reload.

## Evidence that the browser path proves

The browser used saved HTTP session state for two active local fixture identities. The learner clicked `Mark worked example reviewed`. The teacher then opened the real dashboard and clicked `Confirm classroom introduction`. This is a browser teacher action. The fixture created the teacher, learner, organization, class, enrollment, and assignment. The fixture did not insert the teacher evidence row shown in the final state.

The stored teacher row has:

- the selected node `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`
- the selected Worked activity
- origin `teacher_led`
- mode `teaching`
- no grade
- idempotency tied to the physical Worked acknowledgement submission

The row `createdAt` follows the teacher click. Its `occurredAt` is the source acknowledgement time. This agrees with the accepted event-time policy. The browser proof establishes teacher authentication through the saved teacher session and real dashboard action. It does not prove that the local fixture represents a production teacher or approved production curriculum.

The learner entered literal Guided answers `[0,3] U [7,9]`, `[3,7]`, and `none`. The learner entered distinct Independent answers `[0,2]`, `[4,8]`, and `[2,4]`. Both were graded 3 of 3 by the real server path. The stored parts use the expected three interval part IDs and score 1 of 1 each.

The Guided receipt is persisted and non-mastery-bearing with reason `ungraded_evidence`. The Independent receipt is persisted and mastery-bearing with reason `eligible`. The Independent physical submission ID links the graded evidence, SRS review, and one card. The card has one repetition. The review has rating `Good`. These rows agree with the no-assistance path because all stored hint, reveal, and change counters are zero.

The persisted-state files before and after dashboard reload are equal for submissions, evidence, receipts, cards, and reviews. All row IDs are equal. The reload created no new stored effect.

## P1 learner experience defect

`/tmp/precalc-q36-student-independent-saved.png` shows a generic card above the real Guided and Independent activities. It has:

- heading `Worked example`
- label `Your work and explanation`
- an empty textarea
- button `Submit response`

The same card is present in the ready-state text and after both practice submissions. The selected Worked flow is already acknowledged and teacher-confirmed. The card does not show the selected graph, reviewed reasoning, completion state, or relation to the teacher confirmation. A learner can reasonably interpret it as another required Worked response.

The persisted result has only the selected empty-parts Worked acknowledgement because the browser did not submit this generic form. Thus, this proof does not establish what happens if a learner uses the visible form. It also does not establish that the form cannot create a second ordinary lesson response outside the selected evidence contract.

Minimum correction:

1. Do not render the ordinary generic response form for the exact selected physical Topic 1.1 Worked section.
2. Keep ordinary response forms for unrelated sections and lessons.
3. Add an actual page regression for the `ready_for_practice` state. Assert that Guided and Independent activities are present and the generic `Your work and explanation` form is absent for the selected section.
4. Add a reload assertion after acknowledgement and teacher confirmation. Assert that no second Worked control or generic response form appears.

A clear read-only completion summary can remain if product design requires it. It must not offer a second submission action.

## Script and replay limits

The report lists `/tmp/precalc-q36-browser-flow.cjs` as the browser script. That file performs only phase 1. It acknowledges Worked and inspects the first teacher candidate. The complete flow is split across:

- `/tmp/precalc-q36-browser-flow.cjs`
- `/tmp/precalc-q36-browser-phase2.cjs`
- `/tmp/precalc-q36-browser-phase3.cjs`
- `/tmp/precalc-q36-browser-replay-check.cjs`

The phase 2 script performs the teacher click and opens learner practice. The phase 3 script submits both practice modes. The replay script reloads only `/student/dashboard` and `/teacher/dashboard`. It does not revisit `/student/lessons/1.1`, click a saved `Start new attempt`, replay an acknowledgement request, or replay a receipt request.

The report must list all four scripts. It must describe the final check as stable read reload, not request replay. The equal persisted files prove that page reloads did not add rows. They do not prove ambiguous-network retry, duplicate-click handling, saved-attempt restoration on the lesson page, or idempotent resubmission.

## Other bounded limits

- The proof uses hypothetical local approval data. It does not establish production publication.
- The correct answers prove the positive grading path. They do not test a wrong answer.
- Zero assistance proves storage for no-assistance submissions. It does not test a hint, reveal, or answer-change event.
- The scripts use fixed waits after clicks. The stored rows and visible success text make this run credible, but a durable future acceptance script should wait for the exact success state instead of elapsed time.
- The final student screenshot is the lesson page, while the replay script captures the student dashboard. The proof does not show the completed lesson page after a fresh browser reload.

## Acceptance status

Accept the local backend and positive browser-action evidence for this one fixture. Do not mark the full learner delivery experience complete. Resolve the generic Worked response card and add a fresh lesson-page replay check first.
