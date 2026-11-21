# Specification: Dependency Refresh

Track: `dependency-refresh_20261121`.
Type: chore. Lane: light. Priority: PM P2.
Source: Daniel, 2026-11-21 07:52; PM assignment, 2026-11-21.

## Overview

Update every external package to the latest version that works with this repository.
Fix critical and high advisories by 2026-11-23.
Complete the remaining updates by 2026-11-25.
Record a specific reason for each deferred update and each remaining advisory.
This track does not migrate the AI provider.

## Start Gate

Track creation and read-only inventory can proceed now.
Implementation starts after the separate spec review.
Green starts only after S1 acceptance of `openrouter-sdk-ai-layer_20261114`.
The orchestrator records the accepted S1 commit before dependency changes.
A lockfile change would invalidate the S1 audits.
`measure/gates.json` also belongs to the active phase.
This track must not change that file before the S1 handoff.
The PM coordinates exclusive dependency changes with later OpenRouter phases.

## Functional Requirements

### FR-1: Complete dependency scope

Include the root package, all six apps, and all 20 active shared packages.
Inspect dependencies, development dependencies, optional dependencies, and peer constraints.
Keep internal workspace references local.
Use `scripts/architecture/architecture.manifest.json` as the existing workspace list.
`packages/_template` is not an active workspace.

Record the current, wanted, and latest versions before each phase.
Run `npm outdated --workspaces --json` and the root check.
Check each app when the workspace output omits it.
Use read-only registry queries for missing package entries.
An empty or incomplete npm report does not prove that every package is current.

### FR-2: Remove critical and high advisories

D1 records the audit baseline and each gate baseline before Green.
`RED_TEST_COMMAND` is `npm audit --audit-level=high`.
The current report fails with exit 1 because it contains high advisories.
The expected Green result is exit 0 with zero critical and zero high findings.
An infrastructure failure does not satisfy Red.

Update parent packages first, including Wrangler, the Cloudflare Vite plugin, and the Miniflare chain.
Inspect tsx and other parents of vulnerable transitive packages.
Use a root `overrides` entry only when the parent has no fixed release.
Record the parent, fixed transitive version, and compatibility proof for each override.
Never use `npm audit fix --force`.
Never downgrade vinext to 0.2.1 to satisfy the audit recommendation.

If a critical or high advisory remains, name its identifier, package, version, dependency path, and reason.
Report each exception to the PM by 2026-11-23.
An exception is a disclosed unresolved finding, not a passing audit.

### FR-3: Update the remaining packages

D2 tries the latest stable version of each outdated external package.
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

### FR-5: Verify each phase

Run format, lint, typecheck, tests, and build through `heavy-run.sh`, one job at a time.
Run the configured gates for every active workspace.
Record a missing capability explicitly; do not count it as a pass.
Run the scripts suite, audit suites, boundary checks, and CI validation.
Run the S1 tests, workerd probe, and both existing bundle audits.
Run Measure generation and Doctor during phase verification.

Compare each command with its pre-change baseline by diagnostic key.
Known failures remain allowed only with the same keys.
The reported baseline includes 55 IM3 typecheck lines and test failures of IM3 218, BM2 7, scripts 27, and audit-suites 5.
These counts do not authorize new failures or substitute for fresh baseline logs.
Record other workspace baseline failures by key before Green.

The BM2 `Total dist/server` budget failure is known.
Report any bundle budget failure to the PM before phase acceptance.
Do not change a budget.
A new over-budget entry or an unapproved increase stops the phase.

### FR-6: Complete the tracked workflow

Use Red and Green in each phase.
The audit command and existing compatibility gates provide Red evidence without new test code.
Add a regression test only when a real behavior change requires it.
Complete the checkpoint protocol in `measure/workflow.md` for each phase.
Keep user confirmation with Daniel; automation does not provide it.
Commit tasks with Git notes and update the plan and registry.
Push only at track closeout through `safe-push`.

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
9. Closeout synchronizes with origin and pushes through `safe-push` without a deploy.

## Out of Scope

Provider migration, auth migration, curriculum repair, baseline defect repair, and unrelated refactoring are outside this track.
New dependency policy systems, audit machinery, and automated deploy triggers are also outside this track.
Facts changed: none expected.
