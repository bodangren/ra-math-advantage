# Specification: Curriculum Content Authoring — AP Precalculus

## Overview

Author the complete curriculum content for AP Precalculus from the canonical curriculum-definition layer: 4 units and 58 CED topics. PreCalc now has CED/Passwater source artifacts, unit/topic source files, and class-period planning artifacts produced by `precalc-curriculum-definition_20260501`.

## Context

PreCalc covers Polynomial & Rational Functions, Exponential & Logarithmic Functions, Trigonometric & Polar Functions, and Functions with Parameters/Vectors/Matrices. Each lesson needs phase structure, section content, worked examples, and activity configurations.

The source hierarchy for authoring is:

1. College Board CED topic identity, competencies, mathematical practices, and FRQ expectations.
2. College Board CED clarification/guidance errata.
3. Local Passwater PDFs and normalized source summaries for instruction, scaffolding, guided practice, independent practice shape, pacing, and local assessment evidence.
4. Local overview/product/runtime labels after reconciliation.

Unit 4 is CED-defined and may be represented in planning files, but it has no local Passwater PDF and is not assessed on the AP Exam. Do not invent Passwater-derived lesson scaffolding for Unit 4 unless a local source is added or the user explicitly approves a separate local-authoring approach.

## Functional Requirements

1. **Create module directories** under `apps/pre-calculus/curriculum/modules/` for all 4 units
2. **Create lesson directories** for 58 CED topics with `lesson.md` files, using the existing topic source files as canonical planning inputs
3. **Author lesson content** following IM3's phase-based structure:
   - Explore, Vocabulary, Learn, Worked Example, Guided Practice, Independent Practice, Discourse, Reflection phases
   - Each phase has sections: text, callout, activity, video, image
4. **Configure activities** using shared activity component keys
5. **Write worked examples** with step-by-step solutions for each lesson
6. **Create module overview files** (`module.md`) for each unit
7. **Reference IM3's curriculum** as the template for structure and formatting
8. **Reference AP Precalculus planning artifacts** from `apps/pre-calculus/curriculum/source/`, `units/`, `topics/`, `unit-*-class-period-plan.md`, `implementation/`, and `practice/`

## Non-Functional Requirements

- Content must be pedagogically sound and aligned to AP Precalculus standards
- CED/clarification sources define competencies and FRQ expectations
- Passwater sources define instructional scaffolding and practice shape for Units 1-3
- Each lesson must have at least 4 phases
- Worked examples must include distractors for step-by-step-solver activities
- Activity configurations must use valid component keys from the shared activity package
- Markdown content must follow IM3's formatting conventions

## Acceptance Criteria

- [ ] 4 module directories exist under `curriculum/modules/`
- [ ] 58 CED-topic lesson directories exist with `lesson.md` files, or documented exceptions explain any intentionally deferred Unit 4 lessons
- [ ] Each lesson has a valid phase structure (minimum 4 phases)
- [ ] Each phase has appropriate section types
- [ ] Activities reference valid component keys
- [ ] Worked examples include step-by-step solutions
- [ ] Module overview files exist for all 4 units
- [ ] Content is pedagogically reviewed

## Out of Scope

- Seeding content into Convex database (Track 6)
- Standards mapping (Track 5)
- Problem family definitions (Track 7)
- Activity component implementation (Track 1)
