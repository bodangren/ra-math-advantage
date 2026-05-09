# Implementation Plan: Skill Graph Program — Directed Edge Authoring

## Phase 1: Validation Tests

- [ ] **Task 1.1: Add prerequisite cycle tests**
  - Build fixture graph with a high-confidence cycle.
  - Assert validation fails unless cycle is documented as an exception.

- [ ] **Task 1.2: Add edge type endpoint tests**
  - `rendered_by`: skill/worked_example -> renderer only.
  - `generated_by`: skill -> generator only.
  - `aligned_to_standard`: skill/worked_example -> standard only.
  - `contains`: course/module/lesson -> contained node only.

- [ ] **Task 1.3: Add deterministic edge ordering test**
  - Run edge generator twice.
  - Assert stable order and IDs.

## Phase 2: Edge Suggestion Rules

- [ ] **Task 2.1: Implement containment edges**
  - course -> module
  - module -> lesson
  - lesson -> worked_example
  - worked_example -> skill where extracted from the example

- [ ] **Task 2.2: Implement placement edges**
  - skill -> lesson using `appears_in_lesson`.
  - worked_example -> lesson using `appears_in_lesson`.

- [ ] **Task 2.3: Implement prerequisite suggestions**
  - Use module/lesson progression as low-confidence default.
  - Upgrade to medium when standard/family evidence supports dependency.
  - Upgrade to high only when source text or manual review confirms.

- [ ] **Task 2.4: Implement support and extension suggestions**
  - Same lesson or same family = `supports`.
  - Later, harder version of same family = `extends`.
  - Use difficulty and title cues only as low/medium confidence.

- [ ] **Task 2.5: Implement equivalence suggestions**
  - Same normalized familyKey or exact duplicate skill label across courses = `same_underlying_skill_as`.
  - Mark cross-course matches medium unless manually reviewed.

## Phase 3: Renderer, Generator, and Misconception Edges

- [ ] **Task 3.1: Add renderer edges**
  - Map componentKey to renderer node.
  - Skills without renderer mapping become exceptions.

- [ ] **Task 3.2: Add generator edges**
  - Map generatorKey to generator node only for generator-ready skills.
  - Skills marked independent-practice-ready without generator edge must fail validation.

- [ ] **Task 3.3: Add misconception placeholders**
  - Create misconception nodes only where source evidence or existing distractor/misconception taxonomy supports them.
  - Otherwise leave TODO exceptions for later review.

## Phase 4: Course Edge Files

- [ ] **Task 4.1: Generate IM1 edges**
  - Write `apps/integrated-math-1/curriculum/skill-graph/edges.json`.

- [ ] **Task 4.2: Generate IM2 edges**
  - Write `apps/integrated-math-2/curriculum/skill-graph/edges.json`.

- [ ] **Task 4.3: Generate IM3 edges**
  - Write `apps/integrated-math-3/curriculum/skill-graph/edges.json`.

- [ ] **Task 4.4: Generate PreCalc edges**
  - Write `apps/pre-calculus/curriculum/skill-graph/edges.json`.

## Phase 5: Audit and Review Queue

- [ ] **Task 5.1: Write edge audit**
  - Create `measure/skill-graph-edge-audit.md`.
  - Include counts by course/type/confidence.
  - Include high-confidence cycle report.

- [ ] **Task 5.2: Write review queues**
  - Create `apps/<course>/curriculum/skill-graph/edge-review-queue.json`.
  - Include all low-confidence prerequisite and misconception edges.

## Phase 6: Verification

- [ ] **Task 6.1: Run graph validation**
  - Validate all course graphs.

- [ ] **Task 6.2: Run tests**
  - Run skill graph contract and edge-generation tests.

- [ ] **Task 6.3: Manual sample review**
  - Review at least 10 edges per course.
  - Record examples in audit report.
