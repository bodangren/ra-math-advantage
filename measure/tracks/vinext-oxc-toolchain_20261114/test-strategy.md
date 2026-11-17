# Test Strategy: vinext-oxc-toolchain_20261114

Track: `vinext-oxc-toolchain_20261114` (Chore, 5 phases S1 to S5)
Strategy revision: r4 (2026-11-17), `role_base_sha` f9aff7d0b50fc04ffde4a0dd25040ceb700533b4.
Scope of revision r4: six apps and 27 workspace folders (section 13 records what changed).
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

## 3. Phase classification and review gates

| Phase | Risk | Review A | Review B | Review C | Adversarial | UX browser |
|-------|------|----------|----------|----------|-------------|------------|
| S1 | critical | applicable | applicable | applicable | applicable | applicable |
| S2 | medium | applicable | not applicable | not applicable | applicable | not applicable |
| S3 | high | applicable | applicable | not applicable | applicable | not applicable |
| S4 | medium | applicable | not applicable | not applicable | not applicable | not applicable |
| S5 | medium | applicable | applicable | applicable | applicable | not applicable |

S1 was `high` in r1 to r3. It is now `critical`. Reason: the tree holds two framework
lines. Five apps run vinext 1.x; `apps/danielson` runs Next 16 with vinext 0.0.55, 61
`next/*` import lines (24 link, 23 navigation, 9 server, 3 headers, 1 image, 1 next), no
`vite.config.ts`, and its own route handlers. The pre-merge baseline
does not describe this tree. One phase must carry the runtime change of an app that never
ran on vinext, a second baseline capture, and the audit-suite rewrite.

Reasons, one for each cell group:

- **Review A (all phases):** each phase changes the gates that later phases trust. A wrong
  gate hides every later fault.
- **Review B, S1:** every dependency moves, with major versions, a new lockfile, and new
  native packages. Review B reads the lockfile diff, the `npm audit` totals, and the install
  scripts. **Mandatory for the danielson risk (section 13.4):** the reviewer also reads each
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
  never an exclusion. It is a PM decision (section 13.4, R16).
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

## 4. `phase_base_sha` capture

`role_base_sha` f9aff7d0 predates this strategy (r4). Do not use it as `phase_base_sha`.
The Red commit `abbe15f1` also predates this strategy and predates the merged tree. Do not
use it either. No SHA in this file is the capture point.

1. The r4 strategy commit lands first: `measure(strategy): revise the S1 test strategy for
   the 6-app merged tree`. It holds `test-strategy.md` and `gates.sh` only.
2. **Captured point.** Immediately after that commit, before any other commit, run
   `git status --porcelain`. The tree must be empty. `measure/runs/` is gitignored, so the
   log and the gate output do not appear. Any other entry stops the capture. (Was: one entry
   ` M measure/generated/routes.md` was allowed. The tree is clean at f9aff7d0 and the r4
   work touches no generated file, so the allowance is removed.)
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S1 in the run log
   `measure/runs/vinext-oxc-toolchain_20261114/strategy-f9aff7d0.log` and in the role
   handoff. Do not write it into `plan.md` or `spec.md`: no plan line carries a SHA marker
   for this phase, and the run log is the durable record.
4. Capture it before the first S1 task commit: before the baseline re-capture, before the
   follow-up Red commit, and before the first manifest change. The Red and Green role gates
   use it as the baseline.
5. A `phase_base_sha` that is not a descendant of the r4 strategy commit is invalid. Stop
   and report.

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

| Id | Risk | Test or gate that fails if the risk is real |
|----|------|---------------------------------------------|
| R1 | `next` still resolves (hoisted by another package, a nested `node_modules`, or a lockfile entry) | Cases 2, 3, 8. Gate step `next-absent` (`npm ls next --all` prints `(empty)`). |
| R2 | `vinext` is not on 1.x for some workspace (a peer, an override, or a nested copy) | Case 1. **(extended in r4)** Case 8 asserts that the only lockfile key that ends with `node_modules/vinext` is `node_modules/vinext`. The merged lockfile has `apps/danielson/node_modules/vinext` at 0.0.55. Gate: `npm ls vinext --all`. |
| R3 | `next/*` types do not resolve, or resolve to `any` | Cases 4, 5, 5b, 6. Typecheck sweep over all workspaces. |
| R4 | Vitest cannot resolve `next/*` at runtime. The vitest configs do not use the vinext plugin. | Test sweep. A log line that matches `Failed to resolve import "next` is a new failure. |
| R5 | A build fails or changes after the Vite, plugin, or React moves | Build sweep over the 6 apps. Both bundle audits. `npx vinext check` in each app, danielson included. |
| R6 | A build passes and the runtime fails (RSC, hydration, middleware) | Dev server `/` status for each app. Browser smoke (section 6.5), danielson included. |
| R7 | A new failure hides inside a pre-existing failure | Key comparison by workspace, file, and code (section 7). Not a workspace-level compare. |
| R8 | A "held package" is not held, or "latest" is not the latest | Evidence section 4 check (section 6.4). `npm outdated --json` per workspace. |
| R9 | The audit suites move forward by loosening or deleting assertions | Review A diff check (section 6.4). The audit suites pass. The r4 rewrite contract is section 13.3. |
| R10 | The lockfile does not match the manifests, or install flags hide a conflict | `npm ci` at S1 Verify. `git diff <phase_base_sha> --name-only -- .npmrc` is empty. No `--force`, no `--legacy-peer-deps` in the log. |
| R11 | CI keeps a Node version below 24, or a workflow has no `setup-node` step | Case 7, which now reads all five workflow files (section 13.3). `node scripts/validate-ci.mjs`. |
| R12 | A build leaves an untracked folder | `git status --porcelain` after the build sweep. |
| R13 | The evidence file claims a result with no log | Section 6.4 checks. The baseline commit comes before the first manifest change. |
| R14 | A local-only file changes a result (for example a stale `next-env.d.ts` with `/// <reference types="next" />`) | Clean-worktree cross-check (section 6.6). |
| R15 | A second framework line stays in the tree (`apps/danielson` on Next 16 and vinext 0.0.55) after S1 claims the move | Cases 1, 2, 3, 4, and 8 through `APP_DIRS`, plus the `APP_DIRS` sentinel of section 13.3. The claim "all apps on vinext 1.x" is false while any of them is red. |
| R16 | The Next 16 API surface of danielson does not match the vinext 1.x shims: a route handler, `next/headers`, `next/server`, a server action, or a middleware file behaves differently | Dev status and browser smoke on danielson (section 6.5), `npx vinext check` on danielson, and the danielson rows of evidence section 8. **Escalation:** when the shim does not cover an API that danielson uses, the phase stops for a PM decision. No app is ever excluded from a glob, a test, or a gate to make the phase pass. A decision is a recorded disposition (port the call, hold the phase, or move danielson to its own track), never a silent skip. |
| R17 | Daniel's root `.oxlintrc.json` becomes a second lint-config owner before S2 (29 KB, added by the merge; the workspace lint scripts point at `../../.oxlintrc.json`) | S1 does not touch lint configs. The S2 case set reads each lint script and its `--config` target, and fails when a workspace config and the root config disagree about the same rule. The plan amendment list records the S2 layout correction (section 13.8, item 9). |
| R18 | The baseline comparison uses the pre-merge `gates/baseline/` files, so a 6-app phase is compared with a 5-app record | `GATES_BASE=baseline-m2` for every phase gate (section 2). The workspace-set check of section 6.4 fails when a workspace is in one baseline only. |

### 6.2 Red tests (the plan cases, with strategy additions)

The plan defines the original case set (cases 1 to 6). The r4 case set is cases 1 to 8. It
extends cases 1, 2, 3, and 4 to `apps/danielson`. It extends case 7 to all five workflow
files and case 8 to the nested vinext key. This strategy changes or adds the items marked
**(added)** or **extended**. Revision r4 adds the danielson coverage and the workflow-file
sentinel. The "Change" column says whether r4 changed the case. Section 13.3 holds the Red
commit shape.

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

**`js-yaml` for case 7.** In r1 to r3 `js-yaml` was only a transitive dependency (through
`@eslint/eslintrc`, which S2 removed), so Green added it to the root `devDependencies`.
**r4: the merged root already has `js-yaml ^5.5.0` in `devDependencies`.** The merge made it
a direct dependency of `scripts/validate-ci.mjs`. Green records it in evidence section 3 as
already present. Green makes no manifest change for it. Case 7 must still pass after S2.

Red expectation at this HEAD: cases 1, 2, 3, 4, 7, and 8 fail on the assertion. Cases 5, 5b,
and 6 pass, because the root has vinext 1.4.5 (section 13.3). The plan said "confirm cases 1
to 4" for the original Red commit `abbe15f1`. The r4 Red run must confirm all six failing
cases and record each first failing line. A passing case 5, 5b, or 6 is not a defect; Mid Red
records it as a green guard.

Red commit shape (r4). `abbe15f1` stays the Red commit of the plan task. The six first cases
and their Red log stay as they are. The r4 changes (the sentinels, case 7's five files, case
8's nested-vinext rule) land as **one follow-up Red commit** on this HEAD:
`test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`. The `[~]` S1 Test
task stays `[~]` until Green closes it. Green marks `[x]` only when the six cases and the
three guards pass.

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
   base, and no role deletes them. Mid Red records the workspace set of both folders.
   A workspace that is in one baseline and absent in the other is a new failure (section 7).
2. **S1 Baseline browser capture (Mid Red, `agent-browser` skill).** Run it on the merged
   tree before the first package change. Capture one screenshot, one accessibility
   snapshot, and the console error list for `http://localhost:4103/` (IM3),
   `http://localhost:4105/` (BM2), and `http://localhost:4106/` (danielson). Save them in
   `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-m2-*`. The UX role compares with
   them. The Red task does not start before the files exist. The danielson capture is new:
   record its first redirect or status (for example a redirect to a login route), because a
   login gate is a baseline fact and not a finding.
3. **S1 Test (Red) task (Mid Red):** `RED_TEST_COMMAND` fails on the six named cases. Run
   the discovery check first. Land the follow-up Red commit (section 13.3).
4. **After the vinext commit (Jr Green):** run the typecheck and test sweeps for all
   workspaces. Search the test logs:
   `grep -l 'Failed to resolve import "next' measure/runs/vinext-oxc-toolchain_20261114/gates/<label>/test-*.log`
   must print nothing.
5. **After each dependency commit (Jr Green):** `GATES_BASE=baseline-m2 bash
   measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint s1`, `test s1`,
   `checks-all s1`. The plan requires all gates before each commit.
6. **Green (Jr Green):** `GREEN_TEST_COMMAND` exits 0 (all S1 cases and the older scripts
   suite). The audit suites pass for the rewritten W4 titles (section 13.3).
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
- **Baseline-set check (r4, A4).** Compare the workspace sets of the two baselines. The
  workspace name is the first field of each line of a `.exit` file:
  `for l in baseline baseline-m2; do awk '{print $1}' measure/runs/vinext-oxc-toolchain_20261114/gates/$l/lint.exit | sort -u; done`
  must give the same 27 names for both labels. A workspace in one set and not in the other
  is a new failure. The same compare runs for `test.exit`, `typecheck.exit`, and
  `build.exit`, because a missing script is a different failure from a missing folder.
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
  **r4:** the W4 rewrite follows the contract of section 13.3. The orchestrator also runs
  `npx --no-install vitest run scripts/audit/__tests__/framework-wave-w4-audit.test.ts -t 'post-W4 major lines'`
  and requires exit 0 with the four titles of section 13.3 green.
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
  print `NEWFAIL=0`.
- **Closeout gate (phase acceptance):** the Green gate; `npm ci` succeeded; 6 builds exit 0;
  the next-absent step is 0; the dev status matches the baseline; the browser smoke matches
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
- A tsrs or oxlint diagnostic that comes only from a compiler-version difference is not a
  code fault. The implementer records it in the compiler-version table of evidence
  section 7 and does not edit code for it (spec-review F4, declined as Nit; this strategy
  applies the rule to the S3 gate).

## 8. Phases S2 to S5

### S2: ESLint to oxlint (risk: medium)

| Risk | Defense |
|------|---------|
| A config lints no file, or a rule is off | Plan cases 4 and 5. **(added)** Case 6: a loop over each `.oxlintrc.json` runs the unused-variable probe. Each config gives a non-zero exit with `no-unused-vars`. A config that the old ESLint file also left without that rule goes in a named allow-list with the old file line as the reason. |
| Zero warnings by blanket disable | **(added)** Case 7: no source file under `apps/` or `packages/` has `/* oxlint-disable` (block form). Each `oxlint-disable-next-line` has ` -- ` and a reason. |
| Oxlint reads no file | Each lint log has a labeled count `on <n> files`. Parse `<n>`. It is above 0 (A3, A4). |
| Findings fixed with a behavior change | `fix(lint)` commit diff goes to Review A with the question "does any change alter behavior". The test, typecheck, and build sweeps show no new failure. |
| Rule gap not recorded | Orchestrator check: each rule in the `--details` output of the migration appears in evidence section 6 (A5). |
| `eslint` family left in a manifest or lockfile | Plan case 1. **(added)** `package-lock.json` has no `node_modules/eslint` key. |

Gates: `RED_TEST_COMMAND` filter `S2 oxlint`. `PROJECT_LINT` must print `NEWFAIL=0` and every
workspace lint script exits 0 with zero warnings (the sweep covers the 27 workspace folders;
section 13.1). Closeout also needs `lint` timings
in section 5 and the section 6 and section 8 entries.

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

## 13. Revision r4 (2026-11-17)

**Revision record.** Revisions r1 to r3 described a five-app tree on vinext 0.0.55. They
counted 25 workspace folders and 26 manifests. They set the comparison base to the pre-merge
`gates/baseline/` folder. The merge `2b2d9952` of `origin/master` `2e353ef9` (1130 commits)
changed that tree. It added `apps/danielson` on Next 16 with vinext 0.0.55. It added a 29 KB
root `.oxlintrc.json`. It changed the audit suites. r4 supersedes the r1 to r3 counts, case
set, baseline label, and lint layout. Sections 1 to 12 carry the r4 amendments. This section
records the revision, the new baseline, the Red change list, the risks, the gates, the review
gates, the plan amendments, and the anti-pattern coverage.

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
- A workspace present in one baseline and absent in the other is a new failure (section 6.4,
  "Baseline-set check"). The compare runs for `lint.exit`, `test.exit`, `typecheck.exit`, and
  `build.exit`.
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
| W4 audit (issue #2) | These four titles pass: `eslint-config-next installed lockfile version is on the 16.x line`, `eslint installed lockfile version is on the 10.x line`, `@eslint/js installed lockfile version is on the 10.x line`, `next installed lockfile version is absent`. | Any title is red, or a title disappears from the file. | new |

Red result at this HEAD, from the r4 verification run:

- S1 set: 6 failed, 3 passed. Cases 1, 2, 3, 4, 7, and 8 are red. Cases 5, 5b, and 6 pass.
- W4 audit `-t 'post-W4 major lines'`: 4 failed. `eslint` and `@eslint/js` report 9.39.5.

**Durability contract for the W4 rewrite (R9).**

- The old security floor stays a minimum. A new floor is never lower.
- A version assertion admits the installed version. No range is `latest`, `*`, or empty.
- No `it(` or `expect(` line disappears unless it names a removed package.
- **S1/S2 split.** `eslint` and `@eslint/js` remain in the lockfile in S1, because the React
  ESLint plugins name them as peers. S1 therefore asserts manifest absence for both. S1
  asserts both manifest and lockfile absence for `eslint-config-next` and `next`. S2 asserts
  lockfile absence for `eslint` and `@eslint/js` after it removes the ESLint plugins. A
  lockfile-absence check for `eslint` or `@eslint/js` in S1 cannot pass and is a wrong test.
- The four titles keep their text. A rename is a contract change and needs a plan line.

**Red commit shape.** `abbe15f1` stays the Red commit of the plan task. The new and extended
cases land as one follow-up Red commit on this HEAD, with the subject
`test(vinext-oxc): extend the S1 gate tests for the 6-app tree (Red)`. The `[~]` S1 Test
task stays `[~]` until Green closes it.

### 13.4 Risk register (r4)

The ids are the r4 ids. Section 6.1 uses the earlier numbering for two rows (its R16 is the
danielson API surface and its R18 is the baseline comparison). Where an id and a text
disagree, the text of this table wins.

| Id | Risk | Defending test or gate |
|----|------|------------------------|
| R15 | A second framework line stays in the tree: `apps/danielson` on Next 16 and vinext 0.0.55 after S1 claims the move. | Cases 1, 2, 3, 4, and 8 through `APP_DIRS`; the `APP_DIRS` sentinel; `npm ls next --all` prints `(empty)`; `npm ls vinext --all` names one version. The claim "all apps on vinext 1.x" is false while any case is red. |
| R16 | The nested `apps/danielson/node_modules/vinext` 0.0.55 copy stays in the lockfile and shadows the root 1.4.5 at runtime. | Case 8: the only key that ends with `node_modules/vinext` is `node_modules/vinext`. Review B names the owner of each such lockfile key. Dev status on 4106 proves the loaded runtime. |
| R17 | Daniel's root `.oxlintrc.json` (29,955 bytes) becomes a second lint-config owner before S2. Every workspace lint script points at `../../.oxlintrc.json`. | S1 touches no lint config. The S2 case set reads each lint script and its `--config` target, and fails when a workspace config and the root config disagree about one rule. The S2 layout correction is 13.8 item 4. |
| R18 | Danielson's Next 16 API surface does not match the vinext 1.x shims: 61 `next/*` import lines (24 link, 23 navigation, 9 server, 3 headers, 1 image, 1 next), route handlers, server actions. | Dev status and browser smoke on 4106; `npx vinext check` on danielson; the danielson rows of evidence section 8. **Escalation:** when a shim does not cover an API that danielson uses, the phase stops for a PM decision. No app is excluded from any glob, test, or gate. A decision is a recorded disposition: port the call, hold the phase, or move danielson to its own track. |

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
6. Green: the full scripts suite exits 0, and the four W4 titles pass. Every phase gate with
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
finding is never an exclusion. It is a PM decision (13.4, R18).

### 13.8 Plan amendments required

This role does not edit `plan.md`. The orchestrator applies these edits.

1. **S1 Baseline.** Add a task after `S1 Baseline (b8a0ec66)`: capture `baseline-m2` on the
   6-app tree with the three commands of 13.2, then the danielson build, the 4106 dev
   status, and the three-app browser capture. Commit subject
   `measure(vinext-oxc): record the 6-app S1 baseline`. Do not edit the closed 5-app line.
2. **Audit forward (issue #2).** Reopen the task `S1 Implement — move the audit suites
   forward (4173b71f)` for the four W4 titles of 13.3, with the durability contract and the
   S1/S2 split.
3. **S1 Implement.** Extend the manifest tasks for danielson: remove `next ^16.0.0` from
   `dependencies`, set `vinext ^1.4.5`, add `vinext/types` to tsconfig and remove the `next`
   plugin, move `@types/node ^22` to 24.x. Add danielson to `npx vinext check`, the build
   sweep, and the dev ports. Change `business-math-deploy.yml` `node-version: '22'` to
   `'24'` next to the two files of the current step.
4. **S2 layout.** The plan says one `.oxlintrc.json` for each of 25 linted workspaces. The
   merged tree has one root `.oxlintrc.json`, and every workspace lint script names
   `../../.oxlintrc.json`. Replace the 25-file layout with the single root config. The rule
   for the S2 cases is unchanged (13.4, R17).
5. **S1 Verify.** Change "all 5 apps pass `npm run build`" to 6 apps. Change "cases 1 to 6"
   to the r4 case set of 13.3.
6. **No phase SHA marker changes.** No plan line carries a SHA for S1. `phase_base_sha`
   lives in the run log and the role handoff only (section 4).

### 13.9 Anti-pattern coverage (r4)

| Phase | Anti-patterns | Defense and falsification |
|-------|---------------|---------------------------|
| S1 | A3 | Each version check parses the major as an integer from `package.json`. `NEWFAIL=<n>` and the audit counts are labeled integers. Falsifies when a digit-only or substring match passes a wrong version. |
| S1 | A4 | Case 2 has a precondition. Case 3, 7, and 8 have count and key-list sentinels. The discovery check rejects "No test files found". A removed script is a new failure. Falsifies when a filter or an empty set passes. |
| S1 | A5 | Each evidence claim names a log line at the same commit. The baseline commit comes first. The four W4 titles are green at the same commit that the evidence calls green. Falsifies when a claim has no command that exits 0. |
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

