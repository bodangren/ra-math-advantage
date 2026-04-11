# Integrated Math 3 (Honors) -- Course Specification (2025-2026)

## Course Overview

Integrated Math 3 (IM3) is a rigorous, honors-level secondary mathematics course designed to extend students' understanding of algebra, functions, modeling, and statistical reasoning. The course builds on prior integrated mathematics experiences and emphasizes conceptual understanding, procedural fluency, and real-world application.

Students engage with multiple function families -- including quadratic, polynomial, exponential, logarithmic, rational, and trigonometric functions -- and develop the ability to analyze, model, and interpret complex relationships. A strong emphasis is placed on mathematical reasoning, justification, and the use of multiple representations (graphical, algebraic, numerical, and verbal).

### Daily Instructional Routine

1. **Warm-Up** -- Skill activation
2. **Concept Development** -- Exploration or mini-lesson
3. **Guided and Independent Practice**
4. **In-Class Assessment** -- Exit ticket or quick check
5. **CAP Reflection** -- Courage, Adaptability, Persistence

### Course Goals

By the end of the course, students will be able to:

- Model real-world situations using advanced functions
- Solve complex equations using multiple strategies
- Interpret and analyze graphs and data distributions
- Justify mathematical reasoning using precise language
- Apply mathematics to unfamiliar and non-routine problems

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

Textbook lessons remain the canonical content source, but a single textbook lesson may be split across multiple class periods. In practice, class periods usually target only part of a textbook lesson's goals and typically use about **2-3 worked examples**.

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

1. A **class objective** that matches an objective in `conductor/course-objectives.md`
2. A reference to the **source textbook lesson** (`curriculum/modules/module-*-lesson-*`)
3. The specific **worked examples** used in that class period
4. ALEKS SRS practice references from `curriculum/aleks/` when aligned ALEKS topics are available

This makes the planning structure deterministic:

- `instruction` days are defined by **objective + worked examples**
- `mastery`, `jigsaw`, `review`, and `test` days are defined primarily by **day type**

### ALEKS/SRS Practice Integration

ALEKS topics are treated as additional practice items, not as replacement instruction. Each listed ALEKS topic should become an SRS-tracked practice item with its own proficiency state, just like practice generated from worked examples.

Planning documents should reference ALEKS topics by the stable IDs embedded in `curriculum/aleks/module-*.md`.

Example:

- `ALEKS M1-L1-1.01`

The ID means:

- `M1`: ALEKS module export file
- `L1-1`: source ALEKS lesson group
- `.01`: topic number within that lesson group

Class-period plans may reference ranges when many ALEKS topics support the same instructional objective, such as `ALEKS M1-L1-1.01 through M1-L1-1.06`.

Mastery periods should draw from all due SRS items available to the student, including:

- worked-example-derived practice
- ALEKS topic practice
- prior-unit spiral review

Jigsaw periods should use stretch problems built from prior worked examples. Those stretch problems can also enter the SRS/proficiency system, but they are distinct from the ALEKS topic inventory.

### Worked-Example Reference Format

Worked examples should be referenced with enough detail to be unambiguous across planning documents and future sessions.

Preferred format:

- textbook lesson id
- example number or range
- example title when practical

Examples:

- `1-1, Examples 1-3`
- `1-5, Example 4 — Convert to Vertex Form`
- `1-7, Examples 3-5 — solving quadratic inequalities by graphing`

When a planning document is meant to drive implementation, prefer explicit references over shorthand labels that rely on conversational context alone.

### Lesson Markdown Outline Convention

To keep lesson source files easy to inspect in a document outline or file tree, lesson markdown should use a consistent heading hierarchy:

- `#` lesson title only
- `##` major lesson sections such as `Today's Goals`, `Vocabulary`, `Explore`, `Learn`, `Example`, `Apply Example`, `Talk About It`, `Think About It`, `Objective Alignment`
- `###` substructure inside sections, such as `Key Concept`, `Study Tip`, `Watch Out`, `Part A`, `Step 1`
- `####` only when a substep needs one more level, such as a labeled list of graph features inside an example

Avoid using `#` for example headings or repeated top-level section titles. This keeps lesson files treeable and makes future source audits more reliable.

### Class-Period Planning Schema

Each planned class period should be representable with the following fields:

- `day_type`
- `module`
- `source_textbook_lesson` (required for `instruction`)
- `class_objective_code` (required for `instruction`)
- `class_objective` (required for `instruction`)
- `worked_examples` (required for `instruction`)
- `aleks_problem_types` (required for implementation planning once the period has been mapped)
- `aleks_srs_practice` (required for `instruction` when aligned ALEKS topics are available)
- `notes` (optional)

### ALEKS Problem-Type Integration

The course plan now includes a parallel ALEKS-style problem-type layer in `curriculum/aleks/`.

This layer should be used to translate class-period objectives and worked examples into reusable problem families for guided practice, independent practice, mastery work, jigsaw tasks, review, and assessment.

Key rules:

- The textbook lesson and class-period sequence remain canonical.
- ALEKS problem types are reusable `familyKey` values, not one-off copies of individual worked examples.
- Each `instruction` period should map to one or more `familyKey` values in `curriculum/aleks/course-plan-map.md`.
- Each `familyKey` should stay registered in `curriculum/aleks/problem-type-registry.md`.
- Implemented families must follow the local `practice.v1` contract when they collect student work.
- Business-domain problem families from the `bus-math-v2` template are reference-only and must not be ported into this math course.

For implementation planning, the deterministic mapping is:

- `class objective + worked examples` define the instructional target
- `familyKey` defines the reusable ALEKS-style practice or assessment pattern
- `practice.v1 mode` defines how much scaffolding appears in the student experience

### Implementation Artifact Layer

The implementation bridge for this planning model lives in:

- `curriculum/implementation/class-period-packages/module-*.json`
- `curriculum/implementation/practice-v1/activity-map.json`
- `curriculum/implementation/exceptions.json`
- `curriculum/implementation/audit/latest.json`

Each class-period package uses a stable `periodId` in the format `m##-p##`. Instruction packages include the class objective, source lesson, worked examples, ALEKS SRS references or a worked-example-derived SRS substitute, and daily routine fields:

- `warmUp`
- `conceptDevelopment`
- `guidedPractice`
- `independentPractice`
- `assessment`
- `capReflection`

Non-instruction packages include a `nonInstructionArtifact` object for `mastery`, `jigsaw`, `review`, or `test` periods.

The activity map translates package content into `practice.v1` activity candidates with stable activity IDs, source references, component keys, modes, objective codes, grading configuration, and SRS eligibility.

Run `npm run curriculum:audit` to validate the source curriculum and implementation artifacts together.

### Canonical Planning Documents

For module-level class-period planning, the canonical source of truth should be the audited files:

- `curriculum/module-*-class-period-plan.md`
- `curriculum/aleks/course-plan-map.md`

Those audited plan documents should be kept aligned with:

- `conductor/course-objectives.md`
- `curriculum/modules/module-*-lesson-*`
- `curriculum/aleks/problem-type-registry.md`
- `curriculum/aleks/module-*.md`

If a lesson source file is repaired or renumbered, the corresponding audited module plan should be updated so the class-period plan remains the canonical planning layer for implementation work.

If a problem family is added, renamed, merged, or split, update both `curriculum/aleks/problem-type-registry.md` and `curriculum/aleks/course-plan-map.md` in the same change.

### Year-Level Planning Budget

For a 180-day school year, the current planning target is:

| Day Type | Days | Share |
|----------|------|-------|
| Textbook instruction | 108 | 60% |
| Mastery / 20% time | 36 | 20% |
| Jigsaw / group-work | 18 | 10% |
| Review + test | 18 | 10% |

This budget is a planning framework, not a literal day-by-day calendar.

### Module-Level Review and Test Structure

Reserve approximately **2 days per module** for end-of-module assessment structure:

- `review`
- `test`

If a module needs a separate test-review day, it should come from that module's broader instructional budget rather than increasing the total year budget by default.

### Example of Splitting a Textbook Lesson into Class Periods

Textbook Lesson `1-1` contains two objective clusters:

- `1a. Graph quadratic functions`
- `1b. Find and interpret the average rate of change`

It also contains six worked examples, which can be split naturally across two class periods:

- Class Period A: `instruction`, objective `1a`, worked examples `1-1, Examples 1-3`
- Class Period B: `instruction`, objective `1b`, worked examples `1-1, Examples 4-6`

This is the default planning logic for the course: break textbook lessons into class periods according to objective alignment and worked-example grouping.

Pilot planning note: see `curriculum/module-1-class-period-plan.md` for the first full module-level class-period breakdown.

## Source Materials

- Reveal Integrated Mathematics 3 textbook (Table of Contents overview)
- IM3 Course Syllabus and Structure
