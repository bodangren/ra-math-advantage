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

- [ ] **Phase 4: Registration & Validation**
  - [ ] Export generators to `registry.ts`.
  - [ ] Map keys in IM3 Module 2-7 blueprints.
  - [ ] Test edge cases (like polynomial missing middle terms, e.g., $x^3 - 1$) in the QA harness.