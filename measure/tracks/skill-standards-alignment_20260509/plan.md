# Implementation Plan: Skill Graph Program — Skill-Level Standards Alignment

## Phase 1: Tests and Rule Definition

- [ ] **Task 1.1: Write alignment rule tests**
  - Fixture: skill in lesson with exact lesson-standard mapping.
  - Fixture: skill mapped through problem family objective IDs.
  - Fixture: PreCalc skill mapped through CED topic objective.
  - Fixture: missing standard produces exception.

- [ ] **Task 1.2: Document confidence rules**
  - Add `apps/<course>/curriculum/skill-graph/README.md` or shared docs explaining high/medium/low confidence.

## Phase 2: Standards Source Loading

- [ ] **Task 2.1: Load course standard definitions**
  - Build a parser for app seed standards or consume exported standard arrays where available.
  - Produce standard nodes if not already present.

- [ ] **Task 2.2: Load lesson standards**
  - Parse lesson-standard seed files.
  - Normalize old lesson slugs and module naming where needed.

- [ ] **Task 2.3: Load family/objective mappings**
  - Read `packages/math-content/src/problem-families/**`.
  - Read curriculum problem-family registries where package data is stale or incomplete.

## Phase 3: Alignment Generation

- [ ] **Task 3.1: Generate IM1 standards alignment**
  - Note that IM1 standards seed state is incomplete.
  - Produce high-confidence edges where lesson standards exist.
  - Produce exceptions for missing modules/standards.

- [ ] **Task 3.2: Generate IM2 standards alignment**
  - Prefer current module-based worksheet catalogs over stale unit-only artifacts.
  - Reconcile old `unit` standard mappings only when the lesson title/source clearly matches.

- [ ] **Task 3.3: Generate IM3 standards alignment**
  - Use current IM3 seed standards and lesson standards.
  - Use ALEKS/problem-family mappings for medium-confidence narrowing.

- [ ] **Task 3.4: Generate PreCalc standards alignment**
  - Use CED topic/learning-objective evidence first.
  - Use Passwater only for instructional scaffolding, not official standards text.
  - Keep Unit 4 source limitations explicit.

## Phase 4: Review Queue and Audit

- [ ] **Task 4.1: Write review queue**
  - Create `apps/<course>/curriculum/skill-graph/standards-review-queue.json`.
  - Include low-confidence edges and missing mappings.

- [ ] **Task 4.2: Write alignment audit**
  - Create `measure/skill-graph-standards-audit.md`.
  - Include counts by course:
    - skills
    - high/medium/low confidence edges
    - exceptions
    - missing standard definitions

## Phase 5: Verification

- [ ] **Task 5.1: Validate all standard edges**
  - Use `knowledge-space.v1` validation.
  - Assert no dangling source/target node IDs.

- [ ] **Task 5.2: Run targeted tests and lint**
  - Run tests for alignment rules and parsers.

- [ ] **Task 5.3: Manual review checklist**
  - Pick at least 5 skills per course.
  - Confirm standard edges match source evidence.
  - Record findings in the audit.
