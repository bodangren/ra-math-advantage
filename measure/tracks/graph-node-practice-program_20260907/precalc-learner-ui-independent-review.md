# Precalculus Q28 learner delivery UI independent review

## Decision

Request one test correction before integration. The production conditions match the accepted learner-state contract. The current page tests do not prove that a real acknowledgement and a real teacher event control those conditions.

## Verified production behavior

The Lesson 1.1 page requests four separate values: the raw lesson, the strict Worked projection, the Q27 learner delivery state, and the complete Guided and Independent projection. It makes these requests only for Topic 1.1.

The lesson applies the required state rules:

- `needs_acknowledgement` shows the strict Worked component only when the raw physical section ID and component key equal the projected source.
- `awaiting_teacher_confirmation` hides the Worked action and both practice modes. It shows a pending teacher-confirmation message.
- `ready_for_practice` hides the Worked action. It renders only the modes returned by `getApprovedPrecalculusPilot`.
- `null` shows the unavailable state. It shows no action.

The ready branch filters out `worked_example`. Thus, the complete pilot query cannot cause the Worked acknowledgement to appear again.

The dashboard applies the same three state conditions. It renders the selected Worked source only in `needs_acknowledgement`. It renders the pending message in `awaiting_teacher_confirmation`. It renders Guided and Independent only in `ready_for_practice` and only when each mode exists in the approved projection.

The patch does not change Topic 1.2 or later lesson behavior. The additional lesson queries resolve to `null` or an empty array outside Topic 1.1. The existing raw section identity check remains in the Worked branch.

## Required test correction

The Q27 backend test proves the three real state transitions in isolation. It calls the actual learner-state handler and changes stored acknowledgement and teacher evidence rows.

The page tests do not consume that real result. `topic11-worked-projection.test.ts` mocks `getTopic11LearnerDeliveryState` and assigns the three state strings directly. `PrecalculusTopic11DailyCurriculumPilot.red.test.tsx` also assigns a fixed state string. These tests prove conditional rendering. They do not prove the requested page composition from acknowledgement to pending state to teacher-confirmed practice.

Add one table-aware composition test. Use the actual Q27 state handler for each page render. Start with no acknowledgement. Write the real canonical acknowledgement. Render the pending state. Then write the real Q19 teacher event and render the ready state. Keep the hypothetical publication fixture isolated to the test. Assert that the same page changes from Worked to pending to Guided and Independent without direct state-string injection.

Also add one dashboard assertion for `awaiting_teacher_confirmation`. The current dashboard test covers `needs_acknowledgement` and `ready_for_practice`, but it does not render its new pending branch.

These are evidence gaps. I did not find a production-condition defect in the four-file patch.

## Test evidence

I ran the focused Q28 and Q27 suites in the candidate:

`npx vitest run __tests__/convex/topic11-worked-projection.test.ts __tests__/components/student/PrecalculusTopic11DailyCurriculumPilot.red.test.tsx __tests__/convex/topic11-selected-teacher-backend.test.ts`

Result: 54 tests passed in 3 files.

The focused tests confirm strict Worked section gating, the unavailable state, mode filtering, the real Q27 state policy, and existing learner acknowledgement behavior. They do not close the composition gap above.
