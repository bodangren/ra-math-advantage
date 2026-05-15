# Implementation Plan: Skill Graph Program — Integrated Math 1 Rollout

## Phase 1: Readiness Gate

- [x] **Task 1.1: Verify dependencies**
  - Confirm the graph contract, inventory extractor, standards alignment, edge authoring, blueprint/generator contract, runtime projection, and IM3 M1 pilot are complete.

- [x] **Task 1.2: Validate IM1 source inventory**
  - Count all IM1 `module-*-lesson-*` files.
  - Confirm each file has source reference, example sections, mixed exercises, and review notes.
  - Record discrepancies in audit.

- [x] **Task 1.3: Validate IM1 standards state**
  - Inventory current standards seed files.
  - Identify missing modules and missing standard definitions before graph generation.

## Phase 2: Nodes and Standards

- [x] **Task 2.1: Generate IM1 final nodes**
  - Promote draft inventory nodes to final graph nodes where source references are sufficient.
  - Keep ambiguous nodes in review status.

- [x] **Task 2.2: Generate standard nodes and edges**
  - Create standard nodes from available seed files.
  - Generate `aligned_to_standard` edges.
  - Write exceptions for missing standard coverage.

- [x] **Task 2.3: Validate standards coverage**
  - Assert every skill has standard edge or exception.

## Phase 3: Edges

- [x] **Task 3.1: Generate containment and placement edges**
  - course -> module -> lesson -> example -> skill.

- [x] **Task 3.2: Author prerequisite/support edges by module**
  - Work module by module.
  - Use lesson sequence, standards, and family similarity.
  - Mark heuristic edges low confidence.

## Phase 4: Blueprints and Generators

- [x] **Task 4.1: Create IM1 blueprints**
  - One blueprint per generator-ready skill.
  - Include worked, guided, and independent specs where possible.

- [x] **Task 4.2: Map existing generators/renderers**
  - Algebra: step-by-step solver.
  - Graphing: graphing explorer.
  - Statistics/conceptual: quiz/fill-in/table-compatible renderers.
  - Geometry: mark unsupported where diagram tooling is not ready.

- [x] **Task 4.3: Validate independent practice readiness**
  - No skill may be marked independent-ready without generator edge and grading spec.

## Phase 5: Runtime Projection

- [x] **Task 5.1: Generate activity map projection**
  - Write `projection/practice-v1-activity-map.json`.

- [x] **Task 5.2: Generate SRS projection**
  - Write `projection/srs-input.json`.

- [x] **Task 5.3: Generate teacher evidence map**
  - Write `projection/teacher-evidence-map.json`.

## Phase 6: Audit and Review

- [x] **Task 6.1: Write IM1 rollout audit**
  - Create `measure/skill-graph-im1-rollout-audit.md`.
  - Include coverage by module, standards, component, generator readiness, and exceptions.

- [x] **Task 6.2: Create review queues**
  - Standards review queue.
  - Edge review queue.
  - Generator/component gap queue.

## Phase 7: Verification

- [x] **Task 7.1: Run graph validation**
  - Validate all IM1 graph artifacts.

- [x] **Task 7.2: Run projection validation**
  - Validate `practice.v1` rows and component props.

- [x] **Task 7.3: Run relevant tests**
  - Run touched package tests and IM1 app checks.

- [x] **Task 7.4: Manual sample review**
  - Review at least one lesson per module.
  - Record reviewed examples in audit.
