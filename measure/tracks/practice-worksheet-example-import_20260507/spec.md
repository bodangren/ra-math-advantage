# Track: Practice Worksheet Problem Set Import

## Overview

Import the IM1, IM2, and IM3 Practice Worksheet Student Bundles as source-grounded practice problem set catalogs. These worksheets are not worked-example source files: inspection of `Int3_0101_practice.docx` and `Int2_0101_practice.docx` shows problem sets grouped under labels such as "Example 1", "Examples 1 and 2", and "Mixed Exercises", with diagrams/images and many unanswered practice prompts. The import process must therefore avoid pretending that objectives, worked steps, or answers can be reliably inferred programmatically.

The first durable artifact should be reviewed Markdown in the app curriculum areas, organized by course/module/lesson and faithful to the worksheet structure. Later React component props can be generated from or mapped against those reviewed Markdown catalogs.

For IM3, the existing curriculum lesson files already contain authored worked-example descriptions from the full lesson source material. Those files are the style and alignment reference for this track. For example, `apps/integrated-math-3/curriculum/modules/module-1-lesson-1`, `module-2-lesson-1`, and `module-9-lesson-1` use a consistent pattern: Today’s Goals, Vocabulary, Learn/Explore sections, numbered worked examples, step-by-step reasoning, and objective alignment where available.

## Source Materials

Primary source folders:

- IM1: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM1 Resources/Integrated Math I Practice Worksheet Student Bundle`
- IM2: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM2 Resources/Integrated Math II  Practice Worksheet Student Bundle`
- IM3: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM3 Resources/Integrated Math III  Practice Worksheet Student Bundle`

Observed inventory:

- IM1: 93 `.docx` files named like `Int1_0101_practice.docx`
- IM2: 96 `.docx` files named like `Int2_0101_practice.docx`
- IM3: 52 `.docx` files named like `Int3_0101_practice.docx`

Observed worksheet pattern:

- A lesson title, for example `Graphing Quadratic Functions - Practice`
- Example-group headings, for example `Example 1`, `Examples 1 and 2`, `Example 4`
- Numbered practice problems under each group
- Mixed exercises after the example-aligned sets
- Diagrams, graphs, tables, and images that may be essential to the problem
- Usually no explicit objective list, no worked solution, and no answer key in the student bundle

## Goals

1. Preserve the worksheet problem sets as inspectable curriculum source material inside the repo.
2. Create one reviewed Markdown catalog per lesson, or an equivalent course-local Markdown organization that matches each app's curriculum conventions.
3. Represent the worksheet's actual grouping: title, source file, example groups, mixed exercises, problem numbers, prompts, and media/table references.
4. Align worksheet problem groups to existing IM3-style authored worked examples where those lesson files exist.
5. Classify problem groups by skill/component intent only when supported by the lesson title, surrounding existing curriculum file, or human review.
6. Produce enough structure for later React component mapping without inventing objectives, worked steps, or answers that are not in the source.

## Functional Requirements

### FR-1: Source Inventory

- Record every worksheet source file for IM1, IM2, and IM3 with course, module/unit, lesson, filename, absolute source path, modified timestamp, and checksum.
- Parse filenames such as `Int3_0604_practice.docx` into stable course/module/lesson identifiers.
- Report missing, duplicate, malformed, or nonstandard worksheet files.

### FR-2: Worksheet Inspection and Template

- Inspect representative worksheet files before designing conversion rules.
- Inspect the existing IM3 authored worked-example Markdown files before designing the catalog annotations.
- Define a Markdown template for worksheet catalogs that includes:
  - source file and checksum
  - worksheet title
  - course/module/lesson mapping
  - example-group sections
  - numbered problems
  - mixed exercise sections
  - table/image/diagram placeholders with source media references
  - review notes and unsupported constructs
- The template must distinguish source text from later human annotations.

### FR-3: Markdown Catalog Output

- Create reviewed Markdown files in the relevant course curriculum areas.
- IM2 and IM3 should follow existing `apps/<course>/curriculum/modules/...` conventions.
- IM1 may require adding a curriculum directory structure if none exists yet.
- Markdown catalogs should be the human-reviewable source of truth for this track.
- For IM3, worksheet catalogs should cross-reference the existing lesson worked-example sections when example-group labels correspond to authored examples.

### FR-4: Assisted Extraction, Not Blind Automation

- Use DOCX text/XML/media extraction to draft Markdown where it is reliable.
- Do not automatically infer objectives, worked steps, answers, or React props from raw worksheet text.
- Flag diagrams, tables, missing equations, garbled math, and low-confidence extraction for manual review.

### FR-5: Problem Classification

- Classify problem groups conservatively using:
  - worksheet title
  - example-group heading
  - problem wording
  - existing curriculum lesson file
  - human review notes
- Store classifications as reviewable annotations, not as unverified source facts.
- For IM3, prefer alignment to the existing authored worked examples over fresh inference from the practice worksheet alone.

### FR-6: React Component Readiness

- Document how reviewed problem catalogs can later map to React component props.
- Identify which problem groups are candidates for worked-example, guided-practice, or independent-practice components.
- Treat actual worked solutions and guided scaffolds as follow-up authoring unless they are present in the source or explicitly created during review.

### FR-7: Quality and Verification

- Add tests for filename parsing, source inventory, template validation, and deterministic draft output.
- Add validation that every Markdown catalog references an existing source file.
- Add an audit report summarizing file counts, converted catalogs, unsupported worksheet constructs, and review status.

## Non-Functional Requirements

- The pipeline must not mutate OneDrive source files.
- Imported content must remain traceable and auditable.
- Avoid dependency changes unless explicitly approved.
- Generated drafts must be clearly marked until manually reviewed.
- New shared extraction utilities should live in `packages/` only if course-agnostic and reusable.

## Acceptance Criteria

1. Source inventory covers all 241 observed practice worksheet `.docx` files across IM1, IM2, and IM3.
2. At least one representative worksheet from each course has been manually inspected and documented before full conversion.
3. A Markdown catalog template exists and is validated.
4. Existing IM3 authored worked-example files are inspected and documented as the target style/alignment reference.
5. Pilot Markdown catalogs are created for at least one IM1, one IM2, and one IM3 lesson.
6. Pilot catalogs preserve worksheet problem grouping and source traceability.
7. Unsupported or low-confidence worksheet constructs are flagged instead of silently converted.
8. The track documents what can and cannot be derived into React worked-example, guided-practice, and independent-practice props.
9. Relevant lint, tests, build, and `npx tsc --noEmit` checks pass before completion.

## Out of Scope

- Automatically deriving objectives, worked steps, or answer keys from student practice worksheets.
- Building final React worked-example components for every problem set.
- Editing the OneDrive source worksheets.
- Authoring new math solutions for every practice problem.
- Importing AP Precalculus or Business Math worksheet sources in this track.
