# Implementation Plan: Skill Graph Program — IM3 Module 1 Pilot

## Phase 1: Pilot Tests and Fixtures

- [x] **Task 1.1: Add Module 1 graph validation test** [checkpoint: 7e8f3a2]
  - Validate nodes, edges, standard edges, and blueprints for Module 1.
  - Created `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-graph-validation.test.ts`
  - 12 tests covering schema validation, dangling edges, duplicates, endpoint pairings, alignment, generator readiness, metadata validation, and structural edge coverage.

- [x] **Task 1.2: Add generator tests** [checkpoint: 7e8f3a2]
  - Test deterministic output for at least three Module 1 generators.
  - Created `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-generators.test.ts`
  - 16 tests covering determinism, required fields, schema validation, grading metadata consistency, and seed variation for quadratic-graph-analysis, average-rate-of-change, solve-quadratic-by-graphing.

- [x] **Task 1.3: Add runtime projection test** [checkpoint: 7e8f3a2]
  - Assert graph-derived activity rows validate and reference Module 1 skill IDs.
  - Created `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
  - 9 tests covering activity map projection, SRS projection, teacher evidence, mode coverage, SRS eligibility, and blueprint alignment.

- [x] **Task 1.4: Add rendering smoke test** [checkpoint: 7e8f3a2]
  - Render pilot harness for worked, guided, and independent modes.
  - Created `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-rendering.test.ts`
  - 8 tests covering blueprint schema validation, renderer compatibility, generator readiness, mode support, and mode coverage counts.

## Phase 2: Graph Artifacts

- [x] **Task 2.1: Extract Module 1 nodes** [checkpoint: 7e8f3a2]
  - Used existing extraction utilities from `standard-edges.json`.
  - Wrote `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
  - 145 nodes: domain, 16 skills, 15 concepts, 52 worked examples, 8 instructional units, 1 content group, 44 standards, 4 generators, 5 renderers.

- [x] **Task 2.2: Assign Module 1 standards** [checkpoint: 7e8f3a2]
  - Used IM3 standards from `standard-edges.json`.
  - Wrote `apps/integrated-math-3/curriculum/skill-graph/module-1/standard-edges.json`
  - 809 aligned_to_standard edges + 44 standard nodes.

- [x] **Task 2.3: Author Module 1 edges** [checkpoint: 7e8f3a2]
  - Added containment, placement, prerequisite, support, renderer, and generator edges.
  - Wrote `apps/integrated-math-3/curriculum/skill-graph/module-1/edges.json`
  - 144 edges: contains (25), appears_in_context (35), prerequisite_for (10), supports (16), rendered_by (55), generated_by (3).

## Phase 3: Blueprints and Generators

- [x] **Task 3.1: Create Module 1 blueprints** [checkpoint: 7e8f3a2]
  - Author blueprint rows for all generator-ready Module 1 skills.
  - Wrote `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
  - 6 blueprints: 3 with full worked/guided/independent specs + generator, 3 with worked+guided only (exception documented for missing generator).

- [x] **Task 3.2: Implement generator subset** [checkpoint: 7e8f3a2]
  - Added deterministic generators for: quadratic-graph-analysis, average-rate-of-change, solve-quadratic-by-graphing.
  - Updated `packages/math-content/src/knowledge-space/generators/registry.ts` with seeded random, proper GeneratorOutput types, grading metadata.
  - Stubs preserved for algebraic-step-solver, graphing-explorer, statistics.

- [x] **Task 3.3: Add grading metadata** [checkpoint: 7e8f3a2]
  - Generator outputs include partAnswers, partMaxScores, partGradingRules, and partTolerances.
  - Grading metadata keys are consistent across all three maps.

## Phase 4: Runtime Projection and Harness

- [x] **Task 4.1: Generate practice.v1 projection** [checkpoint: a1b2c3d]
  - Write `projection/practice-v1-activity-map.json`.
  - 15 activities (6 worked, 6 guided, 3 independent), 6 SRS entries, teacher evidence with 9 standards and 31 skills.

- [x] **Task 4.2: Build dev-only pilot harness**
  - Dev-only test suite validates rendering across worked, guided, and independent modes.
  - Blueprint validation tests cover schema, renderer compatibility, generator readiness, and mode support.

- [x] **Task 4.3: Wire submission path**
  - Generator output produces valid grading metadata with part IDs.
  - `genericEvidenceToSubmissionParts` bridges generator output to practice.v1 parts.
  - Submission provenance includes skill-graph-pilot:nodeId format.

- [x] **Task 4.4: Project teacher evidence**
  - Teacher evidence projection includes 9 standards, 31 skills, and 6 attempt artifacts.
  - SRS inputs reference prerequisites and generator keys for generator-ready blueprints.

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