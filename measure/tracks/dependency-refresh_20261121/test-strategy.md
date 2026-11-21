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

`RED_TEST_COMMAND`: `npm audit --audit-level=high`.
`GREEN_TEST_COMMAND`: `npm audit --audit-level=high`.
Run each through `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`.
The current valid audit exits 1 for nine high findings.
The expected D1 Green audit exits 0 with zero critical and zero high findings.
Named exceptions remain unresolved findings and require a PM report.
Do not convert an exception into a false Green result.

D2 uses the outdated inventory and the fresh gate baseline as its Red evidence.
Try the latest stable versions before recording a breaking-major deferral.
Existing compatibility tests can pass before the update.
Do not add an artificial failing test to satisfy a marker.

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
| support | Boundary, CI validation, tree, audit, S1 tests, workerd probe, both bundle audits |
| docs | `npm run generate`; `npm run doctor` |

Each job runs through `heavy-run.sh` with `CI=true`.
Run one job at a time.
Capture command output and exit status under `measure/runs/dependency-refresh_20261121/gates/<label>/`.
These logs are gitignored.
Compare both `.log` output and `.stderr` diagnostics for each command.
The audit JSON stays separate from wrapper diagnostics.
The runner returns raw failures and does not approve exceptions.

## Baseline Comparison

Capture a fresh complete baseline before each phase changes a dependency.
Record the base commit, commands, workspace paths, and log paths in `evidence.md`.
Preserve earlier logs when a retry is necessary.

- Typecheck key: workspace, file, and diagnostic code.
- Lint key: workspace, file, and rule identifier.
- Test key: workspace or suite, test file, and full test title.
- Other failure key: command and diagnostic text, without positions or timings.
- Bundle key: app and budget entry; also compare the reported bytes.

Compare keys per command, not only per workspace or count.
The same count with different keys fails.
A missing log, command, workspace, or expected test execution fails.
Parse audit JSON; reject a top-level error or missing numeric severity counts.
An infrastructure error is neither Red proof nor an allowed baseline failure.
Retry an infrastructure failure once, then report it.
Record the new-key count as `NEWFAIL=<n>`.
Require `NEWFAIL=0` before phase acceptance.

The supplied standing failures are IM3 typecheck 55 lines and tests IM3 218, BM2 7, scripts 27, audit-suites 5.
Fresh logs must prove the exact keys.
Do not import the OpenRouter track's four-workspace limit into this track.
Other workspace failures require their own pre-change evidence.

The BM2 `Total dist/server` budget failure is known.
Report all budget failures to the PM before acceptance.
Keep budgets unchanged.
Stop on a new budget failure or an unapproved increase.
Do not treat a missing bundle match as coverage.

## SDK Compatibility

Run the full `packages/ai-tutoring` suite.
Run the accepted S1 route and provider tests in IM3 and BM2.
Run `npm run test:workerd --workspace=packages/ai-tutoring`.
Require `probe-ok` from the real SDK in workerd against the local mock server.
A passing build does not replace this probe or the typecheck.

## Review and Acceptance

The PM schedules the independent spec review from another model family.
The light lane keeps Red, Green, independent review, and phase acceptance.
The orchestrator confirms the applicable review roles before implementation.
Review dependency paths, lockfile changes, install scripts, overrides, and advisory reasons.
Review every baseline exception by key.
Browser review is required only if a necessary compatibility edit changes the interface.
Daniel retains the manual verification gate in `measure/workflow.md`.
The authoring session does not claim an implementation or acceptance result.
