# Evidence: dependency-refresh_20261121

Status: track creation only. Implementation and phase acceptance are pending.
Date: 2026-11-21.
Inspection HEAD: `4710566e9acf3c3a16c3aa2a29388781ee7c9e37`.
OpenRouter S1 acceptance checkpoint: pending.

## Read-Only Audit Confirmation

The author ran `npm audit --json` on the inspection HEAD.
Exit: 1. Report version: 2.
Counts: critical=0 high=9 moderate=7 low=5 total=21.
The result matches the PM baseline.
These are npm vulnerable-package counts, not unique advisory counts.
The author changed no dependency declaration, lockfile, or installed package.

| High package | Reported affected range | Reported fix |
|---|---|---|
| `brace-expansion` | `<=1.1.20` | Available |
| `browserslist` | `<=4.28.6` | Available |
| `fast-uri` | `3.0.0 - 3.1.8` | Available |
| `sharp` | `<=0.35.5-rc.1` | Available through the Miniflare chain |
| `undici` | `7.0.0 - 7.30.0` | Available; root and nested Miniflare copies are affected |
| `ws` | `8.0.0 - 8.20.1` | Available |
| `miniflare` | `<=0.0.0-fff677e35 || 3.20250204.0 - 5.20260801.0-alpha` | Available |
| `wrangler` | `<=0.0.0-7ae5dd357 || 4.16.0 - 4.113.0` | Available |
| `@cloudflare/vite-plugin` | `<=0.0.0-7b9716462 || 0.1.5 - 1.46.0` | Available |

## Outdated Packages at Track Creation

Command: `npm outdated --workspaces --json`. Exit: 1.
The report contains six distinct package names and 32 package/workspace entries.
These values describe the returned report, not a complete registry inventory.

| Package | Current | Wanted | Latest | Entries | Reported dependents |
|---|---|---|---|---|---|
| `@openrouter/sdk` | 1.5.125 | 1.5.127 | 1.5.127 | 1 | ai-tutoring |
| `@types/node` | 24.19.2 | 24.19.2 | 26.6.6 | 6 | ai-tutoring, core-auth, core-convex, knowledge-space-practice, lesson-renderer, practice-core |
| `convex` | 1.50.0 | 1.51.0 | 1.51.0 | 2 | app-shell, core-convex |
| `lucide-react` | 1.73.0 | 1.77.0 | 1.77.0 | 2 | app-shell, lesson-renderer |
| `tailwind-merge` | 3.7.0 | 3.7.1 | 3.7.1 | 1 | lesson-renderer |
| `vitest` | 4.1.12 | 4.1.12 | 5.1.1 | 20 | Every active shared package |

Coverage limit: npm reports only shared-package dependents in this output.
`npm outdated --workspaces --include-workspace-root --json` returns the same six names.
`npm outdated --workspace=apps/integrated-math-3 --json` also returns that package-only report.
The root `npm outdated --workspaces=false --json` returns `{}`.
The IM3 prefix check also returns `{}`.
Do not conclude that all root and app dependencies are current.
D1 and D2 must inspect every declaration and query omitted packages before selecting versions.

Vitest 5 is a major-version candidate, not an approved deferral.
Node types stay on 24.x for the Node 24 runtime, per the Round 1 decision.
Keep the coverage provider compatible with the selected Vitest version.
Verify Node types against the existing Node 24 runtime.
Verify any SDK update against accepted S1 tests and the workerd probe.

## Baseline Gate Evidence

Pending D1 Red. The authoring session did not run the implementation gate sweep.
The PM supplied these standing failures from the OpenRouter baseline:

| Gate | Reported standing result | Required treatment |
|---|---|---|
| IM3 typecheck | 55 diagnostic lines | Capture exact file and code keys |
| IM3 tests | 218 failures | Capture exact test keys |
| BM2 tests | 7 failures | Capture exact test keys |
| Scripts suite | 27 failures | Capture exact test keys |
| Audit suites | 5 failures | Capture exact test keys |
| BM2 bundle audit | `Total dist/server` exceeds its budget | Report to the PM; keep the budget unchanged |

Source: `measure/tracks/openrouter-sdk-ai-layer_20261114/evidence.md` and the PM assignment.
Counts alone do not authorize an exception.
Capture all 26 active workspaces before dependency changes.
Preserve exact logs under `measure/runs/dependency-refresh_20261121/gates/`.

## Phase Results

| Phase | Base commit | Audit counts | New failure keys | Bundle report | Acceptance |
|---|---|---|---|---|---|
| D1 | Pending | Pending | Pending | Pending | Pending |
| D2 | Pending | Pending | Pending | Pending | Pending |

## Deferred Updates and Overrides

None selected during track creation.
Record every attempted breaking major, failed gate, and retained version here.
Record each necessary override and the parent's missing fixed release here.

## Authoring Checks

- Shell syntax check: passed.
- Metadata, task count, and local links: passed; nine top-level tasks.
- Gate capture smoke check: passed for exit codes 0 and 7, with separate output and diagnostics.
- Dispatcher smoke check: passed with stub commands, not implementation gates.
- The dispatcher scheduled 26 lint jobs, 26 typecheck jobs, 28 test jobs, and 25 build jobs.
- The dispatcher preserved raw failures and refused existing result paths and invalid labels.
- Git whitespace check: passed.
- Repository format check through `heavy-run.sh`: passed on retry after a timeout before output.
- Repository lint through `heavy-run.sh`: passed on retry after a timeout before output.
- Full runtime tests, typecheck, and builds remain D1 Red work; this session authors the track only.

## Scope Checks

The inspection found only the six generated files listed in `plan.md` modified.
All six remain unstaged.
The authoring session changes only this track and its registry entry.
Deploy triggers remain manual.
No install, update, audit fix, deploy, or push runs during track creation.
Facts changed: none.

## Round 1 Amendment Checks

Status: planning amendments only; the strategy remains a draft for confirmation.
The amended runner reuses the archived toolchain comparison and resume logic.
The original authoring checks above describe the initial raw runner, not the amended runner.
- Shell syntax and Git whitespace checks: passed.
- Isolated command checks: passed, including diagnostic keys, infrastructure failures, missing results, workspace parity, and resume behavior.
- Audit checks: passed for valid reports, invalid reports, propagated advisory identifiers, named exceptions, and unresolved paths.
- D2 checks: passed for missing targets, below-target versions, workspace resolution, stable targets, and unchanged deferred prerelease pins.
- Bundle checks: passed at 5% growth; rejected growth above 5%, new budget failures, and missing matches.
- Scratch fixtures: `/home/daniebo/.cache/opencode/dependency-refresh-review-hqja7zb1`.
- Root `npm run format:check` and `npm run lint`: passed through serial `heavy-run.sh` jobs.
- Metadata, local links, role exports, and planned task count: passed.
- The scope check found a concurrent OpenRouter plan edit; this session leaves that edit unstaged and unchanged.
These are runner checks, not implementation gates or phase acceptance evidence.
This session changes no dependency, OpenRouter file, or file under `measure/runs/`.

## D1 High Exceptions

No exception is selected during planning.
Green records each unresolved critical or high advisory here before its gate runs.
Use the underlying advisory identifier for propagated parent findings.
Repeat an identifier when different paths need separate reasons.
The full audit remains unresolved when this table permits the exception gate.

| Advisory | Package | Version | Dependency path | Reason |
|---|---|---|---|---|

## Remaining Moderate and Low Advisories

This is the initial report, not the final exception table.
D2 replaces these rows with final installed versions, paths, and verified reasons.
No row below is an accepted deferral.

| Package or affected chain | Severity | Advisory | Initial report and required investigation |
|---|---|---|---|
| `baseline-browser-mapping <2.11.0` | Moderate | GHSA-w5vr-8v7q-w6rv | Fix available; update its parent or resolved compatible version |
| `tsx / wrangler → esbuild 0.27.3 - 0.28.0` | Low | GHSA-g7r4-m6w7-qqqr | Fix available; inspect both nested copies |
| `vinext → @vercel/og → satori → fflate 0.7.0 - 0.7.4` | Moderate | GHSA-px8p-9vwx-vf98 | npm proposes vinext 0.2.1; reject that downgrade and check safe parent fixes |
| `remark-math → micromark-extension-math → katex`; also `rehype-katex → katex` | Low | GHSA-238p-pmpm-9mq7 | npm proposes breaking downgrades; inspect fixed parents before any deferral |
| `@tailwindcss/typography → postcss-selector-parser <6.1.5` | Moderate | GHSA-rj75-hqrm-r3gf | npm proposes typography 0.5.4; inspect fixed parents before any deferral |
