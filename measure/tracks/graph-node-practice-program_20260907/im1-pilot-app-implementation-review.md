# IM1 Pilot App Implementation Review

Date: 2026-09-07

## Review boundary

This review checks the current shared working tree. It checks the IM1 translation pilot from the student page through storage and learning evidence. It does not approve curriculum content or a production seed.

Sources checked:

- `apps/integrated-math-1/app/student/practice/page.tsx`
- `apps/integrated-math-1/components/student/PracticeSessionProvider.tsx`
- `apps/integrated-math-1/app/api/activities/[activityId]/submissions/route.ts`
- `apps/integrated-math-1/convex/activities.ts`
- `apps/integrated-math-1/convex/schema.ts`
- `apps/integrated-math-1/convex/seed/seed_translation_pilot.ts`
- `apps/integrated-math-1/convex/queue/queue.ts`
- `packages/activity-components/src/components/blanks/FillInTheBlank.tsx`
- `packages/math-content/src/knowledge-space/generators/im1-verbal-to-numerical-adapter.ts`
- `measure/practice-component-contract.md`
- `measure/tracks/graph-node-practice-program_20260907/im1-pilot-app-integration.md`
- Current focused route and provider tests

The server uses the exact node ID. The server regenerates the expected expression from the stored seed. It uses the finite structural grader. Independent Practice props do not contain the expected expression. The route gets the learner ID from the authenticated session. These parts are correct.

## Blocking findings

### P0: Worked Example cannot complete

`PracticeSessionProvider` starts with Worked Example. It advances only when `FillInTheBlank` calls `onComplete` after a successful server submission.

The teaching branch in `FillInTheBlank` only displays the answer and reasoning. It has no submit or continue control. It never calls `onSubmit` or `onComplete`. The student cannot reach Guided Practice.

The provider test replaces `FillInTheBlank` with a button. The mock proves provider callback order only. It does not prove the real Worked Example flow.

Add a real component behavior test. It must render Worked Example and advance after a server-owned acknowledgement or submission result.

### P0: A wrong attempt locks the visible activity

The provider creates one idempotency key for each activity ID. It deletes the key only in `onComplete`. A wrong server grade makes `submit` throw. The key then remains.

If the learner changes the response, the next request uses the same key with different content. The mutation correctly throws `idempotency_conflict`. The learner cannot start a new attempt. An identical retry only returns the stored wrong grade and fails again.

Keep the key for transport retries of the same canonical request. Create a new key when the learner starts a new graded attempt. Add a behavior test with a wrong first answer and a correct second answer.

### P0: The seed preserves stale approval after content changes

`seedTranslationPilot` patches the stable activity row. The patch changes the seed, difficulty, props, grading configuration, and other identity fields. It does not clear the existing `approval` object.

An activity can stay approved after the seed changes its reviewed content. The query and mutation check only `approval.status`. They do not bind approval to the current content. This bypasses independent approval.

Make the seed idempotent for identical content. Clear approval when reviewed content changes. Do not set approval in the seed. Add a test that starts with an approved row, changes seeded content, and verifies that the row is no longer available as approved.

### P0: Client assistance values control evidence eligibility

The route accepts `hintsUsed` and `revealStepsSeen` from the browser. The mutation uses zero values as an authorization condition for learning evidence. A modified client can use a hint or reveal and then submit both values as zero.

Client analytics can record assistance. Client values must not authorize mastery-bearing evidence. The server must own the condition. The minimum safe pilot rule is to keep Guided Practice non-mastery-bearing. Independent Practice has no hint or reveal data in its server projection. Require a correct Independent Practice grade before evidence.

### P0: A wrong response can create mastery-bearing evidence

`evidenceAllowed` does not require a correct grade. An approved, SRS-eligible, unassisted Guided or Independent response creates `learning_evidence` when the score is zero. The integration design explicitly requires that a wrong response does not create mastery-bearing evidence.

Require `grade.score === grade.maxScore` for Mastery Advantage evidence. Keep the failed `activity_submissions` row.

## High-priority findings

### P1: The seed cannot enable Guided or Independent evidence

The seed sets `srsEligible: false` for all three modes. The mutation writes learning evidence only when this field is true. No reviewed path changes the field when a human approves the activity. Therefore, the current seeded pilot writes no learning evidence in any mode.

Worked Example must remain false. Guided and Independent can become true only through the reviewed approval path. The implementation needs one explicit path that records this reviewed state. The seed must not approve its own rows.

### P1: The seed omits the required practice-item links

The integration design requires three `practice_items` links. The seed writes only `activities`. The page bypasses the normal queue and injects the three activities before every queue item.

This does not verify the production queue contract. Add the required links or revise the approved design before integration. Do not claim queue integration from the current injected array.

### P1: Queue identity checks are broader than the pilot contract

`resolveQueueItems` accepts any identity-aware approved activity when its node matches the card and its mode is Guided or Independent. It does not require one of the exact translation pilot stable activity IDs. The design requires the approved pilot stable identity.

Restrict this pilot path to the exact stable IDs. Preserve the legacy branch for activities that do not have graph identity fields. Add a regression test for an approved identity-aware activity with a different stable ID.

### P1: Mode policy is not checked during submission

The mutation checks approval and the stable ID suffix. It does not require `srsEligible: false` for Worked Example or the reviewed expected value for Guided and Independent. A stale or malformed activity can submit with an inconsistent policy.

Check the expected mode policy before grading. Keep Worked Example non-mastery-bearing.

## Test assessment

The route tests mock the Convex call. The provider test mocks the activity component and `fetch`. These tests are useful unit tests. They do not verify the seed, real renderer, mutation, replay, storage, or evidence flow.

Required behavior evidence is still absent for these cases:

- Real Worked Example completion
- Wrong answer followed by a new attempt
- Seed replay with unchanged content
- Seed change invalidates prior approval
- Draft, needs-changes, and rejected activities produce no submission
- Correct Independent Practice writes one exact-node evidence row
- Wrong Independent Practice writes a submission and no evidence
- Guided assistance cannot become mastery evidence through false client counters
- Identical replay returns the same submission and evidence result
- A changed replay returns a conflict
- The legacy queue still resolves its previous activity shape
- A complete seed, render, submit, replay, grade, and exact-node storage flow

## Review conclusion

The exact-node grader and private Independent Practice projection are suitable for this pilot. The app flow is not ready for integration. Resolve the P0 findings before approval. Then verify the real component and Convex behavior without replacing either boundary with a mock.

## Author response review

The runtime author changed the implementation after the first review. Current source and focused behavior tests resolve these original findings:

- Worked Example now has a real acknowledgement control.
- The provider removes the attempt key after each durable grade. A corrected response gets a new key. A transport failure keeps the old key.
- The component uses the activity ID as its React key. A new attempt gets clean local state.
- The approved query regenerates props on the server and checks exact identity, mode, component, and generator inputs.
- The mutation stores assistance values in the canonical request.
- Guided Practice never creates mastery evidence.
- Only a correct and unassisted Independent Practice submission can create evidence.
- The mutation rejects an unapproved activity before it writes a submission.
- The seed adds the three practice-item links.
- The queue restricts identity-aware rows to the exact pilot node and stable mode identity.

Two blocking issues remain after this response.

### Remaining P0: Seed replay can change reviewed SRS policy without invalidating approval

The seed always patches `srsEligible: false`. Its `contentChanged` comparison does not include `srsEligible`.

If a reviewer enables an approved Independent Practice row, the next seed run resets the field to false and preserves the approval. The seed must preserve reviewed policy when content is identical, or it must treat the policy change as approval-invalidating. Add a real seed replay test for this case.

### Remaining P0: Worked acknowledgement is stored as a failed graded response

The provider submits an empty expression for Worked Example. The server runs the expression grader. It stores score 0 and maximum score 1. The provider ignores the wrong grade and advances.

This record means that the learner answered incorrectly. The learner only acknowledged a displayed example. Use an explicit acknowledgement result, or use a server-owned Worked completion result that does not claim an incorrect response.

The current new tests verify the real component provider path and the submission handler. They still do not verify the seed mutation or one complete seed-to-storage flow.

## Final integration resolution

Date: 2026-09-07

The final implementation resolves the remaining seed and Worked Example findings.

- An unchanged seed replay preserves the reviewed `approval` and `srsEligible` values.
- A content change clears `approval` and resets `srsEligible` to `false`.
- Worked Example stores an acknowledgement. It does not store `score`, `maxScore`, or `gradedAt`.
- A Worked Example network failure keeps the activity visible. The retry uses the same idempotency key.
- The provider displays `Practice complete.` after the third mode.
- The query and submit mutation require the exact graph node and blueprint to be approved.
- The current graph node and blueprint are draft. Therefore, the production query returns no pilot rows and the submit mutation rejects direct pilot submissions.
- Learning evidence also requires `independentPracticeReady: true` on the exact graph node. An approved activity cannot create evidence when the graph node is not ready.
- The daily queue applies the same readiness gate to identity-aware rows. It rejects a stored activity when the curriculum is not published.
- The daily queue regenerates props from the server seed. It does not return stored Independent Practice props that can contain an answer.

The focused tests cover seed replay, approval invalidation, Worked acknowledgement, Worked network retry, final completion, exact-node readiness, curriculum publication, queue publication, stored-answer removal, raw server grading, assistance, identical replay, conflict handling, and exact-node evidence.

### Remaining integration finding

#### P1: Three approved pilot rows replace the complete daily queue on every visit

`PracticeSessionProvider` selects `pilotActivities` whenever the query returns exactly three rows. It ignores every SRS queue item for that render. The app does not store pilot completion for the learner. A later visit runs the same query and starts the three-mode pilot again.

This behavior is inactive while the node and blueprint are draft. It becomes active for every signed-in student when the curriculum and all three activity rows are approved. Confirm that this global and repeated replacement is the intended pilot entry policy. If it is not intended, add an existing assignment or preview eligibility check before the page passes `pilotActivities`, or store completion through an existing learner progress contract. Do not add a new rollout system for this decision.

### Supplemental test limitation

The real renderer test uses generated correct answers, but it builds synthetic `Mode 1`, `Mode 2`, and `Mode 3` props. It does not pass the actual three projections from `projectIM1VerbalToNumerical` to `FillInTheBlank`. The generator and component have separate focused tests. Add one actual-projection UI fixture if the integration acceptance rule requires direct proof of the complete projection-to-renderer boundary.

No current production draft path exists. I found no route that can create evidence for the exact node while its readiness value is false.

## Integration resolution: first exposure and real props

The first-exposure query now requires an active authenticated learner. It checks existing correct Independent submissions for the current activity seed. A completed learner returns to the ordinary queue. A new seed permits a new first exposure. The provider prepends the three pilot modes and preserves the remaining daily queue. It removes only duplicate activity IDs from that queue.

The interaction test now uses `projectIM1VerbalToNumerical` props for all three modes. It follows the real Guided Check and Finish controls. It also checks the final completion message. The parent ran 28 focused tests, standalone TypeScript, full app lint, and the app build. All pass. Hosted and real-browser verification remain open. The repository boundary check still requires explicit approval for the missing workspace dependency declarations.

## Teacher-first history review

Date: 2026-09-07

The new history integration applies `evaluateLearningEvidenceV1` to the current learner and exact node. It keeps all graded Guided and Independent attempts as history. It does not treat the Worked acknowledgement as teacher exposure. It also checks graph readiness, activity SRS eligibility, Independent mode, and assistance before it sets `masteryBearing`.

Idempotent replay is consistent. The mutation finds the original submission by learner, activity, and idempotency key. It rejects a changed body. It returns the stored evidence result for an identical replay. It does not write a second submission or evidence row.

The event-time rule is correct. Evidence from another learner or node does not introduce this learner. A teacher event after the graded event does not introduce the earlier event.

### P1: Production has no trusted teacher-exposure producer

No production IM1 function writes `teacher_led` rows to `learning_evidence`. The only production insert in this app writes `origin: mastery_advantage`. The tests add teacher rows directly to the mock table.

Therefore, current production Guided and Independent attempts always remain in `awaiting_teacher_exposure`. This fail-closed behavior is safe. It also means no current attempt can become eligible through the teacher-first policy.

Add a trusted teacher workflow that creates exact-node `teacher_led` evidence from an authenticated teacher-owned source submission. Validate the learner, node, source activity, event time, and idempotency key at that boundary. Do not infer teacher exposure from the student's Worked acknowledgement.

### Remaining mastery bridge gap

The mutation stores the decision in `masteryBearing`. It does not update spaced repetition system (SRS), Knowledge Space Theory (KST), or another mastery record. This is consistent with the present bounded pilot. A later bridge must consume both correct and incorrect eligible graded evidence. It must not interpret `masteryBearing: true` as a correct answer. The stored `gradedEvidence.isCorrect`, score, and maximum score contain the outcome.

No additional correctness defect was found in the history, replay, or assistance boundaries.

## Independent trusted-exposure and SRS review

Date: 2026-09-07

This review checks the new teacher exposure producer and the spaced repetition system (SRS) bridge. It checks the current shared working tree. It does not change app source.

The exact pilot ID is `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`. The current node and blueprint both have `reviewStatus: draft`. The node does not have `independentPracticeReady: true`. All three catalog projection rows have `srsEligible: false`. Therefore, the current student query and submission mutation fail closed.

The student submission path uses the authenticated learner ID. The teacher route uses the authenticated teacher ID. The teacher mutation verifies the teacher role, class owner, active class, active enrollment, student role, source learner, exact Guided activity ID, and graded source submission. These checks are correct.

### P0: The teacher mutation bypasses current curriculum publication

`recordTeacherTranslationExposureHandler` checks the stored activity approval. It does not call `isTranslationPilotPublished`. It does not check `independentPracticeReady`.

An old approved Guided activity and submission can create a `teacher_led` row while the current node and blueprint are draft. This contradicts the publication gate used by the student query, student submission, and queue.

Require the exact current node and blueprint to be approved before the mutation creates teacher exposure. Keep readiness separate if teacher exposure is valid before independent practice is ready. Add tests for a draft node and a draft blueprint.

### P1: The source submission has no class ownership proof

The mutation verifies that the learner has an active enrollment in the selected class. It also verifies that the teacher owns that class. The source submission does not contain a class or assignment reference.

A teacher can record exposure from any known graded Guided submission for that learner. The submission can predate enrollment. It can also come from a different class or teacher context.

Use an existing assignment or class activity link when one exists. Otherwise, store the class context on the trusted source event before this workflow becomes active. Do not infer source ownership only from the learner's current enrollment.

### P1: The form does not give a usable or repeat-safe teacher workflow

`TranslationExposureForm` requires three opaque database IDs. It does not show a class roster, learner name, Guided response, score, assistance, or submission time. A teacher cannot make an informed selection from this form.

The form creates a new idempotency key for every submit action. A retry after an uncertain network result creates a second evidence row. The backend only replays by learner and idempotency key. It does not de-duplicate the same source submission.

Use existing class and submission queries to present eligible Guided submissions. Keep one idempotency key for retries of the same selected source. Add a backend duplicate rule for the same learner, source submission, and `teacher_led` origin.

### P1: The teacher page has no page access gate

The middleware protects only `/dev/component-approval`. It does not protect `/teacher/dashboard`. Any visitor can see the teacher exposure form. The API route and Convex mutation still reject unauthorized writes, so this is not a write authorization bypass.

Apply the existing teacher page guard to the dashboard. Keep the route and mutation checks as the trust boundary.

### P0: The SRS bridge does not pass TypeScript validation

`activities.ts` passes `activity.stableActivityId as never` to `processReview`. The app TypeScript check reports an error at this call because the practice submission contract requires its branded activity ID type. The unsafe cast also hides the contract mismatch.

Construct the practice submission through the existing validated contract or branded ID helper. Do not use `as never`. Run `npx tsc --noEmit` after the fix.

### SRS and evidence behavior that is correct

The evidence evaluator requires same-node teacher exposure at or before the graded event. It rejects exposure from another learner, another node, or a later time. Guided evidence remains historical. Assisted Independent evidence remains historical.

After valid teacher exposure, an incorrect Independent response creates an SRS review with rating `Again`. A later correct response updates the same card and adds a second review log. This is the required wrong-then-correct review sequence. In this contract, `masteryBearing` means eligible for the mastery bridge. It does not mean that the response is correct.

An identical submission replay returns the stored result. It does not call `processReview` again. A changed replay returns an idempotency conflict. Convex mutation atomicity protects the submission, evidence, card, and review-log writes in one transaction.

### Test result and missing tests

The focused Convex tests pass: 26 tests in `activities-pilot`, `translation-queue`, and `seed-translation-pilot`.

The current tests use a local database mock. No route test covers authentication, role rejection, malformed IDs, or error mapping. No component test covers the real teacher form. Add focused route and form tests after the workflow uses selectable class and submission data.

## Parent review of the actual Guided-to-teacher flow

The graded Guided handler writes a historical `learning_evidence` row with the submission ID. The teacher candidate query excludes a source if any evidence row exists. The teacher mutation also rejects an existing row unless its origin is `teacher_led`. Thus, a real Guided submission cannot become a teacher candidate. The positive teacher fixtures did not include the historical row that the real student handler writes.

Preserve both events. A teacher attestation must not replace the graded student history. Scope replay and source checks to the correct event origin. Test the real sequence: student Guided submission, teacher candidate query, teacher attestation, then Independent submission.

The current IM1 form also lacks a catch for rejected `fetch`. The existing failure test covers an HTTP response, not a rejected network Promise. It has no pending control. A retained key can become associated with a different selected candidate. These conditions need dedicated tests and repair before acceptance.
