# Saved b73d and bc11 preservation review

## Verdict

Both worktrees are safe to remove. Both worktrees use reachable commit `106e1cb29e48540457732745c6335a31f6a47160`, which is an ancestor of current `HEAD`. Their detached base history needs no new reference. Their dirty IM3 graph states are now preserved on `codex/preserve-saved-b73d-dirty` and `codex/preserve-saved-bc11-dirty`. Both snapshots are unreviewed. Do not integrate either snapshot as a complete graph state.

## b73d

The reference comparison identifies 11 unique whole-file states:

- `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`
- `packages/activity-components/src/__tests__/step-by-step-solver-quadratic-formula.test.tsx`
- `tmp/pdfs/im3-module-1-page-43-43.png`

The useful content is an unreviewed Lesson 1.6 quadratic-formula graph proposal and its projection tests. It adds PDF page 43 to Example 1 and supplies three static `step-by-step-solver` modes. This state conflicts with the newer accepted QF component, exact generator, private seed, and server-grading work. Preserve it only as recovery evidence. Review individual source references and prompt math before any later integration. The page image is extracted review evidence. It is not runtime source.

## bc11

The reference comparison identifies 12 unique whole-file states:

- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/edges.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
- `measure/tracks.md`
- `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-8-6.test.ts`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

The useful content is an unreviewed Lesson 1.8 Example 6 graph proposal and its focused test. It binds `math.im3.example.1.8.051` to PDF page 61 and projects three static solver modes for the existing quadratic-quadratic-system skill. The accepted Lesson 1.8 reconciliation is already committed in newer history, but this exact Example 6 proposal is a separate state. Preserve it for a later source review. Do not replace the committed Lesson 1.8 catalogs with these older whole files.

## Complete-state checks

The parent comparison covers tracked changes, deletions, and untracked files against the main working tree and retained `02d6` and `18ee` states. The 11-reference comparison isolates the unique whole-file states above. Other changed states have a matching retained copy. Tracked executable modes are unchanged. The `.claude/skills/*` entries are relative links to `.agents/skills/*`; their targets follow the duplicated installed-skill state. The curriculum virtual-environment links point to the local Python runtime. Both worktrees have zero ignored files. The full walk found 36 expected symbolic links in each worktree. Retained copies preserve all ordinary states outside the snapshot paths. No active process used either worktree during the final process check.

## Minimum preservation

The two unreviewed snapshot branches preserve all unique states. Commit `9b8064d8dd4c8c1b46fb33aeea275f76331bb3ca` preserves all 11 b73d paths. Commit `1a0de0c90433f23c72286423ca0869bef9a1d096` preserves all 12 bc11 paths. Each commit has parent `106e1cb29e48540457732745c6335a31f6a47160`. Every saved blob and mode matches its worktree. The parent full-state comparison found 350 of 361 b73d states and 351 of 363 bc11 states in retained sources. The branch snapshots preserve all remaining states. Both directories are safe to remove. Keep retained worktrees `02d6` and `18ee`.

## Parent removal

The parent rechecked all 724 states before removal. All 701 matching states have retained copies. The two recovery commits preserve the other 23 files. Final checks found no open files or active processes. The parent removed both directories and pruned their Git worktree records. Four saved worktrees remain: `02d6`, `18ee`, `bda5`, and `d243`. Both recovery branches remain.
