# IM3 pilot SRS eligibility independent review

## Verdict

Accept.

The four-path patch changes exactly six stored `srsEligible` values. It changes three selected draft Independent rows in the Module 1 map and the same three rows in the course map from `true` to `false`. It preserves every other activity field, row order, node status, blueprint status, and runtime file.

## Contract review

Current `projectActivityMap` makes a Guided or Independent row SRS-eligible only when all three conditions are true:

- the node has `independentPracticeReady: true`;
- the node has `reviewStatus: approved`;
- the blueprint has `reviewStatus: approved`.

The three selected Independent rows fail the approval gate. Their stored `false` values match fresh projector behavior.

The updated pilot tests call the real `projectActivityMap` function. They derive the expected value from the node and blueprint records. They also require all three selected rows in both stored maps and require `false` for each row. Thus, the tests do more than mirror stored booleans.

The shared `projections.test.ts` suite retains approved positive cases. It proves that eligible Guided and Independent activities can still produce `true`. The patch does not disable SRS eligibility globally.

## Verification

- Five pilot files passed: 54 tests.
- The shared projection file passed: 26 tests.
- The patch contains the exact four reported paths.
- No approval, runtime, schema, graph-node, blueprint, or other projection field changes are present.

No blocking defect remains.
