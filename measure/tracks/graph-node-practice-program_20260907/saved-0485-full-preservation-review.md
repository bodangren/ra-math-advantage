# Saved worktree 0485 preservation review

## Verdict

Do not remove this worktree yet.

One changed file has bytes that are not in the main working tree or either retained preservation sibling. The Git object exists in the shared object database, but no current ref makes the blob reachable.

Unique file:

- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`

The only verified preservation location for these exact bytes is saved worktree `0485`.

## Scope

- Worktree: `/Users/daniel.bodanske/.codex/worktrees/0485/ra-math-advantage`
- Worktree commit: `af58d7539c7171d01d5af78d5d37ff6e9de7aef0`
- Main working tree: `/Users/daniel.bodanske/Desktop/ra-math-advantage`
- Retained siblings: `02d6` and `18ee`

I expanded all tracked and untracked status entries. I compared exact file bytes and absent-file states. I also checked the shared Git object database and all current refs.

## Inventory

The worktree has 356 status entries:

- 117 modified files
- 15 deleted paths
- 224 untracked paths

The retained `02d6` worktree preserves 355 of the 356 exact states. The retained `18ee` worktree preserves 339 exact states. The main working tree preserves 222 exact states.

Most present file bytes also exist as Git objects. This fact alone does not make a blob reachable from a ref.

## Unique file review

The unique Module 1 blueprint file is a large earlier graph state. Its exact bytes differ from current main and both retained siblings. Its blob ID is `9a1a1f9051b77ae72178fd0734e179c11df56e37`. A scan of `git rev-list --objects --all` did not find this blob. Thus, no current Git ref preserves it.

The current main file contains a later and much larger blueprint reconciliation. The byte diff is 3,699 insertions and 231 deletions when main is compared with the saved file. This makes the saved file appear obsolete relative to the current accepted graph state. The byte comparison cannot prove that the old semantic state can be discarded.

Preserve worktree `0485` until root explicitly classifies this file as obsolete or copies the exact file to a separate preservation location.

## Deleted paths

The worktree has four effective file deletions in the compared status states:

- `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`
- `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`
- `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`
- `apps/pre-calculus/convex/learning-evidence.ts`

The main working tree and both siblings preserve the first, second, and fourth absent-file states as applicable. Both retained siblings preserve the deleted route-test state. No deletion state depends only on `0485`.

The other 11 `D` entries are old `.claude/skills` paths that are now symbolic links. The main working tree and retained siblings preserve those link states.

## Untracked and ignored files

All 224 untracked states match the main working tree, `02d6`, or `18ee`. No untracked file is unique to `0485`.

The ignored scan found only these two generated files:

- `apps/integrated-math-3/tsconfig.tsbuildinfo`
- `node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json`

These files do not require preservation.

## Removal condition

Removal is safe only after root resolves the unique Module 1 blueprint file. All other changed, deleted, untracked, and ignored states have an exact preservation location outside `0485`.

I did not edit or remove any worktree file or Git metadata.

## Semantic disposition of the unique aggregate

This section supersedes the earlier byte-only hold.

The unique file contains seven blueprint records. Current main contains all seven record IDs. Thus, `0485` has no missing blueprint record.

Two saved records are exactly equal to the corresponding current-main records:

- `math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables`
- `math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing`

The second record is not in current `HEAD`. Current main and retained sibling `02d6` preserve it. The accepted Lesson 1.7 reconciliation introduced these records under commit `8cf8e9400`.

Five saved records have later accepted field corrections in current main:

- `math.im3.skill.1.1.graph-quadratic-functions`: Current main keeps source `math.im3.example.1.1.001` and generator `quadratic-graph-analysis`. It replaces the alignment, grading, guided-practice, and independent-practice fields. Commit `c6fcf59f8` is the later Lesson 1.1 reconciliation.
- `math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change`: The saved record has no source examples and claims generator `average-rate-of-change`. Current main cites exact examples `.004`, `.005`, and `.006`. It removes the generator claim and corrects the renderer modes, alignment, worked example, guided practice, independent practice, and grading fields. Commit `c6fcf59f8` is the later Lesson 1.1 reconciliation.
- `math.im3.skill.1.2.solve-quadratic-equations-by-graphing`: The saved record incorrectly uses another skill as its source and claims generator `solve-quadratic-by-graphing`. Current main cites exact examples `.007` through `.011` and removes that generator claim. It also replaces the renderer modes and all activity and grading specifications. Commit `4e8eca97b` is the later Lesson 1.2 reconciliation.
- `math.im3.skill.1.4.solve-quadratic-equations-by-factoring`: The saved record uses the Lesson 1.2 skill as its source. Current main cites exact Lesson 1.4 examples `.019` through `.025`. It also replaces the worked and guided specifications and adds the reviewed exception. Commit `36d55e57e` is the later Lesson 1.4 reconciliation.
- `math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol`: The saved record uses the quadratic-formula skill as its source. Current main cites exact Lesson 1.6 examples `.039` and `.040`. It also replaces the worked and guided specifications. Commit `b8e5b867d` is the later Lesson 1.6 reconciliation.

Current main also contains 20 additional reconciled Module 1 blueprint records. The saved file predates those additions.

The saved aggregate therefore has no useful content that is absent from current main and retained sibling `02d6`. Its unique byte sequence combines five superseded records with two records that are preserved exactly elsewhere. The old generator claims do not have accepted source evidence in the later reconciliations.

## Final semantic verdict

The unique aggregate is obsolete. Worktree `0485` is safe to remove after root review. No content copy is necessary.

## Parent verification and removal

The parent compared all 356 states, including symbolic links and executable modes. Retained worktree 02d6 preserves 355 exact states. Main preserves 222 exact states. The parent inspected all seven unique-file records. Two match current main exactly. Five use the superseded sources or activity fields described above.

The saved HEAD is not an ancestor of main. Four Lesson 1.7 commits had no branch or tag reference. The parent preserved these commits in `codex/preserve-0485-im3-lesson17` at `af58d7539` before removal. This preserves committed work without retaining another checkout.

The parent removed worktree 0485. The other 19 saved Codex worktrees remain intact. Keep 02d6 until its preserved states receive a separate review.
