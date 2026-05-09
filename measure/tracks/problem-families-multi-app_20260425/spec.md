# Specification: Problem Families & Practice Items — All Apps

## 2026-05-09 Status: Wontimplement For Remaining Scope

Existing problem-family files are evidence only. Do not continue app-local problem-family or practice-item blueprint work as source truth; skill graph nodes and algorithmic skill blueprints supersede it.

## Overview

Define problem families and practice item blueprints for IM1, IM2, and PreCalculus. Problem families group related practice problems by objective and difficulty, linking to activity components for rendering.

## Context

IM3 has 9 problem family files (`problem_families/module_*.ts`) covering all 9 modules. Each file defines problem family IDs, display names, descriptions, objective mappings, difficulty levels, and component keys. IM1, IM2, and PreCalc need the same infrastructure.

## Functional Requirements

1. **IM1 Problem Families**: Create problem family definitions for all 14 modules
2. **IM2 Problem Families**: Create problem family definitions for all 13 units
3. **PreCalc Problem Families**: Create problem family definitions for all 4 units
4. **Practice Item Blueprints**: Define `practice_item` records linking problem families to activities
5. **Objective Mapping**: Each problem family maps to one or more competency standards from Track 5
6. **Component Keys**: Each problem family specifies which activity component renders it
7. **Difficulty Levels**: Each problem family has a difficulty rating (easy/medium/hard)

## Non-Functional Requirements

- Problem family IDs must be unique within each app
- Each problem family must map to at least one valid standard from Track 5
- Component keys must reference valid shared activity components from Track 1
- Practice item blueprints must follow IM3's `seed_practice_items.ts` patterns

## Acceptance Criteria

- [ ] IM1: 14 problem family files in `convex/seed/problem_families/`
- [ ] IM1: Practice item blueprints linking families to activities
- [ ] IM2: 13 problem family files in `convex/seed/problem_families/`
- [ ] IM2: Practice item blueprints linking families to activities
- [ ] PreCalc: 4 problem family files in `convex/seed/problem_families/`
- [ ] PreCalc: Practice item blueprints linking families to activities
- [ ] All problem families map to valid standards
- [ ] All component keys are valid shared activity components
- [ ] All files pass TypeScript type checking

## Out of Scope

- Curriculum content authoring (Tracks 2-4)
- Standards seeding (Track 5)
- Lesson seeding (Track 6)
- Running seeds against live Convex
