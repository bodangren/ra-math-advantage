# Implementation Plan: vinext 1.x Upgrade and Oxc Toolchain Move

Track: `vinext-oxc-toolchain_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

Note: `graph.db` was stale on 2026-11-14 (last change 2026-08-08). The plan has no
blast-radius lines.

## Rules for All Phases

### Gate Commands

`<ws>` is each folder in `apps/*` and `packages/*` that has the script.

| Gate | Command |
|------|---------|
| Lint | `npm run lint --workspace=<ws>` |
| Typecheck | `npm run typecheck --workspace=<ws>`. Before S3, bus-math-v2 uses `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json`. |
| Test | `CI=true npm run test --workspace=<ws>` |
| Build | `npm run build --workspace=<ws>` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |
| Tree | `npm ls --workspaces --depth=0` |
| Advisories | `npm audit --json` (record the critical, high, moderate, and low totals) |
| Format (from S4) | `npm run format:check` |

### Baseline Comparison

- A gate passes when it has no new failure (spec "Terms").
- Record each pre-existing failure in evidence section 10.
- Do not fix a pre-existing failure. S2 lint is the only exception (spec "Non-Functional Requirements").

### Held-Package Rule

1. Set the latest version.
2. If a gate fails, read the migration guide or the changelog of the package.
3. If the guide or changelog names a code change that fixes the gate, make that change.
4. If no named change fixes the gate, set the newest version that passes all gates.
5. Record the package in evidence section 4.

### Version Ranges

- Use `^<latest>` for a stable version.
- Use the exact version for a prerelease and for oxfmt. The oxfmt output must not change between installs.
- Put the Oxc tools in the root `devDependencies` only. These are `oxlint`, `oxfmt`, `tsrs`, and `oxlint-tsgolint` when S3 needs it.
- Workspace scripts find the Oxc binaries through the root `node_modules/.bin`.

### Timing Method

1. Run the command one time to fill the file cache.
2. Run the command 3 more times with bash `time` and `TIMEFORMAT=%R`.
3. Record the median wall-clock seconds in evidence section 5.
4. Before each `tsc` run, delete the `tsconfig.tsbuildinfo` of the workspace.
5. Before each build run, delete the `dist/` folder of the workspace.
6. Do not run other heavy processes at the same time.

### Probe Test Helper

The test file is `scripts/__tests__/oxc-toolchain-gates.test.ts`. Its helper makes each
probe project in `fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-gate-'))`. When a probe needs
repository packages, the helper adds the symlink `<tmp>/node_modules` to
`<repo>/node_modules`. The helper runs each tool with
`spawnSync('npx', ['--no-install', ...], { cwd: REPO_ROOT })`. It deletes the temp folder
after each test. Each test that starts a tool has a timeout of 120000 ms.

The test file finds `REPO_ROOT` from `fileURLToPath(import.meta.url)`, not from
`process.cwd()` (lessons-learned 2026-05-03). The test file reads no file under
`measure/tracks/`, because closeout moves the track folder.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Commit the minor and patch updates together.
- Commit each major-version family in its own commit.
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").
- On 2026-11-14, `measure/generated/routes.md` had an uncommitted change from other work.
  Do not stage that change.
- When `npm run generate` changes a file under `measure/generated/`, stage the file only
  when `git diff` shows a change that the current phase caused.

## Phase S1: Package refresh and vinext 1.x [checkpoint: ee8a64b1]
_Story ref: spec.md#story-s1_

- Deviation (2026-11-15): merged `origin/master` (RSC hotfix, GHSA-xqc2-xf4c-x3h3,
  a24fa828..472fd719) into S1 with `git merge` (commit 7fa14b56). The root
  `react-server-dom-webpack` range stays `^19.3.1`; the hotfix line
  `"react-server-dom-webpack": "^19.3.1"` stays in the `dependencies` of the 5 apps (the
  installed 19.3.1 contains the 19.2.9 fix). The lockfile took the S1 side and
  `npm install` regenerated it. `measure/tech-debt.md` keeps both sides.

- [x] Task: S1 Contract — record the stack change and the evidence layout (68518169)
    - [x] In `measure/tech-stack.md` "Runtime & Framework", add a note dated 2026-11-14 (workflow principle 2). The note names vinext ^1.4.5, Vite ^8, React ^19.3.1, the removal of `next`, the `vinext/types` source, and CI on Node 24.
    - [x] Create `oxc-evidence.md` in this track folder with the 11 section headings of spec "Evidence File Contract".
    - [x] Fill evidence section 1 from `lscpu`, `nproc`, `free -g`, `uname -sr`, `node -v`, and `npm -v`.
- [x] Task: S1 Baseline — record the gates before any package change (b8a0ec66)
    - [x] Run `npm ci` on the current lockfile. Record its time in section 5.
    - [x] Run lint, typecheck, test, and build for each workspace. Record each result in section 2. (The test and checks-all gates ran as one `heavy-run.sh` job for each workspace, because `heavy-run.sh` caps a p2 job at 1800 s. Evidence section 8 records this.)
    - [x] Record each failure of these gates in section 10, with the workspace, the file, and the code.
    - [x] Run the audit suites, the boundary check, the CI check, the tree check, and `npm audit --json`. Record each result in section 2.
    - [x] Run `npm run bundle-size:audit --prefix apps/integrated-math-3`. Record the sizes.
    - [x] Run `npm run bundle:audit --workspace=apps/bus-math-v2`. Record the sizes. (It fails at baseline. Section 10 lists the two budget misses.)
    - [x] Run `npm run test:e2e --prefix apps/integrated-math-3`. If it cannot start (for example, no browser is installed), record "not run locally". (Recorded "not run locally": the web server runs `convex dev --local`, which can rewrite `.env.local`. Evidence section 8.)
    - [x] For each app, start `npx vinext dev --port <port>`. Ports: IM1 4101, IM2 4102, IM3 4103, PreCalc 4104, BM2 4105.
    - [x] Request `/` with `curl -s -o /dev/null -w '%{http_code}'`. Record the status code. Stop the server. (All 5 apps gave 200. Each port was free after the stop.)
    - [x] Time `npm run build` for each app on vinext 0.0.55. Record the times in section 5.
    - [x] Commit the evidence file: `measure(vinext-oxc): record the S1 baseline`.
- [x] Task: S1 Baseline (6 apps) — capture `baseline-m2` on the merged tree (bbd37b97)
    - [x] Run `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint baseline-m2`, then `test baseline-m2`, then `checks-all baseline-m2`, one at a time. `gates.sh` sends each job through `heavy-run.sh` itself (strategy section 2). A label that starts with `baseline` records only.
    - [x] Run the danielson `npm run build`. Record the exit code, and the first error line when it fails.
    - [x] Start danielson on port 4106 and request `/`. Record the status code, and the `location` header of a redirect.
    - [x] Make the danielson browser capture. Save one screenshot, one accessibility snapshot, and the console error list under `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-m2-danielson`.
    - [x] Record that the pre-merge `gates/baseline/` folder (26 names) is historical and is not a comparison base. Record that a phase run whose workspace set differs from the `baseline-m2` set (27 names) is a new failure (strategy 6.4 and 14.4).
    - [x] Commit the evidence file: `measure(vinext-oxc): record the 6-app S1 baseline`.
- [x] Task: S1 Test (Red) — add the S1 gate tests (Red commit: abbe15f1; Green marks `[x]` when the S1 cases pass)
    - Sync merge 2b2d9952 of origin/master 2e353ef9 (Daniel's order, 2026-11-16): 1130 commits, adds apps/danielson and oxlint tooling; the S1 baseline, cases, and gates need a re-check before S1 Verify. Green's commit C WIP is in a named stash.
    - [x] Create `scripts/__tests__/oxc-toolchain-gates.test.ts` with `describe('S1 vinext 1.x')`.
    - [x] Add `'__tests__/oxc-toolchain-gates.test.ts'` to `include` in `scripts/vitest.config.ts`. (The discovery check listed no file, so the config also got a `root` option from `import.meta.url`. Strategy section 5 names this fix.)
    - [x] Normal case 1: the `vinext/package.json` that resolves from the repository root has major version 1. (The test checks the root, each app, and `packages/app-shell`. It walks up `node_modules` because vinext 1.x has no `./package.json` entry in its `exports` map.)
    - [x] Normal case 2: `require.resolve('next/package.json')` throws from the root, from each app folder, and from `packages/app-shell`. (Paired: the test first proves that `vinext` resolves.)
    - [x] Normal case 3: no `package.json` in the root, `apps/*`, or `packages/*` declares `next` in `dependencies`, `devDependencies`, `peerDependencies`, or `overrides`. (The scan also reads `optionalDependencies` and nested override objects.)
    - [x] Normal case 4: each app `tsconfig.json` and `packages/app-shell/tsconfig.json` has `vinext/types` in `compilerOptions.types`. (The test also requires that the `{ "name": "next" }` plugin is gone.)
    - [x] Edge case 5: a probe that imports `NextConfig` from `next`, `Link` from `next/link`, and `useRouter` from `next/navigation` type-checks with exit code 0.
    - [x] The probe `tsconfig.json` has `"types": ["vinext/types"]`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, `"strict": true`, `"noEmit": true`, and a `"files"` list with the probe file. (Deviation: it also has `"module": "esnext"`, `"target": "ES2022"`, and `"skipLibCheck": true`. `moduleResolution: bundler` needs the module setting. The apps use `skipLibCheck` too.)
    - [x] The S1 type-check command for the probe is `tsc -p <tmp>/tsconfig.json`. The probe uses the `node_modules` symlink.
    - [x] Edge case 6: the same probe with `import x from "next/does-not-exist"` exits with a non-zero code. (The test also requires `TS2307`, the text `next/does-not-exist`, no `TS2688`, and no error for the `next/link` import in the same file.)
    - [x] Edge case 5b (strategy): a probe with `<Link />` and `useRouter().push(123)` exits non-zero with `TS2741` or `TS2345`, and with no `TS2688` and no `TS2307`.
    - [x] Case 7 (strategy): each `actions/setup-node` step in `.github/workflows/*.yml` has Node 24. Case 8 (strategy): the lockfile has no `node_modules/next` key and no workspace entry that lists `next`.
    - [x] Run the scripts suite. Confirm that cases 1 to 4 fail. Record the Red output in this plan.
    - [x] Commit: `test(vinext-oxc): add the S1 gate tests (Red)`.
    - Red command: `npx vitest run --config scripts/vitest.config.ts -t 'S1 vinext 1.x'`. It exits with code 1. Log: `measure/runs/vinext-oxc-toolchain_20261114/red-S1-run1.log`. Discovery check before Red: `npx vitest list --filesOnly --config scripts/vitest.config.ts` names `scripts/__tests__/oxc-toolchain-gates.test.ts`.
    - Red result of each case (first failing line):
        - case 1: red. `AssertionError: folders that resolve a vinext release that is not 1.x` (the root, 5 apps, and `packages/app-shell` all resolve major 0).
        - case 2: red. `AssertionError: folders where next is installed` (`. -> node_modules/next/package.json` and 6 more folders).
        - case 3: red. `AssertionError: manifest fields that declare next` (`package.json:devDependencies.next`, `package.json:overrides.next`, 5 apps, `packages/app-shell/package.json:peerDependencies.next`).
        - case 4: red. `AssertionError: tsconfig files without vinext/types in compilerOptions.types` (5 apps and `packages/app-shell`).
        - case 5: red. `AssertionError: expected 'error TS2688: Cannot find type defini…' not to contain 'TS2688'` (`vinext/types` does not resolve on vinext 0.0.55).
        - case 5b: red. `AssertionError: vinext/types did not resolve: expected 'error TS2688: Cannot find type defini…' not to contain 'TS2688'`.
        - case 6: red. `AssertionError: vinext/types did not resolve: expected 'error TS2688: Cannot find type defini…' not to contain 'TS2688'`.
        - case 7: red. `AssertionError: setup-node steps with a node-version that is not 24` (the `'20'` steps of `ci.yml` and `cloudflare-deploy.yml`).
        - case 8: red. `AssertionError: lockfile package keys that end with node_modules/next: expected [ 'node_modules/next' ] to deeply equal []`.
    - Rehearsal of the probes for Green (not a test): the three probe files ran against the `vinext@1.4.5` and `@vinext/types@1.0.2` packages from the registry, in a folder outside the repository, with `tsc` 6.0.3. The valid probe gave exit code 0. The invalid probe gave `TS2345` (`push(123)`) and `TS2741` (`<Link />`). The missing-module probe gave `TS2307` for `next/does-not-exist` only. The vinext types are strict, so case 5b holds on vinext 1.x.
    - Deviation for Green: the case 7 test reads the workflows with `js-yaml`. The package is not a root dependency. It is only a transitive dependency of `@eslint/eslintrc` through `apps/bus-math-v2`, and S2 removes `@eslint/eslintrc`. Green adds `js-yaml` to the root `devDependencies` in the S1 manifest commit. The S5 tests need it too.
    - Deviation for the older scripts test: the `root` option makes `scripts/__tests__/remediate-concept-blueprints.test.ts` run for the first time. It passes (log `scripts-suite-older-test.log`).
    - [x] Follow-up Red commit for the 6-app tree (strategy section 14.3). Run the discovery check first. Extend cases 1 to 4 to `apps/danielson`, with the `APP_DIRS` sentinel. Extend case 7 to the five workflow files, with its sentinels. Add the nested-vinext rule to case 8. Add the issue #2 case 9 with its seeded-fault case 9b. Add two guard cases for the `gates.sh` workspace-set rule to `scripts/__tests__/vinext-oxc-gates-script.test.ts`. Record the W4 command result in the Red log (checks K1 to K3 of strategy 14.2). Commit: `test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`.
        - Discovery check: `npx vitest list --filesOnly --config scripts/vitest.config.ts` names `scripts/__tests__/oxc-toolchain-gates.test.ts`. No config change was necessary.
        - Red command: `npx vitest run --config scripts/vitest.config.ts -t 'S1 vinext 1.x'` through `heavy-run.sh`. Exit 1. Result: 6 failed, 5 passed, 24 skipped; the describe holds 11 tests. Log `measure/runs/vinext-oxc-toolchain_20261114/red-S1-r3.log`.
        - Case results of `scripts/__tests__/oxc-toolchain-gates.test.ts`:
            - case 1 (line 217): red. Expected: `apps/danielson` resolves a major other than 1. First line: `AssertionError: folders that resolve a vinext release that is not 1.x: expected [ [ 'apps/danielson', +0 ] ] to deeply equal []`.
            - case 2 (line 233): red. Expected: 8 folders where `next` is installed. First line: `AssertionError: folders where next is installed: expected [ …(8) ] to deeply equal []`.
            - case 3 (line 256): red. Expected: 1 manifest declares `next`. First line: `AssertionError: manifest fields that declare next: expected [ Array(1) ] to deeply equal []`.
            - case 4 (line 272): red. Expected: danielson has no `vinext/types`. First line: `AssertionError: tsconfig files without vinext/types in compilerOptions.types: expected [ 'apps/danielson/tsconfig.json' ] to deeply equal []`.
            - case 5 (line 289): pass (green guard, root vinext 1.4.5).
            - case 5b (line 301): pass (green guard).
            - case 6 (line 318): pass (green guard).
            - case 7 (line 338): red. Expected: `business-math-deploy.yml` uses `'22'`. First line: `AssertionError: setup-node steps with a node-version that is not 24: expected [ Array(1) ] to deeply equal []`. The key-list sentinel and the zero-step sentinel of `jsdoc-typed-params.yml` pass first.
            - case 8 (line 369): red. Expected: the key `node_modules/next`. First line: `AssertionError: lockfile package keys that end with node_modules/next: expected [ 'node_modules/next' ] to deeply equal []`. The nested-vinext assertion is the next line and is not reached. A one-off probe of the lockfile shows `apps/danielson/node_modules/vinext`. It fails on the same rule once the `next` key leaves.
            - case 9 (line 403): pass (green guard). No manifest and no lockfile workspace entry declares `eslint` or `@eslint/js`.
            - case 9b (line 436): pass (green guard). The seeded scan returns exactly `apps/x/package.json:devDependencies.eslint` and `package.json:overrides.@eslint/js`.
        - Case results of `scripts/__tests__/vinext-oxc-gates-script.test.ts` (`describe('gates.sh workspace set (#5)')`, log `measure/runs/vinext-oxc-toolchain_20261114/red-S1-r3-guards.log`):
            - workspace set, case 12 (line 265): pass. The base lists `apps/ghost` and the run lacks it. Output has `NEW FAILURE: lint workspace set differs from the baseline:` with `apps/ghost`, `NEWFAIL=1`, exit 1.
            - workspace set, case 13 (line 281): pass. The run has `apps/x` and the base lacks it. Output has the same message with `apps/x`, `NEWFAIL=1`, exit 1.
            - The existing repository-root case covers the missing base (`NEWFAIL=0`). Falsification for cases 12 and 13 is the r5 block removal in `sweep()`, as strategy 14.4 states.
        - W4 command result (strategy 14.2, checks K1 to K3). Log `measure/runs/vinext-oxc-toolchain_20261114/w4-red-run.log`:
            - K1: `w4_passed=4 w4_failed=4`. The passed titles are `vinext`, `vite`, `@vitejs/plugin-react`, and `typescript`. The failed titles are `eslint-config-next` (16.x), `eslint` (10.x), `@eslint/js` (10.x), and `next installed lockfile version is absent`.
            - K2: the whole file holds 15 tests, 5 failed (K1's four and the `w4-framework-targets.json` loop title).
            - K3: the sibling file holds 35 tests, 6 failed: `next`, `eslint-config-next`, `eslint`, `@eslint/js`, `@types/node`, and the `pre-W4 majors` sanity title.
        - The 5 audit_step cases and the 3 repository-root cases of that file still pass (13 of 13 in the file).
        - Deviation (accepted): `findNextDeclarations` became one scanner, `scanDeclarations(entries, isKey)`, with a name predicate. Case 3 keeps its message strings and its `next`/`next@` rule. Case 9 and case 9b share the scanner (Q1 default).
    - [x] Before the first r5 `s1` gate, rename the folder `measure/runs/vinext-oxc-toolchain_20261114/gates/s1` to `gates/s1-premerge` with `mv`. It holds the pre-merge S1 results (26 names). Do not delete it. Do not set `GATES_RESUME=1` for the first run of a label (strategy 14.4).
        - Result: `mv` done on 2026-11-18. `gates/` now holds `baseline` (26 names), `baseline-m2` (27 names), and `s1-premerge` (26 names). The folder holds the pre-merge runs of 2026-11-15. It is gitignored, so the rename makes no commit. `GATES_RESUME=1` is not set for the first run of a label.
    - Green result (Jr Green, 2026-11-18): all 11 cases of the S1 describe pass. Red rerun before the change: exit 1, 6 failed (case 1, 2, 3, 4, 7, 8), 5 passed (log `jr-green-red-rerun.log`). Green run after the danielson move: `npx vitest run --config scripts/vitest.config.ts -t 'S1 vinext 1.x'` exit 0, 11 passed, 24 skipped (log `jr-green-s1-run1.log`, heavy-run `job ended exit 0`).
    - `GREEN_TEST_COMMAND` (`npx vitest run --config scripts/vitest.config.ts`) exit 1: 1 failed, 34 passed of 35. The only failure is `remediate-concept-blueprints > production scan reports the honest count for the current repo state`, a baseline failure of section 10 (accepted with Q3). Log `jr-green-full-scripts.log`.
    - Gates with `GATES_BASE=baseline-m2` (2026-11-18): `lint s1` NEWFAIL=0 (27 workspaces, exit 0). `test s1` NEWFAIL=0, exit 0 (steps scripts-suite 1 and audit-suites 1, both baseline). `checks-all s1` exit 1, NEWFAIL=1 with two lines: `NEW FAILURE: audit high 11 -> 21` (registry advisory drift, Q2, section 10) and `NEW FAILURE: typecheck apps/integrated-math-3 has a new diagnostic` (the npm error trailer of the approved 8 GB heap script `b9d27742`; `comm` proves only `npm error command sh -c NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit` is new and all 55 TS keys match `baseline-m2`; section 10). Workspace-set check: `workspaces-lint=27`, `workspaces-test=27`, `workspaces-typecheck=27`, `workspaces-build=27`, no `comm` line, run set equals disk set. `grep 'Failed to resolve import "next' gates/s1/test-*.log gates/s1/step-*.log` prints nothing.
    - Checks K1 to K5 (strategy 14.2, one JSON run, log `w4-green.json`): K1 8 of 8 titles pass with the exact set (titles 1, 2, 3, 5, 8, A, B, C). K2 15 tests, 0 failed. K3 35 tests, 1 failed: only `@types/node: every workspace declaration shares a single major-version floor (W3 must hold; W4 must not re-introduce drift)`, the one failure the K3 contract allows at Green (`packages/knowledge-space-practice` still declares `^22.20.1`; box 229 owns the move). K4 `jsplugins_changed=0 jsplugins_count=3`, and `git diff d4752739 --name-only -- .oxlintrc.json` prints nothing. K5: `audit-suites` holds 7 failed tests in 3 files (audit-contract 4, framework-wave-w4 1, in-range-wave-w3 2), a subset of the 24 baseline failures, all listed in section 10.
    - Danielson live check: `npx vinext build` exit 0 (log `jr-green-danielson-build2.log`), `npx tsc --noEmit` exit 0 (log `jr-green-danielson-tsc.log`), and dev on 4106 through `heavy-run.sh` gives `GET /` 307 with `location: http://localhost:4106/auth/login?redirect=%2F` (baseline match); the port is free after the stop (log `jr-green-4106.log`).
- [x] Task: S1 Implement — move vinext to 1.x and remove `next` (dcde148d)
    - [x] In `.github/workflows/ci.yml` and `.github/workflows/cloudflare-deploy.yml`, change each `node-version: '20'` to `'24'`. (section 3)
    - [x] In the root `package.json`, set `vinext` to `^1.4.5` and `react-server-dom-webpack` to `^19.3.1`. (section 3)
    - [x] In the root `package.json`, set `@vitejs/plugin-react` to its latest version. (section 3)
    - [x] In the root `package.json`, remove `next` from `devDependencies` and from `overrides`. (section 3)
    - [x] In each app `package.json`, remove `next`. Set `vinext` to `^1.4.5`, and `react` and `react-dom` to `^19.3.1`. (section 3)
        - Deviation: also removed the dead `geist` dependency from IM3 and BM2. No code imports it, and its required `next` peer made npm install `next` again (auto-install-peers). The `next`-absent gate needs this removal. Evidence section 8 records it.
    - [x] In each app `package.json`, set `@vitejs/plugin-rsc` to `^0.5.37` where it is declared. Set `vite` to its latest 8.x version. (section 3)
    - [x] In `packages/app-shell/package.json`, replace the `next` peer with `"vinext": "^1.4.5"`. (section 3)
    - [x] In `packages/app-shell/package.json`, add `vinext` `^1.4.5` to `devDependencies`. Set `react` to `^19.3.1`. (section 3)
    - [x] In each app `tsconfig.json`, add `vinext/types` to `compilerOptions.types`. Remove the `{ "name": "next" }` plugin entry. (section 3; case 4)
    - [x] In `packages/app-shell/tsconfig.json`, add `vinext/types` to the existing `compilerOptions.types` list. (section 3; case 4)
    - [x] Run `npm install`. (Two runs: one after the first manifest pass, one after the `geist` removal. Exit 0.)
    - [x] Run `npx vinext check` in each app. Record the score and each issue in section 8. (IM1 93%, IM2 93%, IM3 93%, PreCalc 100%, BM2 100%. The only issue class is `__dirname` / `__filename` in server-only files and scripts. Recorded in section 8.)
    - [x] If `vinext build` makes an untracked folder (for example `.vinext/` or `.cloudflare/`), add the folder to `.gitignore`. (`apps/*/.vinext/` added. Also `apps/*/.next/` for the pre-existing untracked folders of the baseline builds. IM3's tracked `.next/types/routes.d.ts` stays tracked.)
    - [x] Fix only what a failing gate needs. Use the held-package rule.
        - Deviation: the 5 app `eslint.config.mjs` files stopped importing `eslint-config-next` (and the `@typescript-eslint/no-explicit-any` override block). Reason: `eslint-config-next` loads `next/dist/compiled/babel/eslint-parser` at config time, so no app lint config could load after `next` was removed, and the lint gate had a new failure (exit 2) in the 4 apps that passed at baseline. S2 migrates these files in the next phase, so the rule loss is transitional. Evidence section 8 records it.
    - [x] Commit: `chore(deps): upgrade vinext to 1.x and remove next`. (dcde148d)
    - Deviation (2026-11-17): the merge added `apps/danielson`. These sub-boxes are part of this task. Green commits: `3c5f6a32 chore(deps): move danielson to vinext 1.x and Node 24 CI` and `050e916b chore(deps): add the danielson vite config that vinext 1.x build requires`.
        - [x] In `apps/danielson/package.json`, remove `next` `^16.0.0` from `dependencies`. Set `vinext` to `^1.4.5` and `react` and `react-dom` to `^19.3.1`.
        - [x] In `apps/danielson/tsconfig.json`, add `vinext/types` to `compilerOptions.types`. Remove the `{ "name": "next" }` plugin entry.
        - [x] In `apps/danielson/package.json`, move `@types/node` `^22` to the latest 24.x version. (`^24.19.2`, the registry latest 24.x and the range of the other workspaces.)
        - [x] In `apps/danielson/package.json`, set `@vitejs/plugin-react` and `vite` to the same range as the other 5 apps in this task. (`@vitejs/plugin-react` was already `^6.0.0`; `vite` moved `^8.0.0` to `^8.3.8`.)
        - [x] Run `npx vinext check` in `apps/danielson`. Record the score and each issue in section 8. (Exit 0, 100% compatible, 0 issues, log `jr-green-danielson-vinext-check.log`; section 8 row added.)
        - [x] Add the danielson build and its dev port 4106 to the S1 sweep. (`baseline-m2` holds `apps/danielson` in all four `.exit` files; the S1 build sweep runs it; `PROJECT_DEV_URL` names 4106; the Green 4106 check gives 307 to `/auth/login`.)
        - [x] In `.github/workflows/business-math-deploy.yml`, change `node-version: '22'` to `'24'`, next to the `ci.yml` and `cloudflare-deploy.yml` changes of the step above. (Case 7 passes; exit 0.)
        - [x] No app is ever excluded from a glob, a test, or a gate to make the phase pass (strategy R18). (Danielson is read from disk by cases 1 to 4, is swept by all four gates, and the workspace-set check gives 27 names for each script.)
- [x] Task: S1 Implement — update all other dependencies (WIP 7b5eb2fb, fixes 62f3fa60 + 933cca0d, gate refinement 21c70826; gates lint/test/checks-all s1 all exit 0 NEWFAIL=0 at the task-3 commit 4173b71f)
        - Machine-move triage result: real new failure, class `Failed to resolve import
          "next/..."` (strategy risk R4). Fixed in 62f3fa60: the 5 app `vitest.config.ts`
          files alias `next/*` to the vinext runtime shims
          (`vinext/shims/public-shim-map.json` mapping). BM2 re-run: 335 files pass, and
          the 9 remaining failures are exactly its baseline failures.
    - npm ci on the tower: exit 0 (858 packages; two earlier runs failed with registry
      ETIMEDOUT while another session used the network; third run clean).
        - Gate-required fixes recorded under this task: 933cca0d (`scripts/validate-ci.mjs`
          js-yaml 5 named import — the direct js-yaml devDependency replaced the hoisted
          transitive 4.x whose CJS default the import used; IM3 workflow-validation test
          now asserts node-version '24', the S1 CI contract).
        - Gate harness refinement 21c70826: `gates.sh` key() now keys tsc diagnostics as
          file+TScode (the spec "New failure" definition) and normalizes the npm error
          code trailer. Reason: message-text drift inside unchanged diagnostics (react
          19.3.1 / zod 4.6.7 changed inferred shapes inside error messages) over-flagged
          5 workspaces; `npm error code 2` vs `1` is a tsbuildinfo cache-state artifact
          (tsc exits 2 cacheless, 1 warm, same diagnostics). Baseline file names and log
          formats unchanged; key() re-keys both sides symmetrically, so no baseline re-run.
        - Machine difference recorded (no fix): IM3 `sessions.test.ts` fails in the
          00:00-01:00 UTC window only — the test builds a session at `now - 3600000` with
          the comment "1 hour ago, same UTC day", and the handler compares UTC calendar
          days. The old machine never ran inside the window.
    - [ ] Run `npm outdated --json` at the root.
    - [ ] Run `npm outdated --json --workspace=<ws>` for each workspace. The aggregate command under-reports app dependencies (precedent spec "Audit Baseline").
    - [x] Do not change `typescript` in S1. S3 owns it. (section 3)
    - [x] Do not change `eslint`, `@eslint/js`, `@eslint/eslintrc`, `typescript-eslint`, or `eslint-config-next` in S1. S2 removes them. (section 3)
    - [x] Set `@types/node` to its latest 24.x version, to match CI Node 24. (section 3: ^24.19.2)
    - [x] Set each other declared range to `^<latest>`. (section 3, Commit A table)
    - [x] Commit the minor and patch updates first: `chore(deps): update packages to the latest minor and patch versions`. (section 3 'Commit A'; jr-green-1896f08e.log: 7b5eb2fb)
    - [x] Update each major-version family in its own commit, for example `chore(deps): upgrade vitest to 5` with `@vitest/*`. (jr-green-1896f08e.log: 46e43cc5 ts-fsrs 6; commit C vitest 5)
    - [ ] Run all gates before each commit. Use the held-package rule.
    - [x] Record each change in section 3. (section 3)
- [x] Task: S1 Implement — move the audit suites forward (4173b71f; Green: `cd6567fe test(audit): move the W4 audit forward for S1 (issue #2)`)
    - [x] Issue #2, check K1 (strategy 14.2): in `scripts/audit/__tests__/framework-wave-w4-audit.test.ts`, make the 8 tests of `-t 'post-W4 major lines'` pass. Titles 1, 2, 3, and 5 stay. Titles 4, 6, and 7 become titles A, B, and C of strategy 14.2, copied verbatim. Title 8 stays. It turns green when the danielson move removes the key `node_modules/next`. (Green JSON run: 8 selected, 8 passed, 0 failed, the exact title set.)
    - [x] Issue #2, check K2 (strategy 14.2): the whole file has at least 15 tests and 0 failed tests. This includes the test at file line 249, "every W4 framework major installed lockfile version satisfies its w4-framework-targets.json target_version range". Give `eslint-config-next`, `eslint`, and `@eslint/js` the absence rule in its loop. Keep the fixture entries. (15 tests, 0 failed.)
    - [x] Issue #2, check K3 (strategy 14.2; question Q2 of strategy 15.3, default yes): in `scripts/audit/__tests__/framework-wave-w4.test.ts`, give the 5 tests at lines 406, 434, 500, 528, and 630 the same rule. Its `@types/node` test (line 560) follows the `@types/node` move. (35 tests, 1 failed: only the `@types/node` title, which the K3 contract allows at Green; `packages/knowledge-space-practice` still declares `^22.20.1` and box 229 owns that move.)
    - [x] Follow the durability contract of strategy 14.2 (R9 and R20). The version floors stay for the required packages. Each removed package gets an absence check. No `it(` or `expect(` line disappears unless it names a removed package.
    - [x] Follow the peer-only rule of strategy 14.2. S1 asserts manifest absence for `eslint` and `@eslint/js`. It also asserts `peer: true` for each lockfile copy. The two React ESLint plugins stay, because the root `.oxlintrc.json` loads them as `jsPlugins`. No test asserts lockfile absence of `eslint` or `@eslint/js`.
    - [x] Run the audit suites. Find each assertion that passed in the baseline and fails now only because S1 changed or removed a package. (The `audit-suites` step of `test s1`: 7 failed of 192, a subset of the 24 baseline failures.)
    - [x] Change each such assertion to the durable contract of lessons-learned 2026-06-07. The declared range admits the installed version.
    - [x] The durable contract also requires: no range is `latest`, `*`, or empty, and the old security floor stays a minimum.
    - [x] For a removed package, assert that no manifest declares it.
    - [x] Do not change an assertion that failed in the baseline. It stays in section 10. The tests of checks K1 to K3 are the one exception.
    - [x] Commit: `test(audit): move the audit suites forward for vinext 1.x`. (Green landed it as `cd6567fe test(audit): move the W4 audit forward for S1 (issue #2)`, the orchestrator-directed message.)
- [x] Task: S1 Verify — run the gates after the upgrade (ea024eee)
    - [x] Run each gate. Confirm that no gate has a new failure. (`lint s1` NEWFAIL=0 exit 0; `test s1` NEWFAIL=0 exit 0; `checks-all s1` NEWFAIL=1 exit 1 with only the two accepted lines: the Q1 IM3 npm trailer and the Q2 audit drift. Evidence section 10 holds both proofs.)
    - [x] Confirm that the scripts suite passes, with the S1 case set of strategy 6.2 (cases 1 to 9, with 5b and 9b: 11 tests). Run the closure checks K1 to K5 of strategy 14.2. Confirm that they hold. (`GREEN_TEST_COMMAND` exit 1: 1 failed, 34 passed of 35; the only failure is the pre-existing `remediate-concept-blueprints`, and all 11 S1 cases pass. K1 8 of 8 titles, K2 15 tests 0 failed, K3 35 tests 0 failed (`w4_failed=0` after `ab3c4586`), K4 `jsplugins_changed=0 jsplugins_count=3` with no `.oxlintrc.json` diff, K5 the 5 audit-suite failures are baseline rows. Logs `w4-verify.json`, `jr-green-full-scripts.log`.)
    - [x] Confirm that all 6 apps pass `npm run build`, danielson included. (The `checks-all` build sweep: exit 0 for 26 workspaces and `n/a` for `packages/practice-test-engine`, the baseline set. The 18 timed runs also all exit 0.)
    - [x] Confirm that `/` of each app gives the baseline status code. (4101 to 4105 answer 200; 4106 answers 307 to `http://localhost:4106/auth/login?redirect=%2F`. Every port is free after the stop. Log `jr-green-dev-6apps.log`.)
    - [x] Run both bundle audits. If a budget fails, do not change the budget. Stop the phase and report the sizes to the user. (IM3 exit 0: `[OK] server/ssr/index.js → index.js: 292.85 KB (threshold 700.00 KB)`, baseline 531.83 KB. BM2 exit 1 as at baseline: `[EXCEEDS] Total dist/server: 9104.78 KB (threshold 3000.00 KB)`, baseline 11299.69 KB, and `[OK] server/index.js → index.js: 1154.38 KB (threshold 2500.00 KB)`, baseline EXCEEDS at 2690.45 KB. No entry is over budget that passed at baseline, and no budget changed, so the phase does not stop.)
    - [x] If the baseline ran the IM3 E2E suite, run it again. Confirm the baseline result. (The baseline recorded "not run locally". Not run.)
    - [x] Confirm that `npm audit` has no new critical or high finding. (`gates/s1-audit-verify.json`: critical=0 high=21 total=32 against the re-captured base of 2026-11-18: critical=0 high=22 total=33. No advisory of this run is missing from the base.)
    - [x] Time `npm run build` for each app on vinext 1.x. Record the times in section 5. (Section 5 holds the six medians: IM1 6.6 s, IM2 9.5 s, IM3 12.0 s, PreCalc 10.8 s, BM2 14.8 s, danielson 6.0 s. All 18 runs exit 0. Log `build-times-verify.txt`.)
    - [x] Commit the evidence file: `measure(vinext-oxc): record the S1 results`. (Landed with this edit.)
- [x] Task: S1 Docs & Doctor (ea024eee)
    - [x] Run `npm run generate`. Confirm exit code 0. (Exit 0. Log `jr-green-generate.log`. It rewrote no file outside the 6 known dirty generated files; those stay unstaged.)
    - [x] Run `npm run doctor`. Confirm exit code 0. (Exit 0. Log `jr-green-doctor.log`. Output: "All checks passed".)
- [x] Task: Measure - User Manual Verification 'Phase S1: Package refresh and vinext 1.x' (Protocol in workflow.md) (ee8a64b1)
    - [x] Run the protocol: the automated tests, the manual verification plan, and the user confirmation. (S1 filter 11 pass, exit 0; adversarial filter 7 pass, exit 0; gates.sh test s1 NEWFAIL=0, adversarial run 2; full scripts suite 48 pass / 1 fail, the pre-existing remediate-concept-blueprints row; UX browser at 413a2138: 4103 200, 4105 200, 4106 307 to login, same as baseline, 0 new console errors) PM is the confirming user (orchestrator default, 2026-11-18).
    - [x] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`. (ee8a64b1)
    - [x] Append `[checkpoint: ee8a64b1]` to the Phase S1 heading. (ee8a64b1)
    - [x] Commit: `measure(plan): Mark phase 'Phase S1: Package refresh and vinext 1.x' as complete`. (this commit)

Phase note (2026-11-17): the S1 phase base is captured after the r6 strategy commit (strategy section 4). The run log and the role handoff hold it. No plan line carries a phase SHA.

## Phase S2: ESLint to oxlint [checkpoint: c36867b9]
_S2 confirms and records the oxlint move that eslint-to-oxlint-migration_20260820 made. That track is superseded by S2 (PM 2026-11-18)._
_Story ref: spec.md#story-s2_

- [x] Task: S2 Contract — record the lint change (335cd77d)
    - [x] In `measure/tech-stack.md`, add a dated note. The note names the oxlint version of the root `package.json`, the one root `.oxlintrc.json`, and native rules only. (Added the section "S2 lint contract (2026-11-18, `vinext-oxc-toolchain_20261114`)". It names `oxlint` `^1.79.0` (installed 1.93.0), the root `.oxlintrc.json`, the native rules, and three `jsPlugins` adapters. The tree holds three adapters, not two: `oxlint-plugin-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`. K4 records `jsplugins_count=3`.)
    - [x] Use the single-root layout (strategy 13.8 item 4, checked 2026-11-17). The tree has one root `.oxlintrc.json` and no per-workspace copy. No `eslint.config.*` file is tracked. (`find . -name .oxlintrc.json -not -path '*/node_modules/*'` prints `./.oxlintrc.json` only. `find . -name 'eslint.config.*' -not -path '*/node_modules/*'` prints nothing.)
    - [x] 26 of the 27 workspace lint scripts name `../../.oxlintrc.json`. `packages/_template` runs an `echo` line and stays as it is. (Count of the 6 apps and 21 packages: 27 lint scripts, 26 with the config, `packages/_template` with `echo 'No lint configured for template package'`.)
    - [x] The app lint script is `oxlint --config ../../.oxlintrc.json . --max-warnings 0`. (Confirmed in the 6 apps.)
    - [x] The package lint script is `oxlint --config ../../.oxlintrc.json src --max-warnings 0`. (Confirmed in the 20 packages with a lint script.)
    - [x] No second `.oxlintrc.json` exists outside `node_modules`. The S2 cases read each lint script and its `--config` target (strategy R17). (The `find` above prints one path. S2 case 3 reads each script and the config path.)
    - [x] `oxlint` stays in the root `devDependencies` only. S1 sets its range to the latest version. (Root `devDependencies`: `oxlint` `^1.79.0`, `@oxlint/plugins` `^1.79.0`, `oxlint-plugin-eslint` `^1.79.0`. No app or package manifest declares an `oxlint` name. Installed copy: 1.93.0.)
    - [x] Open: no `eslint.config.*` file remains, so no ESLint "before" lint timing can run on this tree. The S2 refresh decides how to fill the "before" value of the lint row in section 5. (Recorded as an open item in the note. Default for S2 Verify: write "n/a — no ESLint config remains".)
- [x] Task: S2 Test (Red) — add the S2 gate tests (Red commit: a329d7d5; Green marks `[x]` when the S2 cases pass: 7 passed at 077b77dc)
    - [x] Add `describe('S2 oxlint')` to the test file. (Added to `scripts/__tests__/oxc-toolchain-gates.test.ts`, after the S1 describe block.)
    - [x] Normal case 1: no manifest declares `eslint`, `typescript-eslint`, `eslint-config-next`, `@eslint/js`, or `@eslint/eslintrc`. The root `overrides` has no `eslint` key. (Guard: pass. The scan reads the root, 6 apps, and 21 packages. Override keys with a version suffix, such as `eslint@10`, also match.)
    - [x] Normal case 2: no `eslint.config.*` file exists under `apps/` or `packages/`, outside `node_modules`. (Guard: pass. A sentinel proves that the walk finds the app manifests.)
    - [x] Normal case 3: each workspace lint script, except `packages/_template`, is in the target form and names `../../.oxlintrc.json`. No `.oxlintrc.json` other than the root exists outside `node_modules`. (Guard: pass. 27 lint scripts, 26 name the config, and the template package keeps its `echo` line. The root scan finds one path, `.oxlintrc.json`.)
    - [x] Edge case 4: a probe with `const unused = 1;` fails `oxlint --config <repo>/.oxlintrc.json --max-warnings 0 <probe>`. The exit code is non-zero, and the output contains `no-unused-vars`. (Guard: pass. The probe lives in a temporary folder under `apps/`, because the root config rules match only `apps/` and `packages/` paths. A probe in the system temp folder matches no rule. The folder is removed in `afterEach`.)
    - [x] Edge case 5: the same probe with `/* oxlint-disable */` as its first line exits with code 0. (Guard: pass.)
    - [x] Normal case 9 (strategy section 8, issue #2, non-droppable): `package-lock.json` has no `node_modules/eslint-config-next` key and no `node_modules/typescript-eslint` key. Each of `node_modules/eslint`, `node_modules/@eslint/js`, and `node_modules/@eslint/eslintrc` is absent or has `peer: true`. Each `jsPlugins` specifier of `.oxlintrc.json` has a `node_modules/<specifier>` key. (Guard: pass. The three copies have `peer: true` and the flag `dev`. The config holds three `jsPlugins` entries, not two: `oxlint-plugin-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`.)
    - [x] Edge case 9b: the scan of case 9 runs on an in-memory lockfile with one seeded fault for each clause. It returns exactly 3 hits. (Guard: pass. Hits: `a:node_modules/typescript-eslint`, `b:node_modules/eslint`, `c:oxlint-plugin-missing`.)
    - [x] Run the scripts suite. Record each case that fails. Cases 1 to 3 and case 9 already pass at the merged tree (strategy section 8), so the S2 refresh re-derives the Red set. The refresh cannot drop case 9 or case 9b. (`npx vitest run --config scripts/vitest.config.ts -t 'S2 oxlint'`: 7 passed, 0 failed. No S2 case fails at this tree. All 7 cases are guards. The migration landed before S2, so the Red set is empty. This task records the guards and does not drop or weaken a case.)
    - [x] Commit: `test(vinext-oxc): add the S2 gate tests (Red)`. (a329d7d5.)
    Known exception (PM 2026-11-18): the S2 Red gate exits 1 with `'RED_TEST_COMMAND failed (expected failure, exit 0)'`, because all 7 S2 cases pass at 43d42193 after the superseded lint track made the oxlint move, so S2 is guard-only.
- [x] Task: S2 Implement — record the migration that the lint track made (rewritten 2026-11-17) (6b33da07)
    - [x] `eslint-to-oxlint-migration_20260820` made the migration. Ran no `@oxlint/migrate` command. Made no per-workspace `.oxlintrc.json` (one root `.oxlintrc.json` only).
    - [x] The S2 refresh filled evidence sections 6 (rule inventory: 10 overrides, 667 entries, 3 jsPlugins; no gaps derivable) and 8 (no migrate input, `n/a` before-timing, peer-only copies kept).
- [x] Task: S2 Implement — confirm the lint switch (made by the lint track) (confirm-only; no commit; marked complete in d891a9c9)
    - [x] Confirmed that `oxlint` `^1.79.0` (installed 1.93.0) is in the root `devDependencies`, and in no workspace manifest.
    - [x] Confirmed that 26 lint scripts (6 apps and 20 packages) are in the target forms; `packages/_template` keeps its `echo` line.
    - [x] Confirmed that no `eslint.config.*` file is tracked, that no manifest declares the 5 ESLint packages, and that the root `overrides` (`{"typescript":"^6"}`) has no `eslint` key.
    - [x] Recorded in section 8 that the lockfile keeps `eslint` 9.39.5, `@eslint/js` 9.39.5, and `@eslint/eslintrc` 3.3.7 as peer-only copies (`peer: true`); both React plugins and all 3 `jsPlugins` entries stay.
    - [x] No manifest changed, so no `npm install` ran. The task makes no file change, so it makes no commit.
- [x] Task: S2 Implement — reach zero warnings (exit 0; findings pinned by the allow-list; 119a8de3, 777d74c6)
    - [x] Ran `npm run lint` in each workspace through `gates.sh lint s2` (one `heavy-run.sh` job each): all 27 exit 0, `NEWFAIL=0`.
    - [x] Correction (S2 remediation, 2026-11-19): the 27 lint scripts exit 0 with zero warnings, and 49 tracked files carry pre-existing disable directives (7 blanket blocks, 44 next-line directives without a reason). The zero-warning state rests partly on these suppressions, not on clean code alone.
    - [x] Pinned all 49 carriers by `scripts/__tests__/fixtures/lint-disable-allowlist.json`: adv 7 fails on an unlisted carrier file, a stale entry, a new blanket block, or a hidden rule the entry does not record (F1, option B; `119a8de3`).
    - [x] No behavior-changing fix was needed in S2, so no code file changed; the debt is recorded in `measure/tech-debt.md` ("Lint disable directives hide live oxlint findings") for a later track.
    - [x] Skipped the `fix(lint)` commit: S2 changes no linted file (plan allows the skip).
- [x] Task: S2 Verify — run the gates after the lint change (91050201)
    - [x] Confirmed that all 26 oxlint lint scripts exit 0 with empty output (zero warnings); `lint s2` gives `NEWFAIL=0` over 27 workspaces.
    - [x] Ran the other gates: `test s2` gives `NEWFAIL=0`; `checks-all s2` gives `NEWFAIL=1` with only the two S1-accepted lines (IM3 npm trailer, audit drift); workspace sets give `workspaces-<script>=27` four times with no `comm` line.
    - [x] Confirmed that the scripts suite gives 48 passed and 1 failed: only the pre-existing `remediate-concept-blueprints` row; all 7 S2 cases pass.
    - [x] Ran K1 to K4 with the S2 phase base `43d42193`: K1 8/8, K2 15 tests 0 failed, K3 35 tests 0 failed, K4 `jsplugins_changed=0 jsplugins_count=3` with no `.oxlintrc.json` diff.
    - [x] Timed `npm run lint` for the 26 workspaces (1 warm + 3 timed runs, medians in section 5); "before" is `n/a — no ESLint config remains`.
    - [x] Committed the evidence file: `measure(vinext-oxc): record the S2 results` (91050201).
- [x] Task: S2 Docs & Doctor (077b77dc)
    - [x] In `measure/tech-debt.md`, restored the row "math-content package lint gate missing" as `Resolved` with this track id (077b77dc).
    - [x] Ran `npm run generate`. Exit code 0; only the 6 known dirty generated files changed, left unstaged.
    - [x] Ran `npm run doctor`. Exit code 0 ("All checks passed").
    - [x] Corrected `spec.md` line 252 to name the 3 kept `jsPlugins` (077b77dc).
- [x] Task: Measure - User Manual Verification 'Phase S2: ESLint to oxlint' (Protocol in workflow.md) (c36867b9)
    - [x] Run the protocol: the automated tests, the manual verification plan, and the user confirmation. (S2 oxlint 7 pass, S2 adversarial 13 pass, phase acceptance at 6cbdbbdf; PM is the confirming user, orchestrator default 2026-11-19. S2 has no user-facing change.)
    - [x] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`. (c36867b9)
    - [x] Append `[checkpoint: c36867b9]` to the Phase S2 heading. (c36867b9)
    - [x] Commit: `measure(plan): Mark phase 'Phase S2: ESLint to oxlint' as complete`. (this commit)

Phase note (2026-11-19, S2 remediation): strategy section 8 rows "case 7" ("Zero warnings by blanket disable") and "on <n> files" ("Oxlint reads no file") are superseded by adv 6/adv 7 and case 4 (Review A F5, adversarial F2). The strategy role owns the revision; no strategy file changes in S2.

### S2 remediation sub-box (Jr Green rounds)
- Round 2 (2026-11-19, `35ffb32b`): counted and stripped mid-line and multi-line block disable comments in both spellings (Review A F7, adversarial F1r2). Adv 9 passes as written. The fixture stays exact: all 49 entries match under the old and new counts, so no entry changed. Accepted residual: adversarial F2r2 stays; no count anchor exists, and the fixture diff review is the defense. Gates: S2 adversarial 9 pass, S2 oxlint 7 pass, S1 adversarial 7 pass, S1 vinext 1.x 11 pass, full scripts suite 57 pass with only the pre-existing remediate-concept-blueprints failure, `npx tsc --noEmit` exit 0, `test s2` NEWFAIL=0.
- Round 3 (2026-11-19, `fde3eda2`): replaced the comment regexes with the TypeScript parser (`typescript` 6.0.3): each file parses with the ScriptKind of its extension, comment ranges come from token trivia, and only text inside a real comment range counts as a directive. This closes F1r3 (CRLF trailing forms now strip) and F2r3 (an in-string `/*` no longer swallows code; the strip blanks ranges with spaces and keeps newlines, so positions stay). Adv 10 and adv 11 pass as written; adv 1 to 9 and adv 12 hold. F3r3 is resolved by the tokenizer (disable text in strings and templates never counts). F4r3 stays an accepted limitation, noted in the helper comment. The fixture stays exact: all 49 entries match under the tokenizer, so no entry changed. Gates: S2 adversarial 12 pass, S2 oxlint 7 pass, S1 adversarial 7 pass, S1 vinext 1.x 11 pass, full scripts suite 60 pass with only the pre-existing remediate-concept-blueprints failure, `npx tsc --noEmit` (repo root) exit 0, `test s2` NEWFAIL=0 (the stale scripts-suite step record was dropped first, so the step re-ran).
- [x] Adversarial r4 at b9a4f0c2 passed (adv 13 added; Nits F1r4 and F2r4 accepted). (b9a4f0c2)
- [x] Recorded deviation (Review A F9, 2026-11-19): the test file imports the installed `typescript` package for the comment scan, against test-strategy section 5 (lines 221-222). The S3 strategy refresh reconciles section 5 with the S3 contract (plan line 342: the kept `typescript` package uses 7.0.2) before S3 Red, and checks that the scan API stays available. (fde3eda2) Resolved by strategy r7 section 16.2.

## Phase S3: TypeScript 7 and tsrs [checkpoint: 7e0f7a4]
_Story ref: spec.md#story-s3_

- [x] Task: S3 Contract — record the type-check change (3effc7e4)
    - [x] In `measure/tech-stack.md`, add a dated note. The note names TypeScript 7.0.2, tsrs `0.25.0-ts7.1.0-beta`, `TSRS_FAST=1`, and the oxlint type-check gate.
    - [x] The note also says that tsrs uses the TypeScript 7.1.0-beta compiler line, and the kept `typescript` package uses 7.0.2.
    - [x] Use this target layout. The app typecheck script is `TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .`.
    - [x] The package typecheck script is the same command with `src` in place of `.`.
    - [x] Each package `build` script that is `tsc --noEmit` now becomes `npm run typecheck`.
    - [x] bus-math-v2 gets the app typecheck script.
    - [x] `tsrs` `0.25.0-ts7.1.0-beta` (exact) goes in the root `devDependencies` only.
    - [x] Each CI typecheck step becomes `npm run typecheck --workspace=<app folder>`.
    - [x] Time `tsc --noEmit` on TypeScript 6.0.3 for each workspace. Record "before" in section 5. (27 workspaces, medians in section 5, raw `s3-tsc-before-raw.txt`; IM3 22.4 s, BM2 17.9 s; warm exits of IM3 and PreCalc are the section 10 pre-existing failures)
- [x] Task: S3 Test (Red) — add the S3 gate tests (Red commit: 9c65b44a; Green marks `[x]` when the S3 cases pass; Green at ec3a05ae: `-t 'S3 tsrs'` 8 passed, exit 0)
    - [x] Add `describe('S3 tsrs')` to the test file. Add two constants: `TYPESCRIPT_KEEP_LIST = []` and `TSC_FALLBACK_LIST = []`. Add `SCAN_PARSER_PACKAGE = 'typescript6'`. State that `TYPESCRIPT_KEEP_LIST` tracks only manifests that declare the package named `typescript`.
    - [x] Case 0: the S2 disable scan keeps the 6.0 parser API through the alias. Use `createRequire`, already imported, so a missing alias cannot break module load. Assert that the root `package.json` declares `devDependencies.typescript6` as `npm:@typescript/typescript6@^6.0.2`. Assert that `createRequire` from the repository root resolves `typescript6/package.json`, and that its `version` has major 6, parsed as an integer (A3). Assert that the required module exposes `createSourceFile`, `getLeadingCommentRanges`, and `getTrailingCommentRanges` as functions, and defines `ScriptKind.TSX`.
    - [x] Normal case 1: each workspace typecheck script is the target form. A workspace in `TSC_FALLBACK_LIST` has `tsc --noEmit`.
    - [x] Normal case 2: no package `build` script contains `tsc`.
    - [x] Normal case 3: `tsrs/package.json` resolves from the repository root.
    - [x] Normal case 4: no `run` line in `.github/workflows/*.yml` contains `tsc`.
    - [x] Normal case 5: the manifests that declare `typescript` are exactly the paths in `TYPESCRIPT_KEEP_LIST`.
    - [x] Edge case 6: a probe `export const n: number = "x";` runs with `TSRS_FAST=1 npx --no-install oxlint --config ../../.oxlintrc.json --type-aware --type-check <tmp>`. The exit code is non-zero, and the output contains `TS2322`.
    - [x] The probe `tsconfig.json` has `"strict": true`, `"noEmit": true`, `"types": []`, and a `"files"` list with the probe file.
    - [x] Edge case 7: the probe `export const n: number = 1;` exits with code 0.
    - [x] Change S1 edge cases 5 and 6 to use the S3 type-check command. Both cases stay red until Green (16.3 and section 9). (Case 5b shares the helper and stays red too; recorded as planned.)
    - [x] Run the scripts suite. Confirm that cases 1 to 7 fail. (`-t 'S3 tsrs'`: 8 failed of 8, exit 1; each case fails with its named reason, recorded below.)
    - [x] Test-infrastructure guard: `gates.sh` classifies `EDQUOT` and `ENOSPC` output as infrastructure. (Test commit 90b31fe0, fix commit 4f4fc3c4. Pre-change the two infra cases fail with `NEW FAILURE: lint apps/x exit 1`, exit 1. Post-change all 3 guard cases pass and the file holds 18 of 18. `bash -n` passes.) Add three guard cases to `scripts/__tests__/vinext-oxc-gates-script.test.ts` that feed a fake job log with `ENOSPC: no space left on device`, with `EDQUOT: disk quota exceeded`, and with a normal `TS2322` line. The first two expect `INFRA FAILURE:` and exit 3 with `INFRA=1`, and no `NEW FAILURE: ... has a new diagnostic`. The third expects `NEWFAIL=1` and no `INFRA=1`. Then change `gates.sh`: add `has_infra_output()`; drop the errno lines in `key()`; set `JOB_CODE=290` in `run_job()` when a log matches, with `290` added to `INFRA`; keep the labeled last lines `NEWFAIL=<n>` and `INFRA=1`. Run `bash -n`. Falsification: remove the helper and the two infra cases fail; remove the `key()` filter and a stale log becomes a new diagnostic.
    - [x] Commit: `test(vinext-oxc): add the S3 gate tests (Red)`. (9c65b44a.) Add the `typescript6` alias to the root `devDependencies` in the Red or Implement commit that first needs it. Keep the static import at line 9 on `typescript` until the alias lands, so the Red run loads. Switch the import to `typescript6` in the same commit that installs the alias. Then run the S2 filters (16.2). (S2 adversarial 13 pass, S2 oxlint 7 pass at 9c65b44a.)
    - Red command: `npx vitest run --config scripts/vitest.config.ts -t 'S3 tsrs'`. It exits with code 1. Log: `measure/runs/vinext-oxc-toolchain_20261114/red-s3-<head>.log`.
    - Red result of each case (first failing line):
        - case 0: red. `AssertionError: root devDependencies: expected { …(11) } to match object { Object (typescript6) }`.
        - case 1: red. `AssertionError: workspaces without a typecheck script: expected [ 'apps/bus-math-v2' ] to deeply equal []`.
        - case 2: red. `AssertionError: package build scripts that contain tsc: expected [ …(20) ] to deeply equal []`.
        - case 3: red. `Error: Cannot find module 'tsrs/package.json'`.
        - case 4: red. `AssertionError: workflow run lines that call tsc: expected [ …(6) ] to deeply equal []`.
        - case 5: red. `AssertionError: manifest fields that declare typescript: expected [ …(28) ] to deeply equal []`.
        - case 6: red. `AssertionError: precondition: tsrs --version: expected 1 to be +0 // Object.is equality`.
        - case 7: red. `AssertionError: precondition: tsrs --version: expected 1 to be +0 // Object.is equality`.
        - S1 case 5, 5b, 6 (planned, share the S3 command): red on the missing tsrs. `AssertionError: Failed to find type-aware linter executable. You may need to add the tsrs or oxlint-tsgolint package to your project?` (5); `expected 'Failed to find type-aware linter exec…' to match /TS2741|TS2345/` (5b); `expected 'Failed to find type-aware linter exec…' to match /TS2307/` (6).
- [x] Task: S3 Implement — move to TypeScript 7 (ccfe3571)
    - [x] Set `typescript` to `^7.0.2` in the root `devDependencies`, the root `overrides`, and each workspace that declares it. (26 workspace manifests plus the root; `packages/practice-test-engine` declares no `typescript` and keeps none.)
    - [x] Run `npm install`. (`added 1 package, and audited 854 packages in 3s`, exit 0.)
    - [x] Run `npx tsc --noEmit -p <tsconfig>` for each workspace. For each app, also run it for `<app>/convex/tsconfig.json`. (33 configs: 27 workspace and 6 `convex/tsconfig.json`. Each failing config holds the same file-plus-code key set as 6.0.3. Raw: `tsc7-sweep.txt` and `tsc-diff.txt` in the run folder.)
    - [x] Fix each tsconfig option that TypeScript 7 rejects. Use the replacement that the TypeScript 7 release notes name. (No option rejected. No tsconfig changed. Evidence section 8.)
    - [x] Fix each new failure. (None. `tsc-diff.txt` reports `new_keys=0 gone_keys=0` for all 33 configs.)
    - [x] Time `tsc --noEmit` on TypeScript 7.0.2 for each workspace. Record the times in section 5. (Medians: IM3 22.4 s to 4.0 s, BM2 17.9 s to 2.6 s. Raw: `s3-tsc7-raw.txt`.)
    - [x] Commit: `chore(deps): upgrade typescript to 7`. (ccfe3571. The commit also installs the `typescript6` alias and the line-9 import switch, because the test file cannot load the parser API from TypeScript 7. The plan allows the move; the S2 filters ran green in the same commit: `S2 adversarial` 13 pass, `S2 oxlint` 7 pass.)
    - Note: root `"@typescript/native": "npm:typescript@^7.0.2"` is kept. It is not the registry name that strategy 16.2 rejected (E404). It is a local alias, and it is needed: without it the `@typescript/old` copy of typescript 6.0.3 wins the root `.bin/tsc` link and `npx tsc --version` prints `Version 6.0.3`. Evidence section 8.
- [x] Task: S3 Implement — switch the typecheck scripts to tsrs (c0426865)
    - [x] Add `tsrs` `0.25.0-ts7.1.0-beta` to the root `devDependencies`. Run `npm install`. (The first install wrote the lockfile entries but not the platform package; a second `npm install` placed `@tsrs/linux-x64-gnu`. Evidence section 8.)
    - [x] Set the typecheck scripts, the package `build` scripts, and the bus-math-v2 typecheck script to the target forms. (26 workspaces on the tsrs form; 4 apps on `tsc --noEmit` with a blocking gap: BM2, IM1, IM3, PreCalc. Evidence section 7.)
    - [x] If oxlint reports that `--type-aware` needs `oxlint-tsgolint`, add `oxlint-tsgolint` `^7.0.2007` to the root `devDependencies`. Record it in section 8. (Not needed: `tsrs` 0.25.0-ts7.1.0-beta provides the executable.)
    - [x] In `.github/workflows/ci.yml` and `cloudflare-deploy.yml`, replace each `cd <dir> && npx tsc --noEmit` with `npm run typecheck --workspace=<dir>`. (Also `business-math-deploy.yml`, so no run line in any workflow calls `tsc`. `node scripts/validate-ci.mjs` exits 0.)
    - [x] Commit: `chore(typecheck): run the type check through oxlint and tsrs`. (c0426865.)
- [x] Task: S3 Implement — compare tsrs with tsc on the same compiler line (fa72040e)
    - [x] Run `npx tsrs --version` and `npx --yes -p typescript@7.1.0-beta tsc --version`. Record both versions at the top of section 7. (`Version 7.1.0-beta (tsrs 0.25.0-ts7.1.0-beta, microsoft/TypeScript@3e9236361fa9)` and `Version 7.1.0-beta`; commit `dbf29cbd`.)
    - [x] If the tsrs version names a TypeScript line other than 7.1.0-beta, use `tsc` from that line in the next steps. Record the line. (It names 7.1.0-beta; `tsc` 7.1.0-beta is used.)
    - [x] On one commit, collect the `tsc` 7.1.0-beta diagnostics of each workspace with `npx --yes -p typescript@7.1.0-beta tsc --noEmit --pretty false -p <tsconfig>`. For each app, include `<app>/convex/tsconfig.json`.
    - [x] Do not add `typescript@7.1.0-beta` to a manifest. The `npx -p` command runs it from the npx cache. (No manifest entry; `npm ls typescript --all` holds only 7.0.2.)
    - [x] On the same commit, collect the tsrs diagnostics with the typecheck command and `--format json`.
    - [x] On the same commit, collect the `tsc` 7.0.2 diagnostics with `npx tsc --noEmit --pretty false -p <tsconfig>`.
    - [x] Compare the `tsc` 7.1.0-beta set and the tsrs set by file, line, and TS code. Record each difference in the gap table of section 7. (38 tsrs-only rows, all in IM3 `scripts/*.mjs`; 69 tsc-only rows: BM2 67, IM3 2.)
    - [x] Compare the `tsc` 7.0.2 set and the `tsc` 7.1.0-beta set the same way. Record each difference in the compiler-version table of section 7. (0 differences in all 27 workspaces.)
    - [x] For a tsrs-only diagnostic, find a code change that does not change behavior and keeps `tsc` 7.0.2 and `tsc` 7.1.0-beta clean. If one exists, make it and record it in section 8. (None exists: the rows are `.mjs` scripts outside the app `include` and `process` under a `types` list without node.)
    - [x] If no such change exists, set the typecheck script of that workspace to `tsc --noEmit`. (IM3 already has it.)
    - [x] Add that workspace to `TSC_FALLBACK_LIST` and to `TYPESCRIPT_KEEP_LIST`. Record the gap as "blocking" in section 7. (IM3 is in both.)
    - [x] For a diagnostic that only `tsc` 7.1.0-beta reports, record "missed by tsrs" in section 7. Make no code change.
    - [x] Commit: `measure(vinext-oxc): record the tsrs conformance gaps`. (fa72040e.)
- [x] Task: S3 Implement — decide where `typescript` stays (bdebdf65)
    - [x] Read the Convex CLI type-check code under `node_modules/convex/dist/cli/`. Search for `typecheck`. (`dist/esm/cli/lib/typecheck.js`; the bundled `dist/cli.bundle.cjs` holds the same code.)
    - [x] Record how the Convex CLI finds TypeScript in section 9, with the file and the line. (Lines 110-128.)
    - [x] Remove `typescript` from each manifest that `TYPESCRIPT_KEEP_LIST` does not name. Remove it from the root `overrides`. (22 manifests, the root `devDependencies` entry, and the `overrides` block.)
    - [x] Run `npm install`.
    - [x] Run `npx convex typecheck` in each app. Record the exit code and the output in section 9. (All six exit 1: three skip with "No `tsc` binary found", three report the pre-existing convex diagnostics.)
    - [x] Keep `typescript` `^7.0.2` in an app only when `npx convex typecheck` fails without it. (No app passes the CLI check, so the CLI cannot select the set. The four keep apps are `TSC_FALLBACK_LIST`, which must be a subset of the keep list, and their `tsc --noEmit` gate runs the package.)
    - [x] If the command also fails with 7.0.2, use the newest 6.x version. Record it as a held package. (Not used: the failures are pre-existing code diagnostics, not a version problem.)
    - [x] If the Convex CLI only skips its own check, do not keep the package. The tsrs gate checks `convex/` through `convex/tsconfig.json`. (The four keep apps keep it for their own `tsc --noEmit` gate; the other 23 manifests drop it.)
    - [x] Do not keep `typescript` for editors. The repository has no `.vscode/settings.json`, so editors use their bundled TypeScript. Record this in section 9.
    - [x] Run `npm ls typescript --all`. If an installed package has a non-optional peer on `typescript`, keep `typescript` in the root `devDependencies`. Record the package in section 9. (`convex-helpers` 0.1.135 only, and its peer is optional, so the root does not keep it.)
    - [x] Set `TYPESCRIPT_KEEP_LIST` in the test file to the final keep list.
    - [x] Record the `typescript6` alias in evidence section 9 with the reason "S2 disable-comment scan; TypeScript 7 ships no JavaScript API". Do not add `typescript6` to `TYPESCRIPT_KEEP_LIST` or to `TSC_FALLBACK_LIST`.
    - [x] Do not run `convex deploy`. Do not run `convex dev` against a cloud deployment.
    - [x] Commit: `chore(deps): keep typescript only where the Convex CLI needs it`. (bdebdf65.)
- [x] Task: S3 Verify — run the gates after the type-check change (ab0440b3)
    - [x] Run each gate. Confirm that no gate has a new failure. (`lint s3` 0, `test s3` 0, `checks-all s3` 0; each prints `NEWFAIL=0` with `GATES_BASE=baseline-m2`. The first `test s3` run held one new step key from three W4 TypeScript 6.x pins; the gate fix `ec3a05ae` moved them to 7.0.2 with the same strength. Evidence section 2, "S3 Green run".)
    - [x] Confirm that the scripts suite passes. (`GREEN_TEST_COMMAND`: 1 failed of 73; the failure is the pre-existing `remediate-concept-blueprints > production scan reports the honest count for the current repo state` row (S1 Q3). 72 pass.)
    - [x] Confirm that `GREEN_TEST_COMMAND` exits 1 for the one Q3 row (16.5). Confirm that the S2 filters stay green after the import switch. (`test s3` step `scripts-suite` exit 1, one failure, no new diagnostic key against `baseline-m2`. `S2 oxlint` 7 passed; `S2 adversarial` 13 passed. S1 cases 5, 5b, and 6 passed. `node scripts/validate-ci.mjs` exit 0.)
    - [x] Add the temporary file `apps/integrated-math-3/convex/__oxc_probe__.ts` with `export const n: number = "x";`.
    - [x] Run the IM3 typecheck. Confirm that the output contains `TS2322` for the probe file. Delete the probe file. Do not commit it. (`npm run typecheck --workspace=apps/integrated-math-3` exit 1 with the pre-existing lines; `convex/__oxc_probe__.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.` The probe was deleted; `git status --porcelain` holds no probe path.)
    - [x] Time the tsrs typecheck for each workspace. Record "after" in section 5. (23 workspaces on tsrs 0.25.0-ts7.1.0-beta; the four `TSC_FALLBACK_LIST` apps on tsc 7.0.2 with a deleted tsbuildinfo per run. Medians: IM3 22.4 s to 3.73 s, BM2 17.9 s to 2.38 s, IM2 7.8 s to 1.83 s, danielson 5.8 s to 4.30 s. Raw: `s3-tsrs-raw.txt` and `s3-tsc-after-raw.txt`.)
    - [x] Commit the evidence file: `measure(vinext-oxc): record the S3 results`. (ab0440b3.)
- [x] Task: S3 Docs & Doctor (ab0440b3)
    - [x] Run `npm run generate`. Confirm exit code 0. (Exit 0 at ab0440b3: `routes.md`, `architecture.json`, and 5 architecture reports generated. Only the 6 known dirty generated files stay modified.)
    - [x] Run `npm run doctor`. Confirm exit code 0. (Exit 0: 5 architecture reports verified, 26 workspaces and 620 internal imports checked, package DAG acyclic.)
- [x] Task: Measure - User Manual Verification 'Phase S3: TypeScript 7 and tsrs' (Protocol in workflow.md) (7e0f7a4)
    - [x] Run the protocol: the automated tests, the manual verification plan, and the user confirmation. (S3 tsrs 8 pass, S3 adversarial 14 pass, phase acceptance at 80934197; PM is the confirming user, orchestrator default 2026-11-19. S3 has no user-facing change.)
    - [x] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`. (7e0f7a4)
    - [x] Append `[checkpoint: 7e0f7a4]` to the Phase S3 heading. (7e0f7a4)
    - [x] Commit: `measure(plan): Mark phase 'Phase S3: TypeScript 7 and tsrs' as complete`. (this commit)
- [x] Task: S3 remediation round 3 — sweep the apps parent and match only the seeded probe names (f37a6b7e)

S3 remediation sub-box (Jr Green rounds)
- Round 1 (2026-11-19, `ddca656c`): narrowed the disk-full matcher of `gates.sh` (adversarial F1). `has_infra_output` and `key()` now share `DISK_FULL_RE`. The matcher accepts only the real system message forms: `ENOSPC: no space left on device`, `EDQUOT: disk quota exceeded`, `Error: ENOSPC|EDQUOT`, `errno: -28|-122`, and `code: 'ENOSPC'|'EDQUOT'` (single or double quotes). A line that only names the errno word stays a normal diagnostic. Before the fix, a failing test title that named the word turned the job into INFRA (exit 3), and `key()` dropped the line, so a new failure could hide behind `NEWFAIL=0`. Adv i now proves the fix: the word-bearing title is not infrastructure, `key()` keeps it, and `new_keys` reports it; a real message line is still infrastructure and leaves no key. The three Red guard cases of `90b31fe0` still pass. Gates: `bash -n` passes, `S3 adversarial` 8 pass, `S3 tsrs` 8 pass, `S2 adversarial` 13 pass, the gates-script file 19 pass, full scripts suite 80 pass with only the pre-existing `remediate-concept-blueprints` failure, `GATES_RESUME=1 GATES_BASE=baseline-m2 gates.sh test s3` gives `NEWFAIL=0` (the stale `scripts-suite` step record was dropped first, so the step re-ran).
- Round 2 (2026-11-19, `0dcc9ef1`): the test file sweeps stale probe folders before the suite (adversarial F1r2). The constant `PROBE_DIR_PREFIXES = ['.oxlint-adv', '.oxlint-probe-']` holds the prefixes, and the helper `seedDir()` creates every seed folder inside the repository. (Round 3 corrects this record. The round 2 sweep did not read the `apps/` parent, and the `.oxlint-adv` prefix matched near-miss names such as `.oxlint-advisory`.) The `beforeAll` sweep reads one directory level in the repo root and each workspace folder, matches the prefix, and skips a folder that holds a tracked file (`git ls-files`). It never walks the tree. `afterEach` still removes the folders of the run. Proof: a seeded `apps/integrated-math-3/.oxlint-adv13-LEAKPROBE` folder made adv 7 fail before this change; `-t 'S2 adversarial'` now gives 13 pass, removes the folder, and `git status --porcelain` holds no probe path. Gates: `S3 adversarial` 12 pass, `S3 tsrs` 8 pass, the gates-script file 23 pass, the full scripts suite 84 pass with only the pre-existing `remediate-concept-blueprints` failure, `npx tsc --noEmit` exit 0, and `GATES_RESUME=1 GATES_BASE=baseline-m2 gates.sh test s3` gives `NEWFAIL=0` (the stale `scripts-suite` step record was dropped first, so the step re-ran). Accepted residuals: F2r2 (an errno data form inside a failing assertion diff still classifies as infrastructure; the committed `r2 a` case pins it) and F3r2 (the npm trailer-only disk-full lines match no alternative); Review A r2 F1 (the Rust `os error 28` and `spawn ENOSPC` forms) moves to S4 Red. No assertion was weakened, and no adversarial case was edited.
- Round 3 (2026-11-19, `f37a6b7e`): the startup sweep reads the `apps/` parent, and the seed name rule matches only the seeded forms (adversarial F1r3, Review A F7, and adversarial F2r3). The parent list is `[REPO_ROOT, path.join(REPO_ROOT, 'apps'), ...WORKSPACE_DIRS]`. Every depth-one in-repo `seedDir` call has its parent in that list. Two pinned controls sit outside the list by design: an `os.tmpdir()` seed (test line 1015) and a two-level IM3 curriculum seed (test line 1056). The rule is one function, `isSeededProbeDirName(name)`. A name matches when it starts with `.oxlint-probe-`, or when it starts with `.oxlint-adv` and the next character is `-` or a digit. A near-miss name, such as `.oxlint-advisory`, matches nothing, so the sweep keeps it. `seedDir` refuses a prefix outside the rule, and the `.oxlint-adv` form gets its separator, so every seed name is sweepable. The r3 b case flips its two expectations: the `apps/` parent seed is gone after the sweep, and the near-miss folder stays. Proof: seeded `apps/.oxlint-probe-LEAK/x.ts`, `apps/integrated-math-3/.oxlint-adv13-LEAK/x.ts`, and `apps/integrated-math-3/.oxlint-advisory-KEEP/x.txt`. Then `-t 'S2 adversarial'` gives 13 pass, the first two folders are gone, and the third stays. The third folder was removed by hand. Gates: `S3 adversarial` 14 pass, `S3 tsrs` 8 pass, `S2 adversarial` 13 pass, the gates-script file 23 pass, the full scripts suite 86 pass with only the pre-existing `remediate-concept-blueprints` failure, `npx tsc --noEmit` exit 0, and `GATES_RESUME=1 GATES_BASE=baseline-m2 gates.sh test s3` gives `NEWFAIL=0` (the stale `scripts-suite` step record was dropped first, so the step re-ran). The round 2 Green log handoff said that a new seed cannot escape the sweep. Round 3 closes that gap. Accepted residual: Review A F8 (the sweep has no age guard, so two overlapping runs in one checkout can still interfere). No other expectation was weakened, and no other adversarial case was edited.
- Adversarial r4 at bb7b1f08 passed; Review A r4 passed; phase acceptance passed at 80934197 (checkpoint nits F1-F5 fixed in the checkpoint commit).

## Phase S4: oxfmt
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — record the format change
    - [ ] In `measure/tech-stack.md`, add a dated note. The note names oxfmt 0.78.0, the default oxfmt style, the format-check gate, and `.git-blame-ignore-revs`.
    - [ ] Use this target `.oxfmtrc.json` at the repository root. It has `"$schema": "./node_modules/oxfmt/configuration_schema.json"` and no style options.
    - [ ] Its `ignorePatterns` list is: `**/*.md`, `**/*.mdx`, `measure/**`, `**/curriculum/**`, `kst-srs.v2/**`, `**/convex/_generated/**`, `**/package-lock.json`, `**/dist/**`, `**/build/**`, `**/.vinext/**`, `**/.next/**`, `**/coverage/**`, `**/playwright-report/**`, `**/test-results/**`, `.agents/**`, `.claude/**`, `**/workbooks-manifest.json`.
    - [ ] Search `scripts/`, `apps/*/scripts/`, and `packages/*/scripts/` for `writeFileSync` and `writeFile(`.
    - [ ] Add each tracked output path of these scripts to `ignorePatterns` when the list does not cover it yet. Script output must not fail the format check after a rerun.
    - [ ] The root scripts are `"format": "oxfmt"` and `"format:check": "oxfmt --check"`.
    - [ ] `oxfmt` `0.78.0` (exact) goes in the root `devDependencies`.
    - [ ] Keep `oxfmt` `0.78.0` exact. Record `npm view oxfmt version` as `0.79.0` in evidence section 3 and section 11. If the PM chooses 0.79.0, change the pin in the same commit as the config. Re-run this revision's version check.
- [ ] Task: S4 Test (Red) — add the S4 gate tests
    - [ ] Add `describe('S4 oxfmt')` to the test file.
    - [ ] Normal case 1: `npx --no-install oxfmt --check` at the repository root exits with code 0.
    - [ ] Normal case 2: the root `package.json` has the `format` and `format:check` scripts in the target form.
    - [ ] Normal case 3: `.git-blame-ignore-revs` has a 40-character SHA. `git log -1 --format=%s <sha>` gives `style: format the repo with oxfmt`.
    - [ ] Edge case 4: a `.ts` probe file `const  a={b:1}` makes `oxfmt --check <probe>` exit with a non-zero code. The output names the probe file. The output has no absent-tool phrase and no absent-target phrase. A `.py` probe with exit 2 is not a valid negative probe.
    - [ ] Edge case 5: a `.ts` probe file `const a = { b: 1 };` with a final newline makes `oxfmt --check <probe>` exit with code 0. The output names the probe file. The output has no absent-tool phrase and no absent-target phrase.
    - [ ] Run the scripts suite. Confirm that cases 1 to 5 fail.
    - [ ] Test-infrastructure guard: `gates.sh` classifies the Rust and Node disk-full forms as
      infrastructure. Add two guard cases and one refutation case to
      `scripts/__tests__/vinext-oxc-gates-script.test.ts`. Feed a fake job log with
      `No space left on device (os error 28)` and one with `spawn ENOSPC`. Each expects
      `INFRA FAILURE:`, exit 3, `INFRA=1`, and no `NEW FAILURE:`. Feed a failing test title that
      names `spawn ENOSPC` in prose. It expects `NEWFAIL=1` and no `INFRA=1`. Then add two
      full-line anchored alternatives to `DISK_FULL_RE`, shared by `has_infra_output()` and
      `key()`. Keep the three existing guard cases green. Run `bash -n`. Falsification: remove
      the alternatives and the two infra cases fail; remove the anchors and the refutation case
      fails.
    - [ ] Commit: `test(vinext-oxc): add the S4 gate tests (Red)`.
- [ ] Task: S4 Implement — add the oxfmt config
    - [ ] Add `oxfmt` `0.78.0` to the root `devDependencies`.
    - [ ] Create `.oxfmtrc.json` in the target form.
    - [ ] Add the `format` and `format:check` scripts to the root `package.json`.
    - [ ] Run `npm install`.
    - [ ] Commit: `chore(format): add the oxfmt config`.
- [ ] Task: S4 Implement — format the repository in one format-only commit
    - [ ] Run `npm run format`.
    - [ ] Confirm that `git diff --name-only` lists no path that matches `ignorePatterns`. Exclude the six dirty generated paths from this assertion. Require `git show --name-only <format sha>` to name none of them.
    - [ ] Run lint, typecheck, test, and build. Confirm the same results as before the format.
    - [ ] If a result changes, do not commit. Stop and report the file and the gate to the user.
    - [ ] Stage only the formatter output. Do not stage `measure/generated/routes.md`.
    - [ ] Commit: `style: format the repo with oxfmt`.
    - [ ] Time `npm run format:check`. Record it in section 5, with "no formatter" as the "before" tool.
- [ ] Task: S4 Implement — ignore the format-only commit in git blame
    - [ ] Create `.git-blame-ignore-revs` with one comment line and the full SHA of the format-only commit.
    - [ ] Select one reformatted line. Run `git blame --ignore-revs-file .git-blame-ignore-revs -L <n>,<n> <file>`.
    - [ ] Confirm that the output shows a commit that is older than the format-only commit. Record the file, the line, and the commit in this plan.
    - [ ] Commit: `chore(format): ignore the oxfmt commit in git blame`.
- [ ] Task: S4 Verify — run the gates after the format change
    - [ ] Run each gate, with the format check. Confirm that no gate has a new failure.
    - [ ] Run the before-and-after gate sweep of section 17.3. Run `lint s4`, `test s4`, and `checks-all s4` before the format commit and after it. Use `GATES_BASE=baseline-m2`. Each run must print `NEWFAIL=0`.
    - [ ] Compare the canonical fixture JSON before and after the format. The two strings must be equal. `entries.length` must be 49.
    - [ ] Confirm that the scripts suite passes.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S4 results`.
    - [ ] Record the `format:check` time in evidence section 5. Record the pre-format count of 3501 files and the scanned count of 3719 files. Record the exact command and config in evidence section 5.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: oxfmt' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: oxfmt' as complete`.

Phase note (2026-11-19): the r8 strategy commit lands before the S4 phase base capture (strategy section 17). The run log and the role handoff hold `phase_base_sha`. No plan line carries a phase SHA.

## Phase S5: Gate rules and CI
_Story ref: spec.md#story-s5_

- [ ] Task: S5 Contract — fix the new gate text
    - [ ] `AGENTS.md`: replace the guardrail "Always run `npx tsc --noEmit` in addition to `npm run build` — vinext build does not enforce TypeScript types."
    - [ ] The new guardrail text is: "Always run `npm run typecheck` in addition to `npm run build`. vinext build does not enforce TypeScript types. `npm run typecheck` runs oxlint with tsrs."
    - [ ] `AGENTS.md`: change the TDD guardrail to "TDD: write/adjust tests first, run `npm run format:check`, `npm run lint`, and relevant tests before each commit."
    - [ ] `measure/workflow.md` "Quality Gates": change "No linting errors (`npm run lint`)" to "No lint errors or warnings (`npm run lint`, oxlint)".
    - [ ] `measure/workflow.md` "Quality Gates": change "TypeScript compiles without errors" to "Type check passes (`npm run typecheck`, oxlint with tsrs)".
    - [ ] `measure/workflow.md` "Quality Gates": add "Formatting passes (`npm run format:check`, oxfmt)".
    - [ ] `measure/workflow.md` "Daily Development": add `npm run typecheck` and `npm run format`.
    - [ ] `measure/workflow.md` "Before Committing": use `npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build`.
    - [ ] `measure/tech-stack.md`: set the vinext, Vite, TypeScript, and React rows to the versions of S1 to S3.
    - [ ] `measure/tech-stack.md`: add a "Toolchain" table for oxlint, tsrs, oxfmt, and the kept `typescript`.
    - [ ] `measure/tech-stack.md` "Dev Commands": `npm run lint` is oxlint. Add `npm run typecheck`, `npm run format`, and `npm run format:check`. Remove "vinext lint".
    - [ ] Root `package.json`: set `"lint": "npm run lint --workspaces --if-present"` and `"typecheck": "npm run typecheck --workspaces --if-present"`.
    - [ ] Root `package.json`: in each `ws:*:typecheck` script, remove the `|| npx tsc --noEmit --project ...` part.
    - [ ] `.github/workflows/ci.yml`: in the `boundary-check` job, add the step "Run format check" with `run: npm run format:check`, after "Install dependencies".
    - [ ] `.github/workflows/ci.yml`: remove the `deploy` job (the "Phase 6: Deploy" comment and the job) (spec D7). `cloudflare-deploy.yml` stays the only deploy workflow, with `workflow_dispatch`.
    - [ ] Remove the marker `(planned: vinext-oxc-toolchain_20261114)` from `README.md` and `measure/tech-stack.md`. Write the current state in the same place (test-strategy section 10).
    - [ ] `measure/tech-debt.md`: add the row "Scale Benchmarks workflow fails each week" with severity `Medium`, status `Open`, and this note: "`scale-benchmarks.yml` has failed each week since at least 2026-07-27 (checked with `gh` on 2026-11-14). Not fixed in `vinext-oxc-toolchain_20261114`." Check the line count first (50-line limit).
- [ ] Task: S5 Test (Red) — add the S5 gate tests
    - [ ] Add `describe('S5 gate rules')` to the test file.
    - [ ] Normal case 1: `AGENTS.md`, `measure/workflow.md`, `measure/tech-stack.md`, the root `package.json`, and each `.github/workflows/*.yml` contain none of these strings: `npx tsc`, `tsc --noEmit`, `eslint .`, `eslint src`, `vinext lint`.
    - [ ] Normal case 2: `.github/workflows/ci.yml` has a step with `run: npm run format:check`.
    - [ ] Normal case 3: the root scripts `lint`, `typecheck`, `format`, and `format:check` are the target forms. No `ws:*` script contains `tsc`.
    - [ ] Normal case 4: the "Quality Gates" section of `measure/workflow.md` names `npm run format:check`, `npm run lint`, and `npm run typecheck`.
    - [ ] Edge case 5: `node scripts/validate-ci.mjs` exits with code 0.
    - [ ] Edge case 6: `git grep -n -E "npx tsc|tsc --noEmit|eslint \.|eslint src|vinext lint" -- measure/scripts` finds no match (exit code 1).
    - [ ] Normal case 7: `.github/workflows/ci.yml` has no job key `deploy`, and no line that contains `wrangler-action` or `wrangler deploy`.
    - [ ] Normal case 8: each `node-version` value in `.github/workflows/*.yml` has a major version of 22 or more.
    - [ ] Run the scripts suite. Confirm that cases 1 to 4 and case 7 fail. Case 8 passes after S1; it guards the rule.
    - [ ] Commit: `test(vinext-oxc): add the S5 gate tests (Red)`.
- [ ] Task: S5 Implement — apply the gate text
    - [ ] Make the `AGENTS.md`, `measure/workflow.md`, `measure/tech-stack.md`, and root `package.json` changes of the S5 Contract.
    - [ ] Commit: `docs(gates): name the Oxc gates in the guardrails and the workflow`.
    - [ ] Make the format-check change of the S5 Contract in `.github/workflows/ci.yml`.
    - [ ] Commit: `ci: run the format check`.
    - [ ] Remove the `deploy` job from `.github/workflows/ci.yml`, as the S5 Contract says. Run `node scripts/validate-ci.mjs`.
    - [ ] Commit: `ci: remove the deploy job from the CI workflow`.
    - [ ] Add the "Scale Benchmarks" row to `measure/tech-debt.md`, as the S5 Contract says.
    - [ ] Commit: `measure(tech-debt): record the failing Scale Benchmarks workflow`.
- [ ] Task: S5 Implement — remove the last calls to the removed tools
    - [ ] Run `git grep -n -E "npx tsc|tsc --noEmit|eslint|vinext lint" -- ':!measure/archive' ':!measure/tracks' ':!**/package-lock.json'`.
    - [ ] For each match that calls ESLint or `tsc` as a command in a live script, document, or config, change it to the Oxc gate.
    - [ ] Do not change the typecheck scripts of the workspaces in `TSC_FALLBACK_LIST`.
    - [ ] Do not change dated history notes. Record each change in this plan.
    - [ ] Commit: `chore(gates): remove the last calls to ESLint and tsc`.
- [ ] Task: S5 Implement — write the evidence summary
    - [ ] Fill evidence section 11: the main results, the speed ratios, the blocking gaps, and the recommended order of steps for other repositories.
    - [ ] Commit: `measure(vinext-oxc): write the evidence summary`.
- [ ] Task: S5 Verify — run the full gate sweep
    - [ ] Run `npm ci` on Node 24.
    - [ ] Run `npm run format:check`, `npm run lint`, and `npm run typecheck` at the root. Confirm that no gate has a new failure.
    - [ ] Run the test and build gates for each workspace. Confirm that no gate has a new failure.
    - [ ] Run the scripts suite, the audit suites, the CI check, the boundary check, the tree check, and `npm audit`.
    - [ ] Confirm that the evidence file has content in all 11 sections (spec AC7).
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S5 results`.
- [ ] Task: S5 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S5: Gate rules and CI' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S5`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S5 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S5: Gate rules and CI' as complete`.

## Closeout

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git show HEAD:.github/workflows/ci.yml`. Record if the `deploy` job is gone (the S5 Implement task removes it).
    - [ ] Before the push, the orchestrator sends the change list to the PM (deploy gate) unless the deploy job is already gone.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
