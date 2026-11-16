# Precalculus Q35 local control report

## Target

I verified the target before the fixture push.

- Process: PID 34091
- Instance: `q35-precalc-rename-20260908`
- Backend: `http://127.0.0.1:43130`
- Storage: `/tmp/precalc-q35-rename-current-main`

I removed cloud deployment variables from each Convex command. I used the existing local administrator key. I did not restart the backend.

## Guided concurrent first delivery

I added one approved Guided physical activity to the existing disposable fixture state. It uses the exact selected node, Guided stable activity ID, component key, display text, props, and seed 0 grading configuration.

The real `activities.createServerOwnedSubmission` writer graded the Guided response as 3 of 3. The response contained three parts. The parts recorded hint counts 2, 1, and 0. The response recorded zero reveal steps and zero changes.

Two concurrent calls then used the real `selectedLearningEvidence.submitSelected` mutation for the new submission. One call returned `delivery: new`. One call returned `delivery: replay`.

The stored result has these effect changes:

- Evidence: +1
- Receipt: +1
- SRS card: +0
- SRS review: +0

The evidence has the exact learner, node, Guided activity, submission ID, attempt ordinal 1, `guided_practice` mode, and `mastery_advantage` origin. It has no `gradedEvidence` field.

The receipt has `persisted: true`, `masteryApplied: false`, `kstApplied: false`, and reason `ungraded_evidence`.

The backend log records an optimistic concurrency control conflict on the new receipt. It also records an automatic retry of `selectedLearningEvidence:submitSelected`. This confirms overlap for the two Guided delivery calls.

## Disabled credential control

I created a new real Independent submission while the credential was active. I then disabled the learner credential.

The real selected evidence mutation rejected the new submission with `Inactive student identity`. It also rejected a replay request for an existing persisted submission with the same error.

The complete evidence, receipt, card, and review JSON was unchanged across both rejected calls. The new submission had no preseeded receipt.

I restored the credential to active after the control.

## Files and results

- Fixture: `/tmp/precalc-q35-rename-current-main/apps/pre-calculus/convex/q35_fresh_fixture.ts`
- Runner: `/tmp/precalc-q35-run-controls.py`
- Result: `/tmp/precalc-q35-controls-result.log`
- Push log: `/tmp/precalc-q35-control-push.log`
- Per-call logs: `/tmp/precalc-q35-control-*.log`

All fixture changes are in the disposable local copy. I did not edit the main worktree. I did not install a dependency. I did not call a cloud deployment.

The local backend remains active as PID 34091 on port 43130 for parent review.
