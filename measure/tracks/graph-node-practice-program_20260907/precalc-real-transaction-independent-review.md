# Precalculus Q35 atomic proof review

## Disposition

The local proof supports the Q35 rename integration. The proof uses the real selected submission writer and the real selected evidence handler. It also shows transaction rollback and concurrent idempotent delivery.

This result is local evidence. It is not a cloud deployment result.

## Fresh delivery

The fixture created one Independent submission through `internal.activities.createServerOwnedSubmission`. The server returned score 3 of 3 and attempt ordinal 1.

The fixture then called `internal.selectedLearningEvidence.submitSelected`. The first delivery returned `delivery: new`, `persisted: true`, and `masteryApplied: true`.

The stored mastery evidence has these exact values:

- Node: `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`
- Activity: the exact selected Independent activity
- Mode: `independent_practice`
- Origin: `mastery_advantage`
- Score: 3
- Maximum score: 3
- Correct: true
- Attempt ordinal: 1
- Submission ID: the server-created submission ID

The submitted practice envelope contains three exact interval parts. Each part has `hintsUsed: 0`, `revealStepsSeen: 0`, and `changedCount: 0`. The persisted evidence has no assisted-state conflict. The fresh effect counts are one teacher fixture row, one graded evidence row, one receipt, one card, and one review.

A second delivery for the first submission returned `delivery: replay`. It did not add effects.

## Rollback

The fixture created a second real server-graded submission. The server returned score 3 of 3 and attempt ordinal 2.

The rollback mutation called the real `submitSelectedEvidenceHandler`. It verified that the handler had produced new mastery effects and a receipt. It then threw an error in the same Convex mutation.

The complete JSON output before and after the forced error is identical. The card, evidence, receipt, and review rows did not change. This proves atomic rollback for the tested handler path.

## Concurrent delivery

Two client calls submitted the second submission at the same time. One returned `delivery: new`. The other returned `delivery: replay`.

The final database has three evidence rows, two receipts, one card, and two reviews. The second submission has exactly one evidence row, one receipt, and one review. The card has two repetitions.

The backend log contains an optimistic concurrency control conflict on the SRS card and a retry of `selectedLearningEvidence:submitSelected`. This log provides evidence that the two mutations overlapped and that Convex retried one mutation. The test does not measure the exact overlap interval or retry count beyond this logged retry.

## Source and runtime boundary

The fixture adds only the isolated `q35_fresh_fixture.ts` test module to the candidate source. It calls the actual activity writer and selected evidence module through generated internal references. The rollback path imports and calls the actual selected evidence handler. The proof does not replace the production grading, evidence, receipt, card, or review logic.

The runner removes cloud deployment variables. It targets only `http://127.0.0.1:43130` with the local self-hosted administrator key. I did not restart, mutate, or query the active backend during this independent review.

## Limits

The initial `teacher_led` row is a direct fixture insert. It is not proof of the real teacher action, teacher authorization, class assignment, or teacher route.

The fixture uses hypothetical approved physical activities and a published lesson version. It does not approve the real curriculum or prove a production cloud migration.

The proof covers one correct, unassisted Independent response. It does not cover incorrect, Guided, assisted, or malformed response behavior.

The source activity props in this fixture are minimal fixture props. This run proves the selected evidence transaction after fixture setup. It does not independently prove the full current source publication predicate.
