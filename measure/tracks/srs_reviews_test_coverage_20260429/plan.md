# Plan: SRS reviews.ts Test Coverage

## Phase 1: Unit Tests for saveReview, getReviewsByCard, getReviewsByStudent

- [x] Task: Create `__tests__/convex/srs/reviews.test.ts` with mock ctx factory
    - Mock db.query().withIndex().collect() for queries
    - Mock db.insert() for mutations
    - Reference existing cards.test.ts for mockCtx pattern
- [x] Task: Test saveReview internalMutation
    - Valid review insertion returns id
    - Maps studentId/cardId to Id types
    - Handles optional reviewId/submissionId
- [x] Task: Test getReviewsByCard internalQuery
    - Returns reviews sorted by reviewedAt ascending
    - Maps database fields to contract format (reviewedAt → ISO string)
    - Returns empty array when no matches
- [x] Task: Test getReviewsByStudent internalQuery
    - Returns reviews sorted by reviewedAt ascending
    - Filters by since timestamp when provided
    - Returns empty array when no matches
- [x] Run tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/srs/reviews.test.ts` — 10 tests pass
- [x] Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/` — 3311 passed, 2 todo
- [x] Run IM3 lint: `npm run lint` — 0 errors
- [x] Run IM3 typecheck: `npx tsc --noEmit` — 0 errors
- [x] Run IM3 build: `npm run build` — clean build
