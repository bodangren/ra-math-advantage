# Specification: Skill Graph Program — Directed Edge Authoring

## Overview

Author directed weighted graph edges between skill, worked-example, standard, curriculum, renderer, generator, and misconception nodes. This track turns the node inventory into a useful knowledge graph for adaptive sequencing, prerequisite repair, SRS routing, and teacher diagnostics.

## Functional Requirements

1. Consume validated node inventories and standard alignment edges.
2. Produce per-course edge files:
   - `apps/integrated-math-1/curriculum/skill-graph/edges.json`
   - `apps/integrated-math-2/curriculum/skill-graph/edges.json`
   - `apps/integrated-math-3/curriculum/skill-graph/edges.json`
   - `apps/pre-calculus/curriculum/skill-graph/edges.json`
3. Author edge types:
   - `contains`
   - `appears_in_lesson`
   - `prerequisite_for`
   - `supports`
   - `extends`
   - `same_underlying_skill_as`
   - `common_misconception_with`
   - `rendered_by`
   - `generated_by`
4. Use edge weights consistently:
   - `1.0`: direct, necessary, or exact relationship.
   - `0.75`: strong but not strictly necessary relationship.
   - `0.5`: useful support or common relation.
   - `0.25`: weak relation requiring review.
5. Use confidence separately from weight:
   - `high`: direct source evidence or reviewer-approved.
   - `medium`: deterministic rule with strong source context.
   - `low`: heuristic suggestion needing review.
6. Build automatic edge suggestions from:
   - lesson order
   - module/course sequence
   - family key overlap
   - standard overlap
   - shared component/generator requirements
   - explicit source wording
7. Create a human review queue for low-confidence prerequisite and misconception edges.
8. Validate graph properties:
   - no dangling endpoints
   - no duplicate edges
   - no cycles in high-confidence `prerequisite_for` edges unless explicitly excepted
   - no impossible endpoint pairings

## Non-Functional Requirements

- Keep generated edge suggestions separate from reviewed edges.
- Never infer prerequisite edges solely from file order without low/medium confidence marking.
- Keep edge rationale short and source-backed.
- Deterministic ordering is required.

## Acceptance Criteria

- [ ] Per-course edge files exist.
- [ ] All edges validate against `skill-graph.v1`.
- [ ] High-confidence prerequisite subgraph has no unapproved cycles.
- [ ] Low-confidence edge review queues exist.
- [ ] Audit report includes edge counts by type, confidence, and course.
- [ ] At least one manual sample review per edge type is documented.

## Out of Scope

- Standards alignment edge creation if not already completed.
- Generator implementation.
- Runtime UI changes.
- Adaptive recommendation algorithms.
