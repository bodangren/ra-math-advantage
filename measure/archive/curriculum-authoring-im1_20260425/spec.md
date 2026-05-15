# Specification: Curriculum Content Authoring — Integrated Math 1

## 2026-05-09 Status: Wontimplement

This track is superseded by `skill-rollout-im1_20260509`. Do not implement this stale hand-authored directory/lesson plan. IM1 source catalogs from the reviewed worksheet import should feed the Skill Graph inventory instead.

## Overview

Author the complete curriculum content for Integrated Math 1: 14 modules, ~99 lessons. This is the heaviest content authoring track — IM1 has no existing curriculum content (only a table of contents in `IM1.md`).

## Context

IM1 covers Expressions, Equations, Relations & Functions, Linear/Nonlinear Functions, Creating Linear Equations, Linear Inequalities, Systems, Exponential Functions, Statistics, Tools of Geometry, Angles & Figures, Logical Arguments, Transformations, and Triangles & Congruence. Each lesson needs phase structure, section content, worked examples, and activity configurations.

## Functional Requirements

1. **Create module directories** under `apps/integrated-math-1/curriculum/modules/` for all 14 modules
2. **Create lesson directories** for all ~99 lessons with `lesson.md` files
3. **Author lesson content** following IM3's phase-based structure:
   - Explore, Vocabulary, Learn, Worked Example, Guided Practice, Independent Practice, Discourse, Reflection phases
   - Each phase has sections: text, callout, activity, video, image
4. **Configure activities** using shared activity component keys (step-by-step-solver, comprehension-quiz, fill-in-the-blank, etc.)
5. **Write worked examples** with step-by-step solutions for each lesson
6. **Create module overview files** (`module.md`) for each module
7. **Follow IM3's curriculum authoring patterns** — reference `apps/integrated-math-3/curriculum/` as the template

## Non-Functional Requirements

- Content must be pedagogically sound and aligned to IM1 standards (Common Core for Integrated Math 1)
- Each lesson must have at least 4 phases
- Worked examples must include distractors for step-by-step-solver activities
- Activity configurations must use valid component keys from the shared activity package
- Markdown content must follow IM3's formatting conventions

## Acceptance Criteria

- [ ] 14 module directories exist under `curriculum/modules/`
- [ ] ~99 lesson directories exist with `lesson.md` files
- [ ] Each lesson has a valid phase structure (minimum 4 phases)
- [ ] Each phase has appropriate section types
- [ ] Activities reference valid component keys
- [ ] Worked examples include step-by-step solutions
- [ ] Module overview files exist for all 14 modules
- [ ] Content is pedagogically reviewed (at least one pass)

## Out of Scope

- Seeding content into Convex database (Track 6)
- Standards mapping (Track 5)
- Problem family definitions (Track 7)
- Activity component implementation (Track 1)
