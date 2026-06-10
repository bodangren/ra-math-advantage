# Track: IM1 Practice Readiness — Implementation Plan

Workflow: Contract-First (generator contracts + coverage matrix), then per-task TDD
against the Generated-Math Correctness QA harness.
Verification gate each phase: correctness-QA harness + `tsc --noEmit` + boundary lint.

## Phase 1 — Coverage Matrix (Contract-First)

- [x] Task: Enumerate the 138 IM1 skills from the rollout artifacts; record skill→family mapping [checkpoint: cc8fbf8b]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/coverage-matrix.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- coverage-matrix` (Kind A — artifact/contract)
  - Red fails for the expected missing behavior: the `../coverage-matrix` module
    and `im1-coverage-matrix.json` do not exist yet, so the file's value
    imports fail at module-resolution time. When the Green phase lands the
    builder + JSON, the imports resolve and the assertions evaluate against
    the real rollout artifacts (`nodes.json`, `generator-gap-queue.json`,
    `blueprints.json`) — a live-behavior proof paired with the matrix
    snapshot per test-strategy §7.
  - Fail count at the Red commit: every test in the file fails on
    `import { buildCoverageMatrix, ... } from '../coverage-matrix'`
    (module-not-found). The tests are bounded to the file path
    `coverage-matrix` — no watch mode, no full-suite smoke.
- [x] Task: Cross-reference T17–T19 generator scope; classify each skill served / gap / needs-new-component [checkpoint: cc8fbf8b]
  - Red coverage: the test asserts the per-skill `status ∈ {served, gap, newComponent}`
    and `tier ∈ {t17, t18, t19, none}` shape, plus the `served + gap + newComponent == 138`
    invariant and per-module breakdown. Initial-classification test pins
    0 served / 138 gap / 0 newComponent to mirror the audit's 0/138
    generator readiness.
- [x] Task: Prioritize a vertical-slice module + highest-traffic skills for first implementation [checkpoint: cc8fbf8b]
  - Red coverage: the test asserts `metadata.json.verticalSliceModule`
    is a single module id drawn from `{1..14}`. Locking this in Phase 1
    prevents Phase 4 fixture rework (test-strategy §3).
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
