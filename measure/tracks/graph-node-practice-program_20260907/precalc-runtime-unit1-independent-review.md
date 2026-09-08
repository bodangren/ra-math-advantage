# Precalculus Q37 unit 1 independent review

## Disposition

Accept the no-code conclusion for the bounded prerequisite unit at commit `1cd1158e`.

The zero-byte patch is correct. HEAD already contains the selected Topic 1.1 node and activity constants, the seed 0 and seed 2 interval generator, the three-part grader, the physical Worked acknowledgement writer, the Guided and Independent server-owned writer, the required activity and evidence tables, and the evidence policy and stores.

The graph node remains draft. Its renderer key is `interval-classification`. The selected writer tests use hypothetical approved publication fixtures. This result does not activate the source-only curriculum.

## Independent verification

The supplied candidate became dirty during later Q35 work. I therefore created a clean archive of commit `1cd1158e` at `/tmp/precalc-q37-clean` for this check.

I ran the four application suites named by the report. They passed 60 tests:

- Topic 1.1 grader: 5.
- app evidence runtime: 7.
- selected writer: 42.
- selected writer-to-evidence flow: 6.

I ran the shared `practice-core` learning-evidence suite separately. It passed 35 tests. The exact total is 95.

The clean archive plain TypeScript command failed with one error:

`convex/learning-evidence.ts(3,3): error TS2305: Module '@math-platform/practice-core' has no exported member 'learningEvidenceFingerprintV1'.`

The archive uses a root `node_modules` symlink. That symlink resolves the package through the dirty main workspace, where the export is pending removal. Commit `1cd1158e` still defines and exports the function. I added a temporary review-only TypeScript configuration in the disposable clean archive. It mapped `@math-platform/practice-core` to the archive source. The same `npx tsc --noEmit` check then passed with no errors.

This confirms source compatibility for HEAD. It does not prove that a normal installed workspace is isolated from main-worktree package state.

## Accuracy limits

The report should give the exact TypeScript commands or retain the explanation above. No saved Q37 command logs were present in `/tmp`; I independently reproduced both results.

One tracked historical test, `__tests__/learning-evidence-pilot.test.ts`, is outside the stated 95-test set. It currently expects the selected graph node renderer key to be `graphing-explorer`. HEAD uses `interval-classification`. That test fails its manifest assertion. This is a stale test-contract issue. It does not show a missing selected generator, grader, writer, or schema dependency, but the report must not imply that all selected or all Precalculus tests pass.

The original candidate path now contains later uncommitted Q35 module-rename changes. It is not an unchanged HEAD candidate at review time. The zero-byte patch and this disposition apply to commit `1cd1158e`, as verified in the clean archive.
