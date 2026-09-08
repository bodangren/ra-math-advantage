# Saved worktree 8111 and 8d87 preservation review

## Verdict

Parent cleanup is complete for worktree `8d87`. Keep worktree `8111`.

Worktree `8111` contains useful uncommitted Lesson 1.6 recovery work. Current committed `HEAD` does not contain its quadratic-formula blueprint, exact PDF source reference, projections, or two focused tests. A reference to the worktree `HEAD` does not preserve these dirty files.

Worktree `8d87` is safe to remove after the parent preserves its tip commit and confirms that no process uses its links. No reference contains its two recovery commits. Every object in its unique dirty combined blueprint has an exact preserved source.

## Complete state counts

- `8111` is at `106e1cb29e48540457732745c6335a31f6a47160`.
- It has 365 ordinary states: 138 tracked states and 227 untracked files.
- `8d87` is at `0d0d378d76d9`.
- It has 361 ordinary states: 132 tracked states and 229 untracked files.
- Git reports no separate ignored states in either worktree.
- I checked regular-file modes, deleted states, and symbolic-link targets.
- The authored files have normal non-executable modes.
- The `.claude/skills/*` links and curriculum virtual-environment links are tool or dependency artifacts.
- Most states match retained worktree `02d6`, retained worktree `18ee`, or the main working tree byte for byte.

## Exact 8111 unique path inventory

These 14 paths do not match the current main working tree or either retained worktree byte for byte:

1. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
2. `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
3. `apps/integrated-math-3/curriculum/skill-graph/edges.json`
4. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
5. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
6. `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
7. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
8. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
9. `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
10. `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
11. `apps/integrated-math-3/__tests__/components/activities/algebraic/StepByStepSolverActivity-example-1-6-3.test.tsx`
12. `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-6-3-projection.test.ts`
13. `measure/tracks.md`
14. `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

### Lesson 1.6 committed-state distinction

Current committed `HEAD` has the existing Lesson 1.6 source and skill IDs. It does not contain the recovered executable state:

- The quadratic-formula skill has no blueprint in committed `module-1/blueprints.json`.
- Source `.038` in committed `module-1/nodes.json` lacks the exact PDF page 44 source reference.
- Neither focused `example-1-6-3` test exists in committed `HEAD`.
- The three projected quadratic-formula modes from the saved blueprint are absent from committed projections.

The saved state binds only `math.im3.example.1.6.038` to `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`. It uses generator `quadratic-formula`. It supplies distinct Worked, Guided, and Independent `step-by-step-solver` modes. The focused projection test checks those three modes, exact source isolation, schema-valid props, the existing prerequisite, and SRS generator readiness. The renderer test checks the completed Worked display, Guided scaffold, and unscaffolded Independent interaction.

This is useful uncommitted recovery work. It is not a rejected duplicate that can be discarded from ID presence alone. It requires a later bounded review against the source PDF and current graph contracts before integration.

Detached commits `b8e5b867d` and `571b1c9a3` contain an earlier three-path Lesson 1.6 reconciliation and its Measure record. No branch or tag contains them. Those commits preserve the core module blueprint and node recovery, but they do not preserve the two untracked focused tests or all ten dirty catalog and projection snapshots. Preserve the dirty 14-path state as a narrow patch or equivalent commit before removal. Preserve the detached tip `571b1c9a3` if its historical Measure record is required.

## Exact 8d87 unique path inventory

These six paths do not match the current main working tree or either retained worktree byte for byte:

1. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
2. `tmp/pdfs/im3-m1-l4-page-27.png`
3. `tmp/pdfs/im3-m1-l4-page-28.png`
4. `tmp/pdfs/im3-m1-l4-page-29.png`
5. `tmp/pdfs/im3-m1-l4-page-30.png`
6. `tmp/pdfs/im3-m1-l4-pages-27-30.txt`

### Lesson 1.4 committed-state distinction

Current committed `HEAD` contains the Lesson 1.4 IDs. It does not contain the recovered exact records:

- The saved source nodes add exact PDF page 27 through 30 references, corrected titles, and prompt-specific `rawText`.
- The saved factoring blueprint binds Examples `.019` through `.025` and provides real Worked and Guided specifications.
- The saved state adds the distinct special-factor-pattern blueprint. That blueprint is absent from committed `HEAD`.
- The committed factoring blueprint still has its older source binding, placeholder specifications, and generator exception.

Commit `36d55e57e` contains the three-path Lesson 1.4 recovery. Commit `0d0d378d76d9` records its Measure completion. Neither commit is an ancestor of current `HEAD`. No branch or tag contains either commit. A preservation reference at `0d0d378d76d9` preserves both commits.

The dirty module blueprint contains seven objects. Six objects are byte-equivalent as parsed objects to commit `0d0d378d76d9`. These six include both Lesson 1.4 blueprint objects. The only object that differs from the commit is `math.im3.skill.1.1.graph-quadratic-functions`. That exact object exists in retained worktrees `02d6` and `18ee`. Therefore, the dirty combined blueprint has complete object-level preservation after the parent creates a reference at `0d0d378d76d9`.

The five temporary page images and text extraction are reproducible evidence from the committed source PDF. They do not require independent preservation after the recovery commits and review findings are retained.

## Cleanup conditions

1. Preserve the complete 8111 14-path dirty state before removal. A narrow patch or commit is sufficient.
2. Preserve detached Lesson 1.6 history through `571b1c9a3` if the Measure history is required.
3. Create a preservation reference at `0d0d378d76d9` before removal of `8d87`.
4. Confirm that retained worktrees `02d6` and `18ee` still contain the exact graph-quadratic-functions object.
5. Confirm that no process uses dependency links in either directory.
6. Keep retained worktrees `02d6` and `18ee` unchanged.

I made no source change, reference change, archive, or deletion.

## Parent cleanup result

The parent rechecked all 361 working states. Each previously matched state still has a retained copy. All seven blueprint objects have exact preserved copies. No process had a working directory in `8d87`. Branch `codex/preserve-saved-8d87-im3-lesson14` preserves commit `0d0d378d76d9aef18a7632179b5faa58f2aac920` and its parent recovery commit. The parent removed the directory without following symbolic links and pruned its worktree record. Nine saved worktrees remain. Worktree `8111` remains intact.
