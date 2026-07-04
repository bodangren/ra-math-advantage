# Implementation Plan: Core Algebra Generators (T17)

**Track type:** feature
**Spec mode:** classic
**Created:** 2026-05-10
**Last updated:** 2026-07-04 (track-setup strategy pass: reclassify Phase 1 to active, reconcile architecture with codebase)
**Spec ref:** [./spec.md](./spec.md)
**Strategy ref:** [./test-strategy.md](./test-strategy.md)

## Architecture Decisions

Reconciled with the live codebase in the track-setup strategy pass
(2026-07-04). The spec's named paths are planning artifacts; the codebase
paths below are source of truth for *where* new code lands. See
`test-strategy.md` §2 and §13 for the full reconciliation table.

- **Location:** New algebra generators (`linear-equation-solver.ts`,
  `system-of-equations-solver.ts`, `quadratic-factoring.ts`,
  `quadratic-formula.ts`) live as standalone files in
  `packages/math-content/src/` — **alongside** the existing
  `exp-log-solver.ts`, `polynomial-operations.ts`, `polynomial-division.ts`,
  and `rational-analyzer.ts`. Do NOT create a parallel `src/generators/`
  directory; the spec's `generators/registry.ts` path is satisfied by the
  existing `packages/math-content/src/knowledge-space/generators/registry.ts`.
  Boundary rule: `packages/` must not import from `apps/` or
  `convex/_generated/`.
- **PRNG:** Extend the existing `packages/math-content/src/utils/prng.ts`
  with an additive `mulberry32(seed: number): () => number` export (the
  spec's algorithm, verbatim). Keep `seededRandom` (glibc LCG) unchanged —
  every existing generator depends on its exact sequence. New T17 generators
  use `mulberry32` per the spec; existing generators keep `seededRandom`
  (no churn, no behavior drift). Do NOT create `random.ts` (would split the
  PRNG surface). Export `mulberry32` from the `packages/math-content`
  public surface.
- **Fraction:** New `packages/math-content/src/utils/fraction.ts` exporting
  an immutable `Fraction` class (`numerator`, `denominator`, GCD-based
  `simplify`, `add`, `subtract`, `multiply`, `divide`, `equals`, `toString`,
  `toNumber`, static `from`). All internal math stays in integers; the class
  guards `denominator !== 0` and normalizes the sign to the numerator.
- **MathExpressionBuilder:** New
  `packages/math-content/src/utils/expression-builder.ts` exporting a
  pure-function builder for linear/binomial display strings. It must never
  emit `1x`, `-1x`, `+ -3`, `0x`, or a leading `+`. It complements (does
  not duplicate) the existing `formatPolynomial` in
  `utils/polynomial-format.ts`, which handles ascending-order coefficient
  arrays; `MathExpressionBuilder` handles piecewise linear/binomial terms.
- **Output shape:** Conform to the live `GeneratorOutput` contract from
  `@math-platform/knowledge-space-practice` (`{ prompt, data,
  expectedAnswer, solutionSteps, gradingMetadata }`), validated by
  `validateGeneratorOutput`. The plan's earlier reference to a
  `GeneratedMathProblem` zod schema is a planning artifact; the live
  contract is `GeneratorOutput`.
- **Backward gen:** For equation/systems/quadratics generators, pick the
  answer first, then derive coefficients — avoids impossible/ugly problems
  (Lesson from T18 polynomials; spec §2, §3). Single-pass generation only
  (FR-8 idiom from `exp-log-solver.test.ts`: spy on the PRNG, assert
  exactly one call per generation, no re-roll loop).
- **Registry:** Register new generators through the canonical
  `packages/math-content/src/knowledge-space/generators/registry.ts` via a
  new `algebra-generators-adapters.ts` file (mirroring
  `advanced-math-adapters.ts`). Each adapter wraps a raw
  `generateXxx({ seed })` into the `GeneratorInput → GeneratorOutput`
  contract and declares `key` (the `variantKey`), `nodeIds`, and optional
  `qaSkip`. Re-export new public symbols from `packages/math-content/src/index.ts`.
- **Grading rules:** `quadratic-factoring` adapter sets
  `gradingMetadata.partGradingRules` to `expression_equivalence` (spec §3)
  so `(x+3)(x-2)` and `(x-2)(x+3)` are both accepted. Linear/systems
  adapters use `numeric_tolerance` / `exact_match` as appropriate.
- **Stub replacement:** The existing `algebraicStepSolverGenerator` stub in
  `registry.ts` covers IM3 M1 skills 1.3-1.6 and 1.8. Phase 3/4 must
  replace the stub's coverage of 1.4 (factoring) and 1.6 (formula) with
  real generators, and either shrink the stub's `nodeIds` or remove the
  stub. A test must assert no `nodeId` is claimed by two generators
  (collision = last-write-wins).

## Phase 1: PRNG & Fraction Utilities

- [~] Task: Implement `mulberry32` PRNG in `utils/prng.ts` (additive export; keep `seededRandom`)
- [~] Task: Create `utils/fraction.ts` (GCD, simplify, add, multiply, divide, equals, toString, from)
- [~] Task: Build `utils/expression-builder.ts` (MathExpressionBuilder) to format `ax + b` without `1x` or `+ -3`
- [~] Task: Write unit tests for PRNG, Fraction, and ExpressionBuilder
- [b] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) deferred:user

### Phase 1 Red notes

Red command (2026-07-04):
```bash
npx vitest run packages/math-content/src/__tests__/prng.test.ts \
             packages/math-content/src/__tests__/fraction.test.ts \
             packages/math-content/src/__tests__/expression-builder.test.ts \
             --reporter=verbose
```
Result: expected Red failures because the Phase 1 production modules do not exist yet.
Labeled failure counts (A3):
- `prng_failed_tests: 6` (`mulberry32 is not a function`); 2 regression/source-grep checks passed; `seededRandom` first draw unchanged.
- `fraction_suite_failure: 1` (`Cannot find module '../utils/fraction'`).
- `expression_builder_suite_failure: 1` (`Cannot find module '../utils/expression-builder'`).
No production code was implemented; Phase 1 tasks remain `[~]`.

## Phase 2: Linear & Systems Generators

- [b] Task: Implement `linear-equation-solver.ts` using the Backward Generation strategy — deferred:human-gate
- [b] Task: Implement `system-of-equations-solver.ts` (choose x,y,derive coefficients,guard determinant ≠ 0) — deferred:human-gate
- [b] Task: Write TDD tests covering integer/rational solutions and edge cases (zero coeff, negative) — deferred:human-gate
- [b] Task: Register generators and wire to IM1/IM3 linear-equation blueprints — deferred:human-gate
- [b] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check) — deferred:human-gate
- [b] Task: Measure - User Manual Verification 'Phase 2' — deferred:human-gate

## Phase 3: Quadratics

- [b] Task: Implement `quadratic-factoring.ts` with grouping-step `solutionSteps` output — deferred:human-gate
- [b] Task: Implement `quadratic-formula.ts` returning radical string representations for irrational roots — deferred:human-gate
- [b] Task: Write TDD tests covering integer-factorable, perfect-square, difference-of-squares, irrational roots — deferred:human-gate
- [b] Task: Register generators and wire to IM1/IM3 quadratic blueprints — deferred:human-gate
- [b] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check) — deferred:human-gate
- [b] Task: Measure - User Manual Verification 'Phase 3' — deferred:human-gate

## Phase 4: Blueprint Wiring & Vertical-Slice Unblock

- [b] Task: Map generator keys to IM1 M1 and IM3 M1 remaining blueprints (closes 13/16 gap per tech-debt) — deferred:human-gate
- [b] Task: Run QA harness (`numSeeds=50`) against every new generator — deferred:human-gate
- [b] Task: Verify Vertical Slice Value Proof Phase 1 dependency (generators exist) is unblocked — deferred:human-gate
- [b] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check, CI=true npm test) — deferred:human-gate
- [b] Task: Measure - User Manual Verification 'Phase 4' — deferred:human-gate
