# IM3 Lesson 1.6 quiz parent lifecycle preliminary review

## Status

This is an early review of the mutable client implementation. It is not final patch acceptance.

## Findings

1. `LessonRenderer` does not reject an envelope with a different physical activity ID before the network call.

The quiz branch is selected from the callback `activityId`. The code then builds the server input from `payload.activityId`. It does not first require both IDs to equal the selected canonical quiz activity. A mismatched envelope reaches `createServerOwnedActivitySubmission()` and relies on server rejection. The accepted scope requires exact active-section and envelope validation before network work.

Add an explicit physical-ID equality check. Add a regression that supplies a mismatched envelope and requires zero submission calls and no phase completion.

2. A rapid phase switch can separate the frozen retry body from the visible answers.

`LessonRenderer` keeps the first quiz request and answers in refs. The public quiz wrapper keeps its selected and locked answers only in component state. A learner can start a POST, leave the phase, and return after the re-entry GET returns `null` while the old POST is still late or its result was ignored. The remounted wrapper is editable. The parent still reuses the first frozen request. The learner can select different answers. The server then grades or replays the frozen answers, while the wrapper displays the old score with the new visible selections.

Preserve the frozen pending answers as parent-owned runtime state. Pass them to the wrapper on same-identity re-entry. Keep those selections locked and expose only an exact retry. Do not solve this only by rejecting changed answers because that can leave the learner unable to restore the frozen selection.

Add a regression with this sequence:

1. Start the quiz POST for activity A.
2. Switch away from A.
3. Return to A.
4. Resolve the re-entry GET as `null`.
5. Resolve the old POST late or retry after its stale result.
6. Require the visible selections to equal the frozen request.
7. Require the retry body and idempotency key to equal the first request.
8. Require a valid receipt to unlock the current phase only.

The current GET identity and revision guard, ordinary reload restoration, valid POST completion, and retained request after a malformed receipt otherwise follow the accepted design.
