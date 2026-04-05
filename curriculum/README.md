# Integrated Math 3 (Honors) -- Curriculum

This folder contains the canonical curriculum specification for the IM3 course.

## Files

| File | Description |
|------|-------------|
| `course-spec.md` | Full course overview, goals, assessment philosophy, and instructional priorities |
| `modules/` | Per-module breakdowns with lesson details and skills |

## Curriculum Summary

- **9 modules**, **52 lessons** total
- Covers: quadratics, polynomials, inverses/radicals, exponentials, logarithms, rationals, statistics, trigonometry
- Each lesson maps to the 6-phase structure: Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing
- Source materials: Reveal Integrated Mathematics 3 textbook, IM3 Course Syllabus

## Relationship to Codebase

- `convex/schema.ts` stores lessons in the `lessons` table with `unitNumber` (1-9) and `orderIndex`
- Lesson slugs follow the pattern `{unitNumber}-{lessonNumber}` (e.g., `1-1`, `5-3`)
- The `competency_standards` table maps to module-level skills
- `conductor/product.md` references this folder for the curriculum definition
