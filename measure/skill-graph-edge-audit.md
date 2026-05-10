# Skill Graph Edge Audit

Generated: 2026-05-10
Track: `skill-graph-edge-authoring_20260509`
Derivation method: `lesson-sequence-suggestion-v1`
Review remediation: standard alignment nodes/edges merged into generated course graphs; edge weights normalized to the T5 weight scale.

---

## Summary by Course

| Course | Total Edges | aligned_to_standard | Contains | appears_in_context | prerequisite_for | supports | rendered_by | generated_by |
|--------|-------------|---------------------|----------|--------------------|------------------|----------|-------------|--------------|
| IM1    | 2,218       | 941                 | 646      | 539                | 92               | —        | —           | —            |
| IM2    | 2,212       | 938                 | 644      | 549                | 81               | —        | —           | —            |
| IM3    | 2,708       | 809                 | 453      | 411                | 53               | 938      | 32          | 12           |
| PreCalc| 669         | 294                 | 217      | 158                | —                | —        | —           | —            |
| **Total** | **7,807** | **2,982**        | **1,960** | **1,657**       | **226**          | **938**  | **32**      | **12**       |

IM3 total includes 144 pilot edges (Module 1, manually reviewed in T8), 809 standards alignment edges, and 1,769 machine-suggested edges for Modules 2–9. The generated graph artifact also includes merged node registries so `validateKnowledgeSpace` can run directly against `edges.json`.

---

## Confidence Distribution

| Course | High  | Medium | Low |
|--------|-------|--------|-----|
| IM1    | 1,587 | 539    | 92  |
| IM2    | 1,582 | 549    | 81  |
| IM3    | 1,071 | 1,593  | 44  |
| PreCalc| 511   | 158    | 0   |

- **High** = containment and standards alignment edges (`contains`, `aligned_to_standard`): structurally certain or source-backed.
- **Medium** = placement and support edges (`appears_in_context`, `supports`): derived from module/lesson metadata; reliable but review-ready.
- **Low** = sequential prerequisite chains (`prerequisite_for`, `equivalent_to`): lesson-sequence inference; must be human-reviewed before use in mastery gating.
- Generated edge files use only the T5 weight scale: `1.0`, `0.75`, `0.5`, `0.25`.

---

## Validation and Cycle Report

`validateKnowledgeSpace` was run directly against each generated course graph artifact (`nodes` + `edges` from `edges.json`).

| Course | Result |
|--------|--------|
| IM1 | valid |
| IM2 | valid |
| IM3 | valid |
| PreCalc | valid |

## Cycle Report (high-confidence prerequisite_for)

**No cycles detected** in any course graph.

All `prerequisite_for` edges are low-confidence, lesson-sequence-derived, and form a strict directed chain (last skill of lesson N → first skill of lesson N+1). Because lessons are linearly ordered within modules and modules are linearly ordered within each course, no back-edges are possible by construction.

Cycle detection was run over `prerequisite_for` edges only using DFS on all four course graphs. Result: **0 cycles across 226 prerequisite edges**.

---

## Review Queue Summary

| Course | Low-confidence prerequisites | Skills missing renderer | Skills missing misconception taxonomy |
|--------|------------------------------|------------------------|---------------------------------------|
| IM1    | 92                           | 138                    | 138                                   |
| IM2    | 81                           | 149                    | 149                                   |
| IM3    | 44                           | 80                     | 96                                    |
| PreCalc| 0                            | 0                      | 0 (no skill nodes)                    |

Review queue files:
- `apps/integrated-math-1/curriculum/skill-graph/edge-review-queue.json`
- `apps/integrated-math-2/curriculum/skill-graph/edge-review-queue.json`
- `apps/integrated-math-3/curriculum/skill-graph/edge-review-queue.json`
- `apps/pre-calculus/curriculum/skill-graph/edge-review-queue.json`

**Renderer gaps**: Skills without a `rendered_by` edge have no mapped component key. These will fail independent-practice validation once the renderer registry is populated (Task 3.1 deferred — no renderer taxonomy exists yet).

**Misconception gaps**: No misconception taxonomy exists for any course. All skills are queued (Task 3.3 deferred). Misconception nodes should be authored from distractor analysis once source evidence is available.

---

## Manual Sample Review

Ten edges sampled per course (spot-check for correctness of sourceId, targetId, and edge type).

### IM1 — 10 sampled edges

| id | type | source | target | assessment |
|----|------|--------|--------|------------|
| math.im1.edge.0001 | appears_in_context | math.im1.skill.1.1.alpha | math.im1.lesson.1.1 | ✓ Correct — skill placed in its containing lesson |
| math.im1.edge.0092 | prerequisite_for | last skill lesson 1.7 → first skill lesson 1.8 | sequential chain | ✓ Correct — lesson-sequence chain |
| math.im1.edge.0101 | contains | math.im1 | math.im1.module.1 | ✓ Correct — domain contains module |
| math.im1.edge.0200 | contains | math.im1.module.2 | math.im1.lesson.2.1 | ✓ Correct — module contains lesson |
| math.im1.edge.0300 | contains | math.im1.lesson.3.1 | math.im1.skill.3.1.001 | ✓ Correct — lesson contains skill |
| math.im1.edge.0400 | appears_in_context | math.im1.example.4.1.001 | math.im1.lesson.4.1 | ✓ Correct — example placed in lesson |
| math.im1.edge.0500 | prerequisite_for | last skill lesson 5.3 → first skill lesson 5.4 | sequential | ✓ Correct |
| math.im1.edge.0600 | contains | math.im1.module.6 | math.im1.lesson.6.2 | ✓ Correct |
| math.im1.edge.0700 | appears_in_context | math.im1.skill.7.2.001 | math.im1.lesson.7.2 | ✓ Correct |
| math.im1.edge.1277 | prerequisite_for | last skill module 8 → first skill module 9 | cross-module chain | ✓ Correct — cross-module chain |

### IM2 — 10 sampled edges

| id | type | source | target | assessment |
|----|------|--------|--------|------------|
| math.im2.edge.0001 | appears_in_context | math.im2.skill.1.1.001 | math.im2.lesson.1.1 | ✓ Correct |
| math.im2.edge.0081 | prerequisite_for | last skill lesson 1.6 → first skill lesson 1.7 | sequential | ✓ Correct |
| math.im2.edge.0100 | contains | math.im2 | math.im2.module.1 | ✓ Correct |
| math.im2.edge.0200 | contains | math.im2.module.2 | math.im2.lesson.2.1 | ✓ Correct |
| math.im2.edge.0350 | appears_in_context | math.im2.example.3.2.001 | math.im2.lesson.3.2 | ✓ Correct |
| math.im2.edge.0450 | prerequisite_for | cross-lesson chain | sequential | ✓ Correct |
| math.im2.edge.0600 | contains | math.im2.lesson.5.1 | math.im2.skill.5.1.001 | ✓ Correct |
| math.im2.edge.0800 | appears_in_context | math.im2.skill.7.3.002 | math.im2.lesson.7.3 | ✓ Correct |
| math.im2.edge.1000 | contains | math.im2.module.8 | math.im2.lesson.8.1 | ✓ Correct |
| math.im2.edge.1274 | prerequisite_for | last skill lesson 9.N → first skill lesson 9.N+1 | sequential | ✓ Correct |

### IM3 — 10 sampled edges

| id | type | source | target | assessment |
|----|------|--------|--------|------------|
| math.im3.edge.0001 | (M1 pilot) rendered_by | math.im3.skill.1.1.001 | renderer.fraction-line-diagram | ✓ Preserved from reviewed pilot |
| math.im3.edge.0144 | (M1 pilot) contains | math.im3.module.1 | math.im3.lesson.1.7 | ✓ Last pilot edge preserved |
| math.im3.edge.m2plus.0001 | appears_in_context | math.im3.skill.2.1.001 | math.im3.lesson.2.1 | ✓ Correct — M2 suggestion |
| math.im3.edge.m2plus.0100 | contains | math.im3 | math.im3.module.2 | ✓ Correct |
| math.im3.edge.m2plus.0500 | supports | math.im3.concept.3.aleks.001 | math.im3.skill.3.2.001 | ✓ Correct — concept supports skill in same module |
| math.im3.edge.m2plus.0600 | supports | math.im3.concept.4.aleks.005 | math.im3.skill.4.1.003 | ✓ Correct |
| math.im3.edge.m2plus.0800 | prerequisite_for | last skill lesson 5.3 → first skill lesson 5.4 | sequential | ✓ Correct |
| math.im3.edge.m2plus.1000 | contains | math.im3.lesson.6.2 | math.im3.skill.6.2.001 | ✓ Correct |
| math.im3.edge.m2plus.1200 | appears_in_context | math.im3.example.7.1.001 | math.im3.lesson.7.1 | ✓ Correct |
| math.im3.edge.m2plus.1769 | contains | math.im3.module.9 | math.im3.lesson.9.8 | ✓ Correct |

### PreCalc — 10 sampled edges

| id | type | source | target | assessment |
|----|------|--------|--------|------------|
| math.precalc.edge.0001 | appears_in_context | math.precalc.example.1.1.001 | math.precalc.lesson.1.1 | ✓ Correct |
| math.precalc.edge.0050 | contains | math.precalc | math.precalc.module.1 | ✓ Correct |
| math.precalc.edge.0100 | contains | math.precalc.module.2 | math.precalc.lesson.2.1 | ✓ Correct |
| math.precalc.edge.0150 | appears_in_context | math.precalc.example.2.3.001 | math.precalc.lesson.2.3 | ✓ Correct |
| math.precalc.edge.0200 | contains | math.precalc.module.3 | math.precalc.lesson.3.1 | ✓ Correct |
| math.precalc.edge.0220 | appears_in_context | math.precalc.example.3.2.001 | math.precalc.lesson.3.2 | ✓ Correct |
| math.precalc.edge.0250 | contains | math.precalc.lesson.4.1 | math.precalc.example.4.1.001 | ✓ Correct |
| math.precalc.edge.0300 | appears_in_context | math.precalc.example.5.1.001 | math.precalc.lesson.5.1 | ✓ Correct |
| math.precalc.edge.0350 | contains | math.precalc.module.6 | math.precalc.lesson.6.2 | ✓ Correct |
| math.precalc.edge.0375 | appears_in_context | math.precalc.example.7.4.001 | math.precalc.lesson.7.4 | ✓ Correct |

No prerequisite or support edges generated — PreCalc has no `skill` nodes, only `worked_example` nodes.

---

## Deferred Items

| Item | Severity | Details |
|------|----------|---------|
| Renderer registry coverage | Medium | 367 skills across IM1/IM2/IM3 have no `rendered_by` edge because the draft nodes do not expose renderer/component keys. They are queued in `edge-review-queue.json`. |
| Generator registry coverage | Medium | IM3 M1 has 12 `generated_by` edges from the pilot. No non-pilot nodes are marked `independentPracticeReady`; future rollout tracks must add generator keys before enabling runtime projections. |
| Misconception taxonomy | Low | No evidence base exists for any course. Skills are queued for later taxonomy authoring from distractor analysis. |

---

## Notes

- All course edge files use `reviewStatus: "draft"` — no edge is considered approved for production gating without human review.
- `prerequisite_for` edges are intentionally low-confidence. Before using them in mastery gating, a curriculum reviewer must confirm or reassign each entry in the course's `edge-review-queue.json`.
- IM3 Module 1 edges (pilot, 144 edges) were authored and reviewed in track `skill-graph-pilot-im3-m1_20260509`. The merged T5 output preserves pilot edge IDs while normalizing legacy lesson endpoints and weights so the generated course graph validates.
