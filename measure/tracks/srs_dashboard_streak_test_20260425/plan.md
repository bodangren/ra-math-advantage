# SRS Dashboard Streak Test Coverage - Implementation Plan

## Phase 1: Extract and Test Streak Logic (TDD)
- [x] Write failing tests for `getDayStart` pure function (pre-existing, broken imports)
- [x] Write failing tests for `calculateStreak` pure function (pre-existing, broken imports)
- [x] Write failing tests for `getPracticeStatsHandler` with mocked DB (pre-existing)
- [x] Export `getDayStart` and extract streak calc to `calculateStreak` in dashboard.ts
- [x] Verify all tests pass

## Phase 2: Test Reviews Module
- [ ] Write failing tests for `saveReview` handler with mocked mutation ctx
- [ ] Write failing tests for `getReviewsByCard` handler with mocked query ctx
- [ ] Write failing tests for `getReviewsByStudent` handler with mocked query ctx
- [ ] Verify all tests pass

## Phase 3: Finalize
- [ ] Run full test suite
- [ ] Run `npm run build` and `npx tsc --noEmit`
- [ ] Update tech-debt.md and lessons-learned.md
- [ ] Commit and push
