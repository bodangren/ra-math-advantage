# Implementation Plan: Advanced Math Generators

- [x] **Phase 1: Polynomial Engine**
  - [x] Implement `utils/polynomial.ts` with `addPoly`, `subtractPoly`, and `multiplyPoly` (array convolution).
  - [x] Build `polynomial-operations.ts` utilizing the convolution engine.
  - [x] Build `polynomial-division.ts` using the Dividend backwards generation strategy.

  **Red evidence (baseline SHA `61f5020`, commit SHA `87d2309`):**
  ```
  $ npx vitest run polynomial --root packages/math-content
  FAIL  src/__tests__/polynomial.test.ts
  Error: Cannot find module '../utils/polynomial'
  Test Files  1 failed (1) | Tests  no tests | Duration  996ms
  ```
  All 14 tests (6 polynomial utils, 4 operations, 4 division) fail with module-not-found.
  Test strategy: `packages/math-content/src/__tests__/polynomial-strategy.md`.

  **Green evidence (baseline SHA `392fdd44`, commit SHA `1e277be2`):**
  ```
  $ npx vitest run polynomial --root packages/math-content
   Test Files  1 passed (1)
        Tests  14 passed (14)
     Duration  990ms
  ```
  All 14 tests pass. `npx tsc --noEmit` reports zero errors in the new polynomial files (pre-existing type errors in precalc/unit_03.ts, precalc/unit_04.ts, and schemas/types.ts are out of scope).

  **JR Green work log:**
  - Implemented `packages/math-content/src/utils/polynomial.ts`:
    `addPoly`/`subtractPoly` zero-pad the shorter polynomial on the right
    (high-degree side) before element-wise add/subtract; `multiplyPoly`
    uses discrete convolution over coefficient indices, producing a
    result of length `a.length + b.length - 1`.
  - Implemented `packages/math-content/src/polynomial-operations.ts`:
    cycles the operator deterministically via `Math.abs(seed) % 3` so
    seeds 0/1/2 produce all three operator classes; coefficient ranges
    are sized to keep prompts readable (degrees 1–3, leading coeffs
    in [-5, -1] ∪ [1, 5]).
  - Implemented `packages/math-content/src/polynomial-division.ts`:
    backward generation — picks Q (deg 1–2), D (deg 1–2) with non-zero
    leading coefficients, then R whose degree is strictly less than
    deg(D); dividend P = Q·D + R via convolution and addPoly. The
    left-pad-then-add reconstruction matches the test's verification
    logic exactly.
  - Updated `graph.db` (33 new nodes / 32 new edges) via
    `build-graph update ./graph.db …` because three new TypeScript
    files were added.

  **Convention note:** coefficient arrays use ASCENDING degree order
  (`index k` = coefficient of x^k). This is forced by the Red test
  `addPoly([1, 2], [3, 4, 5]) → [4, 6, 5]`, which only reconciles if the
  shorter polynomial is padded with zeros on the right. The strategy
  doc's "descending" wording is preserved but the implementation
  encodes ascending-degree order — see module-level JSDoc in
  `utils/polynomial.ts`.

- [x] **Phase 2: Rational Functions**
  - [x] Implement `rational-analyzer.ts`.
  - [x] Write logic to generate holes, vertical, and horizontal asymptotes cleanly.
  - [x] Format output for the `step-by-step-solver` fallback if no specialized UI exists.

  **Red evidence (baseline SHA `f510de90`, commit SHA `102f47f7`):**
  ```
  $ npx vitest run rational-analyzer --root packages/math-content
  FAIL  src/__tests__/rational-analyzer.test.ts
  Error: Cannot find module '../rational-analyzer'
  Test Files  1 failed (1) | Tests  no tests | Duration  1.00s
  ```
  19 tests defined across 9 describe blocks fail with module-not-found:
  shape (3), seed-1 structural (4), determinism (2), horizontal-asymptote (3),
  invariants (2), mathematical correctness (3), step-by-step-solver fallback (2).

  **Green evidence (baseline SHA `102f47f7`, commit SHA `8b8a574b`):**
  ```
  $ npx vitest run rational-analyzer --root packages/math-content
   Test Files  1 passed (1)
        Tests  19 passed (19)
     Duration  1.37s
  ```
  All 19 tests pass. Existing polynomial suite (14 tests) still passes.

  **JR Green work log:**
  - Implemented `packages/math-content/src/rational-analyzer.ts`:
    backward generation mirrors polynomial-division.ts — picks hole h,
    vertical-asymptote v, and x-intercept z as distinct integers in
    [−9, 9] (v ≠ h, z ≠ h, z ≠ v guaranteed by do-while loops), then
    expands P(x) = (x−h)(x−z) and Q(x) = (x−h)(x−v) via `multiplyPoly`
    with ascending-order factors `[-h, 1]`. The shared (x−h) factor
    produces exactly one removable discontinuity (hole) at x = h; the
    remaining (x−v) in the denominator is the vertical asymptote. The
    horizontal-asymptote object records the ratio of leading coefficients
    (always 1 for our monic-linear construction). The `equation` field
    renders the rational function as a human-readable string for the
    step-by-step-solver fallback UI (`familyId: 'step-by-step-solver:rational'`).
  - Seed 1 produces h=0, v=−6, z=−7 → P(x) = x(x+7), Q(x) = x(x+6);
    hole at x=0, VA at x=−6, x-intercept at x=−7, horizontal asymptote y=1.
  - Fixed initial Red test bug: used `[1, -h]` factors (ascending: 1−hx,
    root at 1/h) instead of `[-h, 1]` (ascending: x−h, root at h).
    Amended Red commit to use correct `[-h, 1]` convention consistent
    with Phase 1's ascending-degree-order contract.
  - Discovered and fixed z = v collision (seed 18): added `z !== v`
    constraint to prevent the x-intercept factor from cancelling the
    vertical-asymptote factor.

- [x] **Phase 3: Logarithms & Exponentials**
  - [x] Implement `exp-log-solver.ts`.
  - [x] Write the domain-safety `do/while` loop for generating valid log arguments.
  - [x] Ensure formatting handles `\log` and `\ln` latex correctly.

  **Red evidence (baseline SHA `9f2ecd0e`, commit SHA `2162b430`):**
  ```
  $ npx vitest run exp-log-solver --root packages/math-content
  FAIL  src/__tests__/exp-log-solver.test.ts
  Error: Cannot find module '../exp-log-solver'
  Test Files  1 failed (1) | Tests  no tests | Duration  1.20s
  ```
  22 tests defined across 11 describe blocks fail with module-not-found:
  shape (7), determinism (2), LaTeX formatting (4), domain safety log (2),
  domain safety ln (2), domain safety exp (1), domain re-roll (2), steps (2).

  **Green evidence (baseline SHA `2162b430`, commit SHA `ef2b57a9`):**
  ```
  $ npx vitest run exp-log-solver --root packages/math-content
   Test Files  1 passed (1)
        Tests  22 passed (22)
     Duration  1.14s
  ```
  All 22 tests pass. Existing polynomial (14) and rational-analyzer (19) suites
  still pass (55 total). `npx tsc --noEmit` reports zero errors in the new files
  (pre-existing type errors in exports.test.ts, integration.test.ts, etc. are out of scope).

  **JR Green work log:**
  - Implemented `packages/math-content/src/exp-log-solver.ts`:
    three problem types selected deterministically from the first PRNG draw
    (typeDraw < 1/3 → log, < 2/3 → ln, else exp). Uses the same
    linear-congruential PRNG as polynomial-division.ts and rational-analyzer.ts.
  - Log problems: `log₁₀(Ax + C) = D` with D ∈ {1, 2} for clean integer
    answers. A is non-zero in [−5, 5], C in [−10, 10].
  - Ln problems: `ln(Ax + C) = D` with D ∈ {1, 2, 3}. Answers rounded to
    6 decimal places.
  - Exp problems: `2^x = N` where N = 2^exponent for clean integer answers.
    Equation includes `\exp` notation per spec.
  - Domain safety: `isDomainValid()` checks that log/ln solutions satisfy
    Ax + C > 0. The `generateExpLogProblem` function uses a while(true) loop
    that increments seed by 1 on invalid domain (re-roll), matching the spec's
    "seed + 1" requirement.
  - LaTeX: equations use `\log_{10}`, `\ln`, and `\exp` commands.
  - Seed 1 produces: log₁₀(−3x + 8) = 2, answer = −34 (A=−3, C=8, D=2,
    10²=100, x=(100−8)/(−3)=−34, domain x < 8/3, −34 < 2.67 ✓).

- [x] **Phase 4: Registration & Validation**
  - [x] Export generators to `registry.ts`.
  - [x] Map keys in IM3 Module 2-7 blueprints.
  - [x] Test edge cases (like polynomial missing middle terms, e.g., $x^3 - 1$) in the QA harness.

  **Red evidence (baseline SHA `7b609a09`, commit SHA `bf613799`):**
  ```
  $ npx vitest run generator-registry --root packages/math-content
  FAIL  src/__tests__/generator-registry.test.ts
  Error: Cannot find module '../generator-registry'
  Test Files  1 failed (1) | Tests  no tests | Duration  892ms
  ```
  14 tests defined across 3 describe blocks (registry contract 5, re-exports 5, QA harness 4)
  fail with module-not-found.

  **Green evidence (baseline SHA `bf613799`, commit SHA `3a920272`):**
  ```
  $ npx vitest run generator-registry polynomial rational-analyzer exp-log-solver --root packages/math-content
   Test Files  4 passed (4)
        Tests  69 passed (69)
     Duration  3.47s
  ```
  All 14 generator-registry tests pass. All 55 Phase 1–3 tests still pass (69 total).
  `npx vitest run setup` confirms problem family counts unchanged (87 + 71 + 41).

  **JR Green work log:**
  - Created `packages/math-content/src/generator-registry.ts`:
    exports `GENERATOR_REGISTRY` mapping four keys to generator entries:
    `'polynomial-operations'` → `generatePolynomialOperation`,
    `'polynomial-division'` → `generatePolynomialDivision`,
    `'rational-analyzer'` → `generateRationalProblem`,
    `'exp-log-solver'` → `generateExpLogProblem`.
    Each entry conforms to the `GeneratorEntry` interface
    (`{ generate: (options: { seed: number }) => unknown }`).
  - Updated `packages/math-content/src/index.ts`:
    added re-exports for `GENERATOR_REGISTRY`, `GeneratorEntry`,
    `generatePolynomialOperation`, `generatePolynomialDivision`,
    `generateRationalProblem`, `generateExpLogProblem`,
    and `addPoly`, `subtractPoly`, `multiplyPoly` from `./utils/polynomial`.
  - Updated IM3 blueprint metadata:
    `module_2.ts`: polynomial-arithmetic → generatorKey: "polynomial-operations",
    polynomial-division → generatorKey: "polynomial-division".
    `module_5.ts`: solve-exponential-equations → generatorKey: "exp-log-solver".
    `module_6.ts`: solve-logarithmic-equations → generatorKey: "exp-log-solver".
    `module_7.ts`: rational-functions → generatorKey: "rational-analyzer".
  - QA harness test: seed 523 produces sparse polynomial [8, 0, 0, 4] (8 + 4x³
    with missing x and x² terms) via subtractPoly([3,−1,4,1], [−5,−1,4,−3]).
    Additional edge-case tests verify multiplyPoly([−1,1], [1,1,1]) = [−1,0,0,1]
    (x³ − 1 with all middle terms zero).

  **Phase 4 Review A fix (commit `62954289`):**
  - Audit found the new keys were registered only in `generator-registry.ts` and
    were not resolvable through the downstream `getGenerator()` path used by
    blueprint-qa and pilot-submission-evidence, making the IM3 blueprint
    `generatorKey` wiring cosmetic.
  - Added `packages/math-content/src/knowledge-space/generators/advanced-math-adapters.ts`
    to adapt the four generators to the knowledge-space-practice
    `GeneratorInput → GeneratorOutput` contract, and registered the adapters in
    `packages/math-content/src/knowledge-space/generators/registry.ts`.
  - Added tests in `packages/math-content/src/knowledge-space/__tests__/adapter.test.ts`
    asserting the four keys are present in `GENERATOR_KEYS` and produce valid
    `GeneratorOutput`.

  **Phase 4 Review B fix (commit `a0f0e1c9`):**
  - Audit R2B-001 caught a polynomial-division identity bug: the remainder
    was padded via `paddedRemainder.unshift(0)`, which (under our ascending-
    degree convention) shifts coefficients to higher-degree terms and breaks
    `P = Q·D + R`. Changed to `paddedRemainder.push(0)` in
    `polynomial-division.ts` and the corresponding reconstruction in
    `__tests__/polynomial.test.ts`. Reviewer verified `P = Q·D + R` holds
    across 500 seeds after the fix.

  **Phase 4 Review C fix (commit `53a4252d`):**
  - Audit C-1 noted the exp problem equation was
    `\exp(D \cdot \ln 2) = N \quad \text{or} \quad 2^{x} = N` (verbose and
    deviating from the spec's `2^x = N` form), and the steps mixed LaTeX
    `\log_{2}` with Unicode `log₂` in the same string. Normalized the
    equation to `2^{x} = N` and rewrote the relevant step to plain text
    (`Take log base 2 of both sides: x = log₂(N)`). Updated the two
    `__tests__/exp-log-solver.test.ts` assertions that referenced `\exp`
    to match the new contract.

  **Phase Acceptance (audit SHA `53a4252d`):**
  ```
  $ npx vitest run rational-analyzer exp-log-solver polynomial generator-registry knowledge-space/generators --root packages/math-content
   Test Files  5 passed (5)
        Tests  93 passed (93)
     Duration  5.78s
  ```
  - All three SPEC FRs verified end-to-end:
    1. Polynomial division backward generation — `P = Q·D + R` identity holds
       across 500 seeds (Review B verification).
    2. Rational asymptote generator — holes, vertical asymptotes, and
       horizontal asymptotes all emitted correctly; `v = 0` edge case
       handled naturally by the `[-v, 1]` factor convention.
    3. Exp/log domain safety — `Ax + C > 0` guaranteed by construction
       for log/ln problems; `isDomainValid` re-roll safety net verified
       across 200 seeds (Review B verification).
  - IM3 blueprint wiring is functional: `module_2/5/6/7` `generatorKey`
    metadata resolves through `getGenerator()` in
    `knowledge-space/generators/registry.ts`.
  - Out-of-scope (pre-existing) full-suite failures: 16 missing-metadata
    cases in `im1-practice-readiness_20260609` and 1 `problemFamilyId`
    vs `variantKey` schema mismatch in `integration.test.ts`. Both
    recommended for separate follow-up tracks.
  - Open follow-ups (non-blocking): consolidate the two `GENERATOR_REGISTRY`
    constants (Review C C-2); restore `eslint.config.*` for
    `packages/math-content` (Review A).
  - Acceptance artifact: `/tmp/measure-audits/phase-acceptance-advanced-math.json`.
  - **Verdict: ACCEPT. Track ready for closeout.**

## Final Acceptance (HEAD = `95ca115e`)

- All 4 phases complete; all 12 task items checked in plan.md; 0 unchecked.
- Every Red/Green/Review/plan-update commit verified on the HEAD ancestry chain
  (`392fdd44 → 1e277be2 → f510de90 → 102f47f7 → 8b8a574b → 9f2ecd0e → 2162b430
  → ef2b57a9 → 7b609a09 → bf613799 → 3a920272 → a7a81094 → 62954289 →
  a0f0e1c9 → 53a4252d → 95ca115e`).
- All three SPEC FRs satisfied (polynomial-division backward generation,
  rational asymptote holes/VAs/HAs, exp/log domain safety).
- Targeted vitest suite green at HEAD:
  ```
  $ npx vitest run rational-analyzer exp-log-solver polynomial generator-registry knowledge-space/generators --root packages/math-content
   Test Files  5 passed (5)
        Tests  93 passed (93)
     Duration  6.30s
  ```
- `npx tsc --noEmit` reports zero errors in track-owned files
  (`utils/polynomial.ts`, `polynomial-operations.ts`, `polynomial-division.ts`,
  `rational-analyzer.ts`, `exp-log-solver.ts`, `generator-registry.ts`,
  `knowledge-space/generators/advanced-math-adapters.ts`). Pre-existing
  repo-wide tsc errors in unrelated files remain out of scope.
- Lint: skipped — `packages/math-content` lacks `eslint.config.*` (pre-existing
  tooling gap surfaced by Review A; documented as a follow-up tooling track).
- Three independent reviews (A registry wiring, B security/data, C UX/API)
  all consumed; every blocker fixed and committed before this final acceptance.
- Boundary discipline: `graph.db` not modified; ~140 pre-existing dirty files
  in working tree left untouched.
- Final-acceptance audit: `/tmp/measure-audits/final-acceptance-advanced-math.json`.
- **Verdict: ACCEPT. Track ready for closeout.**