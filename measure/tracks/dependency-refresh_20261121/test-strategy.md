# Test Strategy: dependency-refresh_20261121

Lane: light. Phases: D1 and D2. Status: draft for independent review.

## Risk and Proof

Dependency changes can alter build output, runtime behavior, types, and test behavior.
Security findings require a real npm audit report.
Existing tests and the local workerd probe provide compatibility proof.
No test calls a paid model API.
No new test code is required for version changes alone.
Add a failing regression test before a behavior repair.
Do not replace durable assertions with frozen package-version assertions.

## Red and Green

The exact role environment appears in `plan.md`; this track never edits `measure/gates.json`.
Export all five commands for each role-gate, including `PROJECT_TESTS`.
Environment values take precedence over the shared file.

D1 Red runs `npm audit --audit-level=high` through `heavy-run.sh` and validates a separate full audit JSON report.
Use the current baseline in `evidence.md`, not a fixed finding count.
D1 Green runs `gates.sh audit-high d1-audit-green`.
It validates the full report without `--omit` and resolves propagated parent findings to advisory identifiers.
It fails for any critical or high identifier without a named reason in the `D1 High Exceptions` evidence table.
Named exceptions permit that Green command but remain unresolved audit findings in the PM report.
Invalid JSON, missing counts, unresolved advisory paths, and infrastructure failures cannot pass either role.

D2 Red records root `npm outdated --json`, `npm outdated --json --workspaces`, and `npm ls --all`.
It inspects every active manifest and queries omitted declarations with `npm view <name> version --json`.
It fills the plan's `D2 Targets` table and runs `gates.sh targets`.
That command must fail while any listed installed version is below its stable target.
D2 Green runs the same target command and the full audit exception check.
Green updates packages or records tested deferrals before lowering targets to retained versions.
No new test code is required for this package-version command.
If no failing audit or target remains, the Red result declares `red_kind: gap_closing`, `gaps:`, and `breakage_proof:`.
The strategy role confirms that deviation from current evidence; Red does not manufacture a failure.

Strategy and Red baseline capture may precede OpenRouter S1 acceptance.
Green requires the passing S1 phase role-gate and its checkpoint commit.
Daniel's deferred OpenRouter check is outside that gate.
Refresh a baseline after an intervening code or lockfile change.
The PM reserves dependency changes through each checkpoint; OpenRouter S3 later rebases its `zod` install on this track's result.

## Gate Coverage

`gates.sh` reads the existing architecture workspace list.
It runs the live package script for each configured capability.
It excludes the existing template workspace.
The current list contains six apps and 20 packages.
`packages/practice-test-engine` has no build script; record that capability as absent.
A removed script or workspace is a new failure, not an allowed omission.

| Group | Commands |
|---|---|
| format | `npm run format:check` |
| lint | `npm run lint --workspace=<ws>` for every active workspace |
| typecheck | `npm run typecheck --workspace=<ws>` for every active workspace |
| test | `npm run test --workspace=<ws>` for every active workspace; scripts and audit suites |
| build | `npm run build --workspace=<ws>` for each workspace with a build script |
| support | Boundary, CI validation, `npm ls --all`, validated full audit, S1 tests, workerd probe, both bundle audits and app totals |
| docs | `npm run generate`; `npm run doctor` |

Each job runs through `heavy-run.sh` with `CI=true`.
Run one job at a time.
Capture command output and exit status under `measure/runs/dependency-refresh_20261121/gates/<label>/`.
These logs are gitignored.
Compare each combined `.log` for workspace and step commands.
The audit JSON stays separate from wrapper diagnostics.
The runner reuses `key`, `new_keys`, `sweep`, `audit_step`, `has_infra_output`, `GATES_BASE`, and `GATES_RESUME` from the archived toolchain runner.
It returns zero for no new failure keys, not merely for raw command success.

## Baseline Comparison

Capture a complete baseline before each phase changes a dependency.
Reuse `d1-green` as the D2 baseline when no code or lockfile changed after that complete sweep.
Record the base commit, commands, workspace paths, and log paths in `evidence.md`.
Preserve earlier logs when a retry is necessary.

- Typecheck key: workspace, file, and diagnostic code.
- Lint key: workspace, file, and rule identifier.
- Test key: workspace or suite, test file, and full test title.
- Tree key: package path and invalid, missing, or extraneous edge from `npm ls --all`.
- Other failure key: command and diagnostic text, without positions or timings.
- Bundle key: app and budget entry; also compare the reported bytes.

Compare keys per command, not only per workspace or count.
The same count with different keys fails.
A missing log, command, workspace, or expected test execution fails.
Parse audit JSON; reject a top-level error or missing numeric severity counts.
An infrastructure error is neither Red proof nor an allowed baseline failure.
Retry an infrastructure failure once, then report it.
Record `NEWFAIL=0` for no new keys and `NEWFAIL=1` for one or more new keys or missing results.
Require `NEWFAIL=0` before phase acceptance.

Use the standing failures and baseline log paths in `evidence.md`.
Fresh logs must prove the exact keys, including any invalid KaTeX edge below the root.
Do not import the OpenRouter track's four-workspace limit into this track.
Other workspace failures require their own pre-change evidence.

The BM2 `Total dist/server` budget failure is known.
Report all budget failures to the PM before acceptance.
Keep budgets unchanged.
Stop when a budget entry fails after passing at baseline.
Stop when an app's total `dist/` bytes grow by more than 5% over baseline.
Report either condition to the orchestrator before continuing.
The known BM2 `Total dist/server` failure remains a baseline key and still obeys the growth rule.
Do not treat a missing bundle match as coverage.
Keep these budget files unchanged: `apps/bus-math-v2/scripts/bundle-size-audit.mjs` and `apps/integrated-math-3/scripts/bundle-size-audit.mjs`.
Check `.github/workflows/` for unchanged manual deploy triggers.

## Candidate Rules

Keep `@types/node` on 24.x for Node 24.
Move exact pins only to released versions that pass the gates; never adopt a prerelease.
Keep Vitest and its coverage provider compatible.
Reject a formatter update that requires repository-wide formatting.
The blocking parent is the first package whose range excludes the fixed version, starting at the vulnerable leaf.
Update that parent first.
Try an override for every moderate or low chain without a fixed blocking parent.
Keep it only after the complete sweep has no new failure key.
Otherwise remove the trial and record its advisory, attempted version, failed gate, and keys in the reason list.

## SDK Compatibility

Run the full `packages/ai-tutoring` suite.
Run the accepted S1 route and provider tests in IM3 and BM2.
Run `npm run test:workerd --workspace=packages/ai-tutoring`.
Require `probe-ok` from the real SDK in workerd against the local mock server.
A passing build does not replace this probe or the typecheck.

## Review and Acceptance

The PM schedules the independent spec review from another model family.
The light lane keeps Red, Green, independent review, and phase acceptance.
Closeout requires the D2 phase acceptance and checkpoint, not a separate final acceptance role.
`measure/workflow.md` requires phase checkpoints but does not require that role for every track.
The orchestrator confirms the applicable review roles before implementation.
Review dependency paths, lockfile changes, install scripts, overrides, and advisory reasons.
Review every baseline exception by key.
Browser review is required only if a necessary compatibility edit changes the interface.
Daniel retains the manual verification gate in `measure/workflow.md`.
The authoring session does not claim an implementation or acceptance result.
