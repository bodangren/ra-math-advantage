# Saved worktrees 02d6 and 18ee final preservation review

## Result

Both worktrees passed final preservation review and are now removed. The recovery commits preserve all sixteen unique file contents and both deletion states. Named branches also preserve the detached history and shared snapshot content.

The sections below record the initial findings, required snapshots, and final verification.

This review did not edit either worktree. It did not create a commit or change a reference.

The machine-readable comparison is `/tmp/saved-02d6-18ee-state-comparison.json`.

## Method

I expanded every tracked and untracked status entry. I compared regular-file bytes, file modes, symbolic-link targets, and absent states with current main and every object reachable from all Git references. The reachable set includes the 15 current `codex/preserve-*` branches.

I separately scanned ignored files. I checked saved HEAD ancestry and named references. I checked open files and running processes.

## Comparison summary

The parent main-only comparison found 222 of 360 states in 02d6 and 210 of 351 states in 18ee equal to main. Of the remaining states, this review found exact path, mode, and reachable-history matches for 132 states in 02d6 and 128 states in 18ee. The 02d6 page-24 render has an exact blob and mode match at a different retained path. Thus, 133 additional 02d6 contents and all 128 additional 18ee contents already have Git preservation.

## Worktree 02d6

Path: `/Users/daniel.bodanske/.codex/worktrees/02d6/ra-math-advantage`

Saved HEAD: `cbed74021adbc7cb2eafff036a9e609027950db6`.

The saved HEAD is not an ancestor of current main. No branch contains it. It has two commits after its merge base with main:

- `1fddbb08b` — `feat(im3): reconcile Lesson 1-3 candidate graph data`
- `cbed74021` — `measure(plan): complete Task M1-L3`

The expanded working state has 360 entries:

- 356 present states.
- 4 absent tracked states.
- 352 present states have an exact blob in current main or reachable Git history.
- 33 entries are symbolic links. Each link target has an exact retained match.
- No tracked mode changed.

Four present states are not reachable from any Git reference:

- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `tmp/pdfs/im3-l3/page-21.png`
- `tmp/pdfs/im3-l3/page-22.png`
- `tmp/pdfs/im3-l3/page-23.png`

The page-24 render has an exact blob and mode match at retained path `tmp/pdfs/im3-module-1-page-24.png`. The page-21, page-22, and page-23 contents have no reachable Git blob.

One historical deletion also needs explicit preservation: `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`. The other three absent states have retained deletion evidence.

Minimum preservation for 02d6:

- Create one commit that contains the four exact current file contents and modes listed above.
- Preserve the explicit deletion of `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`.
- Base that commit on saved HEAD `cbed74021adbc7cb2eafff036a9e609027950db6`.
- Create a named preservation branch at the new commit.

This five-path snapshot preserves all unique working-state content, the unique deletion, and both detached Lesson 1-3 commits.

## Worktree 18ee

Path: `/Users/daniel.bodanske/.codex/worktrees/18ee/ra-math-advantage`

Saved HEAD: `106e1cb29e48540457732745c6335a31f6a47160`.

The saved HEAD is an ancestor of current main and all 15 preservation branches. It needs no separate history reference.

The expanded working state has 351 entries:

- 347 present states.
- 4 absent tracked states.
- 335 present states have an exact blob in current main or reachable Git history.
- 33 entries are symbolic links. Each link target has an exact retained match.
- No tracked mode changed.

Twelve authored states are not reachable from any Git reference:

- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-3/curriculum/skill-graph/standard-edges.json`
- `apps/integrated-math-3/curriculum/skill-graph/__tests__/example-1-8-3-projection.test.ts`
- `measure/tracks.md`
- `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

All 12 files use mode `100644`.

One historical deletion also needs explicit preservation: `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`. The other three absent states have retained deletion evidence.

Minimum preservation for 18ee:

- Create one commit from saved HEAD `106e1cb29e48540457732745c6335a31f6a47160`.
- Include exactly the 12 files listed above with their current bytes and modes.
- Preserve the explicit deletion of `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/route.test.ts`.
- Create a named preservation branch at that commit.

The snapshot preserves the combined graph state for later semantic review. It does not approve or authorize integration of that state.

## Ignored and generated content

Worktree 02d6 has no ignored file.

Worktree 18ee has two ignored generated files:

- `node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json`
- `tsconfig.tsbuildinfo`

These files are test cache and TypeScript build output. They do not require preservation.

The untracked skill directories and `.claude/skills/*` links are installed dependency content. Their exact regular-file blobs or link targets are reachable in Git or match current main. The `.next`, `.vinext`, `outputs`, and `tmp` entries are generated output unless explicitly included in the unmatched lists above.

## Process check

`lsof +D` found no open file in either worktree. The process search found no persistent command that uses either path. The search command itself was the only transient match.

## Deletion condition

Do not delete either worktree before the two preservation branches exist. The two commits must preserve 16 exact file contents and two explicit deletion states across 18 snapshot paths. Their path sets, blobs, modes, deletion states, and parent commits must match this report. After that verification and one final process check, both worktrees are eligible for removal without reliance on another saved worktree.

## Final preservation verification

Verdict: ACCEPTED FOR CLEANUP.

The parent created both required preservation commits. I independently verified each commit against its saved worktree.

### 02d6

- Branch `codex/preserve-saved-02d6-final-dirty` points exactly to `99b3c2e7426e28f4dcfaf04e97ad7b9046b151aa`.
- The commit parent is exactly `cbed74021adbc7cb2eafff036a9e609027950db6`.
- The diff contains exactly the required five paths.
- All four file blobs and modes equal the 02d6 worktree.
- Each file uses mode `100644`.
- The Precalculus route test exists in the parent and is absent in the preservation commit. This proves the required deletion.

### 18ee

- Branch `codex/preserve-saved-18ee-final-dirty` points exactly to `d70c797d6658b1de682ceb8566fa183993459843`.
- The commit parent is exactly `106e1cb29e48540457732745c6335a31f6a47160`.
- The diff contains exactly the required 13 paths.
- All 12 file blobs and modes equal the 18ee worktree.
- Each file uses mode `100644`.
- The Precalculus route test exists in the parent and is absent in the preservation commit. This proves the required deletion.

The two branches preserve all 16 unique file contents, both deletion states, and the detached 02d6 history. The parent can run its final full-state and process checks, then remove both saved worktrees.

## Durable-reference verification

The first acceptance depended on temporary `refs/codex/snapshots/*` references for shared historical states. The parent stopped cleanup and created two durable branch references without copying content.

I verified the final durable state:

- `codex/preserve-shared-reference-files` points to existing snapshot commit `67522b0d0f78a31076c17b19abbcb1c3cd43ec57`.
- That commit preserves the 129 shared path, blob, and mode states selected in `/tmp/retained-reference-snapshot-coverage.json`.
- `codex/preserve-im3-lesson13-page24` points to existing snapshot commit `1c569648229d84ed5c3b89d06b519bfa1e803b28`.
- That commit preserves blob `552f889757dde2651e29809363fe2de5825e921b` with mode `100644` at retained path `tmp/pdfs/im3-module-1-page-24.png`.

I recomputed reachability from durable heads, tags, and remotes. All 356 present 02d6 states and all 347 present 18ee states now have durable blob preservation. No present state depends only on `refs/codex/snapshots/*`.

Final verdict: ACCEPTED FOR THE PARENT FULL-STATE AND PROCESS CHECK. The parent can remove both worktrees after that check passes.

## Parent removal

The parent checked all 711 ordinary states against the reviewed bytes, modes, links, deletions, and durable branch history. The full walk found 36 links in each directory: 33 installed skill links and three Python runtime links. The generated vinext lock files used mode `0600`; their content is preserved in Git, and no active process used either saved directory. The two ignored 18ee files are disposable test and TypeScript caches.

The final open-file and process checks passed. The parent removed both directories and pruned their Git worktree records. Only the main checkout remains registered. The active IM3 integration candidate remains separate. All recovery branches remain intact.
