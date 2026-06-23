# Implementation Plan: Advanced Math Generators

- [~] **Phase 1: Polynomial Engine**
  - [~] Implement `utils/polynomial.ts` with `addPoly`, `subtractPoly`, and `multiplyPoly` (array convolution).
  - [~] Build `polynomial-operations.ts` utilizing the convolution engine.
  - [~] Build `polynomial-division.ts` using the Dividend backwards generation strategy.

  **Red evidence (baseline SHA `61f5020`, commit SHA `87d2309`):**
  ```
  $ npx vitest run polynomial --root packages/math-content
  FAIL  src/__tests__/polynomial.test.ts
  Error: Cannot find module '../utils/polynomial'
  Test Files  1 failed (1) | Tests  no tests | Duration  996ms
  ```
  All 14 tests (6 polynomial utils, 4 operations, 4 division) fail with module-not-found.
  Test strategy: `packages/math-content/src/__tests__/polynomial-strategy.md`.

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