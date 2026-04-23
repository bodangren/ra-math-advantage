# Plan: Lesson Version Query Optimization

## Phase 1: Curriculum Query Batching

- [ ] Task: Batch lesson version lookups in public.ts
    - [ ] Write tests verifying single batch query for getCurriculum
    - [ ] Refactor getCurriculum to fetch all lesson_versions in one query
    - [ ] Build lessonId→version Map for O(1) lookup
    - [ ] Write tests verifying single batch query for getUnitSummaries
    - [ ] Refactor getUnitSummaries with same batching pattern

## Phase 2: Enrollment Query Batching

- [ ] Task: Batch isStudentEnrolledInClassForLesson
    - [ ] Write tests for parallel enrollment resolution
    - [ ] Replace sequential loop with Promise.all over deduplicated enrollment IDs
    - [ ] Verify identical return behavior

## Phase 3: Verification

- [ ] Task: Full suite validation
    - [ ] Run `npm run lint` — zero errors
    - [ ] Run `npx tsc --noEmit` — zero errors
    - [ ] Run `npm run test` — all tests pass
    - [ ] Run `npm run build` — clean build
