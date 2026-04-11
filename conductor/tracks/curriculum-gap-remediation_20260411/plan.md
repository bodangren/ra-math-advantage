# Implementation Plan - Curriculum Gap Remediation

## Phase 1: Audit Harness and Baseline

- [x] Task: Add repeatable curriculum audit command
    - [x] Write tests: audit detects the expected 9 modules, 52 lessons, 105 objectives, and 180 planned periods
    - [x] Write tests: audit flags heading hierarchy violations, placeholders, truncations, ALEKS count mismatches, missing phase packages, and missing non-instruction artifacts
    - [x] Implement deterministic audit script under `scripts/` or `lib/curriculum/`
    - [x] Document how to run the audit and interpret failures

- [x] Task: Capture baseline audit report
    - [x] Run the audit against the current curriculum
    - [x] Store a baseline report in the agreed curriculum audit location
    - [x] Verify the report reflects known gaps from the initial curriculum review

- [x] Task: Conductor - Phase Completion Verification 'Audit Harness and Baseline' (Protocol in workflow.md)

## Phase 2: ALEKS Extraction Repair

- [x] Task: Repair ALEKS extraction logic
    - [x] Write tests with representative ALEKS HTML snippets covering hidden or nested lesson topics
    - [x] Update `scripts/extract_aleks_module_md.py` or create a deterministic replacement extractor
    - [x] Verify declared-vs-listed topic totals can be computed by script

- [x] Task: Regenerate ALEKS module exports
    - [x] Run the extractor against `curriculum/ALEKS-practice-problems.htm`
    - [x] Update `curriculum/aleks/module-*.md`
    - [x] Update `curriculum/aleks/README.md` coverage table
    - [x] Document any unrecoverable source-export gaps explicitly

- [x] Task: Repair ALEKS references in class-period plans
    - [x] Update `curriculum/module-*-class-period-plan.md` ALEKS SRS maps using repaired topic IDs
    - [x] Replace avoidable `No direct ALEKS topic exported` rows with aligned topic references
    - [x] Preserve worked-example-derived SRS substitutes where no ALEKS topic genuinely aligns

- [x] Task: Conductor - Phase Completion Verification 'ALEKS Extraction Repair' (Protocol in workflow.md)

## Phase 3: Lesson Source Quality Repairs

- [x] Task: Resolve known online-only example placeholders
    - [x] Write audit expectation: no unresolved online-only placeholders remain without an exception record
    - [x] Repair `curriculum/modules/module-1-lesson-5` Example 6
    - [x] Repair `curriculum/modules/module-2-lesson-3` Example 6
    - [x] Repair `curriculum/modules/module-4-lesson-1` Example 3
    - [x] Update affected objective alignment notes and class-period plan notes if needed

- [x] Task: Fix known truncations and malformed prompts
    - [x] Write audit expectation: known truncated line patterns are rejected
    - [x] Fix truncated CAP reflection in `curriculum/modules/module-1-lesson-6`
    - [x] Scan all lesson files for similar malformed endings and repair or record exceptions

- [x] Task: Normalize lesson heading hierarchy
    - [x] Write tests: each lesson source file has exactly one top-level `#` heading
    - [x] Write tests: examples, steps, parts, key concepts, study tips, and watch-outs use allowed heading levels
    - [x] Repair all Module 5 lesson heading violations
    - [x] Audit and repair remaining lesson heading issues across Modules 1-9

- [x] Task: Conductor - Phase Completion Verification 'Lesson Source Quality Repairs' (Protocol in workflow.md)

## Phase 4: Instruction Day Phase Packages

- [x] Task: Define phase-package schema and location
    - [x] Write tests or schema validation for required fields
    - [x] Document the file layout and naming convention
    - [x] Implement schema validation in the curriculum audit

- [x] Task: Author phase packages for Modules 1-3
    - [x] Create packages for all Module 1 instruction periods
    - [x] Create packages for all Module 2 instruction periods
    - [x] Create packages for all Module 3 instruction periods
    - [x] Verify objective, source lesson, worked examples, ALEKS/SRS, assessment, and CAP/closing fields

- [x] Task: Author phase packages for Modules 4-6
    - [x] Create packages for all Module 4 instruction periods
    - [x] Create packages for all Module 5 instruction periods
    - [x] Create packages for all Module 6 instruction periods
    - [x] Verify objective, source lesson, worked examples, ALEKS/SRS, assessment, and CAP/closing fields

- [x] Task: Author phase packages for Modules 7-9
    - [x] Create packages for all Module 7 instruction periods
    - [x] Create packages for all Module 8 instruction periods
    - [x] Create packages for all Module 9 instruction periods
    - [x] Verify objective, source lesson, worked examples, ALEKS/SRS, assessment, and CAP/closing fields

- [x] Task: Conductor - Phase Completion Verification 'Instruction Day Phase Packages' (Protocol in workflow.md)

## Phase 5: Non-Instruction Day Curriculum Artifacts

- [x] Task: Define non-instruction artifact schema and location
    - [x] Write tests or schema validation for mastery, jigsaw, review, and test artifact types
    - [x] Document the file layout and naming convention
    - [x] Implement schema validation in the curriculum audit

- [x] Task: Author mastery day artifacts
    - [x] Create all 36 mastery day artifacts
    - [x] Include objective scope, SRS sources, remediation grouping, extension options, and evidence requirements
    - [x] Verify mastery artifacts draw from worked-example-derived practice, ALEKS topics, and spiral review where applicable

- [x] Task: Author jigsaw day artifacts
    - [x] Create all 18 jigsaw/group-work artifacts
    - [x] Include group task, source worked examples, deliverable, facilitation notes, and rubric/completion criteria

- [x] Task: Author review and test day artifacts
    - [x] Create all 9 review artifacts
    - [x] Create all 9 test artifacts
    - [x] Include objective coverage, assessment structure, misconception targets, grading expectations, and retake/remediation relationship

- [x] Task: Conductor - Phase Completion Verification 'Non-Instruction Day Curriculum Artifacts' (Protocol in workflow.md)

## Phase 6: `practice.v1` Activity Mapping

- [x] Task: Define activity mapping schema
    - [x] Write tests or schema validation for stable IDs, source references, component keys, modes, objective codes, props, grading config, and SRS eligibility
    - [x] Document approved component keys and proposed-key workflow
    - [x] Implement mapping validation in the curriculum audit

- [x] Task: Map instruction day activities
    - [x] Create `practice.v1` mappings for all worked examples
    - [x] Create mappings for guided practice, independent practice, and exit-ticket/assessment items
    - [x] Link each mapping to objective codes and source references

- [x] Task: Map ALEKS and SRS practice
    - [x] Create mappings for every listed ALEKS topic used by class-period plans
    - [x] Create mappings for worked-example-derived SRS substitutes
    - [x] Mark SRS eligibility and intended proficiency evidence for each item

- [x] Task: Map non-instruction day activities
    - [x] Create mappings for mastery artifacts
    - [x] Create mappings for jigsaw artifacts
    - [x] Create mappings for review and test artifacts
    - [x] Document any required component-key gaps

- [x] Task: Conductor - Phase Completion Verification '`practice.v1` Activity Mapping' (Protocol in workflow.md)

## Phase 7: Documentation, Final Audit, and Handoff

- [x] Task: Synchronize curriculum documentation
    - [x] Update `curriculum/README.md`
    - [x] Update `curriculum/course-spec.md`
    - [x] Update `curriculum/aleks/README.md`
    - [x] Add dependency notes for downstream curriculum seed tracks where needed

- [x] Task: Run final automated verification
    - [x] Run curriculum audit and confirm all required checks pass or have documented exceptions
    - [x] Run relevant unit tests for audit, extraction, and mapping validation
    - [x] Run `npm run lint`

- [x] Task: Produce final remediation report
    - [x] Summarize remaining documented exceptions, if any
    - [x] Summarize generated artifacts and stable ID conventions
    - [x] Identify next implementation tracks unlocked by the remediation

- [x] Task: Conductor - Phase Completion Verification 'Documentation, Final Audit, and Handoff' (Protocol in workflow.md)

