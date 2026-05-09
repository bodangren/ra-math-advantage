# Specification: Skill Graph Program — Skill Inventory Extraction

## Overview

Extract atomic skill and worked-example candidates from existing curriculum source artifacts into draft `knowledge-space.v1` node inventories. This track creates inventory data only; it does not finalize standards, edges, generators, or runtime projections.

## Canonical Sources

- IM1: `apps/integrated-math-1/curriculum/modules/module-*-lesson-*`
- IM2: `apps/integrated-math-2/curriculum/modules/module-*-lesson-*`
- IM3: `apps/integrated-math-3/curriculum/modules/module-*-lesson-*`
- PreCalc: `apps/pre-calculus/curriculum/source/`, `apps/pre-calculus/curriculum/modules/`, and CED/Passwater-derived planning files

## Dependencies

- `skill-graph-contract_20260509` — `knowledge-space.v1` schemas and validators.
- `skill-math-adapter_20260509` — math ID constructors and metadata schemas.

## Functional Requirements

1. Build a deterministic extraction utility under `packages/math-content/src/knowledge-space/extraction/` or app scripts if package placement would import app files.
2. Extract draft nodes for:
   - course
   - module/unit
   - lesson/topic
   - worked_example
   - skill candidate
   - problem_family candidate when available
3. Generate one JSON inventory per course:
   - `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
   - `apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json`
   - `apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json`
   - `apps/pre-calculus/curriculum/skill-graph/draft-nodes.json`
4. Preserve source references:
   - file path
   - heading text
   - line number when feasible
   - source type (`worksheet-catalog`, `ced`, `passwater`, `manual-planning`, `problem-family-registry`)
5. Generate stable IDs using the math domain adapter ID constructors from `skill-math-adapter_20260509` (`packages/math-content/src/knowledge-space/ids.ts`). Do not invent local ID schemes.
6. Flag ambiguous extraction cases instead of silently guessing.
7. Add inventory audit output:
   - count by course
   - count by node type
   - examples missing source references
   - duplicate ID candidates
   - lessons with no extracted examples
8. Keep extracted nodes in `draft` review status.

## Non-Functional Requirements

- Deterministic output: same inputs produce the same JSON order and IDs.
- No network access.
- No dependency changes.
- Do not mutate source curriculum files.
- Use parsers/structured heading extraction where practical; avoid fragile one-off string hacks.

## Acceptance Criteria

- [ ] Each course has `curriculum/skill-graph/draft-nodes.json`.
- [ ] Each draft node validates against `knowledge-space.v1`.
- [ ] IDs are unique within each course and across all four course inventories.
- [ ] Every worked example node has a source reference.
- [ ] Audit report exists at `measure/skill-graph-inventory-audit.md`.
- [ ] Ambiguous or missing items are listed as exceptions.

## Out of Scope

- Standards alignment.
- Edge authoring.
- Generator implementation.
- React rendering.
- Convex seeding.
