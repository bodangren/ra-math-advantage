# Integrated Math 3 (Honors) -- Curriculum

This folder contains the canonical curriculum specification for the IM3 course.

## Files

| File | Description |
|------|-------------|
| `course-spec.md` | Full course overview, goals, assessment philosophy, and instructional priorities |
| `aleks/` | ALEKS-style reusable problem-type registry and course-plan mapping |
| `modules/` | Per-module breakdowns with lesson details and skills |
| `implementation/` | Generated class-period packages, `practice.v1` activity mappings, source exceptions, and audit output |

## Curriculum Summary

- **9 modules**, **52 lessons** total
- Covers: quadratics, polynomials, inverses/radicals, exponentials, logarithms, rationals, statistics, trigonometry
- Each lesson maps to the 6-phase structure: Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing
- ALEKS-style problem families are mapped separately in `aleks/course-plan-map.md`
- The audited planning layer contains **180 class periods**: 108 instruction, 36 mastery, 18 jigsaw/group-work, 9 review, and 9 test periods
- Instruction periods map to the daily routine through generated phase-package artifacts in `implementation/class-period-packages/`
- Activity candidates map to the `practice.v1` contract in `implementation/practice-v1/activity-map.json`
- Source materials: Reveal Integrated Mathematics 3 textbook, IM3 Course Syllabus

## Validation

Run the curriculum audit after curriculum, ALEKS, or implementation-artifact changes:

```bash
npm run curriculum:audit
```

The audit writes `curriculum/implementation/audit/latest.json` and checks curriculum counts, lesson source quality, ALEKS coverage documentation, class-period package coverage, and `practice.v1` activity mapping coverage.

## Relationship to Codebase

- `convex/schema.ts` stores lessons in the `lessons` table with `unitNumber` (1-9) and `orderIndex`
- Lesson slugs follow the pattern `{unitNumber}-{lessonNumber}` (e.g., `1-1`, `5-3`)
- The `competency_standards` table maps to module-level skills
- `conductor/product.md` references this folder for the curriculum definition
- Activity implementations should use `aleks/problem-type-registry.md` family keys as the curriculum-facing vocabulary for reusable practice and assessment types
