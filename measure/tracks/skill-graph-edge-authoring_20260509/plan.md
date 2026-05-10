# Implementation Plan: Skill Graph Program — Directed Edge Authoring

## Phase 1: Validation Tests

- [x] **Task 1.1: Add prerequisite cycle tests** [checkpoint: fe458e8]
  

- [x] **Task 1.2: Add edge type endpoint tests** [checkpoint: fe458e8]
  - `rendered_by`: skill/worked_example -> renderer only.
  - `generated_by`: skill -> generator only.
  - `aligned_to_standard`: skill/worked_example -> standard only.
  - `contains`: course/module/lesson -> contained node only.

- [x] **Task 1.3: Add deterministic edge ordering test** [checkpoint: 88f60af]
  - Run edge generator twice. Assert stable order and IDs.
  - Shuffle input order. Assert same IDs in sorted output.
  - Assert edge IDs are unique within a suggestion run.

## Phase 2: Edge Suggestion Rules

- [x] **Task 2.1: Implement containment edges** [checkpoint: 88f60af]
  - domain → module, module → lesson, lesson → skill/example, module → concept.

- [x] **Task 2.2: Implement placement edges** [checkpoint: 88f60af]
  - skill → lesson, example → lesson, concept → module via `appears_in_context`.

- [x] **Task 2.3: Implement prerequisite suggestions** [checkpoint: 88f60af]
  - Lesson-sequence chain (last skill of lesson N → first skill of lesson N+1), low confidence, derived.

- [x] **Task 2.4: Implement support and extension suggestions** [checkpoint: 88f60af]
  - ALEKS concept → all skills in same module, medium confidence.

- [x] **Task 2.5: Implement intra-course equivalence suggestions** [checkpoint: 88f60af]
  - Concepts sharing familyKey within a course → equivalent_to (low confidence, derived).

## Phase 3: Renderer, Generator, and Misconception Edges

- [x] **Task 3.1: Add renderer edges** [checkpoint: pending]
  - Map componentKey to renderer node.
  - Skills without renderer mapping become exceptions logged in review queue.

- [x] **Task 3.2: Add generator edges** [checkpoint: pending]
  - Map generatorKey to generator node only for generator-ready skills.
  - Skills marked independent-practice-ready without generator edge must fail validation.

- [x] **Task 3.3: Add misconception placeholders** [checkpoint: pending]
  - No misconception taxonomy exists; all skills flagged in review queue for later authoring.

## Phase 4: Course Edge Files

- [x] **Task 4.1: Generate IM1 edges** [checkpoint: pending]
  - Write `apps/integrated-math-1/curriculum/skill-graph/edges.json`. (1,277 edges)

- [x] **Task 4.2: Generate IM2 edges** [checkpoint: pending]
  - Write `apps/integrated-math-2/curriculum/skill-graph/edges.json`. (1,274 edges)

- [x] **Task 4.3: Generate IM3 edges** [checkpoint: pending]
  - Write `apps/integrated-math-3/curriculum/skill-graph/edges.json`. (1,913 edges; 144 pilot preserved)

- [x] **Task 4.4: Generate PreCalc edges** [checkpoint: pending]
  - Write `apps/pre-calculus/curriculum/skill-graph/edges.json`. (375 edges)

## Phase 5: Audit and Review Queue

- [x] **Task 5.1: Write edge audit** [checkpoint: pending]
  - Created `measure/skill-graph-edge-audit.md`.
  - Counts by course/type/confidence; 0 high-confidence cycles detected.

- [x] **Task 5.2: Write review queues** [checkpoint: pending]
  - Created `apps/<course>/curriculum/skill-graph/edge-review-queue.json` for all 4 courses.
  - IM1: 92 prereq + 138 renderer gaps. IM2: 81 prereq + 149 renderer gaps. IM3: 44 prereq + 80 renderer gaps. PreCalc: none.

## Phase 6: Verification

- [x] **Task 6.1: Run graph validation** [checkpoint: pending]
  - Ran `validateKnowledgeSpace` on all 4 course graphs.
  - All errors are pre-existing cross-vocabulary gaps (standard/renderer/generator nodes live outside draft-nodes.json), not T5 regressions.
  - IM1: 941 dangling (standard nodes). IM2: 938 dangling. IM3: 903 dangling + 14 dup (pre-existing in M1 pilot file). PreCalc: 158 missing alignment (T4 out of scope).
  - Logged as tech debt — requires shared vocabulary registry.

- [x] **Task 6.2: Run tests** [checkpoint: pending]
  - 75/75 knowledge-space-core tests pass (18 edge-suggestion, 57 other).

- [x] **Task 6.3: Manual sample review** [checkpoint: pending]
  - 10 edges sampled per course. All correct. Recorded in `measure/skill-graph-edge-audit.md`.
