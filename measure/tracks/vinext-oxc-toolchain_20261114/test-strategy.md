# Test Strategy: vinext-oxc-toolchain_20261114

Track: `vinext-oxc-toolchain_20261114` (Chore, 5 phases S1 to S5)
Strategy revision: r6 (2026-11-17), `role_base_sha` e341753803ed005b932355d1d78af565a759f245.
Scope of revision r6: six apps and 27 workspace folders. Section 13 records r4. Section 14
records r5. Section 15 records r6. A later section wins when an earlier rule disagrees with it.
Detail level: S1 has full detail. S2 to S5 have the risks, the Red commands, and the gates.
Refresh this file at the start of each later phase if the plan changed.

## 1. What this strategy proves

This track changes the build tool, the lint tool, the type checker, and the formatter. It
changes no app behavior. A test on app behavior therefore proves nothing new. The proof is
in three kinds of evidence:

1. **Gate sweeps.** Each gate runs in each workspace. The result is compared with the
   baseline by workspace, file, and diagnostic code (spec "New failure"). The sweep covers
   six apps and 21 packages, 27 workspace folders in all (section 13.1).
2. **Probe tests.** A probe is a small file with a known fault. Each new tool must reject
   each probe for the named reason. This proves the gate is not vacuous.
3. **Live runs.** Six apps build. Six dev servers answer. Three apps render in a browser
   (IM3, BM2, danielson).

Artifact and document checks (the evidence file, the Measure notes, the YAML text) are
supporting evidence only. A document test proves that a text exists. It does not prove
that the tool works (lessons-learned 2026-06-24). Each document check in this file has a
live complement.

## 2. Gate values (all phases)

`<label>` is `baseline` for the pre-merge record (historical, section 13.2), `baseline-m2`
for the 6-app baseline at this merged HEAD, and `s1` to `s5` for the phase gates.
The script is committed as `measure/tracks/vinext-oxc-toolchain_20261114/gates.sh`. Run it from the repository root. It writes its output under
`measure/runs/vinext-oxc-toolchain_20261114/gates/<label>/`. That folder is gitignored and survives a reboot.
A label that starts with `baseline` records only. A phase label compares with the folder
that the environment variable `GATES_BASE` names (default `baseline`). S1 uses
`GATES_BASE=baseline-m2` (section 13.2).

| Variable | S1 value |
|----------|----------|
| `RED_TEST_COMMAND` | `npx vitest run --config scripts/vitest.config.ts -t 'S1 vinext 1.x'` |
| `GREEN_TEST_COMMAND` | `npx vitest run --config scripts/vitest.config.ts` |
| `PROJECT_LINT` | `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint s1` with `GATES_BASE=baseline-m2` |
| `PROJECT_CHECKS` | `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh checks-all s1` with `GATES_BASE=baseline-m2` |
| `PROJECT_TESTS` | `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh test s1` with `GATES_BASE=baseline-m2` |
| `W4_AUDIT_COMMAND` | `npx --no-install vitest run scripts/audit/__tests__/framework-wave-w4-audit.test.ts -t 'post-W4 major lines' --reporter=json --outputFile=measure/runs/vinext-oxc-toolchain_20261114/w4-audit-<stage>.json`, then the parse of section 14.2. It is the Red and Green command for the 8 titles (check K1). Issue #2 closes only when checks K1 to K5 hold (section 14.2). |
| `UX_REQUIRED` | `always` |
| `PROJECT_DEV_URL` | `http://localhost:4103` (IM3). The second URL is `http://localhost:4105` (BM2). The third is `http://localhost:4106` (danielson). |

For S2 to S5, change only the label, the `GATES_BASE` value, and the `-t` filter:

| Phase | `RED_TEST_COMMAND` filter | Label | `UX_REQUIRED` |
|-------|---------------------------|-------|---------------|
| S2 | `-t 'S2 oxlint'` | `s2` | `never` |
| S3 | `-t 'S3 tsrs'` | `s3` | `never` |
| S4 | `-t 'S4 oxfmt'` | `s4` | `never` |
| S5 | `-t 'S5 gate rules'` | `s5` | `never` |

`GREEN_TEST_COMMAND` stays the full scripts suite in each phase.
From S4, `PROJECT_LINT` is `npm run format:check && bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint <label>`.
From S5, the gates also run through the root scripts: `npm run format:check`,
`npm run lint`, and `npm run typecheck` (section 8).

Why `UX_REQUIRED` is not `auto`: the auto rule reads the changed paths with prefixes for
another layout (`app/src/`). S1 changes only config paths, yet it swaps the runtime of all
6 apps. It also swaps the runtime of `apps/danielson`, which has never run on vinext. The
explicit value avoids a wrong skip. (Was: "all 5 apps"; the merge added `apps/danielson`.)

What the gates mean:

- The `lint`, `test`, and `checks-all` gates exit 0 only when `NEWFAIL=0`. The last output
  line is the labeled integer `NEWFAIL=<n>`. Parse that integer. Do not match any digit.
- A pre-existing failure does not make the aggregate green. The gate compares the
  diagnostic keys with the baseline (section 7).
- **Heavy jobs.** `gates.sh` calls `heavy-run.sh` itself: one job for each workspace script
  and one job for each step. `heavy-run.sh` caps a p2 job at 1800 s (`maxLockSecondsP2`), and a
  whole gate needs more time. Run the gate command WITHOUT an outer `heavy-run.sh` wrapper.
  Do not set `HEAVY_PRIORITY=p1`. Run a gate in the background and read its log. Run one
  gate at a time. Run `slot check` before each role start.
- **Resume.** `GATES_RESUME=1` keeps the results of an interrupted run with the same label
  and runs only the jobs without a result. Without it, the gate starts over.
- **Exit codes.** 0 means no new failure. 1 means a new failure. 3 means an infrastructure
  failure of `heavy-run.sh` (exit code 64, 65, 70, 75, 77, 124, or 201). The gate prints
  `INFRA=1` and does not compare that job. Run the job again with `GATES_RESUME=1`.
- **File names.** The output names equal the names of the baseline files in
  `measure/runs/vinext-oxc-toolchain_20261114/gates/baseline-m2/`: `<script>.exit`,
  `<script>-<workspace>.log`, `<gate>.steps`, `step-<name>.log`, and `audit.txt`. The gate
  also writes `timing.txt`. The pre-merge folder `gates/baseline/` keeps the same names and
  is now historical (section 13.2).
- **Missing comparison base.** When `GATES_BASE` names a folder that does not exist, no
  baseline exit code and no baseline log are read. Each non-zero exit is then a new failure
  and each non-zero step is a new failure. The gate cannot pass by a deleted baseline.
- **Workspace set (r5, section 14.4).** The sweep visits the folders of the current tree.
  When the base folder holds the exit file of a script, the gate compares the two workspace
  sets. A name in one set and not in the other is a new failure. The message starts with
  `NEW FAILURE: <script> workspace set differs from the baseline:`. A missing base skips this
  compare. `GATES_BASE` unset selects the pre-merge `baseline` folder, which has 26 names.
  The gate then fails on `apps/danielson`, and the mistake shows at once.

## 3. Phase classification and review gates

| Phase | Risk | Review A | Review B | Review C | Adversarial | UX browser |
|-------|------|----------|----------|----------|-------------|------------|
| S1 | critical | applicable | applicable | applicable | applicable | applicable |
| S2 | medium | applicable | not applicable | not applicable | applicable | not applicable |
| S3 | high | applicable | applicable | not applicable | applicable | not applicable |
| S4 | medium | applicable | not applicable | not applicable | not applicable | not applicable |
| S5 | medium | applicable | applicable | applicable | applicable | not applicable |

S1 was `high` in r1 to r3. It is now `critical`. Reason: the tree holds two framework
lines. Five apps run vinext 1.x. `apps/danielson` runs Next 16 with vinext 0.0.55. It has 62
`next` import lines (section 14.7 gives the count and the command), no `vite.config.ts`, and
its own route handlers. The pre-merge baseline does not describe this tree. One phase must
carry the runtime change of an app that never ran on vinext, a second baseline capture, and
the audit-suite rewrite.

Reasons, one for each cell group:

- **Review A (all phases):** each phase changes the gates that later phases trust. A wrong
  gate hides every later fault.
- **Review B, S1:** every dependency moves, with major versions, a new lockfile, and new
  native packages. Review B reads the lockfile diff, the `npm audit` totals, and the install
  scripts. **Mandatory for the danielson risk (section 6.1, R16 and R18):** the reviewer also reads each
  lockfile key that ends with `node_modules/vinext` or `node_modules/next`, and names the
  workspace that owns each one.
- **Review B, S2 and S4:** the change is a lint config, or one exact-version formatter and
  one format commit. No trust boundary changes. The Review A lockfile check is enough.
- **Review B, S3:** tsrs is a 0.x prerelease with a native binary. `npx --yes` runs a
  prerelease compiler from the npx cache. Review B checks the source and the pins.
- **Review B, S5:** the phase edits CI. Review B checks that the removed `deploy` job leaves
  no secret exposure, no `workflow_dispatch` loss, and no new `pull_request_target` use.
- **Review C, S1:** the peer dependency of the shared package `@math-platform/app-shell`
  changes from `next` to `vinext`. That is a public package contract. **Second contract in
  r4:** `apps/danielson` declares `@math-platform/app-shell`, `core-auth`, `core-convex`,
  `knowledge-space-core`, and `srs-engine`. Its move to vinext 1.x is the first proof that
  those packages work for a sixth consumer. **Mandatory for the danielson risk.**
- **Review C, S5:** the root script names (`lint`, `typecheck`, `format`, `format:check`)
  are an interface. Later tracks read them (`kst-v32-runtime` and `math-graph-consume` plans).
- **Review C, S2, S3, S4:** the script names do not change. No user or API surface changes.
- **Adversarial, S1:** attack surface is a false-green. The reviewer tries to make `next`
  resolve again, and tries to pass the probes with `any` types. **Third attack in r4:** the
  reviewer tries to drop `apps/danielson` from a glob, a test list, or a gate by adding a
  filter or an ignore entry. **Mandatory for the danielson risk.** The allowed outcome is
  never an exclusion. It is a PM decision (section 6.1, R18).
- **Adversarial, S2:** the reviewer tries a lint config that lints no file, or a blanket
  disable comment.
- **Adversarial, S3:** this is the highest false-green risk. A type gate that finds nothing
  looks the same as a clean repository.
- **Adversarial, S4:** not applicable. Idempotence, the ignore list, and the same-gates sweep
  are deterministic checks (section 9). No input class remains to attack.
- **Adversarial, S5:** the reviewer tries to bypass the banned-string checks with other
  spellings of `tsc` and `eslint` in scripts and workflows.
- **UX browser, S1:** the runtime of all 6 apps changes, and a build does not prove a
  render. The danielson capture is new in r4: it has never rendered on vinext. Other phases
  change no runtime. **Mandatory for the danielson risk.**

## 4. `phase_base_sha` capture (r6)

`role_base_sha` e3417538 predates this strategy (r6). Do not use it as `phase_base_sha`.
The r5 strategy commit `3cef6c6f` also predates it. A value that was captured there is void.
The r4 value `3e141e05` also predates this strategy, the plan changes, and the track edits
of 2026-11-17. It is void. The Red commit `abbe15f1` predates the merged tree. Do not use it.
No SHA in this file is the capture point.

1. The r6 strategy commit lands first: `measure(strategy): fix the r5 re-check findings in
   the S1 test strategy (r6)`. It holds `test-strategy.md` and `plan.md` only.
2. **Captured point.** Immediately after that commit, before any other commit, run
   `git status --porcelain`. Only these entries may appear, each with the status ` M`:
   `apps/*/.next/types/routes.d.ts`, `apps/bus-math-v2/lib/workbooks-manifest.json`, and
   `measure/generated/routes.md`. They hold generated output (A10). No role stages them. Any
   other entry stops the capture: a staged file, an untracked file, or another modified file.
   `measure/runs/` is gitignored, so the logs and the gate output do not appear. (Was: the
   tree must be empty. The sweeps of 2026-11-17 made that rule impossible.)
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S1 in the orchestrator
   run log and in the role handoff. Do not write it into `plan.md` or `spec.md` (F5). No plan
   line carries a SHA for this phase.
4. Capture it before the first S1 task commit: the baseline evidence commit, the follow-up
   Red commit, and the first manifest change. The Red and Green role gates use it as the
   baseline.
5. A `phase_base_sha` that is not a descendant of the r6 strategy commit is invalid. Stop
   and report.
6. The baseline sweeps of 2026-11-17 are run files, not commits. The capture does not move
   them. They stay valid when no workspace file changed after the run. At the capture, this
   command prints nothing:
   `git diff --name-only 3e141e05..HEAD -- apps packages scripts .github package.json package-lock.json`.
   (`3e141e05` is a lower bound that predates the sweeps. It is not the phase base.)

For S2 to S5, capture `phase_base_sha` the same way, right after the previous
`measure(plan): Mark phase ... as complete` commit.

## 5. Shared rules for probe tests (all phases)

The helper and the paths follow plan "Probe Test Helper". This strategy adds these rules:

- **Discovery check before Red.** Run
  `npx vitest list --filesOnly --config scripts/vitest.config.ts`. The output must name
  `scripts/__tests__/oxc-toolchain-gates.test.ts`. Reason: Vite sets `root` from the current
  folder, not from the config folder. The `include` entry may match nothing from the
  repository root. If the file is missing, Mid Red adds a `root` option to
  `scripts/vitest.config.ts`. The option comes from `fileURLToPath(import.meta.url)`. The
  command text does not change. A Red run with "No test files found" is not a valid Red.
- **Re-run the discovery check** after the vitest major commit of S1.
- **Red must fail for the named reason.** Mid Red copies the first failing assertion line of
  each case into the Red log. A case that fails with `npx canceled`, `missing packages`, or
  `ENOENT` fails because the tool is absent. That case is valid Red only if the case is a
  positive case (exit 0 expected).
- **No vacuous negative probe.** A negative probe (non-zero exit expected) asserts three
  things: the exit code is non-zero, the output has the specific code or rule name, and the
  output has none of `npx canceled`, `missing packages`, `command not found`. Each probe
  describe also has a precondition: `<tool> --version` exits 0.
- **Paired cases.** Every "cannot resolve" case first proves that the neighbor does resolve
  (case 2 of S1 is the model, section 6).
- **No app is excluded.** No glob, test list, ignore entry, or gate may drop a folder that
  the root `workspaces` field covers. A case that needs a set of apps reads that set from
  the disk (`listDirs('apps')` in the test file). It never writes the names by hand. When
  the set changes, the count sentinels of section 6.2 fail on purpose.
- **Enumerate, then assert.** A case over a set of files (the workflows) first builds the
  file list from `fs.readdirSync`. It then asserts that the parsed map has one entry for
  each name in that list. A filter that drops a file fails the map check, not only the
  content check.
- **No `typescript` import in the test file.** S3 removes the package. Read tsconfig files
  with a comment-stripping JSON parse.
- **No read under `measure/tracks/`.** Closeout moves the folder (A9). The evidence file is
  checked by the orchestrator script of section 6.4, not by vitest.
- **Resolve from the test file.** Use `fileURLToPath(import.meta.url)` for `REPO_ROOT`.
- **Temp files.** Probes use `fs.mkdtempSync` in `os.tmpdir()` and delete the folder in
  `afterEach`. A probe never writes in a workspace.
- **Timeout.** 120000 ms for each test that starts a tool.

## 6. Phase S1: Package refresh and vinext 1.x

Risk: **critical**. Build tool, framework line, and every dependency change in one phase.
In r4 the phase also moves a sixth app from Next 16 to vinext, and the comparison baseline
no longer describes the tree.

### 6.1 Risks and the tests that defend each

This is the only risk table of the track (r5, section 14.5). Each id has one meaning. The
plan cites R17 and R18 with the meanings below.

| Id | Risk | Test or gate that fails if the risk is real |
|----|------|---------------------------------------------|
| R1 | `next` still resolves (hoisted by another package, a nested `node_modules`, or a lockfile entry) | Cases 2, 3, 8. Gate step `next-absent` (`npm ls next --all` prints `(empty)`). |
| R2 | `vinext` is not on 1.x for some workspace (a peer, an override, or a nested copy) | Case 1. **(extended in r4)** Case 8 asserts that the only lockfile key that ends with `node_modules/vinext` is `node_modules/vinext`. The merged lockfile has `apps/danielson/node_modules/vinext` at 0.0.55. Gate: `npm ls vinext --all`. |
| R3 | `next/*` types do not resolve, or resolve to `any` | Cases 4, 5, 5b, 6. Typecheck sweep over all workspaces. |
| R4 | Vitest cannot resolve `next/*` at runtime. The vitest configs do not use the vinext plugin. **(r5)** `apps/danielson/vitest.config.ts` has no `next/*` alias, and the 5 other apps have it (62f3fa60). 13 `vi.mock('next/...')` lines in 11 danielson files need it. | Test sweep over 27 workspaces. A log line that matches `Failed to resolve import "next` is a new failure. The search of section 6.3, step 4 covers `test-danielson.log`. |
| R5 | A build fails or changes after the Vite, plugin, or React moves | Build sweep over the 6 apps. Both bundle audits. `npx vinext check` in each app, danielson included. |
| R6 | A build passes and the runtime fails (RSC, hydration, middleware) | Dev server `/` status for each app. Browser smoke (section 6.5), danielson included. |
| R7 | A new failure hides inside a pre-existing failure | Key comparison by workspace, file, and code (section 7). Not a workspace-level compare. |
| R8 | A "held package" is not held, or "latest" is not the latest. **(r5)** The merge added ranges that the closed "update all other dependencies" task never saw: every danielson range and the root `oxlint ^1.79.0`. The registry of 2026-11-17 gives `oxlint` 1.94.0 and `vinext` 1.4.6 (lockfile 1.4.5). | Evidence section 4 check (section 6.4). `npm outdated --json` per workspace, run again after the danielson move. |
| R9 | The audit suites move forward by loosening or deleting assertions, or by a wrong fix that makes an old title pass | Review A diff check (section 6.4). The audit suites pass. The W4 contract is section 14.2. |
| R10 | The lockfile does not match the manifests, or install flags hide a conflict | `npm ci` at S1 Verify. `git diff <phase_base_sha> --name-only -- .npmrc` is empty. No `--force`, no `--legacy-peer-deps` in the log. |
| R11 | CI keeps a Node version below 24, or a workflow has no `setup-node` step | Case 7, which now reads all five workflow files (section 13.3). `node scripts/validate-ci.mjs`. |
| R12 | A build leaves an untracked folder | `git status --porcelain` after the build sweep. |
| R13 | The evidence file claims a result with no log | Section 6.4 checks. The baseline commit comes before the first manifest change. |
| R14 | A local-only file changes a result (for example a stale `next-env.d.ts` with `/// <reference types="next" />`) | Clean-worktree cross-check (section 6.6). |
| R15 | A second framework line stays in the tree (`apps/danielson` on Next 16 and vinext 0.0.55) after S1 claims the move | Cases 1, 2, 3, 4, and 8 through `APP_DIRS`, plus the `APP_DIRS` sentinel of section 13.3. The claim "all apps on vinext 1.x" is false while any of them is red. |
| R16 | The nested `apps/danielson/node_modules/vinext` 0.0.55 copy stays in the lockfile and shadows the root 1.4.5 at runtime | Case 8: the only key that ends with `node_modules/vinext` is `node_modules/vinext`. Review B names the owner of each such lockfile key. Dev status on 4106 proves the loaded runtime. |
| R17 | Daniel's root `.oxlintrc.json` (29,955 bytes) becomes a second lint-config owner before S2. Every workspace lint script points at `../../.oxlintrc.json`. | S1 touches no lint config. The S2 cases read each lint script and its `--config` target, and assert that no other `.oxlintrc.json` exists outside `node_modules` (section 14.6). The layout correction is section 13.8, item 4. |
| R18 | The Next 16 API surface of danielson does not match the vinext 1.x shims: 62 `next` import lines (section 14.7), route handlers, server actions, `next/headers`, `next/server`, or a middleware file behave differently | Dev status and browser smoke on 4106; `npx vinext check` on danielson; the danielson rows of evidence section 8. **Escalation:** when a shim does not cover an API that danielson uses, the phase stops for a PM decision. No app is ever excluded from a glob, a test, or a gate to make the phase pass. A decision is a recorded disposition (port the call, hold the phase, or move danielson to its own track), never a silent skip. |
| R19 | The comparison base is the wrong tree or has another workspace set: a 6-app run against the 5-app record, or a workspace dropped from the sweep | `GATES_BASE=baseline-m2` for every phase gate (section 2). The gate compares the workspace sets (section 14.4). The orchestrator runs the workspace-set check of section 6.4. It must print 27 names for each script. |
| R20 | Green makes the old W4 titles for `eslint` and `@eslint/js` pass by declaring both packages in a manifest (a false green for issue #2) | Case 9 fails when a manifest declares either package. Case 9b proves that the scan can fail. The W4 check of section 14.2 needs the exact title set. |

### 6.2 Red tests (the plan cases, with strategy additions)

The plan defines the original case set (cases 1 to 6). The r4 case set is cases 1 to 8. It
extends cases 1, 2, 3, and 4 to `apps/danielson`. It extends case 7 to all five workflow
files and case 8 to the nested vinext key. This strategy changes or adds the items marked
**(added)** or **extended**. Revision r4 adds the danielson coverage and the workflow-file
sentinel. The "Change" column says whether r4 changed the case. **r5 adds case 9 (the issue
#2 audit case) and case 9b.** The r5 case set is cases 1 to 9, with 5b and 9b. Section 14.3
holds the Red commit shape.

| Case | Assertion | Falsification condition | Change in r4 |
|------|-----------|-------------------------|--------------|
| 1 | `vinext/package.json` resolves from the root, from each `apps/*` folder, and from `packages/app-shell`. Each `version` has major 1 (parse the first dot field as an integer). The case asserts that `APP_DIRS` contains `apps/danielson` and that `APP_DIRS.length` is at least 6. | Fails when one folder resolves a 0.x copy (now `apps/danielson`, which resolves 0.0.55 from its nested folder). A regex for any digit does not count (A3). The sentinel fails when a filter drops the app. | extended |
| 2 | Precondition in the same test: `vinext/package.json` resolves. Then `next/package.json` throws from the root, each app folder, and `packages/app-shell`. **(paired)** | Without the precondition, a missing `node_modules` passes case 2. The precondition removes that vacuous pass (A4). It now fails on 8 folders, danielson included. | extended (set only) |
| 3 | No manifest in the root, `apps/*`, or `packages/*` declares `next`. The scan covers `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, and `overrides`, and goes into nested override objects. A sentinel asserts that the scan read the manifests of `apps/integrated-math-3` and `packages/app-shell`, and that the manifest count is at least 28 (root + 6 apps + 21 packages). | Fails when one declaration remains (now `apps/danielson/package.json:dependencies.next`). The sentinel fails when the glob finds no manifest. | extended |
| 4 | Each app `tsconfig.json` and `packages/app-shell/tsconfig.json` has `vinext/types` in `compilerOptions.types`. The `{ "name": "next" }` plugin entry is gone. The count sentinel is at least 7. | Fails when the plugin entry stays, and when `apps/danielson/tsconfig.json` has no `vinext/types` (`types: ["vitest/globals"]`, plugin `next`). | extended |
| 5 | The probe imports `NextConfig` from `next`, `Link` from `next/link`, and `useRouter` from `next/navigation`. `tsc -p` exits 0. | Fails at Red because `vinext/types` does not exist on 0.0.55. **r4: this case passes at this HEAD.** The root has vinext 1.4.5, so `vinext/types` resolves. The case is a guard now, not a Red case. | unchanged |
| 5b **(added)** | The same project with `<Link />` (no `href`) and `useRouter().push(123)`. `tsc -p` exits non-zero. The output has `TS2741` or `TS2345`. | Proves the types are real. If the types were `any`, case 5 passes and case 5b fails. If the vinext types accept both, Mid Red records the fact and chooses another strict member of the same types. **r4: passes at this HEAD** for the same reason as case 5. | unchanged |
| 6 | The probe with `import x from "next/does-not-exist"` exits non-zero. The output has `TS2307` and the text `next/does-not-exist`. The output has no `TS2688`. **(strengthened)** | At Red the unresolved `vinext/types` gives `TS2688`. Without the `TS2688` rule, case 6 passes for the wrong reason. **r4: passes at this HEAD.** | unchanged |
| 7 **(added)** | The YAML of every file in `.github/workflows/` is parsed with `js-yaml`. Each `actions/setup-node` step has a `node-version` with major 24. **r4: the parsed map must have one entry for each of the five files**: `business-math-deploy.yml`, `ci.yml`, `cloudflare-deploy.yml`, `jsdoc-typed-params.yml`, and `scale-benchmarks.yml`. Sentinels: the sorted key list equals the sorted `readdirSync` list; `ci.yml` has at least 1 step; `cloudflare-deploy.yml` has at least 1; `jsdoc-typed-params.yml` has exactly 0, which proves the file was parsed although it has no `setup-node`. | Covers the S1 criterion "Node 24". Fails at Red on `business-math-deploy.yml:deploy node-version='22'`. The key-list sentinel fails when a filter drops a file, and the zero-step sentinel fails when the parse skips a file with no step. | extended |
| 8 **(added)** | `package-lock.json` has no key in `packages` that ends with `node_modules/next`. No `packages["apps/<app>"]` entry lists `next` in its dependency maps. **r4: the only key that ends with `node_modules/vinext` is `node_modules/vinext`.** | Fails at Red on `node_modules/next`. The nested-copy rule fails on `apps/danielson/node_modules/vinext` (0.0.55). Closes the case where a manifest is clean and the lockfile still pins `next` or a second vinext. | extended |
| 9 **(added r5, issue #2 audit case)** | In `describe('S1 vinext 1.x')`, with the manifest reader of case 3. **(a)** No manifest of the root, `apps/*`, and `packages/*` (count at least 28, with `apps/danielson` and `packages/app-shell` present) has the key `eslint` or `@eslint/js` in `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, or `overrides` (nested objects included). **(b)** No lockfile `packages` entry of a workspace (key `""`, `apps/<name>`, `packages/<name>`) lists either name in a dependency map. Those entries are the lockfile copy of the manifests. **(c)** Case 9 checks only the workspace manifests and their lockfile copy. It asserts nothing about lockfile keys that start with `node_modules/`. The keys `node_modules/eslint` and `node_modules/@eslint/js` exist at 9.39.5 with the flags `dev` and `peer`. They are peers of `eslint-plugin-react` and `eslint-plugin-react-hooks`, which the root `devDependencies` declare and the root `.oxlintrc.json` loads as `jsPlugins`. An absence assertion for them fails at this HEAD, and it is a wrong test (section 14.2). Titles B and C of section 14.2 and S2 case 9 (section 8) cover the peer-only copies. | **Passes at this HEAD** (guard): no manifest declares either name. Fails when a manifest declares one. That is the wrong fix for issue #2: adding `eslint ^10` and `@eslint/js ^10` to satisfy the old 10.x titles (R20). | added |
| 9b **(added r5)** | The scan function of case 9 runs on an in-memory manifest set. One workspace declares `eslint` in `devDependencies`. The root declares `@eslint/js` in `overrides`. The scan returns exactly these two hits: `apps/x/package.json:devDependencies.eslint` and `package.json:overrides.@eslint/js`. | Seeded fault. It proves that case 9 can fail (A4). It passes at this HEAD. It fails when the scan skips a dependency map or skips nested overrides. | added |

**`js-yaml` for case 7.** In r1 to r3 `js-yaml` was only a transitive dependency (through
`@eslint/eslintrc`, which S2 removed), so Green added it to the root `devDependencies`.
**r4: the merged root already has `js-yaml ^5.5.0` in `devDependencies`.** The merge made it
a direct dependency of `scripts/validate-ci.mjs`. Green records it in evidence section 3 as
already present. Green makes no manifest change for it. Case 7 must still pass after S2.

Red expectation (r5, fixed in r6). At this HEAD the S1 describe holds 9 tests: cases 1 to 8,
with 5b (collect-only `vitest list`, 2026-11-17). The follow-up Red commit adds cases 9 and 9b.
After that commit the describe holds 11 tests. Cases 1, 2, 3, 4, 7, and 8 must fail on the
assertion (6 red). Cases 5, 5b, 6, 9, and 9b must pass (5 green guards). Cases 5, 5b, and 6
pass because the root has vinext 1.4.5. Cases 9 and 9b pass because no manifest declares
`eslint` or `@eslint/js`. The plan said "confirm cases 1 to 4" for the original Red
commit `abbe15f1`. The Red run must confirm all six failing cases and record each first
failing line. A passing guard is not a defect. Mid Red records it as a green guard. The W4
command of section 14.2 is the second Red evidence: 4 failed and 4 passed.

Red commit shape (r5). `abbe15f1` stays the Red commit of the plan task. The six first cases
and their Red log stay as they are. The r4 changes (the sentinels, case 7's five files, case
8's nested-vinext rule) and the r5 cases 9 and 9b land as **one follow-up Red commit** on this
HEAD: `test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`. Section 14.3 lists
its content. The `[~]` S1 Test task stays `[~]` until Green closes it. Green marks `[x]` only
when the six red cases and the five guards pass.

Mid Red scope note: the plan makes Mid Red edit `scripts/vitest.config.ts`. The `role-gate`
check lists a path as non-test when it is not a `*.test.ts` file and not under `__tests__/`.
The orchestrator accepts `scripts/vitest.config.ts` as the one planned test-config file.
Record this as a deviation in the handoff. Do not change the plan for it.

### 6.3 Gate sequence for S1

**Owners.** Mid Red runs, in this order: the S1 Contract task, the S1 Baseline re-capture
task (r4), and the S1 Test (Red) task. The S1 Baseline re-capture includes the gate runs
(label `baseline-m2`), the danielson build and dev status, and the baseline browser capture
of three apps. Mid Red makes the browser capture with the `agent-browser` skill. The
orchestrator runs only the role gates and the section 6.4 checks. The orchestrator does not
run a baseline gate and does not capture a browser state. Jr Green runs steps 4 to 7.

Run in this order. Stop at the first failure that is not a baseline failure.

1. **S1 Baseline re-capture (Mid Red).** Packages are unchanged, and `node_modules` comes
   from `npm ci`. Run `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint
   baseline-m2`, then `test baseline-m2`, then `checks-all baseline-m2`. The script calls
   `heavy-run.sh` itself. A label that starts with `baseline` records only, so these runs
   never compare with the old folder. Then run the bundle audits, the E2E run, the
   dev-server status checks of the plan, the danielson build, and the danielson `vinext
   check`. The files in `measure/runs/vinext-oxc-toolchain_20261114/gates/baseline-m2/` are
   the comparison base for every later gate (`GATES_BASE=baseline-m2`). Mid Red copies the
   failing set to evidence section 10 (the durable record), in a "6-app baseline (2026-11-17)"
   part. The pre-merge `gates/baseline/` files are historical. They are not the comparison
   base, and no role deletes them. Mid Red records the 27 names of `baseline-m2`. The
   pre-merge folder has 26 names and no `apps/danielson`. A phase run whose workspace set
   differs from the `baseline-m2` set is a new failure (section 14.4).
2. **S1 Baseline browser capture (Mid Red, `agent-browser` skill).** Run it on the merged
   tree before the first package change. Capture one screenshot, one accessibility
   snapshot, and the console error list for `http://localhost:4103/` (IM3),
   `http://localhost:4105/` (BM2), and `http://localhost:4106/` (danielson). Save them in
   `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-m2-*`. The UX role compares with
   them. The Red task does not start before the files exist. The danielson capture is new:
   record its first redirect or status (for example a redirect to a login route), because a
   login gate is a baseline fact and not a finding.
3. **S1 Test (Red) task (Mid Red):** `RED_TEST_COMMAND` fails on the six named cases. Run
   the discovery check first. Land the follow-up Red commit (section 14.3).
4. **After the vinext commit (Jr Green):** run the typecheck and test sweeps for all
   workspaces. Search the test logs:
   `grep -l 'Failed to resolve import "next' measure/runs/vinext-oxc-toolchain_20261114/gates/<label>/test-*.log`
   must print nothing.
5. **After each dependency commit (Jr Green):** `GATES_BASE=baseline-m2 bash
   measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint s1`, `test s1`,
   `checks-all s1`. The plan requires all gates before each commit. Before the first `s1`
   gate of r5, rename the folder `gates/s1` to `gates/s1-premerge` (section 14.4). Run the
   workspace-set check of section 6.4 after the three gates.
6. **Green (Jr Green):** `GREEN_TEST_COMMAND` exits 0 (all S1 cases and the older scripts
   suite). The audit suites pass for the rewritten W4 titles (section 14.2).
7. **Verify task (Jr Green):** `npm ci` (through `heavy-run.sh`, as its own job), then all
   gates with label `s1` and `GATES_BASE=baseline-m2`, both bundle audits, the dev-server
   status checks for 6 apps, the E2E run when the baseline ran it, then the build timing.

**The stashed commit C (stash@{1}).** The stash holds Green's unverified commit-C work of
2026-11-15: vitest 5, `@testing-library/jest-dom` 7, 33 files, and a `Machine B` evidence
note. It was written for the 5-app tree on vinext 0.0.55 and it was never verified.
Decision for Green: **abandon it; do not apply the stash.** Deciding evidence: the stash
predates the merge of 1130 commits, it holds no danielson change, and it touches
`scripts/audit/__tests__/in-range-wave-w3.test.ts`, which the r4 audit rewrite also edits.
An apply would mix two unverified audit edits in one commit. Green re-does the vitest and
jest-dom moves from the merged manifests, one major family per commit, with the gates of
step 5 before each commit. Keep the stash object as a reference until the phase checkpoint.
Record the abandonment in evidence section 8. If Green believes the stash still holds a
unique fix, it applies the stash, then runs the full step-5 gates, then keeps or drops each
hunk in a separate commit. The default is abandon.

### 6.4 Artifact checks (the orchestrator runs these; they are not vitest cases)

Each check is a command with an exit code. The label S1 evidence file path is
`measure/tracks/vinext-oxc-toolchain_20261114/oxc-evidence.md`.

- **Heading check.** `grep -n '^## ' <evidence>` lists the 11 sections in the order of spec
  "Evidence File Contract". A missing or reordered heading fails.
- **Content check (S1).** Sections 1, 2, 3, 5, and 10 each hold at least one table row
  after the header row. A row with only `TBD`, `-`, or `(empty)` does not count (A4).
  Section 4 may be empty only when `npm outdated --json` is empty for every workspace
  apart from `typescript` and the ESLint family. **r4:** section 2 has one row for each of
  the 27 workspace folders, and section 8 has one row for `apps/danielson` (its `vinext
  check` score, each issue, and the proof that no `next` declaration remains).
- **Order check (A5).** `git log --format='%h %s' -- measure/tracks/vinext-oxc-toolchain_20261114/oxc-evidence.md package.json apps packages`
  shows `measure(vinext-oxc): record the S1 baseline` before the first manifest change, and
  shows the r4 baseline re-capture commit before the danielson manifest change. **r4:** the
  second requirement is the one that matters; the first baseline was captured on a 5-app
  tree and cannot prove the 6-app ordering. The re-capture commit subject is
  `measure(vinext-oxc): record the 6-app S1 baseline`.
- **Workspace-set check (r5, A4; it replaces the r4 "Baseline-set check").** The r4 check
  compared `baseline` with `baseline-m2`. It failed by design, because `baseline` has 26
  names and `baseline-m2` has 27. The pre-merge `baseline` folder is historical, and no check
  names it. The r5 check compares the phase run with `baseline-m2` on 27 names (6 apps and 21
  packages). The workspace name is the first field of each line of a `.exit` file.
  `lint.exit` and `test.exit` come from the `lint` and `test` gates. `typecheck.exit` and
  `build.exit` come from `checks-all`. Run this after the three `s1` gates:
  ```
  G=measure/runs/vinext-oxc-toolchain_20261114/gates
  for s in lint test typecheck build; do
    LC_ALL=C comm -3 <(awk '{print $1}' $G/baseline-m2/$s.exit | LC_ALL=C sort -u) \
                     <(awk '{print $1}' $G/s1/$s.exit | LC_ALL=C sort -u)
    echo "workspaces-$s=$(awk '{print $1}' $G/s1/$s.exit | LC_ALL=C sort -u | wc -l)"
  done
  LC_ALL=C comm -3 <(ls -d apps/* packages/* | LC_ALL=C sort) <(awk '{print $1}' $G/s1/lint.exit | LC_ALL=C sort -u)
  ```
  The output has no `comm` line. It has four lines `workspaces-<script>=27`. Parse each
  integer (A3). A name in one set and not in the other is a new failure. The last `comm`
  compares the run with the folders on the disk. It catches a workspace that both folders
  lack. `gates.sh` makes the first compare itself (section 14.4). This command is the
  independent confirmation.
- **Held-package check.** Each row of section 4 names a failing gate and a first error line.
  The orchestrator finds that line in the log under `measure/runs/vinext-oxc-toolchain_20261114/gates/` or in the command output
  copied to the row. A held package without a line fails the review.
- **Latest check.** For each workspace, `npm outdated --json --workspace=<ws>` lists only
  packages in section 4, plus `typescript`, `eslint`, `@eslint/js`, `@eslint/eslintrc`,
  `typescript-eslint`, `eslint-config-next`, and `@types/node` above 24.x. **r4:** the sweep
  is 27 workspaces. `apps/danielson` is not an exception: `next`, `vinext 0.0.55`,
  `@vitejs/plugin-react ^6.0.0`, and `@types/node ^22` must leave section 4 by the end of
  the phase.
- **Audit-suite diff check.** `git diff <phase_base_sha> -- scripts/audit/__tests__`:
  no `it(` or `expect(` line disappears unless it names a removed package. The assertion
  that replaces a version pin admits the installed version. No range is `latest`, `*`,
  or empty. The old security floor stays a minimum (lessons-learned 2026-06-07).
  **r5:** the W4 rewrite follows section 14.2. The orchestrator runs the `W4_AUDIT_COMMAND`
  of section 2 with its parse. It requires `w4_failed=0` and the eight exact titles of
  section 14.2 in the passed set. (Was: "the four titles of section 13.3". That list held
  prefixes, and the file holds none of them.) **r6:** the orchestrator also runs the closure
  checks K2 to K5 of section 14.2. The eight titles alone do not close issue #2.
- **Manifest check.** `git diff <phase_base_sha> --name-only` has one `package-lock.json` at
  the root only, and no `.npmrc`.
- **Marker check.** `git grep -n 'planned: vinext-oxc-toolchain_20261114'` still finds the
  README and tech-stack lines in S1. The marker stays until S5 (section 10).

### 6.5 Live behavior proofs

- **Build.** `npm run build --workspace=apps/<app>` exits 0 for IM1, IM2, IM3, PreCalc,
  BM2, and danielson. Run them one at a time under `heavy-run.sh`. After the sweep, `git
  status --porcelain` has no untracked entry except ignored paths (R12). The danielson build
  is new in r4: record its first error line when it fails, and do not add a build script
  exception for it.
- **Dev status.** For each app, start `setsid npx vinext dev --port <port>` in the app
  folder (4101 to 4106: IM1 4101, IM2 4102, IM3 4103, PreCalc 4104, BM2 4105, danielson
  4106). Poll `curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/`
  every 2 s for 90 s. Code `000` means no server: that is a failure, not a status. Compare
  the status with the baseline. A redirect is a status too: record the `3xx` code and the
  `location` header. Stop the process group and confirm the port is free.
- **Browser smoke (`UX_REQUIRED=always`).** On `http://localhost:4103/`,
  `http://localhost:4105/`, and `http://localhost:4106/`, load the page, take a snapshot,
  list the console errors, and follow one internal link. The result must match the baseline
  capture: same visible headline, same console errors, no new hydration or module error. A
  new console error is a finding. These apps need Convex for data. The comparison is
  relative to the baseline, so a baseline error that comes from a missing backend is not a
  finding. The danielson page may be a login or unauthorized route at baseline. In that
  case the proof is that the same route comes back, not a dashboard render.
- **Bundle audits.** `npm run bundle-size:audit --prefix apps/integrated-math-3` and
  `npm run bundle:audit --workspace=apps/bus-math-v2`. Do not change a budget. Compare by
  entry, not by exit code (plan "Baseline Comparison"). The audit prints one line for each
  entry: `[OK]` or `[EXCEEDS]`, the entry name, the size in KB, and the threshold in KB.
  Parse the entry name and the labeled sizes (A3).
  - An entry that failed at baseline is not a new failure. At baseline the BM2 audit fails on
    `Total dist/server` (11299.69 KB against 3000.00 KB) and on `server/index.js → index.js`
    (2690.45 KB against 2500.00 KB). It exits 1 at baseline. The IM3 audit passes.
  - These stop the phase (plan "S1 Verify"): an entry that is `[EXCEEDS]` now and was `[OK]`
    or absent at baseline, any `[EXCEEDS]` entry in the IM3 audit, and a changed budget.
  - For each entry that failed at baseline, record both sizes (baseline and now) in the
    evidence file. Report any growth of such an entry in the Green handoff. Growth alone
    does not stop the phase.
- **E2E.** Run `npm run test:e2e --prefix apps/integrated-math-3` only when the baseline
  ran it. Compare the failing test titles with the baseline.
- **Typecheck.** `tsc` (6.0.3 in S1) over all 27 workspaces (26 are manifest-covered;
  `_template` is outside the architecture manifest), and `apps/bus-math-v2` through
  `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json`. Convex type checks belong to S3.
- **`npm run build` and `npx tsc --noEmit` together.** AGENTS.md says that vinext build does
  not enforce types. A green build alone does not close S1. A green typecheck sweep alone
  does not close S1.

### 6.6 Clean-worktree cross-check (only when a result looks local-only)

When a diagnostic names `next-env.d.ts`, a stale cache, or a path under ignored files, run
the failing gate again in a clean copy: `git worktree add /tmp/oxc-clean-s1 HEAD`, then
`npm ci` there. Compare. Remove the worktree with `git worktree remove`. Do not delete
ignored files in the main tree.

### 6.7 Green and closeout gates for S1

- **Green gate:** `GREEN_TEST_COMMAND` exits 0. `lint s1`, `test s1`, and `checks-all s1`
  print `NEWFAIL=0`. The W4 check of section 14.2 prints `w4_failed=0` with the eight exact
  titles passed. **(r6)** The closure checks K2 to K5 of section 14.2 hold at the same commit.
- **Closeout gate (phase acceptance):** the Green gate; `npm ci` succeeded; 6 builds exit 0;
  the next-absent step is 0; the workspace-set check of section 6.4 prints
  `workspaces-<script>=27` four times and no `comm` line; the dev status matches the baseline; the browser smoke matches
  the baseline; no bundle entry is new over budget and the IM3 audit passes (BM2 baseline entries follow the rule above); evidence sections 1 to 5, 8, and 10 have content;
  section 11 may stay empty until S5; `npm run generate` and `npm run doctor` exit 0, or
  the generator path-bug deviation below is recorded and `npm run doctor` exits 0.
- **Docs task note (A10).** Green runs `npm run generate` in the S1 Docs & Doctor task and
  confirms exit code 0.
  - If the new `measure/generated/routes.md` holds `../../../daniel-bo/` paths, the generator
    has a path bug. Green then runs `git restore measure/generated/routes.md`, skips
    `npm run generate` in S1, and records the skip as a deviation. Green also adds one row to
    `measure/tech-debt.md` with the cause (check the 50-line limit first).
  - Otherwise Green stages a generated file only when `git diff` shows a change that S1 caused.
  - The PM decided on 2026-11-15 that `measure/generated/routes.md` is a generated file with
    no change to keep. The orchestrator restored the committed file before Green. No role
    saves a patch of it.

## 7. New-failure rule (all phases)

- A gate passes when it has no new failure. A workspace that failed at baseline stays
  allowed to fail, with the same diagnostic keys.
- Key for `tsc`: the file and the `TS` code, with line and column removed. Key for lint:
  the file and the rule id. Key for a test failure: the test file and the test title.
- A workspace-level compare alone is too coarse (A7). A baseline-failing workspace could
  gain a new fault and still look unchanged. The script compares keys for each failing
  workspace.
- A script that disappears from a workspace is a new failure (A4). Making a gate "pass" by
  removing its script is not allowed.
- A workspace in the baseline and absent from the run, or in the run and absent from the
  baseline, is a new failure (r5, section 14.4). The sweep gate enforces it for each script.
- A tsrs or oxlint diagnostic that comes only from a compiler-version difference is not a
  code fault. The implementer records it in the compiler-version table of evidence
  section 7 and does not edit code for it (spec-review F4, declined as Nit; this strategy
  applies the rule to the S3 gate).

## 8. Phases S2 to S5

### S2: ESLint to oxlint (risk: medium)

| Risk | Defense |
|------|---------|
| A config lints no file, or a rule is off | Plan cases 4 and 5. **(added)** Case 6 (r5, single root, section 14.6): the unused-variable probe runs with `--config <repo>/.oxlintrc.json`. The exit code is non-zero, and the output has `no-unused-vars`. A rule that the root config leaves off goes in a named allow-list with the config line as the reason. |
| A second lint config appears, or a lint script names another target | **(added r5, R17)** Case 8: no `.oxlintrc.json` other than the root exists outside `node_modules`. Each lint script, except `packages/_template`, names `../../.oxlintrc.json`. |
| Zero warnings by blanket disable | **(added)** Case 7: no source file under `apps/` or `packages/` has `/* oxlint-disable` (block form). Each `oxlint-disable-next-line` has ` -- ` and a reason. |
| Oxlint reads no file | Each lint log has a labeled count `on <n> files`. Parse `<n>`. It is above 0 (A3, A4). |
| Findings fixed with a behavior change | `fix(lint)` commit diff goes to Review A with the question "does any change alter behavior". The test, typecheck, and build sweeps show no new failure. |
| Rule gap not recorded | Orchestrator check: each rule in the `--details` output of the migration appears in evidence section 6 (A5). |
| `eslint` family left in a manifest, or an ESLint copy that is not peer-only **(r6)** | Plan case 1. **(added r6, non-droppable)** S2 case 9, the issue #2 case: **(a)** the lockfile has no `node_modules/eslint-config-next` key and no `node_modules/typescript-eslint` key; **(b)** each of `node_modules/eslint`, `node_modules/@eslint/js`, and `node_modules/@eslint/eslintrc` is absent or has `peer: true`; **(c)** each `jsPlugins` specifier of the root `.oxlintrc.json` has a `node_modules/<specifier>` key. S2 case 9b runs the scan on an in-memory lockfile with one seeded fault for each clause and expects exactly three hits. Case 9 passes at this HEAD (guard). Falsification: (a) fails when either key exists, (b) fails when a copy lacks `peer: true`, and (c) fails when a specifier has no key. The S2 refresh may re-derive the Red set. It cannot drop case 9 or case 9b. |

Gates: `RED_TEST_COMMAND` filter `S2 oxlint`. `PROJECT_LINT` must print `NEWFAIL=0` and every
workspace lint script exits 0 with zero warnings (the sweep covers the 27 workspace folders;
section 13.1). Closeout also needs `lint` timings
in section 5 and the section 6 and section 8 entries.

(r5) State at 2026-11-17: no `eslint.config.*` file is tracked, and no manifest declares an
ESLint package. The plan cases 1, 2, and 3 already pass at the merged tree. The S2 refresh at
the start of S2 re-derives the Red set. It also decides how to fill evidence section 6 and
the "before" lint timing, because the migration tool has no config left to read (section
14.8). The lockfile keeps `eslint`, `@eslint/js`, and `@eslint/eslintrc` as peer-only copies
(flags `dev` and `peer`) of the two React ESLint plugins in the root `devDependencies`.
**(r6)** The root `.oxlintrc.json` loads both plugins as `jsPlugins` (section 14.2). S2 keeps
them. No S2 case asserts lockfile absence of `eslint` or `@eslint/js`. Such a case cannot pass
while the plugins stay, and it is a wrong test.

### S3: TypeScript 7 and tsrs (risk: high)

| Risk | Defense |
|------|---------|
| The type gate finds nothing (false green) | Plan cases 6 and 7. **(added)** Live loop at S3 Verify: for each workspace, add `__oxc_probe__.ts` with `export const n: number = "x";` under the folder that its tsconfig covers. Run `npm run typecheck --workspace=<ws>`. The output has `TS2322` for the probe. Delete the probe. `git status --porcelain` is clean after each workspace. IM3 also gets the Convex probe of the plan. |
| tsrs and `tsc` compared on different commits or compiler lines | The evidence section 7 header has the `git rev-parse HEAD` of all three runs. `git status --porcelain` is clean for each run. Both versions are printed at the top of section 7. |
| The collector sees no diagnostics, so "no gap" is empty | Collector self-check: the seeded TS2322 probe appears in the `tsc` 7.1.0-beta, the tsrs, and the `tsc` 7.0.2 output. If one tool misses it, the comparison is invalid. |
| TS 7 rejects a tsconfig option | `tsc -p` per workspace and per `convex/tsconfig.json`. The first error line goes to the commit note. |
| `typescript` removed where the Convex CLI needs it | `npx convex typecheck` per app, with the result in section 9. No `convex deploy`. No `convex dev` against the cloud. |
| Keep list drifts from the manifests | Plan case 5 compares the exact set. `TSC_FALLBACK_LIST` is a subset of `TYPESCRIPT_KEEP_LIST` (**added** assertion). |
| Package `build` scripts still call `tsc` | Plan case 2. |
| New native binary does not install on a clean machine | `npm ci` at S3 Verify (through `heavy-run.sh`), on Node 24. |

Gates: `RED_TEST_COMMAND` filter `S3 tsrs`. The plan changes S1 cases 5 and 6 to the tsrs
command in this Red commit. Those two S1 cases are red by design until Green.
`PROJECT_CHECKS` replaces the `typecheck` sweep command with the new scripts automatically,
because the sweep runs `npm run typecheck`. The `typecheck-bm2` step no longer applies, since
bus-math-v2 gets a script. The sweep then covers it.

(r5) The plan S3 Contract boxes that name `-c .oxlintrc.json` use the old per-workspace
layout. The S3 refresh must use `--config ../../.oxlintrc.json` (section 14.6).

### S4: oxfmt (risk: medium)

| Risk | Defense |
|------|---------|
| The format changes behavior | Run the sweeps before and after. The results must match. If one differs, do not commit (plan). Whitespace-sensitive strings and inline snapshots are the likely cause. |
| The format-only commit holds more than formatter output | **(added)** `git show --name-only <sha>` equals the file list that `npx oxfmt --check` printed before the format. |
| The format touches an ignored path | `git diff --name-only` has no path that matches `ignorePatterns` (plan). |
| A second run changes files (not idempotent) | **(added)** Run `npm run format` again. `git status --porcelain` shows no change. |
| Script output breaks the check after a rerun | The plan task adds the output paths to the ignore list. **(added)** Run `npm run generate` and `git status`; then `npm run format:check` exits 0. Restore nothing by checkout. Stage no generated change that this phase did not cause. |
| oxfmt cannot parse a file | The format log has no line with `error` or `failed`. Parse the log. A silent skip counts as a failure. |
| Blame ignore does not work | Plan case 3 and the `git blame --ignore-revs-file` proof of the plan. |

Gates: `RED_TEST_COMMAND` filter `S4 oxfmt`. Case 1 (`oxfmt --check` exits 0) fails at Red
because the tool is absent and the files are unformatted. Case 4 asserts that the output names
the probe file and has none of the absent-tool phrases (section 5).

### S5: Gate rules and CI (risk: medium)

| Risk | Defense |
|------|---------|
| A command call stays, in a spelling the plan case misses | **(added)** Case 9 in the test file: regexes for command forms, not bare words. The forms are `\b(npx\|npm exec)\s+(-\S+\s+)*tsc\b`, `\btsc\s+(-p\|--project\|--noEmit)\b`, and `\beslint\s+(\.\|src\|--)`. They run over `.github/workflows/*.yml`, the root `package.json`, `scripts/` (not `scripts/__tests__/`), and `measure/scripts/`. The workspace `package.json` files in `TSC_FALLBACK_LIST` are the only path exclusion. No English-word filter (A7). |
| S1 to S3 Contract notes put a banned string in `tech-stack.md` | The S5 case 1 reads that file. The notes of S1 to S3 must avoid `npx tsc`, `tsc --noEmit`, `eslint .`, `eslint src`, and `vinext lint`. Mid Red of S5 checks the three notes first. |
| The `deploy` job is removed but a deploy path stays | Plan case 7. **(added)** `node scripts/validate-ci.mjs` exits 0. `cloudflare-deploy.yml` has `workflow_dispatch` and no `push` trigger. |
| A removed step breaks the job graph (`needs`) | `validate-ci.mjs` and a YAML parse: each `needs` entry names an existing job (**added**). |
| Planned marker stays after the work is done | Section 10. |
| Root scripts differ from the workspace scripts | Plan case 3. Live: `npm run lint`, `npm run typecheck`, and `npm run format:check` at the root exit 0 with `NEWFAIL=0` semantics (compare with the baseline). |
| `tracks.md` or the evidence summary overstates (A6) | The registry text cannot say "resolved" or "all pass" unless the gates pass at that commit. Orchestrator runs the A5 and A6 detectors from `measure/anti-patterns.md` at closeout. |
| AGENTS.md edit drops a rule | `git diff` of `AGENTS.md` changes only the two guardrail lines. |

Gates: `RED_TEST_COMMAND` filter `S5 gate rules`. Case 8 (Node 22 or more) passes at Red by
design. It is a guard. Mid Red records it as green.
S5 Verify also runs `npm ci` on Node 24 and the full sweep through the root scripts.

## 9. Intentionally-red aggregate-suite handling

- At each Red commit, only the new `describe` is red. The Red command filters with `-t`.
  The aggregate scripts suite is red by design until the Green commit. Do not run the
  `test` gate between Red and Green.
- The S3 Red commit also turns S1 cases 5 and 6 red (plan). This is planned.
- Pre-existing failures (lint, typecheck, test, build) make some sweeps red at the
  baseline. These are not "intentionally red". They go to evidence section 10 and the
  key comparison of section 7 absorbs them. Nobody fixes them in this track.
- Bundle-audit and E2E failures at baseline follow the same rule.
- After Green, `GREEN_TEST_COMMAND` must exit 0 without a filter. A filtered Green run is
  not evidence.

## 10. Planned markers (strategy gate note)

`AGENTS.md` says the track that completes a direction item removes its marker and writes
the current state. The markers are `README.md` (Planned Direction item) and
`measure/tech-stack.md` (the "Planned" paragraph under "Runtime & Framework"). The plan did
not name this step in S5. This strategy added one S5 Contract line to `plan.md` for it.

- **Test (added, S5 case 10):** `git grep -n 'planned: vinext-oxc-toolchain_20261114' -- README.md measure/tech-stack.md measure/index.md`
  finds nothing, and `measure/tech-stack.md` states the current vinext, oxlint, oxfmt, and
  tsrs versions as current. The grep is not a filter on English words.
- **Live complement:** the versions in `tech-stack.md` equal `npm ls vinext oxlint oxfmt tsrs`
  output (parse the version fields).

## 11. Anti-pattern coverage

| Phase | Anti-patterns | What the defense is |
|-------|---------------|---------------------|
| S1 | A3 | Version checks parse the major as an integer from `package.json`. `NEWFAIL=<n>` is a labeled integer. The audit count uses `critical=<n>` labels. |
| S1 | A4 | Case 2 has a precondition. Case 3 has a sentinel. Case 7 has a sentinel. The discovery check rejects "No test files found". A removed script is a new failure. |
| S1 | A5 | The evidence file claims are checked against logs. The baseline commit comes first. The plan and the registry say "passes" only after a command that exits 0 at that commit. |
| S1 | A7 | The new-failure compare uses keys, not a workspace pass or fail. The `next` searches use anchored patterns (`from ['"]next`, `"next":`), never the bare word `next`. |
| S1 | A9 | The test file reads nothing under `measure/tracks/`. |
| S1 | A10 | The Docs task saves the routes.md diff first and stages only a phase-caused delta. |
| S2 | A3, A4 | The oxlint file count is a labeled integer above 0. The per-config probe loop proves each config lints. |
| S2 | A7 | The allow-list of rule gaps names the config line. No bare-word filter. |
| S3 | A4 | The collector self-check and the per-workspace probe loop. |
| S3 | A5 | The conformance table claims "none" only when the self-check passed on the same commit. |
| S4 | A4, A7 | The format-only commit file list must equal the pre-format list. A second run is empty. |
| S5 | A5, A6 | The summary and `tracks.md` get the A5 and A6 detectors at closeout. |
| S5 | A7 | The banned-string regex has path-based exclusions only. |
| S5 | A9 | The test reads no track folder. |
| S5 | A10 | `npm run generate` and `npm run doctor` run in the Docs task. |
| S5 | A11, A12 | `bash tests/measure_orchestrator_audit.sh` stays in the `checks-all` gate. The AGENTS.md edit touches only the two guardrail lines. |
| All | A8 | Task markers: Green marks `[~]` then `[x]` with a SHA. The role gate reads them. |

Revision r5 adds defenses to the S1 rows. Section 14.9 lists them. Revision r6 adds more.
Section 15.4 lists them.

## 12. Gate script

The only copy is `measure/tracks/vinext-oxc-toolchain_20261114/gates.sh`. It was checked with `bash -n`.
It uses the baseline files of the folder that `GATES_BASE` names (default `baseline`; S1 uses
`baseline-m2`, section 13.2) whenever the label does not start with `baseline`.
The S1 baseline files came from an uncommitted driver that ran the same jobs one at a time. The
committed script writes the same file names and the same line formats. A check of `base_code`
against the real baseline files gave the recorded codes. The committed script was not run on the
workspaces. Its first full run is the `baseline-m2` run.
The r4 change to the script: `is_record_only()` makes every `baseline*` label record only, and
`BASE=$GATES/${GATES_BASE:-baseline}` selects the comparison folder. The regression test
`scripts/__tests__/vinext-oxc-gates-script.test.ts` covers both rules (11 cases, green).
A change to the gate logic after the baseline run must keep the baseline file names and formats.
Otherwise the change needs a new baseline run.
The `baseline-m2` run of 2026-11-17 was the first full run of the committed script (the r4 copy).
The r5 change to the script: `sweep()` compares the workspace set of the run with the set of
`$BASE/<script>.exit`. It runs when that file exists and the label does not start with
`baseline` (section 14.4). It changes no baseline file name and no format, so `baseline-m2`
stays valid. `bash -n` passes. The 11 cases of the regression test pass before and after the
change. A hand harness in a temp folder shows the effect (section 14.7). Two guard cases for
the new rule go in the follow-up Red commit (section 14.4).

## 13. Revision r4 (2026-11-17)

**Revision record.** Revisions r1 to r3 described a five-app tree on vinext 0.0.55. They
counted 25 workspace folders and 26 manifests. They set the comparison base to the pre-merge
`gates/baseline/` folder. The merge `2b2d9952` of `origin/master` `2e353ef9` (1130 commits)
changed that tree. It added `apps/danielson` on Next 16 with vinext 0.0.55. It added a 29 KB
root `.oxlintrc.json`. It changed the audit suites. r4 supersedes the r1 to r3 counts, case
set, baseline label, and lint layout. Sections 1 to 12 carry the r4 amendments. This section
records the revision, the new baseline, the Red change list, the risks, the gates, the review
gates, the plan amendments, and the anti-pattern coverage. **(r5)** Section 14 supersedes each
item of this section that carries the marker "superseded by r5". The other items stay valid.

### 13.1 Scope

| Item | r4 value |
|------|----------|
| Apps | 6: `integrated-math-1`, `integrated-math-2`, `integrated-math-3`, `pre-calculus`, `bus-math-v2`, `danielson` |
| Workspace folders in the root `workspaces` field | 27 (6 apps + 21 packages; `_template` is one of the 21) |
| `package.json` manifests | 28 (root + 27) |
| Workspaces in the architecture manifest | 26 (`_template` is excluded) |

Each count sentinel asserts a minimum of 27 workspace folders and 28 manifests. It also
asserts that a named folder is present (`apps/danielson`, `packages/app-shell`). A sentinel
never writes the full name list by hand (section 5, "No app is excluded").

### 13.2 Fresh baseline

The pre-merge `measure/runs/vinext-oxc-toolchain_20261114/gates/baseline/` folder is
historical. It records 5 apps on vinext 0.0.55. It cannot prove a 6-app result. No role
deletes it.

The r4 comparison base is the label `baseline-m2`. Capture it at this merged HEAD, before the
first manifest change, in this order:

1. `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint baseline-m2`
2. `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh test baseline-m2`
3. `bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh checks-all baseline-m2`

Then capture the danielson live record: its `npm run build`, its dev-server `/` status on
port 4106, and its browser capture. Record the status code, and the `location` header of a
redirect.

Rules:

- Any label that starts with `baseline` records only. `is_record_only()` in `gates.sh` makes
  this true for `baseline-m2` and for every later `baseline*` label. A record run never
  compares, and it never fails for a new failure.
- A later run names this folder with `GATES_BASE=baseline-m2`. The default `baseline` stays
  the historical folder. A run without `GATES_BASE` compares with the wrong tree.
- The folder is gitignored. The durable record is evidence section 10 of `oxc-evidence.md`.
- **(superseded by r5, section 14.4)** The r4 rule compared the two baselines. r5 compares
  the phase run with `baseline-m2`. A workspace in one set and not in the other is a new
  failure. The compare runs for `lint.exit`, `test.exit`, `typecheck.exit`, and `build.exit`.
- The stale `.next` build output of danielson is not a baseline fact. The status and the
  browser snapshot are.

### 13.3 Red revision list

The full assertion text is section 6.2. This table records only the r4 change and the
falsification condition of each case.

| Case | Assertion (r4) | Falsification condition | Change |
|------|----------------|-------------------------|--------|
| 1 | Each of the root, each `APP_DIRS` entry, and `packages/app-shell` resolves a vinext major of 1. `APP_DIRS` holds `apps/danielson` and has at least 6 entries. | One folder resolves 0.x, or a filter drops `apps/danielson` from `APP_DIRS`. | extended |
| 2 | `next/package.json` throws from 8 folders, after a precondition proves that vinext resolves. | Any folder resolves `next`, or the precondition is missing (A4). | extended (set only) |
| 3 | No manifest in the root, `apps/*`, or `packages/*` declares `next`, over 5 dependency maps. The manifest count is at least 28. | `apps/danielson/package.json:dependencies.next` stays, or the glob finds no manifest. | extended |
| 4 | Each app tsconfig and `packages/app-shell/tsconfig.json` has `vinext/types` and no `{ "name": "next" }` plugin. Count at least 7. | Danielson keeps `types: ["vitest/globals"]` and the `next` plugin. | extended |
| 5 | The `next/*` type probe exits 0. | At this HEAD it passes (root vinext 1.4.5). It is a guard now. | unchanged |
| 5b | The invalid probe exits non-zero with `TS2741` or `TS2345`. | It passes, which proves the types are `any`. | unchanged |
| 6 | The missing-module probe exits non-zero with `TS2307` and no `TS2688`. | It passes, or the failure is `TS2688`. | unchanged |
| 7 | Every `actions/setup-node` step in the 5 workflow files has Node 24. Sentinels: the parsed key list equals the `readdirSync` list; `ci.yml` has at least 1 step; `jsdoc-typed-params.yml` has exactly 0. | `business-math-deploy.yml:deploy` keeps `'22'`, or a filter drops a file, or a parse skips a file without a step. | extended |
| 8 | No lockfile key ends with `node_modules/next`, no app entry lists `next`, and the only key that ends with `node_modules/vinext` is `node_modules/vinext`. | `node_modules/next` stays, or `apps/danielson/node_modules/vinext` (0.0.55) stays. | extended |
| W4 audit (issue #2) | **Superseded by r5, section 14.2.** The r4 row named four titles without their suffix. The file holds none of them. Section 14.2 holds the exact titles. | Superseded by r5. | superseded |

Red result at this HEAD, from the r4 verification run:

- S1 set (r4 run): 6 failed, 3 passed. Cases 1, 2, 3, 4, 7, and 8 are red. Cases 5, 5b, and 6
  pass. **(r5)** With cases 9 and 9b the set holds 11 tests: 6 failed, 5 passed (section 14.3).
- W4 audit `-t 'post-W4 major lines'`: 4 failed and 4 passed. **(r5)** The failed titles are
  `eslint-config-next` (no lockfile entry), `eslint` and `@eslint/js` (9.39.5), and `next`
  (the key `node_modules/next` exists). Section 14.2 lists the exact titles.

**Durability contract for the W4 rewrite (R9).**

- The old security floor stays a minimum. A new floor is never lower.
- A version assertion admits the installed version. No range is `latest`, `*`, or empty.
- No `it(` or `expect(` line disappears unless it names a removed package.
- **S1/S2 split.** `eslint` and `@eslint/js` remain in the lockfile in S1, because the React
  ESLint plugins name them as peers. S1 therefore asserts manifest absence for both. S1
  asserts both manifest and lockfile absence for `eslint-config-next` and `next`. **(superseded
  by r6, section 14.2)** The r4 text said that S2 asserts lockfile absence for `eslint` and
  `@eslint/js` after it removes the ESLint plugins. S2 keeps the plugins, so S2 asserts the
  peer-only copies. A lockfile-absence check for `eslint` or `@eslint/js` cannot pass in S1 or
  in S2, and it is a wrong test.
- **(superseded by r5, section 14.2)** The r4 rule said that the four titles keep their text.
  Three of them cannot: they would claim a version line that the lockfile does not hold.
  Section 14.2 sets the replacement titles.

**Red commit shape.** `abbe15f1` stays the Red commit of the plan task. The new and extended
cases land as one follow-up Red commit on this HEAD, with the subject
`test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`. The `[~]` S1 Test
task stays `[~]` until Green closes it.

### 13.4 Risk register (r4), superseded by r5

The single risk table is section 6.1 (r5, section 14.5). Each id there has one meaning. The r4
numbering of this section is the kept numbering for R15 to R18. The r4 table of section 6.1
used R16 and R18 for other risks. Section 14.5 maps the old references.

### 13.5 Gate sequence (r4)

1. Commit the r4 strategy. Capture `phase_base_sha` immediately after that commit
   (section 4). Do not capture it before the commit.
2. Capture `baseline-m2` on the 6-app tree, in the order of section 13.2, before the first
   manifest change.
3. Capture the danielson build, the 4106 dev status, and the browser baseline of 4103, 4105,
   and 4106. The Red task does not start before these files exist.
4. Land the follow-up Red commit. Run the discovery check first.
5. Change the first manifest. Run `GATES_BASE=baseline-m2 lint s1`, `test s1`, and
   `checks-all s1` before each dependency commit.
6. Green: the full scripts suite exits 0, and the eight W4 tests of section 14.2 pass. Every phase gate with
   `GATES_BASE=baseline-m2` prints `NEWFAIL=0`.
7. Verify: `npm ci`; all gates with label `s1`; 6 builds; 6 dev statuses; browser smoke on 3
   apps; both bundle audits; the E2E run only when `baseline-m2` ran it; 6 build timings.

**The stashed commit C (`stash@{1}`).** Decision: abandon it. Do not apply it. The evidence:
it predates the merge, it holds no danielson file, and it touches
`scripts/audit/__tests__/in-range-wave-w3.test.ts`, which the merge and the r4 audit rewrite
also changed. An apply would mix two unverified audit edits in one commit. Green re-derives
the vitest 5 and jest-dom 7 work from the merged manifests, one major family per commit, with
the step-5 gates before each commit. Record the abandonment in evidence section 8. Keep the
stash object as a reference until the phase checkpoint.

### 13.6 Artifact checks (r4 counts)

- Build: 6 apps exit 0, danielson included. No build script exception.
- Dev status: 6 apps answer `/`. Danielson uses port 4106. `000` is a failure, not a status.
- Typecheck: 27 workspaces. `_template` is outside the architecture manifest, so it is not
  a typecheck gap (13.1).
- Browser smoke: 3 apps (IM3 4103, BM2 4105, danielson 4106). The danielson comparison is
  `ux-baseline-m2-danielson`.
- Evidence section 2 has one row for each of the 27 workspace folders.
- Evidence section 8 has one row for `apps/danielson`: its `vinext check` score, each issue,
  and the proof that no `next` declaration and no 0.0.55 vinext copy remain.
- The `latest` check sweeps 27 workspaces. `next`, `vinext 0.0.55`, `@vitejs/plugin-react
  ^6.0.0`, and `@types/node ^22` leave section 4 by the end of the phase.

### 13.7 Review gates (r4)

| Review | S1 | Constraint |
|--------|----|------------|
| Review A | applicable | The reviewer is not the Red author. Reads the diff of the gates, the tests, and the evidence. |
| Review B | applicable | The reviewer is not the Green implementer. Reads the lockfile diff, `npm audit` totals, install scripts, and each lockfile key that ends with `node_modules/vinext` or `node_modules/next`, with its owner. |
| Review C | applicable | Reads the `@math-platform/app-shell` peer change and the five shared packages that danielson now consumes. Independence: not the author of the manifest change. |
| Adversarial | applicable, mandatory | Tries to make `next` resolve again, to pass the probes with `any`, and to drop `apps/danielson` from a glob, a test list, or a gate. Independence: a third role, not the Red or Green author. |
| UX browser | applicable, mandatory | Runs 3 apps against `ux-baseline-m2-*`. Independence: not the Green implementer. |

R18 makes the adversarial review and the UX/browser review mandatory for S1. A "not
applicable" mark on either review is a review failure. The allowed outcome of a danielson
finding is never an exclusion. It is a PM decision (6.1, R18).

### 13.8 Plan amendments required

This role does not edit `plan.md`. The orchestrator applies these edits.

1. **S1 Baseline.** Add a task after `S1 Baseline (b8a0ec66)`: capture `baseline-m2` on the
   6-app tree with the three commands of 13.2, then the danielson build, the 4106 dev
   status, and the three-app browser capture. Commit subject
   `measure(vinext-oxc): record the 6-app S1 baseline`. Do not edit the closed 5-app line.
2. **Audit forward (issue #2).** Reopen the task `S1 Implement — move the audit suites
   forward (4173b71f)` for the eight W4 tests of section 14.2 (r5), with the durability contract and the
   S1/S2 split.
3. **S1 Implement.** Extend the manifest tasks for danielson: remove `next ^16.0.0` from
   `dependencies`, set `vinext ^1.4.5`, add `vinext/types` to tsconfig and remove the `next`
   plugin, move `@types/node ^22` to 24.x. Add danielson to `npx vinext check`, the build
   sweep, and the dev ports. Change `business-math-deploy.yml` `node-version: '22'` to
   `'24'` next to the two files of the current step.
4. **S2 layout.** The plan says one `.oxlintrc.json` for each of 25 linted workspaces. The
   merged tree has one root `.oxlintrc.json`, and every workspace lint script names
   `../../.oxlintrc.json`. Replace the 25-file layout with the single root config. The rule
   for the S2 cases is unchanged (6.1, R17).
5. **S1 Verify.** Change "all 5 apps pass `npm run build`" to 6 apps. Change "cases 1 to 6"
   to the r4 case set of 13.3.
6. **No phase SHA marker changes.** No plan line carries a SHA for S1. `phase_base_sha`
   lives in the run log and the role handoff only (section 4).

(r5) The orchestrator applied items 1 to 6 in `685b69c2`, except the points of section 14.8.

### 13.9 Anti-pattern coverage (r4)

| Phase | Anti-patterns | Defense and falsification |
|-------|---------------|---------------------------|
| S1 | A3 | Each version check parses the major as an integer from `package.json`. `NEWFAIL=<n>` and the audit counts are labeled integers. Falsifies when a digit-only or substring match passes a wrong version. |
| S1 | A4 | Case 2 has a precondition. Case 3, 7, and 8 have count and key-list sentinels. The discovery check rejects "No test files found". A removed script is a new failure. Falsifies when a filter or an empty set passes. |
| S1 | A5 | Each evidence claim names a log line at the same commit. The baseline commit comes first. The eight W4 tests of section 14.2 are green at the same commit that the evidence calls green. Falsifies when a claim has no command that exits 0. |
| S1 | A7 | `next` searches use anchored patterns, never the bare word. The new-failure compare uses keys, not workspace pass or fail. `APP_DIRS` is read from disk. Falsifies when a coarse filter hides a hit. |
| S1 | A9 | The test file reads nothing under `measure/tracks/`. Falsifies at closeout, when the folder moves. |
| S1 | A10 | The Docs task stages only the `routes.md` delta that S1 caused, after `npm run generate`. Falsifies when the stage includes unrelated generated drift. |
| S2 | A3, A4 | The oxlint file count is a labeled integer above 0. The per-config probe proves each config lints. Falsifies when a config lints no file. |
| S2 | A7 | The rule-gap allow-list names a file and a line. No bare-word filter. |
| S3 | A4, A5 | The collector self-check and the per-workspace probe loop. A conformance claim cites the same commit. |
| S4 | A4, A7 | The format-only file list equals the pre-format list. A second run is empty. |
| S5 | A5, A6, A7 | The A5 and A6 detectors run at closeout. The banned-string regex has path-based exclusions only. |
| S5 | A11, A12 | `bash tests/measure_orchestrator_audit.sh` stays in the `checks-all` gate. The AGENTS.md edit touches only the two guardrail lines. |
| All | A8 | Task markers move `[~]` then `[x]` with a SHA. The role gate reads them. |

## 14. Revision r5 (2026-11-17)

**Revision record.** An independent check of r4 (`spec-review-685b69c2.json`) failed it. It
found 2 blockers (F1, F2), 4 majors (F3 to F6), and 1 nit (F7). The orchestrator confirmed
the two blockers against the tree. r5 fixes all seven findings. This section wins when an
earlier rule disagrees with it. Superseded text carries the marker "superseded by r5".

### 14.1 Finding map

| Finding | Fix | Sections |
|---------|-----|----------|
| F1 blocker | The exact W4 titles (8 tests), the Red selector, the post-Green titles, and the JSON check. Case 9 and case 9b for `eslint` and `@eslint/js`. | 6.2, 6.4, 14.2 |
| F2 blocker | The workspace-set rule: the `s1` run against `baseline-m2` on 27 names. `gates.sh` enforces it. The pre-merge `baseline` folder is historical. | 2, 6.4, 7, 12, 14.4 |
| F3 major | One risk table, R1 to R20, in section 6.1. Section 13.4 keeps an id map only. | 6.1, 13.4, 14.5 |
| F4 major | Plan S2 rewritten for the single root `.oxlintrc.json`. | plan S2, 8, 14.6 |
| F5 major | The SHA leaves the plan phase note. Section 4 holds the r5 capture point. | plan, 4 |
| F6 major | One plan box for the follow-up Red commit. | plan S1 Test (Red), 14.3 |
| F7 nit | The danielson count is 62 lines, with 2 bare `next`. Section 14.7 holds the command. | 3, 6.1 (R18), 14.7 |

### 14.2 W4 audit contract (issue #2)

The file is `scripts/audit/__tests__/framework-wave-w4-audit.test.ts`. The describe (line 294)
is `framework-wave (W4) adversarial audit — W4 majors on post-W4 major lines (sanity)`. It holds
eight tests: seven from one loop (lines 305 to 315) and one `it` (line 317). The loop title is
`${pkg} installed lockfile version is on the ${expectedMajor}.x line (post-W4; vinext updated forward by S1)`.
The record `expectedPostW4Major` (lines 295 to 303) has seven entries. The r4 contract named four
titles without their suffix. The file holds none of them. `-t 'post-W4 major lines'` selects all
eight tests, not four.

| # | Exact title | At this HEAD | After Green |
|---|-------------|--------------|-------------|
| 1 | `vinext installed lockfile version is on the 1.x line (post-W4; vinext updated forward by S1)` | green (1.4.5) | unchanged |
| 2 | `vite installed lockfile version is on the 8.x line (post-W4; vinext updated forward by S1)` | green (8.3.8) | unchanged |
| 3 | `@vitejs/plugin-react installed lockfile version is on the 6.x line (post-W4; vinext updated forward by S1)` | green (6.3.0) | unchanged |
| 4 | `eslint-config-next installed lockfile version is on the 16.x line (post-W4; vinext updated forward by S1)` | **red**: no lockfile entry | replaced by title A |
| 5 | `typescript installed lockfile version is on the 6.x line (post-W4; vinext updated forward by S1)` | green (6.0.3) | unchanged |
| 6 | `eslint installed lockfile version is on the 10.x line (post-W4; vinext updated forward by S1)` | **red**: 9.39.5 | replaced by title B |
| 7 | `@eslint/js installed lockfile version is on the 10.x line (post-W4; vinext updated forward by S1)` | **red**: 9.39.5 | replaced by title C |
| 8 | `next installed lockfile version is absent (S1 removal supersedes the W4 16.x line)` | **red**: the key `node_modules/next` exists | unchanged text. It turns green when the danielson move removes the key. |

Replacement titles (Green copies them verbatim):

- A: `eslint-config-next is absent from every manifest and from the lockfile (S1 removal supersedes the W4 16.x line)`
- B: `eslint is absent from every manifest; the lockfile keeps only a peer copy (S1 supersedes the W4 10.x line)`
- C: `@eslint/js is absent from every manifest; the lockfile keeps only a peer copy (S1 supersedes the W4 10.x line)`

(r6) Titles B and C lose the words "until S2" of r5, because S2 keeps the peer copies (below).
The test body of B asserts two things: no manifest declares `eslint`, and the key
`node_modules/eslint`, when it exists, has `peer: true`. The test body of C does the same for
`@eslint/js`. Both hold at this HEAD.

The state at this HEAD comes from the lookup that the test uses (`installedVersion`), run in
`node -e`, and from the collect-only `vitest list`. The r4 verification run also recorded 4 failed.

**Why three titles change.** S1 cannot put `eslint` 10, `@eslint/js` 10, or `eslint-config-next`
16 in the lockfile. The root `devDependencies` hold `eslint-plugin-react` `^7.37.5` and
`eslint-plugin-react-hooks` `^7.1.1`. The peer range of `eslint-plugin-react` stops at `eslint`
`^9.7`. npm therefore installs `eslint` 9.39.5, `@eslint/js` 9.39.5, and `@eslint/eslintrc`
3.3.7 as peers (flags `dev` and `peer`). A title that claims the 10.x line would be false.

**Why S2 keeps the peer copies (r6).** The root `.oxlintrc.json` has three `jsPlugins`:
`eslint-js` (`oxlint-plugin-eslint`), `react-js` (`eslint-plugin-react`), and `react-hooks-js`
(`eslint-plugin-react-hooks`). Its 3 `overrides` for files under `apps/` enable 1 `react-js`
rule and 14 `react-hooks-js` rules. That is 45 rule entries. A removal of the two plugins
drops those rules, or leaves two `jsPlugins` specifiers without a package. Issue #2
condition 1 says to preserve the Oxlint migration. The lint track spec
(`eslint-to-oxlint-migration_20260820`, "Complete engine cutover", items 6 to 8) allows a
peer-only `eslint` package in `package-lock.json` and `node_modules`. That track is `[~]` in
`measure/tracks.md`.

**Selectors.** The collect-only command `npx --no-install vitest list <file> -t '<pattern>'`
printed the names above for each pattern below.

- All eight tests: `-t 'post-W4 major lines'`.
- The four red tests (titles 4, 6, 7, and 8):
  `-t '(eslint-config-next|eslint|@eslint/js) installed lockfile version is on the (16|10)\.x line|next installed lockfile version is absent'`
- The four guard tests (titles 1, 2, 3, and 5):
  `-t '(vinext|vite|@vitejs/plugin-react|typescript) installed lockfile version is on the [0-9]+\.x line'`

The red selector names the old titles. It applies at Red time only. No selector uses the bare
word `eslint`.

**Check (`W4_AUDIT_COMMAND`).** Run the vitest command of section 2, with `<stage>` set to `red`
or `green`. Then run:

```
node -e 'const r=require(require("path").resolve(process.argv[1])).testResults.flatMap(f=>f.assertionResults);
const by=s=>r.filter(a=>a.status===s);
console.log("w4_passed="+by("passed").length+" w4_failed="+by("failed").length);
console.log(by("passed").map(a=>a.title).sort().join("\n"))' measure/runs/vinext-oxc-toolchain_20261114/w4-audit-<stage>.json
```

Parse the two labeled integers (A3). Then compare the printed titles with the expected set. The
compare is a set equality, not a count.

- At Red: `w4_passed=4 w4_failed=4`. The passed set is titles 1, 2, 3, and 5.
- At Green: `w4_passed=8 w4_failed=0`. The passed set is titles 1, 2, 3, 5, 8, A, B, and C.
- A missing title, an extra title, or a changed text fails the check. A `-t` that matches no
  test gives `w4_passed=0` and fails (A4).

**Durability contract for the rewrite (R9, R20).**

- Titles 1, 2, 3, and 5 stay as they are. Their packages stay declared, and S1 moves none of
  their majors. The registry gives `@vitejs/plugin-react` 6.3.0 and `vite` 8.3.8 as latest. S3
  owns `typescript`. If an S1 move changes a major, Green changes the digit in the title and in
  the record in one commit, and lists the change in the handoff.
- A removed package gets an absence check, not a version check. `eslint-config-next` and `next`
  are absent from every manifest and from the lockfile. `eslint` and `@eslint/js` are absent
  from every manifest. The lockfile keeps `node_modules/eslint` and `node_modules/@eslint/js`
  as peer-only copies (`peer: true`), because the two React ESLint plugins stay (r6, below).
- The three absence tests stay in the same describe, so the same selector gives eight tests.
- No `it(` or `expect(` line disappears unless it names a removed package. The loop `it(`
  stays, because it serves titles 1, 2, 3, and 5.
- No range is `latest`, `*`, or empty. Green does not add `eslint` or `@eslint/js` to any
  manifest or to `overrides` to make an old title pass (R20). Case 9 enforces this.
- The old security floor stays a minimum for every package that a manifest still declares.

**W4 8/8 does not close issue #2 alone (r6).** The eight titles are one describe of one file.
Issue #2 has four completion conditions. (1) Preserve the Oxlint migration. (2) Replace
requirements for removed lint packages with absence checks where appropriate. (3) Keep version
floors for packages that stay required. (4) Run the W3 and W4 audit suites against the merged
lockfile. The eight titles cover conditions 2 and 3 for one describe. They cover neither
condition 1 nor condition 4. The evidence below was checked on 2026-11-17.

- The test at line 249 of the same file is not one of the eight. Its title is "every W4
  framework major installed lockfile version satisfies its w4-framework-targets.json
  target_version range". At `baseline-m2` it fails on the `next` guard (line 262). After the
  key `node_modules/next` leaves, it still fails. The loop reports `eslint-config-next` (no
  lockfile entry, target 16.0.0), `eslint` (9.39.5, target 10.0.0), and `@eslint/js` (9.39.5,
  target 10.0.0). The fixture `fixtures/w4-framework-targets.json` still lists the three. The
  issue text names this: "restores removed packages to `W4_TARGETS`". The fix goes in the
  loop, as the `next` branch shows. Green keeps the fixture entries. The sibling file counts
  them (`framework_families_count`, lines 195 to 206, and lines 224 to 243).
- The sibling file `framework-wave-w4.test.ts` has 35 tests. Six fail at `baseline-m2`. Five of
  the six name a removed package. They are at line 406 (`next`), line 434 (`eslint-config-next`),
  line 500 (`eslint`), line 528 (`@eslint/js`), and line 630. The test at line 630 is a sanity
  test: `eslint` 9.39.5 "must be past its pre-W4 major 9". The r5 plan box gave the titles at
  lines 434, 500, and 528, but it named the `-audit` file (section 15.3, Q2).
- `baseline-m2` has 24 failed audit tests in 5 files (`step-audit-suites.log`). `key()` in
  `gates.sh` keeps the `FAIL` and `AssertionError` lines, and `new_keys` compares them. The
  four sibling tests at lines 434, 500, 528, and 630 repeat their baseline keys while they
  stay red. `test s1` then gives `NEWFAIL=0`. The gate cannot close issue #2. Checks K1 to K5
  can.

Issue #2 closes when K1 to K5 hold at one commit. `<stage>` is `red` or `green`.

| # | Check | Command | At `baseline-m2` | Required at Green |
|---|-------|---------|------------------|-------------------|
| K1 | The 8 titles | `W4_AUDIT_COMMAND` and its parse | `w4_passed=4 w4_failed=4` | `w4_passed=8 w4_failed=0` |
| K2 | The whole file `framework-wave-w4-audit.test.ts` | The `W4_AUDIT_COMMAND` without `-t`, with `--outputFile=measure/runs/vinext-oxc-toolchain_20261114/w4-audit-file-<stage>.json`, and the same parse. `w4_passed + w4_failed` is the test count (A4). | 15 tests, 5 failed | at least 15 tests, `w4_failed=0` |
| K3 | The file `framework-wave-w4.test.ts` (Q2) | The same form, with the output file `w4-sibling-<stage>.json` | 35 tests, 6 failed | the only failed title, if any, is `@types/node: every workspace declaration shares a single major-version floor (W3 must hold; W4 must not re-introduce drift)`. At S1 Verify: `w4_failed=0`. |
| K4 | The Oxlint migration stays | The command below | not applicable | `jsplugins_changed=0` and `jsplugins_count` of 3 or more. In S1 also: `git diff <phase_base_sha> --name-only -- .oxlintrc.json` prints nothing. |
| K5 | No hidden residue | The `audit-suites` step of `test s1` | 24 failed | no failing key outside `baseline-m2`. Each remaining failure is in evidence section 10. |

K4 command. Run it from the repository root. `<phase_base_sha>` is the S1 value in S1 and the
S2 value in S2:

```
node -e 'const cp=require("child_process"),fs=require("fs");
const b=JSON.parse(cp.execSync("git show "+process.argv[1]+":.oxlintrc.json")).jsPlugins;
const n=JSON.parse(fs.readFileSync(".oxlintrc.json","utf8")).jsPlugins;
console.log("jsplugins_changed="+(JSON.stringify(b)===JSON.stringify(n)?0:1)+" jsplugins_count="+n.length)' <phase_base_sha>
```

Parse the two labeled integers (A3). At this HEAD the command prints
`jsplugins_changed=0 jsplugins_count=3`. S2 Verify repeats K1 to K4. S2 case 9 (section 8) is
the S2 part of the closure. The S2 refresh cannot drop it. No S2 case asserts lockfile absence
of `eslint` or `@eslint/js` (section 15.2).

### 14.3 Red commit shape and case set (F6)

The r5 case set is cases 1 to 9, with 5b and 9b. `RED_TEST_COMMAND` does not change. The S1
describe holds 9 tests at this HEAD (`vitest list`). After the follow-up Red commit it holds
11. Six must be red (1, 2, 3, 4, 7, 8). Five must be green guards (5, 5b, 6, 9, 9b). The W4
command gives 4 red and 4 green (section 14.2).

`abbe15f1` stays the Red commit of the plan task. One follow-up Red commit lands on top:
`test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`. It holds:

1. Cases 1 to 4 over `APP_DIRS`. The test reads `APP_DIRS` from the disk. The sentinel asserts
   `apps/danielson` in `APP_DIRS` and `APP_DIRS.length` at least 6.
2. Case 7 over the five workflow files, with the key-list sentinel and the step-count sentinels.
3. The nested-vinext rule of case 8.
4. Case 9 and case 9b (the issue #2 audit case).
5. Two guard cases for the `gates.sh` workspace-set rule, in
   `scripts/__tests__/vinext-oxc-gates-script.test.ts` (section 14.4).

Mid Red runs the discovery check first. The Red log holds the first failing line of each of the
six red S1 cases and of the four red W4 titles. The `[~]` S1 Test task stays `[~]` until Green
closes it.

### 14.4 Workspace-set rule (F2)

- **Comparison base.** The S1 base is `baseline-m2`. It holds 27 names: 6 apps and 21 packages.
  The pre-merge `gates/baseline/` folder holds 26 names and no `apps/danielson`. It is
  historical. No check compares `baseline` with `baseline-m2`. The r4 check did, and failed by
  design.
- **Gate side.** Before r5, the sweep visited the folders of the current tree only. A removed
  workspace, an added workspace that passes, and an unset `GATES_BASE` all gave `NEWFAIL=0`.
  Since r5, `sweep()` compares the workspace set of the run with the set of
  `$BASE/<script>.exit`. It prints `NEW FAILURE: <script> workspace set differs from the
  baseline: <names>`. The compare is skipped for a `baseline*` label (`is_record_only()`) and
  when the base exit file does not exist.
- **Orchestrator side.** The command of section 6.4 reads the files again. It prints
  `workspaces-<script>=27` four times. It is the independent confirmation.
- **Guard cases (Mid Red, follow-up Red commit).** Case 12 in
  `scripts/__tests__/vinext-oxc-gates-script.test.ts`: the base lists a workspace that the run
  lacks. The gate prints `NEWFAIL=1`, and the message names the workspace. Case 13: the run has
  a workspace that the base lacks. The gate prints `NEWFAIL=1`. The existing case 1 covers the
  missing base (`NEWFAIL=0`). Falsification: removing the r5 block of `sweep()` turns cases 12
  and 13 red.
- **Stale `s1` folder.** The folder `gates/s1/` holds the pre-merge S1 results of 2026-11-15
  (26 names). The role that runs the first r5 `s1` gate renames it to `gates/s1-premerge`
  first. The role does not delete it. Reason: `timing.txt` appends to the old file, and
  `GATES_RESUME=1` would reuse the old codes of 26 workspaces and run `apps/danielson` only.
  Never set `GATES_RESUME=1` for the first run of a label.

### 14.5 Risk ids (F3)

Section 6.1 holds the only risk table, R1 to R20. Each id has one meaning. The r4 numbering of
section 13.4 is the kept numbering for R15 to R18. The plan cites "strategy R17" (S2) and
"strategy R18" (S1 danielson box). Both citations stay valid. R19 and R20 are new in r5.

| Old reference | Old meaning or defect | Now |
|---------------|-----------------------|-----|
| r4 section 6.1, R16 | the danielson API surface | R18 |
| r4 section 6.1, R18 | the baseline comparison on the wrong tree | R19 |
| r4 section 6.1, R17 text "section 13.8, item 9" | no such item | section 13.8, item 4 |
| r4 section 3 text "section 13.4, R16" | wrong id (R16 is the nested vinext copy) | section 6.1, R18 |
| r4 section 13.7 text "13.4, R18" | the table moved | section 6.1, R18 |

### 14.6 Lint layout (F4)

The tree has one root `.oxlintrc.json` (29,955 bytes). It is the only tracked ESLint or oxlint
config file. No `eslint.config.*` file is tracked. 26 of the 27 workspace lint scripts name
`../../.oxlintrc.json`. The 6 apps use `oxlint --config ../../.oxlintrc.json . --max-warnings 0`.
The 20 packages use `oxlint --config ../../.oxlintrc.json src --max-warnings 0`.
`packages/_template` runs an `echo` line. No manifest declares `eslint`, `typescript-eslint`,
`eslint-config-next`, `@eslint/js`, or `@eslint/eslintrc`.

- R17 now means that no second lint config appears and that each lint script keeps the root
  target. The r4 clause "fails when a workspace config and the root config disagree about one
  rule" has nothing to compare, because no workspace config exists. The S2 case 8 of section 8
  replaces it.
- The plan S2 is rewritten for this layout (F4). The boxes that created, copied, or migrated
  per-workspace configs are gone.
- Open (section 14.8): the ESLint "before" lint timing cannot run, because no ESLint config
  remains. The plan S3 boxes that name `-c .oxlintrc.json` need the same fix at the S3 refresh.

### 14.7 Facts behind r5 (checked 2026-11-17)

| Fact | Evidence |
|------|----------|
| 27 workspace folders (6 apps, 21 packages) and 28 manifests | The root `workspaces` field is `["apps/*","packages/*"]`. `ls -d apps/* packages/*` lists 27 folders. A `node -e` scan read 28 manifests. |
| `gates/baseline/*.exit` has 26 names. `gates/baseline-m2/*.exit` has 27. The only difference is `apps/danielson`. | `awk '{print $1}' <file>`, then `sort -u`, then `wc -l`, for the four exit files of each folder. `diff` of the two `lint.exit` name lists. |
| The describe holds 8 W4 tests. At this HEAD 4 are red and 4 are green. | `vitest list` with `-t 'post-W4 major lines'`. The lockfile lookup of the test, in `node -e`. File lines 294 to 317. |
| No manifest declares the ESLint family. The only declaration in the family is `apps/danielson/package.json` `dependencies.next` `^16.0.0`. | `node -e` scan of 28 manifests over the 5 dependency maps. |
| The lockfile has `eslint` 9.39.5, `@eslint/js` 9.39.5, and `@eslint/eslintrc` 3.3.7 (flags `dev`, `peer`). It has no `typescript-eslint` and no `eslint-config-next`. No workspace entry lists `eslint` or `@eslint/js`. | `node -e` on `package-lock.json`. The peer owners are `eslint-plugin-react` 7.37.5, `eslint-plugin-react-hooks` 7.1.1, and `@eslint-community/eslint-utils` 4.9.1. The root `devDependencies` declare the two plugins. |
| Danielson: `next` `^16.0.0`, `vinext` `^0.0.55`, `@types/node` `^22`, tsconfig `plugins: [{"name":"next"}]` and `types: ["vitest/globals"]`, no `vite.config.*`. Its vitest config has no `next/*` alias. The 5 other apps have it. | `apps/danielson/package.json` and `tsconfig.json`. `ls apps/danielson/vite.config.*` fails. `grep -L "vinext/shims" apps/*/vitest.config.ts` prints only danielson. |
| Danielson has 62 `next` import lines in 55 files: 24 `next/link`, 23 `next/navigation`, 9 `next/server`, 3 `next/headers`, 1 `next/image`, 2 `next` (`app/layout.tsx:1`, `next.config.ts:1`). It also has 13 `vi.mock('next/...')` lines in 11 files. | The command below. The mock lines come from the same file list with the pattern `vi.mock('next`. |
| The workflows are 5 files. `setup-node` steps: `ci.yml` 7, `business-math-deploy.yml` 1, `cloudflare-deploy.yml` 1, `scale-benchmarks.yml` 1, `jsdoc-typed-params.yml` 0. The only non-24 major is `business-math-deploy.yml:24` (`'22'`). `scale-benchmarks.yml:25` is `'24.4.0'`. | `grep -n node-version .github/workflows/*.yml`. `grep -c actions/setup-node` for each file. |
| The lockfile keys that end `node_modules/vinext` are `node_modules/vinext` (1.4.5) and `apps/danielson/node_modules/vinext` (0.0.55). The key `node_modules/next` exists. | `node -e` on `package-lock.json`. |
| 26 lint scripts name `../../.oxlintrc.json`. `packages/_template` runs `echo`. | `node -e` over 27 manifests. |
| The registry on 2026-11-17: `vinext` 1.4.6, `oxlint` 1.94.0, `@vitejs/plugin-react` 6.3.0, `vite` 8.3.8. The root range is `oxlint ^1.79.0`. | `npm view <package> dist-tags.latest`. |
| With the r4 `gates.sh`, a removed workspace, an added workspace, and an unset `GATES_BASE` give `NEWFAIL=0`. With the r5 copy they give `NEWFAIL=1`. | A hand harness in a temp folder, run on the `git show HEAD:` copy and on the r5 copy. The 11-case regression test passes before and after. `bash -n` passes. |
| Only `.gitignore`, `README.md`, and `outputs/` changed outside `measure/` from `3e141e05` to `b23bfb74`. | `git diff --name-only 3e141e05 HEAD`, with the paths `measure/` and `outputs/` removed. |

The danielson count command (run in `apps/danielson`):

```
git ls-files -z -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' '*.mts' '*.cts' | xargs -0 grep -nE "from ['\"]next(/[A-Za-z0-9_./-]+)?['\"]" > /tmp/dan-next-from.txt
wc -l < /tmp/dan-next-from.txt                          # 62 lines
cut -d: -f1 /tmp/dan-next-from.txt | sort -u | wc -l    # 55 files
sed -E "s/.*from ['\"](next[^'\"]*)['\"].*/\1/" /tmp/dan-next-from.txt | sort | uniq -c
```

### 14.8 Plan changes and open items

The r5 commit changes `plan.md` for F4 to F6 only: the S2 boxes (F4), the phase note without a
SHA (F5), and the follow-up Red box in the S1 Test (Red) task (F6). The S1 Baseline (6 apps)
task stays `[~]` with its boxes unticked.

Open items for the orchestrator. The r5 plan scope excludes them:

1. (Done in r6.) The S1 audit-forward box cites section 14.2 and the closure checks K1 to
   K5. It no longer repeats the four prefix titles.
2. The danielson sub-boxes of S1 Implement have no box for the `next/*` alias in
   `apps/danielson/vitest.config.ts` (R4). The 5 other apps have it (62f3fa60).
3. The closed "update all other dependencies" task predates the merge. The danielson ranges and
   the root `oxlint ^1.79.0` need a second `npm outdated` pass after the danielson move (R8).
4. The S2 "before" lint timing cannot run, because no ESLint config remains. The S2 refresh
   decides how to fill it, and evidence section 6.
5. The S3 Contract boxes that name `-c .oxlintrc.json` use the old layout (section 14.6).
6. (Done in r6.) The S1 Verify box names the cases of section 6.2, up to case 9b, and the
   closure checks of section 14.2.
7. (r6) A box in the plan task S1 Test (Red) holds the step: rename `gates/s1` to
   `gates/s1-premerge` before the first r5 `s1` gate (section 14.4). This role did not run
   the `mv`.

### 14.9 Anti-pattern coverage (r5 additions)

| Phase | Anti-patterns | Defense and falsification |
|-------|---------------|---------------------------|
| S1 | A3 | The W4 check parses the JSON `status` field and prints `w4_passed=<n>` and `w4_failed=<n>`. The workspace-set check prints `workspaces-<script>=<n>`. Falsifies when a bare digit or a substring passes a wrong count. |
| S1 | A4 | Case 9b seeds a fault, so case 9 cannot pass vacuously. The W4 check compares sets: a `-t` that matches no test gives `w4_passed=0` and fails. The workspace-set check fails on a missing name. |
| S1 | A5 | Each title and count of section 14.2 comes from `vitest list` output and file lines. Each risk id has one meaning. Falsifies when a section names a title that the file lacks. |
| S1 | A7 | The W4 selectors name the package and the fixed phrase. They never use the bare word `eslint`. `vitest list` showed 4 matches for each selector. |
| S1 | A10 | The capture rule names the three kinds of generated drift. Any other entry stops the capture. |

## 15. Revision r6 (2026-11-17)

**Revision record.** A second independent check of r5 (`strategy-r5-check-3cef6c6f.md`) gave
PASS WITH FIXES: 0 blockers, 4 majors (F8 to F11), and 3 minors (F12 to F14). It also rated
the open items of section 14.8. r6 fixes the seven findings and adds the plan box of item 7.
This section wins when an earlier rule disagrees with it.

### 15.1 Finding map

| Finding | Fix | Sections |
|---------|-----|----------|
| F8 major | Step 3 of section 6.3 cites section 14.3 for the follow-up Red commit. | 6.3 |
| F9 major | Case 9 checks only the workspace manifests. It asserts nothing about lockfile keys that start with `node_modules/`. | 6.2 |
| F10 major | The plan audit-forward box cites section 14.2: the 8 titles, the closure checks K1 to K5, and the peer-only rule. | plan S1, 14.2 |
| F11 major | Section 14.2 states that 8/8 does not close issue #2, and lists K1 to K5. S2 case 9 (peer-only) replaces the S2 lockfile-absence row. | 2, 6.4, 6.7, 8, 13.3, 14.2, plan S2 |
| F12 minor | The plan Verify box names the cases of section 6.2 (1 to 9, with 5b and 9b). | plan S1 Verify |
| F13 minor | Section 3 and section 13.8 item 4 cite section 6.1. The plan baseline box cites sections 6.4 and 14.4. | 3, 13.8, plan S1 Baseline |
| F14 minor | The count of 11 tests belongs to the time after the follow-up Red commit. The describe holds 9 tests at this HEAD. | 6.2, 14.3 |
| Item 7 | A plan box in S1 Test (Red) renames `gates/s1` to `gates/s1-premerge`. This role did not run the `mv`. | 14.8, plan S1 Test |

Derived edits. No finding names them. Each follows from a finding:

- Section 4 moves the capture point to the r6 commit. The r5 commit `3cef6c6f` predates the fixes.
- Titles B and C of section 14.2 lose "until S2" (the F11 decision, section 15.2).
- Sections 2, 6.4, and 6.7 name the closure checks, so that a Green gate cannot pass on 8/8 alone.
- Section 13.3 marks the r4 S1/S2 split bullet as superseded. Section 14.8 marks items 1, 6, and 7 as done.

### 15.2 F11 decision: what closes issue #2

Issue #2 (`gh issue view 2 --json body`, state OPEN) lists four completion conditions (section
14.2). `spec.md` has no text about issue #2. The decision rests on these facts, checked on
2026-11-17:

| Fact | Evidence |
|------|----------|
| The root `.oxlintrc.json` has the `jsPlugins` `oxlint-plugin-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`. | `node -e` parse of the file. |
| 3 `overrides` for files under `apps/` enable `react-js/no-deprecated` and 14 `react-hooks-js/*` rules. That is 45 entries, and none is `off`. | The same parse. |
| The lockfile keeps `node_modules/eslint` 9.39.5, `node_modules/@eslint/js` 9.39.5, and `node_modules/@eslint/eslintrc` 3.3.7. Each has the flags `dev` and `peer`. | `node -e` on `package-lock.json`. |
| The lockfile entries that list `eslint` in `peerDependencies` are `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `@eslint-community/eslint-utils`. | The same scan, over all entries. |
| The keys `node_modules/eslint-config-next` and `node_modules/typescript-eslint` do not exist. | The same scan. |
| The lint track spec allows a peer-only `eslint` package in the lockfile and in `node_modules`. It cannot be a root manifest dependency or override. | `measure/tracks/eslint-to-oxlint-migration_20260820/spec.md`, "Complete engine cutover", items 6 to 9. |
| `baseline-m2` has 24 failed audit tests. `framework-wave-w4-audit.test.ts` has 15 tests and 5 failed. `framework-wave-w4.test.ts` has 35 tests and 6 failed. | `gates/baseline-m2/step-audit-suites.log`, and `vitest list` (15 and 35). |
| After the key `node_modules/next` leaves, the loop at line 249 reports 3 offenders. | The test lookup and `semver.satisfies`, run in `node -e` on the lockfile and the fixture. |
| Only `apps/danielson/package.json` declares `next`. | `grep -ln '"next"'` over the manifests. |
| The S1 describe holds 9 tests at this HEAD. | `vitest list --config scripts/vitest.config.ts -t 'S1 vinext 1.x'`. |
| `gates/` holds `baseline`, `baseline-m2`, and `s1`. `gates/s1/lint.exit` has 26 names. `gates/s1-premerge` does not exist. | `ls` and `awk`. |

**Decision.** Closure does not need a removal of the React ESLint plugins. The removal would
break issue #2 condition 1. A lockfile-absence case for `eslint` and `@eslint/js` cannot pass,
and it is a wrong test. S2 case 9 takes its place: the copies stay peer-only, and each
`jsPlugins` specifier has a lockfile key. The open part of issue #2 is in S1: the
self-consistency test and the sibling file. Checks K2 to K5 of section 14.2 cover it.

### 15.3 Open questions for the orchestrator (defaults applied)

- **Q1.** Does the PM want the two React ESLint plugins removed? Default: no. S2 keeps them and
  asserts the peer-only copies. A removal needs a change of `jsPlugins` and the loss of 45 rule
  entries. That is a lint-behavior change, outside S1 and S2.
- **Q2.** Is `framework-wave-w4.test.ts` in the scope of issue #2? Default: yes. Check K3 and
  the plan audit-forward box then cover its five tests that name a removed package. If the
  answer is no, delete K3 and its plan box. Record the five failures in evidence section 10.
  The registry then says that issue #2 closed for `framework-wave-w4-audit.test.ts` only.

### 15.4 Anti-pattern coverage (r6 additions)

| Phase | Anti-patterns | Defense and falsification |
|-------|---------------|---------------------------|
| S1 | A3 | K2 and K3 parse the labeled integers `w4_passed` and `w4_failed`. K4 prints `jsplugins_changed=<n> jsplugins_count=<n>`. Falsifies when a bare digit passes a wrong count. |
| S1 | A4 | K2 needs at least 15 tests, so a file that loses its tests, or a `-t` that matches nothing, fails. K4 needs a count of 3 or more, so two missing lists cannot compare equal. |
| S1 | A5 | The words "issue #2 closed" need K1 to K5 at one commit. The A5 and A6 detectors at closeout reject a registry or plan claim of closure on 8/8 alone. |
| S1, S2 | A7 | The K4 compare reads the parsed `jsPlugins` array, not a text line. No bare-word filter. |
| S2 | A4 | S2 case 9b seeds one fault for each clause of S2 case 9 in memory, and expects three hits. Case 9 cannot pass vacuously. |
