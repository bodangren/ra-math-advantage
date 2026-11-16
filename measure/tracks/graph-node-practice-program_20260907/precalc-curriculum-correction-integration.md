# Precalculus Q21 curriculum failure correction

Date: 2026-09-08

## Candidate

The isolated current-main candidate is `/tmp/precalc-q21-main-candidate-20260908`.

The current-main patch is `/tmp/precalc-q21-current-main-reconciliation.patch`.

The source-assertion-only patch against current HEAD is `/tmp/precalc-q21-head-source-assertions.patch`. It excludes the later Topic 1.2 through Topic 1.6 graph regression and projection artifact.

No main file changed. No file was staged or committed.

## Source assertions

The correction keeps the legacy FRQ keyword and 80-line checks for the other 43 assessed topic files.

Topic 1.1 now uses one exact source-backed test. It requires the official CED file and pages 39 and 40, both learning objectives, the introductory-scope statement, and three source headings.

The planning test now requires both official learning objectives and the reviewed Passwater PDF page range. It no longer requires the obsolete learning-objective family line or generated Passwater summary path.

The keyword and line-count checks remain broad technical debt for the other 43 assessed topics.

## Projection correction

The correction changes only 32 `srsEligible` values from `true` to `false`. These are the Guided and Independent rows for the 16 reviewed draft nodes in Topics 1.2 through 1.6.

A byte comparison confirms 32 JSON hunks. Each hunk changes one Boolean value. No activity ID, node ID, source ID, renderer, props, grading field, metadata field, or row count changes. The file keeps 181 activity rows.

The standalone SRS projection stays unchanged. Its 88 rows already equal the current `projectSrsInputs` result.

The new regression selects the exact 16 node IDs. It requires exactly one Guided row and one Independent row for each node. It requires all 32 rows to have `srsEligible: false`. The full projector equality test remains.

## Test evidence

The original focused run failed 4 of 345 tests. The log is `/tmp/precalc-q21-red.log`.

The final focused run passes 345 of 345 tests.

The full curriculum run passes 373 of 373 tests. The log is `/tmp/precalc-q21-all-curriculum.log`.

Oxlint passes. The log is `/tmp/precalc-q21-lint.log`.

The app build passes. The log is `/tmp/precalc-q21-build.log`.

Post-build standalone TypeScript passes. The log is `/tmp/precalc-q21-tsc.log`.

The JSON projection was restored from the exact before copy after a temporary serializer check. The final patch contains no Unicode escape or formatting changes.


## Parent integration and verification

The parent extracted the four application files from the patch and excluded the unrelated scratch plan hunk. The applied patch is `/tmp/precalc-q21-parent-application.patch`.

All 373 current-worktree curriculum tests pass. App lint, a fresh build, and post-build standalone TypeScript pass. The corrected projection retains 181 activity rows and all identity, source, grading, and display fields. It changes only the 32 draft eligibility flags. The 88 standalone SRS rows remain unchanged. This is a correction to planning output, not source approval or practice activation.

The HEAD-compatible source patch changes only two test files. The parent tested it in `/tmp/precalc-q21-parent-head`, built from the committed app. Before the patch, those files report seven failures and 333 passes. After the patch, they report four failures and 335 passes. The three repaired failures are the Topic 1.1 source proxies. The remaining four failures concern existing class-period assertions: three require topic IDs in scaffolded prose, and one requires a specific markdown topic-cell format. Their assertions are outside this patch. A focused run of the two changed source tests passes both tests. Existing shared-worktree changes handle those class-period assertions but are not included in this commit.

The later-topic eligibility regression and projection remain in the mixed shared worktree because the committed graph does not yet contain those later-topic artifacts. This report does not claim that the full pending graph is committed.

Parent logs: `/tmp/precalc-q21-parent-main-tests.log`, `/tmp/precalc-q21-parent-main-lint.log`, `/tmp/precalc-q21-parent-main-build.log`, `/tmp/precalc-q21-parent-main-tsc.log`, `/tmp/precalc-q21-parent-head-baseline.log`, `/tmp/precalc-q21-parent-head-source-tests.log`, and `/tmp/precalc-q21-parent-head-targeted.log`.

No dependency change, database operation, source approval, or deployment occurred. Older evidence-fixture reconciliation remains open under Q18.
