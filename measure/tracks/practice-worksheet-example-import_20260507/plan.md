# Implementation Plan: Practice Worksheet Example Import

## Phase 1: Source Inventory and Extraction Spike

- [ ] Task 1.1: Write source inventory tests
  - [ ] Test course folder configuration for IM1, IM2, and IM3
  - [ ] Test filename parsing for `Int1_0101_practice.docx`, `Int2_1305_practice.docx`, and `Int3_0907_practice.docx`
  - [ ] Test malformed filename reporting

- [ ] Task 1.2: Implement source inventory
  - [ ] Create a non-mutating source scanner for the three OneDrive worksheet bundle folders
  - [ ] Capture file path, course, module, lesson, size, modified timestamp, and checksum
  - [ ] Emit an inventory artifact or report for review

- [ ] Task 1.3: Spike structured DOCX extraction
  - [ ] Select one representative worksheet from each course
  - [ ] Extract paragraphs, tables, numbering, math-bearing text, and media references using structured DOCX/XML APIs
  - [ ] Document extraction limitations for equations, diagrams, and tables

- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Example Description Schema

- [ ] Task 2.1: Write schema validation tests
  - [ ] Validate required source traceability fields
  - [ ] Validate worked-step, prompt, answer, and objective structures
  - [ ] Validate render-mode compatibility for worked, guided, and independent practice

- [ ] Task 2.2: Define typed example-description schema
  - [ ] Add TypeScript types and runtime validation in the appropriate shared package
  - [ ] Include confidence, review status, and unsupported-construct fields
  - [ ] Ensure compatibility with `practice.v1` and future React props

- [ ] Task 2.3: Document component prop mapping
  - [ ] Map example schema fields to worked-example rendering props
  - [ ] Map the same source data to guided-practice and independent-practice modes
  - [ ] Identify current component coverage and gaps

- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Pilot Conversion

- [ ] Task 3.1: Write pilot conversion tests
  - [ ] Test deterministic output for one IM1, one IM2, and one IM3 worksheet
  - [ ] Test that generated examples reference existing source files
  - [ ] Test that low-confidence extraction is flagged

- [ ] Task 3.2: Implement pilot converter
  - [ ] Convert selected lesson worksheets into structured example descriptions
  - [ ] Preserve objective, prompt, worked steps, answer, and source traceability where available
  - [ ] Emit reviewable artifacts without changing production curriculum data

- [ ] Task 3.3: Review pilot output against source worksheets
  - [ ] Compare extracted examples to original worksheet contents
  - [ ] Record missing fields, unsupported math constructs, and schema adjustments
  - [ ] Update schema or extraction rules based on pilot findings

- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Full Course Import and Audit

- [ ] Task 4.1: Write full-import validation tests
  - [ ] Validate all generated examples against the schema
  - [ ] Validate every generated source reference exists
  - [ ] Validate deterministic output across repeated runs

- [ ] Task 4.2: Run conversion across IM1, IM2, and IM3
  - [ ] Generate structured example artifacts for all supported worksheets
  - [ ] Produce per-course and aggregate audit reports
  - [ ] Flag unsupported or low-confidence examples for manual follow-up

- [ ] Task 4.3: Integrate generated artifacts with repo conventions
  - [ ] Place generated or curated artifacts under the appropriate package/app boundary
  - [ ] Add documentation for rerunning the import
  - [ ] Confirm no source worksheet files are modified

- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Verification and Handoff

- [ ] Task 5.1: Run automated quality gates
  - [ ] Run relevant unit tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run build`
  - [ ] Run `npx tsc --noEmit`

- [ ] Task 5.2: Prepare handoff documentation
  - [ ] Summarize extraction coverage and known gaps
  - [ ] Document how example descriptions become React props
  - [ ] Add follow-up track recommendations for component gaps or manual content review

- [ ] Task: Measure - User Manual Verification 'Phase 5' (Protocol in workflow.md)
