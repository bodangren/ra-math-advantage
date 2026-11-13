# Track: OpenRouter SDK AI Layer

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: `vinext-oxc-toolchain_20261114` (this track starts after that track closes)

## Overview

This track moves every AI feature to OpenRouter through the official `@openrouter/sdk`
package. Each AI role reads its model from its own environment variable. The code has no
default model. When a role is not configured, the feature fails closed.

The track also adds a structured-output helper. The two evaluation features (BM2
spreadsheet feedback and the BM2 teacher error summary) use it in place of free-text
parsing. The new teacher summary reuses the lesson-level prompt of the unused
`ai-interpretation.ts`, without the student name. The track then removes the OpenAI code
paths and `ai-interpretation.ts`.

Goal: each AI feature calls OpenRouter through one package, with one model variable for
each role, typed results for evaluations, and no default model.

## Current System (checked 2026-11-14)

- **Transport:** `packages/ai-tutoring/src/providers.ts` calls
  `https://openrouter.ai/api/v1/chat/completions` with plain `fetch`. It reads the model
  from `OPENROUTER_MODEL`. The default is `openrouter/free` (lines 24, 100, 212, and 235).
  It sends the headers `HTTP-Referer` and `X-Title: Integrated Math 3`. It sends no
  `provider` object.
- **Retry and timeout:** each request has a 15000 ms timeout through an `AbortController`,
  and it follows an external `AbortSignal`. `withRetry` (`src/retry.ts`) makes at most 2
  retries, with a 500 ms base delay and an 8000 ms cap. It retries on 429, 5xx, network
  errors, and `EmptyResponseError`. It does not retry other 4xx errors or an abort.
- **Other package parts:** `src/prompt-guard.ts` (injection detection) and
  `src/lesson-context.ts` (lesson context). `packages/ai-tutoring` has no `zod` dependency.
- **IM3 lesson chatbot:** `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts:202`
  calls `resolveOpenRouterProviderWithMessagesFromEnv()`. When the key is missing, the route
  returns HTTP 503 `AI provider not configured`.
- **BM2 lesson chatbot:** `apps/bus-math-v2/app/api/student/lesson-chatbot/route.ts:169`
  calls the same function, with the same 503 behavior.
- **BM2 spreadsheet feedback:** `apps/bus-math-v2/lib/ai/spreadsheet-feedback.ts:107` calls
  `resolveOpenRouterProviderFromEnv()`. The prompt asks for "JSON only". The code runs
  `JSON.parse` and `AiFeedbackResponseSchema.safeParse`. A missing key, a parse error, or a
  schema error gives the deterministic feedback. A provider error throws, and the submit
  route (`app/api/activities/spreadsheet/[activityId]/submit/route.ts:250`) then stores no
  AI feedback.
- **BM2 teacher error summary:** `apps/bus-math-v2/app/api/teacher/ai-error-summary/route.ts:106`
  calls `lib/practice/error-analysis/providers.ts`. That file calls OpenAI directly
  (`OPENAI_API_KEY`, `OPENAI_MODEL` with the default `gpt-4o-mini`, a system prompt that
  asks for three lines, temperature 0.3, and 300 max tokens). The result goes into
  `generateAISummary` of `packages/practice-core/src/practice/error-analysis/index.ts`.
  This function takes an injected `(prompt: string) => Promise<string>` provider.
  `parseAIResponse` (line 392) splits the answer into lines: line 1 is the misunderstanding,
  line 2 the evidence, and line 3 the intervention. `buildAIPrompt` uses only the latest
  submission. On any error, the summary is `null`. When the key is missing, the route
  returns `aiEnabled: false` and the deterministic summary. The route returns
  `studentName: detail.studentName` (line 127).
- **No UI consumer:** no page or component calls `/api/teacher/ai-error-summary`. Only the
  route, its rate-limit entry in `convex/apiRateLimits.ts`, and tests name it.
  `buildTeacherErrorView` and `AISummaryOutput` of `packages/practice-core` have test callers
  only.
- **Unused module:** `apps/bus-math-v2/lib/teacher/ai-interpretation.ts` calls OpenAI or
  Anthropic with hard-coded models. Only its test imports it. Its prompt works on the
  lesson-level `LessonErrorSummary` of `apps/bus-math-v2/lib/teacher/error-summary.ts`:
  overall correctness, the top misconception tags with counts and part IDs, the hint, reveal,
  and edit counts, and a breakdown for each activity. It asks for JSON with
  `likelyMisunderstanding`, `evidenceObserved`, `suggestedReteach`, and `groundedIn`. Its
  result type is `AIInterpretationResult`.
- **Lesson summary:** `buildLessonErrorSummary(detail: SubmissionDetail)` in
  `apps/bus-math-v2/lib/teacher/error-summary.ts` builds `LessonErrorSummary` with no
  database access. `SubmissionDetail` is a BM2 type in `lib/teacher/submission-detail.ts`.
- **PII in prompts:** no live prompt builder adds PII. The only prompt with a student name is
  in `ai-interpretation.ts` (line 89, `Student: ${summary.studentName}`). The chatbots send
  the question that the student typed, and the system adds no identity data. The live
  teacher summary prompt uses activity IDs, answers, part results, and the class accuracy,
  but no student name, email, username, or account ID.
- **Environment examples:** `apps/bus-math-v2/.env.example` lists `OPENAI_*` and
  `AI_INTERPRETATION_*`, but not `OPENROUTER_API_KEY`.
  `apps/integrated-math-3/.env.example` lists `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and
  `OPENROUTER_API_BASE`.
- **Other apps:** IM1, IM2, and pre-calculus have no AI features.
- **Workers:** the IM3 and BM2 `wrangler.jsonc` files use `nodejs_compat` and the entry
  `vinext/server/app-router-entry`. Their `vite.config.ts` files load
  `@cloudflare/vite-plugin` when it is installed.
- **zod:** the lockfile has zod 4.4.3. `packages/practice-core` declares `zod` `^4.1.12`.
- **SDK:** `@openrouter/sdk` is ESM only and depends on `zod` `^3.25.0 || ^4.0.0`. Its
  README points to `RUNTIMES.md` for the supported runtimes. The user saw version 1.5.102 as
  the latest. Version 1.5.103 was published on 2026-11-13 22:35 UTC.

## Decisions (user, 2026-11-14)

- **D1:** Use OpenRouter for every AI feature. Add `@openrouter/sdk` (latest 1.5.102 when the
  user checked). The user approved this dependency.
- **D2:** Each AI role reads its model from its own environment variable. The code passes the
  value as the `model` field.
- **D3:** The code must not default to `openrouter/free`. That model is only for testing in
  early development. When a role variable is missing, the feature fails closed and logs the
  name of the missing variable. `.env.example` can show `openrouter/free` as a development
  value, with a comment that says so.
- **D4:** This track depends on `vinext-oxc-toolchain_20261114` and runs after it.
- **D5 (change of 2026-11-14):** A role variable holds a concrete OpenRouter model ID or a
  `~author/family-latest` alias. Roles do not use presets.
- **D6 (change of 2026-11-14):** A structured-output request sends
  `provider: { require_parameters: true }`, so OpenRouter routes only to endpoints that
  support the schema. The code sends no other `provider` field, except `zdr: true` for a
  role with the PII flag (D10). A request of a role without the flag and without structured
  output sends no `provider` object.
- **D7 (change of 2026-11-14):** The track adds a structured-output helper in
  `packages/ai-tutoring`. BM2 spreadsheet feedback and the BM2 teacher error summary move to
  it, and keep their deterministic fallbacks.
- **D8 (change of 2026-11-14):** Decision models and the math evaluation role are a later
  track (see "Follow-Up Work").
- **D9 (second change of 2026-11-14, privacy):** ZDR is not required in general. The rule is:
  AI prompts contain no PII. Do not add pseudonymous IDs unless a feature needs them. This
  rule replaces the earlier account-level ZDR prerequisite and the Google Safety Retention
  decision.
- **D10 (second change of 2026-11-14):** Each role has a PII flag, `false` by default, for a
  future role that must send PII. Only when the flag is `true`, the code adds `zdr: true` to
  the `provider` object (with `require_parameters: true` for structured output). No current
  role sets the flag. The likely future case is a teacher summary with student names, and
  the code can avoid names there too.
- **D11 (third change of 2026-11-14):** In the structured-output phase, build the new teacher
  summary on the `accountingEval` role from the content of the `ai-interpretation.ts` prompt,
  with a Zod schema for its 4 fields. Do not send the student name. Tell the model to write
  "the student". The route adds the name on the app side, as it does now (route line 127).
  Do not put the name into the AI text in this track. Keep the deterministic fallback when the
  model call or the Zod check fails. Then delete `ai-interpretation.ts` and its test.
- **Author default (phase order):** structured output is its own phase (S3), after the role
  phase (S2). S3 moves both evaluation features to the helper. S4 removes the old paths.
- **Author decision (teacher summary placement, D11):** the new teacher summary lives in
  BM2, in the new file `apps/bus-math-v2/lib/teacher/ai-error-summary.ts`. Its input type
  `LessonErrorSummary` stays in `apps/bus-math-v2/lib/teacher/error-summary.ts`. No type
  moves into a package, because `buildLessonErrorSummary` depends on the BM2 type
  `SubmissionDetail`. The package boundary stays: packages never import apps.
- **Author decision (response shape and UI, D11):** the teacher UI does not change, because
  no page or component calls the route. The route keeps the keys `studentName`,
  `lessonTitle`, `deterministicSummary`, `aiSummary`, and `aiEnabled`. Only the value of
  `aiSummary` changes, to the BM2 type `TeacherAiSummary`. `AIInterpretationResult` goes away
  with `ai-interpretation.ts`. `AISummaryOutput`, `TeacherErrorView`, and
  `buildTeacherErrorView` of `packages/practice-core` stay without change.
- **Author decision (dead code):** after the move, `generateAISummary`, `buildAIPrompt`,
  `parseAIResponse`, and `AISummaryInput` of `packages/practice-core` have no caller. S4
  removes them and their tests.

## Roles

| Role key | Variable | Feature | Structured output | PII flag | Initial value (user, 2026-11-14) |
|----------|----------|---------|-------------------|----------|----------------------------------|
| `studentTutor` | `OPENROUTER_MODEL_STUDENT_TUTOR` | IM3 and BM2 lesson chatbots | No | `false` | Not chosen. `openrouter/free` for development only. |
| `spreadsheetEval` | `OPENROUTER_MODEL_SPREADSHEET_EVAL` | BM2 spreadsheet feedback (`lib/ai/spreadsheet-feedback.ts`) | Yes | `false` | `google/gemini-4-hydrogen` |
| `accountingEval` | `OPENROUTER_MODEL_ACCOUNTING_EVAL` | BM2 teacher AI error summary (route `app/api/teacher/ai-error-summary/route.ts`; logic moves from `packages/practice-core/src/practice/error-analysis/index.ts` to the new `apps/bus-math-v2/lib/teacher/ai-error-summary.ts`, D11) | Yes | `false` | `google/gemini-4-hydrogen` |
| (reserved) | `OPENROUTER_MODEL_MATH_EVAL` | A later track. This track documents it only, with no code. | — | — | `z-ai/glm-5.3-flash` |

The initial values go in this spec and in `.env.example` comments. They never go in the code
as defaults.

Model facts (OpenRouter models API, checked 2026-11-14):

- `google/gemini-4-hydrogen`: lists `response_format` and `structured_outputs`. It costs
  $1.50 per 1M input tokens and $7.50 per 1M output tokens.
- `z-ai/glm-5.3-flash`: lists `response_format` and `structured_outputs`. It costs about
  $0.04 per 1M input tokens and $0.08 per 1M output tokens.
- ZDR facts matter only for a future role with the PII flag. The ZDR endpoints of
  `google/gemini-4-hydrogen` are Google Vertex only. About 12 providers offer ZDR for
  `z-ai/glm-5.3-flash`.

## Terms

- **Role:** one AI use with its own model variable. The roles are in the "Roles" table.
- **PII:** a student or teacher name, email, username, or account ID.
- **PII flag:** the per-role setting of D10. When it is `true`, the request adds `zdr: true`
  to the `provider` object.
- **Prompt builder:** the code that makes the prompt or the messages of one feature: the
  chatbot message builder of IM3 and BM2, the spreadsheet feedback prompt, and the teacher
  error summary prompt (`buildTeacherSummaryPrompt` in the new
  `apps/bus-math-v2/lib/teacher/ai-error-summary.ts`).
- **TeacherAiSummary:** the new BM2 result type of the teacher summary: `type:
  'ai-assisted'`, `likelyMisunderstanding` (string), `evidenceObserved` (string list),
  `suggestedReteach` (string), `groundedIn` (string list), and `generatedAt` (number).
- **No-PII test:** a test that gives a prompt builder fixtures with names and emails, and
  checks that the prompt holds none of them.
- **Fail closed:** the feature sends no AI request, gives the same result as for a missing
  API key today, and logs one line that names the missing variable.
- **Usage record:** one log line for each AI request. It holds the role, the served model
  (the `model` field of the response), the latency in milliseconds, the token usage, and the
  outcome. It never holds prompt text, answer text, or the API key.
- **Structured output:** a request with a JSON Schema `response_format` in strict mode. The
  code checks the answer against the same Zod schema.
- **Typed failure:** a result object with `ok: false` and a reason. The structured-output
  helper returns it and does not throw.
- **workerd probe:** a test worker that runs the package provider in workerd through
  `wrangler dev`, against a local mock OpenRouter server.
- **Evidence file:** `measure/tracks/openrouter-sdk-ai-layer_20261114/evidence.md`.

## Stories

### Story S1: Adopt the OpenRouter SDK
**As a** maintainer of the AI features
**I want** `packages/ai-tutoring` to call OpenRouter through `@openrouter/sdk`
**So that** the transport uses the official, typed client, and the current behavior stays the same

**Acceptance Criteria:**
- Given the SDK in `packages/ai-tutoring`, When a provider function runs, Then the request goes through the SDK, and no package code calls `fetch` for OpenRouter.
- Given a 429 or 5xx response, an empty answer, a timeout, or an abort, When a provider function runs, Then the retry, timeout, abort, and empty-response behavior is the same as before.
- Given the existing tests of `packages/ai-tutoring`, IM3, and BM2, When they run, Then they pass.
- Given the vinext builds of IM3 and BM2 and the workerd probe, When they run, Then the builds pass and the probe gets the mock answer through the SDK in workerd.
- Given the builds before and after the change, When the maintainer measures the Worker bundles, Then the evidence file records both sizes.

**Estimate:** L
**Priority:** Must

### Story S2: Role-based model configuration
**As a** maintainer of the AI features
**I want** each AI role to read its model from its own environment variable, with no default
**So that** each feature uses a chosen model, and a missing setting cannot send traffic to an unplanned model

**Acceptance Criteria:**
- Given `OPENROUTER_MODEL_STUDENT_TUTOR`, When a lesson chatbot calls OpenRouter, Then the request `model` field is the variable value without change.
- Given a missing or empty role variable, When the feature runs, Then it fails closed and logs the variable name.
- Given a role variable that starts with `@preset/`, When the feature runs, Then it fails closed and logs that roles do not use presets.
- Given only the old `OPENROUTER_MODEL` variable, When a feature runs, Then it fails closed.
- Given a completed or failed AI request, When the request ends, Then one usage record is logged, and no log line holds prompt or answer text.
- Given the role settings, When a request is built, Then `zdr: true` is in the `provider` object only for a role with the PII flag, and no current role has the flag.
- Given chatbot fixtures with names, emails, usernames, and account IDs, When the IM3 or BM2 chatbot builds its messages, Then the messages hold none of them.

**Estimate:** M
**Priority:** Must

### Story S3: Structured output for the evaluation features
**As a** teacher who reads AI feedback and AI error summaries
**I want** the two evaluation features to get checked objects through a structured-output helper on OpenRouter
**So that** the results do not depend on fragile text parsing, and the deterministic fallbacks stay

**Acceptance Criteria:**
- Given a Zod schema, When the helper sends a request, Then the request has `response_format` of type `json_schema` with `name`, `strict: true`, and the schema from `z.toJSONSchema()`.
- Given a structured-output request of a role without the PII flag, When it is sent, Then its `provider` object is exactly `{ "require_parameters": true }`.
- Given an answer that is not JSON or does not match the schema, When the helper parses it, Then it returns a typed failure and does not throw.
- Given BM2 spreadsheet feedback on the helper, When the answer is valid, Then the feedback holds the parsed fields with the score clamped to 0 to 40, and when it is not valid, Then the deterministic feedback is returned, as before.
- Given `OPENROUTER_MODEL_ACCOUNTING_EVAL` and the API key, When a teacher requests the AI error summary, Then the summary comes from a structured-output request with the lesson-level prompt and the 4 fields `likelyMisunderstanding`, `evidenceObserved`, `suggestedReteach`, and `groundedIn`.
- Given a failed model call or a failed Zod check, When a teacher requests the summary, Then the route returns the deterministic summary with `aiSummary: null`.
- Given a `LessonErrorSummary` fixture whose student name holds a name and an email, When the teacher summary prompt is built, Then the prompt holds neither, and it tells the model to write "the student".
- Given spreadsheet submit fixtures and teacher summary route fixtures with names, emails, usernames, and account IDs, When the prompts are built, Then the prompts hold none of them.

**Estimate:** L
**Priority:** Must

### Story S4: Remove the OpenAI paths and document the roles
**As a** maintainer of the AI features
**I want** the OpenAI code, the unused interpretation module, and the dead summary code removed, and the roles documented
**So that** all AI features use one provider, and a developer can configure each role from the docs

**Acceptance Criteria:**
- Given the removal, When it is complete, Then no code under `apps/` or `packages/` calls OpenAI or Anthropic.
- Given the removal, When it is complete, Then `ai-interpretation.ts`, its test, and `lib/practice/error-analysis/providers.ts` of BM2 do not exist.
- Given `packages/practice-core`, When the removal is complete, Then `generateAISummary`, `buildAIPrompt`, `parseAIResponse`, and `AISummaryInput` do not exist, and `AISummaryOutput`, `TeacherErrorView`, and `buildTeacherErrorView` stay without change.
- Given the two `.env.example` files and `measure/tech-stack.md`, When a developer reads them, Then they name the API key, the role variables, the initial values as comments, and the `openrouter/free` development note.

**Estimate:** M
**Priority:** Must

## Production Prerequisites (human gates for Daniel)

These steps are not code tasks. Production use of the AI features needs them.

- **PR1:** Make the app API key in OpenRouter, and set a spend limit on it.
- **PR2:** Choose the production model for `OPENROUTER_MODEL_STUDENT_TUTOR`.
- **PR3:** Set `OPENROUTER_API_KEY` and the role variables in each deployed Worker.
- **PR4:** Run the live smoke test with a real key (plan task "Live smoke test").

ZDR and the Google Safety Retention setting are not prerequisites (D9).

## Non-Functional Requirements

- The user approved `@openrouter/sdk` on 2026-11-14. D7 needs `zod` as a declared dependency
  of `packages/ai-tutoring`, because the helper calls `z.toJSONSchema()`. zod is already in
  the lockfile, and the SDK depends on it. Each other dependency change needs the user's
  approval.
- Tests use a mocked SDK or a mocked `fetch`. CI makes no live API call.
- The live smoke test with a real key is a manual, human-gated step.
- No code sends a `provider` field other than `require_parameters: true` on a
  structured-output request and `zdr: true` for a role with the PII flag.
- AI prompts contain no PII: no student or teacher names, emails, usernames, or account IDs.
  Do not add pseudonymous IDs unless a feature needs them.
- Each prompt builder has a no-PII test.
- No log line holds prompt text, answer text, or the API key.
- Shared packages do not import from `apps/` or `convex/_generated/`.
- `packages/practice-core` does not depend on `packages/ai-tutoring`. The teacher AI summary
  lives in BM2 (D11 placement decision).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- **AC1:** `packages/ai-tutoring` sends each OpenRouter request through `@openrouter/sdk`.
  The retry, timeout, abort, empty-response, and prompt-guard tests pass.
- **AC2:** The vinext builds of IM3 and BM2 pass, and the workerd probe passes. The evidence
  file has the Worker bundle sizes before and after S1.
- **AC3:** Each AI feature reads its model from its role variable. No code has a default
  model, and no code reads `OPENROUTER_MODEL`.
- **AC4:** A missing role variable or API key makes the feature fail closed and logs the
  missing variable name.
- **AC5:** Each AI request logs one usage record, with no prompt or answer text.
- **AC6:** BM2 spreadsheet feedback and the BM2 teacher error summary use the
  structured-output helper and keep their deterministic fallbacks. The teacher summary uses
  the lesson-level prompt without the student name, and the route response keeps its keys.
- **AC7:** No code under `apps/` or `packages/` calls OpenAI or Anthropic.
  `ai-interpretation.ts`, its test, and the dead summary code of `packages/practice-core` do
  not exist.
- **AC8:** Both `.env.example` files and `measure/tech-stack.md` describe the roles and the
  development-only use of `openrouter/free`.
- **AC9:** All gates pass, and CI makes no live API call.
- **AC10:** Each prompt builder has a no-PII test that passes. Each role has a PII flag, and
  no current role sets it.

## Out of Scope

- Streaming chat UI, tool calls, saved chat history, the choice of paid models, and changes
  to the OpenRouter account settings.
- Presets for roles (D5).
- Code for the math evaluation role.
- Deploys, Worker secrets, and the live smoke test (human gates).
- Known limit: personal data that a student types (a chatbot question, an answer, or a
  spreadsheet cell) goes to the model as typed. An answer can hold the student's own name.
  This track does not filter it.
- A teacher UI for the AI error summary, and a change that puts the student name into the
  AI text (D11).

## Follow-Up Work

- **Decision models and the math evaluation role (a later track):** the OpenRouter Decisions
  API (`POST /api/alpha/decisions`, alpha) and the `OPENROUTER_MODEL_MATH_EVAL` role. That
  track must start with a test set of real student work that teachers graded. Candidates seen
  on 2026-11-14: `openai/gpt-6-luna-decisions`, `google/gemini-decision-1`,
  `typesafe/jev-1.14`, and `nace-ai/drex-max-finance`. Do not create that track now.
- Streaming chat UI, tool calls, saved chat history, and the choice of paid models.
