# Evidence: dependency-refresh_20261121

Status: D1 Red baseline recorded. Green waits for OpenRouter S1 acceptance.
Date: 2026-11-21.
Phase base commit: `0228cfd75f2766ac72e45385cf06c2b884edf034`.
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
| D1 | `0228cfd7` | critical=0 high=9 moderate=7 low=5 | `NEWFAIL=0` for format, lint, typecheck, test, build, docs; support `NEWFAIL=1` from bundle-entry parse misses (record-only, no infra) | IM3 total 12734760 bytes, BM2 total 18777416 bytes with standing `Total dist/server` EXCEEDS | Pending (Green waits for S1) |
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

## D1 Red Baseline (2026-11-21)

Base: `0228cfd75f2766ac72e45385cf06c2b884edf034`. Role base equals the phase base. The Red run changed no dependency, manifest, or lockfile. The six generated files in `plan.md` changed during gate runs and stay unstaged.

### OpenRouter S1 acceptance

S1 acceptance is not complete. The OpenRouter plan has no `[checkpoint: <sha>]` on any phase heading. Its S1 verification task is still open. Green waits for the passing S1 phase role-gate and the checkpoint commit. The accepted S1 tests and the workerd probe pass at this baseline (see support keys). Daniel's manual check stays outside S1 acceptance.

### Audit baseline (Red)

Command: `npm audit --audit-level=high` through `heavy-run.sh`. Exit: 1. The failure comes from high advisories, not infrastructure. Log: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-audit-high.out`.

Full report: `npm audit --json` through `heavy-run.sh`. Exit: 1. Counts: critical=0 high=9 moderate=7 low=5. Report version: 2. Logs: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-audit.json` and `red-d1-0228cfd7-audit.stderr`.

High packages (9): `@cloudflare/vite-plugin`, `brace-expansion`, `browserslist`, `fast-uri`, `miniflare`, `sharp`, `undici`, `wrangler`, `ws`. The JSON resolves 28 unique high or critical advisory identifiers across these packages. `evidence.md` of the `D1 High Exceptions` table stays empty at Red. No exception is selected.

### Outdated and tree inventory

Root `npm outdated --json`: exit 1. It names 12 packages and 38 entries: `@openrouter/sdk`, `@oxlint/plugins`, `@types/node`, `@vitest/coverage-v8`, `convex`, `lucide-react`, `oxfmt`, `oxlint`, `oxlint-plugin-eslint`, `tailwind-merge`, `tsrs`, `vitest`. Log: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-outdated-root.json`.

Workspaces `npm outdated --json --workspaces`: exit 1. It names 6 packages and 32 entries. It omits every app declaration. Log: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-outdated-ws.json`.

Declaration inventory: 26 workspaces from `scripts/architecture/architecture.manifest.json`. They hold 66 external declarations. Two npm aliases exist: `@typescript/native` points to `typescript`, and `typescript6` points to `@typescript/typescript6`. Registry query `npm view <name> version --json` resolved all 66 names (through the real package behind each alias). Wanted queries confirm compatible ranges for the D1 parents: `wrangler@^4.81.1`, `@cloudflare/vite-plugin@^1.31.2`, `jsdom@^29.0.0`, `tsx@^4.20.6`, `baseline-browser-mapping@^2.8.32`, `@tailwindcss/typography@^0.5.19`, `convex@^1.40.0`, `vitest@^4.1.8`, `eslint-plugin-react@^7.37.5`. Installed versions from the lockfile: `wrangler` 4.98.0, `@cloudflare/vite-plugin` 1.40.0, `jsdom` 29.1.1, `tsx` 4.22.4, `baseline-browser-mapping` 2.10.34, `@tailwindcss/typography` 0.5.19, `eslint-plugin-react` 7.37.5, `react-server-dom-webpack` 19.3.1. Logs: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-decls.json` and `red-d1-0228cfd7-registry-latest.txt`.

`npm ls --all`: exit 1. It reports invalid edges, not missing packages. Invalid keys: `katex@0.17.0` against `^0.16.0` from `rehype-katex` and `micromark-extension-math`; `lightningcss-linux-x64-musl-x64` and sharp platform packages under `@vercel/og`. Log: `measure/runs/dependency-refresh_20261121/red-d1-0228cfd7-tree.txt`.

### Gate baselines (label `d1-baseline`)

Base folder: `measure/runs/dependency-refresh_20261121/gates/d1-baseline/`. Group logs: `measure/runs/dependency-refresh_20261121/d1-baseline-<group>.out` with matching `.exit` files.

- Format: exit 0, `NEWFAIL=0`. One `format` step, exit 0.
- Lint: exit 0, `NEWFAIL=0`. All 26 workspaces exit 0.
- Typecheck: exit 0, `NEWFAIL=0`. `apps/integrated-math-3` exits 1 with 55 `TS` diagnostic lines. `apps/pre-calculus` exits 1 with 4 `TS` diagnostic lines. All other workspaces exit 0.
- Test: exit 0, `NEWFAIL=0`. Failing workspaces: `apps/bus-math-v2` 7 failed of 2698; `apps/integrated-math-1` 54 failed of 481 across 16 files; `apps/integrated-math-3` 218 failed of 7069 (5 skipped) across 37 files; `apps/pre-calculus` 52 failed of 6186 across 25 files; `packages/math-content` 2 failed of 886 across 2 files. `scripts-suite` step: 28 failed. `audit-suites` step: 5 failed. All other workspaces pass, including `apps/danielson` and `apps/integrated-math-2`. The scripts-suite count is 28 at capture against the earlier reported 27; the log holds every key. The IM1 and pre-calculus test failures and the math-content failures are baseline keys from this capture.
- Build: exit 0, `NEWFAIL=0`. All workspaces with a build script exit 0. `packages/practice-test-engine` has no build script (`n/a`).
- Support: exit 1, `NEWFAIL=1` (record-only; no infrastructure failure). Keys: `boundary` 0, `ci-check` 0, `tree` 1 (invalid edges above), audit `critical=0 high=9 moderate=7 low=5`, `sdk` 0, `s1-bm2` 0, `s1-im3` 0, `workerd` 0, `bundle-integrated-math-3` 0 (npm script passes), `total-integrated-math-3` 0 (empty total, see runner note), `bundle-bus-math-v2` 1 (npm script fails on the standing budget EXCEEDS), `total-bus-math-v2` 0 (empty total, see runner note).
- Docs: exit 0, `NEWFAIL=0`. `generate` and `doctor` both exit 0.

### Bundle report and runner notes

BM2 `Total dist/server` EXCEEDS its budget: 9926.36 KB against 3000 KB. This is the known standing failure. The budget files stay unchanged. The PM receives this report in the handoff. A passing entry that fails later, or a total growth above 5%, stops the phase.

Direct totals at baseline: IM3 `dist/` is 12734760 bytes; BM2 `dist/` is 18777416 bytes. Green compares against these totals.

Two runner defects affect the support-group bundle comparison; both are recorded here without a scope change:

- The bundle-entry parser finds only 1 of 3 IM3 budget patterns in the fresh `dist/` output (`server/assets` and `client/assets` hold no audited files after a passing build). It throws `missing bundle budget match` for IM3 and BM2. This sets `NEWFAIL=1` at baseline capture.
- The `total-*` steps print an empty `TOTAL_BYTES` when they run through `heavy-run.sh`. A multi-line `node -e` script loses the `${total}` interpolation to the runner (`Referenced but unset environment variable evaluates to an empty string`). The same command prints the correct total outside the runner. Green must account for both defects before it trusts a bundle comparison.

## D1 Green — runner repair (Step 0)

The two support-group runner defects from the D1 Red capture are fixed in `gates.sh` before any dependency change.

- The `total-*` step now writes a CommonJS helper file into the gate output folder with a quoted here-doc and runs `node <helper> <dist>`. The command passed through `heavy-run.sh` holds no `${...}` expression. A smoke test through `heavy-run.sh` printed `TOTAL_BYTES=12734760` for IM3, matching the direct baseline total.
- The bundle-entry parser now requires at least one parsed entry and at least one budget pattern match, instead of a match for every pattern. A passing build leaves some patterns without audited files. Record-mode parsing now exits 0 for IM3 (1 of 3 patterns) and BM2 (1 of 4 patterns). Both previously threw `missing bundle budget match`.
- The support comparison now stores each entry size in KB. It reports `New budget failure` for a new EXCEEDS key and `Larger budget failure` when an EXCEEDS key grows. A fabricated smaller baseline log produced `Larger budget failure: bus-math-v2 Total dist/server 10 -> 9926.36 KB` and exit 1.

Verification: `bash -n gates.sh` passed; usage paths exit 2; total helper printed the real byte count through `heavy-run.sh`; parser record mode exited 0 for both apps; larger-EXCEEDS smoke test exited 1. No budget file, deploy trigger, or dependency changed in this step.

## D1 Green — refreshed baseline r2 (Step 1)

### OpenRouter S1 acceptance

OpenRouter S1 acceptance is complete. The phase-acceptance role-gate passed at commit `328862b6`; the gate result is `measure/runs/openrouter-sdk-ai-layer_20261114/phase-acceptance-328862b6.json`. The checkpoint commit is `14f75797` (`measure(checkpoint): Checkpoint end of Phase S1`). The plan marker commit is `808a8ece`, which is this role's base. The orchestrator confirms exclusive dependency changes for this track through the D1 checkpoint. No other role changes `package.json` or `package-lock.json` in that interval. Daniel's manual check stays deferred and is outside S1 acceptance.

The code changed after the D1 Red capture: the OpenRouter r4 and r5 remediations landed between the Red capture and this role base. This baseline refresh uses the current code before any dependency change.

### Baseline capture

Label: `d1-baseline-r2`. Base commit: `808a8ece`. Command for each group: `bash measure/tracks/dependency-refresh_20261121/gates.sh <group> d1-baseline-r2` with `GATES_RESUME=1`. All groups are record-only. Output: `measure/runs/dependency-refresh_20261121/d1-baseline-r2-<group>.out` with matching `.exit` files. Gate folders: `measure/runs/dependency-refresh_20261121/gates/d1-baseline-r2/<group>/`.

| Group | Exit | NEWFAIL | INFRA | Audit |
|---|---|---|---|---|
| format | 0 | 0 | none | n/a |
| lint | 0 | 0 | none | n/a |
| typecheck | 0 | 0 | none | n/a |
| test | 0 | 0 | none | n/a |
| build | 0 | 0 | none | n/a |
| support | 0 | 0 | none | critical=0 high=9 moderate=7 low=5 |
| docs | 0 | 0 | none | n/a |

The support group now exits 0. The D1 Red capture recorded exit 1 and `NEWFAIL=1` from the two runner defects that Step 0 repaired. The diagnostic keys are unchanged from the D1 Red capture: IM3 typecheck 55 TS lines, pre-calculus typecheck 4 TS lines, the standing test failures, the `npm ls --all` invalid edges, and the BM2 `Total dist/server` EXCEEDS entry. Counts describe the report only; the logs hold every key.

Bundle totals at r2: IM3 `dist/` 12734760 bytes; BM2 `dist/` 18777416 bytes. Both match the direct totals at Red. Parsed entries: IM3 `[OK] server/ssr/index.js → index.js: 292.85 KB`; BM2 `[EXCEEDS] Total dist/server: 9926.36 KB` and `[OK] server/index.js → index.js: 1154.38 KB`. The BM2 total failure is the known standing failure. Budgets and manual deploy triggers stay unchanged.

D1 comparisons use `GATES_BASE=d1-baseline-r2`. The role briefs use the label `d1-baseline-r2` in place of `d1-baseline`; this change is recorded in `plan.md`.

## D1 Green — dependency update (Step 2)

No root `overrides` entry was needed. No `npm audit fix --force` ran. vinext was not downgraded. Declared `@types/node` pins stay at 24.19.2 in every workspace. `@openrouter/sdk` stays at 1.5.125.

Commands run one at a time through `heavy-run.sh`. Logs are under `measure/runs/dependency-refresh_20261121/`.

| Command | Log | Exit |
|---|---|---|
| `npm install --save-dev wrangler@latest @cloudflare/vite-plugin@latest --workspace=apps/integrated-math-1 --workspace=apps/integrated-math-2 --workspace=apps/integrated-math-3 --workspace=apps/pre-calculus` (first attempt) | `green-d1-install-parents.out` | 146, network ETIMEDOUT; no file changed |
| Same command, retry | `green-d1-install-parents-retry.out` | 0 |
| `npm install --save-dev tsx@latest --workspace=apps/integrated-math-3 --workspace=apps/bus-math-v2` | `green-d1-install-tsx.out` | 0 |
| `npm update brace-expansion browserslist fast-uri sharp undici ws` | `green-d1-update-leaves.out` | 0 |

The first parent install stopped on a network timeout before it changed any file. The retry completed. The ETIMEDOUT is a transient network error, not an audit or gate result.

Selected versions from `package-lock.json`:

| Package | Before | After | Path |
|---|---|---|---|
| `wrangler` | 4.98.0 | 4.166.0 | Declared in four course apps; declaration `^4.81.1` to `^4.166.0` |
| `@cloudflare/vite-plugin` | 1.40.0 | 1.70.1 | Declared in four course apps; declaration `^1.31.2` to `^1.70.1` |
| `tsx` | 4.22.4 | 4.23.15 | Declared in IM3 and BM2; declaration `^4.20.6` to `^4.23.15` |
| `miniflare` | 4.20260603.0 | 5.20261117.0-beta | Transitive through the updated Cloudflare parents; no declaration changed |
| `brace-expansion` | 1.1.x | 1.1.22 | Resolved leaf |
| `browserslist` | 4.x | 4.29.6 | Resolved leaf |
| `fast-uri` | 3.1.x | 3.1.9 | Resolved leaf |
| `sharp` | 0.35.5-rc line | 0.35.5 | Resolved leaf |
| `undici` | 7.30.x | 7.30.2 | Resolved leaf |
| `ws` | 8.20.1 | 8.22.0 | Resolved leaf and Cloudflare parent |
| `@openrouter/sdk` | 1.5.125 | 1.5.125 | Unchanged; S1 tests and workerd probe pass |
| `vinext` | 1.4.6 | 1.4.6 | Unchanged; no downgrade |

Audit counts before: critical=0 high=9 moderate=7 low=5, total 21. Full report: `red-d1-0228cfd7-audit.json`. Audit after parents: critical=0 high=3 moderate=7 low=5; report `green-d1-audit-after-parents.json`. Audit after leaves: critical=0 high=0 moderate=6 low=5, total 11; report `green-d1-audit-after-leaves.json`. The Green audit gate exit 0: `audit: critical=0 high=0 moderate=6 low=5`, `NEWFAIL=0`; log `green-d1-audit-gate.out`, label `d1-audit-green`. The `D1 High Exceptions` table stays empty because no high or critical advisory remains.

The declared wrangler and plugin ranges fix six high advisories at their parents: `wrangler`, `@cloudflare/vite-plugin`, `miniflare`, `sharp`, `undici`, and `ws`. `npm update` fixed the three leaf highs: `brace-expansion`, `browserslist`, and `fast-uri`. A root override was not required for any advisory.

A new nested `cloudflare/node_modules/@types/node@18.19.130` appears in the lockfile. It is a transitive requirement of the updated `cloudflare` package. No workspace declaration changed.

## D1 Verify — stop condition (2026-11-21)

Comparison label `d1-green`; base `d1-baseline-r2`. Output files: `d1-green-PROJECT_LINT.out`, `d1-green-PROJECT_TESTS.out`, `d1-green-PROJECT_CHECKS.out`, with matching `.exit` files.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| build | 0 | 0 | none |
| support | 1 | 1 | none |
| docs | 0 | 0 | none |

The support group has two stop findings.

1. Bundle totals grew above 5%. IM3 `dist/` grew from 12734760 to 28206981 bytes, a rise of 121.5 percent. BM2 `dist/` grew from 18777416 to 45595085 bytes, a rise of 142.8 percent. The BM2 `Total dist/server` entry grew from 9926.36 KB to 36115.49 KB. The repaired comparison reported `Larger budget failure: bus-math-v2 Total dist/server 9926.36 -> 36115.49 KB` and `Bundle growth exceeds 5%` for both apps. Every dist file has the green build timestamp; no stale file explains the growth. The current dist holds 17680087 bytes of `.map` files for IM3 and 27939161 bytes for BM2. The updated Cloudflare toolchain emits these sourcemaps. Budgets stay unchanged.
2. `step tree` reported one new key: the npm debug log path `2026-11-21T08_34_59_576Z-debug-0.log`. The baseline holds the same line with path `2026-11-21T07_37_10_971Z-debug-0.log`. No new package diagnostic exists. The `key()` normalizer does not remove the time stamp from that npm line.

No infrastructure failure occurred. The S1 tests, the SDK suite, and the workerd probe passed inside the support group. Format, lint, typecheck, test, build, and docs all report `NEWFAIL=0` against `d1-baseline-r2`. Budgets and manual deploy triggers are unchanged. The six generated files remain unstaged.

The phase stops here. The orchestrator must decide how to treat the sourcemap growth and the npm debug-log key. No user verification or checkpoint ran.

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
