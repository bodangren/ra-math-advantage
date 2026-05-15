# Implementation Plan: Skill Graph Program — Integrated Math 3 Rollout

## Phase 1: Pilot Handoff

- [x] **Task 1.1: Read pilot audit**
  - Accepted patterns: node/edge/blueprint/activity-map/SRS/teacher-evidence formats (6 patterns)
  - Required corrections: deduplicate 14 M1 rendered_by edges, complete concept blueprint coverage, implement 13 remaining M1 generators, add rendering harness, map rate-of-change-calculator

- [x] **Task 1.2: Freeze Module 1 graph artifacts**
  - Module 1: 146 nodes, 144 edges, 6 blueprints — all validate and preserved verbatim in course-level merge

## Phase 2: Modules 2-4

- [x] **Task 2.1: Generate nodes and standards**
  - Module 2: 46 nodes (9 skills, 10 concepts, 20 examples, 5 IUs, 1 domain)
  - Module 3: 38 nodes (7 skills, 8 concepts, 16 examples, 6 IUs, 1 domain)
  - Module 4: 69 nodes (13 skills, 13 concepts, 33 examples, 8 IUs, 1 domain)

- [x] **Task 2.2: Generate edges**
  - Module 2: 248 edges (contains 53, appears_in_context 39, prerequisite_for 5, supports 90, aligned_to_standard 61)
  - Module 3: 192 edges
  - Module 4: 397 edges

- [x] **Task 2.3: Create blueprints/generator mappings**
  - Module 2: 19 blueprints (9 skills + 10 concepts), renderers: graphing-explorer (7), step-by-step-solver (6), comprehension-quiz (6)
  - Module 3: 15 blueprints, renderers: graphing-explorer (6), step-by-step-solver (5), comprehension-quiz (4)
  - Module 4: 26 blueprints, renderers: graphing-explorer (11), step-by-step-solver (8), comprehension-quiz (7)

## Phase 3: Modules 5-7

- [x] **Task 3.1: Generate nodes and standards**
  - Module 5: 50 nodes (8 skills, 8 concepts, 24 examples, 8 IUs, 1 domain)
  - Module 6: 50 nodes (7 skills, 11 concepts, 24 examples, 7 IUs, 1 domain)
  - Module 7: 62 nodes (12 skills, 13 concepts, 30 examples, 6 IUs, 1 domain)

- [x] **Task 3.2: Generate edges**
  - Module 5: 270 edges
  - Module 6: 276 edges
  - Module 7: 359 edges

- [x] **Task 3.3: Create blueprints/generator mappings**
  - Module 5: 16 blueprints, renderers: step-by-step-solver (5), graphing-explorer (4), comprehension-quiz (7)
  - Module 6: 18 blueprints, renderers: step-by-step-solver (7), graphing-explorer (2), comprehension-quiz (9)
  - Module 7: 25 blueprints, renderers: step-by-step-solver (10), graphing-explorer (5), comprehension-quiz (10)

## Phase 4: Modules 8-9

- [x] **Task 4.1: Generate nodes and standards**
  - Module 8: 50 nodes (10 skills, 10 concepts, 25 examples, 4 IUs, 1 domain)
  - Module 9: 71 nodes (14 skills, 15 concepts, 36 examples, 5 IUs, 1 domain)

- [x] **Task 4.2: Generate edges**
  - Module 8: 335 edges
  - Module 9: 448 edges

- [x] **Task 4.3: Create blueprints/generator mappings**
  - Module 8: 20 blueprints, renderers: comprehension-quiz (19), step-by-step-solver (1) — visualization gaps marked for stats-distribution-plotter
  - Module 9: 29 blueprints, renderers: comprehension-quiz (20), graphing-explorer (9) — visualization gaps marked for trig-unit-circle-visualizer

## Phase 5: Complete IM3 Projection

- [x] **Task 5.1: Generate full IM3 practice map projection**
  - `projection/practice-v1-activity-map.json`: 351 activities (174 worked, 174 guided, 3 independent), M1-9 combined

- [x] **Task 5.2: Generate SRS and teacher projections**
  - `projection/srs-input.json`: 174 entries, 3 generator-ready (M1 only)
  - `projection/teacher-evidence-map.json`: 8 standards, 174 skills, 3 attempt artifacts

- [x] **Task 5.3: Generate course-level blueprints.json**
  - `blueprints.json`: 174 blueprints, M1 pilot preserved verbatim, M2-9 stub blueprints generated
  - `nodes.json`: 574 course-level nodes (merged from all 9 modules)

## Phase 6: Audit and Review

- [x] **Task 6.1: Write IM3 rollout audit**
  - Created `measure/skill-graph-im3-rollout-audit.md`: overview, module-by-module coverage, generator coverage (3.125%), component gaps, known tech-debt, required corrections

- [x] **Task 6.2: Create review queues**
  - `standards-review-queue.json`: 44 low-confidence prerequisites
  - `generator-gap-queue.json`: 171 generator gaps (all M2-9 skills + concepts)
  - `component-gap-queue.json`: 7 component gaps (includes trig-unit-circle-visualizer, stats-distribution-plotter)

## Phase 7: Verification

- [x] **Task 7.1: Run graph validation**
  - Course-level: 574 nodes, 2708 edges, ALL edges reference valid nodes
  - Per-module: cross-module edge references are expected (edges can span modules)
  - M1: 14 known duplicate edges (documented in tech-debt)

- [x] **Task 7.2: Run projection validation**
  - All 351 activity rows validate (stableActivityId, nodeId, mode, rendererKey present)
  - Mode distribution correct: 174 worked, 174 guided, 3 independent (M1 generators only)
  - SRS: 174 entries, attempt artifacts: 3 (M1 generator-backed skills)

- [x] **Task 7.3: Run representative runtime tests**
  - `packages/knowledge-space-core`: 3 test files, 76 tests PASSED
  - IM3 app tests: 0 test files found (skill graph tests in knowledge-space-core)
  - TypeScript: pre-existing test file errors only (SVGGElement types), no new errors introduced

- [x] **Task 7.4: Manual sample review**
  - Module 2 Lesson 1: `math.im3.skill.2.1.graph-and-analyze-power-functions` → `graphing-explorer` ✓
  - Module 5 Lesson 1: `math.im3.skill.5.1.graph-exponential-growth-functions` → `graphing-explorer` ✓
  - Module 8 Lesson 1: `math.im3.skill.8.1.classify-sampling-methods` → `comprehension-quiz` ✓
  - Module 9 Lesson 1: `math.im3.skill.9.1.draw-angles-in-standard-position` → `comprehension-quiz` ✓
