# Integrated Math 1 (Honors) -- Course Specification (2025-2026)

## Course Overview

Integrated Math 1 (IM1) is a rigorous, honors-level secondary mathematics course designed to build students' understanding of algebra, functions, geometry, and statistical reasoning. The course emphasizes conceptual understanding, procedural fluency, and real-world application.

Students engage with linear and nonlinear functions, exponential functions, systems of equations and inequalities, geometry, and statistics. A strong emphasis is placed on mathematical reasoning, justification, and the use of multiple representations (graphical, algebraic, numerical, and verbal).

### Daily Instructional Routine

1. **Warm-Up** -- Skill activation
2. **Concept Development** -- Exploration or mini-lesson
3. **Guided and Independent Practice**
4. **In-Class Assessment** -- Exit ticket or quick check
5. **CAP Reflection** -- Courage, Adaptability, Persistence

### Course Goals

By the end of the course, students will be able to:

- Model real-world situations using linear, exponential, and geometric relationships
- Solve equations and systems of equations using multiple strategies
- Interpret and analyze graphs, functions, and data distributions
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

1. A **class objective** that matches an objective in `measure/course-objectives.md`
2. A reference to the **source textbook lesson** (`curriculum/modules/module-*-lesson-*`)
3. The specific **worked examples** used in that class period

This makes the planning structure deterministic:

- `instruction` days are defined by **objective + worked examples**
- `mastery`, `jigsaw`, `review`, and `test` days are defined primarily by **day type**

### Worked-Example Reference Format

Worked examples should be referenced with enough detail to be unambiguous across planning documents and future sessions.

Preferred format:

- textbook lesson id
- example number or range
- example title when practical

Examples:

- `1-1, Examples 1-3`
- `1-3, Example 2 — Evaluating Expressions`
- `2-4, Examples 1-2 — Solving Linear Equations`

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
- `notes` (optional)

### Implementation Artifact Layer

The implementation bridge for this planning model lives in:

- `curriculum/implementation/class-period-packages/module-*.json`
- `curriculum/implementation/practice-v1/activity-map.json`
- `curriculum/implementation/exceptions.json`
- `curriculum/implementation/audit/latest.json`

Each class-period package uses a stable `periodId` in the format `m##-p##`. Instruction packages include the class objective, source lesson, worked examples, and daily routine fields:

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

Those audited plan documents should be kept aligned with:

- `measure/course-objectives.md`
- `curriculum/modules/module-*-lesson-*`

If a lesson source file is repaired or renumbered, the corresponding audited module plan should be updated so the class-period plan remains the canonical planning layer for implementation work.

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

- `1a. Evaluate expressions`
- `1b. Simplify expressions using properties of operations`

It also contains worked examples, which can be split naturally across two class periods:

- Class Period A: `instruction`, objective `1a`, worked examples `1-1, Examples 1-2`
- Class Period B: `instruction`, objective `1b`, worked examples `1-1, Examples 3-5`

This is the default planning logic for the course: break textbook lessons into class periods according to objective alignment and worked-example grouping.

Pilot planning note: see `curriculum/module-1-class-period-plan.md` for the first full module-level class-period breakdown.

## IM1 Module Overview

IM1 is organized into 14 modules covering expressions, equations, functions, geometry, and statistics:

| Module | Title | Lessons |
|--------|-------|---------|
| 1 | Expressions | 6 |
| 2 | Equations in One Variable | 7 |
| 3 | Relations and Functions | 6 |
| 4 | Linear and Nonlinear Functions | 7 |
| 5 | Creating Linear Equations | 6 |
| 6 | Linear Inequalities | 5 |
| 7 | Systems of Linear Equations and Inequalities | 5 |
| 8 | Exponential Functions | 6 |
| 9 | Statistics | 8 |
| 10 | Tools of Geometry | 7 |
| 11 | Angles and Geometric Figures | 8 |
| 12 | Logical Arguments and Line Relationships | 10 |
| 13 | Transformations and Symmetry | 6 |
| 14 | Triangles and Congruence | 7 |

## Source Materials

- Reveal Integrated Mathematics 1 textbook (Table of Contents overview)
- IM1 Course Syllabus and Structure