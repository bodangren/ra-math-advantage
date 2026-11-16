# Saved worktree 32fb full preservation review

## Result

No remaining content needs integration before removal of this saved worktree.

Saved worktree: `/Users/daniel.bodanske/.codex/worktrees/32fb/ra-math-advantage`

Saved HEAD: `106e1cb29e48540457732745c6335a31f6a47160`

Comparison target: committed current main and current main working files on 2026-09-08.

This review does not remove the worktree.

## Method

I expanded all untracked paths. I compared each of the 360 dirty paths with current main. I also checked whether each different file byte state exists in reachable Git history. I scanned ignored paths separately. Git reported no ignored path in this worktree.

I compared the nine byte-unique authored states with 12 other saved worktrees at the same saved HEAD. None of the nine states is an exact sibling copy. I used that result only to establish uniqueness. I reviewed the source and current semantic state separately.

## Complete inventory

| Classification | Count |
| --- | ---: |
| Exact current-main file state | 186 |
| Different current-main state preserved as a reachable Git object | 128 |
| Unique plugin-link or installed-skill state | 33 |
| Byte-unique authored project states reviewed below | 9 |
| Tracked deletions reviewed below | 4 |
| Total | 360 |

The 186 exact states already exist in current main. They include implementation, tests, plans, generated files, and output files.

The 128 reachable states are older implementation, test, plan, and output versions. Git history preserves their exact bytes. Current main contains later states where the paths still exist.

The 33 unique `.claude/skills/*` entries are plugin links. The corresponding installed skill layout exists outside this saved worktree. These links are dependency state. They are not unique project source.

## Tracked deletions

The saved worktree deletes these four paths:

- `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`
- `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`
- `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`
- `apps/pre-calculus/convex/learning-evidence.ts`

Current main also deletes the two Business Math files and `apps/pre-calculus/convex/learning-evidence.ts`. Their deletion state is preserved.

Current main restores and updates the Precalculus route test. The saved deletion is superseded. Git history preserves its earlier content.

## Nine byte-unique authored states

### Six Integrated Math 3 graph and projection files

The six paths are:

1. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
2. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
3. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
4. `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
5. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
6. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`

These files contain two saved candidate changes.

The first change revises the Lesson 1.1 graph-quadratic blueprint. The current remediation track later narrowed this skill to graphing a quadratic from a table and stating domain and range. Current main preserves the exact Example 1 source identity. It also contains later capabilities for the other Lesson 1.1 responses. The saved blueprint still combines broad key-feature Guided and Independent evidence. It is superseded. This agrees with the prior 54d1 reconciliation review.

The second change revises `math.im3.example.1.4.025`, printed Example 7, and the broad Lesson 1.4 factoring blueprint. The saved node correctly identifies `Example 7: Complex Solutions`, PDF page 30, and the prompt `Solve x^2 = -144 by factoring. Check your solution.` Current main preserves all of these source facts. Its raw text is more complete because it includes the full source solution and capability boundary.

The saved factoring blueprint binds the broad factoring skill only to Example 7. It replaces the full source set with one complex-solution example. It also adds Guided and Independent equations that are not the printed Example 7. The Independent equation `x^2 - 169 = 0` is authored supplied-input practice, but this saved state does not establish a reviewed source or approval boundary for it.

Current main completed the later Lesson 1-4 reconciliation. The current blueprint binds the factoring skill to all seven exact Lesson 1.4 example identities. It uses reviewed source-faithful Worked and Guided contracts. The track plan assigns all seven PDF-page examples and both Lesson 1.4 skills. The saved Example 7-only graph and its projections therefore conflict with the current source ownership.

Decision: Do not integrate any of the six files. Current main preserves the valid Example 7 source correction. The remaining saved graph and projection content is superseded.

### Unique Example 7 test

Path: `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-4-7.test.ts`.

This test protects the same saved candidate. It requires the broad factoring blueprint to contain only Example 7. It also requires three projected modes, including the unreviewed Independent equation. Those requirements conflict with the later seven-example Lesson 1-4 source mapping.

Current main has `lesson-1-4-reconciliation.test.ts`. That test checks all seven exact source examples, their titles, prompts, pages, and accepted blueprint mapping. It includes the valid Example 7 title and prompt.

Decision: Do not integrate the saved test. Its valid source assertions already have later coverage. Its single-source and Independent-mode assertions are superseded.

### `measure/tracks.md`

The saved registry records the remediation status as of 2026-08-25. Current main retains the remediation track and the superseded rollout decisions. It adds the later graph reviews, Module 1 reconciliation, runtime work, and current active tracks.

The saved status claims that Example 1-4-7 has three exact projection rows and that focused commands are blocked by missing executables. Those claims describe the older saved candidate and are no longer current.

Decision: Do not integrate this registry state.

### Remediation plan

Path: `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`.

The saved plan is an early 98-line work plan. Current main has the complete later plan. It records the accepted Module 1 source review, exact lesson reconciliation tasks, runtime work, and verification. It explicitly assigns Lesson 1.4 ownership to all seven examples on PDF pages 27 through 30 and to the two exact Lesson 1.4 skills.

The saved plan also contains old zero-valid-projection counts, old standing failure totals, old worker rules, and the incomplete Example 1-4-7 candidate status. These statements are historical. They are not current instructions or current evidence.

Decision: Do not integrate the saved plan.

## Other dirty and untracked content

All remaining dirty and untracked paths are one of these states:

- exact current-main content;
- a reachable earlier Git object;
- generated build or type output;
- source-inspection image output;
- review-deck output and screenshots;
- installed skill or plugin-link state.

No remaining path contains unique current project source that requires integration.

## Removal recommendation

The valid unique finding is the Example 7 source correction. Current main already preserves it with a more complete source record and the later Lesson 1-4 reconciliation.

Do not copy the saved graph catalogs, projections, Example 7 test, track registry, or remediation plan. Do not copy the whole worktree.

The saved worktree can be removed after parent review. This report does not remove it.

## Parent decision

The parent confirms that current main retains the exact Example 7 title, PDF page, prompt, and a more complete solution. The saved broad factoring blueprint uses only Example 7. Current main preserves all seven source identities. The parent accepts the independent semantic rejection of the saved graph and test. The final inventory still has 360 paths. The ignored-file check is empty. The saved HEAD is an ancestor of current HEAD.

The parent removed worktree 32fb. The other 22 saved worktrees remain intact.
