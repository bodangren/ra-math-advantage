# Implementation Plan: Lesson Seeding — All Apps

## Phase 1: IM1 Lesson Seeds — SKIPPED (deferred per user request)

## Phase 2: IM1 Lesson Seeds (Modules 8-14) — SKIPPED

## Phase 3: IM2 Lesson Seeds — COMPLETE [checkpoint: 80af510]

- [x] Task: Create seed files for Units 1-7 (38 lessons)
    - [x] Unit 1: Relationships in Triangles (6)
    - [x] Unit 2: Quadrilaterals (5)
    - [x] Unit 3: Similarity (5)
    - [x] Unit 4: Right Triangles & Trig (6)
    - [x] Unit 5: Circles (5)
    - [x] Unit 6: Measurement (5)
    - [x] Unit 7: Probability (6)
- [x] Task: Create seed files for Units 8-13 (32 lessons)
    - [x] Unit 8: Relations & Functions (6)
    - [x] Unit 9: Linear Equations/Systems (5)
    - [x] Unit 10: Exponents & Roots (5)
    - [x] Unit 11: Polynomials (6)
    - [x] Unit 12: Quadratic Functions (5)
    - [x] Unit 13: Trig Identities (5)
- [x] Task: Update IM2 `seed.ts` to orchestrate all lesson seeds

## Phase 4: PreCalc Lesson Seeds — COMPLETE [checkpoint: 31f146b]

- [x] Task: Create seed files for Unit 1 (14 lessons)
- [x] Task: Create seed files for Unit 2 (15 lessons)
- [x] Task: Create seed files for Unit 3 (15 lessons)
- [x] Task: Create seed files for Unit 4 (14 lessons)
- [x] Task: Update PreCalc `seed.ts` to orchestrate all lesson seeds

## Phase 5: Verification

- [ ] Task: Type check all seed files
    - [ ] Run `npx tsc --noEmit` in each app
    - [ ] Verify no duplicate lesson slugs within each app
    - [ ] Verify all activity component keys are valid
