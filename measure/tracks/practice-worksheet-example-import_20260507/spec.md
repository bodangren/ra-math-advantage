# Track: Practice Worksheet Example Import

## Overview

Import the IM1, IM2, and IM3 Practice Worksheet Student Bundles as reviewed Markdown problem set catalogs. These worksheets are not worked-example source files: they contain problem sets grouped under labels such as "Example 1", "Examples 1 and 2", and "Mixed Exercises", with diagrams/images and many unanswered practice prompts. The import process must therefore avoid pretending that objectives, worked steps, or answers can be reliably inferred programmatically.

The durable artifact is reviewed Markdown curriculum files inside each app's `curriculum/modules/` directory, organized by `module-N-lesson-M` and faithful to the worksheet structure. Later React component props can be generated from or mapped against those reviewed Markdown catalogs.

**Course-specific strategies:**

- **IM1 (greenfield):** No curriculum files exist. Create new `module-N-lesson-M` files from scratch matching the IM3 format.
- **IM2 (restructure + amend):** Existing files use `unit-N-lesson-M` naming. Rename all to `module-N-lesson-M` for cross-course consistency, then verify content against worksheets and amend where necessary.
- **IM3 (verify + amend):** Existing `module-N-lesson-M` files are the style reference. Verify consistency against worksheets and update only where necessary.

**Source inventory:** 94 IM1 + 97 IM2 + 53 IM3 `.docx` files = 244 total worksheets.

**In-repo locations:**
- IM1: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/`
- IM2: `apps/integrated-math-2/curriculum/source-materials/practice-worksheet-student-bundle/`
- IM3: `apps/integrated-math-3/curriculum/source-materials/practice-worksheet-student-bundle/`

## Naming & Structure Standardization

All three courses must use a single consistent directory and file naming convention:

- **Directory:** `apps/<course>/curriculum/modules/`
- **Lesson files:** `module-N-lesson-M` (no file extension), where `N` = module/unit number and `M` = lesson number
- **Topic summary files:** `module-N-<topic>.md` (Markdown extension)

IM2 currently uses `unit-N-lesson-M` and `unit-N-<topic>.md`. These must be renamed to `module-*` equivalents as part of this track.

## Math Format Convention

Use the existing IM3 convention: math expressions are wrapped in `[` and `]` on their own lines (block math) or inline within paragraphs. Example:

```
[
y = ax^2 + bx + c, \quad a \ne 0
]
```

This is the canonical format across all three courses. Subagents must output math using this delimiter, not standard `$$` or `$` LaTeX.

## Source Materials

Primary source folders (all in-repo):

- IM1: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/`
- IM2: `apps/integrated-math-2/curriculum/source-materials/practice-worksheet-student-bundle/`
- IM3: `apps/integrated-math-3/curriculum/source-materials/practice-worksheet-student-bundle/`

Observed inventory:

- IM1: 94 `.docx` files named like `Int1_0101_practice.docx` (14 modules)
- IM2: 97 `.docx` files named like `Int2_0101_practice.docx` (13 modules)
- IM3: 53 `.docx` files named like `Int3_0101_practice.docx` (9 modules)

Observed worksheet pattern:

- A lesson title, for example `Graphing Quadratic Functions - Practice`
- Example-group headings, for example `Example 1`, `Examples 1 and 2`, `Example 4`
- Numbered practice problems under each group
- Mixed exercises after the example-aligned sets
- Diagrams, graphs, tables, and images that may be essential to the problem
- Usually no explicit objective list, no worked solution, and no answer key in the student bundle

## Goals

1. Preserve the worksheet problem sets as inspectable curriculum source material inside the repo.
2. Create one reviewed Markdown curriculum file per lesson, organized by `module-N-lesson-M` across all three courses.
3. Represent the worksheet's actual grouping: title, source file, example groups, mixed exercises, problem numbers, prompts, and media/table references.
4. Align worksheet problem groups to existing IM3-style authored worked examples where those lesson files exist.
5. Classify problem groups by skill/component intent only when supported by the lesson title, surrounding existing curriculum file, or human review.
6. Produce enough structure for later React component mapping without inventing objectives, worked steps, or answers that are not in the source.
7. Ensure cross-course naming consistency: all lesson files use `module-N-lesson-M` format.

## Functional Requirements

### FR-1: Source Inventory

- Record every worksheet source file for IM1, IM2, and IM3 with course, module, lesson, filename, absolute source path, modified timestamp, and checksum.
- Parse filenames such as `Int3_0604_practice.docx` into stable course/module/lesson identifiers.
- Report missing, duplicate, malformed, or nonstandard worksheet files.

### FR-2: DOCX Text Extraction

- Extract raw text and math from all 244 DOCX files using a mechanical tool (e.g., pandoc or Python-based extractor).
- Preserve math expressions in a readable format (LaTeX preferred as intermediate) so subagents can see the original mathematical content.
- Preserve structural hints: headings, paragraph breaks, numbered lists, tables.
- Store extracted text as intermediate files (e.g., `.extracted.md`) alongside source or in a temporary working directory.

### FR-3: Naming Standardization

- Rename all IM2 `unit-N-lesson-M` files to `module-N-lesson-M`.
- Rename all IM2 `unit-N-<topic>.md` files to `module-N-<topic>.md`.
- Create `apps/integrated-math-1/curriculum/modules/` directory if it does not exist.
- Verify no code references break due to renames (apps do not appear to reference curriculum file paths directly).

### FR-4: Curriculum File Format

Each `module-N-lesson-M` file must follow the IM3 template:

- **Lesson header:** `# Lesson N-M — <Title>`
- **Source reference:** `Source: (Module N, Lesson N-M, <worksheet filename>)`
- **Today's Goals:** Bullet list of what students should be able to do
- **Vocabulary:** Key terms with definitions
- **Explore section:** Inquiry-based opening activity (if present in worksheet or inferable from title)
- **Learn sections:** Concept explanations with Key Concept blocks
- **Example sections:** Numbered examples (`## Example K — <Title>`) with step-by-step reasoning
  - Each example must describe what the problem asks students to **do** (objective and process), not transcribe the exact problem text verbatim
  - Include representative math using `[` `]` delimiters
- **Mixed Exercises:** Description of the practice problem set's intent and skill coverage
- **Review Notes:** Human review annotations, unsupported constructs, or gaps

### FR-5: Manual Conversion via Subagents (Orchestrator Model)

- **No automated bulk conversion.** Each lesson is converted by a dedicated subagent that reads the extracted worksheet text and any existing curriculum file.
- **Orchestrator (this agent):** Manages the queue, launches lesson subagents, and collects results.
- **Parallelization:** All lessons within a module run in parallel as subagents.
- **Module review:** After all lessons in a module complete, a review subagent validates the entire module for consistency, completeness, and format compliance.
- **Batch size:** One module at a time per course. IM1 starts first; IM2 and IM3 may begin in parallel once IM1 pilot modules establish the pattern.

### FR-6: Problem Classification

- Classify problem groups conservatively using:
  - worksheet title
  - example-group heading
  - problem wording
  - existing curriculum lesson file
  - human review notes
- Store classifications as reviewable annotations, not as unverified source facts.
- For IM3, prefer alignment to the existing authored worked examples over fresh inference from the practice worksheet alone.

### FR-7: React Component Readiness

- Document how reviewed problem catalogs can later map to React component props.
- Identify which problem groups are candidates for worked-example, guided-practice, or independent-practice components.
- Treat actual worked solutions and guided scaffolds as follow-up authoring unless they are present in the source or explicitly created during review.

### FR-8: Quality and Verification

- Add tests for filename parsing, source inventory, template validation, and deterministic output.
- Add validation that every Markdown catalog references an existing source file.
- Add an audit report summarizing file counts, converted catalogs, unsupported worksheet constructs, and review status.

## Non-Functional Requirements

- The pipeline must not mutate source `.docx` files.
- Imported content must remain traceable and auditable.
- Avoid dependency changes unless explicitly approved.
- Generated drafts must be clearly marked until manually reviewed.
- New shared extraction utilities should live in `packages/` only if course-agnostic and reusable.
- All file naming must be consistent across IM1, IM2, and IM3 (`module-N-lesson-M`).

## Acceptance Criteria

1. Source inventory covers all 244 practice worksheet `.docx` files across IM1, IM2, and IM3.
2. All IM2 curriculum files are renamed from `unit-*` to `module-*` with no broken references.
3. IM1 `curriculum/modules/` directory exists with `module-N-lesson-M` files for all 94 lessons.
4. A Markdown catalog template exists and is validated.
5. Existing IM3 authored worked-example files are inspected and documented as the target style/alignment reference.
6. Every lesson file follows the canonical template: header, source, goals, vocabulary, explore, learn, examples, mixed exercises.
7. Math expressions use the `[` `]` delimiter convention consistently.
8. Each example describes what the problem asks students to **do** (objective and process), not verbatim problem transcription.
9. Unsupported or low-confidence worksheet constructs are flagged in review notes instead of silently converted.
10. The track documents what can and cannot be derived into React worked-example, guided-practice, and independent-practice props.
11. Relevant lint, tests, build, and `npx tsc --noEmit` checks pass before completion.

## Out of Scope

- Automatically deriving objectives, worked steps, or answer keys from student practice worksheets.
- Building final React worked-example components for every problem set.
- Editing the source worksheets.
- Authoring new math solutions for every practice problem.
- Importing AP Precalculus or Business Math worksheet sources in this track.
