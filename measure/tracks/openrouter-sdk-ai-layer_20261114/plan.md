# Implementation Plan: OpenRouter SDK AI Layer

Track: `openrouter-sdk-ai-layer_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until `vinext-oxc-toolchain_20261114` is closed in `measure/tracks.md`.
This track uses the gates that the earlier track sets.

### Gate Commands

`<ws>` is each of `packages/ai-tutoring`, `packages/practice-core`, `apps/integrated-math-3`,
and `apps/bus-math-v2`.

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<ws>` |
| Typecheck | `npm run typecheck --workspace=<ws>` |
| Test | `CI=true npm run test --workspace=<ws>` |
| Build | `npm run build --workspace=apps/integrated-math-3` and `npm run build --workspace=apps/bus-math-v2` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |
| Tree | `npm ls --workspaces --depth=0` |
| Advisories | `npm audit --json` (no new critical or high finding) |
| workerd probe (from S1) | `npm run test:workerd --workspace=packages/ai-tutoring` |

A gate passes when it has no failure that the start of the phase did not have. "Run each
gate" in a Verify task means each row of this table.

### Test Doubles

- Package tests mock `@openrouter/sdk` with `vi.mock`, or mock `globalThis.fetch`.
- Route tests mock `@math-platform/ai-tutoring`, or mock `globalThis.fetch`, as the task says.
- No test calls the live OpenRouter API.

### No-PII Fixture

Each no-PII test defines its own fixture constant. The constant holds at least 2 names
(`Avery Quinn`, `Jordan Lee`), 2 emails (`avery.quinn@example.org`,
`jordan.lee@example.org`), 1 username (`aquinn42`), and 1 account ID (`k17pii0000account`).
The fixture puts these values in each identity field that the code path can read: session
claims, profiles, and summary records. The test captures the prompt or the messages that
reach the provider. It asserts that no captured string contains any fixture value.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

### Track Notes and Gates

- Gate: no student-facing release of the BM2 chatbot before the PII strip passes. (PM decision 2026-11-23)

## Phase S1: Adopt the OpenRouter SDK [checkpoint: 14f75797]
_Story ref: spec.md#story-s1_

_Orchestrator decisions (2026-11-20):_ Red owns Contract, Install, Test (Red), in
this order; Green owns Implement, Verify, Docs & Doctor. Install runs `npm install`
for `@openrouter/sdk` only. The gate script follows the archive pattern; each
baseline gate runs detached with an exit file. RED_TEST_COMMAND targets
`SDK transport` (6 cases, must fail on assertions, not on a missing module).
GREEN_TEST_COMMAND is the targeted three-workspace command. The two
`route.sdk.test.ts` files belong to Green.

_Orchestrator deviations (2026-11-21):_ (a) Red ran S1 Install, so Red changed
`packages/ai-tutoring/package.json` and `package-lock.json`. The orchestrator
assigned the task to Red and the PM accepted it. (b) Red left no `[~]` task.
Green set "S1 Implement — move the providers to the SDK" to `[~]` at the start
of the Green phase.

_Red retry r2 (`c6a0627f`):_ the SDK mock used `mockReturnValue`, which Vitest
4 rejects under `new`. Red changed only the mock setup.
Next-phase list (record-only, PM cap): Review A F2 (gates.sh accepts a missing current log), F3 (empty-response tests assert at least one call); Review B F1 (OPENROUTER_DEBUG logs the auth header; pass a redacting debugLogger), F2 (upstream text in HTTP error message), F4 (SDK release age), F5 (no test pins 429 order and 503 body), F6 (gates.sh compares audit counts, not IDs), F10 (Bearer strip is case-sensitive and removes one space).
Next-phase list (acceptance, record-only): Acceptance F1 (Major, fix first in S2 and before any deploy of S1 code: the SDK rejects HTTP 200 bodies the old transport accepted, including the OpenRouter documented example; a 200 error-only body no longer retries); F2 (gates.sh cannot see a new or larger [EXCEEDS] bundle entry); F3 (evidence.md bundle-growth text and stale gates/green citations); F4 (tech-stack.md lines 73, 77-79, 105 stale); F5 (no test pins that the non-HTTP path copies no SDK fields; the source-guard test of test-strategy.md section 8 is missing); F6 (three remediation rounds without an escalation key; plan pins test counts).

- [x] Task: S1 Contract — record the SDK API and the baseline `13e36a6`
    - [ ] Create `evidence.md` in this track folder with these sections: SDK API, Bundle sizes, workerd probe, zod check, Live smoke test.
    - [ ] In `measure/tech-stack.md` "Key Dependencies", add a dated row for `@openrouter/sdk` (workflow principle 2).
    - [ ] Build IM3 and BM2 on the start commit. Record the size of each `.js` file under `dist/server/`, raw and gzip (`gzip -c <file> | wc -c`), and the totals.
    - [ ] Run `npm run bundle-size:audit --prefix apps/integrated-math-3` and `npm run bundle:audit --workspace=apps/bus-math-v2`. Record the results.
- [x] Task: S1 Install — add the SDK and read its API `fa35361`
    - [ ] Add `"@openrouter/sdk": "^1.5.102"` to the `dependencies` of `packages/ai-tutoring/package.json`. Run `npm install`.
    - [ ] Read `node_modules/@openrouter/sdk/README.md`, `RUNTIMES.md`, and the `docs/` pages for `chat`. Read the `.d.ts` files under `esm/models/errors/`.
    - [ ] Record these facts in the "SDK API" section, from the installed files only: the client constructor options (API key, server URL, `httpReferer`, `appTitle`, retry settings, timeout).
    - [ ] Also record: the chat send method, its request fields (`model`, `messages`, `responseFormat`, `provider`, `temperature`, max tokens), and the request options for an `AbortSignal`.
    - [ ] Also record: the response fields for the content, the served `model`, and the token `usage`, and each error class with its HTTP status field.
    - [ ] Also record: whether the SDK sends requests through `globalThis.fetch`, and whether `RUNTIMES.md` names Cloudflare Workers.
    - [ ] Commit: `chore(deps): add @openrouter/sdk to ai-tutoring`.
- [x] Task: S1 Test (Red) — specify the SDK transport `3e10073`
    - [ ] In `packages/ai-tutoring/src/__tests__/providers.test.ts`, add `describe('SDK transport')`.
    - [ ] Normal case 1: with `@openrouter/sdk` mocked, `createOpenRouterProvider` calls the SDK chat send method with `model` and one user message, and returns the trimmed content.
    - [ ] Normal case 2: with the SDK mocked, `createOpenRouterProviderWithMessages` passes the messages without change.
    - [ ] Edge case 3: an SDK error with status 429, then a success, gives one retry and the success.
    - [ ] Edge case 4: an SDK error with status 400 gives no retry, and the thrown message starts with `OpenRouter API error: 400`.
    - [ ] Edge case 5: an SDK connection error is retried, as a network error is now.
    - [ ] Edge case 6: an external abort gives an `AbortError` and no retry.
    - [ ] Keep each existing test. If a test checks a transport detail that the SDK changes (for example the exact header set), change only that assertion. Record each change in this plan.
    - [ ] Apply the same rule to `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`. It calls `createOpenRouterProvider({ apiKey: 'test-key' })` and checks the `fetch` URL and body.
    - [ ] Run `CI=true npm run test --workspace=packages/ai-tutoring`. Confirm that cases 1 to 6 fail.
    - RED run (2026-11-21, role mid-red): `CI=true npm run test
      --workspace=packages/ai-tutoring -- -t 'SDK transport'` ran 6 cases, 6
      failed, 75 skipped. Cases 1, 2, 3, 5 reject with `TypeError: Cannot read
      properties of undefined (reading 'ok')` at `src/providers.ts:62` because
      production still calls `fetch` and the mocked SDK `chat.send` is never
      called. Case 4 rejects with that `TypeError` instead of
      `OpenRouter API error: 400`. Case 6 rejects with that `TypeError` instead
      of an `AbortError`. No `Cannot find module` failure. Log: `/tmp/red-run.log`
      (machine-local; the gate logs hold the Green rerun).
    - [ ] Commit: `test(ai-tutoring): specify the SDK transport (Red)`.
- [x] Task: S1 Implement — move the providers to the SDK `45256fca`
    - [ ] Create `packages/ai-tutoring/src/openrouter-client.ts`. It makes the SDK client from the API key and the base URL.
    - [ ] The client sends `httpReferer` `https://github.com/bodangren/ra-integrated-math-3` and `appTitle` `Integrated Math 3`, the same values as now.
    - [ ] Turn off the SDK retries. `withRetry` stays the only retry layer, with the same settings.
    - [ ] Keep the 15000 ms timeout and the external-signal link through an `AbortController`. Pass its signal through the SDK request options.
    - [ ] Map each SDK HTTP error to `Error('OpenRouter API error: <status> <message>')`. This keeps `isOpenRouterError`, `getErrorStatus`, and `withRetry` without change.
    - [ ] Map each SDK connection error to an `Error` whose message starts with `fetch failed:`, so `withRetry` retries it.
    - [ ] Map an SDK abort error to `new DOMException('Aborted', 'AbortError')`.
    - [ ] Keep `EmptyResponseError` for empty or whitespace content.
    - [ ] In `src/providers.ts`, replace each `fetch` call with the client. Keep each exported name and type of `src/index.ts`.
    - Green assertion changes (test-strategy section 6, "Keep each existing test"):
      - `packages/ai-tutoring/src/__tests__/providers.test.ts`: the 10 pre-SDK cases no longer assert global `fetch`. They stub the shared SDK client and assert the `chat.send` call and the client options. Old: `expect(mockFetch).toHaveBeenCalledWith("<url>/chat/completions", objectContaining({body: JSON.stringify({model, messages})}))`. New: `expect(OpenRouterCtor).toHaveBeenCalledWith(objectContaining({apiKey, httpReferer, appTitle, retryConfig, timeoutMs, serverURL}))` and `expect(legacySend.mock.calls[0][0].chatRequest.model).toBe(model)`. The 6 Red "SDK transport" cases are unchanged.
      - `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`: the mock fetch response now has a `text()` body with an SDK-valid `ChatResult` (`finish_reason`). Old: `expect(mockFetch.mock.calls[0][0]).toBe("<url>/chat/completions")`. New: `expect((mockFetch.mock.calls[0][0] as Request).url).toBe("<url>/chat/completions")`. The body asserts `model` and `messages`.
    - [x] Remediation r3 (Review A F1): status from `statusCode` wins over message text during retry classification `9193d28b`.
    - [ ] Commit: `feat(ai-tutoring): send OpenRouter requests through the SDK`.
- [x] Task: S1 Implement — prove the SDK in workerd `22b4e233`
    - [ ] Create `packages/ai-tutoring/workerd-probe/worker.ts`. Its `fetch` handler calls `createOpenRouterProvider` with the API key and base URL from `env`, and returns the provider text.
    - [ ] Create `packages/ai-tutoring/workerd-probe/wrangler.jsonc` with `compatibility_date` `2026-04-11` and `compatibility_flags` `["nodejs_compat"]`, the same as IM3.
    - [ ] Create `packages/ai-tutoring/workerd-probe/run.mjs`. It starts a mock OpenRouter server on `127.0.0.1:4299` that answers `/api/v1/chat/completions` with the content `probe-ok`.
    - [ ] `run.mjs` then starts `npx wrangler dev --config workerd-probe/wrangler.jsonc --port 4298` with `--var OPENROUTER_API_KEY:probe-key` and `--var OPENROUTER_API_BASE:http://127.0.0.1:4299/api/v1`.
    - [ ] `run.mjs` requests `http://127.0.0.1:4298/`, checks that the body is `probe-ok`, stops both processes, and exits with code 0 or 1.
    - [ ] Add `"test:workerd": "node workerd-probe/run.mjs"` to `packages/ai-tutoring/package.json`.
    - [ ] In `.github/workflows/ci.yml` job `packages`, add the step "Run workerd SDK probe" with `if: matrix.package == 'ai-tutoring'` and `run: npm run test:workerd --workspace=packages/ai-tutoring`.
    - [ ] If the probe fails because the SDK cannot run in workerd, stop the phase and report to the user. The fallback is the current `fetch` wrapper.
    - [ ] Commit: `test(ai-tutoring): add the workerd SDK probe`.
- [x] Task: S1 Implement — add the SDK route tests `07975959`
    - [ ] Create `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.sdk.test.ts`. Mock auth and the Convex rate limit as the existing route test does. Do not mock `@math-platform/ai-tutoring`.
    - [ ] Mock `globalThis.fetch` with an OpenRouter answer. Assert HTTP 200, the answer text, and one request to a URL that ends with `/chat/completions`.
    - [ ] Create `apps/integrated-math-3/__tests__/app/api/student/lesson-chatbot/route.sdk.test.ts` in the same way, with the IM3 Convex mocks.
    - [ ] Commit: `test(chatbot): run the chatbot routes through the SDK`.
- [x] Task: S1 Verify — run the gates and record the bundle sizes `f90015bb`
    - [ ] Run each gate, with the workerd probe. Confirm that each gate passes.
    - [ ] Build IM3 and BM2. Record the sizes after the change, in the same form as the baseline.
    - [ ] Run both bundle audits. If a budget fails, do not change the budget. Stop the phase and report the sizes to the user.
    - [ ] Commit the evidence file: `measure(openrouter-sdk): record the S1 results`.
- [x] Task: S1 Docs & Doctor `10fa30ae`
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
    - Green deviation (strategy F5): `npm run generate` exited 0, but
      `measure/generated/routes.md` still holds `../../../daniel-bo/...` paths.
      The file is not staged. `npm run doctor` exited 0 with all checks passed.
      `tech-debt.md` is at the 50-line limit, so no row was added.
    - Logs: `measure/runs/openrouter-sdk-ai-layer_20261114/generate-s1.log`
      and `.../doctor-s1.log`.
- [x] Task: S1 Adversarial testing — test SDK failure paths and run the role gate `fb694f67`
    - Test commit `4b1d1aaf` adds 23 cases. Two cases fail: an HTTP error exposes the key, and BM2 lets a constructor error escape.
    - Green owns both failures. The audit result is `measure/runs/openrouter-sdk-ai-layer_20261114/adversarial-b3401a2e.json`.
    - The detached role gate exits 1 with `NEWFAIL=1`. Only the two adversarial tests add failure keys.
    - IM3 218, BM2 7, scripts 27, and audit 5 retain their baseline failure keys.
    - [x] Remediation r4 (ADV-1 and ADV-2): redact the API key from mapped errors and contain BM2 provider resolution failures in the 502 handler `bf5ef00b`.
    - Adversarial rerun r2: all 23 original cases pass. Test commit `eaaf7a6b` adds two failing cases for non-HTTP body-read errors.
    - Green owns the remaining key exposure. The r2 role gate uses label `green-r2` and exits 1 with `NEWFAIL=1`.
    - Only the two new package cases add failure keys. Every baseline failure key remains unchanged.
    - [x] Remediation r5 (ADV-3, Review B F8/F9, Review A F4): redact the key on every SDK error path and apply padded-key and minimum-length rules `96f8d20c`.
    - Adversarial rerun r3 at `fb694f67`: all 25 cases and four redaction probes pass. No new test is needed.
    - The detached role gate uses `green-r3` and exits 0. Every baseline failure key remains unchanged.
    - Audit: `measure/runs/openrouter-sdk-ai-layer_20261114/adversarial-fb694f67.json`.
- [b] Task: Measure - User Manual Verification 'Phase S1: Adopt the OpenRouter SDK' (Protocol in workflow.md) (deferred:closeout-steward)
    - [b] Run the protocol: the automated tests, the manual verification plan, and the user confirmation. (The automated tests ran in Green, the reviews, and the adversarial role. The confirming user is the PM (orchestrator default). The live smoke test with a real key stays a Daniel gate, spec.md human gates.) (deferred:closeout-steward)
    - [x] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`. (14f75797.)
    - [x] Append `[checkpoint: 14f75797]` to the Phase S1 heading. (14f75797.)
    - [x] Commit: `measure(plan): mark the S1 checkpoint (track_id: openrouter-sdk-ai-layer_20261114)`. (14f75797.)

## Phase S2: Role-based model configuration [checkpoint: e661e619]
_Story ref: spec.md#story-s2_

- [x] Task: S2 Contract — define the roles, the PII flag, and the usage record (Red owns the stubs; Green owns the behavior) (8e803b83.)
    - [ ] Create `packages/ai-tutoring/src/roles.ts` with `AI_ROLES`. Each entry has `env` (the variable name), `structured` (boolean), and `sendsPii` (boolean). The values come from the spec "Roles" table.
    - [ ] Export `type AiRole = keyof typeof AI_ROLES` (`studentTutor`, `spreadsheetEval`, `accountingEval`).
    - [ ] Export `resolveRoleModel(role)`. It returns `{ ok: true, model }` or `{ ok: false, missing, reason }`.
    - [ ] The `reason` is `missing` for an absent, empty, or whitespace value, and `preset` for a value that starts with `@preset/`.
    - [ ] Export `buildProviderPreferences({ structured, sendsPii })`. It returns `undefined`, `{ require_parameters: true }`, `{ zdr: true }`, or `{ require_parameters: true, zdr: true }`, in the SDK field names from the "SDK API" evidence.
    - [ ] Create `packages/ai-tutoring/src/usage-log.ts` with `logAiRequest(record)`. It writes `console.info('[ai-tutoring] request', JSON.stringify(record))`.
    - [ ] The record fields are `role`, `model` (the served model of the response), `latencyMs`, `promptTokens`, `completionTokens`, `totalTokens`, `outcome` (`ok` or `error`), and `status` (the HTTP status or `null`).
    - [ ] A missing setting logs `console.error('[ai-tutoring] AI role not configured', JSON.stringify({ role, missing, reason }))`.
    - [ ] In `measure/tech-stack.md`, add a dated note with the roles, the PII flag, and the usage record.
- [x] Task: S2 Test (Red) — specify the roles (c80b7352.)
    - [ ] Create `packages/ai-tutoring/src/__tests__/roles.test.ts`.
    - [ ] Normal case 1: with `OPENROUTER_MODEL_STUDENT_TUTOR=vendor/model-a`, the studentTutor provider sends `model: 'vendor/model-a'`.
    - [ ] Normal case 2: the value `~google/gemini-latest` reaches the request without change.
    - [ ] Normal case 3: a successful request logs one usage record with the served model and the token counts of the mocked response.
    - [ ] Normal case 4: each entry of `AI_ROLES` has `sendsPii: false`.
    - [ ] Normal case 5: `buildProviderPreferences` gives the four results of the S2 Contract for the four input pairs.
    - [ ] Edge case 6: a missing role variable makes the resolver return `null` and log the variable name.
    - [ ] Edge case 7: an empty or whitespace value gives the result of case 6.
    - [ ] Edge case 8: the value `@preset/tutor` makes the resolver return `null` and log `reason: 'preset'`.
    - [ ] Edge case 9: only `OPENROUTER_MODEL` set makes the resolver return `null`.
    - [ ] Edge case 10: a missing `OPENROUTER_API_KEY` makes the resolver return `null` and log `missing: 'OPENROUTER_API_KEY'`.
    - [ ] Edge case 11: a request with the prompt `PROMPT-MARKER-7` and the answer `ANSWER-MARKER-9` logs no line that contains either marker. A failed request logs `outcome: 'error'` and its status.
    - [ ] Edge case 12: a studentTutor request has no `provider` field.
    - [ ] Create the no-PII tests `apps/integrated-math-3/__tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts` and `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts`. Use the No-PII Fixture in the session claims, the profile, and the lesson data mocks. Capture the messages from the mocked provider.
    - [ ] Run the tests. Confirm that cases 1 to 12 fail. The no-PII tests can pass now; they guard the rule.
    - RED run (2026-11-23, role mid-red): `CI=true npm run test
      --workspace=packages/ai-tutoring -- -t 'role configuration'` ran 12 cases,
      12 failed, 115 skipped. Case 1 sends `openrouter/free` instead of
      `vendor/model-a`. Case 2 sends `openrouter/free` instead of
      `~google/gemini-latest`. Cases 3 and 11 find zero usage records. Case 4
      finds `sendsPii: true` in the stub. Case 5 finds
      `{ require_parameters: true }` where the contract needs `undefined`, and
      the stub shape differs on the other three pairs. Cases 6 to 9 return a
      provider instead of `null`. Case 10 returns `null` but logs no missing
      key name. Case 12 finds the stub preferences object instead of
      `undefined`. No `Cannot find module` failure. F1a rejects with
      `OpenRouter API error: 200 Response validation failed` instead of
      returning `Hello there!`. F1b rejects with the same 200 API error after
      1 fetch call instead of `EmptyResponseError` after 3 calls. F10a and F10b
      keep the echoed token in the mapped error text. IM3 no-PII: 1 passed,
      7069 skipped. BM2 no-PII: 1 passed, 2698 skipped.
    - Red deviations (record-only): (a) case 5 and case 12 assert the SDK
      TypeScript field names (`requireParameters`, `zdr`) per strategy F13,
      which wins over the snake_case literals of the plan Contract. (b) The
      stubs use `sendsPii: true`, `structured: true`, and a constant
      preferences object so that cases 4, 5, and 12 fail on assertions.
      Green replaces the stubs with the Contract values. (c) F1a and F1b live
      in `providers.test.ts` per the strategy; they use the real SDK through
      `vi.importActual` with a mocked `fetch`, and they do not stub
      `chat.send`. (d) The Red tests call the provider resolvers with a role
      argument through a cast; the signature change is Green's.
    - [ ] Commit: `test(ai-tutoring): specify the role configuration (Red)`.
- [x] Task: S2 Implement — read the model from the role (6883bb9d.)
    - Green replaced the Red stubs with the Contract values and behavior. F1a
      returns the documented-body content, F1b retries an error-only 200 body
      three times, and F10 strips the Bearer scheme without case sensitivity.
      Targeted role cases 12/12, F1 4/4, F10 2/2, package suite 127/127. Logs:
      `green-s2-targeted-role.log`, `green-s2-targeted-F1.log`,
      `green-s2-targeted-F10.log`, `green-s2-package-test.log`.
    - [ ] In `src/providers.ts`, make `model` and `role` required in `OpenRouterProviderOptions`. Remove each `'openrouter/free'` default and each read of `OPENROUTER_MODEL`.
    - [ ] Change `resolveOpenRouterProviderFromEnv` and `resolveOpenRouterProviderWithMessagesFromEnv` to take an `AiRole`. Cache one provider for each role. `clearProviderCache` clears all roles.
    - [ ] Use `resolveRoleModel` and the API key check. On a missing setting, log it and return `null`.
    - [ ] Send `provider` only when `buildProviderPreferences` returns an object.
    - [ ] Call `logAiRequest` once for each request: on success after the response, on failure after the last retry.
    - [ ] Export `AI_ROLES`, `AiRole`, `resolveRoleModel`, and `buildProviderPreferences` from `src/index.ts`.
    - [ ] Update `packages/ai-tutoring/workerd-probe/worker.ts` to pass `role: 'studentTutor'` and a model.
    - [ ] Commit: `feat(ai-tutoring): read each model from its role variable`.
- [x] Task: S2 Implement — move the callers to their roles (3e4a6d56.)
    - Both chatbots pass `studentTutor` and the spreadsheet feedback passes
      `spreadsheetEval`. `S2_GREEN_TEST_COMMAND` exits 0 for the passing
      workspaces; BM2 and IM3 keep their 7 and 218 baseline failure keys. The
      workerd probe answers `probe-ok`. Lint, test and checks-all gate sweeps
      with label `s2` each exit 0 with `NEWFAIL=0`. Logs:
      `green-s2-test-bm2.log`, `green-s2-test-im3.log`,
      `green-s2-test-practice-core.log`, `green-s2-workerd.log`,
      `green-s2-gates.exit`.
    - [ ] `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts`: call `resolveOpenRouterProviderWithMessagesFromEnv('studentTutor')`. Keep the 503 response.
    - [ ] `apps/bus-math-v2/app/api/student/lesson-chatbot/route.ts`: the same change.
    - [ ] `apps/bus-math-v2/lib/ai/spreadsheet-feedback.ts`: call `resolveOpenRouterProviderFromEnv('spreadsheetEval')`. Keep the deterministic feedback for `null`.
    - [ ] Update these tests for the new signatures (role argument, required `model` and `role`): `packages/ai-tutoring/src/__tests__/providers.test.ts`, `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`, and `apps/bus-math-v2/__tests__/lib/ai/spreadsheet-feedback.test.ts`.
    - [ ] Also update `apps/integrated-math-3/__tests__/app/api/student/lesson-chatbot/route.test.ts`, `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.test.ts`, and `apps/bus-math-v2/__tests__/api/student/lesson-chatbot.test.ts`.
    - [ ] Assert in each chatbot route test that the resolver gets `'studentTutor'`. Assert in the spreadsheet test that it gets `'spreadsheetEval'`.
    - [ ] In `apps/integrated-math-3/.env.example` and `apps/bus-math-v2/.env.example`, replace `OPENROUTER_MODEL` with the role variables of each app, as comments. Add the `openrouter/free` development note.
    - [ ] Commit: `feat(ai): move the chatbots and spreadsheet feedback to their roles`.
    - [x] Remediation r2 (Review A RA1, Review B B1, Review B N4, Review C F1): `b212125b`.
      RA1: `resolveRoleModel` returns the configured value unchanged; a blank
      or whitespace-only value still gives `reason: 'missing'`. The new
      preservation test failed first on the trimmed value, then passed.
      B1: one committed Red assertion changed, with orchestrator routing and
      disclosure. `roles.test.ts` case 8 now parses the logged JSON record and
      asserts `role`, `missing`, and `reason: 'preset'` instead of
      `toContain("preset")`. No behavior changed for B1.
      N4 and C-F1: a package test imports and calls the four planned exports
      from `src/index.ts` and `logAiRequest` from `src/usage-log.ts`.
      Package suite 129/129; lint, test and checks-all gate sweeps with label
      `s2` each exit 0 with `NEWFAIL=0`. Logs: `green-s2-r2-before-fix.log`,
      `green-s2-r2-package-test.log`, `green-s2-r2-gates.exit`.
      Deferred to the next-phase list, not added to `tech-debt.md` because that
      file holds 60 lines against a 50-line limit: N1 (OPENROUTER_DEBUG
      debugLogger), N2 (S2 Verify grep matches the case-9 fixture), N3 (two-role
      cache isolation test).
    - [x] Remediation r3 (adversarial ADV-S2-1 to ADV-S2-5): `e5680156`.
      The resolvers recheck the key and role model before a cache hit and key
      the cache on role, key and model. F1 recovery trims content. Usage
      records accept only a bounded model id. The IM3 chatbot strips person
      details from lesson markdown. HTTP errors carry the status only, and
      both chatbot routes log status and role. Two S1 error-text tests and the
      short-key test moved to the paths that still retain message text. No
      adversarial assertion changed. Package suite 141/141, IM3 chatbot suite
      14/14. Lint, test and checks-all gate sweeps with label `s2` each exit 0
      with `NEWFAIL=0`. Logs: `green-s2-r3-package.log`, `green-s2-r3-im3.log`,
      `green-s2-r3-gates.exit`.
    - [x] Remediation r4 (Reviews A and C F1): `ea1e7920`.
      `stripPersonDetails` now ends a labeled clause at a line break, sentence
      end, or next label. Later lesson text stays in the prompt. The new
      `route.pii-scope.test.ts` failed first with no lesson math, then passed.
      The six adversarial tests still pass. Package suite 141/141, IM3 chatbot
      suite 15/15. Lint, test and checks-all gate sweeps with label `s2` each
      exit 0 with `NEWFAIL=0`. Logs: `green-s2-r4-before-fix.log`,
      `green-s2-r4-im3.log`, `green-s2-r4-package.log`, `green-s2-r4-gates.exit`.
      Review B nonblocking findings stay on the next-phase list: BM2 strip,
      fixture-shaped regex, MODEL_ID charset, cache key, rate-limit log.
- [x] Task: S2 Verify — run the gates
    - Evidence: every gate passed at HEAD `8bc7469a` with `NEWFAIL=0`, and the Verify grep matched test files only. See `measure/runs/openrouter-sdk-ai-layer_20261114/phase-acceptance-8bc7469a.json`.
    - [ ] Run each gate, with the workerd probe. Confirm that each gate passes.
    - [ ] Run `git grep -n "OPENROUTER_MODEL\b\|openrouter/free" -- apps packages ':!**/.env.example' ':!**/__tests__/**'`. Confirm that no code matches. (N2, S3 Fix: the exclusion drops only the case-9 fixture lines and the adversarial live complement.)
- [x] Task: S2 Docs & Doctor
    - Evidence: `npm run generate` and `npm run doctor` exited 0 at HEAD `8bc7469a`. See `measure/runs/openrouter-sdk-ai-layer_20261114/phase-acceptance-8bc7469a.json`.
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [x] Task: Measure - User Manual Verification 'Phase S2: Role-based model configuration' (Protocol in workflow.md) (PM-verified 2026-11-23)
    - PM-verified: the automated checks ran at HEAD `8bc7469a`. The acceptance result is `measure/runs/openrouter-sdk-ai-layer_20261114/phase-acceptance-8bc7469a.json`.
    - [x] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`. (e661e619.)
    - [x] Append `[checkpoint: e661e619]` to the Phase S2 heading. (e661e619.)
    - [x] Commit: `measure(plan): mark the S2 checkpoint (track_id: openrouter-sdk-ai-layer_20261114)`. (e661e619.)

Next-phase list (acceptance, record-only): F1 (Major: the BM2 lesson chatbot embeds lesson markdown without the `stripPersonDetails` fix; fix first in S3). F2 (the evidence log citation for the F1 4/4 claim is the mid-fix run; cite a fresh run at the next evidence commit). F3 (the IM3 strip is fixture-shaped; make it robust or accept the limit in writing). F4 (`MODEL_ID` accepts a bare key form; record the model only when it equals the configured model or the configured model plus a known suffix). F5 (the stale tech-stack current-state lines; fixed in `595430f6`). F6 (process records: the third-round PM approval is in `metadata.json`; the S2 Contract and Test (Red) task lines now cite `8e803b83` and `c80b7352`; eight run files were force-added; commit `1833c526` has no note). F7 (carried: the cache key holds the API key; both rate-limit catches log the raw error object; `OPENROUTER_DEBUG` logs the auth header; `gates.sh` cannot see a new or larger BM2 bundle entry).

Checkpoint record (2026-11-23): Phase acceptance passed at `8bc7469a`. The PM decision accepts the third Green round (r4, `ea1e7920`). The S2 Verify, Docs & Doctor, and manual-verification tasks are [x], and the tech-stack current state is correct in `595430f6`.

## Phase S3: Structured output for the evaluation features
_Story ref: spec.md#story-s3_

Gate: no student-facing release of the BM2 chatbot before the PII strip passes. (PM decision 2026-11-23)

- [~] Task: S3 Fix — BM2 lesson-chatbot PII strip (do first)
    - The BM2 route `apps/bus-math-v2/app/api/student/lesson-chatbot/route.ts` maps the lesson markdown into the `studentTutor` prompt with no person-detail strip (lines 175 to 178 at `8bc7469a`).
    - Invariant: every AI prompt contains no PII. No live BM2 curriculum markdown holds a person detail today. The path is still unproven.
    - Test first. Add a no-PII test that runs the real `assembleLessonChatbotContext` with fixture person details in the lesson markdown. The current mock test puts no fixture value in that markdown, so it proves the session and account paths only.
    - Reuse the `stripPersonDetails` behavior of `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts`. Move it to `packages/ai-tutoring` only when the move needs no new layer. Do not add a second implementation.
    - Acceptance: the captured prompt holds no fixture value, and the later lesson text stays in the prompt.
    - Red proof (2026-11-23, role mid-red): `CI=true npm run test
      --workspace=apps/bus-math-v2 -- -t 'S3 fix'` ran 2 cases, 2 failed,
      2699 skipped. The Fix 1 case fails at `route.no-pii.test.ts:119`
      (`expect(sent).not.toContain(value)`): the captured prompt holds `Avery
      Quinn` because the BM2 route maps lesson markdown with no person-detail
      strip. No missing-module failure. The math-head and math-tail assertions
      hold. The second failing case is finding (d) BM2; the Fix 2 note records
      it.
- [~] Task: S3 Fix — close the S2 review findings (Review B r3 and acceptance)
    - (a) Make the IM3 strip robust beyond the colon-labeled fixture. Cover the dash form, the em-dash form, unlisted labels, prose names, an obfuscated email, and a fullwidth label. Add one test for each form. If a conservative sentence-level detector is too broad, accept the limit in writing.
    - (b) Tighten `MODEL_ID`. Record the served model in a usage record only when it equals the configured model or the configured model plus a known suffix. A bare API key form must give `model: null`. Add a test.
    - (c) Stop keeping the raw API key in the provider cache key. Key the cache on a stable non-secret value. Keep the warm-cache recheck of the key and the role model.
    - (d) Log the status and the role only in the rate-limit catch of both chatbot routes: `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts` near line 196 and `apps/bus-math-v2/app/api/student/lesson-chatbot/route.ts` near line 102. Add a test that the raw error object reaches no console call.
    - (e) Carried items:
        - N1: pass a redacting `debugLogger` for `OPENROUTER_DEBUG`, so the auth header never prints.
        - N2: make the S2 Verify grep ignore the case-9 fixture lines in `roles.test.ts` and the live complement in `role-configuration.adversarial.test.ts`.
        - N3: add a two-role cache isolation test.
        - N5: add a padded preset test.
    - Do not change an adversarial assertion. Record each test-first proof in this plan.
    - Red proof (2026-11-23, role mid-red):
        - Package: `CI=true npm run test --workspace=packages/ai-tutoring --
          -t 'S3 fix'` ran 6 cases, 3 failed, 3 passed, 141 skipped. Finding
          (b) fails at `roles.test.ts:286`
          (`expect(records[0]).toMatchObject({ model: null })`): the usage
          record holds the bare key form `sk-test-bare-key-9921` as the model.
          The configured-model guard passes. Finding (c) fails at
          `roles.test.ts:314`: the `cacheKey` source lines hold `apiKey`. The
          warm-cache recheck guards in the same test pass. Finding (e) N1 fails
          at `openrouter-debug-logging.test.ts:70`: the SDK debug log holds
          `authorization: Bearer sk-test-debug-fixture-6642`. N1 lives in its
          own file because the SDK memoizes `env()` on first use; an in-file
          variant passed in the full suite. Findings
          (e) N3 and N5 pass at HEAD, so the behaviors already hold and no new
          contract is invented for them.
        - IM3: `CI=true npm run test --workspace=apps/integrated-math-3 --
          -t 'S3 fix'` ran 7 cases, 7 failed, 7073 skipped. Each finding (a)
          form fails at its `expect(system).not.toContain(...)` line
          (`route.pii-scope.test.ts:173` and the five sibling lines): the dash
          form, the em-dash form, the unlisted label `Guardian:`, the prose
          name, the obfuscated email, and the fullwidth label each survive the
          strip. The math-text assertions hold. Finding (d) IM3 fails at
          `route.pii-scope.test.ts:240`: the console call holds the raw error
          marker. Finding (d) BM2 fails at `route.test.ts:239` with the same
          cause. The IM3 rate-limit test queues exactly the two query mocks
          it consumes, so no stale value leaks into the committed pii-scope
          test (the first version leaked one and failed that test with 500 in
          the gate).
        - Finding (e) N2: no runnable test fits a grep-command correction. The
          S2 Verify grep now excludes `__tests__` paths, where the case-9
          fixture lines and the adversarial live complement live.
    - Static checks: `npm run format:check` passes. Lint passes in
      `packages/ai-tutoring`, `apps/bus-math-v2`, and
      `apps/integrated-math-3`. Typecheck passes in the package and BM2. IM3
      typecheck holds the 55 baseline lines with no new key.

- [ ] Task: S3 Contract — define the helper and the teacher summary
    - [ ] Add `"zod": "^4.1.12"` to the `dependencies` of `packages/ai-tutoring/package.json` (spec "Non-Functional Requirements"). Run `npm install`.
    - [ ] Run `node -e "import('zod').then((z) => console.log(typeof z.toJSONSchema))"` in `packages/ai-tutoring`. Record the zod version and the result in the "zod check" section. The result must be `function`.
    - [ ] Helper file: `packages/ai-tutoring/src/structured.ts` with `resolveStructuredProviderFromEnv(role)`. It returns a `StructuredProvider` or `null`, with the S2 logging for a missing setting.
    - [ ] `StructuredProvider` takes `{ schemaName, schema, messages, abortSignal?, temperature?, maxTokens? }` and returns `Promise<StructuredResult<T>>`.
    - [ ] `StructuredResult<T>` is `{ ok: true, data: T, raw: string }` or `{ ok: false, reason, raw?: string }`.
    - [ ] The `reason` values are `request_failed`, `empty_response`, `aborted`, `invalid_json`, and `schema_mismatch`.
    - [ ] The request sends `response_format` `{ type: 'json_schema', json_schema: { name: schemaName, strict: true, schema: z.toJSONSchema(schema) } }`, in the SDK field names from the evidence.
    - [ ] The request sends the `provider` object from `buildProviderPreferences({ structured: true, sendsPii })`.
    - [ ] The helper uses `withRetry` for the transport, with the S1 error mapping. It never throws.
    - [ ] It parses the content with `JSON.parse`, then checks it with `schema.safeParse`. It logs one usage record for each request.
    - [ ] Response schemas use `z.strictObject`, `z.string()`, `z.number()`, and `z.array(z.string())` only. They use no length or count limits, so the JSON Schema holds only basic keywords.
    - [ ] Teacher summary file: `apps/bus-math-v2/lib/teacher/ai-error-summary.ts`. It exports `teacherAiSummarySchema`, `type TeacherAiSummary`, `buildTeacherSummaryPrompt`, and `resolveTeacherAiSummaryGenerator`.
    - [ ] `teacherAiSummarySchema` is `z.strictObject({ likelyMisunderstanding: z.string(), evidenceObserved: z.array(z.string()), suggestedReteach: z.string(), groundedIn: z.array(z.string()) })`.
    - [ ] `TeacherAiSummary` is the schema type plus `type: 'ai-assisted'` and `generatedAt: number` (spec "Terms").
    - [ ] `buildTeacherSummaryPrompt(summary: LessonErrorSummary)` copies the prompt lines of `buildAIPrompt` in `lib/teacher/ai-interpretation.ts`, with three changes.
    - [ ] Change 1: remove the line `Student: ${summary.studentName}`. Keep `Lesson: ${summary.lessonTitle}`.
    - [ ] Change 2: add the line `Refer to the learner only as "the student". Do not use a name.` after the first two lines.
    - [ ] Change 3: replace "Return a JSON object with these fields:" with "Fill each field of the JSON schema:". Keep the 4 field descriptions and the last two lines.
    - [ ] `resolveTeacherAiSummaryGenerator()` returns `null` when `resolveStructuredProviderFromEnv('accountingEval')` returns `null`.
    - [ ] Otherwise it returns `(summary: LessonErrorSummary) => Promise<TeacherAiSummary | null>`.
    - [ ] The generator returns `null` with no request when `summary.totalParts` is 0, as `ai-interpretation.ts` does now.
    - [ ] The generator sends the prompt as one user message, with the schema name `teacher_error_summary`, temperature 0.3, and 500 max tokens (the current `ai-interpretation.ts` values).
    - [ ] It returns the data with `type` and `generatedAt` for `ok: true`, and `null` for each typed failure.
    - [ ] In `measure/tech-stack.md`, add a dated note on the structured-output helper and the teacher summary.
- [ ] Task: S3 Test (Red) — specify the helper and the two moves
    - [ ] Create `packages/ai-tutoring/src/__tests__/structured.test.ts`.
    - [ ] Normal case 1: a valid JSON answer that matches the schema gives `{ ok: true, data, raw }`.
    - [ ] Normal case 2: the request body has `response_format` with the `name`, `strict: true`, and the `z.toJSONSchema` output of the schema.
    - [ ] Normal case 3: the request `provider` object is exactly `{ "require_parameters": true }`.
    - [ ] Edge case 4: an answer that is not JSON gives `invalid_json` with `raw`.
    - [ ] Edge case 5: JSON that does not match the schema gives `schema_mismatch` with `raw`.
    - [ ] Edge case 6: empty content on each attempt gives `empty_response`.
    - [ ] Edge case 7: an HTTP 400 gives `request_failed` with no retry. A 503, then a success, gives `ok: true`.
    - [ ] Edge case 8: an external abort gives `aborted`.
    - [ ] Edge case 9: for `AiFeedbackResponseSchema` and `teacherAiSummarySchema`, `z.toJSONSchema` gives `additionalProperties: false` and lists all keys in `required`.
    - [ ] In `apps/bus-math-v2/__tests__/lib/ai/spreadsheet-feedback.test.ts`, change the 6 existing tests to mock `resolveStructuredProviderFromEnv`. Keep each expected result.
    - [ ] Edge case 10: `request_failed`, `empty_response`, or `aborted` makes `generateAiFeedback` throw, so the submit route stores no AI feedback, as now.
    - [ ] Create `apps/bus-math-v2/__tests__/lib/teacher/ai-error-summary.test.ts`.
    - [ ] Normal case 11: `buildTeacherSummaryPrompt` holds the lesson title, the correctness line, the top misconception tags with counts and part IDs, the scaffold line, and the activity breakdown of the fixture.
    - [ ] Normal case 12: the prompt holds `the student` and the 4 field names.
    - [ ] Normal case 13: with the role variable and the key set, the generator sends `model` from `OPENROUTER_MODEL_ACCOUNTING_EVAL` and the schema name `teacher_error_summary`, and returns a `TeacherAiSummary`.
    - [ ] Edge case 14: a missing role variable makes `resolveTeacherAiSummaryGenerator` return `null` and log the variable name.
    - [ ] Edge case 15: a typed failure makes the generator return `null`.
    - [ ] Edge case 16: `totalParts: 0` makes the generator return `null` and send no request.
    - [ ] No-PII case 17: a `LessonErrorSummary` fixture has `studentName: 'Avery Quinn (avery.quinn@example.org)'`. The prompt holds neither `Avery Quinn` nor `avery.quinn@example.org`.
    - [ ] Update `apps/bus-math-v2/__tests__/api/teacher/ai-error-summary.test.ts` to mock `resolveTeacherAiSummaryGenerator`. Assert the response keys `studentName`, `lessonTitle`, `deterministicSummary`, `aiSummary`, and `aiEnabled`.
    - [ ] Edge case 18: a generator that returns `null` gives `aiSummary: null` and the deterministic summary.
    - [ ] Create the no-PII test `apps/bus-math-v2/__tests__/app/api/activities/spreadsheet/submit.no-pii.test.ts`. Run the submit route with the No-PII Fixture in the session claims and the Convex profile mocks. Capture the messages from the mocked structured provider.
    - [ ] Create the no-PII test `apps/bus-math-v2/__tests__/api/teacher/ai-error-summary.no-pii.test.ts`. Put the No-PII Fixture in the teacher profile, the student profile, the student name of the submission detail, and the student ID.
    - [ ] In that test, capture the prompt from the mocked structured provider, and assert that it holds no fixture value. Assert that the response `studentName` is the fixture name, so the name stays on the app side.
    - [ ] Run the tests. Confirm that cases 1 to 18 fail.
    - [ ] Commit: `test(ai): specify the structured-output helper and the evaluation moves (Red)`.
- [ ] Task: S3 Implement — build the helper
    - [ ] Implement `src/structured.ts` as the S3 Contract says. Export it from `src/index.ts`, and add the `"./structured"` subpath to `package.json` `exports`.
    - [ ] Commit: `feat(ai-tutoring): add the structured-output helper`.
- [ ] Task: S3 Implement — move the spreadsheet feedback to the helper
    - [ ] In `apps/bus-math-v2/lib/ai/spreadsheet-feedback.ts`, change `AiFeedbackResponseSchema` to `z.strictObject` with the same 4 fields.
    - [ ] Replace the "Response Format" block of the prompt with one line: "Fill each field of the JSON schema."
    - [ ] Call `resolveStructuredProviderFromEnv('spreadsheetEval')` with the schema name `spreadsheet_feedback`.
    - [ ] Map the results: `null` (not configured) gives the deterministic feedback with the current `rawAiResponse` text.
    - [ ] `invalid_json` and `schema_mismatch` give the deterministic feedback with `rawAiResponse: raw`.
    - [ ] `request_failed`, `empty_response`, and `aborted` throw an `Error`, as the provider error does now.
    - [ ] `ok: true` gives the parsed fields, the score clamped to 0 to 40, at most 3 items in each list, and `rawAiResponse: raw`.
    - [ ] Commit: `feat(bm2): use structured output for spreadsheet feedback`.
- [ ] Task: S3 Implement — build the teacher summary on the accounting role
    - [ ] Create `apps/bus-math-v2/lib/teacher/ai-error-summary.ts` as the S3 Contract says.
    - [ ] In `apps/bus-math-v2/app/api/teacher/ai-error-summary/route.ts`, build `const lessonSummary = buildLessonErrorSummary(detail)`.
    - [ ] If the type checker reports that `detail` is not a `SubmissionDetail`, map its fields to `SubmissionDetail` in the route. Do not change `buildLessonErrorSummary`.
    - [ ] Replace `resolveAIProviderFromEnv()` and `generateAISummary(...)` with `resolveTeacherAiSummaryGenerator()` and the generator call on `lessonSummary`.
    - [ ] Keep `envelopes`, `deterministicSummary`, `studentName: detail.studentName`, and `lessonTitle`. Set `aiEnabled: generator !== null`.
    - [ ] Do not put the student name into the AI text.
    - [ ] Commit: `feat(bm2): build the teacher error summary on the accounting role with structured output`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate, with the workerd probe. Confirm that each gate passes.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Structured output for the evaluation features' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Structured output for the evaluation features' as complete`.

## Phase S4: Remove the OpenAI paths and document the roles
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — list the removals
    - [ ] Write this removal list in this plan. The S4 Implement task makes the removals.
    - [ ] Removal 1: the files `apps/bus-math-v2/lib/practice/error-analysis/providers.ts` (OpenAI provider) and `apps/bus-math-v2/__tests__/lib/practice/error-analysis-providers.test.ts`.
    - [ ] Removal 2: the files `apps/bus-math-v2/lib/teacher/ai-interpretation.ts` and `apps/bus-math-v2/__tests__/lib/teacher/ai-interpretation.test.ts`.
    - [ ] Removal 3: `generateAISummary`, `buildAIPrompt`, `parseAIResponse`, and `AISummaryInput` in `packages/practice-core/src/practice/error-analysis/index.ts`.
    - [ ] Removal 4: the exports of removal 3 in `packages/practice-core/src/index.ts` and in `apps/bus-math-v2/lib/practice/error-analysis/index.ts`.
    - [ ] Removal 5: the `generateAISummary` tests in `apps/bus-math-v2/__tests__/lib/practice/error-analysis.test.ts` and `apps/integrated-math-3/__tests__/lib/practice/error-analysis.test.ts`. The other tests stay.
    - [ ] `AISummaryOutput`, `TeacherErrorView`, and `buildTeacherErrorView` stay without change.
- [ ] Task: S4 Test (Red) — guard the single provider
    - [ ] Create `scripts/__tests__/openrouter-only.test.ts`. Add it to `include` in `scripts/vitest.config.ts`.
    - [ ] Normal case 1: no file under `apps/` or `packages/` (outside `node_modules`) contains `api.openai.com`, `api.anthropic.com`, `OPENAI_API_KEY`, or `AI_INTERPRETATION_`.
    - [ ] Normal case 2: the 4 files of removals 1 and 2 do not exist.
    - [ ] Normal case 3: the `@math-platform/practice-core` module exports no `generateAISummary`, and it exports `buildTeacherErrorView`.
    - [ ] Run the scripts suite. Confirm that cases 1 to 3 fail.
    - [ ] Commit: `test(ai): guard the single AI provider (Red)`.
- [ ] Task: S4 Implement — remove the old AI code
    - [ ] Make removals 1 to 5 of the S4 Contract.
    - [ ] Commit: `chore(ai): remove the OpenAI code paths and the dead summary code`.
- [ ] Task: S4 Implement — document the roles
    - [ ] In `apps/bus-math-v2/.env.example`, remove the `OPENAI_*` and `AI_INTERPRETATION_*` lines.
    - [ ] Add `OPENROUTER_API_KEY`, and add the 3 BM2 role variables as comments with the initial values of the spec "Roles" table and the `openrouter/free` development note.
    - [ ] In `apps/integrated-math-3/.env.example`, keep `OPENROUTER_API_KEY` and `OPENROUTER_API_BASE`.
    - [ ] Add `OPENROUTER_MODEL_STUDENT_TUTOR` with the development note, and `OPENROUTER_MODEL_MATH_EVAL=z-ai/glm-5.3-flash` as a comment that says no code reads it yet.
    - [ ] In both `wrangler.jsonc` files, add `OPENROUTER_API_KEY` to the comment list of secrets, as an optional secret.
    - [ ] In `measure/tech-stack.md`, add the "AI Layer" section: the SDK, the roles table, the PII rule and flag, structured output, the usage record, and the production prerequisites of the spec.
    - [ ] Commit: `docs(ai): document the AI roles and the OpenRouter layer`.
- [ ] Task: Live smoke test (manual, human gate)
    - [ ] This task is for Daniel. It needs a real key and is not part of CI.
    - [ ] Set a real `OPENROUTER_API_KEY` and the role variables in a local `.env.local`. Start each app with `vinext dev`.
    - [ ] Send one chatbot question in IM3 and in BM2. Submit one BM2 spreadsheet activity. Request one BM2 teacher error summary.
    - [ ] Record each result and each usage record line in the "Live smoke test" section. Record no prompt or answer text.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate, with the workerd probe and the scripts suite. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(openrouter-sdk): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Remove the OpenAI paths and document the roles' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Remove the OpenAI paths and document the roles' as complete`.
