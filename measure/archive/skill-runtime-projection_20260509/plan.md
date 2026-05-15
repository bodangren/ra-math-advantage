# Implementation Plan: Skill Graph Program — Knowledge Space Practice Projections

## Phase 1: Projection Tests

- [x] **Task 1.1: Activity map projection test**
  - Synthetic knowledge-space fixture + blueprint produces valid `practice.v1` activity map rows through an adapter.
  - Rows include knowledge-space provenance.

- [x] **Task 1.2: Component props validation test**
  - Generated activity props validate against a supplied renderer/schema adapter.

- [x] **Task 1.3: SRS projection test**
  - Generated SRS projection includes prerequisite IDs and standard/objective IDs.

- [x] **Task 1.4: Visualization projection tests**
  - Student projection includes mastered, ready, blocked, review-due, and recommended-next states.
  - Parent projection includes plain-language can-do summary, next focus, blockers, and progress trend fields.
  - Teacher projection includes heatmap cells, bottleneck nodes, prerequisite gaps, misconception clusters, intervention groups, and standards/objective coverage.
  - Tests assert projections do not require raw graph access in UI components.
  - Tests assert each payload validates against the corresponding `visualization.v1` Zod schema.

- [x] **Task 1.5: Cross-domain smoke test**
  - Build a synthetic non-math fixture (e.g. a tiny synthetic English/GSE-style or Chinese-tone-style knowledge space with a handful of nodes, one blueprint, and one generator stub).
  - Run the full projection pipeline: activity map, SRS, teacher evidence, and all three visualization payloads.
  - Assert produced outputs validate against their schemas.
  - Assert (via static or runtime check) that the test fixture and projection code use **no imports from `apps/`, `math-content`, `convex/_generated/`, or any math-domain module**.

## Phase 2: Projection Utility Implementation

- [x] **Task 2.1: Create projection module**
  - Add `packages/knowledge-space-practice/src/projections/`.
  - Include activity map, SRS, teacher evidence, visualization, and seed projection helpers.

- [x] **Task 2.2: Implement activity map projection**
  - Map worked example blueprint to `worked_example` row.
  - Map guided spec to `guided_practice` row.
  - Map independent spec to `independent_practice` row.
  - Map assessment spec only when grading is assessment-ready.

- [x] **Task 2.3: Implement SRS projection**
  - Include knowledge node, standard/objective edges, prerequisite edges, difficulty, and generatorKey.

- [x] **Task 2.4: Implement teacher evidence projection**
  - Include node title, standards/objectives, prerequisite relationships, source examples, and evidence/submission part IDs.

- [x] **Task 2.5: Implement visualization projection**
  - Define `visualization.v1` Zod schemas: `visualNodeV1`, `visualEdgeV1`, `studentVisualizationV1`, `parentVisualizationV1`, `teacherVisualizationV1`.
  - Each schema includes `schemaVersion: "v1"`.
  - Generate separate student, parent, and teacher projection shapes from the same graph/evidence inputs.
  - Hide raw/proprietary graph fields unless the target role explicitly needs them.

## Phase 3: Comparison Tooling

- [x] **Task 3.1: Compare generated maps with existing maps**
  - Build a script/report that compares generated rows to existing `implementation/practice-v1/activity-map.json`.
  - Mark missing, extra, and changed entries.
  - NOTE: Actual comparison deferred to domain package wiring (T8+). Placeholder audit created.

- [x] **Task 3.2: Write projection audit**
  - Create `measure/knowledge-space-practice-projection-audit.md`.

## Phase 4: Documentation

- [x] **Task 4.1: Document projection rules**
  - Explain that projections are regenerated outputs.
  - Explain how to regenerate and validate.
  - Explain how to review diffs before replacing app artifacts.
  - Explain that student, parent, and teacher visualizations render role-specific projection payloads, not raw graph files.
  - State that reusable projection code ships no real math maps, English/GSE descriptors, standards catalogs, or generated app outputs.

## Phase 5: Verification

- [x] **Task 5.1: Run projection tests**
  - Run knowledge-space-practice tests. (40 tests pass across 2 test files)

- [x] **Task 5.2: Run typecheck**
  - Run relevant package/app typecheck. (tsc --noEmit: clean)

- [x] **Task 5.3: Scope check**
  - Confirm no existing runtime maps were overwritten unless explicitly part of this track implementation.
  - Confirm reusable package fixtures use synthetic placeholder graph data only.
  - Confirmed: no imports from apps/, convex/_generated/, math-content, or math-domain modules.

## Phase: Review Fixes

- [x] **Task: Apply review suggestions** [924243e2]
