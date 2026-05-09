# Knowledge Space Architecture

This document is the project-wide source of truth for the Knowledge Space plan. Read it before implementing any Skill Graph, Knowledge Space, blueprint, generator, SRS, practice projection, or cross-domain learning graph work.

## Purpose

The project is moving from lesson-local activity maps toward a Knowledge Space Theory inspired model: learner-facing activities are generated from a directed graph of learning states, not hand-maintained as the canonical skill model.

In this project:

- A knowledge space is a directed, weighted graph of learnable nodes and typed relationships.
- A learner's current state is inferred from evidence against those nodes.
- Readiness is computed from prerequisites, support relationships, prior evidence, confidence, and practice history.
- Runtime artifacts such as practice maps, SRS inputs, teacher evidence, visualization payloads, component props, and seed payloads are projections from the graph.

## Generalization Rule

The mechanism is domain-neutral. Math, English/GSE, science, coding, and future domains can share the same graph validation, traversal, readiness, blueprint, generator, evidence, and projection machinery.

The domain content is not shared:

- Math graphs, standards mappings, curriculum catalogs, generator bindings, and activity maps are proprietary domain/app artifacts.
- English/GSE graphs, Pearson descriptor text, CEFR/GSE mappings, task contexts, and language-function maps are proprietary domain/app artifacts.
- Reusable npm packages must ship mechanisms, schemas, validators, adapters, and synthetic examples only.

## Package Boundaries

### `@advantage/knowledge-space-core`

Owns domain-neutral mechanisms:

- `knowledge-space.v1` graph document schemas and TypeScript types
- node, edge, provenance, confidence, weight, review, and exception schemas
- domain adapter interfaces for metadata validation
- graph validation helpers
- traversal and prerequisite closure utilities
- learner-state and readiness primitives
- synthetic fixtures and examples only

Must not import app code, Convex generated files, math content, GSE content, curriculum files, standards catalogs, or proprietary graph maps.

### `@advantage/knowledge-space-practice`

Owns reusable practice mechanisms:

- worked-example, guided-practice, and independent-practice blueprint contracts
- deterministic generator interfaces
- generic evidence and grading metadata contracts
- projection utilities for activity maps, SRS inputs, teacher evidence, visualization payloads, component props, and seed-ready payloads
- adapters that can map generic evidence/projections to `practice.v1`
- synthetic fixtures and examples only

Must not bundle actual math graphs, English/GSE descriptors, domain standards catalogs, or generated app outputs.

### Domain Packages and App Content

Domain packages and app curriculum folders own proprietary data:

- `packages/math-content` and app curriculum folders own IM1, IM2, IM3, AP Precalculus graph artifacts, standards mappings, generator bindings, and component/runtime mappings.
- A future English/GSE content package or app folder owns GSE-aligned graph artifacts, descriptor mappings, CEFR metadata, modality/task context, and English-specific generators.
- Domain packages consume `knowledge-space-core` and `knowledge-space-practice`; they do not redefine the core theory or reusable contracts.

## Visualization Projections

User interfaces should not expose the raw knowledge graph. Raw nodes and edges are implementation evidence; users need role-specific projections with clear labels, readiness states, blockers, and recommended next actions.

Visualization projection rules:

- Student views should emphasize the learner's path: mastered nodes, ready next nodes, blocked nodes, prerequisite trails, review-due nodes, and one or two next recommended activities.
- Parent views should translate graph state into plain-language progress: what the learner can do, what is next, what is blocking progress, and how progress is changing over time.
- Teacher views should support classroom decisions: class heatmaps, bottleneck skills, prerequisite gaps, misconception clusters, intervention groups, and standards/objective coverage.
- Visualization data should be prepared by projection utilities, not computed ad hoc in React components.
- Role-specific projections must hide internal/proprietary details unless the target role has a clear need to see them.
- The same underlying graph can produce different student, parent, teacher, admin, and audit views.

## Vocabulary

- **Node:** A learnable or reference entity such as a skill, concept, standard/objective, worked example, task blueprint, renderer, generator, or misconception.
- **Edge:** A typed directed relationship such as prerequisite, supports, extends, equivalent, aligned-to-standard, rendered-by, generated-by, evidenced-by, or misconception-related.
- **Weight:** Relationship strength from `0` to `1`; not difficulty, confidence, or importance.
- **Confidence:** Evidence confidence for a node, edge, or alignment.
- **Provenance:** Source reference or derivation record explaining where a node or edge came from.
- **Readiness:** Computed estimate that a learner can productively attempt a node or task.
- **Blueprint:** Domain-supplied plan for turning a node into worked, guided, or independent practice.
- **Projection:** Generated runtime artifact derived from the knowledge space and blueprints.
- **Visualization Projection:** Role-specific visual payload derived from graph state, learner evidence, and recommendations; not the raw graph.
- **Domain Adapter:** Validation and mapping boundary where math, English/GSE, or another domain interprets metadata without changing the core package.

## Implementation Rules

1. Keep reusable packages domain-neutral.
2. Use synthetic fixtures in reusable packages.
3. Keep proprietary maps and descriptor text in app/domain content packages.
4. Treat activity maps, SRS inputs, teacher evidence, component props, and seed payloads as generated projections.
5. When a track or implementation needs domain meaning, put that meaning behind a domain adapter or in a domain package.
6. Do not make `knowledge-space-core` depend on `knowledge-space-practice`; core must remain the lowest-level graph/state package.
7. Do not make shared packages import from `apps/` or `convex/_generated/`.
8. Render student, parent, and teacher graph visualizations from role-specific projections; do not have UI components infer canonical graph truth.

## Current Measure Tracks

- Track 2 defines `knowledge-space-core`.
- Track 6 defines reusable blueprint and generator contracts in `knowledge-space-practice`.
- Track 7 defines reusable practice and visualization projection adapters in `knowledge-space-practice`.
- Course rollout tracks create proprietary domain graph artifacts that consume those reusable packages.
