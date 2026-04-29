# Plan: SRS saveCards Batch Mutation

## Phase 1: Fix saveCards Sequential Await → Promise.all Batching

- [x] Task: Read existing `saveCards` handler in `convex/srs/cards.ts`
- [x] Task: Refactor `saveCards` handler to use Promise.all for lookups phase
- [x] Task: Refactor `saveCards` handler to use Promise.all for writes phase
- [x] Task: Add unit tests for `saveCards` covering edge cases
- [x] Task: Run tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/srs/cards.test.ts`
- [x] Task: Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/`
- [x] Task: Run IM3 lint: `npm run lint`
- [x] Task: Run IM3 typecheck: `npx tsc --noEmit`
- [x] Task: Run IM3 build: `npm run build`
