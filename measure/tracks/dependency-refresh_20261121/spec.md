# Specification: Dependency Refresh

Track: `dependency-refresh_20261121`.
Type: chore. Lane: light. Priority: PM P2.
Source: Daniel, 2026-11-21 07:52; PM assignment, 2026-11-21.

## Overview

Update every external package to the latest version that works with this repository.
Push the critical and high fixes to origin by 2026-11-23.
Complete the remaining updates by 2026-11-25.
Record a specific reason for each deferred update and each remaining advisory.
This track does not migrate the AI provider.

## Start Gate

OpenRouter S1 acceptance has two requirements:

- The `measure-phase-acceptance` role-gate passes for `Phase S1: Adopt the OpenRouter SDK` in `openrouter-sdk-ai-layer_20261114`.
- The S1 checkpoint commit exists.

Daniel's manual check stays deferred and is not part of OpenRouter S1 acceptance.
Strategy and Red baseline capture may run before OpenRouter S1 acceptance.
Red changes no dependencies.
Green requires the separate spec review and OpenRouter S1 acceptance.
Record the S1 checkpoint and phase acceptance evidence before Green.
Refresh the baseline if code or the lockfile changes after capture.
The PM confirms exclusive dependency changes from each final baseline through its checkpoint.
OpenRouter S3 later installs `zod` and rebases on this track's resulting dependencies.
This track never edits `measure/gates.json`.
Role briefs export the commands in `plan.md`; environment values take precedence over that file.

## Functional Requirements

### FR-1: Complete dependency scope

Include the root package, all six apps, and all 20 active shared packages.
Inspect dependencies, development dependencies, optional dependencies, and peer constraints.
Keep internal workspace references local.
Use `scripts/architecture/architecture.manifest.json` as the existing workspace list.
`packages/_template` is not an active workspace.

Record the current, wanted, and latest versions before each phase.
Run root `npm outdated --json` and `npm outdated --json --workspaces`.
Run `npm ls --all` for the complete dependency tree.
Inspect every active manifest, including apps that npm omits.
Query `npm view <name> version --json` for every external declaration.
Query `npm view '<name>@<declared-range>' version --json` for omitted wanted versions.
Query the package behind an npm alias, not the alias name.
Record declaration ranges, installed versions, wanted versions, and registry results in `evidence.md`.
An empty or incomplete npm report does not prove that every package is current.

### FR-2: Remove critical and high advisories

D1 records the audit baseline and each gate baseline before Green.
The D1 Red command is `npm audit --audit-level=high`.
The current report fails with exit 1 because it contains high advisories.
The normal Green result has zero critical and zero high findings.
An infrastructure failure does not satisfy Red.

Update parent packages first, including Wrangler, the Cloudflare Vite plugin, and the Miniflare chain.
Inspect tsx and other parents of vulnerable transitive packages.
The blocking parent is the first package whose dependency range excludes the fixed version, starting at the vulnerable leaf.
Update that parent before considering an override.
Use a root `overrides` entry only when that parent has no fixed release.
Record the parent, fixed transitive version, and compatibility proof for each override.
Never use `npm audit fix --force`.
Never downgrade vinext to 0.2.1 to satisfy the audit recommendation.

If a critical or high advisory remains, name its identifier, package, version, dependency path, and reason.
Report each exception to the PM by 2026-11-23.
List each exception by advisory identifier and reason in the `D1 High Exceptions` table in `evidence.md`.
The D1 Green command validates the full audit JSON and rejects each high or critical advisory absent from that table.
The command uses no `--omit` option.
A disclosed exception permits the Green gate; it does not mean the npm audit passes.
Report propagated parent findings with their underlying advisory identifiers.

### FR-3: Update the remaining packages

D2 tries the latest stable version of each outdated external package.
Keep `@types/node` on 24.x to match the Node 24 runtime.
Move exact pins, including `oxfmt` and `tsrs`, only to released versions that pass the gates.
Never adopt a prerelease.
Retain an existing prerelease pin if no compatible released replacement exists, with the registry evidence and reason.
Do not perform a repository-wide reformat for a formatter update.
Keep the latest version that passes the phase gates without new diagnostic keys.
Make only compatibility changes required by the update.
Keep `@openrouter/sdk` at a version that passes the accepted S1 tests and the workerd probe.
The probe uses a local mock server and makes no paid request.

When a breaking major fails, retain the working version.
Record the attempted version, failing command, diagnostic keys, and reason for deferral.
Do not retain unrelated trial changes.
Use targeted edits to restore only this track's unsuccessful update.
Update `measure/tech-stack.md` before a deliberate stack change, as the workflow requires.

### FR-4: Account for every remaining advisory

End `evidence.md` with a table of every remaining moderate or low advisory.
Include the advisory identifier, severity, installed version, dependency path, and reason.
Use `no upstream fix` or `breaking major deferred` as the reason category.
Support each reason with a registry result or a failed compatibility gate.
Include affected parent packages that npm reports as vulnerable.
Do not mistake an npm downgrade recommendation for a safe fix.
For each moderate or low chain without a fixed blocking parent, try a root override.
Keep the override only when the complete gate sweep has no new failure key.
Otherwise remove that trial and record the advisory, attempted version, failing gate, and failure keys.

### FR-5: Verify each phase

Run format, lint, typecheck, tests, and build through `heavy-run.sh`, one job at a time.
Run the configured gates for every active workspace.
Record a missing capability explicitly; do not count it as a pass.
Run the scripts suite, audit suites, boundary checks, and CI validation.
Run the S1 tests, workerd probe, and both existing bundle audits.
Run Measure generation and Doctor during phase verification.

Compare each command with its pre-change baseline by diagnostic key.
Known failures remain allowed only with the same keys.
Use the baseline logs linked from `evidence.md`, not fixed failure counts.
Record other workspace baseline failures by key before Green.

The BM2 `Total dist/server` budget failure is known.
Report any bundle budget failure to the PM before phase acceptance.
Do not change a budget.
A budget entry that fails after passing at baseline stops the phase.
A total bundle size more than 5% above baseline also stops the phase.
Measure each app's total under `dist/` and retain both existing budget reports.
Send either stop condition to the orchestrator before continuing.
The known BM2 `Total dist/server` failure remains a baseline key, not an exemption from the growth rule.

### FR-6: Complete the tracked workflow

Use Red and Green in each phase.
D1 uses the audit command for Red evidence.
D2 records target versions in the plan and runs a command that fails while an installed package is below its target.
Green raises those packages or records tested deferrals before revising the targets.
Add a regression test only when a real behavior change requires it.
Complete the checkpoint protocol in `measure/workflow.md` for each phase.
Keep user confirmation with Daniel; automation does not provide it.
Commit tasks with Git notes and update the plan and registry.
The orchestrator pushes the accepted D1 checkpoint through `safe-push` by 2026-11-23.
The orchestrator pushes D2 at closeout through `safe-push` by 2026-11-25.
These are the only push points, per the PM decision of 2026-11-21 and the PM push rule of 2026-11-20.
This decision permits the D1 push before closeout, as an exception to AGENTS.md.

## Non-Functional Requirements

- Daniel's dependency request authorizes package changes for this track.
- This assignment satisfies the AGENTS.md requirement for approval before dependency installation.
- The authoring session runs no install, update, or audit-fix command.
- Green may use targeted installs after the start gate.
- The track performs no deploys or cloud cleanup.
- Deploy workflows under `.github/workflows` retain their manual triggers.
- The track adds no hashes, checksums, manifests, or provenance fields.
- The track uses existing workspace data and Git commit identity.
- The six generated files listed in `plan.md` stay unstaged.
- Preserve other tracks' work and existing security, accessibility, and budget checks.
- Paid model calls and paid generation remain outside this track.

## Acceptance Criteria

1. D1 records zero critical and zero high audit findings, or names every unresolved finding and its reason.
2. D2 updates every outdated package to its latest working version or records a tested reason for deferral.
3. Each phase records all configured gate results and no new failure keys.
4. The accepted S1 tests and workerd probe pass with the selected SDK version.
5. Every remaining moderate or low advisory has a reason in the final evidence table.
6. Deploy triggers and bundle budgets remain unchanged.
7. The generated files remain unstaged.
8. Both phase checkpoints complete before closeout.
9. The D1 checkpoint reaches origin by 2026-11-23; D2 reaches origin at closeout by 2026-11-25 through `safe-push`.

## Out of Scope

Provider migration, auth migration, curriculum repair, baseline defect repair, and unrelated refactoring are outside this track.
New dependency policy systems, audit machinery, and automated deploy triggers are also outside this track.
Recurring dependency audits and Dependabot configuration require a separate assignment.
Facts changed: none expected.
