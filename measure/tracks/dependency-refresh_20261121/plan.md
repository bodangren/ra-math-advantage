# Implementation Plan: Dependency Refresh

Track: `dependency-refresh_20261121`. Type: chore. Lane: light. Priority: PM P2.
Specification: [spec.md](./spec.md).
Workflow: `measure/workflow.md`.

## Spec Review Amendment

- [x] Apply the Round 1 decisions and verify the amended gate runner.
  This is planning work, not a dependency change or a phase acceptance.

## Start and Scope Rules

- Track creation does not start implementation.
- Complete the separate spec review before implementation.
- Use the definition of OpenRouter S1 acceptance in `spec.md`.
- Strategy and Red baseline capture may precede OpenRouter S1 acceptance; Green may not.
- Record the S1 checkpoint and passing phase role-gate in `evidence.md` before Green.
- Keep Daniel's deferred OpenRouter check outside OpenRouter S1 acceptance.
- Never edit `measure/gates.json`; export every role command below.
- Confirm exclusive dependency changes with the PM before each Green phase.
- Refresh a provisional baseline after any intervening code or lockfile change.
- Keep that ownership through the phase checkpoint.
- OpenRouter S3 rebases its later `zod` install on this track's resulting dependencies.
- Treat this assignment as approval for this track's dependency changes.
- Make one commit for each task, with a Git note.
- Keep task status and commit references current.
- The orchestrator pushes the D1 checkpoint by 2026-11-23 and D2 at closeout by 2026-11-25.
- Use `safe-push` at both points, per the PM push rule of 2026-11-20.
- The PM decision of 2026-11-21 permits this D1 exception to the AGENTS.md closeout-only rule.

## Files That Stay Unstaged

- `apps/bus-math-v2/lib/workbooks-manifest.json`
- `apps/integrated-math-1/.next/types/routes.d.ts`
- `apps/integrated-math-2/.next/types/routes.d.ts`
- `apps/integrated-math-3/.next/types/routes.d.ts`
- `apps/pre-calculus/.next/types/routes.d.ts`
- `measure/generated/routes.md`

Do not restore another track's changes.
Record generator defects in this track's evidence without expanding the repair scope.
Recurring audit configuration stays out of scope; the shared debt registry is at its line limit.

## Gate Commands for Each Phase

`gates.sh` reuses the archived `vinext-oxc-toolchain_20261114/gates.sh` comparison and resume logic.
It validates audit JSON and rejects infrastructure failures, missing results, removed scripts, and changed workspace sets.
It returns zero only for baseline capture or no new failure keys.
Infrastructure failures return 3, including during baseline capture.
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
Set `GATES_BASE=d1-baseline` for D1 comparisons and `GATES_BASE=d2-baseline` for D2 comparisons.
Set `GATES_RESUME=1` to reuse completed jobs and retry infrastructure jobs once.
Use a new label suffix after a code change; preserve earlier logs.
The script calls `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh` for each job.
Do not wrap the whole group in a second heavy job.
No group stops after the first failed workspace.

Compare every command against its phase baseline by the keys in `test-strategy.md`.
`NEWFAIL=0` means no new failure; it does not mean every command passed.
`NEWFAIL=1` means at least one new failure key or missing comparison result.
Reject a missing command, missing log, or incomplete workspace set.
Resolve infrastructure failures before acceptance.

Capture root `npm outdated --json`, `npm outdated --json --workspaces`, and `npm ls --all` in `evidence.md`.
Enumerate declarations from the root and the architecture workspace list.
Query `npm view <name> version --json` for every external declaration, resolving npm aliases to their real names.
Query `npm view '<name>@<declared-range>' version --json` for wanted versions that npm omits.
Record missing npm entries, declaration ranges, installed versions, wanted versions, and registry results.
Outdated and tree commands can fail for valid findings; reject network and infrastructure errors instead of accepting them as Red.

### Role Environment

Export these exact values in each D1 role brief and role-gate call:

```bash
export RED_TEST_COMMAND='npm audit --audit-level=high'
export GREEN_TEST_COMMAND='GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d1-audit-green'
export PROJECT_LINT='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d1-green'
export PROJECT_CHECKS='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d1-green'
export PROJECT_TESTS='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d1-green'
```

Export these exact values for D2:

```bash
export RED_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets'
export GREEN_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets && GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d2-audit-green'
export PROJECT_LINT='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d2-green'
export PROJECT_CHECKS='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d2-green'
export PROJECT_TESTS='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d2-green'
```

The environment overrides `measure/gates.json`, including `PROJECT_TESTS` for adversarial testing.
The gate runner wraps each job through `heavy-run.sh`; do not wrap these runner commands again.
The orchestrator wraps the direct D1 Red audit through `heavy-run.sh`.
Update label values in all role briefs together after a code retry.
If D2 reuses D1 logs, use `GATES_BASE=d1-green` in every D2 comparison command.

### D2 Targets

Red fills this table from the complete inventory before running `targets`.
Use one row for each outdated declaration and its selected stable target.
The command resolves the installed version through the lockfile, starting at the declaration's workspace.
It fails for an empty table, a missing package, or an installed version below the target.
Green records failed candidates in `evidence.md` before lowering a target to a retained version.
Each such row requires a reason and the exact failed gate in the `Decision` column.
An unchanged prerelease pin can appear only with `Deferred:` and its registry reason; the command requires an exact installed match.

| Manifest | Package | Target | Decision |
|---|---|---|---|

## Phase D1: Fix the critical and high advisories

Due at origin: 2026-11-23. Green depends on OpenRouter S1 acceptance.

- [x] Task: D1 Red — record the audit and compatibility baseline (b979734)
    - [ ] Record the phase base commit and whether OpenRouter S1 acceptance is complete.
    - [ ] Capture `npm audit --json`, including all severities and advisory identifiers.
    - [ ] Run `npm audit --audit-level=high` through `heavy-run.sh`.
    - [ ] Confirm exit 1 comes from critical or high advisories, not an infrastructure error.
    - [ ] If the audit passes, use the role's documented `gap_closing` result with `gaps:` and `breakage_proof:`.
    - [ ] Refresh the outdated inventory for the root, six apps, and 20 packages.
    - [ ] Run every gate group with label `d1-baseline`.
    - [ ] Record exact baseline keys and log paths in `evidence.md`.
    - [ ] Record both bundle results and report every budget failure to the PM.
    - [ ] Commit the Red evidence before Green changes.
    - Red commands: `npm audit --audit-level=high` exits 1 (9 high); `npm audit --json` gives critical=0 high=9 moderate=7 low=5; gate groups with label `d1-baseline` give `NEWFAIL=0` for format, lint, typecheck, test, build, docs and `NEWFAIL=1` for support (bundle-entry parse misses, no infra). Logs: `measure/runs/dependency-refresh_20261121/` (gitignored).
- [ ] Task: D1 Green — update the vulnerable dependency chains
    - [ ] Confirm OpenRouter S1 acceptance and exclusive dependency changes through the checkpoint.
    - [ ] Refresh the baseline if code or the lockfile changed after capture.
    - [ ] Read each affected package declaration and its real dependency path.
    - [ ] Update fixed parents first, using the file and command list below.
    - [ ] Check brace-expansion, browserslist, fast-uri, sharp, undici, and ws after each relevant update.
    - [ ] Use a root override only when the parent has no fixed release.
    - [ ] Record the reason and compatibility proof for each override.
    - [ ] Make only required compatibility edits.
    - [ ] Add a behavior test first if a compatibility edit changes behavior.
    - [ ] Run the audit check after parents and overrides, before the compatibility gates.
    - [ ] Record unresolved findings in the `D1 High Exceptions` table with identifiers, paths, versions, and named reasons.
    - [ ] Run `GREEN_TEST_COMMAND`; require no high or critical identifier outside that table.
    - [ ] Keep the selected SDK version compatible with the S1 tests and workerd probe.
- [ ] Task: D1 Verify — compare the complete gate results
    - [ ] Run every gate group with label `d1-green`.
    - [ ] Compare each result with `d1-baseline` by diagnostic key.
    - [ ] Record `NEWFAIL`, audit counts, selected versions, and log paths in `evidence.md`.
    - [ ] Stop for a new failure key or an infrastructure failure.
    - [ ] Stop when a passing budget entry fails or a total grows by more than 5% over baseline.
    - [ ] Send the before and after bundle report to the orchestrator at either stop condition.
    - [ ] Report the standing BM2 budget failure before acceptance.
    - [ ] Keep every budget and manual deploy trigger unchanged.
    - [ ] Report each unresolved critical or high finding to the PM by 2026-11-23.
- [ ] Task: Measure - User Manual Verification 'Phase D1: Fix the critical and high advisories'
    - [ ] Complete independent review and the D1 phase acceptance role-gate.
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the audit result, baseline exceptions, and bundle report to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.
    - [ ] Ask the orchestrator to synchronize and push this checkpoint through `safe-push` by 2026-11-23.

### D1 Files and Update Order

1. Update fixed declared parents and compatible resolved dependencies.
2. Try an override only when the blocking parent has no fixed release.
3. Run the full audit check, including named exceptions.
4. Run the complete compatibility gates.

Expected files: root `package.json`, `package-lock.json`, and these workspace manifests:

- `apps/integrated-math-1/package.json`
- `apps/integrated-math-2/package.json`
- `apps/integrated-math-3/package.json`
- `apps/pre-calculus/package.json`
- `apps/bus-math-v2/package.json`
- `apps/danielson/package.json`

The four course apps declare `wrangler` and `@cloudflare/vite-plugin`.
Use `npm install --save-dev wrangler@latest @cloudflare/vite-plugin@latest --workspace=<app>` for those four apps.
Every app declares `jsdom`; try `npm install --save-dev jsdom@latest --workspace=<app>` for every app.
IM3 and BM2 declare `tsx`; use `npm install --save-dev tsx@latest --workspace=<app>` there.
Root `eslint-plugin-react` and root/app `react-server-dom-webpack` also own affected paths.
Inspect app `autoprefixer`, Babel, and webpack paths before selecting further parent changes.
Use `npm update brace-expansion browserslist fast-uri sharp undici ws` for compatible resolved versions in the lockfile.
Change declaration ranges only when a compatible update cannot reach the fixed version.
Record any additional declaring workspace manifest from the fresh inventory before editing it.
Record every targeted command and its changed files in `evidence.md`.
These commands belong to Green, not this authoring session.

## Phase D2: Update the remaining packages

Due: 2026-11-25. Depends on D1 acceptance.

- [ ] Task: D2 Red — refresh the remaining update baseline
    - [ ] Record the phase base commit.
    - [ ] Refresh the audit and outdated reports for every declared external package.
    - [ ] Fill `D2 Targets` with the stable targets, subject to the Node 24 and exact-pin rules.
    - [ ] Confirm that `RED_TEST_COMMAND` fails because an installed package is below its target.
    - [ ] If no target needs an update, document `red_kind: gap_closing`, `gaps:`, and `breakage_proof:` instead.
    - [ ] Reuse the complete `d1-green` logs when no code or lockfile changed after that sweep.
    - [ ] Otherwise run every gate group with label `d2-baseline`.
    - [ ] Record unchanged baseline keys and bundle results.
    - [ ] Commit the target list and Red evidence before Green.
    - [ ] Add a failing regression test only for a real behavior that requires a compatibility edit.
- [ ] Task: D2 Green — select the latest working versions
    - [ ] Update remaining dependencies in small related groups.
    - [ ] Try each latest stable major, except the explicit Node 24 constraint.
    - [ ] Keep Vitest and its coverage provider compatible.
    - [ ] Keep `@types/node` on 24.x and record the runtime reason.
    - [ ] Move `oxfmt` and `tsrs` exact pins only to released versions that pass the gates.
    - [ ] Reject new prereleases and repository-wide reformatting.
    - [ ] Keep the accepted S1 tests and local workerd probe passing.
    - [ ] Retain the working version when a breaking major fails.
    - [ ] Record each failed candidate and its exact failing gate.
    - [ ] Try fixed blocking parents for every moderate or low chain, including fflate, KaTeX, and PostCSS selector-parser.
    - [ ] Try an override for each chain without a fixed blocking parent.
    - [ ] Keep it only when the complete sweep has no new failure key.
    - [ ] Otherwise remove the trial and record the advisory, version, failing gate, and keys in the reason list.
    - [ ] Reject forced downgrades and unexplained overrides.
    - [ ] Update the stack document before a deliberate stack change.
    - [ ] Run `GREEN_TEST_COMMAND` after all target updates and documented target deferrals.
- [ ] Task: D2 Verify — finish the dependency and advisory reports
    - [ ] Run every gate group with label `d2-green`.
    - [ ] Compare with `d2-baseline`, or the unchanged `d1-green` baseline, by diagnostic key.
    - [ ] Confirm no critical or high finding returned without a named exception.
    - [ ] Record final current and latest versions for every deferred update.
    - [ ] End `evidence.md` with every remaining moderate or low advisory and its supported reason.
    - [ ] Record `NEWFAIL`, the bundle report, and all baseline exceptions.
    - [ ] Apply the same bundle stop rules as D1.
    - [ ] Check `.github/workflows/` for unchanged manual deploy triggers.
    - [ ] Check both `apps/{bus-math-v2,integrated-math-3}/scripts/bundle-size-audit.mjs` files for unchanged budgets.
    - [ ] Verify that the six generated files remain unstaged.
- [ ] Task: Measure - User Manual Verification 'Phase D2: Update the remaining packages'
    - [ ] Complete independent review and the D2 phase acceptance role-gate.
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the final versions, exceptions, and advisory table to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.

## Closeout

- [ ] Task: Close the track and synchronize with origin
    - [ ] Confirm the D2 phase acceptance and checkpoint before archive changes.
    - [ ] Use light-lane closeout; `measure/workflow.md` does not require a separate final acceptance role for every track.
    - [ ] Update the registry and archive through the Measure closeout workflow.
    - [ ] Confirm that generated output and unrelated changes remain outside staged changes.
    - [ ] Ask the orchestrator to run `git fetch origin`.
    - [ ] Ask the orchestrator to run `git pull --ff-only origin master`.
    - [ ] Stop and report if the pull cannot fast-forward.
    - [ ] Recheck acceptance if the pull changes the accepted code.
    - [ ] Ask the orchestrator to push D2 with `~/Desktop/advantage-pr/scripts/jobs/safe-push /home/daniebo/Desktop/ra-math-advantage --branch master`.
    - [ ] Stop and report a safe-push refusal without bypassing it.
    - [ ] Report the final commit and audit counts to the PM.
    - [ ] Close the assignment with a facts changed list.
