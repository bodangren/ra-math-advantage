# Implementation Plan: Standards & Objective Seeding — All Apps

## Phase 1: IM1 Standards — SKIPPED (deferred per user request)

- [ ] Task: Define IM1 competency standards
    - [ ] Research Common Core standards for Integrated Math 1
    - [ ] Create `apps/integrated-math-1/convex/seed/seed_standards.ts` with ~40-50 standards
    - [ ] Include standard code, description, and category for each
- [ ] Task: Create IM1 lesson-standards mapping
    - [ ] Create `apps/integrated-math-1/convex/seed/seed_lesson_standards.ts`
    - [ ] Map all ~99 lesson slugs to their primary and supporting standards
- [ ] Task: Create IM1 objective policies
    - [ ] Create `apps/integrated-math-1/convex/seed/seed_objective_policies.ts`
    - [ ] Assign `essential`/`supporting`/`extension` priority to each standard

## Phase 2: IM2 Standards — COMPLETE [checkpoint: 8d7c55a]

- [x] Task: Define IM2 competency standards
    - [x] Research Common Core standards for Integrated Math 2
    - [x] Create `apps/integrated-math-2/convex/seed/seed_standards.ts` with 48 standards
- [x] Task: Create IM2 lesson-standards mapping
    - [x] Create `apps/integrated-math-2/convex/seed/seed_lesson_standards.ts`
    - [x] Map all 67 lesson slugs to their primary and supporting standards (140 links)
- [x] Task: Create IM2 objective policies
    - [x] Create `apps/integrated-math-2/convex/seed/seed_objective_policies.ts`
    - [x] Create companion `objective_policies.ts` with 48 policies (27 essential, 16 supporting, 5 extension)

## Phase 3: PreCalc Standards — COMPLETE [checkpoint: b8b4479]

- [x] Task: Define PreCalc competency standards
    - [x] Research AP Precalculus standards
    - [x] Create `apps/pre-calculus/convex/seed/seed_standards.ts` with 36 standards
- [x] Task: Create PreCalc lesson-standards mapping
    - [x] Create `apps/pre-calculus/convex/seed/seed_lesson_standards.ts`
    - [x] Map all 58 lesson slugs to their primary and supporting standards (114 links)
- [x] Task: Create PreCalc objective policies
    - [x] Create `apps/pre-calculus/convex/seed/seed_objective_policies.ts`
    - [x] Create companion `objective_policies.ts` with 37 policies (22 essential, 2 supporting, 13 extension)

## Phase 4: Verification

- [ ] Task: Type check all seed files
    - [ ] Run `npx tsc --noEmit` in each app
    - [ ] Verify no orphaned standards (every standard mapped to at least one lesson)
    - [ ] Verify no orphaned lessons (every lesson mapped to at least one standard)
