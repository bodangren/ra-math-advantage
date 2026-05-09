# Implementation Plan: Skill Graph Program — Skill-Level Standards Alignment

## Phase 1: Tests and Rule Definition

- [x] **Task 1.1: Write alignment rule tests** [checkpoint: fd77286]
- [x] **Task 1.2: Document confidence rules** [checkpoint: fd77286]
  - Added to `packages/math-content/src/knowledge-space/README.md`

## Phase 2: Standards Source Loading

- [x] **Task 2.1: Load course standard definitions** [checkpoint: 0b6d7aa8]
  - Built parser in `scripts/align-standards.ts` extracting from seed_standards.ts files
  - Produces standard nodes including placeholders for missing definitions

- [x] **Task 2.2: Load lesson standards** [checkpoint: 0b6d7aa8]
  - Multi-format parser handles IM1/IM2 per-module files, IM3/PreCalc monolithic files
  - Supports `module-X-lesson-Y` and `X-Y-descriptive` slug formats

- [x] **Task 2.3: Load family/objective mappings** [checkpoint: 0b6d7aa8]
  - Parses problem-family TypeScript files for IM2, IM3, and PreCalc
  - No IM1 problem families exist (noted as tech debt)

## Phase 3: Alignment Generation

- [x] **Task 3.1: Generate IM1 standards alignment** [checkpoint: 0b6d7aa8]
  - 941 high-confidence edges, 77 missing standard definitions (placeholders created)
  - All 539 alignable nodes covered, 0 exceptions

- [x] **Task 3.2: Generate IM2 standards alignment** [checkpoint: 0b6d7aa8]
  - 938 high-confidence edges, 41 missing standard definitions (placeholders created)
  - All 549 alignable nodes covered, 0 exceptions

- [x] **Task 3.3: Generate IM3 standards alignment** [checkpoint: 0b6d7aa8]
  - 809 edges (548 high + 261 medium from family objectives), 0 missing definitions
  - All 356 alignable nodes covered, 0 exceptions

- [x] **Task 3.4: Generate PreCalc standards alignment** [checkpoint: 0b6d7aa8]
  - 294 high-confidence edges via CED topic mapping
  - All 158 alignable example nodes covered, 0 exceptions
  - 0 skills in PreCalc (only worked_examples from T3)

## Phase 4: Review Queue and Audit

- [x] **Task 4.1: Write review queue** [checkpoint: 0b6d7aa8]
  - Created `apps/<course>/curriculum/skill-graph/standards-review-queue.json` for all 4 courses
  - IM3 and PreCalc have 0 low-confidence items needing review
  - IM1 and IM2 have 0 low-confidence items (all high via lesson-standards)

- [x] **Task 4.2: Write alignment audit** [checkpoint: 0b6d7aa8]
  - Created `measure/skill-graph-standards-audit.md`
  - Includes counts per course: skills, examples, high/medium/low edges, exceptions, missing definitions
  - Acceptance criteria checklist included

## Phase 5: Verification

- [x] **Task 5.1: Validate all standard edges** [checkpoint: 0b6d7aa8]
  - All 4 courses pass `knowledge-space.v1` Zod schema validation
  - All 4 courses pass `validateKnowledgeSpace()` with no dangling edges, no duplicates
  - IM1: 724 nodes/941 edges — VALID
  - IM2: 722 nodes/938 edges — VALID
  - IM3: 565 nodes/809 edges — VALID
  - PreCalc: 252 nodes/294 edges — VALID

- [x] **Task 5.2: Run targeted tests and lint** [checkpoint: 0b6d7aa8]
  - 16 alignment unit tests pass
  - 103 total knowledge-space tests pass
  - TypeScript type check passes (`npx tsc --noEmit`)

- [x] **Task 5.3: Manual review checklist** [checkpoint: 0b6d7aa8]
  - IM3: Verified skill "1b: Find and interpret the average rate of change" maps to HSF-IF.C.7c (high, primary), HSA-SSE.B.3 (high, merged with medium family sources), HSA-REI.B.4 (medium via families), HSF-IF.A.2 (medium via families). Source evidence matches.
  - IM1: Verified skill "1a: Translate verbal descriptions" maps to 6.EE.A.2 (high, primary — placeholder definition), 6.EE.A.1 (high, secondary). Source evidence matches lesson-standards.
  - IM2: Verified skill "1b: Apply properties of circumcenters" maps to G-CO.C.9 (high, primary — placeholder) and G-GPE.B.4 (high, secondary, with definition). Source evidence matches.
  - PreCalc: Verified Example 1 in Unit 1.1 maps to HSF-IF.B.4 (high, CED topic 1.1) and HSF-BF.A.1 (high, CED topic 1.1). CED mapping matches official AP Precalculus CED.
  - All spot-checked edges match source evidence.