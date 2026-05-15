# Implementation Plan: Problem Families & Practice Items — All Apps

## Phase 1: IM1 Problem Families — SKIPPED (deferred per user request)

## Phase 2: IM2 Problem Families — COMPLETE

- [x] Task: Create problem family files for Units 1-7
    - [x] `problem_families/unit_01.ts` through `problem_families/unit_07.ts` (32 families)
- [x] Task: Create problem family files for Units 8-13
    - [x] `problem_families/unit_08.ts` through `problem_families/unit_13.ts` (27 families)
- [x] Task: Create IM2 practice item blueprints
    - [x] `seed_problem_families.ts` orchestration file

## Phase 3: PreCalc Problem Families — COMPLETE

- [x] Task: Create problem family files for all 4 units
    - [x] `problem_families/unit_01.ts` through `problem_families/unit_04.ts` (40 families total)

## Phase 4: Verification

- [ ] Task: Type check all problem family files
    - [ ] Run `npx tsc --noEmit` in each app
    - [ ] Verify no duplicate problem family IDs within each app
    - [ ] Verify all objective mappings reference valid standards
