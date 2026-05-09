# Specification: IM2 + IM1 Curriculum Update

## 2026-05-09 Status: COMPLETED (with Phase 15 remediation)

Phase 15 was added after deep-dive review to fix critical data integrity bugs (slug mismatches, orphaned activity maps, invalid JSON, and cleanup debt). See `measure/reviews/im2-im1-curriculum-update_20260509_review.md` for the original review findings.

Activity maps and lesson-level standards in this track are curriculum scaffolding only, not canonical skill truth. Skill-level standards, SRS inputs, and practice blueprints remain the responsibility of the Skill Graph Program.

## Overview

**Complete replacement** of IM2 and IM1 curriculum infrastructure to bring both courses to full parity with IM3. All existing seed data, class period plans, module overviews, and implementation artifacts are deprecated and replaced.

The incoming curriculum files follow the IM3 format with `module-X-lesson-Y` naming, and contain full lesson content sourced from practice worksheets.

## Context

- **IM2**: 96 lesson files under `curriculum/modules/` in `module-X-lesson-Y` format. Old seed data (using `unit-X` naming), old class period plans (using `unit-X-class-period-plan.md`), old module overviews, and old implementation artifacts are all **deprecated — to be replaced**.
- **IM1**: 93 lesson files under `curriculum/modules/` in `module-X-lesson-Y` format. No seed data (needs to be created), no class period plans (needs 14 created), no module overviews (needs 14 created), no implementation artifacts (needs full structure created).
- **Format**: All lesson files follow IM3 flat-file format with `Source:` line, `## Today's Goals`, `## Vocabulary`, `## Explore`, `## Learn`, `## Example N`, `## Mixed Exercises`, `## Review Notes`.
- **Goal**: Bring IM1 and IM2 to full parity with IM3's curriculum structure.

## IM3 Parity Target Structure

```
curriculum/
├── course-spec.md                    # Course-level planning model (IM1 only — IM2 already has this)
├── module-X-class-period-plan.md      # Period-by-period breakdown (13 for IM2, 14 for IM1)
├── module-X-<topic>.md               # Module overview (13 for IM2, 14 for IM1)
├── modules/
│   └── module-X-lesson-Y             # Individual lesson files (already exist — verify only)
├── implementation/
│   ├── class-period-packages/         # JSON packages per period
│   ├── practice-v1/
│   │   └── activity-map.json          # Activity mapping
│   └── exceptions.json                # Edge cases
└── source-materials/                  # DOCX source files (verify references only)
```

## Functional Requirements

### 1. Seed Data — Complete Replacement (Both IM1 and IM2)

**IM1**: Currently has NO proper seed data in `module-X-lesson-Y` format. Create from scratch:
- Create `convex/seed/seed_module_1_lessons.ts` through `seed_module_14_lessons.ts`
- Create `convex/seed/seed_im1_lesson_standards.ts`
- Create new `convex/seed.ts` orchestration

**IM2**: Currently has deprecated seed data using `unit-X` naming. Complete replacement:
- Delete old seed files using `unit-X` format
- Create new `convex/seed/seed_module_1_lessons.ts` through `seed_module_13_lessons.ts`
- Create `convex/seed/seed_im2_lesson_standards.ts`
- Create new `convex/seed.ts` orchestration

### 2. Class Period Plans — Complete Replacement (Both IM1 and IM2)

**IM2**: Has old `unit-X-class-period-plan.md` files — delete all 13 and create new `module-X-class-period-plan.md` files:
- Create `module-1-class-period-plan.md` through `module-13-class-period-plan.md`
- Follow IM3 planning model: day types (instruction/mastery/jigsaw/review/test), objectives, worked examples
- Each module budget: ~18-24 total periods

**IM1**: Has NO class period plans — create all 14:
- Create `module-1-class-period-plan.md` through `module-14-class-period-plan.md`
- Follow same IM3 planning model
- Each module budget: ~18-24 total periods

### 3. Module Overview Files — Complete Replacement (Both IM1 and IM2)

**IM2**: Has some `module-X-<topic>.md` but they are deprecated — replace all 13:
- Create `module-1-triangles.md` through `module-13-trig-identities.md`
- Format: `# Module X: <Topic>`, `## Overview`, `## Lessons`, `### X-Y <Title>`, `## Skills Developed`

**IM1**: Has NO module overviews — create all 14:
- Create `module-1-expressions.md` through `module-14-triangles-congruence.md`
- Follow same IM3 format

### 4. Course Spec — Create for IM1 (IM2 already has it)

**IM1**: Create `curriculum/course-spec.md` following IM3 template:
- Document planning model: class period as atomic unit
- Document day types: instruction, mastery, jigsaw, review, test
- Document instructional day requirements (objective + worked examples)

### 5. Implementation Artifacts — Complete Replacement (Both IM1 and IM2)

**IM2**: Has old `implementation/` structure — replace all:
- Create `implementation/class-period-packages/module-X-pXX.json` for all periods
- Create `implementation/practice-v1/activity-map.json`
- Create `implementation/exceptions.json`

**IM1**: Has NO implementation structure — create full tree:
- Create `implementation/class-period-packages/` with JSON packages per period
- Create `implementation/practice-v1/activity-map.json`
- Create `implementation/exceptions.json`

### 6. Convex Schema Verification
- Confirm `lessons` table accepts `module-X-lesson-Y` IDs
- Verify seed data matches schema

### 7. Validation
- `npx tsc --noEmit` passes for IM1, IM2, IM3
- All apps build successfully
- IM1 and IM2 demo environments functional

## Acceptance Criteria

### Curriculum Files (Already exist — verify only)
- [x] IM2: All 96 lesson files exist in `module-X-lesson-Y` format
- [x] IM2: `Source:` lines reference existing DOCX files
- [x] IM1: All 93 lesson files exist in `module-X-lesson-Y` format
- [x] IM1: `Source:` lines reference existing DOCX files

### Seed Data (Complete replacement)
- [x] IM2: Old `unit-X` seed deleted, new `module-X` seed created
- [x] IM2: All 96 lessons have seed entries in `module-X-lesson-Y` format
- [x] IM2: `lesson_standards` entries exist for all 96 lessons
- [x] IM1: Seed created for all 93 lessons in `module-X-lesson-Y` format
- [x] IM1: `lesson_standards` entries exist for all 93 lessons

### Class Period Plans (Complete replacement)
- [x] IM2: All `unit-X-class-period-plan.md` deleted
- [x] IM2: All 13 `module-X-class-period-plan.md` created
- [x] IM1: All 14 `module-X-class-period-plan.md` created
- [x] All plans follow IM3 planning model (instruction/mastery/jigsaw/review/test)

### Module Overviews (Complete replacement)
- [x] IM2: All 13 module overview files created/updated
- [x] IM1: All 14 module overview files created

### Course Spec
- [x] IM1: `curriculum/course-spec.md` created

### Implementation Artifacts (Complete replacement)
- [x] IM2: `implementation/` structure recreated (class-period-packages, activity-map.json, exceptions.json)
- [x] IM1: `implementation/` structure created (class-period-packages, activity-map.json, exceptions.json)

### Build & Validation
- [x] `npx tsc --noEmit` passes for IM1, IM2, IM3
- [x] All apps build successfully
- [x] IM1 and IM2 demo environments functional

## Out of Scope

- Authoring new lesson content (content already provided in curriculum files)
- Creating practice item blueprints for new lessons
- Modifying activity component keys
- Convex database migration (schema changes only if needed)
- ALEKS topic creation (reuse existing structure where applicable)
