# Implementation Plan: IM2 + IM1 Curriculum Update

## Phase 1: IM2 Curriculum Audit

- [ ] Task 1.1: Inventory current IM2 curriculum state
  - [ ] List all `module-X*` files in `apps/integrated-math-2/curriculum/modules/`
  - [ ] List all remaining `unit-X*` files (should be 0 after rename)
  - [ ] Count lesson files per module
  - [ ] Compare against old track's expected counts (Units 1-13, ~67 lessons)

- [ ] Task 1.2: Audit lesson file format
  - [ ] Sample 5 random IM2 lesson files for IM3 format compliance
  - [ ] Verify `Source:` line references existing DOCX in `practice-worksheet-student-bundle/Int2_*`
  - [ ] Verify `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example` sections present
  - [ ] Flag any malformed files

- [ ] Task 1.3: Document new lesson additions
  - [ ] Identify modules with changed lesson counts (e.g., Unit 12: 5 → 9, Unit 9: 5 → 9)
  - [ ] List all new lesson files not in original track plan
  - [ ] Record source DOCX for each new lesson

## Phase 2: IM1 Curriculum Audit

- [ ] Task 2.1: Inventory IM1 curriculum
  - [ ] List all lesson files in `apps/integrated-math-1/curriculum/modules/`
  - [ ] Count lessons per module (modules 1-14)
  - [ ] Verify no duplicate lesson numbers within modules

- [ ] Task 2.2: Audit IM1 lesson file format
  - [ ] Sample 5 random IM1 lesson files for IM3 format compliance
  - [ ] Verify `Source:` line references existing DOCX in `practice-worksheet-student-bundle/Int1_*`
  - [ ] Verify `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example` sections present
  - [ ] Flag any malformed files

- [ ] Task 2.3: Audit source file coverage
  - [ ] List all 87 IM1 DOCX files in `practice-worksheet-student-bundle/`
  - [ ] Cross-reference with lesson `Source:` lines
  - [ ] Report any lessons with missing or incorrect source references

## Phase 3: IM2 Seed Reconciliation

- [ ] Task 3.1: Review IM2 seed.ts
  - [ ] Locate `apps/integrated-math-2/convex/seed/seed.ts` and related seed files
  - [ ] Identify which seed files populate `lessons` table for IM2
  - [ ] Compare expected lesson count vs actual in seed files

- [ ] Task 3.2: Update IM2 lesson seed entries
  - [ ] Update module/lesson references from `unit-X` to `module-X` naming
  - [ ] Add seed entries for new lessons (e.g., Unit 12 lessons 6-9, Unit 9 lessons 6-9)
  - [ ] Remove entries for any deleted lessons

- [ ] Task 3.3: Update IM2 lesson_standards seed
  - [ ] Audit `lesson_standards` coverage for IM2 modules 1-13
  - [ ] Add missing `lesson_standards` entries for new lessons
  - [ ] Verify standards alignment matches lesson goals

## Phase 4: IM1 Seed Integration

- [ ] Task 4.1: Review IM1 seed structure
  - [ ] Locate `apps/integrated-math-1/convex/seed/` directory and files
  - [ ] Identify existing seed infrastructure for IM1

- [ ] Task 4.2: Add IM1 lesson seed entries
  - [ ] Create seed entries for all 93 IM1 lessons if not present
  - [ ] Link lessons to modules/units
  - [ ] Ensure lesson IDs follow IM1 naming convention

- [ ] Task 4.3: Add IM1 lesson_standards entries
  - [ ] Create `lesson_standards` entries for all 93 IM1 lessons
  - [ ] Map CCSS standards to appropriate lessons based on module topic

## Phase 5: Convex Schema Verification

- [ ] Task 5.1: Verify lessons table schema
  - [ ] Check `apps/integrated-math-2/convex/schema.ts` for lessons table definition
  - [ ] Check `apps/integrated-math-1/convex/schema.ts` for lessons table definition
  - [ ] Verify lesson ID format compatible with `module-X-lesson-Y` naming

- [ ] Task 5.2: Run schema validation
  - [ ] Run `npx tsc --noEmit` for IM1 and IM2
  - [ ] Fix any type errors related to curriculum changes

## Phase 6: Build & Validation

- [ ] Task 6.1: Build verification
  - [ ] Run `npm run build` for IM1
  - [ ] Run `npm run build` for IM2
  - [ ] Fix any build errors

- [ ] Task 6.2: Quality gate
  - [ ] Run `npm run lint` for IM1 and IM2
  - [ ] Run `npx tsc --noEmit` for IM1 and IM2
  - [ ] Fix any errors

- [ ] Task 6.3: Convex verification
  - [ ] Verify `npx convex dev` starts without errors for both apps
  - [ ] Confirm seed data can be applied without errors

## Phase 7: Documentation & Handoff

- [ ] Task 7.1: Document changes
  - [ ] Update `measure/tracks.md` with completion status
  - [ ] Archive old IM2 track `curriculum-authoring-im2_20260425`
  - [ ] Note any tech debt or follow-up items discovered

- [ ] Task 7.2: Final verification
  - [ ] Confirm all Phase tasks checked off
  - [ ] Confirm build and typecheck pass
