# Implementation Plan: AP Precalculus Curriculum Definition

## Phase 1: Source Inventory and Canonical Contract

- [x] Task: Write source inventory tests and checks [79b01de]
    - [x] Add validation coverage for the official College Board AP Precalculus Course and Exam Description source reference
    - [x] Add validation coverage for the College Board CED Clarification and Guidance source reference
    - [x] Add or update validation coverage for expected Precalculus source files and documented missing sources
    - [x] Confirm Unit 1-3 PDFs are readable through existing local tooling
    - [x] Confirm Unit 4 Passwater source absence is represented as an expected documented exception
    - [x] Confirm Unit 4 is represented as CED-defined and not assessed on the AP Exam
    - [x] Confirm the `~54` lesson-count language versus 58 listed topics is either reconciled or documented as a source mismatch
- [x] Task: Define Precalculus curriculum contract [79b01de]
    - [x] Create `apps/pre-calculus/curriculum/README.md`
    - [x] Create `apps/pre-calculus/curriculum/course-spec.md`
    - [x] Define official-source precedence: CED first, CED clarification/guidance second, local Passwater PDFs third, local overview/product/runtime pages fourth
    - [x] Define course, unit, topic/lesson, class-period, phase-package, and practice-family terminology
    - [x] Define AP unit/topic, learning-objective, essential-knowledge, mathematical-practice, calculator-use, and exam-weighting references
    - [x] Define Unit 4 handling as CED-defined, locally unsourced, and not AP-exam-assessed
    - [x] Document relationship to `curriculum-authoring-precalc_20260425`, standards seeding, lesson seeding, and problem-family tracks
- [x] Task: Measure - User Manual Verification 'Source Inventory and Canonical Contract' (Protocol in workflow.md)

## Phase 2: PDF Extraction and Source Normalization

- [x] Task: Write extraction fixture tests [a8e2606]
    - [x] Validate official CED source artifact includes AP Precalculus unit and topic headings
    - [x] Validate official CED source artifact preserves Unit 4 not-assessed-on-AP-Exam status
    - [x] Validate CED clarification/guidance source artifact is present and referenced as errata
    - [x] Validate extracted text includes expected unit/topic headings for Unit 1
    - [x] Validate extracted text includes expected unit/topic headings for Unit 2
    - [x] Validate extracted text includes expected unit/topic headings for Unit 3
- [x] Task: Extract and normalize official College Board CED evidence [a8e2606]
    - [x] Create deterministic source artifacts for CED unit/topic structure
    - [x] Preserve learning objectives, essential knowledge, mathematical practices, calculator guidance, and exam weighting where extractable
    - [x] Store clarification/guidance notes as errata linked to the base CED source artifact
- [x] Task: Extract and normalize Unit 1-3 source evidence [a8e2606]
    - [x] Create a deterministic extraction script or documented command path using existing local Python/PDF tooling
    - [x] Store normalized source markdown or text artifacts under `apps/pre-calculus/curriculum/source/`
    - [x] Preserve PDF filename, page count, topic headings, examples, worksheets, quizzes/tests, and pacing cues where extractable
- [x] Task: Document source limitations [a8e2606]
    - [x] Create `apps/pre-calculus/curriculum/implementation/exceptions.json`
    - [x] Record missing Unit 4 Passwater source PDF
    - [x] Record Unit 4 CED presence and not-assessed-on-AP-Exam status
    - [x] Record the `~54` versus 58 listed-topic count mismatch if not reconciled by source evidence
    - [x] Record extraction quality limitations for malformed OCR/text, diagrams, graphs, and formula loss
- [x] Task: Measure - User Manual Verification 'PDF Extraction and Source Normalization' (Protocol in workflow.md)

## Phase 3: Unit, Lesson, and Class-Period Planning

- [x] Task: Write structural validation tests for curriculum artifacts [c8c8e68]
    - [x] Validate required Precalculus curriculum directories and files
    - [x] Validate unit/topic counts against source evidence and documented exceptions
    - [x] Validate AP topic numbering and titles align to the CED-derived source artifact
    - [x] Validate learning-objective and essential-knowledge references are present for source-backed AP topics
    - [x] Validate class-period plans include required fields for instruction and non-instruction days
- [x] Task: Create unit and lesson/topic source layer [c8c8e68]
    - [x] Create unit summary files for available source-backed units
    - [x] Create lesson/topic source files preserving AP topic numbering, CED titles, learning objectives, essential knowledge, and local Passwater source titles
    - [x] Include examples and assessment artifacts as references, not necessarily fully authored app phases
- [x] Task: Create class-period plans [c8c8e68]
    - [x] Create `unit-*-class-period-plan.md` files for source-backed units
    - [x] Map topics to instruction, practice, review, quiz/test, and AP task-model days
    - [x] Keep class-period planning aligned with `course-spec.md`
- [x] Task: Measure - User Manual Verification 'Unit, Lesson, and Class-Period Planning' (Protocol in workflow.md)

## Phase 4: Implementation Bridge and Audit

- [x] Task: Write implementation artifact validation tests [9c8735c]
    - [x] Validate `class-period-package.v1` shape for Precalculus unit packages
    - [x] Validate package and activity-map references point back to CED topic IDs and local source references where available
    - [x] Validate practice activity map entries reference known units, periods, and problem families
    - [x] Validate documented exceptions are consumed by the audit
- [x] Task: Create implementation bridge artifacts [9c8735c]
    - [x] Create `apps/pre-calculus/curriculum/implementation/README.md`
    - [x] Create `implementation/class-period-packages/unit-*.json`
    - [x] Create `implementation/practice-v1/activity-map.json`
    - [x] Create `implementation/audit/latest.json`
- [x] Task: Create AP Precalculus problem-family planning layer [9c8735c]
    - [x] Create `apps/pre-calculus/curriculum/practice/README.md`
    - [x] Create `practice/problem-family-registry.md`
    - [x] Create `practice/course-plan-map.md`
    - [x] Use source-backed AP topic families and mark implementation status conservatively
- [x] Task: Run verification and update downstream planning [9c8735c]
    - [x] Run relevant tests and validation scripts
    - [x] Update `measure/tracks.md` so downstream Precalculus authoring/seeding tracks depend on this track where appropriate
    - [x] Update downstream Precalculus authoring scope to distinguish CED-defined topics from local Passwater implementation evidence
    - [x] Record any discovered tech debt or unresolved source questions
- [x] Task: Measure - User Manual Verification 'Implementation Bridge and Audit' (Protocol in workflow.md)

## Phase 5: Curriculum Depth Remediation [checkpoint: 67901ff]

The existing Phase 1-4 artifacts are structurally complete but lack instructional depth. Passwater source docs are topic-index stubs (43-44 lines each), topic files are CED-identity-only shells (25 lines each), the activity map assigns `comprehension-quiz` to every topic regardless of content type, and class-period packages use copy-paste daily phases. This phase enriches all artifacts to course-authoring quality.

- [x] Task: Write curriculum-depth validation tests
    - [x] Reject Passwater source docs under 150 lines (require per-topic instructional detail)
    - [x] Reject topic files under 80 lines for AP-exam-assessed topics (require LO/EK text, scaffolding, practice, FRQ)
    - [x] Reject activity maps that assign the same componentKey to more than 60% of entries
    - [x] Reject activity maps that never use graphing-explorer, step-by-step-solver, rate-of-change-calculator, fill-in-the-blank, or discriminant-analyzer
    - [x] Reject class-period packages where dailyPhases text is identical across periods except for topic-ID substitution
    - [x] Validate Passwater source docs contain per-topic subsections with notes, examples, worksheet, and quiz/test references
    - [x] Validate topic files contain explicit CED learning-objective and essential-knowledge text (not just family codes)
- [x] Task: Enrich Passwater Unit 1 source doc with per-topic instructional detail
    - [x] Add per-topic subsections: notes outline, worked examples, worksheet references, quiz/test references, pacing days, FRQ signals
    - [x] Include explicit review/test break points matching Passwater's unit guide
    - [x] Target ≥200 lines of course-planning-useful content
- [x] Task: Enrich Passwater Unit 2 source doc with per-topic instructional detail
    - [x] Same enrichment pattern as Unit 1
    - [x] Target ≥200 lines
- [x] Task: Enrich Passwater Unit 3 source doc with per-topic instructional detail
    - [x] Same enrichment pattern as Unit 1
    - [x] Include polar-function graphing and rate-of-change signals for Topics 3.13-3.15
    - [x] Target ≥200 lines
- [x] Task: Enrich all 44 AP-exam-assessed topic files with instructional depth
    - [x] Add explicit CED learning-objective text and essential-knowledge statements (not just family codes)
    - [x] Add Passwater scaffolding notes: how the topic is introduced, key vocabulary, common misconceptions
    - [x] Add guided-practice description referencing Passwater worked examples
    - [x] Add independent-practice description with AP-style task expectations
    - [x] Add FRQ expectations where topic maps to FRQ task models (Units 1-2 → FRQ 1/2, Unit 3 → FRQ 3/4)
    - [x] Add app-build notes: which componentKey is appropriate, calculator requirements, graphing needs
    - [x] Target ≥80 lines per topic file
- [x] Task: Replace generic activity map with source-backed component diversity
    - [x] Map graphing topics (1.4-1.6, 1.7-1.10, 3.4-3.7, 3.13-3.15) to graphing-explorer
    - [x] Map algebraic manipulation topics (1.11, 2.4, 2.12, 2.13) to step-by-step-solver
    - [x] Map rate-of-change topics (1.2, 1.3, 2.2) to rate-of-change-calculator
    - [x] Map vocabulary/definition topics to fill-in-the-blank
    - [x] Map discriminant/quadratic analysis topics to discriminant-analyzer
    - [x] Keep comprehension-quiz for conceptual comprehension topics
    - [x] Validate no single componentKey exceeds 40% of entries
    - [x] Update sourceReferences to point to specific Passwater per-topic subsections
- [x] Task: Update class-period packages with concrete daily phases and evidence
    - [x] Replace copy-paste dailyPhases with topic-specific warm-up, introduction, scaffolded examples, guided practice, independent practice, exit evidence, and CAP reflection text
    - [x] Include explicit Passwater source references (page ranges or section names where available)
    - [x] Include FRQ-model signals for Units 1-2 (non-periodic modeling) and Unit 3 (periodic/symbolic)
    - [x] Include calculator-use expectations from the CED
    - [x] Validate dailyPhases text is unique per period (not just topic-ID swap)
- [x] Task: Update audit artifact to reflect depth remediation
    - [x] Add depth-quality checks to audit/latest.json
    - [x] Update activity-candidate count if entries change
    - [x] Record componentKey diversity metrics
- [x] Task: Run verification and quality gates
    - [x] Run `npm run test` in apps/pre-calculus — 351/351 curriculum tests pass
    - [x] Run `npm run lint` — clean
    - [x] Run `npx tsc --noEmit` — clean
    - [x] Run `npm run build`
    - [x] Verify all new depth-validation tests pass — 338/338
- [x] Task: Measure - User Manual Verification 'Curriculum Depth Remediation' (Protocol in workflow.md)
