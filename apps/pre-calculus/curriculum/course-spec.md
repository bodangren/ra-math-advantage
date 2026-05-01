# AP Precalculus Course Specification

This document defines the canonical AP Precalculus curriculum contract for the application.

## Source Model

CED defines competency evidence; Passwater defines instruction.

The College Board AP Precalculus Course and Exam Description is the official source for AP units, topics, learning objectives, essential knowledge, mathematical practices, calculator expectations, exam weighting, and FRQ task models.

- College Board AP Precalculus Course and Exam Description: https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf
- College Board AP Precalculus CED Clarification and Guidance: https://apcentral.collegeboard.org/media/pdf/ap-precalculus-ced-clarification-and-guidance.pdf
- AP Central course page: https://apcentral.collegeboard.org/courses/ap-precalculus

The CED clarification and guidance document is treated as errata. If the clarification narrows, corrects, or reinterprets the base CED, the clarification wins for app planning.

The local Passwater PDFs are the instructional source of record for Units 1-3:

- `APPC  Unit 1 Passwater.pdf`
- `APPC  Unit 2 Passwater.pdf`
- `APPC  Unit 3 Passwater.pdf`

These PDFs should drive topic introduction, scaffolding, guided practice, independent practice, quiz/test references, and pacing. They do not override AP competency or exam requirements.

## Source Precedence by Purpose

| Planning question | Primary source | Secondary source |
|-------------------|----------------|------------------|
| What should count as competency? | CED learning objectives and essential knowledge | CED clarification/guidance |
| What mathematical practices should evidence target? | CED mathematical practices and skills | CED FRQ task models |
| What should AP-style independent practice look like? | Passwater worksheets and assessments | CED topic and FRQ expectations |
| How should a topic be introduced and scaffolded? | Passwater notes and examples | CED topic intent |
| What should be seeded as standards/objectives? | CED topics, learning objectives, essential knowledge, and skills | Local topic titles after reconciliation |
| What should become a class-period package? | Passwater pacing and instructional sequence | CED topic and competency references |
| What app labels should students and teachers see? | Reconciled CED and Passwater topic names | `overview.md`, `product.md`, and runtime pages |

## Course Structure

| Unit | Title | CED topics | AP Exam status | Multiple-choice exam weighting |
|------|-------|-----------:|----------------|-------------------------------|
| 1 | Polynomial and Rational Functions | 14 | Assessed | 30-40% |
| 2 | Exponential and Logarithmic Functions | 15 | Assessed | 27-40% |
| 3 | Trigonometric and Polar Functions | 15 | Assessed | 30-35% |
| 4 | Functions Involving Parameters, Vectors, and Matrices | 14 | Not assessed on the AP Exam | Not assessed |

The local product and overview documents currently describe `~54 lessons`, but the listed AP topic sequence contains 58 topics. Until this is reconciled, implementation should treat 58 CED topics as the canonical topic count and document the mismatch in `implementation/exceptions.json`.

## Unit and Topic Map

### Unit 1: Polynomial and Rational Functions

1.1 Change in Tandem
1.2 Rates of Change
1.3 Rates of Change in Linear and Quadratic Functions
1.4 Polynomial Functions and Rates of Change
1.5 Polynomial Functions and Complex Zeros
1.6 Polynomial Functions and End Behavior
1.7 Rational Functions and End Behavior
1.8 Rational Functions and Zeros
1.9 Rational Functions and Vertical Asymptotes
1.10 Rational Functions and Holes
1.11 Equivalent Representations of Polynomial and Rational Expressions
1.12 Transformations of Functions
1.13 Function Model Selection and Assumption Articulation
1.14 Function Model Construction and Application

### Unit 2: Exponential and Logarithmic Functions

2.1 Change in Arithmetic and Geometric Sequences
2.2 Change in Linear and Exponential Functions
2.3 Exponential Functions
2.4 Exponential Function Manipulation
2.5 Exponential Function Context and Data Modeling
2.6 Competing Function Model Validation
2.7 Function Composition
2.8 Inverse Functions
2.9 Logarithmic Expressions
2.10 Inverses of Exponential Functions
2.11 Logarithmic Functions
2.12 Logarithmic Function Manipulation
2.13 Exponential and Logarithmic Equations and Inequalities
2.14 Logarithmic Function Context and Data Modeling
2.15 Semi-log Plots

### Unit 3: Trigonometric and Polar Functions

3.1 Periodic Phenomena
3.2 Sine, Cosine, and Tangent
3.3 Sine and Cosine Function Values
3.4 Sine and Cosine Function Graphs
3.5 Sinusoidal Functions
3.6 Sinusoidal Function Transformations
3.7 Sinusoidal Function Context and Data Modeling
3.8 The Tangent Function
3.9 Inverse Trigonometric Functions
3.10 Trigonometric Equations and Inequalities
3.11 The Secant, Cosecant, and Cotangent Functions
3.12 Equivalent Representations of Trigonometric Functions
3.13 Trigonometry and Polar Coordinates
3.14 Polar Function Graphs
3.15 Rates of Change in Polar Functions

### Unit 4: Functions Involving Parameters, Vectors, and Matrices

4.1 Parametric Functions
4.2 Parametric Functions Modeling Planar Motion
4.3 Parametric Functions and Rates of Change
4.4 Parametrically Defined Circles and Lines
4.5 Implicitly Defined Functions
4.6 Conic Sections
4.7 Parametrization of Implicitly Defined Functions
4.8 Vectors
4.9 Vector-Valued Functions
4.10 Matrices
4.11 The Inverse and Determinant of a Matrix
4.12 Linear Transformations and Matrices
4.13 Matrices as Functions
4.14 Matrices Modeling Contexts

Unit 4 is CED-defined and may be taught for state or local requirements, but it is not assessed on the AP Exam. This repository does not currently include a local Unit 4 Passwater PDF, so Unit 4 implementation must stay explicitly marked as locally unsourced until that evidence is provided.

## Competency Model

Competency evidence should be keyed to CED topic IDs, learning objectives, essential knowledge statements, and mathematical-practice skills.

The AP Precalculus mathematical practices are:

1. Procedural and Symbolic Fluency
2. Multiple Representations
3. Communication and Reasoning

For competency-based tracking, each durable standard should include:

- CED unit and topic ID
- CED topic title
- learning objective code or family
- essential knowledge reference
- mathematical practice and skill reference
- AP exam status
- supported Passwater source references when available
- acceptable evidence types: guided practice, independent practice, assessment, FRQ-style response, explanation, or correction/reflection

## FRQ Expectations

FRQ expectations should influence independent practice, discourse prompts, assessments, and competency evidence.

| FRQ | Task model | Unit focus | Calculator | Context |
|-----|------------|------------|------------|---------|
| FRQ 1: Function Concepts | Interpret and connect graphical, numerical, and analytical function information | Units 1-2 | Graphing calculator | No required real-world context |
| FRQ 2: Modeling a Non-Periodic Context | Build, apply, and justify polynomial, piecewise, exponential, or logarithmic models | Units 1-2 | Graphing calculator | Real-world context |
| FRQ 3: Modeling a Periodic Context | Build and reason with sinusoidal models | Unit 3 | No calculator | Real-world context |
| FRQ 4: Symbolic Manipulations | Solve and rewrite exponential, logarithmic, trigonometric, or inverse-trigonometric expressions | Units 2-3 | No calculator | No required real-world context |

Every unit package should include some practice that asks students to communicate with precise language, justify assumptions or limitations, and translate between representations. Units 1-2 should prioritize non-periodic modeling and function-concept FRQ patterns. Unit 3 should prioritize periodic modeling and symbolic trigonometric reasoning.

## Instructional Model

The app should treat the class period as the atomic instructional object. A CED topic may span more than one class period, and one class period may use a subset of a Passwater notes section or worksheet.

Passwater instruction should be translated into phase packages using this routine:

1. Warm-Up: prerequisite retrieval or representation reading.
2. Topic Introduction: Passwater notes introduction, vocabulary, and initial concept framing.
3. Scaffolded Examples: teacher-modeled or partially completed examples from the notes.
4. Guided Practice: examples or worksheet items where students complete steps with feedback.
5. Independent AP-Style Practice: worksheet or assessment tasks aligned to the CED topic and AP mathematical practices.
6. Exit Evidence: short assessment, explanation, error analysis, or FRQ-style part.
7. CAP Reflection: short reflection on courage, adaptability, or persistence.

## Canonical Day Types

Each class period should be labeled as one of:

- `instruction`
- `practice`
- `ap_task_model`
- `review`
- `quiz`
- `test`

Instruction days must include:

- CED unit/topic reference
- learning objective and essential knowledge reference when available
- Passwater notes/example reference when available
- guided-practice source reference
- independent-practice source reference
- competency evidence target

Non-instruction days should still identify their CED topic scope, evidence target, and source basis.

## Implementation Artifact Expectations

Future phases should create these artifacts:

- `source/college-board/ced.md`
- `source/college-board/clarification-guidance.md`
- `source/passwater/unit-1.md`
- `source/passwater/unit-2.md`
- `source/passwater/unit-3.md`
- `units/unit-*.md`
- `topics/unit-*-topic-*.md`
- `unit-*-class-period-plan.md`
- `implementation/class-period-packages/unit-*.json`
- `implementation/practice-v1/activity-map.json`
- `implementation/audit/latest.json`
- `practice/problem-family-registry.md`
- `practice/course-plan-map.md`

The implementation bridge should preserve source provenance instead of flattening all curriculum evidence into generic lesson text.

## Convex Seeding Handoff

This track should not implement full Convex seeding. The later seed track should consume these curriculum artifacts:

- CED topic IDs and titles become stable curriculum identifiers.
- Learning objectives and essential knowledge become competency-standard inputs.
- Passwater instructional references become lesson-phase and activity source references.
- Class-period packages become the seedable phase-package layer.
- Practice map entries become `practice.v1` activity candidates and SRS-eligible problem families.

If Convex files are touched in a later phase, first read the generated Convex AI guidelines if present, or document the missing-guidelines blocker before editing backend code.
