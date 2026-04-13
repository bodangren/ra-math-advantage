# Implementation Plan — Module 1 Curriculum Seed

## Phase 1: Infrastructure & Types

- [x] Task: Create seed type definitions `convex/seed/types.ts`
    - [x] Write tests: seed types match Convex schema shapes for all relevant tables
    - [x] Implement `SeedLesson`, `SeedPhase`, `SeedSection`, `SeedActivity` types

- [x] Task: Create seed utilities `convex/seed/utils.ts`
    - [x] Write tests: `toLatex()` converts `[...]` notation to `$$...$$` correctly
    - [x] Write tests: `idempotentInsert()` skips insert if record already exists by key
    - [x] Implement `toLatex()`, `idempotentInsert()`, `buildPhaseTitle()` helpers

- [x] Task: Create main seed entry point `convex/seed.ts`
    - [x] Write tests: orchestrates lessons 1-1 through 1-8 in order; handles errors per-lesson
    - [x] Implement `main()` Convex action calling each lesson seed function

- [ ] Task: Conductor — Phase Completion Verification 'Infrastructure & Types' (Protocol in workflow.md)

## Phase 2: Lesson 1-7 Content Authoring

- [x] Task: Author corrected `curriculum/modules/module-1-lesson-7` — Quadratic Inequalities
    - [x] Write Explore phase: graphical inquiry on where parabola is above/below x-axis
    - [x] Write Learn phase: sign chart / number line method
    - [x] Write Example 1: solve `x^2 - 5x + 6 > 0` graphically
    - [x] Write Example 2: solve `x^2 - 5x + 6 > 0` algebraically (sign chart)
    - [x] Write Example 3: solve `2x^2 + x - 3 ≤ 0`
    - [x] Write Example 4: real-world height-above-threshold context problem
    - [x] Write Think About It, In-Class Quick Check, CAP Reflection sections

- [ ] Task: Conductor — Phase Completion Verification 'Lesson 1-7 Content Authoring' (Protocol in workflow.md)

## Phase 3: Competency Standards & Demo Environment

- [ ] Task: Seed `competency_standards` records for Module 1
    - [ ] Write test: all 6 standards inserted with correct codes and descriptions
    - [ ] Implement `convex/seed/seed-standards.ts`

- [ ] Task: Seed demo org, users, and class
    - [ ] Write test: teacher + 5 students created with correct credentials and roles
    - [ ] Write test: class "IM3 Period 1" created with all 5 students enrolled
    - [ ] Implement `convex/seed/seed-demo-env.ts`

- [ ] Task: Seed demo student progress for lesson 1-1
    - [ ] Write test: student5 shows 100% completion on lesson 1-1 phases after seed
    - [ ] Implement progress records for students 2-5 at 25/50/75/100%

- [ ] Task: Conductor — Phase Completion Verification 'Standards & Demo Environment' (Protocol in workflow.md)

## Phase 4: Lesson Seeds — 1-1 through 1-4

- [ ] Task: Seed lesson 1-1 — Graphing Quadratic Functions
    - [ ] Write test: correct phase sequence (explore, vocab, learn, 3×worked_example, learn, 3×worked_example, discourse, reflection)
    - [ ] Write test: activity records created for all worked examples and explore phase
    - [ ] Implement `convex/seed/seed-lesson-1-1.ts`

- [ ] Task: Seed lesson 1-2 — Solving Quadratics by Graphing
    - [ ] Write test: correct phase sequence (explore, vocab, learn, 4×worked_example, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-2.ts`

- [ ] Task: Seed lesson 1-3 — Complex Numbers
    - [ ] Write test: correct phase sequence (explore, vocab, 2×learn, 3×worked_example, learn, 3×worked_example, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-3.ts`

- [ ] Task: Seed lesson 1-4 — Solving by Factoring
    - [ ] Write test: correct phase sequence (explore, vocab, 2×learn, 6×worked_example, discourse, assessment, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-4.ts`

- [ ] Task: Conductor — Phase Completion Verification 'Lesson Seeds 1-1 through 1-4' (Protocol in workflow.md)

## Phase 5: Lesson Seeds — 1-5 through 1-8

- [ ] Task: Seed lesson 1-5 — Completing the Square
    - [ ] Write test: correct phase sequence (explore, vocab, 2×learn, 4×worked_example, learn, assessment, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-5.ts`

- [ ] Task: Seed lesson 1-6 — Quadratic Formula and Discriminant
    - [ ] Write test: correct phase sequence (explore, vocab, learn, 3×worked_example, learn, 2×worked_example, assessment, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-6.ts`

- [ ] Task: Seed lesson 1-7 — Quadratic Inequalities
    - [ ] Write test: correct phase sequence (explore, vocab, learn, 4×worked_example, assessment, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-7.ts` using authored content

- [ ] Task: Seed lesson 1-8 — Linear-Quadratic Systems
    - [ ] Write test: correct phase sequence (explore, vocab, learn, 4×worked_example, assessment, discourse, reflection)
    - [ ] Implement `convex/seed/seed-lesson-1-8.ts`

- [ ] Task: End-to-end seed verification
    - [ ] Run full seed; verify lesson count, phase count, activity count
    - [ ] Verify demo teacher can see all 5 students with correct progress in gradebook
    - [ ] Verify student5 sees 100% completion on lesson 1-1 dashboard

- [ ] Task: Conductor — Phase Completion Verification 'Lesson Seeds 1-5 through 1-8' (Protocol in workflow.md)
