# ALEKS Practice Planning and Module Exports

This folder translates the existing Integrated Math 3 curriculum definition into ALEKS-style reusable problem types and keeps the local ALEKS syllabus export available as source evidence.

The goal is not to replace the textbook/class-period plan. The goal is to add a problem-family layer that can drive practice generation, mastery days, jigsaw tasks, reviews, and assessments while staying aligned to the current course objectives and worked examples.

## Local Source Audit

Current local sources used for this planning layer:

| Source | Role |
|---|---|
| `curriculum/course-spec.md` | Defines the class period as the atomic planning object and sets the schema for course planning. |
| `curriculum/module-*-class-period-plan.md` | Canonical period-by-period plans for all 9 modules. |
| `curriculum/modules/module-*-lesson-*` | Lesson source files with worked examples and objective alignment. |
| `curriculum/ALEKS-practice-problems.htm` | Local ALEKS syllabus export used to derive visible module, lesson, and topic text. |
| `conductor/course-objectives.md` | Objective codes and proficiency definitions used by the period plans. |
| `conductor/practice-component-contract.md` | Local `practice.v1` contract that problem families must satisfy when implemented. |
| `conductor/tracks/algebraic-examples_20260406/` | Existing Module 1 component planning for step-by-step algebraic problem types. |
| `conductor/tracks/graphing-components_20260406/` | Existing Module 1 component planning for graphing problem variants. |
| `/home/daniel-bo/Desktop/bus-math-v2/conductor/curriculum/practice-component-contract.md` | Reference-only pattern for treating ALEKS-style items as reusable families rather than one-off components. |

The actionable ALEKS precedent in local files is the family-based modeling approach from `bus-math-v2`, not a requirement to create one component per ALEKS row.

## Working Model

Use `familyKey` values to represent reusable problem types. A family is broader than a single question and narrower than a full lesson. Each family should define:

| Field | Meaning |
|---|---|
| `familyKey` | Stable slug used by curriculum, activities, and generators. |
| `module` | Primary module location. |
| `objective_codes` | Course objective codes supported by the family. |
| `source_examples` | Textbook lesson examples currently anchoring the family. |
| `interaction_shape` | Expected UI shape, such as step-by-step solver, graphing explorer, table, classification, simulation, or written explanation. |
| `modes` | Supported `practice.v1` modes: `worked_example`, `guided_practice`, `independent_practice`, `assessment`. |
| `generator_notes` | Parameterization notes for producing ALEKS-style variants. |

## Current Artifacts

| File | Purpose |
|---|---|
| `problem-type-registry.md` | Course-level registry of reusable ALEKS-style problem families derived from current objectives and worked examples. |
| `course-plan-map.md` | Period-by-period mapping from the audited module plans to problem families. |
| `course-readiness.md` | Exported course-readiness topics from the local ALEKS syllabus file. |
| `module-*-*.md` | Exported visible ALEKS module, lesson, and topic text from `curriculum/ALEKS-practice-problems.htm`. |

## Exported ALEKS Module Topics

Generated from `curriculum/ALEKS-practice-problems.htm` by rendering the ALEKS syllabus export and extracting visible module, lesson, and topic text.

Each listed topic now has a stable ALEKS practice ID:

- `ALEKS M1-L1-1.01`

The ID format is:

- `M#`: ALEKS module export file
- `L#-#`: ALEKS lesson group
- `.##`: topic number within that lesson group

These IDs are referenced from the audited `curriculum/module-*-class-period-plan.md` files. Each listed ALEKS topic should be treated as an SRS-tracked practice item with its own student proficiency state.

## Extraction Coverage Notes

The ALEKS export sometimes declares a higher total topic count than the visible topics extracted into these markdown files. The class-period plans map every listed ALEKS topic. Any declared-but-unlisted topics are documented source limitations in `curriculum/implementation/exceptions.json`; affected class periods use worked-example-derived SRS substitutes until a richer ALEKS export is available.

| Module Export | Declared Topics | Listed Topics | Status |
|---------------|----------------:|--------------:|--------|
| Module 1 | 59 | 59 | Complete |
| Module 2 | 23 | 13 | Documented source limitation |
| Module 3 | 30 | 4 | Documented source limitation |
| Module 4 | 92 | 88 | Documented source limitation |
| Module 5 | 59 | 43 | Documented source limitation |
| Module 6 | 29 | 21 | Documented source limitation |
| Module 7 | 86 | 82 | Documented source limitation |
| Module 8 | 31 | 31 | Complete |
| Module 9 | 45 | 31 | Documented source limitation |

Run `npm run curriculum:audit` to verify that ALEKS mismatches are either complete or explicitly documented.

- [Course Readiness](./course-readiness.md)
- [Module 1: Quadratic Functions](./module-1-quadratic-functions.md)
- [Module 2: Polynomials and Polynomial Functions](./module-2-polynomials-and-polynomial-functions.md)
- [Module 3: Polynomial Equations](./module-3-polynomial-equations.md)
- [Module 4: Inverse and Radical Functions](./module-4-inverse-and-radical-functions.md)
- [Module 5: Exponential Functions](./module-5-exponential-functions.md)
- [Module 6: Logarithmic Functions](./module-6-logarithmic-functions.md)
- [Module 7: Rational Functions](./module-7-rational-functions.md)
- [Module 8: Inferential Statistics](./module-8-inferential-statistics.md)
- [Module 9: Trigonometric Functions](./module-9-trigonometric-functions.md)

## Planning Rules

1. Keep textbook lessons and class periods as the canonical instructional sequence.
2. Add ALEKS problem types as a parallel reusable practice layer.
3. Do not create one component per source example; collapse examples into reusable families.
4. Every implemented family must emit `practice.v1` submissions when used for student work.
5. Mastery, review, test, and jigsaw days should draw from the same family registry as instruction days, with different mode/scaffolding settings.
6. Do not port business-domain families from `bus-math-v2`; use only its reusable-family modeling pattern.
