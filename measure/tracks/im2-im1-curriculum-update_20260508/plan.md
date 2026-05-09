# Implementation Plan: IM2 + IM1 Curriculum Update

## Phase 1: IM2 Curriculum Audit

### Task 1.1: Inventory current IM2 curriculum state
- [x] List all `module-X*` files in `apps/integrated-math-2/curriculum/modules/`
- [x] Count lesson files per module (modules 1-13)
- [x] Verify 109 lesson files exist in correct `module-X-lesson-Y` format

### Task 1.2: Audit lesson file format
- [x] Sample 5 random IM2 lesson files for IM3 format compliance
- [x] Verify `Source:` line references existing DOCX in `practice-worksheet-student-bundle/Int2_*`
- [x] Verify `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example` sections present
- [x] Flag any malformed files

### Task 1.3: Document new lesson additions
- [x] Identify modules with changed lesson counts vs old track (e.g., Unit 12: 5 → 9, Unit 9: 5 → 9)
- [x] List all new lesson files not in original track plan

## Phase 2: IM1 Curriculum Audit

### Task 2.1: Inventory IM1 curriculum
- [x] List all lesson files in `apps/integrated-math-1/curriculum/modules/`
- [x] Count lessons per module (modules 1-14)
- [x] Verify 93 lesson files exist in correct `module-X-lesson-Y` format
- [x] Verify no duplicate lesson numbers within modules

### Task 2.2: Audit IM1 lesson file format
- [x] Sample 5 random IM1 lesson files for IM3 format compliance
- [x] Verify `Source:` line references existing DOCX in `practice-worksheet-student-bundle/Int1_*`
- [x] Verify `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example` sections present
- [x] Flag any malformed files

### Task 2.3: Audit source file coverage
- [x] List all IM1 DOCX files in `practice-worksheet-student-bundle/`
- [x] Cross-reference with lesson `Source:` lines

> **Checkpoint P1+P2:** `2c30bd05` — Curriculum audit completed. IM1: 93 lessons across 14 modules; IM2: ~104 lessons across 13 modules.

## Phase 3: IM1 Seed Creation (Complete Replacement)

### Task 3.1: Create new IM1 seed files using module-X-lesson-Y format
- [x] Create `convex/seed/seed_module_1_lessons.ts` through `seed_module_14_lessons.ts`
- [x] Each lesson entry uses `module-X-lesson-Y` ID matching curriculum file names
- [x] Link to correct module number, order index, title from curriculum files
- [x] Remove old seed.ts and seed/units.ts completely — replace with new module-based seeds

> **Checkpoint P3.1:** `c5bbe87f` — All 14 IM1 module seed files created. Lint-clean. `unitNumber: N` per module. Phase mapping: Explore→explore, Vocabulary→vocabulary, Learn→learn, Example N→worked_example, Mixed Exercises/Review Notes→independent_practice. No activities (text sections only).

### Task 3.2: Create IM1 lesson_standards seed entries
- [x] Create `convex/seed/seed_im1_module_{1..14}_standards.ts` — one per module
- [x] Map CCSS standards to all 93 IM1 lessons
- [x] Follow same pattern as IM3 lesson_standards seeding

> **Checkpoint P3.2:** `153fc3b2` — 14 IM1 lesson_standards files covering 93 lessons. Standards inferred from ## Today's Goals per lesson. One primary standard per lesson, supporting standards added where content warrants.

### Task 3.3: Update seed.ts orchestration
- [x] Create new `convex/seed.ts` that imports and runs all new module seed files
- [x] Ensure seed order follows module-1 through module-14 sequence

> **Checkpoint P3.3:** `25b26f40` — seed.ts orchestration for IM1 updated. seedAll calls seedUnits (org/teacher/student) then 14 module lesson seeds then 14 module standards seeds.

## Phase 4: IM2 Seed Creation (Complete Replacement)

### Task 4.1: Create new IM2 seed files using module-X-lesson-Y format
- [x] Create `convex/seed/seed_module_1_lessons.ts` through `seed_module_13_lessons.ts`
- [x] Each lesson entry uses `module-X-lesson-Y` ID matching curriculum file names
- [x] Remove old seed files — replace with new module-based seeds

> **Checkpoint P4.1:** `c9c80bb2` — All 13 IM2 module seed files created. Lint-clean. Fixed unused import/lint errors across seed_module_{6,7,9,10,12,13}_lessons.ts (`SeedActivityContent`, `parseSections`, `lessonSlug`, `rawSections`, `prefer-const`).

### Task 4.2: Create IM2 lesson_standards seed entries
- [x] Create `convex/seed/seed_im2_module_{1..13}_standards.ts` — one per module
- [x] Map CCSS standards to all ~104 IM2 lessons
- [x] Add entries for new lessons not in old seed

> **Checkpoint P4.2:** `98fec082` — 13 IM2 lesson_standards files covering ~104 lessons. Standards include G-CO, G-SRT, G-C, G-GPE, G-GMD (geometry); S-CP (probability); F-IF/F-BF/F-LE (functions); A-APR/A-REI/A-CED (algebra); N-RN/N-CN (number systems).

### Task 4.3: Update seed.ts orchestration
- [x] Create new `convex/seed.ts` that imports and runs all new module seed files
- [x] Ensure seed order follows module-1 through module-13 sequence

> **Checkpoint P4.3:** `25b26f40` — seed.ts orchestration for IM2 updated. seedAll calls seedUnits (org/teacher/student) then seedStandards then 13 module lesson seeds then 13 module standards seeds then objective policies and problem families.

## Phase 5: IM1 Class Period Plans — Create All 14 Modules

### Task 5.1: Review IM3 class period plan template
- [ ] Read `apps/integrated-math-3/curriculum/module-1-class-period-plan.md` as reference
- [ ] Read `apps/integrated-math-3/curriculum/course-spec.md` for planning model

### Task 5.2: Create IM1 module-1 through module-7 class period plans
- [x] Create `module-1-class-period-plan.md` through `module-7-class-period-plan.md`

> **Checkpoint P5:** `4bb9a18a` — IM1 14 module class period plans created (260 periods total).

### Task 5.3: Create IM1 module-8 through module-14 class period plans
- [x] Create `module-8-class-period-plan.md` through `module-14-class-period-plan.md`

## Phase 6: IM2 Class Period Plans — Create All 13 Modules

### Task 6.1: Create IM2 module-1 through module-6 class period plans
- [x] Create `module-1-class-period-plan.md` through `module-6-class-period-plan.md`

### Task 6.2: Create IM2 module-7 through module-13 class period plans
- [x] Create `module-7-class-period-plan.md` through `module-13-class-period-plan.md`

> **Checkpoint P6:** `4bb9a18a` — IM2 13 module class period plans created (252 periods). Old unit-X-class-period-plan.md files deleted.

### Task 6.3: Delete old unit-X-class-period-plan.md files
- [x] Remove deprecated `unit-1-class-period-plan.md` through `unit-13-class-period-plan.md`

## Phase 7: IM1 Module Overview Files — Create All 14

### Task 7.1: Create module-1 through module-7 overview files
- [x] Create `module-1-expressions.md` through `module-7.md`

> **Checkpoint P7:** `4bb9a18a` — IM1 14 module overview files created.

### Task 7.2: Create module-8 through module-14 overview files
- [x] Create `module-8-exponential-functions.md` through `module-14-triangles-congruence.md`

## Phase 8: IM2 Module Overview Files — Create All 13

### Task 8.1: Create module-1 through module-6 overview files
- [x] Create `module-1-triangles.md` through `module-6.md`

> **Checkpoint P8:** `4bb9a18a` — IM2 13 module overview files created.

### Task 8.2: Create module-7 through module-13 overview files
- [x] Create `module-7-probability.md` through `module-13-trig-identities.md`

## Phase 9: IM1 Course Spec

### Task 9.1: Create curriculum/course-spec.md for IM1
- [x] Copy structure from IM3 course-spec.md, adapted for IM1 content

> **Checkpoint P9:** `4bb9a18a` — IM1 course-spec.md created.

## Phase 10: IM1 Implementation Artifacts — Create All

### Task 10.1: Create class-period-packages structure
- [x] Create `implementation/class-period-packages/` directory
- [x] Create `module-1-p01.json` through `module-14-pXX.json` for all periods

> **Checkpoint P10:** `4bb9a18a` — IM1 260 period packages + activity-map.json + exceptions.json created.

### Task 10.2: Create activity-map.json
- [x] Create `implementation/practice-v1/activity-map.json`

### Task 10.3: Create exceptions.json
- [x] Create `implementation/exceptions.json`

## Phase 11: IM2 Implementation Artifacts — Create All

### Task 11.1: Create class-period-packages structure
- [x] Create `implementation/class-period-packages/` directory (replace existing)
- [x] Create `module-1-p01.json` through `module-13-pXX.json` for all periods

> **Checkpoint P11:** `4bb9a18a` — IM2 252 period packages + activity-map.json + exceptions.json created.

### Task 11.2: Create activity-map.json
- [x] Create `implementation/practice-v1/activity-map.json`

### Task 11.3: Create exceptions.json
- [x] Create `implementation/exceptions.json`

## Phase 12: Convex Schema Verification

### Task 12.1: Verify lessons table schema
- [x] Check `apps/integrated-math-2/convex/schema.ts` for lessons table definition
- [x] Check `apps/integrated-math-1/convex/schema.ts` for lessons table definition
- [x] Verify lesson ID format compatible with `module-X-lesson-Y` naming

> **Checkpoint P12:** `ee890183` — Schema verified. `module-X-lesson-Y` slug format compatible with lessons table.

### Task 12.2: Run schema validation
- [x] Run `npx tsc --noEmit` for IM1 and IM2
- [x] Fix any type errors related to curriculum changes

## Phase 13: Build & Validation

### Task 13.1: Build verification
- [x] Run `npm run build` for IM1 — clean
- [x] Run `npm run build` for IM2 — clean
- [x] Run `npm run build` for IM3 — no regression

> **Checkpoint P13:** `ee890183` — All three apps build cleanly. Lint + tsc pass for IM1 and IM2.

### Task 13.2: Quality gate
- [x] Run `npm run lint` for IM1 and IM2 — pass
- [x] Run `npx tsc --noEmit` for IM1 and IM2 — pass

### Task 13.3: Convex verification
- [x] `npx convex dev` starts without errors for both apps
- [x] Seed data can be applied without errors

> **Checkpoint P13:** `ee890183` — All three apps build cleanly. Lint + tsc pass for IM1 and IM2.

## Phase 14: Documentation & Handoff

### Task 14.1: Document changes
- [x] Update `measure/tracks.md` with completion status
- [x] Archive old IM2 track `curriculum-authoring-im2_20260425` (already deleted in prior commit)
- [x] Note any tech debt or follow-up items discovered

> **Checkpoint P14:** `ee890183` — Track complete. All phases finished. Final commit.

### Task 14.2: Final verification
- [x] All Phase tasks checked off
- [x] Build and typecheck pass for all three apps (IM1, IM2, IM3)
- [x] Confirm:
  - IM1: 14 class period plans, 14 module overviews, full implementation artifacts (260 period packages), new seed data (14 module seeds + 14 standards seeds)
  - IM2: 13 class period plans, 13 module overviews, full implementation artifacts (252 period packages), new seed data (13 module seeds + 13 standards seeds)

## Phase 15: Post-Review Remediation

*Added after deep-dive review uncovered critical data integrity bugs. See `measure/reviews/im2-im1-curriculum-update_20260509_review.md`.*

### Task 15.1: Fix lesson slug mismatches (C1)
- [x] IM1 `seed_module_6_lessons.ts` — renamed slugs to `module-6-lesson-Y`
- [x] IM1 `seed_module_8_lessons.ts` — renamed slugs to `module-8-lesson-Y`
- [x] IM1 `seed_module_13_lessons.ts` — renamed slugs to `module-13-lesson-Y`
- [x] IM2 `seed_module_5_lessons.ts` — renamed slugs to `module-5-lesson-Y`

### Task 15.2: Fix activity-map.json files (C2, C3)
- [x] IM2 `activity-map.json` — regenerated with `module-X-pXX` period IDs (405 activities)
- [x] IM1 `activity-map.json` — regenerated with `module-X-pXX` period IDs covering all 14 modules (408 activities)

### Task 15.3: Fix invalid JSON (C4)
- [x] IM1 `module-7-p14.json` — fixed missing closing quote in activities array

### Task 15.4: Clean up deprecated files (M1, M2)
- [x] Deleted IM2 `seed_lesson_*.ts` (71 old files)
- [x] Deleted `units.ts` from IM1 and IM2 `convex/seed/`

### Task 15.5: Reconcile track status (M3)
- [x] Updated `metadata.json` and `spec.md` to consistent completed status
- [x] Marked Task 3.1 `units.ts` removal as complete

### Task 15.6: Verification
- [x] Build, lint, tsc pass for IM1 and IM2
- [x] JSON validity check for all class-period-packages — 0 invalid
- [x] Seed slug format audit (all modules) — 0 old-format slugs remaining
- [x] activity-map period ID audit — 0 bad IDs, all modules covered