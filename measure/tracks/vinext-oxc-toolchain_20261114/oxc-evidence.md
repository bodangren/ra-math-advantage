# Oxc Toolchain Evidence: vinext-oxc-toolchain_20261114

Track: `vinext-oxc-toolchain_20261114`
Specification: [spec.md](./spec.md) ("Evidence File Contract")

Each phase fills its sections. The S1 Baseline task filled sections 1, 2, 5, 8, and 10 on
2026-11-14 and 2026-11-15, before any package change. The S1 Implement tasks fill sections 3
and 4. Section 11 stays empty until Phase S5.

Raw logs are in `measure/runs/vinext-oxc-toolchain_20261114/` (gitignored):
`gates/baseline/` (one log for each workspace and step), `baseline/` (install, bundle, timing,
and dev-server logs), and `ux-baseline-*` (browser capture).

## 1. Environment

Measured on 2026-11-14, before any package change.

| Item | Value |
|------|-------|
| CPU model | Intel(R) Core(TM) i5-3470S CPU @ 2.90GHz |
| Cores (`nproc`) | 4 (1 thread for each core, 1 socket) |
| RAM (`free -g`) | 7 GB total |
| OS (`uname -sr`) | Linux 7.0.0-43-generic |
| Node (`node -v`) | v24.19.0 |
| npm (`npm -v`) | 11.17.0 |
| vinext (lockfile) | 0.0.55 |
| TypeScript (lockfile) | 6.0.3 |
| ESLint (lockfile) | 10.4.1 |
| Convex (lockfile) | 1.40.0 |
| Vite (lockfile) | 8.0.16 |
| Vitest (lockfile) | 4.1.8 |
| React (lockfile) | 19.2.7 |
| next (lockfile) | 16.2.7 |

## 2. Baseline gates

Baseline: `npm ci` on the committed lockfile (exit code 0), vinext 0.0.55, TypeScript 6.0.3.
Each cell is an exit code. `n/a` means that the workspace has no such script. A non-zero code
is a pre-existing failure. Section 10 lists each one.

| Workspace | lint | typecheck | test | build |
|---|---|---|---|---|
| `apps/bus-math-v2` | 1 | n/a | 1 | 0 |
| `apps/integrated-math-1` | 0 | 1 | 1 | 0 |
| `apps/integrated-math-2` | 0 | 1 | 1 | 0 |
| `apps/integrated-math-3` | 0 | 2 | 1 | 0 |
| `apps/pre-calculus` | 0 | 2 | 1 | 0 |
| `packages/activity-components` | 2 | 2 | 0 | 1 |
| `packages/activity-runtime` | 0 | 0 | 0 | 0 |
| `packages/ai-tutoring` | 1 | 0 | 0 | 0 |
| `packages/app-shell` | 2 | 2 | 1 | 2 |
| `packages/component-approval` | 0 | 0 | 0 | 0 |
| `packages/core-auth` | 0 | 0 | 0 | 0 |
| `packages/core-convex` | 0 | 0 | 0 | 0 |
| `packages/efficacy-core` | 0 | 0 | 1 | 0 |
| `packages/graphing-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-practice` | 0 | 2 | 0 | 1 |
| `packages/lesson-renderer` | n/a | 0 | 1 | 0 |
| `packages/math-content` | 2 | 2 | 1 | 1 |
| `packages/practice-core` | 0 | 0 | 0 | 0 |
| `packages/practice-test-engine` | 2 | 0 | 0 | n/a |
| `packages/rate-limiter` | 2 | 0 | 0 | 0 |
| `packages/srs-engine` | 1 | 0 | 0 | 0 |
| `packages/study-hub-core` | 0 | 0 | 0 | 0 |
| `packages/teacher-reporting-core` | 0 | 0 | 0 | 0 |
| `packages/_template` | 0 | 0 | 1 | 0 |
| `packages/workbook-pipeline` | 0 | 0 | 0 | 0 |

Steps of the `test` and `checks-all` gates:

| Step | Exit code | Note |
|---|---|---|
| `scripts-suite` | 1 | No test file found: `include` of `scripts/vitest.config.ts` matches nothing from the repository root (section 10, section 8) |
| `audit-suites` | 1 | 2 tests fail (section 10) |
| `typecheck-bm2` | 2 | bus-math-v2 has no `typecheck` script (section 10) |
| `boundary` | 0 | pass |
| `ci-check` | 0 | pass |
| `tree` | 0 | pass |
| `next-absent` | 1 | Red by design: `next` 16.2.7 is installed. This is the target of S1 |
| `measure-contract` | 1 | FAIL: A12 regression (section 10) |

Other baseline results:

| Check | Result |
|-------|--------|
| `npm audit --json` | critical=2 high=17 moderate=18 low=5 |
| `npm run bundle-size:audit --prefix apps/integrated-math-3` | exit 0. `server/ssr/index.js` is 531.83 KB (threshold 700.00 KB) |
| `npm run bundle:audit --workspace=apps/bus-math-v2` | exit 1 (pre-existing). Total `dist/server` is 11299.69 KB (threshold 3000.00 KB). `server/index.js` is 2690.45 KB (threshold 2500.00 KB) |
| `npm run test:e2e --prefix apps/integrated-math-3` | not run locally (section 8) |
| Dev server `GET /` on port 4101 (integrated-math-1) | 200, first response after 28 s |
| Dev server `GET /` on port 4102 (integrated-math-2) | 200, first response after 22 s |
| Dev server `GET /` on port 4103 (integrated-math-3) | 200, first response after 27 s (second run, under `heavy-run.sh`) |
| Dev server `GET /` on port 4104 (pre-calculus) | 200, first response after 33 s |
| Dev server `GET /` on port 4105 (bus-math-v2) | 200, first response after 33 s (under `heavy-run.sh`) |
| Browser capture, `http://localhost:4103/` | title "Integrated Math 3", first h1 "IM3", 0 console errors, 0 page errors, 0 failed requests |
| Browser capture, `http://localhost:4105/` | title "Math for Business Operations: Applied Accounting with Excel", first h1 "Math for Business Operations", 1 console error ("Failed to load landing data from Convex", "Network connection lost"), 0 page errors, 0 failed requests |

The browser capture files are `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-<port>-*`
(screenshot, accessibility snapshot, console list, error list, title). The Convex error on
port 4105 comes from the backend, not from the runtime. The UX role compares with it as the
baseline.

### Merged tree (baseline-m2, 2026-11-17)

The capture ran on the merged tree at commit `3f05afe3`, after `npm ci`. The labels are
`lint baseline-m2`, `test baseline-m2`, and `checks-all baseline-m2`. A label that starts with
`baseline` records only, so the capture made no comparison.

Each cell is an exit code. `n/a` means that the workspace has no such script. A non-zero code
is a pre-existing failure of the merged tree. The merged-tree part of section 10 lists each
one. The four `.exit` files hold 27 names each: 6 apps and 21 packages.

| Workspace | lint | typecheck | test | build |
|---|---|---|---|---|
| `apps/bus-math-v2` | 0 | n/a | 1 | 0 |
| `apps/danielson` | 0 | 0 | 0 | 0 |
| `apps/integrated-math-1` | 0 | 0 | 1 | 0 |
| `apps/integrated-math-2` | 0 | 0 | 0 | 0 |
| `apps/integrated-math-3` | 0 | 2 | 1 | 0 |
| `apps/pre-calculus` | 0 | 2 | 1 | 0 |
| `packages/activity-components` | 0 | 0 | 0 | 0 |
| `packages/activity-runtime` | 0 | 0 | 0 | 0 |
| `packages/ai-tutoring` | 0 | 0 | 0 | 0 |
| `packages/app-shell` | 0 | 0 | 0 | 0 |
| `packages/component-approval` | 0 | 0 | 0 | 0 |
| `packages/core-auth` | 0 | 0 | 0 | 0 |
| `packages/core-convex` | 0 | 0 | 0 | 0 |
| `packages/efficacy-core` | 0 | 0 | 0 | 0 |
| `packages/graphing-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-core` | 0 | 0 | 0 | 0 |
| `packages/knowledge-space-practice` | 0 | 0 | 0 | 0 |
| `packages/lesson-renderer` | 0 | 0 | 0 | 0 |
| `packages/math-content` | 0 | 0 | 1 | 0 |
| `packages/practice-core` | 0 | 0 | 0 | 0 |
| `packages/practice-test-engine` | 0 | 0 | 0 | n/a |
| `packages/rate-limiter` | 0 | 0 | 0 | 0 |
| `packages/srs-engine` | 0 | 0 | 0 | 0 |
| `packages/study-hub-core` | 0 | 0 | 0 | 0 |
| `packages/teacher-reporting-core` | 0 | 0 | 0 | 0 |
| `packages/_template` | 0 | 0 | 1 | 0 |
| `packages/workbook-pipeline` | 0 | 0 | 0 | 0 |

Every workspace lint exits 0. The merge removed the pre-merge lint failures: the 5 app configs
no longer load `eslint-config-next`, and the 4 packages run `oxlint` with the root config
(section 3, section 8).

Steps of the `test` and `checks-all` gates:

| Step | Exit code | Note |
|---|---|---|
| `scripts-suite` | 1 | 7 of 31 tests fail: the six red S1 cases and `remediate-concept-blueprints` (section 10) |
| `audit-suites` | 1 | 24 of 192 tests fail in 5 files (section 10) |
| `typecheck-bm2` | 0 | pass |
| `boundary` | 0 | pass |
| `ci-check` | 0 | pass |
| `tree` | 0 | pass |
| `next-absent` | 1 | Red by design: `next` is installed on the merged tree. S1 removes it |
| `measure-contract` | 1 | FAIL: A12 regression (section 10) |

Other results of the merged-tree capture:

| Check | Result |
|---|---|
| `npm audit --json` | critical=0 high=11 moderate=6 low=5 |
| Bundle audits | Not part of the merged-tree capture. The pre-merge values above stay the only record. The S1 Verify task runs both audits again (strategy 6.3 step 7) |
| `npm run build --workspace=apps/danielson` | exit 0. Vite 8.3.8. 577 client modules and 2280 server modules, 5 of 5 phases passed. Log `measure/runs/vinext-oxc-toolchain_20261114/danielson-build.log` |
| Dev server `GET /` on port 4106 (danielson) | 307, `location: http://localhost:4106/auth/login?redirect=%2F`. The redirect is the login gate: a baseline fact, not a finding. Port 4106 is free after the stop |
| Browser capture, `http://localhost:4106/` | final URL `http://localhost:4106/auth/login?redirect=%2F`, title "Danielson Teacher Growth", 39 accessibility nodes, 1 console error, 0 page errors |

The danielson capture folder is
`measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-m2-danielson/`. It holds
`danielson-screenshot.png` (28322 bytes, full page), `danielson-snapshot.txt`,
`danielson-console-errors.txt`, `page.html`, and `capture-result.json`. The agent-browser CLI
is not installed on this machine (section 8). The capture used Playwright 1.60.0 with the
installed Chrome. The single console error is `Failed to load resource: the server responded
with a status of 404 ()`, a missing resource at the login gate. There is no hydration error
and no module error.

The merged-tree record of the five other apps holds their gate exit codes only. Their dev
status rows and browser capture rows above come from the pre-merge run of 2026-11-15.

**Comparison base.** The pre-merge folder
`measure/runs/vinext-oxc-toolchain_20261114/gates/baseline/` holds 26 names and no
`apps/danielson`. It is historical. It is not a comparison base, and no role deletes it. The
base for every S1 gate is `baseline-m2`, with 27 names. A phase run whose workspace set
differs from the `baseline-m2` set is a new failure. Plan box 116 and strategy 6.4 and 14.4
record this rule. `GATES_BASE` unset selects the 26-name `baseline` folder, so the gate fails
on `apps/danielson` at once.

### S3 Green run (2026-11-19)

Tree: `ec3a05ae`. Labels: `lint s3`, `test s3`, and `checks-all s3`, all with
`GATES_BASE=baseline-m2`.

| Gate | Exit | Result line |
|---|---|---|
| `lint s3` | 0 | `NEWFAIL=0`. The 27 results of the r3 run at `7ae37932` were reused with `GATES_RESUME=1`; all exit 0 |
| `test s3` | 0 | `NEWFAIL=0` |
| `checks-all s3` | 0 | `NEWFAIL=0`; `audit: critical=0 high=9 moderate=7 low=5` (baseline `high=11`) |

Steps of `test s3`: `scripts-suite` exit 1 and `audit-suites` exit 1. Both codes equal
`baseline-m2`, and neither log holds a new diagnostic key. `scripts-suite` holds exactly one
failure: `remediate-concept-blueprints > production scan reports the honest count for the
current repo state` (S1 Q3). `audit-suites` holds 5 failures in 2 files, all pre-existing
(section 10).

Steps of `checks-all s3`: `boundary` 0, `ci-check` 0, `tree` 0, `next-absent` 0, and
`measure-contract` 1 (pre-existing). The typecheck sweep exits 1 in `apps/integrated-math-3`
and `apps/pre-calculus`; `baseline-m2` exits 2 there with the same diagnostic keys. The build
sweep exits 0 in all 27 workspaces.

**First gate fix.** The first `test s3` run reported one new step key: three W4 audit
assertions pinned the TypeScript 6.x line. `test(audit): move the W4 typescript target forward
to 7` (`ec3a05ae`) moves them to 7.0.2 with the same strength: one major line, and every
declared range admits the installed release. The next run reported `NEWFAIL=0`.

**Filter results.** `-t 'S3 tsrs'`: 8 passed, exit 0. S1 cases 5, 5b, and 6: passed.
`S2 oxlint`: 7 passed. `S2 adversarial`: 13 passed. `node scripts/validate-ci.mjs`: exit 0.

**IM3 TS2322 probe.** The probe `apps/integrated-math-3/convex/__oxc_probe__.ts` held
`export const n: number = "x";`. `npm run typecheck --workspace=apps/integrated-math-3` exits
1 with the pre-existing diagnostics and prints
`convex/__oxc_probe__.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.`
The probe was deleted. `git status --porcelain` holds no probe path. The probe was not committed.

## 3. Package changes

Filled by the S1 Implement tasks. The lockfile is the root `package-lock.json` only.

### Commit dcde148d: vinext 1.x and the removal of `next`

| Package | Old range | New range | Workspaces | Notes |
|---|---|---|---|---|
| `vinext` | `^0.0.55` | `^1.4.5` | root dev, 5 apps dev, `packages/app-shell` peer + dev | resolves to 1.4.5 everywhere |
| `next` | `^16.0.0` (16.2.7 installed) | removed | root dev + overrides, 5 apps dep, `packages/app-shell` peer | lockfile entry gone; `npm ls next --all` prints `(empty)` |
| `react`, `react-dom` | `^19.2.7` | `^19.3.1` | 5 apps dep; `react` also `packages/app-shell` dev | vinext 1.4.5 peer requirement |
| `react-server-dom-webpack` | `^19.2.7` | `^19.3.1` | root dev | vinext peer |
| `@vitejs/plugin-rsc` | `^0.5.27` | `^0.5.37` | IM1, IM2, IM3, PreCalc, BM2 dev | PreCalc had no other change |
| `vite` | `^8.0.0` | `^8.3.8` | 5 apps dev | latest 8.x |
| `@vitejs/plugin-react` | `^6.0.0` | `^6.3.0` | root dev | latest |
| `js-yaml` | (transitive only) | `^5.5.0` added | root dev | S1 case 7 reads the workflow YAML with it; S5 needs it too |
| `geist` | `^1.5.1` | removed | IM3, BM2 dep | dead dependency: no code imports it, and its required `next` peer made npm reinstall `next` (auto-install-peers) |
| (tsconfig) | `{ "name": "next" }` plugin | removed; `"vinext/types"` added to `types` | 5 apps + `packages/app-shell` | case 4 |
| (CI) | `node-version: '20'` | `'24'` | `ci.yml` (7 steps), `cloudflare-deploy.yml` (1 step) | `scale-benchmarks.yml` already had 24.4.0 |
| (lint configs) | imports of `eslint-config-next` | removed, with the `@typescript-eslint/no-explicit-any` block | 5 apps `eslint.config.mjs` | `eslint-config-next` loads `next/dist/compiled/babel/eslint-parser` at config time; see section 8 |
| (`.gitignore`) | — | `apps/*/.next/`, `apps/*/.vinext/` added | root | vinext 1.x builds make `.vinext/`; IM3's tracked `routes.d.ts` stays tracked |

### Merge commit 7fa14b56: the RSC hotfix (GHSA-xqc2-xf4c-x3h3)

| Package | Range | Workspaces | Notes |
|---|---|---|---|
| `react-server-dom-webpack` | `^19.3.1` in root dev and in the `dependencies` of the 5 apps | root, 5 apps | the hotfix added the app declarations (the plugin uses the installed package only when the app declares it); the S1 range admits the installed 19.3.1, which contains the 19.2.9 fix |

### Commit A: minor and patch updates

| Package | Old range | New range | Workspaces | Notes |
|---|---|---|---|---|
| `@testing-library/react` | `^16.3.0` | `^16.3.3` | 4 apps + BM2 dev, `packages/activity-components`, `packages/app-shell` | |
| `@types/node` | `^22` / `^22.20.0` / `^22.19.20` | `^24.19.2` (latest 24.x) | 5 apps, `packages/ai-tutoring`, `core-auth`, `core-convex`, `lesson-renderer`, `practice-core` | matches CI Node 24 (plan); latest 26.x not used |
| `@types/react` | `^19` | `^19.3.0` | 5 apps, `activity-components`, `app-shell`, `lesson-renderer`, `study-hub-core` | |
| `@types/react-dom` | `^19` | `^19.3.0` | 5 apps | |
| `convex` | `^1.40.0` | `^1.50.0` | 5 apps, `app-shell`, `core-convex` | |
| `katex` | `^0.17.0` | `^0.19.1` | IM3, `activity-components`, `lesson-renderer` | |
| `lucide-react` | `^1.0.0` | `^1.73.0` | 5 apps, `app-shell`, `lesson-renderer` | |
| `tailwind-merge` | `^3.3.0` | `^3.7.0` | 5 apps, `lesson-renderer` | |
| `zod` | `^4.1.12` | `^4.6.7` | IM1-3, PreCalc, BM2, `activity-components`, `efficacy-core`, `knowledge-space-core`, `knowledge-space-practice`, `math-content`, `practice-core` | `srs-engine` has no own zod range |

Not changed, by plan: `typescript` (S3), `eslint`, `@eslint/js`, `@eslint/eslintrc`,
`typescript-eslint`, `eslint-config-next` (S2 removes them).

## 4. Held packages

None. S1 held no package (phase acceptance 413a2138, 2026-11-18).

## 5. Speed

Method: the plan "Timing Method". The build of the gate sweep was run 1 (it filled the cache).
Runs 2 to 4 deleted `dist/` first and were timed inside `heavy-run.sh`, so lock waits are not
in the values. The Oxc tools and TypeScript 7 have no "before" row yet. Phases S2 to S4 add
them.

| Task | Tool before | Seconds before | Tool after | Seconds after | Ratio |
|---|---|---|---|---|---|
| `npm ci` (empty `node_modules`) | npm 11.17.0, lockfile of the baseline | 417.0 (includes a heavy-run load hold wait; an upper bound) | not in the S1 Verify box list; the closeout gate runs it | pending (closeout) | pending |
| `npm run build` in `apps/integrated-math-1` (median of 3) | vinext 0.0.55 | 18.5 | vinext 1.4.6 | 6.6 | 0.35 |
| `npm run build` in `apps/integrated-math-2` (median of 3) | vinext 0.0.55 | 18.1 | vinext 1.4.6 | 9.5 | 0.52 |
| `npm run build` in `apps/integrated-math-3` (median of 3) | vinext 0.0.55 | 31.5 | vinext 1.4.6 | 12.0 | 0.38 |
| `npm run build` in `apps/pre-calculus` (median of 3) | vinext 0.0.55 | 18.3 | vinext 1.4.6 | 10.8 | 0.59 |
| `npm run build` in `apps/bus-math-v2` (median of 3) | vinext 0.0.55 | 43.4 | vinext 1.4.6 | 14.8 | 0.34 |
| `npm run build` in `apps/danielson` (median of 3) | vinext 0.0.55 (nested copy, pre-S1) | not timed at the baseline | vinext 1.4.6 | 6.0 | n/a |

S1 method: three runs per app, `dist/` kept (vite empties `outDir`, so the dist state does
not change the measurement), each run timed around `npm run build` inside one
`heavy-run.sh` job. All 18 runs exit 0. Raw values: `build-times-verify.txt` in the run
folder (IM1 6554/6531/6755 ms, IM2 9413/9477/9956, IM3 12558/11971/11838, PreCalc
11114/10279/10795, BM2 14879/14761/14781, danielson 6424/4510/6004).

### S2 lint timing (2026-11-18; re-run 2026-11-19)

Method: the plan "Timing Method". One warm `npm run lint` run per workspace, then
3 timed runs with bash `time` and `TIMEFORMAT=%R`. The table holds the median of
the 3 runs. The values include the npm overhead (about 0.5 s). Raw values:
`s2-lint-timing-r3.txt` in the run folder (force-added; the 2026-11-19 re-run
through `heavy-run.sh`). The re-run medians replaced 6 values of the first run
(BM2 9.2 to 8.9, IM3 4.5 to 4.6, PreCalc 3.3 to 3.2, knowledge-space-practice 0.6
to 0.7, practice-core 0.6 to 0.7, practice-test-engine 0.5 to 0.6). "Before" is
`n/a` for every row: no ESLint config remains, so no ESLint timing can run on
this tree (section 8).

| Task | Tool before | Seconds before | Tool after | Seconds after | Ratio |
|---|---|---|---|---|---|
| `npm run lint` in `apps/bus-math-v2` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 8.9 | n/a |
| `npm run lint` in `apps/danielson` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 2.3 | n/a |
| `npm run lint` in `apps/integrated-math-1` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 1.2 | n/a |
| `npm run lint` in `apps/integrated-math-2` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 1.5 | n/a |
| `npm run lint` in `apps/integrated-math-3` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 4.6 | n/a |
| `npm run lint` in `apps/pre-calculus` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 3.2 | n/a |
| `npm run lint` in `packages/activity-components` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/activity-runtime` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/ai-tutoring` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/app-shell` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/component-approval` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/core-auth` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/core-convex` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/efficacy-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/graphing-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/knowledge-space-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/knowledge-space-practice` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/lesson-renderer` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/math-content` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/practice-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/practice-test-engine` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/rate-limiter` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/srs-engine` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.7 | n/a |
| `npm run lint` in `packages/study-hub-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/teacher-reporting-core` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |
| `npm run lint` in `packages/workbook-pipeline` (median of 3) | ESLint (no config remains) | n/a | oxlint 1.93.0 | 0.6 | n/a |

### S3 type-check "before" timing (2026-11-19)

Method: the plan "Timing Method". One warm `tsc --noEmit` run per workspace, then
3 timed runs with bash `time` and `TIMEFORMAT=%R`, in one `heavy-run.sh` job with
no concurrent heavy job. `tsconfig.tsbuildinfo` deleted before each run. The
command is the workspace `typecheck` script (`npm run typecheck
--workspace=<ws>`), except bus-math-v2, which has no `typecheck` script and runs
`npx --no-install tsc --noEmit -p apps/bus-math-v2/tsconfig.json`. TypeScript is
6.0.3 (`npx tsc --version` prints `Version 6.0.3`). The table holds the median of
the 3 runs. The values include the npm overhead (about 0.5 s). Raw values:
`s3-tsc-before-raw.txt` in the run folder (force-added). The warm exits of
`apps/integrated-math-3` (exit 2) and `apps/pre-calculus` (exit 2) are the
pre-existing failures of section 10 (merged-tree part); the exit 2 is the
cacheless form of the 1-vs-2 artifact of plan line 226.

| Task | Tool before | Seconds before | Tool after | Seconds after | Ratio |
|---|---|---|---|---|---|
| `tsc --noEmit` in `apps/bus-math-v2` (median of 3) | tsc 6.0.3 | 17.9 | tsc 7.0.2 | 2.38 | 0.13 |
| `tsc --noEmit` in `apps/danielson` (median of 3) | tsc 6.0.3 | 5.8 | tsrs 0.25.0-ts7.1.0-beta | 4.30 | 0.74 |
| `tsc --noEmit` in `apps/integrated-math-1` (median of 3) | tsc 6.0.3 | 9.1 | tsc 7.0.2 | 2.04 | 0.22 |
| `tsc --noEmit` in `apps/integrated-math-2` (median of 3) | tsc 6.0.3 | 7.8 | tsrs 0.25.0-ts7.1.0-beta | 1.83 | 0.23 |
| `tsc --noEmit` in `apps/integrated-math-3` (median of 3) | tsc 6.0.3 | 22.4 | tsc 7.0.2 | 3.73 | 0.17 |
| `tsc --noEmit` in `apps/pre-calculus` (median of 3) | tsc 6.0.3 | 13.9 | tsc 7.0.2 | 2.85 | 0.21 |
| `tsc --noEmit` in `packages/activity-components` (median of 3) | tsc 6.0.3 | 4.8 | tsrs 0.25.0-ts7.1.0-beta | 1.14 | 0.24 |
| `tsc --noEmit` in `packages/activity-runtime` (median of 3) | tsc 6.0.3 | 0.6 | tsrs 0.25.0-ts7.1.0-beta | 0.64 | 1.07 |
| `tsc --noEmit` in `packages/ai-tutoring` (median of 3) | tsc 6.0.3 | 0.9 | tsrs 0.25.0-ts7.1.0-beta | 0.66 | 0.73 |
| `tsc --noEmit` in `packages/app-shell` (median of 3) | tsc 6.0.3 | 1.5 | tsrs 0.25.0-ts7.1.0-beta | 0.70 | 0.47 |
| `tsc --noEmit` in `packages/component-approval` (median of 3) | tsc 6.0.3 | 0.6 | tsrs 0.25.0-ts7.1.0-beta | 0.65 | 1.08 |
| `tsc --noEmit` in `packages/core-auth` (median of 3) | tsc 6.0.3 | 0.9 | tsrs 0.25.0-ts7.1.0-beta | 0.81 | 0.90 |
| `tsc --noEmit` in `packages/core-convex` (median of 3) | tsc 6.0.3 | 1.0 | tsrs 0.25.0-ts7.1.0-beta | 0.61 | 0.61 |
| `tsc --noEmit` in `packages/efficacy-core` (median of 3) | tsc 6.0.3 | 1.4 | tsrs 0.25.0-ts7.1.0-beta | 0.64 | 0.46 |
| `tsc --noEmit` in `packages/graphing-core` (median of 3) | tsc 6.0.3 | 0.7 | tsrs 0.25.0-ts7.1.0-beta | 0.64 | 0.91 |
| `tsc --noEmit` in `packages/knowledge-space-core` (median of 3) | tsc 6.0.3 | 2.1 | tsrs 0.25.0-ts7.1.0-beta | 0.74 | 0.35 |
| `tsc --noEmit` in `packages/knowledge-space-practice` (median of 3) | tsc 6.0.3 | 2.3 | tsrs 0.25.0-ts7.1.0-beta | 0.70 | 0.30 |
| `tsc --noEmit` in `packages/lesson-renderer` (median of 3) | tsc 6.0.3 | 1.4 | tsrs 0.25.0-ts7.1.0-beta | 0.68 | 0.49 |
| `tsc --noEmit` in `packages/math-content` (median of 3) | tsc 6.0.3 | 3.7 | tsrs 0.25.0-ts7.1.0-beta | 1.12 | 0.30 |
| `tsc --noEmit` in `packages/practice-core` (median of 3) | tsc 6.0.3 | 1.3 | tsrs 0.25.0-ts7.1.0-beta | 0.77 | 0.59 |
| `tsc --noEmit` in `packages/practice-test-engine` (median of 3) | tsc 6.0.3 | 0.6 | tsrs 0.25.0-ts7.1.0-beta | 0.60 | 1.00 |
| `tsc --noEmit` in `packages/rate-limiter` (median of 3) | tsc 6.0.3 | 0.6 | tsrs 0.25.0-ts7.1.0-beta | 0.62 | 1.03 |
| `tsc --noEmit` in `packages/srs-engine` (median of 3) | tsc 6.0.3 | 1.8 | tsrs 0.25.0-ts7.1.0-beta | 0.71 | 0.39 |
| `tsc --noEmit` in `packages/study-hub-core` (median of 3) | tsc 6.0.3 | 0.9 | tsrs 0.25.0-ts7.1.0-beta | 0.65 | 0.72 |
| `tsc --noEmit` in `packages/teacher-reporting-core` (median of 3) | tsc 6.0.3 | 0.7 | tsrs 0.25.0-ts7.1.0-beta | 0.63 | 0.90 |
| `tsc --noEmit` in `packages/_template` (median of 3) | tsc 6.0.3 | 0.4 | tsrs 0.25.0-ts7.1.0-beta | 0.59 | 1.47 |
| `tsc --noEmit` in `packages/workbook-pipeline` (median of 3) | tsc 6.0.3 | 0.6 | tsrs 0.25.0-ts7.1.0-beta | 0.68 | 1.13 |

The "after" cells were measured at `ec3a05ae` with the same method. The tool is the typecheck
script of the workspace. 23 workspaces run `TSRS_FAST=1 oxlint --type-aware --type-check`
(tsrs 0.25.0-ts7.1.0-beta, compiler line 7.1.0-beta). The four `TSC_FALLBACK_LIST` apps
(BM2, IM1, IM3, PreCalc) run `tsc --noEmit` on TypeScript 7.0.2 (strategy 16.4; section 7).
The `tsconfig.tsbuildinfo` of a fallback app was deleted before each run (timing method item 4).
Each run set ran in one `heavy-run.sh` job with no concurrent heavy job. Raw values:
`s3-tsrs-raw.txt` (27 sections: 23 tsrs workspaces plus 4 `tsc --noEmit` warm rows) and `s3-tsc-after-raw.txt` (source of the 4 fallback medians) in the run folder
(force-added). The four tsc rows agree with the 7.0.2 table within 0.3 s: BM2 2.38 against
2.6, IM3 3.73 against 4.0. The command is the same, so the small difference is machine load.
A row of 0.6 s sits at the npm overhead floor (about 0.5 s), so its ratio is about 1.0.

### S3 TypeScript 7.0.2 timing (2026-11-19)

Method: the plan "Timing Method". One warm `tsc --noEmit` run per workspace, then
3 timed runs with bash `time` and `TIMEFORMAT=%R`, in one `heavy-run.sh` job with
no concurrent heavy job. `tsconfig.tsbuildinfo` deleted before each run. TypeScript
is 7.0.2 (`npx --no-install tsc --version` prints `Version 7.0.2`). The command is
the workspace `typecheck` script (`npm run typecheck --workspace=<ws>`), except
bus-math-v2, which has no `typecheck` script at this commit and runs
`npx --no-install tsc --noEmit -p apps/bus-math-v2/tsconfig.json`. The table holds
the median of the 3 runs. The values include the npm overhead (about 0.5 s). Raw
values: `s3-tsc7-raw.txt` in the run folder (force-added). The same tree holds the
same diagnostic key set under 6.0.3 and 7.0.2 (section 8); only the exit code moves
from 2 to 1 for a failing workspace.

| Task | Tool after | Seconds after |
|---|---|---|
| `tsc --noEmit` in `apps/bus-math-v2` (median of 3) | tsc 7.0.2 | 2.6 |
| `tsc --noEmit` in `apps/danielson` (median of 3) | tsc 7.0.2 | 1.1 |
| `tsc --noEmit` in `apps/integrated-math-1` (median of 3) | tsc 7.0.2 | 2.0 |
| `tsc --noEmit` in `apps/integrated-math-2` (median of 3) | tsc 7.0.2 | 1.9 |
| `tsc --noEmit` in `apps/integrated-math-3` (median of 3) | tsc 7.0.2 | 4.0 |
| `tsc --noEmit` in `apps/pre-calculus` (median of 3) | tsc 7.0.2 | 3.0 |
| `tsc --noEmit` in `packages/activity-components` (median of 3) | tsc 7.0.2 | 0.8 |
| `tsc --noEmit` in `packages/activity-runtime` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/ai-tutoring` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/app-shell` (median of 3) | tsc 7.0.2 | 0.3 |
| `tsc --noEmit` in `packages/component-approval` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/core-auth` (median of 3) | tsc 7.0.2 | 0.3 |
| `tsc --noEmit` in `packages/core-convex` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/efficacy-core` (median of 3) | tsc 7.0.2 | 0.3 |
| `tsc --noEmit` in `packages/graphing-core` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/knowledge-space-core` (median of 3) | tsc 7.0.2 | 0.4 |
| `tsc --noEmit` in `packages/knowledge-space-practice` (median of 3) | tsc 7.0.2 | 0.5 |
| `tsc --noEmit` in `packages/lesson-renderer` (median of 3) | tsc 7.0.2 | 0.3 |
| `tsc --noEmit` in `packages/math-content` (median of 3) | tsc 7.0.2 | 0.7 |
| `tsc --noEmit` in `packages/practice-core` (median of 3) | tsc 7.0.2 | 0.3 |
| `tsc --noEmit` in `packages/practice-test-engine` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/rate-limiter` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/srs-engine` (median of 3) | tsc 7.0.2 | 0.4 |
| `tsc --noEmit` in `packages/study-hub-core` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/teacher-reporting-core` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/_template` (median of 3) | tsc 7.0.2 | 0.2 |
| `tsc --noEmit` in `packages/workbook-pipeline` (median of 3) | tsc 7.0.2 | 0.2 |

## 6. Rule gaps

### S2 Red gate exception (2026-11-18)

Known exception (PM 2026-11-18): the S2 Red role gate exits 1 with
`'RED_TEST_COMMAND failed (expected failure, exit 0)'`. All 7 S2 cases (1-5, 9, 9b)
pass at `43d42193`. Cause: the superseded track
`eslint-to-oxlint-migration_20260820` made the oxlint move. Strategy sections 8
and 13.8 predicted the passes. S2 is guard-only. S2 Green (record, zero warnings,
verify, docs) runs after the S1 checkpoint.

The root `.oxlintrc.json` holds 3 `jsPlugins`: `oxlint-plugin-eslint`,
`eslint-plugin-react`, and `eslint-plugin-react-hooks`. S2 keeps all 3 (strategy
14.2). Case 9 checks that each specifier has a `node_modules/<specifier>` key.

### S2 Green record (2026-11-18)

S2 ran no `@oxlint/migrate` command. The superseded track
`eslint-to-oxlint-migration_20260820` made the migration. No `eslint.config.*`
file remains, so the migrate tool has no input. S2 made no per-workspace
`.oxlintrc.json`. The tree holds one root `.oxlintrc.json`.

Rule inventory of the root config at this HEAD:

| Item | Value |
|------|-------|
| Native plugins | `typescript`, `react`, `import`, `jsx-a11y`, `nextjs` |
| `jsPlugins` | `oxlint-plugin-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks` |
| `overrides` blocks | 10 (3 for `apps/`, 7 for `packages/`) |
| Rule entries across `overrides` | 667 |
| `oxlint` installed version | 1.93.0 (range `^1.79.0`) |

Rule gaps: none derivable. No ESLint config remains to diff against the
migrated output. The `--details` output of a migration run does not exist for
this tree. Each lint rule that the repository enforces is an entry of the root
config above.

## 7. Conformance gaps

### S3 comparison record (2026-11-19)

Commit of all three collections: `dbf29cbd40e13af4f13b6ffec392a079f77c784d`.

| Tool | Version line |
|------|---|
| tsrs | `Version 7.1.0-beta (tsrs 0.25.0-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9)` |
| `tsc` 7.1.0-beta | `Version 7.1.0-beta` (`npx --yes -p typescript@7.1.0-beta tsc`) |
| `tsc` 7.0.2 | `Version 7.0.2` (`npx --no-install tsc`) |

The tsrs version names the TypeScript 7.1.0-beta line, so the comparison uses
`typescript@7.1.0-beta` from the npx cache. No manifest declares it. Raw sets:
`tsrs.txt`, `tsc71.txt`, `tsc70.txt`, `workspace-compare.txt` in the run folder.

**Method.** The tsrs set is the target typecheck command with `--format json` in each
workspace (`apps/*` run `.`, `packages/*` run `src`). The tsc sets are
`tsc --noEmit --pretty false -p <cfg>` for the 27 workspace `tsconfig.json` and the 6
`apps/*/convex/tsconfig.json`. A row is file, line, and TS code, with repo-relative
paths. Comparison is per workspace.

#### Compiler-version table: `tsc` 7.0.2 against `tsc` 7.1.0-beta

| Workspace | 7.0.2 rows | 7.1.0-beta rows | Only 7.0.2 | Only 7.1.0-beta |
|---|---|---|---|---|
| `apps/bus-math-v2` | 71 | 71 | 0 | 0 |
| `apps/integrated-math-1` | 21 | 21 | 0 | 0 |
| `apps/integrated-math-3` | 60 | 60 | 0 | 0 |
| `apps/pre-calculus` | 6 | 6 | 0 | 0 |
| the other 23 workspaces | 0 | 0 | 0 | 0 |

No diagnostic differs between 7.0.2 and 7.1.0-beta. Both versions are one compiler
line for this tree; the kept `typescript` 7.0.2 is not a lower line than tsrs.

#### Gap table: tsrs against `tsc` 7.1.0-beta (tsrs-only rows)

38 rows, all in `apps/integrated-math-3`. Every other workspace has `gap=0`.

| File | Code | Lines | Disposition |
|---|---|---|---|
| `apps/integrated-math-3/scripts/scale/run.mjs` | TS2591 | 4,5,6,7,47,224,241,253 | blocking: the `.mjs` scripts use `process`; tsrs type-checks them with `allowJs` and the app `types` list, which has no node. The app `tsconfig.json` `include` covers only `*.ts`/`*.tsx`, so `tsc` never checks these files. |
| `apps/integrated-math-3/scripts/scale/run.mjs` | TS7006 | 44,78,90,105,120,121,132,143,163,176,180,184,188,195,196,197,204,209,210,215 | blocking: implicit `any` in the same `.mjs` file. |
| `apps/integrated-math-3/scripts/scale/run.mjs` | TS7053 | 91,133,190 | blocking: same file. |
| `apps/integrated-math-3/scripts/validate-seed-integrity.mjs` | TS2591 | 14,15,16,200 | blocking: same rule. |
| `apps/integrated-math-3/scripts/validate-seed-integrity.mjs` | TS7006 | 44,65,68 | blocking: same rule. |

No behavior-neutral code change exists. A fix would add `node` to the app `types`
list and rewrite the two scripts, which is not behavior-neutral and is outside S3.
`apps/integrated-math-3` stays on `tsc --noEmit` and is in `TSC_FALLBACK_LIST`.

#### Rows that `tsc` 7.1.0-beta reports and tsrs does not (69 rows)

No code change (plan line 404). These rows come from the `convex/tsconfig.json`
project, where tsrs selects the app config for the same file because it uses the
nearest tsconfig for each linted file.

| Workspace | File | Codes and lines |
|---|---|---|
| `apps/bus-math-v2` | `lib/practice/engine/families/accounting-equation.ts` | TS2307 1,2,3; TS2339 300,301,308; TS2353 166; TS7006 269,294,367,371,393 |
| `apps/bus-math-v2` | `lib/practice/engine/families/classification.ts` | TS2307 5,6,7,8; TS2339 366,369,370,373,384,398; TS2347 475; TS7006 172,175,178,274,298,325,365,425,429,430,436,437,450,464,473,474,475,480,507 |
| `apps/bus-math-v2` | `lib/practice/engine/families/normal-balance.ts` | TS2307 5,6,7,8; TS2339 329,330,333,340,354; TS7006 106,107,108,234,302,328,385,389,390,414,424,435,437,464 |
| `apps/bus-math-v2` | `lib/practice/grading/accounting-equation-event.ts` | TS2307 1; TS2550 196 |
| `apps/integrated-math-3` | `lib/activities/review-queue.ts` | TS2307 1 |
| `apps/integrated-math-3` | `lib/placement/v3-placement-migration.ts` | TS2307 5 |

The BM2 rows are the missing `paths` and the ES2021 `lib` level of
`apps/bus-math-v2/convex/tsconfig.json`. They are pre-existing (identical under
6.0.3) and are the reason BM2 sits in `TSC_FALLBACK_LIST`. The two IM3 rows are the
same rule for its convex project.

#### Fallback rows and the gate baseline

`TSC_FALLBACK_LIST` holds `apps/bus-math-v2`, `apps/integrated-math-1`,
`apps/integrated-math-3`, `apps/pre-calculus`. Each app's gate baseline is its
`tsc` project (`tsconfig.json`), which does not check `convex/*.ts` with
`convex/tsconfig.json` and does not check imported package sources with their own
config. The tsrs app check does both, so it reports pre-existing diagnostics that the
baseline does not. IM1 and PreCalc have `gap=0` and `missed=0` against the union of
their configs, because the diagnostics exist in both tools once the convex project is
counted; they differ only from the gate baseline. Each row is `blocking` in the sense
of plan lines 401 to 403.

#### Seeded probe: TS2322 in all three outputs

Probe project: `probe.ts` with `export const n: number = "x";` and a `tsconfig.json`
with `strict`, `noEmit`, `types: []`, and `files: ["probe.ts"]`, in a temp folder
outside the repo.

| Tool | `TS2322` lines |
|---|---|
| tsrs (`TSRS_FAST=1 oxlint --type-aware --type-check probe.ts`) | 1 |
| `tsc` 7.1.0-beta | 1 |
| `tsc` 7.0.2 | 1 |

The collector was able to see the seeded fault in every set, so no `none` claim in
this section rests on an empty collector (A5).

## 8. Workarounds

| Tool | Problem | Workaround | Upstream issue |
|------|---------|------------|----------------|
| `heavy-run.sh` | A p2 job has a time limit of 1800 s. One call of `gates.sh test baseline` stopped at 1800 s after 3 of 26 workspaces. The `checks-all` gate needs more than 1800 s. | The role ran each workspace and each step as one `heavy-run.sh` job. The role wrote the same output files as `gates.sh`. The first 3 test logs come from the stopped `gates.sh` run. Green needs the same split, or `HEAVY_PRIORITY=p1`. | none |
| vitest (`scripts/vitest.config.ts`) | The `include` entry `__tests__/remediate-concept-blueprints.test.ts` matches nothing when vitest runs from the repository root. The baseline scripts suite found no test file. | The S1 Test (Red) task adds a `root` option to the config (strategy section 5). | none |
| `npm run test:e2e` (IM3) | The Playwright `webServer` runs `npm run dev:stack`, and that runs `npx convex dev --local`. The file `apps/integrated-math-3/.env.local` links to a cloud dev deployment. A local run can rewrite that file. | Not run locally. The plan allows "not run locally". | none |
| `agent-browser` | The `agent-browser` command is not installed on this machine. | The role used `playwright-core` 1.60.0 (repository copy) with the Chrome 151 build of `~/.agent-browser/browsers`. The default browser revision of the repository copy is not installed. | none |
| `vinext build` | A build changes tracked files and makes untracked folders. The tracked files are `apps/bus-math-v2/lib/workbooks-manifest.json` (the `generatedAt` field) and `apps/integrated-math-3/.next/types/routes.d.ts` (route types). The untracked folders are `apps/integrated-math-1/.next/`, `apps/integrated-math-2/.next/`, and `apps/pre-calculus/.next/`. | Nobody stages these changes. Green decides about `.gitignore` entries (plan S1 Implement). | none |
| `vinext check` (1.4.5) | The check reports one issue class: `__dirname` / `__filename` (CommonJS globals), undefined in client bundles and ESM configs. IM1 93% (`__tests__/convex/seed/referenced-codes.ts`), IM2 93% (same file), IM3 93% (`lib/level-projection/im3-level-projection.ts`, `scripts/validate-seed-integrity.mjs`), PreCalc 100%, BM2 100%. | Informational only. The flagged files are server code and scripts. The build sweep and dev-server checks decide. No code change in S1 (no gate failure needs it). | none |
| `eslint-config-next` | It loads `next/dist/compiled/babel/eslint-parser` at config time. After `next` was removed, every app ESLint config failed to load: `eslint .` exited 2 in the 4 apps whose baseline lint passed, and BM2's config also failed. | The 5 app `eslint.config.mjs` files dropped the `eslint-config-next` imports and the `@typescript-eslint/no-explicit-any` block in S1 (commit dcde148d). The 4 apps pass again; BM2's 2 baseline `no-unused-vars` warnings disappeared with the rules. S2 replaces these files. | none |
| `geist` | Its required `next` peer (no `peerDependenciesMeta` marker) made npm auto-install `next@16.2.7` again after the `next` removal, so `npm ls next --all` was not `(empty)` and S1 cases 2 and 8 failed. | Removed the dead `geist` dependency from IM3 and BM2 (commit dcde148d). No code imports it. The optional `next` peer of `@unpic/react` (a vinext dependency) is not auto-installed. | none |
| `gates.sh` `key()` helper | The comparison prints `comm: input is not in sorted order` warnings for each compared log. | Noise only. The parse reads the labeled last line `NEWFAIL=<n>` (strategy section 2). | none |
| `vinext check` (`apps/danielson`) | No issue. | Exit 0, 100% compatible (9 supported, 0 partial, 0 issues). Imports 5/5 fully supported: `next/link` 24 files, `next/navigation` 23, `next/server` 9, `next/headers` 3, `next/image` 1. Structure: 26 pages, 1 layout, 21 route handler. Proof that no `next` declaration remains: S1 case 3 finds no manifest declaration, case 8 finds no `node_modules/next` lockfile key, and case 9 finds no `eslint` or `@eslint/js` declaration. Log `jr-green-danielson-vinext-check.log`. | none |
| `vinext build` (1.4.6, `apps/danielson`) | vinext 1.4.6 refuses to build with no Vite config: `No Vite config was found for this project. Run vinext init to create one, then retry vinext build.` | `apps/danielson/vite.config.ts` loads the `vinext()` plugin only (commit `050e916b`). danielson has no `wrangler.jsonc` and no Cloudflare deploy, so no cloudflare plugin and no `dotenv` import. The build then exits 0 (log `jr-green-danielson-build2.log`). | none |
| oxlint migration input (S2) | No `eslint.config.*` file remains, so `@oxlint/migrate` has no input and no `--details` output. S2 records the migrated root config as-is (section 6). | none |
| ESLint "before" lint timing (S2) | No ESLint config remains, so no ESLint timing can run on this tree. Section 5 writes `n/a` for each "before" lint value. | none |
| Peer-only `eslint` copies (S2) | `eslint` 9.39.5, `@eslint/js` 9.39.5, and `@eslint/eslintrc` 3.3.7 stay in the lockfile with `peer: true`. They are peers of `eslint-plugin-react` and `eslint-plugin-react-hooks`, which the root config loads as `jsPlugins`. S2 keeps them (strategy 14.2, question Q1). | none |
| `tsc` (`apps/integrated-math-3`) | On the S1 tree the default Node heap exhausts: exit 134, `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`. Reproduces alone in 18 s. With 8 GB the check completes with the 55 baseline diagnostics (exit 1 warm, exit 2 cacheless; plan records this 1-vs-2 artifact). | The `typecheck` script sets `NODE_OPTIONS=--max-old-space-size=8192` (commit `b9d27742`). The npm error trailer echoes the script text, so the `s1` gate keys one extra line for IM3: `npm error command sh -c NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit`. `comm` against `baseline-m2` shows only that line is new; all 55 TS keys match. Recorded in section 10. | none |
| `npm install` (root) | `^1.4.5` re-resolves `vinext` to 1.4.6 (published 2026-11-16), because danielson's manifest change forces a re-resolve. | Kept with Q4: the range `^1.4.5` admits it and 1.4.6 is the registry latest (R8). The 1.4.5 and 1.4.6 type files match except one optional property (`_vinextHydrationHref`) in `dist/shims/router.d.ts`. The lockfile diff holds only two changed keys (`node_modules/vinext` 1.4.5 to 1.4.6, danielson `@types/node` 22.20.5 to 24.19.2) and no added key. | none |
| vitest (`apps/danielson`) | After `next` left, 13 `vi.mock('next/...')` lines in 11 danielson files cannot resolve `next/*` (risk R4). | `apps/danielson/vitest.config.ts` got the same 24-entry `next/*` to `vinext/shims/*` alias map as the other 5 apps. The `test s1` danielson workspace exits 0. | none |
| `typescript6` alias (S3) | TypeScript 7 ships no JavaScript compiler API (`npm view typescript@7.0.2 exports main` shows no `./lib/typescript.js`). The S2 disable-comment scan calls `createSourceFile`, `getChildren`, `getLeadingCommentRanges`, and `getTrailingCommentRanges`. | Root devDependency `"typescript6": "npm:@typescript/typescript6@^6.0.2"` (strategy 16.2). Test file line 9 imports `typescript6`. No call site in the scan changed. Release notes: `https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/` (2026-07-08; "it does not ship with an API"; the compatibility package "re-exports the TypeScript 6.0 API"). | none |
| `@typescript/native` bin shadow (S3) | `@typescript/typescript6` 6.0.2 depends on `@typescript/old` (`npm:typescript@^6`, installed 6.0.3). That package also provides a `tsc` bin, and npm links it at the root `.bin` ahead of `typescript@7.0.2`. Without the alias `npx tsc --version` printed `Version 6.0.3`, so the S3 `tsc` runs and the strategy 16.4 version check fail. | Root devDependency `"@typescript/native": "npm:typescript@^7.0.2"`. It is a local npm alias, not the registry name `@typescript/native` (which returns E404). It only pins the root `tsc` bin to 7.0.2 against the `@typescript/old` bin shadow; it adds no compiler and no API. Its `tsc` bin wins the root `.bin` link: `npx tsc --version` prints `Version 7.0.2`. Commands: without the alias the version prints 6.0.3; with it 7.0.2. | none |
| TypeScript 7 tsconfig sweep (S3) | TypeScript 7 rejects some options (release notes: `target: es5`, `downlevelIteration`, `moduleResolution: node`, `module: amd`, `baseUrl`, `esModuleInterop: false`, and others). | No option of this tree is rejected. All 33 configs run (27 workspace `tsconfig.json` and 6 `apps/*/convex/tsconfig.json`). No tsconfig file changed. Each failing config holds the same file-plus-code key set under 6.0.3 and 7.0.2: IM3 55, PreCalc 4 (section 10 rows); IM1 convex 21, BM2 convex 87, IM3 convex 6, PreCalc convex 2 (convex configs are outside the baseline gate and are pre-existing at parity). The exit code of a failing config moves from 2 to 1. | none |
| `tsrs` platform binary (S3) | The first `npm install` wrote the `@tsrs/linux-x64-gnu` lockfile entries but did not place the package in `node_modules`, so `npx tsrs --version` printed "Cannot find the optional dependency @tsrs/linux-x64-gnu". | A second `npm install` reified the package. `npx --no-install tsrs --version` prints `Version 7.1.0-beta (tsrs 0.25.0-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9)`. `oxlint --type-aware --type-check` finds the executable through `tsrs`, so `oxlint-tsgolint` is not added. | none |
| tsrs type-check scope (S3) | `oxlint --type-aware --type-check` discovers the nearest `tsconfig.json` for each file (its `--help` text). For an app it also type-checks `convex/*.ts` through `apps/<app>/convex/tsconfig.json` and imported package sources through the package config. Four apps therefore report diagnostics that their `tsc` project does not (evidence section 7, "blocking" rows). | Those four apps stay on `tsc --noEmit` and are listed in `TSC_FALLBACK_LIST`: IM1, BM2, IM3, PreCalc. IM2, danielson, and all 21 packages use the tsrs command. A behavior-neutral code fix does not exist: the extra diagnostics are pre-existing errors under the convex configs (section 10 rule: do not fix a pre-existing failure). | none |

## 9. Keep list

### Convex CLI typecheck lookup (S3)

File: `node_modules/convex/dist/esm/cli/lib/typecheck.js` (convex 1.50.0).

| Line | Content |
|---|---|
| 110 | `export function findTypeScriptCompilerPath(fs, typescriptCompiler)` |
| 116-118 | `case "tsgo"`: `node_modules/@typescript/native-preview/bin/tsgo` |
| 122-128 | `case "tsc"`: first `node_modules/@typescript/native/bin/tsc` ("TypeScript 7's recommended alias when the TypeScript 6 API is also installed"), then `node_modules/typescript/bin/tsc` |
| 90-94 | `No \`${typescriptCompiler}\` binary found, so skipping typecheck.` and `handleResult("cantTypeCheck", ...)` |

The paths are relative, so the CLI finds a compiler only when the app folder holds
`node_modules/...`; a hoisted root copy is not found. This tree has no nested copies.

`npx convex typecheck` per app, 2026-11-19, with the keep manifests in place:

| App | Exit | Result |
|---|---|---|
| `apps/bus-math-v2` | 1 | CLI prints `No \`tsc\` binary found, so skipping typecheck.` then `Unable to typecheck; is TypeScript installed?` |
| `apps/danielson` | 1 | same skip line |
| `apps/integrated-math-1` | 1 | tsc 7.0.2 runs; the output shows bundler loader errors for the katex CSS side-effect import |
| `apps/integrated-math-2` | 1 | same skip line |
| `apps/integrated-math-3` | 1 | tsc 7.0.2 runs; the output shows bundler loader errors for the katex CSS side-effect import |
| `apps/pre-calculus` | 1 | tsc 7.0.2 runs; the output shows bundler loader errors for the katex CSS side-effect import |

No app passes the CLI check at this commit, so the command cannot select the keep
set. The decision rests on three facts:

1. `TSC_FALLBACK_LIST` must be a subset of `TYPESCRIPT_KEEP_LIST`, so the four
   fallback apps keep `typescript` ^7.0.2.
2. Their `tsc --noEmit` gate runs the package.
3. The Convex CLI prefers the `@typescript/native` alias path, which is the same
   alias the root bin pin uses (section 8).

No held package: no app needs a 6.x copy. The failures are pre-existing code
diagnostics, not a compiler-version problem.

### Final `TYPESCRIPT_KEEP_LIST`

The test constant holds the four entries
`apps/{bus-math-v2,integrated-math-1,integrated-math-3,pre-calculus}/package.json:devDependencies.typescript`.
`TYPESCRIPT_KEEP_LIST` names the same four folders as `TSC_FALLBACK_LIST`.

### Removed

`typescript` is removed from the root `devDependencies`, from the root `overrides`,
and from 22 workspace manifests (danielson, integrated-math-2, and 20 packages).
`packages/practice-test-engine` never declared it. `npm ls typescript --all` shows no
non-optional peer: `convex-helpers` 0.1.135 is the only package with a `typescript`
peer, and its `peerDependenciesMeta` marks it optional. No `.vscode/settings.json`
exists, so editors use their bundled TypeScript.

### The `typescript6` alias

`"typescript6": "npm:@typescript/typescript6@^6.0.2"` in the root `devDependencies`.
Reason: the S2 disable-comment scan needs the TypeScript 6 parser API and TypeScript 7
ships no JavaScript API. It is not in `TYPESCRIPT_KEEP_LIST` and not in
`TSC_FALLBACK_LIST`. `@typescript/native` (section 8) stays for the root `tsc` bin pin
and the Convex CLI preference.

## 10. Pre-existing failures

These failures exist before any package change. The track does not fix them, except the S2
lint failures. The key of a diagnostic is the workspace, the file, and the code, without line
and column.

### Pre-merge tree (labels `baseline`, 2026-11-14 and 2026-11-15; historical)

The table below records the pre-merge tree of 5 apps and 21 packages. It is historical. The
pre-merge `gates/baseline/` folder holds 26 names. The S1 gates do not compare with it
(strategy 13.2). No role deletes it, and no rule of this track reads it as a base.

| Gate | Workspace | File | Diagnostic code |
|---|---|---|---|
| lint | `apps/bus-math-v2` | `apps/bus-math-v2/lib/auth/server.ts` | warning @typescript-eslint/no-unused-vars (x2) |
| lint | `packages/activity-components` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/ai-tutoring` | `packages/ai-tutoring/src/prompt-guard.ts` | error no-misleading-character-class |
| lint | `packages/ai-tutoring` | `packages/ai-tutoring/src/prompt-guard.ts` | error no-useless-escape |
| lint | `packages/app-shell` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/math-content` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/practice-test-engine` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/rate-limiter` | (no `eslint.config.*` file) | ESLint exit 2: no config found |
| lint | `packages/srs-engine` | `packages/srs-engine/src/__tests__/variant-rename.test.ts` | error @typescript-eslint/no-unused-vars |
| lint | `packages/srs-engine` | `packages/srs-engine/src/srs/contract.ts` | error @typescript-eslint/no-unused-vars (x2) |
| lint | `packages/srs-engine` | `packages/srs-engine/src/srs/review-processor.ts` | error @typescript-eslint/no-unused-vars |
| typecheck | `apps/integrated-math-1` | `convex/queue/queue.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck | `apps/integrated-math-1` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-2` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/a11y/gradebook-color-state.test.tsx` | TS2322 (x3), TS2741 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/a11y/student-nav-layout.test.tsx` | TS2322 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/parent/parent-portal-prod-wiring.test.tsx` | TS2339 (x6), TS2769 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/student/knowledge-state.test.tsx` | TS2554 (x6) |
| typecheck | `apps/integrated-math-3` | `__tests__/app/teacher/content-authoring/content-authoring-e2e.test.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/ParentDashboard.test.tsx` | TS2503 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/StudentSwitcher.test.tsx` | TS2503 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/parent/parent-privacy.test.tsx` | TS2503 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/student/PracticeCardRenderer.test.tsx` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/student/PracticeSessionProvider.test.tsx` | TS2322 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/teacher/TeacherObjectiveDiagnosticCard.test.tsx` | TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/edgeCalibration.test.ts` | TS2344 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/efficacy/cohort.test.ts` | TS2741 (x2), TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/objectiveProficiency.test.ts` | TS2344 (x13), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/queue/queue.test.ts` | TS2339 (x3), TS2353 (x14), TS2769 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/schema-blueprint.test.ts` | TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/seed/practice-blueprint.test.ts` | TS2339 (x10) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/seed/problem-families-modules-6-9.test.ts` | TS2305 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/cards.test.ts` | TS2724 (x1), TS2353 (x4), TS2322 (x4) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/processReview.test.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/srs/submissionSrs.test.ts` | TS2344 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/content-authoring-drafts.test.ts` | TS2345 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/content-authoring-phase4-adversarial.test.ts` | TS2345 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/teacher/srs-mutations.test.ts` | TS2344 (x5) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/onboarding/student-flow.test.ts` | TS2551 (x7) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/practice-item.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/problem-family.test.ts` | TS2305 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/practice/timing-baseline.test.ts` | TS2353 (x10), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/adapters.test.ts` | TS2353 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/convexCardStore.test.ts` | TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/export-verification.test.ts` | TS2561 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/integration-guide.test.ts` | TS2353 (x18) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/queue.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-integration.test.ts` | TS2353 (x10) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-stub.test.ts` | TS2353 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/srs/review-processor.test.ts` | TS2353 (x2), TS2741 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/teacher/content-authoring/authoring-lifecycle-adversarial.test.ts` | TS2571 (x8) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/teacher/content-authoring/sanitize-authored-text.test.ts` | TS2769 (x2) |
| typecheck | `apps/integrated-math-3` | `__tests__/student/transfer-credit/confirmation-check.test.ts` | TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `app/student/knowledge-state/page.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `app/teacher/content-authoring/ClientComposer.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `app/teacher/content-authoring/page.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `cloudflare/worker.ts` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `components/activities/graphing/GraphingExplorerActivity.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `components/dev/review-queue/index.tsx` | TS2769 (x1) |
| typecheck | `apps/integrated-math-3` | `components/teacher/TeacherObjectiveDiagnosticCard.tsx` | TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `components/teacher/content-authoring/LessonComposer.tsx` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/efficacy/cohort.ts` | TS2322 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/objectiveProficiency.ts` | TS2344 (x1), TS2345 (x12), TS2353 (x11), TS2339 (x9), TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `convex/queue/queue.ts` | TS2353 (x1), TS2339 (x2), TS2345 (x3) |
| typecheck | `apps/integrated-math-3` | `convex/seed/seed_practice_items.ts` | TS2339 (x5), TS2345 (x3), TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `convex/seed/seed_problem_families.ts` | TS2339 (x5), TS2345 (x4) |
| typecheck | `apps/integrated-math-3` | `convex/seed/validate_blueprint.ts` | TS2345 (x1), TS2339 (x4) |
| typecheck | `apps/integrated-math-3` | `convex/teacher/content-authoring.ts` | TS2345 (x1), TS2322 (x1), TS2367 (x2) |
| typecheck | `apps/integrated-math-3` | `convex/teacher/srs_mutations.ts` | TS2353 (x2), TS2339 (x2), TS2345 (x2) |
| typecheck | `apps/integrated-math-3` | `lib/srs/__tests__/rest-adapter-stub.ts` | TS2420 (x1), TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/authoring-model.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/get-teacher-authoring-status-view.ts` | TS2307 (x1) |
| typecheck | `apps/integrated-math-3` | `lib/teacher/content-authoring/sanitize-authored-text.ts` | TS2367 (x2) |
| typecheck | `apps/integrated-math-3` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `apps/pre-calculus` | `tailwind.config.ts` | TS2322 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/graphing-solver-a11y.test.tsx` | TS2591 (x2), TS2304 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/live-regions.test.tsx` | TS2352 (x1) |
| typecheck | `packages/activity-components` | `src/__tests__/a11y/quiz-blanks-games-a11y.test.tsx` | TS2591 (x2), TS2304 (x1) |
| typecheck | `packages/activity-components` | `src/components/algebraic/MathInputField.tsx` | TS2882 (x1) |
| typecheck | `packages/activity-components` | `src/components/algebraic/StepByStepper.tsx` | TS2882 (x1) |
| typecheck | `packages/app-shell` | `../core-convex/src/config.ts` | TS2591 (x1) |
| typecheck | `packages/knowledge-space-practice` | `src/__tests__/projections-variant-rename.test.ts` | TS2591 (x2), TS2304 (x3) |
| typecheck | `packages/knowledge-space-practice` | `src/__tests__/projections.test.ts` | TS2741 (x11), TS2352 (x2) |
| typecheck | `packages/math-content` | `src/__tests__/exports.test.ts` | TS2591 (x2), TS2339 (x1) |
| typecheck | `packages/math-content` | `src/__tests__/no-measure-coupling.guard.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/__tests__/t17-adversarial.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/audit-diff.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/blueprints.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/ci-gate.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/coverage-matrix.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/__tests__/scaffold.test.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/problem-families/im1/coverage-matrix.ts` | TS2591 (x3) |
| typecheck | `packages/math-content` | `src/schemas/types.ts` | TS2503 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/practice/timing-baseline.test.ts` | TS2353 (x10), TS2339 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/contract.test.ts` | TS2353 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/queue.test.ts` | TS2353 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/__tests__/lib/srs/review-processor.test.ts` | TS2353 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/cloudflare/worker.ts` | TS2307 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/components/student/DailyPracticeSession.tsx` | TS2352 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/convex/srs.ts` | TS2353 (x1), TS2339 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/queue.ts` | TS2322 (x1) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/review-processor.ts` | TS2339 (x2), TS2741 (x2) |
| typecheck (`tsc --noEmit -p`) | `apps/bus-math-v2` | `apps/bus-math-v2/lib/srs/scheduler.ts` | TS2353 (x2), TS2339 (x2) |
| test | `apps/bus-math-v2` | `__tests__/auth/unified-auth-monorepo.test.ts` | 2 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/components/footer.test.tsx` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/practice/timing-baseline.test.ts` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/srs/review-processor.test.ts` | 2 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/lib/srs/scheduler.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-2` | `__tests__/curriculum/curriculum-depth.test.ts` | 44 failing test(s) |
| test | `apps/integrated-math-2` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/a11y/findings-doc.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/globals-css.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/objectiveProficiency.test.ts` | 9 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/schema-blueprint.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/schema-vany-audit.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/format.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-title-consistency.test.ts` | 7 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/student/dashboard-planner.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/student/dashboard.test.tsx` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/teacher/lesson.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/hit-target.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/responsive-adversarial.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/ActivityRenderer-activity-families.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/lesson-keyboard-navigation.test.tsx` | 5 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/student/CompletionScreen.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/practice-blueprint.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/problem-families-modules-6-9.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/cards.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/processReview.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/srs/submissionSrs.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/placement/phase5-checkpoint-artifacts.test.ts` | 9 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/practice-item.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/problem-family.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/practice/timing-baseline.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/srs/rest-adapter-integration.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepper-guided.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/blanks/FillInTheBlank.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/quiz/ComprehensionQuiz.test.tsx` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/curriculum-depth.test.ts` | 3 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/implementation-artifacts.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/curriculum/planning-structure.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `packages/app-shell` | (no test file) | vitest exit 1: "No test files found" |
| test | `packages/efficacy-core` | `__tests__/experiment/assign.test.ts` | suite failed to load |
| test | `packages/efficacy-core` | `__tests__/experiment/registry.test.ts` | suite failed to load |
| test | `packages/efficacy-core` | `__tests__/experiment/report.test.ts` | suite failed to load |
| test | `packages/lesson-renderer` | (no test file) | vitest exit 1: "No test files found" |
| test | `packages/math-content` | `src/__tests__/prng.test.ts` | 1 failing test(s) |
| test | `packages/_template` | (no test file) | vitest exit 1: "No test files found" |
| test (scripts suite) | `scripts` | `scripts/vitest.config.ts` | vitest exit 1: "No test files found" (`include` has `__tests__/remediate-concept-blueprints.test.ts`, which matches nothing from the repository root) |
| test (audit suites) | `scripts/audit` | `scripts/audit/__tests__/audit-contract.test.ts` | reports all 21 shared packages (excludes _template from active list) |
| test (audit suites) | `scripts/audit` | `scripts/audit/__tests__/audit-contract.test.ts` | getAuditReport() returns a coherent AuditReport matching the baseline |
| measure-contract | `repository` | `tests/measure_orchestrator_audit.sh` | FAIL: A12 regression: AGENTS.md must document automation-supervisor.py as a peer-reviewed component |
| bundle audit | `apps/bus-math-v2` | `scripts/bundle-size-audit.mjs` | [EXCEEDS] Total dist/server: 11299.69 KB (threshold: 3000.00 KB) |
| bundle audit | `apps/bus-math-v2` | `scripts/bundle-size-audit.mjs` | [EXCEEDS] server/index.js → index.js: 2690.45 KB (threshold: 2500.00 KB) |
| E2E | `apps/integrated-math-3` | (not run) | not run locally (section 8) |

### Merged tree (baseline-m2, 2026-11-17)

The capture of section 2 (label `baseline-m2`) holds these failures. Each row gives the gate,
the workspace, the file, and the code. The key of a diagnostic is the workspace, the file,
and the code, without line and column (strategy 7). Counts are the number of occurrences in
the log of that workspace.

The merged tree holds 6 apps and 21 packages. `apps/danielson` adds no failure: its lint,
typecheck, test, and build all exit 0. Every workspace lint exits 0, so this part has no lint
row. The 5 audit-suite files below hold the 24 failing audit tests of `step-audit-suites.log`.

| Gate | Workspace | File | Diagnostic code |
|---|---|---|---|
| typecheck | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx` | TS2322 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepper.test.tsx` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx` | TS2322 (x8) |
| typecheck | `apps/integrated-math-3` | `__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx` | TS2305 (x1), TS2322 (x9) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/quadratic-formula-allocation.test.ts` | TS2305 (x8) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/quadratic-formula-server-writer.test.ts` | TS2305 (x9) |
| typecheck | `apps/integrated-math-3` | `__tests__/convex/seed/seed-lesson-1-6.test.ts` | TS2339 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-6-binding-projection.test.ts` | TS2305 (x1), TS2352 (x3) |
| typecheck | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-8-reconciliation.test.ts` | TS2352 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/activities/quadratic-formula-check.test.ts` | TS2305 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/activities/schemas/index.test.ts` | TS2322 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts` | TS2367 (x1) |
| typecheck | `apps/integrated-math-3` | `__tests__/lib/activities/server-grading-quadratic-formula.test.ts` | TS2305 (x2), TS2353 (x2) |
| typecheck | `apps/integrated-math-3` | `app/api/activities/quadratic-formula/attempt/route.ts` | TS2339 (x2) |
| typecheck | `apps/integrated-math-3` | `app/api/activities/quadratic-formula/check/route.ts` | TS2339 (x1) |
| typecheck | `apps/pre-calculus` | `__tests__/app/api/teacher/course/topic11-surface-real-flow.test.ts` | TS2307 (x3), TS2339 (x1) |
| test | `apps/bus-math-v2` | `__tests__/app/api/learning-evidence/bm2-pilot/teacher-consumer.red.test.ts` | 2 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/components/teacher/SubmissionDetailModal.test.tsx` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/convex/bm2-manual-source-production-flow.test.ts` | 1 failing test(s) |
| test | `apps/bus-math-v2` | `__tests__/convex/learningEvidence-bounded-authority.red.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/ci/standards-integrity-ci-wiring.test.ts` | suite failed to load |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-1-capabilities-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-1-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-2-capabilities-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-2-source.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-3-capabilities-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-3-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-10-4-capabilities-source.test.ts` | 6 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-7-4-capabilities-source.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-9-6-capabilities-source.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-9-7-capabilities-source.test.ts` | 5 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/lesson-9-7-source.test.ts` | 5 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/module-2-graph-source.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/curriculum/projected-prerequisites-consistency.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/practice/vertical-slice.test.tsx` | 5 failing test(s) |
| test | `apps/integrated-math-1` | `__tests__/setup/convex-provider.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/api/activities/submissions/route.test.ts` | 6 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/app/api/activities/submissions/selected-route.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/algebraic/StepByStepper.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/graphing/GraphingExplorer.test.tsx` | 5 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/graphing/GraphingExplorerActivity-pilot.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/activities/graphing/InteractiveTableOfValues.test.tsx` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/ActivityRenderer-graphing-explorer.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx` | 6 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx` | 7 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/components/student/PracticeCardRenderer.test.tsx` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/activities-server-owned-recovery.red.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/exports-authorization.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/learningEvidence-attempt-ordering.red.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/learningEvidence-bounded-authority.red.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/learningEvidence-production-factory.red.test.ts` | 4 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/learningEvidence-submission-authority.red.test.ts` | 12 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/quadratic-formula-allocation.test.ts` | 36 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/quadratic-formula-server-writer.test.ts` | 58 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/queue/im3-pilot-queue.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/domain-range-worked-phase-link.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/seed-lesson-1-6.test.ts` | 5 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts` | 8 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/seed-practice-items-idempotence.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/convex/seed/seed.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-6-binding-projection.test.ts` | 5 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-6-discriminant-source.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-6-worked-source.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/curriculum/lesson-1-8-reconciliation.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/activities/quadratic-formula-check.test.ts` | 8 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/activities/registry.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/activities/schemas/fill-in-the-blank.schema.test.ts` | 1 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/activities/schemas/step-by-step-solver.schema.test.ts` | 2 failing test(s) |
| test | `apps/integrated-math-3` | `__tests__/lib/activities/server-grading-quadratic-formula.test.ts` | 3 failing test(s) |
| test | `apps/integrated-math-3` | `curriculum/skill-graph/__tests__/lesson-1-1-reconciliation.test.ts` | 7 failing test(s) |
| test | `apps/integrated-math-3` | `curriculum/skill-graph/__tests__/module-1-integration.test.ts` | 11 failing test(s) |
| test | `apps/integrated-math-3` | `curriculum/skill-graph/__tests__/pilot-projection.test.ts` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/app/api/activities/precalculus-pilot/submissions/route.acceptance.test.ts` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/app/api/teacher/course/topic11-surface-real-flow.test.ts` | suite failed to load |
| test | `apps/pre-calculus` | `__tests__/app/student-dashboard.practice-sequence.test.tsx` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/app/student/saved-practice-dashboard.test.tsx` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/app/student/topic11-selected-lesson-page.test.tsx` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/app/teacher/topic11-dashboard.test.tsx` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/convex-module-paths.red.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic12-source-link.acceptance.test.ts` | 7 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic13-source-link.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic14-source-link.acceptance.test.ts` | 4 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic15-least-polynomial-degree-projection.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic15-polynomial-inequality-projection.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic15-polynomial-inequality-readiness.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic15-projection.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic16-equation-end-behavior-blueprint.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic16-equation-end-behavior-projection.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/seed/topic16-equation-end-behavior-readiness.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic11-pilot-publication-boundary.test.ts` | 3 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic11-real-production-flow.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic11-teacher-first-publication.test.ts` | 2 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic11-teacher-publication-authorization.test.ts` | 7 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic11-trusted-teacher-flow.test.ts` | 8 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic15-least-polynomial-degree-activity-constants.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic15-polynomial-inequality-activity-constants.acceptance.test.ts` | 1 failing test(s) |
| test | `apps/pre-calculus` | `__tests__/convex/topic16-equation-end-behavior-activity-constants.acceptance.test.ts` | 1 failing test(s) |
| test | `packages/math-content` | `src/knowledge-space/__tests__/cross-course-rate-cleanup.test.ts` | 1 failing test(s) |
| test | `packages/math-content` | `src/problem-families/im1/__tests__/scaffold.test.ts` | 1 failing test(s) |
| test | `packages/math-content` | `src/schemas/__tests__/quadratic-formula-activity.schema.test.ts` | 1 failing test(s) |
| test | `packages/_template` | (no test file) | vitest exit 1: "No test files found" |
| test (scripts suite) | `scripts` | `__tests__/oxc-toolchain-gates.test.ts` | 6 failing tests: case 1, case 2, case 3, case 4, case 7, case 8 |
| test (scripts suite) | `scripts` | `__tests__/remediate-concept-blueprints.test.ts` | 1 failing test: `production scan reports the honest count for the current repo state` |
| test (audit suites) | `scripts/audit` | `__tests__/audit-contract.test.ts` | 4 failing test(s) |
| test (audit suites) | `scripts/audit` | `__tests__/framework-wave-w4-audit.test.ts` | 5 failing test(s) |
| test (audit suites) | `scripts/audit` | `__tests__/framework-wave-w4.test.ts` | 6 failing test(s) |
| test (audit suites) | `scripts/audit` | `__tests__/in-range-wave-w3.test.ts` | 2 failing test(s) |
| test (audit suites) | `scripts/audit` | `__tests__/security-wave-w2.test.ts` | 7 failing test(s) |
| next-absent | `repository` | `npm ls next --all` | exit 1: `next` 16.2.7 is installed. Red by design: S1 removes it |
| measure-contract | `repository` | `tests/measure_orchestrator_audit.sh` | FAIL: A12 regression: AGENTS.md must document automation-supervisor.py as a peer-reviewed component |

The 6 red S1 cases in `__tests__/oxc-toolchain-gates.test.ts` are the S1 Test (Red) cases of
the plan. They fail at `baseline-m2`, so `key()` holds their titles in the base log, and the
`s1` gate does not report them as new. This is the reason the gate cannot close issue #2 by
itself (strategy 14.2, checks K1 to K5). Cases 5, 5b, and 6 pass at `baseline-m2` and are not
in this table. Cases 9 and 9b do not exist at this capture: they land in the follow-up Red
commit of this run.

The bundle audits have no merged-tree row. They were not part of the capture of 2026-11-17.
The pre-merge rows above stay the only record. The S1 Verify task runs both audits again.

### S1 Green run (2026-11-18)

- `audit high 11 -> 21 is registry advisory drift: the re-captured base at d4752739 gives the same set`. The re-capture ran `npm audit --json --package-lock-only` in a temp worktree at `d4752739` (the baseline lockfile) with the advisory data of 2026-11-18. It gives critical=0 high=22 moderate=6 low=5 (total 33). The `s1` run gives critical=0 high=21 moderate=6 low=5 (total 32). No advisory of the `s1` run is missing from the re-captured base, by package name or by GHSA id. The base-only advisory is `image-size`, which S1 removed with `next`. File: `gates/baseline-m2-audit-20261118.json`. The original `gates/baseline-m2/audit.txt` is not changed.
- `NEW FAILURE: typecheck apps/integrated-math-3 has a new diagnostic` is the npm error trailer of the approved 8 GB heap script (`b9d27742`), not a code diagnostic. `comm` over the gate `key()` output shows one new line, `npm error command sh -c NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit`, and one gone line, `npm error command sh -c tsc --noEmit`. All 55 `TS` keys match `baseline-m2`. The `checks-all s1` run holds these two explained lines and no other new failure.
- The scripts suite at Green: 1 failed, 34 passed of 35. The failure is the baseline row above (`remediate-concept-blueprints`, "production scan reports the honest count for the current repo state"). The 11 S1 cases pass.
- The audit suites at Green: 7 failed of 192 in 3 files (audit-contract 4, framework-wave-w4 1, in-range-wave-w3 2). Each maps to a baseline row above. `security-wave-w2` (7 at baseline) and `framework-wave-w4-audit` (5 at baseline) now pass.

### S1 Verify run (2026-11-18)

- The `@types/node` move of `packages/knowledge-space-practice` to `^24.19.2` (commit `ab3c4586`) changed two lockfile keys only: `packages/knowledge-space-practice/node_modules/@types/node` 22.20.5 to 24.19.2, and its `undici-types` 6.21.0 removed. `npm install` exit 0.
- Gates re-run after that change: `lint s1` NEWFAIL=0 exit 0; `test s1` NEWFAIL=0 exit 0 (scripts-suite 1 failed, the `remediate-concept-blueprints` baseline row; audit-suites 5 failed of 192, a subset of the 24 baseline rows); `checks-all s1` NEWFAIL=1 exit 1 with the same two explained lines as the Green run (Q1 npm trailer, Q2 audit drift). The build sweep gives exit 0 for 26 workspaces and `n/a` for `packages/practice-test-engine`, the baseline set. The workspace-set compare inside the gate reports no difference.
- Closure checks at Verify: K1 8 of 8 titles (log `w4-verify.json`), K2 15 tests 0 failed, **K3 35 tests 0 failed (`w4_failed=0`)** after the `@types/node` move, K4 `jsplugins_changed=0 jsplugins_count=3` with no `.oxlintrc.json` diff since `d4752739`, K5 the 5 audit-suite failures above, all baseline rows.
- `GREEN_TEST_COMMAND` at Verify: exit 1, 1 failed, 34 passed of 35. The only failure is the baseline `remediate-concept-blueprints` row above. The acceptance role judges it.
- `npm audit --json` at Verify (file `gates/s1-audit-verify.json`): critical=0 high=21 moderate=6 low=5 (total 32). The re-captured base of 2026-11-18 gives critical=0 high=22 moderate=6 low=5 (total 33). No advisory of this run is missing from the re-captured base. No new critical or high finding.
- Bundle audits at Verify: `bundle-size:audit` in `apps/integrated-math-3` exit 0, `[OK] server/ssr/index.js → index.js: 292.85 KB (threshold 700.00 KB)` (baseline 531.83 KB, smaller). `bundle:audit` in `apps/bus-math-v2` exit 1 as at baseline: `[EXCEEDS] Total dist/server: 9104.78 KB (threshold 3000.00 KB)` (baseline 11299.69 KB, smaller) and `[OK] server/index.js → index.js: 1154.38 KB (threshold 2500.00 KB)` (baseline EXCEEDS at 2690.45 KB, now inside budget). No entry is over budget that passed at baseline, and no budget changed.
- Dev status at Verify: 4101, 4102, 4103, 4104, and 4105 answer 200; 4106 answers 307 to `http://localhost:4106/auth/login?redirect=%2F`. Every port is free after the stop. Each app matched its baseline code.
- IM3 E2E at Verify: not run. The baseline recorded "not run locally", so the box does not run it.
- Build times at Verify: section 5 holds the six medians. All 18 runs exit 0.
- Docs and Doctor at S1: `npm run generate` exit 0 (log `jr-green-generate.log`; it rewrote no file outside the 6 known dirty generated files) and `npm run doctor` exit 0 with "All checks passed" (log `jr-green-doctor.log`).

## 11. Summary for other repositories

Phase S5 fills this section.
