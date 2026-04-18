# Specification: IM3 Chatbot Provider Memoization

## Problem

`resolveOpenRouterProviderFromEnv()` in `packages/ai-tutoring/src/providers.ts` creates a new OpenRouter provider on every call. This is inefficient and doesn't handle client disconnects (no AbortSignal support).

## Solution

1. Memoize `resolveOpenRouterProviderFromEnv` so the provider is created once and reused across requests
2. Add optional external AbortSignal support to the provider function for proper client disconnect handling

## Acceptance Criteria

- [ ] Provider is created once and cached, not recreated on every request
- [ ] Provider function accepts an optional AbortSignal parameter
- [ ] When AbortSignal is triggered, the in-flight fetch is cancelled
- [ ] Tests verify memoization behavior
- [ ] No regression in existing ai-tutoring tests