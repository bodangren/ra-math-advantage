# Implementation Plan: Practice Worksheet Problem Set Import

## Phase 1: Source Inspection and Inventory

- [ ] Task 1.1: Inspect representative DOCX files
  - [ ] Inspect one IM1, one IM2, and one IM3 worksheet as rendered text plus DOCX package contents
  - [ ] Record the observed structure: title, example groups, mixed exercises, numbered prompts, tables, diagrams, and media
  - [ ] Document what is not present in the source, including objectives, worked steps, and answer keys

- [ ] Task 1.2: Inspect existing IM3 authored worked-example files
  - [ ] Review representative IM3 lesson files such as `module-1-lesson-1`, `module-2-lesson-1`, and `module-9-lesson-1`
  - [ ] Document the existing pattern for goals, vocabulary, Learn/Explore sections, numbered worked examples, steps, and objective alignment
  - [ ] Define how worksheet example groups should cross-reference existing authored examples

- [ ] Task 1.3: Write source inventory tests
  - [ ] Test course folder configuration for IM1, IM2, and IM3
  - [ ] Test filename parsing for `Int1_0101_practice.docx`, `Int2_1305_practice.docx`, and `Int3_0907_practice.docx`
  - [ ] Test malformed filename reporting

- [ ] Task 1.4: Implement source inventory
  - [ ] Create a non-mutating source scanner for the three OneDrive worksheet bundle folders
  - [ ] Capture file path, course, module/unit, lesson, size, modified timestamp, and checksum
  - [ ] Emit an inventory artifact or report for review

- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Markdown Catalog Template

- [ ] Task 2.1: Design the worksheet catalog format
  - [ ] Define frontmatter fields for source file, checksum, course, module/unit, lesson, review status, and extraction confidence
  - [ ] Define sections for worksheet title, example groups, mixed exercises, media references, and review notes
  - [ ] Separate source transcription from human annotations and later component-mapping notes
  - [ ] Include optional links to existing authored worked examples for the same lesson

- [ ] Task 2.2: Write template validation tests
  - [ ] Validate required source traceability fields
  - [ ] Validate example-group and problem-number structures
  - [ ] Validate media/table placeholder references

- [ ] Task 2.3: Document curriculum placement
  - [ ] Confirm IM2 and IM3 catalog paths under existing `apps/<course>/curriculum/modules/` conventions
  - [ ] Decide and document the IM1 curriculum directory structure if it does not already exist
  - [ ] Define naming conventions for worksheet-derived Markdown files

- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Assisted Pilot Conversion

- [ ] Task 3.1: Write pilot conversion tests
  - [ ] Test deterministic draft Markdown output for one IM1, one IM2, and one IM3 worksheet
  - [ ] Test that each draft references an existing source file
  - [ ] Test that unsupported diagrams, equations, and tables are flagged

- [ ] Task 3.2: Implement draft extractor
  - [ ] Extract reliable text and structural hints from DOCX files
  - [ ] Preserve example headings, problem numbers, prompts, and media references
  - [ ] Mark low-confidence math, diagrams, and lost layout explicitly

- [ ] Task 3.3: Create pilot Markdown catalogs
  - [ ] Convert one IM1 lesson worksheet into the catalog format
  - [ ] Convert one IM2 lesson worksheet into the catalog format
  - [ ] Convert one IM3 lesson worksheet into the catalog format
  - [ ] Manually compare each pilot catalog against its source worksheet

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Course-Scale Conversion

- [ ] Task 4.1: Write full-catalog validation tests
  - [ ] Validate all generated Markdown catalogs reference existing source files
  - [ ] Validate deterministic output across repeated runs
  - [ ] Validate every unsupported construct appears in the audit report

- [ ] Task 4.2: Convert supported worksheets
  - [ ] Generate draft Markdown catalogs for IM1 supported worksheets
  - [ ] Generate draft Markdown catalogs for IM2 supported worksheets
  - [ ] Generate draft Markdown catalogs for IM3 supported worksheets
  - [ ] Keep generated drafts marked as unreviewed until manually checked

- [ ] Task 4.3: Produce audit and review queue
  - [ ] Report converted file counts by course
  - [ ] Report skipped or low-confidence files by reason
  - [ ] Create a review queue for diagrams, tables, garbled math, and ambiguous classifications

- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: React Mapping Handoff

- [ ] Task 5.1: Document component-readiness mapping
  - [ ] Identify which catalog problem groups are candidates for worked examples, guided practice, and independent practice
  - [ ] Identify which groups require authored solutions before becoming worked examples
  - [ ] Identify existing activity components that can consume specific problem groups

- [ ] Task 5.2: Run automated quality gates
  - [ ] Run relevant unit tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run build`
  - [ ] Run `npx tsc --noEmit`

- [ ] Task 5.3: Prepare handoff documentation
  - [ ] Summarize extraction coverage and known gaps
  - [ ] Explain that student practice worksheets provide problem sets, not solved examples
  - [ ] Recommend follow-up tracks for solution authoring and React component implementation

- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
