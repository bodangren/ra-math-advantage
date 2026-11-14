# Test Strategy: vinext-oxc-toolchain_20261114

Track: `vinext-oxc-toolchain_20261114` (Chore, 5 phases S1 to S5)
Strategy revision: `role_base_sha` 2a6a0ba512f56f9ed43e386ec787145bcda6741c
Detail level: S1 has full detail. S2 to S5 have the risks, the Red commands, and the gates.
Refresh this file at the start of each later phase if the plan changed.

## 1. What this strategy proves

This track changes the build tool, the lint tool, the type checker, and the formatter. It
changes no app behavior. A test on app behavior therefore proves nothing new. The proof is
in three kinds of evidence:

1. **Gate sweeps.** Each gate runs in each workspace. The result is compared with the
   baseline by workspace, file, and diagnostic code (spec "New failure").
2. **Probe tests.** A probe is a small file with a known fault. Each new tool must reject
   each probe for the named reason. This proves the gate is not vacuous.
3. **Live runs.** Five apps build. Five dev servers answer. Two apps render in a browser.

Artifact and document checks (the evidence file, the Measure notes, the YAML text) are
supporting evidence only. A document test proves that a text exists. It does not prove
that the tool works (lessons-learned 2026-06-24). Each document check in this file has a
live complement.

## 2. Gate values (all phases)

`<label>` is `baseline` for the S1 Baseline task, and `s1` to `s5` for the phase gates.
The orchestrator copies the script of section 12 to `/tmp/oxc-gates/gates.sh` before the
first use. The script is not part of the repository.

| Variable | S1 value |
|----------|----------|
| `RED_TEST_COMMAND` | `npx vitest run --config scripts/vitest.config.ts -t 'S1 vinext 1.x'` |
| `GREEN_TEST_COMMAND` | `npx vitest run --config scripts/vitest.config.ts` |
| `PROJECT_LINT` | `bash /tmp/oxc-gates/gates.sh lint s1` |
| `PROJECT_CHECKS` | `$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh bash /tmp/oxc-gates/gates.sh checks-all s1` |
| `PROJECT_TESTS` | `$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh bash /tmp/oxc-gates/gates.sh test s1` |
| `UX_REQUIRED` | `always` |
| `PROJECT_DEV_URL` | `http://localhost:4103` (IM3). The second URL is `http://localhost:4105` (BM2). |

For S2 to S5, change only the label and the `-t` filter:

| Phase | `RED_TEST_COMMAND` filter | Label | `UX_REQUIRED` |
|-------|---------------------------|-------|---------------|
| S2 | `-t 'S2 oxlint'` | `s2` | `never` |
| S3 | `-t 'S3 tsrs'` | `s3` | `never` |
| S4 | `-t 'S4 oxfmt'` | `s4` | `never` |
| S5 | `-t 'S5 gate rules'` | `s5` | `never` |

`GREEN_TEST_COMMAND` stays the full scripts suite in each phase.
From S4, `PROJECT_LINT` is `npm run format:check && bash /tmp/oxc-gates/gates.sh lint <label>`.
From S5, the gates also run through the root scripts: `npm run format:check`,
`npm run lint`, and `npm run typecheck` (section 8).

Why `UX_REQUIRED` is not `auto`: the auto rule reads the changed paths with prefixes for
another layout (`app/src/`). S1 changes only config paths, yet it swaps the runtime of all
5 apps. The explicit value avoids a wrong skip.

What the gates mean:

- The `lint`, `test`, and `checks-all` gates exit 0 only when `NEWFAIL=0`. The last output
  line is the labeled integer `NEWFAIL=<n>`. Parse that integer. Do not match any digit.
- A pre-existing failure does not make the aggregate green. The gate compares the
  diagnostic keys with the baseline (section 7).
- Every heavy run goes through `heavy-run.sh`, one at a time. Run `slot check` before each
  role start.

## 3. Phase classification and review gates

| Phase | Risk | Review A | Review B | Review C | Adversarial | UX browser |
|-------|------|----------|----------|----------|-------------|------------|
| S1 | high | applicable | applicable | applicable | applicable | applicable |
| S2 | medium | applicable | not applicable | not applicable | applicable | not applicable |
| S3 | high | applicable | applicable | not applicable | applicable | not applicable |
| S4 | medium | applicable | not applicable | not applicable | not applicable | not applicable |
| S5 | medium | applicable | applicable | applicable | applicable | not applicable |

Reasons, one for each cell group:

- **Review A (all phases):** each phase changes the gates that later phases trust. A wrong
  gate hides every later fault.
- **Review B, S1:** every dependency moves, with major versions, a new lockfile, and new
  native packages. Review B reads the lockfile diff, the `npm audit` totals, and the install
  scripts.
- **Review B, S2 and S4:** the change is a lint config, or one exact-version formatter and
  one format commit. No trust boundary changes. The Review A lockfile check is enough.
- **Review B, S3:** tsrs is a 0.x prerelease with a native binary. `npx --yes` runs a
  prerelease compiler from the npx cache. Review B checks the source and the pins.
- **Review B, S5:** the phase edits CI. Review B checks that the removed `deploy` job leaves
  no secret exposure, no `workflow_dispatch` loss, and no new `pull_request_target` use.
- **Review C, S1:** the peer dependency of the shared package `@math-platform/app-shell`
  changes from `next` to `vinext`. That is a public package contract.
- **Review C, S5:** the root script names (`lint`, `typecheck`, `format`, `format:check`)
  are an interface. Later tracks read them (`kst-v32-runtime` and `math-graph-consume` plans).
- **Review C, S2, S3, S4:** the script names do not change. No user or API surface changes.
- **Adversarial, S1:** attack surface is a false-green. The reviewer tries to make `next`
  resolve again, and tries to pass the probes with `any` types.
- **Adversarial, S2:** the reviewer tries a lint config that lints no file, or a blanket
  disable comment.
- **Adversarial, S3:** this is the highest false-green risk. A type gate that finds nothing
  looks the same as a clean repository.
- **Adversarial, S4:** not applicable. Idempotence, the ignore list, and the same-gates sweep
  are deterministic checks (section 9). No input class remains to attack.
- **Adversarial, S5:** the reviewer tries to bypass the banned-string checks with other
  spellings of `tsc` and `eslint` in scripts and workflows.
- **UX browser, S1:** the runtime of all 5 apps changes, and a build does not prove a
  render. Other phases change no runtime.

## 4. `phase_base_sha` capture

`role_base_sha` 2a6a0ba5 predates this strategy. Do not use it as `phase_base_sha`.

1. The strategy commit lands first (`measure(strategy): Test strategy for vinext-oxc-toolchain`).
2. After that commit, run `git status --porcelain`. The only allowed entry is
   ` M measure/generated/routes.md`. Any other entry stops the capture.
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S1.
4. Capture it before the first S1 task commit (S1 Contract). The Red and Green role gates
   use it as the baseline.

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
- **No `typescript` import in the test file.** S3 removes the package. Read tsconfig files
  with a comment-stripping JSON parse.
- **No read under `measure/tracks/`.** Closeout moves the folder (A9). The evidence file is
  checked by the orchestrator script of section 6.4, not by vitest.
- **Resolve from the test file.** Use `fileURLToPath(import.meta.url)` for `REPO_ROOT`.
- **Temp files.** Probes use `fs.mkdtempSync` in `os.tmpdir()` and delete the folder in
  `afterEach`. A probe never writes in a workspace.
- **Timeout.** 120000 ms for each test that starts a tool.

## 6. Phase S1: Package refresh and vinext 1.x

Risk: **high**. Build tool, framework line, and every dependency change in one phase.

### 6.1 Risks and the tests that defend each

| Id | Risk | Test or gate that fails if the risk is real |
|----|------|---------------------------------------------|
| R1 | `next` still resolves (hoisted by another package, a nested `node_modules`, or a lockfile entry) | Cases 2, 3, 8. Gate step `next-absent` (`npm ls next --all` prints `(empty)`). |
| R2 | `vinext` is not on 1.x for some workspace (a peer, an override, or a nested copy) | Case 1. Gate: `npm ls vinext --all` shows one version, 1.x. |
| R3 | `next/*` types do not resolve, or resolve to `any` | Cases 4, 5, 5b, 6. Typecheck sweep over all workspaces. |
| R4 | Vitest cannot resolve `next/*` at runtime. The vitest configs do not use the vinext plugin. | Test sweep. A log line that matches `Failed to resolve import "next` is a new failure. |
| R5 | A build fails or changes after the Vite, plugin, or React moves | Build sweep over the 5 apps. Both bundle audits. `npx vinext check` per app. |
| R6 | A build passes and the runtime fails (RSC, hydration, middleware) | Dev server `/` status per app. Browser smoke (section 6.5). |
| R7 | A new failure hides inside a pre-existing failure | Key comparison by workspace, file, and code (section 7). Not a workspace-level compare. |
| R8 | A "held package" is not held, or "latest" is not the latest | Evidence section 4 check (section 6.4). `npm outdated --json` per workspace. |
| R9 | The audit suites move forward by loosening or deleting assertions | Review A diff check (section 6.4). The audit suites pass. |
| R10 | The lockfile does not match the manifests, or install flags hide a conflict | `npm ci` at S1 Verify. `git diff <phase_base_sha> --name-only -- .npmrc` is empty. No `--force`, no `--legacy-peer-deps` in the log. |
| R11 | CI keeps Node 20, or a workflow has no `setup-node` step | Case 7. `node scripts/validate-ci.mjs`. |
| R12 | A build leaves an untracked folder | `git status --porcelain` after the build sweep. |
| R13 | The evidence file claims a result with no log | Section 6.4 checks. The baseline commit comes before the first manifest change. |
| R14 | A local-only file changes a result (for example a stale `next-env.d.ts` with `/// <reference types="next" />`) | Clean-worktree cross-check (section 6.6). |

### 6.2 Red tests (the plan cases, with strategy additions)

The plan defines cases 1 to 6. This strategy changes or adds the items marked **(added)**.

| Case | Assertion | Falsification condition |
|------|-----------|-------------------------|
| 1 | `vinext/package.json` resolves from the root, from each `apps/*` folder, and from `packages/app-shell`. Each `version` has major 1 (parse the first dot field as an integer). **(extended)** | Fails when one folder resolves a 0.x copy. A regex for any digit does not count (A3). |
| 2 | Precondition in the same test: `vinext/package.json` resolves. Then `next/package.json` throws from the root, each app folder, and `packages/app-shell`. **(paired)** | Without the precondition, a missing `node_modules` passes case 2. The precondition removes that vacuous pass (A4). |
| 3 | No manifest in the root, `apps/*`, or `packages/*` declares `next`. The scan covers `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, and `overrides`, and goes into nested override objects. A sentinel asserts that the scan read the manifests of `apps/integrated-math-3` and `packages/app-shell`. | Fails when one declaration remains. The sentinel fails when the glob finds no manifest. |
| 4 | Each app `tsconfig.json` and `packages/app-shell/tsconfig.json` has `vinext/types` in `compilerOptions.types`. The `{ "name": "next" }` plugin entry is gone. **(extended)** | Fails when the plugin entry stays. |
| 5 | The probe imports `NextConfig` from `next`, `Link` from `next/link`, and `useRouter` from `next/navigation`. `tsc -p` exits 0. | Fails at Red because `vinext/types` does not exist on 0.0.55. |
| 5b **(added)** | The same project with `<Link />` (no `href`) and `useRouter().push(123)`. `tsc -p` exits non-zero. The output has `TS2741` or `TS2345`. | Proves the types are real. If the types were `any`, case 5 passes and case 5b fails. If the vinext types accept both, Mid Red records the fact and chooses another strict member of the same types. |
| 6 | The probe with `import x from "next/does-not-exist"` exits non-zero. The output has `TS2307` and the text `next/does-not-exist`. The output has no `TS2688`. **(strengthened)** | At Red the unresolved `vinext/types` gives `TS2688`. Without the `TS2688` rule, case 6 passes for the wrong reason. |
| 7 **(added)** | The YAML of each file in `.github/workflows/` is parsed with `js-yaml` (root dependency). Each `actions/setup-node` step has a `node-version` with major 24. A sentinel asserts that `ci.yml` and `cloudflare-deploy.yml` each have at least one such step. | Covers the S1 criterion "Node 24". The plan has no case for it. Fails at Red (`'20'`). |
| 8 **(added)** | `package-lock.json` has no key in `packages` that ends with `node_modules/next`. No `packages["apps/<app>"]` entry lists `next` in its dependency maps. | Fails at Red. Closes the case where a manifest is clean and the lockfile still pins `next`. |

Red expectation: cases 1 to 4, 7, and 8 fail on the assertion. Cases 5, 5b, and 6 also fail
at Red, because `vinext/types` does not resolve on 0.0.55. The plan says to confirm cases 1
to 4. The extra red cases are not a defect. Mid Red records each case as red or green with
the first failing line.

Mid Red scope note: the plan makes Mid Red edit `scripts/vitest.config.ts`. The `role-gate`
check lists a path as non-test when it is not a `*.test.ts` file and not under `__tests__/`.
The orchestrator accepts `scripts/vitest.config.ts` as the one planned test-config file.
Record this as a deviation in the handoff. Do not change the plan for it.

### 6.3 Gate sequence for S1

Run in this order. Stop at the first failure that is not a baseline failure.

1. **Baseline task (packages unchanged, `node_modules` from `npm ci`):**
   `bash /tmp/oxc-gates/gates.sh lint baseline`, then `test baseline`, then
   `checks-all baseline`, all under `heavy-run.sh` where heavy. Then the bundle audits, the
   E2E run, and the dev-server status checks of the plan.
   The `baseline` label records only. The files in `/tmp/oxc-gates/baseline/` are the
   comparison base. Copy the failing set to evidence section 10 (the durable record).
2. **Baseline browser capture (added).** On vinext 0.0.55, before the first package change,
   capture one screenshot, one accessibility snapshot, and the console error list for
   `http://localhost:4103/` and `http://localhost:4105/`. Save them in
   `measure/runs/vinext-oxc-toolchain_20261114/ux-baseline-*`. The UX role compares with
   them.
3. **Red:** `RED_TEST_COMMAND` fails on the named cases. Run the discovery check first.
4. **After the vinext commit:** run typecheck and test sweeps for all workspaces. Search the
   test logs: `grep -l 'Failed to resolve import "next' /tmp/oxc-gates/<label>/test-*.log`
   must print nothing.
5. **After each dependency commit:** `bash /tmp/oxc-gates/gates.sh lint s1`,
   `test s1`, `checks-all s1`. The plan requires all gates before each commit.
6. **Green:** `GREEN_TEST_COMMAND` exits 0 (all S1 cases and the older scripts suite).
7. **Verify task:** `npm ci` (through `heavy-run.sh`), then all gates with label `s1`, both
   bundle audits, the dev-server status checks, the E2E run when the baseline ran it, then
   the build timing.

### 6.4 Artifact checks (the orchestrator runs these; they are not vitest cases)

Each check is a command with an exit code. The label S1 evidence file path is
`measure/tracks/vinext-oxc-toolchain_20261114/oxc-evidence.md`.

- **Heading check.** `grep -n '^## ' <evidence>` lists the 11 sections in the order of spec
  "Evidence File Contract". A missing or reordered heading fails.
- **Content check (S1).** Sections 1, 2, 3, 5, and 10 each hold at least one table row
  after the header row. A row with only `TBD`, `-`, or `(empty)` does not count (A4).
  Section 4 may be empty only when `npm outdated --json` is empty for every workspace
  apart from `typescript` and the ESLint family.
- **Order check (A5).** `git log --format='%h %s' -- measure/tracks/vinext-oxc-toolchain_20261114/oxc-evidence.md package.json apps packages`
  shows `measure(vinext-oxc): record the S1 baseline` before the first manifest change.
- **Held-package check.** Each row of section 4 names a failing gate and a first error line.
  The orchestrator finds that line in the log of `/tmp/oxc-gates/` or in the command output
  copied to the row. A held package without a line fails the review.
- **Latest check.** For each workspace, `npm outdated --json --workspace=<ws>` lists only
  packages in section 4, plus `typescript`, `eslint`, `@eslint/js`, `@eslint/eslintrc`,
  `typescript-eslint`, `eslint-config-next`, and `@types/node` above 24.x.
- **Audit-suite diff check.** `git diff <phase_base_sha> -- scripts/audit/__tests__`:
  no `it(` or `expect(` line disappears unless it names a removed package. The assertion
  that replaces a version pin admits the installed version. No range is `latest`, `*`,
  or empty. The old security floor stays a minimum (lessons-learned 2026-06-07).
- **Manifest check.** `git diff <phase_base_sha> --name-only` has one `package-lock.json` at
  the root only, and no `.npmrc`.
- **Marker check.** `git grep -n 'planned: vinext-oxc-toolchain_20261114'` still finds the
  README and tech-stack lines in S1. The marker stays until S5 (section 10).

### 6.5 Live behavior proofs

- **Build.** `npm run build --workspace=apps/<app>` exits 0 for IM1, IM2, IM3, PreCalc,
  and BM2. Run them one at a time under `heavy-run.sh`. After the sweep, `git status
  --porcelain` has no untracked entry except ignored paths (R12).
- **Dev status.** For each app, start `setsid npx vinext dev --port <port>` in the app
  folder (4101 to 4105). Poll `curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/`
  every 2 s for 90 s. Code `000` means no server: that is a failure, not a status. Compare
  the status with the baseline. Stop the process group and confirm the port is free.
- **Browser smoke (`UX_REQUIRED=always`).** On `http://localhost:4103/` and
  `http://localhost:4105/`, load the page, take a snapshot, list the console errors, and
  follow one internal link. The result must match the baseline capture: same visible
  headline, same console errors, no new hydration or module error. A new console error is
  a finding. These apps need Convex for data. The comparison is relative to the baseline,
  so a baseline error that comes from a missing backend is not a finding.
- **Bundle audits.** `npm run bundle-size:audit --prefix apps/integrated-math-3` and
  `npm run bundle:audit --workspace=apps/bus-math-v2`. Do not change a budget. A budget
  failure stops the phase (plan "S1 Verify").
- **E2E.** Run `npm run test:e2e --prefix apps/integrated-math-3` only when the baseline
  ran it. Compare the failing test titles with the baseline.
- **Typecheck.** `tsc` (6.0.3 in S1) over all 25 workspaces, and `apps/bus-math-v2` through
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
- **Closeout gate (phase acceptance):** the Green gate; `npm ci` succeeded; 5 builds exit 0;
  the next-absent step is 0; the dev status matches the baseline; the browser smoke matches
  the baseline; the bundle audits pass; evidence sections 1 to 5, 8, and 10 have content;
  section 11 may stay empty until S5; `npm run generate` and `npm run doctor` exit 0.
- **Docs task note (A10).** The working tree has an uncommitted `measure/generated/routes.md`
  from another machine. Before `npm run generate`, run
  `git diff measure/generated/routes.md > /tmp/oxc-gates/routes-before.patch`. After the run,
  stage the file only when the new diff differs from that patch for a reason of this phase.
  Never run `git checkout -- measure/generated/routes.md`.

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
one of the 25 lint scripts exits 0 with zero warnings. Closeout also needs `lint` timings
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

## 12. Gate script (copy to `/tmp/oxc-gates/gates.sh`; not in the repository)

The script uses the baseline files in `/tmp/oxc-gates/baseline/` when the label is not
`baseline`. It was checked with `bash -n` and with `has_script`. It was not run on the
workspaces, because `node_modules` does not exist in the repository yet.

```bash
#!/usr/bin/env bash
# gates.sh <lint|test|checks-all> <label>
# Records each result under /tmp/oxc-gates/<label>.
# The label "baseline" only records. Any other label compares with the baseline.
set -u
REPO=/home/daniebo/Desktop/ra-math-advantage
cd "$REPO" || exit 2
export CI=true
GATE=${1:?gate}
LABEL=${2:?label}
OUT=/tmp/oxc-gates/$LABEL
BASE=/tmp/oxc-gates/baseline
mkdir -p "$OUT"
MUST_PASS=" next-absent "
newfail=0

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$PWD/$1/package.json" "$2"
}

# Diagnostic keys of one log: line and column numbers and timings removed.
key() {
  grep -E 'TS[0-9]+|error|ERROR|FAIL|AssertionError|Failed to resolve|[0-9] (warning|error)' "$1" 2>/dev/null |
    sed -E 's/\([0-9]+,[0-9]+\)//g; s/:[0-9]+:[0-9]+//g; s/ in [0-9.]+ ?m?s//g; s/[0-9.]+ ?m?s( |$)/\1/g' | sort -u
}

# A new failure: no baseline failure, or a diagnostic key that the baseline log lacks.
new_keys() { # $1 baseline log, $2 current log
  [ -f "$1" ] || return 0
  [ -n "$(comm -13 <(key "$1") <(key "$2"))" ]
}

base_code() { # $1 exit file, $2 name
  awk -v n="$2" '$1==n{print $2}' "$1" 2>/dev/null
}

sweep() { # $1 script name
  local s=$1 ws name code bc
  : > "$OUT/$s.exit"
  for ws in apps/* packages/*; do
    name=$(basename "$ws")
    if has_script "$ws" "$s"; then
      npm run "$s" --workspace="$ws" > "$OUT/$s-$name.log" 2>&1
      code=$?
    else
      code=n/a
    fi
    echo "$ws $code" >> "$OUT/$s.exit"
    [ "$LABEL" = baseline ] && continue
    bc=$(base_code "$BASE/$s.exit" "$ws")
    if [ "$code" = n/a ] && [ -n "$bc" ] && [ "$bc" != n/a ]; then
      echo "NEW FAILURE: $s script removed in $ws"; newfail=1
    elif [ "$code" != 0 ] && [ "$code" != n/a ]; then
      if [ "${bc:-x}" = 0 ] || [ "${bc:-x}" = n/a ] || [ "${bc:-x}" = x ]; then
        echo "NEW FAILURE: $s $ws exit $code"; newfail=1
      elif new_keys "$BASE/$s-$name.log" "$OUT/$s-$name.log"; then
        echo "NEW FAILURE: $s $ws has a new diagnostic"; newfail=1
      fi
    fi
  done
  if [ "$(grep -vc ' n/a$' "$OUT/$s.exit")" -eq 0 ]; then
    echo "NEW FAILURE: $s ran in no workspace"; newfail=1
  fi
}

step() { # $1 name, rest: command
  local n=$1 c bc
  shift
  "$@" > "$OUT/step-$n.log" 2>&1
  c=$?
  echo "$n $c" >> "$OUT/$GATE.steps"
  [ "$LABEL" = baseline ] && return
  bc=$(base_code "$BASE/$GATE.steps" "$n")
  if [ "$c" != 0 ]; then
    if [ "${bc:-x}" = 0 ] || [ "${bc:-x}" = x ] || [[ "$MUST_PASS" == *" $n "* ]]; then
      echo "NEW FAILURE: step $n exit $c"; newfail=1
    elif new_keys "$BASE/step-$n.log" "$OUT/step-$n.log"; then
      echo "NEW FAILURE: step $n has a new diagnostic"; newfail=1
    fi
  fi
}

audit_step() {
  npm audit --json > "$OUT/audit.json" 2>/dev/null
  node -e 'const m=(require(process.argv[1]).metadata||{}).vulnerabilities||{};console.log(`critical=${m.critical||0} high=${m.high||0} moderate=${m.moderate||0} low=${m.low||0}`)' "$OUT/audit.json" > "$OUT/audit.txt" 2>&1
  echo "audit: $(cat "$OUT/audit.txt")"
  [ "$LABEL" = baseline ] && return
  local f c b
  for f in critical high; do
    c=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$OUT/audit.txt")
    b=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$BASE/audit.txt")
    if [ -z "$c" ] || [ -z "$b" ]; then echo "NEW FAILURE: audit $f count not parsed"; newfail=1
    elif [ "$c" -gt "$b" ]; then echo "NEW FAILURE: audit $f $b -> $c"; newfail=1; fi
  done
}

case "$GATE" in
  lint) sweep lint ;;
  test)
    sweep test
    : > "$OUT/test.steps"
    step scripts-suite npx vitest run --config scripts/vitest.config.ts
    step audit-suites npx vitest run scripts/audit/__tests__
    ;;
  checks-all)
    : > "$OUT/checks-all.steps"
    sweep typecheck
    if ! has_script apps/bus-math-v2 typecheck; then
      step typecheck-bm2 npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json
    fi
    step boundary node scripts/check-monorepo-boundaries.mjs
    step ci-check node scripts/validate-ci.mjs
    step tree npm ls --workspaces --depth=0
    step next-absent bash -c "npm ls next --all 2>&1 | grep -q '(empty)'"
    step measure-contract bash tests/measure_orchestrator_audit.sh
    audit_step
    sweep build
    ;;
  *) echo "unknown gate $GATE"; exit 2 ;;
esac
echo "NEWFAIL=$newfail"
[ "$LABEL" = baseline ] && exit 0
exit "$newfail"
```
