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

## Phase S1: Package refresh and vinext 1.x
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the stack change and the evidence layout
    - [ ] In `measure/tech-stack.md` "Runtime & Framework", add a note dated 2026-11-14 (workflow principle 2). The note names vinext ^1.4.5, Vite ^8, React ^19.3.1, the removal of `next`, the `vinext/types` source, and CI on Node 24.
    - [ ] Create `oxc-evidence.md` in this track folder with the 11 section headings of spec "Evidence File Contract".
    - [ ] Fill evidence section 1 from `lscpu`, `nproc`, `free -g`, `uname -sr`, `node -v`, and `npm -v`.
- [ ] Task: S1 Baseline — record the gates before any package change
    - [ ] Run `npm ci` on the current lockfile. Record its time in section 5.
    - [ ] Run lint, typecheck, test, and build for each workspace. Record each result in section 2.
    - [ ] Record each failure of these gates in section 10, with the workspace, the file, and the code.
    - [ ] Run the audit suites, the boundary check, the CI check, the tree check, and `npm audit --json`. Record each result in section 2.
    - [ ] Run `npm run bundle-size:audit --prefix apps/integrated-math-3`. Record the sizes.
    - [ ] Run `npm run bundle:audit --workspace=apps/bus-math-v2`. Record the sizes.
    - [ ] Run `npm run test:e2e --prefix apps/integrated-math-3`. If it cannot start (for example, no browser is installed), record "not run locally".
    - [ ] For each app, start `npx vinext dev --port <port>`. Ports: IM1 4101, IM2 4102, IM3 4103, PreCalc 4104, BM2 4105.
    - [ ] Request `/` with `curl -s -o /dev/null -w '%{http_code}'`. Record the status code. Stop the server.
    - [ ] Time `npm run build` for each app on vinext 0.0.55. Record the times in section 5.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S1 baseline`.
- [ ] Task: S1 Test (Red) — add the S1 gate tests
    - [ ] Create `scripts/__tests__/oxc-toolchain-gates.test.ts` with `describe('S1 vinext 1.x')`.
    - [ ] Add `'__tests__/oxc-toolchain-gates.test.ts'` to `include` in `scripts/vitest.config.ts`.
    - [ ] Normal case 1: the `vinext/package.json` that resolves from the repository root has major version 1.
    - [ ] Normal case 2: `require.resolve('next/package.json')` throws from the root, from each app folder, and from `packages/app-shell`.
    - [ ] Normal case 3: no `package.json` in the root, `apps/*`, or `packages/*` declares `next` in `dependencies`, `devDependencies`, `peerDependencies`, or `overrides`.
    - [ ] Normal case 4: each app `tsconfig.json` and `packages/app-shell/tsconfig.json` has `vinext/types` in `compilerOptions.types`.
    - [ ] Edge case 5: a probe that imports `NextConfig` from `next`, `Link` from `next/link`, and `useRouter` from `next/navigation` type-checks with exit code 0.
    - [ ] The probe `tsconfig.json` has `"types": ["vinext/types"]`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, `"strict": true`, `"noEmit": true`, and a `"files"` list with the probe file.
    - [ ] The S1 type-check command for the probe is `tsc -p <tmp>/tsconfig.json`. The probe uses the `node_modules` symlink.
    - [ ] Edge case 6: the same probe with `import x from "next/does-not-exist"` exits with a non-zero code.
    - [ ] Run the scripts suite. Confirm that cases 1 to 4 fail. Record the Red output in this plan.
    - [ ] Commit: `test(vinext-oxc): add the S1 gate tests (Red)`.
- [ ] Task: S1 Implement — move vinext to 1.x and remove `next`
    - [ ] In `.github/workflows/ci.yml` and `.github/workflows/cloudflare-deploy.yml`, change each `node-version: '20'` to `'24'`.
    - [ ] In the root `package.json`, set `vinext` to `^1.4.5` and `react-server-dom-webpack` to `^19.3.1`.
    - [ ] In the root `package.json`, set `@vitejs/plugin-react` to its latest version.
    - [ ] In the root `package.json`, remove `next` from `devDependencies` and from `overrides`.
    - [ ] In each app `package.json`, remove `next`. Set `vinext` to `^1.4.5`, and `react` and `react-dom` to `^19.3.1`.
    - [ ] In each app `package.json`, set `@vitejs/plugin-rsc` to `^0.5.37` where it is declared. Set `vite` to its latest 8.x version.
    - [ ] In `packages/app-shell/package.json`, replace the `next` peer with `"vinext": "^1.4.5"`.
    - [ ] In `packages/app-shell/package.json`, add `vinext` `^1.4.5` to `devDependencies`. Set `react` to `^19.3.1`.
    - [ ] In each app `tsconfig.json`, add `vinext/types` to `compilerOptions.types`. Remove the `{ "name": "next" }` plugin entry.
    - [ ] In `packages/app-shell/tsconfig.json`, add `vinext/types` to the existing `compilerOptions.types` list.
    - [ ] Run `npm install`.
    - [ ] Run `npx vinext check` in each app. Record the score and each issue in section 8.
    - [ ] If `vinext build` makes an untracked folder (for example `.vinext/` or `.cloudflare/`), add the folder to `.gitignore`.
    - [ ] Fix only what a failing gate needs. Use the held-package rule.
    - [ ] Commit: `chore(deps): upgrade vinext to 1.x and remove next`.
- [ ] Task: S1 Implement — update all other dependencies
    - [ ] Run `npm outdated --json` at the root.
    - [ ] Run `npm outdated --json --workspace=<ws>` for each workspace. The aggregate command under-reports app dependencies (precedent spec "Audit Baseline").
    - [ ] Do not change `typescript` in S1. S3 owns it.
    - [ ] Do not change `eslint`, `@eslint/js`, `@eslint/eslintrc`, `typescript-eslint`, or `eslint-config-next` in S1. S2 removes them.
    - [ ] Set `@types/node` to its latest 24.x version, to match CI Node 24.
    - [ ] Set each other declared range to `^<latest>`.
    - [ ] Commit the minor and patch updates first: `chore(deps): update packages to the latest minor and patch versions`.
    - [ ] Update each major-version family in its own commit, for example `chore(deps): upgrade vitest to 5` with `@vitest/*`.
    - [ ] Run all gates before each commit. Use the held-package rule.
    - [ ] Record each change in section 3.
- [ ] Task: S1 Implement — move the audit suites forward
    - [ ] Run the audit suites. Find each assertion that passed in the baseline and fails now only because S1 changed or removed a package.
    - [ ] Change each such assertion to the durable contract of lessons-learned 2026-06-07. The declared range admits the installed version.
    - [ ] The durable contract also requires: no range is `latest`, `*`, or empty, and the old security floor stays a minimum.
    - [ ] For a removed package, assert that no manifest declares it.
    - [ ] Do not change an assertion that failed in the baseline. It stays in section 10.
    - [ ] Commit: `test(audit): move the audit suites forward for vinext 1.x`.
- [ ] Task: S1 Verify — run the gates after the upgrade
    - [ ] Run each gate. Confirm that no gate has a new failure.
    - [ ] Confirm that the scripts suite passes, with cases 1 to 6.
    - [ ] Confirm that all 5 apps pass `npm run build`.
    - [ ] Confirm that `/` of each app gives the baseline status code.
    - [ ] Run both bundle audits. If a budget fails, do not change the budget. Stop the phase and report the sizes to the user.
    - [ ] If the baseline ran the IM3 E2E suite, run it again. Confirm the baseline result.
    - [ ] Confirm that `npm audit` has no new critical or high finding.
    - [ ] Time `npm run build` for each app on vinext 1.x. Record the times in section 5.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Package refresh and vinext 1.x' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Package refresh and vinext 1.x' as complete`.

## Phase S2: ESLint to oxlint
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — record the lint change
    - [ ] In `measure/tech-stack.md`, add a dated note. The note names oxlint ^1.93.0, the `.oxlintrc.json` file in each linted workspace, and native rules only.
    - [ ] Use this target layout. Each workspace with a lint script has one `.oxlintrc.json`, for 25 files in total.
    - [ ] 19 configs come from `@oxlint/migrate`. These 6 workspaces get a copy of `packages/knowledge-space-core/.oxlintrc.json`: activity-components, app-shell, math-content, practice-test-engine, rate-limiter, and `_template`.
    - [ ] The app lint script is `oxlint -c .oxlintrc.json --max-warnings 0 .`.
    - [ ] The package lint script is `oxlint -c .oxlintrc.json --max-warnings 0 src`.
    - [ ] `oxlint` `^1.93.0` goes in the root `devDependencies` only.
    - [ ] Time `npm run lint` with ESLint for each of the 19 workspaces with an ESLint config. Record "before" in section 5.
- [ ] Task: S2 Test (Red) — add the S2 gate tests
    - [ ] Add `describe('S2 oxlint')` to the test file.
    - [ ] Normal case 1: no manifest declares `eslint`, `typescript-eslint`, `eslint-config-next`, `@eslint/js`, or `@eslint/eslintrc`. The root `overrides` has no `eslint` key.
    - [ ] Normal case 2: no `eslint.config.*` file exists under `apps/` or `packages/`, outside `node_modules`.
    - [ ] Normal case 3: each workspace with a lint script has `.oxlintrc.json`. Its lint script is the target form.
    - [ ] Edge case 4: a probe with `const unused = 1;` fails `oxlint -c <repo>/packages/knowledge-space-core/.oxlintrc.json --max-warnings 0 <probe>`. The exit code is non-zero, and the output contains `no-unused-vars`.
    - [ ] Edge case 5: the same probe with `/* oxlint-disable */` as its first line exits with code 0.
    - [ ] Run the scripts suite. Confirm that cases 1 to 5 fail.
    - [ ] Commit: `test(vinext-oxc): add the S2 gate tests (Red)`.
- [ ] Task: S2 Implement — migrate each ESLint config
    - [ ] In each of the 19 workspaces with `eslint.config.mjs`, run `npx --yes @oxlint/migrate@1.93.0 eslint.config.mjs --js-plugins=false --details --replace-eslint-comments --output-file .oxlintrc.json`.
    - [ ] Record each rule from the `--details` output in section 6.
    - [ ] Record each comment that the tool cannot replace in section 8.
    - [ ] Copy `packages/knowledge-space-core/.oxlintrc.json` to the 6 workspaces of the target layout.
    - [ ] Commit: `chore(lint): add oxlint configs from the ESLint configs`.
- [ ] Task: S2 Implement — switch the lint scripts and remove ESLint
    - [ ] Add `oxlint` `^1.93.0` to the root `devDependencies`.
    - [ ] Set the 25 lint scripts to the target forms.
    - [ ] Delete the 19 `eslint.config.mjs` files.
    - [ ] Remove the 5 ESLint packages from each manifest. Remove `eslint` from the root `overrides`.
    - [ ] Run `npm install`.
    - [ ] Commit: `chore(lint): replace ESLint with oxlint`.
- [ ] Task: S2 Implement — reach zero warnings
    - [ ] Run `npm run lint` in each workspace.
    - [ ] Fix each finding when the fix does not change behavior.
    - [ ] When a fix changes behavior, add `// oxlint-disable-next-line <rule> -- <reason>` above the line. Record it in section 8.
    - [ ] Commit: `fix(lint): resolve the oxlint findings`.
- [ ] Task: S2 Verify — run the gates after the lint change
    - [ ] Confirm that all 25 lint scripts exit with code 0 and report zero warnings.
    - [ ] Run the other gates. Confirm that no gate has a new failure.
    - [ ] Confirm that the scripts suite passes.
    - [ ] Time `npm run lint` with oxlint for the same 19 workspaces. Record "after" in section 5.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] In `measure/tech-debt.md`, set the row "math-content package lint gate missing" to `Resolved`. Add this track id to its note.
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: ESLint to oxlint' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: ESLint to oxlint' as complete`.

## Phase S3: TypeScript 7 and tsrs
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — record the type-check change
    - [ ] In `measure/tech-stack.md`, add a dated note. The note names TypeScript 7.0.2, tsrs `0.25.0-ts7.1.0-beta`, `TSRS_FAST=1`, and the oxlint type-check gate.
    - [ ] The note also says that tsrs uses the TypeScript 7.1.0-beta compiler line, and the kept `typescript` package uses 7.0.2.
    - [ ] Use this target layout. The app typecheck script is `TSRS_FAST=1 oxlint -c .oxlintrc.json --type-aware --type-check --max-warnings 0 .`.
    - [ ] The package typecheck script is the same command with `src` in place of `.`.
    - [ ] Each package `build` script that is `tsc --noEmit` now becomes `npm run typecheck`.
    - [ ] bus-math-v2 gets the app typecheck script.
    - [ ] `tsrs` `0.25.0-ts7.1.0-beta` (exact) goes in the root `devDependencies` only.
    - [ ] Each CI typecheck step becomes `npm run typecheck --workspace=<app folder>`.
    - [ ] Time `tsc --noEmit` on TypeScript 6.0.3 for each workspace. Record "before" in section 5.
- [ ] Task: S3 Test (Red) — add the S3 gate tests
    - [ ] Add `describe('S3 tsrs')` to the test file. Add two constants: `TYPESCRIPT_KEEP_LIST = []` and `TSC_FALLBACK_LIST = []`.
    - [ ] Normal case 1: each workspace typecheck script is the target form. A workspace in `TSC_FALLBACK_LIST` has `tsc --noEmit`.
    - [ ] Normal case 2: no package `build` script contains `tsc`.
    - [ ] Normal case 3: `tsrs/package.json` resolves from the repository root.
    - [ ] Normal case 4: no `run` line in `.github/workflows/*.yml` contains `tsc`.
    - [ ] Normal case 5: the manifests that declare `typescript` are exactly the paths in `TYPESCRIPT_KEEP_LIST`.
    - [ ] Edge case 6: a probe `export const n: number = "x";` runs with `TSRS_FAST=1 npx --no-install oxlint --type-aware --type-check <tmp>`. The exit code is non-zero, and the output contains `TS2322`.
    - [ ] The probe `tsconfig.json` has `"strict": true`, `"noEmit": true`, `"types": []`, and a `"files"` list with the probe file.
    - [ ] Edge case 7: the probe `export const n: number = 1;` exits with code 0.
    - [ ] Change S1 edge cases 5 and 6 to use the S3 type-check command.
    - [ ] Run the scripts suite. Confirm that cases 1 to 7 fail.
    - [ ] Commit: `test(vinext-oxc): add the S3 gate tests (Red)`.
- [ ] Task: S3 Implement — move to TypeScript 7
    - [ ] Set `typescript` to `^7.0.2` in the root `devDependencies`, the root `overrides`, and each workspace that declares it.
    - [ ] Run `npm install`.
    - [ ] Run `npx tsc --noEmit -p <tsconfig>` for each workspace. For each app, also run it for `<app>/convex/tsconfig.json`.
    - [ ] Fix each tsconfig option that TypeScript 7 rejects. Use the replacement that the TypeScript 7 release notes name.
    - [ ] Fix each new failure.
    - [ ] Time `tsc --noEmit` on TypeScript 7.0.2 for each workspace. Record the times in section 5.
    - [ ] Commit: `chore(deps): upgrade typescript to 7`.
- [ ] Task: S3 Implement — switch the typecheck scripts to tsrs
    - [ ] Add `tsrs` `0.25.0-ts7.1.0-beta` to the root `devDependencies`. Run `npm install`.
    - [ ] Set the typecheck scripts, the package `build` scripts, and the bus-math-v2 typecheck script to the target forms.
    - [ ] If oxlint reports that `--type-aware` needs `oxlint-tsgolint`, add `oxlint-tsgolint` `^7.0.2007` to the root `devDependencies`. Record it in section 8.
    - [ ] In `.github/workflows/ci.yml` and `cloudflare-deploy.yml`, replace each `cd <dir> && npx tsc --noEmit` with `npm run typecheck --workspace=<dir>`.
    - [ ] Commit: `chore(typecheck): run the type check through oxlint and tsrs`.
- [ ] Task: S3 Implement — compare tsrs with tsc on the same compiler line
    - [ ] Run `npx tsrs --version` and `npx --yes -p typescript@7.1.0-beta tsc --version`. Record both versions at the top of section 7.
    - [ ] If the tsrs version names a TypeScript line other than 7.1.0-beta, use `tsc` from that line in the next steps. Record the line.
    - [ ] On one commit, collect the `tsc` 7.1.0-beta diagnostics of each workspace with `npx --yes -p typescript@7.1.0-beta tsc --noEmit --pretty false -p <tsconfig>`. For each app, include `<app>/convex/tsconfig.json`.
    - [ ] Do not add `typescript@7.1.0-beta` to a manifest. The `npx -p` command runs it from the npx cache.
    - [ ] On the same commit, collect the tsrs diagnostics with the typecheck command and `--format json`.
    - [ ] On the same commit, collect the `tsc` 7.0.2 diagnostics with `npx tsc --noEmit --pretty false -p <tsconfig>`.
    - [ ] Compare the `tsc` 7.1.0-beta set and the tsrs set by file, line, and TS code. Record each difference in the gap table of section 7.
    - [ ] Compare the `tsc` 7.0.2 set and the `tsc` 7.1.0-beta set the same way. Record each difference in the compiler-version table of section 7.
    - [ ] For a tsrs-only diagnostic, find a code change that does not change behavior and keeps `tsc` 7.0.2 and `tsc` 7.1.0-beta clean. If one exists, make it and record it in section 8.
    - [ ] If no such change exists, set the typecheck script of that workspace to `tsc --noEmit`.
    - [ ] Add that workspace to `TSC_FALLBACK_LIST` and to `TYPESCRIPT_KEEP_LIST`. Record the gap as "blocking" in section 7.
    - [ ] For a diagnostic that only `tsc` 7.1.0-beta reports, record "missed by tsrs" in section 7. Make no code change.
    - [ ] Commit: `measure(vinext-oxc): record the tsrs conformance gaps`.
- [ ] Task: S3 Implement — decide where `typescript` stays
    - [ ] Read the Convex CLI type-check code under `node_modules/convex/dist/cli/`. Search for `typecheck`.
    - [ ] Record how the Convex CLI finds TypeScript in section 9, with the file and the line.
    - [ ] Remove `typescript` from each manifest that `TYPESCRIPT_KEEP_LIST` does not name. Remove it from the root `overrides`.
    - [ ] Run `npm install`.
    - [ ] Run `npx convex typecheck` in each app. Record the exit code and the output in section 9.
    - [ ] Keep `typescript` `^7.0.2` in an app only when `npx convex typecheck` fails without it.
    - [ ] If the command also fails with 7.0.2, use the newest 6.x version. Record it as a held package.
    - [ ] If the Convex CLI only skips its own check, do not keep the package. The tsrs gate checks `convex/` through `convex/tsconfig.json`.
    - [ ] Do not keep `typescript` for editors. The repository has no `.vscode/settings.json`, so editors use their bundled TypeScript. Record this in section 9.
    - [ ] Run `npm ls typescript --all`. If an installed package has a non-optional peer on `typescript`, keep `typescript` in the root `devDependencies`. Record the package in section 9.
    - [ ] Set `TYPESCRIPT_KEEP_LIST` in the test file to the final keep list.
    - [ ] Do not run `convex deploy`. Do not run `convex dev` against a cloud deployment.
    - [ ] Commit: `chore(deps): keep typescript only where the Convex CLI needs it`.
- [ ] Task: S3 Verify — run the gates after the type-check change
    - [ ] Run each gate. Confirm that no gate has a new failure.
    - [ ] Confirm that the scripts suite passes.
    - [ ] Add the temporary file `apps/integrated-math-3/convex/__oxc_probe__.ts` with `export const n: number = "x";`.
    - [ ] Run the IM3 typecheck. Confirm that the output contains `TS2322` for the probe file. Delete the probe file. Do not commit it.
    - [ ] Time the tsrs typecheck for each workspace. Record "after" in section 5.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: TypeScript 7 and tsrs' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: TypeScript 7 and tsrs' as complete`.

## Phase S4: oxfmt
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — record the format change
    - [ ] In `measure/tech-stack.md`, add a dated note. The note names oxfmt 0.78.0, the default oxfmt style, the format-check gate, and `.git-blame-ignore-revs`.
    - [ ] Use this target `.oxfmtrc.json` at the repository root. It has `"$schema": "./node_modules/oxfmt/configuration_schema.json"` and no style options.
    - [ ] Its `ignorePatterns` list is: `**/*.md`, `**/*.mdx`, `measure/**`, `**/curriculum/**`, `kst-srs.v2/**`, `**/convex/_generated/**`, `**/package-lock.json`, `**/dist/**`, `**/build/**`, `**/.vinext/**`, `**/.next/**`, `**/coverage/**`, `**/playwright-report/**`, `**/test-results/**`, `.agents/**`, `.claude/**`.
    - [ ] Search `scripts/`, `apps/*/scripts/`, and `packages/*/scripts/` for `writeFileSync` and `writeFile(`.
    - [ ] Add each tracked output path of these scripts to `ignorePatterns` when the list does not cover it yet. Script output must not fail the format check after a rerun.
    - [ ] The root scripts are `"format": "oxfmt"` and `"format:check": "oxfmt --check"`.
    - [ ] `oxfmt` `0.78.0` (exact) goes in the root `devDependencies`.
- [ ] Task: S4 Test (Red) — add the S4 gate tests
    - [ ] Add `describe('S4 oxfmt')` to the test file.
    - [ ] Normal case 1: `npx --no-install oxfmt --check` at the repository root exits with code 0.
    - [ ] Normal case 2: the root `package.json` has the `format` and `format:check` scripts in the target form.
    - [ ] Normal case 3: `.git-blame-ignore-revs` has a 40-character SHA. `git log -1 --format=%s <sha>` gives `style: format the repo with oxfmt`.
    - [ ] Edge case 4: a probe file `const  a={b:1}` makes `oxfmt --check <probe>` exit with a non-zero code. The output names the probe file.
    - [ ] Edge case 5: a probe file `const a = { b: 1 };` with a final newline makes `oxfmt --check <probe>` exit with code 0.
    - [ ] Run the scripts suite. Confirm that cases 1 to 5 fail.
    - [ ] Commit: `test(vinext-oxc): add the S4 gate tests (Red)`.
- [ ] Task: S4 Implement — add the oxfmt config
    - [ ] Add `oxfmt` `0.78.0` to the root `devDependencies`.
    - [ ] Create `.oxfmtrc.json` in the target form.
    - [ ] Add the `format` and `format:check` scripts to the root `package.json`.
    - [ ] Run `npm install`.
    - [ ] Commit: `chore(format): add the oxfmt config`.
- [ ] Task: S4 Implement — format the repository in one format-only commit
    - [ ] Run `npm run format`.
    - [ ] Confirm that `git diff --name-only` lists no path that matches `ignorePatterns`.
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
    - [ ] Confirm that the scripts suite passes.
    - [ ] Commit the evidence file: `measure(vinext-oxc): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: oxfmt' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: oxfmt' as complete`.

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
