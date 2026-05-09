# Implementation Plan: Skill Graph Program — Cross-Course Equivalence

## Phase 1: Tests First

- [ ] **Task 1.1: Add endpoint validation tests**
  - Edge with source/target in the same course fails validation.
  - Edge with non-existent endpoint fails validation.
  - Edge with valid cross-course endpoints passes.

- [ ] **Task 1.2: Add familyKey match tests**
  - Two skills with same `familyKey` and aligned standards produce a high-confidence `equivalent_to` edge.
  - Two skills with same `familyKey` but no standard overlap produce medium confidence.
  - Title-only match produces low confidence and lands in the review queue.

- [ ] **Task 1.3: Add component computation test**
  - Three skills A→B→C connected by `equivalent_to` form one component.
  - Component listing is deterministic.

## Phase 2: Generation

- [ ] **Task 2.1: Load four per-course graphs**
  - Read each course's `nodes.json` + `edges.json`.
  - Build a unified node lookup for endpoint validation.

- [ ] **Task 2.2: Match by familyKey and standards**
  - Group skills by normalized `familyKey`.
  - For each group spanning multiple courses, emit pairwise `equivalent_to` edges.
  - Score confidence using rules from spec.

- [ ] **Task 2.3: Match by title heuristic (low confidence only)**
  - Slug/title fuzzy match.
  - Always low confidence; never high.

## Phase 3: Audit and Projection Updates

- [ ] **Task 3.1: Write audit**
  - Create `measure/skill-graph-cross-course-equivalence-audit.md`.
  - Include pair counts, components, and review queue.

- [ ] **Task 3.2: Update SRS projection**
  - Adapter treats equivalence components as single learner-state targets.

- [ ] **Task 3.3: Update teacher evidence projection**
  - Surface evidence from equivalent skills across courses.

## Phase 4: Verification

- [ ] **Task 4.1: Run tests**
  - Run cross-course equivalence tests and projection adapter tests.

- [ ] **Task 4.2: Validate cross-course edge file**
  - Run `knowledge-space.v1` validation against the merged graph.
  - Confirm no dangling endpoints, no same-course `equivalent_to` edges.

- [ ] **Task 4.3: Manual sample review**
  - Review at least one component per course pair.
  - Record findings in the audit.
