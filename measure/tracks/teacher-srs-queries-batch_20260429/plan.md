# Plan: Teacher SRS Queries N+1 Batch Fix

## Phase 1: Batch srs_cards and srs_review_log Queries

- [ ] Task: Read `getTeacherClassProficiencyHandler` in `convex/objectiveProficiency.ts`
- [ ] Task: Replace per-student card queries with single broad query
- [ ] Task: Replace per-student review queries with single broad query
- [ ] Task: Update allStudentCards and allStudentReviews Map construction
- [ ] Task: Run objectiveProficiency tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts`
- [ ] Task: Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/`
- [ ] Task: Run IM3 lint: `npm run lint`
- [ ] Task: Run IM3 typecheck: `npx tsc --noEmit`
- [ ] Task: Run IM3 build: `npm run build`

## Phase 2: Batch competency_standards Query in preFetchTeacherClassData

- [ ] Task: Read `preFetchTeacherClassData` function
- [ ] Task: Replace per-objective standards queries with single broad query
- [ ] Task: Update standardsByObjective Map construction
- [ ] Task: Run objectiveProficiency tests: `npm test -- --run apps/integrated-math-3/__tests__/convex/objectiveProficiency.test.ts`
- [ ] Task: Run full IM3 test suite: `npm test -- --run apps/integrated-math-3/`
- [ ] Task: Run IM3 lint: `npm run lint`
- [ ] Task: Run IM3 typecheck: `npx tsc --noEmit`
- [ ] Task: Run IM3 build: `npm run build`