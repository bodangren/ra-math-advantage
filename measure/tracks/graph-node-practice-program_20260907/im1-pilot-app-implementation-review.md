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
