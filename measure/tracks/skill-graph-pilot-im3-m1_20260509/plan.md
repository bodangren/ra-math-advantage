# Implementation Plan: Skill Graph Program — IM3 Module 1 Pilot

## Phase 1: Pilot Tests and Fixtures

- [ ] **Task 1.1: Add Module 1 graph validation test**
  - Validate nodes, edges, standard edges, and blueprints for Module 1.

- [ ] **Task 1.2: Add generator tests**
  - Test deterministic output for at least three Module 1 generators.

- [ ] **Task 1.3: Add runtime projection test**
  - Assert graph-derived activity rows validate and reference Module 1 skill IDs.

- [ ] **Task 1.4: Add rendering smoke test**
  - Render pilot harness for worked, guided, and independent modes.

## Phase 2: Graph Artifacts

- [ ] **Task 2.1: Extract Module 1 nodes**
  - Use existing extraction utilities.
  - Write `nodes.json`.

- [ ] **Task 2.2: Assign Module 1 standards**
  - Use IM3 standards and lesson-standard seeds.
  - Write `standard-edges.json`.

- [ ] **Task 2.3: Author Module 1 edges**
  - Add containment, placement, prerequisite, support, renderer, and generator edges.
  - Write `edges.json`.

## Phase 3: Blueprints and Generators

- [ ] **Task 3.1: Create Module 1 blueprints**
  - Author blueprint rows for all generator-ready Module 1 skills.
  - Mark non-generator-ready skills with review status and exception.

- [ ] **Task 3.2: Implement generator subset**
  - Add deterministic generators for representative algebraic and graphing skills.
  - Validate generated props against schemas.

- [ ] **Task 3.3: Add grading metadata**
  - Ensure generator outputs include answer schema and part IDs.

## Phase 4: Runtime Projection and Harness

- [ ] **Task 4.1: Generate practice.v1 projection**
  - Write `projection/practice-v1-activity-map.json`.

- [ ] **Task 4.2: Build dev-only pilot harness**
  - Route or page should be developer-only.
  - It must load graph-derived blueprints and render existing shared activity components.

- [ ] **Task 4.3: Wire submission path**
  - Independent practice must emit valid `practice.v1` envelopes.
  - Include skill ID and graph provenance in `analytics` or approved metadata field.

- [ ] **Task 4.4: Project teacher evidence**
  - Show or produce JSON evidence containing skill ID, standard IDs, score, parts, and prerequisite context.

## Phase 5: Audit and Decision

- [ ] **Task 5.1: Write pilot audit**
  - Create `measure/skill-graph-im3-m1-pilot-audit.md`.
  - Include counts, generator coverage, rendering coverage, submission evidence, and blockers.

- [ ] **Task 5.2: Compare with existing activity map**
  - List differences and decide whether projection is ready to replace runtime maps for Module 1.

## Phase 6: Verification

- [ ] **Task 6.1: Run targeted unit tests**
  - Graph, blueprint, generator, projection, and harness tests.

- [ ] **Task 6.2: Run app lint/typecheck**
  - Run relevant IM3 lint/typecheck commands.

- [ ] **Task 6.3: Manual smoke test**
  - Use the dev harness to complete one independent practice attempt.
  - Record submitted envelope shape in the audit.
