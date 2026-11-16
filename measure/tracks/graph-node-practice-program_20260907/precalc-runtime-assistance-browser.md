# Q37 Unit 7 Assistance Browser Report

## Result

The assistance implementation from commit `20c8dd821` passed the bounded real browser proof.

The live disposable archive used the exact committed runtime files:

- `packages/activity-components/src/components/intervals/IntervalClassificationActivity.tsx`
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`

The browser used a new disposable learner. The teacher used the real dashboard confirmation form. The local source approval remained hypothetical and local.

## Blank attempt

All three inputs started empty. No hint or answer text appeared.

The submit control was disabled. A forced test click sent zero POST requests. The inputs and assistance controls remained usable. The blank attempt did not freeze.

## Guided assistance and replay

The learner requested the Increasing hint and the Decreasing answer. The requested answer did not fill an input.

The learner entered all three answers and submitted. The server accepted the first POST. The test then aborted the response.

The inputs and assistance controls remained frozen. The parent retry control remained usable. The retry sent the same body and the same `Idempotency-Key`. It succeeded. Exactly one Guided submission persisted.

The persisted Guided parts were:

- Increasing: `hintsUsed: 1`, `revealStepsSeen: 0`, `changedCount: 1`.
- Decreasing: `hintsUsed: 0`, `revealStepsSeen: 1`, `changedCount: 1`.
- Constant: `hintsUsed: 0`, `revealStepsSeen: 0`, `changedCount: 1`.

The server supplied `isCorrect`, `score`, and `maxScore`. All three parts scored 1 of 1. The Guided receipt had reason `ungraded_evidence` and `masteryApplied: false`.

## New attempt

The learner selected `Start new attempt`.

The new Guided attempt had empty answers. It showed no requested hint. Its hint control was enabled. Its submit control was disabled until all three answers were nonempty.

## Independent assistance and rating

The learner requested the Increasing hint and the Constant answer. The learner entered the exact seed 2 answers and submitted through the real route.

Exactly one Independent submission persisted. Its parts were:

- Increasing: `hintsUsed: 1`, `revealStepsSeen: 0`, `changedCount: 1`.
- Decreasing: `hintsUsed: 0`, `revealStepsSeen: 0`, `changedCount: 1`.
- Constant: `hintsUsed: 0`, `revealStepsSeen: 1`, `changedCount: 1`.

The server scored all three parts as correct. The receipt was eligible and mastery-bearing. It had `masteryApplied: true`. The SRS review rating was `Hard`.

The final learner state contained three physical submissions, three evidence rows, two receipts, one SRS card, and one SRS review. The card had `reps: 1` and state `review`.

## Evidence

The retained archive contains:

- `unit7-before-assistance2-effects.json`
- `unit7-after-assisted2-guided-effects.json`
- `unit7-after-assisted2-independent-effects.json`
- `unit7-browser-assistance2.log`
- `unit7-assisted2-independent-hard.png`

The first assistance learner proved the first server acceptance and persisted Guided counters. A harness text filter then timed out before the visible retry. The second learner ran the complete proof above. This was a harness assertion correction. It was not a runtime correction.

The teacher browser used UTC to match server-rendered date text. This prevented the local development hydration overlay from blocking the real form.

No main workspace file changed. No production endpoint was used. The backend and frontend remain live.
