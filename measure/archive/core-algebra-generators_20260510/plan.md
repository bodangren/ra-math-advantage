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

- [x] Task: Implement `mulberry32` PRNG in `utils/prng.ts` (additive export; keep `seededRandom`) — `b054d723`
- [x] Task: Create `utils/fraction.ts` (GCD, simplify, add, multiply, divide, equals, toString, from) — `b054d723`
- [x] Task: Build `utils/expression-builder.ts` (MathExpressionBuilder) to format `ax + b` without `1x` or `+ -3` — `b054d723`
- [x] Task: Write unit tests for PRNG, Fraction, and ExpressionBuilder — `b054d723` (Red authored in `71120c0e`, Green impl closes Phase 1)
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

- [x] Task: Implement `linear-equation-solver.ts` using the Backward Generation strategy — `c95a0013`
- [x] Task: Implement `system-of-equations-solver.ts` (choose x,y,derive coefficients,guard determinant ≠ 0) — `c95a0013`
- [x] Task: Write TDD tests covering integer/rational solutions and edge cases (zero coeff, negative) — `c95a0013`
- [x] Task: Register generators and wire to IM1/IM3 linear-equation blueprints — `c95a0013`
- [x] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check) — `c95a0013`
- [b] Task: Measure - User Manual Verification 'Phase 2' — deferred:user

### Phase 2 Red notes

Red command (2026-07-04):
```bash
npx vitest run packages/math-content/src/__tests__/linear-equation-solver.test.ts \
             packages/math-content/src/__tests__/system-of-equations-solver.test.ts \
             packages/math-content/src/__tests__/generator-registry.test.ts \
             --reporter=verbose
```
Result: expected Red failures because the Phase 2 production modules (`linear-equation-solver.ts`, `system-of-equations-solver.ts`) and registry adapters do not exist yet. The 18 pre-existing generator-registry tests for polynomial/rational/exp-log remain green.
Labeled failure counts (A3):
- `linear_equation_solver_suite_failure: 1` (`Cannot find module '../linear-equation-solver'`).
- `system_of_equations_solver_suite_failure: 1` (`Cannot find module '../system-of-equations-solver'`).
- `generator_registry_t17_assertions_failure: 5` (2 missing `index.ts` re-exports for `generateLinearEquation`/`generateSystemOfEquations`; 3 missing registry keys for `linear-equation-solver`/`system-of-equations-solver` adapter lookups and collision check).
No production code was implemented; Phase 2 tasks remain `[~]`.

### Phase 2 Green notes

Green commit: `c95a0013`. Implementation strategy:

**`linear-equation-solver.ts`** — backward-generation, single call to `mulberry32`:
1. First PRNG draw picks the integer/rational mode (50/50 split).
2. Integer mode: `x ∈ [-10, 10]` (integer). Rational mode: `x = num/den`
   with `den ∈ [2, 6]` and `num ∈ [-10, 10]`, kept as `Fraction` to preserve
   exact arithmetic. This satisfies the "negative, positive, integer, AND
   rational answers across 200 seeds" edge-case test without violating the
   "parsed equation round-trips through `Number(rhs)`" backward-correctness
   test (the equation string uses `String(c.toNumber())`, not
   `Fraction.toString()`, so `Number("3.5") = 3.5` round-trips cleanly).
3. `a ∈ [-5, 5] \ {0}` (rejects zero via a do-while retry, no PRNG re-roll
   for the linear case), `b ∈ [-10, 10]`.
4. `c = a*x + b` computed in `Fraction` space, then converted to Number
   for the equation string and `r.c`.
5. Equation string: `formatLinearTerm(a, b) = c` (uses the
   `utils/expression-builder.ts` `formatLinearTerm` so the `1x`/`-1x`/`+ -`
   forbidden-substring guards pass).
6. Steps (3 entries, per spec §2): original equation, isolated `ax = c - b`,
   solution `x = <answer>`.

**`system-of-equations-solver.ts`** — backward-generation, single call to
`mulberry32`:
1. `x, y ∈ [-6, 6]` (integer solution).
2. `a1, b1, a2 ∈ [-5, 5] \ {0}` (deterministic non-zero retry, no PRNG
   re-roll).
3. Initial `b2 ∈ [-5, 5] \ {0}`. If `det = a1*b2 - a2*b1 === 0`, advance
   `b2` through the cycle `[-5..5]\{0}` until `det ≠ 0` (deterministic
   walk, no additional PRNG draws; max 11 iterations, in practice 1-2).
4. `c1 = a1*x + b1*y`, `c2 = a2*x + b2*y` (integer arithmetic, no
   rounding).
5. Equation strings formatted by a local `formatLinearXY` helper that
   mirrors `formatLinearTerm`'s `1x`/`-1x`/`1y`/`-1y`/`+ -` collapse rules
   for the bivariate case. Exported via `formatLinearTerm` re-export.
6. Steps (6 entries): system statement, elimination method note,
   determinant value, `x = N`, substitute-back note, `y = N`. The `x = N`
   and `y = N` strings are recovered symbolically via Cramer's rule (the
   `det` divisor) so the steps show a valid derivation, not a magic
   value.

**`algebra-generators-adapters.ts`** — mirrors `advanced-math-adapters.ts`:
- `linearEquationAdapter` → key `'linear-equation-solver'`, declares the real
  IM1 skill ID `math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides`.
- `systemOfEquationsAdapter` → key `'system-of-equations-solver'`, declares
  the real IM1 skill IDs `math.im1.skill.7.2.solve-systems-of-linear-equations-using-the-substitution-met` and
  `math.im1.skill.7.3.solve-systems-of-linear-equations-using-elimination-by-addit`.
- Both wrap the raw generator, build a `GeneratorOutput` with
  `numeric_tolerance` grading and 1e-9 tolerance (matches the parser test's
  `toBeCloseTo(..., 9)` precision).

**Registry wiring:** added the two adapter keys to `GENERATOR_REGISTRY` in
`knowledge-space/generators/registry.ts`. `GENERATOR_KEYS` now contains 12
entries (was 10). No collisions with the existing pilot generators or with
the `algebraicStepSolverGenerator` stub (which claims IM3 M1 1.3-1.6
quadratic IDs).

**`index.ts` re-exports:** added
`generateLinearEquation` / `LinearEquationProblem` and
`generateSystemOfEquations` / `SystemOfEquationsProblem` to the
`@math-content` public surface.

**`measure/generated/` artifacts:** regenerated via
`npx tsx scripts/generate-measure-docs.ts`. No new routes/architecture
entries appear (the script operates at the package level; library exports
are not enumerated).

### Phase 2 Phase 4 stub-collision note

The existing `algebraicStepSolverGenerator` pilot stub in
`registry.ts` claims IM3 M1 skill IDs 1.3-1.6 (imaginary/complex +
quadratic factoring/completing-the-square/quadratic formula). The two
new adapters claim IM1 skill IDs for linear equations and systems —
**no nodeId overlap** with the stub. Phase 4 will need to either:
(a) replace the stub entirely once the quadratic generators from Phase 3
land, or (b) shrink the stub's `nodeIds` list to leave only the
imaginary/complex (1.3) entries that Phase 3 doesn't replace. The
collision-detection test in `generator-registry.test.ts` (which asserts
`linear.key !== 'polynomial-operations'` etc.) is the enforcement
mechanism for this invariant.

### Phase 2 Green gate evidence

Targeted command (T17 Phase 2 §4.3):
```bash
npx vitest run packages/math-content/src/__tests__/linear-equation-solver.test.ts \
             packages/math-content/src/__tests__/system-of-equations-solver.test.ts \
             packages/math-content/src/__tests__/generator-registry.test.ts \
             --reporter=verbose
```
- Test files: 3 / 3 passed.
- Tests: 58 / 58 passed (18 linear + 17 systems + 23 generator-registry).
- No regressions: the 18 pre-existing generator-registry tests (polynomial /
  rational / exp-log FR-19, sparse-polynomial QA harness, `index.ts`
  re-exports) all remain green.

Full math-content suite:
- Test files: 30 / 30 passed.
- Tests: 471 / 471 passed. (Pre-Red baseline = 429; + 18 linear + 17
  systems + 5 new T17 Phase 2 assertions + 2 dynamic keys from
  `describe.each(GENERATOR_KEYS)` in `registry-sweep.test.ts`.)

`npx tsc --noEmit`: exit 0.
`npm run lint`: exit 0.
`bash measure/doctor.sh`: exit 0 ("All checks passed").

## Phase 3: Quadratics

- [x] Task: Implement `quadratic-factoring.ts` with grouping-step `solutionSteps` output — `cdb5555e`
- [x] Task: Implement `quadratic-formula.ts` returning radical string representations for irrational roots — `cdb5555e`
- [x] Task: Write TDD tests covering integer-factorable, perfect-square, difference-of-squares, irrational roots — `8ea3faa9` (Red), `cdb5555e` (Green)
- [x] Task: Register generators and wire to IM1/IM3 quadratic blueprints — `cdb5555e` (narrowed algebraicStepSolverGenerator stub: removed 1.4/1.6 claims; added quadratic-factoring/quadratic-formula adapters)
- [x] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check) — `cdb5555e`
- [b] Task: Measure - User Manual Verification 'Phase 3' — deferred:user

### Phase 3 Red notes

Red command (2026-07-04):
```bash
npx vitest run packages/math-content/src/__tests__/quadratic-factoring.test.ts \
             packages/math-content/src/__tests__/quadratic-formula.test.ts \
             packages/math-content/src/__tests__/generator-registry.test.ts \
             --reporter=verbose
```
Result: expected Red failures because the Phase 3 production modules (`quadratic-factoring.ts`, `quadratic-formula.ts`) and their registry adapters do not exist yet. The 24 pre-existing generator-registry and T17 Phase 2 tests remain green.
Labeled failure counts (A3):
- `quadratic_factoring_suite_failure: 1` (`Cannot find module '../quadratic-factoring'`).
- `quadratic_formula_suite_failure: 1` (`Cannot find module '../quadratic-formula'`).
- `generator_registry_t17_phase3_assertions_failure: 6` (2 missing `index.ts` re-exports for `generateQuadraticFactoring`/`generateQuadraticFormula`; 2 missing registry keys for `quadratic-factoring`/`quadratic-formula` adapter lookups; 1 missing-key uniqueness/collision check; 1 stub nodeId overlap assertion documenting the expected Jr-Green resolution).
No production code was implemented; Phase 3 tasks remain `[~]`.

### Phase 3 Green notes

Green implementation:
1. **`quadratic-factoring.ts`** — backward-generated via mulberry32 with six PRNG modes (monic positive, monic mixed, monic both-negative, perfect-square, difference-of-squares, a>1 sub-distinct/sub-square). Roots are integers in [-6,6]. Factored form uses `(x - r)` / `(x + r)` / `(x)` binomial format (parser-compatible — no `(x^2 - r^2)` or `x(ax+b)` forms which the test regex doesn't match). `formatQuadratic` produces the LHS. Steps include the literal phrases "quadratic", "factor pair", "rewrite", "middle", "group", "factored form".
2. **`quadratic-formula.ts`** — four PRNG modes (integer roots backward-gen, repeated root backward-gen, irrational forward-gen with deterministic c-iteration, complex forward-gen with deterministic c-iteration). Irrational/complex roots returned as radical strings `(-N ± √M)/D` and `(-N ± i√M)/D` matching the test parser regex. All roots are type-tagged ('real' | 'irrational' | 'complex'); repeated roots return a single 'real' entry. Steps include "a", "b", "c", "discriminant", "root type"/"nature", "quadratic formula", "simplify".
3. **`algebra-generators-adapters.ts`** — added `quadraticFactoringAdapter` (key `quadratic-factoring`, claims `math.im3.skill.1.4.solve-quadratic-equations-by-factoring`, `expression_equivalence` grading for the factored form) and `quadraticFormulaAdapter` (key `quadratic-formula`, claims `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`, per-part numeric_tolerance/exact_match plus a `discriminant` numeric part that guarantees at least one `numeric_tolerance` rule even for irrational/complex-only seeds).
4. **`registry.ts`** — registered both adapters; narrowed the `algebraicStepSolverGenerator` stub nodeIds to remove `1.4.solve-quadratic-equations-by-factoring` and `1.6.use-the-quadratic-formula-to-solve-equations` (now covered by real generators); kept imaginary unit (1.3) and completing-the-square (1.5) in the stub.
5. **`index.ts`** — de-duplicated re-exports (Phase 2 had added a second export block that conflicted); reorganized into a single "Core algebra generators (T17)" block exporting `generateLinearEquation`, `generateSystemOfEquations`, `generateQuadraticFactoring`, `generateQuadraticFormula` and their problem types, plus PRNG/Fraction/expression-builder utilities.

### Phase 3 Green gate evidence

Targeted command:
```bash
npx vitest run packages/math-content/src/__tests__/quadratic-factoring.test.ts \
             packages/math-content/src/__tests__/quadratic-formula.test.ts \
             packages/math-content/src/__tests__/generator-registry.test.ts \
             --reporter=verbose
```
- Test files: 3 / 3 passed.
- Tests: 66 / 66 passed (19 quadratic-factoring + 18 quadratic-formula + 29 generator-registry including 18 pre-existing + 5 Phase 2 + 6 Phase 3 assertions).

Full math-content suite:
- Test files: 32 / 32 passed.
- Tests: 516 / 516 passed. (Pre-Phase-3 baseline = 471; + 19 factoring + 18 formula + 8 additional registry/type checks.)

`npx tsc --noEmit`: exit 0.
`npm run lint`: exit 0.
`bash measure/doctor.sh`: exit 0 ("All checks passed").

## Phase 4: Blueprint Wiring & Vertical-Slice Unblock

- [x] Task: Map generator keys to IM1 M1 and IM3 M1 remaining blueprints (narrows IM3 M1 real-generator gap per tech-debt line 17: was 3/16 real → now 5/16 real via +1.4 factoring +1.6 formula; 1.3 imaginary/complex and 1.5 completing-the-square remain as algebraicStepSolverGenerator stubs; 6 IM3 M1 skills still have no generator) — `0b3d36e6` (linear/systems adapters claim IM1 skill IDs 2.4/7.2/7.3; quadratic adapters claim IM3 M1 skill IDs 1.4/1.6; blueprint-coverage assertion in generator-registry.test.ts verifies 1.4/1.6 resolve to non-stub generators)
- [x] Task: Run QA harness (`numSeeds=50`) against every new generator — `0b3d36e6` (t17-algebra-generators-qa.test.ts: 4/4 QA tests pass across 50 seeds each)
- [x] Task: Verify Vertical Slice Value Proof Phase 1 dependency (generators exist) is unblocked — `0b3d36e6` (all 4 generators registered, adapters pass registry-sweep QA)
- [x] Task: Generate Docs & Doctor (lint, tsc --noEmit, boundary check, CI=true npm test) — `0b3d36e6` (520/520 tests; tsc/lint/doctor green)
- [b] Task: Measure - User Manual Verification 'Phase 4' — deferred:user

### Phase 4 Green notes

**Blueprint wiring:** the four new adapters claim the real skill IDs in the registry:
- `linear-equation-solver` → `math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides`
- `system-of-equations-solver` → `math.im1.skill.7.2.solve-systems-of-linear-equations-using-the-substitution-met`, `math.im1.skill.7.3.solve-systems-of-linear-equations-using-elimination-by-addit`
- `quadratic-factoring` → `math.im3.skill.1.4.solve-quadratic-equations-by-factoring`
- `quadratic-formula` → `math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`

The `algebraicStepSolverGenerator` pilot stub was narrowed to 1.3 (imaginary/complex) and 1.5 (completing-the-square); its former 1.4/1.6 claims are replaced by the real generators. No nodeId collisions (enforced by generator-registry T17 collision test).

**QA harness (50 seeds):** new test file `t17-algebra-generators-qa.test.ts` runs four 50-seed sweeps, asserting substitution-falsifier correctness for each generator. 4/4 pass.

**Vertical Slice Value Proof unblock:** Phase 1 of `vertical-slice-value-proof_20260605` depends on core algebra generators existing and exporting a usable API. T17 delivers `generateLinearEquation`, `generateSystemOfEquations`, `generateQuadraticFactoring`, `generateQuadraticFormula` via the `@math-platform/math-content` public surface plus GeneratorOutput-returning adapters in the registry. That dependency is satisfied.

### Phase 4 Green gate evidence

Full math-content suite: 33 test files / 520 tests passed.
`npx tsc --noEmit`: exit 0.
`npm run lint`: exit 0.
`bash measure/doctor.sh`: exit 0 ("All checks passed").
Registry-sweep QA: all 14 registered generators (pilot stubs + advanced-math + T17 algebra) pass the `verifyGenerator` harness; 28/28 sweep tests pass.
