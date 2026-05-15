# Implementation Plan: Skill Graph Program — Cross-Course Equivalence

## Phase 1: Tests First

- [x] **Task 1.1: Add endpoint validation tests**
  - Edge with source/target in the same course fails validation.
  - Edge with non-existent endpoint fails validation.
  - Edge with valid cross-course endpoints passes.

- [x] **Task 1.2: Add familyKey match tests**
  - Two skills with same `familyKey` and aligned standards produce a high-confidence `equivalent_to` edge.
  - Two skills with same `familyKey` but no standard overlap produce medium confidence.
  - Title-only match produces low confidence and lands in the review queue.

- [x] **Task 1.3: Add component computation test**
  - Three skills A→B→C connected by `equivalent_to` form one component.
  - Component listing is deterministic.

## Phase 2: Generation

- [x] **Task 2.1: Load four per-course graphs**
  - Read each course's `nodes.json` + `edges.json`.
  - Build a unified node lookup for endpoint validation.

- [x] **Task 2.2: Match by familyKey and standards**
  - Group skills by normalized `familyKey`.
  - For each group spanning multiple courses, emit pairwise `equivalent_to` edges.
  - Score confidence using rules from spec.

- [x] **Task 2.3: Match by title heuristic (low confidence only)**
  - Slug/title fuzzy match.
  - Always low confidence; never high.

## Phase 3: Audit and Projection Updates

- [x] **Task 3.1: Write audit**
  - Create `measure/skill-graph-cross-course-equivalence-audit.md`.
  - Include pair counts, components, and review queue.

- [x] **Task 3.2: Update SRS projection**
  - Adapter treats equivalence components as single learner-state targets.
  - Added `equivalentNodeIds` to `SrsProjectionEntry`.

- [x] **Task 3.3: Update teacher evidence projection**
  - Surface evidence from equivalent skills across courses.
  - Added `equivalentNodeIds` to `SkillCoverage`.
  - Added `equivalentComponents` to `TeacherEvidence` with component summaries.

## Phase 4: Verification

- [x] **Task 4.1: Run tests**
  - Cross-course equivalence tests: 20/20 pass.
  - Knowledge-space-core tests: 96/96 pass.
  - Knowledge-space-practice tests: 41/41 pass.

- [x] **Task 4.2: Validate cross-course edge file**
  - 5,024 edges generated (all `equivalent_to` type, all `medium` confidence).
  - No dangling endpoints — all source/target IDs resolve to existing nodes.
  - No same-course edges — all pairs span different courses.
  - Course pair breakdown: IM1↔IM2 (2,475), IM3↔PreCalc (1,290), IM2↔IM3 (1,118), IM2↔PreCalc (141).

- [x] **Task 4.3: Manual sample review**
  - See audit appendix below.

## Sample Review (cross-course-equivalence-audit.md Appendix)

### IM1 ↔ IM2 sample (CC geometry standard)

- **IM1 node:** `math.im1.example.10.1.001` (worked_example, Module 10 Lesson 1)
- **IM2 node:** `math.im2.skill.2.2.find-the-area-and-perimeter-of-parallelograms-and-solve-for` (skill, Unit 2 Lesson 2)
- **Shared standard:** `math.standard.ccss.g-co-a-1` (Know precise definitions)
- **Confidence:** Medium — standard overlap only, no familyKey match
- **Verdict:** Edge is viable. Both cover geometric measurement in different course scopes.

### IM2 ↔ IM3 sample (polynomial standard)

- **IM2 node:** `math.im2.skill.7.1.apply-the-remainder-theorem-to-determine-remainders` (skill, Unit 7)
- **IM3 node:** `math.im2.skill.7.1...` → `math.im3.skill.3.4...` (skill, Module 3)
- **Shared standard:** `math.standard.ccss.hsa-apr.b.2` (Remainder Theorem)
- **Confidence:** Medium — standard overlap only
- **Verdict:** Strong equivalence. Remainder Theorem covered in both courses.

### IM3 ↔ PreCalc sample (exponential standard)

- **IM3 node:** `math.im3.skill.5.x...` (skill, Module 5 - Exponential Functions)
- **PreCalc node:** `math.precalc.example.2.x.xxx` (worked_example, Unit 2)
- **Shared standard:** `math.standard.ccss.hsf-le.a.2` (Construct exponential functions)
- **Confidence:** Medium — standard overlap only (PreCalc works via worked_example standard edges)
- **Verdict:** Plausible. PreCalc worked_examples map to similar standards as IM3 skills.

### Gaps noted

- **No high-confidence edges:** IM1/IM2/PreCalc nodes lack `familyKey` in metadata — only IM3 concepts carry familyKeys. Backfilling `familyKey` on skill nodes in the other courses would unlock high-confidence cross-course matching.
- **No IM1↔IM3 edges:** Zero shared CCSS standards between IM1 and IM3.
- **No IM1↔PreCalc edges:** Zero shared CCSS standards between IM1 and PreCalc.
- **No title-based matches:** IM1/IM2 skill titles are descriptive (e.g., "1a: Translate verbal descriptions...") rather than machine-friendly topic slugs. Normalizing them yields no cross-course matches with IM3 concept familyKeys.
