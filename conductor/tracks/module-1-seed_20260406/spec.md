# Specification — Module 1 Curriculum Seed

## Context

No lesson data exists in the Convex database. To run the full student and teacher experience for Module 1, the database must be seeded with all 8 lessons, their phases (typed and sequenced correctly), their section content, activity records with props, and demo org/users/classes.

This track also resolves the **Lesson 1-7 curriculum bug**: the file `curriculum/modules/module-1-lesson-7` currently contains a duplicate of lesson 1-6 content. The correct content for 1-7 ("Quadratic Inequalities") must be authored as part of this track.

## Requirements

### Lesson 1-7 Content Authoring

1. **Author `curriculum/modules/module-1-lesson-7`** with the correct content for "Quadratic Inequalities":
   - Explore: Using a graph to find where a quadratic is above/below the x-axis
   - Learn: Solving quadratic inequalities (number line / sign chart method)
   - Example 1: Solve `x^2 - 5x + 6 > 0` graphically
   - Example 2: Solve `x^2 - 5x + 6 > 0` algebraically (sign chart)
   - Example 3: Solve `2x^2 + x - 3 ≤ 0`
   - Example 4: Real-world context (height above threshold)
   - Think About It, In-Class Quick Check, CAP Reflection

### Seed Script Architecture

2. **`convex/seed.ts`** — Main seed entry point. Uses Convex's HTTP action or a Node.js script calling `ConvexHttpClient` with admin auth. Idempotent: checks for existing data before inserting (keyed on lesson slug).

3. **`convex/seed/`** directory with one file per lesson:
   - `seed-lesson-1-1.ts` through `seed-lesson-1-8.ts`
   - Each exports a `seedLesson()` function returning the full lesson data structure

4. **`convex/seed/types.ts`** — Shared TypeScript types for the seed data structures, matching the Convex schema exactly.

### Phase Sequences

Each lesson must be seeded with the correct `phaseType` sequence and `title`. The sequences derived from the curriculum:

| Lesson | Phase Sequence |
|--------|----------------|
| 1-1 | explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection |
| 1-2 | explore, vocabulary, learn, worked_example ×4, discourse, reflection |
| 1-3 | explore, vocabulary, learn, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection |
| 1-4 | explore, vocabulary, learn, learn, worked_example ×6, discourse, assessment, reflection |
| 1-5 | explore, vocabulary, learn, learn, worked_example ×4, learn, assessment, discourse, reflection |
| 1-6 | explore, vocabulary, learn, worked_example ×3, learn, worked_example ×2, assessment, discourse, reflection |
| 1-7 | explore, vocabulary, learn, worked_example ×4, assessment, discourse, reflection |
| 1-8 | explore, vocabulary, learn, worked_example ×4, assessment, discourse, reflection |

### Section Content

5. Each phase must be populated with `phase_sections` records. Content sourced directly from curriculum markdown files:
   - `text` sections: lesson explanation prose (markdown), rendered via `MarkdownRenderer`
   - `callout` sections: Key Concept and Key Idea boxes → `CalloutBox` with `type: "important"`
   - `activity` sections: worked examples and practice → activity records (see below)

6. Mathematical notation in section content must use the LaTeX format `$...$` for inline and `$$...$$` for display math (converted from the `[...]` notation in curriculum files during seeding).

### Activity Records

7. For each **worked example** phase, create one `activities` table record per example with:
   - `componentKey`: appropriate key (`step-by-step-solver` or `graphing-explorer`)
   - `props`: fully specified per the props schema (problem type, steps, equation, distractors)
   - `gradingConfig`: `{ autoGrade: true, partialCredit: true }`

8. For each **assessment** phase, create activity records for each Quick Check question using `comprehension-quiz`.

9. For each **explore** phase, create an activity record using `graphing-explorer` with `problemVariant: "explore"` or `step-by-step-solver` where graphing is not the focus.

### Competency Standards

10. Seed `competency_standards` records for Module 1 aligned to Common Core HSA standards:
    - `HSA-SSE.B.3` — Choosing and producing equivalent forms of expressions
    - `HSA-REI.B.4` — Solving quadratic equations in one variable
    - `HSA-APR.B.3` — Identifying zeros of polynomials
    - `HSA-CED.A.1` — Creating equations in one variable
    - `N-CN.A.1` — Knowing the definition of complex numbers
    - `N-CN.C.7` — Solving quadratics with complex solutions

11. Link each lesson's `lesson_versions` record to the primary standard for that lesson via `lesson_standards`.

### Demo Environment

12. Seed the following accounts in the `demo` organization:
    - 1 teacher: `teacher@demo` / `Demo1234!`
    - 5 students: `student1@demo` through `student5@demo` / `Demo1234!`
    - 1 class "IM3 Period 1" with all 5 students enrolled
    - Variable progress: student1 = 0%, student2 = 25%, student3 = 50%, student4 = 75%, student5 = 100% of Lesson 1-1

## Acceptance Criteria

1. Lesson 1-7 content correctly covers "Quadratic Inequalities" (not duplicate 1-6)
2. All 8 lessons seed without error; idempotent re-run produces no duplicates
3. Each lesson has correct number of phases with correct `phaseType` and `title`
4. All worked example phases have associated activity records with valid props
5. Assessment phases have `comprehension-quiz` activity records
6. 6 competency standards seeded and linked correctly to lessons
7. Demo org with teacher + 5 students + 1 class exists after seeding
8. Student 5 shows 100% Lesson 1-1 completion in teacher gradebook after seed
9. `npm run lint` passes on seed files
10. Seed can be run via `npx convex run seed:main` or equivalent command

## Out of Scope

- Module 2-9 content seeding
- Content authoring tools / admin CMS
- Importing from external curriculum files (manual authoring in seed script is acceptable)
