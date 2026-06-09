# Track: IM1 Practice Readiness — Implementation Plan

Workflow: Contract-First (generator contracts + coverage matrix), then per-task TDD
against the Generated-Math Correctness QA harness.
Verification gate each phase: correctness-QA harness + `tsc --noEmit` + boundary lint.

## Phase 1 — Coverage Matrix (Contract-First)

- [ ] Task: Enumerate the 138 IM1 skills from the rollout artifacts; record skill→family mapping
- [ ] Task: Cross-reference T17–T19 generator scope; classify each skill served / gap / needs-new-component
- [ ] Task: Prioritize a vertical-slice module + highest-traffic skills for first implementation
- [ ] Task: Measure - User Manual Verification 'Phase 1'

## Phase 2 — IM1 Generators

- [ ] Task: Scaffold `packages/math-content/src/problem-families/im1/` + registry wiring (no app imports)
- [ ] Task: Implement deterministic generators for the prioritized IM1 skills, reusing T17–T19 mechanisms (TDD)
- [ ] Task: All new generators pass the Generated-Math Correctness QA harness (golden-answer + properties)

## Phase 3 — Real Blueprints

- [ ] Task: Replace IM1 STUB blueprints with real worked-example/guided/independent blueprints wired to generators
- [ ] Task: Re-run projection; verify activities resolve to live generators, not stubs

## Phase 4 — Vertical Slice to a Student Route

- [ ] Task: Wire one IM1 module's practice to a student route (seeded or KST-derived state)
- [ ] Task: E2E/manual verification: student can practice IM1 content end-to-end

## Phase 5 — Audit Refresh & Verification

- [ ] Task: Update `skill-graph-im1-rollout-audit.md` with true coverage; track the long tail explicitly
- [ ] Task: Final verification — QA harness, tsc, lint, doctor green
- [ ] Task: Measure - User Manual Verification 'Phase 5'
