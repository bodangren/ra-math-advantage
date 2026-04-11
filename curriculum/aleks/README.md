# ALEKS Problem-Type Planning Layer

This folder translates the existing Integrated Math 3 curriculum definition into ALEKS-style reusable problem types.

The goal is not to replace the textbook/class-period plan. The goal is to add a problem-family layer that can drive practice generation, mastery days, jigsaw tasks, reviews, and assessments while staying aligned to the current course objectives and worked examples.

## Local Source Audit

Current local sources used for this planning layer:

| Source | Role |
|---|---|
| `curriculum/course-spec.md` | Defines the class period as the atomic planning object and sets the schema for course planning. |
| `curriculum/module-*-class-period-plan.md` | Canonical period-by-period plans for all 9 modules. |
| `curriculum/modules/module-*-lesson-*` | Lesson source files with worked examples and objective alignment. |
| `conductor/course-objectives.md` | Objective codes and proficiency definitions used by the period plans. |
| `conductor/practice-component-contract.md` | Local `practice.v1` contract that problem families must satisfy when implemented. |
| `conductor/tracks/algebraic-examples_20260406/` | Existing Module 1 component planning for step-by-step algebraic problem types. |
| `conductor/tracks/graphing-components_20260406/` | Existing Module 1 component planning for graphing problem variants. |
| `/home/daniel-bo/Desktop/bus-math-v2/conductor/curriculum/practice-component-contract.md` | Reference-only pattern for treating ALEKS-style items as reusable families rather than one-off components. |

No local file or directory named `curriculum/aleks` existed in this checkout before this folder was created. No Desktop-wide local file with `aleks` in its path was found during the audit. The actionable ALEKS precedent in local files is the family-based modeling approach from `bus-math-v2`, not a ready-made IM3 ALEKS topic list.

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

## Planning Rules

1. Keep textbook lessons and class periods as the canonical instructional sequence.
2. Add ALEKS problem types as a parallel reusable practice layer.
3. Do not create one component per source example; collapse examples into reusable families.
4. Every implemented family must emit `practice.v1` submissions when used for student work.
5. Mastery, review, test, and jigsaw days should draw from the same family registry as instruction days, with different mode/scaffolding settings.
6. Do not port business-domain families from `bus-math-v2`; use only its reusable-family modeling pattern.
