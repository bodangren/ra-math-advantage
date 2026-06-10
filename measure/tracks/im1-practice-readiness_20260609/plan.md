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
- [x] Task: Measure - User Manual Verification 'Phase 1' [checkpoint: 11277545]

## Phase 2 — IM1 Generators

- [x] Task: Scaffold `packages/math-content/src/problem-families/im1/` + registry wiring (no app imports) [checkpoint: 9b90f867]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/scaffold.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind A scaffold + Kind B live-behavior boundary lint reading real source tree)
  - Red signal: `scaffold.test.ts` imports `IM1_PROBLEM_FAMILIES` from `../index`, re-imports from `../../index` (parent barrel), and imports `IM1_GENERATORS` / `IM1GeneratorEntry` from `../generators`. None of these modules/exports exist at HEAD (`problem-families/index.ts` currently re-exports only IM3/IM2/PRECALC). The value imports force module-resolution failure → every assertion fails at import time.
  - Fail count at the Red commit: scaffold.test.ts → 0 tests collected (suite-level fail, all 11 `it` blocks blocked at import). Targeted command exits non-zero (8 failed test files vs. 1 passing — coverage-matrix.test.ts from Phase 1 stays green at 18 tests).
  - Implementer (Green) handoff for this task (per test-strategy §6): in the SAME commit that lands `problem-families/im1/index.ts` exporting `IM1_PROBLEM_FAMILIES`, (a) re-export it from `packages/math-content/src/problem-families/index.ts` (and from `packages/math-content/src/index.ts`), (b) the IM1 uniqueness + seed-import + cross-app cases in `packages/math-content/src/__tests__/exports.test.ts` (landed Red in commit-2 below) flip green automatically, and (c) add `exclude: ['**/_pending/**']` to `packages/math-content/vitest.config.ts` so per-skill `.pending.test.ts` files only run when promoted out of `_pending/`.
  - Red-phase commit-2 (this attempt): `packages/math-content/src/__tests__/exports.test.ts` extended with three new IM1 cases that pair with this task — `IM1 family IDs are unique`, `No duplicate family IDs across IM3/IM2/IM1/PreCalc`, and `IM1 seed imports problem families from math-content package`. All three fail at HEAD with `expected undefined to be defined` because `IM1_PROBLEM_FAMILIES` is not exported. Targeted Red command: `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` → **Test Files 1 failed (1); Tests 3 failed | 14 passed (17); exit code 1**. The 14 passing tests are the existing IM3/IM2/PreCalc cases — confirms scope did not regress earlier work.
- [x] Task: Implement deterministic generators for the prioritized IM1 skills, reusing T17–T19 mechanisms (TDD) [checkpoint: 9b90f867]
  - Red tests landed (one file per Module-1 skill, the vertical-slice module locked in `metadata.json:verticalSliceModule = "1"`):
    - `__tests__/1-1-verbal-to-numerical.test.ts` — `math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express`
    - `__tests__/1-2-algebraic-verbal-translation.test.ts` — `math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio`
    - `__tests__/1-3-properties-of-equality.test.ts` — `math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr`
    - `__tests__/1-4-distributive-property.test.ts` — `math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume`
    - `__tests__/1-5-absolute-value-distance.test.ts` — `math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista`
    - `__tests__/1-6-ratios-and-percentages.test.ts` — `math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind B — `verifyGenerator(adapt(entry), { numSeeds: 50 })` per skill is the live-behavior call path that `runGeneratorGate` uses internally).
  - Red signal: every pending file imports `{ IM1_GENERATORS, type IM1GeneratorEntry } from '../../generators'`; the module does not exist → suite-level module-resolution fail. Each file is bound to exactly one skill ID (constant `SKILL_ID`) so promoting a sub-task to `[x]` is a 1-file move out of `_pending/` per test-strategy §8.
  - Fail count at the Red commit: 6 files, each reported as "0 test (collected)" with module-not-found at line 23 (or 66 for the 1-1 file). Aggregated under the targeted command as 6 of 8 failed test files.
  - Green landed: 6 deterministic generators implemented in `generators.ts`, registered in `IM1_GENERATORS`. All `.pending.test.ts` files promoted out of `_pending/` in same commit. Per-skill verifyGenerator at numSeeds=50 passes.
- [x] Task: All new generators pass the Generated-Math Correctness QA harness (golden-answer + properties) [checkpoint: 9b90f867]
  - Red test landed: `packages/math-content/src/problem-families/im1/__tests__/ci-gate.test.ts`
  - Targeted Red command: `npm run -w packages/math-content test -- problem-families/im1` (Kind B — same `verifyGenerator` call path as practice-core's `test:generators`; see test-strategy §7 Phase 2 Green/closeout gate). Anti-stub guard asserts seed-0 and seed-1 outputs differ for every entry.
  - Red signal: `ci-gate.test.ts` imports `IM1_GENERATORS` from `../generators`; module does not exist → all 6 `it` blocks fail at import. When Tasks 1 + 2 Green land, the gate iterates real entries, calls `verifyGenerator(adapt(entry), { numSeeds: 50 })`, and asserts (a) every vertical-slice Module-1 skillId is registered, (b) every entry has `verdict === 'pass'` with zero failed checks across all seeds, (c) no entry behaves like a stub.
  - Fail count at the Red commit: ci-gate.test.ts → 0 tests collected (suite-level fail at line 70). Counted as 1 of 8 failed test files under the targeted command.
  - Green landed: ci-gate passes — all 6 generators pass verifyGenerator at numSeeds=50, anti-stub guard confirms seed-dependent output, registration coverage verified.
  - Adversarial follow-up: added a public package subpath export test for `@math-platform/math-content/problem-families/im1` and a ratio prompt/answer oracle over 100 seeds; fixed the survey ratio branch to consistently use prefer-A-to-total denominator.
- Phase 2 Green commit: `9b90f867` — `feat(im1-generators): implement Phase 2 Green — scaffold + 6 Module-1 generators`
  - `npm run -w packages/math-content test -- problem-families/im1` → **Test Files 9 passed (9); Tests 68 passed (68)**
  - `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` → **Test Files 1 passed (1); Tests 17 passed (17)**
  - `npm run -w packages/math-content test` → **Test Files 18 passed (18); Tests 277 passed (277)**
  - `tsc --noEmit` errors are all pre-existing (missing @types/node in test files, React types in schemas) — zero new errors from Phase 2 files.
- Phase 2 Red-phase aggregate: 2 commits. **Commit-1 (`8efb52d3`)** lands 8 new test files under `packages/math-content/src/problem-families/im1/__tests__/{,_pending/}`; targeted command `npm run -w packages/math-content test -- problem-families/im1` reports **Test Files 8 failed | 1 passed (9); Tests 18 passed (18)** at HEAD (18 passing tests = Phase 1 coverage-matrix suite). **Commit-2 (this attempt)** extends `packages/math-content/src/__tests__/exports.test.ts` with 3 new IM1 cases; targeted command `npm run -w packages/math-content test -- src/__tests__/exports.test.ts` reports **Test Files 1 failed (1); Tests 3 failed | 14 passed (17)** at HEAD. Both commands exit code 1, suitable for CI.
- Phase 2 build-graph protocol (per AGENTS.md Graph-Aware Mode): pre-Red `build-graph stats ./graph.db` → 13 625 nodes, fresh (~22h, last regen f4f414ba/78b94084). `search im1` confirms zero nodes under `packages/math-content/src/problem-families/im1/` apart from the Phase 1 coverage-matrix module — Red phase additions are greenfield, no caller-count regression risk. `inspect verifyGenerator` shows 3 incoming edges (file:contains, 2× param_flow); no IM1 caller exists yet, so Phase 2 Green will be the first cross-package consumer of the harness from `math-content/problem-families/im1`.

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
