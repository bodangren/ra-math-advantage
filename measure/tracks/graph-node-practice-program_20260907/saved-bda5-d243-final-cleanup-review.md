# Saved bda5 and d243 preservation review

## Verdict

Both worktrees are safe to remove. The two unreviewed preservation snapshots contain every unique path from `/tmp/saved-bda5-d243-state-comparison.json`.

Both saved worktrees use commit `106e1cb29e48540457732745c6335a31f6a47160`. This commit is an ancestor of current `HEAD`. The base history needs no new reference.

## bda5

The audit found 361 working states. Existing retained trees and 13 preservation branches contain 351 exact states. Preserve these 10 unmatched paths:

- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-4-3-alignment.test.ts`
- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

This is an unreviewed Lesson 1.4 Example 3 factoring proposal. It adds PDF page 31, three solver modes, and generated projections. It also marks the factoring SRS row generator-ready. Do not integrate the whole saved graph. Review the PDF, exact prompt, generated activities, approval state, and readiness boundary in a later bounded task.

## d243

The audit found 361 working states. Existing retained trees and preservation branches contain 350 exact states. Preserve these 11 unmatched paths:

- `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`
- `tmp/pdfs/im3-module-1-page-52.png`

This is an unreviewed Lesson 1.7 Example 2 quadratic-inequality proposal. It corrects the example title and adds PDF page 52. The saved SRS row duplicates both standard IDs and marks the draft generator ready. Preserve it as recovery evidence. Do not integrate the complete state.

## Filesystem and process checks

Each worktree has zero ignored states and 36 links. The `.claude/skills` links point to their relative `.agents/skills` targets. The three curriculum virtual-environment Python links point to the local Python runtime. These dependency links need no snapshot. The comparison includes modified, deleted, and untracked files. It compares file bytes and executable modes. No active process used either worktree during the final check.

## Minimum preservation

Branch `codex/preserve-saved-bda5-dirty` at `e1f0b8b879beeb4c97f534315df39c52c8671a5b` preserves the exact 10 bda5 paths. Branch `codex/preserve-saved-d243-dirty` at `727d2bf226b65a5945d750f490d4830a1bfbe790` preserves the exact 11 d243 paths. Each commit has parent `106e1cb29e48540457732745c6335a31f6a47160`. Each commit path set, blob, and file mode matches its saved worktree. Retained sources contain all other states. Both worktrees are safe to remove. Keep `02d6` and `18ee`.

## Parent removal

The parent rechecked all 722 states. The recovery commits preserve 21 unique files. Retained directories preserve the other 701 states. No ignored file or active process remained. The parent removed both saved directories and pruned their Git worktree records. Only saved worktrees `02d6` and `18ee` remain. Both recovery branches remain intact.
