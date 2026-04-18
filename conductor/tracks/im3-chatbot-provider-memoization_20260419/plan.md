# Implementation Plan: IM3 Chatbot Provider Memoization

## Phase 1: Memoize Provider and Add AbortSignal Support

### Tasks

- [x] **1.1** Add memoization to `resolveOpenRouterProviderFromEnv`
  - Use a module-level cache variable
  - Store provider in closure
  - Return cached provider on subsequent calls

- [x] **1.2** Add AbortSignal support to `openRouterProvider`
  - Accept optional `AbortSignal` parameter
  - Pass signal to fetch call
  - Handle abort errors gracefully

- [x] **1.3** Add unit tests for memoization
  - Verify provider is reused across calls
  - Verify AbortSignal cancellation works

### Technical Notes

- Use module-level cache variable
- AbortSignal is optional to maintain backward compatibility
- Handle abort by chaining to internal AbortController

### Verification

- [x] Run `npm test` for ai-tutoring - 45 tests pass (43 + 2 new)
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds
- [x] Run `npx tsc --noEmit` - no type errors