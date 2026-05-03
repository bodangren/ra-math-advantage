# Specification: Integrated Math 2 Curriculum Definition

## Overview

Define the canonical Integrated Math 2 curriculum artifact pipeline using the **Integrated Math 3** curriculum folder as the direct model — NOT the AP Precalculus track. IM3's model treats the class period (not the textbook lesson) as the atomic instructional object, uses ALEKS-style problem-type PDFs as practice-family evidence, and follows a specific daily routine and day-type taxonomy. IM2 should mirror this architecture exactly.

## Context

Integrated Math 2 currently has a lightweight curriculum overview and a set of local problem-type PDFs. Unlike AP Precalculus (which has CED topics, Passwater instructional PDFs, and FRQ task models), IM2 is a standard math course with no AP structure. The closest model in this repo is IM3, which has:

- Textbook lesson source files (`modules/module-*-lesson-*`)
- ALEKS problem-type mappings (`aleks/module-*.md`, `aleks/problem-type-registry.md`, `aleks/course-plan-map.md`)
- Module-level class-period plans (`module-*-class-period-plan.md`)
- Implementation packages with day-type taxonomy: `instruction`, `mastery`, `jigsaw`, `review`, `test`
- Daily routine: warmUp → conceptDevelopment → guidedPractice → independentPractice → assessment → capReflection
- Class period planning schema requiring: `day_type`, `module`, `source_textbook_lesson`, `class_objective_code`, `class_objective`, `worked_examples`, `aleks_problem_types`

## Context

Integrated Math 2 currently has a lightweight curriculum overview and a set of local problem-type PDFs:

- `apps/integrated-math-2/curriculum/overview.md` (311 lines, 13 units, ~67 lessons with lesson lists and core objectives)
- 18 problem-type PDFs under `apps/integrated-math-2/curriculum/`:
  - Single-module: `Module 1 Problem Types.pdf`, `Module 3 Problem Types.pdf`, `Module 4 Problem Types.pdf`, `Module 5 Problem Types.pdf`, `Module 7 Problem Types.pdf`, `Module 11 Problem Types.pdf`, `Module 13 Problem Types.pdf`
  - Split-module: `Module 6-1 to 6-5 Problem Types.pdf` + `Module 6-6 to 6-9 Problem Types.pdf`, `Module 8-1 to 8-4 Problem Types.pdf` + `Module 8-5 to 8-7 Problem Types.pdf`, `Module 9-1 to 9-2 Problem Types.pdf` + `Module 9-3 to 9-8 Problem Types.pdf`, `Module 10-1 to 10-4 Problem Types.pdf` + `Module 10-5 to 10-7 Problem Types.pdf`, `Module 12-1 to 12-4 Problem Types.pdf` + `Module 12-15 to 12-10 Problem Types.pdf`
  - Known filename anomalies: `Module 2 PRoblem Types.pdf` (typo: "PRoblem"), `Module 12-15 to 12-10 Problem Types.pdf` (reversed range — likely 12-5 to 12-10)

The PDFs appear to be exported problem-type/question banks, not full textbook lesson guides. The module numbering in PDF filenames may not map 1:1 to the overview's unit numbering (e.g., overview Unit 6 has 5 lessons but PDF Module 6 covers 9 lesson ranges across 2 files). IM2 needs a definition layer that reconciles the human course sequence from `overview.md` with the practice/problem-family evidence from the PDFs.

Integrated Math 3 has a fuller planning stack: `README.md`, `course-spec.md`, per-module source files, class-period plans, implementation JSON packages, ALEKS problem-family mapping, exceptions, and audit output. IM2 should follow that architecture exactly while adapting to IM2's 13-unit structure and using the problem-type PDFs in place of IM3's ALEKS exports.

The existing `curriculum-authoring-im2_20260425` track assumes broad hand-authored lesson content. This track should define the evidence-backed planning layer first so that later authoring and seeding work does not invent structure disconnected from the overview and local source documents.

**Critical lesson from the precalc track**: Phase 1-4 alone produces structurally valid but instructionally shallow artifacts (stubs). Phase 5 (curriculum depth remediation) is REQUIRED to produce source-grounded content. Plan for Phase 5 from the start.

## Functional Requirements

1. Create a canonical Integrated Math 2 curriculum folder structure modeled on Integrated Math 3.
2. Inventory and normalize source evidence from the IM2 overview and all 18 local problem-type PDFs.
3. Document source anomalies, including the "PRoblem" typo (Module 2), the reversed range "12-15 to 12-10" (Module 12), split modules (6, 8, 9, 10, 12), and mismatches between PDF module ranges and the 13-unit overview.
4. Define IM2 course-level planning rules in `course-spec.md`, modeled on IM3's course-spec:
   - **class period** as the atomic instructional object (not the lesson)
   - **daily routine**: warmUp → conceptDevelopment → guidedPractice → independentPractice → assessment → capReflection
   - **canonical day types**: `instruction`, `mastery`, `jigsaw`, `review`, `test`
   - unit/lesson references with worked-example references in IM3 format (e.g., "1-1, Examples 1-3")
   - problem-type PDF evidence mapped to ALEKS-style `familyKey` values
   - phase/package expectations matching IM3's `class-period-package.v1` schema
   - mastery, review, and assessment expectations
   - CAP integration (Courage, Adaptability, Persistence)
5. Create unit summary files and lesson source files that preserve overview titles, core objectives, unit numbering, and any source-backed problem-type evidence. Follow IM3's lesson markdown heading hierarchy convention (# title, ## sections, ### substructure).
6. Create unit-level class-period plans that map lessons to instruction, mastery, jigsaw, review, and test days, following IM3's planning model.
7. Create implementation bridge artifacts equivalent to IM3's planning layer:
   - `implementation/class-period-packages/unit-*.json` (using IM3's `class-period-package.v1` schema with daily routine fields)
   - `implementation/practice-v1/activity-map.json` (with component key diversity — no single key >40%)
   - `implementation/exceptions.json`
   - `implementation/audit/latest.json`
8. Define a reusable IM2 problem-family registry and course-plan map, modeled on IM3's ALEKS layer and sourced from the problem-type PDFs where possible. Problem families should use stable `familyKey` values.
9. Update IM2 curriculum documentation so future seed and authoring tracks know which files are canonical.
10. Identify how the IM2 Convex seed layer should later consume the canonical curriculum artifacts, without implementing full seeding in this track unless explicitly approved.
11. **Phase 5 (REQUIRED)**: After Phases 1-4 produce structurally valid artifacts, enrich all source docs, lesson files, and class-period packages with source-grounded content from the problem-type PDFs. Write depth-validation tests FIRST (TDD) that reject shallow artifacts.

## Non-Functional Requirements

- Preserve source provenance for extracted content and planning decisions.
- Prefer deterministic, auditable artifacts over one-off hand-authored content.
- Keep IM2 unit/lesson terminology aligned with the app product definition and public curriculum page.
- Keep generated artifacts stable enough for tests, seeders, and future audits.
- Do not introduce dependency changes or `npm install`.
- Do not perform destructive git operations.
- If Convex code is touched in a later phase, first resolve the missing `convex/_generated/ai/guidelines.md` issue or document the blocker.

## Acceptance Criteria

- [ ] `apps/integrated-math-2/curriculum/README.md` and `course-spec.md` exist and define the canonical IM2 planning model.
- [ ] Source inventory artifacts exist for `overview.md` and all local problem-type PDFs.
- [ ] Source anomalies are documented in `implementation/exceptions.json`.
- [ ] Unit summary and lesson source files exist for the 13-unit IM2 sequence.
- [ ] Class-period plans exist for all 13 units and use the same planning discipline as IM3.
- [ ] Implementation package JSON exists and validates against a documented schema.
- [ ] A problem-family registry and course-plan map exist for IM2 practice planning.
- [ ] An audit artifact reports counts, source coverage, package coverage, and documented exceptions.
- [ ] Existing broad curriculum-authoring and seed tracks have a clear dependency relationship to this definition track.

## Out of Scope

- Full student-facing lesson authoring for all phases.
- Full Convex lesson, phase, standard, and activity seeding.
- New activity component implementation.
- Dependency installation.
- Reconstructing full textbook source content when only problem-type PDFs are available.

