# Implementation Plan: Skill Graph Program — Integrated Math 2 Rollout

## Phase 1: Reconciliation Gate

- [ ] **Task 1.1: Inventory current IM2 lesson catalogs**
  - Count all current `module-*-lesson-*` files.
  - Compare against old 70/96/109 count claims.
  - Record authoritative count in audit.

- [ ] **Task 1.2: Inventory stale IM2 artifacts**
  - List old unit-based class-period plans, implementation artifacts, and problem-family files.
  - Mark whether each is source evidence, projection baseline, or deprecated direction.

## Phase 2: Nodes and Standards

- [ ] **Task 2.1: Generate final IM2 nodes**
  - Promote draft nodes from latest module catalogs.

- [ ] **Task 2.2: Generate standard edges**
  - Use current IM2 standards seed files.
  - Reconcile old lesson slugs only with source-backed mapping.

- [ ] **Task 2.3: Validate all standard mappings**
  - Missing or low-confidence mappings go into review queue.

## Phase 3: Edges

- [ ] **Task 3.1: Generate containment and placement edges**
  - course/module/lesson/example/skill hierarchy.

- [ ] **Task 3.2: Generate prerequisite/support/extension edges**
  - Use module sequence, geometry dependencies, standards, and problem families.

- [ ] **Task 3.3: Add equivalence edges**
  - Link IM2 algebra/function/trig skills to IM1, IM3, or PreCalc equivalents when supported.

## Phase 4: Blueprints and Generators

- [ ] **Task 4.1: Create IM2 blueprints**
  - Include worked/guided/independent specs where source and component support are sufficient.

- [ ] **Task 4.2: Classify component needs**
  - Algebra/function/trig: likely existing engines.
  - Geometry constructions/diagrams: likely exceptions or future component needs.
  - Probability/statistics: quiz/table/generator mapping where feasible.

- [ ] **Task 4.3: Validate generator readiness**
  - All independent-practice-ready skills need deterministic generator and grading metadata.

## Phase 5: Runtime Projection

- [ ] **Task 5.1: Generate IM2 practice map projection**
  - Write `projection/practice-v1-activity-map.json`.

- [ ] **Task 5.2: Generate SRS and teacher projections**
  - Write `srs-input.json` and `teacher-evidence-map.json`.

- [ ] **Task 5.3: Compare with existing IM2 activity map**
  - Report missing/stale/changed entries.

## Phase 6: Audit and Review

- [ ] **Task 6.1: Write rollout audit**
  - Create `measure/skill-graph-im2-rollout-audit.md`.

- [ ] **Task 6.2: Create review queues**
  - Standards, edges, generator gaps, geometry-renderer gaps.

## Phase 7: Verification

- [ ] **Task 7.1: Run graph and projection validation**
  - No dangling references.
  - No invalid component props.

- [ ] **Task 7.2: Run relevant tests**
  - Package tests and IM2 checks.

- [ ] **Task 7.3: Manual sample review**
  - At least one lesson per module.
  - Include geometry-heavy modules in sample.
