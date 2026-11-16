# Saved worktree b5f1 final preservation review

## Final verdict

ACCEPT removal after one final process check.

Branch `codex/preserve-saved-b5f1-im3-lesson14-dirty` now points to commit `e99a846fb2c4d3852b992d46fbe2fb0131cab035`. Its parent is the exact saved base, `106e1cb29e48540457732745c6335a31f6a47160`.

The commit changes exactly the 11 required paths. Each committed blob is byte-equal to the saved working file. Each committed mode is `100644`, and each saved mode is `0644`. The branch now preserves all unique authored content.

This preservation does not approve the candidate for integration. The later Lesson 1.4 recovery uses different source and runtime contracts.

## Complete state review

The worktree is `/Users/daniel.bodanske/.codex/worktrees/b5f1/ra-math-advantage`.

Its detached `HEAD` is `106e1cb29e48540457732745c6335a31f6a47160`.

Git reports 362 ordinary states:

- 122 modified paths
- 15 deleted paths
- 225 untracked paths

I checked `/tmp/saved-b5f1-b615-state-comparison.json` against the filesystem. I compared exact bytes, file modes, symbolic-link targets, and absent paths.

The exact whole-state groups are:

- 210 states match main, retained `02d6`, and retained `18ee`.
- 128 states match retained `02d6` and retained `18ee`.
- 12 states match main and retained `02d6`.
- 1 state matches retained `02d6`.
- 11 states have no whole-file match.

All 351 stated whole-file matches passed an independent byte, mode, link-target, or absence check.

## Preserved 11-path snapshot

The preservation commit contains these exact working files:

1. `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
2. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
3. `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
4. `apps/integrated-math-3/curriculum/skill-graph/edges.json`
5. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
6. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
7. `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
8. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
9. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
10. `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
11. `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

All 11 files use mode `0644`.

The narrow snapshot does not include the other 351 states. Those states already have exact retained copies or are tool artifacts.

## Unique semantic records

The nine JSON aggregate files combine retained records with one candidate slice. I compared record objects with current `HEAD`, main, retained `02d6`, retained `18ee`, and the existing IM3 preservation branches.

The unique slice contains:

- source node `math.im3.example.1.4.024` in the module, draft, canonical, edge-node, and standard-edge-node catalogs
- blueprint `math.im3.skill.1.4.solve-quadratic-equations-by-factoring` in the module and canonical blueprint catalogs
- three projected activities for that skill in the module and course activity maps
- one projected SRS row for that skill in the module and course activity maps
- the combined `pilot-projection.test.ts` regression
- the Measure plan that records the candidate and its blocked verification state

The candidate binds only Example `.024`. It supplies Worked, Guided, and Independent contracts for the existing factoring skill. It uses generator `quadratic-factoring` and renderer `step-by-step-solver`. Its plan keeps the source node and blueprint in draft state. The plan states that schema tests, lint, TypeScript, build, and manual workbench verification were blocked or pending.

The later branch `codex/preserve-saved-8d87-im3-lesson14` has a different Lesson 1.4 recovery. That later blueprint binds Examples `.019` through `.025`. It does not have the candidate Independent contract, generator field, grading specification, source equation sequence, or the same Guided contract. Thus, it does not preserve the b5f1 candidate exactly.

Other records in the combined files are preserved by current `HEAD` or these existing recovery branches:

- `codex/preserve-saved-4e21-im3-lesson11`
- `codex/preserve-saved-8d87-im3-lesson14`
- `codex/preserve-saved-8111-im3-lesson16-dirty`
- `codex/preserve-saved-61c4-im3-lesson18`
- `codex/preserve-0485-im3-lesson17`
- `codex/preserve-saved-2968-im3-lesson15`
- `codex/preserve-saved-68f8-im3-lesson12`
- `codex/preserve-saved-54ed-im3-projection-repair`
- `codex/preserve-saved-64b9-im3-example153-projection`

Object-level preservation of the retained records does not preserve the unique b5f1 candidate. The new commit preserves all 11 files as one historical snapshot. Do not integrate the combined aggregates directly.

## File modes, links, and ignored state

The 362 ordinary states contain:

- 324 regular files with mode `0644`
- 33 symbolic links with mode `0777` as reported by `lstat`
- 1 generated lock file with mode `0600`
- 4 absent paths

A full filesystem walk found 36 symbolic links. It found 33 skill links and 3 Python virtual-environment links. The three Python links are dependency artifacts. All symbolic-link targets are retained elsewhere.

The `0600` file is `apps/bus-math-v2/.vinext/dev/lock.json`. It is a generated artifact and has an exact retained copy.

Git reports one ignored file:

`node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json`

This file is generated Vitest cache output. It does not need preservation.

## History and process review

The detached tip `106e1cb29` is an ancestor of current main and the existing preservation branches. The worktree has no later local commit. Thus, no separate history reference is required for the detached tip.

`lsof +D` returned no open file in the worktree after the audit command exited. The process list showed no command that used the b5f1 path.

The parent must repeat a short process check immediately before eventual removal.

## Final removal conditions

The parent can remove b5f1 after one immediate process check. Keep branch `codex/preserve-saved-b5f1-im3-lesson14-dirty`. Keep retained worktrees `02d6` and `18ee` until their own cleanup reviews are complete.

The final verification found no open file with `lsof +D`. It found no process that used the b5f1 path. It independently rechecked all 351 retained state matches with bytes, modes, link targets, and absent paths.

I did not change the worktree, main, the Git index, references, or Git metadata.

## Parent removal

The parent repeated all 362 preservation checks and the final process check. The parent removed b5f1. Commit `e99a846fb2c4d3852b992d46fbe2fb0131cab035` remains on `codex/preserve-saved-b5f1-im3-lesson14-dirty`. Six saved worktrees remain. No preserved content is approved by this cleanup.
