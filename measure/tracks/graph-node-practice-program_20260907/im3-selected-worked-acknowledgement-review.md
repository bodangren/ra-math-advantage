# IM3 Selected Worked Acknowledgement Patch

Date: 2026-09-07

## Scope

The patch adds the durable student acknowledgement writer for the selected IM3 graph Worked activity. It does not add teacher attestation or learning evidence. The patch is at `/tmp/im3-selected-worked-ack-head-reviewed.patch`.

## Behavior

The existing registered `createServerOwnedSubmission` mutation now accepts the exact selected Worked activity. It requires an active student credential, approved physical activity, approved current node and blueprint, exact stable activity ID, exact node ID, `graphing-explorer`, `worked_example`, SRS disabled, `f(x) = x²` public props, and the reviewed ungraded configuration.

The envelope must contain only the eight required `practice.v1` acknowledgement fields. It must have empty answers and parts. The attempt and timestamp must be valid. Optional artifact or client grade data is not accepted.

The writer assigns the attempt ordinal. It stores no score, maximum score, or graded time. It writes no learning evidence and no SRS state.

An identical retry returns the same submission. A changed acknowledgement timestamp with the same key returns `idempotency_conflict`. The route returns an explicit `acknowledged: true` result.

## Tests

The patch adds a registered mutation test and a route test. It also updates one existing test type adapter for the new result union.

These focused files pass with 38 tests:

- `selected-quadratic-worked-ack.test.ts`
- `selected-worked-ack-route.test.ts`
- `selected-quadratic-seed-submission.test.ts`
- `selected-quadratic-writer.test.ts`

Lint passes. Standalone TypeScript has only three known HEAD errors. Two errors are missing `learningEvidenceFingerprintV1` exports. One error is the missing generated `dist/server/index.js` module.

## Remaining step

The explicit lesson review action is outside this patch. Root has implemented and verified that caller in the pending main UI work. Teacher candidate selection and teacher attestation remain separate work.

## Integration review

The integration owner found that replay could accept a stored row with a grade. A regression reproduced this defect. Replay now rejects any stored score, maximum score, or graded time. The tests assert that each grade field is absent from a new acknowledgement.

The combined main check passes 283 tests, lint, standalone TypeScript, and build. The older public-boundary fixtures now supply active student credentials, explicit physical approval, and canonical snake_case answers. These changes let the tests reach the intended validation rules. The isolated writer patch excludes these later-node fixture repairs.

Independent caller review found that the real lesson action still uses the legacy route. It also found a remount timestamp conflict. Task Q12 must connect the strict route and restore existing acknowledgement state. This writer patch alone does not prove the complete student flow.
