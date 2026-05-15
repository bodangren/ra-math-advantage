# Specification: Skill Graph Program — Knowledge Space Core Contract

## Overview

Define `knowledge-space.v1`, the domain-neutral data contract for learning nodes, directed weighted relationships, provenance, review status, and validation. This contract becomes the reusable source model for downstream inventory extraction, standards/objective alignment, edge authoring, practice projections, and course or domain rollouts.

Math content is the first domain implementation, but the contract must also support future proprietary domain graphs such as English/GSE. The reusable package must ship mechanisms only: no math maps, GSE descriptors, standards catalogs, curriculum files, or proprietary graph data are exported from the core package.

## Functional Requirements

1. Create a reusable package-level contract under `packages/knowledge-space-core/src/`.
2. Define Zod schemas and TypeScript types for:
   - knowledge space document
   - node
   - edge
   - source reference
   - provenance
   - review status
   - confidence
   - weight
   - ID components
   - domain adapter contract
3. Define domain-neutral node kinds:
   - `domain`
   - `content_group`
   - `instructional_unit`
   - `standard`
   - `skill`
   - `concept`
   - `worked_example`
   - `task_blueprint`
   - `generator`
   - `renderer`
   - `misconception`
4. Define directed edge types:
   - `contains`
   - `appears_in_context`
   - `aligned_to_standard`
   - `prerequisite_for`
   - `supports`
   - `extends`
   - `equivalent_to`
   - `common_misconception_with`
   - `rendered_by`
   - `generated_by`
   - `evidenced_by`
5. Define edge weight semantics:
   - `weight` is relationship strength from `0` to `1`.
   - `confidence` is evidence confidence from `low`, `medium`, `high`.
   - Do not overload weight to mean difficulty, importance, or confidence.
6. Define stable ID rules:
   - Domain prefixes are adapter-defined; examples include `math.im3` and `english.gse`.
   - Core IDs are opaque stable strings validated by the core pattern and optional domain adapter.
   - Example math skill ID: `math.im3.skill.m1.l2.solve-quadratic-by-factoring`.
   - Example English/GSE skill ID: `english.gse.skill.b1.reading.identify-main-idea.short-text`.
   - Standard/objective IDs preserve official codes where allowed by source licensing.
   - Generated projection IDs must reference knowledge space node IDs.
7. Define source provenance rules:
   - every node and edge must cite at least one source reference or be marked `derived`.
   - derived edges must include derivation method and reviewer status.
8. Define validation helpers:
   - unique node IDs
   - no dangling edge endpoints
   - valid edge type for source/target node types
   - no duplicate exact edges
   - every required standard/objective alignment has an edge or documented exception
   - every independent-practice-ready node has a generator edge or exception
9. Define adapter hooks for domain metadata validation:
   - Math adapters can validate course, module, lesson, standard, component, and generator metadata.
   - English/GSE adapters can validate GSE range, CEFR band, modality, language function, and task context metadata.
   - The core package must not import domain adapters or domain data.
10. Export all types and validators from `@advantage/knowledge-space-core`.

## Non-Functional Requirements

- Keep the contract domain-neutral.
- Do not import from apps, Convex generated files, or app-local curriculum paths.
- Do not export actual domain maps, Pearson/GSE descriptors, standards catalogs, or proprietary curriculum data.
- Use pure functions for validation.
- Write tests before implementation.
- Do not create any graph content in this track except minimal synthetic fixtures.

## Acceptance Criteria

- [ ] `packages/knowledge-space-core/src/` exists.
- [ ] Zod schemas and TypeScript types exist for `knowledge-space.v1`.
- [ ] Package exports are wired.
- [ ] Contract tests cover valid knowledge space, duplicate node IDs, dangling edges, invalid edge type, missing required alignments, missing generator readiness, invalid ID patterns, and domain adapter metadata rejection.
- [ ] Documentation includes examples for math and English/GSE-style nodes using synthetic placeholder content only.
- [ ] No app-local files are required to import the contract.
- [ ] No proprietary domain maps or source descriptors are exported from the package.
- [ ] **Boundary lint** runs in CI/test and fails the build if `packages/knowledge-space-core` or `packages/knowledge-space-practice` import from `apps/`, `convex/_generated/`, `packages/math-content/`, or any other domain content package.

## Out of Scope

- Extracting real skills.
- Assigning real standards.
- Authoring real graph edges.
- Runtime rendering.
- Convex schema migration.
