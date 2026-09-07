# IM3 Guided Assistance Independent Review

## Scope

This review covers the selected IM3 Guided submission path.

It compares these files with section 8.4 of `kst-srs.v3.2/SPECIFICATION.md`:

- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/convex/learningEvidence.ts`
- `apps/integrated-math-3/__tests__/convex/im3-guided-assisted-evidence.test.ts`
- the real `GraphingExplorer` submission envelope

This review does not approve the curriculum or activity.

## Findings

### P1: The SRS cap trusts learner-supplied assistance counters

The server writer copies `hintsUsed` and `revealStepsSeen` from the submitted `practice.v1` envelope. The SRS bridge then uses these values for the section 8.4 caps.

The test proves this behavior by sending arbitrary counter values directly to `createServerOwnedSubmissionHandler`. It does not prove a server-authoritative hint or reveal event.

A learner can send `hintsUsed: 0` after the learner uses hints. A learner can also omit `revealStepsSeen`. The server grade remains authoritative, but the assistance cap does not.

Do not use these counters to increase an SRS rating until the server can verify them. Use a conservative Guided policy, or bind the counters to an existing trusted interaction source. Do not add a new ledger for this repair.

### P1: One revealed step is always classified as a full reveal

The bridge sets `totalRevealSteps` equal to `revealStepsSeen` for each part.

Thus, `revealStepsSeen: 1` becomes one revealed step out of one total step. The rating mapper returns `Again` with `reveal_all`.

Section 8.4 requires `Hard` when the learner sees one or more steps. It requires `Again` only when the learner sees all steps. The bridge must get the reviewed total step count from server-owned activity content. It must not derive the total from the number seen.

The current test encodes the defect. It expects `Again` for one reported reveal without proving that the activity has one total reveal step.

### P2: The test does not cover timing policy

The stored envelope can contain learner timing fields. The selected rating input does not include timing evidence. The adapter therefore cannot apply the section 8.4 timing adjustment for this path.

This omission is safe while the app has no trusted timing baseline. The test must state this limit. It must verify that learner timing cannot change the rating. A later timing feature must require medium or high confidence and at least ten baseline samples.

## Verified behavior

The selected Guided identity checks bind the stored submission to:

- the authenticated learner;
- the stored activity document;
- the selected node;
- the Guided stable activity ID;
- the `graphing-explorer` component;
- `guided_practice` mode;
- `srsEligible: true`;
- the server attempt ordinal;
- a finite server score with `maxScore: 2`.

The SRS bridge reloads the stored submission. It rebuilds evidence from that record. It compares node, activity, mode, attempt ordinal, score, maximum score, and correctness before it writes an SRS review.

The writer replaces client grading with server grading. The SRS input uses the stored graded parts. Client score fields do not control the score.

The replay test verifies one card and one review log after the same evidence submission runs twice. The receipt boundary returns the stored result on replay.

The new rating input applies only to the two selected graph activity IDs. Other activity resolver branches remain on their existing path. This change does not alter their rating input.

## Test result

The focused test passed three of three tests.

The passing tests confirm the current implementation. They do not resolve the two P1 trust and reveal-total defects.

## Disposition

The identity, server score, and replay boundaries are suitable for this bounded path.

The assistance change is not ready for integration. The implementation must stop learner-controlled counters from increasing the rating. It must distinguish a partial reveal from a full reveal.

## Repair result

The selected `GraphingExplorer` has no reveal control. The writer now rejects nonzero reveal telemetry for selected graph submissions before persistence. The SRS input uses zero seen steps and zero total steps. It does not fabricate a total from a learner counter.

The focused test now verifies this rejection. It also verifies that learner timing telemetry cannot change the rating while the selected path has no trusted timing baseline.

`hintsUsed` remains practice telemetry from the learner component. The server preserves it and uses its cap. This repair does not prove that the hint count is tamper-resistant. A trusted hint counter requires a separate existing server-observed interaction source. No such source exists in this bounded path.

The integration test now creates the Worked acknowledgement through the strict selected server writer. Its activity has the exact approved `f(x) = x^2` source props. The test no longer uses the legacy mutation handler.

The SRS bridge now checks each selected stored part grade before the adapter runs. It requires finite and bounded part scores. It requires each `isCorrect` value to agree with its part score. It also requires the aggregate score and maximum score to equal the sums of the part grades. Corrupt learner ownership, node identity, and aggregate grade records produce no SRS card or review log.
