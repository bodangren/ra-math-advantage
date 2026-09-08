# Precalculus Topic 1.1 assistance gap proposal

## Finding

The current selected Guided and Independent activity has no usable hint or reveal control.

`IntervalClassificationActivity` builds default practice parts from answers. These parts contain no assistance or change counters. `PrecalculusMasteryAdvantagePilot` then reduces every part to `partId` and `rawAnswer`. The server already accepts and validates `hintsUsed`, `revealStepsSeen`, and `changedCount` for each canonical part.

## Minimum behavior

Add per-part assistance state to `IntervalClassificationActivity` for the three existing fields.

- Track `hintsUsed`, `revealStepsSeen`, and `changedCount` by part ID.
- Increment `changedCount` only when an input event changes that part's current string value.
- Show one `Show hint` control for each part.
- Reveal the hint text only after the learner selects the control.
- Count the first reveal of that hint once. Disable that hint control after use.
- Show one `Reveal answer` control for each part.
- Reveal that part's interval answer only after the learner selects the control.
- Count the first answer reveal once. Disable that reveal control after use.
- Keep all answer inputs empty before learner action. Do not show a hint or answer automatically.
- Keep the Guided `guidedSteps` visible as current instructional content. Do not count those always-visible steps as requested hints.
- Give Independent mode the same requested controls. Use shorter generic hint text. Do not show Guided field help before a request.

The component can derive reveal text from the supplied ordered graph points. For each adjacent pair, compare the two y-values and use that segment's endpoint x-values. The selected prompt requests each segment. Current generated variants do not have adjacent segments with the same direction. Do not add a merge rule outside this contract. Preserve the accepted parentheses-or-brackets convention, join multiple segment intervals with a union, and use `none` when applicable. Test the display result against the actual generated Guided and Independent variants. This derivation supports display only. It must not set `isCorrect`, `score`, or `maxScore`.

## Submission contract

Pass explicit `parts` to `buildPracticeSubmissionEnvelope`. Each part must contain only:

- `partId`
- `rawAnswer`
- `hintsUsed`
- `revealStepsSeen`
- `changedCount`

Keep `answers` unchanged.

Change the parent normalization in `PrecalculusMasteryAdvantagePilot` to preserve these five keys. Do not preserve client `isCorrect`, `score`, `maxScore`, normalized answers, or arbitrary fields. The server remains the only grading authority.

The server already requires exactly the three selected part IDs. It checks nonnegative integer counters and raw-answer parity. No server schema or writer expansion is required.

## Ambiguous retry boundary

Freeze the attempt when the learner selects `Submit answer`.

- Build the complete envelope once before the request.
- Disable the three inputs and all assistance controls for that attempt.
- Keep the frozen values and counters after an ambiguous request failure.
- Keep the parent retry button usable. Let it resend the stored envelope with the same idempotency key.
- Do not rebuild the envelope from later UI state during a retry.
- A new attempt remounts the activity through the existing `attemptKey` path and resets all counters.

This behavior prevents the visible form from changing while the parent holds an older retry envelope.

## Reuse boundary

Do not reuse `HintPanel`. It is specific to quadratic axis, vertex, and direction calculations.

Do not add a shared assistance component for this one activity. The existing buttons, disclosure text, and per-part maps are sufficient.

The generator already derives increasing, decreasing, and constant intervals from adjacent y-values. Reuse that same interval classification rule in a small existing generator helper if it is already public. Otherwise, add the minimum local display helper and test parity against generated variants. Do not import an app grader into a shared package.

## Tests first

Add focused component tests that prove:

1. Guided and Independent modes show no hint or answer text before a request.
2. Each hint and reveal affects only its selected part and increments its counter once.
3. Input changes increment only the matching part's `changedCount`.
4. Submission parts contain exact per-part counters and no client grading fields.
5. A reveal does not fill or overwrite the learner's answer.
6. The first submit freezes inputs and assistance controls through an ambiguous failure.
7. Parent normalization preserves the three counters and rejects or strips grading fields according to the current route contract.
8. Parent retry resends the exact frozen envelope and idempotency key.
9. A new attempt resets answers, assistance state, and counters.
10. Server grading still supplies correctness and scores. Assistance changes only the accepted counters and evidence rating.

Use real generated Guided and Independent graph variants in at least one composition test. Check one no-constant variant and one variant with a constant interval.

## Proposed path scope

- `packages/activity-components/src/components/intervals/IntervalClassificationActivity.tsx`
- Its focused component test.
- `apps/pre-calculus/components/student/PrecalculusMasteryAdvantagePilot.tsx`
- Its focused selected-pilot test.

Add a generator test only if a shared formatting helper changes. No Convex runtime file, schema, route, dependency, graph, seed, approval, or deployment change is required.

The parent accepts this bounded implementation under the user-authorized program. The server remains the grading authority. Verify the actual browser counters and rating effects before acceptance.
