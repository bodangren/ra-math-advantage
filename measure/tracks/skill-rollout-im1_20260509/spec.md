# Specification: Skill Graph Program — Integrated Math 1 Rollout

## Overview

Apply the approved skill graph pipeline to all Integrated Math 1 curriculum source catalogs after the IM3 Module 1 pilot is accepted. This track creates the complete IM1 skill graph, standards alignment, directed edges, blueprints, generators, runtime projections, and review/audit artifacts.

## Dependencies

- `skill-graph-deprecation_20260509`
- `skill-graph-contract_20260509`
- `skill-inventory-extraction_20260509`
- `skill-standards-alignment_20260509`
- `skill-graph-edge-authoring_20260509`
- `skill-blueprint-generator-contract_20260509`
- `skill-runtime-projection_20260509`
- `skill-graph-pilot-im3-m1_20260509`

## IM1 Source Rules

1. Canonical lesson source is `apps/integrated-math-1/curriculum/modules/module-*-lesson-*`.
2. Raw worksheet sources in `source-materials/practice-worksheet-student-bundle/` are preserved as provenance.
3. IM1 standards seed data is currently incomplete; do not silently reuse IM2/IM3 standards without an explicit mapping rationale.
4. Geometry, statistics, and algebra skills should still use the same graph contract, but generator readiness may vary by component availability.

## Functional Requirements

1. Generate final IM1 graph artifacts:
   - `curriculum/skill-graph/nodes.json`
   - `standard-edges.json`
   - `edges.json`
   - `blueprints.json`
   - `projection/practice-v1-activity-map.json`
   - `projection/srs-input.json`
   - `projection/teacher-evidence-map.json`
2. Cover all 93 reviewed IM1 lesson catalogs.
3. Assign standards to every skill or document exceptions.
4. Add directed edges:
   - contains
   - appears_in_lesson
   - aligned_to_standard
   - prerequisite_for
   - supports
   - extends
   - same_underlying_skill_as
   - rendered_by
   - generated_by where available
5. Implement or map generator-ready blueprints for algebraic, graphing, statistics, and geometry skills where current components support them.
6. Mark skills requiring new renderers/generators with explicit exceptions.
7. Produce an IM1 rollout audit report.

## Non-Functional Requirements

- Keep IM1 output deterministic and source-backed.
- Do not mutate raw worksheet sources.
- Do not treat incomplete IM1 standards as acceptable hidden debt; list gaps.
- Do not build new React components unless a separate component track is created.

## Acceptance Criteria

- [ ] All IM1 graph artifacts exist and validate.
- [ ] All IM1 skill nodes have standards or exceptions.
- [ ] All IM1 independent-practice-ready skills have generators.
- [ ] Projection outputs validate against `practice.v1` and component schemas.
- [ ] Audit report lists coverage by module, standard, componentKey, generator readiness, and exception type.
- [ ] Existing IM1 app tests/lint/typecheck relevant to touched code pass or documented baseline failures are separated.

## Out of Scope

- Full new component implementation.
- Live Convex migration.
- Rewriting IM1 lesson catalogs.
- Replacing public curriculum pages unless needed by projection tests.
