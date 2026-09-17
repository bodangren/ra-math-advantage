# Precalculus Topic 1.1 Production Flow Review

## Result

The new test exercises the main production handlers in the correct order. It creates an ungraded Worked acknowledgement. It records a teacher attestation from the stored acknowledgement. It creates server-graded Guided and Independent submissions. It passes opaque submission IDs to the evidence mutation. It applies eligible Independent grades to the Spaced Repetition System (SRS).

The test uses hypothetical approved node, blueprint, and activity fixtures. It does not approve production data.

Two gaps remain.

## Finding 1: The evidence mutation does not enforce current publication

Priority: P1

`createTopic11DailySubmission`, `createServerOwnedSubmission`, and `submitTopic11TeacherSubmission` call `isPrecalculusPilotPublished`. The final `learningEvidence.submit` mutation does not call it.

A student can create a valid Independent submission while Topic 1.1 is approved. If the node or blueprint becomes draft before evidence processing, `learningEvidence.submit` can still persist evidence and apply an SRS review from that stored submission.

The new test calls the internal `submit` mutation directly. It does not prove a current publication check at this final boundary. The HTTP route adds student authentication, but it calls the same mutation and does not add a publication check.

Add a test that creates a valid stored Topic 1.1 submission, changes the publication fixture to draft, and then calls the evidence mutation. The mutation must reject the submission before it writes evidence, a receipt, an SRS card, or an SRS review log row.

Apply the check only to the exact Topic 1.1 node in this bounded repair. Do not add a new publication registry.

## Finding 2: The test uses the generator as its answer oracle

Priority: P1

The `answersFor` helper calls `generateTopic11IntervalGraph`. The production grader uses the same generated interval data. Thus, the test can pass if the generator and grader share the same mathematical error.

Use literal answers in this production-flow test.

For seed 0, the points are `(0,1)`, `(3,7)`, `(7,2)`, and `(9,6)`. Direct comparison of consecutive y-values gives:

- Increasing: `[0,3] U [7,9]`
- Decreasing: `[3,7]`
- Constant: `none`

For seed 2, the points are `(0,5)`, `(2,8)`, `(4,8)`, and `(8,6)`. Direct comparison gives:

- Increasing: `[0,2]`
- Decreasing: `[4,8]`
- Constant: `[2,4]`

Keep the independent wrong answer as a literal change to the seed 2 increasing interval. Assert the stored raw answers and the three part grades.

## Confirmed Behavior

The Worked writer stores no score, maximum score, feedback, or graded timestamp. The teacher mutation verifies the learner, teacher, organization, owned class, active enrollment, assigned lesson, current published lesson version, and source activity in that version. It also verifies the canonical activity identity and the stored Worked envelope.

The teacher evidence uses the exact Topic 1.1 node and Worked activity ID. It does not run SRS.

The server grader ignores browser grade fields. It grades the stored raw interval strings with the activity's server-owned seed. Guided evidence is historical and is not mastery-bearing. Independent evidence is mastery-bearing only after same-learner, same-node teacher evidence.

The incorrect Independent answer keeps its partial score and `isCorrect: false`. It still produces one eligible SRS review after teacher exposure. A later correct attempt uses ordinal 2 and updates the same exact-node card to two repetitions.

The same submission evidence replay uses its receipt and does not run the SRS bridge again. A changed body with the same creation key returns `idempotency_conflict` before it creates another submission. The final card and review-log counts show two accepted Independent effects.

## Test Coverage Improvement

Add an explicit row-count assertion after the second teacher mutation. This assertion must prove that teacher replay keeps one teacher evidence row. The teacher path does not use the submission receipt table. The current final SRS counts prove Independent effect replay safety, but they do not directly prove teacher-history row stability.

## Verification

The new `topic11-real-production-flow.test.ts` test passes.

The focused command also ran 245 tests from four files. It had 238 passes and seven failures. Four failures are older production-flow tests that use the current draft publication without a hypothetical approval fixture. Three failures are older authority tests that still expect Guided Topic 1.1 evidence to be mastery-bearing. These failures are outside the new test. They show that the broader focused suite is not green and needs fixture or expectation updates.

## Resolution

Both P1 findings are resolved.

The production `learningEvidence.submit` mutation now calls `submitPrecalculusLearningEvidenceHandler`. This handler reads the stored submission before it creates an evidence runtime. For the exact Topic 1.1 Guided or Independent activity, it checks the current canonical node and blueprint publication. A withdrawn publication returns `submission_not_found` before evidence, receipt, card, or review-log effects.

The production-flow test now uses literal seed 0 and seed 2 interval answers. It no longer imports the Topic 1.1 generator. The test also asserts that teacher replay keeps one teacher-evidence row.

The older production fixtures now set hypothetical approved graph and activity state for Topic 1.1. The older authority tests now use the current policy: Guided evidence persists as non-mastery history, and Independent evidence runs the SRS bridge.

The four affected files pass 247 tests. The withdrawal test covers both a draft node and a draft blueprint. The in-memory query model rejects duplicate `unique` results and applies descending order to `first`, `take`, and `collect`. The correct Independent evidence replay keeps one card at two repetitions and keeps two review-log rows. Precalculus lint, standalone TypeScript, and the application build pass.
