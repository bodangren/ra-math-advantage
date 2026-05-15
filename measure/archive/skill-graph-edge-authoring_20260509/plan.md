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

- [x] **Task 3.1: Preserve renderer edges and queue renderer gaps** [checkpoint: pending]
  - Preserved IM3 M1 pilot `rendered_by` edges.
  - Draft nodes outside the pilot do not expose renderer/component keys; skills without mappings are logged in review queues.

- [x] **Task 3.2: Preserve generator edges and validate generator readiness** [checkpoint: pending]
  - Preserved IM3 M1 pilot `generated_by` edges.
  - Non-pilot nodes are not marked `independentPracticeReady`; future rollout tracks must add generator keys before enabling runtime projections.

- [x] **Task 3.3: Queue misconception taxonomy gaps** [checkpoint: pending]
  - No misconception taxonomy exists; all skills are flagged in review queues for later authoring.

## Phase 4: Course Edge Files

- [x] **Task 4.1: Generate IM1 edges** [checkpoint: pending]
  - Write `apps/integrated-math-1/curriculum/skill-graph/edges.json`. (724 nodes, 2,218 edges)

- [x] **Task 4.2: Generate IM2 edges** [checkpoint: pending]
  - Write `apps/integrated-math-2/curriculum/skill-graph/edges.json`. (722 nodes, 2,212 edges)

- [x] **Task 4.3: Generate IM3 edges** [checkpoint: pending]
  - Write `apps/integrated-math-3/curriculum/skill-graph/edges.json`. (574 nodes, 2,708 edges; 144 pilot edges merged, 32 unique renderer edges preserved)

- [x] **Task 4.4: Generate PreCalc edges** [checkpoint: pending]
  - Write `apps/pre-calculus/curriculum/skill-graph/edges.json`. (252 nodes, 669 edges)

## Phase 5: Audit and Review Queue

- [x] **Task 5.1: Write edge audit** [checkpoint: pending]
  - Created `measure/skill-graph-edge-audit.md`.
  - Counts by course/type/confidence; 0 high-confidence cycles detected.
  - Updated after review remediation to include merged standard alignment edges and direct graph validation results.

- [x] **Task 5.2: Write review queues** [checkpoint: pending]
  - Created `apps/<course>/curriculum/skill-graph/edge-review-queue.json` for all 4 courses.
  - IM1: 92 prereq + 138 renderer gaps. IM2: 81 prereq + 149 renderer gaps. IM3: 44 prereq + 80 renderer gaps. PreCalc: none.

## Phase 6: Verification

- [x] **Task 6.1: Run graph validation** [checkpoint: pending]
  - Ran `validateKnowledgeSpace` on all 4 generated course graph artifacts after merging standard/pilot node registries.
  - IM1, IM2, IM3, and PreCalc all validate with 0 errors.

- [x] **Task 6.2: Run tests** [checkpoint: pending]
  - 76/76 knowledge-space-core tests pass (19 edge-suggestion, 57 other).

- [x] **Task 6.3: Manual sample review** [checkpoint: pending]
  - 10 edges sampled per course. All correct. Recorded in `measure/skill-graph-edge-audit.md`.

## Review Remediation

- [x] **Task R1: Apply T5 review fixes** [checkpoint: e6722aa]
  - Merge standard alignment nodes/edges into generated course graph artifacts so `validateKnowledgeSpace` can validate the generated `edges.json` files directly.
  - Normalize generated edge weights to the spec-defined values.
  - Make Phase 3 plan/audit language truthful to the current renderer/generator/misconception registry coverage.
  - Restore package lint/typecheck/test and whitespace gates.
  - Verification: `npx tsx scripts/generate-course-edges.ts`; direct `validateKnowledgeSpace` check for IM1/IM2/IM3/PreCalc; spec-weight check; `CI=true npm test --workspace=packages/knowledge-space-core`; `CI=true npm run lint --workspace=packages/knowledge-space-core`; `CI=true npm run typecheck --workspace=packages/knowledge-space-core`; `git diff --check`.
