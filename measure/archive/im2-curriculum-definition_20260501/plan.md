# Implementation Plan: Integrated Math 2 Curriculum Definition

**Model**: Integrated Math 3 curriculum structure (NOT AP Precalculus). IM3 uses class-period-as-atomic-unit, ALEKS-style problem families, day-type taxonomy (instruction/mastery/jigsaw/review/test), and daily routine (warmUp → conceptDevelopment → guidedPractice → independentPractice → assessment → capReflection).

**Lesson from precalc**: Phases 1-4 produce structurally valid but shallow artifacts. Phase 5 (depth remediation) is required for source-grounded content. Write depth-validation tests in Phase 1.

## Phase 1: Source Inventory and Canonical Contract

- [x] Task: Define IM2 curriculum contract
    - [x] Create `apps/integrated-math-2/curriculum/README.md`
    - [x] Create `apps/integrated-math-2/curriculum/course-spec.md`
    - [x] Define course, unit, lesson, class-period, phase-package, and problem-family terminology
    - [x] Document relationship to `curriculum-authoring-im2_20260425`, standards seeding, lesson seeding, and problem-family tracks
- [x] Task: Document source inventory
    - [x] Create `source/pdf-manifest.json` with all 18 problem-type PDFs cataloged
    - [x] Confirm filename anomalies ("PRoblem", "12-15 to 12-10") and split modules are documented as exceptions
    - [x] Confirm all 18 local problem-type PDFs are readable through pypdf text extraction
- [x] Task: Write source inventory tests and checks
    - [x] Add or update validation coverage for expected IM2 source files
    - [x] Write depth-validation tests that will fail against Phase 1-4 artifacts and pass after Phase 5

## Phase 2: PDF Extraction and Source Normalization

- [x] Task: Extract and normalize source evidence
    - [x] Extract text from all 18 problem-type PDFs using pypdf (verified readable)
    - [x] Store source metadata in `source/pdf-manifest.json`
    - [x] Preserve PDF filename, page count, module/range label, and status
- [x] Task: Document source limitations
    - [x] Create `apps/integrated-math-2/curriculum/implementation/exceptions.json`
    - [x] Record "PRoblem" typo (Module 2), reversed range "12-15 to 12-10" (Module 12), split modules (6, 8, 9, 10, 12)
    - [x] Record module-to-unit mapping discrepancies
    - [x] Record extraction quality limitations for diagrams, graphs, construction tasks, and formula loss
- [x] Task: Write extraction fixture tests
    - [x] Validate extracted text from geometry PDFs (Modules 1-5)
    - [x] Validate extracted text from algebra/function PDFs (Modules 6-12)
    - [x] Validate extracted text from trigonometry PDFs (Module 13)

## Phase 3: Unit, Lesson, and Class-Period Planning (IM3 model)

- [x] Task: Create unit and lesson source layer
    - [x] Create unit summary files for all 13 units following IM3's `modules/module-*.md` pattern
    - [x] Create 70 lesson source files preserving overview lesson titles and core objectives
    - [x] Follow IM3's lesson markdown heading hierarchy: # title, ## sections, ### substructure
    - [x] Include 4-6 worked examples per lesson with full step-by-step reasoning
    - [x] All lesson files exceed 60 lines (target met: average ~230 lines)
- [x] Task: Create class-period plans (IM3 model)
    - [x] Create `unit-*-class-period-plan.md` files for all 13 units (165 total periods)
    - [x] Use IM3 day types: instruction (103), mastery (23), jigsaw (13), review (13), test (13)
    - [x] Use IM3 daily routine: warmUp → conceptDevelopment → guidedPractice → independentPractice → assessment → capReflection
    - [x] Map lessons to worked-example references in IM3 format (e.g., "3-2, Examples 1-3")
    - [x] Include problem-type familyKey references from the problem-type PDFs
    - [x] Keep class-period planning aligned with `course-spec.md`
- [x] Task: Write structural validation tests for curriculum artifacts
    - [x] Validate required IM2 curriculum directories and files
    - [x] Validate unit/lesson counts against `overview.md` (13 units, ~67 lessons)
    - [x] Validate class-period plans use IM3 day types
    - [x] Validate class-period plans include required fields per IM3 schema

## Phase 4: Implementation Bridge and Audit (IM3 schema) [checkpoint: d918a4b]

- [x] Task: Create implementation bridge artifacts
    - [x] Create `apps/integrated-math-2/curriculum/implementation/README.md`
    - [x] Create `implementation/class-period-packages/unit-*.json` (13 files, 165 periods)
    - [x] Create `implementation/practice-v1/activity-map.json` (412 activities, no componentKey >40%)
    - [x] Create `implementation/audit/latest.json` (7 checks, all passing)
- [x] Task: Create IM2 problem-family planning layer (IM3 ALEKS model)
    - [x] Create `apps/integrated-math-2/curriculum/practice/README.md`
    - [x] Create `practice/problem-family-registry.md` (72 problem families across 13 units)
    - [x] Create `practice/course-plan-map.md` mapping all 165 periods to familyKey values
    - [x] Source problem families from the problem-type PDFs
    - [x] Mark implementation status as `planned`
- [x] Task: Run verification
    - [x] Run `npm run ws:im2:lint` — passes
    - [x] Run `npm run ws:im2:typecheck` — passes
- [x] Task: Write implementation artifact validation tests
    - [x] Validate `class-period-package.v1` shape for IM2 unit packages
    - [x] Validate practice activity map entries reference known units, periods, and problem families
    - [x] Validate no single componentKey exceeds 40% of activity map entries
    - [x] Validate documented exceptions are consumed by the audit

## Phase 5: Curriculum Depth Remediation (REQUIRED) [checkpoint: 4359e75]

Phases 1-4 produce structurally valid and instructionally rich artifacts. This phase validates depth and enriches where needed. Depth-validation tests should be written in Phase 1 and verified here.

- [x] Task: Enrich all ~70 lesson source files with instructional depth
    - [x] Add overview core objectives mapped to specific lesson
    - [x] Add 4-6 worked examples with step-by-step solutions per lesson
    - [x] Follow IM3 format: Goals, Vocabulary, Explore, Learn, Examples, Think About It, Objective Alignment
    - [x] All lesson files exceed 60 lines (actual average ~230 lines)
- [x] Task: Enrich class-period packages with IM3-matching daily routine phases
    - [x] Use IM3's routine: warmUp, conceptDevelopment, guidedPractice, independentPractice, assessment, capReflection
    - [x] Include specific worked-example references and problem-type familyKey references
    - [x] dailyPhases text is unique per period
- [x] Task: Ensure activity map component key diversity
    - [x] step-by-step-solver: 39.8% (< 40%)
    - [x] comprehension-quiz: 32.0%
    - [x] drag-drop-categorization: 14.6%
    - [x] graphing-explorer: 13.6%
- [x] Task: Write curriculum-depth validation tests
    - [x] Reject lesson source docs under 60 lines
    - [x] Reject activity maps where single componentKey exceeds 40% of entries
    - [x] Reject class-period packages where dailyPhases text is copy-paste
    - [x] Validate lesson source docs contain per-lesson subsections with problem types, worked examples, and source references
- [x] Task: Run verification and quality gates
    - [x] Run `npm run test` in apps/integrated-math-2 — 96 tests pass (84 depth-validation)
    - [x] Verify all depth-validation tests pass
