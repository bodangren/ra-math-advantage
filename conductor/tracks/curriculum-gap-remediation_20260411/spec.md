# Specification - Curriculum Gap Remediation

## Context

The curriculum audit found that `curriculum/` is structurally complete but not yet classroom/app-production complete.

The strongest layer is the course skeleton:

- 9 modules and 52 textbook lesson source files exist.
- `conductor/course-objectives.md` defines 105 objectives.
- `curriculum/module-*-class-period-plan.md` files total 180 planned periods:
  - 108 instruction
  - 36 mastery
  - 18 jigsaw/group-work
  - 9 review
  - 9 test

The gaps are concentrated in content readiness and implementation readiness:

- ALEKS extraction is incomplete for 7 of 9 module exports.
- Three lesson files preserve online-only examples as placeholders.
- Some lesson files violate the heading hierarchy required by `curriculum/course-spec.md`.
- At least one lesson prompt is visibly truncated.
- The stated daily instructional routine is not consistently authored across lessons.
- Non-instruction days are allocated but not authored.
- Curriculum content is not yet mapped into concrete `practice.v1` activities for app seeding.

This track remediates those gaps and establishes repeatable checks so future curriculum edits do not regress completeness.

## Functional Requirements

### 1. Curriculum Audit Baseline and Verification

1. Create a repeatable curriculum audit check that can verify:
   - lesson count by module
   - objective count and objective coverage
   - class-period budget totals by day type
   - lesson heading hierarchy compliance
   - known placeholder and truncation markers
   - ALEKS declared-vs-listed topic counts
   - presence of daily routine artifacts or phase-package artifacts
   - presence of non-instruction day artifacts
   - presence of `practice.v1` activity mapping artifacts

2. Add a machine-readable or structured audit output that can be compared before and after remediation.

3. Document the expected audit thresholds in the track verification notes or a curriculum audit README.

### 2. ALEKS Extraction Repair

1. Repair `scripts/extract_aleks_module_md.py` or add a replacement extraction utility so all visible ALEKS topics in `curriculum/ALEKS-practice-problems.htm` are captured.

2. Regenerate the ALEKS module markdown files under `curriculum/aleks/`.

3. Resolve declared-vs-listed extraction gaps for:
   - Module 2: 23 declared, 13 currently listed
   - Module 3: 30 declared, 4 currently listed
   - Module 4: 92 declared, 88 currently listed
   - Module 5: 59 declared, 43 currently listed
   - Module 6: 29 declared, 21 currently listed
   - Module 7: 86 declared, 82 currently listed
   - Module 9: 45 declared, 31 currently listed

4. Keep stable ALEKS IDs in the existing format, such as `ALEKS M1-L1-1.01`.

5. Update every affected `curriculum/module-*-class-period-plan.md` ALEKS SRS map so each instruction period references repaired ALEKS topics where available.

6. If a declared topic cannot be recovered from the source export, document it explicitly with the reason and a replacement worked-example-derived SRS plan.

### 3. Lesson Source Quality Repairs

1. Resolve online-only example placeholders in:
   - `curriculum/modules/module-1-lesson-5`
   - `curriculum/modules/module-2-lesson-3`
   - `curriculum/modules/module-4-lesson-1`

2. If exact online-only source text is unavailable, author a replacement example that:
   - preserves the original numbering
   - matches the surrounding objective
   - includes worked steps
   - is clearly marked as a local replacement, not textbook text

3. Fix the truncated CAP reflection in `curriculum/modules/module-1-lesson-6`.

4. Normalize lesson heading hierarchy across all 52 lesson source files according to `curriculum/course-spec.md`:
   - `#` is used only for the lesson title.
   - `##` is used for major sections.
   - `###` is used for parts, steps, study tips, watch-outs, and key concepts.
   - `####` is used only for nested substeps.

5. Preserve lesson titles, example numbering, objective alignment, and class-period plan references while repairing structure.

### 4. Daily Phase Packaging

1. Define a canonical authoring format for class-period phase packages, aligned with the app phase model:
   - warm-up or hook
   - concept development
   - guided practice
   - independent practice
   - in-class assessment
   - CAP reflection or closing

2. Author phase-package artifacts for all 108 instruction periods.

3. Each instruction period package must include:
   - `day_type`
   - module number
   - class-period number
   - source textbook lesson
   - class objective code and objective text
   - worked-example references
   - ALEKS SRS references where available
   - practice/activity candidates
   - assessment or exit-ticket prompt
   - CAP reflection or closing prompt

4. Ensure phase-package artifacts stay aligned with:
   - `conductor/course-objectives.md`
   - `curriculum/modules/module-*-lesson-*`
   - `curriculum/module-*-class-period-plan.md`
   - `curriculum/aleks/module-*.md`

### 5. Non-Instruction Day Authoring

1. Author curriculum artifacts for all 72 non-instruction days:
   - 36 mastery days
   - 18 jigsaw/group-work days
   - 9 review days
   - 9 test days

2. Mastery day artifacts must define:
   - objective scope
   - due SRS item sources
   - remediation groupings
   - extension options
   - evidence students submit or complete

3. Jigsaw day artifacts must define:
   - group task
   - source worked examples used to build the stretch problem
   - student deliverable
   - teacher facilitation notes
   - rubric or completion criteria

4. Review day artifacts must define:
   - objective coverage
   - review activities
   - misconception targets
   - readiness check

5. Test day artifacts must define:
   - objective coverage
   - assessment structure
   - grading or review expectations
   - retake/remediation relationship

### 6. `practice.v1` Activity Mapping

1. Create a curriculum-to-activity mapping artifact that translates:
   - worked examples
   - guided practice
   - independent practice
   - ALEKS SRS topics
   - mastery tasks
   - jigsaw tasks
   - reviews and tests

   into `practice.v1`-compatible activity definitions.

2. Each mapped activity must include:
   - stable activity identifier
   - source curriculum reference
   - `componentKey`
   - mode
   - standard/objective code
   - props summary or full props object
   - grading configuration
   - SRS eligibility

3. Use existing or planned component keys from `conductor/practice-component-contract.md`.

4. Do not port business-domain components from `bus-math-v2`.

5. If a required activity type does not have a component key, document the gap and propose the smallest component key addition needed.

### 7. Documentation Synchronization

1. Update curriculum documentation so the source of truth is clear:
   - course specification
   - ALEKS README
   - class-period plan conventions
   - phase-package location and schema
   - activity mapping location and schema

2. Record any remaining known gaps as explicit tech debt or curriculum debt, not implicit placeholders.

3. Ensure downstream tracks, especially Module 1 seeding, have clear dependency notes if this track changes content or naming conventions.

## Non-Functional Requirements

1. All generated or repaired curriculum markdown should remain readable in plain text.
2. Stable IDs must not change unless a migration note is included.
3. Existing class-period period numbers must remain stable unless the plan is updated in the same commit.
4. No dependency changes are allowed without explicit approval.
5. Scripts must be deterministic and safe to rerun.
6. Validation should be automated where practical.
7. Curriculum repairs must avoid copying unavailable copyrighted online-only textbook text; locally authored replacements should be original.

## Acceptance Criteria

1. The audit check reports 9 modules and 52 lesson source files.
2. The audit check reports 180 planned class periods with exactly:
   - 108 instruction
   - 36 mastery
   - 18 jigsaw
   - 9 review
   - 9 test
3. All 52 lesson source files pass heading hierarchy checks.
4. All 52 lesson source files have `Today's Goal(s)` and `Objective Alignment`.
5. No lesson source file contains unresolved `Online Extra Example`, `online-only`, `placeholder preserves`, or visibly truncated text unless an explicit exception record exists.
6. ALEKS declared-vs-listed topic counts match for every module, or every unrecoverable mismatch is documented with an explicit source limitation and replacement SRS plan.
7. Every instruction period has a phase-package artifact with objective, source lesson, worked examples, assessment, and closing/CAP content.
8. Every instruction period has ALEKS SRS references or an explicit worked-example-derived SRS substitute.
9. All 72 non-instruction periods have authored artifacts.
10. A `practice.v1` mapping exists for all instruction, mastery, jigsaw, review, and test activity candidates.
11. Activity mappings use stable IDs and approved component keys or documented proposed keys.
12. `npm run lint` passes.
13. Relevant tests for audit scripts, extraction, and mapping validation pass.
14. Conductor docs and curriculum docs are synchronized with the final artifact layout.

## Out of Scope

1. Implementing every frontend activity component named in `practice.v1` mappings.
2. Seeding every curriculum artifact into Convex unless this is explicitly added to the plan during implementation.
3. Changing the product scope or tech stack.
4. Pulling new external textbook content unless the user provides it or explicitly authorizes retrieval from an allowed source.

