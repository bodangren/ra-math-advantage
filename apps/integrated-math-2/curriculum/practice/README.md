# Problem-Family Planning Layer

This folder translates the Integrated Math 2 curriculum definition into reusable problem types sourced from the local ALEKS problem-type PDFs.

The goal is to add a problem-family layer that can drive practice generation, mastery days, jigsaw tasks, reviews, and assessments while staying aligned to the current course objectives and worked examples.

## Source Materials

| Source | Role |
|--------|------|
| `curriculum/course-spec.md` | Defines the class period as the atomic planning object and sets the schema. |
| `curriculum/unit-*-class-period-plan.md` | Canonical period-by-period plans for all 13 units. |
| `curriculum/modules/unit-*-lesson-*` | Lesson source files with worked examples and objective alignment. |
| Problem-type PDFs (18 files) | Local ALEKS-style question banks used to derive problem types. |

## Working Model

Use `familyKey` values to represent reusable problem types. A family is broader than a single question and narrower than a full lesson. Each family defines:

| Field | Meaning |
|-------|---------|
| `familyKey` | Stable slug used by curriculum, activities, and generators. |
| `unit` | Primary unit location. |
| `objective_codes` | Core objective codes supported by the family. |
| `source_examples` | Lesson examples currently anchoring the family. |
| `interaction_shape` | Expected UI shape (step-by-step solver, graphing explorer, drag-drop, etc.) |
| `modes` | Supported `practice.v1` modes: `worked_example`, `guided_practice`, `independent_practice`, `assessment`. |

## Current Artifacts

| File | Purpose |
|------|---------|
| `problem-type-registry.md` | Course-level registry of reusable problem families derived from objectives and worked examples. |
| `course-plan-map.md` | Period-by-period mapping from the audited unit plans to problem families. |

## Planning Rules

1. Keep lessons and class periods as the canonical instructional sequence.
2. Add problem types as a parallel reusable practice layer.
3. Do not create one component per source example; collapse examples into reusable families.
4. Every implemented family must emit `practice.v1` submissions when used for student work.
5. Mastery, review, test, and jigsaw days should draw from the same family registry as instruction days.
6. Source problem families from the local problem-type PDFs where possible.
