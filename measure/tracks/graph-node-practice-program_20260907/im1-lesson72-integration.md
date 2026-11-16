# IM1 Lesson 7-2 draft source repair

## Result

The isolated candidate implements the accepted six-capability and five-reuse scope. All changed and new source boundaries remain draft and inactive.

Candidate: `/tmp/im1-g34-head-20260908`

Patch: `/tmp/im1-g34-head.patch`

Before copies: `/tmp/im1-g34-before-20260908`

## Source repair

The lesson preserves all Problems 1-29. It includes every system in Problems 1-20 and the full contextual givens and actions in Problems 16, 17, and 21-29. It includes the Problem 24 table. It transcribes Guillermo's and Cara's work in Problem 25.

Problem 19 uses the rendered fractions. Problem 21 remains data-dependent. Problem 22 uses an unordered angle assignment. Its general formula uses `0 <= d <= 90`. The nondegenerate domain is `0 <= d < 90`. Unequal angles additionally require `d > 0`. Problem 27 remains a manual comparison task.

## Graph changes

- Added six draft inactive skill nodes in all four node catalogs.
- Added six source-only draft blueprints.
- Added 11 draft containment edges: six new capabilities and five reuses.
- Removed only `math.im1.edge.1260` and `math.im1.edge.1261`.
- Preserved every other existing edge without a semantic change.
- Preserved `.008` and `.009`. Corrected their headings, source references, and draft status.
- Kept the broad 7c stable ID. Changed it to a draft inactive source aggregate.
- Preserved its existing CCSS A-REI.C.6 standard reference and alignment edge.
- Removed only its three empty placeholder activities.
- Added six inactive SRS planning rows and six teacher inventory rows.
- Removed the withdrawn prerequisite from the 7c and 7e SRS rows.
- Added six generator-gap rows. The queue prefix is unchanged.
- Rebuilt the coverage matrix with `buildCoverageMatrix`.

Current derived counts are 939 graph nodes, 2,448 graph edges, 342 skill candidates, and 336 generator gaps. Historical generation statistics remain unchanged. Current array totals are updated.

## Verification

The new source suite was Red with 5 failures before implementation. It is Green with 5 tests.

All curriculum tests passed: 115 tests in 28 files.

The coverage-matrix and audit suites passed: 41 tests in 3 files with the source suite.

App lint passed. TypeScript passed before the build. The production build passed. TypeScript passed after the build. The final source-only text adjustment passed the focused test, lint, and TypeScript check.

A full app test run also exposed two existing HEAD test failures and one existing CI wiring suite failure. The failures concern the shared Convex provider source assertion and a missing CI job. They do not touch this repair. The bounded curriculum suites are Green.

No dependency, approval, database, staging, deployment, or commit action occurred.

## Parent integration

The parent applied the bounded source repair to the shared worktree. All 13 owned files match the final isolated candidate. No unrelated source path changed.

The parent corrected two stale audit totals: 338 skills have blueprints, and 133 skills have approved node status. The latter count is not a count of complete practice paths. The parent removed misleading current `exampleNumber` fields from `.008` and `.009` in all four catalogs. Historical numbers remain in `historicalExampleNumber`. Current source titles, ranges, and references supply the worksheet identity. The new regression failed before this correction and passed after it. Supplemental independent review accepts these changes.

Final parent verification passes 115 curriculum tests in 28 files. App lint, a fresh build, and post-build standalone TypeScript pass. The parent inspected both original worksheet pages. The extracted lesson retains the original systems, complete contextual conditions, manual tasks, table, and displayed error work.

The final HEAD-compatible patch is `/tmp/im1-g34-parent-final-head.patch`. The earlier author patch is superseded by the parent corrections.

Parent logs: `/tmp/im1-g34-parent-metadata-red.log`, `/tmp/im1-g34-parent-final-tests.log`, `/tmp/im1-g34-parent-final-lint.log`, `/tmp/im1-g34-parent-final-build.log`, and `/tmp/im1-g34-parent-final-tsc.log`.

The new capabilities remain draft and inactive. This source repair does not supply source approval or usable Worked, Guided, and Independent practice for the six new capabilities.
