# Test Strategy: openrouter-sdk-ai-layer_20261114

Track: `openrouter-sdk-ai-layer_20261114` (Chore, 4 phases S1 to S4).
Strategy revision: r2 (2026-11-23). Scope: Phase S1 (sections 1 to 13) and Phase S2 (the
section with that name below). Refresh this file at the start of each later phase. A later
section wins when an earlier rule disagrees with it.
Role base SHA `bce9613ae515114a552cba65ba16d9ebe6d466a6` predates this strategy. It is
not a `phase_base_sha`. Section 11 gives the S1 capture point. The "Phase S2" section gives
the S2 capture point. Do not use any SHA in this file as the S2 `phase_base_sha`.

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

---

## Phase S2: Role-based model configuration

This section refreshes the strategy for S2. It wins over sections 1 to 13 when a rule
disagrees. The gate capture and per-key comparison rules of sections 4 and 5 still apply
to each S2 gate. Label the S2 gate logs `s2` instead of `s1`.

### S2.1 What this phase proves

S2 gives each AI role its own model variable. No code has a default model. A missing
setting makes the feature fail closed. Each request logs one usage record with no prompt
or answer text. The PII flag controls the `zdr` field. Two chatbots get a no-PII test.
Two S1 findings, F1 and F10, block any deploy and are fixed here.

The proof has two parts:

1. Live behavior tests. Red cases 1 to 12, the two no-PII route tests, the F1 and F10
   tests, and the workerd probe.
2. Gate sweeps. Each gate runs on the S2 base commit and after the change. Compare by
   diagnostic key, not by workspace level (section 5).

Artifact and document checks are supporting evidence only. A `.env.example` comment, a
tech-stack note, or a `git grep` match proves text. It does not prove role behavior.
Section S2.10 names the live complement of each artifact check.

### S2.2 Risk and applicable roles

S2 risk: **high**. Reason: the resolver signature changes for every AI caller, fail-closed
behavior is a privacy boundary, usage logging must not leak text, and F1 and F10 block any
deploy of S1 code.

| Role | Applicable | Reason |
|------|-----------|--------|
| Security review | yes | A missing key or model must fail closed. No log holds prompt text, answer text, or the key. F10 redacts each Bearer scheme form. No message holds PII. |
| UX/API review | yes (API) | `resolveOpenRouterProvider*FromEnv` take an `AiRole`; `OpenRouterProviderOptions` requires `model` and `role`; four exports are added to `src/index.ts`. The chatbot HTTP 503 response stays. No page or component changes. |
| Adversarial testing | yes | Try to pass without reading the role variable, with a hidden default, with PII in a message, or with prompt text in a log. |
| Browser review | no | S2 changes no page, component, or route rendering. Route tests assert HTTP status and captured messages. The workerd probe proves the runtime. No browser state exists to compare. |

### S2.3 Red command, fixtures, mocks, and live proof

`S2_RED_TEST_COMMAND`:
`CI=true npm run test --workspace=packages/ai-tutoring -- -t 'role configuration'`

The new describe in `packages/ai-tutoring/src/__tests__/roles.test.ts` holds exactly 12
cases. The SDK is installed from S1, so a `Cannot find module` failure is invalid. Record
the first failing assertion line of each case. A run with fewer than 12 executed cases
fails the mid-red gate (A4).

The two no-PII route tests run with
`CI=true npm run test --workspace=apps/integrated-math-3 -- -t 'no-PII'` and
`CI=true npm run test --workspace=apps/bus-math-v2 -- -t 'no-PII'`. These tests are guards.
They may pass at Red. They do not count toward the 12 failing cases.

The F1 and F10 tests live in `packages/ai-tutoring/src/__tests__/providers.test.ts`.
Run them with `CI=true npm run test --workspace=packages/ai-tutoring`.

`S2_GREEN_TEST_COMMAND` is the S1 `GREEN_TEST_COMMAND` (three workspaces) plus
`CI=true npm run test --workspace=packages/practice-core`.

**Fixtures.**

- Role variables: `vendor/model-a`, `~google/gemini-latest`, `@preset/tutor`, and an
  environment that holds only the old `OPENROUTER_MODEL`.
- Response fixture: served `model`, `promptTokens`, `completionTokens`, and
  `totalTokens` as labeled fields, taken from the mocked `chat.send` result.
- Log guard markers: prompt `PROMPT-MARKER-7` and answer `ANSWER-MARKER-9`.
- No-PII Fixture from the plan "Rules for All Phases": 2 names (`Avery Quinn`,
  `Jordan Lee`), 2 emails (`avery.quinn@example.org`, `jordan.lee@example.org`),
  1 username (`aquinn42`), 1 account ID (`k17pii0000account`).
- F1 fixtures: the OpenRouter documented example response body, recorded verbatim in
  `evidence.md` "SDK API", and a 200 body that holds only an `error` object.
- F10 fixtures: API keys configured as `bearer <token>` and `BEARER  <token>`, each
  echoed as a token-only HTTP error message.

**Mocks.** Package tests use `vi.mock('@openrouter/sdk')`. F1 uses the real SDK client
with a mocked `globalThis.fetch` that returns the raw 200 body, so SDK validation runs.
Route tests mock auth, the Convex rate limit, and `globalThis.fetch`, and capture the
messages that reach the provider. No test calls the live OpenRouter API.

**Live-behavior proof.** The workerd probe passes `role: 'studentTutor'` and a model and
answers `probe-ok` through the SDK in workerd. A unit test does not replace this proof.
The probe fails if it answers from a fetch fallback or omits the role and model. Route
tests assert HTTP status and captured messages. Both app builds exit 0 and both typechecks
pass, since vinext build does not enforce types.

### S2.4 Red cases 1 to 12

| ID | Assertion | Falsification condition |
|----|-----------|-------------------------|
| 1 | With `OPENROUTER_MODEL_STUDENT_TUTOR=vendor/model-a`, the studentTutor provider sends `model: 'vendor/model-a'`. | Fails on a default model, a read of `OPENROUTER_MODEL`, or a changed value. |
| 2 | The value `~google/gemini-latest` reaches the request without change. | Fails if the value is normalized, rejected, or rewritten. |
| 3 | One successful request logs one usage record with the served model and the token counts of the mocked response. | Fails on zero or more than one record, on the requested model in place of the served model, or on a wrong token field. Parse labeled fields. |
| 4 | Every entry of `AI_ROLES` has `sendsPii: false`. | Fails if a role sets the flag true or omits it. |
| 5 | `buildProviderPreferences` maps the four input pairs to `undefined`, `{require_parameters: true}`, `{zdr: true}`, and `{require_parameters: true, zdr: true}`. | Fails on a wrong mapping, an extra field, or a guessed field name. Use the SDK names in `evidence.md`. |
| 6 | A missing role variable makes the resolver return `null` and log the variable name. | Fails if a provider is returned or the log omits the name. |
| 7 | An empty or whitespace value gives the result of case 6. | Fails if whitespace is accepted. |
| 8 | The value `@preset/tutor` makes the resolver return `null` and log `reason: 'preset'`. | Fails if the preset is accepted or the reason field is not `preset`. Assert the field, not substring text (A1). |
| 9 | Only `OPENROUTER_MODEL` set makes the resolver return `null`. | Fails if the old variable is used as a fallback. This is the live complement of the S2 Verify `git grep` (A11). |
| 10 | A missing `OPENROUTER_API_KEY` makes the resolver return `null` and log `missing: 'OPENROUTER_API_KEY'`. | Fails if a provider is returned or the missing name is wrong. |
| 11 | A request with prompt `PROMPT-MARKER-7` and answer `ANSWER-MARKER-9` logs no line with either marker. A failed request logs `outcome: 'error'` and its status. | Fails if any log line holds a marker, or if the failed record lacks `outcome` or `status`. |
| 12 | A studentTutor request has no `provider` field. | Fails if `provider` is present, even as an empty object. |

### S2.5 The two no-PII route tests

Create `apps/integrated-math-3/__tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts`
and `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts`. Put
the No-PII Fixture in session claims, the profile, and the lesson data mocks. Capture the
messages that reach the mocked provider. Assert that no captured string holds any fixture
value.

Falsification: a captured message that holds `Avery Quinn`, `Jordan Lee`, either email,
`aquinn42`, or `k17pii0000account` fails the test. A test that captures no message also
fails. The two apps are separate tests; a pass in one does not prove the other.

### S2.6 Deploy blockers F1 and F10

Both findings come from S1 review and acceptance. S2 fixes them. A deploy of S1 code with
either finding open fails review.

**F1 (Acceptance, Major): the SDK rejects 200 bodies that the old transport accepted.**
Add two cases to `providers.test.ts`. Drive the real SDK client through a mocked
`globalThis.fetch` that returns HTTP 200 with the target body. Do not stub `chat.send`.

- F1a. Return the OpenRouter documented example body verbatim. Assert that the provider
  returns its content text. Falsification: the SDK rejects the body and the provider
  throws, or the provider returns no content.
- F1b. Return a 200 body that holds only an `error` object and no `choices`. Assert that
  the failure is retried by `withRetry` and gives the result that the pre-S1 transport
  gave for that body. Falsification: no retry occurs, the error is treated as
  non-retryable, or the call count is wrong. Assert the call count as a labeled integer.

Record the exact bodies and the before and after results in `evidence.md`, with log paths.
The fix must land before any deploy of S1 code.

**F10 (Review B): case-insensitive Bearer strip in `mapSdkError`.** The strip at
`packages/ai-tutoring/src/providers.ts:38` checks the exact string `Bearer `. Add two cases
to the redaction describe in `providers.test.ts`. Configure the key with the scheme in the
value and make `chat.send` reject with an HTTP error that echoes the token alone.

- F10a. Key `bearer sk-bearer-lower-6666`, lowercase scheme. Falsification: the token
  `sk-bearer-lower-6666` stays in the mapped error text or in `JSON.stringify` of it.
- F10b. Key `BEARER  sk-bearer-upper-7777`, uppercase scheme with an extra space.
  Falsification: the token `sk-bearer-upper-7777` stays in the mapped error text.

The fix must match the scheme without case sensitivity and remove the scheme and its
following whitespace. A case-sensitive match or a one-space strip fails these tests.

### S2.7 Caller moves, architecture guardrails, and changed-contract risks

**Caller moves.** Resolvers take an `AiRole`. `OpenRouterProviderOptions` requires `model`
and `role`. Update these six test files for the new signature and assert the role
argument: `packages/ai-tutoring/src/__tests__/providers.test.ts`,
`apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`,
`apps/bus-math-v2/__tests__/lib/ai/spreadsheet-feedback.test.ts`, both
`lesson-chatbot/route.test.ts` files, and
`apps/bus-math-v2/__tests__/api/student/lesson-chatbot.test.ts`. Each chatbot test asserts
that the resolver gets `'studentTutor'`. The spreadsheet test asserts `'spreadsheetEval'`.

**Guardrails.**

- No package imports from `apps/` or `convex/_generated/`.
- `packages/practice-core` does not depend on `packages/ai-tutoring`.
- `node scripts/check-monorepo-boundaries.mjs` and `node scripts/validate-ci.mjs` exit 0.
- Existing exports of `src/index.ts` stay. Add `AI_ROLES`, `AiRole`, `resolveRoleModel`,
  and `buildProviderPreferences`.
- `provider` is sent only when `buildProviderPreferences` returns an object (case 12).
- The provider cache holds one entry per role. `clearProviderCache` clears all roles. A
  test that resolves two roles fails if the second returns the first role's model.
- No code reads `OPENROUTER_MODEL` and no code holds `openrouter/free` as a default. The
  S2 Verify `git grep` is an artifact check; cases 1, 2, and 9 are its live complement.
- Usage log fields and logger text match the contract. No log holds a key, a prompt, or an
  answer (case 11).

### S2.8 Green gate and closeout gate

**Green gate.** The 12 role cases, the two no-PII route tests, the F1 cases, and the F10
cases pass. `S2_GREEN_TEST_COMMAND` exits 0 for the four named workspaces. The workerd
probe answers `probe-ok` with a role and a model. `PROJECT_LINT`, `PROJECT_TESTS`, and
`PROJECT_CHECKS` print `NEWFAIL=0` with label `s2`. Every baseline failure key stays
unchanged. `evidence.md` records the F1 bodies and results and every cited log path.

**Closeout gate (phase acceptance).** The Green gate. Both app builds and typechecks exit
0. The S2 Verify `git grep` returns no code match. Boundary and CI checks exit 0. The
export diff of `src/index.ts` holds only the four planned exports. `npm run generate` and
`npm run doctor` exit 0, or the S1 F5 deviation is recorded again. No generated file is
staged. The manual verification protocol of `measure/workflow.md` completes. The phase
checkpoint and plan update follow. The S1 deploy blockers F1 and F10 are closed.

### S2.9 Intentionally-red aggregate suites

The suites below are red or partly red at the S2 base commit. Do not fix them in S2 and do
not call the whole suite green on a raw exit code.

- The scripts suite holds the pre-existing `remediate-concept-blueprints` honest-count
  failure and the `vinext-oxc-gates-script` failures.
- The audit suites hold five baseline failure keys.
- IM3 typecheck holds the same 55 baseline diagnostic lines. IM3 tests hold 218 baseline
  failures and BM2 tests hold 7.
- The BM2 bundle audit fails at baseline on `Total dist/server`. A bigger size with the
  same entry is allowed. A new over-budget entry or a changed budget stops the phase.
- `npm audit` holds nine high advisory IDs at baseline. A new critical or high ID stops
  the phase for a report.

GREEN uses the targeted commands of S2.3. An aggregate failure with only baseline keys is
accepted and recorded in `evidence.md` with its log path.

### S2.10 Artifact checks versus live behavior checks

| Artifact check | Live complement |
|----------------|-----------------|
| `.env.example` holds role variables as comments | Cases 1, 2, and 9 read the real variables |
| `tech-stack.md` dated note on roles, the PII flag, and the usage record | Cases 3, 4, 5, and 11 |
| S2 Verify `git grep` for `OPENROUTER_MODEL` and `openrouter/free` | Case 9 and resolver cases 6 to 10 |
| `evidence.md` records the F1 bodies | F1a and F1b drive the real SDK through a mocked fetch |
| Export diff of `src/index.ts` | A package test imports each new export and calls it |

A phase that holds only artifact checks fails acceptance. An artifact grep is a
complement, never the proof.

### S2.11 Anti-pattern coverage

The catalog holds A1 to A12. Each row gives an S2 defense and a falsification condition.

| Anti-pattern | S2 defense | Falsification |
|--------------|-----------|---------------|
| A1 substring-as-structured-signal | Case 8 asserts the `reason` field. Case 3 asserts the `outcome` field. `mapSdkError` keeps the `statusCode` field from S1. | Replacing a field assertion with `includes('preset')` or `includes('error')` fails review. |
| A2 consent-blind publish gate | Not applicable. S2 publishes nothing. No draft-to-published gate exists. | A publish gate added in S2 is out of scope and fails review. |
| A3 digit-only as labeled count | Token counts, call counts, `NEWFAIL`, and advisory IDs use labeled fields and integers. | A regex that matches any digit fails review. |
| A4 vacuous-pass on nothing-done | The RED describe holds exactly 12 cases. A skipped or "no test files found" run is invalid. | A RED run with fewer than 12 executed cases fails the mid-red gate. |
| A5 false-claim text vs test reality | Each `evidence.md` claim names a log path. The orchestrator re-runs the cited command. | A claim with an absent log or a non-zero command fails the artifact check. |
| A6 registry-note overstatement | No `measure/tracks.md` claim of role configuration before Red and Green pass. | A claim while a role case is red fails review. |
| A7 over-broad filter swallowing real hits | `-t 'role configuration'` targets one describe. No bare-English-word exclusion. Gate compare is per key. | A filter that drops a case or a workspace-level compare fails review. |
| A8 `[ ]` marker ambiguity | The live smoke task stays `[b]`. Tasks use `[ ]`, `[~]`, `[x]`, and `[b]` structurally. | A `[ ]` task counted as in progress or a `[b]` task automated fails review. |
| A9 pre-existing test references archived track paths | No test reads `measure/tracks/vinext-oxc-toolchain_20261114/`. Use `measure/archive/...` only in documents. | A test path that breaks after an archive move fails the path check. |
| A10 generated-facts drift | Never stage the six dirty generated files. Check `git status --porcelain` at the S2 capture. | A staged generated file or a capture with another modified file stops the capture. |
| A11 missing live contract-test suite | The 12 cases, the two no-PII tests, F1a, F1b, F10a, F10b, and the probe are live tests. Artifact greps are complements. | A phase that relies only on evidence text fails acceptance. |
| A12 missing supervisor peer-review rule | Not applicable. S2 touches no `AGENTS.md` and no supervisor. | A change to either file in S2 is out of scope and fails review. |

### S2.12 `phase_base_sha` capture point for S2

1. This S2 strategy commit lands first. It holds `test-strategy.md` only.
2. **Captured point.** Immediately after that commit, before any other S2 commit, run
   `git status --porcelain`. Only these entries may appear, each with status ` M`:
   `apps/bus-math-v2/lib/workbooks-manifest.json`, the four
   `apps/*/.next/types/routes.d.ts` files, and `measure/generated/routes.md`.
   `measure/runs/` is gitignored. Any staged file, untracked file, or other modified
   file stops the capture.
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S2 in the
   orchestrator run log and the role handoff. Do not write it into `plan.md`, `spec.md`,
   or this file.
4. The S1 checkpoint SHA and the base HEAD of this strategy role predate this commit.
   Neither is the S2 `phase_base_sha`. No SHA in this file is the S2 capture point.
5. Capture before the first S2 task commit, which is S2 Contract.
6. An S2 `phase_base_sha` that is not a descendant of this strategy commit is invalid.
   Stop and report.
7. For S3, capture the next `phase_base_sha` right after the
   `measure(plan): Mark phase 'Phase S2: Role-based model configuration' as complete`
   commit, with the same status rule.

### S2.13 emulate decision

Decision: do not adopt `npx emulate --service ai`; no `emulate` binary or dependency is present and no evidence shows it models the strict 200-body parse or `withRetry` classification, so S2 keeps the pinned `vi.mock('@openrouter/sdk')` fakes and the local mock server.

### S2.14 Plan drifts and defaults for S2

| ID | Finding | Default |
|----|---------|---------|
| F13 | The SDK field names for `buildProviderPreferences` are `requireParameters` and `zdr`; the outbound JSON uses snake_case. | Assert the names recorded in `evidence.md`. Do not guess a field name. |
| F14 | The two no-PII route tests may pass at Red. | Record them as guards. The Red proof is the 12 failing role cases. |
| F15 | F1 and F10 are S1 findings fixed in S2. | Treat both as deploy blockers. Close them before any deploy of S1 code. |

---

## Phase S3: Structured output for the evaluation features

This section refreshes the strategy for S3. It wins over sections 1 to 13 and the
"Phase S2" section when a rule disagrees. The gate capture and per-key comparison
rules of sections 4 and 5 still apply to each S3 gate. Label the S3 gate logs `s3`
instead of `s1` or `s2`. Store the logs under
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/s3/`.

### S3.0 Red order and the release gate

Red starts with the two "S3 Fix" tasks of the plan. These two tasks are the FIRST
Red group. Red writes and runs them before the S3 Contract task and before the
main S3 Red group.

1. Fix 1 comes first: the BM2 lesson-chatbot PII strip. Red writes the no-PII test
   that runs the real `assembleLessonChatbotContext` with fixture person details in
   the lesson markdown. This is the first S3 test Red writes and runs.
2. Fix 2 comes next: the S2 review findings (a) to (e).

Both fixes use the vitest filter `S3 fix`. Put each Fix test in a
`describe('S3 fix', ...)` block in its test file. The BM2 PII strip test sits in the
BM2 lesson-chatbot route test file.

`S3_FIX_RED_TEST_COMMAND` is the first Red command. Run the three invocations in
this order:

```
CI=true npm run test --workspace=apps/bus-math-v2 -- -t 'S3 fix'
CI=true npm run test --workspace=packages/ai-tutoring -- -t 'S3 fix'
CI=true npm run test --workspace=apps/integrated-math-3 -- -t 'S3 fix'
```

The first invocation proves Fix 1. The remaining invocations prove Fix 2 findings
(a) to (e). A run with zero executed cases, or a `Cannot find module` failure, is
invalid (A4). Record the first failing assertion line of each case.

**PM gate (2026-11-23).** No student-facing release of the BM2 chatbot before the
PII strip passes. This is a human release gate. The Fix 1 no-PII test is its
automated proof. A release of the BM2 chatbot while that test is red fails the
gate. The gate stays with the orchestrator until the test passes.

### S3.1 What this phase proves

S3 adds a structured-output helper and moves the two evaluation features onto it.
The helper sends a strict JSON Schema `response_format`, returns typed failures,
and never throws. The spreadsheet feedback and the teacher error summary keep
their deterministic fallbacks. The teacher summary uses the lesson-level prompt
with no student name.

The proof has three parts:

1. Live behavior tests. The Fix group, the main Red cases 1 to 18, and the four
   no-PII tests.
2. Gate sweeps. Each gate runs on the S3 base commit and after the change. Compare
   by diagnostic key, not by workspace level (section 5).
3. Artifact checks. The zod check, the `tech-stack.md` dated note, and the
   `evidence.md` records are supporting evidence only. Section S3.10 names the
   live complement of each artifact check.

### S3.2 Risk and applicable roles

S3 risk: **critical**. Reason: the Fix group guards a student-facing PII boundary
under a PM release gate, and the phase adds a new parse path that can silently
drop evaluation feedback. A strip that is too narrow leaks PII. A strip that is
too broad drops lesson math. A wrong fallback hides a failed model call.

| Role | Applicable | Reason |
|------|-----------|--------|
| Security review | yes | The BM2 PII strip and the four no-PII tests defend the student prompt boundary. No prompt holds a name, email, username, or account ID. Typed failures keep deterministic fallbacks. No log holds a key or a text body. `zdr` appears only for a role with the PII flag. |
| UX/API review | yes (API) | The helper returns `StructuredResult<T>` with a typed `reason`. The teacher summary route keeps the keys `studentName`, `lessonTitle`, `deterministicSummary`, `aiSummary`, and `aiEnabled`. Only the value of `aiSummary` changes. No page or component changes. |
| Adversarial testing | yes | Run the S3 ADV list in section S3.11. Try to pass without a real `response_format`, with a name in a prompt, with a masked typed failure, or with a raw key in a cache key or log. |
| Browser review | no | S3 changes no page, component, or route rendering. Route tests assert the HTTP response and the captured prompt. The student name stays on the app side. No browser state exists to compare. |

The live smoke test stays a manual human gate in S4. S3 does not run it.

### S3.3 Red commands, fixtures, mocks, and live proof

The main S3 Red command targets the new helper describe. The new file
`packages/ai-tutoring/src/__tests__/structured.test.ts` uses
`describe('structured output', ...)` with 9 cases.

`S3_RED_TEST_COMMAND`:

```
CI=true npm run test --workspace=packages/ai-tutoring -- -t 'structured output'
```

The move tests run in BM2 with these filters:

```
CI=true npm run test --workspace=apps/bus-math-v2 -- -t 'spreadsheet-feedback'
CI=true npm run test --workspace=apps/bus-math-v2 -- -t 'teacher AI error summary'
CI=true npm run test --workspace=apps/bus-math-v2 -- -t 'GET /api/teacher/ai-error-summary'
```

The four no-PII tests use the guard filter `no-PII` in their workspaces. They may
pass at Red. They do not count toward the failing main cases.

`S3_GREEN_TEST_COMMAND` is the S2 four-workspace command:

```
CI=true npm run test --workspace=packages/ai-tutoring
CI=true npm run test --workspace=packages/practice-core
CI=true npm run test --workspace=apps/bus-math-v2
CI=true npm run test --workspace=apps/integrated-math-3
```

**Fixtures.**

- Structured answer fixture: valid JSON that matches each schema, plus a `raw`
  string.
- Typed failure fixtures: text that is not JSON, JSON that fails the schema, empty
  content on each attempt, HTTP 400, HTTP 503 then a success, and an external
  abort.
- Schema fixture: `AiFeedbackResponseSchema` and `teacherAiSummarySchema`.
- Teacher summary fixture: a `LessonErrorSummary` with a lesson title, correctness
  line, misconception tags with counts and part IDs, scaffold counts, and an
  activity breakdown. Its `studentName` is
  `Avery Quinn (avery.quinn@example.org)`.
- Strip fixtures: person-detail clauses in the colon form, dash form, em-dash
  form, an unlisted label, a prose name, an obfuscated email, and a fullwidth
  label. Each fixture places math text after the detail.
- Model fixtures: a served model equal to the configured model, a served model
  plus a known suffix, and a bare API key form.
- No-PII Fixture from the plan "Rules for All Phases": 2 names (`Avery Quinn`,
  `Jordan Lee`), 2 emails (`avery.quinn@example.org`, `jordan.lee@example.org`),
  1 username (`aquinn42`), and 1 account ID (`k17pii0000account`).

**Mocks.** Package tests use `vi.mock('@openrouter/sdk')`. Route tests mock auth,
the Convex rate limit, and the structured provider. They capture the messages and
the prompt that reach the provider. No test calls the live OpenRouter API.

**Live-behavior proof.** The workerd probe answers `probe-ok` through the SDK in
workerd. A unit test does not replace this proof. Route tests assert the HTTP
response and the captured prompt. Both app builds exit 0 and both typechecks pass,
since vinext build does not enforce types. The no-PII tests capture the real
prompt builder or the real context assembler. A grep of the source is not the
proof.

### S3.4 Spec-to-test map

| Spec item | Test | Falsification condition |
|-----------|------|-------------------------|
| S3 AC: `response_format` uses `json_schema`, `name`, `strict: true`, and `z.toJSONSchema()` | Main case 2 | Fails on a wrong field name, a missing `strict`, or a guessed schema form. Parse the request body. |
| S3 AC: `provider` is exactly `{"require_parameters": true}` for a non-PII role | Main case 3 | Fails on any extra field, on `zdr: true`, or on a missing object. Compare the object by deep equality. |
| S3 AC: bad JSON or a schema mismatch gives a typed failure and no throw | Main cases 4 and 5 | Fails on a thrown error, a wrong `reason`, or a missing `raw`. Assert the fields. |
| S3 AC: spreadsheet feedback parses valid fields; score clamped 0 to 40; invalid gives deterministic feedback | Spreadsheet cases and case 10 | Fails on an out-of-range score, a dropped field, or a wrong fallback. Assert each labeled field. |
| S3 AC: teacher summary uses `OPENROUTER_MODEL_ACCOUNTING_EVAL`, the lesson-level prompt, and the 4 fields | Teacher cases 11 to 13 | Fails on a wrong model, a wrong schema name, a missing field, or a missing prompt line. |
| S3 AC: a failed call or a failed Zod check gives `aiSummary: null` and the deterministic summary | Cases 15 and 18 | Fails on a non-null `aiSummary` or a changed response key. Assert the 5 keys. |
| S3 AC: the name and email stay out of the prompt; the prompt says "the student" | Case 17 and the teacher no-PII test | Fails if either value appears or the phrase is absent. |
| S3 AC: submit and route prompts hold no fixture value | The two no-PII route tests | Fails on any captured fixture value or on no captured message. |
| AC10: every prompt builder has a no-PII test | The four no-PII tests | Fails if any builder lacks a capturing test. |

### S3.5 Fix group tests

**Fix 1 — BM2 lesson-chatbot PII strip.** Add a no-PII test in the BM2 lesson-chatbot
route test file. Put fixture person details in the lesson markdown. Run the real
`assembleLessonChatbotContext` with those fixtures. Capture the prompt. Reuse the
`stripPersonDetails` behavior of IM3. Move it to `packages/ai-tutoring` only when the
move needs no new layer. Do not add a second implementation.

Falsification: the captured prompt holds a fixture value, or the later lesson text
is missing. Both conditions fail the test. A test that captures no prompt also
fails. This test is the proof for the PM gate of S3.0.

**Fix 2 — the S2 review findings.**

- (a) IM3 strip robustness. Add one test for each form: dash, em-dash, unlisted
  label, prose name, obfuscated email, and fullwidth label. Falsification: a
  fixture value survives the strip, or the math text after the detail is removed.
  If a conservative sentence-level detector is too broad, accept the limit in
  writing in `evidence.md`.
- (b) Tighten `MODEL_ID`. Record the served model only when it equals the
  configured model or the configured model plus a known suffix. A bare API key
  form gives `model: null`. Falsification: a bare key form reaches the usage
  record as a model, or a valid known-suffix form is dropped. Parse the labeled
  field.
- (c) Remove the raw API key from the provider cache key. Key the cache on a
  stable non-secret value. Keep the warm-cache recheck of the key and the role
  model. Falsification: the cache key holds the key value, or a removed setting
  still yields a cached provider.
- (d) Rate-limit catch in both chatbot routes. Log the status and the role only.
  Falsification: the raw error object reaches any console call in either route.
  Two routes, two tests.
- (e) Carried items. N1: a redacting `debugLogger` for `OPENROUTER_DEBUG` keeps the
  auth header out of every log line. N2: the S2 Verify grep ignores the case-9
  fixture lines in `roles.test.ts` and the live complement in
  `role-configuration.adversarial.test.ts`. N3: a two-role cache isolation test.
  N5: a padded preset test. Falsification for each: the auth header appears, the
  grep flags a fixture line, one role returns the other role's provider, or a
  padded preset is accepted.

Do not change an adversarial assertion. Record each test-first proof in `plan.md`.

### S3.6 Helper and move cases

| ID | Assertion | Falsification condition |
|----|-----------|-------------------------|
| 1 | A valid JSON answer that matches the schema gives `{ok: true, data, raw}`. | Fails on a thrown error, a missing field, or a changed `ok` value. |
| 2 | The request body holds `response_format` with the name, `strict: true`, and the `z.toJSONSchema` output. | Fails on a wrong field or a value that differs from `z.toJSONSchema`. |
| 3 | The request `provider` object is exactly `{"require_parameters": true}`. | Fails on an extra field or a missing object. |
| 4 | Text that is not JSON gives `invalid_json` with `raw`. | Fails on a throw or a wrong `reason`. |
| 5 | JSON that fails the schema gives `schema_mismatch` with `raw`. | Fails on a throw or a wrong `reason`. |
| 6 | Empty content on each attempt gives `empty_response`. | Fails if no retry occurs or the reason differs. Assert the call count. |
| 7 | HTTP 400 gives `request_failed` with no retry. HTTP 503 then a success gives `ok: true`. | Fails on a retry for 400 or no retry for 503. Assert both call counts. |
| 8 | An external abort gives `aborted`. | Fails on a throw or a wrong `reason`. |
| 9 | `z.toJSONSchema` gives `additionalProperties: false` and lists all keys in `required` for both schemas. | Fails if a key is absent or the flag is missing. |
| 10 | `request_failed`, `empty_response`, or `aborted` makes `generateAiFeedback` throw. | Fails if the submit route stores AI feedback on these reasons. |
| 11 | The teacher prompt holds the lesson title, correctness line, misconception tags with counts and part IDs, scaffold line, and activity breakdown. | Fails on any missing prompt line. |
| 12 | The teacher prompt holds `the student` and the 4 field names. | Fails on a missing phrase or field name. |
| 13 | With the role variable and the key, the generator sends the model from `OPENROUTER_MODEL_ACCOUNTING_EVAL` and the schema name `teacher_error_summary`, and returns a `TeacherAiSummary`. | Fails on a wrong model, a wrong schema name, or a missing field. |
| 14 | A missing role variable makes the generator resolver return `null` and log the variable name. | Fails on a returned generator or a log without the name. |
| 15 | A typed failure makes the generator return `null`. | Fails on a non-null result. |
| 16 | `totalParts: 0` makes the generator return `null` and send no request. | Fails on a request or a non-null result. |
| 17 | The teacher prompt holds neither `Avery Quinn` nor `avery.quinn@example.org`. | Fails if either value appears. |
| 18 | A generator that returns `null` gives `aiSummary: null` and the deterministic summary, with all 5 response keys. | Fails on a changed key or a non-null `aiSummary`. |

Keep the 6 existing `spreadsheet-feedback` tests. Change only the mock to
`resolveStructuredProviderFromEnv` and keep each expected result. The no-PII submit
test captures the messages from the mocked structured provider. The no-PII teacher
test also asserts that the response `studentName` is the fixture name, so the name
stays on the app side.

### S3.7 Architecture guardrails and changed-contract risks

- No package imports from `apps/` or `convex/_generated/`.
- `packages/practice-core` does not depend on `packages/ai-tutoring`.
- `node scripts/check-monorepo-boundaries.mjs` and `node scripts/validate-ci.mjs` exit 0.
- `zod` `^4.1.12` is a declared dependency of `packages/ai-tutoring`. Run the zod
  check of the plan. The result of `typeof z.toJSONSchema` must be `function`.
  Record the zod version and the result in `evidence.md`.
- Export `resolveStructuredProviderFromEnv` and the new types from `src/index.ts`.
  Add the `./structured` subpath to `package.json` `exports`. Keep every existing
  export.
- The teacher summary file and the `LessonErrorSummary` input type stay in BM2.
  Do not move a type into a package.
- Response schemas use `z.strictObject`, `z.string()`, `z.number()`, and
  `z.array(z.string())` only. Do not add length or count limits.
- The `provider` object is sent only by the structured helper. For a non-PII role
  it is exactly `{require_parameters: true}`. Do not add `zdr`.
- `stripPersonDetails` has one implementation. Reuse the IM3 behavior for BM2.
  A second implementation fails review.
- The provider cache key holds no secret. The warm-cache recheck of the key and
  the role model stays.
- The usage record holds the served model only under the rule of finding (b).
  No log line holds a prompt, an answer, or the key.
- No code puts the student name into the AI text. The route adds the name to the
  response, as it does now.

### S3.8 Green gate and closeout gate

**Green gate.** The Fix group and main cases 1 to 18 pass. The four no-PII tests
pass. `S3_GREEN_TEST_COMMAND` exits 0 for the four named workspaces, with only the
baseline failure keys of section S3.9. The workerd probe answers `probe-ok`.
`PROJECT_LINT`, `PROJECT_TESTS`, and `PROJECT_CHECKS` print `NEWFAIL=0` with label
`s3`. The zod check returns `function`. `evidence.md` records the zod result and
every cited log path.

**Closeout gate (phase acceptance).** The Green gate. The PM gate of S3.0 is open
because the Fix 1 no-PII test passes. Both app builds and typechecks exit 0.
Boundary and CI checks exit 0. The export diff of `src/index.ts` holds only the
planned structured exports. `npm run generate` and `npm run doctor` exit 0, or the
S1 F5 deviation is recorded again. No generated file is staged. The manual
verification protocol of `measure/workflow.md` completes. The phase checkpoint and
plan update follow.

### S3.9 Intentionally-red aggregate suites

The suites below are red or partly red at the S3 base commit. Do not fix them in
S3 and do not call the whole suite green on a raw exit code.

- The scripts suite holds the `remediate-concept-blueprints` honest-count failure
  and the `vinext-oxc-gates-script` failures.
- The audit suites hold the five baseline failure keys.
- IM3 typecheck holds the same 55 baseline diagnostic lines. IM3 tests hold 218
  baseline failures and BM2 tests hold 7.
- The BM2 bundle audit fails at baseline on `Total dist/server`. A bigger size with
  the same entry is allowed. A new over-budget entry or a changed budget stops the
  phase.
- `npm audit` holds the baseline high advisory IDs. A new critical or high ID stops
  the phase for a report.

GREEN uses the targeted commands of S3.3. An aggregate failure with only baseline
keys is accepted and recorded in `evidence.md` with its log path.

### S3.10 Artifact checks versus live behavior checks

| Artifact check | Live complement |
|----------------|-----------------|
| zod check prints `typeof z.toJSONSchema === 'function'` | Main case 2 calls `z.toJSONSchema` and parses the request body |
| `tech-stack.md` dated note on the helper and the teacher summary | Cases 1 to 13 |
| `evidence.md` Fix (a) limit note, if any | Fix (a) robustness tests |
| S2 Verify grep ignores the case-9 fixture lines | Finding (e) N2 and the case-9 live test |
| Export diff of `src/index.ts` and the `./structured` subpath | A package test imports each new export and calls it |
| `plan.md` test-first notes for the Fix group | The Fix group runs at Red with recorded assertion lines |

A phase that holds only artifact checks fails acceptance. An artifact grep is a
complement, never the proof.

### S3.11 Adversarial list for the adversarial role

Run each attack against the Red and Green trees. Do not change an adversarial
assertion.

| ID | Attack | Defense and falsification |
|----|--------|---------------------------|
| ADV-S3-1 | Mock ignores the request and returns valid JSON, so no real `response_format` is sent. | Parse the request body. Fails if `response_format` lacks `name`, `strict: true`, or the schema. |
| ADV-S3-2 | The helper throws, and a broad catch hides the failure behind deterministic feedback. | Assert the typed `reason` and the exact reasons that trigger a fallback (case 4 to 8, 10, 15). Fails on a throw or a silent reason. |
| ADV-S3-3 | Put a name and email in `LessonErrorSummary`. | Case 17 and the teacher no-PII test. Fails if either value appears. |
| ADV-S3-4 | Put person details in the BM2 lesson markdown. | Fix 1. Fails if a value appears or the later math text is gone. |
| ADV-S3-5 | Put a detail label directly before math text. | Finding (a). Fails if the strip removes the math. |
| ADV-S3-6 | Corrupt the score or a list. | Spreadsheet cases. Fails if the score leaves 0 to 40 or a list holds more than 3 items. |
| ADV-S3-7 | Add `zdr` or another provider field to a non-PII structured request. | Case 3. Fails on any field besides `require_parameters`. |
| ADV-S3-8 | Put the raw key in a cache key, a log, or a debug line. | Findings (c) and (e) N1, and case 11 of S2. Fails if the key value appears. |
| ADV-S3-9 | Echo a bare API key as the served model. | Finding (b). Fails if the bare key form is recorded as a model. |
| ADV-S3-10 | Put one role's provider in another role's cache entry. | Finding (e) N3. Fails if the second role gets the first role's model. |

### S3.12 Anti-pattern coverage

The catalog holds A1 to A12. Each row gives an S3 defense and a falsification condition.

| Anti-pattern | S3 defense | Falsification |
|--------------|-----------|---------------|
| A1 substring-as-structured-signal | Cases 4, 5, 7, and 8 assert the `reason` field. Finding (b) parses the labeled model field. | Replacing a field assertion with `includes('json')` or a digit match fails review. |
| A2 consent-blind publish gate | Not applicable. S3 publishes nothing. The PM release gate of S3.0 is a human gate, not a publish automation. | A publish gate added in S3 is out of scope and fails review. |
| A3 digit-only as labeled count | Case 6 and case 7 assert call counts as labeled integers. The score clamp uses a labeled value. | A regex that matches any digit fails review. |
| A4 vacuous-pass on nothing-done | The Fix filter runs Fix 1 first. The `structured output` describe holds 9 cases. A skipped or empty run is invalid. | A run with zero executed cases fails the mid-red gate. |
| A5 false-claim text vs test reality | Each `evidence.md` claim names a log path. The orchestrator re-runs the cited command. | A claim with an absent log or a non-zero command fails the artifact check. |
| A6 registry-note overstatement | No `measure/tracks.md` claim of structured output before Red and Green pass, or while the PM gate is closed. | A claim while a main case is red fails review. |
| A7 over-broad filter swallowing real hits | `'S3 fix'`, `'structured output'`, and `'no-PII'` target named describes. No bare-English-word exclusion. Gate compare is per key. | A filter that drops a case or a workspace-level compare fails review. |
| A8 `[ ]` marker ambiguity | The live smoke task stays `[b]`. The two Fix tasks use `[ ]`, `[~]`, and `[x]` structurally. | A `[ ]` task counted as in progress or a `[b]` task automated fails review. |
| A9 pre-existing test references archived track paths | No test reads `measure/tracks/vinext-oxc-toolchain_20261114/`. Use `measure/archive/...` only in documents. | A test path that breaks after an archive move fails the path check. |
| A10 generated-facts drift | Never stage the six dirty generated files. Check `git status --porcelain` at the S3 capture. | A staged generated file or a capture with another modified file stops the capture. |
| A11 missing live contract-test suite | The Fix group, cases 1 to 18, the four no-PII tests, and the probe are live tests. Artifact greps are complements. | A phase that relies only on evidence text fails acceptance. |
| A12 missing supervisor peer-review rule | Not applicable. S3 touches no `AGENTS.md` and no supervisor. | A change to either file in S3 is out of scope and fails review. |

### S3.13 `phase_base_sha` capture point for S3

1. This S3 strategy commit lands first. It holds `test-strategy.md` only. It must
   land right after the
   `measure(plan): Mark phase 'Phase S2: Role-based model configuration' as complete`
   commit.
2. **Captured point.** Immediately after that strategy commit, before any other S3
   commit, run `git status --porcelain`. Only these entries may appear, each with
   status ` M`:
   `apps/bus-math-v2/lib/workbooks-manifest.json`, the four
   `apps/*/.next/types/routes.d.ts` files, and `measure/generated/routes.md`.
   `measure/runs/` is gitignored. Any staged file, untracked file, or other modified
   file stops the capture.
3. Run `git rev-parse HEAD`. Store the value as `phase_base_sha` for S3 in the
   orchestrator run log and the role handoff. Do not write it into `plan.md`,
   `spec.md`, or this file.
4. The S2 checkpoint SHA and the base HEAD of this strategy role predate this
   commit. Neither is the S3 `phase_base_sha`. No SHA in this file is the S3
   capture point.
5. Capture before the first S3 task commit, which is Fix 1 of S3.0.
6. An S3 `phase_base_sha` that is not a descendant of this strategy commit is
   invalid. Stop and report.

### S3.14 emulate decision

Same decision as S2. Do not adopt `npx emulate --service ai`. No `emulate` binary or
dependency is present. S3 keeps the pinned `vi.mock('@openrouter/sdk')` fakes and
the local mock server.

### S3.15 Plan drifts and defaults for S3

| ID | Finding | Default |
|----|---------|---------|
| F16 | The two S3 Fix tasks precede the S3 Contract task. | Red starts with the Fix group. Fix 1 runs first. Do not reorder. |
| F17 | The four no-PII tests may pass at Red. | Record them as guards. The Red proof is the Fix group and main cases 1 to 18. |
| F18 | `evidence.md` holds `zod check: TBD` from S1. | Run the plan zod check in S3. Record the version and `function`. |
| F19 | `stripPersonDetails` lives in IM3 today. | Reuse the IM3 behavior for BM2. Move it to a package only when no new layer is needed. Keep one implementation. |
| F20 | The 6 spreadsheet-feedback tests are changed in place. | Change only the mock and keep every expected result. Record any assertion change in `plan.md`. |
