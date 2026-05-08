# Integrated Math 2 — Course Specification (2025-2026)

## Course Overview

Integrated Math 2 (IM2) is a secondary mathematics course that develops geometric reasoning, algebraic modeling, and quantitative literacy. The course builds on Integrated Math 1 foundations and extends students' understanding of geometric proof, function families, polynomial operations, and trigonometric relationships.

Students engage with geometric reasoning (triangles, quadrilaterals, similarity, right triangles, circles), measurement, probability, function concepts, linear and quadratic algebra, polynomial operations, exponents and radicals, and trigonometric identities. Emphasis is placed on connecting algebraic procedures with geometric meaning, using multiple representations, and applying mathematics to real-world contexts.

### Daily Instructional Routine

1. **Warm-Up** — Skill activation and prior-knowledge retrieval
2. **Concept Development** — Exploration or mini-lesson with worked examples
3. **Guided Practice** — Scaffolded problems with teacher check-in
4. **Independent Practice** — Reduced scaffolding, fresh problems or SRS practice
5. **Assessment** — Exit ticket or quick check
6. **CAP Reflection** — Courage, Adaptability, Persistence

### Course Goals

By the end of the course, students will be able to:

- Develop geometric reasoning through proofs and constructions
- Build algebraic fluency with equations, functions, and polynomials
- Use multiple representations (graphs, tables, equations, words)
- Communicate reasoning using mathematical language
- Apply mathematics to real-world modeling contexts
- Develop statistical and probabilistic thinking

### Assessment Philosophy

- All graded work is completed in class
- Homework supports learning but is assessed via in-class checks
- Retakes allowed (max score 85%)
- Emphasis on mastery, persistence, and growth

## CAP Integration (Courage, Adaptability, Persistence)

- **Courage**: Attempt challenging problems and share thinking
- **Adaptability**: Revise strategies when solutions fail
- **Persistence**: Continue working through complex, multi-step problems

Students regularly reflect on these habits to build independence and resilience.

## Instructional Priorities

- Emphasize conceptual understanding before procedural fluency
- Use real-world modeling tasks whenever possible
- Promote mathematical discourse and justification
- Support multilingual learners with visual and contextual scaffolds
- Provide extension tasks for high-achieving students

## Planning Model for the App

The app should treat the **class period** as the atomic instructional object, not the textbook lesson.

Textbook lessons remain the canonical content source, but a single textbook lesson may be split across multiple class periods. In practice, class periods typically target only part of a textbook lesson's goals and use about **2-3 worked examples**.

### Why the Atomic Unit Is the Class Period

- Textbook lessons often contain more worked examples than can fit naturally in one class.
- The live course includes recurring non-textbook instructional structures such as mastery days, jigsaw/group-work days, review days, and tests.
- Course pacing is driven by instructional days, not by a one-to-one textbook lesson schedule.

### Canonical Day Types

Each class period should be labeled as one of:

- `instruction`
- `mastery`
- `jigsaw`
- `review`
- `test`

### Instructional Day Requirements

If a class period is labeled `instruction`, it must include:

1. A **class objective** that matches an objective in the unit's core objectives
2. A reference to the **source lesson** (`curriculum/modules/module-*-lesson-*`)
3. The specific **worked examples** used in that class period
4. Problem-type familyKey references from `curriculum/practice/` when aligned problem families are available

This makes the planning structure deterministic:

- `instruction` days are defined by **objective + worked examples**
- `mastery`, `jigsaw`, `review`, and `test` days are defined primarily by **day type**

### Problem-Type Integration

Problem types from the local ALEKS-style PDFs are treated as additional practice items, not as replacement instruction. Each problem type should be tracked with a stable `familyKey` value.

Planning documents should reference problem families by the stable IDs defined in `curriculum/practice/problem-family-registry.md`.

Example:

- `familyKey: triangle_congruence_proofs`

Each `familyKey` should define:

| Field | Meaning |
|-------|---------|
| `familyKey` | Stable slug used by curriculum, activities, and generators. |
| `unit` | Primary unit location. |
| `objective_codes` | Core objective codes supported by the family. |
| `source_examples` | Lesson examples currently anchoring the family. |
| `interaction_shape` | Expected UI shape (step-by-step solver, graphing explorer, drag-drop, etc.) |
| `modes` | Supported `practice.v1` modes: `worked_example`, `guided_practice`, `independent_practice`, `assessment`. |

Mastery periods should draw from all available SRS items, including:

- worked-example-derived practice
- problem-type practice
- prior-unit spiral review

Jigsaw periods should use stretch problems built from prior worked examples.

### Worked-Example Reference Format

Worked examples should be referenced with enough detail to be unambiguous across planning documents and future sessions.

Preferred format:

- unit-lesson id
- example number or range
- example title when practical

Examples:

- `1-1, Examples 1-3`
- `4-3, Example 2 — Solve Using Sine Ratio`
- `11-4, Examples 3-5 — multiplying binomials and trinomials`

### Lesson Markdown Outline Convention

To keep lesson source files easy to inspect in a document outline or file tree, lesson markdown should use a consistent heading hierarchy:

- `#` lesson title only
- `##` major lesson sections such as `Today's Goals`, `Vocabulary`, `Example`, `Learn`, `Apply`, `Think About It`, `Objective Alignment`
- `###` substructure inside sections, such as `Key Concept`, `Study Tip`, `Watch Out`, `Part A`, `Step 1`
- `####` only when a substep needs one more level

Avoid using `#` for example headings or repeated top-level section titles.

### Class-Period Planning Schema

Each planned class period should be representable with the following fields:

- `day_type`
- `unit`
- `source_lesson` (required for `instruction`)
- `class_objective_code` (required for `instruction`)
- `class_objective` (required for `instruction`)
- `worked_examples` (required for `instruction`)
- `problem_types` (familyKey references from problem-type PDFs)
- `notes` (optional)

### Implementation Artifact Layer

The implementation bridge for this planning model lives in:

- `curriculum/implementation/class-period-packages/unit-*.json`
- `curriculum/implementation/practice-v1/activity-map.json`
- `curriculum/implementation/exceptions.json`
- `curriculum/implementation/audit/latest.json`

Each class-period package uses a stable `periodId` in the format `u##-p##`. Instruction packages include the class objective, source lesson, worked examples, problem-type references or worked-example-derived SRS substitutes, and daily routine fields:

- `warmUp`
- `conceptDevelopment`
- `guidedPractice`
- `independentPractice`
- `assessment`
- `capReflection`

Non-instruction packages include a `nonInstructionArtifact` object for `mastery`, `jigsaw`, `review`, or `test` periods.

The activity map translates package content into `practice.v1` activity candidates with stable activity IDs, source references, component keys, modes, objective codes, grading configuration, and SRS eligibility.

### Canonical Planning Documents

For unit-level class-period planning, the canonical source of truth should be the audited files:

- `curriculum/unit-*-class-period-plan.md`
- `curriculum/practice/course-plan-map.md`

Those audited plan documents should be kept aligned with:

- `curriculum/overview.md`
- `curriculum/modules/module-*-lesson-*`
- `curriculum/practice/problem-type-registry.md`

### Year-Level Planning Budget

For a 180-day school year, the current planning target is:

| Day Type | Days | Share |
|----------|------|-------|
| Textbook instruction | 108 | 60% |
| Mastery / 20% time | 36 | 20% |
| Jigsaw / group-work | 18 | 10% |
| Review + test | 18 | 10% |

This budget is a planning framework, not a literal day-by-day calendar.

### Unit-Level Review and Test Structure

Reserve approximately **2 days per unit** for end-of-unit assessment:

- `review`
- `test`

If a unit needs a separate test-review day, it should come from that unit's broader instructional budget rather than increasing the total year budget by default.

### Example of Splitting a Textbook Lesson into Class Periods

Textbook Lesson `3-1` (Similar Figures and Scale Factors) contains two objective clusters:

- `3a. Identify similar figures and calculate scale factors`
- `3b. Apply similarity to find missing measurements`

It also contains several worked examples, which can be split naturally across two class periods:

- Class Period A: `instruction`, objective `3a`, worked examples `3-1, Examples 1-3`
- Class Period B: `instruction`, objective `3b`, worked examples `3-1, Examples 4-5`

## Source Materials

- Integrated Math 2 overview (`curriculum/overview.md`) with 13 units and 67 lessons
- 18 local ALEKS problem-type PDFs covering all 13 modules
