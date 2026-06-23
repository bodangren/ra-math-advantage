# Implementation Plan: Code Review Remediation (2026-06-24)

Priority: **HIGH**. Phases are ordered by severity — Phase 1 (shipped malformed
JSDoc) first. Each behavioral fix follows Red → Green TDD per `workflow.md`.

## Phase 1: Malformed JSDoc remediation + recurrence guard (Cluster A)

- [ ] Task: Add the JSDoc balanced-brace guard (FR-3)
    - [ ] Red: add a test/lint fixture with a malformed `@returns {x {} …` and an unbalanced `@param {…}`; assert the guard fails on it
    - [ ] Green: implement the guard (lint rule or test) scanning changed `*.ts`/`*.tsx` for unbalanced `{`/`}` and stray ` {} ` in `@param`/`@returns`
- [ ] Task: Fix the 4 committed malformed `@returns` at HEAD (FR-1)
    - [ ] `apps/integrated-math-3/app/api/dev/review-queue/route.ts:141`
    - [ ] `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts:24`
    - [ ] `apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx:16`
    - [ ] `packages/knowledge-space-practice/src/projections/activity-map.ts:65`
- [ ] Task: Discard & cleanly regenerate the uncommitted JSDoc batch (FR-2)
    - [ ] `git restore` the 144 working-tree files to HEAD (capture the list first for the record)
    - [ ] Fix the JSDoc generator's `@returns` template (`{<type>}`, no trailing ` {}`) and `@param` inline object/function-type handling (fully balanced or prose-only)
    - [ ] Re-run the generator; verify zero unbalanced-brace annotations via the FR-3 guard before committing
- [ ] Task: Measure - User Manual Verification 'Phase 1: Malformed JSDoc remediation' (Protocol in workflow.md)

## Phase 2: Production-wiring scope & dead work (Cluster B)

- [ ] Task: Generalize student & parent projections to all modules (FR-4)
    - [ ] Red: test `getStudentVisualizationHandler` + `projectParentVisualizationHandler` with multi-module placement rows; assert nodes from >1 module appear
    - [ ] Green: add a shared full-curriculum graph-loading helper; replace the hardcoded `module-1/*.json` imports in `convex/student.ts` and `convex/parent/visualization.ts`
- [ ] Task: Remove the throwaway `student_competency` read (FR-5)
    - [ ] Red: adjust/remove the test that asserts the dead read; add a test that the handler issues no unused query (or that competency rows influence `learnerState`)
    - [ ] Green: delete the discarded `student_competency` query (or consume it)
- [ ] Task: Resolve the never-produced `review_due` state (FR-6)
    - [ ] Red: test the intended `review_due` derivation, or assert the narrowed union
    - [ ] Green: derive `review_due` from review/SRS data, or narrow the union type
- [ ] Task: Measure - User Manual Verification 'Phase 2: Production-wiring scope & dead work' (Protocol in workflow.md)

## Phase 3: advanced-math-generators correctness & quality (Cluster C)

- [ ] Task: Fix rational-analyzer HA triviality & grading (FR-7)
    - [ ] Red: test that generated problems produce varying horizontal asymptotes and that the HA grading target is student-enterable
    - [ ] Green: introduce non-monic / unequal-degree variation in `rational-analyzer.ts`; change `advanced-math-adapters.ts` HA grading to a scalar/`"none"` answer
- [ ] Task: Remove the exp-log dead domain re-roll (FR-8)
    - [ ] Red: keep existing exp/log/ln tests green; add a test asserting single-pass generation (no re-roll)
    - [ ] Green: delete the `while (true)` loop, `seed += 1`, eslint-disable, and the domain-safety doc
- [ ] Task: De-duplicate generator utilities (FR-9)
    - [ ] Green: extract `seededRandom`, `generateCoefficients`, `formatPolynomial` into `packages/math-content/src/utils/`; update all 5/2/2 call sites; tests unchanged (determinism preserved)
- [ ] Task: Consolidate registries & wire adapter nodeIds (FR-10)
    - [ ] Red: test that each advanced adapter resolves from its real `math.im3.skill.*` node id(s) (or document key-only reachability)
    - [ ] Green: remove the redundant flat `generator-registry.ts` (or justify); populate adapter `nodeIds`
- [ ] Task: Correct PRNG labelling (FR-11)
    - [ ] Green: fix the docstring (subsumed by FR-9 shared util) or switch to a 32-bit-safe formulation
- [ ] Task: Measure - User Manual Verification 'Phase 3: advanced-math-generators correctness & quality' (Protocol in workflow.md)

## Phase 4: precalc concept taxonomy (Cluster D)

- [ ] Task: Fix the remediation script scan path & re-run (FR-12)
    - [ ] Red: test/fixture that the scanner finds concept blueprints in `curriculum/implementation/practice-v1/activity-map.json` (or the real artifact)
    - [ ] Green: point `scripts/remediate-concept-blueprints.ts` at the real blueprint artifact(s); re-run; record the true count
- [ ] Task: Address concept resolution dropping sibling skills (FR-13)
    - [ ] Decide & implement: emit rows for all child skills, or document single-skill resolution as intentional with rationale (test/comment accordingly)
- [ ] Task: Measure - User Manual Verification 'Phase 4: precalc concept taxonomy' (Protocol in workflow.md)

## Phase 5: unified-auth IM3 follow-through (Cluster E)

- [ ] Task: Finish IM3 auth-wrapper unification (FR-14)
    - [ ] Red: update the IM3 auth test harness to stub the new `@math-platform/core-auth` request-guard exports; keep all IM3 auth tests green
    - [ ] Green: replace inline `getCookieValueFromHeader` + response builders + guards in `apps/integrated-math-3/lib/auth/server.ts` with core-auth composition (mirror BM2)
    - [ ] Resolve the matching tech-debt entry when complete
- [ ] Task: Measure - User Manual Verification 'Phase 5: unified-auth IM3 follow-through' (Protocol in workflow.md)

## Phase 6: repo hygiene & closeout (Cluster F)

- [ ] Task: Remove stray junk files (FR-15)
    - [ ] Delete `--db` and `--symbol`; add `.gitignore` guard if the pattern can recur
- [ ] Task: Update tech-debt registry
    - [ ] Mark FR-14 auth item Resolved; add documented entries for any FR converted to deferred debt (per Acceptance Criterion 10)
- [ ] Task: Generate Docs & Doctor
    - [ ] Run `measure/generate.sh` (or `scripts/generate-measure-docs.ts`) and `measure/doctor.sh`; refresh `graph.db` if signatures/exports changed
- [ ] Task: Measure - User Manual Verification 'Phase 6: repo hygiene & closeout' (Protocol in workflow.md)
