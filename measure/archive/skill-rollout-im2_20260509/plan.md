# Implementation Plan: Skill Graph Program — Integrated Math 2 Rollout

## Phase 1: Reconciliation Gate

- [x] **Task 1.1: Inventory current IM2 lesson catalogs**
  - Count all current `module-*-lesson-*` files.
  - Compare against old 70/96/109 count claims.
  - Record authoritative count in audit.
  - **Commit**: 13 module class-period plans, 82 extracted lessons, 252 class-period packages. Audit in `measure/skill-graph-im2-rollout-audit.md`.

- [x] **Task 1.2: Inventory stale IM2 artifacts**
  - List old unit-based class-period plans, implementation artifacts, and problem-family files.
  - Mark whether each is source evidence, projection baseline, or deprecated direction.
  - **Commit**: 13 unit-N.json wrappers (deprecated), 239 module-N-pNN.json (source evidence), no problem-family files found.

## Phase 2: Nodes and Standards

- [x] **Task 2.1: Generate final IM2 nodes**
  - Promote draft nodes from latest module catalogs.
  - **Commit**: `nodes.json` — 645 nodes (549 approved: 149 skills + 400 worked_examples).

- [x] **Task 2.2: Generate standard edges**
  - Use current IM2 standards seed files.
  - Reconcile old lesson slugs only with source-backed mapping.
  - **Commit**: `standard-edges.json` already exists from T4 (77 standard nodes, 938 aligned_to_standard edges).

- [x] **Task 2.3: Validate all standard mappings**
  - Missing or low-confidence mappings go into review queue.
  - **Commit**: `standards-review-queue.json` — 307 items (all PLACEHOLDER_ALIGNMENT type from 41 missing standard definitions).

## Phase 3: Edges

- [x] **Task 3.1: Generate containment and placement edges**
  - course/module/lesson/example/skill hierarchy.
  - **Commit**: Pre-existing from T5 (644 contains + 549 appears_in_context = 1193 edges).

- [x] **Task 3.2: Generate prerequisite/support/extension edges**
  - Use module sequence, geometry dependencies, standards, and problem families.
  - **Commit**: Pre-existing from T5 (81 prerequisite_for edges; edge-review-queue.json contains low-confidence prereqs).

## Phase 4: Blueprints and Generators

- [x] **Task 4.1: Create IM2 blueprints**
  - Include worked/guided/independent specs where source and component support are sufficient.
  - **Commit**: `blueprints.json` — 149 stub blueprints (0 generators, all with exceptions).

- [x] **Task 4.2: Classify component needs**
  - Algebra/function/trig: likely existing engines.
  - Geometry constructions/diagrams: likely exceptions or future component needs.
  - Probability/statistics: quiz/table/generator mapping where feasible.
  - **Commit**: Classification in audit: ~106 geometry (fallback renderers), ~33 algebra/functions (step-by-step + graphing), ~15 trig (step-by-step), ~1 statistics (comprehension-quiz).

- [x] **Task 4.3: Validate generator readiness**
  - All independent-practice-ready skills need deterministic generator and grading metadata.
  - **Commit**: 0/149 skills are independentPracticeReady; all have generator exceptions.

## Phase 5: Runtime Projection

- [x] **Task 5.1: Generate IM2 practice map projection**
  - Write `projection/practice-v1-activity-map.json`.
  - **Commit**: 447 stub activities (149 skills × 3 modes), all srsEligible: false.

- [x] **Task 5.2: Generate SRS and teacher projections**
  - Write `srs-input.json` and `teacher-evidence-map.json`.
  - **Commit**: srs-input.json (149 skills, 0 eligible), teacher-evidence-map.json (149 skills with standards coverage and prerequisite context).

- [x] **Task 5.3: Compare with existing IM2 activity map**
  - Report missing/stale/changed entries.
  - **Commit**: No pre-existing IM2 practice-v1-activity-map found — this is the first projection for IM2.

## Phase 6: Audit and Review

- [x] **Task 6.1: Write rollout audit**
  - Create `measure/skill-graph-im2-rollout-audit.md`.
  - **Commit**: Full audit with node/edge counts, module coverage, standard gaps, renderer classification, generator readiness (0%).

- [x] **Task 6.2: Create review queues**
  - Standards, edges, generator gaps, geometry-renderer gaps.
  - **Commit**: `standards-review-queue.json` (307), `generator-gap-queue.json` (149), `geometry-renderer-gap-queue.json` (107).

## Phase 7: Verification

- [x] **Task 7.1: Run graph and projection validation**
  - No dangling references.
  - No invalid component props.
  - **Commit**: Structural validation passed — 0 duplicate node IDs, 0 dangling edges, 0 duplicate edges, 0 missing alignments, 0 invalid pairings, 0 prerequisite cycles.

- [x] **Task 7.2: Run relevant tests**
  - Package tests and IM2 checks.
  - **Commit**: `packages/knowledge-space-core` — 76 tests pass (3 files). `apps/integrated-math-2` — 51/96 pass (45 pre-existing failures from old unit-based naming convention, unrelated to skill graph artifacts).

- [x] **Task 7.3: Manual sample review**
  - At least one lesson per module.
  - Include geometry-heavy modules in sample.
  - **Commit**: All 13 modules sampled (1 lesson each). Skills approved, blueprints stubbed, examples approved. Geometry-heavy M1-M6 included.
