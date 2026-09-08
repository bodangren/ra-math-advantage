# Precalculus saved views final cleanup review

## Scope

I compared these archives with a clean `git archive` extraction of base `c808c365f`:

- `/tmp/precalc-saved-views-head-6_4_6dxd`
- `/tmp/precalc-saved-views-applied-20260908-2252`

I compared file bytes and symbolic-link targets. I excluded `node_modules` and generated build directories from authored-content classification. I inspected their links separately.

## Applied archive

The applied archive contains exactly the expected authored differences:

- Eight Q38 paths from `/tmp/precalc-saved-views-paths.txt`
- `apps/pre-calculus/app/layout.tsx` from Q39 commit `1fe8529a4`

The dashboard test is the one new Q38 file. The other seven Q38 files are modifications. The Q39 layout is one additional modification.

The applied archive has no authored omission. It has no unexplained authored addition or modification.

## Candidate archive

The candidate contains the same eight Q38 paths and the same Q39 layout change.

It also contains these generated files:

- `apps/pre-calculus/.wrangler/deploy/config.json`
- `apps/pre-calculus/next-env.d.ts`
- `apps/pre-calculus/tsconfig.tsbuildinfo`

The candidate omits 566 files under `apps/integrated-math-3/curriculum/.venv`. These files are a tracked local Python dependency environment in the base archive. They are not authored Q38 content. The Q38 patch does not contain their deletion.

No unique or unexplained authored file was found in the candidate.

## Dependency links

Both archives contain ignored dependency links used for verification. Many ordinary package links resolve to `/Users/daniel.bodanske/Desktop/ra-math-advantage/node_modules`. The candidate `@math-platform` links resolve to package directories inside the candidate. The applied archive copied those link entries for its focused test run.

Archive removal must unlink these entries only. Cleanup must not follow a symbolic link. Cleanup must not remove a resolved target outside the archive.

## Recommendation

Both archives are safe to remove after the parent verifies the committed Q38 and Q39 file bytes and completes browser verification. Remove only the two archive roots. Do not follow dependency links. Do not remove the shared dependency installation.

## Parent action

The parent verified all eight Q38 files against `ffca7ea29` and the layout against `1fe8529a4`. The saved-result browser checks passed. The parent removed the completed applied archive. Symbolic-link targets remain intact.

The author archive remains in use for Q40. Before reuse, its eight Q38 paths and Q39 layout matched the commits. The author refreshed it to `b976547b2` for the three-path brand-symbol correction. Do not remove that archive until Q40 is complete.
