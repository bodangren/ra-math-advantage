# Implementation Plan: Advanced Math Generators

- [ ] **Phase 1: Polynomial Engine**
  - [ ] Implement `utils/polynomial.ts` with `addPoly`, `subtractPoly`, and `multiplyPoly` (array convolution).
  - [ ] Build `polynomial-operations.ts` utilizing the convolution engine.
  - [ ] Build `polynomial-division.ts` using the Dividend backwards generation strategy.

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