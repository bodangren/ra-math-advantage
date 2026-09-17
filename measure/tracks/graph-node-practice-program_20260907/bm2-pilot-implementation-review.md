# BM2 pilot implementation review

Date: 2026-09-07

Scope: Task 4.6 delta only. I compared the current files with these saved baselines:

- `/tmp/bm2-pilot-task46.before`
- `/tmp/bm2-activities-task46.before`
- `/tmp/bm2-daily-task46.before`
- `/tmp/bm2-daily-acceptance-task46.before`

## Decision

Do not accept Task 4.6 in its current form. The server-owned grade and retry boundary are useful. The new three-mode delivery conflicts with the reviewed blueprint and does not meet the mode behavior contract.

## Findings

### P0: The publication gate approves a mode path that the reviewed blueprint prohibits

The current blueprint has no `guidedPracticeSpec`. Its `independentPracticeSpec.replayPolicy` says: `Use published activity IDs. Do not convert document review into a generated problem family.` See `apps/bus-math-v2/curriculum/skill-graph/blueprints.json:4-22`.

The Task 4.6 delta declares all three modes in `BM2_PILOT_MODES`. `DailyPracticeSession` then uses the generated `accounting-equation` family for Guided and Independent. This directly conflicts with the reviewed replay policy.

`isBm2PilotPublished()` checks only the node status, blueprint status, lesson status, activity key, and component key. It does not check that the blueprint contains an approved specification for each served mode. Thus, it returns `true` for the current incomplete three-mode blueprint.

Minimum correction: do not serve this generated three-mode path as an approved pilot until curriculum review adds the exact mode specifications and changes the replay policy. A runtime change must not approve that curriculum decision.

### P0: Independent reveals the answer before durable server grading

`AccountingEquationInput` grades in the browser and stores `expectedValue` before it calls `onSubmit`. It immediately displays the expected answer for a wrong response. See `apps/bus-math-v2/components/student/answer-inputs/AccountingEquationInput.tsx:38-59` and `:90-103`.

`onSubmit` returns `void` in the registry contract. The component cannot await the server result. The parent can show a later save error, but the private answer is already visible. This fails the server-grade and Independent concealment requirement.

Minimum correction: the Independent component must wait for the durable server result before it displays correctness or the expected answer. The server response must control progression and feedback.

### P1: Guided mode contains no guidance

The generator creates `scaffolding.helperText`. `AccountingEquationInput` does not render that field. It renders the same visible facts and input in Guided and Independent. The only mode difference is the generated definition identity.

The Guided submission does not persist evidence. `DailyPracticeSession` changes directly to Independent at `components/student/DailyPracticeSession.tsx:151-154`. This part correctly prevents false mastery, but it also means the current Guided step has no durable completion record.

Minimum correction: render the approved Guided help before answer submission. Keep Guided non-mastery-bearing. Add a behavior test that proves the help is visible in Guided and absent in Independent.

### P1: Worked does not show a worked calculation

The Worked view shows the formula and the missing term answer. It does not show the two given values or the arithmetic that produces the answer. See `components/student/DailyPracticeSession.tsx:285-295`.

The current node requires application of the equation. A formula plus an answer does not demonstrate the calculation. It also does not implement the full authored explanation in the reviewed `workedExampleSpec`.

Minimum correction: show the given values, the rearranged equation when necessary, the arithmetic, and the balance check. Keep Worked non-mastery-bearing.

### P1: The exact publication identity check is incomplete

The gate finds an activity by key and checks only `componentKey === 'notebook-organizer'`. It does not compare the activity stable ID with `d6b57545-65f6-4c39-80d5-000100001002`. It also does not compare `blueprint.rendererKey` with the source component. See `lib/learning-evidence/bm2-pilot.ts:22-38`.

The server mutation checks the provisioned stable activity ID and component. This is good. However, that check does not repair the incomplete canonical publication gate.

Minimum correction: require the exact node, exact blueprint, exact lesson, exact activity key, exact stable activity ID, and matching renderer/component identity. Require the mode-specific approved specifications before the gate returns true.

### P1: The generated task assesses only a narrow part of the published objective

The published node is `math.bm2.skill.1.1.apply-accounting-equation`. Its title is `Apply the accounting equation to a business event`. Its evidence policy requires teacher review for model and explanation evidence.

The generated family asks for one missing numerical term. It does not ask the learner to interpret a business event, create a saved model, classify the event effects, or explain the result. A correct generated answer can be automatic numerical evidence only. It must not represent complete application mastery.

The existing evidence boundary correctly requires prior teacher-led exposure and keeps `kstApplied: false`. However, after prior exposure, a correct generated item calls the mastery bridge. That effect is broader than the current generated task supports under the node policy.

Minimum correction: narrow the effect to numerical-item evidence, or add the reviewed model and explanation evidence with teacher review before application mastery.

### P2: Every due review repeats all three modes

The component starts `pilotModeIndex` at zero for every accounting-equation due card. It resets the index after each card. Thus, Worked and Guided repeat on every scheduled review, including cards in learning, review, or relearning state. See `DailyPracticeSession.tsx:49`, `:227-246`.

The due-card list and its order remain intact. The code still filters supported input types and takes the first ten due cards. Task 4.6 does not insert an extra card or replace a different due card. However, it replaces the normal accounting-equation review with the full three-mode sequence each time.

Minimum correction: use Worked and Guided only for the approved first-exposure state. Use Independent alone for later due reviews. Prove that unrelated due cards retain their order and that a review-state accounting card does not restart the teaching sequence.

### P2: The tests do not cover a wrong answer followed by a corrected answer

The new component tests submit only correct Independent answers. The input disables itself after the first submission. A learner cannot correct a wrong answer in the same rendered problem. The retry action resends the same stored envelope and idempotency key.

Minimum verification: add a real behavior test for wrong, durable grade, correction, and a new submission identity. Also retain the transport retry test that reuses the same request identity. These are different cases.

## Checks that passed

- The generated seeds are distinct in the current sequence. With `reps = 6`, Worked uses seed 7, Guided uses seed 8, and Independent uses seed 9.
- The server reconstructs the generated problem from the opaque activity ID and grades the raw answer in `convex/activities.ts:644-668`.
- The server rejects modes other than `independent_practice` for generated submissions.
- The server validates one answer, the matching part ID, and the raw answer value.
- The server checks that the physical source activity is provisioned with stable ID `d6b57545-65f6-4c39-80d5-000100001002` and component `notebook-organizer`.
- The create retry reuses the same envelope and idempotency key. Evidence delivery retry reuses only the durable submission ID.
- Worked creates no submission. Guided creates no submission. These modes cannot create mastery through this new UI path.
- The existing learning-evidence handler rejects Independent evidence before trusted teacher-led exposure. It also keeps the knowledge-space effect disabled.
- The focused automated run passed 21 tests in four files. The command was `npm run test -- --run __tests__/lib/learning-evidence/bm2-pilot-publication.test.ts __tests__/components/student/DailyPracticeSession-generated-variant.acceptance.test.tsx __tests__/convex/activities-server-owned-submission.acceptance.test.ts __tests__/convex/learningEvidence.test.ts`.

## Verification still required

### Source-aligned continuation

The published lesson already contains the correct delivery sequence. Phase 2 contains the Worked explanation. Phase 3 contains Guided activity `d6b57545-65f6-4c39-80d5-000100001002`. Phase 4 contains Independent activity `d6b57545-65f6-4c39-80d5-000100001003`. Both activities use `notebook-organizer`.

The Guided activity classifies six published items. The Independent activity classifies a larger published item set without hints. The assessment route grades these authored item categories on the server. The existing learning-evidence mapping accepts only the Guided physical activity as `teacher_led`. It records participation and no mastery. This agrees with the current teacher-review policy.

The current source does not contain a student explanation field or a teacher-reviewed model rubric. Therefore, neither authored notebook activity can prove the complete node capability. Do not add application mastery from these submissions.

The `NotebookOrganizer` component currently treats its asynchronous `onSubmit` callback as synchronous. It marks work complete before `ActivityRenderer` confirms the server save. A rejected Promise bypasses its `try/catch`. The minimum runtime correction is to await the existing callback result. The component must keep the activity incomplete after failure. The existing `ActivityRenderer` retry control remains the durable retry path.

Use this bounded plan:

1. Keep the generated family inactive.
2. Use the existing published lesson phases for Worked, Guided, and Independent delivery.
3. Fix `NotebookOrganizer` so completion follows the durable callback result.
4. Keep Guided evidence non-mastery-bearing.
5. Keep Independent as a server-graded authored artifact. Do not add mastery until a reviewed teacher rubric exists.

Implementation result:

- The authored Guided activity now declares `guided_practice`.
- The authored Independent activity now declares `independent_practice`.
- The shared notebook schema validates these two modes and keeps Guided as the legacy default.
- `NotebookOrganizer` now uses the authored mode in its envelope and label.
- `NotebookOrganizer` waits for the existing `ActivityRenderer` callback result. It shows completion only after a durable save. A false result or rejected Promise restores the submission control and does not show the success message.
- The student activity route already removes each notebook item's `category`. Thus, Independent answer keys remain server-only. The server uses the stored activity to grade the submitted categories.
- The generated family remains inactive. The canonical blueprint remains unchanged and reviewed. No new teacher rubric or mastery effect was added.

The focused notebook, assessment, publication, input, daily, generated-server, and evidence tests passed. The final focused runs contained 35 passing tests and 9 passing notebook/source tests. `npm run lint` and `npx tsc --noEmit` passed.

## Teacher exposure correction

The earlier source submission path incorrectly treated a student-authenticated Guided submission as `teacher_led`. A non-mastery result still changed the exposure state to `introduced`. That state could authorize later mastery evidence.

The corrected path keeps the student submission as a durable authored artifact. The student assessment route does not create `teacher_led` evidence. The new teacher route requires an authenticated teacher or administrator. Its internal mutation verifies the teacher role, organization, class ownership, active enrollment, learner identity, and submission ownership. It then records the teacher identity on the submission and processes the existing non-mastery teacher exposure.

The pure evidence boundary now requires `trustedTeacherExposure: true` before it can reconstruct `teacher_led` evidence. A student Guided submission returns no evidence, receipt, mastery, or knowledge-space effect. The current notebook capability mismatch remains: classification evidence does not prove full business-event application. The generated family remains inactive, so this correction does not add an application-mastery path.

The focused teacher-boundary run passed 24 tests. The BM2 lint and TypeScript checks passed.

- Add a test that changes each canonical identity independently. The publication gate must fail for each mismatch.
- Add a real route-to-Convex behavior test for an approved Independent correct answer after teacher exposure.
- Add a real route-to-Convex behavior test for Independent before teacher exposure. It must persist no mastery effect.
- Add wrong-answer and corrected-answer behavior tests. Verify distinct attempt ordinals and correct idempotency behavior.
- Add queue tests with an unrelated due card before and after the pilot card. Verify order and completion.
- Add a review-state pilot-card test. Verify that later review does not repeat first exposure.
- Add tests that assert actual Worked content, actual Guided help, and Independent answer concealment. Current tests mostly advance through the modes to reach the submission boundary.

## Source alignment

The exact node remains a current reviewed curriculum capability. The physical source activity remains `unit-1-lesson-1-activity-1`, stable ID `d6b57545-65f6-4c39-80d5-000100001002`, and component `notebook-organizer`. The physical activity sorts account items. Its embedded generator computes a missing accounting-equation term. Neither task alone assesses the full business-event application objective. This confirms the earlier source review. It is not a new curriculum approval.

## Teacher review user interface and authorization result

The existing gradebook submission detail modal now contains the teacher action. It shows the selected student, lesson, authored response, activity title, and grade. The action appears only for stable activity ID `d6b57545-65f6-4c39-80d5-000100001002` in `guided_practice` mode. The server revalidates these hidden client identities.

The teacher API derives the teacher ID from the active session. It accepts only the learner ID and submission ID. The Convex mutation verifies the following stored facts before it writes exposure:

- The source lesson slug is `unit-1-lesson-1`.
- The lesson version is published.
- A lesson phase contains the exact physical activity document or stable activity ID.
- The student has progress for that exact phase.
- The phase assignment time is not later than the submission time.
- The active class enrollment time is not later than the submission time.
- The teacher owns the enrolled class, or the user is an administrator in the same organization.
- The submission belongs to the student.
- The stored activity ID, stable activity ID, and mode match the canonical source mapping.

The student submission route only stores the Guided response. It does not create teacher exposure. The teacher action writes `gradedBy` and `gradedAt`. It then uses the existing evidence evaluator. The result is non-mastery `teacher_led` evidence. The interface states that verification records exposure and does not record mastery.

The interface keeps the action disabled while the durable mutation is pending. It shows a stable error after a failed request. It keeps the action available for retry. It shows success only after the mutation completes.

A production-handler test now starts with stored enrollment, lesson, publication, phase, assignment, activity, and student submission records. It calls the actual teacher verification mutation. It then proves that the stored exposure changes the evaluator decision for a later graded submission. Separate negative cases reject enrollment and assignment timestamps that occur after the student response. These tests do not pass a client trust flag.

The final focused run passed 37 tests in six files. `npm run lint` and `npx tsc --noEmit` passed. No deployment or curriculum approval occurred. The generated family remains unavailable through the current publication gate. The later-evidence test verifies the existing evaluator boundary with a stored generated submission. It does not make that generated activity available to students.
