# IM1 Translation Catalog Review

Date: 2026-09-07.

Node: `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`.

## Result

The three saved `practice.v1` rows match the adapter output for the configured generator inputs.

| Mode | Input | Generated task | Result |
| --- | --- | --- | --- |
| Worked | seed 1101, difficulty 1 | Write `(16 + 17) / 12` from “the sum of 16 and 17, divided by 12.” | The blueprint and saved row match the adapter. The reasoning preserves the sum grouping. It omits the evaluation step. |
| Guided | seed 1102, difficulty 1 | Write `7 + 8` from “the sum of 7 and 8.” | The blueprint and saved row match the adapter. Feedback occurs on check. One hint identifies addition. Reveal becomes available after one attempt. |
| Independent | seed 1103, difficulty 1 | Write `17 * (25 - 7)` from the product-and-difference description. | The blueprint and saved row match the adapter. Public props contain no answer, accepted form, numeric value, solution step, or grading result. |

The blueprint assesses one `expression` part. It uses a custom grading rule. The server grader compares only the finite generated expression forms after notation normalization. It rejects the evaluated scalar and changed operation order or grouping.

The source mapping is valid. Lesson 1.1 Example 1 covers simple verbal translations. Example 2 covers named operations and required grouping. Example 3 covers contextual verbal descriptions. The source IDs in the blueprint match those three examples.

## Catalog defects

1. Guided Practice is too narrow for the complete node. Seed 1102 generates only `7 + 8`. The node includes operation order and grouping. The Guided prompt mentions grouping, but the task does not require it. Use a deterministic grouped template for Guided Practice before teaching review.
2. The skill node remains `approved`, while the corrected blueprint remains `draft`. The three saved activity rows are inactive because `srsEligible` is false, and the teacher projection marks Independent Practice unavailable. The mixed status can still mislead code that reads node approval without blueprint status.
3. The SRS projection is stale. It still names `step-by-step-solver`, has a null generator key, and marks the generator unavailable. The corrected blueprint and practice map use `fill-in-the-blank` and generator `1-1-verbal-to-numerical`.
4. The `6-EE.A.1` alignment concerns numerical expressions with whole-number exponents. The three source examples and the selected seed tasks do not use exponents. Keep this alignment draft or remove it from this node after standards review. `6-EE.A.2` is the direct translation alignment.

## Test finding

`translation-pilot-blueprint.test.ts` correctly detects drift between the blueprint, the three saved activity rows, and the adapter outputs for seeds 1101 through 1103. It checks the expression-only target, custom grading, draft blueprint status, and inactive saved rows.

The test does not check the Guided task against the complete grouping scope. It also does not check the stale SRS projection or the approved node status. The adapter test separately verifies Independent concealment and rejects a scalar, changed order, and changed grouping.

## Remaining runtime limits

The catalog does not prove durable production submission. The production activity must use the server grader and must wait for successful persistence before it records completion.

The seed mutation sets `srsEligible` to false for a new row. It clears approval only when it detects a content change on an existing row. A previously approved database row can keep its approval when the seeded content already matches. Runtime activation must require the draft blueprint and current publication state, or the seed must explicitly preserve the intended inactive state.

## Resolution

The bounded catalog follow-up resolves the catalog defects for this node.

- All four stored node copies now have `reviewStatus: draft`.
- Guided Practice now uses seed 1110. It translates “the sum of 9 and 11, divided by 10” as `(9 + 11) / 10`. Its two hints identify both operations and require the grouped sum before division.
- The saved Worked, Guided, and Independent rows match seeds 1101, 1110, and 1103 respectively. All three remain ineligible for spaced repetition.
- The selected SRS row now names `fill-in-the-blank` and `1-1-verbal-to-numerical`. It records that the generator is available. This implementation fact does not make the activity eligible.
- The selected teacher row remains unavailable for Independent Practice.
- The blueprint and the three selected activity rows have no direct standard alignment.
- The two direct skill-alignment edge IDs remain in both edge files. Their status is `rejected`. Their rationales state the exact scope mismatch. `6-EE.A.1` requires whole-number exponents. `6-EE.A.2` requires expressions in which letters represent numbers. The selected numerical-expression tasks assess neither requirement.

The patch does not change source example or lesson alignments. It does not approve or activate the node.

Focused verification passed:

- IM1 catalog agreement test: 3 tests.
- Math-content adapter test: 4 tests.

## Integration correction

The existing SRS projection uses `generatorReady` for explicit Independent readiness. It does not mean registration alone. The selected row therefore keeps `generatorReady: false` and records the available generator key separately. Both saved copies now agree.

The parent reran all three projection consumers with the actual graph edges. Rejected alignment edges still appeared in generated activity and SRS standards. The projection consumers now discard rejected edges before they derive relationships. The regression failed before this repair.
