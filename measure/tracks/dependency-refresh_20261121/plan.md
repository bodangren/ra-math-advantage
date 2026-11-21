# Implementation Plan: Dependency Refresh

Track: `dependency-refresh_20261121`. Type: chore. Lane: light. Priority: PM P2.
Specification: [spec.md](./spec.md).
Workflow: `measure/workflow.md`.

## Start and Scope Rules

- Track creation does not start implementation.
- Complete the separate spec review before implementation.
- Start Green only after `openrouter-sdk-ai-layer_20261114` S1 acceptance.
- Record the accepted S1 commit in `evidence.md`.
- Keep `measure/gates.json` unchanged until the orchestrator hands over the active phase.
- Coordinate lockfile ownership with later OpenRouter phases through the PM.
- Treat this assignment as approval for this track's dependency changes.
- Make one commit for each task, with a Git note.
- Keep task status and commit references current.
- Push only during the closeout task.

## Files That Stay Unstaged

- `apps/bus-math-v2/lib/workbooks-manifest.json`
- `apps/integrated-math-1/.next/types/routes.d.ts`
- `apps/integrated-math-2/.next/types/routes.d.ts`
- `apps/integrated-math-3/.next/types/routes.d.ts`
- `apps/pre-calculus/.next/types/routes.d.ts`
- `measure/generated/routes.md`

Do not restore another track's changes.
Record generator defects in this track's evidence without expanding the repair scope.
The shared debt registry already has 50 lines.

## Gate Commands for Each Phase

`gates.sh` records commands and raw exits; it does not approve baseline failures.
Run one group at a time from the repository root:

```bash
bash measure/tracks/dependency-refresh_20261121/gates.sh format <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh lint <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh typecheck <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh test <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh build <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh support <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh docs <label>
```

Labels: `d1-baseline`, `d1-green`, `d2-baseline`, and `d2-green`.
Use a new suffix for a retry; preserve earlier logs.
The script calls `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh` for each job.
Do not wrap the whole group in a second heavy job.
No group stops after the first failed workspace.

Compare every command against its phase baseline by the keys in `test-strategy.md`.
Record `NEWFAIL=<n>` only after the comparison.
`NEWFAIL=0` means no new failure; it does not mean every command passed.
Reject a missing command, missing log, or incomplete workspace set.
Resolve infrastructure failures before acceptance.

The initial outdated inventory contains six package names and 32 workspace entries.
See `evidence.md` for versions, affected workspaces, and the report's coverage limits.
Refresh the full root and app inventory before selecting updates.

## Phase D1: Fix the critical and high advisories

Due: 2026-11-23. Green depends on accepted OpenRouter S1.

- [ ] Task: D1 Red — record the audit and compatibility baseline
    - [ ] Record the phase base commit and the accepted S1 commit.
    - [ ] Capture `npm audit --json`, including all severities and advisory identifiers.
    - [ ] Run `npm audit --audit-level=high` through `heavy-run.sh`.
    - [ ] Confirm exit 1 comes from critical or high advisories, not an infrastructure error.
    - [ ] If the audit already passes, record the changed baseline instead of manufacturing a failure.
    - [ ] Refresh the outdated inventory for the root, six apps, and 20 packages.
    - [ ] Run every gate group with label `d1-baseline`.
    - [ ] Record exact baseline keys, including the standing failures in `test-strategy.md`.
    - [ ] Record both bundle results and report every budget failure to the PM.
    - [ ] Commit the Red evidence before Green changes.
- [ ] Task: D1 Green — update the vulnerable dependency chains
    - [ ] Confirm the start gate and exclusive lockfile ownership.
    - [ ] Read each affected package declaration and its real dependency path.
    - [ ] Update fixed parents first: Wrangler, Cloudflare Vite plugin, Miniflare parents, tsx, and other affected parents.
    - [ ] Check brace-expansion, browserslist, fast-uri, sharp, undici, and ws after each relevant update.
    - [ ] Use a root override only when the parent has no fixed release.
    - [ ] Record the reason and compatibility proof for each override.
    - [ ] Make only required compatibility edits.
    - [ ] Add a behavior test first if a compatibility edit changes behavior.
    - [ ] Run the audit gate again and record each unresolved critical or high finding.
    - [ ] Keep the selected SDK version compatible with the S1 tests and workerd probe.
- [ ] Task: D1 Verify — compare the complete gate results
    - [ ] Run every gate group with label `d1-green`.
    - [ ] Compare each result with `d1-baseline` by diagnostic key.
    - [ ] Record `NEWFAIL`, audit counts, selected versions, and log paths in `evidence.md`.
    - [ ] Stop for a new failure key or an infrastructure failure.
    - [ ] Stop for a new budget failure or an unapproved size increase.
    - [ ] Report the standing BM2 budget failure before acceptance.
    - [ ] Keep every budget and manual deploy trigger unchanged.
    - [ ] Report each unresolved critical or high finding to the PM by 2026-11-23.
- [ ] Task: Measure - User Manual Verification 'Phase D1: Fix the critical and high advisories'
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the audit result, baseline exceptions, and bundle report to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.

## Phase D2: Update the remaining packages

Due: 2026-11-25. Depends on D1 acceptance.

- [ ] Task: D2 Red — refresh the remaining update baseline
    - [ ] Record the phase base commit.
    - [ ] Refresh the audit and outdated reports for every declared external package.
    - [ ] Record an attempted latest version for each outdated package.
    - [ ] Run every gate group with label `d2-baseline`.
    - [ ] Record unchanged baseline keys and bundle results.
    - [ ] Use outdated entries as the update target, not an artificial failing unit test.
    - [ ] Add a failing regression test only for a real behavior that requires a compatibility edit.
- [ ] Task: D2 Green — select the latest working versions
    - [ ] Update remaining dependencies in small related groups.
    - [ ] Try each latest stable major, including the Vitest and Node type candidates.
    - [ ] Keep Vitest and its coverage provider compatible.
    - [ ] Check Node types against the existing Node 24 runtime.
    - [ ] Keep the accepted S1 tests and local workerd probe passing.
    - [ ] Retain the working version when a breaking major fails.
    - [ ] Record each failed candidate and its exact failing gate.
    - [ ] Inspect the fflate, KaTeX, and PostCSS selector-parser chains for safe parent fixes.
    - [ ] Reject forced downgrades and unexplained overrides.
    - [ ] Update the stack document before a deliberate stack change.
- [ ] Task: D2 Verify — finish the dependency and advisory reports
    - [ ] Run every gate group with label `d2-green`.
    - [ ] Compare each result with `d2-baseline` by diagnostic key.
    - [ ] Confirm no critical or high finding returned without a named exception.
    - [ ] Record final current and latest versions for every deferred update.
    - [ ] End `evidence.md` with every remaining moderate or low advisory and its supported reason.
    - [ ] Record `NEWFAIL`, the bundle report, and all baseline exceptions.
    - [ ] Verify manual deploy triggers and unchanged budgets with a Git diff.
    - [ ] Verify that the six generated files remain unstaged.
- [ ] Task: Measure - User Manual Verification 'Phase D2: Update the remaining packages'
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the final versions, exceptions, and advisory table to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.

## Closeout

- [ ] Task: Close the track and synchronize with origin
    - [ ] Complete final acceptance before archive changes.
    - [ ] Update the registry and archive through the Measure closeout workflow.
    - [ ] Confirm that generated output and unrelated changes remain outside staged changes.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`.
    - [ ] Stop and report if the pull cannot fast-forward.
    - [ ] Recheck acceptance if the pull changes the accepted code.
    - [ ] Run `~/Desktop/advantage-pr/scripts/jobs/safe-push /home/daniebo/Desktop/ra-math-advantage --branch master`.
    - [ ] Stop and report a safe-push refusal without bypassing it.
    - [ ] Report the final commit and audit counts to the PM.
    - [ ] Close the assignment with a facts changed list.
