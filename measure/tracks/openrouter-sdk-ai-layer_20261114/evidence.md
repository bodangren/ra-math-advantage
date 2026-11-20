# Evidence: openrouter-sdk-ai-layer_20261114, Phase S1

Track: `openrouter-sdk-ai-layer_20261114`.
Phase: `Phase S1: Adopt the OpenRouter SDK`.
Strategy: `test-strategy.md` r1 (2026-11-20). Scope: Phase S1.

## SDK API

Source: the installed files of `@openrouter/sdk` only. No guesswork.

(Contract task fills this section after the S1 Install task.)

- Client constructor options (API key, server URL, `httpReferer`, `appTitle`, retry
  settings, timeout): TBD.
- Chat send method, request fields (`model`, `messages`, `responseFormat`, `provider`,
  `temperature`, max tokens), request options for an `AbortSignal`: TBD.
- Response fields (content, served `model`, token `usage`), error classes with HTTP
  status fields: TBD.
- Transport (`globalThis.fetch` or not), Cloudflare Workers support (`RUNTIMES.md`): TBD.

## Bundle sizes

Method: each `.js` file under `dist/server/` (recursive), raw bytes and gzip bytes
(`gzip -c <file> | wc -c`), plus totals. Full tables live in the gate logs
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/<label>/sizes-<app>.txt`.

### Baseline (label `baseline`)

TBD.

### After the change (label `s1`)

TBD.

## workerd probe

TBD. At baseline the `test:workerd` script does not exist (finding F2); the
`checks-all` baseline gate records the probe step as pending.

## zod check

TBD (belongs to S3; the S1 baseline only records that `zod` is not yet a declared
dependency of `packages/ai-tutoring`).

## Live smoke test

TBD. This is a manual, human-gated step in S4. It is not part of CI.

## Baseline gate results (label `baseline`)

TBD. Each row names the gate log path under
`measure/runs/openrouter-sdk-ai-layer_20261114/gates/baseline/`.

## npm audit baseline

TBD (counts with labeled integers, plus advisory IDs).

## Baseline failure keys

TBD (per-key comparison per strategy section 5; a workspace-level pass or fail
is not the unit of comparison).
