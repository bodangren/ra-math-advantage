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

- [ ] **Phase 2: Rational Functions**
  - [ ] Implement `rational-analyzer.ts`.
  - [ ] Write logic to generate holes, vertical, and horizontal asymptotes cleanly.
  - [ ] Format output for the `step-by-step-solver` fallback if no specialized UI exists.

- [ ] **Phase 3: Logarithms & Exponentials**
  - [ ] Implement `exp-log-solver.ts`.
  - [ ] Write the domain-safety `do/while` loop for generating valid log arguments.
  - [ ] Ensure formatting handles `\log` and `\ln` latex correctly.

- [ ] **Phase 4: Registration & Validation**
  - [ ] Export generators to `registry.ts`.
  - [ ] Map keys in IM3 Module 2-7 blueprints.
  - [ ] Test edge cases (like polynomial missing middle terms, e.g., $x^3 - 1$) in the QA harness.