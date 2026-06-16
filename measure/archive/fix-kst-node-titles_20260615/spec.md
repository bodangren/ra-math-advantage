# Specification: Fix KST Worked-Example Node Titles

## Overview

The class period plan audit (74 files, all 9 modules) found systematically fabricated example titles. Those plans are now fixed. However, the KST skill-graph nodes were generated from the *old* plans and inherit the same fabricated titles. The root cause is in the parser: `parseWorkedExamplesCell()` joins semicolon-separated individual titles into one group string, then the assembler applies that same group title to every example number in the group.

## Functional Requirements

### FR-1: Parser produces one ExtractedWorkedExample per example number with its individual title

`parseWorkedExamplesCell()` currently creates a single grouped entry:
```
{ exampleNumbers: [1,2,3], title: "Title A; Title B; Title C" }
```

It must instead create one entry per example number:
```
{ exampleNumbers: [1], title: "Title A" }
{ exampleNumbers: [2], title: "Title B" }
{ exampleNumbers: [3], title: "Title C" }
```

When the count of semicolon-separated titles does not match the count of example numbers, fall back to the current group behavior (single entry with joined title).

### FR-2: Regenerate all skill-graph node JSON files

After the parser fix, regenerate:
- `curriculum/skill-graph/nodes.json`
- `curriculum/skill-graph/draft-nodes.json`
- `curriculum/skill-graph/module-*/nodes.json` (9 files)

Each `worked_example` node must have a title matching the individual example heading from the lesson source file (e.g., "Example 1: Graph Quadratic Functions and State Domain and Range").

### FR-3: Regenerate activity-map.json

The `activity-map.json` `sourceReference` and `props.workedExamples` fields must use the corrected per-period example titles from the fixed class period plans.

### FR-4: Existing tests must pass; update fixture-dependent assertions

Parser tests in `parser.test.ts` assert against the old grouped title format. Update assertions to match the new per-example behavior while keeping the same fixture data.

## Acceptance Criteria

- `parseWorkedExamplesCell("1-1, Examples 1-3 — Title A; Title B; Title C")` returns 3 entries, each with a single-element `exampleNumbers` and its own title.
- `parseWorkedExamplesCell("1-1, Examples 1-3 — Single Title")` returns 1 entry with `exampleNumbers: [1,2,3]` and `title: "Single Title"` (fallback).
- Every `worked_example` node in `nodes.json` whose lesson source has per-example headings has a title matching that heading.
- `npm run lint` and `npx tsc --noEmit` pass in `packages/math-content`.
- Existing parser and assembler tests pass after updates.

## Out of Scope

- Changing the class period plan format (already fixed).
- Changing node IDs (they use sequential indices, not titles).
- Changing `cross-course-edges.json` (references IDs, not titles).
- Fixing the `rawText` metadata field (it correctly stores the original cell text).
