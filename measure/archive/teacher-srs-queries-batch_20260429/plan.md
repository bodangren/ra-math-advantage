# Plan: Teacher SRS Queries N+1 Batch Fix

## Phase 1: Batch srs_cards and srs_review_log Queries [COMPLETE] [checkpoint: 18913b3]

- [x] Task: Read `getTeacherClassProficiencyHandler` in `convex/objectiveProficiency.ts`
- [x] Task: Replace per-student card queries with single broad query
- [x] Task: Replace per-student review queries with single broad query
- [x] Task: Update allStudentCards and allStudentReviews Map construction
- [x] Task: Run objectiveProficiency tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts`
- [x] Task: Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/`
- [x] Task: Run IM3 lint: `npm run lint`
- [x] Task: Run IM3 typecheck: `npx tsc --noEmit`
- [x] Task: Run IM3 build: `npm run build`

## Phase 2: Batch competency_standards Query in preFetchTeacherClassData [COMPLETE]

- [x] Task: Read `preFetchTeacherClassData` function
- [x] Task: Replace per-objective standards queries with single broad query
- [x] Task: Update standardsByObjective Map construction
- [x] Task: Run objectiveProficiency tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts`
- [x] Task: Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/`
- [x] Task: Run IM3 lint: `npm run lint`
- [x] Task: Run IM3 typecheck: `npx tsc --noEmit`
- [x] Task: Run IM3 build: `npm run build`
