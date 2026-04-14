# Module 2 Curriculum Seed — Specification

## Context

Module 1 curriculum (8 lessons) is fully seeded and functional. Module 2 contains polynomial functions content spanning lessons 2-1 through 2-5. This track seeds the Module 2 lesson data, phases, sections, activity records, and standards into the Convex database following the same pattern established in the Module 1 seed track.

Module 2 Topic: Polynomial Functions
- Lesson 2-1: Polynomial Functions
- Lesson 2-2: Polynomials, Linear Factors, and Zeros (synthetic division, Remainder Theorem)
- Lesson 2-3: The Remainder and Factor Theorems
- Lesson 2-4: The Fundamental Theorem of Algebra (complex roots, conjugates)
- Lesson 2-5: Graphs of Polynomial Functions (end behavior, turning points)

## Requirements

### Phase Sequences

Each lesson must be seeded with the correct `phaseType` sequence derived from the curriculum markdown files:

| Lesson | Phase Sequence |
|--------|----------------|
| 2-1 | explore, vocabulary, learn, worked_example ×2, learn, worked_example ×4, discourse, reflection |
| 2-2 | explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection |
| 2-3 | explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, discourse, reflection |
| 2-4 | explore, vocabulary, learn, worked_example ×4, assessment, discourse, reflection |
| 2-5 | explore, vocabulary, learn, worked_example ×3, learn, worked_example ×3, assessment, discourse, reflection |

### Section Content

1. Each phase must be populated with `phase_sections` records sourced from the curriculum markdown files
2. Mathematical notation uses LaTeX format: `$...$` for inline, `$$...$$` for display
3. Content types: `text`, `callout` (Key Concept, Important), `activity`

### Activity Records

1. **explore** phases: `graphing-explorer` with `problemVariant: "explore"`
2. **worked_example** phases: `step-by-step-solver` with appropriate problem type config
3. **assessment** phases: `comprehension-quiz` with quick-check questions

### Competency Standards

Seed Module 2 competency standards aligned to Common Core:
- `HSA-APR.A.1` — Polynomials as expressions
- `HSA-APR.B.2` — Remainder Theorem
- `HSA-APR.B.3` — Zeros of polynomials
- `HSA-CED.A.1` — Creating equations

### Idempotency

All seed functions must be idempotent: check for existing data before inserting (keyed on lesson slug `module-2-lesson-N`).

## Acceptance Criteria

1. All 5 Module 2 lessons seed without error
2. Each lesson has correct number of phases with correct `phaseType` and `title`
3. Idempotent re-run produces no duplicates
4. All worked example phases have activity records with valid props
5. Assessment phases have `comprehension-quiz` activity records
6. Module 2 competency standards seeded and linked to lessons
7. `npm run lint` passes on seed files
8. Seed can be run via `npx convex run seed:main -- until `seedModule2Lessons` is called

## Out of Scope

- Module 3-9 content authoring or seeding
- Changes to Convex seed architecture (reuse module-1 pattern)
- Content authoring for lessons without curriculum markdown