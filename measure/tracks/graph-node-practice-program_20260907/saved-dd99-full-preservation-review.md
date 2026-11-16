# Saved worktree dd99 preservation review

## Decision

The saved worktree is eligible for removal after root review.

Path: `/Users/daniel.bodanske/.codex/worktrees/dd99/ra-math-advantage`

The expanded inventory contains 360 changed or untracked file paths.

- 219 paths match current main working bytes exactly.
- 128 paths match retained sibling worktree `02d6` exactly.
- 4 paths are deletions.
- 9 paths have unique bytes.

No non-generated ignored path is present. Ignored content is dependency, build, coverage, or tool output.

## Unique path dispositions

### Discard the superseded Lesson 1-5 candidate

- `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-5-9.test.ts`
- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`

The unique test and graph files implement only Example 1-5-9 as three executable modes. They include Independent practice and generated activity rows.

The later accepted Lesson 1-5 reconciliation is commit `db2f3a19b`. It reviews all ten existing Lesson 1-5 source examples as one unit. It adds exact PDF references and source text. It permits draft Worked and Guided blueprints for the two owned skills. It keeps Independent practice unavailable because the generator is a pilot stub and no server grader exists for completing-the-square step answers.

The saved candidate conflicts with that accepted Independent-practice boundary. Its narrow one-example test also does not replace the accepted full Lesson 1-5 reconciliation test. Do not preserve these seven unique files.

### Discard stale Measure state

- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

These are in-progress August snapshots. Current main has later accepted source reconciliation and track state. The saved copies describe the superseded one-example candidate and old gate results. Do not restore them.

## Exact deletion accounting

The four deletions do not contain unique file bytes in `dd99`.

- `apps/bus-math-v2/app/(dev)/blueprint-qa/actions.ts`: absent from current main working tree; present in committed main `HEAD`.
- `apps/bus-math-v2/app/(dev)/blueprint-qa/components/NodeList.tsx`: absent from current main working tree; present in committed main `HEAD`.
- `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`: present in current main working tree and committed main `HEAD`.
- `apps/pre-calculus/convex/learning-evidence.ts`: absent from current main working tree and absent from committed main `HEAD`.

The first two committed versions remain recoverable from `HEAD`. The route test is already restored in main. The deleted Precalculus module has no content in this worktree to preserve.

## Other path preservation

Retained sibling `02d6` preserves all 128 sibling-only byte versions found by this comparison.

Current main working files preserve the other 219 byte versions. This comparison used current working bytes because main contains active uncommitted work.

The expanded untracked review includes 226 untracked files. Untracked app tests, routes, components, skills, track documents, and tool configuration are included in the byte comparison above. Generated dependency and build directories do not contain separate authored work for this decision.

## Reachable history and activity

The nine unique byte versions do not occur as exact reachable Git blobs. Their useful source meaning is present in the later accepted Lesson 1-5 reconciliation and current Measure records. Their conflicting executable state must not be restored.

No live agent reports using worktree `dd99`.

I did not delete, copy, edit, commit, or change Git metadata.

## Parent verification and removal

The parent independently compared all 360 paths, including symlink targets and executable-file modes. It confirmed 219 exact main states, 128 exact states in retained 02d6, four deletions, and nine unique states. The ignored-file scan is empty. The saved HEAD is an ancestor of current HEAD.

The parent inspected the saved test and current Lesson 1.5 blueprints. Current main retains the exact Example 9 source identity and page 37 reference. Both reviewed skills have Worked and Guided modes and no Independent specification. The saved test instead requires an unsupported Independent equation and three executable modes. The parent accepts the independent rejection of that stale state.

The parent removed dd99. The other 20 saved worktrees remain intact. Keep 02d6 until its 128 preserved states receive a separate review.
