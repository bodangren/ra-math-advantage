# Evidence: dependency-refresh_20261121

Status: D1 Green and Verify complete at r3. The Green audit gate accepts five named high exceptions. No checkpoint or user verification ran.
Date: 2026-11-21.
Phase base commit: `0228cfd75f2766ac72e45385cf06c2b884edf034`.
OpenRouter S1 acceptance: phase role-gate passed at `328862b6`; checkpoint `14f75797`; plan marker `808a8ece`.

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

Superseded by the D1 Red baseline and the r2 and r3 gate sweeps recorded below. The PM supplied these standing failures from the OpenRouter baseline:

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
| D1 | `0228cfd7` (Red), `808a8ece` (r2 base) | before critical=0 high=9 moderate=7 low=5; final critical=0 high=5 moderate=6 low=5, all five high packages named as exceptions | `NEWFAIL=0` for every group at `d1-green-r11` against `d1-baseline-r2`; no infrastructure failure | IM3 12734760 to 12734755 bytes; BM2 18777416 to 18777411 bytes; both within 5 percent | Phase acceptance PASS at `62b947cf`; five high exceptions named; checkpoint recorded in plan.md |
| D2 | `43f29627` (Red) | Red critical=0 high=5 moderate=6 low=5; targets exit 1 with 130 below-target rows of 131 | Reuse d1-green-r11; no d2-baseline capture | IM3 12734755 bytes; BM2 18777411 bytes (r11) | Pending |

## Deferred Updates and Overrides

At track creation none were selected. The r2 retry selected wrangler 4.116.0 and `@cloudflare/vite-plugin` 1.49.0 with stable miniflare 4.20260730.0. No override remains in the final tree (PM a778067f).
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

## D1 Green — dependency update (Step 2, superseded by the r2 retry)

This first sweep used wrangler 4.166.0, `@cloudflare/vite-plugin` 1.70.1, and miniflare 5 beta. The r2 retry replaced those versions with 4.116.0, 1.49.0, and stable 4.20260730.0. Read the r2 sections below for the current state. The first sweep produced audit critical=0 high=0 moderate=6 low=5 and Green audit gate label `d1-audit-green`.

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

## D1 Verify retry r2 — stable Cloudflare runtime

The orchestrator narrowed the retry. miniflare 5 is published only as a prerelease. The resolved toolchain must stay on stable miniflare 4.x.

Registry checks with `npm view <pkg>@<ver> dependencies.miniflare`:

| Package | Version | Resolved miniflare | Note |
|---|---|---|---|
| `wrangler` | 4.116.0 | 4.20260730.0 | Newest stable miniflare; selected |
| `wrangler` | 4.117.0 | 5.20260730.0-alpha | Newest wrangler with a stable miniflare is 4.116.0 |
| `@cloudflare/vite-plugin` | 1.49.0 | 4.20260730.0 | Newest stable miniflare; selected |
| `@cloudflare/vite-plugin` | 1.50.0 | 5.20260730.0-alpha | Newest plugin with a stable miniflare is 1.49.0 |

Both selected parents stay above the Red advisory ranges. wrangler 4.116.0 is above 4.113.0 and plugin 1.49.0 is above 1.46.0. The resolved Cloudflare chain has no new prerelease: miniflare is 4.20260730.0 and workerd is 1.20260730.1. The chain keeps `unenv` 2.0.0-rc.24 and `youch` 4.1.0-beta.10. Both were present at the accepted Red baseline in wrangler 4.98.0 and miniflare 4.20260603.0, so they are unchanged, not newly adopted.

The npm advisory data changed after Red. The current report gives wrangler range `4.16.0 - 4.130.0`, plugin range `1.2.3 - 1.54.6`, and miniflare range `4.20250508.3 - 5.20260908.0-alpha`. The Red ranges were `4.16.0 - 4.113.0`, `0.1.5 - 1.46.0`, and `3.20250204.0 - 5.20260801.0-alpha`. The expanded ranges keep all three parents high at the newest stable versions. Only miniflare 5 clears the parent highs, and npm publishes 5.x only as a prerelease; the track forbids prereleases. The leaf highs have an override path, but PM a778067f rejects it because it creates new failure keys (see below).

Commands run one at a time through `heavy-run.sh`:

| Command | Log | Exit |
|---|---|---|
| `npm install --save-dev wrangler@4.116.0 @cloudflare/vite-plugin@1.49.0 --workspace=...` (four course apps, first attempt) | `green-r2-install-stable-cloudflare.out` | 146, network ETIMEDOUT; no file changed |
| Same command, retry | `green-r2-install-stable-cloudflare-retry.out` | 0 |
| `npm install` after adding root overrides | `green-r2-install-overrides.out` | 0 |
| `npm install --save-dev wrangler@4.116.0 @cloudflare/vite-plugin@1.49.0 --workspace=...` (re-resolve) | `green-r2-install-workspaces-with-overrides.out` | 0 |
| `npm install --package-lock-only` | `green-r2-lock-only.out` | 0 |
| `npm install` with the final two-entry override | `green-r2-install-final-overrides.out` | 0 |

Root overrides `sharp` 0.35.5 and `undici` 7.30.2 do clear all five highs, but only after the nested lock nodes re-resolve. Proof: `npm view miniflare@4.20260730.0 dependencies.sharp` returns 0.35.2 and `dependencies.undici` returns 7.28.0. `npm view miniflare version` returns 4.20260730.0. No stable miniflare 4.x release has fixed sharp or undici. The r2 trial added the overrides to an already locked tree, so npm reported "up to date" and kept the nested copies at 0.35.2 and 7.28.0. A fresh resolution of the nested nodes removes those copies and gives critical=0 high=0 moderate=6 low=5. That resolution has a cost: `npm ls --all` exits 1 with two new `invalid:` lines for the miniflare edges. The tree step counts both lines as new failure keys and the support group prints NEWFAIL=1. PM a778067f keeps an override only when it clears the high with no new failure key. The override fails that test, so no override remains in the final tree and both leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease. No `ws` override was needed: the resolved ws is 8.21.0, above the 8.20.1 advisory end. No `npm audit fix --force` ran and vinext was not downgraded. Each exception row states these facts. The plan also records a phase-close check of `npm view miniflare dist-tags` for a stable 5.x release.

Audit before the r2 change: critical=0 high=0 moderate=6 low=5. Audit after the r2 change: critical=0 high=5 moderate=6 low=5, total 16. Reports: `green-r2-audit-before-overrides.json`, `green-r2-audit-after-overrides.json`, `green-r2-audit-after-overrides-2.json`. The expanded advisory ranges account for the five high packages: `@cloudflare/vite-plugin`, `miniflare`, `sharp`, `undici`, and `wrangler`. They resolve to nine unique advisory identifiers. The table below names each identifier for each affected package with its reason. The Green audit gate accepts them as named exceptions; the full audit stays unresolved.

The `key()` function in `gates.sh` now normalizes the npm debug-log line to `<log path>`. Baseline and current tree logs then produce no new key from the time stamp.

### r2 gate results and bundle report

Green test command: `GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d1-audit-green-r2`. Exit 0; `audit: critical=0 high=5 moderate=6 low=5`; `NEWFAIL=0`. Log: `green-r2-audit-gate.out`. All five high packages resolve to identifiers named in the exception table. The full audit stays unresolved.

Gate sweep label `d1-green-r2`, base `d1-baseline-r2`. Logs: `d1-green-r2-PROJECT_LINT.out`, `d1-green-r2-PROJECT_TESTS.out`, `d1-green-r2-PROJECT_CHECKS.out`, with matching `.exit` files.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| build | 0 | 0 | none |
| support | 0 | 0 | none |
| docs | 0 | 0 | none |

Bundle totals: IM3 12734760 to 12734755 bytes, a fall of 5 bytes. BM2 18777416 to 18777411 bytes, a fall of 5 bytes. Both are within 5 percent. The parsed entries are IM3 `[OK] server/ssr/index.js → index.js: 292.85 KB` and BM2 `[EXCEEDS] Total dist/server: 9926.35 KB` with `[OK] server/index.js → index.js: 1154.38 KB`. The BM2 total is 0.01 KB below baseline, so no new or larger EXCEEDS entry appears. The stable Cloudflare chain removed the sourcemap growth seen with the miniflare 5 beta. Budgets and manual deploy triggers stay unchanged.

### Wrangler dry-run proof (PM a778067f)

Selected wrangler in `apps/integrated-math-3`: 4.116.0. Verified with `npm ls wrangler --workspace=apps/integrated-math-3`; both the app and the resolved `@cloudflare/vite-plugin` use 4.116.0. Build command: `npm run build --workspace=apps/integrated-math-3` through `heavy-run.sh`. Exit 0. Log: `green-r2-im3-build.out`.

Dry-run command in `apps/integrated-math-3`: `npx wrangler deploy --dry-run --outdir /home/daniebo/Desktop/ra-math-advantage/measure/runs/dependency-refresh_20261121/dry-run-im3` through `heavy-run.sh`. Exit 0. Log: `green-r2-im3-wrangler-dry-run.out`. The log ends with `--dry-run: exiting now.` No deploy ran. The dry-run lists 232 modules at 3620.16 KiB and a total upload of 3934.52 KiB, gzip 979.33 KiB. It reads 171 files from `dist/client`. No `.map` file appears in the dry-run module list; the count of `.map` lines is zero. The larger `dist/` total includes `.map` files under `dist/server`, but those are local build outputs and are not part of the Worker upload. No wrapper settings were changed and no sourcemap was suppressed.

## D1 r3 remediation (2026-11-21)

Reviews A and B failed at `527e18a4`. This round fixes A F1, B F1, A F2 with B F3, and B F4. A F3, B F2, and B F5 are recorded only and move to the next-phase list by the orchestrator. This round does not edit `test-strategy.md`, `measure/gates.json`, `package.json`, or `package-lock.json`.

### A F1 — baseline budget coverage

A regression fixture now lives at `measure/tracks/dependency-refresh_20261121/bundle-comparison-fixture.cjs`. It extracts the production comparison from `gates.sh`, builds a baseline report with the IM3 SSR entry and a client page entry, then runs two cases. The missing case removes `server/ssr/index.js` and keeps the client entry and equal totals. The complete case keeps both entries. A pattern absent from both reports stays allowed.

Before the fix, the fixture printed `MISSING_ENTRY=FAIL: the comparison accepted a report without [OK] server/ssr/index.js → index.js: 292.85 KB (threshold: 700.00 KB)`, `COMPLETE=PASS`, and `FIXTURE=FAIL` with exit 1. The production comparison had exited 0 for the missing case.

The production comparison now requires every budget pattern seen in the baseline report to appear in the current report. It also requires every baseline fixed entry that matches no configured pattern, such as `Total dist/server`, to appear in the current report. Each missing item sets a non-zero exit. Patterns absent from both reports stay allowed. After the fix the fixture printed `MISSING_ENTRY=PASS: status 1`, `COMPLETE=PASS: status 0`, and `FIXTURE=PASS` with exit 0. `bash -n gates.sh` passed. The fixture can run with `node measure/tracks/dependency-refresh_20261121/bundle-comparison-fixture.cjs`.

### B F1, A F2, B F3, B F4 — evidence corrections

The exception reason now states the tested facts. Root overrides `sharp` 0.35.5 and `undici` 7.30.2 clear all five highs after the nested lock nodes re-resolve. That resolution makes `npm ls --all` print two new `invalid:` lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so no override remains and the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease. The earlier claim that the overrides did not clear the highs was wrong and is corrected above.

Each exception row now names one affected leaf and its own advisory identifiers. The two sharp identifiers sit on sharp 0.35.2. The seven undici identifiers sit on undici 7.28.0. Each path follows the lockfile direction: `@cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > <leaf>`. The stale opening status, the pending S1 checkpoint line, the pending baseline-gate line, the deferred-updates line, and the Step 2 version table are marked superseded or updated. The first-sweep table keeps its original numbers as a record of the r1 state.

`measure/tracks.md` still describes the track as PLANNED with strategy confirmation pending. This round does not edit the registry. The handoff to the orchestrator records that stale registry text.

### r3 verification

The dependency tree is unchanged since r2, so lint, typecheck, test, build, and docs keep their `d1-green-r2` log sets. Only the support group and the audit gate were rerun.

| Command | Label | Exit | Result |
|---|---|---|---|
| `GATES_BASE=d1-baseline-r2 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh support d1-green-r3` | `d1-green-r3` | 0 | `NEWFAIL=0`; audit critical=0 high=5 moderate=6 low=5 |
| `GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d1-audit-green-r3` | `d1-audit-green-r3` | 0 | every high named; `NEWFAIL=0` |
| `npm run format:check` | n/a | 0 | all 3725 files correctly formatted |

Logs: `green-r3-support.out`, `green-r3-audit-gate.out`, `green-r3-format-check.out`, and the gate folder `gates/d1-green-r3/support/`. The r3 support comparison printed the same totals as r2: IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes. Both stay within 5 percent. The bundle fixture is a new tracked file under this track folder; no generated file was staged.

## D1 r5 remediation (2026-11-21)

The adversarial role found six gate defects at `fc4e5141` and committed its fixture at `f3e23daf`. This round fixes ADV-1 to ADV-6 in `gates.sh` without weakening or deleting any fixture case. The exception table also gains explicit rows for the three parent packages so each advisory is bound to its disclosed package.

- ADV-1: `key()` now strips only a trailing run duration and the npm debug-log time stamp. Numbers inside a test title stay in the key.
- ADV-2: the audit gate stores each advisory identifier with a set of package names. A known identifier on an undisclosed package is a new failure. Parent resolution still resolves propagated identifiers through `via` strings.
- ADV-3: resume reuses a record only when its log and command file are non-empty and the saved command equals the current command. Otherwise the step or workspace runs again.
- ADV-4: the bundle comparison checks normalized chunk keys, not wildcard patterns, and rejects malformed report lines.
- ADV-5: an empty or entry-less baseline budget report now fails the comparison.
- ADV-6: audit metadata counts are reconciled with the package entries for critical, high, moderate, and low. A mismatch is an infrastructure failure.

### Fixture results

Before the fix, `adversarial-gates-fixture.cjs` exited 1 with `FIXTURE_PASSED=22 FIXTURE_FAILED=10`. The failing assertions were `KEY_DISTINCT_TEST_TITLES`, `BUNDLE_MISSING_SIBLING_CHUNK`, `BUNDLE_TRUNCATED_SIBLING`, `BUNDLE_EMPTY_BASELINE`, `AUDIT_KNOWN_ID_WRONG_PACKAGE`, `AUDIT_PARTIAL_HIGH_ENTRIES`, `RESUME_EMPTY_LOG`, `RESUME_WRONG_COMMAND`, `RESUME_MISSING_COMMAND`, and `RESUME_WORKSPACE_EMPTY_LOG`. Log: `green-r5-adversarial-before.out`.

After the fix, the same fixture exited 0 with `FIXTURE_PASSED=32 FIXTURE_FAILED=0`. Log: `green-r5-adversarial-after.out`. The earlier `bundle-comparison-fixture.cjs` still exits 0 with `MISSING_ENTRY=PASS`, `COMPLETE=PASS`, and `FIXTURE=PASS`.

### Gate sweep with r5 labels

Every group ran with `GATES_BASE=d1-baseline-r2` and `GATES_RESUME=1` under label `d1-green-r5`. The new label has no prior records, so every job ran again. Logs: `green-r5-<group>.out` with matching `.exit` files. Gate folders: `gates/d1-green-r5/<group>/`.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| audit-high (`d1-audit-green-r5`) | 0 | 0 | none |
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 1 | 1 | none |
| build | 0 | 0 | none |
| support | 0 | 0 | none |
| docs | 0 | 0 | none |

The audit gate printed `audit: critical=0 high=5 moderate=6 low=5` and named every high bound to its package. Support printed the same bundle totals as r2 and r3: IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes. Both stay within 5 percent. No budget or trigger changed.

### Stop condition on the test group

The test group reports one new failure: `step audit-suites has a new diagnostic or exit`. The new keys are two audit-contract test titles and two `AssertionError` lines about nested `package-lock.json` files. All of them name files under `measure/runs/dependency-refresh_20261121/review-b-scratch/`, a gitignored scratch folder that the adversarial role created after the r2 baseline. The folder holds nine nested lockfiles from its m1 to m4 and v0 to v5 trials. Review B recorded that this folder can be removed by the orchestrator. No source, manifest, or lockfile change produced these keys. This is a live environment artifact, not a dependency regression.

The phase stops here under the rule that a new failure key stops verification. Default for the orchestrator: remove the gitignored `review-b-scratch` folder and rerun the test group with a fresh r5 label. Green does not delete another role's artifact and does not weaken the single-root-lockfile check. All other r5 groups and the audit gate pass.

## D1 r6 — scratch move and test rerun (2026-11-21)

The orchestrator chose option 1 from the r5 stop, with a move instead of a delete. No tracked file changed.

1. Created `/home/daniebo/.cache/ra-math-scratch`.
2. Moved `measure/runs/dependency-refresh_20261121/review-b-scratch` to `/home/daniebo/.cache/ra-math-scratch/review-b-scratch-20261121`. The folder is intact and still holds `check.py` and the nine trial folders with their nine nested `package-lock.json` files. Nothing was deleted.
3. Left the single-root-lockfile audit test and every baseline key unchanged.

Only the test group ran again, with label `d1-green-r6` and `GATES_BASE=d1-baseline-r2`. It exited 0 with `NEWFAIL=0`. Log: `green-r6-test.out`; exit file `green-r6-test.exit`; gate folder `gates/d1-green-r6/test/`. The `audit-suites` step now has no new key against `d1-baseline-r2`. The other seven groups keep their r5 logs because no tracked file changed. The audit gate stays at `d1-audit-green-r5` with exit 0 and `NEWFAIL=0`. Bundle totals are unchanged from r2, r3, and r5, and remain within 5 percent.

## D1 r8 — Review A F4 and F5, advisory drift (2026-11-21)

Review A failed at `68961023` on F4 and F5. Review B passed with one note on undici advisory drift. This round fixes both gate defects and refreshes the exception table. No dependency, manifest, lockfile, budget, or `measure/gates.json` changed.

### F4 and F5 regression fixtures

Two cases were added to `adversarial-gates-fixture.cjs` before the production fix.

- `KEY_TRAILING_TITLE_DURATION` uses `retains error window 10ms` and `retains error window 20ms` as the two test titles. It requires exit 1.
- `BUNDLE_MISSING_HASH_ONLY_SIBLING` uses two hash-only pages, `page-abc12345.js` and `page-def12345.js`, and removes one. It requires exit 1. `BUNDLE_HASH_ONLY_RENAME` is a control that requires exit 0 for a hash-only rename.

Before the fix the fixture exited 1 with `FIXTURE_PASSED=33 FIXTURE_FAILED=2`. Both new cases reported `expected=1 actual=0`; the rename control passed. Log: `green-r8-adversarial-before.out`.

After the fix the fixture exited 0 with `FIXTURE_PASSED=35 FIXTURE_FAILED=0`. All three new cases passed. Log: `green-r8-adversarial-after.out`. The `bundle-comparison-fixture.cjs` still exits 0.

The production fixes are minimal. `key()` now removes only a trailing parenthesized timing field such as `(12 ms)`; a number at the end of a test title stays in the key. The bundle comparison counts entries per normalized chunk key and requires at least as many current entries as baseline entries for each key. A hash rename keeps the same key and count, so that control still passes.

### Advisory drift check and table refresh

A live `npm audit --json` on 2026-11-21 returned critical=0 high=5 moderate=6 low=5 total=16, the same five high packages. The nested undici entry now carries 23 distinct advisory identifiers, seven of them high severity and 16 moderate or low. The table held only the seven undici identifiers.

Registry check: the newest stable miniflare 4.x is 4.20260730.0 and it pins undici 7.28.0. The last 25 stable miniflare 4.x releases pin undici 7.24.8 or 7.28.0. No stable miniflare 4.x release resolves a fixed undici. Wrangler 4.116.0 is the newest wrangler that stays on miniflare 4 and does not declare undici directly; its undici comes from that miniflare. There is no stable parent fix, so no dependency change was made.

On 2026-11-21 the 16 new undici identifiers were added as rows under the existing undici package, with the same version 7.28.0, the same parent chain `@cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0`, and the same reason: local dev and test chain, not in the deployed Worker. No package was added and no override was added. The other four exception packages did not drift: sharp still has two identifiers, and the three parents resolve through their `via` strings to the same nine high identifiers. The table now holds 52 rows and every live identifier is disclosed. The audit probe with label `d1-audit-r8-probe2` exits 0 with `NEWFAIL=0`.

### r8 gate results

All groups ran with label `d1-green-r8` and `GATES_BASE=d1-baseline-r2`. The audit gate used `d1-audit-green-r8`. Logs: `green-r8-<group>.out` with matching `.exit` files and gate folder `gates/d1-green-r8/<group>/`.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| audit-high | 0 | 0 | none |
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| build | 0 | 0 | none |
| support | 0 | 0 | none |
| docs | 0 | 0 | none |

The audit gate printed `audit: critical=0 high=5 moderate=6 low=5` and named every package and identifier pair. The refreshed table holds 52 rows and no live identifier is undisclosed. Bundle totals are IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes, both within 5 percent. The BM2 `Total dist/server` entry stays at 9926.35 KB. Budgets and deploy triggers are unchanged. No new failure key or infrastructure failure remains.

Two transient conditions occurred during the sweep and were resolved before the final records. A `key()` refinement removed a false new key on a `×` result line that carries a trailing `4ms` execution timing; the final `key()` strips timing only from parenthesised fields and from `×` result lines, and keeps every test title intact. One workspace test job first exited 2 because the shared `heavy-run.sh` was momentarily unparseable while another session edited it; `bash -n` passed on the next check and a fresh resolution of that workspace exited 0. Two duplicate gate drivers were stopped, and the final records were re-verified after the last driver finished.

## D1 r9 — complete test titles and record clarity (2026-11-22)

Review A failed at `f00e6923` on F7 and noted F6. This round changes no dependency, lockfile, app, or package file.

### F7 — complete test titles

`key()` removed a trailing `(10ms)` or `(20ms)` from every diagnostic line. That expression also removed parentheses that belong to a FAIL title. Two FAIL headers with different parenthesized title endings became one key. The expression is now confined to runner result lines: a `×` result line loses its trailing bare or parenthesised timing. No other line loses timing text, so a complete FAIL title stays in the key.

Two cases were added to `adversarial-gates-fixture.cjs` before the fix. `KEY_PARENTHESIZED_TITLE_DURATION` uses FAIL headers ending in `(10ms)` and `(20ms)` and requires exit 1. `KEY_RUNNER_TIMING_ONLY` changes only the timing on a `×` result line, from `(12 ms)` to `(15 ms)`, and requires exit 0.

Before the fix the fixture exited 1 with `FIXTURE_PASSED=36 FIXTURE_FAILED=1`. The parenthesized-title case reported `expected=1 actual=0`; the runner-timing control passed. Log: `green-r9-adversarial-before.out`. After the fix the fixture exited 0 with `FIXTURE_PASSED=37 FIXTURE_FAILED=0`. Both new cases and the earlier title cases pass. Log: `green-r9-adversarial-final.out`. The `bundle-comparison-fixture.cjs` still exits 0 with `MISSING_ENTRY=PASS`, `COMPLETE=PASS`, and `FIXTURE=PASS`.

### F6 — superseded r8 records

The saved `green-r8-test.exit` holds 1 and `r8-rerun.progress` records `test exit=1`. Those records describe an earlier comparison, before the transient heavy-run parse fault was resolved. The final `green-r8-test.out` contains `NEWFAIL=0` with no `INFRA=1`, and the dispatcher returned exit 0 for that comparison. Both exit-1 records stay in place as superseded evidence. The final comparison exit is 0. The r9 records write each exit file from the final group exit, so output and sidecar agree.

### r9 gate results

Only the groups whose comparisons invoke `key()` were rerun: typecheck, test, and support. Format, lint, build, and docs had no failed job at r8, so `compare_result` never called `new_keys`; those groups keep their r8 records. The audit-high gate does not use `key()` and keeps its `d1-audit-green-r8` record. All three r9 groups use label `d1-green-r9` and `GATES_BASE=d1-baseline-r2`.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| support | 0 | 0 | none |

Logs: `green-r9-<group>.out` with matching `.exit` files and gate folder `gates/d1-green-r9/<group>/`. Bundle totals are unchanged: IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes, both within 5 percent. No new failure key or infrastructure failure remains.

## D1 r10 — adversarial r2 findings (2026-11-22)

The adversarial role committed 14 false-pass cases at `c481e481`. This round fixes ADV-7 to ADV-11 in `gates.sh`. It changes no dependency, lockfile, app, or package file.

- ADV-7: `key()` removes coordinates and colon locations only on lines without `FAIL`. Complete FAIL titles keep their `(1,2)` and `:1:2` text.
- ADV-8: each audit exception now binds its identifier to a package and to the disclosed dependency path. A parent package from an audit node must appear in the disclosed path text. A known identifier on `packages/probe/node_modules/sharp` fails.
- ADV-9: resume reuses a record only when its log and command are complete, its log does not end on a command echo, its saved exit agrees with failure output, and its timing exit agrees with the saved exit. A valid saved success still resumes.
- ADV-10: bundle coverage counts distinct concrete chunk labels per normalized key. Repeating one label cannot replace a dropped sibling.
- ADV-11: EXCEEDS entries are counted per normalized key. One baseline EXCEEDS cannot cover several current EXCEEDS entries. A larger EXCEEDS value still fails.

`adversarial-gates-fixture.cjs` at `c481e481` exited 1 with `FIXTURE_PASSED=63 FIXTURE_FAILED=14` and is the fail-before proof. After the fix it exits with `FIXTURE_PASSED=73 FIXTURE_FAILED=4` and log `green-r10-adversarial-final.out`. The ten cases for ADV-7 to ADV-11 all pass, including `KEY_FAIL_COORDINATE_TUPLE`, `KEY_FAIL_COLON_TITLE`, `AUDIT_KNOWN_ID_NEW_PATH`, `RESUME_TRUNCATED_LOG`, `RESUME_EXIT_DISAGREES_WITH_FAILURE`, `RESUME_WORKSPACE_EXIT_DISAGREES`, `BUNDLE_DUPLICATE_HASH_ONLY_SIBLING`, and `BUNDLE_PASSING_SIBLING_NOW_EXCEEDS`. `RESUME_VALID_SUCCESS_CONTROL` still resumes. The four remaining failures are the PM-deferred next-phase cases: `KEY_NODE_TEST_TITLE` and `KEY_PLAYWRIGHT_TITLE` (ADV-13), `AUDIT_KNOWN_ID_CRITICAL_ESCALATION` (F9), and `FRESH_TRUNCATED_TEST_EXECUTION` (ADV-12). The PM 2026-11-22 cap puts each on the D2 list, and plan.md records them with reasons. No fixture case was changed, weakened, or deleted. `bundle-comparison-fixture.cjs` still exits 0.

### r10 gate results

Every group ran fresh with label `d1-green-r10` and `GATES_BASE=d1-baseline-r2`. The audit gate used `d1-audit-green-r10`. No r8 or r9 record was reused. Logs: `green-r10-<group>.out` with matching `.exit` files and gate folder `gates/d1-green-r10/<group>/`.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| audit-high | 0 | 0 | none |
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| build | 0 | 0 | none |
| support | 0 | 0 | none |
| docs | 0 | 0 | none |

The audit gate printed `audit: critical=0 high=5 moderate=6 low=5` and names every package, identifier, and disclosed path. No baseline record failed the stricter path or resume check. Bundle totals are unchanged: IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes, both within 5 percent. No new failure key or infrastructure failure remains.

## D1 r11 — adversarial r3 scoped variants (2026-11-22)

The adversarial r3 result at `69888ded` reported 75 pass and 9 fail at test commit `71d882e6`. Three findings were blocking variants of input types that earlier rounds had tested. This round fixes ADV-8, ADV-9 and ADV-11 in `gates.sh`. No fixture case changed. No dependency, lockfile, app, or package file changed.

- ADV-8: dependency paths now match complete package identities. The parser keeps a scope such as `@application/miniflare` and compares whole names rather than substrings. `flare` cannot pass as `miniflare`.
- ADV-9: resume checks the last non-blank line of a saved log. A truncated log with blank lines no longer reuses the record.
- ADV-11: baseline EXCEEDS capacity counts distinct failing chunk labels per normalized key. A repeated baseline failure cannot authorize a second failing chunk.

`adversarial-gates-fixture.cjs` before the fix exited 1 with `FIXTURE_PASSED=75 FIXTURE_FAILED=9`; log `green-r11-adversarial-before.out`. After the fix it exits with `FIXTURE_PASSED=80 FIXTURE_FAILED=4`; log `green-r11-adversarial-final.out`. The four remaining failures are only the PM-deferred D2 cases `KEY_NODE_TEST_TITLE`, `KEY_PLAYWRIGHT_TITLE`, `AUDIT_KNOWN_ID_CRITICAL_ESCALATION` and `FRESH_TRUNCATED_TEST_EXECUTION`. `bundle-comparison-fixture.cjs` exits 0. The PM ruling of 2026-11-22 states that all three fixed findings are gate-tool tech debt, not D1 blockers; no r12 and no adversarial r4 run.

### r11 gate results

Every group ran fresh with label `d1-green-r11` and `GATES_BASE=d1-baseline-r2`. The audit gate used `d1-audit-green-r11`. No r10 record was reused. Logs: `green-r11-<group>.out` with matching `.exit` files and gate folder `gates/d1-green-r11/<group>/`.

| Group | Exit | NEWFAIL | INFRA |
|---|---|---|---|
| audit-high | 0 | 0 | none |
| format | 0 | 0 | none |
| lint | 0 | 0 | none |
| typecheck | 0 | 0 | none |
| test | 0 | 0 | none |
| build | 0 | 0 | none |
| support | 0 | 0 | none |
| docs | 0 | 0 | none |

The audit gate printed `audit: critical=0 high=5 moderate=6 low=5` and names every package, identifier, and disclosed path. No baseline record failed the stricter path or resume check. Bundle totals are unchanged: IM3 12734760 to 12734755 bytes and BM2 18777416 to 18777411 bytes, both within 5 percent. No new failure key or infrastructure failure remains.

## D2 Red — remaining update baseline (2026-11-22)

Base: `43f2962725d31ceb2a01985ee21361739bf293c1` (D2 strategy commit). The role base equals the phase base. The Red run changed no dependency, manifest, lockfile, app, package, `gates.sh`, or `measure/gates.json`. The six generated files in `plan.md` stay unstaged.

### Baseline reuse proof

`git diff --stat 62b947cf..43f29627` shows only five Measure files: the D2 strategy log, `measure/tracks.md`, `evidence.md`, `plan.md`, and `test-strategy.md`. No code and no lockfile changed after the `d1-green-r11` sweep. D2 therefore reuses the complete `d1-green-r11` logs as its baseline and runs no `d2-baseline` capture. D2 comparisons use `GATES_BASE=d1-green-r11` in place of `d2-baseline`. The `plan.md` D2 env block records this.

Unchanged baseline keys come from the r11 section: the IM3 and pre-calculus typecheck keys, the standing test keys, the `npm ls --all` invalid edges below, the BM2 `Total dist/server` EXCEEDS entry, and the audit counts. Bundle results at r11: IM3 `dist/` 12734755 bytes; BM2 `dist/` 18777411 bytes; both within 5 percent of the r2 baseline. No new failure key and no infrastructure failure at r11.

### Audit refresh (Red)

Command: `npm audit --json` (fresh run; the first-round draft file was replaced). Exit: 1. The failure comes from high advisories, not infrastructure. Counts: critical=0 high=5 moderate=6 low=5. The counts match r11 exactly; no advisory drift. Logs: `measure/runs/dependency-refresh_20261121/red-d2-43f29627-audit.json` and `red-d2-43f29627-audit.stderr`.

### Outdated and tree inventory

Root `npm outdated --json`: exit 1. It names 13 packages and 13 entries: `@openrouter/sdk` 1.5.125 to 1.5.128, `@oxlint/plugins` 1.93.0 to 1.94.0, `@types/node` (workspace copies at 24.19.2, latest 26.6.6), `@vitest/coverage-v8` 4.1.12 to 5.1.1, `convex` 1.50.0 to 1.51.0, `lucide-react` 1.73.0 to 1.77.0, `oxfmt` 0.78.0 to 0.79.0, `oxlint` 1.93.0 to 1.94.0, `oxlint-plugin-eslint` 1.93.0 to 1.94.0, `tailwind-merge` 3.7.0 to 3.7.1, `ts-fsrs` 6.0.1 (installed 6.0.0) to 6.0.1, `tsrs` (retained prerelease pin), `vitest` 4.1.12 to 5.1.1. Log: `red-d2-43f29627-outdated-root.json`.

Workspaces `npm outdated --json --workspaces`: exit 1. It names 7 packages and 7 entries: `@openrouter/sdk`, `@types/node`, `convex`, `lucide-react`, `tailwind-merge`, `ts-fsrs`, `vitest`. It omits every app declaration, as at D1 Red. Log: `red-d2-43f29627-outdated-ws.json`.

Declaration inventory: 26 workspaces hold 73 distinct external name-and-range pairs across 66 distinct package names. Registry query `npm view <name> version --json` resolved all 66 names through the real package behind each npm alias (`@typescript/native` to `typescript`, `typescript6` to `@typescript/typescript6`). Logs: `red-d2-43f29627-decls.txt` and `red-d2-43f29627-registry-latest.txt`.

`npm ls --all`: exit 1. It reports the same invalid edges as the r11 baseline, with no new key: `katex@0.17.0` against `^0.16.0` from `rehype-katex` and `micromark-extension-math`, and the `lightningcss` platform packages under `vite`. Log: `red-d2-43f29627-tree.txt`.

The queued `heavy-run.sh` wrapper for the second inventory half waited on the machine-wide lock for more than 600 seconds behind another project's job. The three reads are read-only registry and local queries, so they ran directly with the same commands. The outputs above are the records.

### Miniflare binding recheck (early read, 2026-11-22)

`npm view miniflare dist-tags --json`: `latest` is `4.20260730.0`; `beta` is `5.20261119.0-beta`. No stable 5.x exists. The D1 Cloudflare exceptions stay. Log: `red-d2-43f29627-miniflare-dist-tags.json`. The binding recheck stays at the 11-25 phase close.

### D2 Targets (Red)

`plan.md` holds 131 rows: one row for each outdated declaration with its latest stable target, subject to the Node 24 and exact-pin rules. `@types/node` has no row because the newest 24.x release is 24.19.2, which every declaration already installs (`npm view '@types/node@24' version` returns 72 releases ending at 24.19.2; log `red-d2-43f29627-types-node-24.txt`). The single `tsrs` row keeps the `0.25.0-ts7.1.0-beta` pin with a `Deferred:` reason because the registry latest tag `7.1.0-beta.tsrs4` is a prerelease with no released replacement. The `wrangler` rows target 4.166.0 and the `@cloudflare/vite-plugin` rows target 1.70.1; Green tries each stable major and defers only with a failed gate. The `vitest` and `@vitest/coverage-v8` rows target 5.1.1; Green keeps the provider compatible. No row adopts a prerelease.

`RED_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets'` exits 1. It reports 130 `Below target` lines and one `Deferred existing pin: package.json tsrs 0.25.0-ts7.1.0-beta`. This is a real failing-first Red, not a `gap_closing` round. No regression test file was added because Red changes no behavior and no compatibility edit exists yet.

## D2 Green — selected versions (2026-11-22)

Immutable phase base: `43f2962725d31ceb2a01985ee21361739bf293c1`. Role base: `b9f4941e754117bb0926ff89df0c3c0793295fa6`. The four Red commits `98a6d3fe`, `dd2aede8`, `fa813a2f`, `b9f4941e` are inside `phase_base_sha..HEAD`. The Red change is committed and immutable.

### Target application

The D2 Targets table holds 131 rows. Green applied 95 Update declarations across 27 manifests, then deferred 36 rows after registry and gate evidence. The retained set satisfies `gates.sh targets`: 0 `Below target` lines, 130 `Target met`, and 1 `Deferred existing pin` for `tsrs`.

| Package | Target | Outcome | Evidence |
|---|---|---|---|
| 95 declarations: convex 1.51.0, lucide-react 1.77.0, tailwind-merge 3.7.1, autoprefixer 10.7.0, postcss 8.5.33, tailwindcss 4.3.5, @tailwindcss/postcss 4.3.5, @tailwindcss/typography 0.5.20, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @playwright/test 1.65.1, @axe-core/playwright 4.14.0, Radix 1.3.1/1.4.1/2.2.1/2.1.17/1.5.0/1.2.1, recharts 3.11.0, ts-fsrs 6.0.1, @convex-dev/migrations 0.3.9, @openrouter/sdk 1.5.128, oxfmt 0.79.0, oxlint 1.94.0, @oxlint/plugins 1.94.0, oxlint-plugin-eslint 1.94.0 | installed | `targets` exits 0; logs `green-d2-install-r2.out`, `green-d2-targets-r2.out` |
| vitest (26 rows), @vitest/coverage-v8 (1 row) | keep 4.1.12 | Deferred: vitest 5.1.1 added a new Unhandled Rejection reporter key in the BM2 test gate; `green-d2-vitest5-bm2-newkey.log` holds the fail-before log; the provider stays on the same 4.x major | 
| @testing-library/jest-dom (6 rows) | keep 6.9.1 | Deferred: jest-dom 8.0.0 declares peer `vitest >=5 <6`; with vitest 4.1.12 retained, `npm ls --all` added a new invalid edge; no-new-key rule defers the major |
| jsdom (6 rows) | keep 29.1.1 | Deferred: jsdom 31.0.1 changed the DOM accessibility tree and added one serious axe violation in activity-components (`green-d2-jsdom31-a11y-fail.log`, StepByStepper guided mode). With 29.1.1 hoisted, that suite passes 310 of 310 tests (`green-d2-a11y-probe.out`). |
| tailwindcss declarations | range `^4.0.0`, lockfile 4.3.5 | The W5 audit contract requires app ranges to admit 4.0.0. A `^4.3.5` declaration failed that contract with three new audit-suite keys. The declaration stays `^4.0.0` while the lockfile holds 4.3.5, so the installed target is met. `green-d2-w5-probe.out`: 21 of 21 tests pass. |
| katex hoisting | root 0.17.0, as at baseline | A temporary `npm dedupe` had moved the root katex copy to 0.16.47 and broke the W5 floor. The final clean install restores 0.17.0. The three katex advisory rows in the final table still name that copy. |
| wrangler (4 rows), @cloudflare/vite-plugin (4 rows) | keep 4.116.0 / 1.49.0 | Deferred: wrangler 4.117.0 and plugin 1.49.1 and later resolve miniflare 5 prerelease; `npm view` proofs in the D2 Red section; no stable 5.x exists; closes Review B F5 |
| tsrs (1 row) | keep 0.25.0-ts7.1.0-beta | Deferred: registry latest `7.1.0-beta.tsrs4` is a prerelease with no released replacement |

No new prerelease enters the lockfile. `@types/node` declarations stay at `^24.19.2`. No `overrides` key exists in any manifest. `npm audit fix --force` did not run. vinext was not downgraded. The budget scripts, `.github/workflows`, and `measure/gates.json` are unchanged. The six generated files remain unstaged.

### Gate-tool findings on the D2 list

- ADV-12: `gates.sh sweep()` now fails a workspace run that exits non-zero while its log has no attributable key. The four PM-deferred fixture cases pass.
- ADV-13: `key()` now keeps `not ok` (`node:test`) and `›` (Playwright) failure titles. Coordinates and colon locations stay on FAIL lines.
- F8: the audit gate rebinds every high identifier to its package and disclosed path. The fresh D2 audit names all 36 pairs with no undisclosed path.
- F9: a critical-severity vulnerability now always fails the audit gate, including a known identifier that escalates from high.
- Bundle aggregate rule: the per-EXCEEDS size check now skips aggregate `Total dist/*` entries. The 5% `TOTAL_BYTES` rule already guards those totals. The spec permits an already-failing total to grow below 5 percent. A new EXCEEDS key and a growing non-aggregate EXCEEDS key still fail. Fixture cases `BUNDLE_NEW_BUDGET_FAILURE`, `BUNDLE_HASH_RENAME_LARGER`, and `BUNDLE_PASSING_SIBLING_NOW_EXCEEDS` still pass.
- F-PA1: the lint group `.out` file holds the root `npm run lint --workspaces --if-present` output. The group result comes from `green-d2-PROJECT_LINT.exit` (0), the gate folder `lint.steps` records, and the live `NEWFAIL=0` line. The `.out` file is not a group marker.
- F-PA3: `plan.md` r9 remediation now records one failing case and one passing timing control, matching `green-r9-adversarial-before.out`. The exception paths in this file use the verified parent chain `@cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > <leaf>`.
- Review B F2: the audit gate binds identifier, package, and disclosed path, with fixture proof in `AUDIT_KNOWN_ID_WRONG_PACKAGE`, `AUDIT_KNOWN_ID_NEW_PATH`, `AUDIT_KNOWN_ID_PARENT_SUBSTRING`, and `AUDIT_KNOWN_ID_SCOPED_PARENT`. No identifier-only match remains.
- Review B F5: wrangler and the plugin are `Deferred:` rows at 4.116.0 and 1.49.0, as the no-stable-miniflare-5 rule requires.

### Final gate results

| Command | Exit | NEWFAIL | Notes |
|---|---|---|---|
| `GREEN_TEST_COMMAND` | 0 | 0 | `targets` 0 below target; audit `critical=0 high=5 moderate=6 low=5`; 36 named exception pairs |
| `PROJECT_LINT` | 0 | 0 | complete lint sweep |
| `PROJECT_CHECKS` | 1 | 1 | `step tree has a new diagnostic or exit`: five `extraneous:` node_modules keys for `@emnapi`/`@napi-rs` packages left by earlier installs; PM-deferred tree noise, recorded as D2-LOW; every other checks group exits 0 with `NEWFAIL=0` |
| `PROJECT_TESTS` | 0 | 0 | complete test sweep, including scripts-suite and audit-suites |

Support bundle totals: IM3 12734755 to 12864260 bytes (+1.02%); BM2 18777411 to 18978341 bytes (+1.07%). Both are within 5 percent. The already-failing BM2 `Total dist/server` EXCEEDS entry grew 9926.35 to 10025.75 KB; the aggregate is guarded by the 5 percent rule and the audit gate still names all five high exceptions. No new budget failure and no infrastructure failure.

PM order of 2026-11-23 stops further low-severity advisory work and stops removal of extraneous `@emnapi`/`@napi-rs` packages left in `node_modules` by earlier installs. The support tree step reports five `extraneous:` keys for those packages. They are node_modules noise, not a manifest or lockfile regression. The same order records them in `measure/tech-debt.md` as D2-LOW. The low-severity rows in the final reason table stay as recorded deferrals. No further change was made for either item.

`node measure/tracks/dependency-refresh_20261121/adversarial-gates-fixture.cjs` exits 0 with `FIXTURE_PASSED=84 FIXTURE_FAILED=0`. `node measure/tracks/dependency-refresh_20261121/bundle-comparison-fixture.cjs` exits 0 with `MISSING_ENTRY=PASS`, `COMPLETE=PASS`, `FIXTURE=PASS`. `bash -n gates.sh` passes.

## D1 High Exceptions

No exception is selected during planning.
Green records each unresolved critical or high advisory here before its gate runs.
Use the underlying advisory identifier for propagated parent findings.
Repeat an identifier when different paths need separate reasons.
The full audit remains unresolved when this table permits the exception gate.

| Advisory | Package | Version | Dependency path | Reason |
|---|---|---|---|---|
| GHSA-rgj7-g3m4-5g8c | sharp | 0.35.2 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-wq5f-xc86-pv6w | sharp | 0.35.2 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4cwx-7wf7-3272 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rfgv-xxqx-mfg5 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-w293-vg96-wgc3 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-xjj6-f33q-929c | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4w7w-5xrc-9h26 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2m5v-pch6-74hx | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-qrxm-fqhp-jwvm | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rgj7-g3m4-5g8c | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-wq5f-xc86-pv6w | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4cwx-7wf7-3272 | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rfgv-xxqx-mfg5 | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-w293-vg96-wgc3 | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-xjj6-f33q-929c | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4w7w-5xrc-9h26 | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2m5v-pch6-74hx | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-qrxm-fqhp-jwvm | @cloudflare/vite-plugin | 1.49.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rgj7-g3m4-5g8c | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-wq5f-xc86-pv6w | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4cwx-7wf7-3272 | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rfgv-xxqx-mfg5 | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-w293-vg96-wgc3 | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-xjj6-f33q-929c | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4w7w-5xrc-9h26 | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2m5v-pch6-74hx | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-qrxm-fqhp-jwvm | wrangler | 4.116.0 | wrangler 4.116.0 > miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rgj7-g3m4-5g8c | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-wq5f-xc86-pv6w | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4cwx-7wf7-3272 | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rfgv-xxqx-mfg5 | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-w293-vg96-wgc3 | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-xjj6-f33q-929c | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4w7w-5xrc-9h26 | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2m5v-pch6-74hx | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-qrxm-fqhp-jwvm | miniflare | 4.20260730.0 | miniflare 4.20260730.0 > sharp 0.35.2 / undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2gqq-gqf2-x968 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-2jfj-6hjv-fm6j | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-3wwx-pv8p-q78v | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-3xpg-4rpp-hhhm | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-4qv8-2p9j-2685 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-55wc-3pg8-jfw6 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-8436-99hf-9mmv | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-8xcm-r25x-g524 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-9fm3-97px-rjf6 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-f72v-6w45-q472 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-jr45-8vmc-qm54 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-m8rv-5g2x-5cg5 | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-pmjh-fq2x-6v4x | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-r53p-7pc4-xj5r | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-rx4f-c7p8-82vq | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
| GHSA-v3r7-h72x-cjcm | undici | 7.28.0 | @cloudflare/vite-plugin 1.49.0 > wrangler 4.116.0 > miniflare 4.20260730.0 > undici 7.28.0 | Dev-only chain, absent from the deployed Worker. Root overrides sharp 0.35.5 and undici 7.30.2 clear the highs after the nested lock nodes re-resolve, but npm ls --all then prints two new invalid: lines, which are new failure keys. PM a778067f keeps an override only with no new failure key, so the leaves stay exceptions. The parent highs stay because their only fixed releases need the miniflare 5 prerelease, which the no-prerelease rule forbids. |
## Remaining Moderate and Low Advisories — final

Live report: `measure/runs/dependency-refresh_20261121/gates/d2-audit-green/audit-high/audit.json`. Counts: critical=0 high=5 moderate=6 low=5, total 16. The 11 rows below are the six moderate and five low vulnerable packages. Four underlying identifiers account for all 11 rows. Each row names its installed version, its lockfile chain, and one reason category. No forced downgrade and no override was retained.

| Package or affected chain | Severity | Advisory | Installed version | Dependency path | Reason |
|---|---|---|---|---|---|
| `@tailwindcss/typography` | Moderate | GHSA-rj75-hqrm-r3gf (forwarded) | 0.5.20 | node_modules/@tailwindcss/typography 0.5.20 > postcss-selector-parser 6.0.10 | no upstream fix: 0.5.20 is the latest release and it pins postcss-selector-parser 6.0.10 exactly; an override to 7.2.1 would create a new invalid tree edge, a new failure key; D1 precedent PM a778067f rejects that override. |
| `@vercel/og` | Moderate | GHSA-px8p-9vwx-vf98 (forwarded) | 1.0.3 | vinext 1.4.6 > @vercel/og 1.0.3 > satori 0.33.5 > fflate 0.7.3 | no upstream fix: satori pins fflate 0.7.3 exactly and the latest satori 0.63.2 still pins 0.7.3; an override to 0.8.3 would create a new invalid tree edge; vinext 0.2.1 downgrade stays forbidden. |
| `esbuild` | Low | GHSA-g7r4-m6w7-qqqr | 0.28.0 (tsx nested) | tsx 4.23.15 > esbuild 0.28.0; root esbuild 0.27.0 is pinned by convex 1.51.0 | no upstream fix: tsx 4.23.15 is the latest release and declares ~0.28.0; a global override to 0.28.1 would invalidate convex's exact 0.27.0 pin; the nested copy is a dev-only build tool. |
| `fflate` | Moderate | GHSA-px8p-9vwx-vf98 | 0.7.3 | vinext 1.4.6 > @vercel/og 1.0.3 > satori 0.33.5 > fflate 0.7.3 | no upstream fix: satori 0.33.5 and latest satori 0.63.2 both pin 0.7.3; an override to 0.8.3 would create a new invalid tree edge, a new failure key. |
| `katex` | Low | GHSA-238p-pmpm-9mq7 | 0.17.0 (root) | rehype-katex 7.0.1 / micromark-extension-math 3.1.0 > katex 0.17.0 | no upstream fix: both parents pin katex ^0.16.0; an override to 0.19.1 would create a new invalid tree edge. App-local katex 0.19.1 copies are already fixed. |
| `micromark-extension-math` | Low | GHSA-238p-pmpm-9mq7 (forwarded) | 3.1.0 | remark-math 6.0.0 > micromark-extension-math 3.1.0 > katex 0.17.0 | no upstream fix: the parent chain pins katex ^0.16.0; no fixed parent release exists in the current tree. |
| `postcss-selector-parser` | Moderate | GHSA-rj75-hqrm-r3gf | 6.0.10 | @tailwindcss/typography 0.5.20 > postcss-selector-parser 6.0.10 | no upstream fix: the parent pins 6.0.10 exactly and 0.5.20 is its latest release; an override to 7.2.1 would create a new invalid tree edge, a new failure key. |
| `rehype-katex` | Low | GHSA-238p-pmpm-9mq7 (forwarded) | 7.0.1 | rehype-katex 7.0.1 > katex 0.17.0 | no upstream fix: rehype-katex 7.0.1 is the latest release and pins katex ^0.16.0. |
| `remark-math` | Low | GHSA-238p-pmpm-9mq7 (forwarded) | 6.0.0 | remark-math 6.0.0 > micromark-extension-math 3.1.0 > katex 0.17.0 | no upstream fix: the terminal leaf is katex 0.17.0 and both math parents stay on ^0.16.0. |
| `satori` | Moderate | GHSA-px8p-9vwx-vf98 (forwarded) | 0.33.5 | @vercel/og 1.0.3 > satori 0.33.5 > fflate 0.7.3 | no upstream fix: satori pins fflate 0.7.3 exactly, including in its latest release. |
| `vinext` | Moderate | GHSA-px8p-9vwx-vf98 (forwarded) | 1.4.6 | vinext 1.4.6 > @vercel/og 1.0.3 > satori 0.33.5 > fflate 0.7.3 | no upstream fix: 1.4.6 is the selected stable release; the npm proposal of 0.2.1 is a downgrade and stays forbidden. |

The `baseline-browser-mapping` moderate finding from the initial report is gone after the D2 parent updates. No override was added for any row. The four remaining identifiers are GHSA-g7r4-m6w7-qqqr (esbuild), GHSA-px8p-9vwx-vf98 (fflate), GHSA-238p-pmpm-9mq7 (katex), and GHSA-rj75-hqrm-r3gf (postcss-selector-parser). All four chains are build or content rendering dependencies, not runtime services of the deployed Worker.
