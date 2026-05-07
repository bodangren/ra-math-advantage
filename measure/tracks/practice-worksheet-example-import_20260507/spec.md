# Track: Practice Worksheet Example Import

## Overview

Import the IM1, IM2, and IM3 Practice Worksheet Student Bundles from the synced OneDrive curriculum archive into structured source-grounded example descriptions. The descriptions must be detailed enough to author reusable React worked-example components whose rendering mode can shift between fully worked examples, guided practice, and independent practice through props.

## Source Materials

Primary source folders:

- IM1: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM1 Resources/Integrated Math I Practice Worksheet Student Bundle`
- IM2: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM2 Resources/Integrated Math II  Practice Worksheet Student Bundle`
- IM3: `/Users/daniel.bodanske/OneDrive - Beijing Kaiwen Academy/Math Department/AP Track/IM3 Resources/Integrated Math III  Practice Worksheet Student Bundle`

Observed inventory:

- IM1: 93 `.docx` files named like `Int1_0101_practice.docx`
- IM2: 96 `.docx` files named like `Int2_0101_practice.docx`
- IM3: 52 `.docx` files named like `Int3_0101_practice.docx`

## Goals

1. Preserve worksheet-derived objectives and examples as verifiable source-grounded curriculum data.
2. Produce a normalized example schema that can map each course/module/lesson/example to objectives, prompts, worked steps, answer forms, mathematical representations, and practice variants.
3. Establish a conversion pipeline that can be audited against the original `.docx` files and rerun deterministically.
4. Connect the imported descriptions to existing package boundaries, especially `@math-platform/math-content`, `@math-platform/activity-components`, and the `practice.v1` contract.

## Functional Requirements

### FR-1: Source Inventory

- Record every worksheet source file for IM1, IM2, and IM3 with course, module, lesson, filename, absolute source path, modified timestamp, and checksum.
- Parse filenames such as `Int3_0604_practice.docx` into stable course/module/lesson identifiers.
- Report missing, duplicate, malformed, or nonstandard worksheet files.

### FR-2: DOCX Extraction

- Extract worksheet text, tables, ordered examples, math expressions, images or diagrams metadata, and visible section labels from `.docx` files.
- Preserve enough source-location context to trace each generated description back to a source file and, where practical, a paragraph/table index.
- Avoid ad hoc string-only parsing when structured DOCX/XML data is available.

### FR-3: Example Description Schema

- Define a typed schema for imported examples that includes:
  - `courseId`, `moduleNumber`, `lessonNumber`, `sourceFile`, and stable `exampleId`
  - objective or skill statement
  - student-facing prompt
  - mathematical givens and constraints
  - worked solution steps with rationales
  - final answer and accepted equivalent forms when applicable
  - representation type, such as algebraic, graphical, tabular, geometric, statistical, or verbal
  - component intent, such as worked example, guided practice, or independent practice
  - source confidence and review status
- Keep the schema compatible with future React component props and the existing `practice.v1` contract.

### FR-4: Conversion Pipeline

- Build a repeatable pipeline that converts source worksheets into structured JSON or TypeScript content artifacts.
- The pipeline must support course-scoped and lesson-scoped runs for incremental review.
- Generated artifacts must be stable across repeated runs when the source files do not change.

### FR-5: Pilot Import and Human Review

- Run a pilot conversion across a small representative sample before processing all files:
  - one IM1 lesson
  - one IM2 lesson
  - one IM3 lesson
- Compare extracted examples against the source worksheets and record extraction gaps.
- Refine the schema and extraction rules before full import.

### FR-6: React Component Readiness

- Document how imported example descriptions map to reusable React component props.
- Identify which current activity components can consume the data directly and which example/component types need follow-up implementation.
- Treat fully worked, guided, and independent modes as different render modes of the same underlying example data where possible.

### FR-7: Quality and Verification

- Add tests for filename parsing, source inventory, DOCX extraction fixtures, schema validation, and deterministic output.
- Add validation that every generated example references an existing source file.
- Add an audit report summarizing file counts, extracted example counts, uncertain examples, and unsupported worksheet constructs.

## Non-Functional Requirements

- The pipeline must not mutate the OneDrive source files.
- Source-derived content must remain traceable and auditable.
- New shared code should live in `packages/` when course-agnostic, not inside a single app.
- Generated or imported curriculum artifacts should follow existing monorepo package and app boundaries.
- No dependency changes without explicit approval.

## Acceptance Criteria

1. Source inventory covers all 241 observed practice worksheet `.docx` files across IM1, IM2, and IM3.
2. Filename parsing maps every standard worksheet into course/module/lesson identifiers.
3. A typed example-description schema exists with validation tests.
4. A pilot conversion produces reviewed structured examples for at least one lesson from each of IM1, IM2, and IM3.
5. The pipeline emits stable artifacts and an audit report.
6. Unsupported or low-confidence worksheet constructs are flagged instead of silently dropped.
7. Documentation explains how descriptions become React worked-example, guided-practice, and independent-practice props.
8. Relevant lint, tests, build, and `npx tsc --noEmit` checks pass before completion.

## Out of Scope

- Building every final React worked-example component for all imported examples.
- Editing the OneDrive source worksheets.
- Authoring new math content not present in the source worksheets.
- Importing AP Precalculus or Business Math worksheet sources in this track.
- Changing production lesson sequencing without a separate curriculum-authoring task.
