# Integrated Math 2 — Curriculum

This folder contains the canonical curriculum specification for the IM2 course.

## Files

| File | Description |
|------|-------------|
| `course-spec.md` | Full course overview, goals, assessment philosophy, and instructional priorities |
| `overview.md` | 13-unit course overview with lesson lists and core objectives |
| `source/` | Extracted and normalized problem-type PDF source evidence |
| `practice/` | Problem-family registry and course-plan mapping |
| `modules/` | Per-unit summary files and per-lesson source files with worked examples |
| `implementation/` | Generated class-period packages, `practice.v1` activity mappings, source exceptions, and audit output |

## Curriculum Summary

- **13 units**, **67 lessons** total
- Covers: geometric reasoning (Units 1–5), measurement (Unit 6), probability (Unit 7), algebraic functions (Units 8–10), polynomials and quadratics (Units 11–12), trigonometry (Unit 13)
- Each lesson maps to the 6-phase daily routine: warmUp → conceptDevelopment → guidedPractice → independentPractice → assessment → capReflection
- Problem-family mappings are tracked separately in `practice/course-plan-map.md`
- The audited planning layer contains class periods using IM3 day types: `instruction`, `mastery`, `jigsaw`, `review`, `test`
- Instruction periods map to the daily routine through generated phase-package artifacts in `implementation/class-period-packages/`
- Activity candidates map to the `practice.v1` contract in `implementation/practice-v1/activity-map.json`
- Source materials: overview.md, 18 local ALEKS problem-type PDFs

## Validation

Run the curriculum audit after curriculum, problem-family, or implementation-artifact changes:

```bash
npm run curriculum:audit
```

The audit writes `curriculum/implementation/audit/latest.json` and checks curriculum counts, lesson source quality, problem-family coverage, class-period package coverage, and `practice.v1` activity mapping coverage.

## Source Materials

| Source | Role |
|--------|------|
| `overview.md` | 13-unit course overview, lesson lists, core objectives |
| 18 problem-type PDFs | ALEKS-style question banks per module (see `source/pdf-manifest.json`) |

## Known Source Anomalies

See `implementation/exceptions.json` for full documentation.

- Module 2 PDF filename has typo: "PRoblem" instead of "Problem"
- Module 12 PDF filename has reversed range: "12-15 to 12-10" (likely means "12-5 to 12-10")
- Modules 6, 8, 9, 10, 12 have split PDFs (multiple files per module)
- PDF module lesson ranges may not match overview unit lesson counts 1:1
- PDF extraction quality varies for diagrams, graphs, construction tasks, and formula notation

## Relationship to Codebase

- `convex/schema.ts` stores lessons in the `lessons` table with `unitNumber` (1-13) and `orderIndex`
- Lesson slugs follow the pattern `{unitNumber}-{lessonNumber}` (e.g., `1-1`, `5-3`)
- `measure/product.md` references this folder for the curriculum definition
- Activity implementations should use `practice/problem-type-registry.md` family keys as the curriculum-facing vocabulary for reusable practice and assessment types

## Relationship to Other Tracks

- `curriculum-authoring-im2_20260425`: Downstream authoring track depends on this definition track
- Standards seeding: Depends on this track for objective codes and lesson structure
- Lesson seeding: Depends on this track for canonical lesson source files
- Problem-family implementation: Depends on this track for familyKey registry
