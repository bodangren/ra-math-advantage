# Specification: Lesson Seeding — All Apps

## 2026-05-09 Status: Wontimplement For Remaining Scope

Completed seed work remains historical evidence. Do not implement remaining/new lesson or activity seed work from this track; future seed-ready payloads must be generated from `skill-runtime-projection_20260509` and the course rollout tracks.

## Overview

Seed all curriculum lessons into the Convex database for IM1, IM2, and PreCalculus. Each lesson needs to be inserted as a lesson version with phases, sections, and activity references.

## Context

IM3 has 46 lesson seed files (`seed_lesson_*.ts`) that insert lesson content into Convex. IM1, IM2, and PreCalc need the same seeding infrastructure with their own course-specific lesson content from Tracks 2-4.

## Functional Requirements

1. **IM1 Lesson Seeds**: Create seed files for all ~99 lessons across 14 modules
2. **IM2 Lesson Seeds**: Create seed files for all ~67 lessons across 13 units
3. **PreCalc Lesson Seeds**: Create seed files for all ~54 lessons across 4 units
4. **Seed Types**: Reuse shared seed types from `packages/` or IM3's `convex/seed/types.ts`
5. **Lesson Version Status**: All seeded lessons start as `published` status
6. **Phase Structure**: Each lesson seed includes full phase sequence with section content
7. **Activity References**: Each activity section references a valid `componentKey` and includes props data
8. **Seed Orchestration**: Update each app's `seed.ts` to call all lesson seed functions

## Non-Functional Requirements

- Seed files must follow IM3's `seed_lesson_*.ts` patterns exactly
- Each seed file must be independently callable (no cross-lesson dependencies)
- Lesson slugs must be unique within each app
- Activity props must match the Zod schemas from the shared activity package
- Seed files must pass TypeScript type checking

## Acceptance Criteria

- [ ] IM1: ~99 seed files exist in `convex/seed/` (one per lesson)
- [ ] IM1: `seed.ts` orchestrates all lesson seeds
- [ ] IM2: ~67 seed files exist in `convex/seed/`
- [ ] IM2: `seed.ts` orchestrates all lesson seeds
- [ ] PreCalc: ~54 seed files exist in `convex/seed/`
- [ ] PreCalc: `seed.ts` orchestrates all lesson seeds
- [ ] All seed files pass `npx tsc --noEmit`
- [ ] All seed files follow IM3 patterns

## Out of Scope

- Curriculum content authoring (Tracks 2-4)
- Standards seeding (Track 5)
- Problem families (Track 7)
- Running the seeds against a live Convex deployment
