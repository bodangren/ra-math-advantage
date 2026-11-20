# Test Strategy: openrouter-sdk-ai-layer_20261114

Track: `openrouter-sdk-ai-layer_20261114` (Chore, 4 phases S1 to S4).
Strategy revision: r1 (2026-11-20). Scope: Phase S1 only. Refresh this file at the start
of each later phase. A later section wins when an earlier rule disagrees with it.
Role base SHA `bce9613ae515114a552cba65ba16d9ebe6d466a6` predates this strategy. It is
not the `phase_base_sha`. Section 11 gives the capture point.

## 1. What this phase proves

S1 replaces the plain `fetch` transport of `packages/ai-tutoring` with `@openrouter/sdk`.
The package behavior must stay the same. The proof has two parts:

1. **Behavior tests.** Provider cases 1 to 6 and the two route tests run with mocks.
   The workerd probe runs the package inside workerd against a local mock server.
2. **Gate sweeps.** Each gate runs on the start commit and after the change. The result
   is compared by diagnostic key, not by workspace level (section 5).

Artifact and document checks are supporting evidence only. An evidence heading, a
tech-stack row, or a YAML step proves that text exists. It does not prove that the SDK
works. Each artifact check in this strategy has a live complement (section 7).

## 2. Risk and applicable roles

S1 risk: **high**. Reason: a new ESM-only dependency enters a Worker runtime, the
transport is rewritten, retry and abort behavior must not drift, and the workerd probe
can fail for runtime reasons that unit tests cannot see. The phase also adds a CI step.

| Role | Applicable | Reason |
|------|-----------|--------|
| Review A | yes | The Red cases and the gate comparison must be falsifiable. A weak gate hides every later phase. |
| Review B | yes | `@openrouter/sdk` and `zod` are new dependencies. Read the lockfile diff, the install scripts, `RUNTIMES.md`, and the `npm audit` report. No other dependency change is allowed. |
| Review C | yes | The exported surface of `packages/ai-tutoring/src/index.ts` is a package contract. The CI `packages` job is an interface. Verify both stay intact apart from the planned CI step. |
| Adversarial testing | yes | Try to make the suite pass without a real SDK call: a mock that ignores arguments, a leftover `fetch`, a dropped case, or a probe that answers from a path that bypasses the SDK. |
| UX browser review | no | S1 changes no page, component, or route rendering. The two route tests assert the HTTP response and the outbound request. The workerd probe proves the runtime. No browser state exists to compare. |

## 3. Test commands

`<ws>` is one of `packages/ai-tutoring`, `packages/practice-core`,
`apps/integrated-math-3`, and `apps/bus-math-v2` (plan "Gate Commands").

| Name | Value |
|------|-------|
| `RED_TEST_COMMAND` | `CI=true npm run test --workspace=packages/ai-tutoring -- -t 'SDK transport'` |
| `GREEN_TEST_COMMAND` | `CI=true npm run test --workspace=packages/ai-tutoring && CI=true npm run test --workspace=apps/bus-math-v2 && CI=true npm run test --workspace=apps/integrated-math-3` |
| `PROJECT_LINT` | `npm run format:check`; then `npm run lint --workspace=<ws>` for each `<ws>` |
| `PROJECT_TESTS` | `CI=true npm run test --workspace=<ws>` for each `<ws>`; then `npx vitest run --config scripts/vitest.config.ts`; then `npx vitest run scripts/audit/__tests__` |
| `PROJECT_CHECKS` | `npm run typecheck --workspace=<ws>` for each `<ws>`; then the steps of section 4 |

Run each command through the capture of section 5. RED targets the new describe only.
GREEN adds the two route SDK tests and keeps every existing test.

The RED command needs the installed SDK, because the new test imports it. The plan runs
the S1 Install task before the S1 Test (Red) task. A RED failure of type `Cannot find
module '@openrouter/sdk'` is invalid. Record the first failing assertion line of each
case. The describe holds exactly 6 cases (A4).

## 4. Phase gate commands and capture

All gate commands below are verified against the current tree (2026-11-20).

```
# PROJECT_LINT
npm run format:check
npm run lint --workspace=packages/ai-tutoring
npm run lint --workspace=packages/practice-core
npm run lint --workspace=apps/integrated-math-3
npm run lint --workspace=apps/bus-math-v2

# PROJECT_TESTS
CI=true npm run test --workspace=packages/ai-tutoring
CI=true npm run test --workspace=packages/practice-core
CI=true npm run test --workspace=apps/integrated-math-3
CI=true npm run test --workspace=apps/bus-math-v2
npx vitest run --config scripts/vitest.config.ts
npx vitest run scripts/audit/__tests__

# PROJECT_CHECKS (remaining steps)
npm run typecheck --workspace=packages/ai-tutoring
npm run typecheck --workspace=packages/practice-core
npm run typecheck --workspace=apps/integrated-math-3
npm run typecheck --workspace=apps/bus-math-v2
node scripts/check-monorepo-boundaries.mjs
node scripts/validate-ci.mjs
npm ls --workspaces --depth=0
npm audit --json
npm run build --workspace=apps/integrated-math-3
npm run build --workspace=apps/bus-math-v2
npm run bundle-size:audit --prefix apps/integrated-math-3
npm run bundle:audit --workspace=apps/bus-math-v2
npm run test:workerd --workspace=packages/ai-tutoring
```

The last command exists only after the plan task that creates it (finding F2). Before
that task, record it as pending and do not count it as a pass.

**Capture wrapper.** Label `L` is `baseline` at the start commit and `s1` at each
phase gate. Store artifacts under
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/<L>/` (gitignored). For each
command `C` with a unique name `n`:

```
C >measure/runs/openrouter-sdk-ai-layer_20261114/gates/<L>/<n>.log 2>&1
echo "<n> $?" >>measure/runs/openrouter-sdk-ai-layer_20261114/gates/<L>/<n>.exit
```

Parse `npm audit --json` as a report, not by exit code. Write `critical=<n> high=<n>`
with labeled integers. A response that is not valid JSON is an infrastructure failure.

## 5. Baseline capture and new-failure counting

1. Capture the baseline at the `phase_base_sha` of section 11, before the first S1
   task commit. Run every command of section 4 with `L=baseline`.
2. A phase gate passes when no command has a new failure. A baseline failure stays
   allowed only with the same diagnostic keys.
3. Key for a TypeScript diagnostic: file and `TS` code. Key for a lint diagnostic:
   file and rule id. Key for a test failure: test file and test title. Key for any
   other step: the trimmed line. Remove line numbers, columns, timings, and trailing
   whitespace from each key.
4. Compare keys per workspace and per step. A workspace-level compare is too coarse
   (A7). A new key in a workspace that already fails is a new failure.
5. Print the last line `NEWFAIL=<n>` and parse that labeled integer (A3). `NEWFAIL=0`
   is the Green condition. Do not match any digit in the log.
6. A command that ran at baseline and is absent at the phase gate is a new failure
   (A4). A workspace set that differs from the baseline set is a new failure.
7. When a baseline folder is missing, every non-zero exit is a new failure. A deleted
   baseline never makes a gate pass.
8. Re-run a failed gate with the same label before it is reported. Infrastructure
   exits (usage, lock, disk, time limit) are not code failures. Report them as
   infrastructure and retry once.

## 6. Red tests: plan cases and route tests

| ID | Assertion | Falsification condition |
|----|-----------|-------------------------|
| Case 1 | With `@openrouter/sdk` mocked, `createOpenRouterProvider` calls the SDK chat send method with `model` and one user message, and returns trimmed content. | Fails when the code calls `fetch`, omits the `model` field, or returns untrimmed text. Parse the mocked call arguments; do not grep the source. |
| Case 2 | With the SDK mocked, `createOpenRouterProviderWithMessages` passes the messages array without change. | Fails when the messages are reordered, wrapped, or reduced to one string. Compare the array by deep equality. |
| Case 3 | An SDK error with status 429, then a success, gives one retry and the success. | Fails when there is no retry or more than one retry. Assert the retry count as a labeled integer. |
| Case 4 | An SDK error with status 400 gives no retry. The thrown message starts with `OpenRouter API error: 400`. | Fails on any retry or a different message prefix. Parse the status from the error object, not from substring text (A1). |
| Case 5 | An SDK connection error is retried as a network error is. | Fails when the connection error bypasses `withRetry`. Seed one connection error, then a success, and assert two calls. |
| Case 6 | An external abort gives an `AbortError` and no retry. | Fails when the abort is swallowed or retried. Assert the error name `AbortError` and one call. |
| Route-BM2 | `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.sdk.test.ts` mocks auth, the Convex rate limit, and `globalThis.fetch`. It asserts HTTP 200, the answer text, and one request to a URL ending `/chat/completions`. | Fails when the route returns 503, drops the answer, or makes no outbound request. Do not mock `@math-platform/ai-tutoring`. |
| Route-IM3 | The same test in `apps/integrated-math-3`, with the IM3 Convex mocks. | Fails on the same three conditions in IM3. A pass in one app does not prove the other. |

Keep each existing test in `packages/ai-tutoring/src/__tests__/providers.test.ts` and
`apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`. Change only an assertion that
names a transport detail the SDK changes, such as the exact header set. Record each
change in `plan.md` with the old and the new assertion.

## 7. Fixtures, mocks, and live-behavior proof

**Mocks.** Package tests use `vi.mock('@openrouter/sdk')`. Route tests mock
`globalThis.fetch`. No test calls the live OpenRouter API. CI makes no live call.

**Fixtures.** Define a response fixture with content, the served `model`, and token
`usage`. Define SDK error fixtures with a status field for 400, 429, and 5xx. Define a
connection error fixture and an `AbortController` fixture. Define a messages fixture
with more than one message for case 2.

**Live-behavior proof.**
- The workerd probe answers `probe-ok` through the SDK in workerd. A build or a unit
  test does not replace this proof.
- Route tests assert the HTTP response and the outbound request.
- Both app builds exit 0. AGENTS.md says the vinext build does not enforce types, so a
  green build also needs a green `PROJECT_CHECKS` typecheck.
- Both bundle audits run. Compare entries by name and labeled size, not by exit code.
  Record the size of each `.js` file under `dist/server/`, raw and gzip, in
  `evidence.md` (finding F6).
- The usage log and the no-PII rules belong to S2 and S3. S1 does not claim them.

**Artifact checks.** The orchestrator checks the five `evidence.md` sections named in
the plan, the dated tech-stack row, and the CI step text. Each check proves text only.
The live proofs above are the acceptance evidence.

## 8. Architecture guardrails and changed-contract risks

- No package imports from `apps/` or `convex/_generated/`.
- `packages/practice-core` does not depend on `packages/ai-tutoring`.
- `node scripts/check-monorepo-boundaries.mjs` and `node scripts/validate-ci.mjs` exit 0.
- The SDK client lives in `packages/ai-tutoring/src/openrouter-client.ts`. No package
  code calls `fetch` for OpenRouter after S1. A guard test asserts this on the real
  source, and a behavior test proves the SDK path still answers.
- Every exported name and type of `src/index.ts` stays. Review C reads the export diff.
- The SDK is ESM only. The probe uses `nodejs_compat` and `compatibility_date`
  `2026-04-11`, the IM3 value. If the SDK cannot run in workerd, stop the phase and
  report. The fallback is the current `fetch` wrapper. Do not drop the probe.
- SDK field names come from the installed files only. Record them in `evidence.md`
  before the implementer writes code. Do not guess `responseFormat` or `provider`.
- Retry, timeout, abort, and empty-response behavior stay the same. The SDK retry is
  off. `withRetry` stays the only retry layer.

## 9. Intentionally-red aggregate suites

The following are red or partly red before S1. Do not fix them in S1 and do not call
the whole suite green on a raw exit code.

- The scripts suite has the pre-existing failure
  `remediate-concept-blueprints > production scan reports the honest count for the
  current repo state`.
- The audit suites have baseline failures recorded in the archive track.
- The BM2 bundle audit fails at baseline on `Total dist/server`. A size that exceeds
  a budget at baseline stays allowed with the same entry and a similar size. A new
  over-budget entry, any IM3 over-budget entry, or a changed budget stops the phase.
- `npm audit` advisories drift with the registry. Record counts and advisory IDs at
  baseline. A new critical or high advisory stops the phase for a report.

GREEN uses the targeted commands of section 3. An aggregate failure with only baseline
keys is accepted and recorded in `evidence.md` with its log path.

## 10. Anti-pattern coverage

The catalog has A1 to A12. The brief named A1 to A11; this strategy also covers A12,
added 2026-07-02. Each row gives a test defense and a falsification condition.

| Anti-pattern | S1 defense | Falsification |
|--------------|-----------|---------------|
| A1 substring-as-structured-signal | Case 4 parses the error status field. Case 6 asserts the error name. | Replacing a structured assertion with `includes('error')` makes the case fail review. |
| A2 consent-blind publish gate | Not applicable. S1 publishes nothing. No draft-to-published gate exists. | A publish gate added in S1 is out of scope and fails review. |
| A3 digit-only as labeled count | Retry counts, `NEWFAIL`, bundle sizes, and audit counts use labeled integers. | A regex that matches any digit fails review. |
| A4 vacuous-pass on nothing-done | The RED describe holds exactly 6 cases. A "no test files found" or skipped run is invalid. | A RED run with fewer than 6 executed cases fails the mid-red gate. |
| A5 false-claim text vs test reality | Every `evidence.md` claim names a log path. The orchestrator re-runs the cited command. | A claim whose log is absent or whose command exits non-zero fails the artifact check. |
| A6 registry-note overstatement | No `measure/tracks.md` claim of SDK adoption before the probe and both audits pass. | A claim while the probe is red fails review. |
| A7 over-broad filter swallowing real hits | `-t 'SDK transport'` targets one exact describe. No bare-English-word exclusion. Comparison is per key. | A filter that drops a case, or a workspace-level compare, fails review. |
| A8 `[ ]` marker ambiguity | The live smoke task stays `[b]` (human gate). Tasks use `[ ]`, `[~]`, `[x]`, `[b]` structurally. | A `[ ]` task counted as in progress, or a `[b]` task automated, fails review. |
| A9 pre-existing test references archived track paths | No test reads `measure/tracks/vinext-oxc-toolchain_20261114/`. Use `measure/archive/...` only as a document reference. | A test path that breaks after an archive move fails the path check. |
| A10 generated-facts drift | Never stage the 6 dirty generated files. Check `git status --porcelain` at capture (section 11). Handle the `routes.md` path bug as finding F5. | A staged generated file, or a capture with another modified file, stops the capture. |
| A11 missing live contract-test suite | The provider cases, route tests, and workerd probe are live behavior tests. Artifact greps are complements only. | A phase that relies only on evidence text fails acceptance. |
| A12 missing supervisor peer-review rule | Not applicable. S1 touches no `AGENTS.md` and no supervisor. | A change to either file in S1 is out of scope and fails review. |

## 11. `phase_base_sha` capture point

`role_base_sha` `bce9613ae515114a552cba65ba16d9ebe6d466a6` predates this strategy.
Do not use it as `phase_base_sha`. No SHA in this file is the capture point.

1. This strategy commit lands first. It holds `test-strategy.md` only.
2. **Captured point.** Immediately after that commit, before any other commit, run
   `git status --porcelain`. Only these entries may appear, each with status ` M`:
   `apps/bus-math-v2/lib/workbooks-manifest.json`, the four
   `apps/*/.next/types/routes.d.ts` files, and `measure/generated/routes.md`.
   `measure/runs/` is gitignored. Any staged file, untracked file, or other modified
   file stops the capture.
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S1 in the
   orchestrator run log and the role handoff. Do not write it into `plan.md`,
   `spec.md`, or this file. No plan line carries a SHA for this phase.
4. Capture before the first S1 task commit: the evidence baseline, the follow-up
   transport change, and the manifest change.
5. A `phase_base_sha` that is not a descendant of this strategy commit is invalid.
   Stop and report.
6. For S2 to S4, capture the next `phase_base_sha` right after the preceding
   `measure(plan): Mark phase ... as complete` commit, with the same status rule.

## 12. Plan drifts and defaults

The spec and plan were written 2026-11-14, before `vinext-oxc-toolchain_20261114`
changed the toolchain. Each finding below has a default. The default applies unless
the orchestrator decides otherwise.

| ID | Finding | Default |
|----|---------|---------|
| F1 | No `gates.sh` exists in this track. The archive track used one with baseline comparison. | Use the direct commands of section 4 with the section 5 capture and key comparison. Do not commit a `gates.sh` from this strategy role. If the orchestrator later creates one on the archive pattern, prefer it and keep `NEWFAIL=0`. |
| F2 | `npm run test:workerd --workspace=packages/ai-tutoring` does not exist yet in `packages/ai-tutoring/package.json`. | The S1 Implement task adds it. Exclude it from RED. Include it in PROJECT_CHECKS only after the script lands. A Green run before creation is invalid. |
| F3 | The BM2 build script runs `generate-workbook-manifest.ts`, so it rewrites `apps/bus-math-v2/lib/workbooks-manifest.json`, a dirty generated file. | Leave the file unstaged. Never stage it. Record its state at capture. Do not use a destructive restore without approval. |
| F4 | Four `apps/*/.next/types/routes.d.ts` files are dirty and builds rewrite them. | Leave them unstaged. Never stage them. The capture of section 11 permits exactly these six generated files. |
| F5 | `measure/generated/routes.md` still holds `../../../daniel-bo/...` paths. The generator path bug persists. | Run `npm run generate` in the Docs task. If the bug persists, do not stage the file. Record a deviation and require `npm run doctor` to exit 0. `tech-debt.md` has 50 lines, the limit; add a row only after the orchestrator prunes. |
| F6 | "Each `.js` file under `dist/server/`" does not say recursive or top level. | Record every `.js` file recursively with a relative path. Name top-level `index.js` and `ssr/index.js` explicitly, because the audits use them. |
| F7 | The IM3 audit patterns can match zero files, so the audit can pass without checking a file. | Treat a pattern with zero matches as a gap. Record it in `evidence.md`. Use the manual per-file size table as the proof. Do not change a threshold. |
| F8 | `npm audit` counts drift with the registry. The archive track recorded a high-count increase as a new failure. | Baseline records counts and advisory IDs. A new critical or high ID at a phase gate is a new failure. Stop and report. Do not suppress. |
| F9 | The scripts suite and audit suites have baseline failures. | Record them in `evidence.md` with log paths. Accept them only with baseline keys. No new failure is allowed. |
| F10 | The plan gate table defines `<ws>` as 4 workspaces, but CI covers 20 packages and 6 apps. | Follow the plan's 4-workspace definition for S1 gates. Use `node scripts/validate-ci.mjs` for matrix parity. |
| F11 | The probe uses `compatibility_date 2026-04-11` "the same as IM3". BM2 uses `2026-03-12`. | Use `2026-04-11` for the probe. Do not change either app `wrangler.jsonc`. |
| F12 | The plan says the SDK client sends the current "same values" for referrer and title. The current source sends `HTTP-Referer: https://github.com/bodangren/ra-integrated-math-3` and `X-Title: Integrated Math 3`. | Keep these values. Map them to the SDK options from the installed files. Change an assertion only when the SDK changes the header form, and record the change in `plan.md`. |

## 13. Green gate and closeout gate

**Green gate.** `RED_TEST_COMMAND` is superseded by a passing GREEN run. The 6 provider
cases and the 2 route tests pass. `GREEN_TEST_COMMAND` exits 0 for the three named
workspaces. `PROJECT_LINT`, `PROJECT_TESTS`, and `PROJECT_CHECKS` print `NEWFAIL=0`.
The workerd probe answers `probe-ok`. Baseline failures keep only baseline keys.
`evidence.md` records the sizes and every cited log path.

**Closeout gate (phase acceptance).** The Green gate. Both app builds exit 0. Both
bundle audits run with no new over-budget entry and no changed budget. Boundary and CI
checks exit 0. The export surface of `src/index.ts` is unchanged apart from planned
exports. `npm run generate` and `npm run doctor` exit 0, or the F5 deviation is
recorded. No generated file is staged. The manual verification protocol of
`measure/workflow.md` completes. The phase checkpoint and plan update follow.
