# Specification: AP Precalculus Curriculum Definition

## Overview

Define the canonical AP Precalculus curriculum artifact pipeline using the Integrated Math 3 curriculum folder as the model. This track precedes broad lesson authoring and should convert the new local AP Precalculus source documents into a durable course/unit/lesson/class-period definition that later seed, standards, problem-family, and activity work can consume.

## Context

AP Precalculus currently has a lightweight curriculum overview, three local source PDFs, and two official College Board source documents that must anchor the course definition:

- `apps/pre-calculus/curriculum/overview.md`
- `apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf`
- `apps/pre-calculus/curriculum/APPC  Unit 2 Passwater.pdf`
- `apps/pre-calculus/curriculum/APPC  Unit 3 Passwater.pdf`
- College Board AP Precalculus Course and Exam Description: `https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf`
- College Board AP Precalculus CED Clarification and Guidance: `https://apcentral.collegeboard.org/media/pdf/ap-precalculus-ced-clarification-and-guidance.pdf`

The College Board CED is the canonical source for AP units, topics, mathematical practices, learning objectives, essential knowledge, calculator expectations, and exam weighting. The clarification/guidance PDF is an errata and interpretation source that overrides the base CED where it narrows or corrects language. The local Passwater PDFs are instructional implementation evidence for notes, worksheets, quizzes/tests, pacing cues, and worked-example references.

Unit 4 is present in the College Board CED and local product/overview files as "Functions Involving Parameters, Vectors, and Matrices" / "Functions with Parameters, Vectors, and Matrices", but it is not assessed on the AP Exam and no local Unit 4 Passwater PDF is currently present. This distinction should be documented as an implementation/source exception rather than treated as an unexplained missing source.

Integrated Math 3 has a fuller planning stack: `README.md`, `course-spec.md`, per-module source files, class-period plans, implementation JSON packages, reusable problem-family mapping, exceptions, and audit output. AP Precalculus should follow that architecture while using AP course language: course, units, topics/lessons, class periods, phase packages, AP-aligned practice families.

The existing `curriculum-authoring-precalc_20260425` track assumes broad hand-authored lesson content. This track should define the evidence-backed planning layer first so that later authoring and seeding work does not invent structure disconnected from the source documents.

## Functional Requirements

1. Create a canonical AP Precalculus curriculum folder structure modeled on Integrated Math 3.
2. Extract and normalize official College Board CED evidence into auditable source artifacts, including unit/topic structure, learning objectives, essential knowledge, mathematical practices, exam weighting, and calculator expectations.
3. Extract and normalize source evidence from the Unit 1-3 Passwater PDFs into auditable text/markdown artifacts.
4. Document source gaps and source-status distinctions, especially:
   - Unit 4 is CED-defined and product-listed
   - Unit 4 is not AP-exam-assessed
   - Unit 4 has no local Passwater PDF in this repository
   - `overview.md` / `product.md` / runtime curriculum page currently disagree on approximate lesson count versus listed topic count
5. Define AP Precalculus course-level planning rules in `course-spec.md`, including:
   - College Board CED as official backbone
   - CED clarification/guidance PDF as errata
   - class period as the atomic instructional object
   - canonical day types
   - AP topic source references
   - learning objective and essential knowledge references
   - worked-example references
   - phase/package expectations
   - AP practice, calculator, and exam-alignment expectations
6. Create unit summary files and lesson/topic source files that preserve CED topic numbering/titles, CED learning-objective evidence, Passwater titles, examples, worksheets/quizzes/tests where available, and AP topic numbering.
7. Create unit-level class-period plans that map source topics to instruction, practice, review, quiz/test, and AP task-model days.
8. Create implementation bridge artifacts equivalent to IM3's planning layer:
   - `implementation/class-period-packages/unit-*.json`
   - `implementation/practice-v1/activity-map.json`
   - `implementation/exceptions.json`
   - `implementation/audit/latest.json`
9. Define a reusable AP Precalculus problem-family registry and course-plan map, modeled on IM3's ALEKS layer but named for AP Precalculus unless a real ALEKS export is provided.
10. Update Precalculus curriculum documentation so future seed and authoring tracks know which files are canonical.
11. Identify how the Precalculus Convex seed layer should later consume the canonical curriculum artifacts, without implementing full seeding in this track unless explicitly approved.

## Non-Functional Requirements

- Preserve source provenance for extracted content and planning decisions.
- Prefer deterministic, auditable artifacts over one-off hand-authored content.
- Treat official College Board CED data as the canonical AP course contract.
- Treat the CED clarification/guidance PDF as an errata source that can override the base CED.
- Keep local Passwater PDFs as implementation evidence, not as the source of AP exam requirements.
- Keep AP Precalculus terminology separate from IM3 terminology where student/teacher-facing labels differ.
- Keep generated artifacts stable enough for tests, seeders, and future audits.
- Do not introduce dependency changes or `npm install`.
- Do not perform destructive git operations.
- If Convex code is touched in a later phase, first resolve the missing `convex/_generated/ai/guidelines.md` issue or document the blocker.

## Acceptance Criteria

- [ ] `apps/pre-calculus/curriculum/README.md` and `course-spec.md` exist and define the canonical AP Precalculus planning model.
- [ ] Official College Board CED and clarification/guidance source artifacts exist and are referenced from `course-spec.md`.
- [ ] AP unit/topic, learning-objective, essential-knowledge, mathematical-practice, and exam-weighting evidence is preserved from official sources.
- [ ] Source extraction artifacts exist for all provided Unit 1-3 PDFs.
- [ ] Unit 4 source absence, CED presence, and not-assessed-on-AP-Exam status are documented in `implementation/exceptions.json`.
- [ ] The `~54` versus 58 listed-topic count mismatch is documented or reconciled with source evidence.
- [ ] Unit summary and lesson/topic source files exist for the AP Precalculus curriculum covered by available source evidence.
- [ ] Class-period plans exist for available units and use the same planning discipline as IM3.
- [ ] Implementation package JSON exists and validates against a documented schema.
- [ ] A problem-family registry and course-plan map exist for AP Precalculus practice planning.
- [ ] An audit artifact reports counts, source coverage, package coverage, and documented exceptions.
- [ ] Existing broad curriculum-authoring and seed tracks have a clear dependency relationship to this definition track.

## Out of Scope

- Full student-facing lesson authoring for all phases.
- Full Convex lesson, phase, standard, and activity seeding.
- New activity component implementation.
- Dependency installation.
- Unit 4 local instructional-source reconstruction beyond documenting the missing source, preserving overview/product/CED metadata, and marking AP exam assessment status.
