# Evidence: openrouter-sdk-ai-layer_20261114, Phase S1

Track: `openrouter-sdk-ai-layer_20261114`.
Phase: `Phase S1: Adopt the OpenRouter SDK`.
Strategy: `test-strategy.md` r1 (2026-11-20). Scope: Phase S1.

## SDK API

Source: the installed files of `@openrouter/sdk` 1.5.125 only (range `^1.5.102`
resolved to 1.5.125 at install; lockfile entry `sdk-1.5.125.tgz`). No guesswork.
The package has no `docs/` folder; the `.d.ts` files under `esm/` are the
reference. `FUNCTIONS.md` holds no `chat.send` section, so it is not a source.

- Client constructor: `new OpenRouter(options?: SDKOptions)` (`esm/lib/config.d.ts`,
  `esm/sdk/sdk.d.ts`). `SDKOptions`: `apiKey` (string or async function),
  `httpReferer`, `appTitle`, `appCategories`, `httpClient`, `server`
  (`production` = `https://openrouter.ai/api/v1`), `serverURL` override,
  `userAgent`, `retryConfig`, `timeoutMs`, `debugLogger`.
- Retry off: `RetryConfig` is `{ strategy: "none" }` or `{ strategy: "backoff",
  backoff?, retryConnectionErrors? }` (`esm/lib/retries.d.ts`). The SDK retry
  layer can be turned off, so `withRetry` stays the only retry layer.
- Chat send method: `openRouter.chat.send(request, options?: RequestOptions)`
  (`esm/sdk/chat.d.ts`). Non-stream overload takes `{ chatRequest: { stream?:
  false } }` and returns `Promise<ChatResult>`. Request fields (`ChatRequest`,
  `esm/models/chatrequest.d.ts`): `model`, `models`, `messages` (required),
  `responseFormat` (`ChatFormatJsonSchemaConfig` and others), `provider`
  (`ProviderPreferences`), `temperature`, `topP`, `maxTokens`,
  `maxCompletionTokens`, `seed`, `stop`, and others.
- `ProviderPreferences` (`esm/models/providerpreferences.d.ts`): `requireParameters`,
  `zdr`, `sort`, `order`, `allowFallbacks`, and others. The outbound JSON uses
  snake_case (`require_parameters`).
- Request options for an `AbortSignal`: `RequestOptions` is `RequestInit`
  minus `method`/`body` (`esm/lib/sdks.d.ts`), so `options.signal` carries the
  signal. `timeoutMs` in `RequestOptions` sets the per-request timeout. The old
  `fetchOptions` wrapper is deprecated and flattened into `RequestOptions`.
- Response fields (`ChatResult`, `esm/models/chatresult.d.ts`): `choices`
  (`ChatChoice.message.content`: string or content blocks), the served `model`,
  `id`, `created`, and `usage` (`ChatUsage`: `promptTokens`,
  `completionTokens`, `totalTokens`, plus `cost` details).
- Error classes (`esm/models/errors/`): the base is `OpenRouterError` with the
  HTTP status in the field `statusCode` (not `status`), plus `body`, `headers`,
  `contentType`, and `rawResponse`. One subclass exists for each status
  (`BadRequestResponseError` 400 through `TooManyRequestsResponseError` 429 and
  others); `OpenRouterDefaultError` is the fallback. Transport errors
  (`httpclienterrors.d.ts`): `RequestAbortedError` (name field),
  `RequestTimeoutError`, `ConnectionError`, `UnexpectedClientError`,
  `InvalidRequestError`. The package depends on `zod` `^3.25.0 || ^4.0.0`;
  the error inbound schemas import `zod/v4`.
- Transport: `DEFAULT_FETCHER` in `esm/lib/http.js` calls the bare global
  `fetch(input[, init])`. `RUNTIMES.md` names evergreen browsers, Node.js 18/20/22,
  Bun 1+, and Deno 1.39. It does not name Cloudflare Workers. The workerd probe
  proves the SDK path inside workerd.

## Bundle sizes

Method: each `.js` file under `dist/server/` (recursive), raw bytes and gzip bytes
(`gzip -c <file> | wc -c`), plus totals. Full tables live in the gate logs
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/<label>/sizes-<app>.txt`.

### Baseline (label `baseline`)

Code tree: Contract commit `13e36a6d` (gate runs at `24083d4d`; the range
`13e36a6d..24083d4d` holds only the plan update, no code change).

- IM3: 233 `.js` files. TOTAL raw=3186769 gzip=943848.
  `dist/server/index.js`: raw=321900 gzip=74502.
  `dist/server/ssr/index.js`: raw=299876 gzip=93660.
  Full table: `gates/baseline/sizes-integrated-math-3.txt`.
- BM2: 346 `.js` files. TOTAL raw=7964342 gzip=2618621.
  `dist/server/index.js`: raw=1182087 gzip=672066.
  `dist/server/ssr/index.js`: raw=302523 gzip=94278.
  Full table: `gates/baseline/sizes-bus-math-v2.txt`.
- IM3 bundle audit (`step-bundle-size-im3.log`): exit 0, one entry only:
  `[OK] server/ssr/index.js → index.js: 292.85 KB (threshold: 700.00 KB)`.
  Gap (strategy F7): the audit patterns match a single entry, so the audit can
  pass without checking most files. The manual per-file size table above is the
  proof.
- BM2 bundle audit (`step-bundle-bm2.log`): exit 1, one entry:
  `[EXCEEDS] Total dist/server: 9104.97 KB (threshold: 3000.00 KB)`.
  This failure predates S1 and stays allowed with the same entry and a similar
  size (strategy section 9).

### After the change (label `green`)

Code tree: Green head `f64047da` (implementation commits `45256fca`, `22b4e233`,
`07975959`; the later commits change plan text only). The four app and package
builds of the `checks-all` gate exited 0 (`gates/green/build.exit`).

- IM3: 233 `.js` files. TOTAL raw=4028512 gzip=1077934.
  `dist/server/index.js`: raw=321900 gzip=74503.
  `dist/server/ssr/index.js`: raw=299876 gzip=93662.
  Full table: `gates/green/sizes-integrated-math-3.txt`.
- BM2: 346 `.js` files. TOTAL raw=8804933 gzip=2752552.
  `dist/server/index.js`: raw=1182087 gzip=672059.
  `dist/server/ssr/index.js`: raw=302523 gzip=94279.
  Full table: `gates/green/sizes-bus-math-v2.txt`.
- The two audited entry files are unchanged from baseline in raw bytes (gzip
  differs by at most 1 byte). Most of the total delta comes from hashed
  `_next/static/` chunk names and contents that differ between the two builds.
  This is a comparison of the two size tables
  (`gates/baseline/sizes-*.txt`, `gates/green/sizes-*.txt`).
- IM3 bundle audit (`gates/green/step-bundle-size-im3.log`): exit 0, one entry:
  `[OK] server/ssr/index.js → index.js: 292.85 KB (threshold: 700.00 KB)`.
  The F7 coverage gap stays: the audit patterns match one entry.
- BM2 bundle audit (`gates/green/step-bundle-bm2.log`): exit 1, two entries:
  `[EXCEEDS] Total dist/server: 9925.93 KB (threshold: 3000.00 KB)` and
  `[OK] server/index.js → index.js: 1154.38 KB (threshold: 2500.00 KB)`.
  The over-budget entry is the baseline entry with the same name and a similar
  size (9104.97 KB at baseline). No budget changed. No new over-budget entry
  appeared. The bundle audit step is not a new failure (see the gate result
  below).

## workerd probe

At baseline the `test:workerd` script does not exist (finding F2); the
`checks-all` baseline gate records the probe step as pending
(`gates/baseline/step-workerd-probe.log`, `workerd-probe pending` in
`gates/baseline/checks-all.steps`).

After S1 the probe passed. `npm run test:workerd --workspace=packages/ai-tutoring`
exited 0 and printed `workerd probe: probe-ok`. Log:
`measure/runs/openrouter-sdk-ai-layer_20261114/workerd-probe-s1.log`. The
`checks-all` gate also ran the script (`gates/green/step-workerd-probe.log`,
exit 0, `workerd-probe 0` in `gates/green/checks-all.steps`). The probe runs the
real SDK client inside workerd against the local mock server; no fetch fallback
exists in `packages/ai-tutoring/src/`.

## zod check

TBD (belongs to S3; the S1 baseline only records that `zod` is not yet a declared
dependency of `packages/ai-tutoring`).

## Live smoke test

TBD. This is a manual, human-gated step in S4. It is not part of CI.

## Baseline gate results (label `baseline`)

Gate logs: `measure/runs/openrouter-sdk-ai-layer_20261114/gates/baseline/`.
Each gate ran record-only (`NEWFAIL=0` by rule). Future labels compare per
diagnostic key (strategy section 5), not per workspace.

- `lint` gate: `format-check` 0; `lint` exit 0 in all 4 workspaces
  (`lint.exit`, `lint.steps`, `step-format-check.log`).
- `checks-all` gate (`checks-all.steps`, `typecheck.exit`, `audit.txt`,
  `audit.json`, `build.exit`):
  - `typecheck`: ai-tutoring 0, practice-core 0, bus-math-v2 0,
    integrated-math-3 1. The IM3 keys are file + `TS` code (55 diagnostic
    lines): `__tests__/convex/quadratic-formula-server-writer.test.ts` TS2305
    (9), `__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx`
    TS2322 (9), `__tests__/convex/quadratic-formula-allocation.test.ts` TS2305
    (8), `__tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx`
    TS2322 (8), `__tests__/curriculum/lesson-1-6-binding-projection.test.ts`
    TS2352 (3), `__tests__/components/activities/algebraic/StepByStepSolverActivity.test.tsx`
    TS2322 (3), `app/api/activities/quadratic-formula/attempt/route.ts` TS2339
    (2), `__tests__/lib/activities/server-grading-quadratic-formula.test.ts`
    TS2353 (2) and TS2305 (2), `app/api/activities/quadratic-formula/check/route.ts`
    TS2339 (1). Log: `typecheck-integrated-math-3.log`.
  - `boundary` 0, `ci-check` 0, `tree` 0.
  - `audit`: critical=0 high=9 moderate=7 low=5 (`audit.txt`, `audit.json`).
  - `build`: exit 0 in all 4 workspaces.
  - `workerd-probe`: pending (see above).
- `test` gate (`test.exit`, `test.steps`):
  - ai-tutoring 0: 4 files, 75 tests pass (`test-ai-tutoring.log`).
  - practice-core 0 (`test-practice-core.log`).
  - integrated-math-3 1: 37 files fail, 523 pass (560); 218 tests fail, 6845
    pass, 5 skip (7068). Failing files (test file + test title is the key;
    full list): the two quadratic-formula renderer suites, the graphing
    explorer/table suites, `StepByStepSolverActivity`, `StepByStepper`,
    quadratic-formula convex suites (server-writer 58, allocation 36),
    learningEvidence red suites, lesson-1-6 suites, seed suites, and the
    server-grading quadratic-formula suites (`test-integrated-math-3.log`).
  - bus-math-v2 1: 4 files fail, 395 pass (399); 7 tests fail, 2688 pass
    (2695). Keys: `SubmissionDetailModal.test.tsx` (footer callout),
    `learningEvidence-bounded-authority.red.test.ts` (3),
    `bm2-manual-source-production-flow.test.ts` (1),
    `teacher-consumer.red.test.ts` (2) (`test-bus-math-v2.log`).
  - `scripts-suite` 1: `remediate-concept-blueprints.test.ts` (honest-count
    case, strategy section 9) plus `vinext-oxc-gates-script.test.ts` (26
    cases, pre-existing) (`step-scripts-suite.log`).
  - `audit-suites` 1: 2 files fail, 4 pass (6); 5 tests fail, 187 pass (192).
    Keys: the three app-coverage cases, the full-report case, and the PTE
    vitest invariant case (`step-audit-suites.log`).
- Gate-script fix after the baseline: `sizes_step` splits one `local` line into
  two (an unbound-variable fault under `set -u` wrote `sizes-.txt`) and the
  totals `awk` now strips the `raw=`/`gzip=` prefixes before it sums. The
  baseline size files above were regenerated with the fixed script from the
  unchanged baseline `dist/` trees. The step logs still name the fault; the
  size tables are the corrected record.

## npm audit baseline

- critical=0 high=9 moderate=7 low=5, total 21 (`gates/baseline/audit.txt`).
- High entries (`gates/baseline/audit.json`, `vulnerabilities`): brace-expansion,
  browserslist, fast-uri, miniflare, sharp, undici, wrangler, ws,
  @cloudflare/vite-plugin. None is direct. A new critical or high advisory ID
  at a phase gate is a new failure (strategy F8).

## Baseline failure keys

Per-key comparison per strategy section 5; a workspace-level pass or fail
is not the unit of comparison. The keys are listed in the gate-results
section above.

## Green gate results (label `green`)

Each gate ran with label `green` and compared per key with label `baseline`
(strategy section 5). Driver logs and exit files live under
`measure/runs/openrouter-sdk-ai-layer_20261114/`.

- `lint`: exit 0, `NEWFAIL=0` (`gates-green-lint.driver.log`,
  `gates-green-lint.exit`). All four workspaces exit 0 and `format-check`
  exits 0 (`gates/green/lint.exit`, `gates/green/lint.steps`).
- `checks-all`: exit 0, `NEWFAIL=0` (`gates-green-checks.driver.log`,
  `gates-green-checks.exit`). Typecheck: ai-tutoring 0, practice-core 0,
  bus-math-v2 0, integrated-math-3 1 with the same 55 diagnostic lines as
  baseline (`gates/green/typecheck.exit`,
  `gates/green/typecheck-integrated-math-3.log`). boundary 0, ci-check 0,
  tree 0 (`gates/green/checks-all.steps`). Audit: critical=0 high=9
  moderate=7 low=5 (`gates/green/audit.txt`). The nine high advisory IDs are
  the same as baseline (`gates/green/audit.json`, `gates/baseline/audit.json`).
  Builds exit 0 in all four workspaces (`gates/green/build.exit`). Bundle
  audits, size tables and the workerd probe are recorded above.
- `test`: exit 0, `NEWFAIL=0` (`gates-green-test.driver.log`,
  `gates-green-test.exit`). ai-tutoring 0 (81 tests pass), practice-core 0,
  integrated-math-3 1 (218 failures, 6846 pass, 5 skip), bus-math-v2 1
  (7 failures, 2689 pass), scripts-suite 1 (27 failures), audit-suites 1
  (5 failures). Each failure key matches a baseline key
  (`gates/green/test.exit`, `gates/green/test.steps`, and the step logs).

## Green behavior tests

- Targeted RED_TEST_COMMAND after the implementation: 6 passed, 75 skipped,
  exit 0. Log: `measure/runs/openrouter-sdk-ai-layer_20261114/green-red-rerun.log`.
  Red r2 changed only the mock setup (`c6a0627f`); all six assertions stayed.
- GREEN_TEST_COMMAND: exit 0. ai-tutoring 81/81, BM2 17/17, IM3 11/11 pass.
  Log: `measure/runs/openrouter-sdk-ai-layer_20261114/green-test-command.log`.
- `npm run format:check` exit 0; `npm run typecheck --workspace=packages/ai-tutoring`
  exit 0; `npm run lint --workspace=packages/ai-tutoring` and both app lint
  commands exit 0. These ran directly in the session; the gate logs above are
  the audit record for the same commands.

## Docs & Doctor (S1)

- `npm run generate`: exit 0. Log:
  `measure/runs/openrouter-sdk-ai-layer_20261114/generate-s1.log`.
- `npm run doctor`: exit 0 with the line `[doctor] All checks passed`. Log:
  `measure/runs/openrouter-sdk-ai-layer_20261114/doctor-s1.log`.
- F5 deviation: `npm run generate` did not fix the `../../../daniel-bo/...`
  paths in `measure/generated/routes.md`. That file is not staged.
  `tech-debt.md` has 50 lines, the limit, so no row was added.

## Phase S2: role-based model configuration (Green)

### F1 documented 200 bodies

The F1 tests drive the real OpenRouter SDK through a mocked `globalThis.fetch`.
They do not stub `chat.send`. The two bodies and their results follow.

- F1a body: the OpenRouter documented example, verbatim. It holds `choices`
  with `finish_reason`, `native_finish_reason`, and `message.content`
  `"Hello there!"`, plus a snake_case `usage` object and `model`.
  Before: the SDK threw `OpenRouter API error: 200 Response validation failed`,
  because the strict inbound schema requires fields that the example omits.
  After: `recoverValidatedBody` reads the rejected body from the SDK error
  `rawValue` and returns the content. The provider resolves to `Hello there!`
  with one fetch call. Log: `green-s2-targeted-F1.log`.
- F1b body: a 200 body that holds only
  `{"error":{"code":503,"message":"Service unavailable"}}` and no `choices`.
  Before: the SDK rejected the body once and the provider threw a 200 API error
  after one fetch call. After: the missing content gives an
  `EmptyResponseError`; `withRetry` retries it. An unreadable response body on
  a retry also maps to `EmptyResponseError`. The provider throws
  `EmptyResponseError` after three fetch calls. Log: `green-s2-targeted-F1.log`.

### F10 case-insensitive Bearer strip

Before: the strip matched only the exact prefix `Bearer `. Keys configured as
`bearer <token>` or `BEARER  <token>` left the token in a mapped error.
After: a case-insensitive scheme match with `^bearer\s+` removes the scheme and
all following whitespace. Both echoed tokens are redacted. Log:
`green-s2-targeted-F10.log`.

### S2 Green gate evidence

- Targeted `RED_TEST_COMMAND`: 12 passed, 115 skipped, exit 0.
  Log: `green-s2-targeted-role.log`.
- F1 filter: 4 passed, exit 0. F10 filter: 2 passed, exit 0.
  Logs: `green-s2-targeted-F1.log`, `green-s2-targeted-F10.log`.
- `S2_GREEN_TEST_COMMAND`: ai-tutoring 127/127 pass, practice-core 263/263
  pass; BM2 and IM3 keep their baseline failure keys (7 and 218). Logs:
  `green-s2-package-test.log`, `green-s2-test-practice-core.log`,
  `green-s2-test-bm2.log`, `green-s2-test-im3.log`.
- workerd probe: `probe-ok`, exit 0. Log: `green-s2-workerd.log`.
- Gate sweeps with label `s2`: `lint`, `test`, and `checks-all` each exit 0
  with `NEWFAIL=0`. Results: `gates/s2/`. Driver log: `green-s2-gates.exit`.

### Remediation r2 (Reviews A, B, C on HEAD 1f266be2)

- RA1 (blocker, Review A): `resolveRoleModel` returned the trimmed value. It now
  returns the configured value unchanged. A blank or whitespace-only value
  still gives `reason: 'missing'`, and a preset is still rejected. The new
  `model value preservation` test failed first with
  `'vendor/model-padded'` where `'  vendor/model-padded  '` was required. After
  the fix the package suite is 129/129. Log:
  `green-s2-r2-before-fix.log`, `green-s2-r2-package-test.log`.
- B1 (blocker, Review B): Red case 8 asserted `toContain("preset")` on joined
  log lines. The test now parses the logged JSON record and asserts the
  structured fields `role`, `missing`, and `reason: 'preset'`. This is a
  test-only edit to a committed Red assertion, routed and disclosed by the
  orchestrator. The behavior in `roles.ts` was already correct.
- N4 (Review B) and F1 (Review C): a new package-level test imports
  `AI_ROLES`, `resolveRoleModel`, `buildProviderPreferences`, and the `AiRole`
  type from `src/index.ts`, and `logAiRequest` from `src/usage-log.ts`. It calls
  each value and checks the entry-point wiring. `logAiRequest` stays off the
  public entry so the export diff keeps only the four planned exports.
  Log: `green-s2-r2-package-test.log`.

### Remediation r3 (adversarial findings on HEAD a34ab162)

- ADV-S2-1: both resolvers check the API key and role model before a cache hit.
  The cache is keyed on role, key value, and model value. Removing either
  setting now fails closed and logs the exact missing variable on the next call.
- ADV-S2-2: the F1 recovery path trims content, so the strict body and the
  documented-shape body return the same answer.
- ADV-S2-3: a usage record accepts a served model only when it matches a bounded
  model identifier. Other text is recorded as null. Prompt, answer, and key text
  from an unexpected response model no longer reach the record.
- ADV-S2-4: the IM3 chatbot strips person-detail clauses and email addresses
  from lesson markdown before it assembles the system message. The math text
  stays. The studentTutor role keeps no provider object.
- ADV-S2-5: HTTP errors carry only the status in the error text. Both chatbot
  routes log status and role, never the upstream message or body. The S1 short
  key test now uses the connection path, where message text is still retained.
- Test-first proof: the six adversarial tests failed before the fix per
  `adversarial-a34ab162.json`. After the fix the package suite is 141/141 and
  the IM3 chatbot suite is 14/14. Logs: `green-s2-r3-package.log`,
  `green-s2-r3-im3.log`. No adversarial assertion changed.

### Remediation r4 (Reviews A and C F1 on HEAD 15c1d523)

- F1: `stripPersonDetails` removed every character from a personal-detail
  label through the next label or the end of the lesson markdown. A detail
  label followed by math text on the same line or on later lines removed that
  math text. The clause matcher now stops at the first line break, sentence
  end, or next label. Later lesson text stays.
- Test-first proof: the new `route.pii-scope.test.ts` failed before the fix;
  the system message held no lesson math. After the fix the IM3 chatbot suite
  is 15/15 and the package suite is 141/141. The six adversarial tests still
  pass. Logs: `green-s2-r4-before-fix.log`, `green-s2-r4-im3.log`,
  `green-s2-r4-package.log`. No adversarial assertion changed.

### S3 Fix group (2026-11-23)

- Fix 1: the BM2 lesson-chatbot route passes the student account values to
  the shared `assembleLessonChatbotContext`. That function applies the single
  person-detail strip before HTML stripping. The captured prompt holds no
  fixture value and keeps both math sentences.
- Finding (a): the single strip covers colon, dash, em-dash, and fullwidth
  colon labels, generic capitalized labels, obfuscated email, and known
  account values. Accepted limit: a teacher-authored lesson line that starts
  with a capitalized `Word:` label is treated as a detail clause. Math on
  that line would be removed. No live fixture uses that form. All six
  committed forms pass, and the later math lines stay.
- Finding (b): the validator rejects key-shaped `sk-` tokens and records an
  invalid served model as null. The plan line that requires strict
  configured-model equality conflicts with S2 case 3, which records
  `served-model-r2` for configured model `vendor/model-a`. The key-form
  rejection satisfies both the S2 assertion and the bare-key test.
- Finding (c): the cache key holds role and model only. The cached entry
  holds the key value and is compared on every call. A removed key fails
  closed, and a rotated key creates a new provider.
- Finding (d): both rate-limit catches log role and status only. The raw
  error object reaches no console call.
- Finding (e) N1: the SDK gets a redacting debug logger when
  `OPENROUTER_DEBUG` is set. Every logged value is redacted before it
  reaches a console call, so the auth header never prints.

### S3 main group (2026-11-24)

Implementation commits: `d156ce06` (helper), `66d1ed25` (spreadsheet
feedback), `54f8c772` (teacher summary). Role base `3e0e1d50`. Phase base
`55e7952b`. The Mid Red fixture fix is `ff30c052`.

**zod check.** The installed version is 4.6.7. Running
`import('zod').then((z) => console.log(typeof z.toJSONSchema))` in
`packages/ai-tutoring` prints `function`. `z.toJSONSchema(z.strictObject(...))`
gives `additionalProperties: false` and a `required` list with every field.

**Targeted commands.**

- `CI=true npm run test --workspace=packages/ai-tutoring -- -t 'structured output'`:
  at the S3 base 8 failed, 1 passed, 147 skipped. All 8 failures were the
  existence guard. After Green: 9 passed, 147 skipped, exit 0.
- `spreadsheet-feedback` (BM2): at Red 5 failed, 5 passed. After Green:
  10 passed, 2706 skipped, exit 0.
- `teacher AI error summary` (BM2): at Red 8 failed. After Green: 8 passed,
  2708 skipped, exit 0.
- `GET /api/teacher/ai-error-summary` (BM2): at Red 1 failed, 11 passed.
  After Green: 12 passed, 2704 skipped, exit 0.
- `no-PII` (BM2): at Red 2 failed, 1 passed. After Green: 3 passed,
  2713 skipped, exit 0. The IM3 guard passes.

**Four-workspace suite.** The package suite is 156 of 156. `practice-core`
is 263 of 263. BM2 is 7 failed and 2709 passed; IM3 is 218 failed, 6857
passed, and 5 skipped. Those failure counts are the S3.9 baseline counts.
Logs: `/tmp/green-s3-*.log` and the gate logs named below.

**Gate sweeps.** Each `GATES_BASE=s2 bash
measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh <gate> s3` exits 0
with `NEWFAIL=0` for `lint`, `test`, and `checks-all`. Results are under
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/s3/`. The audit line is
`critical=0 high=5 moderate=6 low=5`, unchanged from the s2 base. The
workerd step answers `workerd probe: probe-ok`. The `bundle-bm2` step keeps
the documented baseline exit of 1. `npm audit` reports 5 low, 6 moderate,
and 5 high, with no critical advisory.

**Gate maintenance.** The `key()` function of `gates.sh` matched the word
`error` inside vitest `stdout |` framing headers. Passing tests of the new
teacher describe printed one usage record each, so the first test sweep
reported two new diagnostic keys. The filter now drops lines that start
with `stdout | ` or `stderr | `. It still keeps every `FAIL`,
`AssertionError`, and TypeScript diagnostic; a sanity check counts 13 of
those keys in the s3 BM2 log. A resumed sweep then reports `NEWFAIL=0`.

**Accepted limits.**

- **Provider serialization, fixed in remediation r5.** The helper sets the
  outbound-shaped `provider.require_parameters` at the SDK boundary, as Red
  case 3 requires. SDK 1.5.128 reads the camelCase `requireParameters` key by
  name when it parses the request, so the helper also sets that key as a
  non-enumerable property. The boundary object keeps only the outbound key,
  and the SDK remaps the camelCase key onto the wire. R-A1 captures the real
  fetch body and asserts `provider.require_parameters === true`. The earlier
  claim that the body held `provider: {}` is retired.
- The teacher generator sends no request when `totalParts` is 0, as case 16
  requires. The Mid Red fixture fix supplies one neutral part so the no-PII
  test captures a prompt. Case 16 is unchanged.
- F3, F4, F6, and F7 of the S2 next-phase list stay open for a later phase.
  The S3 Fix group of this same phase does change the strip, the served-model
  rule, the cache key, and the rate-limit logs; see "S3 Fix group" above.

**Final log.** `measure/runs/openrouter-sdk-ai-layer_20261114/green-s3-3e0e1d50.log`.

### S3 remediation r5 (2026-11-24)

Role base `e0268a3e`. Phase base `55e7952b`. Red commits `36b27a50`
(tests) and `e0268a3e` (log). No dependency change in this round.

**R-A1 — wire provider preference.** The helper now sets the camelCase
`requireParameters` key as a non-enumerable property beside the outbound
`require_parameters` key. The SDK boundary object keeps only the outbound
key, so Red case 3 still compares `{ require_parameters: true }`. SDK 1.5.128
reads the camelCase key by name and remaps it, so the serialized body carries
`provider.require_parameters: true`. The Red R-A1 case captures the real
fetch body and asserts that field. The earlier accepted limit that recorded
`provider: {}` is retired from the previous section.

**R-B1 — served-model validation.** The `safeModel` validator of
`providers.ts` is now exported and reused in `structured.ts`. It is applied
when the helper reads the served model and in both usage-log calls. A
key-shaped served model gives `model: null` and never reaches the console. A
valid model passes through unchanged. No second validator was added.

**Tests.** `CI=true npm run test --workspace=packages/ai-tutoring -- -t 'S3 remediation'`:
at Red 2 failed and 156 skipped; after Green 2 passed and 156 skipped, exit
0. The full package suite is 158 of 158. BM2 targeted filters pass:
`spreadsheet-feedback` 10 passed, `teacher AI error summary` 8 passed,
`no-PII` 3 passed.

**Gates.** `GATES_BASE=s2 ... gates.sh <lint|test|checks-all> s3` each exits
0 with `NEWFAIL=0`. The workerd probe answers `probe-ok`. The audit line stays
`critical=0 high=5 moderate=6 low=5`. `bash measure/doctor.sh`, package
typecheck, package lint, and `oxfmt --check` pass at the final source tree.

**Gate note from Red.** The scripts-suite ENOENT key did not appear as a new
key. The s2 and s3 scripts-suite logs had equal key sets; no `/tmp` suffix
normalization was needed and `gates.sh` was not changed in this round.

**Nonblocking findings.** Review B F2 (short known-details strip), F3 (BM2
rate-limit status null), and F4 (teacher route raw error log) are recorded in
`measure/tech-debt.md`. This round does not fix them.

**Final log.** `measure/runs/openrouter-sdk-ai-layer_20261114/green-s3-r3-<shorthead>.log`.

### Review B F2 to F4 — carried debt

See `measure/tech-debt.md`, section "S3 remediation r5".

### S3 remediation r4 (2026-11-24)

Role base `8eee12fc`. Phase base `55e7952b`. Review C passed Reviews A and
B at the role base and found one blocker. No dependency change in this round.

**Review C F1 — internal validator.** `safeModel` was exported from
`providers.ts`, which the package exposes through the `./providers` subpath.
That widened the package API beyond the S3 plan. Commit `43f08c9d` moves
`MODEL_ID` and `safeModel` into `src/model-id.ts`. The new module is not in
`package.json` exports and is not re-exported from `index.ts`. Both
`providers.ts` and `structured.ts` import the same internal function, so one
implementation remains. The planned structured exports are unchanged. No
existing test imports `safeModel` through a public path. Behavior is
unchanged; no assertion was edited.

**Tests.** The full package suite is 158 of 158, including both S3
remediation cases and the findings (b) tests. BM2 targeted filters pass:
`spreadsheet-feedback` 10 passed, `teacher AI error summary` 8 passed,
`no-PII` 3 passed. IM3 `-t 'S3 fix'` passes 7 cases with 7073 skipped.

**Gates.** `GATES_BASE=s2 ... gates.sh <lint|test|checks-all> s3` each exits
0 with `NEWFAIL=0`. The workerd probe answers `probe-ok`. The audit line stays
`critical=0 high=5 moderate=6 low=5`. `bash measure/doctor.sh`, package
typecheck, `oxlint`, and `oxfmt --check` pass at the final source tree.

**Final log.** `measure/runs/openrouter-sdk-ai-layer_20261114/green-s3-r4-<shorthead>.log`.

### S3 adversarial r5b (2026-11-24)

Role base `b39b1c57`. Phase base `55e7952b`. Adversarial review at
`b0bb87d4` found two blockers. No dependency change in this round.

**ADV-S3-5 — empty detail label.** The detail separator previously let
`\s*` consume the newline after a label such as `Teacher:`. The lazy detail
body then consumed the first math line. Commit `2d1c875e` changes the
separator to consume horizontal space only. A newline ends the clause, so
only the label and its own value are removed. The test that sends
`Teacher:\n<math>\n<math>` now keeps both math lines. The six earlier strip
forms and the S3 Fix strip tests remain green.

**ADV-S3-8 — structured debug output.** The redacting debug logger moved to
the internal module `src/debug-logger.ts`, which is not a package export.
Both the chat path and the structured client import it. The logger replaces
object arguments with `[body redacted]`, so request and response bodies
never reach the console. Header strings keep the existing key redaction.
The adversarial test confirms that the key, prompt, and answer are absent.

**Accepted limit.** With `OPENROUTER_DEBUG` on, debug output no longer holds
request or response bodies. Header names, status, and the redaction marker
remain. This is a deliberate trade: diagnostics stay, text content does not.

**Tests.** Both adversarial cases pass. The full package suite is 165 of
165. BM2 targeted filters pass: `spreadsheet-feedback` 13 passed,
`teacher AI error summary` 8 passed, `no-PII` 5 passed. IM3 `-t 'S3 fix'`
passes 7 cases and `-t 'no-PII'` passes 1 case.

**Gates.** `GATES_BASE=s2 ... gates.sh <lint|test|checks-all> s3` each exits
0 with `NEWFAIL=0`. The workerd probe answers `probe-ok`. The audit line stays
`critical=0 high=5 moderate=6 low=5`. `bash measure/doctor.sh`, package
typecheck, `oxlint`, and `oxfmt --check` pass at the final source tree.

**Gate maintenance.** The `key()` filter of `gates.sh` now drops lines that
start with `[ai-tutoring] request `. Those lines are usage records; their
JSON carries `outcome: "error"` for a handled request and is not a test
diagnostic. FAIL, AssertionError, and TypeScript diagnostics remain.

**Environmental note.** The first sweep ran at 00:49 UTC. Three IM3
`queue/sessions` tests failed because they assume `now - 1h` is the same UTC
day. A direct rerun at 01:02 UTC passed all 13 cases, and a full rerun of the
test gate then reported `NEWFAIL=0`. No source change was made for that flake.

**Final log.** `measure/runs/openrouter-sdk-ai-layer_20261114/green-s3-r5b-<shorthead>.log`.
