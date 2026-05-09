# Implementation Plan: Skill Graph Program — Skill Inventory Extraction

## Phase 1: Tests and Fixtures

- [ ] **Task 1.1: Add parser fixture tests**
  - Use small markdown fixtures that include:
    - lesson title
    - source line
    - multiple `## Example` headings
    - combined headings such as `## Examples 5 and 6`
    - mixed exercises
  - Assert expected draft node IDs and source references.

- [ ] **Task 1.2: Add deterministic output test**
  - Run extraction twice against the same fixture.
  - Assert identical JSON output.

- [ ] **Task 1.3: Add duplicate-ID test**
  - Create fixture headings that would collide.
  - Assert extractor appends deterministic disambiguators or raises an audit exception.

## Phase 2: Extraction Utilities

- [ ] **Task 2.1: Implement markdown heading parser**
  - Parse H1 lesson titles and H2/H3 sections.
  - Record section start line, heading text, and body excerpt.

- [ ] **Task 2.2: Implement ID generation**
  - Convert course/module/lesson/example into stable IDs:
    - `example:im3:m01:l01:e03`
    - `skill:im3:m01:l01:graph-quadratic-from-table`
  - Use zero-padded module and lesson numbers.

- [ ] **Task 2.3: Implement course adapters**
  - IM1/IM2/IM3 adapter: read flat `module-*-lesson-*` files.
  - PreCalc adapter: read CED/Passwater source-backed lesson/topic files and module lesson files where present.

## Phase 3: Inventory Generation

- [ ] **Task 3.1: Generate IM1 draft inventory**
  - Read all IM1 lesson catalogs.
  - Write `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`.
  - Record lessons without examples.

- [ ] **Task 3.2: Generate IM2 draft inventory**
  - Read all IM2 lesson catalogs.
  - Reconcile current module lesson files against stale older IM2 unit artifacts.
  - Write `apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json`.

- [ ] **Task 3.3: Generate IM3 draft inventory**
  - Read all IM3 lesson catalogs.
  - Include references to IM3 `curriculum/aleks/problem-type-registry.md` where headings match known family keys.
  - Write `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`.

- [ ] **Task 3.4: Generate PreCalc draft inventory**
  - Prefer CED/Passwater source files.
  - Preserve FRQ/task-model source metadata where available.
  - Write `apps/pre-calculus/curriculum/skill-graph/draft-nodes.json`.

## Phase 4: Audit

- [ ] **Task 4.1: Write inventory audit report**
  - Create `measure/skill-graph-inventory-audit.md`.
  - Include counts by course and node type.
  - Include duplicate IDs, missing examples, ambiguous headings, and source limitations.

- [ ] **Task 4.2: Add validation command**
  - Add or document a command/script that validates all draft inventories against `skill-graph.v1`.

## Phase 5: Verification

- [ ] **Task 5.1: Run targeted tests**
  - Run parser and inventory tests.

- [ ] **Task 5.2: Run lint/typecheck for touched package/scripts**
  - Use existing app/package scripts where available.

- [ ] **Task 5.3: Confirm source files unchanged**
  - Run `git diff --name-only` and verify curriculum source catalogs were not modified.
