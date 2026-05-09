# Implementation Plan: Skill Graph Program — AP Precalculus Rollout

## Phase 1: Source and Exception Gate

- [ ] **Task 1.1: Verify PreCalc source hierarchy**
  - Read `apps/pre-calculus/curriculum/README.md`.
  - Confirm CED and clarification/guidance artifacts exist.
  - Confirm Passwater source coverage for Units 1-3.
  - Confirm Unit 4 exception remains documented.

- [ ] **Task 1.2: Inventory current PreCalc graph-relevant artifacts**
  - Topic files.
  - Passwater source docs.
  - class-period packages.
  - practice map.
  - problem-family registry.

## Phase 2: Nodes and Standards

- [ ] **Task 2.1: Generate PreCalc nodes**
  - course, unit, topic/lesson, skill, worked_example, standard, problem_family nodes.

- [ ] **Task 2.2: Generate CED learning-objective edges**
  - Use official CED topic and learning-objective evidence.
  - Passwater references may support scaffolding, not official standards.

- [ ] **Task 2.3: Validate source coverage**
  - Every source-backed skill has source references.
  - Unit 4 source-limited skills have explicit exceptions.

## Phase 3: Edges

- [ ] **Task 3.1: Generate containment and placement edges**
  - course -> unit -> topic/lesson -> example -> skill.

- [ ] **Task 3.2: Generate prerequisite/support/extension edges**
  - Use AP topic sequence, CED prerequisite logic, Passwater scaffolding, and family overlap.

- [ ] **Task 3.3: Preserve AP task context**
  - Add FRQ/calculator/task-model metadata to nodes or edges according to the accepted contract.

## Phase 4: Blueprints and Generators

- [ ] **Task 4.1: Create PreCalc blueprints**
  - Worked/guided/independent specs for source-backed skills.

- [ ] **Task 4.2: Map existing renderers/generators**
  - Graphing, algebraic, rate-of-change, trig, polar/vector/matrix skills where supported.

- [ ] **Task 4.3: Document unsupported skills**
  - Polar, vector, matrix, or AP-specific FRQ workflows may require future components/generators.

## Phase 5: Runtime Projection

- [ ] **Task 5.1: Generate practice map projection**
  - Write `projection/practice-v1-activity-map.json`.

- [ ] **Task 5.2: Generate SRS projection**
  - Include AP topic, standard, prerequisite, and calculator/FRQ metadata where relevant.

- [ ] **Task 5.3: Generate teacher evidence map**
  - Include AP topic coverage and FRQ-related evidence metadata.

## Phase 6: Audit and Review

- [ ] **Task 6.1: Write PreCalc rollout audit**
  - Create `measure/skill-graph-precalc-rollout-audit.md`.
  - Include coverage by unit/topic, source type, standards, FRQ, calculator, component, generator readiness, and exceptions.

- [ ] **Task 6.2: Create review queues**
  - Low-confidence standards.
  - Low-confidence edges.
  - Unit 4 source limitations.
  - Unsupported component/generator gaps.

## Phase 7: Verification

- [ ] **Task 7.1: Run graph validation**
  - Validate all PreCalc graph artifacts.

- [ ] **Task 7.2: Run projection validation**
  - Validate activity map rows and component props.

- [ ] **Task 7.3: Run relevant tests**
  - Package tests and PreCalc app checks.

- [ ] **Task 7.4: Manual sample review**
  - At least two source-backed topics per AP unit.
  - Include one source-limited Unit 4 sample exception.
