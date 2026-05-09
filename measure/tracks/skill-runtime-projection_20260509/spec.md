# Specification: Skill Graph Program — Knowledge Space Practice Projections

## Overview

Generate runtime artifacts from `knowledge-space.v1` and knowledge blueprints through reusable projection adapters. Activity maps, SRS inputs, component props, seed payloads, teacher evidence summaries, and role-specific visualization payloads become projections, not source truth.

The reusable projection package must ship mechanisms only. Actual math graphs, English/GSE maps, Pearson descriptor text, standards catalogs, and app-specific generated outputs remain proprietary domain/app artifacts.

## Cross-Domain Portability

The reusable projection package is the most likely place for math-domain assumptions to leak (course/module/lesson words, math-only evidence shapes, math-specific UI groupings). Because this work will be copied to a sibling project that targets English/GSE, Chinese, and science domains, the package must demonstrably operate end-to-end on a non-math domain before this track is considered complete. See acceptance criterion AC-9.

## Visualization Contract

Visualization payloads are a public contract on par with the practice envelope. They get versioned schemas (`visualization.v1`) so role-specific UIs can validate inputs and so future shape changes are caught at build time rather than at render time.

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
5. Generate role-specific visualization payloads under a versioned `visualization.v1` schema set:
   - `studentVisualizationV1`: mastered, ready, blocked, review due, recommended next
   - `parentVisualizationV1`: plain-language can-do summary, next focus, blockers, trend
   - `teacherVisualizationV1`: heatmap cells, bottleneck nodes, prerequisite gaps, misconception clusters, intervention groups, standards/objective coverage
   - `visualNodeV1` / `visualEdgeV1` DTOs that hide raw/proprietary graph fields unless needed by the target role
   - Each payload includes a `schemaVersion` field; projection outputs must validate against the corresponding Zod schema.
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
- [ ] `visualization.v1` Zod schemas exist and projection outputs validate against them.
- [ ] Comparison report shows differences from existing activity maps.
- [ ] Runtime projection docs state generated artifacts are not source truth.
- [ ] Package fixtures use synthetic placeholder graph data only.
- [ ] **AC-9 (Cross-Domain Smoke):** A synthetic non-math fixture (e.g. a small synthetic English/GSE-style or Chinese-tutoring-style knowledge space) flows end-to-end through activity-map projection, SRS projection, teacher evidence projection, and all three `visualization.v1` payloads with **no imports from `apps/`, `math-content`, `convex/_generated/`, or any math-domain code**. A test asserts this and asserts the produced payloads validate against their schemas.

## Out of Scope

- Full course rollout generation.
- React component implementation.
- Live Convex migration.
- Adaptive recommendation UI.
- Final visualization UI design.
