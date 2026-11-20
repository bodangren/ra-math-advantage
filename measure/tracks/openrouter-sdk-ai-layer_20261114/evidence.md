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

### After the change (label `s1`)

TBD.

## workerd probe

At baseline the `test:workerd` script does not exist (finding F2); the
`checks-all` baseline gate records the probe step as pending
(`gates/baseline/step-workerd-probe.log`, `workerd-probe pending` in
`gates/baseline/checks-all.steps`).

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
