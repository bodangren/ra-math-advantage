# SRS Dashboard Streak Test Coverage

## Overview
Add test coverage for streak calculation logic in `convex/srs/dashboard.ts` and review persistence in `convex/srs/reviews.ts`. Both modules have zero test coverage despite containing non-trivial logic.

## Scope
1. `convex/srs/dashboard.ts` — `getDayStart` helper and streak calculation in `getPracticeStatsHandler`
2. `convex/srs/reviews.ts` — `saveReview`, `getReviewsByCard`, `getReviewsByStudent`

## Approach
- Extract `getDayStart` and streak calculation into exported pure functions for direct unit testing
- Mock Convex DB context following the pattern in `__tests__/convex/teacher/srs-dashboard.test.ts`
- TDD: write failing tests first, then implement/extract to pass

## Acceptance Criteria
- [ ] `getDayStart` tested with edge cases (midnight UTC, different timezones, etc.)
- [ ] Streak calculation tested: consecutive days, gap breaks, today/yesterday start requirement
- [ ] `getPracticeStatsHandler` tested with mocked DB (no sessions, single session, multi-day streak)
- [ ] `saveReview` tested: insert with required fields, optional fields defaulting
- [ ] `getReviewsByCard` tested: sorts by reviewedAt, maps fields correctly
- [ ] `getReviewsByStudent` tested: filters by since date, maps fields correctly
- [ ] All existing tests continue to pass
- [ ] `npm run build` and `npx tsc --noEmit` pass
