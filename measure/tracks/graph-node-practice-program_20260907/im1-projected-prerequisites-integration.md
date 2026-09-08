# G52 projected prerequisite repair report

The candidate is `/tmp/im1-g50-source-head-20260908.140ok6_u`.

The base is `2bfeb9796`. The full-base binary patch is `/tmp/im1-g52-final.patch`. The six paths are in `/tmp/im1-g52-paths.txt`.

The repair removes 14 stale lesson-sequence prerequisite pairs from both saved SRS projections. The removed pairs came from edge IDs 1235 through 1241 and 1270 through 1276. No matching canonical edge supports them.

The repair preserves `math.im1.g47.prerequisite.001`. It changes the canonical edge type from `prerequisite` to the projector contract type `prerequisite_for`. The rationale and endpoints do not change. The valid median-to-five-number-summary pair remains in both projections.

The existing `projectSrsInputs` contract selects direct, non-rejected `prerequisite_for` edges. The saved projections now contain the same 66 direct pairs as the canonical catalog. The repair does not use transitive reachability.

The new behavioral regression compares both projection pair sets with the direct canonical pair set. It accepts both canonical prerequisite type names for audit visibility. It also checks all 14 stale pairs, the retained valid pair, and the normalized canonical edge type. Two existing Lesson 9-1 and Lesson 9-4 tests now use the projector contract type.

Verification passed:

- Focused prerequisite and affected lesson tests: 3 files and 22 tests.
- Full curriculum and seed suite: 65 files and 389 tests.
- Math-content knowledge-space suite: 47 tests.
- Integrated Math 1 lint.
- Integrated Math 1 build.
- Standalone TypeScript with `--noEmit --incremental false`.
- Full patch whitespace check.
- All 21 `@math-platform` dependencies resolve to candidate package directories.

No node, edge, skill, blueprint, approval, or readiness count changes. No source, dependency, hash, manifest, main-worktree, or deployment change is present. The candidate is frozen.

## Parent verification

The parent verified all six staged paths against the frozen candidate. All 389 curriculum and seed tests pass. Lint, build, and post-build standalone TypeScript pass. Independent review accepts the exact 66-pair equality and the valid preserved relationship.
