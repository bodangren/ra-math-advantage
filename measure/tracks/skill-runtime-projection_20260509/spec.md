# Specification: Skill Graph Program — Knowledge Space Practice Projections

## Overview

Generate runtime artifacts from `knowledge-space.v1` and knowledge blueprints through reusable projection adapters. Activity maps, SRS inputs, component props, seed payloads, teacher evidence summaries, and role-specific visualization payloads become projections, not source truth.

The reusable projection package must ship mechanisms only. Actual math graphs, English/GSE maps, Pearson descriptor text, standards catalogs, and app-specific generated outputs remain proprietary domain/app artifacts.

## Functional Requirements

1. Create projection utilities that consume:
   - knowledge-space nodes
   - knowledge-space edges
   - knowledge blueprints
   - standards/objective alignments
   - domain adapter metadata
2. Generate `practice.v1` activity maps through an adapter:
   - `stableActivityId`
   - `nodeId`
   - `sourceNodeId`
   - `rendererKey`
   - `mode`
   - `alignmentNodeIds`
   - `props`
   - `gradingConfig`
   - `srsEligible`
3. Generate SRS projection input:
   - node ID
   - blueprint ID
   - standards/objectives
   - prerequisite edges
   - difficulty
   - generator readiness
4. Generate teacher evidence metadata:
   - standard/objective coverage
   - node/skill coverage
   - prerequisite gaps
   - attempt artifacts
5. Generate role-specific visualization payloads:
   - student path state: mastered, ready, blocked, review due, recommended next
   - parent progress state: plain-language can-do summary, next focus, blockers, trend
   - teacher class state: heatmap cells, bottleneck nodes, prerequisite gaps, misconception clusters, intervention groups, standards/objective coverage
   - visual node and edge DTOs that hide raw/proprietary graph fields unless needed by the target role
6. Generate seed-ready activity definitions only when target app needs Convex seed material.
7. Runtime projections must include provenance back to knowledge-space node/edge IDs.
8. Existing manually authored activity maps must be treated as comparison baselines, not canonical truth.
9. UI components must consume projection payloads and must not infer canonical graph state directly from raw graph files.

## Non-Functional Requirements

- Deterministic outputs.
- Stable sorting.
- Generated files should include schema/version metadata.
- Do not overwrite existing runtime artifacts until comparison tests pass.
- Keep projection code pure and testable.
- Do not bundle actual domain maps, Pearson/GSE descriptors, standards catalogs, or proprietary generated outputs in the reusable package.

## Acceptance Criteria

- [ ] Projection schema and utilities exist.
- [ ] Tests prove generated activity map entries reference valid knowledge-space IDs.
- [ ] Tests prove generated renderer/component props validate against supplied adapter schemas.
- [ ] Tests prove SRS projection includes prerequisite context.
- [ ] Tests prove visualization projections expose role-appropriate student, parent, and teacher payloads without requiring raw graph access.
- [ ] Comparison report shows differences from existing activity maps.
- [ ] Runtime projection docs state generated artifacts are not source truth.
- [ ] Package fixtures use synthetic placeholder graph data only.

## Out of Scope

- Full course rollout generation.
- React component implementation.
- Live Convex migration.
- Adaptive recommendation UI.
- Final visualization UI design.
