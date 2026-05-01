# AP Precalculus Curriculum

This folder contains the canonical curriculum planning layer for the AP Precalculus application.

The curriculum model uses the CED for competencies and Passwater PDFs for scaffolding. The College Board Course and Exam Description defines what students must know, what evidence should count as competency, how the AP Exam samples the course, and what FRQ task models students need to practice. The local Passwater PDFs define how topics are introduced in class, how examples are scaffolded, how guided practice develops, and what independent AP-style practice should look like.

## Files

| File | Purpose |
|------|---------|
| `overview.md` | Current local course overview and public-facing unit/topic list |
| `course-spec.md` | Canonical source hierarchy, AP competency model, instructional model, and implementation rules |
| `APPC  Unit 1 Passwater.pdf` | Local instructional source for Unit 1 notes, worksheets, quizzes/tests, and pacing |
| `APPC  Unit 2 Passwater.pdf` | Local instructional source for Unit 2 notes, worksheets, quizzes/tests, and pacing |
| `APPC  Unit 3 Passwater.pdf` | Local instructional source for Unit 3 notes, worksheets, quizzes/tests, and pacing |
| `implementation/exceptions.json` | Machine-readable source gaps and known curriculum-definition exceptions |

## Source Precedence

1. College Board AP Precalculus Course and Exam Description: official competency and exam contract.
2. College Board AP Precalculus CED Clarification and Guidance: errata and interpretation source.
3. Local Passwater PDFs: instructional design, scaffolding, examples, practice, pacing, and assessment implementation evidence.
4. Local `overview.md`, `product.md`, and runtime curriculum pages: app-facing labels that must be reconciled against the official and instructional sources.

## Curriculum Summary

- 4 CED units and 58 listed AP topics.
- Units 1-3 are assessed on the AP Exam.
- Unit 4 is CED-defined but not assessed on the AP Exam.
- Unit 4 currently has no local Passwater source PDF in this repository.
- Local product/overview language still says `~54 lessons`; this is documented in `implementation/exceptions.json` until reconciled.

## Relationship to Downstream Tracks

- `curriculum-authoring-precalc_20260425` should author student-facing lesson phases from this planning layer rather than inventing a parallel course outline.
- Standards/objective seeding should consume CED topics, learning objectives, essential knowledge, mathematical practices, and FRQ task expectations from `course-spec.md` and the later source artifacts.
- Lesson seeding should consume class-period packages after this definition track creates them.
- Problem-family work should use CED competency targets plus Passwater independent-practice shapes to define reusable `practice.v1` families.

## Current Status

This is the Phase 1 contract layer for the AP Precalculus curriculum-definition track. Later phases should add normalized CED source artifacts, normalized Passwater source artifacts, unit/topic source files, class-period plans, implementation packages, practice maps, and audit output.
