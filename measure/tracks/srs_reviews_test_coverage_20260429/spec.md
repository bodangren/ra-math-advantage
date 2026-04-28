# Spec: SRS reviews.ts Test Coverage

## Overview

The IM3 Convex SRS reviews module (`convex/srs/reviews.ts`) contains three functions — `saveReview`, `getReviewsByCard`, and `getReviewsByStudent` — that have zero direct unit tests. Only adapter-level tests exist (via `convexReviewLogStore`), which mock the Convex functions. This track adds direct tests using mocked Convex ctx.

## Functional Requirements

1. Add unit tests for `saveReview` internalMutation
   - Valid review log insertion with all fields
   - Handles optional reviewId and submissionId correctly
   - Maps studentId and cardId to proper Id types
2. Add unit tests for `getReviewsByCard` internalQuery
   - Returns reviews sorted by reviewedAt ascending
   - Correctly maps database fields to contract format
   - Uses by_card index
3. Add unit tests for `getReviewsByStudent` internalQuery
   - Returns reviews sorted by reviewedAt ascending
   - Filters by optional since timestamp correctly
   - Uses by_student index

## Non-Functional Requirements

- Follow existing Convex test patterns in `__tests__/convex/srs/`
- Mock ctx.db query/insert/replace operations using vi.fn()
- Cover edge cases: empty results, since filter boundaries

## Acceptance Criteria

- [ ] saveReview tests: valid insertion, id mapping, field handling
- [ ] getReviewsByCard tests: sorted results, field mapping, empty results
- [ ] getReviewsByStudent tests: sorted results, since filter, empty results
- [ ] All existing tests pass

## Out of Scope

- Integration tests (already covered by adapter tests)
- BM2 reviews.ts (separate app)
