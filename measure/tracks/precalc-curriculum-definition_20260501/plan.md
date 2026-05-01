# Implementation Plan: AP Precalculus Curriculum Definition

## Phase 1: Source Inventory and Canonical Contract

- [x] Task: Write source inventory tests and checks
    - [x] Add validation coverage for the official College Board AP Precalculus Course and Exam Description source reference
    - [x] Add validation coverage for the College Board CED Clarification and Guidance source reference
    - [x] Add or update validation coverage for expected Precalculus source files and documented missing sources
    - [x] Confirm Unit 1-3 PDFs are readable through existing local tooling
    - [x] Confirm Unit 4 Passwater source absence is represented as an expected documented exception
    - [x] Confirm Unit 4 is represented as CED-defined and not assessed on the AP Exam
    - [x] Confirm the `~54` lesson-count language versus 58 listed topics is either reconciled or documented as a source mismatch
- [x] Task: Define Precalculus curriculum contract
    - [x] Create `apps/pre-calculus/curriculum/README.md`
    - [x] Create `apps/pre-calculus/curriculum/course-spec.md`
    - [x] Define official-source precedence: CED first, CED clarification/guidance second, local Passwater PDFs third, local overview/product/runtime pages fourth
    - [x] Define course, unit, topic/lesson, class-period, phase-package, and practice-family terminology
    - [x] Define AP unit/topic, learning-objective, essential-knowledge, mathematical-practice, calculator-use, and exam-weighting references
    - [x] Define Unit 4 handling as CED-defined, locally unsourced, and not AP-exam-assessed
    - [x] Document relationship to `curriculum-authoring-precalc_20260425`, standards seeding, lesson seeding, and problem-family tracks
- [ ] Task: Measure - User Manual Verification 'Source Inventory and Canonical Contract' (Protocol in workflow.md)

## Phase 2: PDF Extraction and Source Normalization

- [ ] Task: Write extraction fixture tests
    - [ ] Validate official CED source artifact includes AP Precalculus unit and topic headings
    - [ ] Validate official CED source artifact preserves Unit 4 not-assessed-on-AP-Exam status
    - [ ] Validate CED clarification/guidance source artifact is present and referenced as errata
    - [ ] Validate extracted text includes expected unit/topic headings for Unit 1
    - [ ] Validate extracted text includes expected unit/topic headings for Unit 2
    - [ ] Validate extracted text includes expected unit/topic headings for Unit 3
- [ ] Task: Extract and normalize official College Board CED evidence
    - [ ] Create deterministic source artifacts for CED unit/topic structure
    - [ ] Preserve learning objectives, essential knowledge, mathematical practices, calculator guidance, and exam weighting where extractable
    - [ ] Store clarification/guidance notes as errata linked to the base CED source artifact
- [ ] Task: Extract and normalize Unit 1-3 source evidence
    - [ ] Create a deterministic extraction script or documented command path using existing local Python/PDF tooling
    - [ ] Store normalized source markdown or text artifacts under `apps/pre-calculus/curriculum/source/`
    - [ ] Preserve PDF filename, page count, topic headings, examples, worksheets, quizzes/tests, and pacing cues where extractable
- [ ] Task: Document source limitations
    - [ ] Create `apps/pre-calculus/curriculum/implementation/exceptions.json`
    - [ ] Record missing Unit 4 Passwater source PDF
    - [ ] Record Unit 4 CED presence and not-assessed-on-AP-Exam status
    - [ ] Record the `~54` versus 58 listed-topic count mismatch if not reconciled by source evidence
    - [ ] Record extraction quality limitations for malformed OCR/text, diagrams, graphs, and formula loss
- [ ] Task: Measure - User Manual Verification 'PDF Extraction and Source Normalization' (Protocol in workflow.md)

## Phase 3: Unit, Lesson, and Class-Period Planning

- [ ] Task: Write structural validation tests for curriculum artifacts
    - [ ] Validate required Precalculus curriculum directories and files
    - [ ] Validate unit/topic counts against source evidence and documented exceptions
    - [ ] Validate AP topic numbering and titles align to the CED-derived source artifact
    - [ ] Validate learning-objective and essential-knowledge references are present for source-backed AP topics
    - [ ] Validate class-period plans include required fields for instruction and non-instruction days
- [ ] Task: Create unit and lesson/topic source layer
    - [ ] Create unit summary files for available source-backed units
    - [ ] Create lesson/topic source files preserving AP topic numbering, CED titles, learning objectives, essential knowledge, and local Passwater source titles
    - [ ] Include examples and assessment artifacts as references, not necessarily fully authored app phases
- [ ] Task: Create class-period plans
    - [ ] Create `unit-*-class-period-plan.md` files for source-backed units
    - [ ] Map topics to instruction, practice, review, quiz/test, and AP task-model days
    - [ ] Keep class-period planning aligned with `course-spec.md`
- [ ] Task: Measure - User Manual Verification 'Unit, Lesson, and Class-Period Planning' (Protocol in workflow.md)

## Phase 4: Implementation Bridge and Audit

- [ ] Task: Write implementation artifact validation tests
    - [ ] Validate `class-period-package.v1` shape for Precalculus unit packages
    - [ ] Validate package and activity-map references point back to CED topic IDs and local source references where available
    - [ ] Validate practice activity map entries reference known units, periods, and problem families
    - [ ] Validate documented exceptions are consumed by the audit
- [ ] Task: Create implementation bridge artifacts
    - [ ] Create `apps/pre-calculus/curriculum/implementation/README.md`
    - [ ] Create `implementation/class-period-packages/unit-*.json`
    - [ ] Create `implementation/practice-v1/activity-map.json`
    - [ ] Create `implementation/audit/latest.json`
- [ ] Task: Create AP Precalculus problem-family planning layer
    - [ ] Create `apps/pre-calculus/curriculum/practice/README.md`
    - [ ] Create `practice/problem-family-registry.md`
    - [ ] Create `practice/course-plan-map.md`
    - [ ] Use source-backed AP topic families and mark implementation status conservatively
- [ ] Task: Run verification and update downstream planning
    - [ ] Run relevant tests and validation scripts
    - [ ] Update `measure/tracks.md` so downstream Precalculus authoring/seeding tracks depend on this track where appropriate
    - [ ] Update downstream Precalculus authoring scope to distinguish CED-defined topics from local Passwater implementation evidence
    - [ ] Record any discovered tech debt or unresolved source questions
- [ ] Task: Measure - User Manual Verification 'Implementation Bridge and Audit' (Protocol in workflow.md)
