# Module 2 Curriculum Seed — Implementation Plan

## Phase 1: Seed Lesson 2-1 (Polynomial Functions)

- [x] Task: Author curriculum content for lesson 2-1 (if not complete)
  - [x] Verify curriculum/modules/module-2-lesson-1 has required sections
  - [x] Ensure Explore, Learn, Worked Examples, Discourse, Reflection phases have content

- [x] Task: Create seed function `convex/seed/seed-lesson-2-1.ts`
  - [x] Write test: correct phase sequence (explore, vocabulary, learn, worked_example ×2, learn, worked_example ×4, discourse, reflection)
  - [x] Write test: section content extracted correctly from curriculum markdown
  - [x] Write test: idempotent insert (skip if exists)
  - [x] Implement `seedLesson2_1()` following module-1-seed pattern

## Phase 2: Seed Lesson 2-2 (Polynomials, Linear Factors, and Zeros)

- [ ] Task: Author curriculum content for lesson 2-2 (if not complete)
  - [ ] Verify curriculum/modules/module-2-lesson-2 has required sections
  - [ ] Ensure content covers synthetic division and Remainder Theorem

- [ ] Task: Create seed function `convex/seed/seed-lesson-2-2.ts`
  - [ ] Write test: correct phase sequence (explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection)
  - [ ] Write test: idempotent insert
  - [ ] Implement `seedLesson2_2()`

## Phase 3: Seed Lesson 2-3 (The Remainder and Factor Theorems)

- [ ] Task: Author curriculum content for lesson 2-3 (if not complete)
  - [ ] Verify curriculum/modules/module-2-lesson-3 has required sections

- [ ] Task: Create seed function `convex/seed/seed-lesson-2-3.ts`
  - [ ] Write test: correct phase sequence (explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection)
  - [ ] Write test: idempotent insert
  - [ ] Implement `seedLesson2_3()`

## Phase 4: Seed Lessons 2-4 and 2-5

- [ ] Task: Author curriculum content for lessons 2-4 and 2-5 (if not complete)
  - [ ] Verify curriculum/modules/module-2-lesson-4 has Fundamental Theorem content
  - [ ] Verify curriculum/modules/module-2-lesson-5 has graphs of polynomials content

- [ ] Task: Create seed function `convex/seed/seed-lesson-2-4.ts`
  - [ ] Write test: correct phase sequence (explore, vocabulary, learn, worked_example ×4, assessment, discourse, reflection)
  - [ ] Write test: idempotent insert
  - [ ] Implement `seedLesson2_4()`

- [ ] Task: Create seed function `convex/seed/seed-lesson-2-5.ts`
  - [ ] Write test: correct phase sequence (explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, assessment, discourse, reflection)
  - [ ] Write test: idempotent insert
  - [ ] Implement `seedLesson2_5()`

## Phase 5: Update seed.ts and Verify

- [ ] Task: Update `convex/seed.ts` to call new lesson seed functions
  - [ ] Add case statements for module-2-lesson-1 through module-2-lesson-5
  - [ ] Import new seed internal mutations

- [ ] Task: Update `convex/seed/seed-standards.ts` for Module 2 standards
  - [ ] Write test: all 4 Module 2 standards inserted with correct codes
  - [ ] Implement HSA-APR.A.1, HSA-APR.B.2, HSA-APR.B.3, HSA-CED.A.1

- [ ] Task: Run full seed verification
  - [ ] Run `npx convex run seed:main` or equivalent
  - [ ] Verify all 5 Module 2 lessons appear in database
  - [ ] Verify phase counts and types are correct
  - [ ] Verify lesson_standards links exist

- [ ] Task: Conductor — Phase Completion Verification (Protocol in workflow.md)