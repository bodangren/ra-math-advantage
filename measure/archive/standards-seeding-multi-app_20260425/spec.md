# Specification: Standards & Objective Seeding — All Apps

## 2026-05-09 Status: Update Required Before Implementation

Keep existing course/app standard definitions as source evidence. Do not continue this track for final skill-level standard mappings; those now belong to `skill-standards-alignment_20260509`.

## Overview

Seed competency standards, lesson-standards mappings, and objective policies for IM1, IM2, and PreCalculus. Each app needs its own set of standards (Common Core or AP-specific), mapped to lessons with primary/supporting flags, and SRS objective policies.

## Context

IM3 already has 41 standards seeded via `seed_standards.ts` with lesson-standards mappings and objective policies. IM1, IM2, and PreCalc need the same infrastructure with their own course-specific standards.

## Functional Requirements

1. **IM1 Standards**: Define ~40-50 Common Core standards for Integrated Math 1 (expressions, equations, functions, geometry, statistics)
2. **IM2 Standards**: Define ~40-50 Common Core standards for Integrated Math 2 (geometry, trigonometry, probability, functions)
3. **PreCalc Standards**: Define ~30-40 AP Precalculus standards (polynomial, exponential, trigonometric, parametric)
4. **Lesson-Standards Mapping**: For each app, map lesson slugs to standard codes with `isPrimary` flags
5. **Objective Policies**: Define SRS queue priorities (`essential`/`supporting`/`extension`) per standard per app
6. **Seed Files**: Create `seed_standards.ts`, `seed_lesson_standards.ts`, `seed_objective_policies.ts` for each app

## Non-Functional Requirements

- Standards must use official Common Core or AP Precalculus codes and descriptions
- Each lesson must map to at least 1 primary standard
- Objective policies must cover all standards (no orphaned standards)
- Seed files must follow IM3's patterns in `apps/integrated-math-3/convex/seed/`

## Acceptance Criteria

- [ ] IM1: `seed_standards.ts` with ~40-50 standards
- [ ] IM1: `seed_lesson_standards.ts` mapping all ~99 lessons to standards
- [ ] IM1: `seed_objective_policies.ts` covering all standards
- [ ] IM2: `seed_standards.ts` with ~40-50 standards
- [ ] IM2: `seed_lesson_standards.ts` mapping all ~67 lessons to standards
- [ ] IM2: `seed_objective_policies.ts` covering all standards
- [ ] PreCalc: `seed_standards.ts` with ~30-40 standards
- [ ] PreCalc: `seed_lesson_standards.ts` mapping all ~54 lessons to standards
- [ ] PreCalc: `seed_objective_policies.ts` covering all standards
- [ ] All seed files follow IM3 patterns and pass type checking

## Out of Scope

- Lesson content authoring (Tracks 2-4)
- Lesson seeding into Convex (Track 6)
- Problem families (Track 7)
