# Saved worktree 2711 preservation review

## Decision

The saved worktree is eligible for removal after root review.

Path: `/Users/daniel.bodanske/.codex/worktrees/2711/ra-math-advantage`

The worktree has 360 changed or untracked file paths after untracked directories are expanded.

- 219 paths match current main bytes exactly.
- 127 paths match another saved worktree exactly.
- 4 tracked deletions are reviewed below.
- 10 paths have unique bytes.

No non-generated ignored path is present. Ignored content is dependency, build, coverage, or tool output.

## Unique path dispositions

### Discard as an obsolete IM3 Lesson 1-8 proposal

These seven files form one old proposal. They add a runnable `graph_system` projection for `math.im3.skill.1.8.solve-systems-of-two-quadratic-equations` and tests for that projection.

- `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`

The later accepted Lesson 1-8 reconciliation is commit `0b5392a36`. It preserves Example 1-8-7 as source-backed draft content. It keeps Worked, Guided, and Independent modes unavailable because the exact wrapper, schema, generator, and server grader do not support the system method. The saved proposal conflicts with that accepted boundary. Do not preserve or restore these seven unique bytes.

The added PDF page reference is already preserved by the accepted reconciliation. The unique node-file variants are stale intermediate forms.

### Discard as stale Measure state

- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

These files contain an August 2026 in-progress registry and remediation record. Current main has the later accepted program state. The saved files mix historical gate results, superseded track statements, and the rejected runnable Lesson 1-8 proposal. Their useful decisions are present in current Measure records and reachable commits. Do not restore these two files.

### Discard as reproducible source-review output

- `tmp/pdfs/im3-module-1-page-62-62.png`

This is a 1425 by 1782 PNG render of committed IM3 Module 1 PDF page 62. It is a temporary review image. The committed PDF remains the source. The accepted graph rows cite that PDF page. The PNG does not contain unique authored work that requires preservation.

## Other paths

The other 350 paths need no copy:

- The 219 current-main matches are already preserved in main.
- The 127 sibling matches remain preserved in other saved worktrees.
- Three deletion states also exist in current main. The fourth, the Precalculus evidence route test, is restored and updated in main. Its saved deletion is superseded.

The large untracked trees under app build directories, dependency directories, `outputs/`, and most of `tmp/` are generated or copied artifacts. They do not change the decision.

## Reachable-history check

None of the ten unique byte versions is an exact reachable Git blob. This does not require preservation because semantic review rejects or supersedes nine authored variants, and the remaining PNG is reproducible from the committed source PDF.

## Activity check

The live agent list does not show a task that uses worktree `2711`.

I did not delete, copy, edit, commit, or change Git metadata.

## Parent verification and removal

The parent independently checked all 360 expanded paths. The counts are 219 exact main copies, 127 exact copies in retained sibling 18ee, four deletions, and ten unique paths. No ignored path is present. The saved HEAD is an ancestor of current HEAD.

The two Business Math blueprint-QA files and Precalculus convex/learning-evidence.ts are also deleted in main. Main restores the Precalculus evidence route test. The original report incorrectly said all four files remain present; this record corrects that statement.

The parent verified the current main Lesson 1.8 blueprint has an empty renderer mode map and no executable specs or grader. It preserves the three quadratic-system source identities. Current main also preserves Example 7 and its page 62 reference. Reachable commit `0b5392a36` records that accepted reconciliation; it is not an ancestor of the current branch. The current working files preserve its applicable source and capability state.

The parent removed worktree 2711. The other 21 saved worktrees remain intact. In particular, 18ee retains the 127 sibling-matched states. Do not remove 18ee without a separate preservation review.
