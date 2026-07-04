# Test Strategy — core-algebra-generators_20260510 (T17)

Role: Measure Strategy. This document is the **full-track strategy** across all
four phases (track-setup heading). Baseline SHA: `6ff260b7380d9d8cd40de21c506a043372f0133d`
(HEAD of `measure(wcag-aa-remediation): closeout`). No product-source
implementation happens in a strategy pass; only `plan.md`, `metadata.json`, and
this `test-strategy.md` are edited.

UX applicability: **not_applicable**. T17 is entirely `packages/math-content`
generator code with no browser surface. `PROJECT_DEV_URL` is not exercised by
any phase; `UX_REQUIRED=never` is correct. All proof is unit-test proof against
the `GeneratorInput → GeneratorOutput` contract and the existing
`knowledge-space/generators/registry.ts` surface.

---

## 1. Required context and inspected surfaces

Read before strategy (all read, no edits): `measure/index.md`,
`measure/workflow.md`, `measure/tracks.md`, `measure/tech-stack.md`,
`measure/lessons-learned.md`, `measure/tech-debt.md`,
`measure/practice-component-contract.md`, `measure/anti-patterns.md`, this
track's `spec.md` and `plan.md`, and the existing generator surfaces:

- `packages/math-content/src/utils/prng.ts` — existing `seededRandom` (glibc
  LCG). **Already deterministic and adequate.** Used by every existing
  generator (`exp-log-solver`, `polynomial-operations`, `polynomial-division`,
  `rational-analyzer`, `problem-families/im1/generators.ts`, and the
  `knowledge-space/generators/registry.ts` pilot generators).
- `packages/math-content/src/utils/polynomial.ts`, `coefficients.ts`,
  `polynomial-format.ts` — existing polynomial primitives (ascending-order
  coefficient arrays, `addPoly` / `subtractPoly` / `multiplyPoly` /
  `generateCoefficients` / `formatPolynomial`).
- `packages/math-content/src/exp-log-solver.ts`,
  `polynomial-operations.ts`, `polynomial-division.ts`,
  `rational-analyzer.ts` — existing advanced-math generator pattern
  (standalone `.ts` file at `src/` root, exports a `generateXxx({ seed })`
  function, uses `seededRandom`).
- `packages/math-content/src/knowledge-space/generators/registry.ts` —
  canonical `MathGenerator` registry keyed by `variantKey`. Already holds the
  pilot stubs (`algebraic-step-solver`, `graphing-explorer`,
  `statistics`) and the four advanced-math adapters
  (`polynomial-operations`, `polynomial-division`, `rational-analyzer`,
  `exp-log-solver`).
- `packages/math-content/src/knowledge-space/generators/advanced-math-adapters.ts`
  — adapter pattern that wraps a raw `generateXxx({ seed })` function into the
  `GeneratorInput → GeneratorOutput` contract. T17 mirrors this pattern.
- `packages/math-content/src/__tests__/generator-registry.test.ts`,
  `exp-log-solver.test.ts`, `no-measure-coupling.guard.test.ts` — existing
  test idioms (return-shape, determinism, single-pass/no-re-roll spy,
  boundary guard).
- `packages/math-content/src/problem-families/im1/generators.ts` — IM1's
  direct generator entries (`IM1GeneratorEntry` shape, keyed by
  `skillIdKey`). T17 Phase 4 wires new algebra generator keys into IM1/IM3
  blueprints via the canonical registry, not by duplicating this surface.
- `packages/knowledge-space-practice/src/blueprints/types.ts` — canonical
  `GeneratorInput` (`{ nodeId, seed, difficulty, learnerContext? }`),
  `GeneratorOutput` (`{ prompt, data, expectedAnswer, solutionSteps,
  gradingMetadata }`), `GradingMetadata` (`partAnswers`, `partMaxScores`,
  `partGradingRules: 'exact_match' | 'numeric_tolerance' |
  'expression_equivalence'`, `partTolerances?`).
- `packages/math-content/src/index.ts` — public re-export surface T17 must
  extend.

Codebase facts that shape every phase:

- The spec names `random.ts`, `Fraction.ts`, `MathExpressionBuilder`, and
  `generators/registry.ts`. **The codebase has `utils/prng.ts` (not
  `random.ts`), no `Fraction`, no `MathExpressionBuilder`, and the canonical
  registry is `knowledge-space/generators/registry.ts` (not
  `generators/registry.ts`).** Strategy reconciles these in §7 and in the
  `plan.md` Architecture Decisions update; the spec's paths are planning
  artifacts, the codebase paths are source of truth for *where* new code
  lands.
- The `seededRandom` LCG is deterministic and every existing generator relies
  on its exact sequence. **Do not replace it.** Add `mulberry32` as an
  additive export to `utils/prng.ts`; new T17 generators use `mulberry32` per
  the spec, existing generators keep `seededRandom` (no churn, no behavior
  drift, no A10 generated-facts drift).
- The math-content package has **no ESLint flat config** (tech-debt line 19:
  `npm run lint --workspace=packages/math-content` fails; 23 pre-existing
  violations). The `PROJECT_LINT` gate (`npm run lint` from repo root) is the
  authoritative lint. The math-content-local `lint` script is **not** a
  closeout gate for T17; it is a known pre-existing red documented in
  tech-debt.
- The math-content package has **pre-existing standalone `tsc --noEmit` red**
  (tech-debt line 25: missing `@types/node` in test files that import
  `node:fs`/`node:url`). Existing test idiom is
  `// @ts-ignore — node:fs is used only in vitest tests; @types/node is not
  installed in this package` (see `exp-log-solver.test.ts:4`). New T17 tests
  that import `node:fs` for source-grep guards must follow the same idiom.
  The authoritative typecheck gate is `PROJECT_CHECKS` (`npx tsc --noEmit`
  from repo root), which includes math-content via the root tsconfig
  references — T17 must not add new root-level tsc errors.
- Baseline test state: `npx vitest run packages/math-content` = **392/392
  green** at `6ff260b7`. T17 must not regress this.

## 2. Architecture decisions confirmed in `plan.md`

The `plan.md` Architecture Decisions section is updated by this strategy pass
to reconcile the spec with the codebase. The canonical decisions are:

1. **PRNG.** Extend `packages/math-content/src/utils/prng.ts` with an additive
   `mulberry32(seed: number): () => number` export (the spec's algorithm,
   verbatim). Keep `seededRandom` for existing generators. New T17 generators
   import `mulberry32`. Do not create `random.ts` (would split the PRNG
   surface and risk drift). Export `mulberry32` from `packages/math-content`
   public surface.
2. **Fraction.** New `packages/math-content/src/utils/fraction.ts` exporting
   an immutable `Fraction` class (`numerator`, `denominator`, GCD-based
   `simplify`, `add`, `subtract`, `multiply`, `divide`, `equals`, `toString`,
   `toNumber`, static `from`). All internal math stays in integers; the class
   guards `denominator !== 0` and normalizes the sign to the numerator.
3. **MathExpressionBuilder.** New `packages/math-content/src/utils/expression-builder.ts`
   exporting a pure-function builder for linear/binomial display strings
   (`formatLinear(coeffA, coeffB)`, `formatBinomial(root)`,
   `formatEquation(lhs, rhs)`, etc.). It must never emit `1x`, `-1x`,
   `+ -3`, `0x`, or leading `+`. It complements (does not duplicate) the
   existing `formatPolynomial` in `utils/polynomial-format.ts`, which handles
   ascending-order coefficient arrays; `MathExpressionBuilder` handles
   piecewise linear/binomial terms.
4. **Generator source location.** New algebra generators
   (`linear-equation-solver.ts`, `system-of-equations-solver.ts`,
   `quadratic-factoring.ts`, `quadratic-formula.ts`) live as standalone files
   in `packages/math-content/src/` — **alongside** `exp-log-solver.ts`,
   `polynomial-operations.ts`, etc. Do not create a parallel
   `src/generators/` directory; the spec's `generators/registry.ts` path is
   satisfied by the existing `knowledge-space/generators/registry.ts`.
5. **Registry.** Register new generators through the canonical
   `packages/math-content/src/knowledge-space/generators/registry.ts` via a
   new `algebra-generators-adapters.ts` file (mirroring
   `advanced-math-adapters.ts`). Each adapter wraps a raw
   `generateXxx({ seed })` into the `GeneratorInput → GeneratorOutput`
   contract and declares `key`, `nodeIds`, `qaSkip?`.
6. **Backward generation.** Every equation/systems/quadratic generator picks
   the answer first and derives coefficients (spec §2, §3; lesson from T18
   polynomials). No re-roll loops — single-pass generation only (FR-8 idiom
   from `exp-log-solver.test.ts`).
7. **Output shape.** Raw generators return a typed result
   (e.g., `LinearEquationProblem`); adapters convert to `GeneratorOutput`
   with `gradingMetadata.partGradingRules` set to `expression_equivalence`
   for factoring (spec §3) and `numeric_tolerance` / `exact_match` for
   equations/systems.

## 3. Phase 1 — PRNG & Fraction Utilities

### 3.1 Targeted Red command

```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content/src/__tests__/prng.test.ts \
                  packages/math-content/src/__tests__/fraction.test.ts \
                  packages/math-content/src/__tests__/expression-builder.test.ts \
                  packages/math-content/src/__tests__/generator-registry.test.ts \
  --reporter=verbose
```

Mid Red adds the three new test files first, runs the command, and shows:
- The three new test files fail (modules don't exist yet).
- `generator-registry.test.ts` and the rest of the math-content suite stay
  green (no regression to the 392 baseline).

### 3.2 Required failing tests (Red evidence)

**`packages/math-content/src/__tests__/prng.test.ts`** — `mulberry32`:
- Returns a function; same seed produces byte-identical sequences across two
  calls (determinism). Falsifies if two `mulberry32(seed)` calls diverge.
- Produces values in `[0, 1)` for the first 1000 draws across seeds
  `0, 1, 42, 99, 2**31`. Falsifies if any draw is `< 0`, `>= 1`, or `NaN`.
- Produces a different sequence for different seeds (at least one of the
  first 10 draws differs). Falsifies if `mulberry32(1)` and `mulberry32(2)`
  are identical.
- `mulberry32(0)` and `mulberry32(-1)` are both well-defined (no crash, no
  `NaN`). Falsifies if a negative or zero seed throws.
- Does not call `Math.random()` (source grep + spy on `Math.random`).
  Falsifies if the source contains `Math.random()` outside a comment, or if
  `Math.random` is invoked during 100 draws.
- `seededRandom` still exists and is unchanged (regression guard: existing
  `exp-log-solver` / `polynomial-operations` determinism tests still pass).

**`packages/math-content/src/__tests__/fraction.test.ts`** — `Fraction`:
- `new Fraction(3, 4)` stores `numerator=3, denominator=4`; rejects
  `denominator=0` by throwing. Falsifies if `denominator=0` is accepted.
- `simplify` reduces `4/8 → 1/2`, `6/3 → 2/1`, `0/5 → 0/1`.
- Sign normalization: `3/-4 → -3/4`, `-3/-4 → 3/4`.
- `add`: `1/2 + 1/3 = 5/6`; `1/2 + (-1/2) = 0/1`.
- `multiply`: `2/3 * 3/4 = 1/2`; `0/5 * 7/9 = 0/1`.
- `divide`: `1/2 ÷ 1/4 = 2/1`; dividing by `0/1` throws.
- `equals`: `1/2.equals(2/4)` is true; `1/2.equals(1/3)` is false.
- `toString`: `"3/4"`, `"5"` (for `5/1`), `"0"` (for `0/1`), `"-2/3"`.
- `toNumber`: `1/2 → 0.5`, `5/1 → 5`.
- `Fraction.from(0.5)` returns `1/2`; `Fraction.from(3)` returns `3/1`;
  `Fraction.from(0.333...)` is NOT required to recover `1/3` (documented
  limitation: `from` is for exact binary fractions only).
- Across 100 random integer pairs `(num, den)` with `den ≠ 0`, the class
  invariant `(denominator > 0) && (gcd(abs(num), den) === 1 || num === 0)`
  holds after construction. Falsifies if any unsimplified fraction leaks.

**`packages/math-content/src/__tests__/expression-builder.test.ts`** —
`MathExpressionBuilder`:
- `formatLinear(3, 2)` → `"3x + 2"`; `formatLinear(1, 2)` → `"x + 2"` (no
  `1x`); `formatLinear(-1, 2)` → `"-x + 2"` (no `-1x`);
  `formatLinear(0, 5)` → `"5"` (no `0x`); `formatLinear(3, -2)` → `"3x - 2"`
  (no `+ -2`); `formatLinear(3, 0)` → `"3x"` (no trailing `+ 0`).
- `formatBinomial(root)` for `root=2` → `"(x - 2)"`; `root=-3` → `"(x + 3)"`;
  `root=0` → `"x"` (or `"x"` without parens — pick one and test it).
- `formatEquation("3x + 2", "14")` → `"3x + 2 = 14"`.
- No output ever contains `1x`, `-1x`, `+ -`, `0x`, `+ 0`, or a leading `+`.
  (Regex guard test: `expect(output).not.toMatch(/(^|[^0-9])1x/)` etc.)
- Across 100 random `(a, b)` with `a ∈ [-9, 9] \ {0}`, `b ∈ [-9, 9]`, the
  output is a non-empty string matching the canonical linear form and
  contains no forbidden substring. Falsifies if any forbidden form appears.

**Phase 1 marker guard (artifact test):**
- `plan.md` Phase 1 block: tasks 1-4 are `[~]` while Phase 1 is active and
  `[x]` with commit SHA when Phase 1 closes; task 5 (UMV) is
  `[b] ... deferred:user`. No bare `[ ]` in the Phase 1 block once the
  orchestrator starts Phase 1. Falsifies if UMV is marked `[x]` by
  automation, if `deferred` appears only as prose without `[b] deferred:user`,
  or if the Phase 1 block has zero `[x]` at acceptance.

### 3.3 Green gate and closeout gate

**Green gate** (after Jr Green implements the three modules):
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content/src/__tests__/prng.test.ts \
                  packages/math-content/src/__tests__/fraction.test.ts \
                  packages/math-content/src/__tests__/expression-builder.test.ts \
                  packages/math-content/src/__tests__/generator-registry.test.ts \
  --reporter=verbose
```
Required Green evidence: all new tests pass; `generator-registry.test.ts`
still green (no regression to the four advanced-math adapters); no `.skip`,
`.todo`, permissive snapshots, or environment guards.

**Closeout gate** (Phase 1 acceptance):
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && npm run lint
cd /home/daniel-bo/Desktop/ra-math-advantage && npx tsc --noEmit
cd /home/daniel-bo/Desktop/ra-math-advantage && npx vitest run packages/math-content --reporter=verbose
```
Closeout is blocked unless `PROJECT_LINT` and `PROJECT_CHECKS` exit 0 and
the math-content suite is green. If `npx tsc --noEmit` reports pre-existing
math-content red (tech-debt line 25: missing `@types/node`), the acceptance
role must record the exact pre-existing error count and verify T17 added
**zero new** errors. The math-content-local `lint` script is **not** a
closeout gate (tech-debt line 19).

Manual verification: Task 5 is human-gated (`[b] deferred:user`). Automated
tests prove behavior; they cannot self-approve the cross-cutting utility
design (e.g., whether `Fraction.from`'s binary-fraction-only limitation is
documented for downstream consumers).

## 4. Phase 2 — Linear & Systems Generators

### 4.1 Targeted Red command

```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content/src/__tests__/linear-equation-solver.test.ts \
                  packages/math-content/src/__tests__/system-of-equations-solver.test.ts \
                  packages/math-content/src/__tests__/generator-registry.test.ts \
                  packages/math-content/src/knowledge-space/generators/__tests__/registry-sweep.test.ts \
  --reporter=verbose
```

Mid Red adds the two new generator test files (and extends
`generator-registry.test.ts` / `registry-sweep.test.ts` with assertions for
the new keys). Red evidence: the two new files fail (modules don't exist);
the registry tests fail at the new-key assertions; the rest of math-content
stays green.

### 4.2 Required failing tests (Red evidence)

**`packages/math-content/src/__tests__/linear-equation-solver.test.ts`** —
`generateLinearEquation({ seed })`:
- Return shape: `{ problemType, equation, answer, steps, familyId }` (or the
  adapter-wrapped `GeneratorOutput`). All keys present; `equation` is a
  non-empty string; `answer` is a finite number; `steps` is a non-empty
  string array.
- Determinism: same seed → identical output (deep equal).
- Different seeds → different output (at least one of `equation`/`answer`
  differs).
- **Backward-generation correctness (the core falsifier):** for any seed,
  substitute `answer` into the equation's LHS and verify it equals the RHS.
  Parse the equation string to recover `A, B, C` from `Ax + B = C`, then
  assert `A * answer + B === C`. Falsifies if the generator fabricates an
  equation whose answer doesn't satisfy it, or if the parser can't recover
  the coefficients (which would mean the equation format is ambiguous).
- **Integer answers:** across 50 seeds, `answer` is always an integer (the
  spec's backward-gen strategy picks integer `x`, `A`, `B` first).
- **No `1x` / `+ -` formatting:** `equation` never matches
  `/(^|[^0-9])1x/`, `/+ -/`, `/0x/`.
- **Single-pass generation:** spy on `mulberry32`; exactly one call per
  generation (no re-roll loop).
- Edge cases: seed 0, negative seed, large seed (`2**31`). All produce valid
  output.
- `familyId` is `'step-by-step-solver:linear-equation'`.
- `steps` follow the spec's three-line format: original equation, simplified
  (`3x = 12`), solution (`x = 4`). The last step contains the answer.

**`packages/math-content/src/__tests__/system-of-equations-solver.test.ts`**
— `generateSystemOfEquations({ seed })`:
- Return shape: `{ equations: [string, string], solution: { x, y }, steps,
  familyId }` (or adapter-wrapped).
- Determinism: same seed → identical output.
- **Backward-generation correctness:** substitute `(solution.x, solution.y)`
  into both equations and verify both hold. Parse each equation to recover
  coefficients.
- **Determinant guard:** the system's coefficient matrix has non-zero
  determinant (the system is solvable and has a unique solution). Compute
  `det = a11*a22 - a12*a21` from the parsed coefficients; assert `det !== 0`.
- **Integer solutions:** across 50 seeds, `solution.x` and `solution.y` are
  integers (backward-gen picks integer `x, y` first).
- **No degenerate systems:** across 50 seeds, the two equations are not
  scalar multiples of each other (implied by `det !== 0` but worth a direct
  check).
- Single-pass generation (spy on `mulberry32`).
- `familyId` is `'step-by-step-solver:system-of-equations'`.

**`generator-registry.test.ts` extension** — add re-export and registry
assertions:
- `generateLinearEquation` and `generateSystemOfEquations` are re-exported
  from `packages/math-content/src/index.ts`.
- The canonical `getGenerator('linear-equation-solver')` and
  `getGenerator('system-of-equations-solver')` return the registered
  adapters.
- The adapters produce `GeneratorOutput` that passes
  `validateGeneratorOutput` (from `@math-platform/knowledge-space-practice`).

**`registry-sweep.test.ts` extension** — the new keys appear in
`GENERATOR_KEYS` and each maps to a generator whose `nodeIds` reference real
IM1/IM3 skill IDs.

### 4.3 Green gate and closeout gate

**Green gate:**
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content/src/__tests__/linear-equation-solver.test.ts \
                  packages/math-content/src/__tests__/system-of-equations-solver.test.ts \
                  packages/math-content/src/__tests__/generator-registry.test.ts \
                  packages/math-content/src/knowledge-space/generators/__tests__/registry-sweep.test.ts \
  --reporter=verbose
```

**Closeout gate:**
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && npm run lint
cd /home/daniel-bo/Desktop/ra-math-advantage && npx tsc --noEmit
cd /home/daniel-bo/Desktop/ra-math-advantage && npx vitest run packages/math-content --reporter=verbose
```
Same pre-existing-red handling as Phase 1 (§3.3). Task 4 (Register generators
and wire to IM1/IM3 linear-equation blueprints) must show the
`knowledge-space/generators/registry.ts` entries and any IM1/IM3
problem-family `variantKey` updates. Task 5 (Generate Docs & Doctor) runs
`measure/doctor.sh` and records any Check-5 generated-facts drift (A10) for
the new exports.

Manual verification: Task 6 is `[b] deferred:user`.

## 5. Phase 3 — Quadratics

### 5.1 Targeted Red command

```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content/src/__tests__/quadratic-factoring.test.ts \
                  packages/math-content/src/__tests__/quadratic-formula.test.ts \
                  packages/math-content/src/__tests__/generator-registry.test.ts \
                  packages/math-content/src/knowledge-space/generators/__tests__/registry-sweep.test.ts \
  --reporter=verbose
```

### 5.2 Required failing tests (Red evidence)

**`packages/math-content/src/__tests__/quadratic-factoring.test.ts`** —
`generateQuadraticFactoring({ seed })`:
- Return shape: `{ polynomial: string, factored: string, roots: [r1, r2],
  leadingCoeff, steps, familyId }` (or adapter-wrapped).
- Determinism: same seed → identical output.
- **Backward-generation correctness (the core falsifier):** expand the
  declared factored form `a(x - r1)(x - r2)` and verify it equals the
  declared polynomial. Use the existing `multiplyPoly` primitive (do NOT
  re-implement expansion in the test — that's a parity oracle, see
  lessons-learned 2026-06-24). Falsifies if the polynomial and factored
  forms disagree.
- **Grading metadata:** `gradingMetadata.partGradingRules` includes
  `expression_equivalence` for the factored-answer part (spec §3). Falsifies
  if the rule is `exact_match` (which would reject `(x+3)(x-2)` when the
  generator's stored answer is `(x-2)(x+3)`).
- **Equivalence check:** the existing `checkEquivalence` from
  `algebraic/equivalence.ts` accepts both `(x-2)(x+3)` and `(x+3)(x-2)` as
  equivalent to the stored factored answer. Falsifies if order matters.
- **Integer roots:** across 50 seeds, both roots are integers (backward-gen
  picks integer roots first).
- **Leading coefficient variety:** across 50 seeds, both `a=1` (easy) and
  `a>1` (hard) appear. Falsifies if the generator only ever produces `a=1`.
- **No `1x` / `+ -` formatting** in `polynomial` and `factored` strings.
- Single-pass generation (spy on `mulberry32`).
- `familyId` is `'step-by-step-solver:quadratic-factoring'`.
- `steps` include the grouping steps (find factors of `a*c` that sum to `b`,
  split the middle term, group, factor each group).

**`packages/math-content/src/__tests__/quadratic-formula.test.ts`** —
`generateQuadraticFormula({ seed })`:
- Return shape: `{ polynomial: string, roots: string[] (radical forms),
  discriminant, steps, familyId }`.
- Determinism: same seed → identical output.
- **Backward-generation correctness:** the declared roots satisfy the
  declared polynomial. For rational roots, substitute and verify
  `a*r² + b*r + c === 0`. For irrational roots, the test parses the radical
  string (e.g., `(2 ± √3) / 1`) and verifies the polynomial vanishes at
  both. Falsifies if the roots don't solve the equation.
- **Discriminant consistency:** `discriminant === b² - 4ac` (parsed from the
  polynomial). Falsifies if the declared discriminant doesn't match.
- **Three root regimes across 50 seeds:** (a) two distinct rational roots
  (discriminant > 0, perfect square), (b) one repeated rational root
  (discriminant = 0), (c) two irrational roots (discriminant > 0, not a
  perfect square). The test must show at least one seed in each regime.
  Falsifies if the generator can't produce all three regimes, or if the
  radical string format is wrong for irrational roots.
- **Radical string format:** irrational roots use `√` (U+221A) or `\sqrt{}`
  (LaTeX) — pick one and test it. The string must be parseable by the test's
  own radical parser (which is a test-only utility, not shared with the
  generator).
- Single-pass generation.
- `familyId` is `'step-by-step-solver:quadratic-formula'`.

**`generator-registry.test.ts` / `registry-sweep.test.ts` extension** — same
as Phase 2 for the two new keys.

### 5.3 Green gate and closeout gate

Same pattern as Phase 2 (§4.3). The closeout gate additionally verifies
that the existing `algebraicStepSolverGenerator` stub (which currently
covers `math.im3.skill.1.4.solve-quadratic-equations-by-factoring` and
`math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations`) is either
replaced by the new real generators or explicitly documented as a deferred
stub with a tech-debt row. The acceptance role must verify the stub's
`nodeIds` are not silently dropped when the new generators register.

Manual verification: Task 6 is `[b] deferred:user`.

## 6. Phase 4 — Blueprint Wiring & Vertical-Slice Unblock

### 6.1 Targeted Red command

```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && \
  npx vitest run packages/math-content --reporter=verbose
```

Phase 4 is the integration phase. The Red command is the full math-content
suite; the new failing tests are the blueprint-wiring assertions (e.g., a
test that asserts every IM3 M1 `variantKey` resolves to a non-stub
generator, which fails until the stubs are replaced).

### 6.2 Required failing tests (Red evidence)

- **Blueprint coverage test:** a new test (in
  `packages/math-content/src/knowledge-space/generators/__tests__/`) asserts
  that the IM3 M1 skills currently served by the `algebraicStepSolverGenerator`
  stub (`1.4.solve-quadratic-equations-by-factoring`,
  `1.5.solve-quadratic-equations-by-completing-the-square`,
  `1.6.use-the-quadratic-formula-to-solve-equations`,
  `1.8.solve-systems-involving-a-linear-and-a-quadratic-equation`) now
  resolve to real (non-stub) generators. Falsifies if any of these skills
  still route to a generator whose `description` contains "stub" or whose
  `generate` returns `variant-${seed}` placeholder data.
- **QA harness sweep:** for each new generator key, run
  `verifyGenerator({ key, numSeeds: 50 })` (from
  `@math-platform/knowledge-space-practice` or the local
  `generator-qa` harness). Assert it passes (determinism, unique answers
  unless `qaSkip.uniqueAnswer`, valid `GeneratorOutput` shape). Falsifies if
  any generator fails the 50-seed sweep.
- **Three-artifact agreement (lesson 2026-06-11 im1-practice-readiness):**
  the live generator registry (`GENERATOR_KEYS`), the IM1/IM3 problem-family
  `variantKey` lists, and any coverage-matrix / gap-queue JSON file must
  agree on which skills are served. Falsifies if the registry has a key the
  families don't reference, or vice versa.
- **Vertical Slice Value Proof unblock:** a test or artifact assertion that
  the `vertical-slice-value-proof_20260605` track's Phase 1 dependency
  ("generators exist") is satisfied. This may be a documentation/artifact
  test (the dependency is declared in that track's plan) — see §8 for the
  artifact-vs-live distinction.

### 6.3 Green gate and closeout gate

**Green gate:**
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && npx vitest run packages/math-content --reporter=verbose
```

**Closeout gate (final track gate):**
```bash
cd /home/daniel-bo/Desktop/ra-math-advantage && npm run lint
cd /home/daniel-bo/Desktop/ra-math-advantage && npx tsc --noEmit
cd /home/daniel-bo/Desktop/ra-math-advantage && npx vitest run --reporter=verbose   # PROJECT_TESTS
cd /home/daniel-bo/Desktop/ra-math-advantage && bash measure/doctor.sh
```
`PROJECT_TESTS` (full repo suite) is the final gate. Pre-existing reds in
unrelated packages (e.g., BM2 user-menu / GradebookDrillDown, tech-debt line
28; Phase 3 jsdom flakes, tech-debt line 37) must be recorded with exact
file names and counts; T17 must add **zero new** failures outside
`packages/math-content`. The acceptance role must verify via `git diff` that
T17 touched only `packages/math-content` source/tests and the `measure/`
track artifacts.

Manual verification: Task 5 is `[b] deferred:user`.

## 7. Fixtures, mocks, and live-behavior proof

**Fixtures:**
- Seeds: `0, 1, 42, 99, 2**31, -1` (boundary coverage).
- 50-seed sweeps for the backward-generation correctness falsifier (the
  single most important test in each generator).
- For `quadratic-formula`: a curated seed map ensuring all three
  discriminant regimes (rational distinct, repeated, irrational) appear.
  The test must document which seed produces which regime.
- For `system-of-equations`: a curated seed ensuring the determinant is
  non-trivially non-zero (not just `det=1`).
- Invalid fixtures: `denominator=0` for `Fraction`; `divide` by zero
  fraction; `mulberry32` with `NaN`/`Infinity` seed (must not crash or
  produce `NaN`).

**Mocks:**
- **Do not mock** `mulberry32`, `seededRandom`, `multiplyPoly`,
  `addPoly`, `formatPolynomial`, `checkEquivalence`, `validateGeneratorOutput`,
  or the registry. These are the primitives under test; mocking them turns
  behavioral tests into parity oracles (lesson 2026-06-24).
- **Spy** on `mulberry32` / `Math.random` only to assert call counts
  (single-pass) and absence of `Math.random()`. Restore in `finally`.
- For the `GeneratorOutput` contract tests, use the real
  `validateGeneratorOutput` from `@math-platform/knowledge-space-practice`.
- For the adapter tests, invoke the real adapter wrapping the real
  generator; do not stub the generator function.

**Live-behavior proof expectations:**
- Every generator test must invoke the generator with a real seed and assert
  on the returned object's fields, not just on `typeof`.
- Every backward-generation test must **substitute the answer back into the
  problem** and verify the identity holds. This is the falsifier that
  catches fabricated answers (lesson 2026-06-24: "Generator tests that
  re-derive the expected answer from the source formula encode the
  construction as the requirement and cannot fail"). The substitution must
  use an independent primitive (e.g., `multiplyPoly` for polynomial
  expansion, direct arithmetic for linear substitution), not a re-derivation
  from the generator's own internals.
- The `expression_equivalence` grading rule for `quadratic-factoring` must
  be proven by feeding both orderings of the factors to
  `checkEquivalence` and asserting true.
- The `validateGeneratorOutput` contract test must run on the actual
  `GeneratorOutput` returned by the adapter, not a hand-built fixture.

## 8. Artifact/documentation tests vs live behavior tests

**Artifact/documentation tests (permitted as complements, never as sole
proof):**
- Phase 1-4 marker guards (plan.md `[~]`/`[x]`/`[b] deferred:user`
  consistency).
- `no-measure-coupling.guard.test.ts` regression: T17 tests must not read
  `measure/tracks/...` paths (the existing guard already enforces this; T17
  must not weaken it).
- `index.ts` re-export presence (a `typeof === 'function'` check is an
  artifact test; it must be paired with a behavioral test that invokes the
  function).
- `GENERATOR_KEYS` membership (artifact) must be paired with a
  `getGenerator(key).generate({ seed: 1 })` invocation (behavioral).
- Registry-sweep coverage (artifact: the key exists) must be paired with
  the 50-seed `verifyGenerator` sweep (behavioral: the generator works).
- The Vertical Slice Value Proof unblock (Phase 4) is inherently an
  artifact/documentation check — it asserts that a dependency declared in
  another track's plan is satisfied. It is not a live behavior test; it
  must be labeled as such.

**Live behavior tests (required for every FR):**
- PRNG determinism/range/single-pass (Phase 1).
- Fraction arithmetic correctness (Phase 1).
- ExpressionBuilder formatting (no `1x`, `+ -`, etc.) (Phase 1).
- Linear/systems/quadratic backward-generation correctness (substitute
  answer, verify identity) (Phases 2-3).
- Adapter `GeneratorOutput` shape validation via `validateGeneratorOutput`
  (Phases 2-3).
- 50-seed QA sweep per generator (Phase 4).

**Falsification condition:** if any FR is covered only by an artifact test
(source grep, `typeof`, key-membership, plan-marker), Phase acceptance
fails. Lesson 2026-06-24: "Architecture-lint tests are permitted only as
*complements* to a behavioral test, never as the sole evidence."

## 9. Architecture guardrails and changed-contract risks

**Guardrails:**
- All new code lives in `packages/math-content/src/` (utilities in `utils/`,
  generators at `src/` root, adapters in
  `knowledge-space/generators/`). No app imports, no `convex/_generated/`
  imports (boundary rule).
- No dependency changes (no `npm install`, no new packages). The spec's
  `Fraction` is hand-rolled, not imported from `math.js` or `fraction.js`.
- No new activity component keys. T17 produces generator output consumed by
  the existing `step-by-step-solver` component via the existing registry.
- Prefer pure functions for `Fraction`, `MathExpressionBuilder`, and the
  raw generators. The adapter layer is the only place that assembles
  `GeneratorOutput`.
- Keep the existing `seededRandom` surface unchanged. Adding `mulberry32`
  is additive; do not refactor existing generators to use it (that's a
  separate churn track).
- If exported symbols change (`index.ts` re-exports, registry keys), refresh
  `measure/generated/` artifacts via `measure/generate.sh` or record
  explicit deferral (A10).

**Changed-contract risks to test:**
- **Stub replacement.** The existing `algebraicStepSolverGenerator` stub
  covers IM3 M1 skills 1.3-1.6 and 1.8. When T17 registers real generators
  for 1.4 (factoring) and 1.6 (formula), the stub's `nodeIds` list must
  shrink or the stub must be removed. If both the stub and the real
  generator claim the same `nodeId`, the registry will have a collision
  (last-write-wins) — a test must assert no `nodeId` is claimed by two
  generators.
- **PRNG coexistence.** `seededRandom` and `mulberry32` produce different
  sequences for the same seed. Tests must not assume `mulberry32(42)`
  equals `seededRandom(42)()`. Existing generator tests (which use
  `seededRandom`) must remain green — a regression there means T17
  accidentally changed `seededRandom`.
- **`formatPolynomial` vs `MathExpressionBuilder`.** The existing
  `formatPolynomial` takes ascending-order coefficient arrays; the new
  `MathExpressionBuilder` takes named coefficients (`coeffA, coeffB`). They
  are not interchangeable. A test must verify that `formatPolynomial([2, 3])`
  and `MathExpressionBuilder.formatLinear(3, 2)` produce consistent output
  for the same polynomial (both yield `"3x + 2"`), to prevent drift if
  someone later "consolidates" them.
- **Adapter `nodeIds` correctness.** The adapter's `nodeIds` must match
  real IM1/IM3 skill IDs (the `math.im1.skill.*` / `math.im3.skill.*`
  format). A typo'd `nodeId` silently orphans a generator. The
  registry-sweep test must verify every `nodeId` matches the
  domain-adapter ID convention.
- **`expression_equivalence` grading rule.** The spec requires
  `ruleType: 'expression_equivalence'` for quadratic factoring. If the
  adapter sets `exact_match` instead, `(x+3)(x-2)` is marked wrong when the
  stored answer is `(x-2)(x+3)`. The grading-metadata test must assert the
  rule type and the equivalence behavior.
- **`GeneratedMathProblem` vs `GeneratorOutput`.** The plan.md mentions a
  `GeneratedMathProblem` zod schema (T6 contract). The actual codebase uses
  `GeneratorOutput` from `@math-platform/knowledge-space-practice`. T17
  must conform to `GeneratorOutput` (the live contract), not a planning
  artifact. If `GeneratedMathProblem` exists somewhere, the strategy must
  flag it; the acceptance role verifies T17 doesn't introduce a second
  schema.

## 10. Intentionally-red aggregate-suite handling

- No phase introduces intentionally-red test files after Green. Red is
  temporary TDD evidence only.
- The targeted Red command (§3.1, §4.1, §5.1, §6.1) must label new phase
  failures and show the rest of math-content green. Mid Red must not hide
  pre-existing failures with `.skip`, `.todo`, broad mocks, or test filters.
- The closeout gate runs the full math-content suite. If
  `npx vitest run packages/math-content` is red at closeout, the acceptance
  role records the exact failing files/counts and the owner. No artifact may
  claim "all checks pass" for a non-zero command (A5).
- The final track closeout gate runs `PROJECT_TESTS` (full repo). Pre-existing
  reds in unrelated packages (BM2 user-menu, Phase 3 jsdom flakes) are
  documented in tech-debt; T17 must add zero new failures outside
  `packages/math-content`.
- Negative cases (e.g., `Fraction` with `denominator=0` throws) belong
  inside passing tests that assert the throw; they are not permanent red
  suites.

## 11. Anti-pattern coverage (per phase)

The defense column is the falsifiable test/guard. Every test in this
strategy has a falsification condition (the "Falsifies if" line in §§3.2-6.2).

| Anti-pattern | Phase(s) | Defense | Falsifies if |
|---|---|---|---|
| **A1** — substring-as-structured-signal | 1-4 | Marker guard requires structured `[b] ... deferred:user` for UMV tasks only; automated tasks use `[~]`/`[x]`. No free-text "deferred" is relied on to signal blockedness. | Any task is ignored because prose contains "deferred", or UMV lacks `[b] deferred:user`, or a `[b]` UMV task lacks `deferred:<owner>`. |
| **A2** — consent-blind publish gate | n/a | T17 has no publish/consent surface (no UX, no student data). Defense: N/A — recorded as not-applicable. | (Not applicable; no publish gate in scope.) |
| **A3** — digit-only as labeled count | 1-4 | Evidence uses direct Vitest assertions or labeled counts (`prng_draw_count:n`, `fraction_test_count:n`, `qa_sweep_seed_count:50`). No `/[0-9]+/` scraping of plan or output. | Any guard passes by matching arbitrary digits in dates, hashes, or output. |
| **A4** — vacuous-pass on nothing-done | 1-4 | Every generator test requires non-empty output (equation string, finite answer, ≥1 step). 50-seed sweeps require 50 distinct generations. Marker guard fails zero-completed automated tasks. | A generator test passes on empty output; a 50-seed sweep runs 0 iterations; marker check passes with zero `[x]`. |
| **A5** — false-claim text vs test reality | 1-4 | Plan/result text may only cite commands with real exit status; aggregate reds must be named as red/pre-existing with exact files. | Any artifact says "all checks pass" while the cited command exits non-zero. |
| **A6** — registry-note overstatement | 4 | `measure/tracks.md` must not claim T17 is complete until Phase 4 closeout passes; the "13/16 gap" must be reported as closed only when the blueprint-coverage test passes. | Registry/plan copy says the gap is closed before the coverage test passes. |
| **A7** — over-broad filter swallowing hits | 1-4 | Source guards exclude only exact generated/build paths; tests query exact fields/keys. The `no-measure-coupling` guard uses a quoted-string-literal regex, not bare English words. | Unsafe imports, unknown keys, or invalid output are hidden by broad text filters. |
| **A8** — `[ ]` marker ambiguity | 1-4 | Active phase blocks cannot contain bare `[ ]` once started; valid states are `[~]`, `[x]`, `[b]`. | Supervisor/test treats `[ ]` as active/complete or a phase block retains bare `[ ]` after orchestration starts. |
| **A9** — archived track path references | 1-4 | T17 tests must not read `measure/tracks/...`. The existing `no-measure-coupling.guard.test.ts` enforces this; T17 must not weaken it. Any plan-marker guard resolves the track dir from orchestrator coordinates. | App/package tests import/read `measure/tracks/...`, or guards break after archive. |
| **A10** — generated-facts drift | 1-4 | New `index.ts` exports and registry keys require `measure/generate.sh` refresh or explicit deferral. `measure/doctor.sh` Check-5 must pass at closeout. | New exported helpers/registry keys land while `measure/generated/` docs are stale and closeout ignores drift. |
| **A11** — missing live Measure contract-test suite | 1-4 | T17 does not edit the Measure supervisor/tests, but marker guards should be executable if the live `tests/measure_orchestrator_audit.sh` guard is present. Absence is an audit finding, not a product-test substitute. | Acceptance relies solely on manual anti-pattern reading with no executable guard. |
| **A12** — missing supervisor peer-review rule | 1-4 | No supervisor changes in T17. If any `automation-supervisor.py` change is proposed to support markers, it must be a separate peer-reviewed flow per `AGENTS.md`. | A T17 product commit modifies `measure/automation-supervisor.py` opportunistically. |

## 12. Handoff to Mid Red / Jr Green

**Mid Red (per phase):**
- Phase 1: mark tasks 1-4 `[~]`; mark task 5 `[b] ... deferred:user`. Add
  `prng.test.ts`, `fraction.test.ts`, `expression-builder.test.ts`. Run
  §3.1 command; capture labeled failure counts.
- Phase 2: mark tasks 1-3 `[~]`; mark task 6 `[b] ... deferred:user`. Add
  `linear-equation-solver.test.ts`, `system-of-equations-solver.test.ts`.
  Extend `generator-registry.test.ts` and `registry-sweep.test.ts`. Run §4.1.
- Phase 3: mark tasks 1-3 `[~]`; mark task 6 `[b] ... deferred:user`. Add
  `quadratic-factoring.test.ts`, `quadratic-formula.test.ts`. Run §5.1.
- Phase 4: mark tasks 1-3 `[~]`; mark task 5 `[b] ... deferred:user`. Add
  blueprint-coverage test, QA-sweep test, three-artifact agreement test. Run
  §6.1.

**Jr Green (per phase):**
- Implement the smallest module needed to pass the failing tests.
- Use `mulberry32` (not `seededRandom`) for new T17 generators; keep
  `seededRandom` unchanged for existing generators.
- Use backward generation (pick answer first, derive coefficients) for every
  equation/systems/quadratic generator. No re-roll loops.
- Register generators through `knowledge-space/generators/registry.ts` via
  new `algebra-generators-adapters.ts` (mirror
  `advanced-math-adapters.ts`).
- Re-export new public symbols from `packages/math-content/src/index.ts`.
- Run the phase Green gate; then run the closeout gate before acceptance.

## 13. Notes on the spec-vs-codebase reconciliation

The spec (`spec.md`) names paths and symbols that don't match the current
codebase. The strategy reconciles these as follows (and the `plan.md`
Architecture Decisions section is updated to match):

| Spec says | Codebase has | T17 action |
|---|---|---|
| `utils/random.ts` with `mulberry32` | `utils/prng.ts` with `seededRandom` | Add `mulberry32` to `utils/prng.ts` (additive). Do not create `random.ts`. |
| `Fraction.ts` | (none) | Create `utils/fraction.ts`. |
| `MathExpressionBuilder` | (none; `formatPolynomial` exists for polynomials) | Create `utils/expression-builder.ts` (complements `formatPolynomial`). |
| `generators/registry.ts` keyed by `variantKey` | `knowledge-space/generators/registry.ts` keyed by `key` (which IS the `variantKey`) | Register through the existing registry via new adapters. Do not create a parallel `generators/registry.ts`. |
| `GeneratedMathProblem` zod schema | `GeneratorOutput` interface in `@math-platform/knowledge-space-practice` | Conform to `GeneratorOutput` (the live contract). Validate with `validateGeneratorOutput`. |
| `Math.random()` forbidden | `Math.random()` already absent from existing generators | T17 tests spy on `Math.random` to enforce absence. |

This reconciliation is part of the strategy's falsifiability: if a future
reviewer claims T17 "followed the spec literally" by creating `random.ts`
and `generators/registry.ts`, the strategy documents why that would be wrong
(split surfaces, A10 drift) and what the codebase-consistent choice is.
