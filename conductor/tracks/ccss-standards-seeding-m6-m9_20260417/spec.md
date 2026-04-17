# CCSS Standards Seeding for M6-M9 - Specification

## Context

The `seed-standards.ts` contains 39 CCSS standards. The `seed-lesson-standards.ts` already has `seedModule6LessonStandards` through `seedModule9LessonStandards` mutations defined and wired into `seed.ts`.

## Problem

Current directive says M1-M5 standards are done but M6-M9 are "missing lesson_standards links". However, inspection of `seed-lesson-standards.ts` shows:
- `seedModule6LessonStandards` (lines 785-875) — exists with 5 lesson links
- `seedModule7LessonStandards` (lines 877-967) — exists with 6 lesson links  
- `seedModule8LessonStandards` (lines 1022-1112) — exists with 5 lesson links
- `seedModule9LessonStandards` (lines 1167-1257) — exists with 7 lesson links

All are called in `seed.ts` lines 306-380.

## Actual Gap

The issue may be that the **standards themselves are missing from `seed-standards.ts`**. Need to verify all standards referenced in the M6-M9 lesson_standards links exist in seed-standards.ts. If any are missing, they must be added.

## Approach

1. Identify all unique standard codes used in `module6LessonStandards` through `module9LessonStandards`
2. Check if each exists in `seed-standards.ts`
3. Add any missing standards with proper descriptions
4. Verify the existing mutations are properly wired in `seed.ts`

## Requirements

1. All standards referenced in M6-M9 lesson_standards must exist in `competency_standards`
2. New standards must be added idempotently (check for existence before insert)
3. Standards must have meaningful `studentFriendlyDescription`

## Acceptance Criteria

1. All standard codes used in `module6LessonStandards` through `module9LessonStandards` exist in `seed-standards.ts`
2. `npm run typecheck` passes
3. `npm run lint` passes