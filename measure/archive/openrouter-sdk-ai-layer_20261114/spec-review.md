# Spec Review: openrouter-sdk-ai-layer_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves every AI feature to OpenRouter through the official `@openrouter/sdk` package. Each AI role reads its model from its own environment variable, with no default model. A missing setting fails closed. A structured-output helper in `packages/ai-tutoring` gives typed results to the BM2 spreadsheet feedback and the BM2 teacher error summary. The teacher summary rebuilds the lesson-level prompt of `ai-interpretation.ts` without the student name. The track then removes the OpenAI code paths and the unused `ai-interpretation.ts`.

### How the current system works, per this spec

`packages/ai-tutoring/src/providers.ts` calls the OpenRouter chat endpoint with plain `fetch`, reads `OPENROUTER_MODEL` with the default `openrouter/free`, and wraps each request in `withRetry` (2 retries, 500 ms base delay, 8000 ms cap). The IM3 and BM2 lesson chatbots resolve the provider from the environment and return HTTP 503 when the key is missing. BM2 spreadsheet feedback parses free-text JSON and falls back to deterministic feedback. The BM2 teacher error summary calls OpenAI directly through `apps/bus-math-v2/lib/practice/error-analysis/providers.ts` and parses three text lines. `ai-interpretation.ts` is unused except by its own test. No page or component calls the teacher summary route.

### Findings

- F1 [Major] plan.md Phase S1 Test (Red) and Phase S2 Implement: The plan does not name `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`, an existing caller of `createOpenRouterProvider({ apiKey: 'test-key' })` that asserts the raw `fetch` URL. S1 moves the transport into the SDK, and S2 makes `model` required, so this test breaks unless its mocks and call change. Rationale: The plan's S1 rule says to record each changed test assertion in the plan, and the Zero-Decision Check requires each phase to name the files to change; this file is left to the implementer.
- F2 [Major] plan.md Rules for All Phases, Gate Commands: The gate table omits gates the dependency track sets (`npx vitest run scripts/audit/__tests__`, `node scripts/validate-ci.mjs`, `npm ls --workspaces --depth=0`, `npm audit --json`), while the Start Gate says this track uses the gates that the earlier track sets. Rationale: This track edits `ci.yml` and `scripts/vitest.config.ts`; without the CI-check and audit-suite gates, those edits go unvalidated, and "run each gate" in each Verify task is ambiguous.
- F3 [Nit] plan.md Phase S2 Implement, env task: The task says to replace `OPENROUTER_MODEL` in both `.env.example` files, but `apps/bus-math-v2/.env.example` holds no `OPENROUTER_MODEL` line. Rationale: The instruction should say "add" for BM2; wording only, no change to what the implementer builds.
- F4 [Nit] plan.md Phase S1 Install: The task pins `"@openrouter/sdk": "^1.5.102"`, while spec.md line 87 and the registry record 1.5.103 as latest (published 2026-11-13 22:35 UTC). Rationale: The caret range resolves to 1.5.103 at install, so behavior is unchanged; the manifest line should still name the recorded latest.

### Author Response
- F1: FIX
- F2: FIX
- F3: DECLINE
- F4: DECLINE

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves every AI feature to OpenRouter through the official `@openrouter/sdk` package in `packages/ai-tutoring`. Each AI role reads its model from its own environment variable. The code has no default model, and a missing setting fails closed. The track adds a structured-output helper with Zod schemas. It moves the BM2 spreadsheet feedback and the BM2 teacher error summary to the helper. It then removes the OpenAI code paths and the unused `ai-interpretation.ts` module.

### How the current system works, per this spec

`packages/ai-tutoring` calls the OpenRouter chat endpoint with plain `fetch`. It reads the model from `OPENROUTER_MODEL` with a default of `openrouter/free`. It applies its own retry, timeout, and abort logic. The IM3 and BM2 lesson chatbots resolve a provider from the environment and return HTTP 503 when the key is missing. BM2 spreadsheet feedback asks for "JSON only" and parses it with `JSON.parse` and a Zod schema. The BM2 teacher error summary calls OpenAI directly through an injected provider function in `packages/practice-core`. No UI calls the teacher summary route. Only a test imports `ai-interpretation.ts`.

### Findings

- F1 [Major] plan.md S1 Test (Red) and S2 Implement: Resolved (FIX). S1 Test (Red) line 83 names `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts` and applies the assertion-change rule to it; the file exists and matches the plan description. S2 lines 169-170 name each test file to update: `packages/ai-tutoring/src/__tests__/providers.test.ts`, `apps/bus-math-v2/__tests__/lib/ai/providers.test.ts`, `apps/bus-math-v2/__tests__/lib/ai/spreadsheet-feedback.test.ts`, `apps/integrated-math-3/__tests__/app/api/student/lesson-chatbot/route.test.ts`, `apps/bus-math-v2/__tests__/app/api/student/lesson-chatbot/route.test.ts`, and `apps/bus-math-v2/__tests__/api/student/lesson-chatbot.test.ts`. All six files exist in the checkout.
- F2 [Major] plan.md Rules for All Phases, Gate Commands: Resolved (FIX). The gate table now lists the Scripts suite, the Audit suites, the Boundary check, the CI check, the Tree check, and the Advisories gate. Line 36 defines "Run each gate" as each row of the table. Each command target exists in the checkout (`scripts/vitest.config.ts`, `scripts/audit/__tests__/`, `scripts/validate-ci.mjs`, `scripts/check-monorepo-boundaries.mjs`).
- F3 [Nit] plan.md Phase S2 env task wording: DECLINE stands. DECLINE is valid for a Nit finding. No open item.
- F4 [Nit] plan.md Phase S1 SDK range `^1.5.102`: DECLINE stands. DECLINE is valid for a Nit finding. No open item.
- None. No new finding. No CONTEST or ESCALATE item needs a keep or withdraw decision.

```json
MEASURE_AGENT_RESULT
{
  "role": "spec-review",
  "phase": "track setup",
  "track": "openrouter-sdk-ai-layer_20261114",
  "round": 2,
  "status": "pass",
  "retry_recommendation": "none",
  "blocking_findings": [],
  "nonblocking_findings": [],
  "artifacts": [
    "measure/runs/openrouter-sdk-ai-layer_20261114/spec-review-392232d2.json",
    "measure/runs/openrouter-sdk-ai-layer_20261114/spec-review-392232d2.log"
  ]
}
```

### Author Response
- No new finding.

## Accepted Risks
- None. No Blocker or Major finding remains after Round 2.
