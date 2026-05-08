# Specification: IM2 + IM1 Curriculum Update

## Overview

Reconcile the newly-updated IM2 and IM1 curriculum files with the existing seed data, Convex schema, and course infrastructure. The incoming files follow the IM3 format with `module-X-lesson-Y` naming (IM2 was renamed from `unit-X`), and contain full lesson content sourced from practice worksheets.

## Context

- **IM2**: 109 entries under `curriculum/modules/` — renamed from `unit-X` to `module-X`, content updated. Old track `curriculum-authoring-im2_20260425` marked complete but now obsolete.
- **IM1**: 93 lesson files added under `curriculum/modules/` — new content sourced from practice worksheets.
- **Format**: Both IM1 and IM2 now follow the IM3 flat-file format with `Source:` line, `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example N`, `## Mixed Exercises`, `## Review Notes`.
- **Goal**: Audit, reconcile seeds, update Convex schema if needed, and validate both curricula.

## Functional Requirements

1. **IM2 Curriculum Audit**
   - Compare new `module-X-*` files against old `unit-X-*` structure
   - Identify new lessons added (e.g., Unit 12 went from 5 → 9 lessons; Unit 9 from 5 → 9 lessons)
   - Verify all lesson files follow IM3 format with `Source:` reference
   - Validate lesson count matches what seed.ts expects

2. **IM1 Curriculum Audit**
   - Verify all 93 lesson files follow IM3 format with `Source:` reference
   - Verify module naming consistency (module-1 through module-14)
   - Confirm no duplicate or missing lesson numbers

3. **Seed Data Reconciliation**
   - Update IM2 seed.ts to reflect renamed `module-X` structure
   - Add IM1 lessons to seed.ts if not already present
   - Verify `lesson_contents` table entries match actual lesson files

4. **Convex Schema Verification**
   - Confirm `lessons` table can accommodate new IM2/IM1 lesson IDs
   - Verify `lesson_standards` links exist for all new IM2/IM1 lessons

5. **Standards & Objectives Sync (IM2)**
   - Audit CCSS standards coverage for new IM2 lessons
   - Update `lesson_standards` seed entries for new lessons

6. **Validation**
   - Run `validate_curriculum.py` if present
   - Run `npx tsc --noEmit` to verify no new type errors
   - Verify all apps build successfully

## Non-Functional Requirements

- Changes must not break existing IM3 curriculum or seeding
- IM1 and IM2 must remain independently runnable
- All source file references in `Source:` lines must point to existing DOCX files in `practice-worksheet-student-bundle/`

## Acceptance Criteria

- [ ] IM2: All `unit-X` files renamed/migrated to `module-X`; old files removed
- [ ] IM2: Lesson count reconciled with seed.ts expectations
- [ ] IM1: All 93 lesson files verified to exist and follow IM3 format
- [ ] IM1: `Source:` lines reference existing DOCX files
- [ ] IM2: `Source:` lines reference existing DOCX files
- [ ] IM1 seed entries added/updated in seed.ts
- [ ] IM2 seed entries updated in seed.ts for renamed modules
- [ ] `lesson_standards` entries exist for new IM2 lessons
- [ ] `npx tsc --noEmit` passes for all apps
- [ ] All apps build successfully
- [ ] IM1 and IM2 demo environments functional

## Out of Scope

- Authoring new lesson content (content already provided in pull)
- Creating practice item blueprints for new lessons
- Modifying activity component keys
- Convex database migration (schema changes only if needed)
