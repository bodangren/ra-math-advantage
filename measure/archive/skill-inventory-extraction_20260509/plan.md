# Implementation Plan: Skill Graph Program — Skill Inventory Extraction

## Phase 1: Tests and Fixtures

- [x] **Task 1.1: Add parser fixture tests** [817cdfe]
  - Test valid math IDs for skill, worked_example, lesson, module, course, and standard kinds.
  - Test malformed IDs (missing course, wrong domain prefix, invalid module/lesson padding).
  - Use small markdown fixtures that include:
    - lesson title
    - source line
    - multiple `## Example` headings
    - combined headings such as `## Examples 5 and 6`
    - mixed exercises
  - Assert expected draft node IDs and source references.

- [x] **Task 1.2: Add deterministic output test** [817cdfe]
  - Run extraction twice against the same fixture.
  - Assert identical JSON output.

- [x] **Task 1.3: Add duplicate-ID test** [817cdfe]
  - Create fixture headings that would collide.
  - Assert extractor appends deterministic disambiguators or raises an audit exception.

## Phase 2: Extraction Utilities

- [x] **Task 2.1: Implement markdown heading parser** [817cdfe]
  - Parse H1 lesson titles and H2/H3 sections.
  - Record section start line, heading text, and body excerpt.

- [x] **Task 2.2: Use math adapter ID constructors** [817cdfe]
  - Import ID constructors from `packages/math-content/src/knowledge-space/ids.ts` (delivered by `skill-math-adapter_20260509`).
  - Produce IDs in the canonical math domain shape, e.g.:
    - `math.im3.example.m01.l01.e03`
    - `math.im3.skill.m01.l01.graph-quadratic-from-table`
  - Do not redefine ID rules in this track.

- [x] **Task 2.3: Implement course adapters** [61f8be0]
  - IM1/IM2/IM3 adapter: read flat `module-*-lesson-*` files.
  - PreCalc adapter: read CED/Passwater source-backed lesson/topic files and module lesson files where present.

## Phase 3: Inventory Generation

- [x] **Task 3.1: Generate IM1 draft inventory** [26048b8]
  - Read all IM1 lesson catalogs.
  - Write `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`.
  - Record lessons without examples.

- [x] **Task 3.2: Generate IM2 draft inventory** [26048b8]
- [x] **Task 3.3: Generate IM3 draft inventory** [26048b8]
- [x] **Task 3.4: Generate PreCalc draft inventory** [26048b8]
- [x] **Task 4.1: Write inventory audit report** [26048b8]
- [x] **Task 4.2: Add validation command** [61f8be0]
- [x] **Task 5.1: Run targeted tests** [672b9bf]
- [x] **Task 5.2: Run lint/typecheck for touched package/scripts** [61f8be0]
- [x] **Task 5.3: Confirm source files unchanged** [61f8be0]
  - Run `git diff --name-only` and verify curriculum source catalogs were not modified.

## Phase: Review Fixes

- [x] **Task R.1: Add always-present Exceptions section to audit report** [$SHA]
  - Replace conditional duplicate-IDs and missing-source-refs blocks with an always-written Exceptions section so readers confirm each check ran and found nothing, not that it was skipped.

- [x] **Task R.2: Add standalone schema-validation script** [$SHA]
  - Create `scripts/validate-skill-inventory.ts` that reads committed `draft-nodes.json` files and validates each node through `knowledgeSpaceNodeSchema.safeParse()`. Exits non-zero on failure.
  - Update `validate-inventory` npm script in `packages/math-content/package.json` to call this validator instead of the audit-only extraction re-run.
