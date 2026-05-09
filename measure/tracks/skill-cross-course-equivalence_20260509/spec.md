# Specification: Skill Graph Program — Cross-Course Equivalence

## Overview

Author `equivalent_to` edges across the IM1, IM2, IM3, and AP Precalculus knowledge spaces. Cross-course equivalences identify the same underlying mathematical kernel taught at different points across the program (e.g., "solve linear equation" in IM1 and PreCalc; "factor quadratic" in IM2 and IM3) so SRS, remediation routing, and teacher diagnostics can leverage prior evidence across course boundaries.

## Sequencing Role

This track runs **after all four course rollouts complete** (`skill-rollout-im1`, `skill-rollout-im2`, `skill-rollout-im3`, `skill-rollout-precalc`). Authoring cross-course edges before the target courses' graphs exist produces dangling endpoints and rework; this track exists specifically to remove that hazard from the per-course rollouts.

## Dependencies

- `skill-graph-contract_20260509`
- `skill-math-adapter_20260509`
- `skill-graph-edge-authoring_20260509`
- `skill-rollout-im1_20260509`
- `skill-rollout-im2_20260509`
- `skill-rollout-im3_20260509`
- `skill-rollout-precalc_20260509`

## Functional Requirements

1. Consume the four finalized per-course graphs.
2. Produce a single cross-course edge file: `packages/math-content/src/knowledge-space/cross-course-edges.json`.
3. Author `equivalent_to` edges only:
   - source and target must be skill or worked_example nodes from different courses.
   - same normalized `familyKey` is the primary signal; exact-label match is a secondary signal.
   - matches across CED/IM standard pairings count as evidence.
4. Confidence rules:
   - `high`: deterministic familyKey match plus aligned standards/objectives plus reviewer approval.
   - `medium`: familyKey match without standard alignment, or standard alignment without familyKey match.
   - `low`: heuristic title or slug match only; goes to review queue.
5. Validation:
   - all edge endpoints must reference nodes that exist in the four per-course graphs.
   - no `equivalent_to` edge may have source and target in the same course (those belong to per-course graphs).
   - cycles in `equivalent_to` are allowed only as connected components; high-confidence components must be reviewer-approved.
6. Generate a cross-course equivalence audit at `measure/skill-graph-cross-course-equivalence-audit.md`:
   - counts by course pair and confidence.
   - components (connected sets of equivalent skills) with member listing.
   - low-confidence review queue.
7. Update affected projection adapters:
   - SRS projection should treat equivalent skills as a single learner-state target.
   - Teacher evidence should surface evidence collected on equivalent skills from other courses.
8. Document the rule that per-course rollouts must not author cross-course edges.

## Non-Functional Requirements

- Deterministic output ordering.
- Source-backed rationale on every edge.
- No mutation of per-course edge files.
- Pure functions; no Convex or app imports.

## Acceptance Criteria

- [ ] `cross-course-edges.json` exists and validates against `knowledge-space.v1`.
- [ ] All endpoints resolve to existing nodes in the four per-course graphs.
- [ ] No `equivalent_to` edge has source and target in the same course.
- [ ] Audit report lists pair counts, components, and review queue.
- [ ] SRS and teacher evidence projection adapters acknowledge equivalent-skill components.
- [ ] At least one manual reviewed sample component is documented.

## Out of Scope

- Authoring `prerequisite_for` edges across courses (those are per-course graph concerns).
- Building UI surfaces for cross-course equivalence (handled when projection adapters are wired into student/teacher views).
- Cross-domain equivalence (math ↔ English/GSE/etc. — sibling project concern).
