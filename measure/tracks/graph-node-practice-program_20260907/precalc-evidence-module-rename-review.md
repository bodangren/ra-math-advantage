# Precalculus Q35 rename review

## Disposition

The rename-only change is ready for parent integration.

The candidate renames `convex/learning-evidence.ts` to `convex/selectedLearningEvidence.ts`. The renamed file is byte-identical to the current main source file. The existing `convex/learningEvidence.ts` file is byte-identical between current main and the candidate.

I found two stale test mocks in the first candidate. They still supplied the invalid `learning-evidence` Convex module key. These mocks caused six route tests to return HTTP 500. I changed the candidate mocks to supply `selectedLearningEvidence`. I did not change production behavior.

## Reference checks

The production route now calls `internal.selectedLearningEvidence.submitRouted`.

The generated Convex API declaration imports `selectedLearningEvidence.js` and exports the `selectedLearningEvidence` module key. It no longer imports or exports the invalid hyphenated module name.

The selected direct imports and runtime-name assertions now use `selectedLearningEvidence`.

A source search found no active import or internal API reference to the old Convex module name. The remaining `learning-evidence` text belongs to package paths, URL paths, contract names, or negative tests. These uses are valid.

## Verification

The selected suite passed with 151 tests in 8 files. The suite includes production route, runtime reference, full student sequence, real-flow component, bounded authority, production flow, selected evidence, and selected writer-to-evidence tests.

The candidate lint passed with the current main `.oxlintrc.json`. The isolated candidate does not contain that root configuration file, so the package `npm run lint` command cannot locate it by itself.

The candidate build passed. The first post-build TypeScript run failed because the isolated candidate did not contain the referenced BM2 `RendererPreview` source and its two local dependencies. I copied those unchanged current-main files into the disposable candidate only. The next `tsc --noEmit` run passed. These files are not in the rename patch.

`git apply --check /tmp/precalc-q35-rename-only.patch` passed against the current main worktree.

## Patch scope

The patch contains one 100% rename, the production route reference, the generated API declaration, and eight affected tests. It has 18 inserted lines and 18 removed lines across 11 paths.

The patch excludes build output, local configuration, environment files, approval fixtures, and disposable candidate dependencies.

Patch: `/tmp/precalc-q35-rename-only.patch`
