# Specification: Skill Graph Program — Skill-Level Standards Alignment

## Overview

Assign standards to skill nodes, not just lessons or problem families. The result is graph-valid `aligned_to_standard` edges with confidence, provenance, and review state for IM1, IM2, IM3, and AP Precalculus.

## Functional Requirements

1. Consume draft skill inventories from `skill-inventory-extraction_20260509`.
2. Consume existing standards sources:
   - app `convex/seed/seed_standards.ts`
   - app `convex/seed/seed_lesson_standards.ts`
   - `lesson_standards` seed variants
   - PreCalc CED standards/learning-objective artifacts
   - IM3 ALEKS/problem-family registries when useful
3. Produce per-course alignment files:
   - `apps/<course>/curriculum/skill-graph/standard-edges.json`
4. Each edge must include:
   - `sourceId` skill or worked_example node
   - `targetId` standard node
   - `type: "aligned_to_standard"`
   - `weight`
   - `confidence`
   - `sourceRefs`
   - `rationale`
   - `reviewStatus`
5. Assign confidence using clear rules:
   - `high`: exact lesson standard or official CED topic alignment directly supports the skill.
   - `medium`: family or class-period mapping supports the alignment but skill is narrower.
   - `low`: heuristic or title-derived mapping requiring human review.
6. Every skill node must have at least one standard edge or a documented exception.
7. Generate a missing/low-confidence review queue.
8. Do not invent official standard codes. If a standard is absent from seed files, record an exception.

## Non-Functional Requirements

- Keep official standards text unchanged.
- Preserve local source provenance.
- Avoid overwriting human-reviewed alignment files without deterministic generation and audit output.
- Separate automatic suggestions from approved alignments.

## Acceptance Criteria

- [ ] Standard node inventories exist or are referenced for each course.
- [ ] Every skill has at least one standard edge or exception.
- [ ] Low-confidence mappings are listed in a review queue.
- [ ] Missing standards are listed in an audit report.
- [ ] Existing lesson-level mappings remain intact.
- [ ] Validation catches dangling standard IDs and missing skill IDs.

## Out of Scope

- Authoring prerequisite edges.
- Implementing generators.
- Updating live Convex data.
- Teacher UI changes.
